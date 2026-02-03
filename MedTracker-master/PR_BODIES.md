# PR Bodies and Command Snippets

## PR 1 — POC OCR + Modular Image Pipeline

**Title:** feat: POC OCR (tesseract.js) + modular image pipeline (dev-scripts)

**Description:**
This PR implements a proof-of-concept OCR wrapper that attempts to use an available native OCR (`expo-text-recognition`) on native platforms and falls back to `tesseract.js` for web/node environments. It also modularizes the image pipeline by moving the icon generation scripts into a `dev-scripts` package (contains `sharp`) so the main app no longer depends on native `sharp` at runtime. Documentation (`SETUP.md`) and tests (`tests/ocr.test.ts`) were added.

**Checklist:**
- [ ] `lib/ocr.ts` wrapper added with runtime detection (native → expo-text-recognition, fallback → tesseract.js)
- [ ] Demo screen `app/(tabs)/ocr-test.tsx` added for manual testing
- [ ] Unit test `tests/ocr.test.ts` added (mocked tesseract)
- [ ] `dev-scripts/` package created with `sharp` and scripts `generate-icons` / `create-temp-icon`
- [ ] `SETUP.md` updated with `dev-scripts` bootstrap instructions
- [ ] CI will pass (typecheck, lint, tests)

**Testing steps:**
1. Install dependencies: `npm ci`
2. Install dev-scripts deps: `npm run bootstrap-dev-scripts`
3. Optional: `npm --prefix dev-scripts run generate-icons`
4. Run unit tests: `npm test` (verify `ocr.test.ts` passes)
5. Run app (web): open the `OCR Test` tab and upload an image with text to verify fallback OCR works.

**Reviewers / Labels:** `feature`, `POC`, `needs-manual-test`

**Related docs:** `SETUP.md`, `REFACTOR_PLAN.md`

---

## PR 2 — RFC: Remove Expo (Plan)

**Title:** RFC: Plan to remove Expo (discussion)

**Description:**
This draft PR introduces the plan to remove Expo from the project, including a detailed step-by-step migration and checklist. The removal will be performed as multiple small, reviewable PRs; this RFC is intended for discussion and sign-off before work begins.

**Checklist:**
- [ ] Confirm scope and non-goals
- [ ] Agree on alternatives for camera and OCR (e.g., `react-native-vision-camera`, ML Kit wrappers)
- [ ] Define CI/workflow requirements for builds (macOS runner for iOS builds, Android SDK for Android)
- [ ] Approve migration timeline and reviewers

**Testing steps (after approval):**
- Run migration PRs one-by-one; each PR must include clear instructions for manual device testing.

**Reviewers / Labels:** `RFC`, `chore`, `discussion`, `breaking-change`

---

## Local Git commands (quick snippet)

Replace `origin` and `main` with your repo/branch naming if different.

```powershell
# PR 1 (POC OCR)
git checkout -b feature/poc-ocr-modules
git add -A
git commit -m "feat: POC OCR (tesseract.js) + modularize image pipeline (dev-scripts) + docs"
git push -u origin feature/poc-ocr-modules
# Create PR with gh (if installed)
gh pr create --title "feat: POC OCR + modular image pipeline" --body "(see PR body)" --base main --head feature/poc-ocr-modules

# PR 2 (RFC remove expo)
git checkout -b chore/plan-remove-expo
# create file EXPO_REMOVAL_PLAN.md (already added)
git add EXPO_REMOVAL_PLAN.md
git commit -m "chore: RFC - plan to remove Expo (discussion)"
git push -u origin chore/plan-remove-expo
gh pr create --title "RFC: Remove Expo" --body "(RFC plan attached)" --base main --head chore/plan-remove-expo --draft
```

---

If you want, I can also add the PR bodies as the GitHub PR descriptions when you run `gh pr create` (use the `--body-file` option if you prefer).