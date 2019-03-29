import { Version } from '../../version/shared/Version';
import { Issue } from '../../issue/shared/Issue';

export class Release {
    id: number;

    version: Version;

    issues: Issue[];

    buildDate: Date;
    packageDate: Date;
    qualificationDate: Date;
    kuQualificationDate: Date;
    pilotDate: Date;
    productionDate: Date;

}
