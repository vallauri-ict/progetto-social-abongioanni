import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { animate, animation, style, transition, trigger } from '@angular/animations';

@Injectable()
export class Global {

  cookie;
  darkTheme;
  profile;

  readonly ICON_ICON="../../assets/icons/icon.png";
  readonly HOME_ICON = "../../assets/icons/home.png";
  readonly USER_ICON = "../../assets/icons/user.png";
  readonly CHAT_ICON = "../../assets/icons/message.png";
  readonly SEARCH_ICON = "../../assets/icons/search-outline.png";
  readonly HEART_OUTLINE_ICON = "../../assets/icons/heart-outline.png";
  readonly HEART_LIKED_ICON = "../../assets/icons/heart-liked.png";
  readonly NOPHOTO_ICON = "../../assets/icons/no-photo.png";
  readonly LOADER_ICON = "../../assets/icons/loader.svg";
  readonly NORESULTS_ICON = "../../assets/icons/no-search-results.png"
  readonly RESULTS_ICON = "../../assets/icons/search-results.png";
  readonly ARROW_ICON = "../../assets/icons/arrow.png";
  readonly COG_ICON = "../../assets/icons/cog.png";
  readonly ADD_ICON = "../../assets/icons/plus.png";
  readonly FOLLOW_ICON = "../../assets/icons/follow.png";
  readonly UNFOLLOW_ICON = "../../assets/icons/unfollow.png";
  readonly BACKGROUND = "../../assets/icons/bg.jpg";
  readonly TICK_ICON = "../../assets/icons/tick.png";
  readonly NOTICK_ICON = "../../assets/icons/notick.png";
  readonly SAVED_ICON = "../../assets/icons/saved.png"
  readonly BOOKMARK_ICON = "../../assets/icons/bookmark-solid.png";
  readonly INFO_ICON="../../assets/icons/info.png"
  
  init(){
    this.cookie=null;
    this.profile=null;
  }

  errorMethod(data, router) {
    if (data.status == 403) {
      router.navigate(["login"]);
    }
    if (data.status == 404) {
      //error page
    }
  }

  b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  setTheme(){
    if (this.darkTheme) {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    }
    else {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    }
  }
}

export const transAnimation=animation( [
  trigger(
    'inOutAnimation', 
    [
      transition(
        ':enter', 
        [
          style({ opacity: 0 }),
          animate('.5s ease-out', 
                  style({ opacity: 1 }))
        ]
      ),
      transition(
        ':leave', 
        [
          style({  opacity: 1 }),
          animate('.5s ease-in', 
                  style({  opacity: 0 }))
        ]
      )
    ]
  )
]);