(() => {
  const data = window.MONTY_HALL_SIMULATION;
  if (!data) return;

  const { games, checkpointStep, strategies } = data;
  const { stay, switch: switching } = strategies;

  const CHART = {
    min: 20,
    max: 80,
    ticks: [20, 40, 60, 80],
    padding: { top: 12, right: 54, bottom: 30, left: 40 },
  };

  function fillValues() {
    const values = {
      games: Format.integer(games),
      'switch-rate': Format.percent(switching.rate, 2),
      'stay-rate': Format.percent(stay.rate, 2),
      'switch-wins': Format.integer(switching.wins),
      'stay-wins': Format.integer(stay.wins),
      ratio: Format.decimal(switching.wins / stay.wins, 2),
    };

    document.querySelectorAll('[data-sim]').forEach((element) => {
      element.textContent = values[element.dataset.sim];
    });

    document.querySelectorAll('[data-meter]').forEach((element) => {
      const { rate } = strategies[element.dataset.meter];
      element.style.setProperty('--value', `${rate}%`);
    });
  }

  function createChartRenderer(svg) {
    const linePath = (curve, project) =>
      curve
        .map((rate, index) => {
          const { x, y } = project((index + 1) * checkpointStep, rate);
          return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');

    return function render() {
      const width = svg.getBoundingClientRect().width;
      if (!width) return;

      const height = width < 520 ? 240 : 320;
      const { top, right, bottom, left } = CHART.padding;
      const plotWidth = width - left - right;
      const plotHeight = height - top - bottom;

      const project = (game, rate) => ({
        x: left + (game / games) * plotWidth,
        y: top + (1 - (rate - CHART.min) / (CHART.max - CHART.min)) * plotHeight,
      });
      const yOf = (rate) => project(0, rate).y;

      const grid = CHART.ticks
        .map(
          (tick) => `
            <line class="chart__grid" x1="${left}" x2="${left + plotWidth}" y1="${yOf(tick)}" y2="${yOf(tick)}"/>
            <text class="chart__tick" x="${left - 8}" y="${yOf(tick) + 4}" text-anchor="end">${tick}%</text>`,
        )
        .join('');

      const theory = [stay.theory, switching.theory]
        .map(
          (rate) => `
            <line class="chart__theory" x1="${left}" x2="${left + plotWidth}" y1="${yOf(rate)}" y2="${yOf(rate)}"/>
            <text class="chart__tick" x="${left + plotWidth + 8}" y="${yOf(rate) + 4}">${Format.percent(rate)}</text>`,
        )
        .join('');

      const xTicks = [0, 0.25, 0.5, 0.75, 1]
        .map((share) => {
          const x = left + share * plotWidth;
          const anchor = share === 0 ? 'start' : share === 1 ? 'end' : 'middle';
          return `<text class="chart__tick" x="${x}" y="${height - 6}" text-anchor="${anchor}">${Format.integer(share * games)}</text>`;
        })
        .join('');

      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.innerHTML = `
        ${grid}
        ${theory}
        ${xTicks}
        <path class="chart__line chart__line--stay" pathLength="1" d="${linePath(stay.curve, project)}"/>
        <path class="chart__line chart__line--switch" pathLength="1" d="${linePath(switching.curve, project)}"/>`;
    };
  }

  function initChart() {
    const svg = document.getElementById('chart');
    const render = createChartRenderer(svg);

    render();
    if ('ResizeObserver' in window) {
      new ResizeObserver(render).observe(svg);
    }
  }

  fillValues();
  initChart();
})();
