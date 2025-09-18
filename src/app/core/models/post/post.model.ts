import { CustomEmoji, CustomEmojiDTO } from "../fediverse/custom-emoji.model";
import { MediaAttachment, MediaAttachmentDTO } from "./media-attachment.model";
import { PostAccount, PostAccountDTO } from "./post-account.model";

export interface MentionedAccount {
  id: string;
  username: string;
  url: string;
  acct: string;
}

export interface PostTag {
  name: string;
  url: string;
}

export interface ExtNeoDBTag {
  href: string;
  name: string;
  type: string;
  image: string;
}

export interface ExtNeoDBRelation {
  id: string;
  href: string;
  type: "Status" | "Rating" | "Comment";
  updated: string;
  published: string;
  attributedTo: string;
  withRegardTo: string;
  status?: string; // for Status
  content?: string; // for Comment
  best?: number; // for Rating
  value?: number; // for Rating
  worst?: number; // for Rating
}

export interface ExtNeoDB {
  tag?: Array<ExtNeoDBTag>;
  relatedWith?: Array<ExtNeoDBRelation>;
}

export interface PostDTO {
  id: string;
  uri: string;
  created_at: string;
  account: PostAccountDTO;
  content: string;
  visibility: "public" | "unlisted" | "private" | "direct";
  sensitive: boolean;
  spoiler_text: string;
  media_attachments: Array<MediaAttachmentDTO>;
  mentions: Array<MentionedAccount>;
  tags: Array<PostTag>;
  emojis: Array<CustomEmojiDTO>;
  reblogs_count: number;
  favourites_count: number;
  replies_count: number;
  url: string;
  in_reply_to_id: string;
  in_reply_to_account_id: string;
  language: string;
  text: string;
  edited_at: string;
  favourited: boolean;
  reblogged: boolean;
  muted: boolean;
  bookmarked: boolean;
  pinned: boolean;
  ext_neodb: ExtNeoDB;
}

export class Post {
  id: string;
  uri: string;
  createdAt: string;
  account: PostAccount;
  content: string;
  visibility: "public" | "unlisted" | "private" | "direct";
  sensitive: boolean;
  spoilerText: string;
  mediaAttachments: Array<MediaAttachment>;
  mentions: Array<MentionedAccount>;
  tags: Array<PostTag>;
  emojis: Array<CustomEmoji>;
  reblogsCount: number;
  favouritesCount: number;
  repliesCount: number;
  url: string;
  inReplyToId: string;
  inReplyToAccountId: string;
  language: string;
  text: string;
  editedAt: string;
  favourited: boolean;
  reblogged: boolean;
  muted: boolean;
  bookmarked: boolean;
  pinned: boolean;
  extNeodb: ExtNeoDB;

  static fromDTO(dto: PostDTO): Post {
    const post = new Post();
    post.id = dto.id;
    post.uri = dto.uri;
    post.createdAt = dto.created_at;
    post.account = PostAccount.fromDTO(dto.account);
    post.content = dto.content;
    post.visibility = dto.visibility;
    post.sensitive = dto.sensitive;
    post.spoilerText = dto.spoiler_text;
    post.mediaAttachments = dto.media_attachments.map(MediaAttachment.fromDTO);
    post.mentions = dto.mentions;
    post.tags = dto.tags;
    post.emojis = dto.emojis.map(CustomEmoji.fromDTO);
    post.reblogsCount = dto.reblogs_count;
    post.favouritesCount = dto.favourites_count;
    post.repliesCount = dto.replies_count;
    post.url = dto.url;
    post.inReplyToId = dto.in_reply_to_id;
    post.inReplyToAccountId = dto.in_reply_to_account_id;
    post.language = dto.language;
    post.text = dto.text;
    post.editedAt = dto.edited_at;
    post.favourited = dto.favourited;
    post.reblogged = dto.reblogged;
    post.muted = dto.muted;
    post.bookmarked = dto.bookmarked;
    post.pinned = dto.pinned;
    post.extNeodb = dto.ext_neodb;

    return post;
  }
}
