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
import { constant, escapeRegExp, isUndefined, noop } from "lodash-es"
import type { MarkOptional } from "ts-essentials"
import type { ShowHiddenFilesPlugin } from "./main.js"
import { around } from "monkey-around"

interface Rule {
	readonly op: "-" | "+"
	readonly value: RegExp
}
type Rules0 = readonly Rule[]
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Rules extends Rules0 { }
namespace Rules {
	export function parse(strs: readonly string[]): Rules {
		return strs.map(str => {
			let op: Rule["op"] = "+",
				rule2 = str
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
						`^${escapeRegExp(normalizePath(rule2))}(?:/|$)`,
						"u",
					),
			}
		})
	}

	export function test(rules: Rules, path: string): boolean {
		let ret = false
		for (const { op, value } of rules) {
			if (op === (ret ? "-" : "+") && value.test(path)) { ret = !ret }
		}
		return ret
	}
}

class ShowingFilter {
	public rules
	public readonly onChanged = new EventEmitterLite<readonly []>()

	public constructor(protected readonly context: ShowHiddenFilesPlugin) {
		const { settings } = context
		this.rules = Rules.parse(settings.value.showingRules)
		context.register(settings.onMutate(
			setting => setting.showHiddenFiles,
			async () => this.onChanged.emit(),
		))
		context.register(settings.onMutate(
			setting => setting.showingRules,
			async cur => {
				this.rules = Rules.parse(cur)
				await this.onChanged.emit()
			},
		))
	}

	public test(path?: string): boolean {
		const { context: { settings }, rules } = this
		return settings.value.showHiddenFiles &&
			(isUndefined(path) || Rules.test(rules, path))
	}
}

export function loadShowHiddenFiles(
	context: ShowHiddenFilesPlugin,
): void {
	const filter = new ShowingFilter(context)
	patchVault(context, filter)
	patchErrorMessage(context, filter)
	patchFileExplorer(context, filter)
	addCommands(context)
}

function patchVault(
	context: ShowHiddenFilesPlugin,
	filter: ShowingFilter,
): void {
	const
		{ app: { vault: { adapter }, workspace } } = context,
		hiddenPaths = new Set<string>()
	async function hideAll(): Promise<void> {
		await Promise.all([...hiddenPaths]
			.map(async path => hideFile(context, path)))
	}
	context.register(hideAll)
	context.register(filter.onChanged.listen(async () =>
		Promise.all([...hiddenPaths].map(async path => filter.test(path)
			? showFile(context, path)
			: hideFile(context, path)))))
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
							if (filter.test(path)) {
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
	}, noop)
	workspace.onLayoutReady(async () =>
		revealPrivateAsync(context, [adapter], async adapter0 =>
			adapter0.listRecursive(""), noop))
}

function patchErrorMessage(
	context: ShowHiddenFilesPlugin,
	filter: ShowingFilter,
): void {
	// Affects: canvas: convert to file, renaming in editor
	revealPrivate(context, [self], self0 => {
		const { i18next } = self0
		context.register(around(i18next, {
			// eslint-disable-next-line id-length
			t(proto) {
				return function fn(
					this: typeof i18next,
					...args: Parameters<typeof proto>
				): ReturnType<typeof proto> {
					if (filter.test()) {
						const [key] = args
						if (key === "plugins.file-explorer.msg-bad-dotfile") {
							return ""
						}
					}
					return proto.apply(this, args)
				} as typeof proto
			},
		}))
	}, noop)
}

function patchFileExplorer(
	context: ShowHiddenFilesPlugin,
	filter: ShowingFilter,
): void {
	// Affects: renaming in file explorer
	const { app: { workspace } } = context
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
									if (!filter.test()) {
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
				}, noop)
			} else {
				throw new Error(CURRENT)
			}
		},
		noop,
	)
}

async function hideFile(context: PluginContext, path: string): Promise<void> {
	await revealPrivateAsync(
		context,
		[context.app.vault.adapter],
		async adapter0 =>
			adapter0.reconcileDeletion(adapter0.getRealPath(path), path),
		noop,
	)
}

function isHiddenPath(path: string): boolean {
	return path.split("/").some(isHiddenPathname)
}

function isHiddenPathname(pathname: string): boolean {
	return pathname.startsWith(".")
}
