import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  NO_ERRORS_SCHEMA,
  ViewContainerRef,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { RatingsChartComponent } from "~/app/shared/components/ratings-chart/ratings-chart.component";
import { PostItemComponent } from "~/app/shared/components/post/post-item/post-item.component";
import { BaseItem } from "~/app/core/models/base-item.model";
import { StateService } from "~/app/core/services/state.service";
import { PostsStateService } from "../../posts/posts-state.service";
import { PostEditorsService } from "../../posts/editors/post-editors.service";
import { Router } from "@angular/router";

@Component({
  selector: "ns-feedback-section",
  templateUrl: "./feedback-section.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    RatingsChartComponent,
    PostItemComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackSectionComponent {
  @Input() item: BaseItem;
  @Input() itemTitle: string;
  private router = inject(Router);
  stateService = inject(StateService);
  postsStateService = inject(PostsStateService);
  postEditorsService = inject(PostEditorsService);
  containerRef = inject(ViewContainerRef);

  ngOnInit(): void {
    this.postsStateService.getPostsForItem(this.item.uuid);
  }

  showAllPosts(type: string) {
    this.router.navigate([`/posts`], {
      queryParams: this.getPostsQueryParams(type),
    });
  }

  navigateToPost(postId: string, type: string) {
    this.router.navigate([`/posts/${postId}`], {
      queryParams: this.getPostsQueryParams(type),
    });
  }

  getPostsQueryParams(type: string) {
    return {
      type,
      itemUUID: this.item.uuid,
      itemCategory: this.item.category,
      itemTitle: this.itemTitle,
    };
  }

  ngOnDestroy(): void {
    this.postsStateService.loadPreviousItemPosts(this.item.uuid);
  }
}
