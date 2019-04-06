import { Issue } from '../../issue/shared/Issue';
import { Release } from '../../release/shared/Release';

export class Patch {
    id: number;

    release: Release;

    issues: Issue[];

    buildDate: Date;
    packageDate: Date;
    qualificationDate: Date;
    kuQualificationDate: Date;
    pilotDate: Date;
    productionDate: Date;

}
