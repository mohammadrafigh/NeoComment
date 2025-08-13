import { BaseItemDTO, BaseItem } from "./base-item.model";

export interface performanceCastCrew {
  name: string;
  role: string;
}

export interface PerformanceDTO extends BaseItemDTO {
  orig_title: string;
  genre: string[];
  language: string[];
  opening_date: string;
  closing_date: string;
  director: string[];
  playwright: string[];
  orig_creator: string[];
  composer: string[];
  choreographer: string[];
  performer: string[];
  actor: performanceCastCrew[];
  crew: performanceCastCrew[];
  official_site: string;
}

export class Performance extends BaseItem {
  origTitle: string;
  genres: string[];
  languages: string[];
  openingDate: string;
  closingDate: string;
  directors: string[];
  playwrights: string[];
  origCreators: string[];
  composers: string[];
  choreographers: string[];
  performers: string[];
  actors: performanceCastCrew[];
  crew: performanceCastCrew[];
  officialSite: string;

  static override fromDTO(dto: PerformanceDTO): Performance {
    const performance = new Performance();
    super.fillFromDTO(performance, dto);
    performance.origTitle = dto.orig_title;
    performance.genres = dto.genre;
    performance.languages = dto.language;
    performance.openingDate = dto.opening_date;
    performance.closingDate = dto.closing_date;
    performance.directors = dto.director;
    performance.playwrights = dto.playwright;
    performance.origCreators = dto.orig_creator;
    performance.composers = dto.composer;
    performance.choreographers = dto.choreographer;
    performance.performers = dto.performer;
    performance.actors = dto.actor;
    performance.crew = dto.crew;
    performance.officialSite = dto.official_site;

    return performance;
  }
}
