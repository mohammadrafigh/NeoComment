import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { Series } from "../../../../core/models/series.model";
import { RateIndicatorComponent } from "../../rate-indicator/rate-indicator.component";
import { KiloPipe } from "../../../pipes/kilo.pipe";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";

@Component({
  selector: "ns-series-item",
  templateUrl: "./series-item.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    KiloPipe,
    NeoDBLocalizePipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SeriesItemComponent {
  @Input() item: Series;
}
