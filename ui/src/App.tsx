import React, { useEffect, useRef } from 'react';
import { ChartData } from "./ChartData";
import { 
  PrepareChartData, 
  PrepareResponseTimeData, 
  PrepareSamplesData,
  PrepareErrorPercentageData,
  PrepareCpuUsageData,
  PrepareMemoryUsageData
 } from './PrepareChartData';
import { 
  DisplayLineChartTimeSeriesThreads, 
  DisplayLineChartTimeSeriesTransactions, 
  DisplayLineChartTimeSeriesResponseTime, 
  DisplayLineChartTimeSeriesErrorPercentage, 
  DisplayLineChartTimeSeriesCpuUsagePercentage, 
  DisplayLineChartTimeSeriesMemoryUsagePercentage
} from './PerformanceCharts';
import { validateMemory, validateMemoryReservation } from './validateMemory';

import IntroDialog from './IntroDialog'; 
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ArticleIcon from '@mui/icons-material/Article';
import OutputIcon from '@mui/icons-material/Output';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PasswordIcon from '@mui/icons-material/Password';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import CoffeeIcon from '@mui/icons-material/Coffee';
import MemoryIcon from '@mui/icons-material/Memory';
import InsightsIcon from '@mui/icons-material/Insights';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import darklogo from '../apache-jmeter-logo-dark.svg';
import lightlogo from '../apache-jmeter-logo-light.svg';

import { createDockerDesktopClient } from '@docker/extension-api-client';
import {
  AccordionDetails,
  Grid,
  Link,
  TextField,
  Typography,
  Card,
  CardContent,
  Checkbox,
  Box,
  Stack,
  FormGroup,
  FormControlLabel,
} from "@mui/material";


const options = {
  scales: {
    y: {
      min: 0
    },  
  },
  plugins: {
    zoom: {
      zoom: {
        limits: {
            y: {  min: 0  }
          },
        wheel: {
          enabled: true,
          speed: 0.1
        },          
        drag: { 
          enabled: true,
          threshold: 2,
          modifierKey: 'shift',
          drawTime: 'beforeDraw'
        },
        pinch: {
          enabled: true
        },
        mode: 'xy',
      }
    }
  }
};

const client = createDockerDesktopClient();
let containerId = '';

function useDockerDesktopClient() {
  return client;
}

async function terminateContainer(containerId: string) {    
    const ddClient = useDockerDesktopClient(); 

    // Terminate the container
    try {
      const destroyContainer = await ddClient.docker.cli.exec("rm", [
        "-f",
        containerId
      ]);
  
      if (destroyContainer.stdout) {
        ddClient.desktopUI.toast.warning(`Container ${containerId} terminated successfully.`);
      }
    } catch (error) {
      console.error(error);
    }
}

function validateInputs(imageName: string, testPlan: string, volumePath: string, 
                        resultsPath: string, logsPath: string,
                        setCpus: string, setCpuSet: string,
                        setMem: string, setMemreserve: string, 
                        setKernelMem: string, setOomKillDisable: boolean) {
  
  const ddClient = useDockerDesktopClient(); 

  // Check for required fields, if empty then exit  
  if (imageName.length <= 0) {
    ddClient.desktopUI.toast.warning('Image name is empty.');
    return false;
  }
  if (volumePath.length <= 0) {
    ddClient.desktopUI.toast.warning('Volume path is empty.');
    return false;
  }      
  if (testPlan.length <= 0) {
    ddClient.desktopUI.toast.warning('Test plan is empty.');
    return false;
  }
  if (logsPath.length <= 0) {
    ddClient.desktopUI.toast.warning('Logs path is empty.');
    return false;
  }
  if (resultsPath.length <= 0) {
    ddClient.desktopUI.toast.warning('Results path is empty.');
    return false;
  }
  else if(!resultsPath.includes('.')) {
    ddClient.desktopUI.toast.warning('Results path must contain a file with an extension.');
    return false;    
  }
  if (setCpuSet.trim().endsWith('-') || setCpuSet.trim().endsWith(',')) {
    ddClient.desktopUI.toast.warning('CPU Set cannot end with a hyphen or comma');
    return false;
  }
  if (setCpuSet.trim().startsWith('-') || setCpuSet.trim().startsWith(',')) {
    ddClient.desktopUI.toast.warning('CPU Set cannot start with a hyphen or comma');
    return false;
  } 
  
  // Check if memory is ending with b, k, m, g or not
  if (setMem.trim().length === 1 || setMemreserve.trim().length === 1 || setKernelMem.trim().length === 1) {
    const validEndings = ['b', 'k', 'm', 'g'];
    const invalidMem = !validEndings.includes(setMem.trim().slice(-1));
    const invalidMemReserve = !validEndings.includes(setMemreserve.trim().slice(-1));
    const invalidKernelMem = !validEndings.includes(setKernelMem.trim().slice(-1));
    
    if (invalidMem || invalidMemReserve || invalidKernelMem) {
      ddClient.desktopUI.toast.warning('Memory must end with b, k, m, or g');
      return false;
    }
  }

  if (setMem.length >= 2) {
    // Check if memory is at least 6m or 6000000b or 6000k or 0.006g
    if (!(validateMemory(setMem))) {
      ddClient.desktopUI.toast.warning(setMem);
      ddClient.desktopUI.toast.warning('Memory must be at least 6m or 6000000b or 6000k or 0.006g');
      return false;
    }
  }
  
  if (setMemreserve.length >= 2) {
    // Memory Reserve should be less than Memory
    if (!(validateMemoryReservation(setMem, setMemreserve))) {
      ddClient.desktopUI.toast.warning('Memory Reservation must be less than Memory');
      return false;
    }
  }

  if (setKernelMem.length >= 2) {
    // Check if kernel memory is less than memory
    if (!(validateMemory(setKernelMem))) {
      ddClient.desktopUI.toast.warning('Kernel Memory must be at least 6m or 6000000b or 6000k or 0.006g');
      return false;
    }
  }
  ddClient.desktopUI.toast.success('Validated successfully.');
  return true;
 
}

// async function extractActiveThreadsAndTime(output: string) {
//   // Sample output from JMeter
//   // summary +     79 in 00:00:18 =    4.5/s Avg:   220 Min:   102 Max:   353 Err:     0 (0.00%) Active: 1 Started: 1 Finished: 0

//   let activeThreads = output.match(/(?<=Active:)(.*)(?=Started)/g);
//   let time = output.match(/(?<=summary \+)(.*)(?=in)/g);

//   const ddClient = useDockerDesktopClient();

//   ddClient.desktopUI.toast.success(`Active Threads: ${activeThreads}`);

//   // Put time and active threads in a two dimensional array
  
//   if (time) {
//     timeAndActiveThreads.push(time[0]);
//     ddClient.desktopUI.toast.success(`Time and Active Threads: ${timeAndActiveThreads}`);
//   }
//   if (activeThreads) {
//     timeAndActiveThreads.push(activeThreads[0]);
//     ddClient.desktopUI.toast.success(`Time and Active Threads: ${timeAndActiveThreads}`);
//   }
  
//   return timeAndActiveThreads;

// }
async function runJMeter( testPlan: string, 
                          imageName: string, 
                          volumePath: string, proxyName: string, 
                          proxyPort: string, userName: string, password: string, 
                          jmeterPropertyFile1: string, jmeterPropertyFile2: string,
                          resultsPath: string, logsPath: string,
                          setIsTestRunning: boolean,
                          cpus: string, 
                          cpuSet: string,
                          mem: string, memreserve: string, 
                          kernelmem: string, oomkilldisable: boolean,
                          onOutput: (output: string) => void,
                          onCpuOutput: (cpuUsage: string) => void,
                          onMemOutput: (memUsage: string) => void,
                          ) {
  
  // Generate a unique ID for the results folder
  let resultsId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
  let reportPath = 'jmeter-reports-' + resultsId;

  const ddClient = useDockerDesktopClient(); 
  

  try {
      // Check whether resultsPath contains an extension `.`
      if (resultsPath.includes('.')) {
        // Split resultsPath to get the results file name
        let resultsPathArray = resultsPath.split('.');
        resultsPath = resultsPathArray[0] + '-' + resultsId + '.' + resultsPathArray[1];      
      }
      else {
        ddClient.desktopUI.toast.warning('Results must contain a file with extension.');
        return;
      }

        // Pull JMeter Image
      const output = await ddClient.docker.cli.exec("pull", [
        imageName
      ]);
      
      // ddClient.desktopUI.toast.success(`Out ${output.stdout}`);
      // ddClient.desktopUI.toast.success(`Err ${output.stderr}`);

      if (output.stdout.includes('up to date')) {
        ddClient.desktopUI.toast.success('JMeter image pulled successfully and it is up to date.');
      } else {
        ddClient.desktopUI.toast.warning('The specified Docker image could not be found. Please check if the image exists on Docker Hub or locally, and try again.');
      }
      
      // Get Container Volume Path by splitting the volume path using ':' as delimiter
      let volumePathArray = volumePath.split(':');
      
      let localResultsPath = volumePathArray[0];
      ddClient.desktopUI.toast.success(`Saving in path ${localResultsPath}`);

      let containerVolumePath = volumePathArray[1];
      // ddClient.desktopUI.toast.success(`Final path ${containerVolumePath}`);
      
      let testPlanPath = testPlan.split('/').pop();
      ddClient.desktopUI.toast.success(`Test Plan Path: ${testPlanPath}`);

      let fullTestPath = `${containerVolumePath}\/${testPlanPath}`;
      ddClient.desktopUI.toast.success(`Full Test Path: ${fullTestPath}`);
      // ddClient.desktopUI.toast.success(fullTestPath);
      
      // Prepare the docker arguments
      let dockerArgs = [
        "-d",
        "-v",
        volumePath,          
      ];
      // Push CPUs before imageName, if empty set to 1
      if (cpus.length <= 0) {
        cpus = '1';
        dockerArgs.push("--cpus", cpus);
      }
      else {
        dockerArgs.push("--cpus", cpus);
      }
      if (cpuSet.length > 0) {
        dockerArgs.push("--cpuset-cpus", cpuSet);
      }
      if (mem.length >= 2) {
        dockerArgs.push("--memory", mem);
      }
      if (memreserve.length >= 2) {
        dockerArgs.push("--memory-reservation", memreserve);
      }
      if (kernelmem.length >= 2) {
        dockerArgs.push("--kernel-memory", kernelmem);
      }
      if (oomkilldisable) {
        dockerArgs.push("--oom-kill-disable");
      }

      // Push image name
      dockerArgs.push(imageName);
      //ddClient.desktopUI.toast.success(`Docker Command Arguments: ${dockerArgs}`);

      // Prepare the JMeter arguments
      let jMeterArgs = [
        "-n",
        "-t",
        fullTestPath,
      ];

      if (proxyName) {
        jMeterArgs.push("-H", proxyName);
      }
      if (proxyPort) {
        jMeterArgs.push("-P", proxyPort);
      }
      if (userName) {
        jMeterArgs.push("-u", userName);
      }
      if (password) {
        jMeterArgs.push("-a", password);
      }
      if (jmeterPropertyFile1) {
        jMeterArgs.push("-q", jmeterPropertyFile1);
      }
      if (jmeterPropertyFile2) {
        jMeterArgs.push("-q", jmeterPropertyFile2);
      }
      if (resultsPath) {
        jMeterArgs.push("-l", resultsPath);
        jMeterArgs.push("-e", "-o", reportPath);

      }
      if (logsPath) {
        jMeterArgs.push("-j", logsPath);
      }
            
      // Combine the docker and JMeter arguments
      let cmdArgs = dockerArgs.concat(jMeterArgs);      

      // Run JMeter Test inside a container       
      const runJMeterTestInsideAContainer = await ddClient.docker.cli.exec("run", cmdArgs);        

      // Check for container ID, if empty then exit
      if (runJMeterTestInsideAContainer.stdout) {
        ddClient.desktopUI.toast.success(`Container ID is ${runJMeterTestInsideAContainer.stdout}`);   
        containerId = runJMeterTestInsideAContainer.stdout.trim();     
      }
      if (runJMeterTestInsideAContainer.stderr){
        ddClient.desktopUI.toast.error(`Error creating container ${runJMeterTestInsideAContainer.stderr} please check Docker daemon logs.`);
        return;
      }     
      
      // Follow the logs of the container
      let containerArgs = [
        "-f"
      ];

      containerArgs.push(runJMeterTestInsideAContainer.stdout.trim());

      // Stream docker logs
      const getLogs = await ddClient.docker.cli.exec("logs", containerArgs, {
        stream: {
          onOutput(data): void {
              if (data.stdout) {
                onOutput("🖨️ " + data.stdout);
              }
              if (data.stderr) {
                onOutput("🛑 " + data.stderr);
              }               
          },
          onError(error: any): void {
            console.error(error);
          },
          onClose(exitCode: number): void {
            console.log("onClose with exit code " + exitCode);
          },
      },
    });
      //   const getLogs = await ddClient.docker.cli.exec("logs", containerArgs, {
        //     stream: {
        //       onOutput(data): void {
        //           const output = JSON.stringify(
        //             {
        //               stdout: data.stdout,
        //               stderr: data.stderr,
        //             },
        //             null              );
        //           // ddClient.desktopUI.toast.success(output);  
        //           onOutput(output);
                  
        //       },
        //       onError(error: any): void {
        //         console.error(error);
        //       },
        //       onClose(exitCode: number): void {
        //         console.log("onClose with exit code " + exitCode);
        //       },
        //   },
        // });
    const isContainerRunning = async (containerId: string) => {
      const { stdout } = await ddClient.docker.cli.exec("inspect", ["-f", "{{.State.Running}}", containerId]);
      return stdout.trim() === 'true';
    };
    // Check every second if container is still running
    let isRunning = await isContainerRunning(containerId);
    
    while (isRunning) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      isRunning = await isContainerRunning(containerId);
      // ddClient.desktopUI.toast.success(`Container is running ${isRunning}`);

      // get container cpu usage
      const cpuUsage  = await ddClient.docker.cli.exec("stats", ["--no-stream", "--format", "{{.CPUPerc}}", containerId]);
      onCpuOutput(cpuUsage.stdout);

      // get container memory usage
      const memUsage = await ddClient.docker.cli.exec("stats", ["--no-stream", "--format", "{{.MemPerc}}", containerId]);
      onMemOutput(memUsage.stdout);

    }
    setIsTestRunning = isRunning;      
    
    // Copy files from the container to the host
    const copyFilesFromContainer = await ddClient.docker.cli.exec("cp", [
      `${containerId}:/jmeter/${reportPath}`,
      localResultsPath,
    ]);
    ddClient.desktopUI.toast.success(`The test has completed. The generated report can be found at ${localResultsPath}`);        
  } 

  catch (error) {
    ddClient.desktopUI.toast.error((error as any).stderr + "\nIf you think this is a bug, please report it.");
  }
  
}

export function App() {
  const [response, setResponse] = React.useState<string>();
  const [imageName, setImageName] = React.useState('qainsights/jmeter:latest');
  const [volumePath, setVolumePath] = React.useState<string>();
  const [proxyName, setProxyName] = React.useState<string>();
  const [proxyPort, setProxyPort] = React.useState<string>();
  const [userName, setUserName] = React.useState<string>();
  const [password, setPassword] = React.useState<string>();
  const [jmeterPropertyFile1, setJMeterPropertyFile1] = React.useState<string>();
  const [jmeterPropertyFile2, setJMeterPropertyFile2] = React.useState<string>();
  const [testPlan, setTestPlan] = React.useState<string>();
  const [resultsPath, setResultsPath] = React.useState<string>();
  const [logsPath, setLogsPath] = React.useState<string>();
  const [isTestRunning, setIsTestRunning] = React.useState<boolean>(false);
  
  const [cpus, setCpus] = React.useState<string>();
  const [cpuSet, setCpuSet] = React.useState<string>();  

  const [mem, setMem] = React.useState<string>();
  const [memreserve, setMemoryReserve] = React.useState<string>();
  const [kernelmem, setKernelMem] = React.useState<string>();
  const [oomkilldisable, setOomKillDisable] = React.useState<boolean>(false);

  const [outputLogs, setOutputLogs] = React.useState('');

  const chartRef = useRef<any>(null);
  const chartRef2 = useRef<any>(null);
  const chartRef3 = useRef<any>(null);
  const chartRef4 = useRef<any>(null);
  const chartRef5 = useRef<any>(null);
  const chartRef6 = useRef<any>(null);
  
  const [chartData, setChartData] = React.useState<ChartData>({ labels: [], datasets: [] });
  const [chartSamplesData, setChartSamplesData] = React.useState<ChartData>({ labels: [], datasets: [] });
  const [chartResponseTimeData, setChartResponseTimeData] = React.useState<ChartData>({ labels: [], datasets: [] });
  const [chartErrorPercentageData, setChartErrorPercentageData] = React.useState<ChartData>({ labels: [], datasets: [] });
  const [chartCpuUsageData, setChartCpuUsageData] = React.useState<ChartData>({ labels: [], datasets: [] });
  const [chartMemoryUsageData, setChartMemoryUsageData] = React.useState<ChartData>({ labels: [], datasets: [] });

  const [running, setRunning] = React.useState<boolean>(false); 

  const outputLogsRef = useRef<HTMLTextAreaElement>(null);

  const isDarkModeEnabled = useMediaQuery('(prefers-color-scheme: dark)');
  const logos = isDarkModeEnabled ? darklogo : lightlogo;

  const linkGitHub="https://github.com/qainsights/jmeter-docker-extension?utm_source=dockerextension";
  const linkQainsights="https://qainsights.com/?utm_source=dockerextension";
  const linkPersonalLink="https://naveenkumar.pro/?utm_source=dockerextension"
  const linkDonate="https://www.buymeacoffee.com/qainsights?utm_source=dockerextension";
  const linkYoutube="https://youtube.com/playlist?list=PLJ9A48W0kpRIjLkZ32Do9yDZXnnm7_uj_&si=ETuBF2rc9JDCi-iU&utm_source=dockerextension";

  const ddClient = useDockerDesktopClient();  

  useEffect(() => {
    if (outputLogsRef.current) {
      outputLogsRef.current.scrollTop = outputLogsRef.current.scrollHeight;
    }
  }, [outputLogs]);

  function clearTextFields() {
    // Clear output text field 
    setOutputLogs('');
  }

  function handleResetZoom() {
    chartRef?.current?.resetZoom();
    chartRef2?.current?.resetZoom();
    chartRef3?.current?.resetZoom();
    chartRef4?.current?.resetZoom();
    chartRef5?.current?.resetZoom();
    chartRef6?.current?.resetZoom();
  };

  const openExternalLink= (url: string) => {
    return ddClient.host.openExternal(
      url
    );
  };

 
  return (
    <>
     <IntroDialog /> 
      <br />
      <br />
      <div style={{textAlign: 'center'}}>
        <img src={ logos } alt="Apache JMeter Logo" style={{ maxWidth: '100%', height: 'auto' }} />
      </div>
      {/* <Typography variant="h3" sx={{textAlign: 'center'}}>Apache JMeter</Typography> */}
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        Run load tests using Apache JMeter inside Docker Desktop.
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        Customize the JMeter test by adding the JMeter properties and hit the button to run the test. New to JMeter? Check out this&nbsp;
        <Link href="#" 
          onClick={() => {
            openExternalLink(linkYoutube);
          }}
        >free YouTube playlist</Link>.
      </Typography>
     
      <Stack direction="row" alignItems="start" spacing={1} sx={{ mt: 4 }}>
        <AccordionDetails sx={{ width: '100%' }}>
            <Card variant="outlined">
              <CardContent>
                <Grid item container columnSpacing={{ xs: 2 }}>
                  <Grid item xs={12} sm={4} width={ '100%'} sx={{flexWrap: 'nowrap'}}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ListAltIcon />
                        <Typography variant="h6" gutterBottom noWrap> Image and Volume
                        </Typography>
                      </Stack>
                      <TextField
                        label="JMeter Image"
                        helperText="JMeter image e.g. qainsights/jmeter:latest"
                        fullWidth
                        variant="outlined"
                        minRows={1}
                        defaultValue="qainsights/jmeter:latest"
                        value={imageName ?? ''}
                        required
                        // disabled
                        onChange={(image) => setImageName(image.target.value.trim())}
                      />
                      <TextField
                        label="JMeter Tests Volume"
                        helperText="JMeter Tests Volume e.g. /path/to/tests:/jmeter-tests"
                        fullWidth
                        variant="outlined"
                        minRows={1}
                        placeholder='/path/to/tests:/jmeter-tests'
                        value={volumePath ?? ''}
                        required
                        onChange={(vol) => setVolumePath(vol.target.value.trim())}
                      />
                  </Grid>                
                  <Grid item xs={12} sm={4} width={ '100%'} sx={{flexWrap: 'nowrap'}} >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        < CheckBoxIcon />
                        <Typography variant="h6" gutterBottom noWrap>
                          Test Plan
                        </Typography>
                      </Stack>
                    <TextField
                      label="JMeter Test Plan"
                      helperText="JMeter Test Plan e.g. /jmeter-tests/CSVSample.jmx"
                      fullWidth
                      variant="outlined"
                      minRows={1}
                      value={testPlan ?? ''}
                      required
                      // disabled
                      onChange={(testPlan) => setTestPlan(testPlan.target.value.trim())}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </AccordionDetails>
      </Stack>
      <Stack direction="row" alignItems="start" spacing={1} sx={{ mt: 4 }} >
        <AccordionDetails sx={{ width: '100%' }}>
          <Card variant="outlined">
            <CardContent>
              <Grid item container columnSpacing={{ xs: 2 }} >
                <Grid item xs={12} sm={6} width={ '100%'} sx={{flexWrap: 'nowrap'}}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ArticleIcon /> 
                      <Typography variant="h6" gutterBottom noWrap> 
                        Property Files
                      </Typography>
                    </Stack>
                    <TextField
                        label="JMeter Properties 1"
                        helperText="Add JMeter property file e.g. /jmeter-tests/loadtest.properties"
                        fullWidth
                        variant="outlined"
                        minRows={1}
                        placeholder='/jmeter-tests/loadtest.properties'
                        defaultValue="/jmeter-tests/loadtest.properties"
                        value={jmeterPropertyFile1 ?? ''}
                        onChange={(jmProp1) => setJMeterPropertyFile1(jmProp1.target.value.trim())}
                      /> 
                    <TextField
                      label="JMeter Properties 2"
                      helperText="Add an additional JMeter property file"
                      fullWidth
                      variant="outlined"
                      minRows={1}
                      placeholder='/jmeter-tests/global.properties'
                      value={jmeterPropertyFile2 ?? ''}
                      onChange={(jmProp2) => setJMeterPropertyFile2(jmProp2.target.value.trim())}
                      /> 
                    <Stack direction="row" alignItems="center" spacing={1}>
                    <OutputIcon /> 
                      <Typography variant="h6" gutterBottom noWrap>    
                      Logs and Results
                      </Typography>
                    </Stack>  
                    
                  <TextField
                      label="Logs"
                      helperText="Add Logs path e.g. /jmeter-tests/run.log"
                      fullWidth
                      variant="outlined"
                      minRows={1}
                      required
                      defaultValue="/jmeter-logs/run.log"
                      placeholder='/jmeter-logs/run.log'
                      value={logsPath ?? ''}
                      onChange={(logsPath) => setLogsPath(logsPath.target.value.trim())}
                    /> 
                  <TextField
                    label="Results"
                    helperText="Add Results path e.g. /jmeter-tests/result.jtl"
                    fullWidth
                    variant="outlined"
                    minRows={1}
                    required
                    defaultValue="/jmeter-logs/result.jtl"
                    placeholder='/jmeter-logs/result.jtl'
                    value={resultsPath ?? ''}
                    onChange={(resultsPath) => setResultsPath(resultsPath.target.value.trim())}
                    /> 
                    
                </Grid>
                <Grid item xs={12} sm={6} width={ '100%'} sx={{flexWrap: 'nowrap'}}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CompareArrowsIcon /> 
                      <Typography variant="h6" gutterBottom noWrap>    
                      Proxy                        
                      </Typography>
                    </Stack>
                    {/* Add JMeter properties */}
                      <TextField
                        label="JMeter Proxy Host"
                        helperText="Host name or IP address of the proxy server e.g. host.docker.internal"
                        fullWidth
                        variant="outlined"
                        minRows={1}
                        defaultValue="host.docker.internal"
                        value={proxyName ?? ''}
                        onChange={(proxy) => setProxyName(proxy.target.value.trim())}
                      />
                      <TextField
                        label="JMeter Proxy Port"
                        helperText="Port of the proxy server e.g. 80"
                        fullWidth
                        variant="outlined"
                        minRows={1}
                        defaultValue="80"                            
                        value={proxyPort ?? ''}
                        onChange={(portNumber) => setProxyPort(portNumber.target.value.trim())}
                      />
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PasswordIcon /> 
                        <Typography variant="h6" gutterBottom noWrap>    
                        Proxy Credentials                        
                        </Typography>
                      </Stack>                          
                      {/* Add username and password for proxy */}
                      <TextField
                        label="JMeter Proxy Username"
                        helperText="Username for the proxy server e.g. admin"
                        fullWidth
                        variant="outlined"
                        minRows={1}
                        defaultValue="naveenkumar"
                        value={userName ?? ''}
                        onChange={(user) => setUserName(user.target.value.trim())}
                      />
                      <TextField
                        label="JMeter Proxy Password"
                        helperText="Password for the proxy server e.g. supercrypticpassword"
                        fullWidth
                        variant="outlined"
                        minRows={1}
                        defaultValue="80"
                        value={password ?? ''}
                        onChange={(passwrd) => setPassword(passwrd.target.value.trim())}
                        type="password"
                      />
                </Grid>                      
              </Grid>                    
            </CardContent>
          </Card>
        </AccordionDetails>
        <AccordionDetails sx={{ width: '100%' }}>
          <Card variant="outlined">
            <CardContent>
              <Grid item container columnSpacing={{ xs: 2 }}>                
                  <Grid item xs={12} sm={6} width={ '100%'} sx={{flexWrap: 'nowrap'}}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AutoAwesomeMosaicIcon /> 
                        <Typography variant="h6" gutterBottom noWrap>    
                        Container CPU                        
                        </Typography>
                      </Stack>
                      {/* Add JMeter properties */}
                        <TextField
                          label="CPUs"
                          helperText="Available CPU resources a container e.g. 1.5"
                          fullWidth
                          variant="outlined"
                          minRows={1}
                          placeholder="1"
                          defaultValue="1"
                          value={cpus ?? ''}
                          onChange={(cpus) => {
                            let value = cpus.target.value.trim();
                            if (/^\d*\.?\d*$/.test(value)) {
                              setCpus(value);
                            }                            
                          }}
                        />
                        <TextField
                          label="CPU Set"
                          helperText="Limit the CPUs or cores a container can use e.g. 0-3, 0,1"
                          fullWidth
                          variant="outlined"
                          minRows={1}
                          value={cpuSet ?? ''}
                          onChange={(cpuSet) => {
                            // reg ex to accept only numbers and comma or hyphen or space between numbers, user should be able to type only numbers, comma, hyphen and space
                            let value = cpuSet.target.value.trim();
                            if (/^[0-9,\-\s]*$/.test(value)) {
                              setCpuSet(value);
                            }
                          }}
                        />                        
                  </Grid>
                  <Grid item xs={12} sm={6} width={ '100%'} sx={{flexWrap: 'nowrap'}}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MemoryIcon /> 
                      <Typography variant="h6" gutterBottom noWrap>    
                      Container Memory                        
                      </Typography>
                    </Stack>
                    {/* Add Container Memory Settings properties */}
                      <TextField
                        label="Memory"
                        helperText="Maximum amount of memory the container can use e.g. 6m"
                        fullWidth
                        variant="outlined"
                        minRows={1}
                        placeholder='6m'
                        value={mem ?? ''}
                        onChange={ (mem) => {
                          // accept only numbers ending with b, k, m, g
                          let value = mem.target.value.trim();
                          if (/^\d*[bkmg]?$/.test(value)) {
                            setMem(value);
                          }
                        }}
                      />
                      <TextField
                        label="Memory Reservation"
                        helperText="Specify a soft limit smaller than memory e.g. 4m"
                        fullWidth
                        variant="outlined"
                        minRows={1}
                        placeholder='4m'                        
                        value={memreserve ?? ''}
                        onChange={ (memreserve) => {
                          // accept only numbers ending with b, k, m, g
                          let value = memreserve.target.value.trim();
                          if (/^\d*[bkmg]?$/.test(value)) {
                            setMemoryReserve(value);
                          }
                        }}                      
                      />
                      <TextField
                        label="Kernel Memory"
                        helperText="Maximum amount of kernel memory the container can use e.g. 6m"
                        fullWidth
                        variant="outlined"
                        minRows={1}
                        placeholder='6m'
                        value={kernelmem ?? ''}
                        onChange={ (kernelmem) => {
                          // accept only numbers ending with b, k, m, g
                          let value = kernelmem.target.value.trim();
                          if (/^\d*[bkmg]?$/.test(value)) {
                            setKernelMem(value);
                          }                    
                        }}
                      />
                      {/* Add checkbox to enable/disable oom-kill-disable */}
                      <FormGroup>
                        <FormControlLabel 
                        name='oom-kill-disable'
                        control={<Checkbox />} 
                        label="OOM Kill Disable" 
                        onChange={ (oomkilldisable) => {
                          const isChecked = (oomkilldisable.target as HTMLInputElement).checked;
                          if (isChecked) {
                            setOomKillDisable(true);
                          }
                          else {
                            setOomKillDisable(false);
                          }
                          }                          
                        }
                        />
                      </FormGroup>
                      
                </Grid>   
                </Grid>
              </CardContent>
          </Card>
        </AccordionDetails>
      </Stack>
      
      <Stack direction="row" alignItems="start" spacing={1} sx={{ mt: 4 }}>
        <AccordionDetails sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Stack direction="row" spacing={2}>
            <Button startIcon={<PlayArrowIcon />} variant="contained" color="primary"
              onClick={() => {
                clearTextFields();
                // setIsTestRunning(true);
                if (validateInputs(imageName || '', testPlan || '', volumePath || '', resultsPath || '', logsPath || '', cpus || '', cpuSet || '', mem || '', memreserve || '', kernelmem || '', oomkilldisable || false) == true){
                  setIsTestRunning(true);
                  runJMeter(testPlan || '', imageName || '', volumePath || '', 
                            proxyName || '', proxyPort || '', 
                            userName || '', password || '', 
                            jmeterPropertyFile1 || '', jmeterPropertyFile2 || '',
                            resultsPath || '', logsPath || '',                             
                            true,
                            cpus || '', cpuSet || '',
                            mem || '', memreserve || '', kernelmem || '', 
                            oomkilldisable || false,
                            (output) => {
                              setOutputLogs(prevOutput => prevOutput + '\n' + output); 
                              async function handleDataPreparation() {
                                PrepareChartData(output, chartData, setChartData);
                                PrepareSamplesData(output, chartSamplesData, setChartSamplesData);
                                PrepareResponseTimeData(output, chartResponseTimeData, setChartResponseTimeData);
                                PrepareErrorPercentageData(output, chartErrorPercentageData, setChartErrorPercentageData);                                
                              }
                              handleDataPreparation();
                            },
                            (cpuUsage) => {
                              PrepareCpuUsageData(cpuUsage, chartCpuUsageData, setChartCpuUsageData);
                            },
                            (memUsage) => {
                              PrepareMemoryUsageData(memUsage, chartMemoryUsageData, setChartMemoryUsageData);
                            }                       
                  );
                }
                else {
                  setIsTestRunning(false);
                }
            }
          }
        >
              Run JMeter Test
            </Button>
            <Tooltip title="Terminates the test; all the test results will be lost." color="error">
              <Button startIcon={<StopCircleIcon />} variant="contained" color="error"
                onClick={() => {
                  terminateContainer(containerId);
                }}
                disabled={!isTestRunning}
              >
                Terminate Test
              </Button>
            </Tooltip>
          </Stack>
        </AccordionDetails>
      </Stack>
      
      <Stack direction="row" alignItems="start" spacing={1} sx={{ mt: 4 }}>
        <AccordionDetails sx={{ width: '100%' }}>
          <TextField            
            label="Console Logs"
            multiline
            rows={10}
            value={outputLogs}
            variant="outlined"
            sx={{ width: '100%' }}
            InputProps={{
              readOnly: true,
              inputRef: outputLogsRef,
            }}
          />
        </AccordionDetails>        
      </Stack> 
        {/* Display the line charts */}   

        <Stack direction="row">
    <AccordionDetails sx={{ width: '100%' }}>  
      <Card variant="outlined">
        <CardContent>
          <Grid container  direction="row"  justifyContent="space-between"  alignItems="center" >
            <Grid item xs={12} sm={4} width={ '100%'} sx={{flexWrap: 'nowrap'}}>
              <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" gutterBottom noWrap> Runtime Dashboard
                  </Typography><br/>                  
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2, textAlign: 'left' }}>
                  <span>
                    💡 Hold Shift key to pan in/out the chart. <br/>💡 Reset Zoom will reset zoom level in all the charts.
                  </span>
                  </Typography>
              </Stack>
            </Grid>
            
          </Grid>
        </CardContent>
      </Card>
    </AccordionDetails>
  </Stack>

      <Grid container direction="row" justifyContent="flex-end" alignItems="center">
        <Stack  direction="row" alignItems="center" spacing={1}>
          <AccordionDetails sx={{ width: '100%' }}>
            <Button variant="contained" 
            onClick={handleResetZoom}  
            >
              Reset Zoom
            </Button> 
          </AccordionDetails>                
        </Stack>
      </Grid>
      
      

      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <AccordionDetails sx={{ width: '100%' }}>
            <DisplayLineChartTimeSeriesThreads data={chartData} options={{...options, maintainAspectRatio: false, responsive: true, aspectRatio: 1}} chartRef={chartRef}/>
          </AccordionDetails>
        </Grid>
        <Grid item xs={12} md={4}>
          <AccordionDetails sx={{ width: '100%' }}>          
            <DisplayLineChartTimeSeriesTransactions data={chartSamplesData} options={{...options, maintainAspectRatio: false, responsive: true, aspectRatio: 1}}  chartRef={chartRef2}/>
          </AccordionDetails>
        </Grid>
        <Grid item xs={12} md={4}>
          <AccordionDetails sx={{ width: '100%' }}>
            <DisplayLineChartTimeSeriesResponseTime data={chartResponseTimeData} options={{...options, maintainAspectRatio: false, responsive: true, aspectRatio: 1}}  chartRef={chartRef3}/>          
          </AccordionDetails>        
        </Grid>
      </Grid>

      <Grid container spacing={1} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <AccordionDetails sx={{ width: '100%' }}>
            <DisplayLineChartTimeSeriesErrorPercentage data={chartErrorPercentageData} options={{...options, maintainAspectRatio: false, responsive: true, aspectRatio: 1}}  chartRef={chartRef4}/>
          </AccordionDetails>
        </Grid>
        <Grid item xs={12} md={4}>
          <AccordionDetails sx={{ width: '100%' }}>
            <DisplayLineChartTimeSeriesCpuUsagePercentage data={chartCpuUsageData} options={{...options, maintainAspectRatio: false, responsive: true, aspectRatio: 1}}  chartRef={chartRef5}/>
          </AccordionDetails>
        </Grid>
        <Grid item xs={12} md={4}>
          <AccordionDetails sx={{ width: '100%' }}>
            <DisplayLineChartTimeSeriesMemoryUsagePercentage data={chartMemoryUsageData} options={{...options, maintainAspectRatio: false, responsive: true, aspectRatio: 1}}  chartRef={chartRef6}/>
          </AccordionDetails>
        </Grid>
      </Grid>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 4 }}>
            <AccordionDetails sx={{ width: '100%' }}>
            <Grid container style={{ padding: "4rem", width: "100%" }}>
              <Box
                style={{ width: "100%" }}
                sx={{ py: 3, px: 3, borderRadius: 5, boxShadow: 6, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <Stack
                  direction="row"
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      style={{
                        display: "block",
                        marginRight: "auto",
                        marginLeft: "auto",
                        alignContent: "center",
                      }}
                      textAlign='center'
                    >
                      Check out the&nbsp;
                      <Link href="#" 
                        onClick={() => {
                          openExternalLink(linkGitHub);
                        }}
                      >       
                        GitHub repo to report issues or contribute
                      </Link>
                      .&nbsp;Created by&nbsp;
                      <Link href="#" 
                        onClick={() => {
                          openExternalLink(linkPersonalLink);
                        }}
                      >
                          NaveenKumar Namachivayam
                        </Link>
                        .<br/>A&nbsp;
                        <Link href="#" 
                        onClick={() => {
                          openExternalLink(linkQainsights);
                        }}
                      >
                          QAInsights
                        </Link>

                        <Typography sx={{ display: 'inline-flex', alignItems: 'center' }} textAlign='center'>
                          &nbsp;project.<CoffeeIcon sx={{ fontSize: '1.2rem', marginLeft: '0.2rem' }} /> 
                        </Typography>
                        &nbsp;
                      <Link href="#" 
                        onClick={() => {
                          openExternalLink(linkDonate);
                        }}
                        >
                        Buy me a coffee
                        </Link>    
                      .
                    </Typography>
                  </Box>
                </Stack>
              </Box>
          </Grid>
        </AccordionDetails>
      </Stack>                
    </>
  );
}
function exec(cmd: string, arg1: (error: any, stdout: any, stderr: any) => void) {
  throw new Error('Function not implemented.');
}
