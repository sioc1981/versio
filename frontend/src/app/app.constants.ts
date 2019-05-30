import { HttpHeaders } from '@angular/common/http';

export const APP_CONSTANT = {
    applicationName: 'Version Management',
    backendUrlBase: location.protocol + '//' + location.hostname + ':8080' + '/backend/api',
    httpOptions: {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
};
