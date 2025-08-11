export interface LocalizedText {
  lang: string;
  text: string;
}

export interface ExternalResource {
  url: string;
}

export interface BaseItemDTO {
  type: string;
  title: string;
  description: string;
  localized_title: LocalizedText[];
  localized_description: LocalizedText[];
  cover_image_url: string;
  rating: number;
  rating_count: number;
  rating_distribution: number[];
  tags: string[];
  id: string;
  uuid: string;
  url: string;
  api_url: string;
  category: string;
  parent_uuid: string;
  display_title: string;
  external_resources: ExternalResource[];
}

export class BaseItem {
  type: string;
  title: string;
  description: string;
  localizedTitle: LocalizedText[];
  localizedDescription: LocalizedText[];
  coverImageURL: string;
  rating: number;
  ratingCount: number;
  ratingDistribution: number[];
  tags: string[];
  id: string;
  uuid: string;
  url: string;
  apiURL: string;
  category: string;
  parentUUID: string;
  displayTitle: string;
  externalResources: ExternalResource[];

  protected static fillFromDTO<
    T1 extends BaseItem,
    T2 extends BaseItemDTO,
  >(baseItem: T1, dto: T2): T1 {
    baseItem.type = dto.type;
    baseItem.title = dto.title;
    baseItem.description = dto.description;
    baseItem.localizedTitle = dto.localized_title;
    baseItem.localizedDescription = dto.localized_description;
    baseItem.coverImageURL = dto.cover_image_url;
    baseItem.rating = dto.rating;
    baseItem.ratingCount = dto.rating_count;
    baseItem.ratingDistribution = dto.rating_distribution;
    baseItem.tags = dto.tags;
    baseItem.id = dto.id;
    baseItem.uuid = dto.uuid;
    baseItem.url = dto.url;
    baseItem.apiURL = dto.api_url;
    baseItem.category = dto.category;
    baseItem.parentUUID = dto.parent_uuid;
    baseItem.displayTitle = dto.display_title;
    baseItem.externalResources = dto.external_resources;

    return baseItem;
  }

  static fromDTO(dto: BaseItemDTO): BaseItem {
    return this.fillFromDTO(new BaseItem(), dto);
  }
}
