import {
  animate,
  AnimationTriggerMetadata,
  AUTO_STYLE,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const slideCustomAnimation = (
  name: string,
  direction: 'X' | 'Y',
  from: string,
  to: string,
  time: { enter?: string; leave?: string },
): AnimationTriggerMetadata => {
  let triggerCustom = trigger(name, []);

  if (time.leave) {
    triggerCustom.definitions.push(
      transition(':leave', [
        animate(
          `${time.leave} ease-out`,
          style({
            transform: `translate${direction}(${from})`,
            opacity: 0,
          })
        ),
      ])
    );
  }

  if (time.enter) {
    triggerCustom.definitions.push(
      transition(':enter', [
        style({
          transform: `translate${direction}(${from})`,
          opacity: 0,
        }),
        animate(
          `${time.enter} ease-in`,
          style({
            transform: `translate${direction}(${to})`,
            opacity: 1,
          })
        ),
      ])
    );
  }

  return triggerCustom;
};

export const fadeInCustomAnimation = (
  name: string,
  enterTime?: string,
  leaveTime?: string
): AnimationTriggerMetadata => {
  let triggerCustom = trigger(name, []);
  if (enterTime) {
    triggerCustom.definitions.push(
      transition(':enter', [
        style({ opacity: 0 }),
        animate(enterTime, style({ opacity: 1 })),
      ])
    );
  }

  if (leaveTime) {
    triggerCustom.definitions.push(
      transition(':leave', [animate(leaveTime, style({ opacity: 0 }))])
    );
  }
  return triggerCustom;
};

export const collapseAnimation = trigger('collapse', [
  transition(':enter', [
    style({
      visibility: 'hidden',
      overflow: 'hidden',
      height: 0,
    }),
    animate(
      '150ms ease-in',
      style({ height: AUTO_STYLE, visibility: AUTO_STYLE })
    ),
  ]),
  transition(':leave', [
    style({ overflow: 'hidden' }),
    animate(
      '150ms ease-out',
      style({ paddingBottom: 0, paddingTop: 0, height: 0 })
    ),
  ]),
]);
