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
import { StateService } from "../../core/services/state.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { finalize } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { MessageService } from "~/app/core/services/message.service";
import { Location } from "@angular/common";
import { PostComponent } from "~/app/shared/components/post/post.component";
import { PostService } from "~/app/core/services/post.service";
import { Post } from "~/app/core/models/post/post.model";
import { localize } from "@nativescript/localize";

@Component({
  selector: "ns-posts",
  templateUrl: "./posts.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    PostComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsComponent implements OnInit {
  stateService = inject(StateService);
  postService = inject(PostService);
  messageService = inject(MessageService);
  activatedRoute = inject(ActivatedRoute);
  location = inject(Location);
  statusbarSize: number = global.statusbarSize;
  pageLoading = signal(false);
  posts = signal<Post[]>([]);
  pageTitle = signal<string>("");
  addIcon = signal<string>(null);
  currentPage = 0;
  maxPages = 1;

  ngOnInit(): void {
    this.initializePage();
    this.getPosts();
  }

  initializePage() {
    switch (this.activatedRoute.snapshot.queryParams.type) {
      case "mark": {
        this.pageTitle.set(localize("common.user_ratings_and_marks"));
        this.addIcon.set("\u{f972}");
        break;
      }
      case "review": {
        this.pageTitle.set(localize("common.reviews"));
        this.addIcon.set("\u{f1e2}");
        break;
      }
      case "note": {
        this.pageTitle.set(localize("common.notes"));
        this.addIcon.set("\u{eb6d}");
        break;
      }
    }
  }

  getPosts() {
    if (this.currentPage === this.maxPages) {
      return;
    }

    const uuid = this.activatedRoute.snapshot.params.itemUUID;
    const type = this.activatedRoute.snapshot.queryParams.type;

    this.pageLoading.set(true);
    this.postService
      .getItemPosts(uuid, type, this.currentPage + 1)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (postsRes) => {
          this.currentPage++;
          this.maxPages = postsRes.pages;
          this.posts.update((posts) => [...posts, ...postsRes.data]);
        },
        error: (err) => console.dir(err),
      });
  }

  add() {
    // TODO: Mohammad 10-02-2025:
  }
}
