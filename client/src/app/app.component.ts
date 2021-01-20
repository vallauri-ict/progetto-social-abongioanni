import { CommonModule } from '@angular/common';
import { Global, transAnimation } from './service/globals';
import { DataService } from './service/data.service';
import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { SocketService } from './service/socket-service.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent {
  @HostListener('contextmenu', ['$event'])

  onRightClick(event) {
    event.preventDefault();
  }

  title = 'Diesis';
  isLoading = false;
  isNotification = false;
  message;
  prevUrl:string;

  constructor(private socket: SocketService, private utils: DataService, public global: Global, private router: Router) {
    this.isLoading = true;
    this.setEnvoirment();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      if (this.prevUrl== "/login" && event.url == "/home") {
        this.setEnvoirment();
      }
      this.prevUrl=event.url;
    });
  }

  setEnvoirment() {
    this.utils.getCookie((cookie) => {
      this.global.cookie = cookie;
      this.socket.setupConnection().subscribe((msg) => {
        this.isNotification = true && !(this.router.url.includes('chat'));
        this.message = msg;
      });
      this.utils.getProfile(cookie._id, (profile) => {
        this.isLoading = false;
        this.global.profile = profile;
        this.global.darkTheme = profile.theme;
        this.global.setTheme();
      }, this.errorMethod);
    }, this.errorMethod);
  }

  errorMethod = (err) => {
    console.log(err);
    this.global.errorMethod(err, this.router)
  }

  ngOnInit() {
  }
}
