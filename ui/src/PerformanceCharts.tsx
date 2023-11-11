import { useEffect, useState } from 'react';
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

export default function DisplayLineChartTimeSeriesThreads(rawData: any) {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    useEffect(() => {
        // Replace this with your code to fetch the output
        const output = 'summary +     79 in 00:00:18 =    4.5/s Avg:   220 Min:   102 Max:   353 Err:     0 (0.00%) Active: 1 Started: 1 Finished: 0';
    
        const timeMatch = output.match(/in (\d\d:\d\d:\d\d)/);
        const activeMatch = output.match(/Active: (\d+)/);
    
        if (timeMatch && activeMatch) {
          const time = timeMatch[1];
          const active = activeMatch[1];
    
        setChartData(prevData => {
            const newLabels = [...prevData.labels, time];
            const newData = [...(prevData.datasets[0]?.data || []), active];
            const newDataset = {
                label: 'Active Threads',
                data: newData,
                fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.2)',
            };
            return {
                labels: newLabels,
                datasets: [newDataset],
            };
        });
        }
      }, []);  // Update the dependency array as needed
    
      return <Line data={chartData} options={{ maintainAspectRatio: false }} />;
    
}

// export default function DisplayLineChartTimeSeriesThreads(rawData: any) {
//     const [open, setOpen] = useState(false);
//     const options = {
//         maintainAspectRatio: false,
//         responsive: true,
//         plugins: {
//           legend: {
//             position: 'top' as const,
//           },
//           title: {
//             display: true,
//             text: 'Time vs Active Threads',
//           },
//         },
//       };

//     const data = {
//         labels: ['1', '2', '3', '4', '5', '6'],
//         datasets: [
//           {
//             label: 'Dataset 1',
//             data: rawData,
//             fill: false,
//             backgroundColor: 'rgb(255, 99, 132)',
//             borderColor: 'rgba(255, 99, 132, 0.2)',
//           },
//         ],
//       };
    
//       return (        
//         <div style={{ width: '600px', height: '400px' }}>
//             <Line data={data} options={options} />
//         </div>
//        );
// }
