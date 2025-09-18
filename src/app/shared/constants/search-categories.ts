import { localize } from "@nativescript/localize";

export const SEARCH_CATEGORIES = new Map([
  [
    "book",
    {
      icon: "\u{eff2}",
      title: localize("common.books"),
      path: "/books/",
      categoryInApp: "books",
    },
  ],
  [
    "movie",
    {
      icon: "\u{eafa}",
      title: localize("common.movies"),
      path: "/movies/",
      categoryInApp: "movies",
    },
  ],
  [
    "tv",
    {
      icon: "\u{ea8d}",
      title: localize("common.series"),
      path: "/series/",
      categoryInApp: "series",
    },
  ],
  [
    "game",
    {
      icon: "\u{eb63}",
      title: localize("common.games"),
      path: "/games/",
      categoryInApp: "games",
    },
  ],
  [
    "music",
    {
      icon: "\u{eafc}",
      title: localize("common.musics"),
      path: "/musics/",
      categoryInApp: "musics",
    },
  ],
  [
    "podcast",
    {
      icon: "\u{f1e9}",
      title: localize("common.podcasts"),
      path: "/podcasts/",
      categoryInApp: "podcasts",
    },
  ],
  [
    "performance",
    {
      icon: "\u{f263}",
      title: localize("common.performances"),
      path: "/performances/",
      categoryInApp: "performances",
    },
  ],
  [
    "people",
    {
      icon: "\u{eb4d}",
      title: localize("common.people"),
      path: "/users/",
      categoryInApp: "users",
    },
  ],
]);
