export const formatDate = (date: Date | number | string | null | undefined): string => {
  if (!date) return 'Invalid Date';

  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return 'Invalid Date';
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined || price === '') return '$0.00';

  try {
    const num = typeof price === 'number' ? price : Number.parseFloat(price);
    if (Number.isNaN(num)) return '$0.00';

    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `$${parts.join('.')}`;
  } catch {
    return '$0.00';
  }
};

export const formatStock = (stock: number | string | null | undefined): string => {
  const stockNum = typeof stock === 'number' ? Math.floor(stock) : Number.parseInt(String(stock), 10);

  if (Number.isNaN(stockNum)) {
    return 'Out of Stock';
  }

  if (stockNum === 0) {
    return 'Out of Stock';
  } else if (stockNum < 5) {
    return `Low Stock (${stockNum} left)`;
  } else if (stockNum < 10) {
    return `Limited Stock (${stockNum} available)`;
  } else {
    return `In Stock (${stockNum})`;
  }
};

export const formatUserName = (firstname: string | null | undefined, lastname: string | null | undefined): string => {
  if (!firstname && !lastname) return 'Unknown User';

  const first = (firstname || '').trim();
  const last = (lastname || '').trim();

  if (first && last) {
    return `${first.charAt(0).toUpperCase() + first.slice(1)} ${last.charAt(0).toUpperCase() + last.slice(1)}`;
  } else if (first) {
    return first.charAt(0).toUpperCase() + first.slice(1);
  } else if (last) {
    return last.charAt(0).toUpperCase() + last.slice(1);
  }

  return 'Unknown User';
};

export const formatSearchTerm = (term: string | null | undefined): string => {
  if (!term) return '';

  return term
    .toLowerCase()
    .split(' ')
    .map((word) => word.trim())
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
