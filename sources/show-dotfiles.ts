import {
	type PluginContext,
	revealPrivate,
	revealPrivateAsync,
} from "@polyipseity/obsidian-plugin-library"
import type { ShowDotfilesPlugin } from "./main.js"
import { around } from "monkey-around"

async function showFile(context: PluginContext, path: string): Promise<void> {
	await revealPrivateAsync(
		context,
		[context.app.vault.adapter],
		async adapter0 =>
			adapter0.reconcileFileInternal(adapter0.getRealPath(path), path),
		_0 => { },
	)
}

async function hideFile(context: PluginContext, path: string): Promise<void> {
	await revealPrivateAsync(
		context,
		[context.app.vault.adapter],
		async adapter0 =>
			adapter0.reconcileDeletion(adapter0.getRealPath(path), path),
		_0 => { },
	)
}

export function loadShowDotfiles(
	context: ShowDotfilesPlugin,
): void {
	const { app: { vault, vault: { adapter } }, settings } = context,
		dotpaths = new Set<string>()
	async function onRaw(path: string): Promise<void> {
		const pathnames = path.split("/")
		if (pathnames.some(pn => pn.startsWith("."))) {
			if (!await adapter.exists(path)) {
				dotpaths.delete(path)
				return
			}
			dotpaths.add(path)
			if (settings.value.enabled) { await showFile(context, path) }
		}
	}
	revealPrivate(context, [vault], vault0 => {
		context.registerEvent(vault0.on("raw", onRaw))
		context.register(around(vault0.adapter, {
			reconcileDeletion(proto) {
				return async function fn(
					this: typeof adapter,
					...args: Parameters<typeof proto>
				): ReturnType<typeof proto> {
					if (settings.value.enabled) {
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
								_0 => false,
							)) {
							return
						}
					}
					await proto.apply(this, args)
				}
			},
		}))
	}, _0 => { })
	context.register(settings.onMutate(
		setting => setting.enabled,
		async cur => {
			if (cur) {
				await Promise.all([...dotpaths]
					.map(async path => showFile(context, path)))
			} else {
				await Promise.all([...dotpaths]
					.map(async path => hideFile(context, path)))
			}
		},
	))
}
