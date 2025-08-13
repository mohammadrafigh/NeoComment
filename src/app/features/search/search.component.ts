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
import { SearchResult } from "../../core/models/search-result.model";
import { SearchService } from "../../core/services/search.service";
import { debounceTime, finalize, Subject, Subscription } from "rxjs";
import { MessageService } from "~/app/core/services/message.service";

@Component({
  selector: "ns-search",
  templateUrl: "./search.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild("searchInput") searchInput: ElementRef;
  page = inject(Page);
  searchService = inject(SearchService);
  messageService = inject(MessageService);
  statusbarSize: number = global.statusbarSize;
  searchQuery: string = null;
  loading = signal(false);
  searchTrigger = new Subject<string>();
  searchSubscription: Subscription;
  searchResult = signal<SearchResult | null>(null);

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
      this.searchResult.set(null);
    }
  }

  search(query: string) {
    this.loading.set(true);

    this.searchService
      .getSearchDetails(query)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => this.searchResult.set(result),
        error: (e) => {
          console.dir(e);
          this.messageService.showErrorMessage("Something went wrong");
        },
      });
  }

  showAllResults() {
    this.search(this.searchQuery);
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }
}
