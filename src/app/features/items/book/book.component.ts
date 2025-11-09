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
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { CollectionItemComponent } from "../../../shared/components/items/collection-item/collection-item.component";
import { finalize } from "rxjs";
import { localize } from "@nativescript/localize";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { KiloPipe } from "~/app/shared/pipes/kilo.pipe";
import { RateIndicatorComponent } from "~/app/shared/components/rate-indicator/rate-indicator.component";
import { IconTextButtonComponent } from "~/app/shared/components/icon-text-button/icon-text-button.component";
import { ExternalResourcesComponent } from "~/app/shared/components/external-resources/external-resources.component";
import { BaseItemPageComponent } from "../base-item-page.component";
import {
  BookService,
  BookSiblingsResponse,
} from "~/app/core/services/book.service";
import { Book } from "~/app/core/models/book.model";
import { PageTransition, SharedTransition } from "@nativescript/core";
import { BookItemComponent } from "~/app/shared/components/items/book-item/book-item.component";
import { FeedbackSectionComponent } from "../feedback-section/feedback-section.component";

@Component({
  selector: "ns-book",
  templateUrl: "./book.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    RateIndicatorComponent,
    IconTextButtonComponent,
    CollectionItemComponent,
    ExternalResourcesComponent,
    NeoDBLocalizePipe,
    KiloPipe,
    BookItemComponent,
    FeedbackSectionComponent,
  ],
  providers: [NeoDBLocalizePipe],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookComponent extends BaseItemPageComponent implements OnInit {
  bookService = inject(BookService);
  item = signal<Book>(null);
  siblingEditions = signal<BookSiblingsResponse>(null);
  currentSiblingsPage = 0;

  ngOnInit(): void {
    super.ngOnInit();
  }

  getItemDetails(uuid: string) {
    this.pageLoading.set(true);
    this.bookService
      .getBookDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (book) => {
          this.item.set(book);
          this.getSiblings();
        },
        error: (err) =>
          this.messageService.showErrorMessage(
            localize("common.generic_connection_error"),
          ),
      });
  }

  getSiblings() {
    if (this.currentSiblingsPage === this.siblingEditions()?.pages) {
      return;
    }

    this.bookService
      .getBookSiblings(this.item().uuid, this.currentSiblingsPage + 1)
      .subscribe({
        next: (res) => {
          this.currentSiblingsPage++;
          if (this.currentSiblingsPage === 1) {
            this.siblingEditions.set(res);
          } else {
            this.siblingEditions.update((se) => ({
              ...se,
              data: [...se.data, ...res.data],
            }));
          }
        },
        error: (err) => console.dir(err),
      });
  }

  navigateToSibling(event: any) {
    const item = event.item;
    this.router.navigate([`/books/` + item.uuid], {
      transition: SharedTransition.custom(new PageTransition(), {
        pageReturn: {
          duration: 150,
        },
      }),
    } as any);
  }
}
