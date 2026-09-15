# Changelog

> Generated automatically on release by git-cliff (`.github/workflows/release.yml`); dates in UTC; do not edit by hand.

## [v1.4.0](https://github.com/mhagnumdw/vscode-easy-toggle-settings/compare/v1.3.1...v1.4.0) (2026-09-15)

### Added

- feat: add easy-toggle-settings.toggle command ([de7de681](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/de7de68191d3f62050aaef47a95c634e460a9a5b))
- feat: add status bar item id and name ([e7baad26](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/e7baad264250a898b31dc2e1963144cf372d962a))

### Fixed

- fix: stop accumulating disposed subscriptions ([b3db952a](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/b3db952a77b42083419c31507671c03d51d6bd21))
- fix: refresh status bar items when a toggled setting changes externally ([5533209d](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/5533209dc0c2c86893f94e18123946ada9fdf43e))

### Performance

- perf: activate on startup finished instead of "*" ([734cdbc4](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/734cdbc4e120f96f5cde1688390bb8ade3fa5a31))

### Changed

- refactor: decouple setting cycling from the status bar item ([73b5211a](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/73b5211aeda2695f5d430221e8a48ee10d5ae294))

### Docs

- docs(readme): document keyboard shortcuts for toggle commands ([5fcb344d](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/5fcb344d146af7f41eeed23492e6ed8857456881))

### CI/Build

- build: exclude the Codecov CLI from the VSIX ([5db016ba](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/5db016ba8ba88e4427079ab9d9b0f4f2debc6f65))
- ci: generate CHANGELOG with git-cliff on release ([#118](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/118)) ([be5a09c6](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/be5a09c661c7395a581690e3ef41be6ab2bb49cd))

### Other

- chore(deps-dev): bump js-yaml from 4.3.1 to 4.3.2 ([#117](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/117)) ([fdeae1c6](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/fdeae1c62d8b8d3d10524be6796e1497cf511260))
- chore(deps): bump fast-uri from 3.1.5 to 3.1.7 ([#115](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/115)) ([3b0c67e6](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/3b0c67e69829cf718539ed52b9adf0f127a8a214))
- chore(deps-dev): bump js-yaml from 4.2.0 to 4.3.1 ([#113](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/113)) ([6208f2f3](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/6208f2f37ec28ffc027b259c6950826c4316cdd1))
- chore(deps): bump fast-uri from 3.1.4 to 3.1.5 ([#112](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/112)) ([82e2d308](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/82e2d308da2050777367b42a85864336a0f1fb4e))
- chore(deps-dev): bump brace-expansion from 1.1.12 to 1.1.16 ([#108](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/108)) ([df3e902e](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/df3e902eb1bdd02db74c35b029c27b06c34e11d1))
- chore(deps): bump linkify-it from 5.0.1 to 5.0.2 ([#109](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/109)) ([e5c2b5f5](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/e5c2b5f57e186e30fefc92ce60223c79d7115590))
- chore(deps): bump fast-uri from 3.1.2 to 3.1.4 ([#110](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/110)) ([3c369b63](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/3c369b638669f2ed3669198b9bf9001b2be0f2d3))
- chore(deps): bump undici from 6.24.1 to 6.27.0 ([#101](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/101)) ([8abf7fd6](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/8abf7fd64b6a8327ca924d7568e4a5a5d164437e))
- chore(deps-dev): bump ovsx from 0.10.10 to 1.0.2 ([#104](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/104)) ([2d2f70b3](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/2d2f70b3859a5daa5c4996aedae860404facabc8))
- chore(deps): bump softprops/action-gh-release from 2 to 3 ([#103](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/103)) ([db92b27f](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/db92b27facc38e6021ca35973b39c9230164a406))
- chore(deps-dev): bump sinon and @types/sinon ([#107](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/107)) ([b47ca3e8](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/b47ca3e8a2b70e4bd493e04c68a54f1d725a927c))
- chore(deps): bump actions/checkout from 6 to 7 ([#102](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/102)) ([702504f2](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/702504f2b52e1577efda1a16214ff633769e6998))
- chore(deps): bump js-yaml and @textlint/linter-formatter ([#100](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/100)) ([75ac2134](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/75ac213470f70786398ccf3456e2f292e224c7a9))
- chore(deps): bump form-data from 4.0.4 to 4.0.6 ([#99](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/99)) ([62695de4](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/62695de410b61662e04c6c29fee60854671d6107))
- chore(deps): bump uuid and @azure/identity ([#94](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/94)) ([ab5195ed](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/ab5195ed2cb39908a036660c71e4b0289bed0394))
- chore(deps): bump markdown-it from 14.1.0 to 14.2.0 ([#98](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/98)) ([e9ad936b](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/e9ad936be355a473ad7392ac270450876c6668a1))
- chore(deps-dev): bump ovsx from 0.10.9 to 0.10.10 ([#91](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/91)) ([b23175b5](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/b23175b594d0814e7cd8941db4c5413690079539))
- chore(deps-dev): bump follow-redirects from 1.15.11 to 1.16.0 ([#93](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/93)) ([89992056](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/899920568ef235de353ec3f71c4015a8b2f4ff27))
- chore(deps): bump lodash from 4.17.23 to 4.18.1 ([#92](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/92)) ([953d3941](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/953d3941c008f3444925eb419f57fa91abac82d7))
- chore(deps): bump qs from 6.15.0 to 6.15.2 ([#96](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/96)) ([d84e8b93](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/d84e8b939293feb7191b3cef63f96e68346a4459))
- chore(deps): bump tmp from 0.2.4 to 0.2.7 ([#97](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/97)) ([81fd7c19](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/81fd7c19416e193b69db78a5cc1b50a269a594d6))
- chore(deps): bump picomatch ([#87](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/87)) ([b6375e7d](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/b6375e7d5ceab49e902f1283b46c8fbcbdc55fd1))
- chore(deps): bump fast-uri from 3.1.0 to 3.1.2 ([#95](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/95)) ([448880c3](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/448880c3fa4f4ef29444e58d464cf78d5f6499be))
- chore(deps-dev): bump flatted from 3.3.3 to 3.4.2 ([#86](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/86)) ([de4cd7d4](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/de4cd7d46e45b249960d11d7919824a98a7d7959))
- chore: update deps ([#85](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/85)) ([867c7743](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/867c77433e51a1ae78554449cca3775441dbe586))
- chore(deps): bump undici from 6.21.2 to 6.24.1 ([#84](https://github.com/mhagnumdw/vscode-easy-toggle-settings/pull/84)) ([ff5114b7](https://github.com/mhagnumdw/vscode-easy-toggle-settings/commit/ff5114b7c6acf3f87cf8f4f265d56f27ed5b60a4))

## 1.3.1

- Docs: Update README to include `disabledValue` optional property

## 1.3.0

- Feat: Add support for workspace-level setting toggles with the `isWorkspace` property (PR #80)
- Feat: Add `disabledValue` property to gray out the status bar item when a specific value is reached (PR #81)
- ci: Add Open VSX Registry publishing to the release workflow (PR #82)

## 1.2.1

- Fix: Unable to toggle settings with array/object values (PR #69)

## 1.2.0

- Show a WARN message if there is a duplicate property (PR #20)

## 1.1.0

- change vscode engine version from ^1.99.0 to ^1.80.0 (PR #15)

## 1.0.0

- Initial release
