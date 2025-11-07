import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import {
  ThemeMode,
  ThemeName,
  ThemeService,
} from "../../core/services/theme.service";
import { LanguageService } from "../../core/services/language.service";
import { MessageService } from "~/app/core/services/message.service";
import { Location } from "@angular/common";
import { APP_LANGUAGES } from "~/app/shared/constants/app-languages";
import { Dialogs, Utils } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { IconTextButtonComponent } from "~/app/shared/components/icon-text-button/icon-text-button.component";

@Component({
  selector: "ns-preferences",
  templateUrl: "./preferences.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    IconTextButtonComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesComponent implements OnInit {
  private themeService = inject(ThemeService);
  private languageService = inject(LanguageService);
  messageService = inject(MessageService);
  location = inject(Location);
  appLanguages = APP_LANGUAGES;
  selectedTheme = signal<ThemeName>("forest");
  selectedMode = signal<ThemeMode>("system");
  selectedLanguage = signal<string>(null);

  ngOnInit(): void {
    this.selectedTheme.set(this.themeService.theme);
    this.selectedMode.set(this.themeService.mode);
    this.selectedLanguage.set(this.languageService.currentLanguage().name);
  }

  showLanguages() {
    Dialogs.action({
      title: localize("common.language"),
      cancelButtonText: localize("common.cancel"),
      actions: Object.values(this.appLanguages).map((l) => l.name),
      cancelable: true,
    }).then((result) => {
      if (result && result !== localize("common.cancel")) {
        this.selectedLanguage.set(result);
      }
    });
  }

  save() {
    let needsAppRestart = false;
    if (
      this.themeService.theme !== this.selectedTheme() ||
      this.themeService.mode !== this.selectedMode() ||
      this.languageService.currentLanguage().name !== this.selectedLanguage()
    ) {
      needsAppRestart = true;
    }

    if (needsAppRestart) {
      Dialogs.alert({
        message: localize("features.preferences.requires_app_restart"),
        okButtonText: localize("common.ok"),
      }).then(() => {
        this.applySave();
        Utils.android.getCurrentActivity().finish();
      });
    } else {
      this.applySave();
      this.location.back();
    }
  }

  private applySave() {
    this.themeService.applyTheme(this.selectedTheme());
    this.themeService.applyMode(this.selectedMode());

    for (const code in this.appLanguages) {
      if (this.appLanguages[code].name === this.selectedLanguage()) {
        this.languageService.applyLanguage(code);
        break;
      }
    }
  }
}
