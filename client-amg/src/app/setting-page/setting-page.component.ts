import { Router } from '@angular/router';
import { DataService } from './../service/data.service';
import { Global, transAnimation } from './../service/globals';
import { Component, OnInit } from '@angular/core';
import * as bcrypt from 'bcryptjs';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'app-setting-page',
  templateUrl: './setting-page.component.html',
  styleUrls: ['./setting-page.component.css'],

})
export class SettingPageComponent implements OnInit {

  constructor(private router: Router, public global: Global, private utils: DataService) {
    this.values = {
      "id": this.global.profile._id,
      "username": this.global.profile.username,
      "password": this.global.profile.password,
      "email": this.global.profile.email,
      "image": this.global.profile.image,
      "bio": this.global.profile.bio,
      "nome": this.global.profile.first,
      "cognome": this.global.profile.last,
      "date-of-birth": this.global.profile['date-of-birth'],
      "theme": this.global.profile.theme,
    };
  }

  values;
  isLoading = false;
  file;
  pwdOk = false;

  ngOnInit(): void {
    this.file = this.global.profile.image
  }

  setValue(key, value) {
    this.values[key] = value;
  }

  verifyPwd(value) {
    bcrypt.compare(value, this.global.profile.password, (err, ok) => {
      this.pwdOk = ok;
    });
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
    this.setValue("image",'data:image/png;base64,' + btoa(binaryString));
  }

  triggerFile(fileInput){
    fileInput.click();
  }

  saveSetting() {
    this.isLoading = true;
    this.utils.saveSettings(this.values, (data) => {
      this.utils.getProfile(this.global.profile._id, (profile) => {
        this.global.profile = profile;
        this.global.darkTheme = profile.theme;
        this.global.setTheme();
        this.isLoading = false;
        this.router.navigate(["/profile/" + this.global.profile['_id']]);
      }, this.errorMethod);
    }, this.errorMethod);
  }

  errorMethod = (err) => {
    this.global.errorMethod(err, this.router)
  }

  logout() {
    this.global.init();
    this.utils.logout((response) => {
    }, this.errorMethod);
  }

  deleteAccount(){
    if(confirm("Are you sure to delete your account?")){
      this.utils.deleteAccount(this.global.profile._id,(data)=>{
        this.router.navigate(["/login"]);
      },this.errorMethod);
    }
  }
}
