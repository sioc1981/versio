import { Component, Input } from '@angular/core';
import { PlatformSummary } from 'src/app/shared/platform.model';

@Component({
  selector: 'app-release-card-chart-container',
  templateUrl: './release-card-chart-container.component.html',
  styleUrls: ['./release-card-chart-container.component.less']
})
export class ReleaseCardChartContainerComponent {

    @Input() platformSummary: PlatformSummary;

    @Input() height: number;

  constructor() { }

}
