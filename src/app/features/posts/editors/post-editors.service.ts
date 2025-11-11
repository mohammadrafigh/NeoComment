import { inject, Injectable, ViewContainerRef } from "@angular/core";
import { ShelfMark } from "~/app/core/models/post/shelf-mark.model";
import { Review } from "~/app/core/models/post/review.model";
import { Note } from "~/app/core/models/post/note.model";
import { Post } from "~/app/core/models/post/post.model";
import {
  BottomSheetOptions,
  BottomSheetService,
} from "@nativescript-community/ui-material-bottomsheet/angular";
import { MarkAndRateComponent } from "./mark-and-rate/mark-and-rate.component";
import { ReviewComponent } from "./review/review.component";
import { NoteComponent } from "./note/note.component";
import { PostReplyComponent } from "./post-reply/post-reply.component";
import { PostsStateService } from "../posts-state.service";
import { EditorContext, ReplyEditorContext } from "./editor-context.model";

// NOTE: Mohammad 10-29-2025: Currently this service assumes postsStateService has
// initialized with an itemUUID and we are only navigating from item pages through
// posts and replies. Later when we have profile or feed we need to handle state
// changes in other ways. Unless we update postsStateService to also include
// feed and profile posts.
@Injectable({
  providedIn: "root",
})
export class PostEditorsService {
  private bottomSheet = inject(BottomSheetService);
  private postsStateService = inject(PostsStateService);

  showMarkAndRateSheet(
    viewContainerRef: ViewContainerRef,
    context: EditorContext,
  ) {
    const options: BottomSheetOptions = {
      viewContainerRef,
      context,
      dismissOnDraggingDownSheet: false,
      transparent: true,
    };

    this.bottomSheet
      .show(MarkAndRateComponent, options)
      .subscribe((result: { shelfMark: ShelfMark; isRemoved: boolean }) => {
        if (!result) {
          return;
        }

        if (result.isRemoved) {
          this.postsStateService.removeUserMark();
          return;
        }

        this.postsStateService.syncUserMarkOnItem();
      });
  }

  showReviewSheet(viewContainerRef: ViewContainerRef, context: EditorContext) {
    const options: BottomSheetOptions = {
      viewContainerRef,
      context,
      dismissOnDraggingDownSheet: false,
      transparent: true,
    };

    this.bottomSheet
      .show(ReviewComponent, options)
      .subscribe((result: { review: Review; isRemoved: boolean }) => {
        if (!result) {
          return;
        }

        if (result.isRemoved) {
          this.postsStateService.removeUserReview();
          return;
        }

        this.postsStateService.syncUserReviewOnItem();
      });
  }

  showNoteSheet(viewContainerRef: ViewContainerRef, context: EditorContext) {
    const options: BottomSheetOptions = {
      viewContainerRef,
      context,
      dismissOnDraggingDownSheet: false,
      transparent: true,
    };

    this.bottomSheet
      .show(NoteComponent, options)
      .subscribe((result: { note: Note; isRemoved: boolean }) => {
        if (!result) {
          return;
        }

        if (result.isRemoved) {
          this.postsStateService.removeUserNote(context.note);
          return;
        }

        this.postsStateService.syncUserNoteOnItem(result.note);
      });
  }

  showReplySheet(
    viewContainerRef: ViewContainerRef,
    context: ReplyEditorContext,
  ) {
    const options: BottomSheetOptions = {
      viewContainerRef,
      context,
      dismissOnDraggingDownSheet: false,
      transparent: true,
    };

    this.bottomSheet
      .show(PostReplyComponent, options)
      .subscribe((result: { post: Post; isRemoved: boolean }) => {
        if (!result) {
          return;
        }

        if (result.isRemoved) {
          this.postsStateService.removeReply(context.editingPost);
          return;
        }

        this.postsStateService.syncReply(result.post);
      });
  }
}
