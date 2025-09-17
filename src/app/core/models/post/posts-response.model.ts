import { Post, PostDTO } from "./post.model";

export interface PostsResponseDTO {
  data: Array<PostDTO>;
  pages: 0;
  count: 0;
}

export class PostsResponse {
  data: Array<Post>;
  pages: number;
  count: number;

  static fromDTO(dto: PostsResponseDTO): PostsResponse {
    const postsResponse = new PostsResponse();
    postsResponse.data = dto.data.map(Post.fromDTO);
    postsResponse.pages = dto.pages;
    postsResponse.count = dto.count;

    return postsResponse;
  }
}
