import { Patch } from '../../patch/shared/patch.model';
import { Release } from '../../release/shared/release.model';

export class Issue {
    globalReference: string;
    description: string;
    reference: string;
    container: string;
    selected?: boolean;
    deploy?: string;
}

export class IssueExtended {
    issueReference: string;
    issue: Issue;
    patches: Patch[];
    releases: Release[];
}
