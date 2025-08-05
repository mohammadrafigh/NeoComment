import { Preference } from "./preference.model";
import { User } from "./user.model";
import { TrendingItem } from "./trending-item.model";
import { TrendingCollection } from "./trending-collection.model";
import { Book } from "./book.model";

export class StateCache {
  id: string; // Same as sessionId
  instanceURL: string;
  user: User;
  preference: Preference;
  trendingBooks: Book[];
  trendingMovies: TrendingItem[];
  trendingSeries: TrendingItem[];
  trendingMusics: TrendingItem[];
  trendingGames: TrendingItem[];
  trendingPodcasts: TrendingItem[];
  trendingCollections: TrendingCollection[];
}
