import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Book, BookDTO } from "../models/book.model";
import { map } from "rxjs";

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

  getTrendingBookDetails(bookUUID: string) {
    this.getBookDetails(bookUUID).subscribe({
      next: (book: Book) => {
        this.stateService.updateBook(book);
      },
      error: (e) => console.error(e),
    });
  }
}
