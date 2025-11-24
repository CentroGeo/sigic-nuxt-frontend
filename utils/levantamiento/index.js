/**
 * Formatea la fecha a la forma dd/mm/yyy 00:00 AM
 * @param date objeto tipo fecha a formatear
 * @returns {String}
 */
export function formatDate(date) {
  const formatter = ref();
  formatter.value = new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
  });
  const formattedTime = formatter.value.format(date);
  formatter.value = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' });
  const formattedDate = formatter.value.format(date);
  return `${formattedDate} ${formattedTime}`;
}
