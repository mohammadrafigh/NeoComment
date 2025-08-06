import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
  inject,
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
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { BookItemComponent } from "./book-item/book-item.component";
import { MovieItemComponent } from "./movie-item/movie-item.component";
import { SeriesItemComponent } from "./series-item/series-item.component";
import { GameItemComponent } from "./game-item/game-item.component";
import { MusicItemComponent } from "./music-item/music-item.component";
import { PodcastItemComponent } from "./podcast-item/podcast-item.component";
import { CollectionItemComponent } from "./collection-item/collection-item.component";
import { ItemEventData } from "@nativescript/core";

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
  loading = false;
  searchInput: string = null;
  trendingCategories = [
    "books",
    "movies",
    "series",
    "games",
    "musics",
    "podcasts",
    "collections",
  ];

  ngOnInit(): void {
    this.getAllTrendings();
  }

  getAllTrendings() {
    this.loading = true;
    this.exploreService.getAllTrendings().subscribe({
      error: () => console.error("Couldn't fetch trendings"),
      complete: () => (this.loading = false),
    });
  }

  templateSelector(category: string) {
    return category;
  }

  onItemLoading(args: ItemEventData, type: string) {
    switch (type) {
      case "book": {
        const item = this.stateService.trendingBooks()[args.index];
        if (!item?.authors) {
          this.bookService.getBookDetails(item.uuid);
        }
        break;
      }
      case "movie": {
        const item = this.stateService.trendingMovies()[args.index];
        if (!item?.year) {
          this.movieService.getMovieDetails(item.uuid);
        }
        break;
      }
      case "series": {
        const item = this.stateService.trendingSeries()[args.index];
        break;
      }
      case "game": {
        const item = this.stateService.trendingGames()[args.index];
        break;
      }
      case "music": {
        const item = this.stateService.trendingMusics()[args.index];
        break;
      }
      case "podcast": {
        const item = this.stateService.trendingPodcasts()[args.index];
        break;
      }
      case "collection": {
        const item = this.stateService.trendingCollections()[args.index];
        break;
      }
    }
  }

  search() {
    // TODO: Mohammad 08-05-2025: Implement it
  }
}
