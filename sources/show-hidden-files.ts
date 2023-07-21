import {
	Platform,
	type PluginContext,
	addCommand,
	anyToError,
	deepFreeze,
	inSet,
	printError,
	revealPrivate,
	revealPrivateAsync,
} from "@polyipseity/obsidian-plugin-library"
import type { ShowHiddenFilesPlugin } from "./main.js"
import { around } from "monkey-around"
import { constant } from "lodash-es"

export function loadShowHiddenFiles(
	context: ShowHiddenFilesPlugin,
): void {
	const
		{
			app: { vault, vault: { adapter }, workspace },
			language: { value: i18n },
			settings,
		} = context,
		hiddenPaths = new Set<string>()
	function onErr(error: unknown): void {
		printError(
			anyToError(error),
			() => i18n.t("errors.error-mutating-settings"),
			context,
		)
	}
	async function showAll(): Promise<void> {
		await Promise.all([...hiddenPaths]
			.map(async path => showFile(context, path)))
	}
	async function hideAll(): Promise<void> {
		await Promise.all([...hiddenPaths]
			.map(async path => hideFile(context, path)))
	}
	context.register(hideAll)
	context.register(settings.onMutate(
		setting => setting.showHiddenFiles,
		async cur => cur ? showAll() : hideAll(),
	))
	async function onRaw(path: string): Promise<void> {
		const pathnames = path.split("/")
		if (pathnames.some(pn => pn.startsWith("."))) {
			if (!await adapter.exists(path)) {
				hiddenPaths.delete(path)
				return
			}
			hiddenPaths.add(path)
			if (settings.value.showHiddenFiles) { await showFile(context, path) }
		}
	}
	revealPrivate(context, [vault], vault0 => {
		context.registerEvent(vault0.on("raw", onRaw))
		context.register(around(vault0.adapter, {
			reconcileDeletion(proto) {
				return async function fn(
					this: typeof adapter,
					...args: Parameters<typeof proto>
				): Promise<Awaited<ReturnType<typeof proto>>> {
					if (settings.value.showHiddenFiles) {
						const [realPath, path] = args,
							pathnames = path.split("/")
						if (pathnames.some(pn => pn.startsWith(".")) &&
							// Cannot use `exists` as it causes an await loop
							await revealPrivateAsync(
								context,
								[adapter],
								async adapter0 =>
									// eslint-disable-next-line no-underscore-dangle
									adapter0._exists(adapter0.getFullPath(realPath), path),
								constant(false),
							)) {
							return
						}
					}
					await proto.apply(this, args)
				}
			},
		}))
	}, () => { })
	workspace.onLayoutReady(async () =>
		revealPrivateAsync(context, [adapter], async adapter0 =>
			adapter0.listAll(), () => { }))
	for (const { type, checkCallback } of deepFreeze([
		{
			checkCallback: (checking: boolean): boolean => {
				const ret = !settings.value.showHiddenFiles
				if (ret && !checking) {
					settings.mutate(set => { set.showHiddenFiles = true })
						.then(async () => settings.write())
						.catch(onErr)
				}
				return ret
			},
			type: "show",
		},
		{
			checkCallback: (checking: boolean): boolean => {
				const ret = settings.value.showHiddenFiles
				if (ret && !checking) {
					settings.mutate(set => { set.showHiddenFiles = false })
						.then(async () => settings.write())
						.catch(onErr)
				}
				return ret
			},
			type: "hide",
		},
		{
			checkCallback: (checking: boolean): boolean => {
				if (!checking) {
					settings.mutate(set => {
						set.showHiddenFiles = !set.showHiddenFiles
					}).then(async () => settings.write())
						.catch(onErr)
				}
				return true
			},
			type: "toggle",
		},
	])) {
		addCommand(context, () => i18n.t(`commands.show-hidden-files-${type}`), {
			checkCallback,
			icon: i18n.t(`asset:commands.show-hidden-files-${type}-icon`),
			id: `show-hidden-files.${type}`,
		})
	}
}

async function showFile(context: PluginContext, path: string): Promise<void> {
	await revealPrivateAsync(
		context,
		[context.app.vault.adapter],
		async adapter0 => {
			const realPath = adapter0.getRealPath(path)
			if (inSet(Platform.DESKTOP, Platform.CURRENT)) {
				await adapter0.reconcileFileInternal<typeof Platform.CURRENT>(
					realPath,
					path,
				)
			} else if (inSet(Platform.MOBILE, Platform.CURRENT)) {
				const stat = await adapter0.stat(path)
				if (!stat) { return }
				const { type } = stat
				switch (type) {
					case "file":
						await adapter0.reconcileFileChanged<typeof Platform.CURRENT>(
							realPath,
							path,
							stat,
						)
						break
					case "folder":
						await adapter0.reconcileFolderCreation(realPath, path)
						break
					default:
						throw new Error(type)
				}
			} else {
				throw new Error(Platform.CURRENT)
			}
		},
		() => { },
	)
}

async function hideFile(context: PluginContext, path: string): Promise<void> {
	await revealPrivateAsync(
		context,
		[context.app.vault.adapter],
		async adapter0 =>
			adapter0.reconcileDeletion(adapter0.getRealPath(path), path),
		() => { },
	)
}
