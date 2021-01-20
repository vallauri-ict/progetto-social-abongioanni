import { trigger, transition, useAnimation } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Global, transAnimation } from '../service/globals';
import { SocketService } from '../service/socket-service.service';

@Component({
  selector: 'app-direct-details-page',
  templateUrl: './direct-details-page.component.html',
  styleUrls: ['./direct-details-page.component.css'],
})
export class DirectDetailsPageComponent implements OnInit {

  chatDetails;
  id;
  isLoading:boolean;

  constructor(private socketService: SocketService, public global: Global, private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isLoading=true;
    this.socketService.getChatDetails(this.id).subscribe((msg) => {
      this.chatDetails=msg;
      this.isLoading=false;
    });
  }

  ngOnInit(): void {
  }

}
