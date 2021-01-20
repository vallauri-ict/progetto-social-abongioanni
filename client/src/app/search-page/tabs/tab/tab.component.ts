import  * as DarkThemeVariable  from './../../../service/globals';
import { Component, Input, OnInit } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'tab',
  templateUrl: 'tab.component.html',
  animations: [
    trigger('ngIfAnimation', [
      transition('open => closed', [
        useAnimation(DarkThemeVariable.transAnimation, {
          params: {
            height: 0,
            opacity: 1,
            backgroundColor: 'red',
            time: '1s'
          }
        })
      ])
    ])
  ],
})
export class TabComponent {

  constructor() { }

  darkTheme;

  @Input('tabTitle') title: string;
  @Input() active = false;

  ngOnInit(){
    this.darkTheme=DarkThemeVariable
  }
}
