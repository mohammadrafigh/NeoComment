import { Preference } from "./preference.model";
import { User } from "./user.model";
import { TrendingItem } from "./trending-item.model";
import { TrendingCollection } from "./trending-collection.model";

export class State {
  id: string; // Same as sessionId
  instanceURL: string;
  user: User;
  preference: Preference;
  trendingBooks: TrendingItem[];
  trendingMovies: TrendingItem[];
  trendingSeries: TrendingItem[];
  trendingMusics: TrendingItem[];
  trendingGames: TrendingItem[];
  trendingPodcasts: TrendingItem[];
  trendingCollections: TrendingCollection[];
}
