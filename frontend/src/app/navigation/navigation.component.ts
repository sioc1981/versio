import {
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute, RouterEvent } from '@angular/router';

import { VerticalNavigationItem } from 'patternfly-ng/navigation/vertical-navigation/vertical-navigation-item';
import { VerticalNavigationComponent } from 'patternfly-ng';
import { RELEASE_CONSTANT } from '../release/shared/release.service';
import { PATCH_CONSTANT } from '../patch/shared/patch.service';
import { Subscription} from 'rxjs';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';
import { filter } from 'rxjs/operators';


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

    private DASHBOARD_INDEX = 0;
    private RELEASES_INDEX = 1;
    private PATCHES_INDEX = 2;
    private ISSUES_INDEX = 3;
    private COMPARE_INDEX = 4;

    @ViewChild('myNav') nav: VerticalNavigationComponent;

    navigationItems: VerticalNavigationItem[];

    private subscriptions: Subscription[] = [];

    constructor(private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit(): void {

        this.subscriptions.push(this.router.events.pipe(
            filter(e => e instanceof RouterEvent)
        ).subscribe((e: RouterEvent) => {
            // to keep parameter when click on compare menu
            if (e.url.startsWith('/compare')) {
                this.navigationItems[this.COMPARE_INDEX].url = e.url;
            } else {
                this.navigationItems[this.COMPARE_INDEX].url = '/compare';
            }
        }));
        this.subscriptions.push(RELEASE_CONSTANT.summary.count$.subscribe(c =>
            this.navigationItems[this.RELEASES_INDEX].badges[0].count = c));
        this.subscriptions.push(ISSUE_CONSTANT.summary.count$.subscribe(c =>
            this.navigationItems[this.ISSUES_INDEX].badges[0].count = c));
        this.subscriptions.push(PATCH_CONSTANT.summary.count$.subscribe(c =>
            this.navigationItems[this.PATCHES_INDEX].badges[0].count = c));
        this.navigationItems = this.getItems();
    }

    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    getItems(): VerticalNavigationItem[] {
        const res: VerticalNavigationItem[] = [];
        res[this.DASHBOARD_INDEX] = {
            title: 'Dashboard',
            iconStyleClass: 'fa fa-dashboard',
            url: '/dashboard'
        } as VerticalNavigationItem;

        res[this.RELEASES_INDEX] = {
            title: RELEASE_CONSTANT.title,
                iconStyleClass: RELEASE_CONSTANT.iconStyleClass,
                    url: RELEASE_CONSTANT.url,
                        badges: [
                            {
                                count: RELEASE_CONSTANT.summary.count,
                                tooltip: 'Total number of releases'
                            }
                        ]
        };
        res[this.PATCHES_INDEX] = {
            title: PATCH_CONSTANT.title,
                iconStyleClass: PATCH_CONSTANT.iconStyleClass,
                    url: PATCH_CONSTANT.url,
                        badges: [
                            {
                                count: PATCH_CONSTANT.summary.count,
                                tooltip: 'Total number of patchs'
                            }
                        ]
        };
        res[this.ISSUES_INDEX] = {
            title: ISSUE_CONSTANT.title,
                iconStyleClass: ISSUE_CONSTANT.iconStyleClass,
                    url: ISSUE_CONSTANT.url,
                        badges: [
                            {
                                count: ISSUE_CONSTANT.summary.count,
                                tooltip: 'Total number of issues'
                            }
                        ]
        };
        res[this.COMPARE_INDEX] = {
            title: 'Compare',
                iconStyleClass: 'fa fa-columns',
                    url: '/compare'
        };
        return res;
    }

}
