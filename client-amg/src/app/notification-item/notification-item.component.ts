import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Global } from '../service/globals';

@Component({
  selector: 'notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.css']
})
export class NotificationItemComponent implements OnInit {

  @Input('message') msg;

  constructor(public global:Global) { }

  ngOnInit(): void {
  }

}
