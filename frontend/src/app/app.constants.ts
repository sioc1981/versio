import { HttpHeaders } from '@angular/common/http';

export const APP_CONSTANT = {
    applicationName: 'Versio',
    backendUrlBase: location.protocol + '//' + location.hostname + ':' + location.port + '/backend/api',
    httpOptions: {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    },
    countries: ['fr', 'it', 'pt']
};
