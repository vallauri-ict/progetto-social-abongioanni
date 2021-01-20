import { Router } from '@angular/router';
import { DataService } from './../service/data.service';
import { SocketService } from './../service/socket-service.service';
import { CommonModule } from '@angular/common';
import { Global, transAnimation } from './../service/globals';
import { Component, OnInit } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'app-chat-create-page',
  templateUrl: './chat-create-page.component.html',
  styleUrls: ['./chat-create-page.component.css'],
})
export class ChatCreatePageComponent implements OnInit {

  isLoading: boolean;
  image=this.global.CHAT_ICON;
  file;
  partecipants=[this.global.profile._id];
  users;

  constructor(public global: Global,private utils:DataService,private router:Router) {
    this.utils.getProfileFollowing(this.global.profile._id,(data)=>{
      this.users=data;
    },this.errorMethod);
   }

  ngOnInit(): void {
  }

  createChat(name) {
    if (name && this.image) {
      this.isLoading = true;
      this.utils.createChat({"name":name,"image":this.image,"partecipants":this.partecipants},(data)=>{
        this.router.navigate(["/directs"]);
      },this.errorMethod);
    } 
  }

  triggerFile(fileInput){
    fileInput.click();
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
    this.image='data:image/png;base64,' + btoa(binaryString);
  }

  errorMethod = (err) => {
    console.log(err)
    this.global.errorMethod(err, this.router)
  }

  selectUser(_id){
    let i=this.partecipants.indexOf(_id);
    if(i<0){
      this.partecipants.push(_id);
    }
    else{
      this.partecipants.splice(i,1);
    }
  }

}
