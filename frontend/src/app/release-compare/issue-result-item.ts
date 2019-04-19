import { Issue } from '../issue/shared/Issue';

export class IssueResultItem {
    issueReference: string;
    issue: Issue;
    releaseVersion: string;
    patchSequence: string;
}
