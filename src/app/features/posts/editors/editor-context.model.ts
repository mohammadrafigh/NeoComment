import { Note } from "~/app/core/models/post/note.model";
import { Post } from "~/app/core/models/post/post.model";
import { Review } from "~/app/core/models/post/review.model";
import { ShelfMark } from "~/app/core/models/post/shelf-mark.model";
import { Status } from "~/app/core/models/post/status.model";

export interface EditorContext {
  itemUUID: string;
  itemTitle: string;
  itemCategory: string;
  shelfMark?: ShelfMark;
  review?: Review;
  note?: Note;
}

export interface ReplyEditorContext {
  replyingPost: Post;
  status?: Status;
}
