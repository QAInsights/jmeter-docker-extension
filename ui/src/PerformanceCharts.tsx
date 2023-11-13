import { ChartData } from "./ChartData";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';

import zoomPlugin from 'chartjs-plugin-zoom';
import { Ref, forwardRef } from "react";
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.register(zoomPlugin);

type Props = {
    data: ChartData;
    options: any;
    chartRef: any
}; 

function DisplayLineChart({ data, options, chartRef }: Props) { 
  return (    
    <div style={{ width: '600px', height: '400px' }}>
        <Line data={data} options={ options } ref={ chartRef } />
    </div>
  );
}

const DisplayLineChartTimeSeriesThreads = (props: Props) => <DisplayLineChart {...props} />;
const DisplayLineChartTimeSeriesTransactions = (props: Props) => <DisplayLineChart {...props} />;
const DisplayLineChartTimeSeriesResponseTime = (props: Props) => <DisplayLineChart {...props} />;
const DisplayLineChartTimeSeriesErrorPercentage = (props: Props) => <DisplayLineChart {...props} />;

export { 
  DisplayLineChartTimeSeriesThreads, 
  DisplayLineChartTimeSeriesTransactions,
  DisplayLineChartTimeSeriesResponseTime,
  DisplayLineChartTimeSeriesErrorPercentage
};

