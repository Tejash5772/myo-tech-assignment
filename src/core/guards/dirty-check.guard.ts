import { inject } from '@angular/core';

import {
    CanDeactivateFn
} from '@angular/router';

import { CanComponentDeactivate } from '../models/can-component-deactivate';

export const dirtyCheckGuard: CanDeactivateFn<CanComponentDeactivate> = (

    component

) => {

    return component.canDeactivate();

};