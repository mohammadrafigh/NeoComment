import { BaseItemDTO, BaseItem } from "./base-item.model";

export interface SeriesEpisodeDTO extends BaseItemDTO {
  episode_number: 0;
}

export class SeriesEpisode extends BaseItem {
  episodeNumber: number;

  static override fromDTO(dto: SeriesEpisodeDTO): SeriesEpisode {
    const episode = new SeriesEpisode();
    super.fillFromDTO(episode, dto);
    episode.episodeNumber = dto.episode_number;

    return episode;
  }
}
