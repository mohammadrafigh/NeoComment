export interface CustomEmojiDTO {
  shortcode: string;
  url: string;
  static_url: string;
  visible_in_picker: boolean;
  category: string;
}

export class CustomEmoji {
  shortcode: string;
  url: string;
  staticURL: string;
  visibleInPicker: boolean;
  category: string;

  static fromDTO(dto: CustomEmojiDTO): CustomEmoji {
    const customEmoji = new CustomEmoji();
    customEmoji.shortcode = dto.shortcode;
    customEmoji.url = dto.url;
    customEmoji.staticURL = dto.static_url;
    customEmoji.visibleInPicker = dto.visible_in_picker;
    customEmoji.category = dto.category;

    return customEmoji;
  }
}
