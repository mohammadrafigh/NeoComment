import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TrendingItem, TrendingItemDTO } from "../models/trending-item.model";
import { StateService } from "./state.service";
import { State } from "../models/state.model";
import {
  TrendingCollection,
  TrendingCollectionDTO,
} from "../models/trending-collection.model";

interface TrendingType {
  path: string;
  stateName: string;
}

@Injectable({
  providedIn: "root",
})
export class ExploreService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);
  private TRENDING_TYPES: TrendingType[] = [
    { path: "book", stateName: "trendingBooks" },
    { path: "movie", stateName: "trendingMovies" },
    { path: "tv", stateName: "trendingSeries" },
    { path: "music", stateName: "trendingMusics" },
    { path: "game", stateName: "trendingGames" },
    { path: "podcast", stateName: "trendingPodcasts" },
  ];

  getAllTrendings() {
    for (const trendingType of this.TRENDING_TYPES) {
      this.getTrending(trendingType);
    }
    this.getTrendingCollections();
  }

  getTrending(trendingType: TrendingType) {
    this.http
      .get<TrendingItemDTO[]>(
        `${this.stateService.instanceURL()}/api/trending/${trendingType.path}`
      )
      .subscribe({
        next: (trendingItemsDTO: TrendingItemDTO[]) => {
          const trendingItems = trendingItemsDTO.map((i) =>
            TrendingItem.fromDTO(i)
          );
          const state: Partial<State> = {};
          state[trendingType.stateName] = trendingItems;
          this.stateService.updateState(state);
        },
        error: (e) => {
          console.error(e);
        },
      });
  }

  getTrendingCollections() {
    this.http
      .get<TrendingCollectionDTO[]>(
        `${this.stateService.instanceURL()}/api/trending/collection`
      )
      .subscribe({
        next: (trendingCollectionsDTO: TrendingCollectionDTO[]) => {
          const trendingCollections = trendingCollectionsDTO.map((c) =>
            TrendingCollection.fromDTO(c)
          );
          this.stateService.updateState({ trendingCollections });
        },
        error: (e) => {
          console.error(e);
        },
      });
  }
}
