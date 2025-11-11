import {
  ChangeDetectionStrategy,
  Component,
  inject,
  NO_ERRORS_SCHEMA,
  OnInit,
} from "@angular/core";
import { BottomSheetParams } from "@nativescript-community/ui-material-bottomsheet/angular";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { Collection } from "~/app/core/models/collection.model";
import { BottomSheetContainerDirective } from "~/app/shared/directives/bottom-sheet-container.directive";

@Component({
  selector: "ns-collection-details",
  templateUrl: "./collection-details.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    BottomSheetContainerDirective,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionDetailsComponent implements OnInit {
  params = inject(BottomSheetParams);
  collection: Collection;

  ngOnInit(): void {
    this.collection = this.params.context.collection;
  }

  close() {
    this.params.closeCallback();
  }
}
