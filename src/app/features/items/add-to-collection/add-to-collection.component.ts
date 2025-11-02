import {
  Component,
  inject,
  NO_ERRORS_SCHEMA,
  OnInit,
  signal,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { BottomSheetParams } from "@nativescript-community/ui-material-bottomsheet/angular";
import { StateService } from "~/app/core/services/state.service";
import { MessageService } from "~/app/core/services/message.service";
import { localize } from "@nativescript/localize";
import { finalize } from "rxjs";
import { CollectionService } from "~/app/core/services/collection.service";
import { Collection } from "~/app/core/models/collection.model";

@Component({
  selector: "ns-add-to-collection",
  templateUrl: "./add-to-collection.component.html",
  imports: [
    NativeScriptFormsModule,
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AddToCollectionComponent implements OnInit {
  @ViewChild("messageAnchor", { read: ViewContainerRef })
  messageAnchor: ViewContainerRef;
  params = inject(BottomSheetParams);
  stateService = inject(StateService);
  messageService = inject(MessageService);
  collectionService = inject(CollectionService);
  loading = signal(false);
  itemUUID: string;
  currentPage = 0;
  maxPages = 1;
  collections = signal<Collection[]>([]);
  collectionsWithItem = signal<string[]>([]);

  ngOnInit(): void {
    this.itemUUID = this.params.context.itemUUID;
    this.getCollections();
  }

  getCollections() {
    if (this.currentPage === this.maxPages) {
      return;
    }

    this.loading.set(true);
    this.collectionService
      .getUserCollectionsWithItemCheck(this.itemUUID, this.currentPage + 1)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.currentPage++;
          this.maxPages = res.pages;
          this.collections.update((collections) => [
            ...collections,
            ...res.data,
          ]);
          this.collectionsWithItem.update((ids) => [
            ...ids,
            ...res.collectionsWithItem,
          ]);
        },
        error: (e) => {
          console.dir(e);
          this.messageService.showErrorMessage(
            localize("common.generic_error"),
            this.messageAnchor,
          );
        },
      });
  }

  // createNewCollection() {
  // }

  // addToCollection() {
  // }

  // async removeFromCollection() {
  // }

  close() {
    this.params.closeCallback();
  }
}
