import { Injectable, signal } from "@angular/core";
import { ApplicationSettings, Device } from "@nativescript/core";
import { overrideLocale } from "@nativescript/localize";
import { APP_LANGUAGES } from "~/app/shared/constants/app-languages";

@Injectable({ providedIn: "root" })
export class LanguageService {
  private readonly LANGUAGE_STORAGE_KEY = "__app__language__";
  // It's just a state object to be used inside app
  // Localize plugin handles the actual language storage and load
  private _currentLanguage = signal<(typeof APP_LANGUAGES)[string]>(
    APP_LANGUAGES["English (English)"],
  );
  currentLanguage = this._currentLanguage.asReadonly();

  constructor() {
    // Sync the state with the language loaded by Localize plugin
    const code = ApplicationSettings.getString(this.LANGUAGE_STORAGE_KEY);

    if (code && APP_LANGUAGES[code]) {
      this._currentLanguage.set(APP_LANGUAGES[code]);
    } else {
      const systemLangCode = Device.language.split("-")[0];
      if (APP_LANGUAGES[systemLangCode]) {
        this._currentLanguage.set(APP_LANGUAGES[systemLangCode]);
      }
    }
  }

  applyLanguage(languageCode: string) {
    const localeOverriddenSuccessfully = overrideLocale(languageCode);
    if (localeOverriddenSuccessfully) {
      this._currentLanguage.set(APP_LANGUAGES[languageCode]);
    }
  }
}
