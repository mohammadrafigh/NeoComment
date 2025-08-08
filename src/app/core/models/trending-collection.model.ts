export interface TrendingCollectionDTO {
  uuid: string;
  url: string;
  visibility: number;
  post_id: number;
  created_time: string;
  title: string;
  brief: string;
  cover_image_url: string;
  html_content: string;
  is_dynamic: boolean;
}

export class TrendingCollection {
  uuid: string;
  url: string;
  visibility: number;
  postId: number;
  createdTime: string;
  title: string;
  brief: string;
  coverImageURL: string;
  htmlContent: string;
  isDynamic: boolean;

  static fromDTO(dto: TrendingCollectionDTO): TrendingCollection {
    const trendingCollection = new TrendingCollection();
    trendingCollection.uuid = dto.uuid;
    trendingCollection.url = dto.url;
    trendingCollection.visibility = dto.visibility;
    trendingCollection.postId = dto.post_id;
    trendingCollection.createdTime = dto.created_time;
    trendingCollection.title = dto.title;
    trendingCollection.brief = dto.brief;
    trendingCollection.coverImageURL = dto.cover_image_url;
    trendingCollection.htmlContent = dto.html_content;
    trendingCollection.isDynamic = dto.is_dynamic;
    return trendingCollection;
  }

  static toDTO(trendingCollection: TrendingCollection): TrendingCollectionDTO {
    return {
      uuid: trendingCollection.uuid,
      url: trendingCollection.url,
      visibility: trendingCollection.visibility,
      post_id: trendingCollection.postId,
      created_time: trendingCollection.createdTime,
      title: trendingCollection.title,
      brief: trendingCollection.brief,
      cover_image_url: trendingCollection.coverImageURL,
      html_content: trendingCollection.htmlContent,
      is_dynamic: trendingCollection.isDynamic,
    };
  }
}
