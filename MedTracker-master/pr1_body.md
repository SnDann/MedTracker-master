Title: feat: POC OCR (tesseract.js) + modular image pipeline

Description:
This PR implements a proof-of-concept OCR wrapper that attempts to use an available native OCR (`expo-text-recognition`) on native platforms and falls back to `tesseract.js` for web/node environments. It also modularizes the image pipeline by moving the icon generation scripts into a `dev-scripts` package (contains `sharp`) so the main app no longer depends on native `sharp` at runtime. Documentation (`SETUP.md`) and tests (`tests/ocr.test.ts`) were added.

Checklist:
- `lib/ocr.ts` wrapper added with runtime detection (native → expo-text-recognition, fallback → tesseract.js)
- Demo screen `app/(tabs)/ocr-test.tsx` added for manual testing
- Unit test `tests/ocr.test.ts` added (mocked tesseract)
- `dev-scripts/` package created with `sharp` and scripts `generate-icons` / `create-temp-icon`
- `SETUP.md` updated with `dev-scripts` bootstrap instructions
- CI will pass (typecheck, lint, tests)

Testing steps:
1. Install dependencies: `npm ci`
2. Install dev-scripts deps: `npm run bootstrap-dev-scripts`
3. Optional: `npm --prefix dev-scripts run generate-icons`
4. Run unit tests: `npm test` (verify `ocr.test.ts` passes)
5. Run app (web): open the `OCR Test` tab and upload an image with text to verify fallback OCR works.
