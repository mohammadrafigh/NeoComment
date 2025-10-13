import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import {
  PostsResponse,
  PostsResponseDTO,
} from "../models/post/posts-response.model";
import { forkJoin, map, Observable } from "rxjs";
import { Post, PostDTO } from "../models/post/post.model";
import { ShelfMark } from "../models/post/shelf-mark.model";
import { Review } from "../models/post/review.model";
import { Note } from "../models/post/note.model";

@Injectable({
  providedIn: "root",
})
export class PostService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

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
}
