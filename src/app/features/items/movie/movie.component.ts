import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnDestroy,
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
import { MovieService } from "../../../core/services/movie.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { CollectionItemComponent } from "../../../shared/components/items/collection-item/collection-item.component";
import { finalize } from "rxjs";
import { Movie } from "~/app/core/models/movie.model";
import { localize } from "@nativescript/localize";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { KiloPipe } from "~/app/shared/pipes/kilo.pipe";
import { RateIndicatorComponent } from "~/app/shared/components/rate-indicator/rate-indicator.component";
import { IconTextButtonComponent } from "~/app/shared/components/icon-text-button/icon-text-button.component";
import { ExternalResourcesComponent } from "~/app/shared/components/external-resources/external-resources.component";
import { RatingsChartComponent } from "~/app/shared/components/ratings-chart/ratings-chart.component";
import { PostItemComponent } from "~/app/shared/components/post/post-item/post-item.component";
import { BaseItemPageComponent } from "../base-item-page.component";

@Component({
  selector: "ns-movie",
  templateUrl: "./movie.component.html",
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
    RatingsChartComponent,
    PostItemComponent,
    NeoDBLocalizePipe,
    KiloPipe,
  ],
  providers: [NeoDBLocalizePipe],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieComponent extends BaseItemPageComponent implements OnInit, OnDestroy {
  movieService = inject(MovieService);
  item = signal<Movie>(null);

  ngOnInit(): void {
    super.ngOnInit();
  }

  getItemDetails(uuid: string) {
    this.pageLoading.set(true);
    this.movieService
      .getMovieDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (movie) => this.item.set(movie),
        error: (err) =>
          this.messageService.showErrorMessage(
            localize("common.generic_connection_error"),
          ),
      });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
