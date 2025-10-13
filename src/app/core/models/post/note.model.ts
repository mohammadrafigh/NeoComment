import { BaseItemDTO, BaseItem } from "../base-item.model";

export interface NoteDTO {
  /**
   * We don't have it in POST and PUT
   */
  uuid?: string;
  visibility: number;
  /**
   * We don't have it in POST and PUT
   */
  post_id?: string;
  /**
   * We don't have it in POST and PUT
   */
  item?: BaseItemDTO;
  /**
   * We don't have it in POST and PUT
   */
  created_time?: string;
  title: string;
  content: string;
  sensitive: boolean;
  progress_type: "page" | "chapter" | "part" | "episode" | "track" | "cycle" | "timestamp" | "percentage";
  progress_value: string;
  /**
   * We don't have it in GET
   */
  post_to_fediverse?: boolean;
}

export class Note {
  /**
   * We don't have it in POST and PUT
   */
  uuid?: string;
  visibility: number;
  /**
   * We don't have it in POST and PUT
   */
  postId?: string;
  /**
   * We don't have it in POST and PUT
   */
  item?: BaseItem;
  /**
   * We don't have it in POST and PUT
   */
  createdTime?: string;
  title: string;
  content: string;
  sensitive: boolean;
  progressType: "page" | "chapter" | "part" | "episode" | "track" | "cycle" | "timestamp" | "percentage";
  progressValue: string;
  /**
   * We don't have it in GET
   */
  postToFediverse?: boolean;

  static fromDTO(dto: NoteDTO): Note {
    const note = new Note();
    note.uuid = dto.uuid;
    note.visibility = dto.visibility;
    note.postId = dto.post_id;
    note.item = BaseItem.fromDTO(dto.item);
    note.createdTime = dto.created_time;
    note.title = dto.title;
    note.content = dto.content;
    note.sensitive = dto.sensitive;
    note.progressType = dto.progress_type;
    note.progressValue = dto.progress_value;
    note.postToFediverse = dto.post_to_fediverse;

    return note;
  }

  /**
   *
   * @param note object to prepare for sending to instance
   * @returns
   */
  static toDTO(note: Note): NoteDTO {
    return {
      title: note.title,
      content: note.content,
      sensitive: note.sensitive,
      progress_type:
        note.progressType && note.progressType.length > 0
          ? note.progressType
          : null,
      progress_value:
        note.progressValue && note.progressValue.length > 0
          ? note.progressValue
          : null,
      visibility: note.visibility,
      post_to_fediverse: note.postToFediverse,
    };
  }
}
