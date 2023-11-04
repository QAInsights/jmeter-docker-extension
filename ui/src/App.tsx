import React, { useEffect, useRef } from 'react';
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
import CoffeeIcon from '@mui/icons-material/Coffee';
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
} from "@mui/material";

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
function validateInputs(imageName: string, testPlan: string, volumePath: string, resultsPath: string, logsPath: string) {
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
  
  ddClient.desktopUI.toast.success('Validated successfully.');
  return true;
  
}
async function runJMeter( testPlan: string, 
                          imageName: string, 
                          volumePath: string, proxyName: string, 
                          proxyPort: string, userName: string, password: string, 
                          jmeterPropertyFile1: string, jmeterPropertyFile2: string,
                          resultsPath: string, logsPath: string,
                          setIsTestRunning: boolean,
                          onOutput: (output: string) => void
                          ) {
  
  // Generate a unique ID for the results folder
  let resultsId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
  let reportPath = 'jmeter-reports-' + resultsId;

  const ddClient = useDockerDesktopClient(); 

  try {

        // Check for volume path, if empty then exit        
        // if (volumePath.length <= 0) {
        //   ddClient.desktopUI.toast.warning('Volume path is empty.');
        //   return;
        // }

        // Check whether user entered the image name or not
        // if (imageName.length <= 0) {
        //   ddClient.desktopUI.toast.warning('Image name is empty.');
        //   return;
        // }

        // Check for testPlan, if empty then exit
        // if (testPlan.length <= 0) {
        //   ddClient.desktopUI.toast.warning('Test Plan is empty.');
        //   return;
        // }

        // Check for logsPath, if empty then exit
        // if (logsPath.length <= 0) {
        //   ddClient.desktopUI.toast.warning('Logs path is empty.');
        //   return;
        // }

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
        // if (output.stderr.includes('next')) {
        //   ddClient.desktopUI.toast.success(output.stderr);
        // }

        // ddClient.desktopUI.toast.success(`Proxy Name: ${proxyName}`);
        // ddClient.desktopUI.toast.success(`Proxy Port: ${proxyPort}`);

        // Run JMeter Test inside a container  
    
        // let dockerArguments = `List of arguments: ${imageName} -v ${volumePath} \n`;
        // ddClient.desktopUI.toast.success(dockerArguments);

        // Get Container Volume Path by splitting the volume path using ':' as delimiter
        let volumePathArray = volumePath.split(':');
        // for (let i = 0; i < volumePathArray.length; i++) {
        //   ddClient.desktopUI.toast.success(volumePathArray[i]);
        // }
        let localResultsPath = volumePathArray[0];
        ddClient.desktopUI.toast.success(`Saving in path ${localResultsPath}`);

        let containerVolumePath = volumePathArray[1];
        // ddClient.desktopUI.toast.success(`Final path ${containerVolumePath}`);
        
        let testPlanPath = testPlan.split('/').pop();
        ddClient.desktopUI.toast.success(`Test Plan Path: ${testPlanPath}`);

        let fullTestPath = `${containerVolumePath}\/${testPlanPath}`;
        ddClient.desktopUI.toast.success(`Full Test Path: ${fullTestPath}`);
        // ddClient.desktopUI.toast.success(fullTestPath);

        // Prepare the base command arguments
        let cmdArgs = [
          "-d",
          "-v",
          volumePath,
          imageName,
          "-n",
          "-t",
          fullTestPath,

        ];

        if (proxyName) {
          cmdArgs.push("-H", proxyName);
        }
        if (proxyPort) {
          cmdArgs.push("-P", proxyPort);
        }
        if (userName) {
          cmdArgs.push("-u", userName);
        }
        if (password) {
          cmdArgs.push("-a", password);
        }
        if (jmeterPropertyFile1) {
          cmdArgs.push("-q", jmeterPropertyFile1);
        }
        if (jmeterPropertyFile2) {
          cmdArgs.push("-q", jmeterPropertyFile2);
        }
        if (resultsPath) {
          cmdArgs.push("-l", resultsPath);
          cmdArgs.push("-e", "-o", reportPath);

        }
        if (logsPath) {
          cmdArgs.push("-j", logsPath);
        }
        ddClient.desktopUI.toast.success(`Command Arguments: ${cmdArgs}`);

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

  const [outputLogs, setOutputLogs] = React.useState('');
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
  // const fetchAndDisplayResponse = async () => {
  //   const result = await ddClient.extension.vm?.service?.get('/hello');
  //   setResponse(JSON.stringify(result));
  // };

  const openExternalLink= (url: string) => {
    return ddClient.host.openExternal(
      url
    );
  };

  return (
    <>
    
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
                  <Grid item xs={12} sm={4}>
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
                  <Grid item xs={12} sm={4} width={ '100%'} sx={{flexWrap: 'nowrap'}}>
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
      <Stack direction="row" alignItems="start" spacing={1} sx={{ mt: 4 }}>
          <AccordionDetails sx={{ width: '100%' }}>
            <Card variant="outlined">
              <CardContent>
                <Grid item container columnSpacing={{ xs: 2 }}>
                  <Grid item xs={12} sm={4} width={ '100%'}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ArticleIcon /> 
                        <Typography variant="h6" gutterBottom noWrap> Property Files
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
                  <Grid item xs={12} sm={4} width={ '100%'}>
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
      </Stack>
      <Stack direction="row" alignItems="start" spacing={1} sx={{ mt: 4 }}>
        <AccordionDetails sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Stack direction="row" spacing={2}>
            <Button startIcon={<PlayArrowIcon />} variant="contained" color="primary"
              onClick={() => {
                clearTextFields();
                // setIsTestRunning(true);
                if (validateInputs(imageName || '', testPlan || '', volumePath || '', resultsPath || '', logsPath || '') == true){
                  setIsTestRunning(true);
                  runJMeter(testPlan || '', imageName || '', volumePath || '', 
                            proxyName || '', proxyPort || '', 
                            userName || '', password || '', 
                            jmeterPropertyFile1 || '', jmeterPropertyFile2 || '',
                            resultsPath || '', logsPath || '', 
                            true,
                            (output) => {
                              setOutputLogs(prevOutput => prevOutput + '\n' + output);
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

