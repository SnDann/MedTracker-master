Title: RFC: Plan to remove Expo

Description:
This draft PR introduces the plan to remove Expo from the project, including a detailed step-by-step migration and checklist. The removal will be performed as multiple small, reviewable PRs; this RFC is intended for discussion and sign-off before work begins.

Checklist:
- Confirm scope and non-goals
- Agree on alternatives for camera and OCR (e.g., `react-native-vision-camera`, ML Kit wrappers)
- Define CI/workflow requirements for builds (macOS runner for iOS builds, Android SDK for Android)
- Approve migration timeline and reviewers

Testing steps (after approval):
- Run migration PRs one-by-one; each PR must include clear instructions for manual device testing.
