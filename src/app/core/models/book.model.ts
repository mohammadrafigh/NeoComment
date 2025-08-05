import { TrendingItemDTO, TrendingItem } from "./trending-item.model";

export interface BookDTO extends TrendingItemDTO {
  subtitle: string;
  orig_title: string;
  author: string[];
  translator: string[];
  language: string[];
  pub_house: string;
  pub_year: number;
  pub_month: number;
  binding: string;
  price: string;
  pages: number;
  series: string;
  imprint: string;
  isbn: string;
}

export class Book extends TrendingItem {
  subtitle: string;
  origTitle: string;
  author: string[];
  translator: string[];
  language: string[];
  pubHouse: string;
  pubYear: number;
  pubMonth: number;
  binding: string;
  price: string;
  pages: number;
  series: string;
  imprint: string;
  isbn: string;

  static override fromDTO(dto: BookDTO): Book {
    const book = new Book();
    super.fillFromDTO(book, dto);
    book.subtitle = dto.subtitle;
    book.origTitle = dto.orig_title;
    book.author = dto.author;
    book.translator = dto.translator;
    book.language = dto.language;
    book.pubHouse = dto.pub_house;
    book.pubYear = dto.pub_year;
    book.pubMonth = dto.pub_month;
    book.binding = dto.binding;
    book.price = dto.price;
    book.pages = dto.pages;
    book.series = dto.series;
    book.imprint = dto.imprint;
    book.isbn = dto.isbn;

    return book;
  }
}
