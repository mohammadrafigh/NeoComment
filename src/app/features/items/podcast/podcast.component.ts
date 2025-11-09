import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
  WritableSignal,
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
import { finalize } from "rxjs";
import { localize } from "@nativescript/localize";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { KiloPipe } from "~/app/shared/pipes/kilo.pipe";
import { RateIndicatorComponent } from "~/app/shared/components/rate-indicator/rate-indicator.component";
import { IconTextButtonComponent } from "~/app/shared/components/icon-text-button/icon-text-button.component";
import { ExternalResourcesComponent } from "~/app/shared/components/external-resources/external-resources.component";
import { BaseItemPageComponent } from "../base-item-page.component";
import { PodcastService } from "~/app/core/services/podcast.service";
import { FeedbackSectionComponent } from "../feedback-section/feedback-section.component";
import { PageTransition, SharedTransition } from "@nativescript/core";
import { Podcast } from "~/app/core/models/podcast.model";
import { PodcastEpisode } from "~/app/core/models/podcast-episode.model";
import { PodcastItemComponent } from "~/app/shared/components/items/podcast-item/podcast-item.component";
import { DurationPipe } from "~/app/shared/pipes/duration.pipe";

@Component({
  selector: "ns-podcast",
  templateUrl: "./podcast.component.html",
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
    DurationPipe,
    FeedbackSectionComponent,
    PodcastItemComponent,
  ],
  providers: [NeoDBLocalizePipe],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PodcastComponent extends BaseItemPageComponent implements OnInit {
  podcastService = inject(PodcastService);
  item = signal<Podcast | PodcastEpisode>(null);

  // Only used in podcast page
  episodes = signal<PodcastEpisode[]>([]);
  count = signal(0);
  currentPage = 0;
  maxPages = 1;

  ngOnInit(): void {
    super.ngOnInit();
  }

  isPodcast(
    item: WritableSignal<Podcast | PodcastEpisode>,
  ): item is WritableSignal<Podcast> {
    return item().type === "Podcast";
  }

  isEpisode(
    item: WritableSignal<Podcast | PodcastEpisode>,
  ): item is WritableSignal<PodcastEpisode> {
    return item().type === "PodcastEpisode";
  }

  getItemDetails(uuid: string) {
    this.pageLoading.set(true);

    this.podcastService
      .getPodcastDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (podcast) => {
          if (podcast.type === "Podcast") {
            this.item.set(podcast);
            this.getEpisodes();
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

  getEpisodeDetails(uuid: string) {
    this.pageLoading.set(true);

    this.podcastService
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

  getEpisodes() {
    if (this.isPodcast(this.item) && this.currentPage < this.maxPages) {
      this.podcastService
        .getPodcastEpisodes(this.item().uuid, this.currentPage + 1)
        .subscribe({
          next: (res) => {
            this.episodes.update((eps) => [...eps, ...res.data]);
            this.count.set(res.count);
            this.maxPages = res.pages;
            this.currentPage++;
          },
          error: (e) => console.dir(e),
        });
    }
  }

  navigateToEpisode(event: any) {
    const item = event.item;
    this.router.navigate([`/podcasts/` + item.uuid], {
      transition: SharedTransition.custom(new PageTransition(), {
        pageReturn: {
          duration: 150,
        },
      }),
    } as any);
  }
}
