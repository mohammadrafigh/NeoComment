import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BaseItem, BaseItemDTO } from "../models/base-item.model";
import { StateService } from "./state.service";
import { Collection, CollectionDTO } from "../models/collection.model";
import { forkJoin, map, Observable, tap } from "rxjs";
import { Book } from "../models/book.model";
import { Movie } from "../models/movie.model";
import { Series } from "../models/series.model";
import { Music } from "../models/music.model";
import { Game } from "../models/game.model";
import { Podcast } from "../models/podcast.model";
import JSONbig from "json-bigint";

interface TrendingType {
  path: string;
  type: typeof BaseItem;
  setter: (items: BaseItem[]) => void;
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
      type: Movie,
      setter: this.stateService.setTrendingMovies.bind(this.stateService),
    },
    {
      path: "tv",
      type: Series,
      setter: this.stateService.setTrendingSeries.bind(this.stateService),
    },
    {
      path: "music",
      type: Music,
      setter: this.stateService.setTrendingMusics.bind(this.stateService),
    },
    {
      path: "game",
      type: Game,
      setter: this.stateService.setTrendingGames.bind(this.stateService),
    },
    {
      path: "podcast",
      type: Podcast,
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
        BaseItemDTO[]
      >(`${this.stateService.instanceURL()}/api/trending/${trendingType.path}`)
      .pipe(
        tap({
          next: (trendingItemsDTO: BaseItemDTO[]) => {
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
    return (
      this.http
        .get<CollectionDTO[]>(
          `${this.stateService.instanceURL()}/api/trending/collection`,
          // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
          { responseType: "text" as "json" },
        )
        // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
        .pipe(
          map(JSONbig({ storeAsString: true, useNativeBigInt: true }).parse),
        )
        .pipe(
          tap({
            next: (trendingCollectionsDTO: CollectionDTO[]) => {
              const trendingCollections = trendingCollectionsDTO.map((c) =>
                Collection.fromDTO(c),
              );
              this.stateService.setTrendingCollections(trendingCollections);
            },
            error: (e) => {
              console.error(e);
            },
          }),
        )
    );
  }
}
