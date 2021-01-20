import { trigger, transition, useAnimation } from '@angular/animations';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { Global, transAnimation } from './../service/globals';


@Component({
  selector: 'gallery-item',
  templateUrl: './gallery-item.component.html',
  styleUrls: ['./gallery-item.component.css'],
 
})
export class GalleryItemComponent implements OnInit {
  @Input('post') post;
  isOpen = false;

  constructor(public global: Global) {
  }

  ngOnInit(): void {
  }
}
