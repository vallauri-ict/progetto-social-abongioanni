import { Router } from '@angular/router';
import { DataService } from './../service/data.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Global, transAnimation } from '../service/globals';
import { Subject } from 'rxjs';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {

  id = "1";  // ID UTENTE
  posts = [];  // ARRAY TUTTI I POST
  pageCount = 0;
  itemCount = 5;
  isLoading = false;
  isLoadedAll = false;
  atTop = true;

  constructor(private utils: DataService, public global: Global, private router: Router) { }
  @HostListener('scroll', ['$event'])


  onScroll(event: any) {
    // visible height + pixel scrolled >= total height 
    let atBottom = event.target.offsetHeight + event.target.scrollTop > event.target.scrollHeight - 500;
    this.atTop = event.target.offsetHeight + event.target.scrollTop == event.target.offsetHeight;
    if (atBottom && !this.isLoadedAll) {
      this.pageCount++;
      this.isLoading = true;
      this.utils.getHome((posts) => {
        this.isLoading = false;
        this.isLoadedAll = posts.length < this.itemCount;
        this.posts = this.posts.concat(posts);
      }, this.errorMethod, this.pageCount, this.itemCount);
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.isLoadedAll = false;
    this.pageCount = 0;
    this.utils.getHome((posts) => {
      setTimeout(() => {
        this.isLoading = false;
        this.posts = [];
        this.posts = posts;
      }, 500);
    }, this.errorMethod, this.pageCount, this.itemCount);
  }

  updateHome(event: Subject<any>) {
    this.isLoading = true;
    this.isLoadedAll = false;
    this.pageCount = 0;

    this.utils.getHome((posts) => {
      this.isLoading = false;

      this.posts = [];
      this.posts = posts;
      event.next();
    }, this.errorMethod, this.pageCount, this.itemCount);
  }

  errorMethod = (err) => {
    console.log(err)
    this.global.errorMethod(err, this.router)
  }
}
