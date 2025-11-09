import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
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
import { MusicService } from "~/app/core/services/music.service";
import { Music } from "~/app/core/models/music.model";
import { DurationPipe } from "~/app/shared/pipes/duration.pipe";
import { FeedbackSectionComponent } from "../feedback-section/feedback-section.component";

@Component({
  selector: "ns-music",
  templateUrl: "./music.component.html",
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
  ],
  providers: [NeoDBLocalizePipe],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicComponent extends BaseItemPageComponent implements OnInit {
  musicService = inject(MusicService);
  item = signal<Music>(null);

  ngOnInit(): void {
    super.ngOnInit();
  }

  getItemDetails(uuid: string) {
    this.pageLoading.set(true);
    this.musicService
      .getMusicDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (music) => this.item.set(music),
        error: (err) =>
          this.messageService.showErrorMessage(
            localize("common.generic_connection_error"),
          ),
      });
  }
}
