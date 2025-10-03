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
import { finalize, forkJoin } from "rxjs";
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
import { PostComponent } from "~/app/shared/components/post/post.component";
import { PostService } from "~/app/core/services/post.service";
import { CollectionService } from "~/app/core/services/collection.service";
import { Post } from "~/app/core/models/post/post.model";
import { Collection } from "~/app/core/models/collection.model";
import { PageTransition, SharedTransition } from "@nativescript/core";
import { shareText } from "@nativescript/social-share";

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
  collectionService = inject(CollectionService);
  messageService = inject(MessageService);
  activatedRoute = inject(ActivatedRoute);
  location = inject(Location);
  router = inject(Router);
  statusbarSize: number = global.statusbarSize;
  pageLoading = signal(false);
  movie = signal<Movie>(null);
  comments = signal<Post[]>([]);
  reviews = signal<Post[]>([]);
  notes = signal<Post[]>([]);
  collectionPosts = signal<Post[]>([]);
  collections = signal<Collection[]>([]);
  descriptionCollapsed = signal(true);
  hasMoreComments = signal(false);
  hasMoreReviews = signal(false);
  hasMoreNotes = signal(false);

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

    const userPost$ = this.postService.getUserMarkOnItem(uuid);
    const itemMarks$ = this.postService.getItemPosts(uuid, "mark");
    forkJoin([userPost$, itemMarks$]).subscribe({
      next: ([userPost, postsRes]) => {
        this.hasMoreComments.set(postsRes.count > 3);
        const posts = this.processPosts(userPost, postsRes.data);
        this.comments.set(posts);
      },
      error: (err) => console.dir(err),
    });

    const userReview$ = this.postService.getUserReviewOnItem(uuid);
    const itemReviews$ = this.postService.getItemPosts(uuid, "review");
    forkJoin([userReview$, itemReviews$]).subscribe({
      next: ([userPost, postsRes]) => {
        this.hasMoreReviews.set(postsRes.count > 3);
        const posts = this.processPosts(userPost, postsRes.data);
        this.reviews.set(posts);
      },
      error: (err) => console.dir(err),
    });

    const userNotes$ = this.postService.getUserNotesOnItem(uuid);
    const itemNotes$ = this.postService.getItemPosts(uuid, "note");
    forkJoin([userNotes$, itemNotes$]).subscribe({
      next: ([userPosts, postsRes]) => {
        this.hasMoreNotes.set(postsRes.count > 3);
        const posts = this.processNotes(userPosts, postsRes.data);
        this.notes.set(posts);
      },
      error: (err) => console.dir(err),
    });

    this.postService.getItemPosts(uuid, "collection").subscribe({
      next: (response) => {
        const collectionPosts = response.data.slice(0, 10);
        this.collectionPosts.set(collectionPosts);
        this.getCollections(collectionPosts);
      },
      error: (err) => console.dir(err),
    });
  }

  processPosts(userPost: Post, posts: Post[]) {
    const processedPosts = posts.slice(0, 3);
    const userPostIndex = processedPosts.findIndex(
      (p) => p.id === userPost?.id,
    );
    if (userPostIndex > -1) {
      processedPosts.splice(userPostIndex, 1);
    }
    if (userPost) {
      processedPosts.unshift(userPost);
    }

    return processedPosts;
  }

  processNotes(userNotes: Post[], notes: Post[]) {
    const processedPosts = notes.slice(0, 3);
    for (const note of userNotes) {
      const userPostIndex = processedPosts.findIndex((p) => p.id === note.id);
      if (userPostIndex > -1) {
        processedPosts.splice(userPostIndex, 1);
      }
      processedPosts.unshift(note);
    }

    return processedPosts;
  }

  getCollections(collectionPosts: Post[]) {
    const uuids = collectionPosts.map((p) => {
      const id = p.extNeodb.relatedWith.find((r) => r.type === "Collection").id;
      return id.substring(id.lastIndexOf("/") + 1);
    });
    forkJoin(
      uuids.map((uuid) => this.collectionService.getCollectionDetails(uuid)),
    ).subscribe({
      next: (collections) => this.collections.set(collections),
      error: (err) => console.dir(err),
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

  showMarkAndRateSheet() {
    // TODO: Mohammad 09-09-2025: Implement it
  }

  showReviewSheet() {
    // TODO: Mohammad 10-02-2025:
  }

  showNoteSheet() {
    // TODO: Mohammad 10-02-2025:
  }

  showAllPosts(type: string) {
    this.router.navigate([`/posts/${this.movie().uuid}`], {
      queryParams: { type },
    });
  }
}
