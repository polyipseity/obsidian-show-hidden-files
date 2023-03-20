import {
	Functions,
	consumeEvent,
	isNonNullish,
	logError,
	replaceAllRegex,
} from "../utils/util"
import type { ITerminalAddon, Terminal } from "xterm"
import type { CanvasAddon } from "xterm-addon-canvas"
import type { WebglAddon } from "xterm-addon-webgl"
import { writePromise } from "./util"

export class DisposerAddon extends Functions implements ITerminalAddon {
	public constructor(...args: readonly (() => void)[]) {
		super({ async: false, settled: true }, ...args)
	}

	public activate(_terminal: Terminal): void {
		// NOOP
	}

	public dispose(): void {
		this.call()
	}
}

export class DragAndDropAddon implements ITerminalAddon {
	readonly #disposer = new DisposerAddon()

	public constructor(protected readonly element: HTMLElement) { }

	public activate(terminal: Terminal): void {
		const { element } = this,
			drop = (event: DragEvent): void => {
				const data = Array.from(event.dataTransfer?.files ?? [])
					.map(file => file.path)
					.filter(isNonNullish)
					.map(path => path.replace(replaceAllRegex("\""), "\\\""))
					.map(path => path.includes(" ") ? `"${path}"` : path)
					.join(" ")
				if (data) {
					writePromise(terminal, data).catch(logError)
					consumeEvent(event)
				}
			},
			dragover = consumeEvent
		this.#disposer.push(
			() => { element.removeEventListener("dragover", dragover) },
			() => { element.removeEventListener("drop", drop) },
		)
		element.addEventListener("drop", drop)
		element.addEventListener("dragover", dragover)
	}

	public dispose(): void {
		this.#disposer.dispose()
	}
}

export class RendererAddon implements ITerminalAddon {
	public renderer: CanvasAddon | WebglAddon | null = null
	#terminal: Terminal | null = null

	public constructor(
		protected readonly canvasSupplier: () => CanvasAddon,
		protected readonly webglSupplier: () => WebglAddon,
	) { }

	public use(renderer: RendererAddon.RendererOption): void {
		const term = this.#terminal
		if (!term) { return }
		this.renderer?.dispose()
		switch (renderer) {
			case "dom":
				this.renderer = null
				break
			case "canvas":
				try {
					const renderer0 = this.canvasSupplier()
					term.loadAddon(this.renderer = renderer0)
					break
				} catch (error) {
					console.warn(error)
					this.use("dom")
				}
				break
			case "webgl": {
				try {
					const renderer0 = this.webglSupplier(),
						contextLoss = renderer0.onContextLoss(() => {
							try {
								this.use("webgl")
							} finally {
								contextLoss.dispose()
							}
						})
					term.loadAddon(this.renderer = renderer0)
				} catch (error) {
					console.warn(error)
					this.use("canvas")
				}
				break
			}
			// No default
		}
	}

	public activate(terminal: Terminal): void {
		this.#terminal = terminal
	}

	public dispose(): void {
		this.renderer?.dispose()
		this.#terminal = null
	}
}
export namespace RendererAddon {
	export const RENDERER_OPTIONS =
		Object.freeze(["dom", "canvas", "webgl"] as const)
	export type RendererOption = typeof RENDERER_OPTIONS[number]
}
