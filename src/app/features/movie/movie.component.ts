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
import { StateService } from "../../core/services/state.service";
import { MovieService } from "../../core/services/movie.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { CollectionItemComponent } from "../../shared/items/collection-item/collection-item.component";
import { finalize } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { Movie } from "~/app/core/models/movie.model";
import { MessageService } from "~/app/core/services/message.service";
import { localize } from "@nativescript/localize";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { KiloPipe } from "~/app/shared/pipes/kilo.pipe";
import { Location } from "@angular/common";
import { RateIndicatorComponent } from "~/app/shared/rate-indicator/rate-indicator.component";

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
    CollectionItemComponent,
    NeoDBLocalizePipe,
    KiloPipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieComponent implements OnInit {
  stateService = inject(StateService);
  movieService = inject(MovieService);
  messageService = inject(MessageService);
  activatedRoute = inject(ActivatedRoute);
  location = inject(Location);
  statusbarSize: number = global.statusbarSize;
  pageLoading = signal(false);
  movie = signal<Movie>(null);

  ngOnInit(): void {
    this.getMovieDetails();
  }

  getMovieDetails() {
    const uuid = this.activatedRoute.snapshot.params.uuid;
    this.pageLoading.set(true);
    this.movieService
      .getMovieDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (movie) => this.movie.set(movie),
        error: (err) =>
          this.messageService.showErrorMessage(
            localize("common.generic_connection_error"),
          ),
      });
  }

  share() {
    // TODO: Mohammad 09-09-2025: Implement it
  }
}
