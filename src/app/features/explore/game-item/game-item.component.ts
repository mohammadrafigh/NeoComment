import {
  Component,
  Input,
  NO_ERRORS_SCHEMA,
  OnInit,
} from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { TrendingItem } from "../../../core/models/trending-item.model";
import { RateIndicatorComponent } from "../../../shared/rate-indicator/rate-indicator.component";
import { KiloPipe } from "../../../shared/pipes/kilo/kilo.pipe";

@Component({
  selector: "ns-game-item",
  templateUrl: "./game-item.component.html",
  imports: [NativeScriptCommonModule, NativeScriptLocalizeModule, RateIndicatorComponent, KiloPipe],
  schemas: [NO_ERRORS_SCHEMA],
})
export class GameItemComponent implements OnInit {
  @Input() item: TrendingItem;
  @Input() language: string;
  localizedTitle: string;

  ngOnInit() {
    this.localizedTitle = this.item.localizedTitle.find(
      (lt) => lt.lang === this.language,
    )?.text;
  }
}
