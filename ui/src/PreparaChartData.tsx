import React from "react";

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
}; 

export default function PrepareChartData( output:  String, chartData: ChartData, setChartData: React.Dispatch<React.SetStateAction<ChartData>>) { 
    //const [chartData, setChartData] = React.useState<ChartData>({ labels: [], datasets: [] });

    const timeMatch = output.match(/.*\+*in (\d\d:\d\d:\d\d)/);
    const activeMatch = output.match(/Active: (\d+)/);

    if (timeMatch && activeMatch) {
        
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const currentTime = `${hours}:${minutes}:${seconds}`;
        console.log(currentTime); // Output: e.g. "14:30:00"
        
        const time = currentTime;
        const active = activeMatch[1];
        console.log(time);
        console.log(active);
        
        setChartData(prevData => ({
            labels: [...prevData.labels, time],
            datasets: [
            {
                label: 'Active Threads',
                data: Array.isArray(prevData.datasets[0]?.data) ? [...prevData.datasets[0].data, Number(active)] : [Number(active)],
                fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.2)',
            },
            ],
    }));
    
}   
    return chartData;
}