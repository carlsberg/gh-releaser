# GitHub Releaser

> [GitHub CLI](https://cli.github.com) extension to simplify starting and
> closing releases in GitFlow-based projects.

## Installation

```bash
$ gh extensions install carlsberg/gh-releaser
```

## Commands

### `gh releaser start <tag>`

Starts a new release.

- Creates a release branch (i.e. `release/1.0.0`)
- Creates a GitHub Release in _draft_
- Creates a Pull Request to merge the release branch to the main branch

### `gh releaser close`

Closes an existing release.

- Merges the Pull Request
- Publishes the GitHub release

### `gh releaser update <new tag>`

Updates the version for an open release.

- Creates a new release branch for the new tag
- Updates the GitHub Release name and tag
- Updates the Pull Request to use the new branch
- Deletes the old branch

### `gh releaser pr`

Shows the Pull Request number for an open release.

## Using in GitHub Workflows

<details>
  <summary>Click to expand the example</summary>

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      tag:
        description: Tag
        required: true

jobs:
  start-release:
    name: Start Release
    runs-on: ubuntu-latest
    needs: setup
    steps:
      - name: Start Release
        run: |
          gh extensions install carlsberg/gh-releaser
          gh releaser start
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OWNER: ${{ github.repository_owner }}
          REPO: ${{ github.event.repository.name }}

  qa-approval:
    name: QA Approval
    runs-on: ubuntu-latest
    needs: start-release
    environment: release
    steps:
      - name: Add approval label
        run: |
          gh extensions install carlsberg/gh-releaser
          gh pr edit $(gh releaser pr) --add-label "approved:qa"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OWNER: ${{ github.repository_owner }}
          REPO: ${{ github.event.repository.name }}

  stakeholder-approval:
    name: Stakeholder Approval
    runs-on: ubuntu-latest
    needs: qa-approval
    environment: release
    steps:
      - name: Add approval label
        run: |
          gh extensions install carlsberg/gh-releaser
          gh pr edit $(gh releaser pr) --add-label "approved:stkh"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OWNER: ${{ github.repository_owner }}
          REPO: ${{ github.event.repository.name }}

  close-release:
    name: Close Release
    runs-on: ubuntu-latest
    needs: stakeholder-approval
    environment: release
    steps:
      - name: Close Release
        run: |
          gh extensions install carlsberg/gh-releaser
          gh releaser close
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OWNER: ${{ github.repository_owner }}
          REPO: ${{ github.event.repository.name }}
```

</details>

## Contributing

Please, see [CONTRIBUTING.md](CONTRIBUTING.md) to learn how you can contribute
to this repository. Every contribution is welcome!

## License

This project is released under the [MIT License](LICENSE).
