import { Component, Input, NO_ERRORS_SCHEMA, OnInit } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { TrendingItem } from "../../../core/models/trending-item.model";

@Component({
  selector: "ns-book-item",
  templateUrl: "./book-item.component.html",
  styleUrls: ["./book-item.component.css"],
  imports: [NativeScriptCommonModule, NativeScriptLocalizeModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class BookItemComponent implements OnInit {
  @Input() item: TrendingItem;
  @Input() language: string;
  localizedTitle: string;

  ngOnInit() {
    this.localizedTitle = this.item.localizedTitle.find(
      (lt) => lt.lang === this.language,
    )?.text;
  }
}
