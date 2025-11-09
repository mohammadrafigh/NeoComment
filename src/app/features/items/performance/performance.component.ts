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
import { PerformanceService } from "../../../core/services/performance.service";
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
import { FeedbackSectionComponent } from "../feedback-section/feedback-section.component";
import { Performance } from "~/app/core/models/performance.model";

@Component({
  selector: "ns-performance",
  templateUrl: "./performance.component.html",
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
  ],
  providers: [NeoDBLocalizePipe],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceComponent
  extends BaseItemPageComponent
  implements OnInit
{
  performanceService = inject(PerformanceService);
  item = signal<Performance>(null);
  actors = signal<string>(null);
  crew = signal<string>(null);

  ngOnInit(): void {
    super.ngOnInit();
  }

  getItemDetails(uuid: string) {
    this.pageLoading.set(true);
    this.performanceService
      .getPerformanceDetails(uuid)
      .pipe(finalize(() => this.pageLoading.set(false)))
      .subscribe({
        next: (performance) => {
          this.item.set(performance);
          this.setActors();
          this.setCrew();
        },
        error: (err) =>
          this.messageService.showErrorMessage(
            localize("common.generic_connection_error"),
          ),
      });
  }

  private setActors() {
    let actors: string[] = [];
    for (const actor of this.item().actors) {
      if (actor.role) {
        actors.push(`${actor.name} (${actor.role})`);
      } else {
        actors.push(actor.name);
      }
    }
    this.actors.set(actors.join(", "));
  }

  private setCrew() {
    let crews: string[] = [];
    for (const crew of this.item().crew) {
      if (crew.role) {
        crews.push(`${crew.name} (${crew.role})`);
      } else {
        crews.push(crew.name);
      }
    }
    this.crew.set(crews.join(", "));
  }
}
