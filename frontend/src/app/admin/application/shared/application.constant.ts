import { APP_CONSTANT } from 'src/app/app.constants';
import { Summary } from 'src/app/shared/summary.model';

export const APPLICATION_CONSTANT = {
    backendUrl: APP_CONSTANT.backendUrlBase + '/application',
    httpOptions: APP_CONSTANT.httpOptions,
    iconStyleClass: 'pficon pficon-applications',
    summary: new Summary(),
    title: 'Applications',
    url: '/admin/applications',
};
