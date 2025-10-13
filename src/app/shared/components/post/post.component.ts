import {
  Component,
  inject,
  Input,
  NO_ERRORS_SCHEMA,
  OnChanges,
  signal,
  SimpleChanges,
} from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { RateIndicatorComponent } from "../rate-indicator/rate-indicator.component";
import { Post } from "../../../core/models/post/post.model";
import { KiloPipe } from "../../pipes/kilo.pipe";
import { localize } from "@nativescript/localize";
import { openUrl } from "@nativescript/core/utils";
import { Router } from "@angular/router";
import { CATEGORIES } from "../../constants/categories";

interface CommentPart {
  text?: string;
  type: "text" | "mention" | "hashtag" | "link" | "emoji" | "spoiler";
  url?: string; // for links and emojis
}

@Component({
  selector: "ns-post",
  templateUrl: "./post.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    RateIndicatorComponent,
    KiloPipe,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PostComponent implements OnChanges {
  @Input() post: Post;
  router = inject(Router);
  rateIndicators = signal<number[]>([]);
  status = signal<string>(null);
  commentParts = signal<CommentPart[][]>([]);
  revealContent = signal(false);
  title = signal<string>(null);
  noteProgress = signal<{ type: string; value: string }>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (this.post.extNeodb.relatedWith) {
      this.setStatus();
      this.setComment();
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
        return null;
    }
  }

  setComment() {
    const comment = this.post.extNeodb.relatedWith.find(
      (relatedObj) =>
        relatedObj.type === "Comment" ||
        relatedObj.type === "Review" ||
        relatedObj.type === "Note",
    );

    if (!comment) {
      return;
    }

    this.title.set(comment.name ?? comment.title ?? null);
    const content = comment.content;

    if (!content) {
      return;
    }

    const mentionRegex = /@[a-zA-Z0-9_]+(?:@[a-zA-Z0-9.\-_]+)?/g;
    const hashtagRegex = /#\w+/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const emojiRegex = /:([a-zA-Z0-9_]+):/g;
    const spoilerRegex = />!([\s\S]*?)!</g;

    const regex = new RegExp(
      `${urlRegex.source}|${mentionRegex.source}|${hashtagRegex.source}|${emojiRegex.source}|${spoilerRegex.source}`,
      "gu",
    );

    let parts: CommentPart[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          text: content.slice(lastIndex, match.index),
        });
      }

      const token = match[0];

      if (token.startsWith("@")) {
        // Mentions
        const found = this.post.mentions.find((m) =>
          token.includes(m.username),
        );
        parts.push({ type: "mention", text: token, url: found?.url });
      } else if (token.startsWith("#")) {
        // Hashtags
        const found = this.post.tags.find((t) => "#" + t.name === token);
        parts.push({ type: "hashtag", text: token, url: found?.url });
      } else if (token.startsWith("http")) {
        // Links
        parts.push({ type: "link", text: token, url: token });
      } else if (token.startsWith(":")) {
        // Emojis
        const shortcode = match.slice(1).find(Boolean);
        const found = this.post.emojis.find((e) => e.shortcode === shortcode);
        if (found) {
          parts.push({ type: "emoji", url: found.url });
        } else {
          parts.push({ type: "text", text: token });
        }
      } else if (token.startsWith(">!")) {
        // Spoilers
        parts.push({ type: "spoiler", text: match.slice(1).find(Boolean) ?? '' });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({ type: "text", text: content.slice(lastIndex) });
    }

    const commentParts: CommentPart[][] = [];
    let currentLine: CommentPart[] = [];
    for (let part of parts) {
      if (
        (part.type === "text" || part.type === "spoiler") &&
        part.text.includes("\n")
      ) {
        const split = part.text.split("\n");
        split.forEach((chunk, i) => {
          if (chunk.length > 0) {
            currentLine.push({ ...part, text: chunk });
          }
          if (i < split.length - 1) {
            commentParts.push(currentLine);
            currentLine = [];
          }
        });
      } else {
        currentLine.push(part);
      }
    }
    if (currentLine.length > 0) commentParts.push(currentLine);

    this.commentParts.set(commentParts);
  }

  fillRateIndicators() {
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
    const progress = this.post.extNeodb.relatedWith.find(
      (relatedObj) => relatedObj.type === "Note",
    )?.progress;

    if (!progress) {
      return;
    }

    this.noteProgress.set(progress);
  }

  onPartTap(part: CommentPart) {
    if (part.type === "mention") {
      console.log("Mention tapped:", part.text, part.url);
      // TODO: Mohammad 09-19-2025: navigate to profile
    } else if (part.type === "hashtag") {
      const category = CATEGORIES.get(
        this.post.extNeodb.tag[0].type.toLowerCase(),
      )?.categoryInApp;

      this.router.navigate(["/search"], {
        queryParams: {
          category: category ?? "books",
          query: part.text,
        },
      });
    } else if (part.type === "link") {
      openUrl(part.url);
    } else if (part.type === "spoiler") {
      this.revealContent.set(!this.revealContent());
    }
  }
}
