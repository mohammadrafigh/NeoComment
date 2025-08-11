import { BaseItemDTO, BaseItem } from "./base-item.model";

export interface PodcastDTO extends BaseItemDTO {
  genre: string[];
  host: string[];
  language: string[];
  official_site: string;
}

export class Podcast extends BaseItem {
  genres: string[];
  hosts: string[];
  languages: string[];
  officialSite: string;

  static override fromDTO(dto: PodcastDTO): Podcast {
    const podcast = new Podcast();
    super.fillFromDTO(podcast, dto);
    podcast.genres = dto.genre;
    podcast.hosts = dto.host;
    podcast.languages = dto.language;
    podcast.officialSite = dto.official_site;

    return podcast;
  }
}
