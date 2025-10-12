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
import { RateIndicatorComponent } from "../../rate-indicator/rate-indicator.component";
import { BottomSheetParams } from "@nativescript-community/ui-material-bottomsheet/angular";
import { BaseItem } from "~/app/core/models/base-item.model";
import { NeoDBLocalizePipe } from "../../../pipes/neodb-localize.pipe";
import { StateService } from "~/app/core/services/state.service";
import { ShelfMark } from "~/app/core/models/post/shelf-mark.model";
import { MessageService } from "~/app/core/services/message.service";
import { localize } from "@nativescript/localize";
import { ShelfService } from "~/app/core/services/shelf.service";
import { cloneDeep } from "lodash-es";
import { finalize } from "rxjs";
import { Dialogs } from "@nativescript/core";
import { PostEditorComponent } from "../post-editor/post-editor.component";
import { SenderProfileComponent } from "../sender-profile/sender-profile.component";

@Component({
  selector: "ns-rate-and-mark",
  templateUrl: "./mark-and-rate.component.html",
  imports: [
    NativeScriptFormsModule,
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    NeoDBLocalizePipe,
    PostEditorComponent,
    SenderProfileComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class MarkAndRateComponent implements OnInit {
  @ViewChild("messageAnchor", { read: ViewContainerRef })
  messageAnchor: ViewContainerRef;
  params = inject(BottomSheetParams);
  stateService = inject(StateService);
  messageService = inject(MessageService);
  shelfService = inject(ShelfService);
  item = signal<BaseItem>(null);
  rates = new Array(10);
  shelfMark = new ShelfMark();
  showCharCounterHint = signal(false);
  postLoading = signal(false);
  removeLoading = signal(false);

  ngOnInit(): void {
    this.item.set(this.params.context.item);
    this.shelfMark =
      cloneDeep(this.params.context.shelfMark) ?? new ShelfMark();

    if (!this.shelfMark.postId) {
      this.shelfMark.postToFediverse =
        this.stateService.preference().defaultCrosspost;
      this.shelfMark.visibility =
        this.stateService.preference().defaultVisibility;
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
