# Testing strategy — Issues #15 and #10

Testing Team derives browser assertions from `docs/requirements.md` and
`docs/ui-design.md` §7 independently of Development Team unit tests.
Claude Code remains the formal reviewer; local checks do not constitute approval.

| Layer | What it proves | What it does not prove | Spec IDs | Local command |
| --- | --- | --- | --- | --- |
| Vitest unit | Content rules, vCard escaping, generated CSP hashes | Browser rendering, real contact delivery, production headers | FR-005, FR-006, SEC-002 | `npm test` |
| RTL component | Semantic headings, CTA destinations, placeholder and motion component behavior | Actual layout, browser focus, scroll animation | FR-002, FR-003, FR-004, FR-008, FR-009, FR-011 | `npm test` |
| Playwright E2E | Chromium widths, initial viewport, keyboard, navigation, reduced motion, no-JS headings, placeholders, reveal, 404, CSP and console regressions | Other browsers, real phones, HTTPS/QR deployment, every possible interaction | FR-001, FR-002, FR-003, FR-006, FR-008, FR-009, FR-010, FR-011, NFR-002, NFR-003, SEC-002 | `npm run build`, `npx playwright install chromium`, `npm run test:e2e` |
| axe | No serious/critical automatically detected findings at 375 and 1440px; full JSON attached | WCAG compliance, screen reader usability, all accessibility issues | NFR-001 | `npm run test:e2e` |
| Lighthouse | Three mobile-emulated lab runs; category and CLS/LCP assertions | Field CWV, INP under real traffic, production latency or headers | NFR-001, NFR-004, FR-007 | `npm run build`, `npm run lhci` |
| audit | Registry advisories for installed dependency graph | Absence of unknown vulnerabilities or exploitability assessment | SEC-005 | `npm audit --audit-level=high`; `npm audit --omit=dev --audit-level=high` |
| gitleaks | Known secret patterns in fetched Git history | All secrets, untracked files, complete client bundle inspection | NFR-007, SEC-004 | Verified gitleaks v8.30.1: `gitleaks git --redact --no-banner -v .` |

Use Node.js 22 and `npm ci`. Build before every browser/lab run: tests serve
`out/`, never the development server. The tiny Node HTTP server binds only
127.0.0.1:4173, reads Cloudflare `out/_headers` (global `/*` and exact paths),
serves MIME types and extensionless HTML, and returns `404.html` with status 404.
It fails startup if headers are missing. CSP checks on `/` and `/nope` are
mandatory. Local Playwright reuses an existing server; ensure port 4173 serves
the current export. CI starts a fresh server.

Linux CI installs Chromium OS dependencies via `npm run test:e2e:install`.
Windows uses `npx playwright install chromium` without `--with-deps`.
If the default npm/browser caches are inaccessible, use `npm_config_cache` and
`PLAYWRIGHT_BROWSERS_PATH` under the OS temporary directory, outside the repo.
For Lighthouse, set `CHROME_PATH` to an installed Chrome/Chromium executable if
autodetection fails. Lighthouse keeps default mobile emulation and throttling;
there is no desktop preset. Its static server is separate from the CSP E2E
server; Lighthouse does not validate deployed Cloudflare headers.

`quality`, `e2e`, `lighthouse`, and `security` are the intended required checks.
Repository branch protection must be verified separately by an authorized
maintainer. Quality runs annotation-script tests, scaffold checks, format, lint,
types, Vitest with GitHub annotations, build, and production dependency audit.
CI stores Playwright reports/traces and Lighthouse JSON/HTML for seven days.
Lighthouse accessibility ≥0.95, best practices ≥0.90 and CLS ≤0.1 are errors;
SEO/performance ≥0.90 and LCP ≤2500ms are warnings.

The pinned Lighthouse tooling introduces development-only high advisories.
Production high/critical audit failures block CI; full audit runs visibly with
a warning and `continue-on-error`. This exception does not resolve advisories
and requires Security Team review. No gitleaks allowlist is added.

Product failures must be reported with spec ID, source file:line, expected and
actual behavior. A confirmed product regression is represented by `test.fixme`
with a spec-linked explanation, not by weakening its expected behavior.
Manual keyboard/screen reader, real-device performance, production TLS/headers,
and GitHub Actions execution remain separate verification responsibilities.

## Local verification — 2026-10-24 JST

Environment: Windows, Node 22.14.0, npm 10.9.2, Playwright 1.64.1 Chromium
156.0.8078.4. npm and browser caches were placed under the OS temporary
directory, outside the repository. No source files, commits, pushes or deploys.

| Command | Exit | Result |
| --- | --- | --- |
| `npm run format:check` | 0 | All matched files formatted |
| `npm run lint` | 0 | No warnings/errors |
| `npm run typecheck` | 0 | TypeScript passed |
| `npm test` | 0 | 6 files; 37 passed, 1 existing skipped |
| `node --test scripts/*.test.mjs` | 0 | 5 passed |
| `npm run build` | 0 | Static export and global CSP generated for 3 HTML files |
| `npx playwright install chromium` | 0 | Chromium installed without OS dependency installation |
| `npm run test:e2e` | 0 | 17 passed, 0 failed, 1 fixme (reported as skipped); no other skips |
| `npm run lhci` | 1 | Chrome DevTools connection failed before any category scores or assertions |
| `npm audit --audit-level=high` | 1 | 14 advisories: 11 high, 1 moderate, 2 low, development dependencies |
| `npm audit --omit=dev --audit-level=high` | 0 | 0 vulnerabilities |
| `js-yaml` parse of workflow | 0 | All four expected jobs parsed, matching names and timeouts |
| `git diff --check` | 0 | No whitespace errors |

Initial E2E run: 17 tests passed; mobile navigation failed with
`Test timeout of 30000ms exceeded` and
`locator.click: Test timeout of 30000ms exceeded`, waiting for
`getByRole('button', { name: 'ナビゲーションメニュー' })`.
The runner stalled during failure cleanup and was interrupted (exit 1).
The confirmed contract failure is now `test.fixme`; expectations were preserved.
Final E2E runs returned exit 0. axe serious/critical findings: 0 at both widths;
full JSON is attached to the Playwright test results.
On this restricted Windows host, runs that owned the server could stall during
process cleanup even after all test bodies finished; verification with the same
export server reused completed normally. Linux CI server cleanup is unverified.

Product finding: **FR-011 / NFR-002**, `src/components/sections/Header.tsx:30–35`.
Expected: the mobile navigation menu is exposed as a button named
「ナビゲーションメニュー」, allowing the specified user-facing query and navigation.
Actual: Chromium's Playwright accessibility snapshot exposes the named summary
as `generic`; the required button query never resolves. This records the
observed browser/test contract discrepancy; assistive-technology behavior has
not been manually verified. Development Team investigation is required.

Lighthouse was attempted twice, including a final run targeting only `/` with
default mobile settings and three requested runs. Chrome was found and launched,
but collection failed in the first run:
`Failed to fetch browser webSocket URL from http://127.0.0.1:<port>/json/version: fetch failed`.
Chrome cleanup also reported `taskkill stderr ERROR: Access denied`.
Performance/accessibility/best-practices/SEO scores, LCP, CLS, and all assertion
results are **unavailable**, not passes. Rerun in Linux CI.

`actionlint` is unavailable. YAML syntax was validated with the installed
`js-yaml` parser, but Actions semantics, SHA availability, Linux gitleaks execution,
artifact upload, branch protection and Claude Code formal review remain unverified.
The requested branch `test/15-ci-e2e` was retained; no Draft PR was created because
this task explicitly prohibits commit/push.
