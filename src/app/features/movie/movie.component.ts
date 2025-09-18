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
import { MovieService } from "../../core/services/movie.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { CollectionItemComponent } from "../../shared/components/items/collection-item/collection-item.component";
import { finalize } from "rxjs";
import { ActivatedRoute } from "@angular/router";
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
import { PostComponent } from "~/app/shared/components/post/post.component";
import { PostService } from "~/app/core/services/post.service";
import { Post } from "~/app/core/models/post/post.model";
import { Collection } from "~/app/core/models/collection.model";

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
    PostComponent,
    NeoDBLocalizePipe,
    KiloPipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieComponent implements OnInit {
  stateService = inject(StateService);
  movieService = inject(MovieService);
  postService = inject(PostService);
  messageService = inject(MessageService);
  activatedRoute = inject(ActivatedRoute);
  location = inject(Location);
  statusbarSize: number = global.statusbarSize;
  pageLoading = signal(false);
  movie = signal<Movie>(null);
  comments = signal<Post[]>([]);
  reviews = signal<Post[]>([]);
  collections = signal<Collection[]>([]);
  descriptionCollapsed = signal(true);

  ngOnInit(): void {
    this.getMovieDetails();
    this.getPosts();
  }

  getMovieDetails() {
    const uuid = this.activatedRoute.snapshot.params.uuid;
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

  getPosts() {
    const uuid = this.activatedRoute.snapshot.params.uuid;
    this.postService.getItemPosts(uuid, "comment").subscribe({
      next: (res) => {
        // TODO: [Mohammad 09-17-2025]: Put mine and my followings first and only keep 3 comments here and show "show more" if we have more
        this.comments.set(res.data);
      },
      error: (err) => console.dir(err),
    });
    this.postService.getItemPosts(uuid, "review").subscribe({
      next: (res) => {
        // TODO: [Mohammad 09-17-2025]: Put mine and my followings first and only keep 3 comments here and show "show more" if we have more
        this.reviews.set(res.data);
      },
      error: (err) => console.dir(err),
    });
    // TODO: [Mohammad 09-17-2025]: Implement collections and notes
    // this.postService.getItemPosts(uuid, "collection").subscribe({
    //   next: (response) => console.dir(response, {maxLines: 1000}),
    //   error: (err) => console.dir(err)
    // });
  }

  share() {
    // TODO: Mohammad 09-09-2025: Implement it
  }

  showCollections() {
    // TODO: Mohammad 09-09-2025: Implement it
  }

  showMarkAndRate() {
    // TODO: Mohammad 09-09-2025: Implement it
  }
}
