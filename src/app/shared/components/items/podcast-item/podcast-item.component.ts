import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { Podcast } from "../../../../core/models/podcast.model";
import { RateIndicatorComponent } from "../../rate-indicator/rate-indicator.component";
import { KiloPipe } from "../../../pipes/kilo.pipe";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { PodcastEpisode } from "~/app/core/models/podcast-episode.model";
import { CATEGORIES } from "~/app/shared/constants/categories";

@Component({
  selector: "ns-podcast-item",
  templateUrl: "./podcast-item.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    KiloPipe,
    NeoDBLocalizePipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PodcastItemComponent {
  @Input() item: Podcast | PodcastEpisode;
  @Input() showIcon = false;
  icon = CATEGORIES.get("podcast").icon;
}
