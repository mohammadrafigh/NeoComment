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
    path: "movies/:uuid",
    loadComponent: () =>
      import("./features/items/movie/movie.component").then(
        (m) => m.MovieComponent,
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
  },
  {
    path: "preferences",
    loadComponent: () =>
      import("./features/preferences/preferences.component").then(
        (m) => m.PreferencesComponent,
      ),
  },
];
