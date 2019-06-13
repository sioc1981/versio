import { Release } from 'src/app/release/shared/release.model';
import { Issue } from 'src/app/issue/shared/issue.model';
import { PlatformHistory } from 'src/app/shared/platform.model';

export class Patch {
    id: number;

    release: Release;

    sequenceNumber: string;
    undeployed: boolean;

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
