/* eslint-disable @typescript-eslint/no-empty-interface */
declare global {
	interface Element extends Private<$Element, PrivateKey> { }
	interface Window extends Private<$Window, PrivateKey> { }
}
declare module "obsidian" {
	interface DataAdapter extends Private<$DataAdapter, PrivateKey> { }
	interface FileExplorerView extends Private<$FileExplorerView, PrivateKey> { }
	interface FileItem extends Private<$FileItem, PrivateKey> { }
	interface TFile extends Private<$TFile, PrivateKey> { }
	interface Vault extends Private<$Vault, PrivateKey> { }
	interface Workspace extends Private<$Workspace, PrivateKey> { }
}
import type {
	EventRef,
	FileExplorerView,
	FileItem,
	Stat,
	TFile,
	View,
	WorkspaceLeaf,
} from "obsidian"
import type { Platform, Private } from "@polyipseity/obsidian-plugin-library"
import type { i18n } from "i18next"

declare const PRIVATE_KEY: unique symbol
type PrivateKey = typeof PRIVATE_KEY
declare module "@polyipseity/obsidian-plugin-library" {
	interface PrivateKeys {
		readonly [PRIVATE_KEY]: never
	}
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

interface $Element {
	readonly getText: () => string
}

interface $FileExplorerView extends View {
	readonly fileBeingRenamed: TFile | null
	readonly fileItems: Readonly<Record<string, FileItem>>
	readonly finishRename: () => PromiseLike<void>
}

interface $FileItem {
	readonly innerEl: HTMLElement
}

interface $TFile {
	readonly getNewPathAfterRename: (filename: string) => string
}

interface $Vault {
	readonly on: (
		name: "raw",
		callback: (path: string) => unknown,
		ctx?: unknown,
	) => EventRef
}

interface $Window {
	readonly i18next: i18n
}

interface $Workspace {
	readonly getLeavesOfType: (viewType: "file-explorer") => (WorkspaceLeaf & {
		readonly view: FileExplorerView
	})[]
}
