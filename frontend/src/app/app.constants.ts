import { HttpHeaders } from '@angular/common/http';

export const APP_CONSTANT = {
    backendUrlBase: 'http://localhost:8080/backend/api',
    httpOptions: {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
};
