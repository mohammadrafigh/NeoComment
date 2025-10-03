import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { StateService } from "../../core/services/state.service";
import { ExploreService } from "../../core/services/explore.service";
import { AuthService } from "../../core/services/auth.service";
import { BookService } from "../../core/services/book.service";
import { MovieService } from "../../core/services/movie.service";
import { SeriesService } from "../../core/services/series.service";
import { MusicService } from "../../core/services/music.service";
import { GameService } from "../../core/services/game.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { BookItemComponent } from "../../shared/components/items/book-item/book-item.component";
import { MovieItemComponent } from "../../shared/components/items/movie-item/movie-item.component";
import { SeriesItemComponent } from "../../shared/components/items/series-item/series-item.component";
import { GameItemComponent } from "../../shared/components/items/game-item/game-item.component";
import { MusicItemComponent } from "../../shared/components/items/music-item/music-item.component";
import { PodcastItemComponent } from "../../shared/components/items/podcast-item/podcast-item.component";
import { CollectionItemComponent } from "../../shared/components/items/collection-item/collection-item.component";
import { finalize } from "rxjs";
import { Router } from "@angular/router";
import { PageTransition, SharedTransition } from "@nativescript/core";
import { Post } from "~/app/core/models/post/post.model";
import { PostService } from "~/app/core/services/post.service";

@Component({
  selector: "ns-explore",
  templateUrl: "./explore.component.html",
  styleUrls: ["./explore.component.css"],
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    BookItemComponent,
    MovieItemComponent,
    SeriesItemComponent,
    GameItemComponent,
    MusicItemComponent,
    PodcastItemComponent,
    CollectionItemComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreComponent implements OnInit {
  stateService = inject(StateService);
  exploreService = inject(ExploreService);
  authService = inject(AuthService);
  bookService = inject(BookService);
  movieService = inject(MovieService);
  seriesService = inject(SeriesService);
  musicService = inject(MusicService);
  gameService = inject(GameService);
  postService = inject(PostService);
  router = inject(Router);
  statusbarSize: number = global.statusbarSize;
  loading = signal(false);
  trendingCategories = [
    "books",
    "movies",
    "series",
    "games",
    "musics",
    "podcasts",
    "collections",
  ];
  collectionPosts = signal<Record<string, Post>>({});

  ngOnInit(): void {
    this.getAllTrendings();
  }

  getAllTrendings() {
    this.loading.set(true);
    this.exploreService
      .getAllTrendings()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        error: () => console.error("Couldn't fetch trendings"),
      });
  }

  templateSelector(category: string) {
    return category;
  }

  onItemLoading(args: any, type: string) {
    switch (type) {
      case "book": {
        const item = this.stateService.trendingBooks()[args.index];
        if (!item?.authors) {
          this.bookService.getTrendingBookDetails(item.uuid);
        }
        break;
      }
      case "movie": {
        const item = this.stateService.trendingMovies()[args.index];
        if (!item?.year) {
          this.movieService.getTrendingMovieDetails(item.uuid);
        }
        break;
      }
      case "series": {
        const item = this.stateService.trendingSeries()[args.index];
        if (!item?.year) {
          this.seriesService.getTrendingSeriesDetails(item.uuid);
        }
        break;
      }
      case "game": {
        const item = this.stateService.trendingGames()[args.index];
        if (!item?.developers) {
          this.gameService.getTrendingGameDetails(item.uuid);
        }
        break;
      }
      case "music": {
        const item = this.stateService.trendingMusics()[args.index];
        if (!item?.artists) {
          this.musicService.getTrendingMusicDetails(item.uuid);
        }
        break;
      }
      case "podcast": {
        // TODO: Mohammad 10-03-2025: Just a placeholder for the future
        break;
      }
      case "collection": {
        const item = this.stateService.trendingCollections()[args.index];
        if (!this.collectionPosts()[item?.uuid]) {
          this.postService.getPost(item.postId).subscribe({
            next: (post) => {
              this.collectionPosts.update((postsDict) => ({
                ...postsDict,
                [item.uuid]: post,
              }));
            },
            error: (err) => console.dir(err),
          });
        }
        break;
      }
    }
  }

  navigateToItem(event: any, path: string) {
    const item = event.item;
    this.router.navigate([`/${path}/` + item.uuid], {
      transition: SharedTransition.custom(new PageTransition(), {
        pageReturn: {
          duration: 150,
        },
      }),
    } as any);
  }

  searchClicked() {
    this.router.navigate(["/search-preview"], {
      transition: SharedTransition.custom(new PageTransition(), {
        pageReturn: {
          duration: 150,
        },
      }),
    } as any);
  }
}
