import { SocketService } from './service/socket-service.service';
import { Global } from './service/globals';
import { SearchItemComponent } from './search-item/search-item.component';
import { GalleryItemComponent } from './gallery-item/gallery-item.component';
import { PostItemComponent } from './post-item/post-item.component';
import * as Hammer from 'hammerjs';
import { BrowserModule, HammerGestureConfig, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { Injectable, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { HttpClientModule } from '@angular/common/http';
import { SettingPageComponent } from './setting-page/setting-page.component';
import { PostingPageComponent } from './posting-page/posting-page.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TabsComponent } from './search-page/tabs/tabs.component';
import { TabComponent } from './search-page/tabs/tab/tab.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgsRevealModule } from 'ngx-scrollreveal';
import { LoginPageComponent } from './login-page/login-page.component';
import { NgxPullToRefreshModule } from 'ngx-pull-to-refresh';
import { SavedPageComponent } from './saved-page/saved-page.component';
import { DetailsItemComponent } from './details-item/details-item.component';
import { GalleryListComponent } from './gallery-list/gallery-list.component';
import { ResetPasswordPageComponent } from './reset-password-page/reset-password-page.component';
import { DirectsPageComponent } from './directs-page/directs-page.component';
import { HeaderItemComponent } from './header-item/header-item.component';
import { DirectItemComponent } from './direct-item/direct-item.component';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { DirectDetailsPageComponent } from './direct-details-page/direct-details-page.component';
import { ChatCreatePageComponent } from './chat-create-page/chat-create-page.component';
import { LoaderItemComponent } from './loader-item/loader-item.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';

export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    swipe: { direction: Hammer.DIRECTION_ALL },
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    SearchPageComponent,
    PostItemComponent,
    ProfilePageComponent,
    SettingPageComponent,
    PostingPageComponent,
    GalleryItemComponent,
    SearchItemComponent,
    TabsComponent,
    TabComponent,
    LoginPageComponent,
    SavedPageComponent,
    DetailsItemComponent,
    GalleryListComponent,
    ResetPasswordPageComponent,
    DirectsPageComponent,
    HeaderItemComponent,
    DirectItemComponent,
    ChatPageComponent,
    DirectDetailsPageComponent,
    ChatCreatePageComponent,
    LoaderItemComponent,
    NotificationItemComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgsRevealModule,
    NgxPullToRefreshModule,
    HammerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    },
    Global,
    SocketService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
