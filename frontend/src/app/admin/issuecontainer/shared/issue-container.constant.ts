import { APP_CONSTANT } from 'src/app/app.constants';
import { Summary } from 'src/app/shared/summary.model';

export const ISSUE_CONTAINER_CONSTANT = {
    backendUrl: APP_CONSTANT.backendUrlBase + '/issueContainer',
    httpOptions: APP_CONSTANT.httpOptions,
    iconStyleClass: 'pficon pficon-security',
    title: 'Issues',
    url: '/admin/issueContainers'
};
