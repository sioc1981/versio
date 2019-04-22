import { Version } from '../../version/shared/Version';
import { Issue } from '../../issue/shared/Issue';
import { Release } from './Release';
import { Patch } from '../../patch/shared/Patch';

export class ReleaseFull {

    release: Release;

    issues: Issue[];

    patches: Patch[];

    selected?: boolean;
    deploy?: string;

}
