import { Global, transAnimation } from './../service/globals';
import { SocketService } from './../service/socket-service.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild, AfterViewChecked, AfterViewInit, QueryList, ViewChildren, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
})
export class ChatPageComponent implements AfterViewChecked, AfterViewInit, OnInit, AfterContentInit {

  number;
  readonly amount = 20;
  isLoadedAll = false;
  isLoading = true;
  isLoadingChat=false;
  id;
  atTop: boolean;
  messageList;
  chatName;
  chatId;
  private scrollContainer: any;
  scrolltop: number = null;

  @ViewChild('chat', { read: ElementRef, static: true }) scrollFrame: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;

  constructor(private socketService: SocketService, public global: Global, private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.number = 0;
    this.isLoading = true;

    this.socketService.getChat(this.id, this.global.cookie, this.number/* , this.amount */).subscribe((msg) => {
      this.isLoading = false;

      this.messageList = msg.messages.reverse();
      this.chatId = msg._id;
      this.chatName = msg.name;

      this.socketService.startListen(this.id).subscribe((msg) => {
        this.messageList.unshift(msg);
      });

    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.scrollContainer = this.scrollFrame.nativeElement;
    this.scrollToBottom();
    this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
  }

  private onItemElementsChanged(): void {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom()
    this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
  }

  private scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  ngAfterContentInit() {
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    // visible height + pixel scrolled >= total height 
    let atBottom = event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight-5;
    // if (atBottom && !this.isLoadedAll && !this.isLoadingChat) {
    //   this.isLoadingChat=true;
    //   this.number++;
    //   this.socketService.getChatUpdate(this.id,this.global.cookie, this.number, this.amount).subscribe((msg) => {
    //     this.isLoadedAll = msg.length < this.amount;
    //     this.messageList = this.messageList.concat(msg.reverse());
    //     this.isLoadingChat=false;
    //   });
    // }
  }

  @HostListener('window:beforeunload', ['$event'])
  onLeavePage(event) {
    this.socketService.exitChat(this.global.cookie._id);
  }

  sendText(text) {
    this.socketService.sendMessage(this.global.profile._id, text.value);
    text.value = "";
  }

}
