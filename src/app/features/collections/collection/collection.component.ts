import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnDestroy,
  OnInit,
  Signal,
  ViewContainerRef,
  inject,
  signal,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { catchError, finalize, forkJoin, map, of } from "rxjs";
import { localize } from "@nativescript/localize";
import { KiloPipe } from "~/app/shared/pipes/kilo.pipe";
import { IconTextButtonComponent } from "~/app/shared/components/icon-text-button/icon-text-button.component";
import { PageTransition, Screen, SharedTransition } from "@nativescript/core";
import { shareText } from "@nativescript/social-share";
import { StateService } from "~/app/core/services/state.service";
import { MessageService } from "~/app/core/services/message.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import {
  CollectionBaseItem,
  CollectionService,
} from "~/app/core/services/collection.service";
import { Collection } from "~/app/core/models/collection.model";
import { Post } from "~/app/core/models/post/post.model";
import { BookService } from "~/app/core/services/book.service";
import { MovieService } from "~/app/core/services/movie.service";
import { SeriesService } from "~/app/core/services/series.service";
import { MusicService } from "~/app/core/services/music.service";
import { GameService } from "~/app/core/services/game.service";
import { CATEGORIES } from "~/app/shared/constants/categories";
import { BookItemComponent } from "~/app/shared/components/items/book-item/book-item.component";
import { MovieItemComponent } from "~/app/shared/components/items/movie-item/movie-item.component";
import { SeriesItemComponent } from "~/app/shared/components/items/series-item/series-item.component";
import { MusicItemComponent } from "~/app/shared/components/items/music-item/music-item.component";
import { GameItemComponent } from "~/app/shared/components/items/game-item/game-item.component";
import { PodcastItemComponent } from "~/app/shared/components/items/podcast-item/podcast-item.component";
import { PerformanceItemComponent } from "~/app/shared/components/items/performance-item/performance-item.component";
import {
  BottomSheetOptions,
  BottomSheetService,
} from "@nativescript-community/ui-material-bottomsheet/angular";
import { CollectionDetailsComponent } from "./collection-details/collection-details.component";
import { PostsStateService } from "../../posts/posts-state.service";

@Component({
  selector: "ns-collection",
  templateUrl: "./collection.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    BookItemComponent,
    MovieItemComponent,
    SeriesItemComponent,
    MusicItemComponent,
    GameItemComponent,
    PodcastItemComponent,
    PerformanceItemComponent,
    IconTextButtonComponent,
    KiloPipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionComponent implements OnInit, OnDestroy {
  private stateService = inject(StateService);
  private collectionService = inject(CollectionService);
  private bookService = inject(BookService);
  private movieService = inject(MovieService);
  private seriesService = inject(SeriesService);
  private musicService = inject(MusicService);
  private gameService = inject(GameService);
  private messageService = inject(MessageService);
  private bottomSheet = inject(BottomSheetService);
  postStateService = inject(PostsStateService);
  activatedRoute = inject(ActivatedRoute);
  location = inject(Location);
  router = inject(Router);
  containerRef = inject(ViewContainerRef);
  screenWidth = Screen.mainScreen.widthDIPs;
  pageLoading = signal(false);

  collection = signal<Collection>(null);
  collectionPost: Signal<Post>;
  items = signal<CollectionBaseItem[]>([]);
  count = signal(0);
  currentPage = 0;
  maxPages = 1;

  ngOnInit(): void {
    const uuid = this.activatedRoute.snapshot.params.uuid;
    this.getCollectionDetails(uuid);
  }

  getCollectionDetails(uuid: string) {
    this.pageLoading.set(true);

    this.collectionService
      .getCollectionDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (collection) => {
          this.collection.set(collection);
          this.getItems();
          this.postStateService
            .getPostForCollection(collection.postId)
            .add(
              () =>
                (this.collectionPost =
                  this.postStateService.itemPosts[
                    collection.postId
                  ]?.collectionPost.asReadonly()),
            );
        },
        error: (err) =>
          this.messageService.showErrorMessage(
            localize("common.generic_connection_error"),
          ),
      });
  }

  getItems() {
    if (this.currentPage < this.maxPages) {
      this.pageLoading.set(true);

      this.collectionService
        .getCollectionItems(this.collection().uuid, this.currentPage + 1)
        .subscribe({
          next: (res) => {
            this.getItemDetails(res.data)
              .pipe(finalize(() => this.pageLoading.set(false)))
              .subscribe({
                next: (itemDetails) => {
                  itemDetails.forEach(
                    (i) =>
                      (res.data.find(
                        (baseItem) => baseItem.item.uuid === i.uuid,
                      ).item = i),
                  );
                  this.items.update((items) => [...items, ...res.data]);
                  this.count.set(res.count);
                  this.maxPages = res.pages;
                  this.currentPage++;
                },
                error: (e) => console.dir(e),
              });
          },
          error: (e) => {
            this.pageLoading.set(false);
            console.dir(e);
          },
        });
    }
  }

  templateSelector(listItem: CollectionBaseItem) {
    return listItem.item.category;
  }

  getSpanSize(listItem: CollectionBaseItem, index: number) {
    if (listItem.item.category === "book") {
      return 2;
    }
    // TODO: Mohammad 11-10-2025: handle this properly for items less than columns in a row
    return 1;
  }

  private getItemDetails(colItems: CollectionBaseItem[]) {
    const apiCalls = colItems
      .map((ci) => {
        switch (ci.item.category) {
          case "book": {
            return this.bookService
              .getBookDetails(ci.item.uuid)
              .pipe(catchError(() => of(null)));
          }
          case "movie": {
            return this.movieService
              .getMovieDetails(ci.item.uuid)
              .pipe(catchError(() => of(null)));
          }
          case "tv": {
            if (ci.item.type === "TVSeason") {
              this.seriesService
                .getSeasonDetails(ci.item.uuid)
                .pipe(catchError(() => of(null)));
            } else if (ci.item.type === "TVEpisode") {
              this.seriesService
                .getEpisodeDetails(ci.item.uuid)
                .pipe(catchError(() => of(null)));
            } else {
              this.seriesService
                .getSeriesDetails(ci.item.uuid)
                .pipe(catchError(() => of(null)));
            }
          }
          case "game": {
            return this.gameService
              .getGameDetails(ci.item.uuid)
              .pipe(catchError(() => of(null)));
          }
          case "music": {
            return this.musicService
              .getMusicDetails(ci.item.uuid)
              .pipe(catchError(() => of(null)));
          }
          case "podcast": {
            // Just a placeholder for the future
            return;
          }
          case "performance": {
            // Just a placeholder for the future
            return;
          }
        }
      })
      .filter((ac) => ac);

    return forkJoin(apiCalls).pipe(map((results) => results.filter((r) => r)));
  }

  navigateToItem(event: any) {
    const colItem = event.item as CollectionBaseItem;
    const path = CATEGORIES.get(colItem.item.category).path;
    this.router.navigate([path + colItem.item.uuid], {
      transition: SharedTransition.custom(new PageTransition(), {
        pageReturn: {
          duration: 150,
        },
      }),
    } as any);
  }

  navigateToPost() {
    this.router.navigate([`/posts/${this.collection().postId}`], {
      queryParams: { type: "collection" },
    });
  }

  showCollectionDetails() {
    const options: BottomSheetOptions = {
      viewContainerRef: this.containerRef,
      context: { collection: this.collection() },
      dismissOnDraggingDownSheet: false,
      transparent: true,
    };

    this.bottomSheet.show(CollectionDetailsComponent, options).subscribe();
  }

  share() {
    shareText(this.stateService.instanceURL() + this.collection().url);
  }

  ngOnDestroy(): void {
    this.postStateService.loadPreviousItemPosts(this.collection().postId);
  }
}
