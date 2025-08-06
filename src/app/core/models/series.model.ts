import { TrendingItemDTO, TrendingItem } from "./trending-item.model";

export interface SeriesDTO extends TrendingItemDTO {
  orig_title: string;
  director: string[];
  playwright: string[];
  actor: string[];
  genre: string[];
  language: string[];
  area: string[];
  year: number;
  site: string;
  duration: string;
  imdb: string;
  season_count: 0;
  episode_count: 0;
  season_uuids: string[];
}

export class Series extends TrendingItem {
  origTitle: string;
  directors: string[];
  playwrights: string[];
  actors: string[];
  genres: string[];
  languages: string[];
  areas: string[];
  year: number;
  site: string;
  duration: string;
  imdb: string;
  seasonCount: number;
  episodeCount: number;
  seasonUUIDs: string[];

  static override fromDTO(dto: SeriesDTO): Series {
    const series = new Series();
    super.fillFromDTO(series, dto);
    series.origTitle = dto.orig_title;
    series.directors = dto.director;
    series.playwrights = dto.playwright;
    series.actors = dto.actor;
    series.genres = dto.genre;
    series.languages = dto.language;
    series.areas = dto.area;
    series.year = dto.year;
    series.site = dto.site;
    series.duration = dto.duration;
    series.imdb = dto.imdb;
    series.seasonCount = dto.season_count;
    series.episodeCount = dto.episode_count;
    series.seasonUUIDs = dto.season_uuids;

    return series;
  }
}
