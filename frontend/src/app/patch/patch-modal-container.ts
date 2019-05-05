import { WizardEvent } from 'patternfly-ng';
import { Patch } from './shared/patch.model';

export interface PatchModalContainer {

    reloadData(): void;

    closeModal($event: WizardEvent): void;

    getPatch(): Patch;
}
