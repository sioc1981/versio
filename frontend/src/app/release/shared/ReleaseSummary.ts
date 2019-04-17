import { PlatformSummary } from 'src/app/shared/PlatformSummary';

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
