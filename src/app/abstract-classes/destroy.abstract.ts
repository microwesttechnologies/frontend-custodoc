import { Component, Injectable, OnDestroy } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';

@Injectable()
@Component({
  template: '',
})
export abstract class DestroyObs implements OnDestroy {
  protected $destroy: Subject<boolean>;
  constructor() {
    this.$destroy = new Subject<boolean>();
  }

  protected observableToDestroy<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      takeUntil(this.$destroy),
      map((response) => structuredClone(response))
    );
  }

  ngOnDestroy(): void {
    this.$destroy?.next(true);
    this.$destroy?.complete();
  }
}
