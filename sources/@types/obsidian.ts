/* eslint-disable @typescript-eslint/no-empty-interface */
import type { EventRef } from "obsidian"
import type { Private } from "@polyipseity/obsidian-plugin-library"

declare const PRIVATE_KEY: unique symbol
type PrivateKey = typeof PRIVATE_KEY
declare module "@polyipseity/obsidian-plugin-library" {
	interface PrivateKeys {
		readonly [PRIVATE_KEY]: never
	}
}

declare module "obsidian" {
	interface DataAdapter extends Private<$DataAdapter, PrivateKey> { }
	interface Vault extends Private<$Vault, PrivateKey> { }
}

interface $DataAdapter {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	readonly _exists: (fullPath: string, path: string) => Promise<boolean>
	readonly getFullPath: (realPath: string) => string
	readonly getRealPath: (path: string) => string
	readonly reconcileDeletion: (realPath: string, path: string) => Promise<void>
	readonly reconcileFileInternal: (
		realPath: string,
		path: string,
	) => Promise<void>
}

interface $Vault {
	readonly on: (
		name: "raw",
		callback: (path: string) => unknown,
		ctx?: unknown,
	) => EventRef
}
