import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "/sign-in", pathMatch: "full" },
  {
    path: "sign-in",
    loadComponent: () =>
      import("./features/auth/sign-in/sign-in.component").then(
        (m) => m.SignInComponent,
      ),
  },
  {
    path: "explore",
    loadComponent: () =>
      import("./features/explore/explore.component").then(
        (m) => m.ExploreComponent,
      ),
  },
  {
    path: "search-preview",
    loadComponent: () =>
      import("./features/search/search-preview.component").then(
        (m) => m.SearchPreviewComponent,
      ),
  },
  {
    path: "search",
    loadComponent: () =>
      import("./features/search/search.component").then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: "books/:uuid",
    loadComponent: () =>
      import("./features/items/book/book.component").then(
        (m) => m.BookComponent,
      ),
    data: { noReuse: true },
  },
  {
    path: "movies/:uuid",
    loadComponent: () =>
      import("./features/items/movie/movie.component").then(
        (m) => m.MovieComponent,
      ),
  },
  {
    path: "series/:uuid",
    loadComponent: () =>
      import("./features/items/series/series.component").then(
        (m) => m.SeriesComponent,
      ),
    data: { noReuse: true },
  },
  {
    path: "games/:uuid",
    loadComponent: () =>
      import("./features/items/game/game.component").then(
        (m) => m.GameComponent,
      ),
  },
  {
    path: "musics/:uuid",
    loadComponent: () =>
      import("./features/items/music/music.component").then(
        (m) => m.MusicComponent,
      ),
  },
  {
    path: "posts",
    loadComponent: () =>
      import("./features/posts/posts.component").then((m) => m.PostsComponent),
  },
  {
    path: "posts/:id",
    loadComponent: () =>
      import("./features/posts/replies/replies.component").then(
        (m) => m.RepliesComponent,
      ),
    data: { noReuse: true },
  },
  {
    path: "preferences",
    loadComponent: () =>
      import("./features/preferences/preferences.component").then(
        (m) => m.PreferencesComponent,
      ),
  },
  {
    path: "about",
    loadComponent: () =>
      import("./features/about/about.component").then((m) => m.AboutComponent),
  },
];
