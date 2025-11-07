import {
  Component,
  EventEmitter,
  Input,
  NO_ERRORS_SCHEMA,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { RateIndicatorComponent } from "../../rate-indicator/rate-indicator.component";
import { Post } from "../../../../core/models/post/post.model";
import { KiloPipe } from "../../../pipes/kilo.pipe";
import { localize } from "@nativescript/localize";
import { IconTextButtonComponent } from "../../icon-text-button/icon-text-button.component";
import { PostContentComponent } from "../post-content/post-content.component";

@Component({
  selector: "ns-post-item",
  templateUrl: "./post-item.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    IconTextButtonComponent,
    PostContentComponent,
    KiloPipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PostItemComponent implements OnChanges {
  @Input() post: Post;
  @Input() isLiking = false;
  @Input() isBoosting = false;
  @Input() isEditable = false;
  @Output() likePressed = new EventEmitter();
  @Output() boostPressed = new EventEmitter();
  @Output() editPressed = new EventEmitter();
  @Output() replyPressed = new EventEmitter();
  @Output() postPressed = new EventEmitter();
  rateIndicators = signal<number[]>([]);
  status = signal<string>(null);
  noteProgress = signal<{ type: string; value: string }>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (this.post.extNeodb?.relatedWith) {
      this.setStatus();
      this.fillRateIndicators();
      this.setNoteProgress();
    }
  }

  setStatus() {
    const status = this.post.extNeodb.relatedWith.find(
      (relatedObj) => relatedObj.type === "Status",
    )?.status;

    // TODO: Mohammad 10-12-2025: Add text for other item types
    switch (status) {
      case "wishlist":
        return this.status.set(localize("features.movie.to_watch"));
      case "progress":
        return this.status.set(localize("features.movie.watching"));
      case "complete":
        return this.status.set(localize("features.movie.watched"));
      case "dropped":
        return this.status.set(localize("features.movie.stopped"));
      default:
        return this.status.set(null);
    }
  }

  fillRateIndicators() {
    this.rateIndicators.set([]);

    const ratingRelation = this.post.extNeodb.relatedWith.find(
      (relatedObj) => relatedObj.type === "Rating",
    );

    if (!ratingRelation || !ratingRelation.value) {
      return;
    }

    const rateIndicators = [];
    const maxRateValue = ratingRelation.best;
    const rateValue = ratingRelation.value;
    const normalizedRateValue = (rateValue * 10) / maxRateValue;
    for (let i = 0; i < 5; i++) {
      const clampedValue = Math.min(
        10,
        5 * Math.max(0, normalizedRateValue - i * 2),
      );
      rateIndicators.push(clampedValue);
    }
    this.rateIndicators.set(rateIndicators);
  }

  setNoteProgress() {
    this.noteProgress.set(null);

    const progress = this.post.extNeodb.relatedWith.find(
      (relatedObj) => relatedObj.type === "Note",
    )?.progress;

    if (!progress) {
      return;
    }

    this.noteProgress.set(progress);
  }

  onLikePressed() {
    this.likePressed.emit();
  }

  onBoostPressed() {
    this.boostPressed.emit();
  }

  onEditPressed() {
    this.editPressed.emit();
  }

  onReplyPressed() {
    this.replyPressed.emit();
  }

  onPostPressed() {
    this.postPressed.emit();
  }
}
