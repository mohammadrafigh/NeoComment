import { BaseItemDTO, BaseItem } from "../base-item.model";

export interface ReviewDTO {
  url: string;
  api_url: string;
  visibility: number;
  post_id: string;
  item: BaseItemDTO;
  created_time: string;
  title: string;
  body: string;
  html_content: string;
}

export class Review {
  url: string;
  apiURL: string;
  visibility: number;
  postId: string;
  item: BaseItem;
  createdTime: string;
  title: string;
  body: string;
  htmlContent: string;

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

    return review;
  }
}
