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

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    backgroundColor: string;
    borderColor: string;
  }[];
};

type Props = {
    data: ChartData;
    chartOptions: any;
}; 



// export default function DisplayLineChartTimeSeriesThreads(rawData: string) {
//   const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] });
//   const ddClient = createDockerDesktopClient();
//   const timeMatch = rawData.match(/in (\d\d:\d\d:\d\d)/);
//   const activeMatch = rawData.match(/Active: (\d+)/);

//   useEffect(() => {    
//     if (timeMatch && activeMatch) {
//       const time = timeMatch[1];
//       const active = activeMatch[1];

//       ddClient.desktopUI.toast.success(timeMatch[1]);
//       ddClient.desktopUI.toast.success(activeMatch[1]);

//       setChartData(({
//         labels: [...time],
//         datasets: [
//           {
//             label: 'Active Threads',
//             data: [...active],
//             fill: false,
//             backgroundColor: 'rgb(255, 99, 132)',
//             borderColor: 'rgba(255, 99, 132, 0.2)',
//           },
//         ],
//       }));

//     }
// }, []);
    
// return( 
//   <div className='container'>
//     <Line data={ chartData }/> 
//   </div>
// )
    
// }


export default function DisplayLineChartTimeSeriesThreads({ data }: Props, { chartOptions }: Props) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart'
      },
      zoom: {
        pan: {
          // pan options and/or events
        },
        limits: {
          // axis limits
        },
        zoom: {
          // zoom options and/or events
        }
      }
    }
  },
 
  return (        
    <div style={{ width: '600px', height: '400px' }}>
        <Line data={data} options={chartOptions} />
    </div>
    );
}
