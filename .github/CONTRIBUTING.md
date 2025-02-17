# `nf-core/setup-nextflow`: Contributing Guidelines

Hi there!
Many thanks for taking an interest in improving nf-core/setup-nextflow.

> [!NOTE]
> If you need help using or modifying nf-core/setup-nextflow then the best place to ask is on the nf-core Slack [#tools](https://nfcore.slack.com/channels/tools) channel ([join our Slack here](https://nf-co.re/join/slack)).

## Project architecture

`setup-nextflow` is a [Composite GitHub Action](https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-composite-action) that contains two steps

1. A reference to [actions/setup-java](https://github.com/actions/setup-java) to install an up-to-date JVM
2. An original [JavaScript GitHub Action](https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-javascript-action) to install Nextflow itself

From this point forward, this document will exclusively focus on the original JavaScript Action unless otherwise noted.

`setup-nextflow` depends on a JSON pseudo-API hosted on the nf-core website at <https://nf-co.re/nextflow_version>.
`nextflow_version` is updated twice a day via a [workflow within the nf-core/website repo](https://github.com/nf-core/website/blob/main/.github/workflows/build-json-files-and-md-cache.yml) to be up-to-date with Nextflow releases retrieved from the GitHub API.
Requests are proxied through the nf-core website in order to avoid hitting rate limits when accessing the GitHub API on every workflow run with this action.

## Development tools

To run and test this project locally, you will need:

1. [Docker](https://docs.docker.com/engine/install/)
2. [Act](https://nektosact.com/installation/index.html)
3. [NodeJS](https://nodejs.org/en/download)

[Another engine that is compatible with the Docker Engine API may be used by act](https://nektosact.com/usage/custom_engine.html), but since feature sets and environment are very different between engines, please ensure that failures are reproducible using vendored Docker before opening an issue.

## Contribution workflow

If you'd like to write some code for nf-core/setup-nextflow, the standard workflow is as follows:

1. Check if there is an issue about your idea in the [nf-core/setup-nextflow issues](https://github.com/nf-core/setup-nextflow/issues) and create one if there isn't one already. Assign yourself to the issue you intend to work on so that others know you're working on this and we can avoid duplicating work
2. [Fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) the [nf-core/setup-nextflow repository](https://github.com/nf-core/setup-nextflow) to your GitHub account
3. Make the necessary changes / additions within your forked repository
4. Submit a Pull Request against the `master` branch and wait for the code to be reviewed and merged

If you're not used to this workflow with git, you can start with some [docs from GitHub](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests) or even their [excellent `git` resources](https://try.github.io/).

If you are not familiar with a workflow with npm, know that you will need to run `npm ci` within the repository anytime you clone the repo, and after pulling any changes from GitHub.

## Unit Tests

Unit tests of JavaScript functions are written using the [ava test runner framework](https://github.com/avajs/ava).
`ava` will be setup for you upon running `npm ci`.
If you add new code, you should also add additional tests within the `test/` directory.
You should test your changes locally by running your code against these unit tests.
Execute all the tests with the following command:

```bash
npm test
```

When you create a pull request with changes, [GitHub Actions](https://github.com/features/actions) will run automatic tests.
Typically, pull-requests are only fully reviewed when these tests are passing, though of course we can help out before then.

## Integration Tests

A mock workflow is contained with the [workflows/example.yml](https://github.com/nf-core/setup-nextflow/tree/master/.github/workflows/example.yml) that can be used to test the end result of the GitHub Action within a GitHub Action-like environment.
`act` is configured via the [.actrc](https://github.com/nf-core/setup-nextflow/tree/master/.actrc) to pull the correct Docker images for bootstrapping a GitHub Actions Environment automatically.
You should test your changes locally by running your code through the integration tests via `act`.
Execute the integration tests with the following command:

```bash
act -j example-usage
```

> [!NOTE] > `.actrc` is configured to work correctly on x86_64/amd64 Linux machines and Macs, and Apple Silicon Macs.
> The configuration is known to not function correctly on arm64 Linux machines (e.g. Asahi Linux).
> In order to run tests on an arm64 Linux machine, remove the `--container-architecture linux/amd64` line from `.actrc` temporarily.

## Lint tests

`nf-core` has a [set of guidelines](https://nf-co.re/developers/guidelines) which all pipelines must adhere to.
As `setup-nextflow` is not a pipeline, those guidelines have limited applicability here, but we have opted to adapt the linting guidelines over to JavaScript by implementing both [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/).
Linting should happen automatically before each git commit thanks to [Husky](https://typicode.github.io/husky/) pre-commit hooks that are installed when you `npm ci`.
If you are not able to commit your changes, try running

```bash
npm run format
npm run lint:fix
```

to have these tools fix the code formatting for you.

## Build process

GitHub Actions does not have an automated system for building and releasing actions written in TypeScript.[^1]
Technically speaking, a published GitHub action is not actually a package, but simply a git reference to a complete JavaScript execution tree with an `action.yml` file.
As such, the process for releasing a new version of `nf-core/setup-nextflow` is as follows:

1. Clone the `nf-core/setup-nextflow` repository locally - releases cannot be made from a fork
2. Bump the version number within `CHANGELOG.md`, `package.json`, and `package-lock.json`
3. Commit those changes to a branch of the name `release/vX.Y.Z`
4. Push that branch to GitHub (`git push -u origin release/vX.Y.Z`) and merge as a regular pull request
5. Back in the local repo, ensure you still have the `release/vX.Y.Z` branch checked out
6. Checkout an orphan branch of the name `build/vX.Y.Z` (`git checkout --orphan build/vX.Y.Z`). All changes will be untracked and unstaged.
7. Run `npm ci` and `npm run all`
8. Commit the following files/directories:
   - dist
   - docs
   - subaction
   - CHANGELOG.md
   - LICENSE
   - README.md
   - action.yml
9. Delete all untracked files
10. Remove major and major.minor version tags for this version from the remote repository
    ```bash
    git push origin :vX
    git push origin :vX.Y
    ```
11. Tag the current commit with the major, major.minor, and major.minor.patch semantic versions. If git prompts you for a tag message, use the full major.minor.patch version string.
    ```bash
    git tag vX
    git tag vX.Y
    git tag vX.Y.Z
    ```
12. Push the tags to GitHub (`git push --tags`)
13. (Optional) In the GitHub interface, create a [release](https://github.com/nf-core/setup-nextflow/releases) assigned to the tag with content copied from the CHANGELOG, and ensure it is published to the GitHub Marketplace
14. Delete the release and build branch within the local repo
    ```bash
    git checkout master
    git pull
    git branch -d release/vX.Y.Z
    git branch -D build/vX.Y.Z
    ```

## Getting help

For further information/help, please don't hesitate to get in touch on the nf-core Slack [#tools](https://nfcore.slack.com/channels/tools) channel ([join our Slack here](https://nf-co.re/join/slack)).

[^1]: [JasonEtco/build-and-tag-action](https://github.com/JasonEtco/build-and-tag-action) exists but does not function for TypeScript actions. See <https://github.com/JasonEtco/build-and-tag-action/issues/20>
