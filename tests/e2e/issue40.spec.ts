import { expect, test } from '@playwright/test';

for (const colorScheme of ['light', 'dark'] as const) {
  for (const width of [320, 375, 768, 1440]) {
    test.describe(`Issue #40 ${colorScheme} ${width}`, () => {
      test.use({ colorScheme, viewport: { width, height: 740 } });
      test('NFR-003 FR-002 FR-003: header CTA stays on one line', async ({
        page,
      }) => {
        await page.goto('/');
        const cta = page
          .getByRole('banner')
          .getByRole('link', { name: '問い合わせ', exact: true });
        await expect(cta).toHaveCSS('white-space', 'nowrap');
        const box = await cta.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeLessThan(60);
        await expect(cta).not.toHaveCSS(
          'background-color',
          'rgb(88, 184, 255)',
        );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      });
    });
  }
}

test.describe('Issue #40 mobile', () => {
  test.use({ viewport: { width: 375, height: 740 } });
  test('NFR-002: keyboard selection focuses Contact below the header; Escape returns to trigger', async ({
    page,
  }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'ナビゲーションメニュー' });
    await button.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    const heading = page.getByRole('heading', { name: 'Contact', exact: true });
    await expect(heading).toBeFocused();
    await expect
      .poll(async () => (await heading.boundingBox())?.y ?? 0)
      .toBeGreaterThanOrEqual(64);
  });
  test('NFR-002: outside pointer and scroll dismiss the menu', async ({
    page,
  }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'ナビゲーションメニュー' });
    await button.click();
    await page.locator('h1').click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();
    await page.mouse.wheel(0, 100);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });
  test('FR-002 FR-009 UX-002: reduced motion shows the whole fox without entrance or greeting', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const fox = page.locator('.fox-character');
    await expect(fox).toBeInViewport({ ratio: 1 });
    await expect(fox).toHaveCSS('width', '160px');
    await expect(fox).toHaveCSS('animation-name', 'none');
    await expect(fox.locator('.paw')).toHaveCSS('animation-name', 'none');
    await fox.click();
    await expect(fox).toHaveAttribute('data-reaction', 'jump');
  });
  test('FR-008: wave runs after the entrance greeting has finished', async ({
    page,
  }) => {
    await page.goto('/');
    const fox = page.locator('.fox-character');
    await expect(fox).toHaveAttribute('data-ready', 'true');
    const paw = fox.locator('.paw');
    await expect
      .poll(() => paw.evaluate((element) => element.getAnimations().length))
      .toBe(0);
    for (let i = 0; i < 3; i++) {
      await fox.evaluate((element) => {
        if (element instanceof HTMLButtonElement) element.click();
      });
      await expect(fox).toHaveAttribute('data-reaction', 'idle');
    }
    await fox.click();
    await expect(fox).toHaveAttribute('data-reaction', 'wave');
    await expect
      .poll(() =>
        paw.evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) =>
                animation instanceof CSSAnimation &&
                animation.animationName === 'fox-wave' &&
                animation.playState === 'running',
            ),
        ),
      )
      .toBe(true);
  });
});

test.describe('Issue #40 without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 375, height: 740 } });
  test('FR-002 UX-002: CSS entrance finishes without JavaScript', async ({
    page,
  }) => {
    await page.goto('/');
    const fox = page.locator('.fox-character');
    await expect(fox).toHaveCSS('opacity', '1');
    await expect(fox).toHaveCSS('transform', 'none');
    await expect(fox).toBeInViewport({ ratio: 1 });
  });
});
