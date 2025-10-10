import { BaseItemDTO, BaseItem } from "../base-item.model";

export interface ShelfMarkDTO {
  shelf_type: "wishlist" | "progress" | "complete" | "dropped";
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
  comment_text: string;
  rating_grade: number;
  tags: string[];
  /**
   * We don't have it in GET
   */
  post_to_fediverse?: boolean;
}

export class ShelfMark {
  shelfType: "wishlist" | "progress" | "complete" | "dropped";
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
  commentText: string;
  ratingGrade: number;
  tags: string[];
  /**
   * We don't have it in GET
   */
  postToFediverse?: boolean;

  static fromDTO(dto: ShelfMarkDTO): ShelfMark {
    const shelfMark = new ShelfMark();
    shelfMark.shelfType = dto.shelf_type;
    shelfMark.visibility = dto.visibility;
    shelfMark.postId = dto.post_id;
    shelfMark.item = BaseItem.fromDTO(dto.item);
    shelfMark.createdTime = dto.created_time;
    shelfMark.commentText = dto.comment_text;
    shelfMark.ratingGrade = dto.rating_grade;
    shelfMark.tags = dto.tags;
    shelfMark.postToFediverse = dto.post_to_fediverse;

    return shelfMark;
  }

  /**
   *
   * @param shelfMark object to prepare for sending to instance
   * @returns
   */
  static toDTO(shelfMark: ShelfMark): ShelfMarkDTO {
    return {
      shelf_type: shelfMark.shelfType,
      visibility: shelfMark.visibility,
      created_time: shelfMark.createdTime,
      comment_text: shelfMark.commentText,
      rating_grade: shelfMark.ratingGrade,
      tags: shelfMark.tags,
      post_to_fediverse: shelfMark.postToFediverse,
    };
  }
}
