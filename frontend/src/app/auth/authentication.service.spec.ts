import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { AppModule } from '../app.module';

describe('AuthenticationService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    }));

    it('should be created', () => {
        const service: AuthenticationService = TestBed.get(AuthenticationService);
        expect(service).toBeTruthy();
    });
});
