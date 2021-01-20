import { DataService } from './../service/data.service';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { HostListener } from '@angular/core';
import { Global, transAnimation } from './../service/globals';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.css'],

})
export class PostItemComponent implements OnInit {
  @HostListener('contextmenu', ['$event'])
  onRightClick(event) {
    event.preventDefault();
  }

  constructor(private utils: DataService, public global: Global, private router: Router) { }

  @Input('post') post;

  isLiked = false;
  isSaved = false;
  isShowed = false;
  date;

  ngOnInit(): void {
    this.date = new Date(this.post["date"]);
    if (this.global.profile["saved-posts"] && this.global.profile["saved-posts"].includes(this.post._id)) {
      this.isSaved = true;
    }
    if (this.post.likes && this.post.likes.includes(this.global.profile._id)) {
      this.isLiked = true;
    }
  }

  toggleLike() {
    this.isLiked = !this.isLiked;
    if (this.isLiked) {
      this.post.likes.push(this.global.profile["_id"]);
    }
    else {
      this.post.likes.splice(this.post.likes.indexOf(this.global.profile["_id"]), 1);
    }
    this.utils.setLike(this.post["_id"], (data) => { }, this.errorMethod);
  }

  setLike() {
    if (!this.isLiked) {
      this.isLiked = true;
      this.post.likes.push(this.global.profile["_id"]);
      this.utils.setLike(this.post["_id"], (data) => { }, this.errorMethod);
    }
  }

  toggleSave() {
    this.isSaved = !this.isSaved;
    this.utils.savePost(this.post["_id"], this.global.profile["_id"], (data) => {
    });
  }

  showDetails(val) {
    this.isShowed = val;
  }

  errorMethod = (err) => {
    console.log(err)
    this.global.errorMethod(err, this.router)
  }
}
