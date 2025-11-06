import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { IconTextButtonComponent } from "~/app/shared/components/icon-text-button/icon-text-button.component";
import { CollectionView } from "@nativescript-community/ui-collectionview";
import { BottomSheetContainerDirective } from "~/app/shared/directives/bottom-sheet-container.directive";

@Component({
  selector: "ns-add-to-collection",
  templateUrl: "./add-to-collection.component.html",
  imports: [
    NativeScriptFormsModule,
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    IconTextButtonComponent,
    BottomSheetContainerDirective,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToCollectionComponent implements OnInit {
  @ViewChild("messageAnchor", { read: ViewContainerRef })
  messageAnchor: ViewContainerRef;
  @ViewChild("collectionsList") cvRef: ElementRef<CollectionView>;
  params = inject(BottomSheetParams);
  stateService = inject(StateService);
  messageService = inject(MessageService);
  collectionService = inject(CollectionService);
  loading = signal(false);
  busyItems = signal<string[]>([]);
  itemUUID: string;
  currentPage = 0;
  maxPages = 1;
  collections = signal<Collection[]>([]);
  collectionsWithItem = signal<string[]>([]);
  newCollection: Collection = null;

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

  showNewCollectionForm() {
    this.newCollection = new Collection();
    this.newCollection.visibility =
      this.stateService.preference().defaultVisibility;
  }

  createNewCollection() {
    if (!this.newCollection.title) {
      this.messageService.showErrorMessage(
        localize("features.collection.add_name_message"),
        this.messageAnchor,
      );
      return;
    }

    this.loading.set(true);
    this.collectionService
      .createNewCollection(this.newCollection)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.newCollection = null;
          this.collections.update((collections) => [...collections, res]);
        },
        error: (e) => {
          this.messageService.showErrorMessage(
            localize("common.generic_error"),
            this.messageAnchor,
          );
        },
      });
  }

  toggleVisibility() {
    this.newCollection.visibility =
      this.newCollection.visibility < 2 ? this.newCollection.visibility + 1 : 0;
  }

  toggleCollection(event: any) {
    const collectionUUID = (event.item as Collection).uuid;
    if (this.busyItems().includes(collectionUUID)) {
      return;
    }

    if (this.collectionsWithItem().includes(collectionUUID)) {
      this.removeFromCollection(collectionUUID);
    } else {
      this.addToCollection(collectionUUID);
    }
  }

  private addToCollection(collectionUUID: string) {
    this.busyItems.update((ids) => [...ids, collectionUUID]);
    this.cvRef.nativeElement.refresh();

    this.collectionService
      .addItemToCollection(collectionUUID, this.itemUUID)
      .pipe(
        finalize(() => {
          this.busyItems.update((ids) =>
            [...ids].filter((id) => id !== collectionUUID),
          );
          this.cvRef.nativeElement.refresh();
        }),
      )
      .subscribe({
        next: (res) => {
          this.collectionsWithItem.update((ids) => [...ids, collectionUUID]);
        },
        error: (e) => {
          this.messageService.showErrorMessage(
            localize("common.generic_error"),
            this.messageAnchor,
          );
        },
      });
  }

  private removeFromCollection(collectionUUID: string) {
    this.busyItems.update((ids) => [...ids, collectionUUID]);
    this.cvRef.nativeElement.refresh();

    this.collectionService
      .removeItemFromCollection(collectionUUID, this.itemUUID)
      .pipe(
        finalize(() => {
          this.busyItems.update((ids) =>
            [...ids].filter((id) => id !== collectionUUID),
          );
          this.cvRef.nativeElement.refresh();
        }),
      )
      .subscribe({
        next: (res) => {
          this.collectionsWithItem.update((ids) =>
            ids.filter((id) => id !== collectionUUID),
          );
        },
        error: (e) => {
          this.messageService.showErrorMessage(
            localize("common.generic_error"),
            this.messageAnchor,
          );
        },
      });
  }

  close() {
    this.params.closeCallback();
  }
}
