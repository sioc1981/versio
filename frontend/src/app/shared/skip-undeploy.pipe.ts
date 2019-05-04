import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'skipUndeploy'
})
export class SkipUndeployPipe implements PipeTransform {

  transform(values: any[]): any {
    return values ? values.filter(value => !value || !value.undeployed) : [];
  }

}
