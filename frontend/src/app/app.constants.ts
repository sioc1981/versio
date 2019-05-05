import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export const APP_CONSTANT = {
    applicationName: 'Version Management',
    backendUrlBase: environment.backendUrlBase + '/backend/api',
    httpOptions: {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
};
