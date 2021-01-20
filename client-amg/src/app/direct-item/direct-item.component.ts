import { CommonModule } from '@angular/common';
import { Global, transAnimation } from './../service/globals';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'direct-item',
  templateUrl: './direct-item.component.html',
  styleUrls: ['./direct-item.component.css'],
  
})
export class DirectItemComponent implements OnInit {

  @Input('direct') direct;

  constructor(public global:Global) {
   }

  ngOnInit(): void {    
    this.direct.last=new Date(this.direct.last).toDateString();
  }

}
