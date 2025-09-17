export interface MediaAttachmentDTO {
  id: string;
  type: "unknown" | "image" | "gifv" | "video" | "audio";
  url: string;
  preview_url: string;
  remote_url: string;
  meta: Record<string, any>;
  description: string;
  blurhash: string;
}

export class MediaAttachment {
  id: string;
  type: "unknown" | "image" | "gifv" | "video" | "audio";
  url: string;
  previewURL: string;
  remoteURL: string;
  meta: Record<string, any>;
  description: string;
  blurhash: string;

  static fromDTO(dto: MediaAttachmentDTO): MediaAttachment {
    const mediaAttachment = new MediaAttachment();
    mediaAttachment.id = dto.id;
    mediaAttachment.type = dto.type;
    mediaAttachment.url = dto.url;
    mediaAttachment.previewURL = dto.preview_url;
    mediaAttachment.remoteURL = dto.remote_url;
    mediaAttachment.meta = dto.meta;
    mediaAttachment.description = dto.description;
    mediaAttachment.blurhash = dto.blurhash;

    return mediaAttachment;
  }
}
