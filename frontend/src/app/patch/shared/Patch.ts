import { Issue } from '../../issue/shared/Issue';
import { Release } from '../../release/shared/Release';
import { PlatformHistory } from 'src/app/shared/PlatformHistory';

export class Patch {
    id: number;

    release: Release;

    sequenceNumber: string;

    issues: Issue[];

    buildDate: Date;
    packageDate: Date;
    qualification: PlatformHistory;
    keyUser: PlatformHistory;
    pilot: PlatformHistory;
    production: PlatformHistory;

    selected?: boolean;
    deploy?: string;

}
