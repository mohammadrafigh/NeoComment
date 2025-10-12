import {
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
  ModalDialogOptions,
  ModalDialogService,
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { RateIndicatorComponent } from "../rate-indicator/rate-indicator.component";
import { BottomSheetParams } from "@nativescript-community/ui-material-bottomsheet/angular";
import { BaseItem } from "~/app/core/models/base-item.model";
import { NeoDBLocalizePipe } from "../../pipes/neodb-localize.pipe";
import { StateService } from "~/app/core/services/state.service";
import { ShelfMark } from "~/app/core/models/post/shelf-mark.model";
import { IconTextButtonComponent } from "../icon-text-button/icon-text-button.component";
import { TooltipDirective } from "~/app/shared/directives/tooltip.directive";
import { DatePickerDialogComponent } from "~/app/shared/components/date-picker/date-picker.component";
import { MessageService } from "~/app/core/services/message.service";
import { localize } from "@nativescript/localize";
import { ShelfService } from "~/app/core/services/shelf.service";
import { cloneDeep } from "lodash-es";
import { finalize } from "rxjs";
import { Dialogs, isAndroid } from "@nativescript/core";

@Component({
  selector: "ns-rate-and-mark",
  templateUrl: "./mark-and-rate.component.html",
  imports: [
    NativeScriptFormsModule,
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    IconTextButtonComponent,
    NeoDBLocalizePipe,
    TooltipDirective,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class MarkAndRateComponent implements OnInit {
  @ViewChild("messageAnchor", { read: ViewContainerRef })
  messageAnchor: ViewContainerRef;
  @ViewChild("commentInput") commentInput: ElementRef;
  params = inject(BottomSheetParams);
  stateService = inject(StateService);
  elementRef = inject(ElementRef);
  viewContainerRef = inject(ViewContainerRef);
  modalService = inject(ModalDialogService);
  messageService = inject(MessageService);
  shelfService = inject(ShelfService);
  item = signal<BaseItem>(null);
  userHandle = signal<string>(null);
  rates = new Array(10);
  shelfMark = new ShelfMark();
  showCharCounterHint = signal(false);
  hasCustomDate = signal(false);
  postLoading = signal(false);
  removeLoading = signal(false);

  ngOnInit(): void {
    this.item.set(this.params.context.item);
    this.shelfMark =
      cloneDeep(this.params.context.shelfMark) ?? new ShelfMark();

    const instanceURL = this.stateService.instanceURL();
    this.userHandle.set(
      `@${this.stateService.user().username}@${instanceURL.substring(instanceURL.lastIndexOf("/") + 1)}`,
    );

    if (!this.shelfMark.postId) {
      this.shelfMark.postToFediverse =
        this.stateService.preference().defaultCrosspost;
      this.shelfMark.visibility =
        this.stateService.preference().defaultVisibility;
    }
  }

  addSpoilerAction() {
    if (isAndroid) {
      const nativeTextView = this.commentInput.nativeElement.android;

      nativeTextView.setCustomSelectionActionModeCallback(
        new android.view.ActionMode.Callback({
          onCreateActionMode: (mode, menu) => {
            menu.add(0, 1001, 0, "Spoiler");
            return true;
          },
          onPrepareActionMode: (mode, menu) => true,
          onActionItemClicked: (mode, item) => {
            if (item.getItemId() === 1001) {
              this.wrapSpoilerContent();
              mode.finish();
              return true;
            }
            return false;
          },
          onDestroyActionMode: (mode) => {},
        }),
      );
    }
  }

  wrapSpoilerContent() {
    if (isAndroid) {
      const nativeTextView = this.commentInput.nativeElement.android;
      const start = nativeTextView.getSelectionStart();
      const end = nativeTextView.getSelectionEnd();

      const text = nativeTextView.getText().toString();
      const before = text.substring(0, start);
      const selected = text.substring(start, end);
      const after = text.substring(end);

      const newText = `${before}>!${selected}!<${after}`;

      nativeTextView.setText(newText);

      nativeTextView.setSelection(end + 2);
    }
  }

  toggleVisibility() {
    this.shelfMark.visibility =
      this.shelfMark.visibility < 2 ? this.shelfMark.visibility + 1 : 0;
  }

  async showDatePicker() {
    const options: ModalDialogOptions = {
      viewContainerRef: this.viewContainerRef,
      fullscreen: false,
      context: { date: this.shelfMark.createdTime },
    };

    const result = await this.modalService.showModal(
      DatePickerDialogComponent,
      options,
    );

    if (result) {
      this.hasCustomDate.set(result !== this.shelfMark.createdTime);
      this.shelfMark.createdTime = result;
    }
  }

  post() {
    if (!this.shelfMark.shelfType) {
      this.messageService.showErrorMessage(
        localize("common.select_mark_message"),
        this.messageAnchor,
      );
      return;
    }

    this.postLoading.set(true);
    this.shelfService
      .saveMark(this.item().uuid, this.shelfMark)
      .pipe(finalize(() => this.postLoading.set(false)))
      .subscribe({
        next: () => this.close({ shelfMark: this.shelfMark, isRemoved: false }),
        error: () =>
          this.messageService.showErrorMessage(
            localize("common.generic_error"),
            this.messageAnchor,
          ),
      });
  }

  async remove() {
    const res = await Dialogs.confirm({
      message: localize("common.mark_removal_notice"),
      okButtonText: localize("common.yes"),
      cancelButtonText: localize("common.no"),
    });
    if (!res) {
      return;
    }

    this.removeLoading.set(true);
    this.shelfService
      .removeMark(this.item().uuid)
      .pipe(finalize(() => this.removeLoading.set(false)))
      .subscribe({
        next: () => this.close({ shelfMark: this.shelfMark, isRemoved: true }),
        error: () =>
          this.messageService.showErrorMessage(
            localize("common.generic_error"),
            this.messageAnchor,
          ),
      });
  }

  close(result?: { shelfMark: ShelfMark; isRemoved: boolean }) {
    this.params.closeCallback(result);
  }
}
