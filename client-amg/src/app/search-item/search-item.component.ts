import { trigger, transition, useAnimation } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {Global, transAnimation} from './../service/globals';

@Component({
  selector: 'search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.css'],

})
export class SearchItemComponent implements OnInit {

  @Input("user") user;

  constructor(public global: Global) { }

  ngOnInit(): void {    
  }

}
