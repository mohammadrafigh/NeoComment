import { Pipe, PipeTransform } from "@angular/core";
import { LocalizedText } from "../../core/models/trending-item.model";

// Returns a localized text from NeoDB LocalizedTexts
@Pipe({ name: "neoL" })
export class NeoDBLocalizePipe implements PipeTransform {
  transform(value: LocalizedText[], targetLanguage: string): string | undefined {
    if (value?.length > 0) {
      return value.find((lt) => lt.lang === targetLanguage)?.text;
    }

    return;
  }
}
