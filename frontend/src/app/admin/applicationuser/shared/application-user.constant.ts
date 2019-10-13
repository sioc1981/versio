import { APP_CONSTANT } from 'src/app/app.constants';
import { ApplicationUser } from './application-user.model';
import { Summary } from 'src/app/shared/summary.model';
import { EventEmitter } from '@angular/core';

export const APPLICATION_USER_CONSTANT = {
    backendUrl: APP_CONSTANT.backendUrlBase + '/admin/applicationUser',
    httpOptions: APP_CONSTANT.httpOptions,
    iconStyleClass: 'pficon pficon-security',
    summary: new Summary(),
    applicationUserSummaries: [] as ApplicationUser[],
    applicationUserSummariesNotifier$: new EventEmitter<boolean>(false),
    title: 'Application Users',
    url: '/admin/applicationUsers'
};
