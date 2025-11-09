import {
  Component,
  inject,
  Input,
  NO_ERRORS_SCHEMA,
  OnChanges,
  signal,
  SimpleChanges,
} from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { Series } from "../../../../core/models/series.model";
import { RateIndicatorComponent } from "../../rate-indicator/rate-indicator.component";
import { KiloPipe } from "../../../pipes/kilo.pipe";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { SeriesSeason } from "~/app/core/models/series-season.model";
import { SeriesEpisode } from "~/app/core/models/series-episode.model";
import { localize } from "@nativescript/localize";

@Component({
  selector: "ns-series-item",
  templateUrl: "./series-item.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    KiloPipe,
  ],
  providers: [NeoDBLocalizePipe],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SeriesItemComponent implements OnChanges {
  @Input() item: Series | SeriesSeason | SeriesEpisode;
  private neoL = inject(NeoDBLocalizePipe);
  title = signal<string>("");
  subtitle = signal<string>("");

  ngOnChanges(changes: SimpleChanges): void {
    if (this.item) {
      if (this.item.type === "TVSeason") {
        const item = this.item as SeriesSeason;
        const mainTitle =
          this.neoL.transform(item.localizedTitle) ||
          item.displayTitle ||
          item.title;
        if (
          !mainTitle.includes(
            `${localize("features.movie_series.season")} ${item.seasonNumber || 0}`,
          )
        ) {
          this.title.set(
            `${mainTitle} - ${localize("features.movie_series.season")} ${item.seasonNumber || 0}`,
          );
        } else {
          this.title.set(mainTitle);
        }

        const episodeCount = item.episodeUUIDs?.length || item.episodeCount;
        const subtitle = [
          item.year,
          episodeCount
            ? `${episodeCount} ${localize(episodeCount === 1 ? "features.movie_series.episode" : "features.movie_series.episodes")}`
            : undefined,
        ]
          .filter((t) => t)
          .join(" - ");
        this.subtitle.set(subtitle);
      } else if (this.item.type === "TVEpisode") {
        const item = this.item as SeriesEpisode;
        this.title.set(
          this.neoL.transform(item.localizedTitle) ||
            item.displayTitle ||
            item.title,
        );

        this.subtitle.set(
          `${localize("features.movie_series.episode")} ${item.episodeNumber || 0}`,
        );
      } else {
        const item = this.item as Series;
        this.title.set(
          this.neoL.transform(item.localizedTitle) ||
            item.displayTitle ||
            item.title,
        );

        const seasonCount = item.seasonUUIDs?.length || item.seasonCount;
        const subtitle = [
          item.year,
          seasonCount
            ? `${seasonCount} ${localize(seasonCount === 1 ? "features.movie_series.season" : "features.movie_series.seasons")}`
            : undefined,
        ]
          .filter((t) => t)
          .join(" - ");
        this.subtitle.set(subtitle);
      }
    }
  }
}
