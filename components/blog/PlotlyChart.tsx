'use client';

import { useEffect, useRef } from 'react';

// Load Plotly dynamically
const loadPlotly = async () => {
  if (typeof window !== 'undefined' && !(window as any).Plotly) {
    const Plotly = await import('plotly.js-dist-min');
    (window as any).Plotly = Plotly.default || Plotly;
  }
  return (window as any).Plotly;
};

interface PlotlyChartProps {
  id: string;
  data: any[];
  layout?: any;
  config?: any;
  style?: React.CSSProperties;
  onRender?: () => void;
}

const PlotlyChart = ({ id, data, layout = {}, config = {}, style = {}, onRender }: PlotlyChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let isMounted = true;
    // Copy the ref value to a variable inside the effect
    const chartElement = chartRef.current;
    
    const renderChart = async () => {
      try {
        const Plotly = await loadPlotly();
        
        if (!isMounted || !chartElement) return;
        
        // Clear any existing chart
        chartElement.innerHTML = '';
        
        // Render the chart
        await Plotly.newPlot(chartElement, data, layout, config);
        
        if (onRender) onRender();
      } catch (error) {
        console.error('Error rendering Plotly chart:', error);
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
  }, [data, layout, config, onRender]);
  
  return <div ref={chartRef} id={id} style={style} />;
};

export default PlotlyChart;