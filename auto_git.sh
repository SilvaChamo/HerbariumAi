#!/bin/bash
# Auto‑commit and push script for HerbariumAi
# Checks for any uncommitted changes, stages them, creates a commit with a timestamp, and pushes to origin/main.

# Exit if there is nothing to commit
if [[ -z $(git status --porcelain) ]]; then
  echo "No changes to commit."
  exit 0
fi

# Stage all changes (including new, modified, deleted files)
git add -A

# Create a commit with a descriptive message including date and time
COMMIT_MSG="Auto‑commit: $(date '+%Y-%m-%d %H:%M:%S')"

git commit -m "$COMMIT_MSG"

# Push to the remote repository (main branch)
# Adjust the branch name if you use a different default branch
git push origin main

echo "Changes committed and pushed successfully."
