import { Global } from './globals';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { io } from 'socket.io-client/build/index';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  //"https://progetto-mana.herokuapp.com"

  private socketClient;

  constructor() { }

  setupConnection() {
    this.socketClient = io(environment.SERVER_ENDPOINT, {
      withCredentials: true
    });
    return Observable.create((observer) => {
      this.socketClient.on('message_received', (message) => {
        observer.next(message);
      });
    });
  }

  getDirects(_id) {
    this.socketClient.emit('get_rooms', { "_id": _id });
    return Observable.create((observer) => {
      this.socketClient.on('room_list', (message) => {
        observer.next(message);
      });
    });
  }

  getChat(_id, user, number = 0/* , amount = 10 */) {
    this.socketClient.emit('get_chat', {
      "_id": _id,
      "user": user,
      "number": number,
      /* "amount": amount */
    });
    return Observable.create((observer) => {
      this.socketClient.on('chat_list', (message) => {
        observer.next(message);
      });
    });
  }

  getChatUpdate(_id, user, number = 0/* , amount = 10 */){
    this.socketClient.emit('get_chat_update', {
      "_id": _id,
      "user": user,
      "number": number,
      /* "amount": amount */
    });
    return Observable.create((observer) => {
      this.socketClient.on('chat_update', (message) => {
        observer.next(message);
      });
    });
  }

  getChatDetails(_id) {
    this.socketClient.emit('get_chat_details', {
      "_id": _id,
    });
    return Observable.create((observer) => {
      this.socketClient.on('chat_details', (message) => {
        observer.next(message);
      });
    });
  }

  exitChat(userId) {
    this.socketClient.emit('exit_chat', {
      "userId": userId
    });
  }

  sendMessage(userId, text) {
    this.socketClient.emit('set_message', {
      "userId": userId,
      "text": text
    });
  }

  startListen(_id) {
    return Observable.create((observer) => {
      this.socketClient.on('message_received', (message) => {
        observer.next(message);
      });
    });
  }
}
