# Changelog for Show Hidden Files

[Buy Me a Coffee]: https://buymeacoffee.com/polyipseity
[Buy Me a Coffee/embed]: https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=polyipseity&button_colour=40DCA5&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00
[readme]: https://github.com/polyipseity/obsidian-show-hidden-files/blob/main/README.md

[![Buy Me a Coffee/embed]][Buy Me a Coffee]

Versions are ordered by recency.

This file is automatically opened on update. You can reopen it in settings or command palette. The auto-open behavior can be toggled in settings.

- [Readme]

## Unreleased

- Update minimum Obsidian version to v1.2.8. (`85d498d7cecf28b07e0562c4d9c1c793bf0344c0`)

__Features__
- Add three commands to toggle visibility of hidden files. (`8ccce72c4d35c6aafbc02cec7770a711d278c4f4`)
- Add setting `Show hidden files`. (`9e7dc20d087895eac06bd356451d77c9d417906a`)

__Fixes__
- Fix the command to export settings to clipboard. (`993dff6c94b7e70e53c42afdad3fa8e56324a3aa`)
- Fix lifecycle management. (`46771b52d6db6c1523a959d8204bc921bd7121ca`)
- Fix `updateView` not updating the inner title. (`45603f33109f10be0bc7c040fa1addc42153d92f`)
- Fix failing to load the plugin if settings are malformed. (`45603f33109f10be0bc7c040fa1addc42153d92f`)

__Improvements__
- Use a new safer approach to show hidden dotfiles. (`c8a40e0ecbcd8e3fbca819aee623855fe6b2287b`)

__Full changelog__: [`1.0.3...main`](https://github.com/polyipseity/obsidian-show-hidden-files/compare/1.0.3...main)

## 1.0.3 (2023-07-01)

__Improvements__
- Remove confusing "Malformed data" notice. (`8b2e50ffcd085625dde0d0262e20fc1bfca90a8d`)
- Update npm packages to remove vulnerabilities. (`9f72566d714a238f6ea29aa4783816c2704f93dc`)

__Full changelog__: [`1.0.2...1.0.3`](https://github.com/polyipseity/obsidian-show-hidden-files/compare/1.0.2...1.0.3)

## 1.0.2 (2023-05-18)

__Improvements__
- Improve performance. (`742f9abdd559eca0391769a2adf08da27a8f4496`)

__Full changelog__: [`1.0.1...1.0.2`](https://github.com/polyipseity/obsidian-show-hidden-files/compare/1.0.1...1.0.2)

## 1.0.1 (2023-05-17)

__Fixes__
- Fix heuristics for detecting other plugin calls to `string#startsWith` not working on iOS. (`f98e1e6151e69c1ea15341956455aa6c59c2f837`)
- Fix `Override config folder` failing on iOS. (`9a70c32a6f0d484f3a15cb0312944db15c4a36ed`..`7d48bad63088b4d6d65c9555373bd2620b193008`)

__Improvements__
- Dynamically calculate overhead just in case someone else also patches `string#startsWith`. (`21779a0535de3a7fe9bf628751fd089576ed7001`)

__Full changelog__: [`1.0.0...1.0.1`](https://github.com/polyipseity/obsidian-show-hidden-files/compare/1.0.0...1.0.1)

## 1.0.0 (2023-05-16)

Initial release! 🥳

Please report any bugs you have found!

Inspired by [this forum post](https://forum.obsidian.md/t/enable-use-of-hidden-files-dotfiles-within-obsidian/26908).

__Full changelog__: [`758424a8d4174f67fc20bdd308060db168eeec34...1.0.0`](https://github.com/polyipseity/obsidian-show-hidden-files/compare/758424a8d4174f67fc20bdd308060db168eeec34...1.0.0)
