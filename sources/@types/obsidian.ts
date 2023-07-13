/* eslint-disable @typescript-eslint/no-empty-interface */
import type { } from "obsidian"
import type { Private } from "@polyipseity/obsidian-plugin-library"

declare const PRIVATE_KEY: unique symbol
type PrivateKey = typeof PRIVATE_KEY
declare module "@polyipseity/obsidian-plugin-library" {
	interface PrivateKeys {
		readonly [PRIVATE_KEY]: never
	}
}

declare module "obsidian" {
	interface Vault extends Private<$Vault, PrivateKey> { }
}

interface $Vault {
	readonly constructor: {
		readonly validateConfigDir: (name: string) => boolean
	}
}
