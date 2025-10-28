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
import { Dialogs } from "@nativescript/core";
import { PostEditorComponent } from "../post-editor/post-editor.component";
import { SenderProfileComponent } from "../sender-profile/sender-profile.component";
import { Post } from "~/app/core/models/post/post.model";
import { PostService } from "~/app/core/services/post.service";
import { Status } from "~/app/core/models/post/status.model";
import { PostContentComponent } from "../post-content/post-content.component";

@Component({
  selector: "ns-post-reply",
  templateUrl: "./post-reply.component.html",
  imports: [
    NativeScriptFormsModule,
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    PostEditorComponent,
    SenderProfileComponent,
    PostContentComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PostReplyComponent implements OnInit {
  @ViewChild("messageAnchor", { read: ViewContainerRef })
  messageAnchor: ViewContainerRef;
  params = inject(BottomSheetParams);
  stateService = inject(StateService);
  messageService = inject(MessageService);
  postService = inject(PostService);
  replyingPost = signal<Post>(null);
  status = new Status();
  showCharCounterHint = signal(false);
  postLoading = signal(false);
  removeLoading = signal(false);
  isNew = signal(true);

  ngOnInit(): void {
    this.replyingPost.set(this.params.context.replyingPost);
    this.status = this.params.context.status
      ? Status.fromPost(this.params.context.status)
      : new Status();

    if (!this.status.status) {
      this.isNew.set(true);
      this.status.visibility =
        this.replyingPost().visibility === "direct"
          ? 2
          : this.stateService.preference().defaultVisibility;
      this.status.inReplyToId = this.replyingPost().id;
      this.status.status = `@${this.replyingPost().account.acct} ${this.replyingPost()
        .mentions.map((m) => "@" + m.acct)
        .join(" ")}`;
    }
  }

  post() {
    if (!this.status.status || this.status.status.trim().length === 0) {
      this.messageService.showErrorMessage(
        localize("common.add_reply_message"),
        this.messageAnchor,
      );
      return;
    }

    this.postLoading.set(true);

    if (this.isNew()) {
      this.postService
        .publishPost(this.status)
        .pipe(finalize(() => this.postLoading.set(false)))
        .subscribe({
          next: (post: Post) => this.close({ post, isRemoved: false }),
          error: () =>
            this.messageService.showErrorMessage(
              localize("common.generic_error"),
              this.messageAnchor,
            ),
        });
    } else {
      this.postService
        .updatePost(this.status)
        .pipe(finalize(() => this.postLoading.set(false)))
        .subscribe({
          next: (post: Post) => this.close({ post, isRemoved: false }),
          error: () =>
            this.messageService.showErrorMessage(
              localize("common.generic_error"),
              this.messageAnchor,
            ),
        });
    }
  }

  async remove() {
    const res = await Dialogs.confirm({
      message: localize("common.reply_removal_notice"),
      okButtonText: localize("common.yes"),
      cancelButtonText: localize("common.no"),
    });
    if (!res) {
      return;
    }

    this.removeLoading.set(true);
    this.postService
      .removePost(this.status.id)
      .pipe(finalize(() => this.removeLoading.set(false)))
      .subscribe({
        next: (post: Post) => this.close({ post, isRemoved: true }),
        error: () =>
          this.messageService.showErrorMessage(
            localize("common.generic_error"),
            this.messageAnchor,
          ),
      });
  }

  close(result?: { post: Post; isRemoved: boolean }) {
    this.params.closeCallback(result);
  }
}
