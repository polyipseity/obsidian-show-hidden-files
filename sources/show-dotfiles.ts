import { aroundIdentityFactory, revealPrivate } from "obsidian-plugin-library"
import { identity, zip } from "lodash-es"
import stacktraceJs, { type StackFrame } from "stacktrace-js"
import { APP_FILENAME } from "./magic.js"
import type { DeepReadonly } from "ts-essentials"
import type { ShowDotfilesPlugin } from "./main.js"
import type { Vault } from "obsidian"
import { around } from "monkey-around"
import deepEqual from "deep-equal"

function getSelfFrames(stacktraces: {
	readonly pre: readonly StackFrame[]
	readonly post: readonly StackFrame[]
}): number {
	const { pre, post } = stacktraces,
		zipped = zip(pre, post, stacktraceJs.getSync())
	let overhead = 1 + zipped.findIndex(sfs => !(sfs.every(identity) &&
		sfs.every((sf, idx, arr) => idx < 1 ||
			deepEqual(sf, arr[idx - 1], { strict: true }))))
	if (overhead <= 0) { overhead = zipped.length }
	return overhead + post.length - pre.length
}

function isInterceptingStartsWith(data: {
	readonly self: string
	readonly args: DeepReadonly<Parameters<string["startsWith"]>>
	readonly context: ShowDotfilesPlugin
	readonly exception: boolean
	readonly selfFrames: number
	readonly stacktrace: readonly StackFrame[]
}): boolean {
	const { stacktrace, selfFrames, exception } = data,
		stacktrace0 = stacktrace.slice(selfFrames)
	if (exception ||
		!(stacktrace0[0]?.fileName?.endsWith(APP_FILENAME) ?? false)) {
		return false
	}
	return true
}

export function loadShowDotfiles(context: ShowDotfilesPlugin): void {
	const { app } = context,
		maxErrors = 10,
		mem = new Map<readonly StackFrame[], boolean>(),
		pre = stacktraceJs.getSync({})
	let selfFrames = -1,
		exception = false,
		errors = 0
	context.register(around(String.prototype, {
		startsWith(proto) {
			return function fn(
				this: string,
				...args: Parameters<typeof proto>
			): ReturnType<typeof proto> {
				if (selfFrames < 0) {
					try {
						selfFrames += getSelfFrames({
							post: stacktraceJs.getSync({}),
							pre,
						})
					} catch (error) {
						if (errors++ < maxErrors) {
							self.console.error(error)
						}
					} finally {
						++selfFrames
					}
				}
				const ret = proto.apply(this, args)
				// Check for performance
				if (args[0] === "." && ret) {
					try {
						const stacktrace = stacktraceJs.getSync({})
						for (const [key, intercept] of mem) {
							if (deepEqual(stacktrace, key, { strict: true })) {
								return intercept ? false : ret
							}
						}
						const intercept = isInterceptingStartsWith({
							args,
							context,
							exception,
							self: this,
							selfFrames,
							stacktrace,
						})
						mem.set(stacktrace, intercept)
						self.console.log(intercept, ...stacktrace)
						return intercept ? false : ret
					} catch (error) {
						if (errors++ < maxErrors) {
							self.console.error(error)
						}
					}
				}
				return ret
			}
		},
		toString: aroundIdentityFactory(),
		valueOf: aroundIdentityFactory(),
	}))
	".".startsWith(".")
	revealPrivate(context, [app], app0 => {
		context.register(around(app0.constructor, {
			toString: aroundIdentityFactory(),
			validateConfigDir(proto) {
				return function fn(
					this: Vault,
					...args: Parameters<typeof proto>
				): ReturnType<typeof proto> {
					exception = true
					try {
						return proto.apply(this, args)
					} finally {
						exception = false
					}
				}
			},
		}))
	}, _error => { })
}
