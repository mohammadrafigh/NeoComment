import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Book, BookDTO } from "../models/book.model";
import { map } from "rxjs";

interface BookSiblingsResponseDTO {
  data: BookDTO[];
  pages: number;
  count: number;
}

export interface BookSiblingsResponse {
  data: Book[];
  pages: number;
  count: number;
}

@Injectable({
  providedIn: "root",
})
export class BookService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getBookDetails(bookUUID: string) {
    return this.http
      .get<BookDTO>(`${this.stateService.instanceURL()}/api/book/${bookUUID}`)
      .pipe(map((bookDTO: BookDTO) => Book.fromDTO(bookDTO)));
  }

  getBookSiblings(bookUUID: string, page: number) {
    return this.http
      .get<BookSiblingsResponseDTO>(
        `${this.stateService.instanceURL()}/api/book/${bookUUID}/sibling/?page=${page}`,
      )
      .pipe(
        map((bookSiblingsResDTO) => ({
          ...bookSiblingsResDTO,
          data: bookSiblingsResDTO.data.map((b) => Book.fromDTO(b)),
        })),
      );
  }

  getTrendingBookDetails(bookUUID: string) {
    this.getBookDetails(bookUUID).subscribe({
      next: (book: Book) => {
        this.stateService.updateBook(book);
      },
      error: (e) => console.error(e),
    });
  }
}
