import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { Movie } from "../../../../core/models/movie.model";
import { RateIndicatorComponent } from "../../rate-indicator/rate-indicator.component";
import { KiloPipe } from "../../../pipes/kilo.pipe";
import { NeoDBLocalizePipe } from "../../../pipes/neodb-localize.pipe";
import { CATEGORIES } from "~/app/shared/constants/categories";

@Component({
  selector: "ns-movie-item",
  templateUrl: "./movie-item.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    KiloPipe,
    NeoDBLocalizePipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class MovieItemComponent {
  @Input() item: Movie;
  @Input() showIcon = false;
  icon = CATEGORIES.get("movie").icon;
}
