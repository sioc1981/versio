import { Version } from '../../version/shared/Version';
import { Issue } from '../../issue/shared/Issue';
import { PlatformHistory } from 'src/app/shared/PlatformHistory';

export class Release {
    id: number;

    version: Version;

    issues: Issue[];

    buildDate: Date;
    packageDate: Date;
    qualification: PlatformHistory;
    keyUser: PlatformHistory;
    pilot: PlatformHistory;
    production: PlatformHistory;

}
