import { type App, Plugin, type PluginManifest } from "obsidian"
import {
	LanguageManager,
	type PluginContext,
	SettingsManager,
	StatusBarHider,
	createI18n,
	semVerString,
} from "@polyipseity/obsidian-plugin-library"
import { PluginLocales } from "../assets/locales.js"
import { Settings } from "./settings-data.js"
import { isNil } from "lodash-es"
import { loadDocumentations } from "./documentations.js"
import { loadIcons } from "./icons.js"
import { loadSettings } from "./settings.js"
import { loadShowDotfiles } from "./show-dotfiles.js"

export class ShowDotfilesPlugin
	extends Plugin
	implements PluginContext<Settings> {
	public readonly version
	public readonly settings: SettingsManager<Settings>
	public readonly language: LanguageManager
	public readonly statusBarHider = new StatusBarHider(this)

	public constructor(app: App, manifest: PluginManifest) {
		super(app, manifest)
		try {
			this.version = semVerString(manifest.version)
		} catch (error) {
			self.console.warn(error)
			this.version = null
		}
		this.settings = new SettingsManager(
			this,
			Settings.fix(Settings.DEFAULT).value,
			Settings.fix,
		)
		this.language = new LanguageManager(
			this,
			async () => createI18n(
				PluginLocales.RESOURCES,
				PluginLocales.FORMATTERS,
				{
					defaultNS: PluginLocales.DEFAULT_NAMESPACE,
					fallbackLng: PluginLocales.FALLBACK_LANGUAGES,
					returnNull: PluginLocales.RETURN_NULL,
				},
			),
		)
	}

	public displayName(unlocalized = false): string {
		return unlocalized
			? this.language.i18n.t("name", {
				interpolation: { escapeValue: false },
				lng: PluginLocales.DEFAULT_LANGUAGE,
			})
			: this.language.i18n.t("name")
	}

	public override onload(): void {
		super.onload()
		const { language, settings } = this;
		(async (): Promise<void> => {
			try {
				const [loaded] =
					await Promise.all([settings.onLoaded, language.onLoaded])
				await Promise.all([
					Promise.resolve().then(() => { loadIcons(this) }),
					(async (): Promise<void> => {
						const docs = loadDocumentations(this, isNil(loaded))
						loadSettings(this, docs)
					})(),
					loadShowDotfiles(this),
				])
			} catch (error) {
				self.console.error(error)
			}
		})()
	}
}
// Needed for loading
export default ShowDotfilesPlugin
