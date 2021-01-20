import { DetailsItemComponent } from './../details-item/details-item.component';
import { CommonModule } from '@angular/common';
import { DataService } from './../service/data.service';
import { Component, OnInit, ViewChildren, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Global, transAnimation } from './../service/globals';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
})
export class ProfilePageComponent implements OnInit {

  @ViewChild("details") details: DetailsItemComponent;

  alive: boolean = true;
  profile; //USER INFO
  isLoading = false;
  postDetails;
  prev;

  constructor(private router: Router, private route: ActivatedRoute, private utils: DataService, public global: Global) {
    let id = this.route.snapshot.paramMap.get('id');
    this.isLoading=true;
    this.utils.getProfile(id, (profile) => {
      this.profile = profile;
      this.isLoading = false;
    }, this.errorMethod);

  }

  ngOnInit(): void {
  }

  toggleFollow() {
    if (this.global.profile.following.includes(this.profile._id)) {
      this.global.profile.following.splice(this.global.profile.following.indexOf(this.profile._id), 1);
      this.profile.followers--;
    }
    else {
      this.global.profile.following.push(this.profile._id);
      this.profile.followers++;
    }

    this.utils.setFollow({ "id": this.profile._id }, (data) => {

    }, this.errorMethod);
  }

  openDetails(event) {
    let gi = event.galleryItem;

    gi.isOpen = !gi.isOpen;
    this.postDetails = null;

    this.details.isOpen = gi.isOpen;
    if (this.details.isOpen) {
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
    console.log(err)
    this.global.errorMethod(err, this.router)
  }
}
