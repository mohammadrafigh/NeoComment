import {
  computed,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from "@angular/core";
import { StateService } from "~/app/core/services/state.service";
import { PostService } from "~/app/core/services/post.service";
import { ShelfService } from "~/app/core/services/shelf.service";
import { ReviewService } from "~/app/core/services/review.service";
import { NoteService } from "~/app/core/services/note.service";
import { Post } from "~/app/core/models/post/post.model";
import { Note } from "~/app/core/models/post/note.model";
import {
  catchError,
  concatMap,
  finalize,
  forkJoin,
  from,
  map,
  of,
  Subject,
  takeUntil,
  toArray,
} from "rxjs";
import { CollectionService } from "~/app/core/services/collection.service";
import { cloneDeep } from "lodash-es";
import { ItemPostsState } from "./item-posts-state.model";

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

  likingPostIds = signal<string[]>([]);
  boostingPostIds = signal<string[]>([]);

  // ------------- item posts state -------------

  private focusedItemsStack = signal<string[]>([]);
  private focusedItem = computed(() => this.focusedItemsStack().at(-1));
  // TODO: Mohammad 11-11-2025: It should be better to make this public and
  // make itemPosts private, we need more investigations here
  private focusedItemPostsState = computed(
    () => this.itemPosts[this.focusedItemsStack().at(-1)],
  );
  private cancelItemPostsRequests$ = new Subject<void>();
  itemPosts: Record<string, ItemPostsState> = {};

  // ------------- single post state (replies) -------------

  private focusedPostsStack = signal<string[]>([]);
  // TODO: Mohammad 11-11-2025: It should be better to make this public and
  // make postReplies private, we need more investigations here
  private focusedPostState = computed(
    () => this.postReplies[this.focusedPostsStack().at(-1)],
  );
  private cancelPostsRequests$ = new Subject<void>();
  postReplies: Record<string, WritableSignal<Post[]>> = {};

  // ------------- item posts methods -------------

  private initItemPosts(itemUUID: string) {
    if (!this.itemPosts[itemUUID]) {
      this.itemPosts[itemUUID] = new ItemPostsState(
        this.stateService.fediAccount().id,
      );
    }
    this.focusedItemsStack.update((items) => [...items, itemUUID]);
  }

  // Starting point to use in ngOnInit of item pages
  getPostsForItem(itemUUID: string) {
    this.initItemPosts(itemUUID);
    this.getMarks();
    this.getReviews();
    this.getNotes();
    this.getCollections();
  }

  // Starting point to use in ngOnInit of collection page
  getPostForCollection(postId: string) {
    this.initItemPosts(postId);

    return this.postService
      .getPost(postId)
      .pipe(takeUntil(this.cancelItemPostsRequests$))
      .subscribe({
        next: (post) => this.focusedItemPostsState().collectionPost.set(post),
        error: (err) => console.dir(err),
      });
  }

  // NOTE: Important: Always call this on item/collection page destroy
  loadPreviousItemPosts(itemUUID: string) {
    this.cancelItemPostsRequests$.next();
    this.focusedItemsStack.update((items) => items.slice(0, -1));
    if (!this.focusedItemsStack().includes(itemUUID)) {
      delete this.itemPosts[itemUUID];
    }
  }

  private getUserMarkAndPost() {
    const userMark$ = this.shelfService.getMarkByItem(this.focusedItem());
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
      this.focusedItem(),
      "mark",
      page,
    );
    return forkJoin({
      userMarkAndPost: userMarkAndPost$,
      itemMarks: itemMarks$,
    })
      .pipe(takeUntil(this.cancelItemPostsRequests$))
      .subscribe({
        next: ({ userMarkAndPost, itemMarks }) => {
          if (page === 1) {
            const { shelfMark, userPost } = userMarkAndPost ?? {};
            this.focusedItemPostsState().userMarkPost.set(userPost);
            this.focusedItemPostsState().userMark.set(shelfMark);
            this.focusedItemPostsState().comments.set(itemMarks);
          } else {
            this.focusedItemPostsState().comments.update((posts) => ({
              ...itemMarks,
              data: [...posts.data, ...itemMarks.data],
            }));
          }
        },
        error: (err) => console.dir(err),
      });
  }

  private getUserReviewAndPost() {
    const userReview$ = this.reviewService.getReviewByItem(this.focusedItem());
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
      this.focusedItem(),
      "review",
      page,
    );
    return forkJoin({
      userReviewAndPost: userReviewAndPost$,
      itemReviews: itemReviews$,
    })
      .pipe(takeUntil(this.cancelItemPostsRequests$))
      .subscribe({
        next: ({ userReviewAndPost, itemReviews }) => {
          if (page === 1) {
            const { review, userPost } = userReviewAndPost ?? {};
            this.focusedItemPostsState().userReviewPost.set(userPost);
            this.focusedItemPostsState().userReview.set(review);
            this.focusedItemPostsState().reviews.set(itemReviews);
          } else {
            this.focusedItemPostsState().reviews.update((posts) => ({
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
    const userNotes$ = this.noteService.getNotesByItem(this.focusedItem(), 20);
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
      this.focusedItem(),
      "note",
      page,
    );
    return forkJoin({
      userNotesAndPosts: userNotesAndPosts$,
      itemNotes: itemNotes$,
    })
      .pipe(takeUntil(this.cancelItemPostsRequests$))
      .subscribe({
        next: ({ userNotesAndPosts, itemNotes }) => {
          if (page === 1) {
            const { notes, userPosts } = userNotesAndPosts ?? {};
            this.focusedItemPostsState().userNotesPosts.set(userPosts);
            this.focusedItemPostsState().userNotes.set(notes);
            this.focusedItemPostsState().notes.set(itemNotes);
          } else {
            this.focusedItemPostsState().notes.update((posts) => ({
              ...itemNotes,
              data: [...posts.data, ...itemNotes.data],
            }));
          }
        },
        error: (err) => console.dir(err),
      });
  }

  private getCollections() {
    this.postService
      .getItemPosts(this.focusedItem(), "collection")
      .pipe(takeUntil(this.cancelItemPostsRequests$))
      .subscribe({
        next: (response) => {
          const collectionPosts = response.data.slice(0, 10);
          this.focusedItemPostsState().collectionPosts.set(collectionPosts);

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
            .pipe(takeUntil(this.cancelItemPostsRequests$))
            .subscribe({
              next: (collections) =>
                this.focusedItemPostsState().collections.set(collections),
              error: (err) => console.dir(err),
            });
        },
        error: (err) => console.dir(err),
      });
  }

  removeUserMark() {
    this.focusedItemPostsState().comments.update((comments) => ({
      ...comments,
      data: comments.data.filter(
        (p) => p.id !== this.focusedItemPostsState().userMarkPost().id,
      ),
    }));
    this.focusedItemPostsState().userMarkPost.set(null);
    this.focusedItemPostsState().userMark.set(null);
  }

  removeUserReview() {
    this.focusedItemPostsState().reviews.update((reviews) => ({
      ...reviews,
      data: reviews.data.filter(
        (p) => p.id !== this.focusedItemPostsState().userReviewPost().id,
      ),
    }));
    this.focusedItemPostsState().userReviewPost.set(null);
    this.focusedItemPostsState().userReview.set(null);
  }

  removeUserNote(note: Note) {
    this.focusedItemPostsState().notes.update((notes) => ({
      ...notes,
      data: notes.data.filter((n) => n.id !== note.postId),
    }));
    this.focusedItemPostsState().userNotesPosts.update((posts) =>
      posts.filter((p) => p.id !== note.postId),
    );
    this.focusedItemPostsState().userNotes.update((notes) =>
      notes.filter((n) => n.uuid !== note.uuid),
    );
  }

  getUserNoteByPost(notePost?: Post) {
    if (notePost) {
      return this.focusedItemPostsState()
        .userNotes()
        .find((n) => n.postId === notePost.id);
    }
  }

  syncUserMarkOnItem() {
    this.getUserMarkAndPost()
      .pipe(takeUntil(this.cancelItemPostsRequests$))
      .subscribe({
        next: ({ shelfMark, userPost }) => {
          if (!this.focusedItemPostsState().userMarkPost()) {
            this.focusedItemPostsState().comments.update((posts) =>
              posts
                ? {
                    ...posts,
                    data: [userPost, ...posts.data],
                  }
                : {
                    count: 1,
                    pages: 1,
                    data: [userPost],
                  },
            );
          } else {
            this.focusedItemPostsState().comments.update((comments) => ({
              ...comments,
              data: comments.data.map((p) =>
                p.id === userPost.id ? userPost : p,
              ),
            }));
          }
          this.focusedItemPostsState().userMarkPost.set(userPost);
          this.focusedItemPostsState().userMark.set(shelfMark);
        },
      });
  }

  syncUserReviewOnItem() {
    this.getUserReviewAndPost()
      .pipe(takeUntil(this.cancelItemPostsRequests$))
      .subscribe({
        next: ({ review, userPost }) => {
          if (!this.focusedItemPostsState().userReviewPost()) {
            this.focusedItemPostsState().reviews.update((posts) =>
              posts
                ? {
                    ...posts,
                    data: [userPost, ...posts.data],
                  }
                : {
                    count: 1,
                    pages: 1,
                    data: [userPost],
                  },
            );
          } else {
            this.focusedItemPostsState().reviews.update((reviews) => ({
              ...reviews,
              data: reviews.data.map((p) =>
                p.id === userPost.id ? userPost : p,
              ),
            }));
          }
          this.focusedItemPostsState().userReviewPost.set(userPost);
          this.focusedItemPostsState().userReview.set(review);
        },
      });
  }

  syncUserNoteOnItem(note: Note) {
    this.postService
      .getPost(note.postId)
      .pipe(takeUntil(this.cancelItemPostsRequests$))
      .subscribe({
        next: (post) => {
          if (
            !this.focusedItemPostsState()
              .userNotesPosts()
              .find((p) => p.id === post.id)
          ) {
            this.focusedItemPostsState().notes.update((posts) =>
              posts
                ? {
                    ...posts,
                    data: [post, ...posts.data],
                  }
                : {
                    count: 1,
                    pages: 1,
                    data: [post],
                  },
            );
            this.focusedItemPostsState().userNotesPosts.update((posts) => [
              ...posts,
              post,
            ]);
            this.focusedItemPostsState().userNotes.update((notes) => [
              ...notes,
              note,
            ]);
          } else {
            this.focusedItemPostsState().notes.update((notes) => ({
              ...notes,
              data: notes.data.map((p) => (p.id === post.id ? post : p)),
            }));
            this.focusedItemPostsState().userNotesPosts.update((posts) =>
              posts.map((p) => (p.id === post.id ? post : p)),
            );
            this.focusedItemPostsState().userNotes.update((notes) =>
              notes.map((n) => (n.uuid === note.uuid ? note : n)),
            );
          }
        },
        error: (e) => console.dir(e),
      });
  }

  getMarkPostById(postId: string): Post {
    if (this.focusedItemPostsState().userMarkPost()?.id === postId) {
      return this.focusedItemPostsState().userMarkPost();
    } else {
      return this.focusedItemPostsState()
        .comments()
        ?.data.find((p) => p.id === postId);
    }
  }

  getReviewPostById(postId: string): Post {
    if (this.focusedItemPostsState().userReviewPost()?.id === postId) {
      return this.focusedItemPostsState().userReviewPost();
    } else {
      return this.focusedItemPostsState()
        .reviews()
        ?.data.find((p) => p.id === postId);
    }
  }

  getNotePostById(postId: string): Post {
    return (
      this.focusedItemPostsState()
        .userNotesPosts()
        .find((p) => p.id === postId) ??
      this.focusedItemPostsState()
        .notes()
        ?.data.find((p) => p.id === postId)
    );
  }

  getCollectionPostById(postId: string): Post {
    return this.focusedItemPostsState().collectionPost();
  }

  // ------------- single post methods (replies) -------------

  private initPostReplies(post: Post) {
    if (!this.postReplies[post.id]) {
      this.postReplies[post.id] = signal<Post[]>([post]);
    }
    this.focusedPostsStack.update((posts) => [...posts, post.id]);
  }

  // Starting point to use in ngOnInit of replies page
  getRepliesForPost(post: Post) {
    this.initPostReplies(post);

    return this.postService
      .getPostReplies(post.id)
      .pipe(takeUntil(this.cancelPostsRequests$))
      .subscribe({
        next: (replies) => {
          this.focusedPostState().update((posts) => [
            ...replies.ancestors,
            ...posts,
            ...replies.descendants,
          ]);
        },
        error: (e) => console.dir("Error fetching replies:", e),
      });
  }

  // NOTE: Important: Always call this on replies page destroy
  loadPreviousPostReplies(postId: string) {
    this.cancelPostsRequests$.next();
    this.focusedPostsStack.update((posts) => posts.slice(0, -1));
    if (!this.focusedPostsStack().includes(postId)) {
      delete this.postReplies[postId];
    }
  }

  removeReply(post: Post) {
    for (const postId in this.postReplies) {
      this.postReplies[postId].update((posts) =>
        posts.filter((p) => p.id !== post.id),
      );
    }
    for (const postId in this.postReplies) {
      let parent = this.postReplies[postId]().find(
        (p) => post.inReplyToId === p.id,
      );
      if (parent) {
        this.decreaseRepliesCount(parent);
        break;
      }
    }
  }

  syncReply(post: Post) {
    if (!this.focusedPostState()().find((p) => p.id === post.id)) {
      this.focusedPostState().update((posts) => [...posts, post]);
      const parent = this.focusedPostState()().find(
        (p) => post.inReplyToId === p.id,
      );
      if (parent) {
        this.increaseRepliesCount(parent);
      }
    } else {
      this.updatePost(post);
    }
  }

  // ------------- shared methods -------------

  toggleLike(post: Post) {
    this.likingPostIds.update((ids) => [...ids, post.id]);
    if (post.favourited) {
      this.applyUnlike(post);
      this.postService
        .unlikePost(post.id)
        .pipe(
          finalize(() =>
            this.likingPostIds.update((ids) =>
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
            this.likingPostIds.update((ids) =>
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
    this.boostingPostIds.update((ids) => [...ids, post.id]);
    if (post.reblogged) {
      this.applyUnboost(post);
      this.postService
        .unboostPost(post.id)
        .pipe(
          finalize(() =>
            this.boostingPostIds.update((ids) =>
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
            this.boostingPostIds.update((ids) =>
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

  decreaseRepliesCount(replyingPost: Post) {
    const updatedPost = cloneDeep(replyingPost);
    updatedPost.repliesCount--;
    this.updatePost(updatedPost);
  }

  private updatePost(post: Post) {
    // Update post in comments if found
    if (this.focusedItemPostsState()?.comments()) {
      this.focusedItemPostsState()?.comments.update((comments) => ({
        ...comments,
        data: comments.data.map((p) => (p.id === post.id ? post : p)),
      }));
    }

    // Update post in reviews if found
    if (this.focusedItemPostsState()?.reviews()) {
      this.focusedItemPostsState()?.reviews.update((reviews) => ({
        ...reviews,
        data: reviews.data.map((p) => (p.id === post.id ? post : p)),
      }));
    }

    // Update post in notes if found
    if (this.focusedItemPostsState()?.notes()) {
      this.focusedItemPostsState()?.notes.update((notes) => ({
        ...notes,
        data: notes.data.map((p) => (p.id === post.id ? post : p)),
      }));
    }

    // Update post in collection posts if found
    this.focusedItemPostsState()?.collectionPosts.update((posts) =>
      posts.map((p) => (p.id === post.id ? post : p)),
    );

    // Update user mark post if it matches
    if (this.focusedItemPostsState()?.userMarkPost()?.id === post.id) {
      this.focusedItemPostsState()?.userMarkPost.set(post);
    }

    // Update user review post if it matches
    if (this.focusedItemPostsState()?.userReviewPost()?.id === post.id) {
      this.focusedItemPostsState()?.userReviewPost.set(post);
    }

    // Update post in user notes posts if found
    this.focusedItemPostsState()?.userNotesPosts.update((posts) =>
      posts.map((p) => (p.id === post.id ? post : p)),
    );

    // Update collection post if it matches
    if (this.focusedItemPostsState()?.collectionPost()?.id === post.id) {
      this.focusedItemPostsState()?.collectionPost.set(post);
    }

    for (const postId in this.postReplies) {
      this.postReplies[postId].update((posts) =>
        posts.map((p) => (p.id === post.id ? post : p)),
      );
    }
  }
}
