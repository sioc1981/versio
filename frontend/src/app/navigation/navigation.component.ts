import {
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { VerticalNavigationItem } from 'patternfly-ng/navigation/vertical-navigation/vertical-navigation-item';
import { VerticalNavigationComponent } from 'patternfly-ng';
import { RELEASE_CONSTANT } from '../release/shared/release.service';
import { ISSUE_CONSTANT } from '../issue/shared/issue.service';
import { PATCH_CONSTANT } from '../patch/shared/patch.service';
import { Subscription } from 'rxjs';


@Component({
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line:component-selector
    selector: 'app-navigation',
    styles: [`
    .example-page-container.container-fluid {
      position: fixed;
      top: 37px;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #f5f5f5;
      padding-top: 15px;
    }

    .hide-vertical-nav {
      margin-top: 15px;
      margin-left: 30px;
    }

    .navbar-brand-txt {
      line-height: 34px;
    }
  `],
    templateUrl: './navigation.component.html'
})
export class NavigationComponent implements OnInit, OnDestroy {

    @ViewChild('myNav') nav: VerticalNavigationComponent;

    navigationItems: VerticalNavigationItem[];


    private subscriptions: Subscription[] = [];

    constructor(private chRef: ChangeDetectorRef, private router: Router, private activatedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        //   VERSION_CONSTANT.summary.count$.subscribe(c => this.navigationItems[1].badges[0].count = c);
        this.subscriptions.push(RELEASE_CONSTANT.summary.count$.subscribe(c => this.navigationItems[1].badges[0].count = c));
        this.subscriptions.push(ISSUE_CONSTANT.summary.count$.subscribe(c => this.navigationItems[3].badges[0].count = c));
        this.subscriptions.push(PATCH_CONSTANT.summary.count$.subscribe(c => this.navigationItems[2].badges[0].count = c));
        this.refreshItems();
    }

    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }



    refreshItems(): void {
        this.navigationItems = this.getItems();
    }

    getItems(): VerticalNavigationItem[] {
        return [
            {
                title: 'Dashboard',
                iconStyleClass: 'fa fa-dashboard',
                url: '/dashboard'
            },
            {
                title: RELEASE_CONSTANT.title,
                iconStyleClass: RELEASE_CONSTANT.iconStyleClass,
                url: RELEASE_CONSTANT.url,
                badges: [
                    {
                        count: RELEASE_CONSTANT.summary.count,
                        tooltip: 'Total number of releases'
                    }
                ]
            },
            {
                title: PATCH_CONSTANT.title,
                iconStyleClass: PATCH_CONSTANT.iconStyleClass,
                url: PATCH_CONSTANT.url,
                badges: [
                    {
                        count: PATCH_CONSTANT.summary.count,
                        tooltip: 'Total number of patchs'
                    }
                ]
            },
            {
                title: ISSUE_CONSTANT.title,
                iconStyleClass: ISSUE_CONSTANT.iconStyleClass,
                url: ISSUE_CONSTANT.url,
                badges: [
                    {
                        count: ISSUE_CONSTANT.summary.count,
                        tooltip: 'Total number of issues'
                    }
                ]
            },
            {
                title: 'Compare',
                iconStyleClass: 'fa fa-columns',
                url: '/compare',
            }
        ];
    }

}
