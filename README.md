# Simlyn - Connecting IOTA with Microsoft Azure

There is no doubt that both Microsoft Azure and IOTA will play crucial roles in the upcoming Internet of Things (IoT) area. Both platforms enable unique solutions to make sure that large data can be handled in a secured and scaled manner. Simlyn connects both platforms by demonstrating a proof of concept which can be applied to the real world: Data provided by a physical hardware device is sent to the cloud. A web application simulates a provider consumer model using IOTA's Flash library. All flash channel transactions are stored in a NoSQL database which serves as the source for a machine algorithm demo.

Some people asked me to show a quick demo of Simlyn. I published a [YouTube video](https://youtu.be/DZvTg52JB04) which walks you through  the basic steps. There is also a [demo](https://iotawsflashpoc.azurewebsites.net/) in offline mode of the web app available.

Simlyn is open and an ongoing task. Feel free to create a pull request or create an issue if you have any questions :thumbsup:

![Simlyn Web App](https://raw.githubusercontent.com/chris-to-pher/Simlyn/master/Screenshots/Simlyn_WebApp%20-%20New.JPG)

![Simlyn Raspberry Pi 3](https://raw.githubusercontent.com/chris-to-pher/Simlyn/master/Screenshots/Simlyn%20Raspberry%20Pi.JPG)

## Architecture

![Simlyn Architecture Diagram](https://raw.githubusercontent.com/chris-to-pher/Simlyn/master/Screenshots/Simlyn_Architecture.jpg)

From an architecture perspective, Simlyn consists of six independent parts:

- **Raspberry Pi 3**: Physical hardware device connected to a Bosch BME280 sensor
- **IoT Hub**: Enables reliable bidirectional communications between IoT devices
- **Node Web App**: Provides Flash Channel support using flash.lib.js, acts as frontend solution
- **Web API**: .NET Core Web API to handle database calls
- **Cosmos DB**: NoSQL Database for low latency and massively scalable applications
- **Power BI**: Business tool that providesreal-time analytic support

## How does Simlyn work?
Windows 10 IoT Core is running on a a Raspberry Pi 3. The device sends temperature and humidity data to a an [Azure IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/) using the MQTT protocol. Incoming traffic is routed to a Node web application deployed in Azure. The web app implements IOTA' s [Flash Library](https://github.com/iotaledger/iota.flash.js) to handle bi-directional off-Tangle payment channels. Furthermore, the app shows graphical output using the [chart.js](https://github.com/chartjs) and [Bootstrap](https://github.com/twbs/bootstrap) frameworks. Another link between IOTA and Azure is a No-SQL database ([Azure Cosmos DB](https://azure.microsoft.com/en-us/services/cosmos-db/)) that stores flash channel transactions. Since Cosmos DB enables low latency, the data could be used for Machine Learning scenarios, graphical demos, or even live billing analysis. I connected Power BI to demonstrate a simple way to show graphical output of the Flash Channel transactions.

## Requirements
If you want to run Simlyn, please make sure that you have

-	Microsoft Azure Subscription (start [here](https://azure.microsoft.com/en-us/free/) to register a free subscription)
-	Visual Studio 2017 ([free community edition](https://www.visualstudio.com/downloads/) is perfectly fine for this demo)
-	[Node](https://nodejs.org/en/), [NPM](https://www.npmjs.com/get-npm), [.NET Core 2.0](https://www.microsoft.com/net/download/windows)
-	Raspberry Pi 3 with Bosch's [BME280 sensor](https://www.adafruit.com/product/2652) 
-   Windows 10 Dev Machine as we are deploying an Universal Windows Platform (UWP) app to the Raspberry Pi 3
-   [Visual Studio Code](https://code.visualstudio.com/download) or your preferred web IDE

## Online Mode
Online mode covers the steps of the setup described in the architecture above. If you want to run Simlyn locally, I recommend you to walk through the offline mode scenario.

1.	Deploy Azure services

    Open the Visual Studio solution [Simlyn ARM Deployment](https://github.com/chris-to-pher/Simlyn/tree/master/Simlyn%20Azure%20Resource%20Deployment). Deploy the template into an Azure Resource Group (RG) by following [this guide](https://docs.microsoft.com/en-us/azure/azure-resource-manager/vs-azure-tools-resource-groups-deployment-projects-create-deploy#deploy-the-resource-group-project-to-azure). Make sure you properly set the variables in the parameters file. Please also verify  that the Azure resource settings as listed below are set correctly
    
	| Resource Type     | Setting | Value | Description |
	| :---         | :---         | :---         | :---          |
	| IoT Hub   | Devices     | Enabled    | Set up your IoT device    |
	| Web App (Node)     | Web Sockets       | Enabled      | Providing full-duplex communication over TCP     |
	| Web App (Node)     | Azure.IoT.IoTHub.ConnectionString       | Your connection string provided by the IoT Hub    | IoT Hub Connectin string used for dev registration     |
	| Web App (Node)     | Azure.IoT.IoTHub.ConsumerGroup       | Your consumer group provided by the IoT Hub      | Enable readers to read message independetly     |
	| Web App (Node)     | Deployment Option       | Local Git Deployment      | Deploy your app to Azure Web Apps from a local Git repository     |
	| API App (.NET)     | CORS       | *      | Cross-Origin Resource Sharing (CORS) allows JavaScript code running in a browser on an external host    |
	| Cosmos DB     | Throughput (RU/s)       | 400      |   Currency of Cosmos DB  |

2.	Publish the Universal Windows Platform (UWP) app to the Raspberry Pi 3

    - Make sure you proplery connected the Raspberry Pi 3 to the BME280 sensor by following [this](https://www.raspberrypi-spy.co.uk/2016/07/using-bme280-i2c-temperature-pressure-sensor-in-python/) guide
    -	Install [Windows 10 IoT Core](https://docs.microsoft.com/en-us/windows/iot-core/connect-your-device/iotdashboard) on the Raspberry Pi 3 (if you experience slow performance, make sure to use a SD card of 16GB or more)
    - Open the class `MainPage.xaml.cs` located in the folder [Simlyn Universal Windows Platform App](https://github.com/chris-to-pher/Simlyn/tree/master/Simlyn%20Universal%20Windows%20Platform%20App). Update the following variables as described below (please see the Azure portal to get your keys):
        - `private string iotHubUri = "<Your IoT Hub Uri>";` on line 33
        - `private string deviceKey = "<Your Device Key>";` on line 34
        - `deviceClient = DeviceClient.Create(iotHubUri, new DeviceAuthenticationWithRegistrySymmetricKey("<Your Device Name>", deviceKey), TransportType.Mqtt);` on line 39
    - Connect Visual Studio to your remote Raspberry device. [This](https://docs.microsoft.com/en-us/windows/iot-core/develop-your-app/appdeployment) tutorial shows the basic steps
    - Build the Visual Studio solution (Ctrl + Shift + B). This could take a while as VS downloads and installs the NuGet packages used in the project
    - Deploy the app to the remote device (you can publish it as well). As we are running the sample on a Raspberry, make sure you select "ARM" as your target platform
    - You will see some debugging output in the console. You can verify the data ingress by switching to the IoT Hub in the Azure portal

3. Configure and Publish the Web API

	- If you havent done by now, install [.NET Core 2.0 or later](https://www.microsoft.com/net/download/windows) on your local machine
    - Open the [Simlyn Web API](https://github.com/chris-to-pher/Simlyn/tree/master/Simlyn%20Web%20API) and switch to the class `Globals.cs`. Edit the following parameters (you get all parameters by switching to the Cosmos DB database account using the Azure portal):
        - `public static readonly string DocDBDatabaseId = "<Your Database ID>";` on line 13
        - `public static readonly string DocDBEndpoint = "<Your Cosmos DB Endpoint Uri>";` on line 14
        - `public static readonly string DocDBAuthKey = "<Your Doc DB Auth key>";` on line 15
        - `public static readonly string DocDBCollectionHistory = "<Your Collection Name>";` on line 20
    - Right click on the project and select `Publish`. Deploy the API to one of the web app resources you created in step 1
    - As we are using [Swagger](https://swagger.io/), so you can browse to `<resourcename>.azurewebsites.net/swagger` to see the .NET controllers and operations
    
    ![Simlyn Web API Swagger](https://raw.githubusercontent.com/chris-to-pher/Simlyn/master/Screenshots/Swagger%20API%20App.JPG)
   
4.	Configure and Publish the Node Web App

    - Open the directroy [Simlyn Node App](https://github.com/chris-to-pher/Simlyn/tree/master/Simlyn%20Node%20App) and switch to the file `public/javascripts/` folder using [Visual Studio Code](https://code.visualstudio.com/) or you preferred web IDE. Edit the following variable: 
        - `var apiService = '<Your FQDN of the API // e.g., https://simlyn-backend.azurewebsites.net/api>'` on line 6 in `index.js`
	- `var apiService = '<Your FQDN of the API // e.g., https://simlyn-backend.azurewebsites.net/api>'` on line 2 in `iotaflash.js`
	- `var UseMockedData = false` on line 72 in `index.js`
   - Switch to the file `IOTAHelpers/globals.js`and update the variables listed below (you may use an online seed generator and create an address using IOTA's light wallet)
		- `oneSeed : <seedOne>`
		- `twoSeed: <seedTwo>`
		- `oneSettlement: <settlementOne>`
		- `twoSettlement: <settlementTwo>`
   - Make sure you enabled local git repository deployment by following [this tutorial](https://docs.microsoft.com/en-us/azure/app-service/app-service-deploy-local-git). Copy the git repository URL from web app resource using the Azure portal
    - Publish the Node app to Azure by running the cmdlets below
        - `git remote add simlynnodeapp <Git clone URL from the Azure portal>`
        - `git push simlynnodeapp master:master`
    - The deployment will take some time as the cmdlet kicks off the Node build and release tasks
    - You can now browse to the URL `https://yourwebapp.azurewebsites.net` and start the simulation
    - After clicking on the “End Simulation” button, IOTA's Final Bundle gets created. I did not implement the `AttachToTangle` function so the demo gets automatically reset
    
4. Enabling Power BI to visualize the coordinates provided by the Cosmos DB database

    - Download the [Power BI Desktop](https://powerbi.microsoft.com/de-de/desktop/) app
    - Create a new project and import the data from the Cosmos DB database. You can walk through [this guide](https://docs.microsoft.com/en-us/azure/cosmos-db/powerbi-visualize)
    - Open the `Query Editor`, and select the `coordinates`column
    - Select the `coordinates` field, and create a new `Power BI Map`

![Simlyn Power BI](https://raw.githubusercontent.com/chris-to-pher/Simlyn/master/Screenshots/Simlyn_PowerBi.JPG)

## Offline Mode
You can also run Simlyn in offline mode. This means that the Node app has no interaction to the cloud (except Cosmos DB) and the hardware device.

1. Open the command line tool and set the environment variables below
    - `set Azure.IoT.IoTHub.ConnectionString=<randomstring>`
    - `set Azure.IoT.IoTHub.ConsumerGroup=<randomstring>`
2. Open the Node app using Visual Studio Code or your preferred IDE. Set the `mockedData` boolean to true 
    - `var mockedData = true` in `public/javascripts/index.js`
3.  Switch to `IOTAHelpers/globals.js` and update the variables listed below (use the online generator get create a a seed and generate an address using the wallet)
		- `oneSeed : <seedOne>`
		- `twoSeed: <seedTwo>`
		- `oneSettlement: <settlementOne>`
		- `twoSettlement: <settlementTwo>`
3. Switch to a command line and run the following node commands
    - `npm install`
    - `npm start`
4. Open your browser and go to `localhost:3000`

## Things to improve
- [ ] More beautiful UI/UX elements (Responsivess doesn’t work very well right now)
- [ ] Sensitive data (e.g., Seeds, personal infos, etc.) should be stored in a safer manner (e.g., Azure Key Vault)
- [ ] Enabling more payment options (e.g., pay per Kilobyte instead of amount of calls)
- [ ] Implement “Attach to Tangle” functionality
- [ ] Taking advantage of more Azure services (e.g., Stream Analytics, Power BI, etc.)
- [ ] Split the NodeJS Web app into a consumer and receiver app
- [ ] Implement Azure Active Directory (AAD) to secure the app services
