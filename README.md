# Show Hidden Files for Obsidian [![release](https://img.shields.io/github/v/release/polyipseity/obsidian-show-hidden-files)][latest release] [![Obsidian downloads](https://img.shields.io/badge/dynamic/json?logo=Obsidian&color=%238b6cef&label=downloads&query=$["show-hidden-files"].downloads&url=https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json)][community plugin]

[Buy Me a Coffee]: https://buymeacoffee.com/polyipseity
[Buy Me a Coffee/embed]: https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=polyipseity&button_colour=40DCA5&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00
[Obsidian]: https://obsidian.md/
[changelog]: https://github.com/polyipseity/obsidian-show-hidden-files/blob/main/CHANGELOG.md
[community plugin]: https://obsidian.md/plugins?id=show-hidden-files
[latest release]: https://github.com/polyipseity/obsidian-show-hidden-files/releases/latest
[other things]: https://github.com/polyipseity/obsidian-monorepo
[plugin library]: https://github.com/polyipseity/obsidian-plugin-library
[repository]: https://github.com/polyipseity/obsidian-show-hidden-files
[trailer]: https://raw.githubusercontent.com/polyipseity/obsidian-show-hidden-files/main/assets/trailer.png

Show hidden files, like dotfiles, in [Obsidian].

[![Buy Me a Coffee/embed]][Buy Me a Coffee]

__[Repository] · [Changelog] · [Community plugin] · [Other things] · [Features](#features) · [Installation](#installation) · [Usage](#usage) · [Contributing](#contributing) · [Security](#security)__

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
2. Enable plugin.
3. (optional) Configure plugin settings.

## Usage

- Enable the plugin.
- Please also enable `Files & links > Detect all file extensions` to work properly.
- Note that other plugins will treat visible hidden files as normal files. This may cause issues such as treating plugin JavaScript files as user scripts. To resolve such issues, exclude those hidden files in the other plugins' settings or hide those hidden files in this plugin's settings.

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

Translation files are under [`assets/locales/`](assets/locales/). Each locale has its own directory named with its corresponding __[IETF language tag](https://wikipedia.org/wiki/IETF_language_tag)__. Some translation keys are missing here and instead located at [`obsidian-plugin-library`][plugin library].

To contribute translation for an existing locale, modify the files in the corresponding directory.

For a new locale, create a new directory named with its language tag and copy [`assets/locales/en/translation.json`](assets/locales/en/translation.json) into it. Then, add an entry to [`assets/locales/en/language.json`](assets/locales/en/language.json) in this format:

```JSONc
{
    // ...
    "en": "English",
    "(your-language-tag)": "(Native name of your language)",
    "uwu": "Uwuish",
    // ...
}
```

Sort the list of languages by the alphabetical order of their language tags. Then modify the files in the new directory. There will be errors in [`assets/locales.ts`](assets/locales.ts), which you can ignore and we will fix them for you. You are welcome to fix them yourself if you know TypeScript.

When translating, keep in mind the following things:

- Do not translate anything between `{{` and `}}` (`{{example}}`). They are __interpolations__ and will be replaced by localized strings at runtime.
- Do not translate anything between `$t(` and `)` (`$t(example)`). They refer to other localized strings. To find the localized string being referred to, follow the path of the key, which is separated by dots (`.`). For example, the key [`youtu.be./dQw4w9WgXcQ`](https://youtu.be./dQw4w9WgXcQ) refers to:

```JSONc
{
    // ...
    "youtu": {
        // ...
        "be": {
            // ...
            "/dQw4w9WgXcQ": "I am 'youtu.be./dQw4w9WgXcQ'!",
            // ...
        },
        // ...
    },
    // ...
}
```

- The keys under `generic` are vocabularies. They can be referred in translation strings by `$t(generic.key)`. Refer to them as much as possible to standardize translations for vocabularies that appear in different places.
- It is okay to move interpolations and references to other localized strings around to make the translation natural. It is also okay to not use some references used in the original translation. However, it is NOT okay to not use all interpolations.

## Security

We hope that there will never be any security vulnerabilities, but unfortunately it does happen. Please [report](#reporting-a-vulnerability) them!

### Supported versions

| Version | Supported |
|-|-|
| latest | ✅ |
| outdated | ❌ |

### Reporting a vulnerability

Please report a vulnerability by opening an new issue. We will get back to you as soon as possible.
