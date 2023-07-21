/* eslint-disable @typescript-eslint/no-empty-interface */
import type { EventRef, Stat } from "obsidian"
import type { Platform, Private } from "@polyipseity/obsidian-plugin-library"

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
	readonly _exists: (fullPath: string, path: string) => PromiseLike<boolean>
	readonly getFullPath: (realPath: string) => string
	readonly getRealPath: (path: string) => string
	readonly listAll: () => PromiseLike<void>
	readonly reconcileDeletion: (
		realPath: string,
		path: string,
	) => PromiseLike<void>
	readonly reconcileFileChanged: <T extends Platform.Current>(
		realPath: T extends Platform.Mobile ? string : never,
		path: T extends Platform.Mobile ? string : never,
		stat: T extends Platform.Mobile ? Stat : never,
	) => T extends Platform.Mobile ? PromiseLike<void> : never
	readonly reconcileFileInternal: <T extends Platform.Current>(
		realPath: T extends Platform.Desktop ? string : never,
		path: T extends Platform.Desktop ? string : never,
	) => T extends Platform.Desktop ? PromiseLike<void> : never
	readonly reconcileFolderCreation: (
		realPath: string,
		path: string,
	) => PromiseLike<void>
}

interface $Vault {
	readonly on: (
		name: "raw",
		callback: (path: string) => unknown,
		ctx?: unknown,
	) => EventRef
}
