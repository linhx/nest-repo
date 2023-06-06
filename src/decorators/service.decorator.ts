import { applyDecorators, Injectable, InjectableOptions } from '@nestjs/common';
import { SERVICE_WATERMARK } from '../constants';
import { overrideTransactionalMethods } from './transactional';

export function UseTransactional() {
  return function (target: Function) {
    Reflect.defineMetadata(SERVICE_WATERMARK, true, target);
    overrideTransactionalMethods(target);
  };
}

export function Service(options?: InjectableOptions) {
  return applyDecorators(Injectable(options), UseTransactional());
}
