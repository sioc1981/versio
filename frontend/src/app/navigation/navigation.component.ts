import {
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    OnDestroy,
    TemplateRef
} from '@angular/core';
import { Router, ActivatedRoute, RouterEvent } from '@angular/router';

import { VerticalNavigationItem } from 'patternfly-ng/navigation/vertical-navigation/vertical-navigation-item';
import { VerticalNavigationComponent, AboutModalEvent, AboutModalConfig } from 'patternfly-ng';
import { PATCH_CONSTANT } from '../patch/shared/patch.service';
import { Subscription } from 'rxjs';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';
import { filter } from 'rxjs/operators';
import { RELEASE_CONSTANT } from '../release/shared/release.constant';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { APP_CONSTANT } from '../app.constants';
import { AuthenticationService } from '../auth/authentication.service';


@Component({
    encapsulation: ViewEncapsulation.None,
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
    aboutConfig: AboutModalConfig;
    modalRef: BsModalRef;

    navigationItems: VerticalNavigationItem[];

    applicationName = APP_CONSTANT.applicationName;
    hasAuthentication = this.authenticationService.canAuthenticate();

    username = '';

    loggedIn = false;

    private subscriptions: Subscription[] = [];

    constructor(private router: Router, private route: ActivatedRoute, private modalService: BsModalService,
        private authenticationService: AuthenticationService) {
    }

    ngOnInit(): void {

        this.aboutConfig = {
            additionalInfo: 'Application to track changes on versions of an Application',
            copyright: 'Trademark and Copyright Information',
            title: this.applicationName,
            productInfo: [
                { name: 'Version', value: environment.version },
                { name: 'Server Name', value: 'Localhost' },
                { name: 'User Name', value: 'admin' },
                { name: 'User Role', value: 'Administrator' }]
        } as AboutModalConfig;

        this.subscriptions.push(this.router.events.pipe(
            filter(e => e instanceof RouterEvent)
        ).subscribe((e: RouterEvent) => {
            // to keep parameter when click on compare menu
            if (e.url.startsWith('/compare')) {
                this.navigationItems[this.COMPARE_INDEX].url = e.url;
            } else {
                this.navigationItems[this.COMPARE_INDEX].url = '/compare';
            }
            // to keep parameter when click on releases menu
            if (e.url.startsWith('/release')) {
                this.navigationItems[this.RELEASES_INDEX].url = e.url;
            } else {
                this.navigationItems[this.RELEASES_INDEX].url = '/releases';
            }
        }));
        this.subscriptions.push(RELEASE_CONSTANT.summary.count$.subscribe(c =>
            this.navigationItems[this.RELEASES_INDEX].badges[0].count = c));
        this.subscriptions.push(ISSUE_CONSTANT.summary.count$.subscribe(c =>
            this.navigationItems[this.ISSUES_INDEX].badges[0].count = c));
        this.subscriptions.push(PATCH_CONSTANT.summary.count$.subscribe(c =>
            this.navigationItems[this.PATCHES_INDEX].badges[0].count = c));
        this.navigationItems = this.getItems();
        if (this.hasAuthentication) {
            this.authenticationService.isLoggedIn().then(r => {
                this.loggedIn = r;
                this.username = r ? this.authenticationService.getUsername() : '';
            });
        }
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
                    tooltip: 'Total number of patches'
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

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template);
    }

    closeModal($event: AboutModalEvent): void {
        this.modalRef.hide();
    }

    login($event: any) {
        this.authenticationService.login();
    }

    logout($event: any) {
        this.authenticationService.logout();
    }
}
