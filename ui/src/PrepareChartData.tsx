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
                backgroundColor: 'rgb(66, 92, 251)',
                borderColor: 'rgba(66, 92, 251, 0.2)',
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

function PrepareResponseTimeData(output:  String,
    chartResponseTimeData: ChartData, setChartResponseTimeData: React.Dispatch<React.SetStateAction<ChartData>>,
    ) {
        const timeMatch = output.match(/.*\+*in (\d\d:\d\d:\d\d)/);
        const averageResponseTime = output.match(/.*\+.*Avg:\s*(\d*)/);
        const minResponseTime = output.match(/.*\+.*Min:\s*(\d*)/);
        const maxResponseTime = output.match(/.*\+.*Max:\s*(\d*)/);

        
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const currentTime = `${hours}:${minutes}:${seconds}`;
        console.log(currentTime); // Output: e.g. "14:30:00"
        
        if (timeMatch && averageResponseTime && minResponseTime && maxResponseTime) {

            const time = currentTime;
            const avg = averageResponseTime[1];
            const min = minResponseTime[1];
            const max = maxResponseTime[1];

            setChartResponseTimeData(prevData => ({
                labels: [...prevData.labels, time],
                datasets: [
                {
                    label: 'Average Response Time',
                    data: Array.isArray(prevData.datasets[0]?.data) ? [...prevData.datasets[0].data, Number(avg)] : [Number(avg)],
                    fill: false,
                    backgroundColor: 'rgb(38, 115, 227)',
                    borderColor: 'rgba(38, 115, 227, 0.2)',
                },
                {
                    label: 'Min Response Time',
                    data: Array.isArray(prevData.datasets[1]?.data) ? [...prevData.datasets[1].data, Number(min)] : [Number(min)],
                    fill: false,
                    backgroundColor: 'rgb(96, 196,71)',
                    borderColor: 'rgba(96, 196,71, 0.2)',
                },
                {
                    label: 'Max Response Time',
                    data: Array.isArray(prevData.datasets[2]?.data) ? [...prevData.datasets[2].data, Number(max)] : [Number(max)],
                    fill: false,
                    backgroundColor: 'rgb(251, 176, 56)',
                    borderColor: 'rgba(251, 176, 56, 0.2)',
                },
                ],
            }));
        }


}

function PrepareErrorPercentageData(output:  String,
    chartErrorPercentageData: ChartData, setChartErrorPercentageData: React.Dispatch<React.SetStateAction<ChartData>>,
    ) {
        const timeMatch = output.match(/.*\+*in (\d\d:\d\d:\d\d)/);
        const errorPercentage = output.match(/.*\+.*Err:.*\((.*)\%\)/);

        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const currentTime = `${hours}:${minutes}:${seconds}`;
        console.log(currentTime); // Output: e.g. "14:30:00"
        
        if (timeMatch && errorPercentage) {

            const time = currentTime;
            const err = errorPercentage[1];

            setChartErrorPercentageData(prevData => ({
                labels: [...prevData.labels, time],
                datasets: [
                {
                    label: 'Error Percentage',
                    data: Array.isArray(prevData.datasets[0]?.data) ? [...prevData.datasets[0].data, Number(err)] : [Number(err)],
                    fill: false,
                    backgroundColor: 'rgb(251, 176, 56)',
                    borderColor: 'rgba(251, 176, 56, 0.2)',
                },
                ],
            }));
        }

}
export { 
    PrepareChartData, 
    PrepareSamplesData,
    PrepareResponseTimeData,
    PrepareErrorPercentageData
};