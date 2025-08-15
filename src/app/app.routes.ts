import { Routes } from "@angular/router";
import { SignInComponent } from "./features/auth/sign-in/sign-in.component";
import { ExploreComponent } from "./features/explore/explore.component";
import { SearchPreviewComponent } from "./features/search/search-preview.component";

export const routes: Routes = [
  { path: "", redirectTo: "/sign-in", pathMatch: "full" },
  { path: "sign-in", component: SignInComponent },
  { path: "explore", component: ExploreComponent },
  { path: "search-preview", component: SearchPreviewComponent },
];
