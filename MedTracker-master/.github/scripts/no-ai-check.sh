#!/usr/bin/env bash
set -euo pipefail

# Prohibited tokens (case-insensitive grep)
patterns=(
  "AI"
  "Artificial Intelligence"
  "OpenAI"
  "GPT"
  "Copilot"
  "ML Kit"
)

# Explicit emojis to catch
emojis=("🎉" "🤖" "✅" "🔧" "💡" "😃" "😊")

found=0

echo "Running no-AI / no-emoji check..."

# Check tokens (case-insensitive)
for p in "${patterns[@]}"; do
  if git grep -n -I -i -e "$p" -- "**/*" >/dev/null 2>&1; then
    echo "\nProhibited term found: '$p'" >&2
    git grep -n -I -i -e "$p" -- || true
    found=1
  fi
done

# Check emojis (literal match)
for e in "${emojis[@]}"; do
  if git grep -n -I -F -e "$e" -- "**/*" >/dev/null 2>&1; then
    echo "\nProhibited emoji found: '$e'" >&2
    git grep -n -I -F -e "$e" -- || true
    found=1
  fi
done

if [ "$found" -eq 1 ]; then
  echo "\nPolicy violation: Please remove prohibited terms or emojis according to CONTRIBUTING.md." >&2
  exit 1
fi

echo "No prohibited AI references or emojis found."
