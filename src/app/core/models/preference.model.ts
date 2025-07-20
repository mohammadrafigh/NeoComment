export interface PreferenceDTO {
  default_crosspost: boolean;
  default_visibility: number;
  hidden_categories: string[];
  language: string;
}

export class Preference {
  defaultCrosspost: boolean;
  defaultVisibility: number;
  hiddenCategories: string[];
  language: string;

  static fromDTO(dto: PreferenceDTO): Preference {
    const preference = new Preference();
    preference.defaultCrosspost = dto.default_crosspost;
    preference.defaultVisibility = dto.default_visibility;
    preference.hiddenCategories = dto.hidden_categories;
    preference.language = dto.language;
    return preference;
  }

  static toDTO(preference: Preference): PreferenceDTO {
    return {
      default_crosspost: preference.defaultCrosspost,
      default_visibility: preference.defaultVisibility,
      hidden_categories: preference.hiddenCategories,
      language: preference.language,
    };
  }
}
