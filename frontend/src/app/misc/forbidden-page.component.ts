import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmptyStateConfig, ActionConfig, Action } from 'patternfly-ng';
import { AuthenticationService } from '../auth/authentication.service';

@Component({
    selector: 'app-forbidden-page',
    templateUrl: './forbidden-page.component.html',
    styleUrls: ['./forbidden-page.component.less']
})
export class ForbiddenPageComponent implements OnInit {

    emptyStateConfig: EmptyStateConfig;
    actionConfig: ActionConfig;

    redirectUrl: string;

    constructor(private route: ActivatedRoute, private router: Router, private loc: Location, private auth: AuthenticationService) {
    }

    ngOnInit(): void {
        const angularRoute = this.loc.path();
        const fullUrl = window.location.href;
        const domainAndApp = fullUrl.replace(angularRoute, '');
        this.actionConfig = {
            primaryActions: [{
                id: 'goHome',
                title: 'Home Page',
                tooltip: 'Return on the Home page'
            }]
        } as ActionConfig;

        this.emptyStateConfig = {
            actions: this.actionConfig,
            iconStyleClass: 'pficon-error-circle-o',
            title: 'Forbidden Page'
        } as EmptyStateConfig;

        this.route.paramMap.subscribe(params => {
            if (params.has('from')) {
                this.redirectUrl = domainAndApp + params.get('from');
            }
            this.auth.isLoggedIn().then(logged => {
                if (!logged) {
                    this.actionConfig.primaryActions[1] = {
                        id: 'login',
                        title: 'Login',
                        tooltip: 'Login'
                    };
                    this.emptyStateConfig.info = 'You are not logged in to access to ' + this.redirectUrl
                        + '. Please login or choose another page or return to Home Page';
                } else {
                    this.emptyStateConfig.info = 'You are not granted to access to ' + this.redirectUrl
                        + '. Please choose another page or return to Home Page';
                }
            });
        });

    }

    handleAction(action: Action): void {
        switch (action.id) {
            case 'goHome':
                this.router.navigate(['/']);
                break;
            case 'login':
                this.auth.login({ redirectUri: this.redirectUrl });
                break;
        }
    }

}
