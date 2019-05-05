import { Component, OnInit } from '@angular/core';
import { EmptyStateConfig, ActionConfig } from 'patternfly-ng';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.less']
})
export class PageNotFoundComponent implements OnInit {

  emptyStateConfig: EmptyStateConfig;
  actionConfig: ActionConfig;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.actionConfig = {
      primaryActions: [{
        id: 'action1',
        title: 'Home Page',
        tooltip: 'Return on the Home page'
      }]
    } as ActionConfig;

    this.emptyStateConfig = {
      actions: this.actionConfig,
      iconStyleClass: 'pficon-warning-triangle-o',
      title: 'Page Not Found'
    } as EmptyStateConfig;
  }

  handleAction(): void {
    this.router.navigate(['/']);
  }
}
