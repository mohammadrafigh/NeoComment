import { BaseItemDTO, BaseItem } from "../base-item.model";

export interface ReviewDTO {
  /**
   * We don't have it in POST
   */
  url?: string;
  /**
   * We don't have it in POST
   */
  api_url?: string;
  visibility: number;
  /**
   * We don't have it in POST
   */
  post_id?: string;
  /**
   * We don't have it in POST
   */
  item?: BaseItemDTO;
  created_time: string;
  title: string;
  body: string;
  /**
   * We don't have it in POST
   */
  html_content?: string;
  /**
   * We don't have it in GET
   */
  post_to_fediverse?: boolean;
}

export class Review {
  /**
   * We don't have it in POST
   */
  url?: string;
  /**
   * We don't have it in POST
   */
  apiURL?: string;
  visibility: number;
  /**
   * We don't have it in POST
   */
  postId?: string;
  /**
   * We don't have it in POST
   */
  item?: BaseItem;
  createdTime: string;
  title: string;
  body: string;
  /**
   * We don't have it in POST
   */
  htmlContent?: string;
  /**
   * We don't have it in GET
   */
  postToFediverse?: boolean;

  static fromDTO(dto: ReviewDTO): Review {
    const review = new Review();
    review.url = dto.url;
    review.apiURL = dto.api_url;
    review.visibility = dto.visibility;
    review.postId = dto.post_id;
    review.item = BaseItem.fromDTO(dto.item);
    review.createdTime = dto.created_time;
    review.title = dto.title;
    review.body = dto.body;
    review.htmlContent = dto.html_content;
    review.postToFediverse = dto.post_to_fediverse;

    return review;
  }

  /**
   *
   * @param review object to prepare for sending to instance
   * @returns
   */
  static toDTO(review: Review): ReviewDTO {
    return {
      visibility: review.visibility,
      created_time: review.createdTime,
      title: review.title,
      body: review.body,
      post_to_fediverse: review.postToFediverse,
    };
  }
}
