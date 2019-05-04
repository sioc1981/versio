import { Version } from '../../version/shared/version.model';
import { Issue } from '../../issue/shared/issue.model';
import { Patch } from 'src/app/patch/shared/patch.model';
import { PlatformHistory, PlatformSummary } from 'src/app/shared/platform.model';

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

export class ReleaseFull {

    release: Release;
    issues: Issue[];
    patches: Patch[];
    selected?: boolean;
    deploy?: string;

}

export class ReleaseSummary {
    id: number;
    versionNumber: string;
    patchCount: number;
    packagedPatches: number;
    qualification: PlatformSummary;
    keyUser: PlatformSummary;
    pilot: PlatformSummary;
    production: PlatformSummary;

}

export class ReleaseComparison {
    sourceReleases: Release[];
    destReleases: Release[];
}
