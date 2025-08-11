import { BaseItemDTO, BaseItem } from "./base-item.model";

export interface MusicDTO extends BaseItemDTO {
  genre: string[];
  artist: string[];
  company: string[];
  duration: number;
  release_date: string;
  track_list: string;
  barcode: string;
}

export class Music extends BaseItem {
  genres: string[];
  artists: string[];
  companies: string[];
  duration: number;
  releaseDate: string;
  trackList: string;
  barcode: string;

  static override fromDTO(dto: MusicDTO): Music {
    const music = new Music();
    super.fillFromDTO(music, dto);
    music.genres = dto.genre;
    music.artists = dto.artist;
    music.companies = dto.company;
    music.duration = dto.duration;
    music.releaseDate = dto.release_date;
    music.trackList = dto.track_list;
    music.barcode = dto.barcode;

    return music;
  }
}
