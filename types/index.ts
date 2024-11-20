type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type TwoDigitHour = 
  | `0${Digit}`
  | `1${Digit}`
  | `2${0 | 1 | 2 | 3}`

type TwoDigitMinute = 
  | `${0 | 1 | 2 | 3 | 4 | 5}${Digit}`

export type Time = `${TwoDigitHour}:${TwoDigitMinute}`
