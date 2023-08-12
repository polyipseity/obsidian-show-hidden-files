import { type Command, type MobileStat, normalizePath } from "obsidian"
import {
	EventEmitterLite,
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
import { constant, escapeRegExp, isUndefined } from "lodash-es"
import type { MarkOptional } from "ts-essentials"
import type { ShowHiddenFilesPlugin } from "./main.js"
import { around } from "monkey-around"

interface Rule {
	readonly op: "-" | "+"
	readonly value: RegExp
}

class ShowingRules {
	public rules
	public readonly onChanged = new EventEmitterLite<readonly [
		cur: this["rules"],
		prev: this["rules"],
	]>()

	public constructor(context: ShowHiddenFilesPlugin) {
		const { settings } = context
		this.rules = ShowingRules.parseRules(settings.value.showingRules)
		context.register(settings.onMutate(
			setting => setting.showingRules,
			async cur => {
				const { rules } = this
				await this.onChanged.emit(
					this.rules = ShowingRules.parseRules(cur),
					rules,
				)
			},
		))
	}

	public static parseRules(rules: readonly string[]): readonly Rule[] {
		return rules.map(rule => {
			let op: Rule["op"] = "+",
				rule2 = rule
			if (rule2.startsWith("+")) {
				rule2 = rule2.slice("+".length)
			} else if (rule2.startsWith("-")) {
				op = "-"
				rule2 = rule2.slice("-".length)
			}
			const [, pattern, flags] =
				(/^\/(?<pattern>(?:\\\/|[^/])+)\/(?<flags>[dgimsuvy]*)$/u)
					.exec(rule2) ?? []
			if (!isUndefined(pattern) && !isUndefined(flags)) {
				return {
					op,
					value: new RegExp(pattern, `${flags}u`),
				}
			}
			rule2 = normalizePath(rule2)
			return {
				op,
				value: rule2 === "/"
					? /(?:)/u
					: new RegExp(
						`^${escapeRegExp(normalizePath(rule2))}(?:$|/)`,
						"u",
					),
			}
		})
	}

	public test(path: string): boolean {
		let ret = false
		for (const { op, value } of this.rules) {
			if (op === (ret ? "-" : "+") && value.test(path)) { ret = !ret }
		}
		return ret
	}
}

export function loadShowHiddenFiles(
	context: ShowHiddenFilesPlugin,
): void {
	patchVault(context)
	patchErrorMessage(context)
	patchFileExplorer(context)
	addCommands(context)
}

function patchVault(context: ShowHiddenFilesPlugin): void {
	const
		{
			app: { vault: { adapter }, workspace },
			settings,
		} = context,
		hiddenPaths = new Set<string>(),
		rules = new ShowingRules(context)
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
	revealPrivate(context, [adapter], adapter0 => {
		context.register(around(adapter0, {
			reconcileDeletion(proto) {
				return async function fn(
					this: typeof adapter,
					...args: Parameters<typeof proto>
				): Promise<Awaited<ReturnType<typeof proto>>> {
					const [, path] = args
					if (isHiddenPath(path)) {
						// Cannot use `exists` as it causes an await loop
						if (await revealPrivateAsync(
							context,
							[adapter],
							async adapter2 =>
								// eslint-disable-next-line no-underscore-dangle
								adapter2._exists(adapter0.getFullPath(path), path),
							constant(false),
						)) {
							hiddenPaths.add(path)
							if (settings.value.showHiddenFiles && rules.test(path)) {
								return showFile(context, path)
							}
						} else {
							hiddenPaths.delete(path)
						}
					}
					return proto.apply(this, args)
				}
			},
		}))
	}, () => { })
	context.register(rules.onChanged.listen(async () =>
		Promise.all([...hiddenPaths].map(async path => rules.test(path)
			? showFile(context, path)
			: hideFile(context, path)))))
	workspace.onLayoutReady(async () =>
		revealPrivateAsync(context, [adapter], async adapter0 =>
			adapter0.listRecursive(""), () => { }))
}

function patchErrorMessage(context: ShowHiddenFilesPlugin): void {
	// Affects: canvas: convert to file, renaming in editor
	const { settings } = context
	revealPrivate(context, [self], self0 => {
		const { i18next } = self0
		context.register(around(i18next, {
			// eslint-disable-next-line id-length
			t(proto) {
				return function fn(
					this: typeof i18next,
					...args: Parameters<typeof proto>
				): ReturnType<typeof proto> {
					if (settings.value.showHiddenFiles) {
						const [key] = args
						if (key === "plugins.file-explorer.msg-bad-dotfile") {
							return ""
						}
					}
					return proto.apply(this, args)
				} as typeof proto
			},
		}))
	}, () => { })
}

function patchFileExplorer(context: ShowHiddenFilesPlugin): void {
	// Affects: renaming in file explorer
	const { app: { workspace }, settings } = context
	workspace.onLayoutReady(() => {
		function patch(): boolean {
			return revealPrivate(context, [workspace], workspace0 => {
				const [leaf] = workspace0.getLeavesOfType("file-explorer")
				if (!leaf) { return false }
				const { view } = leaf
				return revealPrivate(context, [view], view0 => {
					context.register(around(
						Object.getPrototypeOf(view0) as typeof view0,
						{
							finishRename(proto) {
								return async function fn(
									this: typeof view,
									...args: Parameters<typeof proto>
								): Promise<Awaited<ReturnType<typeof proto>>> {
									if (!settings.value.showHiddenFiles) {
										return proto.apply(this, args)
									}
									return revealPrivateAsync(context, [this], async this0 => {
										const { fileBeingRenamed, fileItems } = this0
										if (!fileBeingRenamed) {
											await proto.apply(this, args)
											return
										}
										const { path } = fileBeingRenamed,
											{ [path]: fi } = fileItems
										if (!fi) { throw new Error(path) }
										const { innerEl } = fi,
											filename = innerEl.getText()
										if (!isHiddenPathname(filename)) {
											await proto.apply(this, args)
											return
										}
										const uuid = self.crypto.randomUUID(),
											patch2 = around(fileBeingRenamed, {
												getNewPathAfterRename(proto2) {
													return function fn2(
														this: typeof fileBeingRenamed,
														...args2: Parameters<typeof proto2>
													): ReturnType<typeof proto2> {
														const [filename2] = args2
														if (filename2 === uuid) {
															args2[0] = filename
														}
														return proto2.apply(this, args2)
													}
												},
											})
										try {
											const patch3 = around(innerEl, {
												getText(proto2) {
													return function fn2(
														this: typeof innerEl,
														..._0: Parameters<typeof proto2>
													): ReturnType<typeof proto2> {
														return uuid
													}
												},
											})
											try {
												await proto.apply(this, args)
											} finally {
												patch3()
											}
										} finally {
											patch2()
										}
									}, () => proto.apply(this, args))
								}
							},
						},
					))
					return true
				}, constant(false))
			}, constant(false))
		}
		if (!patch()) {
			const event = workspace.on("layout-change", () => {
				if (patch()) {
					workspace.offref(event)
				}
			})
			context.registerEvent(event)
		}
	})
}

function addCommands(context: ShowHiddenFilesPlugin): void {
	const { language: { value: i18n }, settings } = context
	function onErr(error: unknown): void {
		printError(
			anyToError(error),
			() => i18n.t("errors.error-mutating-settings"),
			context,
		)
	}
	for (const [type, cmd] of deepFreeze([
		[
			"show",
			{
				checkCallback(checking: boolean): boolean {
					const ret = !settings.value.showHiddenFiles
					if (ret && !checking) {
						settings.mutate(set => { set.showHiddenFiles = true })
							.then(async () => settings.write())
							.catch(onErr)
					}
					return ret
				},
			} satisfies MarkOptional<Command, keyof Command>,
		],
		[
			"hide",
			{
				checkCallback(checking: boolean): boolean {
					const ret = settings.value.showHiddenFiles
					if (ret && !checking) {
						settings.mutate(set => { set.showHiddenFiles = false })
							.then(async () => settings.write())
							.catch(onErr)
					}
					return ret
				},
			} satisfies MarkOptional<Command, keyof Command>,
		],
		[
			"toggle",
			{
				callback(): void {
					settings.mutate(set => {
						set.showHiddenFiles = !set.showHiddenFiles
					}).then(async () => settings.write())
						.catch(onErr)
				},
			} satisfies MarkOptional<Command, keyof Command>,
		],
	])) {
		addCommand(context, () => i18n.t(`commands.show-hidden-files-${type}`), {
			...cmd,
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
			const realPath = adapter0.getRealPath(path),
				{ CURRENT, DESKTOP, MOBILE } = Platform
			if (inSet(DESKTOP, CURRENT)) {
				await adapter0.reconcileFileInternal<typeof CURRENT>(
					realPath,
					path,
				)
			} else if (inSet(MOBILE, CURRENT)) {
				const stat = await (async (): Promise<MobileStat | null> => {
					try {
						return await adapter0.fs.stat<typeof CURRENT>(
							adapter0.getFullRealPath(realPath),
						)
					} catch { return null }
				})()
				if (!stat) { return }
				await revealPrivateAsync(context, [stat], async stat0 => {
					const { type } = stat0
					switch (type) {
						case "file":
							adapter0.reconcileFileChanged<typeof CURRENT>(
								realPath,
								path,
								stat,
							)
							break
						case "directory":
							await adapter0.reconcileFolderCreation(realPath, path)
							break
						default:
							throw new Error(type)
					}
				}, () => { })
			} else {
				throw new Error(CURRENT)
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

function isHiddenPath(path: string): boolean {
	return path.split("/").some(isHiddenPathname)
}

function isHiddenPathname(pathname: string): boolean {
	return pathname.startsWith(".")
}
