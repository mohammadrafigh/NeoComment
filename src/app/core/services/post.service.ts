import { inject, Injectable, ViewContainerRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import {
  PostsResponse,
  PostsResponseDTO,
} from "../models/post/posts-response.model";
import { forkJoin, map, Observable, tap } from "rxjs";
import { Post, PostDTO } from "../models/post/post.model";
import { ShelfMark } from "../models/post/shelf-mark.model";
import { Review } from "../models/post/review.model";
import { Note } from "../models/post/note.model";
import { Status } from "../models/post/status.model";
import { PostReplyComponent } from "../../shared/components/post/post-reply/post-reply.component";
import {
  BottomSheetOptions,
  BottomSheetService,
} from "@nativescript-community/ui-material-bottomsheet/angular";

@Injectable({
  providedIn: "root",
})
export class PostService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);
  private bottomSheet = inject(BottomSheetService);

  getPost(id: string) {
    return this.http
      .get<PostDTO>(`${this.stateService.instanceURL()}/api/v1/statuses/${id}`)
      .pipe(
        map((postDTO: PostDTO) => {
          return Post.fromDTO(postDTO);
        }),
      );
  }

  getItemPosts(
    itemUUID: string,
    type: "comment" | "review" | "collection" | "note" | "mark",
    page?: number,
  ) {
    let queryString = `?type=${type}`;
    if (page) {
      queryString = `${queryString}&page=${page}`;
    }

    return this.http
      .get<PostsResponseDTO>(
        `${this.stateService.instanceURL()}/api/item/${itemUUID}/posts/${queryString}`,
      )
      .pipe(
        map((postResponseDTO: PostsResponseDTO) => {
          return PostsResponse.fromDTO(postResponseDTO);
        }),
      );
  }

  getPostForMark(shelfMark: ShelfMark): Observable<Post> {
    return this.http
      .get<PostDTO>(
        `${this.stateService.instanceURL()}/api/v1/statuses/${shelfMark.postId}`,
      )
      .pipe(
        map((postDTO: PostDTO) => {
          const post = Post.fromDTO(postDTO);
          post.extNeodb.tag = [
            {
              type: shelfMark.item.category,
              href: null,
              image: null,
              name: null,
            },
          ];
          post.extNeodb.relatedWith = [
            {
              type: "Status",
              attributedTo: null,
              href: null,
              id: null,
              published: null,
              updated: null,
              withRegardTo: null,
              status: shelfMark.shelfType,
            },
            {
              type: "Comment",
              attributedTo: null,
              href: null,
              id: null,
              published: null,
              updated: null,
              withRegardTo: null,
              content: shelfMark.commentText,
            },
            {
              type: "Rating",
              attributedTo: null,
              href: null,
              id: null,
              published: null,
              updated: null,
              withRegardTo: null,
              value: shelfMark.ratingGrade,
              best: 10, // TODO: Mohammad 09-24-2025: Should be filled by server info
              worst: 1, // TODO: Mohammad 09-24-2025: Should be filled by server info
            },
          ];

          return post;
        }),
      );
  }

  getPostForReview(review: Review): Observable<Post> {
    return this.http
      .get<PostDTO>(
        `${this.stateService.instanceURL()}/api/v1/statuses/${review.postId}`,
      )
      .pipe(
        map((postDTO: PostDTO) => {
          const post = Post.fromDTO(postDTO);
          post.extNeodb.tag = [
            {
              type: review.item.category,
              href: null,
              image: null,
              name: null,
            },
          ];
          post.extNeodb.relatedWith = [
            {
              type: "Review",
              attributedTo: null,
              href: review.url,
              id: review.url,
              published: review.createdTime,
              updated: null,
              withRegardTo: null,
              content: review.body,
              name: review.title,
            },
          ];

          return post;
        }),
      );
  }

  getPostsForNotes(notes: Note[]): Observable<Post[]> {
    return forkJoin(
      notes.map((note) =>
        this.http
          .get<PostDTO>(
            `${this.stateService.instanceURL()}/api/v1/statuses/${note.postId}`,
          )
          .pipe(
            map((postDTO: PostDTO) => {
              const post = Post.fromDTO(postDTO);
              post.extNeodb.tag = [
                {
                  type: note.item.category,
                  href: null,
                  image: null,
                  name: null,
                },
              ];
              post.extNeodb.relatedWith = [
                {
                  type: "Note",
                  attributedTo: null,
                  href: null,
                  id: note.uuid,
                  published: note.createdTime,
                  updated: null,
                  withRegardTo: null,
                  content: note.content,
                  title: note.title,
                  progress: {
                    type: note.progressType,
                    value: note.progressValue,
                  },
                  sensitive: note.sensitive,
                },
              ];

              return post;
            }),
          ),
      ),
    );
  }

  likePost(id: string) {
    return this.http.post<any>(
      `${this.stateService.instanceURL()}/api/v1/statuses/${id}/favourite`,
      null,
    );
  }

  unlikePost(id: string) {
    return this.http.post<any>(
      `${this.stateService.instanceURL()}/api/v1/statuses/${id}/unfavourite`,
      null,
    );
  }

  boostPost(id: string, visibility?: "public" | "unlisted" | "private") {
    return this.http.post<any>(
      `${this.stateService.instanceURL()}/api/v1/statuses/${id}/reblog`,
      { visibility },
    );
  }

  unboostPost(id: string) {
    return this.http.post<any>(
      `${this.stateService.instanceURL()}/api/v1/statuses/${id}/unreblog`,
      null,
    );
  }

  // ----------------------- Reply (status post) -----------------------
  publishPost(status: Status): Observable<Post> {
    return this.http
      .post<PostDTO>(
        `${this.stateService.instanceURL()}/api/v1/statuses`,
        Status.toDTO(status),
      )
      .pipe(
        map((postDTO: PostDTO) => {
          return Post.fromDTO(postDTO);
        }),
      )
      .pipe(tap({ error: (err) => console.dir(err) }));
  }

  updatePost(status: Status): Observable<Post> {
    return this.http
      .put<PostDTO>(
        `${this.stateService.instanceURL()}/api/v1/statuses/${status.id}`,
        Status.toDTO(status),
      )
      .pipe(
        map((postDTO: PostDTO) => {
          return Post.fromDTO(postDTO);
        }),
      )
      .pipe(tap({ error: (err) => console.dir(err) }));
  }

  removePost(postId: string): Observable<Post> {
    return this.http
      .delete<PostDTO>(
        `${this.stateService.instanceURL()}/api/v1/statuses/${postId}`,
      )
      .pipe(
        map((postDTO: PostDTO) => {
          return Post.fromDTO(postDTO);
        }),
      )
      .pipe(tap({ error: (err) => console.dir(err) }));
  }

  showPostSheet(
    containerRef: ViewContainerRef,
    replyingPost: Post,
    status?: Status,
  ) {
    const options: BottomSheetOptions = {
      viewContainerRef: containerRef,
      context: { status, replyingPost },
      dismissOnDraggingDownSheet: false,
      transparent: true,
    };

    return this.bottomSheet.show(PostReplyComponent, options);
  }
  // -------------------------------------------------------------------
}
