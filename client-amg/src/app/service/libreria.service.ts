import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LibreriaService {

  constructor(private http: HttpClient) { }

  httpOptions = {
    withCredentials: true,
  };

  getRequest(url: string,) {
    return this.http.get(url, this.httpOptions);
  }

  postRequest(url: string, params = {}) {
    return this.http.post(url, params, this.httpOptions);
  }
}
