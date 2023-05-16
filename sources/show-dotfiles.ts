import stacktraceJs, { type StackFrame } from "stacktrace-js"
import { APP_FILENAME } from "./magic.js"
import type { DeepReadonly } from "ts-essentials"
import type { Plugin } from "obsidian"
import { around } from "monkey-around"
import { aroundIdentityFactory } from "obsidian-plugin-library"
import deepEqual from "deep-equal"

function getSelfFrames(stacktrace: readonly StackFrame[]): number {
	return Math.max(0, stacktrace
		.findIndex(({ fileName }) => fileName?.endsWith(APP_FILENAME)))
}

function isInterceptingStartsWith(data: {
	readonly self: string
	readonly args: DeepReadonly<Parameters<string["startsWith"]>>
	readonly plugin: Plugin
	readonly selfFrames: number
	readonly stacktrace: readonly StackFrame[]
}): boolean {
	const { stacktrace, selfFrames } = data,
		stacktrace0 = stacktrace.slice(selfFrames)
	if (!(stacktrace0[0]?.fileName?.endsWith(APP_FILENAME) ?? false) ||
		stacktrace0.some(({ functionName, fileName }) =>
			(functionName?.endsWith("validateConfigDir") ?? false) &&
			fileName?.endsWith(APP_FILENAME))) { return false }
	return true
}

export function loadShowDotfiles(plugin: Plugin): void {
	const maxErrors = 10,
		mem = new Map<readonly StackFrame[], boolean>()
	let selfFrames = -1 - getSelfFrames(stacktraceJs.getSync({})),
		errors = 0
	plugin.register(around(String.prototype, {
		startsWith(proto) {
			return function fn(
				this: string,
				...args: Parameters<string["startsWith"]>
			): ReturnType<string["startsWith"]> {
				if (selfFrames < 0) {
					try {
						selfFrames += getSelfFrames(stacktraceJs.getSync({}))
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
							plugin,
							self: this,
							selfFrames,
							stacktrace,
						})
						mem.set(stacktrace, intercept)
						self.console.log(...stacktrace)
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
}
