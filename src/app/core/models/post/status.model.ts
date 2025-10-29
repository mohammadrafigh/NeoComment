import { Post } from "./post.model";

export interface StatusDTO {
  status: string;
  media_ids: string[];
  poll: {
    options: string[];
    expires_in: number;
    multiple: boolean;
    hide_totals: boolean;
  };
  in_reply_to_id: string;
  sensitive: boolean;
  spoiler_text: string;
  visibility: "public" | "unlisted" | "private" | "direct";
  language: string; // ISO 639-1 language code
  scheduled_at: string;
  quoted_status_id: string;
  quote_approval_policy: string;
}

// Used to send replies using Mastodon API
export class Status {
  id?: string;
  status: string;
  mediaIds: string[];
  poll: {
    options: string[];
    expiresIn: number;
    multiple: boolean;
    hideTotals: boolean;
  };
  inReplyToId: string;
  sensitive: boolean;
  spoilerText: string;
  visibility: number;
  language: string; // ISO 639-1 language code
  scheduledAt: string;
  quotedStatusId: string;
  quoteApprovalPolicy: string;

  static fromDTO(dto: StatusDTO): Status {
    const status = new Status();
    status.status = dto.status;
    status.mediaIds = dto.media_ids;
    status.poll = {
      options: dto.poll?.options,
      expiresIn: dto.poll?.expires_in,
      multiple: dto.poll?.multiple,
      hideTotals: dto.poll?.hide_totals,
    };
    status.inReplyToId = dto.in_reply_to_id;
    status.sensitive = dto.sensitive;
    status.spoilerText = dto.spoiler_text;
    switch (dto.visibility) {
      case "direct": {
        status.visibility = 2;
        break;
      }
      case "private": {
        status.visibility = 1;
        break;
      }
      default: {
        status.visibility = 0;
      }
    }
    status.language = dto.language;
    status.scheduledAt = dto.scheduled_at;
    status.quotedStatusId = dto.quoted_status_id;
    status.quoteApprovalPolicy = dto.quote_approval_policy;

    return status;
  }

  /**
   *
   * @param status object to prepare for sending to instance
   * @returns
   */
  static toDTO(status: Status): StatusDTO {
    let visibility: "public" | "unlisted" | "private" | "direct";
    switch (status.visibility) {
      case 2: {
        visibility = "direct";
        break;
      }
      case 1: {
        visibility = "private";
        break;
      }
      default: {
        visibility = "public";
      }
    }

    let poll;
    if (status.poll) {
      poll = {
        options: status.poll.options,
        expires_in: status.poll.expiresIn,
        multiple: status.poll.multiple,
        hide_totals: status.poll.hideTotals,
      };
    }

    return {
      status: status.status,
      media_ids: status.mediaIds?.length > 0 ? status.mediaIds : undefined,
      poll: poll,
      in_reply_to_id: status.inReplyToId,
      sensitive: status.sensitive ?? undefined,
      spoiler_text: status.spoilerText,
      visibility: visibility,
      language: status.language,
      scheduled_at: status.scheduledAt,
      quoted_status_id: status.quotedStatusId,
      quote_approval_policy: status.quoteApprovalPolicy,
    };
  }

  static fromPost(post: Post): Status {
    const status = new Status();
    status.id = post.id;
    status.status = post.extNeodb.relatedWith.find(
      (r) => r.type === "Comment",
    ).content;
    status.mediaIds = post.mediaAttachments.map((m) => m.id);
    // status.poll - It seems it's not supported by NeoDB right now
    status.inReplyToId = post.inReplyToId;
    status.sensitive = post.sensitive;
    status.spoilerText = post.spoilerText;
    switch (post.visibility) {
      case "direct": {
        status.visibility = 2;
        break;
      }
      case "private": {
        status.visibility = 1;
        break;
      }
      default: {
        status.visibility = 0;
      }
    }
    status.language = post.language;
    // status.scheduledAt - It seems it's not supported by NeoDB right now
    // status.quotedStatusId - It seems it's not supported by NeoDB right now
    // status.quoteApprovalPolicy - It seems it's not supported by NeoDB right now

    return status;
  }
}
