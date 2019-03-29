import { HttpHeaders } from '@angular/common/http';
import { SseService } from '../../server-event/sse.service';

export const ISSUE_CONSTANT = {
    backendUrl: 'http://localhost:8080/backend/api/issue',
    httpOptions: {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    },
    iconStyleClass: 'pficon pficon-security',
    summary: SseService.buildSummary('issue'),
    title: 'Issues',
    url: '/issues'
};

