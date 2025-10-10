import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import {
  PostsResponse,
  PostsResponseDTO,
} from "../models/post/posts-response.model";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { Post, PostDTO } from "../models/post/post.model";
import { ShelfMarkDTO } from "../models/post/shelf-mark.model";
import { ReviewDTO } from "../models/post/review.model";
import { NoteDTO } from "../models/post/note.model";
import JSONbig from "json-bigint";

interface UserNotesResponseDTO {
  data: Array<NoteDTO>;
  pages: 0;
  count: 0;
}

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

  getUserMarkOnItem(itemUUID: string): Observable<Post> {
    return (
      this.http
        .get<string>(
          `${this.stateService.instanceURL()}/api/me/shelf/item/${itemUUID}`,
          // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
          { responseType: "text" as "json" },
        )
        // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
        .pipe(
          map(JSONbig({ storeAsString: true, useNativeBigInt: true }).parse),
        )
        .pipe(
          switchMap((shelfMarkDTO: ShelfMarkDTO) => {
            return this.http
              .get<PostDTO>(
                `${this.stateService.instanceURL()}/api/v1/statuses/${shelfMarkDTO.post_id}`,
              )
              .pipe(
                map((postDTO: PostDTO) => {
                  const post = Post.fromDTO(postDTO);
                  post.extNeodb.tag = [
                    {
                      type: shelfMarkDTO.item.category,
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
                      status: shelfMarkDTO.shelf_type,
                    },
                    {
                      type: "Comment",
                      attributedTo: null,
                      href: null,
                      id: null,
                      published: null,
                      updated: null,
                      withRegardTo: null,
                      content: shelfMarkDTO.comment_text,
                    },
                    {
                      type: "Rating",
                      attributedTo: null,
                      href: null,
                      id: null,
                      published: null,
                      updated: null,
                      withRegardTo: null,
                      value: shelfMarkDTO.rating_grade,
                      best: 10, // TODO: Mohammad 09-24-2025: Should be filled by server info
                      worst: 1, // TODO: Mohammad 09-24-2025: Should be filled by server info
                    },
                  ];

                  return post;
                }),
              )
              .pipe(
                catchError((err) => {
                  console.dir(err);
                  return of(null);
                }),
              );
          }),
        )
        .pipe(catchError((err) => of(null)))
    );
  }

  getUserReviewOnItem(itemUUID: string): Observable<Post> {
    return (
      this.http
        .get<string>(
          `${this.stateService.instanceURL()}/api/me/review/item/${itemUUID}`,
          // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
          { responseType: "text" as "json" },
        )
        // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
        .pipe(
          map(JSONbig({ storeAsString: true, useNativeBigInt: true }).parse),
        )
        .pipe(
          switchMap((reviewDTO: ReviewDTO) => {
            return this.http
              .get<PostDTO>(
                `${this.stateService.instanceURL()}/api/v1/statuses/${reviewDTO.post_id}`,
              )
              .pipe(
                map((postDTO: PostDTO) => {
                  const post = Post.fromDTO(postDTO);
                  post.extNeodb.tag = [
                    {
                      type: reviewDTO.item.category,
                      href: null,
                      image: null,
                      name: null,
                    },
                  ];
                  post.extNeodb.relatedWith = [
                    {
                      type: "Review",
                      attributedTo: null,
                      href: reviewDTO.url,
                      id: reviewDTO.url,
                      published: reviewDTO.created_time,
                      updated: null,
                      withRegardTo: null,
                      content: reviewDTO.body,
                      name: reviewDTO.title,
                    },
                  ];

                  return post;
                }),
              )
              .pipe(
                catchError((err) => {
                  console.dir(err);
                  return of(null);
                }),
              );
          }),
        )
        .pipe(catchError((err) => of(null)))
    );
  }

  getUserNotesOnItem(itemUUID: string): Observable<Post[]> {
    return (
      this.http
        .get<string>(
          // Hopefully user doesn't have more than 20 notes on a single item!
          `${this.stateService.instanceURL()}/api/me/note/item/${itemUUID}?page_size=20`,
          // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
          { responseType: "text" as "json" },
        )
        // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
        .pipe(
          map(JSONbig({ storeAsString: true, useNativeBigInt: true }).parse),
        )
        .pipe(
          switchMap((notesResponseDTO: UserNotesResponseDTO) => {
            return forkJoin(
              notesResponseDTO.data.map((noteDTO) =>
                this.http
                  .get<PostDTO>(
                    `${this.stateService.instanceURL()}/api/v1/statuses/${noteDTO.post_id}`,
                  )
                  .pipe(
                    map((postDTO: PostDTO) => {
                      const post = Post.fromDTO(postDTO);
                      post.extNeodb.tag = [
                        {
                          type: noteDTO.item.category,
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
                          id: noteDTO.uuid,
                          published: noteDTO.created_time,
                          updated: null,
                          withRegardTo: null,
                          content: noteDTO.content,
                          title: noteDTO.title,
                          progress: {
                            type: noteDTO.progress_type,
                            value: noteDTO.progress_value,
                          },
                          sensitive: noteDTO.sensitive,
                        },
                      ];

                      return post;
                    }),
                  )
                  .pipe(
                    catchError((err) => {
                      console.dir(err);
                      return of(null);
                    }),
                  ),
              ),
            );
          }),
        )
        .pipe(catchError((err) => of(null)))
    );
  }
}
