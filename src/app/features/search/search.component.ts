import {
  Component,
  ElementRef,
  NO_ERRORS_SCHEMA,
  OnInit,
  ViewChild,
  inject,
  signal,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import {
  PageTransition,
  Screen,
  SharedTransition,
  TabView,
} from "@nativescript/core";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { ItemSearchResult } from "../../core/models/item-search-result.model";
import { SearchService } from "../../core/services/search.service";
import { finalize, take } from "rxjs";
import { MessageService } from "~/app/core/services/message.service";
import { FediSearchResult } from "~/app/core/models/fediverse/fedi-search-result.model";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { localize } from "@nativescript/localize";
import { BookItemComponent } from "../../shared/items/book-item/book-item.component";
import { MovieItemComponent } from "../../shared/items/movie-item/movie-item.component";
import { SeriesItemComponent } from "../../shared/items/series-item/series-item.component";
import { MusicItemComponent } from "../../shared/items/music-item/music-item.component";
import { GameItemComponent } from "../../shared/items/game-item/game-item.component";
import { PodcastItemComponent } from "../../shared/items/podcast-item/podcast-item.component";
import { PerformanceItemComponent } from "../../shared/items/performance-item/performance-item.component";
import { StateService } from "~/app/core/services/state.service";

@Component({
  selector: "ns-search",
  templateUrl: "./search.component.html",
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
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SearchComponent implements OnInit {
  @ViewChild("tabs") tabs: ElementRef;
  router = inject(Router);
  searchService = inject(SearchService);
  messageService = inject(MessageService);
  activatedRoute = inject(ActivatedRoute);
  stateService = inject(StateService);
  statusbarSize: number = global.statusbarSize;
  screenWidth = Screen.mainScreen.widthDIPs;
  loading = signal(false);
  itemSearchResults = signal<{
    book?: ItemSearchResult;
    movie?: ItemSearchResult;
    tv?: ItemSearchResult;
    music?: ItemSearchResult;
    game?: ItemSearchResult;
    podcast?: ItemSearchResult;
    performance?: ItemSearchResult;
    people?: FediSearchResult;
  }>({});
  query = signal<string>(null);
  categories = new Map([
    ["book", { icon: "\u{eff2}", title: localize("common.books") }],
    ["movie", { icon: "\u{eafa}", title: localize("common.movies") }],
    ["tv", { icon: "\u{ea8d}", title: localize("common.series") }],
    ["game", { icon: "\u{eb63}", title: localize("common.games") }],
    ["music", { icon: "\u{eafc}", title: localize("common.musics") }],
    ["podcast", { icon: "\u{f1e9}", title: localize("common.podcasts") }],
    [
      "performance",
      { icon: "\u{f263}", title: localize("common.performances") },
    ],
    ["people", { icon: "\u{eb4d}", title: localize("common.people") }],
  ]);

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(take(1)).subscribe((params) => {
      this.query.set(params.query);
      for (const category of this.categories.keys()) {
        this.search(params.query, category, 0);
      }

      SharedTransition.events().on(SharedTransition.finishedEvent, (event) => {
        if (event.data.action === "present") {
          (this.tabs.nativeElement as TabView).selectedIndex = Array.from(
            this.categories.keys(),
          ).indexOf(params.category);
        }
      });
    });
  }

  searchClicked() {
    this.router.navigate(["/search-preview"], {
      queryParams: { query: this.query() },
      replaceUrl: true,
      transition: SharedTransition.custom(new PageTransition(), {
        pageReturn: {
          duration: 150,
        },
      }),
    } as any);
  }

  search(query: string, category: string, page: number) {
    this.loading.set(true);

    const errorHandler = (e) => {
      console.dir(e);
      this.messageService.showErrorMessage(localize("common.generic_error"));
    };

    if (category === "people") {
      this.searchService
        .searchThroughFediverse(query, "accounts", page, 10)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (result) => {
            this.itemSearchResults.update((oldValue) => {
              const newValue = { ...oldValue };
              if (!oldValue.people) {
                newValue.people = result;
                return newValue;
              } else {
                newValue.people.accounts = [...oldValue.people.accounts, ...result.accounts];
                newValue.people.currentPage = page;
                return newValue;
              }
            });
          },
          error: errorHandler,
        });
    } else {
      this.searchService
        .searchThroughItems(query, category, page)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (result) => {
            this.itemSearchResults.update((oldValue) => {
              const newValue = { ...oldValue };
              if (!oldValue[category]) {
                newValue[category] = result;
                return newValue;
              } else {
                newValue[category].data = [...oldValue[category].data, ...result.data];
                newValue[category].currentPage = page;
                return newValue;
              }
            });
          },
          error: errorHandler,
        });
    }
  }

  templateSelector(item: any) {
    return item.category;
  }

  loadMore(category: string) {
    if (
      !this.itemSearchResults()[category] ||
      (category === "people" &&
        this.itemSearchResults().people.accounts.length >= 50) ||
      (category !== "people" &&
        this.itemSearchResults()[category].data.length ===
          this.itemSearchResults()[category].count)
    ) {
      // End of the list
      return;
    }

    this.search(
      this.query(),
      category,
      this.itemSearchResults()[category].currentPage + 1,
    );
  }

  keepOrder(a: any, b: any) {
    return 1;
  }
}
