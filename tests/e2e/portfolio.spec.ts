import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';

const sections = [
  'Services',
  'About',
  'Skills',
  'Projects',
  'Work Process',
  'Contact',
];

// Inspect the rendered ancestor chain: opacity on a parent also hides its text.
async function appearance(locator: Locator) {
  return locator.evaluate((element) => {
    let opacity = 1;
    const transforms: string[] = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      opacity *= Number(style.opacity);
      transforms.push(style.transform);
    }
    return { opacity, transforms };
  });
}

for (const width of [320, 375, 768, 1440]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test('NFR-003: no horizontal overflow', async ({ page }) => {
      await page.goto('/');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });
  });
}

test.describe('phone', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  test('FR-001 FR-002: name and hero CTAs fit the initial viewport', async ({
    page,
  }) => {
    await page.goto('/');
    for (const element of [
      page.getByRole('heading', { level: 1 }),
      page
        .getByRole('main')
        .getByRole('link', { name: '制作実績を見る', exact: true }),
      page
        .getByRole('main')
        .getByRole('link', { name: '問い合わせ', exact: true }),
    ]) {
      await expect(element).toBeInViewport({ ratio: 1 });
    }
  });

  test('FR-008: offscreen Contact reveals while hero stays visible (REV-20261024-004 F-002)', async ({
    page,
  }) => {
    await page.goto('/');
    const main = page.getByRole('main');
    // Hydration readiness only; all content selection uses accessible roles/names.
    await main.evaluate(
      (element) =>
        new Promise<void>((resolve) => {
          const check = () =>
            Object.keys(element).some((key) => key.startsWith('__react'))
              ? resolve()
              : requestAnimationFrame(check);
          check();
        }),
    );
    const hero = page.getByRole('heading', { level: 1 });
    const contact = page.getByRole('heading', { name: 'Contact', exact: true });
    expect((await appearance(hero)).opacity).toBe(1);
    await expect
      .poll(async () => (await appearance(contact)).opacity)
      .toBeLessThan(1);
    await contact.scrollIntoViewIfNeeded();
    await expect
      .poll(async () => (await appearance(contact)).opacity, { timeout: 2000 })
      .toBe(1);
    expect((await appearance(hero)).opacity).toBe(1);
  });
});

for (const width of [375, 1440]) {
  test.describe(`navigation and axe ${width}`, () => {
    test.use({ viewport: { width, height: 900 } });
    test('FR-011: navigation reaches every section', async ({ page }) => {
      // FR-011 / NFR-002, docs/ui-design.md §7: Chromium exposes the menu
      // summary as generic, not the required named button. Header.tsx:30-35.
      // Keep the user-facing button contract pending Development Team repair.
      test.fixme(
        width === 375,
        'FR-011 / NFR-002: mobile menu lacks the named button role (src/components/sections/Header.tsx:30)',
      );
      await page.goto('/');
      for (const heading of sections) {
        if (
          width === 375 &&
          !(await page
            .getByRole('navigation', { name: 'モバイルナビゲーション' })
            .isVisible())
        )
          await page
            .getByRole('button', { name: 'ナビゲーションメニュー' })
            .click();
        const name = heading === 'Work Process' ? 'Process' : heading;
        const nav = page.getByRole('banner');
        await nav.getByRole('link', { name, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`));
        await expect(
          page.getByRole('heading', { name: heading, exact: true }),
        ).toBeInViewport();
      }
    });
    test('NFR-001: axe has no serious or critical findings', async ({
      page,
    }, testInfo) => {
      await page.goto('/');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      await testInfo.attach('axe-results', {
        body: JSON.stringify(results, null, 2),
        contentType: 'application/json',
      });
      expect(
        results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        ),
      ).toEqual([]);
    });
  });
}

test('NFR-002: skip link, main focus and keyboard hero CTAs have outlines', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: '本文へスキップ' });
  await expect(skip).toBeFocused();
  await expect(skip).not.toHaveCSS('outline-style', 'none');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  for (const name of ['制作実績を見る', '問い合わせ']) {
    await page.keyboard.press('Tab');
    const cta = page.getByRole('main').getByRole('link', { name, exact: true });
    await expect(cta).toBeFocused();
    await expect(cta).not.toHaveCSS('outline-style', 'none');
  }
});

test('FR-009: reduced motion keeps all headings and card text opaque and untransformed', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // Text leaves cover card copy, tags and process steps without assuming card markup.
  const content = page
    .getByRole('main')
    .getByText(/\S/)
    .or(page.getByRole('heading'));
  expect(await content.count()).toBeGreaterThan(0);
  for (const element of await content.all()) {
    await element.scrollIntoViewIfNeeded();
    const state = await appearance(element);
    expect(state.opacity).toBe(1);
    expect(
      state.transforms.every(
        (t) =>
          t === 'none' ||
          t === 'matrix(1, 0, 0, 1, 0, 0)' ||
          t === 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
      ),
    ).toBe(true);
  }
});

test('FR-010 FR-011: section content remains visible without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/');
    expect(
      await page.getByRole('heading', { level: 2 }).count(),
    ).toBeGreaterThan(0);
    for (const name of sections) {
      const heading = page.getByRole('heading', {
        name,
        level: 2,
        exact: true,
      });
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
      expect((await appearance(heading)).opacity).toBe(1);
    }
    for (const heading of await page.getByRole('heading', { level: 2 }).all()) {
      await expect(heading).toBeVisible();
      expect((await appearance(heading)).opacity).toBe(1);
    }
  } finally {
    await context.close();
  }
});

test('FR-003 FR-006: placeholder contact cannot produce contact links', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByText('連絡先は準備中です', { exact: true }),
  ).toBeVisible();
  const hrefs = await page
    .getByRole('link')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') ?? ''),
    );
  expect(
    hrefs.filter(
      (href) =>
        href.startsWith('mailto:') ||
        new URL(href, 'http://localhost').pathname === '/contact.vcf',
    ),
  ).toEqual([]);
});

for (const path of ['/', '/nope']) {
  test(`SEC-002: CSP is enforced without browser refusals on ${path}`, async ({
    page,
  }) => {
    const messages: string[] = [];
    page.on('console', (message) => {
      if (/Content Security Policy|Refused to/i.test(message.text()))
        messages.push(message.text());
    });
    const response = await page.goto(path);
    expect(response?.headers()['content-security-policy']).toBeTruthy();
    await page.waitForLoadState('networkidle');
    expect(messages).toEqual([]);
  });
}

test('QA-001: no console errors on load', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('FR-010: unknown URL returns the accessible 404 page', async ({
  page,
}) => {
  const response = await page.goto('/nope');
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { name: 'ページが見つかりません' }),
  ).toBeVisible();
});
