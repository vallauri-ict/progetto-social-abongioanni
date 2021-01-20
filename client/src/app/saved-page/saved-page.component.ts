import { DetailsItemComponent } from './../details-item/details-item.component';
import { DataService } from './../service/data.service';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Global, transAnimation } from '../service/globals';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate, keyframes, useAnimation } from '@angular/animations';

@Component({
  selector: 'app-saved-page',
  templateUrl: './saved-page.component.html',
  styleUrls: ['./saved-page.component.css'],
})
export class SavedPageComponent implements OnInit {

  @ViewChild('details') details:DetailsItemComponent;

  pageCount = 0;
  itemCount = 10;
  posts = [];
  atTop;
  isLoadedAll = false;
  isLoading = false;
  postDetails;
  isOpen = false;
  prev;

  constructor(public global: Global, private utils: DataService, private router: Router) {
    this.utils.getSaved((posts) => {
      this.posts = posts;
    }, this.errorMethod, this.pageCount, this.itemCount);
  }

  @HostListener('scroll', ['$event'])

  onScroll(event: any) {
    // visible height + pixel scrolled >= total height 
    let atBottom = event.target.offsetHeight + event.target.scrollTop > event.target.scrollHeight - 500;
    this.atTop = event.target.offsetHeight + event.target.scrollTop == event.target.offsetHeight;
    if (atBottom && !this.isLoadedAll) {
      this.pageCount++;
      this.isLoading = true;
      this.utils.getSaved((posts) => {
        this.isLoading = false;
        this.isLoadedAll = posts.length < this.itemCount;
        this.posts = this.posts.concat(posts);
      }, this.errorMethod, this.pageCount, this.itemCount);
    }
  }
  
  openDetails(event) {
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

  ngOnInit(): void {
  }

  errorMethod = (err) => {
    console.log(err)
    this.global.errorMethod(err, this.router)
  }


}
