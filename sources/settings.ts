import {
	AdvancedSettingTab,
	closeSetting,
	linkSetting,
	registerSettingsCommands,
	resetButton,
} from "@polyipseity/obsidian-plugin-library"
import { Settings } from "./settings-data.js"
import type { ShowHiddenFilesPlugin } from "./main.js"
import type { loadDocumentations } from "./documentations.js"
import semverLt from "semver/functions/lt.js"

export class SettingTab extends AdvancedSettingTab<Settings> {
	public constructor(
		protected override readonly context: ShowHiddenFilesPlugin,
		protected readonly docs: loadDocumentations.Loaded,
	) { super(context) }

	protected override onLoad(): void {
		super.onLoad()
		const {
			containerEl,
			context: { language: { value: i18n }, settings, version },
			docs,
			ui,
		} = this
		this.newDescriptionWidget()
		this.newLanguageWidget(
			Settings.DEFAULTABLE_LANGUAGES,
			language => language
				? i18n.t(`language:${language}`)
				: i18n.t("settings.language-default"),
			Settings.DEFAULT,
		)
		ui.newSetting(containerEl, setting => {
			setting
				.setName(i18n.t("settings.documentation"))
				.addButton(button => button
					.setIcon(i18n.t("asset:settings.documentations.donate-icon"))
					.setTooltip(i18n.t("settings.documentations.donate"))
					.setCta()
					.onClick(() => { docs.open("donate") }))
				.addButton(button => button
					.setIcon(i18n.t("asset:settings.documentations.readme-icon"))
					.setTooltip(i18n.t("settings.documentations.readme"))
					.setCta()
					.onClick(() => {
						docs.open("readme")
						closeSetting(containerEl)
					}))
				.addButton(button => {
					button
						.setIcon(i18n.t("asset:settings.documentations.changelog-icon"))
						.setTooltip(i18n.t("settings.documentations.changelog"))
						.onClick(() => {
							docs.open("changelog")
							closeSetting(containerEl)
						})
					if (version === null ||
						semverLt(settings.value.lastReadChangelogVersion, version)) {
						button.setCta()
					}
				})
		})
		this.newAllSettingsWidget(
			Settings.DEFAULT,
			Settings.fix,
		)
		this.newSectionWidget(() => i18n.t("settings.interface"))
		ui.newSetting(containerEl, setting => {
			setting
				.setName(i18n.t("settings.open-changelog-on-update"))
				.addToggle(linkSetting(
					() => settings.value.openChangelogOnUpdate,
					async value => settings.mutate(settingsM => {
						settingsM.openChangelogOnUpdate = value
					}),
					() => { this.postMutate() },
				))
				.addExtraButton(resetButton(
					i18n.t("asset:settings.open-changelog-on-update-icon"),
					i18n.t("settings.reset"),
					async () => settings.mutate(settingsM => {
						settingsM.openChangelogOnUpdate =
							Settings.DEFAULT.openChangelogOnUpdate
					}),
					() => { this.postMutate() },
				))
		}).newSetting(containerEl, setting => {
			setting
				.setName(i18n.t("settings.show-hidden-files"))
				.setDesc(i18n.t("settings.show-hidden-files-description"))
				.addToggle(linkSetting(
					() => settings.value.showHiddenFiles,
					async value => settings.mutate(settingsM => {
						settingsM.showHiddenFiles = value
					}),
					() => { this.postMutate() },
				))
				.addExtraButton(resetButton(
					i18n.t("asset:settings.show-hidden-files-icon"),
					i18n.t("settings.reset"),
					async () => settings.mutate(settingsM => {
						settingsM.showHiddenFiles = Settings.DEFAULT.showHiddenFiles
					}),
					() => { this.postMutate() },
				))
		})
		this.newNoticeTimeoutWidget(Settings.DEFAULT)
	}

	protected override snapshot0(): Partial<Settings> {
		return Settings.persistent(this.context.settings.value)
	}
}

export function loadSettings(
	context: ShowHiddenFilesPlugin,
	docs: loadDocumentations.Loaded,
): void {
	context.addSettingTab(new SettingTab(context, docs))
	registerSettingsCommands(context)
}
