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
}; 

function DisplayLineChartTimeSeriesThreads({ data }: Props, { options }: Props) {
 
  return (        
    <div style={{ width: '600px', height: '400px' }}>
        <Line data={data} options={ options }/>
    </div>
  );
}

// function for transactions
function DisplayLineChartTimeSeriesTransactions({ data }: Props, { options }: Props) {
 
    return (        
      <div style={{ width: '600px', height: '400px' }}>
          <Line data={data} options={ options }/>
      </div>
    );
}

export { DisplayLineChartTimeSeriesThreads, DisplayLineChartTimeSeriesTransactions};

