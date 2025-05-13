# Contributing Guide for *referai*

This is repository is part of a final degree project (TFG), so contributions will be limited to team members only. However, we aim to maintain a consistent and clean workflow throughout development.

## Workflow
We follow [**Gitflow**](https://www.atlassian.com/es/git/tutorials/comparing-workflows/gitflow-workflow) workflow to manage our development process:
- All new work will be done in `feature/task` branches created from `develop`.
- Once a feature is completed, it will be merged into `develop` through a pull request.
- Pull requests must be reviewed and approved by the other member before merging.

## Commit Message Guidelines

We follow the [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/) specification for all commit messages to ensure that our commit history is consistent and descriptive.

Commit messages should follow this structure:

> type: description
> 
> (optional body)

**Allowed Types**:
- `feat`: Introduces a new feature to the codebase.
- `fix`:  Fixes a bug.
- `docs`: Adds or updates documentation.
- `style`: Introduces style changes (no logic changes).
- `refactor`: Refactors code without changing behavior.
- `test`: Adds or updates tests.

    ...

**Example Commit Messages**:
- `feat: add model training code`
- `fix: correct data preprocessing bug`
- `docs: update README with project structure`

The team will allways follow the latest version of the Conventional Commits. **Actual version of use is 1.0.0**.