import { Issue } from '../issue/shared/Issue';

export class IssueResultItem {
    reference: string;
    issue: Issue;
    releaseVersionNumber: string;
    patchSequence: string;
}
