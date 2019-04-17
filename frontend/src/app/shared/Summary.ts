import { EventEmitter } from '@angular/core';

export class Summary {
  count = 0;
  count$ =  new EventEmitter<number>(false);
  sseCallback: (data: any) => void;

  constructor() {
      this.count$.subscribe(val => this.count = val);
  }
}
