
export class PlatformHistory {
    deployDate: Date;
    validationDate: Date;
    undeployDate: Date;
}

export class PlatformSummary {
    deployed: boolean;
    validated: boolean;
    undeployed: boolean;
    deployedPatchCount: number;
    validedPatchCount: number;
}
