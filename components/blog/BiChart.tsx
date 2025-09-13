'use client';

import { useEffect, useRef } from 'react';

// Load Plotly dynamically
const loadPlotly = async () => {
  if (typeof window !== 'undefined' && !(window as any).Plotly) {
    // Load from CDN
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.32.0.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Plotly'));
      document.head.appendChild(script);
    });
  }
  return (window as any).Plotly;
};

interface BiChartProps {
  id: string;
  type: string;
  [key: string]: any; // Additional props for the chart function
}

const BiChart = ({ id, type, ...props }: BiChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Utility functions
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const add = (a: number[], b: number | number[]) => 
    a.map((v, i) => v + (Array.isArray(b) ? (b as number[])[i] : b as number));
  const rnd = (min: number, max: number) => min + Math.random() * (max - min);
  const monthLabels = (n: number) => {
    const now = new Date();
    const labels = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString('en', { month: 'short', year: '2-digit' }));
    }
    return labels;
  };
  
  // Chart functions
  const chartFunctions: Record<string, (elementId: string) => Promise<void>> = {
    drawCtr: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const months = 12;
      const seasonality = 12;
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
      
      await Plotly.react(elementId, [{
        x, 
        y, 
        type: 'scatter', 
        mode: 'lines+markers',
        line: { color: '#2563EB', width: 2 }, 
        marker: { size: 4 }
      }], {
        margin: { t: 10, r: 10, b: 70, l: 50 },
        yaxis: { title: 'CTR %', ticksuffix: '%', gridcolor: 'rgba(0,0,0,.06)' },
        xaxis: { tickangle: -35, automargin: true }, 
        showlegend: false, 
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
      }, { displayModeBar: false });
    },
    
    drawRevenue: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const months = 12;
      const x = monthLabels(months);
      const trend = Array.from({ length: months }, (_, i) => 240 + i * 6);
      const noise = Array.from({ length: months }, () => rnd(-12, 12));
      const actual = add(trend, noise);
      const forecast = add(trend, 6);
      const lower = add(forecast, -24);
      const upper = add(forecast, 24);
      
      const band = { 
        x: [...x, ...x.slice().reverse()],
        y: [...upper, ...lower.slice().reverse()], 
        fill: 'toself', 
        type: 'scatter',
        line: { color: 'transparent' }, 
        fillcolor: 'rgba(37, 99, 235, 0.12)',
        name: 'Forecast 90%' 
      };
      
      const act = { 
        x, 
        y: actual, 
        type: 'scatter', 
        mode: 'lines',
        line: { color: '#10B981', width: 2 }, 
        name: 'Actual' 
      };
      
      const fc = { 
        x, 
        y: forecast, 
        type: 'scatter', 
        mode: 'lines',
        line: { color: '#2563EB', width: 2, dash: 'dot' }, 
        name: 'Forecast' 
      };
      
      await Plotly.react(elementId, [band, fc, act], {
        margin: { t: 10, r: 10, b: 70, l: 50 },
        yaxis: { title: 'Revenue ($K)', gridcolor: 'rgba(0,0,0,.06)' },
        xaxis: { tickangle: -35, automargin: true }, 
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
      }, { displayModeBar: false });
    },
    
    drawFunnel: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const stages = ['Visits', 'Product Views', 'Add to Cart', 'Checkout', 'Payment'];
      const base = [100000, 42000, 18000, 7000, 2800];
      const ease = 35 / 100; // simplicity value from 0-100 normalized to 0-1
      const improved = [
        base[0],
        Math.round(base[1] * (1 + 0.02 * ease)),
        Math.round(base[2] * (1 + 0.05 * ease)),
        Math.round(base[3] * (1 + 0.10 * ease)),
        Math.round(base[4] * (1 + 0.12 * ease))
      ];
      
      const baseTrace = { 
        type: 'funnel', 
        y: stages, 
        x: base, 
        name: 'Baseline',
        marker: { color: '#94a3b8' } 
      };
      
      const impTrace = { 
        type: 'funnel', 
        y: stages, 
        x: improved, 
        name: 'Projected',
        marker: { color: '#2563EB' } 
      };
      
      await Plotly.react(elementId, [baseTrace, impTrace], {
        margin: { t: 10, l: 120, r: 10, b: 10 },
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawMap: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const data = [{
        type: 'choropleth', 
        locationmode: 'ISO-3', 
        zauto: false, 
        zmin: -10, 
        zmax: 20,
        locations: ['USA', 'CAN', 'GBR', 'DEU', 'FRA', 'BRA', 'IND', 'AUS', 'ISR'],
        z: [12, 8, 5, -3, 2, 6, 14, 7, 11],
        colorscale: [[0, '#ef4444'], [0.45, '#f97316'], [0.5, '#e5e7eb'], [0.6, '#93c5fd'], [1, '#22c55e']],
        marker: { line: { color: 'rgba(0,0,0,.2)', width: 0.3 } },
        colorbar: { title: 'ROI %' }
      }];
      
      const layout = { 
        geo: { projection: { type: 'equirectangular' } },
        margin: { t: 0, b: 0, l: 0, r: 0 }, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      };
      
      await Plotly.newPlot(elementId, data, layout, { displayModeBar: false });
    },
    
    drawCampaign: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const campaigns = ['Brand', 'Search', 'Social', 'Video', 'Affiliates', 'Email'];
      const roas = campaigns.map(() => Number(rnd(1.8, 5.2).toFixed(2)));
      
      await Plotly.newPlot(elementId, [{ 
        type: 'bar', 
        x: campaigns, 
        y: roas,
        marker: { color: '#2563EB' } 
      }], {
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'ROAS' },
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawRpm: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const fill = 86;
      const view = 62;
      const ctr = 1.3;
      const ecpm = (0.45 + ctr * 0.35) * 10;
      const rpm = ecpm * (fill / 100) * (view / 100);
      
      const trace = [{ 
        type: 'indicator', 
        mode: 'gauge+number', 
        value: rpm,
        title: { text: 'RPM ($)' }, 
        gauge: { 
          axis: { range: [0, 50] }, 
          bar: { color: '#2563EB' },
          steps: [ 
            { range: [0, 10], color: '#fee2e2' }, 
            { range: [10, 25], color: '#e0f2fe' }, 
            { range: [25, 50], color: '#dcfce7' } 
          ] 
        } 
      }];
      
      await Plotly.react(elementId, trace, { 
        margin: { t: 10, r: 10, b: 10, l: 10 },
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawPipeline: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const steps = 60;
      const times = Array.from({ length: steps }, (_, i) => i + 1);
      const success = times.map((i) => clamp(95 + Math.sin(i/6)*2 + rnd(-1, 1), 86, 99));
      const anomalyIdx = 45; 
      success[anomalyIdx] = 78;
      
      await Plotly.newPlot(elementId, [
        { 
          x: times, 
          y: success, 
          type: 'scatter', 
          mode: 'lines', 
          line: { color: '#10B981' }, 
          name: 'ETL Success %' 
        },
        { 
          x: [times[anomalyIdx]], 
          y: [success[anomalyIdx]], 
          type: 'scatter', 
          mode: 'markers+text', 
          marker: { color: '#ef4444', size: 10 }, 
          text: ['Anomaly'], 
          textposition: 'top center', 
          name: 'Anomaly' 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'Success %' }, 
        xaxis: { title: 'Run #' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    // Advanced charts
    drawCohort: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const cohorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
      const months = ['M0','M1','M2','M3','M4','M5','M6'];
      const z = cohorts.map((_, i) => months.map((__, j) => {
        const base = 82 - i * 4 - j * 3 + rnd(-2, 2);
        return Math.max(0, Math.min(100, Math.round(base)));
      }));
      
      await Plotly.newPlot(elementId, [{ 
        type: 'heatmap', 
        z, 
        x: months, 
        y: cohorts,
        colorscale: 'Blues', 
        reversescale: false, 
        zmin: 0, 
        zmax: 100 
      }], {
        margin: { t: 10, r: 10, b: 40, l: 60 }, 
        xaxis: { title: 'Months since signup' }, 
        yaxis: { title: 'Signup cohort' },
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawWaterfall: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const x = ['Start', 'Price', 'Volume', 'Discounts', 'Churn', 'FX', 'End'];
      const measure = ['absolute', 'relative', 'relative', 'relative', 'relative', 'relative', 'total'];
      const y = [1200, 180, 240, -90, -130, 45, 0];
      
      await Plotly.newPlot(elementId, [{ 
        type: 'waterfall', 
        x, 
        y, 
        measure,
        decreasing: { marker: { color: '#ef4444' } }, 
        increasing: { marker: { color: '#22c55e' } }, 
        totals: { marker: { color: '#2563EB' } } 
      }], {
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: '$K' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawSankey: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const label = ['Ads', 'Search', 'Social', 'Landing', 'Signup', 'Product', 'Pay'];
      const source = [0, 1, 2, 3, 3, 5];
      const target = [3, 3, 3, 4, 5, 6];
      const value = [40, 30, 20, 60, 40, 12];
      const isDark = document.body.classList.contains('dark-mode');
      const linkColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(149, 179, 221, 0.85)';
      const nodeColor = isDark ? '#E5E7EB' : '#334155';
      
      await Plotly.newPlot(elementId, [{
        type: 'sankey', 
        orientation: 'h',
        node: { 
          label, 
          pad: 16, 
          thickness: 18, 
          color: nodeColor, 
          line: { color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.28)', width: 1 } 
        },
        link: { source, target, value, color: Array(value.length).fill(linkColor) }
      }], { 
        margin: { t: 10, r: 10, b: 10, l: 10 }, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawDistribution: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const a = Array.from({ length: 120 }, () => rnd(1.8, 2.6));
      const b = Array.from({ length: 120 }, () => rnd(2.1, 3.1));
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'violin', 
          y: a, 
          name: 'Variant A', 
          box: { visible: true }, 
          meanline: { visible: true }, 
          line: { color: '#94a3b8' } 
        },
        { 
          type: 'violin', 
          y: b, 
          name: 'Variant B', 
          box: { visible: true }, 
          meanline: { visible: true }, 
          line: { color: '#2563EB' } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'Conversion %' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawBubble: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const seg = ['Prospects','New','Returning','VIP','Dormant'];
      const spend = seg.map(() => rnd(20, 120));
      const roas = seg.map(() => rnd(1.2, 5.0));
      const size = seg.map(() => rnd(10, 60));
      
      await Plotly.newPlot(elementId, [{ 
        x: spend, 
        y: roas, 
        text: seg, 
        mode: 'markers', 
        marker: { size, color: spend, colorscale: 'Blues' } 
      }], {
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        xaxis: { title: 'Spend ($K)' }, 
        yaxis: { title: 'ROAS' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawTreemap: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const labels = ['All', 'Family A', 'Family B', 'Family C', 'A1', 'A2', 'B1', 'B2', 'C1'];
      const parents = ['', 'All', 'All', 'All', 'Family A', 'Family A', 'Family B', 'Family B', 'Family C'];
      // Root value must equal sum of its direct children when branchvalues='total'
      const values = [100, 40, 30, 30, 22, 18, 20, 10, 30];
      
      await Plotly.newPlot(elementId, [{ 
        type: 'treemap', 
        labels, 
        parents, 
        values, 
        branchvalues: 'total' 
      }], {
        margin: { t: 10, r: 10, b: 10, l: 10 }, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawSunburst: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const labels = ['World','Americas','EMEA','APAC','USA','CAN','DEU','FRA','ISR','IND','AUS'];
      const parents = ['', 'World','World','World','Americas','Americas','EMEA','EMEA','EMEA','APAC','APAC'];
      // Root value equals sum of region totals
      const values = [115, 50, 35, 30, 28, 22, 12, 8, 15, 18, 12];
      
      await Plotly.newPlot(elementId, [{ 
        type: 'sunburst', 
        labels, 
        parents, 
        values, 
        branchvalues: 'total' 
      }], {
        margin: { t: 10, r: 10, b: 10, l: 10 }, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawDecomp: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const n = 48;
      const x = Array.from({ length: n }, (_, i) => i + 1);
      const trend = x.map((i) => 200 + i * 2.2);
      const season = x.map((i) => Math.sin((i/12)*Math.PI*2) * 20);
      const noise = x.map(() => rnd(-8, 8));
      const observed = x.map((_, i) => trend[i] + season[i] + noise[i]);
      
      await Plotly.newPlot(elementId, [
        { 
          x, 
          y: observed, 
          type: 'scatter', 
          mode: 'lines', 
          name: 'Observed', 
          line: { color: '#111827' } 
        },
        { 
          x, 
          y: trend, 
          type: 'scatter', 
          mode: 'lines', 
          name: 'Trend', 
          line: { color: '#2563EB', dash: 'dot' } 
        },
        { 
          x, 
          y: season, 
          type: 'scatter', 
          mode: 'lines', 
          name: 'Seasonality', 
          line: { color: '#10B981' } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        xaxis: { title: 't' }, 
        yaxis: { title: 'Value' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawAB: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const days = Array.from({ length: 21 }, (_, i) => `D${i+1}`);
      const lift = days.map((_, i) => 2 + Math.sin(i/3) * 1.2 + rnd(-0.4, 0.4));
      const ci = 0.9;
      const lower = lift.map((v) => v - ci);
      const upper = lift.map((v) => v + ci);
      
      await Plotly.newPlot(elementId, [
        { 
          x: days, 
          y: lift, 
          type: 'scatter', 
          mode: 'lines+markers', 
          name: 'Lift %', 
          line: { color: '#2563EB' } 
        },
        { 
          x: [...days, ...days.slice().reverse()], 
          y: [...upper, ...lower.slice().reverse()], 
          type: 'scatter', 
          fill: 'toself', 
          line: { color: 'transparent' }, 
          fillcolor: 'rgba(37,99,235,0.12)', 
          name: '95% CI' 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'Lift %' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawDonut: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const used = 72;
      const free = 100 - used;
      
      await Plotly.newPlot(elementId, [{ 
        type: 'pie', 
        values: [used, free], 
        labels: ['Used','Free'], 
        hole: .64, 
        marker: { colors: ['#2563EB','#e5e7eb'] } 
      }], {
        margin: { t: 10, r: 10, b: 10, l: 10 }, 
        showlegend: false, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    // Good vs Bad examples
    drawTrendBad: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const x = monthLabels(12);
      const y = Array.from({ length: 12 }, (_, i) => 40 + i * 2 + rnd(-4, 4));
      const badColors = x.map((_, i) => `hsl(${(i * 37) % 360}, 80%, 55%)`);
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'bar', 
          x, 
          y, 
          marker: { color: badColors } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 },
        xaxis: { tickangle: -45 },
        yaxis: { title: 'Value', gridcolor: 'rgba(0,0,0,.25)' },
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawTrendGood: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const x = monthLabels(12);
      const y = Array.from({ length: 12 }, (_, i) => 40 + i * 2 + rnd(-4, 4));
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'scatter', 
          mode: 'lines+markers', 
          x, 
          y,
          line: { color: '#2563EB', width: 2 }, 
          marker: { size: 4 } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 70, l: 50 },
        xaxis: { tickangle: -35, automargin: true, tickformat: '%b %y' },
        yaxis: { title: 'Value', gridcolor: 'rgba(0,0,0,.06)' },
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)', 
        showlegend: false 
      }, { displayModeBar: false });
    },
    
    drawComparisonBad: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const cats = ['A','B','C','D','E','F','G','H'];
      const vals = cats.map(() => Math.round(rnd(10, 80)));
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'pie', 
          labels: cats, 
          values: vals, 
          textinfo: 'percent', 
          marker: { colors: cats.map((_, i) => `hsl(${(i * 45)%360},85%,55%)`) } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 10, l: 10 }, 
        showlegend: true, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawComparisonGood: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const cats = ['A','B','C','D','E','F','G','H'];
      const vals = cats.map(() => Math.round(rnd(10, 80)));
      const sorted = [...vals].map((v, i) => ({ v, c: cats[i] })).sort((a,b) => b.v - a.v);
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'bar', 
          x: sorted.map((s) => s.c), 
          y: sorted.map((s) => s.v), 
          marker: { color: '#2563EB' } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'Value', gridcolor: 'rgba(0,0,0,.06)' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawCorrelationBad: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const n = 60;
      const x = Array.from({ length: n }, () => rnd(10, 100));
      const y = x.map((v) => 0.4 * v + rnd(-8, 12));
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'scatter', 
          mode: 'lines+markers', 
          x, 
          y, 
          line: { color: '#ef4444' }, 
          marker: { size: 6, color: '#ef4444' } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        xaxis: { title: 'X (non-time)' }, 
        yaxis: { title: 'Y' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawCorrelationGood: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const n = 60;
      const x = Array.from({ length: n }, () => rnd(10, 100));
      const y = x.map((v) => 0.4 * v + rnd(-8, 12));
      const minX = Math.min(...x); 
      const maxX = Math.max(...x);
      const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const meanX = mean(x); 
      const meanY = mean(y);
      const cov = x.reduce((acc, xi, i) => acc + (xi - meanX) * (y[i] - meanY), 0);
      const varX = x.reduce((acc, xi) => acc + (xi - meanX) ** 2, 0);
      const b = cov / varX; 
      const a = meanY - b * meanX;
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'scatter', 
          mode: 'markers', 
          x, 
          y, 
          marker: { size: 7, color: '#2563EB' }, 
          name: 'Samples' 
        },
        { 
          type: 'scatter', 
          mode: 'lines', 
          x: [minX, maxX], 
          y: [a + b * minX, a + b * maxX], 
          line: { color: '#10B981', width: 2 }, 
          name: 'Trend' 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        xaxis: { title: 'X' }, 
        yaxis: { title: 'Y' }, 
        showlegend: false, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawDistributionBad: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const a = Array.from({ length: 300 }, () => rnd(1.5, 2.5));
      const b = Array.from({ length: 300 }, () => rnd(2.0, 3.1));
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'histogram', 
          x: a, 
          nbinsx: 4, 
          opacity: 1.0, 
          marker: { color: '#f59e0b' }, 
          name: 'A' 
        },
        { 
          type: 'histogram', 
          x: b, 
          nbinsx: 4, 
          opacity: 1.0, 
          marker: { color: '#ef4444' }, 
          name: 'B' 
        }
      ], { 
        barmode: 'overlay', 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        xaxis: { title: 'Value' }, 
        yaxis: { title: 'Count' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawDistributionGood: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const a = Array.from({ length: 120 }, () => rnd(1.8, 2.6));
      const b = Array.from({ length: 120 }, () => rnd(2.1, 3.1));
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'violin', 
          y: a, 
          name: 'A', 
          box: { visible: true }, 
          meanline: { visible: true }, 
          line: { color: '#94a3b8' } 
        },
        { 
          type: 'violin', 
          y: b, 
          name: 'B', 
          box: { visible: true }, 
          meanline: { visible: true }, 
          line: { color: '#2563EB' } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'Value' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawCompositionBad: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const labels = ['A1','A2','B1','B2','B3','C1','C2','D1','E1','F1'];
      const values = labels.map(() => Math.round(rnd(5, 30)));
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'pie', 
          labels, 
          values, 
          textinfo: 'label+percent', 
          marker: { colors: labels.map((_, i) => `hsl(${(i*33)%360},80%,55%)`) } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 10, l: 10 }, 
        showlegend: false, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawCompositionGood: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'treemap', 
          labels: ['All','Family A','Family B','Family C','A1','A2','B1','B2','C1'],
          parents: ['', 'All', 'All', 'All', 'Family A', 'Family A', 'Family B', 'Family B', 'Family C'],
          values: [100, 40, 35, 25, 22, 18, 20, 15, 25], 
          branchvalues: 'total' 
        }
      ], { 
        margin: { t: 10, r: 10, b: 10, l: 10 }, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawColorBad: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const cats = ['North','South','East','West','Central','Export'];
      const vals = cats.map(() => Math.round(rnd(20, 90)));
      const rainbow = cats.map((_, i) => `hsl(${(i*60)%360}, 85%, 50%)`);
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'bar', 
          x: cats, 
          y: vals, 
          marker: { color: rainbow } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'Value' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawColorGood: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const cats = ['North','South','East','West','Central','Export'];
      const vals = cats.map(() => Math.round(rnd(20, 90)));
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'bar', 
          x: cats, 
          y: vals, 
          marker: { color: '#2563EB' } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'Value', gridcolor: 'rgba(0,0,0,.06)' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    // Structures gallery
    drawStructThreeAct: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const x = Array.from({ length: 12 }, (_, i) => i + 1);
      const y = x.map((i) => 50 + i * 2 + rnd(-6, 6));
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'scatter', 
          x, 
          y, 
          mode: 'lines', 
          line: { color: '#2563EB', width: 2 } 
        }
      ], {
        margin: { t: 10, r: 10, b: 40, l: 50 },
        yaxis: { title: 'KPI', gridcolor: 'rgba(0,0,0,.06)' },
        xaxis: { title: 'Time' },
        shapes: [
          { 
            type: 'rect', 
            xref: 'x', 
            yref: 'paper', 
            x0: 1, 
            x1: 4, 
            y0: 0, 
            y1: 1, 
            fillcolor: 'rgba(37,99,235,0.06)', 
            line: { width: 0 } 
          },
          { 
            type: 'rect', 
            xref: 'x', 
            yref: 'paper', 
            x0: 4, 
            x1: 8, 
            y0: 0, 
            y1: 1, 
            fillcolor: 'rgba(239,68,68,0.08)', 
            line: { width: 0 } 
          },
          { 
            type: 'rect', 
            xref: 'x', 
            yref: 'paper', 
            x0: 8, 
            x1: 12, 
            y0: 0, 
            y1: 1, 
            fillcolor: 'rgba(16,185,129,0.08)', 
            line: { width: 0 } 
          }
        ],
        annotations: [
          { 
            x: 2.5, 
            y: 1.05, 
            xref: 'x', 
            yref: 'paper', 
            text: 'Setup', 
            showarrow: false 
          },
          { 
            x: 6, 
            y: 1.05, 
            xref: 'x', 
            yref: 'paper', 
            text: 'Conflict', 
            showarrow: false 
          },
          { 
            x: 10, 
            y: 1.05, 
            xref: 'x', 
            yref: 'paper', 
            text: 'Resolution', 
            showarrow: false 
          }
        ],
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawStructPSB: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const x = ['Problem', 'Solution', 'Benefit'];
      const measure = ['relative', 'relative', 'total'];
      const y = [-30, 45, 0];
      
      await Plotly.newPlot(elementId, [{
        type: 'waterfall', 
        x, 
        y, 
        measure,
        decreasing: { marker: { color: '#ef4444' } },
        increasing: { marker: { color: '#22c55e' } },
        totals: { marker: { color: '#2563EB' } }
      }], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'Impact' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawStructUnexpected: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const x = Array.from({ length: 12 }, (_, i) => i + 1);
      const belief = x.map(() => 60);
      const actual = x.map((i) => 55 + (i > 8 ? 20 : 0) + rnd(-3, 3));
      
      await Plotly.newPlot(elementId, [
        { 
          type: 'scatter', 
          x, 
          y: belief, 
          mode: 'lines', 
          name: 'Belief', 
          line: { color: '#94a3b8', dash: 'dot' } 
        },
        { 
          type: 'scatter', 
          x, 
          y: actual, 
          mode: 'lines+markers', 
          name: 'Actual', 
          line: { color: '#2563EB' } 
        }
      ], { 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        xaxis: { title: 'Time' }, 
        yaxis: { title: 'Value' },
        annotations: [{ 
          x: 9, 
          y: actual[8], 
          text: 'Surprise', 
          showarrow: true, 
          arrowhead: 4 
        }],
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawStructPyramid: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      await Plotly.newPlot(elementId, [{ 
        type: 'funnelarea', 
        labels: ['Answer', 'Supporting points', 'Evidence'], 
        values: [60, 40, 25],
        textinfo: 'label+percent', 
        marker: { colors: ['#2563EB','#60a5fa','#bfdbfe'] }, 
        sort: false 
      }], { 
        margin: { t: 10, r: 10, b: 10, l: 10 }, 
        showlegend: false, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawStructSTAR: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const steps = ['Situation','Task','Action','Result'];
      const weights = [20, 20, 40, 20];
      
      await Plotly.newPlot(elementId, [{ 
        type: 'bar', 
        x: steps, 
        y: weights, 
        marker: { color: ['#94a3b8','#94a3b8','#2563EB','#22c55e'] } 
      }], {
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: '%' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawStructSCQA: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const steps = ['Situation','Complication','Question','Answer'];
      const weights = [25, 25, 25, 25];
      
      await Plotly.newPlot(elementId, [{ 
        type: 'bar', 
        x: steps, 
        y: weights, 
        marker: { color: ['#94a3b8','#f59e0b','#f97316','#2563EB'] } 
      }], {
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: '%' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawStructDataInk: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const values = [80, 20];
      const labels = ['Data', 'Decor'];
      
      await Plotly.newPlot(elementId, [{ 
        type: 'pie', 
        values, 
        labels, 
        hole: 0.55, 
        marker: { colors: ['#2563EB','#e5e7eb'] } 
      }], {
        margin: { t: 10, r: 10, b: 10, l: 10 }, 
        showlegend: true, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    // Pitfalls gallery
    drawPitfallCharts: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const cats = ['A','B','C','D','E'];
      const traces = Array.from({ length: 6 }, (_, i) => ({ 
        type: 'bar', 
        x: cats, 
        y: cats.map(() => Math.round(rnd(10, 80))), 
        name: `Series ${i+1}` 
      }));
      
      await Plotly.newPlot(elementId, traces, { 
        barmode: 'group', 
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'Value' }, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawPitfallOwner: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      await Plotly.newPlot(elementId, [{ 
        type: 'indicator', 
        mode: 'number', 
        value: 2.6, 
        number: { suffix: '%' }, 
        title: { text: 'Conversion (owner: none)' } 
      }], {
        margin: { t: 20, r: 10, b: 10, l: 10 }, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawPitfallColor: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const cats = ['North','South','East','West','Central','Export'];
      const vals = cats.map(() => Math.round(rnd(20, 90)));
      const rainbow = cats.map((_, i) => `hsl(${(i*60)%360}, 85%, 50%)`);
      
      await Plotly.newPlot(elementId, [{ 
        type: 'bar', 
        x: cats, 
        y: vals, 
        marker: { color: rainbow } 
      }], {
        margin: { t: 10, r: 10, b: 40, l: 50 }, 
        yaxis: { title: 'Value' }, 
        showlegend: false, 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    },
    
    drawPitfallTrust: async (elementId: string) => {
      const Plotly = await loadPlotly();
      
      const label = ['Data','ETL','Dashboard','Decision','Dead-end'];
      const source = [0,1,2,2];
      const target = [1,2,3,4];
      const value = [100, 80, 20, 60];
      
      await Plotly.newPlot(elementId, [{ 
        type: 'sankey', 
        orientation: 'h', 
        node: { label }, 
        link: { source, target, value } 
      }], {
        margin: { t: 10, r: 10, b: 10, l: 10 }, 
        paper_bgcolor: 'rgba(0,0,0,0)' 
      }, { displayModeBar: false });
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    
    // Copy the ref value to a variable inside the effect
    const chartElement = chartRef.current;
    
    const renderChart = async () => {
      try {
        if (!isMounted || !chartElement) return;
        
        // Clear any existing chart
        chartElement.innerHTML = '';
        chartElement.id = id;
        
        // Render the chart if function exists
        if (chartFunctions[type]) {
          await chartFunctions[type](id);
        }
      } catch (error) {
        console.error(`Error rendering chart ${type}:`, error);
      }
    };
    
    renderChart();
    
    return () => {
      isMounted = false;
      // Clean up the chart when component unmounts
      if (chartElement && (window as any).Plotly) {
        (window as any).Plotly.purge(chartElement);
      }
    };
  }, [id, type]); // Add chartFunctions to the dependency array
  
  return <div ref={chartRef} className="chart" />;
};

export default BiChart;