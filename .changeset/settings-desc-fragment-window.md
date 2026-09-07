---
"obsidian-unhide": patch
---

Fix the "Protect Obsidian Sync" and "Show hidden files" settings descriptions rendering as literal `[object DocumentFragment]` text. Obsidian's settings tab can render in its own window, where `Setting#setDesc` fails an `instanceof DocumentFragment` check against a fragment created in a different window's realm and falls back to stringifying it; the descriptions are now written directly into `descEl` instead. ([GH#45](https://github.com/polyipseity/obsidian-unhide/pull/45) by [@humantorch](https://github.com/humantorch))
