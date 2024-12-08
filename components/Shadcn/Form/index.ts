export { default as FormControl } from './FormControl.vue'
export { default as FormDescription } from './FormDescription.vue'
export { default as FormItem } from './FormItem.vue'
export { default as FormLabel } from './FormLabel.vue'
export { default as FormMessage } from './FormMessage.vue'
export { Form, Field as FormField } from 'vee-validate'
export const FORM_ITEM_INJECTION_KEY
  = Symbol('injection-key') as InjectionKey<string>