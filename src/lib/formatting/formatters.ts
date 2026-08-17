// Format number in Indian numbering system (e.g. 1,00,000)
export function formatCurrency(amount: number, symbol = '₹'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0.00`;
  }
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const fixed = absAmount.toFixed(2);
  const [integerPart, decimalPart] = fixed.split('.');

  // Indian comma formatting algorithm
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}${symbol}${formattedInteger}.${decimalPart}`;
}

export function formatDate(dateString?: string, formatStr = 'DD MMM YYYY'): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[date.getMonth()];
  const fullMonth = fullMonthNames[date.getMonth()];
  const monthNum = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (formatStr === 'YYYY-MM-DD') {
    return `${year}-${monthNum}-${day}`;
  } else if (formatStr === 'DD/MM/YYYY') {
    return `${day}/${monthNum}/${year}`;
  } else if (formatStr === 'MM/DD/YYYY') {
    return `${monthNum}/${day}/${year}`;
  }

  // Default: DD MMM YYYY (17 Aug 2026)
  return `${day} ${month} ${year}`;
}

// Convert numbers to Indian Rupee Words (e.g. 117500 -> "Rupees One Lakh Seventeen Thousand Five Hundred Only")
export function amountToWords(amount: number): string {
  if (isNaN(amount) || amount <= 0) return 'Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelowThousand(n: number): string {
    let str = '';
    if (n >= 100) {
      str += singleDigits[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 10 && n < 20) {
      str += teens[n - 10] + ' ';
    } else if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      if (n % 10 > 0) {
        str += singleDigits[n % 10] + ' ';
      }
    } else if (n > 0) {
      str += singleDigits[n] + ' ';
    }
    return str;
  }

  let num = Math.floor(amount);
  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = num;

  if (crore > 0) {
    result += convertBelowThousand(crore) + 'Crore ';
  }
  if (lakh > 0) {
    result += convertBelowThousand(lakh) + 'Lakh ';
  }
  if (thousand > 0) {
    result += convertBelowThousand(thousand) + 'Thousand ';
  }
  if (hundred > 0) {
    result += convertBelowThousand(hundred);
  }

  const paise = Math.round((amount - Math.floor(amount)) * 100);
  let paiseStr = '';
  if (paise > 0) {
    paiseStr = ` and ${convertBelowThousand(paise)}Paise`;
  }

  return `Rupees ${result.trim()}${paiseStr} Only`;
}
