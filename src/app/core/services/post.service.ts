import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { Post, PostDTO } from "../models/post/post.model";

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
}
