import { computed, inject, Injectable, signal } from "@angular/core";
import { StateService } from "~/app/core/services/state.service";
import { PostService } from "~/app/core/services/post.service";
import { ShelfService } from "~/app/core/services/shelf.service";
import { ReviewService } from "~/app/core/services/review.service";
import { NoteService } from "~/app/core/services/note.service";
import { Post } from "~/app/core/models/post/post.model";
import { ShelfMark } from "~/app/core/models/post/shelf-mark.model";
import { Review } from "~/app/core/models/post/review.model";
import { Note } from "~/app/core/models/post/note.model";
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
import { localize } from "@nativescript/localize";
import { CollectionService } from "~/app/core/services/collection.service";
import { Collection } from "~/app/core/models/collection.model";
import { PostsResponse } from "~/app/core/models/post/posts-response.model";
import { cloneDeep } from "lodash-es";

@Injectable({
  providedIn: "root",
})
export class PostsStateService {
  private stateService = inject(StateService);
  private postService = inject(PostService);
  private shelfService = inject(ShelfService);
  private reviewService = inject(ReviewService);
  private noteService = inject(NoteService);
  private collectionService = inject(CollectionService);

  // ------------- item posts state -------------
  private focusedItem: string;
  private _comments = signal<PostsResponse>(null);
  private _reviews = signal<PostsResponse>(null);
  private _notes = signal<PostsResponse>(null);
  private _collectionPosts = signal<Post[]>([]);
  private _collections = signal<Collection[]>([]);
  private _userStatus = signal<string>(null);
  private _userMark = signal<ShelfMark>(null);
  private _userMarkPost = signal<Post>(null);
  private _userReview = signal<Review>(null);
  private _userReviewPost = signal<Post>(null);
  private _userNotes = signal<Note[]>([]);
  private _userNotesPosts = signal<Post[]>([]);
  private _likingPostIds = signal<string[]>([]);
  private _boostingPostIds = signal<string[]>([]);
  comments = this._comments.asReadonly();
  reviews = this._reviews.asReadonly();
  notes = this._notes.asReadonly();
  commentsOverview = computed(() =>
    this.processPostsOverview(this.userMarkPost(), this.comments()?.data),
  );
  reviewsOverview = computed(() =>
    this.processPostsOverview(this.userReviewPost(), this.reviews()?.data),
  );
  notesOverview = computed(() =>
    this.processNotesOverview(this.userNotesPosts(), this.notes()?.data),
  );
  collectionPosts = this._collectionPosts.asReadonly();
  collections = this._collections.asReadonly();
  hasMoreComments = computed(() => this.comments()?.data.length > 3);
  hasMoreReviews = computed(() => this.reviews()?.data.length > 3);
  hasMoreNotes = computed(() => this.notes()?.data.length > 3);
  userStatus = this._userStatus.asReadonly();
  userMark = this._userMark.asReadonly();
  userMarkPost = this._userMarkPost.asReadonly();
  userReview = this._userReview.asReadonly();
  userReviewPost = this._userReviewPost.asReadonly();
  userNotes = this._userNotes.asReadonly();
  userNotesPosts = this._userNotesPosts.asReadonly();
  likingPostIds = this._likingPostIds.asReadonly();
  boostingPostIds = this._boostingPostIds.asReadonly();

  private init(itemUUID: string) {
    this.focusedItem = itemUUID;
    this._comments.set(null);
    this._reviews.set(null);
    this._notes.set(null);
    this._collectionPosts.set([]);
    this._collections.set([]);
    this._userStatus.set(null);
    this._userMark.set(null);
    this._userMarkPost.set(null);
    this._userReview.set(null);
    this._userReviewPost.set(null);
    this._userNotes.set([]);
    this._userNotesPosts.set([]);
    this._likingPostIds.set([]);
    this._boostingPostIds.set([]);
  }

  getPostsForItem(itemUUID: string) {
    this.init(itemUUID);
    this.getMarks();
    this.getReviews();
    this.getNotes();
    this.getCollections();
  }

  private getUserMarkAndPost() {
    const userMark$ = this.shelfService.getMarkByItem(this.focusedItem);
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

  getMarks(page: number = 1) {
    const userMarkAndPost$ = page === 1 ? this.getUserMarkAndPost() : of(null);
    const itemMarks$ = this.postService.getItemPosts(
      this.focusedItem,
      "mark",
      page,
    );
    return forkJoin({
      userMarkAndPost: userMarkAndPost$,
      itemMarks: itemMarks$,
    }).subscribe({
      next: ({ userMarkAndPost, itemMarks }) => {
        if (page === 1) {
          const { shelfMark, userPost } = userMarkAndPost ?? {};
          this._userMarkPost.set(userPost);
          this.setUserMark(shelfMark);
          this._comments.set(itemMarks);
        } else {
          this._comments.update((posts) => ({
            ...itemMarks,
            data: [...posts.data, ...itemMarks.data],
          }));
        }
      },
      error: (err) => console.dir(err),
    });
  }

  private getUserReviewAndPost() {
    const userReview$ = this.reviewService.getReviewByItem(this.focusedItem);
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

  getReviews(page: number = 1) {
    const userReviewAndPost$ =
      page === 1 ? this.getUserReviewAndPost() : of(null);
    const itemReviews$ = this.postService.getItemPosts(
      this.focusedItem,
      "review",
      page,
    );
    return forkJoin({
      userReviewAndPost: userReviewAndPost$,
      itemReviews: itemReviews$,
    }).subscribe({
      next: ({ userReviewAndPost, itemReviews }) => {
        if (page === 1) {
          const { review, userPost } = userReviewAndPost ?? {};
          this._userReviewPost.set(userPost);
          this._userReview.set(review);
          this._reviews.set(itemReviews);
        } else {
          this._reviews.update((posts) => ({
            ...itemReviews,
            data: [...posts.data, ...itemReviews.data],
          }));
        }
      },
      error: (err) => console.dir(err),
    });
  }

  private getUserNotesAndPosts() {
    // Hopefully user doesn't have more than 20 notes on a single item!
    const userNotes$ = this.noteService.getNotesByItem(this.focusedItem, 20);
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

  getNotes(page: number = 1) {
    const userNotesAndPosts$ =
      page === 1 ? this.getUserNotesAndPosts() : of(null);
    const itemNotes$ = this.postService.getItemPosts(
      this.focusedItem,
      "note",
      page,
    );
    return forkJoin({
      userNotesAndPosts: userNotesAndPosts$,
      itemNotes: itemNotes$,
    }).subscribe({
      next: ({ userNotesAndPosts, itemNotes }) => {
        if (page === 1) {
          const { notes, userPosts } = userNotesAndPosts ?? {};
          this._userNotesPosts.set(userPosts);
          this._userNotes.set(notes);
          this._notes.set(itemNotes);
        } else {
          this._notes.update((posts) => ({
            ...itemNotes,
            data: [...posts.data, ...itemNotes.data],
          }));
        }
      },
      error: (err) => console.dir(err),
    });
  }

  private processPostsOverview(userPost: Post, posts: Post[]) {
    const processedPosts = (posts ?? [])
      .slice(0, 3)
      .filter((p) => p.account.id !== this.stateService.fediAccount().id);
    if (userPost) {
      processedPosts.unshift(userPost);
    }

    return processedPosts;
  }

  private processNotesOverview(userNotes: Post[], notes: Post[]) {
    let processedPosts = (notes ?? [])
      .slice(0, 3)
      .filter((n) => n.account.id !== this.stateService.fediAccount().id);
    // NeoDB returns notes from older to newer so we reverse them
    processedPosts = [...userNotes.slice().reverse(), ...processedPosts];

    return processedPosts;
  }

  private getCollections() {
    this.postService.getItemPosts(this.focusedItem, "collection").subscribe({
      next: (response) => {
        const collectionPosts = response.data.slice(0, 10);
        this._collectionPosts.set(collectionPosts);

        const uuids = collectionPosts.map((p) => {
          const id = p.extNeodb.relatedWith.find(
            (r) => r.type === "Collection",
          ).id;
          return id.substring(id.lastIndexOf("/") + 1);
        });
        from(
          uuids.map((uuid) =>
            this.collectionService.getCollectionDetails(uuid),
          ),
        )
          .pipe(
            concatMap((o) => o.pipe(catchError(() => of(null)))),
            toArray(),
          )
          .subscribe({
            next: (collections) => this._collections.set(collections),
            error: (err) => console.dir(err),
          });
      },
      error: (err) => console.dir(err),
    });
  }

  removeUserMark() {
    this._comments.update((comments) => ({
      ...comments,
      data: comments.data.filter((p) => p.id !== this._userMarkPost().id),
    }));
    this._userMarkPost.set(null);
    this.setUserMark(null);
  }

  removeUserReview() {
    this._reviews.update((reviews) => ({
      ...reviews,
      data: reviews.data.filter((p) => p.id !== this._userReviewPost().id),
    }));
    this._userReviewPost.set(null);
    this._userReview.set(null);
  }

  removeUserNote(note: Note) {
    this._notes.update((notes) => ({
      ...notes,
      data: notes.data.filter((n) => n.id !== note.postId),
    }));
    this._userNotesPosts.update((posts) =>
      posts.filter((p) => p.id !== note.postId),
    );
    this._userNotes.update((notes) =>
      notes.filter((n) => n.uuid !== note.uuid),
    );
  }

  getUserNoteByPost(notePost?: Post) {
    if (notePost) {
      return this.userNotes().find((n) => n.postId === notePost.id);
    }
  }

  private setUserMark(shelfMark?: ShelfMark) {
    this._userMark.set(shelfMark);

    if (!this._userMark()) {
      return this._userStatus.set(null);
    }

    switch (this._userMark()?.shelfType) {
      case "wishlist":
        return this._userStatus.set(localize("features.movie.to_watch"));
      case "progress":
        return this._userStatus.set(localize("features.movie.watching"));
      case "complete":
        return this._userStatus.set(localize("features.movie.watched"));
      case "dropped":
        return this._userStatus.set(localize("features.movie.stopped"));
      default:
        return null;
    }
  }

  toggleLike(post: Post) {
    this._likingPostIds.update((ids) => [...ids, post.id]);
    if (post.favourited) {
      this.applyUnlike(post);
      this.postService
        .unlikePost(post.id)
        .pipe(
          finalize(() =>
            this._likingPostIds.update((ids) =>
              ids.filter((id) => id !== post.id),
            ),
          ),
        )
        .subscribe({ error: () => this.applyLike(post) });
    } else {
      this.applyLike(post);
      this.postService
        .likePost(post.id)
        .pipe(
          finalize(() =>
            this._likingPostIds.update((ids) =>
              ids.filter((id) => id !== post.id),
            ),
          ),
        )
        .subscribe({ error: () => this.applyUnlike(post) });
    }
  }

  private applyLike(post: Post) {
    const updatedPost = cloneDeep(post);
    updatedPost.favourited = true;
    updatedPost.favouritesCount++;
    this.updatePost(updatedPost);
  }

  private applyUnlike(post: Post) {
    const updatedPost = cloneDeep(post);
    updatedPost.favourited = false;
    updatedPost.favouritesCount--;
    this.updatePost(updatedPost);
  }

  toggleBoost(post: Post) {
    this._boostingPostIds.update((ids) => [...ids, post.id]);
    if (post.reblogged) {
      this.applyUnboost(post);
      this.postService
        .unboostPost(post.id)
        .pipe(
          finalize(() =>
            this._boostingPostIds.update((ids) =>
              ids.filter((id) => id !== post.id),
            ),
          ),
        )
        .subscribe({ error: () => this.applyBoost(post) });
    } else {
      this.applyBoost(post);
      this.postService
        .boostPost(post.id)
        .pipe(
          finalize(() =>
            this._boostingPostIds.update((ids) =>
              ids.filter((id) => id !== post.id),
            ),
          ),
        )
        .subscribe({ error: () => this.applyUnboost(post) });
    }
  }

  private applyBoost(post: Post) {
    const updatedPost = cloneDeep(post);
    updatedPost.reblogged = true;
    updatedPost.reblogsCount++;
    this.updatePost(updatedPost);
  }

  private applyUnboost(post: Post) {
    const updatedPost = cloneDeep(post);
    updatedPost.reblogged = false;
    updatedPost.reblogsCount--;
    this.updatePost(updatedPost);
  }

  increaseRepliesCount(replyingPost: Post) {
    const updatedPost = cloneDeep(replyingPost);
    updatedPost.repliesCount++;
    this.updatePost(updatedPost);
  }

  syncUserMarkOnItem() {
    this.getUserMarkAndPost().subscribe({
      next: ({ shelfMark, userPost }) => {
        if (!this._userMarkPost()) {
          this._comments?.update((posts) => ({
            ...posts,
            data: [userPost, ...posts.data],
          }));
        } else {
          this._comments?.update((comments) => ({
            ...comments,
            data: comments.data.map((p) =>
              p.id === userPost.id ? userPost : p,
            ),
          }));
        }
        this._userMarkPost.set(userPost);
        this.setUserMark(shelfMark);
      },
    });
  }

  syncUserReviewOnItem() {
    this.getUserReviewAndPost().subscribe({
      next: ({ review, userPost }) => {
        if (!this._userReviewPost()) {
          this._reviews?.update((posts) => ({
            ...posts,
            data: [userPost, ...posts.data],
          }));
        } else {
          this._reviews?.update((reviews) => ({
            ...reviews,
            data: reviews.data.map((p) =>
              p.id === userPost.id ? userPost : p,
            ),
          }));
        }
        this._userReviewPost.set(userPost);
        this._userReview.set(review);
      },
    });
  }

  syncUserNoteOnItem(note: Note) {
    this.postService.getPost(note.postId).subscribe({
      next: (post) => {
        if (!this._userNotesPosts().find((p) => p.id === post.id)) {
          this._notes?.update((posts) => ({
            ...posts,
            data: [post, ...posts.data],
          }));
          this._userNotesPosts.update((posts) => [...posts, post]);
          this._userNotes.update((notes) => [...notes, note]);
        } else {
          this._notes?.update((notes) => ({
            ...notes,
            data: notes.data.map((p) => (p.id === post.id ? post : p)),
          }));
          this._userNotesPosts.update((posts) =>
            posts.map((p) => (p.id === post.id ? post : p)),
          );
          this._userNotes.update((notes) =>
            notes.map((n) => (n.uuid === note.uuid ? note : n)),
          );
        }
      },
      error: (e) => console.dir(e),
    });
  }

  private updatePost(post: Post) {
    // Update post in comments if found
    if (this._comments()) {
      this._comments.update((comments) => ({
        ...comments,
        data: comments.data.map((p) => (p.id === post.id ? post : p)),
      }));
    }

    // Update post in reviews if found
    if (this._reviews()) {
      this._reviews.update((reviews) => ({
        ...reviews,
        data: reviews.data.map((p) => (p.id === post.id ? post : p)),
      }));
    }

    // Update post in notes if found
    if (this._notes()) {
      this._notes.update((notes) => ({
        ...notes,
        data: notes.data.map((p) => (p.id === post.id ? post : p)),
      }));
    }

    // Update post in collection posts if found
    this._collectionPosts.update((posts) =>
      posts.map((p) => (p.id === post.id ? post : p)),
    );

    // Update user mark post if it matches
    if (this._userMarkPost()?.id === post.id) {
      this._userMarkPost.set(post);
    }

    // Update user review post if it matches
    if (this._userReviewPost()?.id === post.id) {
      this._userReviewPost.set(post);
    }

    // Update post in user notes posts if found
    this._userNotesPosts.update((posts) =>
      posts.map((p) => (p.id === post.id ? post : p)),
    );
  }
}
