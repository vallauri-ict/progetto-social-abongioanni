import { toBase64String } from '@angular/compiler/src/output/source_map';
import { Component, ContentChildren, OnInit, QueryList } from '@angular/core';
import { TabComponent } from './tab/tab.component';
import { Global, transAnimation } from './../../service/globals';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'tabs',
  templateUrl: './tabs.component.html',
  animations: [
    trigger('ngIfAnimation', [
      transition('open => closed', [
        useAnimation(transAnimation, {
          params: {
            height: 0,
            opacity: 1,
            backgroundColor: 'red',
            time: '1s'
          }
        })
      ])
    ])
  ],
})
export class TabsComponent {

  constructor(public global: Global) { }

  public activeTab;

  @ContentChildren(TabComponent) tb: QueryList<TabComponent>;
  public tabs;

  ngOnInit() {
  }

  // contentChildren are set
  ngAfterContentInit() {
    this.tabs = this.tb;
    // get all active tabs
    let activeTabs = this.tabs.filter((tab) => tab.active);

    // if there is no active tab set, activate the first
    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first.title);
    }
  }

  selectTab(tab) {
    // deactivate all tabs
    this.tabs.toArray().forEach(tab => {
      if (tab.title == tab) {
        tab.active = true;
        this.activeTab = tab
      }
      else {
        tab.active = false
      }
    });
  }
}
