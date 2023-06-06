import {
  SERVICE_WATERMARK,
  TRANSACTIONAL_OPTIONS,
  TRANSACTIONAL_WATERMARK,
} from '../constants';
import { Service } from './service.decorator';
import { TransactionalOptions } from './transactional.interface';

export function Transactional(options?: TransactionalOptions) {
  return function (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Record<string, any> | Function,
    propertyName?: string,
  ) {
    const isClassDecorator = !propertyName;

    if (isClassDecorator) {
      const didServiceRunFirst = Reflect.getMetadata(SERVICE_WATERMARK, target);
      if (didServiceRunFirst) {
        throw new Error(
          `Must apply @${Transactional.name} before ${Service.name} for ${target.constructor.name}`,
        );
      }
      const proto = (target as any).prototype;

      const propertiesName = Object.getOwnPropertyNames(proto);
      for (const propertyName of propertiesName) {
        if (propertyName === 'constructor') {
          continue;
        }
        const desc = Object.getOwnPropertyDescriptor(proto, propertyName);
        markTransactionalMethod(proto, propertyName, options);
        Object.defineProperty(proto, propertyName, desc);
      }
    } else {
      // function decorator
      markTransactionalMethod(target, propertyName, options);
    }
  };
}

const markTransactionalMethod = (
  target: Record<string, any>,
  propertyName?: string,
  options?: TransactionalOptions,
) => {
  const alreadyCreated: boolean = Reflect.getOwnMetadata(
    TRANSACTIONAL_WATERMARK,
    target,
    propertyName,
  );
  if (alreadyCreated) {
    return;
  }
  Reflect.defineMetadata(
    TRANSACTIONAL_WATERMARK,
    true, // set alreadyCreated
    target,
    propertyName,
  );

  Reflect.defineMetadata(TRANSACTIONAL_OPTIONS, options, target, propertyName);
};
