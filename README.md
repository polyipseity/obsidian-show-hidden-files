# Show Hidden Files for Obsidian [![release](https://img.shields.io/github/v/release/polyipseity/obsidian-show-hidden-files)][latest release] [![Obsidian downloads](https://img.shields.io/badge/dynamic/json?logo=Obsidian&color=%238b6cef&label=downloads&query=$["show-hidden-files"].downloads&url=https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json)][community plugin]

[Buy Me a Coffee]: https://buymeacoffee.com/polyipseity
[Buy Me a Coffee/embed]: https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=polyipseity&button_colour=40DCA5&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00
[Obsidian]: https://obsidian.md/
[changelog]: https://github.com/polyipseity/obsidian-show-hidden-files/blob/main/CHANGELOG.md
[community plugin]: https://obsidian.md/plugins?id=show-hidden-files
[latest release]: https://github.com/polyipseity/obsidian-show-hidden-files/releases/latest
[repository]: https://github.com/polyipseity/obsidian-show-hidden-files
[trailer]: https://raw.githubusercontent.com/polyipseity/obsidian-show-hidden-files/main/assets/trailer.png
[related]: https://github.com/polyipseity/obsidian-monorepo

Show hidden files, like dotfiles, in [Obsidian].

[![Buy Me a Coffee/embed]][Buy Me a Coffee]

__[Repository] · [Changelog] · [Community plugin] · [Related] · [Features](#features) · [Installation](#installation) · [Usage](#usage) · [Contributing](#contributing) · [Security](#security)__

![Trailer]

For first time users, read the [installation](#installation) section first!

This file is automatically opened on first install. You can reopen it in settings or command palette.

## Features

- Show files that are forcefully hidden in vanilla Obsidian.
- Toggle visibility of hidden files.
- Interact with hidden files normally like normal files.

## Installation

1. Install plugin.
    - ~~Community plugins~~
        1. ~~Install the [plugin][community plugin] from community plugins directly.~~
    - Manual
        1. Create directory `show-hidden-files` under `.obsidian/plugins` of your vault.
        2. Place `manifest.json`, `main.js`, and `styles.css` from the [latest release] into the directory.
    - Building (latest)
        1. Clone this repository, including its submodules.
        2. Install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
        3. Run `npm install` in the root directory.
        4. Run `npm run obsidian:install <vault directory>` in the root directory.
    - [Obsidian42 - BRAT](https://obsidian.md/plugins?id=obsidian42-brat) (latest)
        - See [their readme](https://github.com/TfTHacker/obsidian42-brat#readme).
2. Enable plugin. _Before you enable, please check [§ Usage](#usage)._
3. (optional) Configure plugin settings.

## Usage

- Before enabling the plugin, check if your vault contains dot folders with a lot of files \(e.g. 100+ files\). If yes, Obsidian will likely freeze \(for a long time\) when you enable the plugin, as Obsidian scans all files in the dot folders.

    By default, the plugin excludes folders and files named `.git` or `.venv` at any level of the vault file tree. If your dot folders are excluded by the defaults, you can simply enable the plugin without freezing Obsidian. The defaults can be edited in plugin settings.

    If not, you should manually create `.obsidian/plugins/show-hidden-files/data.json`, with the following contents as an example \(excluding the comments\):

    ```JSON5
    {
        "showingRules": [
            "+/", // Needed to include all hidden files and folders.
            // Add dot folders with a lot of files, e.g.:
            "-/\\.git(?:\\/|$)/u",
            "-/\\.venv(?:\\/|$)/u",
            "-/\\.aDotFolderWithManyFiles(?:\\/|$)/u",
        ]
    }
    ```

    The example excludes folders and files named `.git`, `.venv`, or `.aDotFolderWithManyFiles` at any level of the vault file tree. You can instead use `"-.aDotFolderWithManyFiles/"` to exclude a folder or file named `.aDotFolderWithManyFiles` at the vault root only.

- Enable the plugin.
- Please also enable `Files & links > Detect all file extensions` for the plugin to work properly.
- Other plugins will treat visible hidden files as normal files. This may cause issues such as treating plugin JavaScript files as user scripts. To resolve such issues, exclude those hidden files in the other plugins' settings or hide those hidden files in this plugin's settings.

## Contributing

Contributions are welcome!

This project uses [`changesets`](https://github.com/changesets/changesets) to manage the changelog. When creating a pull request, please [add a changeset](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md#adding-changesets) describing the changes. Add multiple changesets if your pull request changes several things. End each changeset with `([PR number](PR link) by [author username](author link))`. For example, the newly created file under the directory `.changeset` should look like:

```Markdown
---
"example": patch
---

This is an example change. ([GH#1](https://github.com/ghost/example/pull/1) by [@ghost](https://github.com/ghost))
```

### Todos

The todos here, ordered alphabetically, are things planned for the plugin. There are no guarantees that they will be completed. However, we are likely to accept contributions for them.

- (none)

### Translating

See [`assets/locales/README.md`](assets/locales/README.md).

## Security

We hope that there will never be any security vulnerabilities, but unfortunately it does happen. Please [report](#reporting-a-vulnerability) them!

### Supported versions

| Version | Supported |
|-|-|
| latest | ✅ |
| outdated | ❌ |

### Reporting a vulnerability

Please report a vulnerability by opening an new issue. We will get back to you as soon as possible.
