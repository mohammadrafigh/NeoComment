import { localize } from "@nativescript/localize";

export const CATEGORIES = new Map([
  [
    "book",
    {
      icon: "\u{eff2}",
      title: localize("common.books"),
      path: "/books/",
      categoryInApp: "books",
      noteProgressTypes: ["page", "chapter", "percentage"],
    },
  ],
  [
    "movie",
    {
      icon: "\u{eafa}",
      title: localize("common.movies"),
      path: "/movies/",
      categoryInApp: "movies",
      noteProgressTypes: ["part", "timestamp", "percentage"],
    },
  ],
  [
    "tv",
    {
      icon: "\u{ea8d}",
      title: localize("common.series"),
      path: "/series/",
      categoryInApp: "series",
      noteProgressTypes: ["part", "episode", "percentage"],
    },
  ],
  [
    "game",
    {
      icon: "\u{eb63}",
      title: localize("common.games"),
      path: "/games/",
      categoryInApp: "games",
      noteProgressTypes: ["cycle"],
    },
  ],
  [
    "music",
    {
      icon: "\u{eafc}",
      title: localize("common.musics"),
      path: "/musics/",
      categoryInApp: "musics",
      noteProgressTypes: ["track", "timestamp", "percentage"],
    },
  ],
  [
    "podcast",
    {
      icon: "\u{f1e9}",
      title: localize("common.podcasts"),
      path: "/podcasts/",
      categoryInApp: "podcasts",
      noteProgressTypes: ["episode"],
    },
  ],
  [
    "performance",
    {
      icon: "\u{f263}",
      title: localize("common.performances"),
      path: "/performances/",
      categoryInApp: "performances",
      noteProgressTypes: ["part", "timestamp", "percentage"],
    },
  ],
  [
    "people",
    {
      icon: "\u{eb4d}",
      title: localize("common.people"),
      path: "/users/",
      categoryInApp: "users",
      noteProgressTypes: null,
    },
  ],
]);
