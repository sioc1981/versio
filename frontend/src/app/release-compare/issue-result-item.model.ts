import { Issue } from '../issue/shared/issue.model';

export class IssueResultItem {
    issueReference: string;
    issue: Issue;
    releaseVersion: string;
    patchSequence: string;
}
