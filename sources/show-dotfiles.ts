import stacktraceJs, { type StackFrame } from "stacktrace-js"
import type { DeepReadonly } from "ts-essentials"
import type { Plugin } from "obsidian"
import { around } from "monkey-around"
import { aroundIdentityFactory } from "obsidian-plugin-library"
import deepEqual from "deep-equal"

function isInterceptingStartsWith(data: {
	readonly self: string
	readonly args: DeepReadonly<Parameters<string["startsWith"]>>
	readonly plugin: Plugin
	readonly stacktrace: readonly StackFrame[]
}): boolean {
	const { plugin: { manifest: { id } }, stacktrace } = data,
		stacktrace0 = stacktrace.filter(st => st.getFileName() !== `plugin:${id}`)
	if (stacktrace0.some(sf => sf.getFileName().startsWith("plugin:"))) {
		return false
	}
	return true
}

export function loadShowDotfiles(plugin: Plugin): void {
	const maxErrors = 10,
		mem = new Map<readonly StackFrame[], boolean>()
	let errors = 0
	plugin.register(around(String.prototype, {
		startsWith(proto) {
			return function fn(
				this: string,
				...args: Parameters<string["startsWith"]>
			): ReturnType<string["startsWith"]> {
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
}
