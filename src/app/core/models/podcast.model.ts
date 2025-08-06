import { TrendingItemDTO, TrendingItem } from "./trending-item.model";

export interface PodcastDTO extends TrendingItemDTO {
  genre: string[];
  host: string[];
  language: string[];
  official_site: string;
}

export class Podcast extends TrendingItem {
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
