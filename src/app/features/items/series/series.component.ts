import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
  WritableSignal,
  computed,
  inject,
  signal,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { CollectionItemComponent } from "../../../shared/components/items/collection-item/collection-item.component";
import { finalize, forkJoin, Observable } from "rxjs";
import { localize } from "@nativescript/localize";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { KiloPipe } from "~/app/shared/pipes/kilo.pipe";
import { RateIndicatorComponent } from "~/app/shared/components/rate-indicator/rate-indicator.component";
import { IconTextButtonComponent } from "~/app/shared/components/icon-text-button/icon-text-button.component";
import { ExternalResourcesComponent } from "~/app/shared/components/external-resources/external-resources.component";
import { BaseItemPageComponent } from "../base-item-page.component";
import { Series } from "~/app/core/models/series.model";
import { SeriesService } from "~/app/core/services/series.service";
import { FeedbackSectionComponent } from "../feedback-section/feedback-section.component";
import { SeriesSeason } from "~/app/core/models/series-season.model";
import { SeriesItemComponent } from "~/app/shared/components/items/series-item/series-item.component";
import { PageTransition, SharedTransition } from "@nativescript/core";
import { SeriesEpisode } from "~/app/core/models/series-episode.model";

@Component({
  selector: "ns-series",
  templateUrl: "./series.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    RateIndicatorComponent,
    IconTextButtonComponent,
    CollectionItemComponent,
    ExternalResourcesComponent,
    NeoDBLocalizePipe,
    KiloPipe,
    FeedbackSectionComponent,
    SeriesItemComponent,
  ],
  providers: [NeoDBLocalizePipe],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeriesComponent extends BaseItemPageComponent implements OnInit {
  seriesService = inject(SeriesService);
  item = signal<Series | SeriesSeason | SeriesEpisode>(null);
  customTitle = computed(() => {
    if (
      this.item() &&
      this.isSeason(this.item) &&
      !this.itemTitle().includes(
        `${localize("features.movie_series.season")} ${this.item().seasonNumber || 0}`,
      )
    ) {
      return `${this.itemTitle()} - ${localize("features.movie_series.season")} ${this.item().seasonNumber || 0}`;
    } else {
      return this.itemTitle();
    }
  });

  // Only used in series page
  seasons = signal<SeriesSeason[]>([]);
  // Only used in season page
  episodes = signal<SeriesEpisode[]>([]);
  currentPage = 0;
  maxEpisodePages = 1;
  pageSize = 10;

  ngOnInit(): void {
    super.ngOnInit();
  }

  isSeries(
    item: WritableSignal<Series | SeriesSeason | SeriesEpisode>,
  ): item is WritableSignal<Series> {
    return item().type === "TVShow";
  }

  isSeason(
    item: WritableSignal<Series | SeriesSeason | SeriesEpisode>,
  ): item is WritableSignal<SeriesSeason> {
    return item().type === "TVSeason";
  }

  isEpisode(
    item: WritableSignal<Series | SeriesSeason | SeriesEpisode>,
  ): item is WritableSignal<SeriesEpisode> {
    return item().type === "TVEpisode";
  }

  getItemDetails(uuid: string) {
    this.pageLoading.set(true);

    this.seriesService
      .getSeriesDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (series) => {
          if (series.type === "TVShow") {
            this.item.set(series);
            this.getSeasons();
          } else if (series.type === "TVSeason") {
            this.getSeasonDetails(uuid);
          } else {
            this.getEpisodeDetails(uuid);
          }
        },
        error: (err) =>
          this.messageService.showErrorMessage(
            localize("common.generic_connection_error"),
          ),
      });
  }

  getSeasonDetails(uuid: string) {
    this.pageLoading.set(true);

    this.seriesService
      .getSeasonDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (season) => {
          this.item.set(season);
          this.maxEpisodePages = Math.ceil(
            (this.item() as SeriesSeason).episodeUUIDs.length / this.pageSize,
          );
          this.getEpisodes();
        },
        error: (err) =>
          this.messageService.showErrorMessage(
            localize("common.generic_connection_error"),
          ),
      });
  }

  getEpisodeDetails(uuid: string) {
    this.pageLoading.set(true);

    this.seriesService
      .getEpisodeDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (episode) => this.item.set(episode),
        error: (err) =>
          this.messageService.showErrorMessage(
            localize("common.generic_connection_error"),
          ),
      });
  }

  getSeasons() {
    if (this.isSeries(this.item)) {
      const remoteCalls = this.item().seasonUUIDs.map((s) =>
        this.seriesService.getSeasonDetails(s),
      );

      forkJoin(remoteCalls).subscribe({
        next: (res) =>
          this.seasons.set(
            res.sort((s1, s2) => s1.seasonNumber - s2.seasonNumber),
          ),
        error: (e) => console.dir(e),
      });
    }
  }

  getEpisodes() {
    if (this.isSeason(this.item) && this.currentPage !== this.maxEpisodePages) {
      const from = this.currentPage * this.pageSize;
      const to = from + this.pageSize;
      const remoteCalls = this.item()
        .episodeUUIDs.slice(from, to)
        .map((s) => this.seriesService.getEpisodeDetails(s));

      forkJoin(remoteCalls).subscribe({
        next: (res) => {
          this.episodes.update((eps) => [
            ...eps,
            ...res.sort((s1, s2) => s1.episodeNumber - s2.episodeNumber),
          ]);
          this.currentPage++;
        },
        error: (e) => console.dir(e),
      });
    }
  }

  navigateToChild(event: any) {
    const item = event.item;
    this.router.navigate([`/series/` + item.uuid], {
      transition: SharedTransition.custom(new PageTransition(), {
        pageReturn: {
          duration: 150,
        },
      }),
    } as any);
  }
}
