import { environment } from './../../environments/environment';
import { LibreriaService } from './libreria.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private libreria: LibreriaService) { }

  getPost(id: string, callback, error) {
    this.libreria.getRequest(environment.SERVER_ENDPOINT + "/post/" + id).toPromise().then(callback).catch(error);
  }

  setLike(id, callback, error) {
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/post/like", {"id":id}).toPromise().then(callback).catch(error);
  }

  addPost(post: FormData, callback, error) {
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/post/add", post).toPromise().then(callback).catch(error);
  }

  savePost(id: string, callback, error) {
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/post/save", { "id": id }).toPromise().then(callback).catch(error);
  }

  removePost(id: string, callback, error) {
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/post/remove", { "id": id }).toPromise().then(callback).catch(error);
  }

  getSettings(callback, error) {
    this.libreria.getRequest(environment.SERVER_ENDPOINT + "/settings").toPromise().then(callback).catch(error);
  }

  saveSettings(settings, callback, error) {
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/settings/save", settings).toPromise().then(callback).catch(error);
  }

  findUser(searchString: string, callback, error, page: number = 0, amount: number = 1) {
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/search/user", {
      "search": searchString,
      "user_number": page,
      "user_amount": amount
    }).toPromise().then(callback).catch(error);
  }

  findPost(searchString: string, callback, error, page: number = 0, amount: number = 1) {
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/search/post", {
      "search": searchString,
      "post_number": page,
      "post_amount": amount
    }).toPromise().then(callback).catch(error);
  }

  setFollow(params, callback, error) {
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/profile/follow", {
      "id": params.id
    }).toPromise().then(callback).catch(error);
  }

  getProfile(id: string, callback, error) {
    this.libreria.getRequest(environment.SERVER_ENDPOINT + "/profile/" + id).toPromise().then(callback).catch(error);
  }

  getSaved(callback, error, page: number = 0, amount: number = 1) {
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/profile/saved",{"post_number": page,"post_amount": amount}).toPromise().then(callback).catch(error);
  }

  getProfileFollowers(id: string, callback, error) {
    this.libreria.getRequest(environment.SERVER_ENDPOINT + "/profile/" + id + "/followers").toPromise().then(callback).catch(error);
  }

  getProfileFollowing(id: string, callback, error) {
    this.libreria.getRequest(environment.SERVER_ENDPOINT + "/profile/" + id + "/following").toPromise().then(callback).catch(error);
  }

  getHome(callback,error,page: number = 0, amount: number = 1) {
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/home", {
      "post_number": page,
      "post_amount": amount
    }).toPromise().then(callback).catch(error);
  }

  getCookie(callback, error) {
    this.libreria.getRequest(environment.SERVER_ENDPOINT + "/cookie").toPromise().then(callback).catch(error);
  }

  login(username,password,callback,error){
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/login",{"username":username,"password":password}).toPromise().then(callback).catch(error);
  }

  signUp(values,callback,error){
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/signup",values).toPromise().then(callback).catch(error);
  }

  logout(callback,error){
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/logout").toPromise().then(callback).catch(error);
  }

  getProfileImage(username,callback,error){
    this.libreria.getRequest(environment.SERVER_ENDPOINT + "/login/"+username).toPromise().then(callback).catch(error);
  }

  getProfileProp(key,value,callback,error){
    this.libreria.getRequest(environment.SERVER_ENDPOINT + "/signup/"+key+"/"+value).toPromise().then(callback).catch(error);
  }

  passwordRecovery(username,callback,error){
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/login/forgot",{"username":username}).toPromise().then(callback).catch(error);
  }

  updatePassword(password,callback,error){
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/login/update",{"password":password}).toPromise().then(callback).catch(error);
  }

  deleteAccount(_id,callback,error){
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/profile/delete",{"id":_id}).toPromise().then(callback).catch(error);
  }

  createChat(params,callback,error){
    this.libreria.postRequest(environment.SERVER_ENDPOINT + "/chat/create",params).toPromise().then(callback).catch(error);
  }

}
