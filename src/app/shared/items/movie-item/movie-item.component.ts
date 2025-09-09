import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule, NativeScriptRouterModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { Movie } from "../../../core/models/movie.model";
import { RateIndicatorComponent } from "../../rate-indicator/rate-indicator.component";
import { KiloPipe } from "../../pipes/kilo.pipe";
import { NeoDBLocalizePipe } from "../../pipes/neodb-localize.pipe";

@Component({
  selector: "ns-movie-item",
  templateUrl: "./movie-item.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    NativeScriptRouterModule,
    RateIndicatorComponent,
    KiloPipe,
    NeoDBLocalizePipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class MovieItemComponent {
  @Input() item: Movie;
  @Input() language: string;
}
