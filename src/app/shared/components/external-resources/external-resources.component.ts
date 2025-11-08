import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NO_ERRORS_SCHEMA,
  OnChanges,
  signal,
  SimpleChanges,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { ExternalResource } from "../../../core/models/base-item.model";
import { openUrl } from "@nativescript/core/utils";
import { localize } from "@nativescript/localize";

interface ResourceItem {
  title: string;
  class: string;
  url?: string;
}

@Component({
  selector: "ns-external-resources",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    CollectionViewModule,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <CollectionView
      [items]="parsedResources()"
      colWidth="auto"
      orientation="horizontal"
      class="pr-2 pl-4"
      (itemTap)="openURL($event)"
    >
      <ng-template let-item="item">
        <StackLayout class="pr-2">
          <Label
            [text]="item.title"
            class="text-xs rounded-lg px-2.5 py-1 capitalize"
            [ngClass]="item.class"
          ></Label>
        </StackLayout>
      </ng-template>
    </CollectionView>
  `,
})
export class ExternalResourcesComponent implements OnChanges {
  @Input() externalResources: ExternalResource[];
  @Input() site: string;
  @Input() localURL: string;
  parsedResources = signal<ResourceItem[]>([]);
  resourcesDict: { [key: string]: ResourceItem } = {
    "archiveofourown.org": {
      title: "AO3",
      class: "bg-red-800 text-neutral-50",
    },
    "music.apple.com": {
      title: "Apple Music",
      class: "bg-red-700 text-neutral-50",
    },
    "podcasts.apple.com": {
      title: "Apple Podcast",
      class: "bg-purple-500 text-neutral-50",
    },
    "bandcamp.com": {
      title: "Bandcamp",
      class: "bg-cyan-500 text-neutral-700",
    },
    "bangumi.tv": { title: "Bangumi", class: "bg-red-300 text-neutral-700" },
    "bgm.tv": { title: "Bangumi", class: "bg-red-300 text-neutral-700" },
    "boardgamegeek.com": {
      title: "BGG",
      class: "bg-orange-600 text-neutral-700",
    },
    "bibliotek.dk": {
      title: "Bibliotek.dk",
      class: "bg-indigo-600 text-neutral-50",
    },
    "ereolen.dk": { title: "eReolen.dk", class: "bg-rose-700 text-neutral-50" },
    "books.com.tw": { title: "BooksTW", class: "bg-lime-500 text-neutral-700" },
    "discogs.com": {
      title: "Discogs",
      class: "bg-neutral-900 text-neutral-50",
    },
    "douban.com": { title: "Douban", class: "bg-green-600 text-neutral-50" },
    "book.douban.com": {
      title: "Douban",
      class: "bg-green-600 text-neutral-50",
    },
    "movie.douban.com": {
      title: "Douban",
      class: "bg-green-600 text-neutral-50",
    },
    "music.douban.com": {
      title: "Douban",
      class: "bg-green-600 text-neutral-50",
    },
    "goodreads.com": {
      title: "Goodreads",
      class: "bg-stone-100 text-neutral-700",
    },
    "books.google.com": {
      title: "Google Books",
      class: "bg-blue-500 text-neutral-50",
    },
    "igdb.com": { title: "IGDB", class: "bg-violet-500 text-neutral-50" },
    "imdb.com": { title: "IMDB", class: "bg-yellow-400 text-neutral-700" },
    "jjwxc.net": { title: "JinJiang", class: "bg-lime-500 text-neutral-700" },
    "musicbrainz.org": {
      title: "MusicBrainz",
      class: "bg-orange-400 text-neutral-700",
    },
    "openlibrary.org": {
      title: "Open Library",
      class: "bg-slate-500 text-neutral-50",
    },
    "qidian.com": { title: "Qidian", class: "bg-red-700 text-neutral-50" },
    "open.spotify.com": {
      title: "Spotify",
      class: "bg-green-500 text-neutral-700",
    },
    "store.steampowered.com": {
      title: "Steam",
      class: "bg-sky-500 text-neutral-700",
    },
    "themoviedb.org": {
      title: "TMDB",
      class: "bg-emerald-300 text-neutral-700",
    },
    "tmdb.org": { title: "TMDB", class: "bg-emerald-300 text-neutral-700" },
    "wikidata.org": { title: "WikiData", class: "bg-sky-700 text-neutral-50" },
    "ypshuo.com": { title: "Ypshuo", class: "bg-red-500 text-neutral-700" },
  };

  ngOnChanges(changes: SimpleChanges): void {
    const resources = this.externalResources.map((e) =>
      this.extractResource(e.url),
    );

    if (this.site) {
      resources.unshift({
        title: localize("common.website"),
        class: "bg-app-bg-muted text-app-fg",
        url: this.site,
      });
    }
    if (this.localURL) {
      try {
        const host = new URL(this.localURL).hostname.replace(/^www\./, "");
        resources.unshift({
          title: host,
          class: "bg-app-bg-muted text-app-fg",
          url: this.localURL,
        });
      } catch {
        console.log("Couldn't parse local url " + this.localURL);
      }
    }

    this.parsedResources.set(resources);
  }

  extractResource(url: string): ResourceItem {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      const resource = { ...this.resourcesDict[host], url };

      if (resource.title) {
        return resource;
      }
      return { title: host, class: "bg-app-bg-muted text-app-fg", url };
    } catch {
      return {
        title: localize("common.unknown"),
        class: "bg-app-bg-muted text-app-fg",
        url,
      };
    }
  }

  openURL($event) {
    openUrl($event.item.url);
  }
}
