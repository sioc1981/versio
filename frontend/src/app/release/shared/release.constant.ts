import { APP_CONSTANT } from 'src/app/app.constants';
import { Summary } from 'src/app/shared/summary.model';
import { ReleaseSummary } from './release.model';
import { EventEmitter } from '@angular/core';

export const RELEASE_CONSTANT = {
    backendUrl: APP_CONSTANT.backendUrlBase + '/release',
    httpOptions: APP_CONSTANT.httpOptions,
    iconStyleClass: 'pficon pficon-bundle',
    summary: new Summary(),
    releaseSummaries: [] as ReleaseSummary[],
    releaseSummariesNotifier$: new EventEmitter<boolean>(false),
    title: 'Releases',
    url: '/releases'
};

