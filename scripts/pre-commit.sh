#!/bin/bash

# Pre-commit hook for Match Scorer
# Install: cp scripts/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

set -e

echo "🔍 Running pre-commit checks..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Not in a git repository"
  exit 1
fi

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Check for TypeScript files
TS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx)$' || true)

if [ -n "$TS_FILES" ]; then
  echo "  Checking TypeScript..."
  npx tsc --noEmit || exit 1
  echo "  ✓ TypeScript check passed"
fi

# Check for JavaScript/TypeScript linting (if ESLint configured)
if command -v eslint &> /dev/null; then
  echo "  Linting staged files..."
  npx eslint $TS_FILES || exit 1
  echo "  ✓ Linting passed"
fi

# Run tests if test files changed
TEST_FILES=$(echo "$STAGED_FILES" | grep -E '\.test\.(ts|tsx)$' || true)
if [ -n "$TEST_FILES" ]; then
  echo "  Running tests..."
  npm test -- --bail || exit 1
  echo "  ✓ Tests passed"
fi

echo "✅ Pre-commit checks passed!"
exit 0
