import { GalleryItemComponent } from './../gallery-item/gallery-item.component';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Global, transAnimation } from '../service/globals';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'gallery-list',
  templateUrl: './gallery-list.component.html',
  styleUrls: ['./gallery-list.component.css'],

})
export class GalleryListComponent implements OnInit {

  @Input('list') list;
  @Output('scroll') onScrollEvent = new EventEmitter();
  @Output('click') onClickEvent = new EventEmitter();

  constructor(public global: Global) { }

  ngOnInit(): void {
  }

  onClick(event, galleryItem) {
    this.onClickEvent.emit({ event: event, "galleryItem": galleryItem });
  }

  onScroll(event) {
    this.onScrollEvent.emit(event);
  }

}
