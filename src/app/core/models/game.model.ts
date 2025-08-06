import { TrendingItemDTO, TrendingItem } from "./trending-item.model";

export interface GameDTO extends TrendingItemDTO {
  genre: string[];
  developer: string[];
  publisher: string[];
  platform: string[];
  release_type: string;
  release_date: string;
  official_site: string;
}

export class Game extends TrendingItem {
  genres: string[];
  developers: string[];
  publishers: string[];
  platforms: string[];
  releaseType: string;
  releaseDate: string;
  officialSite: string;

  static override fromDTO(dto: GameDTO): Game {
    const game = new Game();
    super.fillFromDTO(game, dto);
    game.genres = dto.genre;
    game.developers = dto.developer;
    game.publishers = dto.publisher;
    game.platforms = dto.platform;
    game.releaseType = dto.release_type;
    game.releaseDate = dto.release_date;
    game.officialSite = dto.official_site;

    return game;
  }
}
