import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
  ViewContainerRef,
  computed,
  inject,
  signal,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { StateService } from "../../../core/services/state.service";
import { MovieService } from "../../../core/services/movie.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { CollectionItemComponent } from "../../../shared/components/items/collection-item/collection-item.component";
import { finalize } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Movie } from "~/app/core/models/movie.model";
import { MessageService } from "~/app/core/services/message.service";
import { localize } from "@nativescript/localize";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { KiloPipe } from "~/app/shared/pipes/kilo.pipe";
import { Location } from "@angular/common";
import { RateIndicatorComponent } from "~/app/shared/components/rate-indicator/rate-indicator.component";
import { IconTextButtonComponent } from "~/app/shared/components/icon-text-button/icon-text-button.component";
import { ExternalResourcesComponent } from "~/app/shared/components/external-resources/external-resources.component";
import { RatingsChartComponent } from "~/app/shared/components/ratings-chart/ratings-chart.component";
import { PostItemComponent } from "~/app/shared/components/post/post-item/post-item.component";
import { PageTransition, SharedTransition } from "@nativescript/core";
import { shareText } from "@nativescript/social-share";
import { PostsStateService } from "~/app/features/posts/posts-state.service";
import { PostEditorsService } from "~/app/features/posts/editors/post-editors.service";

@Component({
  selector: "ns-movie",
  templateUrl: "./movie.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    RateIndicatorComponent,
    IconTextButtonComponent,
    CollectionItemComponent,
    ExternalResourcesComponent,
    RatingsChartComponent,
    PostItemComponent,
    NeoDBLocalizePipe,
    KiloPipe,
  ],
  providers: [NeoDBLocalizePipe],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieComponent implements OnInit {
  stateService = inject(StateService);
  movieService = inject(MovieService);
  messageService = inject(MessageService);
  postsStateService = inject(PostsStateService);
  postEditorsService = inject(PostEditorsService);
  activatedRoute = inject(ActivatedRoute);
  location = inject(Location);
  router = inject(Router);
  containerRef = inject(ViewContainerRef);
  neoL = inject(NeoDBLocalizePipe);
  statusbarSize: number = global.statusbarSize;
  pageLoading = signal(false);
  movie = signal<Movie>(null);
  descriptionCollapsed = signal(true);
  itemTitle = computed(() =>
    this.movie()
      ? this.neoL.transform(
          this.movie().localizedTitle,
          this.stateService.preference().language,
        ) ||
        this.movie().displayTitle ||
        this.movie().title
      : undefined,
  );

  ngOnInit(): void {
    const uuid = this.activatedRoute.snapshot.params.uuid;
    this.getMovieDetails(uuid);
    this.postsStateService.getPostsForItem(uuid);
  }

  getMovieDetails(uuid: string) {
    this.pageLoading.set(true);
    this.movieService
      .getMovieDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (movie) => this.movie.set(movie),
        error: (err) =>
          this.messageService.showErrorMessage(
            localize("common.generic_connection_error"),
          ),
      });
  }

  share() {
    shareText(this.stateService.instanceURL() + this.movie().url);
  }

  navigateToCollection(event: any) {
    const item = event.item;
    this.router.navigate([`/collections/` + item.uuid], {
      transition: SharedTransition.custom(new PageTransition(), {
        pageReturn: {
          duration: 150,
        },
      }),
    } as any);
  }

  showCollections() {
    // TODO: Mohammad 09-09-2025: Implement it
  }

  showAllPosts(type: string) {
    this.router.navigate([`/posts`], {
      queryParams: {
        type,
        itemUUID: this.movie().uuid,
        itemCategory: this.movie().category,
        itemTitle: this.itemTitle(),
      },
    });
  }
}
