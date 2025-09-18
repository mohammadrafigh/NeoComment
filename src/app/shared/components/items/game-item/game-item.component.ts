import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { Game } from "../../../../core/models/game.model";
import { RateIndicatorComponent } from "../../rate-indicator/rate-indicator.component";
import { KiloPipe } from "../../../pipes/kilo.pipe";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";

@Component({
  selector: "ns-game-item",
  templateUrl: "./game-item.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    KiloPipe,
    NeoDBLocalizePipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class GameItemComponent {
  @Input() item: Game;
  @Input() language: string;
}
