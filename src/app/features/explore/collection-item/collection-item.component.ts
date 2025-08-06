import {
  Component,
  Input,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { TrendingCollection } from "../../../core/models/trending-collection.model";
import { KiloPipe } from "../../../shared/pipes/kilo/kilo.pipe";

@Component({
  selector: "ns-collection-item",
  templateUrl: "./collection-item.component.html",
  imports: [NativeScriptCommonModule, NativeScriptLocalizeModule, KiloPipe],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CollectionItemComponent {
  @Input() item: TrendingCollection;
  @Input() instanceURL: string;
}
