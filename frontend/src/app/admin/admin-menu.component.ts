import { Component, OnInit } from '@angular/core';
import { APPLICATION_USER_CONSTANT } from './applicationuser/shared/application-user.constant';
import { ISSUE_CONTAINER_CONSTANT } from './issuecontainer/shared/issue-container.constant';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.less']
})
export class AdminMenuComponent implements OnInit {

    applicationUserUrl = APPLICATION_USER_CONSTANT.url;
    issueContainerUrl = ISSUE_CONTAINER_CONSTANT.url;
    
    constructor() { }

  ngOnInit() {
  }

}
