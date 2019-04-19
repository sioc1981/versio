import { APP_CONSTANT } from 'src/app/app.constants';
import { Summary } from 'src/app/shared/Summary';

export const ISSUE_CONSTANT = {
    backendUrl: APP_CONSTANT.backendUrlBase + '/issue',
    httpOptions: APP_CONSTANT.httpOptions,
    iconStyleClass: 'pficon pficon-security',
    summary: new Summary(),
    title: 'Issues',
    url: '/issues'
};
