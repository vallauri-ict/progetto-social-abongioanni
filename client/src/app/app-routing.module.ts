import { DirectDetailsPageComponent } from './direct-details-page/direct-details-page.component';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { DirectsPageComponent } from './directs-page/directs-page.component';
import { SavedPageComponent } from './saved-page/saved-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { SettingPageComponent } from './setting-page/setting-page.component';
import { PostingPageComponent } from './posting-page/posting-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResetPasswordPageComponent } from './reset-password-page/reset-password-page.component';
import { ChatCreatePageComponent } from './chat-create-page/chat-create-page.component';

const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'search', component: SearchPageComponent },
  { path: 'profile/:id', component: ProfilePageComponent },
  { path: 'posting', component: PostingPageComponent },
  { path: 'settings', component: SettingPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'saved', component: SavedPageComponent },
  { path: 'resetpassword', component: ResetPasswordPageComponent },
  { path: 'directs', component: DirectsPageComponent },
  { path: 'directs/create', component: ChatCreatePageComponent },
  { path: 'chat/:id', component: ChatPageComponent },
  { path: 'chat/:id/details', component: DirectDetailsPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

