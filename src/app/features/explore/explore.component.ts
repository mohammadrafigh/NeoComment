import { Component, NO_ERRORS_SCHEMA, OnInit, inject } from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { StateService } from "../../core/services/state.service";
import { ExploreService } from "../../core/services/explore.service";
import { AuthService } from "../../core/services/auth.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { BookItemComponent } from "./book-item/book-item.component";

@Component({
  selector: "ns-explore",
  templateUrl: "./explore.component.html",
  styleUrls: ["./explore.component.css"],
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    CollectionViewModule,
    BookItemComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ExploreComponent implements OnInit {
  stateService = inject(StateService);
  exploreService = inject(ExploreService);
  authService = inject(AuthService);
  loading = false;

  ngOnInit(): void {
    this.getAllTrendings();
  }

  getAllTrendings() {
    this.loading = true;
    this.exploreService.getAllTrendings().subscribe({
      complete: () => (this.loading = false),
    });
  }
}
