import {
  asyncScheduler,
  MonoTypeOperatorFunction,
  Observable,
  SchedulerLike,
  Subscription,
} from 'rxjs';

/**
 * TODO: description
 * @param duration
 * @param scheduler
 */
export function throttleTime_<T>(
  duration: number,
  scheduler: SchedulerLike = asyncScheduler
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    new Observable<T>(observer => {
      let source_: Subscription = null;
      let timeout: Subscription = null;
      let hasNext = false;
      let next: T = null;

      function unsubscribe() {
        //console.log('throttle unsubscribe');
        if (timeout !== null) {
          timeout.unsubscribe();
          timeout = null;
        }
        if (source_ !== null) {
          source_.unsubscribe();
          source_ = null;
        }
        hasNext = false;
        next = null;
      }

      source_ = source.subscribe({
        next(value: T) {
          if (timeout === null) {
            hasNext = false;
            next = null;
            observer.next(value);
            timeout = scheduler.schedule(() => {
              timeout = null;
              if (hasNext) {
                observer.next(next);
                hasNext = false;
                next = null;
              }
            }, duration);
          } else {
            hasNext = true;
            next = value;
          }
        },
        error(err) {
          unsubscribe();
          observer.error(err);
        },
        complete() {
          if (hasNext) {
            observer.next(next);
          }
          unsubscribe();
          observer.complete();
        },
      });

      return unsubscribe;
    });
}