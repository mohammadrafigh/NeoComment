import { computed, signal } from "@angular/core";
import { localize } from "@nativescript/localize";
import { Collection } from "~/app/core/models/collection.model";
import { Note } from "~/app/core/models/post/note.model";
import { Post } from "~/app/core/models/post/post.model";
import { PostsResponse } from "~/app/core/models/post/posts-response.model";
import { Review } from "~/app/core/models/post/review.model";
import { ShelfMark } from "~/app/core/models/post/shelf-mark.model";

export class ItemPostsState {
  private fediAccountId: string;
  comments = signal<PostsResponse>(null);
  reviews = signal<PostsResponse>(null);
  notes = signal<PostsResponse>(null);
  collectionPosts = signal<Post[]>([]);
  collections = signal<Collection[]>([]);
  userMark = signal<ShelfMark>(null);
  userMarkPost = signal<Post>(null);
  userReview = signal<Review>(null);
  userReviewPost = signal<Post>(null);
  userNotes = signal<Note[]>([]);
  userNotesPosts = signal<Post[]>([]);

  userStatus = computed(() => this.setUserStatus(this.userMark()));
  commentsOverview = computed(() =>
    this.processPostsOverview(this.userMarkPost(), this.comments()?.data),
  );
  reviewsOverview = computed(() =>
    this.processPostsOverview(this.userReviewPost(), this.reviews()?.data),
  );
  notesOverview = computed(() =>
    this.processNotesOverview(this.userNotesPosts(), this.notes()?.data),
  );
  hasMoreComments = computed(() => this.comments()?.data.length > 3);
  hasMoreReviews = computed(() => this.reviews()?.data.length > 3);
  hasMoreNotes = computed(() => this.notes()?.data.length > 3);

  constructor(fediAccountId: string) {
    this.fediAccountId = fediAccountId;
  }

  private processPostsOverview(userPost: Post, posts: Post[]) {
    const processedPosts = (posts ?? [])
      .slice(0, 3)
      .filter((p) => p.account.id !== this.fediAccountId);
    if (userPost) {
      processedPosts.unshift(userPost);
    }

    return processedPosts;
  }

  private processNotesOverview(userNotes: Post[], notes: Post[]) {
    let processedPosts = (notes ?? [])
      .slice(0, 3)
      .filter((n) => n.account.id !== this.fediAccountId);
    // NeoDB returns notes from older to newer so we reverse them
    processedPosts = [...userNotes.slice().reverse(), ...processedPosts];

    return processedPosts;
  }

  private setUserStatus(userMark: ShelfMark) {
    if (!userMark) {
      return null;
    }

    switch (userMark.shelfType) {
      case "wishlist":
        return localize(`features.${userMark.item.category}.to_do`);
      case "progress":
        return localize(`features.${userMark.item.category}.doing`);
      case "complete":
        return localize(`features.${userMark.item.category}.did`);
      case "dropped":
        return localize("common.stopped");
      default:
        return null;
    }
  }
}
