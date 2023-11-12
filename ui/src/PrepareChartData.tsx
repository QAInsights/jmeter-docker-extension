import React from "react";
import { ChartData } from "./ChartData";

function PrepareChartData( output:  String, 
    chartData: ChartData, setChartData: React.Dispatch<React.SetStateAction<ChartData>>,
    ) { 
    
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
                backgroundColor: 'rgb(38, 115, 227)',
                borderColor: 'rgba(38, 115, 227, 0.2)',
            },
            ],
        }));
    }   
    return {
        chartData
    }
}

function PrepareSamplesData(output:  String, 
    chartSamplesData: ChartData, setChartSamplesData: React.Dispatch<React.SetStateAction<ChartData>>,
    ) {

        const timeMatch = output.match(/.*\+*in (\d\d:\d\d:\d\d)/);
        const transactionsMatch = output.match(/.*\+\s*(\d*)/);

        if (timeMatch && transactionsMatch) {
        
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const currentTime = `${hours}:${minutes}:${seconds}`;
            console.log(currentTime); // Output: e.g. "14:30:00"

            const time = currentTime;
            const active = transactionsMatch[1];

            setChartSamplesData(prevData => ({
                labels: [...prevData.labels, time],
                datasets: [
                {
                    label: 'Samples over Time',
                    data: Array.isArray(prevData.datasets[0]?.data) ? [...prevData.datasets[0].data, Number(active)] : [Number(active)],
                    fill: false,
                    backgroundColor: 'rgb(38, 115, 227)',
                    borderColor: 'rgba(38, 115, 227, 0.2)',
                },
                ],
            }));

        }

}

export { PrepareChartData, PrepareSamplesData };