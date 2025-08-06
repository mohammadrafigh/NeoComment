import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { RateIndicatorComponent } from "../../../shared/rate-indicator/rate-indicator.component";
import { Book } from "~/app/core/models/book.model";
import { KiloPipe } from "../../../shared/pipes/kilo.pipe";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";

@Component({
  selector: "ns-book-item",
  templateUrl: "./book-item.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    KiloPipe,
    NeoDBLocalizePipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class BookItemComponent {
  @Input() item: Book;
  @Input() language: string;
}
