/** Joins truthy class names: cx('a', cond && 'b') */
export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')
