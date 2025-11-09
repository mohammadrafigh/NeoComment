import { Book, BookDTO } from "./book.model";
import { Movie, MovieDTO } from "./movie.model";
import { Series, SeriesDTO } from "./series.model";
import { Music, MusicDTO } from "./music.model";
import { Podcast, PodcastDTO } from "./podcast.model";
import { Game, GameDTO } from "./game.model";
import { Performance, PerformanceDTO } from "./performance.model";
import { SeriesSeason, SeriesSeasonDTO } from "./series-season.model";
import { SeriesEpisode, SeriesEpisodeDTO } from "./series-episode.model";

export interface ItemSearchResultDTO {
  data: Array<
    | BookDTO
    | MovieDTO
    | SeriesDTO
    | MusicDTO
    | PodcastDTO
    | GameDTO
    | PerformanceDTO
    | SeriesSeasonDTO
    | SeriesEpisodeDTO
  >;
  pages: number;
  count: number;
}

export class ItemSearchResult {
  data: Array<
    | Book
    | Movie
    | Series
    | Music
    | Podcast
    | Game
    | Performance
    | SeriesSeason
    | SeriesEpisode
  >;
  pages: number;
  count: number;
  currentPage = 1;

  static fromDTO(dto: ItemSearchResultDTO): ItemSearchResult {
    const searchResult = new ItemSearchResult();
    searchResult.data = dto.data.map((item) => {
      switch (item.category) {
        case "book":
          return Book.fromDTO(item as BookDTO);
        case "movie":
          return Movie.fromDTO(item as MovieDTO);
        case "tv": {
          if (item.type === "TVSeason") {
            return SeriesSeason.fromDTO(item as SeriesSeasonDTO);
          } else if (item.type === "TVEpisode") {
            return SeriesEpisode.fromDTO(item as SeriesEpisodeDTO);
          } else {
            return Series.fromDTO(item as SeriesDTO);
          }
        }
        case "game":
          return Game.fromDTO(item as GameDTO);
        case "music":
          return Music.fromDTO(item as MusicDTO);
        case "podcast":
          return Podcast.fromDTO(item as PodcastDTO);
        case "performance":
          return Performance.fromDTO(item as PerformanceDTO);
      }
    });
    searchResult.pages = dto.pages;
    searchResult.count = dto.count;

    return searchResult;
  }
}
