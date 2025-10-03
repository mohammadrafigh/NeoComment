export interface CollectionDTO {
  uuid: string;
  url: string;
  visibility: number;
  post_id: string;
  created_time: string;
  title: string;
  brief: string;
  cover_image_url: string;
  html_content: string;
  is_dynamic: boolean;
}

export class Collection {
  uuid: string;
  url: string;
  visibility: number;
  postId: string;
  createdTime: string;
  title: string;
  brief: string;
  coverImageURL: string;
  htmlContent: string;
  isDynamic: boolean;

  static fromDTO(dto: CollectionDTO): Collection {
    const collection = new Collection();
    collection.uuid = dto.uuid;
    collection.url = dto.url;
    collection.visibility = dto.visibility;
    collection.postId = dto.post_id;
    collection.createdTime = dto.created_time;
    collection.title = dto.title;
    collection.brief = dto.brief;
    collection.coverImageURL = dto.cover_image_url;
    collection.htmlContent = dto.html_content;
    collection.isDynamic = dto.is_dynamic;
    return collection;
  }

  static toDTO(collection: Collection): CollectionDTO {
    return {
      uuid: collection.uuid,
      url: collection.url,
      visibility: collection.visibility,
      post_id: collection.postId,
      created_time: collection.createdTime,
      title: collection.title,
      brief: collection.brief,
      cover_image_url: collection.coverImageURL,
      html_content: collection.htmlContent,
      is_dynamic: collection.isDynamic,
    };
  }
}
