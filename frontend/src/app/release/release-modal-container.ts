import { WizardEvent } from 'patternfly-ng';
import { ReleaseFull } from './shared/release.model';

export interface ReleaseModalContainer {

    reloadData(): void;

    closeModal($event: WizardEvent): void;

    getRelease(): ReleaseFull;
}
