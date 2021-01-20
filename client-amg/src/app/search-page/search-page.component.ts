import { TabsComponent } from './tabs/tabs.component';
import { DataService } from './../service/data.service';
import { Component, ContentChildren, HostListener, OnInit, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HammerGestureConfig } from '@angular/platform-browser';
import { fromEvent } from "rxjs";
import { takeWhile } from "rxjs/operators"
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Global, transAnimation } from './../service/globals';
import { trigger, state, style, transition, animate, keyframes, useAnimation } from '@angular/animations';
import { Router } from '@angular/router';
import { DetailsItemComponent } from '../details-item/details-item.component';

@Component({
  selector: 'search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css'],

})
export class SearchPageComponent implements OnInit {
  alive: boolean = true;
  
  @ViewChild("tabs") tabs: ElementRef;
  @ViewChild("details") details:DetailsItemComponent;

  resultsUser = [];
  resultsPost = [];

  isFirstSearchUser = true;
  isFirstSearchPost = true;
  isLoading = false;
  isLoadedAll = false;
  itemCount = 5;
  pageCountUsers = 0;
  pageCountPosts = 0;
  strUsers;
  strPosts;
  isUser = true;
  isOpen = false;
  postDetails;
  prev;

  constructor(private utils: DataService, public global: Global, private router: Router) { }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.alive = false;
  }

  toggle(tabs, value) {
    this.isUser = value;
    if (this.isUser) {
      tabs.activeTab = 'Users';
    }
    else {
      tabs.activeTab = 'Posts';
    }
  }

  searchUser(event, str) {
    if ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) ||
      (event.keyCode >= 97 && event.keyCode <= 122) ||
      (event.keyCode == 8)) {
      if (str.length > 0) {
        this.strUsers=str;
        this.isFirstSearchUser = false;
        this.isLoading = true;
        this.utils.findUser(str, (users) => {
          this.resultsUser = users;
          this.isLoading = false;
        }, this.errorMethod, 0, 10);
      }
    }
  }

  searchPost(event, str) {
    if ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) ||
      (event.keyCode >= 97 && event.keyCode <= 122) ||
      (event.keyCode == 8)) {
      if (str.length > 0) {
        this.strPosts=str;
        this.isFirstSearchPost = false;
        this.isLoading = true;
        this.utils.findPost(str, (posts) => {
          this.resultsPost = posts;
          this.isLoading = false;
        }, this.errorMethod, 0, 10);
      }
    }
  }

  showDetails(event) {
    let gi=event.galleryItem;
    
    gi.isOpen = !gi.isOpen;
    this.postDetails = null;
    
    this.details.isOpen = gi.isOpen;
    if ( this.details.isOpen) {
      this.prev = gi.post.image
      this.utils.getPost(gi.post._id, (post) => {
        this.postDetails = post
      }, this.errorMethod);
    }
    else {
      this.postDetails = null;
    }
  }

  errorMethod = (err) => {
    this.global.errorMethod(err, this.router)
  }

  @HostListener('scroll', ['$event'])

  onScrollUsers(event: any) {
    // visible height + pixel scrolled >= total height 
    let atBottom = event.target.offsetHeight + event.target.scrollTop > event.target.scrollHeight - 500;
    if (atBottom && !this.isLoadedAll) {
      this.pageCountUsers++;
      this.isLoading = true;
      this.utils.findUser(this.strUsers,(users) => {
        this.isLoading = false;
        this.isLoadedAll = users.length < this.itemCount;
        this.resultsUser = this.resultsUser.concat(users);
      }, this.errorMethod, this.pageCountUsers, this.itemCount);
    }
  }

  @HostListener('scroll', ['$event'])

  onScrollPosts(event: any) {
    // visible height + pixel scrolled >= total height 
    let atBottom = event.target.offsetHeight + event.target.scrollTop > event.target.scrollHeight - 500;
    if (atBottom && !this.isLoadedAll) {
      this.pageCountPosts++;
      this.isLoading = true;
      this.utils.findPost(this.strPosts,(posts) => {
        this.isLoading = false;
        this.isLoadedAll = posts.length < this.itemCount;
        this.resultsPost = this.resultsPost.concat(posts);
      }, this.errorMethod, this.pageCountPosts, this.itemCount);
    }
  }


}
