import { Routes } from "@angular/router";
import { MovieComponent } from "./features/movie/movie.component";

export const routes: Routes = [
  { path: "", redirectTo: "/sign-in", pathMatch: "full" },
  { path: "sign-in", loadComponent: () => import("./features/auth/sign-in/sign-in.component").then((m) => m.SignInComponent) },
  { path: "explore", loadComponent: () => import("./features/explore/explore.component").then((m) => m.ExploreComponent) },
  { path: "search-preview", loadComponent: () => import("./features/search/search-preview.component").then((m) => m.SearchPreviewComponent) },
  { path: "search", loadComponent: () => import("./features/search/search.component").then((m) => m.SearchComponent) },
  { path: "movies/:uuid", loadComponent: () => import("./features/movie/movie.component").then((m) => m.MovieComponent) },
];
