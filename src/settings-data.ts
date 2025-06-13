import {
	type Fixed,
	NOTICE_NO_TIMEOUT,
	NULL_SEM_VER_STRING,
	PluginContext,
	type SemVerString,
	cloneAsWritable,
	deepFreeze,
	fixArray,
	fixInSet,
	fixTyped,
	launderUnchecked,
	markFixed,
	opaqueOrDefault,
	semVerString,
} from "@polyipseity/obsidian-plugin-library"
import type { MarkOptional } from "ts-essentials"
import { PluginLocales } from "../assets/locales.js"

export interface LocalSettings extends PluginContext.LocalSettings {
	readonly lastReadChangelogVersion: SemVerString
}
export namespace LocalSettings {
	export function fix(self0: unknown): Fixed<LocalSettings> {
		const unc = launderUnchecked<LocalSettings>(self0)
		return markFixed(self0, {
			...PluginContext.LocalSettings.fix(self0).value,
			lastReadChangelogVersion: opaqueOrDefault(
				semVerString,
				String(unc.lastReadChangelogVersion),
				NULL_SEM_VER_STRING,
			),
		})
	}
}

export interface Settings extends PluginContext.Settings {
	readonly language: Settings.DefaultableLanguage
	readonly showHiddenFiles: boolean
	readonly showConfigurationFolder: boolean
	readonly showingRules: readonly string[]

	readonly openChangelogOnUpdate: boolean
}
export namespace Settings {
	export const optionals = deepFreeze([]) satisfies readonly (keyof Settings)[]
	export type Optionals = typeof optionals[number]
	export type Persistent = Omit<Settings, Optionals>
	export function persistent(settings: Settings): Persistent {
		const ret: MarkOptional<Settings, Optionals> = cloneAsWritable(settings)
		for (const optional of optionals) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete ret[optional]
		}
		return ret
	}

	export const DEFAULT: Persistent = deepFreeze({
		errorNoticeTimeout: NOTICE_NO_TIMEOUT,
		language: "",
		noticeTimeout: 5,
		openChangelogOnUpdate: true,
		showConfigurationFolder: true,
		showHiddenFiles: true,
		showingRules: [
			"+/",
			"-/\\.git(?:\\/|$)/u",
			"-/\\.venv(?:\\/|$)/u",
		],
	})

	export const DEFAULTABLE_LANGUAGES =
		deepFreeze(["", ...PluginLocales.LANGUAGES])
	export type DefaultableLanguage = typeof DEFAULTABLE_LANGUAGES[number]
	export function fix(self0: unknown): Fixed<Settings> {
		const unc = launderUnchecked<Settings>(self0)
		return markFixed(self0, {
			...PluginContext.Settings.fix(self0).value,
			errorNoticeTimeout: fixTyped(
				DEFAULT,
				unc,
				"errorNoticeTimeout",
				["number"],
			),
			language: fixInSet(
				DEFAULT,
				unc,
				"language",
				DEFAULTABLE_LANGUAGES,
			),
			noticeTimeout: fixTyped(
				DEFAULT,
				unc,
				"noticeTimeout",
				["number"],
			),
			openChangelogOnUpdate: fixTyped(
				DEFAULT,
				unc,
				"openChangelogOnUpdate",
				["boolean"],
			),
			showConfigurationFolder: fixTyped(
				DEFAULT,
				unc,
				"showConfigurationFolder",
				["boolean"],
			),
			showHiddenFiles: fixTyped(
				DEFAULT,
				unc,
				"showHiddenFiles",
				["boolean"],
			),
			showingRules: fixArray(
				DEFAULT,
				unc,
				"showingRules",
				["string"],
			),
		})
	}
}
