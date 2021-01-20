import { Global, transAnimation } from './../service/globals';
import { DataService } from './../service/data.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.css'],
})
export class ResetPasswordPageComponent implements OnInit {

  img;
  cookie;
  errorPassword = false;
  password;

  constructor(private utils: DataService, public global: Global, private router: Router) {
    this.utils.getCookie((cookie) => {
      this.img = cookie.image;
      this.cookie = cookie;
    }, this.errorMethod);
  }

  setPassword(value) {
    this.password = value;
  }

  checkPassword(value) {
    this.errorPassword = value != this.password;
  }

  changePassword() {
    if (!this.errorPassword && this.password) {
      this.utils.updatePassword(this.password, (data) => {
        if (data.result == "ok") {
          this.router.navigate(['/login']);
        }
      }, this.errorMethod);
    }
  }

  ngOnInit(): void {
  }

  errorMethod = (err) => {
    console.log(err)
    //this.global.errorMethod(err, this.router)
  }
}
