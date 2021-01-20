import { Component, Input, OnInit } from '@angular/core';
import { Global, transAnimation } from '../service/globals';
import { CommonModule } from '@angular/common';
import { trigger, transition, useAnimation } from '@angular/animations';
@Component({
  selector: 'header-item',
  templateUrl: './header-item.component.html',
  styleUrls: ['./header-item.component.css'],

})
export class HeaderItemComponent implements OnInit {

  @Input('link') routerLink;
  @Input('icon') icon;
  @Input('invertIcon') invert: boolean;

  constructor(public global:Global) { }

  ngOnInit(): void {
  }

}
