/* eslint-disable @typescript-eslint/no-empty-interface */
import type { } from "obsidian"
import type { Private } from "obsidian-plugin-library"

declare const PRIVATE_KEY: unique symbol
type PrivateKey = typeof PRIVATE_KEY
declare module "obsidian-plugin-library" {
	interface PrivateKeys {
		readonly [PRIVATE_KEY]: never
	}
}

declare module "obsidian" {
	interface App extends Private<$App, PrivateKey> { }
}

interface $App {
	readonly constructor: {
		readonly validateConfigDir: (name: string) => boolean
	}
}
