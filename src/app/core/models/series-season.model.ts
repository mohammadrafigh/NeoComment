import { BaseItemDTO, BaseItem } from "./base-item.model";

export interface SeriesSeasonDTO extends BaseItemDTO {
  orig_title: string;
  director: string[];
  playwright: string[];
  actor: string[];
  genre: string[];
  language: string[];
  area: string[];
  year: number;
  site: string;
  imdb: string;
  season_number: 0;
  episode_count: 0;
  episode_uuids: string[];
}

export class SeriesSeason extends BaseItem {
  origTitle: string;
  directors: string[];
  playwrights: string[];
  actors: string[];
  genres: string[];
  languages: string[];
  areas: string[];
  year: number;
  site: string;
  imdb: string;
  seasonNumber: number;
  episodeCount: number;
  episodeUUIDs: string[];

  static override fromDTO(dto: SeriesSeasonDTO): SeriesSeason {
    const season = new SeriesSeason();
    super.fillFromDTO(season, dto);
    season.origTitle = dto.orig_title;
    season.directors = dto.director;
    season.playwrights = dto.playwright;
    season.actors = dto.actor;
    season.genres = dto.genre;
    season.languages = dto.language;
    season.areas = dto.area;
    season.year = dto.year;
    season.site = dto.site;
    season.imdb = dto.imdb;
    season.seasonNumber = dto.season_number;
    season.episodeCount = dto.episode_count;
    season.episodeUUIDs = dto.episode_uuids ?? [];

    return season;
  }
}
