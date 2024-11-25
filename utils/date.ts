import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDateLong(date: Date | string): string {
  return format(date, 'd \'de\' MMMM \'de\' yyyy \'às\' HH:mm', {
    locale: ptBR,
  })
}
