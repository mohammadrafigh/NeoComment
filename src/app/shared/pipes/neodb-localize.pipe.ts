import { inject, Pipe, PipeTransform } from "@angular/core";
import { LocalizedText } from "../../core/models/base-item.model";
import { LanguageService } from "~/app/core/services/language.service";

// Returns a localized text from NeoDB LocalizedTexts
@Pipe({ name: "neoL" })
export class NeoDBLocalizePipe implements PipeTransform {
  languageService = inject(LanguageService);
  appLanguageCode = this.languageService.currentLanguage().code;

  transform(value: LocalizedText[]): string | undefined {
    if (value?.length > 0) {
      // First try to find value in app language
      let transformedValue = value.find(
        (lt) => lt.lang === this.appLanguageCode,
      )?.text;

      // If not found then fallback to English
      if (!transformedValue && (this.appLanguageCode !== "en")) {
        transformedValue = value.find((lt) => lt.lang === "en")?.text;
      }

      return transformedValue;
    }

    return;
  }
}
