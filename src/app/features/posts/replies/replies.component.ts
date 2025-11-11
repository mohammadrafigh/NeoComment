import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NO_ERRORS_SCHEMA,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  inject,
  signal,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { StateService } from "~/app/core/services/state.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { PostItemComponent } from "~/app/shared/components/post/post-item/post-item.component";
import { PostService } from "~/app/core/services/post.service";
import { Post } from "~/app/core/models/post/post.model";
import { localize } from "@nativescript/localize";
import { PostsStateService } from "../posts-state.service";
import { PostEditorsService } from "../editors/post-editors.service";
import { MessageService } from "~/app/core/services/message.service";
import { CollectionView } from "@nativescript-community/ui-collectionview";

@Component({
  selector: "ns-replies",
  templateUrl: "./replies.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    PostItemComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepliesComponent implements OnInit, OnDestroy {
  @ViewChild("repliesCollectionView") repliesCollectionView: ElementRef;
  stateService = inject(StateService);
  postService = inject(PostService);
  messageService = inject(MessageService);
  postEditorsService = inject(PostEditorsService);
  postsStateService = inject(PostsStateService);
  activatedRoute = inject(ActivatedRoute);
  location = inject(Location);
  containerRef = inject(ViewContainerRef);
  router = inject(Router);
  pageLoading = signal(false);
  pageTitle = signal<string>("");
  post: Post;
  type: "mark" | "review" | "note" | "collection";
  itemUUID: string;
  itemTitle: string;
  itemCategory: string;

  ngOnInit(): void {
    this.initializePage();
    this.getReplies();
  }

  initializePage() {
    this.type = this.activatedRoute.snapshot.queryParams.type;
    this.itemUUID = this.activatedRoute.snapshot.queryParams.itemUUID;
    this.itemTitle = this.activatedRoute.snapshot.queryParams.itemTitle;
    this.itemCategory = this.activatedRoute.snapshot.queryParams.itemCategory;
    const postId = this.activatedRoute.snapshot.params.id;

    switch (this.type) {
      case "mark": {
        this.pageTitle.set(localize("common.user_ratings_and_marks"));
        this.post = this.postsStateService.getMarkPostById(postId);
        break;
      }
      case "review": {
        this.pageTitle.set(localize("common.reviews"));
        this.post = this.postsStateService.getReviewPostById(postId);
        break;
      }
      case "note": {
        this.pageTitle.set(localize("common.notes"));
        this.post = this.postsStateService.getNotePostById(postId);
        break;
      }
      case "collection": {
        this.pageTitle.set(localize("common.comments"));
        this.post = this.postsStateService.getCollectionPostById(postId);
        break;
      }
    }
  }

  getReplies() {
    this.pageLoading.set(true);
    this.postsStateService.getRepliesForPost(this.post).add(() => {
      this.pageLoading.set(false);
      // TODO: Mohammad 11-10-2025: scroll to the focused item is not working for some reason
      (
        this.repliesCollectionView.nativeElement as CollectionView
      ).scrollToIndex(
        this.postsStateService.postReplies[this.post.id]().indexOf(this.post),
      );
    });
  }

  editSheet(post: Post) {
    switch (this.type) {
      case "mark": {
        this.postEditorsService.showMarkAndRateSheet(this.containerRef, {
          itemUUID: this.itemUUID,
          itemCategory: this.itemCategory,
          itemTitle: this.itemTitle,
          shelfMark: this.postsStateService.itemPosts[this.itemUUID].userMark(),
        });
        break;
      }
      case "review": {
        this.postEditorsService.showReviewSheet(this.containerRef, {
          itemUUID: this.itemUUID,
          itemCategory: this.itemCategory,
          itemTitle: this.itemTitle,
          review: this.postsStateService.itemPosts[this.itemUUID].userReview(),
        });
        break;
      }
      case "note": {
        this.postEditorsService.showNoteSheet(this.containerRef, {
          itemUUID: this.itemUUID,
          itemCategory: this.itemCategory,
          itemTitle: this.itemTitle,
          note: this.postsStateService.getUserNoteByPost(post),
        });
        break;
      }
      case "collection": {
        const replyingPost = this.postsStateService.postReplies[
          this.post.id
        ]().find((p) => p.id === post.inReplyToId);
        this.postEditorsService.showReplySheet(this.containerRef, {
          replyingPost,
          editingPost: post,
        });
        break;
      }
    }
  }

  addReply(post?: Post) {
    this.postEditorsService.showReplySheet(this.containerRef, {
      replyingPost: post ?? this.post,
    });
  }

  navigateToPost(itemId: string) {
    if (itemId !== this.post.id) {
      this.router.navigate([`/posts/${itemId}`], {
        queryParams: {
          type: this.type,
          itemUUID: this.itemUUID,
          itemCategory: this.itemCategory,
          itemTitle: this.itemTitle,
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.postsStateService.loadPreviousPostReplies(this.post.id);
  }
}
