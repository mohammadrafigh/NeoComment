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
import { BaseItem } from "~/app/core/models/base-item.model";
import { NeoDBLocalizePipe } from "../../../pipes/neodb-localize.pipe";
import { StateService } from "~/app/core/services/state.service";
import { MessageService } from "~/app/core/services/message.service";
import { localize } from "@nativescript/localize";
import { cloneDeep } from "lodash-es";
import { finalize } from "rxjs";
import { Dialogs } from "@nativescript/core";
import { ReviewService } from "~/app/core/services/review.service";
import { Review } from "~/app/core/models/post/review.model";
import { PostEditorComponent } from "../post-editor/post-editor.component";
import { SenderProfileComponent } from "../sender-profile/sender-profile.component";

@Component({
  selector: "ns-review",
  templateUrl: "./review.component.html",
  imports: [
    NativeScriptFormsModule,
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    NeoDBLocalizePipe,
    PostEditorComponent,
    SenderProfileComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ReviewComponent implements OnInit {
  @ViewChild("messageAnchor", { read: ViewContainerRef })
  messageAnchor: ViewContainerRef;
  params = inject(BottomSheetParams);
  stateService = inject(StateService);
  messageService = inject(MessageService);
  reviewService = inject(ReviewService);
  item = signal<BaseItem>(null);
  review = new Review();
  postLoading = signal(false);
  removeLoading = signal(false);

  ngOnInit(): void {
    this.item.set(this.params.context.item);
    this.review = cloneDeep(this.params.context.review) ?? new Review();

    if (!this.review.postId) {
      this.review.postToFediverse =
        this.stateService.preference().defaultCrosspost;
      this.review.visibility = this.stateService.preference().defaultVisibility;
    }
  }

  post() {
    if (!this.review.title || this.review.title.trim().length === 0) {
      this.messageService.showErrorMessage(
        localize("common.add_title_message"),
        this.messageAnchor,
      );
      return;
    }

    if (!this.review.body || this.review.body.trim().length === 0) {
      this.messageService.showErrorMessage(
        localize("common.add_content_message"),
        this.messageAnchor,
      );
      return;
    }

    this.postLoading.set(true);
    this.reviewService
      .saveReview(this.item().uuid, this.review)
      .pipe(finalize(() => this.postLoading.set(false)))
      .subscribe({
        next: () => this.close({ review: this.review, isRemoved: false }),
        error: () =>
          this.messageService.showErrorMessage(
            localize("common.generic_error"),
            this.messageAnchor,
          ),
      });
  }

  async remove() {
    const res = await Dialogs.confirm({
      message: localize("common.review_removal_notice"),
      okButtonText: localize("common.yes"),
      cancelButtonText: localize("common.no"),
    });
    if (!res) {
      return;
    }

    this.removeLoading.set(true);
    this.reviewService
      .removeReview(this.item().uuid)
      .pipe(finalize(() => this.removeLoading.set(false)))
      .subscribe({
        next: () => this.close({ review: this.review, isRemoved: true }),
        error: () =>
          this.messageService.showErrorMessage(
            localize("common.generic_error"),
            this.messageAnchor,
          ),
      });
  }

  close(result?: { review: Review; isRemoved: boolean }) {
    this.params.closeCallback(result);
  }
}
