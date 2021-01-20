import { SocketService } from './../service/socket-service.service';
import { Global, transAnimation } from './../service/globals';
import { DataService } from './../service/data.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate, keyframes, useAnimation } from '@angular/animations';

@Component({
  selector: 'login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],

})
export class LoginPageComponent implements OnInit {

  constructor(private utils: DataService, private router: Router, public global: Global, private socket: SocketService) {
    this.isLoading = true;
    if (this.getCookie("token")) {
      this.router.navigate(['/home']);
    }
  }

  values = {
    "theme": false,
  };
  isLoading = false;
  pwdOk = false;
  allOk = false;
  errorEmail = false;
  errorUsername = false;
  img;
  file
  username;
  password;
  isLogin = true;

  ngOnInit(): void { }

  getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  setUsername(value) {
    this.username = value;
    this.utils.getProfileImage(this.username, (data) => {
      if (data) {
        this.img = data.image;
      }
      else {
        this.img = "";
      }
    }, this.errorMethod);
  }

  setPassword(value) {
    this.password = value;
  }

  login() {
    if (this.username && this.password) {
      this.utils.login(this.username, this.password, (response) => {
        if (response.result == "ok") {
          this.router.navigate(['/home']);
        }
      }, this.errorMethod);
    }
  }

  signUpSetup() {
    this.isLogin = false;
    this.img = "../../assets/icons/user.png"
  }

  loginSetup() {
    this.isLogin = true;
    this.img = ""
  }

  errorMethod = (err) => {
    if (err.status == 401) {
      alert("username o pwd non validi");
    }
    else if (err.status == 500) {
      alert("username non esistente");
    }
  }

  setValue(key, value) {
    if (key == "email" || key == "username") {
      this.utils.getProfileProp(key, value, (response) => {
        if (response.ris == "nok") {
          if (key == "username") {
            this.errorUsername = true;
          }
          else {
            this.errorEmail = true;
          }
        }
        else {
          if (key == "username") {
            this.errorUsername = false;
          }
          else {
            this.errorEmail = false;
          }
        }
      }, this.errorMethod);
    }
    this.values[key] = value;
    this.allOk = Object.keys(this.values).length == 9;
  }

  verifyPwd(v1, v2) {
    this.pwdOk = this.values["password"] == v2
  }

  handleFileInput(files: FileList) {
    if (files) {
      this.file = files.item(0);
      var reader = new FileReader();

      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(this.file);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.img = 'data:image/png;base64,' + btoa(binaryString);
    this.setValue("image", this.img);
  }

  passwordRecovery(username) {
    if (username == "") {
      this.errorUsername = true;
    }
    else {
      this.utils.passwordRecovery(username, (data) => {
        if (data.result == "ok") {
          alert("email inviata");
        }
      }, this.errorMethod);
    }
  }

  signUp() {
    if (this.allOk && this.pwdOk && !this.errorEmail && !this.errorUsername) {
      this.utils.signUp(this.values, (data) => {
        this.router.navigate(["/profile/" + data._id]);
      }, this.errorMethod);
    }
  }

}
