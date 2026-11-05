window.Format = (() => {
  const locale = 'ru-RU';

  const integer = (value) => new Intl.NumberFormat(locale).format(value);

  const decimal = (value, digits = 1) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);

  const percent = (value, digits = 1) => `${decimal(value, digits)}%`;

  return { integer, decimal, percent };
})();
