import { Router, RouterModule } from '@angular/router';
import { DataService } from './../service/data.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Global, transAnimation } from './../service/globals';
import { FormBuilder, FormGroup } from '@angular/forms';
import { trigger, transition, useAnimation } from '@angular/animations';


@Component({
  selector: 'app-posting-page',
  templateUrl: './posting-page.component.html',
  styleUrls: ['./posting-page.component.css'],

})
export class PostingPageComponent implements OnInit {
  file = null;
  loading = false;
  secondStep = false;
  description: string;
  tag: string;
  resultCanvas: HTMLElement;
  fileOriginal = null;
  f;
  formData: FormData;
  src = {}
  filters = [
    "Sepia",
    "Contrast",
    "Hue",
    "Polaroid",
    "Technicolor",
  ];

  @ViewChild("body") body: ElementRef;
  level: any;

  constructor(private utils: DataService, private router: Router, public global: Global) { }


  loadFilterPreview(e, filter) {
    this.resultCanvas = e.detail.result;
    let canvas = this.resultCanvas as HTMLCanvasElement;
    // export as dataUrl or Blob!

    this.src[filter] = canvas.toDataURL('image/jpeg', 1.0);
  }

  ngOnInit(): void {
  }

  handleFileInput(files: FileList) {
    if (files) {
      let file = files.item(0);

      this.f = file;

      var reader = new FileReader();
      this.file = null;
      this.secondStep = false;
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.fileOriginal = this.file = 'data:image/png;base64,' + btoa(binaryString);

    this.src["original"] = this.file;
  }

  changeFilter(selected, level?) {
    console.log(this.src)
    this.file = this.src[selected];
    var block = this.file.split(";");
    var contentType = block[0].split(":")[1];
    var realData = block[1].split(",")[1];
    this.f = this.global.b64toBlob(realData, contentType,512);    
  }

  setPost(event) {
    if (!this.file) {
      alert("Carica un file prima!");
      return;
    }
    else if (!this.secondStep) {
      this.secondStep = true;
    }
    else {
      if (this.tag.length > 0 && this.tag[0] != "#") {
        this.tag = "#" + this.tag.trim();
      }
      this.loading = true;
      this.formData = new FormData();
      this.formData.append("image", this.f);
      this.formData.append("id", this.global.profile._id);
      this.formData.append("tags", this.tag);
      this.formData.append("description", this.description);

      this.utils.addPost(this.formData, (data) => {
        this.loading = false;
        if ("result" in data) {
          this.file = null;
          this.secondStep = false;
          this.router.navigate(["/profile/" + this.global.profile['_id']])
        }
      },this.errorMethod);
    }
    event.stopPropagation();
  }

  setDescription(str) {
    this.description = str;
  }

  setTag(str) {
    this.tag = str;
  }

  goBack() {
    this.secondStep = false;
  }

  errorMethod = (err) => {
    console.log(err)
    this.global.errorMethod(err, this.router)
  }

}
