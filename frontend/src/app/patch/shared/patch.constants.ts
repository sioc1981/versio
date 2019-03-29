import { HttpHeaders } from '@angular/common/http';
import { SseService } from '../../server-event/sse.service';

export const PATCH_CONSTANT = {
    backendUrl: 'http://localhost:8080/backend/api/patch',
    httpOptions: {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    },
    iconStyleClass: 'fa fa-plus-square',
    summary: SseService.buildSummary('patch'),
    title: 'Patchs',
    url: '/patchs'
};

