import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { Global } from '../service/globals';

@Component({
  selector: 'details-item',
  templateUrl: './details-item.component.html',
  styleUrls: ['./details-item.component.css'],
  animations: [
    trigger("openClose", [
      state("open", style({
        top: "0vh",
      })),
      state("close", style({
        top: "100vh",
      })),
      transition("close => open", [
        animate(".5s ease-in", keyframes([
          style({
            top: "100vh"
          }),
          style({
            top: "-2vh"
          }),
          style({
            top: "0vh"
          }),
        ]))
      ]),
      transition("open => close", [
        animate(".5s ease")
      ])
    ]),
    trigger("openCloseGlass", [
      state("open", style({
        "z-index": 3,
        "background-color": "rgba(0, 0, 0, .15)",
        "backdrop-filter": "blur(20px)",
        "box-shadow": "0 0 1rem 0 rgba(0, 0, 0, .075)",
      })),
      state("close", style({
        "background-color": "rgba(255, 255, 255, 0)",
        "backdrop-filter": "blur(0px)",
        "box-shadow": "0 0 1rem 0 rgba(0, 0, 0, 0)",
        "z-index": -1,
      })),
      transition("* <=> *", [
        animate(".5s ease-in")
      ])
    ])
  ]
})
export class DetailsItemComponent implements OnInit {

  public isOpen=false;
  @Input('post') post;
  @Input('preview') prev;
  isLoading;

  constructor(public global:Global) { }

  ngOnInit(): void {
  }

  onSwipe(action) {
    this.isOpen=false;
  }
}
