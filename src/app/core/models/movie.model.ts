import { BaseItemDTO, BaseItem } from "./base-item.model";

export interface MovieDTO extends BaseItemDTO {
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
}

export class Movie extends BaseItem {
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

  static override fromDTO(dto: MovieDTO): Movie {
    const movie = new Movie();
    super.fillFromDTO(movie, dto);
    movie.origTitle = dto.orig_title;
    movie.directors = dto.director;
    movie.playwrights = dto.playwright;
    movie.actors = dto.actor;
    movie.genres = dto.genre;
    movie.languages = dto.language;
    movie.areas = dto.area;
    movie.year = dto.year;
    movie.site = dto.site;
    movie.duration = dto.duration;
    movie.imdb = dto.imdb;

    return movie;
  }
}
