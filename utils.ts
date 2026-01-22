export const formatCurrency = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/\s/g, '')) : value;
    if (isNaN(num)) return value.toString();

    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};
