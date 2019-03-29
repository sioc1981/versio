import { HttpHeaders } from '@angular/common/http';
import { SseService } from '../../server-event/sse.service';

export const RELEASE_CONSTANT = {
    backendUrl: 'http://localhost:8080/backend/api/release',
    httpOptions: {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    },
    iconStyleClass: 'pficon pficon-bundle',
    summary: SseService.buildSummary('release'),
    title: 'Releases',
    url: '/releases'
};

