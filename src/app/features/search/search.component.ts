import {
  Component,
  ElementRef,
  NO_ERRORS_SCHEMA,
  OnDestroy,
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
import { Page, PageTransition, SharedTransition } from "@nativescript/core";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { ItemSearchResult } from "../../core/models/item-search-result.model";
import { SearchService } from "../../core/services/search.service";
import { finalize, Subscription } from "rxjs";
import { MessageService } from "~/app/core/services/message.service";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { KiloPipe } from "~/app/shared/pipes/kilo.pipe";
import { FediSearchResult } from "~/app/core/models/fediverse/fedi-search-result.model";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { localize } from "@nativescript/localize";

@Component({
  selector: "ns-search",
  templateUrl: "./search.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    NeoDBLocalizePipe,
    KiloPipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild("searchInput") searchInput: ElementRef;
  page = inject(Page);
  searchService = inject(SearchService);
  messageService = inject(MessageService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  statusbarSize: number = global.statusbarSize;
  activatedRouteSubscription: Subscription;
  loading = signal(false);
  itemSearchResult = signal<ItemSearchResult | null>(null);
  fediSearchResult = signal<FediSearchResult | null>(null);
  selectedCategory = signal(null);
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

  constructor() {
    this.page.actionBarHidden = true;
  }

  ngOnInit(): void {
    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (params) => {
        this.selectedCategory.set(params.category);
        this.search(params.query, params.category, 0);
      },
    );
  }

  searchClicked() {
    this.router.navigate(["/search-preview"], {
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

    if (this.selectedCategory() === "people") {
      this.searchService
        .searchThroughFediverse(query, "accounts", page, 10)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (result) => this.fediSearchResult.set(result),
          error: (e) => {
            console.dir(e);
            this.messageService.showErrorMessage(
              localize("common.generic_error"),
            );
          },
        });
    } else {
      this.searchService
        .searchThroughItems(query, category, page)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (result) => this.itemSearchResult.set(result),
          error: (e) => {
            console.dir(e);
            this.messageService.showErrorMessage(
              localize("common.generic_error"),
            );
          },
        });
    }
  }

  keepOrder(a: any, b: any) {
    return 1;
  }

  ngOnDestroy(): void {
    this.activatedRouteSubscription.unsubscribe();
  }
}
