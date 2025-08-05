import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TrendingItem, TrendingItemDTO } from "../models/trending-item.model";
import { StateService } from "./state.service";
import {
  TrendingCollection,
  TrendingCollectionDTO,
} from "../models/trending-collection.model";
import { forkJoin, Observable, tap } from "rxjs";
import { Book } from "../models/book.model";

interface TrendingType {
  path: string;
  type: typeof TrendingItem;
  setter: (items: TrendingItem[]) => void;
}

@Injectable({
  providedIn: "root",
})
export class ExploreService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);
  private TRENDING_TYPES: TrendingType[] = [
    {
      path: "book",
      type: Book,
      setter: this.stateService.setTrendingBooks.bind(this.stateService),
    },
    {
      path: "movie",
      type: TrendingItem,
      setter: this.stateService.setTrendingMovies.bind(this.stateService),
    },
    {
      path: "tv",
      type: TrendingItem,
      setter: this.stateService.setTrendingSeries.bind(this.stateService),
    },
    {
      path: "music",
      type: TrendingItem,
      setter: this.stateService.setTrendingMusics.bind(this.stateService),
    },
    {
      path: "game",
      type: TrendingItem,
      setter: this.stateService.setTrendingGames.bind(this.stateService),
    },
    {
      path: "podcast",
      type: TrendingItem,
      setter: this.stateService.setTrendingPodcasts.bind(this.stateService),
    },
  ];

  getAllTrendings() {
    const observables: Observable<any>[] = [];
    for (const trendingType of this.TRENDING_TYPES) {
      observables.push(this.getTrending(trendingType));
    }
    observables.push(this.getTrendingCollections());
    return forkJoin(observables);
  }

  getTrending(trendingType: TrendingType) {
    return this.http
      .get<
        TrendingItemDTO[]
      >(`${this.stateService.instanceURL()}/api/trending/${trendingType.path}`)
      .pipe(
        tap({
          next: (trendingItemsDTO: TrendingItemDTO[]) => {
            const trendingItems = trendingItemsDTO.map((i) =>
              trendingType.type.fromDTO(i),
            );
            trendingType.setter(trendingItems);
          },
          error: (e) => {
            console.error(e);
          },
        }),
      );
  }

  getTrendingCollections() {
    return this.http
      .get<
        TrendingCollectionDTO[]
      >(`${this.stateService.instanceURL()}/api/trending/collection`)
      .pipe(
        tap({
          next: (trendingCollectionsDTO: TrendingCollectionDTO[]) => {
            const trendingCollections = trendingCollectionsDTO.map((c) =>
              TrendingCollection.fromDTO(c),
            );
            this.stateService.setTrendingCollections(trendingCollections);
          },
          error: (e) => {
            console.error(e);
          },
        }),
      );
  }
}
