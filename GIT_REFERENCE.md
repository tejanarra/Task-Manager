# Git Quick Reference Guide

## What Happened in Your Case

**The Problem:**
- Your **local** `main` branch had 1 commit: "Assets" (reorganizing files)
- The **remote** `main` branch had 4 commits: dependabot merges + claude-code merge
- Both branches moved forward independently → **divergent branches**

**The Fix:**
```bash
git pull --rebase origin main  # Replay your "Assets" commit on top of remote changes
git push origin main           # Push the updated history
```

**Result:** Your "Assets" commit now sits on top of all the remote commits in a linear history.

---

## Git Basics

### Local vs Remote
- **Local**: Your computer (commits you make locally)
- **Remote**: GitHub server (commits others make or you've pushed)
- **origin**: Default name for your remote repository

### Basic Workflow
```bash
git status              # See what's changed
git add <files>         # Stage files for commit
git commit -m "msg"     # Save changes locally
git push                # Send commits to remote
git pull                # Get commits from remote
```

---

## Branches

### What are branches?
Branches are separate timelines of your code. Think of them as parallel universes of your project.

```bash
git branch              # List local branches
git branch -a           # List all branches (local + remote)
git checkout <branch>   # Switch to a branch
git checkout -b <name>  # Create and switch to new branch
```

### Common Branch Setup
```
main          → Production-ready code
claude-code   → Feature development
ui-updates    → UI changes
```

---

## Common Scenarios

### 1. **Fast-Forward** (Simple & Clean)
Remote has new commits, you have none locally.

```bash
git pull    # Simply adds remote commits to your branch
```

```
Before:           After pull:
Local:  A---B     Local:  A---B---C---D
Remote: A---B---C---D
```

---

### 2. **Divergent Branches** (Your Case!)
Both local and remote have different commits.

```bash
git pull --rebase    # or git pull --no-rebase
```

**Option A: Merge (default)**
```bash
git pull --no-rebase
# Creates a merge commit combining both histories
```
```
Before:              After merge:
Local:  A---B---E         A---B---E---M
Remote: A---B---C---D         \     /
                               C---D
```

**Option B: Rebase (cleaner)**
```bash
git pull --rebase
# Moves your commits on top of remote commits
```
```
Before:              After rebase:
Local:  A---B---E         A---B---C---D---E'
Remote: A---B---C---D
```

---

## Rebase vs Merge

### **Merge** (Preserves history)
```bash
git pull              # Default behavior
git merge <branch>    # Merge another branch into current
```
- ✅ Keeps complete history
- ✅ Shows when branches were integrated
- ❌ Creates "merge commits" (messy history)

### **Rebase** (Clean history)
```bash
git pull --rebase
git rebase <branch>
```
- ✅ Linear, clean history
- ✅ Easier to read
- ❌ Rewrites commit history (don't use on shared branches!)

**Golden Rule:**
- Use **rebase** for local work before pushing
- Use **merge** for integrating shared branches

---

## Advanced Commands

### Checking History
```bash
git log --oneline              # Compact history
git log --graph --all          # Visual branch graph
git log --oneline -10          # Last 10 commits
git show <commit-hash>         # Details of specific commit
```

### Fixing Mistakes
```bash
git restore <file>             # Discard local changes
git restore --staged <file>    # Unstage file
git reset --soft HEAD~1        # Undo last commit, keep changes
git reset --hard HEAD~1        # Undo last commit, DELETE changes
git revert <commit-hash>       # Create new commit undoing a commit
```

### Working with Remotes
```bash
git remote -v                  # List remote URLs
git fetch origin               # Download remote changes (don't merge)
git pull origin main           # Fetch + merge
git push origin <branch>       # Push branch to remote
git push -u origin <branch>    # Push and set upstream tracking
```

### Conflicts
When git can't auto-merge:
```bash
# 1. Git marks conflicts in files like:
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> branch-name

# 2. Manually edit files to resolve
# 3. Stage resolved files
git add <resolved-files>

# 4. If merging:
git commit

# 5. If rebasing:
git rebase --continue
```

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Divergent branches | `git pull --rebase` or `git pull --no-rebase` |
| Want to undo last commit | `git reset --soft HEAD~1` |
| Accidentally edited wrong file | `git restore <file>` |
| Need to see what changed | `git diff` |
| Pushed wrong commit | `git revert <commit-hash>` then push |
| Merge conflict | Edit files, `git add`, then `git commit` |

---

## Best Practices

1. **Commit often** with clear messages
2. **Pull before you push** to avoid conflicts
3. **Never rebase shared branches** (like main after pushing)
4. **Use branches** for features/fixes
5. **Review changes** before committing: `git status` and `git diff`
6. **Keep main clean** - merge only tested code

---

## Your Current Setup Cheat Sheet

```bash
# Check status
git status

# See all branches
git branch -a

# Switch branches
git checkout main          # Go to main
git checkout claude-code   # Go to feature branch

# Update and push
git pull --rebase          # Get latest, apply your commits on top
git push                   # Send your commits

# Visual history
git log --oneline --graph --all -15
```

---

## Useful Git Aliases (Optional)

Add these to your `~/.gitconfig` for shortcuts:

```bash
[alias]
    st = status
    co = checkout
    br = branch
    cm = commit -m
    lg = log --oneline --graph --all
    undo = reset --soft HEAD~1
```

Then use: `git st`, `git co main`, `git lg`, etc.

---

That's it! Git is powerful but these commands cover 95% of daily use.
