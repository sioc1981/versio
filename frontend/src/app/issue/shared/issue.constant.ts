import { APP_CONSTANT } from 'src/app/app.constants';
import { Summary } from 'src/app/shared/summary.model';

export const ISSUE_CONSTANT = {
    backendUrl: APP_CONSTANT.backendUrlBase + '/issue',
    httpOptions: APP_CONSTANT.httpOptions,
    iconStyleClass: 'pficon pficon-security',
    summary: new Summary(),
    title: 'Issues',
    url: '/issues',
    constainer_urls: {
        JIRA: 'https://jira.somewhere/issues/',
        MANTIS: 'https://mantis.somewhereelse/'
    }
};
