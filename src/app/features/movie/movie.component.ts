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
import { MovieService } from "../../core/services/movie.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { CollectionItemComponent } from "../../shared/components/items/collection-item/collection-item.component";
import {
  catchError,
  concatMap,
  finalize,
  forkJoin,
  from,
  map,
  of,
  toArray,
} from "rxjs";
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
import {
  BottomSheetService,
  BottomSheetOptions,
} from "@nativescript-community/ui-material-bottomsheet/angular";
import { MarkAndRateComponent } from "~/app/shared/components/post/mark-and-rate/mark-and-rate.component";
import { ShelfMark } from "~/app/core/models/post/shelf-mark.model";
import { Review } from "~/app/core/models/post/review.model";
import { Note } from "~/app/core/models/post/note.model";
import { ShelfService } from "~/app/core/services/shelf.service";
import { ReviewService } from "~/app/core/services/review.service";
import { NoteService } from "~/app/core/services/note.service";
import { ReviewComponent } from "~/app/shared/components/post/review/review.component";

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
  shelfService = inject(ShelfService);
  reviewService = inject(ReviewService);
  noteService = inject(NoteService);
  collectionService = inject(CollectionService);
  messageService = inject(MessageService);
  activatedRoute = inject(ActivatedRoute);
  location = inject(Location);
  router = inject(Router);
  bottomSheet = inject(BottomSheetService);
  containerRef = inject(ViewContainerRef);
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
  userStatus = signal(null);
  userMark: ShelfMark;
  userReview: Review;
  userNotes: Note[];

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

  getUserMarkAndPost(uuid: string) {
    const userMark$ = this.shelfService.getMarkByItem(uuid);
    return userMark$
      .pipe(
        concatMap((shelfMark) =>
          this.postService
            .getPostForMark(shelfMark)
            .pipe(catchError((err) => of(null)))
            .pipe(map((userPost) => ({ shelfMark, userPost }))),
        ),
      )
      .pipe(catchError((err) => of(null)));
  }

  getMarks(uuid: string) {
    const userMarkAndPost$ = this.getUserMarkAndPost(uuid);
    const itemMarks$ = this.postService.getItemPosts(uuid, "mark");
    forkJoin({
      userMarkAndPost: userMarkAndPost$,
      itemMarks: itemMarks$,
    }).subscribe({
      next: ({ userMarkAndPost, itemMarks }) => {
        const { shelfMark, userPost } = userMarkAndPost ?? {};
        this.hasMoreComments.set(itemMarks.count > 3);
        const posts = this.processPosts(userPost, itemMarks.data);
        this.comments.set(posts);
        this.setUserMark(shelfMark);
      },
      error: (err) => console.dir(err),
    });
  }

  getUserReviewAndPost(uuid: string) {
    const userReview$ = this.reviewService.getReviewByItem(uuid);
    return userReview$
      .pipe(
        concatMap((review) =>
          this.postService
            .getPostForReview(review)
            .pipe(catchError((err) => of(null)))
            .pipe(map((userPost) => ({ review, userPost }))),
        ),
      )
      .pipe(catchError((err) => of(null)));
  }

  getReviews(uuid: string) {
    const userReviewAndPost$ = this.getUserReviewAndPost(uuid);
    const itemReviews$ = this.postService.getItemPosts(uuid, "review");
    forkJoin({
      userReviewAndPost: userReviewAndPost$,
      itemReviews: itemReviews$,
    }).subscribe({
      next: ({ userReviewAndPost, itemReviews }) => {
        const { review, userPost } = userReviewAndPost ?? {};
        this.hasMoreReviews.set(itemReviews.count > 3);
        const posts = this.processPosts(userPost, itemReviews.data);
        this.reviews.set(posts);
        this.userReview = review;
      },
      error: (err) => console.dir(err),
    });
  }

  getUserNotesAndPosts(uuid: string) {
    // Hopefully user doesn't have more than 20 notes on a single item!
    const userNotes$ = this.noteService.getNotesByItem(uuid, 20);
    return userNotes$
      .pipe(
        concatMap((notesRes) =>
          this.postService
            .getPostsForNotes(notesRes.data)
            .pipe(catchError((err) => of(null)))
            .pipe(map((userPosts) => ({ notes: notesRes.data, userPosts }))),
        ),
      )
      .pipe(catchError((err) => of(null)));
  }

  getNotes(uuid: string) {
    const userNotesAndPosts$ = this.getUserNotesAndPosts(uuid);
    const itemNotes$ = this.postService.getItemPosts(uuid, "note");
    forkJoin({
      userNotesAndPosts: userNotesAndPosts$,
      itemNotes: itemNotes$,
    }).subscribe({
      next: ({ userNotesAndPosts, itemNotes }) => {
        const { notes, userPosts } = userNotesAndPosts ?? {};
        this.hasMoreNotes.set(itemNotes.count > 3);
        const posts = this.processNotes(userPosts, itemNotes.data);
        this.notes.set(posts);
        this.userNotes = notes;
      },
      error: (err) => console.dir(err),
    });
  }

  getPosts() {
    const uuid = this.activatedRoute.snapshot.params.uuid;

    this.getMarks(uuid);
    this.getReviews(uuid);
    this.getNotes(uuid);

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
    from(uuids.map((uuid) => this.collectionService.getCollectionDetails(uuid)))
      .pipe(
        concatMap((o) => o.pipe(catchError(() => of(null)))),
        toArray(),
      )
      .subscribe({
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
    const options: BottomSheetOptions = {
      viewContainerRef: this.containerRef,
      context: { item: this.movie(), shelfMark: this.userMark },
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
          this.setUserMark(null);
          this.comments.update((comments) => comments.slice(1));
          return;
        }

        this.getUserMarkAndPost(this.movie().uuid).subscribe({
          next: (userMarkAndPost) => {
            const { shelfMark, userPost } = userMarkAndPost ?? {};
            const posts = this.processPosts(userPost, this.comments());
            this.comments.set(posts);
            this.setUserMark(shelfMark);
          },
          error: (err) => console.dir(err),
        });
      });
  }

  showReviewSheet() {
    const options: BottomSheetOptions = {
      viewContainerRef: this.containerRef,
      context: { item: this.movie(), review: this.userReview },
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
          this.userReview = null;
          this.reviews.update((reviews) => reviews.slice(1));
          return;
        }

        this.getUserReviewAndPost(this.movie().uuid).subscribe({
          next: (userReviewAndPost) => {
            const { review, userPost } = userReviewAndPost ?? {};
            const posts = this.processPosts(userPost, this.reviews());
            this.reviews.set(posts);
            this.userReview = review;
          },
          error: (err) => console.dir(err),
        });
      });
  }

  showNoteSheet() {
    // TODO: Mohammad 10-02-2025:
  }

  setUserMark(shelfMark?: ShelfMark) {
    this.userMark = shelfMark;

    if (!this.userMark) {
      return this.userStatus.set(null);
    }

    switch (this.userMark?.shelfType) {
      case "wishlist":
        return this.userStatus.set(localize("features.movie.to_watch"));
      case "progress":
        return this.userStatus.set(localize("features.movie.watching"));
      case "complete":
        return this.userStatus.set(localize("features.movie.watched"));
      case "dropped":
        return this.userStatus.set(localize("features.movie.stopped"));
      default:
        return null;
    }
  }

  showAllPosts(type: string) {
    this.router.navigate([`/posts/${this.movie().uuid}`], {
      queryParams: { type },
    });
  }
}
