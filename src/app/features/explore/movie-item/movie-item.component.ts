import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { TrendingItem } from "../../../core/models/trending-item.model";
import { RateIndicatorComponent } from "../../../shared/rate-indicator/rate-indicator.component";
import { KiloPipe } from "../../../shared/pipes/kilo.pipe";
import { NeoDBLocalizePipe } from "../../../shared/pipes/neodb-localize.pipe";

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
  @Input() item: TrendingItem;
  @Input() language: string;
}
