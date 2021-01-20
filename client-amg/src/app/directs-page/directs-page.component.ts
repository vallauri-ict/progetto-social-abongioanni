import { Global, transAnimation } from './../service/globals';
import { SocketService } from './../service/socket-service.service';
import { Component, OnInit } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'directs-page',
  templateUrl: './directs-page.component.html',
  styleUrls: ['./directs-page.component.css'],

})
export class DirectsPageComponent implements OnInit {

  directList = [];
  isLoading;

  constructor(private socketService: SocketService, public global: Global) { }

  ngOnInit(): void {
    this.isLoading=true;
    setTimeout(() => {
      this.socketService.getDirects(this.global.profile._id).subscribe((msg) => {
        this.isLoading=false;
        this.directList = msg;
      });
    }, 1500);
  }

}
