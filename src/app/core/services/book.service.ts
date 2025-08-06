import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Book, BookDTO } from "../models/book.model";

@Injectable({
  providedIn: "root",
})
export class BookService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getBookDetails(bookUUID: string) {
    this.http
      .get<BookDTO>(`${this.stateService.instanceURL()}/api/book/${bookUUID}`)
      .subscribe({
        next: (bookDTO: BookDTO) => {
          this.stateService.updateBook(Book.fromDTO(bookDTO));
        },
        error: (e) => console.error(e),
      });
  }
}
