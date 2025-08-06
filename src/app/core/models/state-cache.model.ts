import { Preference } from "./preference.model";
import { User } from "./user.model";
import { TrendingItem } from "./trending-item.model";
import { TrendingCollection } from "./trending-collection.model";
import { Book } from "./book.model";
import { Movie } from "./movie.model";
import { Series } from "./series.model";
import { Game } from "./game.model";

export class StateCache {
  id: string; // Same as sessionId
  instanceURL: string;
  user: User;
  preference: Preference;
  trendingBooks: Book[];
  trendingMovies: Movie[];
  trendingSeries: Series[];
  trendingGames: Game[];
  trendingMusics: TrendingItem[];
  trendingPodcasts: TrendingItem[];
  trendingCollections: TrendingCollection[];
}
