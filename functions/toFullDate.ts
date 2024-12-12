export function toFullDate(dateString: string): string {
    const splitDateAndTime = dateString.split('T');
    const splitYear = splitDateAndTime[0].split('-')
    const date = splitYear[1] + '/' + splitYear[2] + '/' + splitYear[0];
    
    return date;
  }