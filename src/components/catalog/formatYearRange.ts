export const formatYearRange = (startYear?: number, endYear?: number): string => {
  const years = [startYear, endYear].filter(Boolean);
  if (years.length === 2 && years[0] !== years[1]) return `${years[0]}–${years[1]}`;
  return years[0] ? String(years[0]) : '';
};
