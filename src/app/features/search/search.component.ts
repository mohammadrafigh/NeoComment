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
import { BookItemComponent } from "../../shared/components/items/book-item/book-item.component";
import { MovieItemComponent } from "../../shared/components/items/movie-item/movie-item.component";
import { SeriesItemComponent } from "../../shared/components/items/series-item/series-item.component";
import { MusicItemComponent } from "../../shared/components/items/music-item/music-item.component";
import { GameItemComponent } from "../../shared/components/items/game-item/game-item.component";
import { PodcastItemComponent } from "../../shared/components/items/podcast-item/podcast-item.component";
import { PerformanceItemComponent } from "../../shared/components/items/performance-item/performance-item.component";
import { StateService } from "~/app/core/services/state.service";
import { CATEGORIES } from "../../shared/constants/categories";

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
  categories = CATEGORIES;

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(take(1)).subscribe((params) => {
      this.query.set(params.query);
      for (const category of this.categories.keys()) {
        this.search(params.query, category, 0);
      }

      SharedTransition.events().once(SharedTransition.finishedEvent, (event: any) => {
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
                newValue.people.accounts = [
                  ...oldValue.people.accounts,
                  ...result.accounts,
                ];
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
                newValue[category].data = [
                  ...oldValue[category].data,
                  ...result.data,
                ];
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

  navigateToItem(event: any) {
    const item = event.item;
    this.router.navigate(
      [this.categories.get(item.category).path + item.uuid],
      {
        transition: SharedTransition.custom(new PageTransition(), {
          pageReturn: {
            duration: 150,
          },
        }),
      } as any,
    );
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

  onTabChange(args: any) {
    const tabView = args.object as TabView;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        category: Array.from(this.categories.keys())[tabView.selectedIndex],
      },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

  keepOrder(a: any, b: any) {
    return 1;
  }
}
