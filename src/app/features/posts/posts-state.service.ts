import { computed, inject, Injectable, signal } from "@angular/core";
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

  // ------------- item posts state -------------
  private focusedItemsStack = signal<string[]>([]);
  private focusedItem = computed(() => this.focusedItemsStack().at(-1));
  private focusedItemPosts = computed(
    () => this.itemPosts[this.focusedItemsStack().at(-1)],
  );
  itemPosts: Record<string, ItemPostsState> = {};
  likingPostIds = signal<string[]>([]);
  boostingPostIds = signal<string[]>([]);

  private init(itemUUID: string) {
    if (!this.itemPosts[itemUUID]) {
      this.itemPosts[itemUUID] = new ItemPostsState(
        this.stateService.fediAccount().id,
      );
    }
    this.focusedItemsStack.update((items) => [...items, itemUUID]);
  }

  getPostsForItem(itemUUID: string) {
    this.init(itemUUID);
    this.getMarks();
    this.getReviews();
    this.getNotes();
    this.getCollections();
  }

  loadPreviousItemPosts(itemUUID: string) {
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
    }).subscribe({
      next: ({ userMarkAndPost, itemMarks }) => {
        if (page === 1) {
          const { shelfMark, userPost } = userMarkAndPost ?? {};
          this.focusedItemPosts().userMarkPost.set(userPost);
          this.focusedItemPosts().userMark.set(shelfMark);
          this.focusedItemPosts().comments.set(itemMarks);
        } else {
          this.focusedItemPosts().comments.update((posts) => ({
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
    }).subscribe({
      next: ({ userReviewAndPost, itemReviews }) => {
        if (page === 1) {
          const { review, userPost } = userReviewAndPost ?? {};
          this.focusedItemPosts().userReviewPost.set(userPost);
          this.focusedItemPosts().userReview.set(review);
          this.focusedItemPosts().reviews.set(itemReviews);
        } else {
          this.focusedItemPosts().reviews.update((posts) => ({
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
    }).subscribe({
      next: ({ userNotesAndPosts, itemNotes }) => {
        if (page === 1) {
          const { notes, userPosts } = userNotesAndPosts ?? {};
          this.focusedItemPosts().userNotesPosts.set(userPosts);
          this.focusedItemPosts().userNotes.set(notes);
          this.focusedItemPosts().notes.set(itemNotes);
        } else {
          this.focusedItemPosts().notes.update((posts) => ({
            ...itemNotes,
            data: [...posts.data, ...itemNotes.data],
          }));
        }
      },
      error: (err) => console.dir(err),
    });
  }

  private getCollections() {
    this.postService.getItemPosts(this.focusedItem(), "collection").subscribe({
      next: (response) => {
        const collectionPosts = response.data.slice(0, 10);
        this.focusedItemPosts().collectionPosts.set(collectionPosts);

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
            next: (collections) =>
              this.focusedItemPosts().collections.set(collections),
            error: (err) => console.dir(err),
          });
      },
      error: (err) => console.dir(err),
    });
  }

  removeUserMark() {
    this.focusedItemPosts().comments.update((comments) => ({
      ...comments,
      data: comments.data.filter(
        (p) => p.id !== this.focusedItemPosts().userMarkPost().id,
      ),
    }));
    this.focusedItemPosts().userMarkPost.set(null);
    this.focusedItemPosts().userMark.set(null);
  }

  removeUserReview() {
    this.focusedItemPosts().reviews.update((reviews) => ({
      ...reviews,
      data: reviews.data.filter(
        (p) => p.id !== this.focusedItemPosts().userReviewPost().id,
      ),
    }));
    this.focusedItemPosts().userReviewPost.set(null);
    this.focusedItemPosts().userReview.set(null);
  }

  removeUserNote(note: Note) {
    this.focusedItemPosts().notes.update((notes) => ({
      ...notes,
      data: notes.data.filter((n) => n.id !== note.postId),
    }));
    this.focusedItemPosts().userNotesPosts.update((posts) =>
      posts.filter((p) => p.id !== note.postId),
    );
    this.focusedItemPosts().userNotes.update((notes) =>
      notes.filter((n) => n.uuid !== note.uuid),
    );
  }

  getUserNoteByPost(notePost?: Post) {
    if (notePost) {
      return this.focusedItemPosts()
        .userNotes()
        .find((n) => n.postId === notePost.id);
    }
  }

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

  syncUserMarkOnItem() {
    this.getUserMarkAndPost().subscribe({
      next: ({ shelfMark, userPost }) => {
        if (!this.focusedItemPosts().userMarkPost()) {
          this.focusedItemPosts().comments?.update((posts) => ({
            ...posts,
            data: [userPost, ...posts.data],
          }));
        } else {
          this.focusedItemPosts().comments?.update((comments) => ({
            ...comments,
            data: comments.data.map((p) =>
              p.id === userPost.id ? userPost : p,
            ),
          }));
        }
        this.focusedItemPosts().userMarkPost.set(userPost);
        this.focusedItemPosts().userMark.set(shelfMark);
      },
    });
  }

  syncUserReviewOnItem() {
    this.getUserReviewAndPost().subscribe({
      next: ({ review, userPost }) => {
        if (!this.focusedItemPosts().userReviewPost()) {
          this.focusedItemPosts().reviews?.update((posts) => ({
            ...posts,
            data: [userPost, ...posts.data],
          }));
        } else {
          this.focusedItemPosts().reviews?.update((reviews) => ({
            ...reviews,
            data: reviews.data.map((p) =>
              p.id === userPost.id ? userPost : p,
            ),
          }));
        }
        this.focusedItemPosts().userReviewPost.set(userPost);
        this.focusedItemPosts().userReview.set(review);
      },
    });
  }

  syncUserNoteOnItem(note: Note) {
    this.postService.getPost(note.postId).subscribe({
      next: (post) => {
        if (
          !this.focusedItemPosts()
            .userNotesPosts()
            .find((p) => p.id === post.id)
        ) {
          this.focusedItemPosts().notes?.update((posts) => ({
            ...posts,
            data: [post, ...posts.data],
          }));
          this.focusedItemPosts().userNotesPosts.update((posts) => [
            ...posts,
            post,
          ]);
          this.focusedItemPosts().userNotes.update((notes) => [...notes, note]);
        } else {
          this.focusedItemPosts().notes?.update((notes) => ({
            ...notes,
            data: notes.data.map((p) => (p.id === post.id ? post : p)),
          }));
          this.focusedItemPosts().userNotesPosts.update((posts) =>
            posts.map((p) => (p.id === post.id ? post : p)),
          );
          this.focusedItemPosts().userNotes.update((notes) =>
            notes.map((n) => (n.uuid === note.uuid ? note : n)),
          );
        }
      },
      error: (e) => console.dir(e),
    });
  }

  private updatePost(post: Post) {
    // Update post in comments if found
    if (this.focusedItemPosts().comments()) {
      this.focusedItemPosts().comments.update((comments) => ({
        ...comments,
        data: comments.data.map((p) => (p.id === post.id ? post : p)),
      }));
    }

    // Update post in reviews if found
    if (this.focusedItemPosts().reviews()) {
      this.focusedItemPosts().reviews.update((reviews) => ({
        ...reviews,
        data: reviews.data.map((p) => (p.id === post.id ? post : p)),
      }));
    }

    // Update post in notes if found
    if (this.focusedItemPosts().notes()) {
      this.focusedItemPosts().notes.update((notes) => ({
        ...notes,
        data: notes.data.map((p) => (p.id === post.id ? post : p)),
      }));
    }

    // Update post in collection posts if found
    this.focusedItemPosts().collectionPosts.update((posts) =>
      posts.map((p) => (p.id === post.id ? post : p)),
    );

    // Update user mark post if it matches
    if (this.focusedItemPosts().userMarkPost()?.id === post.id) {
      this.focusedItemPosts().userMarkPost.set(post);
    }

    // Update user review post if it matches
    if (this.focusedItemPosts().userReviewPost()?.id === post.id) {
      this.focusedItemPosts().userReviewPost.set(post);
    }

    // Update post in user notes posts if found
    this.focusedItemPosts().userNotesPosts.update((posts) =>
      posts.map((p) => (p.id === post.id ? post : p)),
    );
  }

  getMarkPostById(postId: string): Post {
    return this.focusedItemPosts()
      .comments()
      ?.data.find((p) => p.id === postId);
  }

  getReviewPostById(postId: string): Post {
    return this.focusedItemPosts()
      .reviews()
      ?.data.find((p) => p.id === postId);
  }

  getNotePostById(postId: string): Post {
    return this.focusedItemPosts()
      .notes()
      ?.data.find((p) => p.id === postId);
  }
}
