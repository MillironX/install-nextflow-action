# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Updated ESLint to v9

## [2.1.4] - 2024-12-05

- Fix ref handling in nested GitHub Actions

## [2.1.3] - 2024-12-05

- remove unnecessary build step

## [2.1.2] - 2024-12-05

- Fix checkout step in main action.yml

## [2.1.1] - 2024-12-05

- Don't print nextflow help output by default, only on debug mode (#173)

- Don't print nextflow help output by default, only on debug mode (#173)

## [2.1.1] - 2024-12-05

- Add checkout step to main action.yml (#178)

## [2.1.0] - 2024-12-04

### Changed

- Action now installs Java by default and can be configured via the new `java-version` and `java-distribution` inputs (#177)

## [2.0.0] - 2024-03-01

### Added

- `renovate` dependency automation bot (#41)

### Changed

- Upgraded GitHub Actions node version to v20 (#39)
- GitHub Octokit API switched to nf-core custom API (#37)

### Removed

- Timeout controls for Octokit API (#37)

## [1.5.2] - 2024-02-07

### Added

- CI workflow steps for better compatibility with <https://github.com/nektos/act>
- Visual Studio Code debugging configuration
- Husky pre-commit hooks for linting and formatting
- Deprecation messages to warn users of upcoming API switch

## [1.5.1] - 2024-01-30

### Changed

- API calls are now lazy loaded to avoid making unnecessary calls (#33)

## [1.5.0] - 2024-01-22

### Added

- Throttling support to retry failed API calls (#31)

### Changed

- Octokit API calls refactored and separated from install script (#29)

## [1.4.0] - 2023-08-12

### Changed

- If `fs.renameSync` fails (e.g. because source and destination files are on different partitions), try `fs.copySync` and `fs.unlinkSync` instead (#14).
- Fail instead of warn, when `nextflow help`` doesn't work (#23).

### Fixed

- Re-enable npm run test in CI (#15).

- Fix release version check in unit test (#15).

- Add helper function for checking the latest releases in the unit tests (#15).

## [1.3.0] - 2023-05-19

### Changed

- Action now checks tool cache for installed version before querying Octokit (#5/#10)

## [1.2.0] - 2022-10-29

### Added

- `CAPSULE_LOG` is now set to 'none' for less verbose setup logs (#1/#2)

### Fixed

- Release list now paginates the API to find old versions of Nextflow (#3)

## [1.1.0] - 2022-06-15

### Changed

- JavaScript converted to TypeScript

## [1.0.1] - 2022-06-13

### Fixed

- JavaScript now compiled for appropriate use as GitHub action

## [1.0.0] - 2022-06-13

### Added

- NodeJS GitHub Action to download and install Nextflow
- GitHub Actions workflow to test Nextflow installation and downstream usage
- Documentation and license files

[unreleased]: https://github.com/nf-core/setup-nextflow/compare/v2.1.1...HEAD
[2.1.1]: https://github.com/nf-core/setup-nextflow/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/nf-core/setup-nextflow/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/nf-core/setup-nextflow/compare/v1.5.2...v2.0.0
[1.5.2]: https://github.com/nf-core/setup-nextflow/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/nf-core/setup-nextflow/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/nf-core/setup-nextflow/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/nf-core/setup-nextflow/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/nf-core/setup-nextflow/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/nf-core/setup-nextflow/compare/v1.1.1...v1.2.0
[1.1.0]: https://github.com/nf-core/setup-nextflow/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/nf-core/setup-nextflow/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nf-core/setup-nextflow/releases/tag/v1.0.0
