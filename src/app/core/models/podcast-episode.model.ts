import { BaseItemDTO, BaseItem } from "./base-item.model";

export interface PodcastEpisodeDTO extends BaseItemDTO {
  guid: string;
  pub_date: string;
  media_url: string;
  link: string;
  duration: number;
}

export class PodcastEpisode extends BaseItem {
  guid: string;
  pubDate: string;
  mediaURL: string;
  link: string;
  duration: number;

  static override fromDTO(dto: PodcastEpisodeDTO): PodcastEpisode {
    const episode = new PodcastEpisode();
    super.fillFromDTO(episode, dto);
    episode.guid = dto.guid;
    episode.pubDate = dto.pub_date;
    episode.mediaURL = dto.media_url;
    episode.link = dto.link;
    episode.duration = dto.duration;

    return episode;
  }
}
