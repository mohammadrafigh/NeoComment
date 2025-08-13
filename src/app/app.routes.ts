import { Routes } from "@angular/router";
import { SignInComponent } from "./features/auth/sign-in/sign-in.component";
import { ExploreComponent } from "./features/explore/explore.component";
import { SearchComponent } from "./features/search/search.component";

export const routes: Routes = [
  { path: "", redirectTo: "/sign-in", pathMatch: "full" },
  { path: "sign-in", component: SignInComponent },
  { path: "explore", component: ExploreComponent },
  { path: "search", component: SearchComponent },
];
