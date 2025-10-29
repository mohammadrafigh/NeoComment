import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { map, Observable, tap } from "rxjs";
import JSONbig from "json-bigint";
import { Review, ReviewDTO } from "../models/post/review.model";

@Injectable({
  providedIn: "root",
})
export class ReviewService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getReviewByItem(itemUUID: string): Observable<Review> {
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
          map((reviewDTO: ReviewDTO) => {
            return Review.fromDTO(reviewDTO);
          }),
        )
    );
  }

  saveReview(
    itemUUID: string,
    review: Review,
  ): Observable<{ message: string }> {
    return this.http
      .post<{
        message: string;
      }>(
        `${this.stateService.instanceURL()}/api/me/review/item/${itemUUID}`,
        Review.toDTO(review),
      )
      .pipe(tap({ error: (err) => console.dir(err) }));
  }

  removeReview(itemUUID: string): Observable<{ message: string }> {
    return this.http
      .delete<{
        message: string;
      }>(`${this.stateService.instanceURL()}/api/me/review/item/${itemUUID}`)
      .pipe(tap({ error: (err) => console.dir(err) }));
  }
}
