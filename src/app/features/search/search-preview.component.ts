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
import { debounceTime, finalize, Subject, Subscription, take } from "rxjs";
import { MessageService } from "~/app/core/services/message.service";
import { StateService } from "~/app/core/services/state.service";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { KiloPipe } from "~/app/shared/pipes/kilo.pipe";
import { FediSearchResult } from "~/app/core/models/fediverse/fedi-search-result.model";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { localize } from "@nativescript/localize";
import { SEARCH_CATEGORIES } from "../../shared/constants/search-categories";

@Component({
  selector: "ns-search-preview",
  templateUrl: "./search-preview.component.html",
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
export class SearchPreviewComponent implements OnInit, OnDestroy {
  @ViewChild("searchInput") searchInput: ElementRef;
  page = inject(Page);
  searchService = inject(SearchService);
  messageService = inject(MessageService);
  stateService = inject(StateService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  statusbarSize: number = global.statusbarSize;
  searchQuery: string = null;
  loading = signal(false);
  searchTrigger = new Subject<string>();
  searchSubscription: Subscription;
  itemSearchResult = signal<ItemSearchResult | null>(null);
  fediSearchResult = signal<FediSearchResult | null>(null);
  categories = SEARCH_CATEGORIES;
  urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\/?#].*)?$/i;

  constructor() {
    this.page.actionBarHidden = true;

    this.searchSubscription = this.searchTrigger
      .pipe(debounceTime(500))
      .subscribe((query) => this.search(query));
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams
      .pipe(take(1))
      .subscribe((params) => (this.searchQuery = params.query));

    SharedTransition.events().once(SharedTransition.finishedEvent, (event: any) => {
      if (event.data.action === "present") {
        this.searchInput.nativeElement.focus();
      }
    });
  }

  onQueryChange(args: any) {
    if (args.value?.length > 2) {
      this.searchTrigger.next(args.value);
    } else {
      this.itemSearchResult.set(null);
      this.fediSearchResult.set(null);
    }
  }

  search(query: string) {
    this.loading.set(true);

    const errorHandler = (e) => {
      console.dir(e);
      this.messageService.showErrorMessage(localize("common.generic_error"));
    };

    if (this.urlRegex.test(query)) {
      // TODO: Mohammad 08-14-2025: Not implemented yet
    } else {
      this.searchService
        .searchThroughItems(query)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (result) => {
            result.data = result.data.slice(0, 5);
            this.itemSearchResult.set(result);
          },
          error: (e) => errorHandler,
        });

      this.searchService
        .searchThroughFediverse(query, "accounts")
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (result) => this.fediSearchResult.set(result),
          error: (e) => errorHandler,
        });
    }
  }

  showAllResults(category?: string) {
    this.router.navigate(["/search"], {
      replaceUrl: true,
      queryParams: {
        category: category ?? "book",
        query: this.searchQuery,
      },
      transition: SharedTransition.custom(new PageTransition(), {
        pageReturn: {
          duration: 150,
        },
      }),
    } as any);
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

  keepOrder(a: any, b: any) {
    return 1;
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }
}
