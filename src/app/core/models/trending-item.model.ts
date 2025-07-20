export interface LocalizedText {
  lang: string;
  text: string;
}

export interface ExternalResource {
  url: string;
}

export interface TrendingItemDTO {
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

export class TrendingItem {
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

  static fromDTO(dto: TrendingItemDTO): TrendingItem {
    const trendingItem = new TrendingItem();
    trendingItem.type = dto.type;
    trendingItem.title = dto.title;
    trendingItem.description = dto.description;
    trendingItem.localizedTitle = dto.localized_title;
    trendingItem.localizedDescription = dto.localized_description;
    trendingItem.coverImageURL = dto.cover_image_url;
    trendingItem.rating = dto.rating;
    trendingItem.ratingCount = dto.rating_count;
    trendingItem.ratingDistribution = dto.rating_distribution;
    trendingItem.tags = dto.tags;
    trendingItem.id = dto.id;
    trendingItem.uuid = dto.uuid;
    trendingItem.url = dto.url;
    trendingItem.apiURL = dto.api_url;
    trendingItem.category = dto.category;
    trendingItem.parentUUID = dto.parent_uuid;
    trendingItem.displayTitle = dto.display_title;
    trendingItem.externalResources = dto.external_resources;
    return trendingItem;
  }

  static toDTO(trendingItem: TrendingItem): TrendingItemDTO {
    return {
      type: trendingItem.type,
      title: trendingItem.title,
      description: trendingItem.description,
      localized_title: trendingItem.localizedTitle,
      localized_description: trendingItem.localizedDescription,
      cover_image_url: trendingItem.coverImageURL,
      rating: trendingItem.rating,
      rating_count: trendingItem.ratingCount,
      rating_distribution: trendingItem.ratingDistribution,
      tags: trendingItem.tags,
      id: trendingItem.id,
      uuid: trendingItem.uuid,
      url: trendingItem.url,
      api_url: trendingItem.apiURL,
      category: trendingItem.category,
      parent_uuid: trendingItem.parentUUID,
      display_title: trendingItem.displayTitle,
      external_resources: trendingItem.externalResources,
    };
  }
}
