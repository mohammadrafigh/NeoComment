import { Preference } from "./preference.model";
import { User } from "./user.model";
import { Collection } from "./collection.model";
import { Book } from "./book.model";
import { Movie } from "./movie.model";
import { Series } from "./series.model";
import { Game } from "./game.model";
import { Music } from "./music.model";
import { Podcast } from "./podcast.model";

export class StateCache {
  id: string; // Same as sessionId
  instanceURL: string;
  user: User;
  preference: Preference;
  trendingBooks: Book[];
  trendingMovies: Movie[];
  trendingSeries: Series[];
  trendingGames: Game[];
  trendingMusics: Music[];
  trendingPodcasts: Podcast[];
  trendingCollections: Collection[];
}
