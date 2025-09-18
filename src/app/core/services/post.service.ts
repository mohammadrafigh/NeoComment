import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { PostsResponse, PostsResponseDTO } from "../models/post/posts-response.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PostService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

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
