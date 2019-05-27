import { TestBed } from '@angular/core/testing';

import { VersionService } from './version.service';
import { AppModule } from 'src/app/app.module';

describe('VersionService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    }));

    it('should be created', () => {
        const service: VersionService = TestBed.get(VersionService);
        expect(service).toBeTruthy();
    });
});
