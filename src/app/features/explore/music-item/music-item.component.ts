import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { Music } from "../../../core/models/music.model";
import { RateIndicatorComponent } from "../../../shared/rate-indicator/rate-indicator.component";
import { KiloPipe } from "../../../shared/pipes/kilo.pipe";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";

@Component({
  selector: "ns-music-item",
  templateUrl: "./music-item.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    KiloPipe,
    NeoDBLocalizePipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class MusicItemComponent {
  @Input() item: Music;
  @Input() language: string;
}
