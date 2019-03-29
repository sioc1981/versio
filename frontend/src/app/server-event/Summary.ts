import { EventEmitter } from '@angular/core';

export class Summary {
  count = 0;
  count$ =  new EventEmitter<number>(false);

  constructor() {
      this.count$.subscribe(val => this.count = val);
  }
}
