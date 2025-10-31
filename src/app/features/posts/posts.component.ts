import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
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
import { StateService } from "../../core/services/state.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { PostItemComponent } from "~/app/shared/components/post/post-item/post-item.component";
import { Post } from "~/app/core/models/post/post.model";
import { localize } from "@nativescript/localize";
import { PostsStateService } from "./posts-state.service";
import { PostEditorsService } from "./editors/post-editors.service";

@Component({
  selector: "ns-posts",
  templateUrl: "./posts.component.html",
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
export class PostsComponent implements OnInit {
  stateService = inject(StateService);
  postEditorsService = inject(PostEditorsService);
  postsStateService = inject(PostsStateService);
  activatedRoute = inject(ActivatedRoute);
  location = inject(Location);
  containerRef = inject(ViewContainerRef);
  statusbarSize: number = global.statusbarSize;
  pageLoading = signal(false);
  pageTitle = signal<string>("");
  addIcon = signal<string>(null);
  currentPage = 1;
  maxPages = 1;
  type: "mark" | "review" | "note";
  itemUUID: string;
  itemTitle: string;
  itemCategory: string;

  ngOnInit(): void {
    this.type = this.activatedRoute.snapshot.queryParams.type;
    this.itemUUID = this.activatedRoute.snapshot.queryParams.itemUUID;
    this.itemTitle = this.activatedRoute.snapshot.queryParams.itemTitle;
    this.itemCategory = this.activatedRoute.snapshot.queryParams.itemCategory;
    this.initializePage();
  }

  initializePage() {
    switch (this.type) {
      case "mark": {
        this.pageTitle.set(localize("common.user_ratings_and_marks"));
        this.addIcon.set("\u{f972}");
        this.maxPages =
          this.postsStateService.itemPosts[this.itemUUID].comments().pages;
        break;
      }
      case "review": {
        this.pageTitle.set(localize("common.reviews"));
        this.addIcon.set("\u{f1e2}");
        this.maxPages =
          this.postsStateService.itemPosts[this.itemUUID].reviews().pages;
        break;
      }
      case "note": {
        this.pageTitle.set(localize("common.notes"));
        this.addIcon.set("\u{eb6d}");
        this.maxPages =
          this.postsStateService.itemPosts[this.itemUUID].notes().pages;
        break;
      }
    }
  }

  getPosts() {
    if (this.currentPage === this.maxPages) {
      return;
    }

    this.pageLoading.set(true);
    switch (this.type) {
      case "mark": {
        this.postsStateService.getMarks(this.currentPage + 1).add(() => {
          this.pageLoading.set(false);
          this.currentPage++;
          this.maxPages =
            this.postsStateService.itemPosts[this.itemUUID].comments().pages;
        });
        break;
      }
      case "review": {
        this.postsStateService.getReviews(this.currentPage + 1).add(() => {
          this.pageLoading.set(false);
          this.currentPage++;
          this.maxPages =
            this.postsStateService.itemPosts[this.itemUUID].reviews().pages;
        });
        break;
      }
      case "note": {
        this.postsStateService.getNotes(this.currentPage + 1).add(() => {
          this.pageLoading.set(false);
          this.currentPage++;
          this.maxPages =
            this.postsStateService.itemPosts[this.itemUUID].notes().pages;
        });
        break;
      }
    }
  }

  addEditSheet(post?: Post) {
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
    }
  }
}
