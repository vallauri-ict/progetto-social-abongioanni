import { CommonModule } from '@angular/common';
import { Global } from './../service/globals';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'loader-item',
  templateUrl: './loader-item.component.html',
  styleUrls: ['./loader-item.component.css']
})
export class LoaderItemComponent implements OnInit {

  constructor(public global:Global) { }

  ngOnInit(): void {
  }

}
