export function hasProperty<T, K extends PropertyKey>(obj: T, prop: K): obj is T & Record<K, unknown> {
  return obj && Object.prototype.hasOwnProperty.call(obj, prop)
}
