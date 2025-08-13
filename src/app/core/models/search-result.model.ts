import { Book, BookDTO } from "./book.model";
import { Movie, MovieDTO } from "./movie.model";
import { Series, SeriesDTO } from "./series.model";
import { Music, MusicDTO } from "./music.model";
import { Podcast, PodcastDTO } from "./podcast.model";
import { Game, GameDTO } from "./game.model";
import { Performance, PerformanceDTO } from "./performance.model";

export interface SearchResultDTO {
  data: Array<BookDTO | MovieDTO | SeriesDTO | MusicDTO | PodcastDTO | GameDTO | PerformanceDTO>;
  pages: number;
  count: number;
}

export class SearchResult {
  data: Array<Book | Movie | Series | Music | Podcast | Game | Performance>;
  pages: number;
  count: number;

  static fromDTO(dto: SearchResultDTO): SearchResult {
    const searchResult = new SearchResult();
    searchResult.data = dto.data.map((item) => {
      switch (item.category) {
        case "book": return Book.fromDTO(item as BookDTO);
        case "movie": return Movie.fromDTO(item as MovieDTO);
        case "tv": return Series.fromDTO(item as SeriesDTO);
        case "game": return Game.fromDTO(item as GameDTO);
        case "music": return Music.fromDTO(item as MusicDTO);
        case "podcast": return Podcast.fromDTO(item as PodcastDTO);
        case "performance": return Performance.fromDTO(item as PerformanceDTO);
      }
    });
    searchResult.pages = dto.pages;
    searchResult.count = dto.count;

    return searchResult;
  }
}
