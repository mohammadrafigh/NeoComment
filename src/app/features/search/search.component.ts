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
import { Page, SharedTransition } from "@nativescript/core";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { ItemSearchResult } from "../../core/models/item-search-result.model";
import { SearchService } from "../../core/services/search.service";
import { debounceTime, finalize, Subject, Subscription } from "rxjs";
import { MessageService } from "~/app/core/services/message.service";
import { StateService } from "~/app/core/services/state.service";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { KiloPipe } from "~/app/shared/pipes/kilo.pipe";
import { FediSearchResult } from "~/app/core/models/fediverse/fedi-search-result.model";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";

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
  stateService = inject(StateService);
  statusbarSize: number = global.statusbarSize;
  searchQuery: string = null;
  loading = signal(false);
  searchTrigger = new Subject<string>();
  searchSubscription: Subscription;
  itemSearchResult = signal<ItemSearchResult | null>(null);
  fediSearchResult = signal<FediSearchResult | null>(null);
  selectedCategory = signal(null);
  categories = new Map([
    ["book", { icon: "\u{eff2}", title: "Books" }],
    ["movie", { icon: "\u{eafa}", title: "Movies" }],
    ["tv", { icon: "\u{ea8d}", title: "Series" }],
    ["music", { icon: "\u{eafc}", title: "Musics" }],
    ["podcast", { icon: "\u{f1e9}", title: "Podcasts" }],
    ["game", { icon: "\u{eb63}", title: "Games" }],
    ["performance", { icon: "\u{f263}", title: "Performances" }],
  ]);
  urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\/?#].*)?$/i;

  constructor() {
    this.page.actionBarHidden = true;

    this.searchSubscription = this.searchTrigger
      .pipe(debounceTime(500))
      .subscribe((query) => this.search(query));
  }

  ngOnInit(): void {
    SharedTransition.events().on(SharedTransition.finishedEvent, (event) => {
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

  search(query: string, category?: string) {
    this.loading.set(true);

    if (this.urlRegex.test(query)) {
      // TODO: Mohammad 08-14-2025: Not implemented yet
    } else {
      this.searchService
        .searchThroughItems(query)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (result) => this.itemSearchResult.set(result),
          error: (e) => {
            console.dir(e);
            this.messageService.showErrorMessage("Something went wrong");
          },
        });

      this.searchService
        .searchThroughFediverse(query, "accounts")
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (result) => this.fediSearchResult.set(result),
          error: (e) => {
            console.dir(e);
            this.messageService.showErrorMessage("Something went wrong");
          },
        });
    }
  }

  showAllResults(category?: string) {
    this.selectedCategory.set(category ?? "book");
    this.search(this.searchQuery, category ?? "book");
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }
}
