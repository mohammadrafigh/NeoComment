import { BaseItemDTO, BaseItem } from "../base-item.model";

export interface NoteDTO {
  uuid: string;
  visibility: number;
  post_id: string;
  item: BaseItemDTO;
  created_time: string;
  title: string;
  content: string;
  sensitive: boolean;
  progress_type: string;
  progress_value: string;
}

export class Note {
  uuid: string;
  visibility: number;
  postId: string;
  item: BaseItem;
  createdTime: string;
  title: string;
  content: string;
  sensitive: boolean;
  progressType: string;
  progressValue: string;

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

    return note;
  }
}
