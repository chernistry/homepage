// BI Storytelling dynamic behaviors with Plotly
/* global Plotly */

(() => {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const add = (a, b) => a.map((v, i) => v + (Array.isArray(b) ? b[i] : b));
  const rnd = (min, max) => min + Math.random() * (max - min);
  const monthLabels = (n) => {
    const now = new Date();
    const labels = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString('en', { month: 'short', year: '2-digit' }));
    }
    return labels;
  };

  const generateCtr = (months, seasonality) => {
    const x = monthLabels(months);
    const base = 1.6; // CTR %
    const y = Array.from({ length: months }, (_, i) => {
      const s = Math.sin((i / 12) * Math.PI * 2) * (seasonality / 100);
      const noise = rnd(-0.08, 0.08);
      return clamp(base + s + noise, 0.6, 3.2);
    });
    if (months >= 12) {
      const q3 = months - 4;
      for (let i = q3; i < q3 + 2 && i < y.length; i++) y[i] -= 0.2;
    }
    return { x, y };
  };

  const generateRevenue = (months) => {
    const x = monthLabels(months);
    const trend = Array.from({ length: months }, (_, i) => 240 + i * 6);
    const noise = Array.from({ length: months }, () => rnd(-12, 12));
    const actual = add(trend, noise);
    const forecast = add(trend, 6);
    const lower = add(forecast, -24);
    const upper = add(forecast, 24);
    return { x, actual, forecast, lower, upper };
  };

  const generateFunnel = (simplicity) => {
    const stages = ['Visits', 'Product Views', 'Add to Cart', 'Checkout', 'Payment'];
    const base = [100000, 42000, 18000, 7000, 2800];
    const ease = simplicity / 100;
    const improved = [
      base[0],
      Math.round(base[1] * (1 + 0.02 * ease)),
      Math.round(base[2] * (1 + 0.05 * ease)),
      Math.round(base[3] * (1 + 0.10 * ease)),
      Math.round(base[4] * (1 + 0.12 * ease))
    ];
    return { stages, base, improved };
  };

  const computeRpm = (fill, view, ctr) => {
    const ecpm = (0.45 + ctr * 0.35) * 10;
    const rpm = ecpm * (fill / 100) * (view / 100);
    return Number(rpm.toFixed(2));
  };

  const initTabs = () => {
    const tabs = [
      { btn: 'tab-ctr', panel: 'panel-ctr' },
      { btn: 'tab-rev', panel: 'panel-rev' },
      { btn: 'tab-funnel', panel: 'panel-funnel' }
    ];
    tabs.forEach(({ btn, panel }) => {
      const btnEl = document.getElementById(btn);
      btnEl?.addEventListener('click', () => {
        tabs.forEach(({ btn: b, panel: p }) => {
          document.getElementById(b)?.setAttribute('aria-selected', String(btn === b));
          const el = document.getElementById(p);
          if (!el) return;
          if (p === panel) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
        });
        window.dispatchEvent(new Event('resize'));
      });
    });
  };

  const drawCtr = () => {
    const months = Number(document.getElementById('timeframe')?.value || 12);
    const s = Number(document.getElementById('seasonality')?.value || 12);
    const { x, y } = generateCtr(months, s);
    Plotly.react('chart-ctr', [{ x, y, type: 'scatter', mode: 'lines+markers',
      line: { color: '#2563EB', width: 2 }, marker: { size: 4 } }],
      { margin: { t: 10, r: 10, b: 70, l: 50 },
        yaxis: { title: 'CTR %', ticksuffix: '%', gridcolor: 'rgba(0,0,0,.06)' },
        xaxis: { tickangle: -35, automargin: true }, showlegend: false, paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawRevenue = () => {
    const months = Number(document.getElementById('timeframe')?.value || 12);
    const { x, actual, forecast, lower, upper } = generateRevenue(months);
    const band = { x: [...x, ...x.slice().reverse()],
      y: [...upper, ...lower.slice().reverse()], fill: 'toself', type: 'scatter',
      line: { color: 'transparent' }, fillcolor: 'rgba(37, 99, 235, 0.12)',
      name: 'Forecast 90%' };
    const act = { x, y: actual, type: 'scatter', mode: 'lines',
      line: { color: '#10B981', width: 2 }, name: 'Actual' };
    const fc = { x, y: forecast, type: 'scatter', mode: 'lines',
      line: { color: '#2563EB', width: 2, dash: 'dot' }, name: 'Forecast' };
    Plotly.react('chart-rev', [band, fc, act],
      { margin: { t: 10, r: 10, b: 70, l: 50 },
        yaxis: { title: 'Revenue ($K)', gridcolor: 'rgba(0,0,0,.06)' },
        xaxis: { tickangle: -35, automargin: true }, paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawFunnel = (simplicity) => {
    const simp = simplicity ?? Number(document.getElementById('simplicity')?.value || 35);
    const { stages, base, improved } = generateFunnel(simp);
    const baseTrace = { type: 'funnel', y: stages, x: base, name: 'Baseline',
      marker: { color: '#94a3b8' } };
    const impTrace = { type: 'funnel', y: stages, x: improved, name: 'Projected',
      marker: { color: '#2563EB' } };
    Plotly.react('chart-funnel', [baseTrace, impTrace],
      { margin: { t: 10, l: 120, r: 10, b: 10 },
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' },
      { displayModeBar: false });
    const baseConv = (base[4] / base[0]) * 100;
    const impConv = (improved[4] / improved[0]) * 100;
    const lift = impConv - baseConv;
    const roi = Math.round(lift * 1700);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('kpi-base', baseConv.toFixed(1) + '%');
    set('kpi-proj', impConv.toFixed(1) + '%');
    set('kpi-lift', (lift >= 0 ? '+' : '') + lift.toFixed(1) + ' pp');
    set('kpi-roi', '$' + roi.toLocaleString());
  };

  const drawMap = () => {
    const data = [{
      type: 'choropleth', locationmode: 'ISO-3', zauto: false, zmin: -10, zmax: 20,
      locations: ['USA', 'CAN', 'GBR', 'DEU', 'FRA', 'BRA', 'IND', 'AUS', 'ISR'],
      z: [12, 8, 5, -3, 2, 6, 14, 7, 11],
      colorscale: [[0, '#ef4444'], [0.45, '#f97316'], [0.5, '#e5e7eb'], [0.6, '#93c5fd'], [1, '#22c55e']],
      marker: { line: { color: 'rgba(0,0,0,.2)', width: 0.3 } },
      colorbar: { title: 'ROI %' }
    }];
    const layout = { geo: { projection: { type: 'equirectangular' } },
      margin: { t: 0, b: 0, l: 0, r: 0 }, paper_bgcolor: 'rgba(0,0,0,0)' };
    Plotly.newPlot('chart-map', data, layout, { displayModeBar: false });
  };

  const drawCampaign = () => {
    const campaigns = ['Brand', 'Search', 'Social', 'Video', 'Affiliates', 'Email'];
    const roas = campaigns.map(() => Number(rnd(1.8, 5.2).toFixed(2)));
    Plotly.newPlot('chart-campaign', [{ type: 'bar', x: campaigns, y: roas,
      marker: { color: '#2563EB' } }],
      { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'ROAS' },
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' },
      { displayModeBar: false });
  };

  const drawRpm = () => {
    const fill = Number(document.getElementById('fillRate')?.value || 86);
    const view = Number(document.getElementById('viewability')?.value || 62);
    const ctr = Number(document.getElementById('ctr')?.value || 1.3);
    const rpm = computeRpm(fill, view, ctr);
    const trace = [{ type: 'indicator', mode: 'gauge+number', value: rpm,
      title: { text: 'RPM ($)' }, gauge: { axis: { range: [0, 50] }, bar: { color: '#2563EB' },
      steps: [ { range: [0, 10], color: '#fee2e2' }, { range: [10, 25], color: '#e0f2fe' }, { range: [25, 50], color: '#dcfce7' } ] } }];
    Plotly.react('chart-rpm', trace, { margin: { t: 10, r: 10, b: 10, l: 10 },
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawPipeline = () => {
    const steps = 60;
    const times = Array.from({ length: steps }, (_, i) => i + 1);
    const success = times.map((i) => clamp(95 + Math.sin(i/6)*2 + rnd(-1, 1), 86, 99));
    const anomalyIdx = 45; success[anomalyIdx] = 78;
    Plotly.newPlot('chart-pipeline', [
      { x: times, y: success, type: 'scatter', mode: 'lines', line: { color: '#10B981' }, name: 'ETL Success %' },
      { x: [times[anomalyIdx]], y: [success[anomalyIdx]], type: 'scatter', mode: 'markers+text', marker: { color: '#ef4444', size: 10 }, text: ['Anomaly'], textposition: 'top center', name: 'Anomaly' }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'Success %' }, xaxis: { title: 'Run #' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  // Advanced charts
  const drawCohort = () => {
    const cohorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const months = ['M0','M1','M2','M3','M4','M5','M6'];
    const z = cohorts.map((_, i) => months.map((__, j) => {
      const base = 82 - i * 4 - j * 3 + rnd(-2, 2);
      return Math.max(0, Math.min(100, Math.round(base)));
    }));
    Plotly.newPlot('chart-cohort', [{ type: 'heatmap', z, x: months, y: cohorts,
      colorscale: 'Blues', reversescale: false, zmin: 0, zmax: 100 }],
      { margin: { t: 10, r: 10, b: 40, l: 60 }, xaxis: { title: 'Months since signup' }, yaxis: { title: 'Signup cohort' },
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawWaterfall = () => {
    const x = ['Start', 'Price', 'Volume', 'Discounts', 'Churn', 'FX', 'End'];
    const measure = ['absolute', 'relative', 'relative', 'relative', 'relative', 'relative', 'total'];
    const y = [1200, 180, 240, -90, -130, 45, 0];
    Plotly.newPlot('chart-waterfall', [{ type: 'waterfall', x, y, measure,
      decreasing: { marker: { color: '#ef4444' } }, increasing: { marker: { color: '#22c55e' } }, totals: { marker: { color: '#2563EB' } } }],
      { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: '$K' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' },
      { displayModeBar: false });
  };

  const drawSankey = () => {
    const label = ['Ads', 'Search', 'Social', 'Landing', 'Signup', 'Product', 'Pay'];
    const source = [0, 1, 2, 3, 3, 5];
    const target = [3, 3, 3, 4, 5, 6];
    const value = [40, 30, 20, 60, 40, 12];
    const isDark = document.body.classList.contains('dark-mode');
    const linkColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(149, 179, 221, 0.85)';
    const nodeColor = isDark ? '#E5E7EB' : '#334155';
    const fgVar = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
    const fontColor = fgVar || (isDark ? '#F4F4F5' : '#111827');
    Plotly.newPlot('chart-sankey', [{
      type: 'sankey', orientation: 'h',
      node: { label, pad: 16, thickness: 18, color: nodeColor, line: { color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.28)', width: 1 }, font: { color: fontColor } },
      link: { source, target, value, color: Array(value.length).fill(linkColor) }
    }], { margin: { t: 10, r: 10, b: 10, l: 10 }, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawDistribution = () => {
    const a = Array.from({ length: 120 }, () => rnd(1.8, 2.6));
    const b = Array.from({ length: 120 }, () => rnd(2.1, 3.1));
    Plotly.newPlot('chart-distribution', [
      { type: 'violin', y: a, name: 'Variant A', box: { visible: true }, meanline: { visible: true }, line: { color: '#94a3b8' } },
      { type: 'violin', y: b, name: 'Variant B', box: { visible: true }, meanline: { visible: true }, line: { color: '#2563EB' } }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'Conversion %' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawBubble = () => {
    const seg = ['Prospects','New','Returning','VIP','Dormant'];
    const spend = seg.map(() => rnd(20, 120));
    const roas = seg.map(() => rnd(1.2, 5.0));
    const size = seg.map(() => rnd(10, 60));
    Plotly.newPlot('chart-bubble', [{ x: spend, y: roas, text: seg, mode: 'markers', marker: { size, color: spend, colorscale: 'Blues' } }],
      { margin: { t: 10, r: 10, b: 40, l: 50 }, xaxis: { title: 'Spend ($K)' }, yaxis: { title: 'ROAS' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawTreemap = () => {
    const labels = ['All', 'Family A', 'Family B', 'Family C', 'A1', 'A2', 'B1', 'B2', 'C1'];
    const parents = ['', 'All', 'All', 'All', 'Family A', 'Family A', 'Family B', 'Family B', 'Family C'];
    // Root value must equal sum of its direct children when branchvalues='total'
    const values = [100, 40, 30, 30, 22, 18, 20, 10, 30];
    Plotly.newPlot('chart-treemap', [{ type: 'treemap', labels, parents, values, branchvalues: 'total' }],
      { margin: { t: 10, r: 10, b: 10, l: 10 }, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawSunburst = () => {
    const labels = ['World','Americas','EMEA','APAC','USA','CAN','DEU','FRA','ISR','IND','AUS'];
    const parents = ['', 'World','World','World','Americas','Americas','EMEA','EMEA','EMEA','APAC','APAC'];
    // Root value equals sum of region totals
    const values = [115, 50, 35, 30, 28, 22, 12, 8, 15, 18, 12];
    Plotly.newPlot('chart-sunburst', [{ type: 'sunburst', labels, parents, values, branchvalues: 'total' }],
      { margin: { t: 10, r: 10, b: 10, l: 10 }, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawDecomp = () => {
    const n = 48;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const trend = x.map((i) => 200 + i * 2.2);
    const season = x.map((i) => Math.sin((i/12)*Math.PI*2) * 20);
    const noise = x.map(() => rnd(-8, 8));
    const observed = x.map((_, i) => trend[i] + season[i] + noise[i]);
    Plotly.newPlot('chart-decomp', [
      { x, y: observed, type: 'scatter', mode: 'lines', name: 'Observed', line: { color: '#111827' } },
      { x, y: trend, type: 'scatter', mode: 'lines', name: 'Trend', line: { color: '#2563EB', dash: 'dot' } },
      { x, y: season, type: 'scatter', mode: 'lines', name: 'Seasonality', line: { color: '#10B981' } }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, xaxis: { title: 't' }, yaxis: { title: 'Value' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawAB = () => {
    const days = Array.from({ length: 21 }, (_, i) => `D${i+1}`);
    const lift = days.map((_, i) => 2 + Math.sin(i/3) * 1.2 + rnd(-0.4, 0.4));
    const ci = 0.9;
    const lower = lift.map((v) => v - ci);
    const upper = lift.map((v) => v + ci);
    Plotly.newPlot('chart-ab', [
      { x: days, y: lift, type: 'scatter', mode: 'lines+markers', name: 'Lift %', line: { color: '#2563EB' } },
      { x: [...days, ...days.slice().reverse()], y: [...upper, ...lower.slice().reverse()], type: 'scatter', fill: 'toself', line: { color: 'transparent' }, fillcolor: 'rgba(37,99,235,0.12)', name: '95% CI' }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'Lift %' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawDonut = () => {
    const used = 72;
    const free = 100 - used;
    Plotly.newPlot('chart-donut', [{ type: 'pie', values: [used, free], labels: ['Used','Free'], hole: .64, marker: { colors: ['#2563EB','#e5e7eb'] } }],
      { margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: false, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  // Good vs Bad examples
  const drawTrendGoodBad = () => {
    const x = monthLabels(12);
    const y = Array.from({ length: 12 }, (_, i) => 40 + i * 2 + rnd(-4, 4));
    const badColors = x.map((_, i) => `hsl(${(i * 37) % 360}, 80%, 55%)`);

    Plotly.newPlot('chart-trend-bad', [
      { type: 'bar', x, y, marker: { color: badColors } }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 },
      xaxis: { tickangle: -45 },
      yaxis: { title: 'Value', gridcolor: 'rgba(0,0,0,.25)' },
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)'
    }, { displayModeBar: false });

    Plotly.newPlot('chart-trend-good', [
      { type: 'scatter', mode: 'lines+markers', x, y,
        line: { color: '#2563EB', width: 2 }, marker: { size: 4 } }
    ], { margin: { t: 10, r: 10, b: 70, l: 50 },
      xaxis: { tickangle: -35, automargin: true, tickformat: '%b %y' },
      yaxis: { title: 'Value', gridcolor: 'rgba(0,0,0,.06)' },
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', showlegend: false
    }, { displayModeBar: false });
  };

  const drawComparisonGoodBad = () => {
    const cats = ['A','B','C','D','E','F','G','H'];
    const vals = cats.map(() => Math.round(rnd(10, 80)));

    Plotly.newPlot('chart-comparison-bad', [
      { type: 'pie', labels: cats, values: vals, textinfo: 'percent', marker: { colors: cats.map((_, i) => `hsl(${(i * 45)%360},85%,55%)`) } }
    ], { margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: true, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });

    const sorted = [...vals].map((v, i) => ({ v, c: cats[i] })).sort((a,b) => b.v - a.v);
    Plotly.newPlot('chart-comparison-good', [
      { type: 'bar', x: sorted.map((s) => s.c), y: sorted.map((s) => s.v), marker: { color: '#2563EB' } }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'Value', gridcolor: 'rgba(0,0,0,.06)' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawCorrelationGoodBad = () => {
    const n = 60;
    const x = Array.from({ length: n }, () => rnd(10, 100));
    const y = x.map((v) => 0.4 * v + rnd(-8, 12));
    const minX = Math.min(...x); const maxX = Math.max(...x);
    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const meanX = mean(x); const meanY = mean(y);
    const cov = x.reduce((acc, xi, i) => acc + (xi - meanX) * (y[i] - meanY), 0);
    const varX = x.reduce((acc, xi) => acc + (xi - meanX) ** 2, 0);
    const b = cov / varX; const a = meanY - b * meanX;

    Plotly.newPlot('chart-correlation-bad', [
      { type: 'scatter', mode: 'lines+markers', x, y, line: { color: '#ef4444' }, marker: { size: 6, color: '#ef4444' } }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, xaxis: { title: 'X (non-time)' }, yaxis: { title: 'Y' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });

    Plotly.newPlot('chart-correlation-good', [
      { type: 'scatter', mode: 'markers', x, y, marker: { size: 7, color: '#2563EB' }, name: 'Samples' },
      { type: 'scatter', mode: 'lines', x: [minX, maxX], y: [a + b * minX, a + b * maxX], line: { color: '#10B981', width: 2 }, name: 'Trend' }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, xaxis: { title: 'X' }, yaxis: { title: 'Y' }, showlegend: false, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawDistributionGoodBad = () => {
    const a = Array.from({ length: 300 }, () => rnd(1.5, 2.5));
    const b = Array.from({ length: 300 }, () => rnd(2.0, 3.1));

    Plotly.newPlot('chart-distribution-bad', [
      { type: 'histogram', x: a, nbinsx: 4, opacity: 1.0, marker: { color: '#f59e0b' }, name: 'A' },
      { type: 'histogram', x: b, nbinsx: 4, opacity: 1.0, marker: { color: '#ef4444' }, name: 'B' }
    ], { barmode: 'overlay', margin: { t: 10, r: 10, b: 40, l: 50 }, xaxis: { title: 'Value' }, yaxis: { title: 'Count' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });

    Plotly.newPlot('chart-distribution-good', [
      { type: 'violin', y: a, name: 'A', box: { visible: true }, meanline: { visible: true }, line: { color: '#94a3b8' } },
      { type: 'violin', y: b, name: 'B', box: { visible: true }, meanline: { visible: true }, line: { color: '#2563EB' } }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'Value' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawCompositionGoodBad = () => {
    const labels = ['A1','A2','B1','B2','B3','C1','C2','D1','E1','F1'];
    const values = labels.map(() => Math.round(rnd(5, 30)));

    Plotly.newPlot('chart-composition-bad', [
      { type: 'pie', labels, values, textinfo: 'label+percent', marker: { colors: labels.map((_, i) => `hsl(${(i*33)%360},80%,55%)`) } }
    ], { margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: false, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });

    Plotly.newPlot('chart-composition-good', [
      { type: 'treemap', labels: ['All','Family A','Family B','Family C','A1','A2','B1','B2','C1'],
        parents: ['', 'All', 'All', 'All', 'Family A', 'Family A', 'Family B', 'Family B', 'Family C'],
        values: [100, 40, 35, 25, 22, 18, 20, 15, 25], branchvalues: 'total' }
    ], { margin: { t: 10, r: 10, b: 10, l: 10 }, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawColorGoodBad = () => {
    const cats = ['North','South','East','West','Central','Export'];
    const vals = cats.map(() => Math.round(rnd(20, 90)));
    const rainbow = cats.map((_, i) => `hsl(${(i*60)%360}, 85%, 50%)`);

    Plotly.newPlot('chart-color-bad', [
      { type: 'bar', x: cats, y: vals, marker: { color: rainbow } }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'Value' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });

    Plotly.newPlot('chart-color-good', [
      { type: 'bar', x: cats, y: vals, marker: { color: '#2563EB' } }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'Value', gridcolor: 'rgba(0,0,0,.06)' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  // Structures gallery
  const drawStructThreeAct = () => {
    const x = Array.from({ length: 12 }, (_, i) => i + 1);
    const y = x.map((i) => 50 + i * 2 + rnd(-6, 6));
    Plotly.newPlot('chart-struct-threeact', [
      { type: 'scatter', x, y, mode: 'lines', line: { color: '#2563EB', width: 2 } }
    ], {
      margin: { t: 10, r: 10, b: 40, l: 50 },
      yaxis: { title: 'KPI', gridcolor: 'rgba(0,0,0,.06)' },
      xaxis: { title: 'Time' },
      shapes: [
        { type: 'rect', xref: 'x', yref: 'paper', x0: 1, x1: 4, y0: 0, y1: 1, fillcolor: 'rgba(37,99,235,0.06)', line: { width: 0 } },
        { type: 'rect', xref: 'x', yref: 'paper', x0: 4, x1: 8, y0: 0, y1: 1, fillcolor: 'rgba(239,68,68,0.08)', line: { width: 0 } },
        { type: 'rect', xref: 'x', yref: 'paper', x0: 8, x1: 12, y0: 0, y1: 1, fillcolor: 'rgba(16,185,129,0.08)', line: { width: 0 } }
      ],
      annotations: [
        { x: 2.5, y: 1.05, xref: 'x', yref: 'paper', text: 'Setup', showarrow: false },
        { x: 6, y: 1.05, xref: 'x', yref: 'paper', text: 'Conflict', showarrow: false },
        { x: 10, y: 1.05, xref: 'x', yref: 'paper', text: 'Resolution', showarrow: false }
      ],
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)'
    }, { displayModeBar: false });
  };

  const drawStructPSB = () => {
    const x = ['Problem', 'Solution', 'Benefit'];
    const measure = ['relative', 'relative', 'total'];
    const y = [-30, 45, 0];
    Plotly.newPlot('chart-struct-psb', [{
      type: 'waterfall', x, y, measure,
      decreasing: { marker: { color: '#ef4444' } },
      increasing: { marker: { color: '#22c55e' } },
      totals: { marker: { color: '#2563EB' } }
    }], { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'Impact' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawStructUnexpected = () => {
    const x = Array.from({ length: 12 }, (_, i) => i + 1);
    const belief = x.map(() => 60);
    const actual = x.map((i) => 55 + (i > 8 ? 20 : 0) + rnd(-3, 3));
    Plotly.newPlot('chart-struct-unexpected', [
      { type: 'scatter', x, y: belief, mode: 'lines', name: 'Belief', line: { color: '#94a3b8', dash: 'dot' } },
      { type: 'scatter', x, y: actual, mode: 'lines+markers', name: 'Actual', line: { color: '#2563EB' } }
    ], { margin: { t: 10, r: 10, b: 40, l: 50 }, xaxis: { title: 'Time' }, yaxis: { title: 'Value' },
      annotations: [{ x: 9, y: actual[8], text: 'Surprise', showarrow: true, arrowhead: 4 }],
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawStructPyramid = () => {
    Plotly.newPlot('chart-struct-pyramid', [{
      type: 'funnelarea', labels: ['Answer', 'Supporting points', 'Evidence'], values: [60, 40, 25],
      textinfo: 'label+percent', marker: { colors: ['#2563EB','#60a5fa','#bfdbfe'] }, sort: false
    }], { margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: false, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawStructSTAR = () => {
    const steps = ['Situation','Task','Action','Result'];
    const weights = [20, 20, 40, 20];
    Plotly.newPlot('chart-struct-star', [{ type: 'bar', x: steps, y: weights, marker: { color: ['#94a3b8','#94a3b8','#2563EB','#22c55e'] } }],
      { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: '%' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawStructSCQA = () => {
    const steps = ['Situation','Complication','Question','Answer'];
    const weights = [25, 25, 25, 25];
    Plotly.newPlot('chart-struct-scqa', [{ type: 'bar', x: steps, y: weights, marker: { color: ['#94a3b8','#f59e0b','#f97316','#2563EB'] } }],
      { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: '%' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawStructDataInk = () => {
    const values = [80, 20];
    const labels = ['Data', 'Decor'];
    Plotly.newPlot('chart-struct-dataink', [{ type: 'pie', values, labels, hole: 0.55, marker: { colors: ['#2563EB','#e5e7eb'] } }],
      { margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: true, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  // Pitfalls gallery
  const drawPitfallCharts = () => {
    const cats = ['A','B','C','D','E'];
    const traces = Array.from({ length: 6 }, (_, i) => ({ type: 'bar', x: cats, y: cats.map(() => Math.round(rnd(10, 80))), name: `Series ${i+1}` }));
    Plotly.newPlot('chart-pitfall-charts', traces, { barmode: 'group', margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'Value' }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawPitfallOwner = () => {
    Plotly.newPlot('chart-pitfall-owner', [{ type: 'indicator', mode: 'number', value: 2.6, number: { suffix: '%' }, title: { text: 'Conversion (owner: none)' } }],
      { margin: { t: 20, r: 10, b: 10, l: 10 }, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawPitfallColor = () => {
    const cats = ['North','South','East','West','Central','Export'];
    const vals = cats.map(() => Math.round(rnd(20, 90)));
    const rainbow = cats.map((_, i) => `hsl(${(i*60)%360}, 85%, 50%)`);
    Plotly.newPlot('chart-pitfall-color', [{ type: 'bar', x: cats, y: vals, marker: { color: rainbow } }],
      { margin: { t: 10, r: 10, b: 40, l: 50 }, yaxis: { title: 'Value' }, showlegend: false, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const drawPitfallTrust = () => {
    const label = ['Data','ETL','Dashboard','Decision','Dead-end'];
    const source = [0,1,2,2];
    const target = [1,2,3,4];
    const value = [100, 80, 20, 60];
    Plotly.newPlot('chart-pitfall-trust', [{ type: 'sankey', orientation: 'h', node: { label }, link: { source, target, value } }],
      { margin: { t: 10, r: 10, b: 10, l: 10 }, paper_bgcolor: 'rgba(0,0,0,0)' }, { displayModeBar: false });
  };

  const bindControls = () => {
    document.getElementById('timeframe')?.addEventListener('change', () => { drawCtr(); drawRevenue(); });
    document.getElementById('seasonality')?.addEventListener('input', drawCtr);
    document.getElementById('simplicity')?.addEventListener('input', (e) => drawFunnel(Number(e.target.value)));
    document.getElementById('reset-funnel')?.addEventListener('click', () => { const s = document.getElementById('simplicity'); if (s) { s.value = 35; } drawFunnel(35); });
    ['fillRate','viewability','ctr'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', drawRpm);
    });
  };

  const resizeAll = () => {
    [
      'chart-ctr','chart-rev','chart-funnel','chart-map','chart-campaign','chart-rpm','chart-pipeline',
      'chart-cohort','chart-waterfall','chart-sankey','chart-distribution','chart-bubble','chart-treemap',
      'chart-sunburst','chart-decomp','chart-ab','chart-donut',
      'chart-trend-bad','chart-trend-good','chart-comparison-bad','chart-comparison-good',
      'chart-correlation-bad','chart-correlation-good','chart-distribution-bad','chart-distribution-good',
      'chart-composition-bad','chart-composition-good','chart-color-bad','chart-color-good',
      'chart-struct-threeact','chart-struct-psb','chart-struct-unexpected','chart-struct-pyramid',
      'chart-struct-star','chart-struct-scqa','chart-struct-dataink',
      'chart-pitfall-charts','chart-pitfall-owner','chart-pitfall-color','chart-pitfall-trust'
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        try { Plotly.Plots.resize(el); } catch (_) {}
      }
    });
  };

  const boot = () => {
    initTabs();
    drawCtr();
    drawRevenue();
    drawFunnel();
    drawMap();
    drawCampaign();
    drawRpm();
    drawPipeline();
    drawCohort();
    drawWaterfall();
    drawSankey();
    drawDistribution();
    drawBubble();
    drawTreemap();
    drawSunburst();
    drawDecomp();
    drawAB();
    drawDonut();
    // Good vs Bad showcase
    drawTrendGoodBad();
    drawComparisonGoodBad();
    drawCorrelationGoodBad();
    drawDistributionGoodBad();
    drawCompositionGoodBad();
    drawColorGoodBad();
    // Structures & Pitfalls galleries
    drawStructThreeAct();
    drawStructPSB();
    drawStructUnexpected();
    drawStructPyramid();
    drawStructSTAR();
    drawStructSCQA();
    drawStructDataInk();
    drawPitfallCharts();
    drawPitfallOwner();
    drawPitfallColor();
    drawPitfallTrust();
    bindControls();
    window.addEventListener('resize', resizeAll);
  };

  window.__initBiStorytelling = boot;

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(boot, 0);
  } else {
    window.addEventListener('load', boot);
  }
})();


