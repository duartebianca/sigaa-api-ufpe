/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @category Internal
 * Method decorator to cache the return,
 * it identifies the returns based on the
 * parameter id of the first argument.
 **/
export function sharedReturn() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): void {
    if (target.kind !== 'method')
      throw new Error('SIGAA: SharedReturn is only supported on methods.');

    const originalMethod = target.descriptor.value; // save a reference to the original method
    const store = '__sharedReturn' + target.key;
    target.descriptor.value = function (...args: any[]): any {
      if (!this[store]) {
        this[store] = new Map<string, WeakRef<any>>();
      }

      const id = args[0].id;
      if (!id) return originalMethod.apply(this, args);

      const ref = this[store].get(id);
      if (ref) {
        const cacheInstance = ref.deref();

        if (cacheInstance) {
          return cacheInstance;
        }
        this[store].delete(id);
      }
      const instance = originalMethod.apply(this, args);
      this[store].set(id, new WeakRef(instance));
      return instance;
    };
  };
}
