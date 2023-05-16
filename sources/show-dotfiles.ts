import { aroundIdentityFactory, revealPrivate } from "obsidian-plugin-library"
import { identity, zip } from "lodash-es"
import stacktraceJs, { type StackFrame } from "stacktrace-js"
import { APP_FILENAME } from "./magic.js"
import type { DeepReadonly } from "ts-essentials"
import type { ShowDotfilesPlugin } from "./main.js"
import type { Vault } from "obsidian"
import { around } from "monkey-around"
import deepEqual from "deep-equal"

function getOverhead(): number {
	const
		sts = zip(
			stacktraceJs.getSync({}),
			((): stacktraceJs.StackFrame[] => stacktraceJs.getSync({}))(),
		),
		overhead = sts.findIndex(sfs => !(sfs.every(identity) &&
			sfs.every((sf, idx, arr) => idx < 1 ||
				deepEqual(sf, arr[idx - 1], { strict: true }))))
	if (overhead === -1) { return sts.length }
	return overhead + 1
}

function isInterceptingStartsWith(data: {
	readonly self: string
	readonly args: DeepReadonly<Parameters<string["startsWith"]>>
	readonly context: ShowDotfilesPlugin
	readonly exception: boolean
	readonly stacktrace: readonly StackFrame[]
	readonly overhead: number
}): boolean {
	const { stacktrace, overhead, exception } = data,
		stacktrace0 = stacktrace.slice(overhead)
	if (exception ||
		!(stacktrace0[0]?.fileName?.endsWith(APP_FILENAME) ?? false)) {
		return false
	}
	return true
}

export function loadShowDotfiles(context: ShowDotfilesPlugin): void {
	const { app: { vault } } = context,
		maxErrors = 10,
		mem = new Map<readonly StackFrame[], boolean>(),
		overhead = getOverhead()
	let baseSt: readonly StackFrame[] | null = null,
		dynamicOverhead = 0,
		exception = false,
		errors = 0
	context.register(around(String.prototype, {
		startsWith(proto) {
			return function fn(
				this: string,
				...args: Parameters<typeof proto>
			): ReturnType<typeof proto> {
				const ret = proto.apply(this, args)
				// Check for performance
				if (args[0] === "." && ret) {
					try {
						const stacktrace = stacktraceJs.getSync({})
						if (baseSt) {
							const top = stacktrace.at(-1),

								/*
								 * Can only handle slightly truncated stacktraces, making some
								 * room for extra patches on `string#startsWith`.
								 */
								offset = Math.max(0, top
									? [...baseSt].reverse()
										.findIndex(sf => deepEqual(sf, top, { strict: true }))
									: -1)
							dynamicOverhead = offset + stacktrace.length - baseSt.length
							return ret
						}
						for (const [key, intercept] of mem) {
							if (deepEqual(stacktrace, key, { strict: true })) {
								return intercept ? false : ret
							}
						}
						baseSt = stacktrace
						try {
							".".startsWith(".")
							const intercept = isInterceptingStartsWith({
								args,
								context,
								exception,
								overhead: overhead + dynamicOverhead,
								self: this,
								stacktrace,
							})
							mem.set(stacktrace, intercept)
							self.console.log(intercept, ...stacktrace)
							return intercept ? false : ret
						} finally {
							baseSt = null
						}
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
	revealPrivate(context, [vault], vault0 => {
		context.register(around(vault0.constructor, {
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
