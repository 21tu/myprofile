#!/usr/bin/env bash
set -euo pipefail
repo="${1:-21tu/myprofile}"
command -v gh >/dev/null || { echo 'Install GitHub CLI (gh)'; exit 1; }
gh auth status >/dev/null
while IFS='|' read -r title spec team detail; do
  [ -n "$title" ] || continue
  exists="$(gh issue list -R "$repo" --state all --search "in:title $title" --json title --jq '.[].title' | grep -Fx "$title" || true)"
  if [ -n "$exists" ]; then echo "SKIP existing: $title"; continue; fi
  gh issue create -R "$repo" --title "$title" --body "$(printf '## Team\n%s\n\n## Spec IDs\n%s\n\n## Scope\n%s\n\n## Acceptance criteria\n- Implementation and tests linked to spec\n- GitHub Actions checks reviewed\n- Claude Code review recorded\n- No production deployment without approval\n' "$team" "$spec" "$detail")"
done <<'TASKS'
[Platform] Next.js + Cloudflare scaffold|FR-010,NFR-005,NFR-006,QA-001|Platform / Codex|Static export, Workers assets, TypeScript strict, CI scripts.
[UI] Responsive sales portfolio|FR-001,FR-002,FR-003,FR-004,FR-005,FR-006,FR-007,FR-011,NFR-003,UX-001,UX-002|UI/UX / Codex|Mobile Hero, Services, About, Skills, Projects, Process, Contact, Footer. Mascot asset consistency.
[Motion] Accessible animation|FR-008,FR-009,NFR-001,NFR-004|Motion / Codex|Kinetic typography, Bento, microinteractions and reduced motion.
[Security] Cloudflare and OWASP controls|SEC-001,SEC-002,SEC-003,SEC-004,SEC-005,SEC-006,SEC-007,NFR-007|Security / Codex|Headers, least privilege, secrets audit and documented ASVS applicability.
[QA] E2E, accessibility and performance|QA-001,NFR-001,NFR-002,NFR-003,NFR-004|QA / Codex|Playwright, axe, Lighthouse, stable CI annotations.
[Docs] Architecture, review evidence and note|REV-001,DOC-001|Documentation / Claude Code|ADRs, review traceability, publishable note drafts separated from unverified claims.
TASKS
