import type { ShowDotfilesPlugin } from "./main.js"
import { getIcon } from "obsidian"
import { registerLucideIcon } from "@polyipseity/obsidian-plugin-library"

export function loadIcons(context: ShowDotfilesPlugin): void {
	for (const [key, value] of Object.entries<never>({})) {
		if (getIcon(key)) {
			self.console.warn(key)
			continue
		}
		registerLucideIcon(context, key, value)
	}
}
