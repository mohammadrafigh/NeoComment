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
} from "@angular/core";
import { Router } from "@angular/router";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { openUrl } from "@nativescript/core/utils";
import { Post } from "~/app/core/models/post/post.model";
import { CATEGORIES } from "~/app/shared/constants/categories";

interface CommentPart {
  text?: string;
  type: "text" | "mention" | "hashtag" | "link" | "emoji" | "spoiler";
  url?: string; // for links and emojis
}

@Component({
  selector: "ns-post-content",
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: "./post-content.component.html",
})
export class PostContentComponent implements OnChanges {
  @Input() post: Post;
  @Output() onContentPressed = new EventEmitter();
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  commentParts = signal<CommentPart[][]>([]);
  title = signal<string>(null);
  revealContent = signal(false);
  ignoreContentPressed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["post"]) {
      this.initComment();
    }
  }

  private initComment() {
    this.commentParts.set([]);
    this.title.set(null);
    this.revealContent.set(false);

    if (this.post.extNeodb?.relatedWith) {
      this.initCommentFromNeoDB();
    } else {
      this.initCommentFromFediverse();
    }
  }

  private initCommentFromNeoDB() {
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
    this.parseContent(comment.content);
  }

  private initCommentFromFediverse() {
    const pureContent = this.post.content.replace(/<\/?[^>]+(>|$)/g, "");
    this.parseContent(pureContent);
  }

  private parseContent(content: string) {
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
        parts.push({
          type: "spoiler",
          text: match.slice(1).find(Boolean) ?? "",
        });
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

  onPartTap(event: any, part: CommentPart) {
    if (part.type === "mention") {
      this.ignoreContentPressed = true;
      console.log("Mention tapped:", part.text, part.url);
      // TODO: Mohammad 09-19-2025: navigate to profile
    } else if (part.type === "hashtag") {
      this.ignoreContentPressed = true;

      const category = CATEGORIES.get(
        this.post.extNeodb.tag[0].type.toLowerCase().toLowerCase(),
      )?.categoryInApp;

      this.router.navigate(["/search"], {
        queryParams: {
          category: category ?? "books",
          query: part.text,
        },
      });
    } else if (part.type === "link") {
      this.ignoreContentPressed = true;

      openUrl(part.url);
    } else if (part.type === "spoiler") {
      this.ignoreContentPressed = true;

      this.revealContent.set(!this.revealContent());
      this.cdr.detectChanges();
    }
  }

  contentPressed() {
    if (!this.ignoreContentPressed) {
      this.onContentPressed.emit();
    } else {
      this.ignoreContentPressed = false;
    }
  }
}
