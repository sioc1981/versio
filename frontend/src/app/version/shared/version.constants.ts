import { HttpHeaders } from '@angular/common/http';
import { SseService } from '../../server-event/sse.service';

export const VERSION_CONSTANT = {
    backendUrl: 'http://localhost:8080/backend/api/version',
    httpOptions: {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    },
    iconStyleClass: 'pficon pficon-builder-image',
    summary: SseService.buildSummary('version'),
    title: 'Versions',
    url: '/versions'
};

