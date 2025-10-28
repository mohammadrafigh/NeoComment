import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  NO_ERRORS_SCHEMA,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  ViewContainerRef,
} from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { RateIndicatorComponent } from "../rate-indicator/rate-indicator.component";
import { Post } from "../../../core/models/post/post.model";
import { KiloPipe } from "../../pipes/kilo.pipe";
import { localize } from "@nativescript/localize";
import { Router } from "@angular/router";
import { StateService } from "~/app/core/services/state.service";
import { PostService } from "~/app/core/services/post.service";
import { IconTextButtonComponent } from "../icon-text-button/icon-text-button.component";
import { MessageService } from "~/app/core/services/message.service";
import { finalize } from "rxjs";
import { PostContentComponent } from "./post-content/post-content.component";

@Component({
  selector: "ns-post",
  templateUrl: "./post.component.html",
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
export class PostComponent implements OnChanges {
  @Input() post: Post;
  @Output() editPressed = new EventEmitter();
  @Output() replyAdded = new EventEmitter();
  router = inject(Router);
  containerRef = inject(ViewContainerRef);
  postService = inject(PostService);
  fediAccount = inject(StateService).fediAccount;
  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);
  rateIndicators = signal<number[]>([]);
  status = signal<string>(null);
  noteProgress = signal<{ type: string; value: string }>(null);
  liking = signal(false);
  boosting = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (this.post.extNeodb.relatedWith) {
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

  onEditPressed() {
    this.editPressed.emit();
  }

  toggleLike() {
    this.liking.set(true);
    if (this.post.favourited) {
      this.applyUnlike();
      this.postService
        .unlikePost(this.post.id)
        .pipe(finalize(() => this.liking.set(false)))
        .subscribe({
          error: () => {
            this.messageService.showErrorMessage(
              localize("common.generic_error"),
            );
            // revert
            this.applyLike();
          },
        });
    } else {
      this.applyLike();
      this.postService
        .likePost(this.post.id)
        .pipe(finalize(() => this.liking.set(false)))
        .subscribe({
          error: () => {
            this.messageService.showErrorMessage(
              localize("common.generic_error"),
            );
            // revert
            this.applyUnlike();
          },
        });
    }
  }

  applyLike() {
    this.post.favourited = true;
    this.post.favouritesCount++;
    this.cdr.detectChanges();
  }

  applyUnlike() {
    this.post.favourited = false;
    this.post.favouritesCount--;
    this.cdr.detectChanges();
  }

  toggleBoost() {
    this.boosting.set(true);
    if (this.post.reblogged) {
      this.applyUnboost();
      this.postService
        .unboostPost(this.post.id)
        .pipe(finalize(() => this.boosting.set(false)))
        .subscribe({
          error: () => {
            this.messageService.showErrorMessage(
              localize("common.generic_error"),
            );
            // revert
            this.applyBoost();
          },
        });
    } else {
      this.applyBoost();
      this.postService
        .boostPost(this.post.id)
        .pipe(finalize(() => this.boosting.set(false)))
        .subscribe({
          error: () => {
            this.messageService.showErrorMessage(
              localize("common.generic_error"),
            );
            // revert
            this.applyUnboost();
          },
        });
    }
  }

  applyBoost() {
    this.post.reblogged = true;
    this.post.reblogsCount++;
    this.cdr.detectChanges();
  }

  applyUnboost() {
    this.post.reblogged = false;
    this.post.reblogsCount--;
    this.cdr.detectChanges();
  }

  reply() {
    this.postService
      .showPostSheet(this.containerRef, this.post)
      .subscribe((result: { post: Post; isRemoved: boolean }) => {
        if (!result) {
          return;
        }

        this.replyAdded.emit(result.post);
      });
  }
}
