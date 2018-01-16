# Simlyn - Connecting IOTA and Microsoft Azure

There is no doubt that both Microsoft Azure and IOTA will play crucial roles in the upcoming Internet of Things (IoT) area. Both solutions enable unique solutions to make sure that large data can be handled in a secured and scaled manner. Simlyn connects both platforms by demonstrating a proof of concept which can applied to the real world: Data provided by a physical hardware device is sent to the cloud. A web application simulates a data provider consumer behavior using IOTA's Flash library. Flash Channel transactions are stored in a NoSQL database which servers as the source for a machine algorithm scenario.

Some people asked me to show a quick demo. I published a [YouTube video](https://youtu.be/DZvTg52JB04) which walks you through some of the basic infrastructure steps. There is also a [demo](https://iotawsflashpoc.azurewebsites.net/) in offline mode of the web app available.

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

    Open the Visual Studio solution [Simlyn ARM Deployment](https://github.com/chris-to-pher/Simlyn/tree/master/Simlyn%20ARM%20Deployment). Deploy the template into an Azure Resource Group (RG) by following [this guide](https://docs.microsoft.com/en-us/azure/azure-resource-manager/vs-azure-tools-resource-groups-deployment-projects-create-deploy#deploy-the-resource-group-project-to-azure). Make sure you properly set the variables in the parameters file. Please also make sure that the variables are set as described in the table below
    
    | Resource | Settings | Value | Description |
    | --- | --- | --- |
    | `git status` | blubb | List all *new or modified* files |
    | `git diff` | blubb | Show file differences that **haven't been** staged |

2.	Publish the Universal Windows Platform (UWP) app to the Raspberry Pi 3

    - Make sure that the Raspberry Pi 3 is properly connected to the Bosch BME280 sensor by following [this](https://www.raspberrypi-spy.co.uk/2016/07/using-bme280-i2c-temperature-pressure-sensor-in-python/) guide.
    -	Install [Windows 10 IoT Core](https://docs.microsoft.com/en-us/windows/iot-core/connect-your-device/iotdashboard) on the device (if you experience slow performance, make sure to use a SD card of 16GB or more)
    - Open the class `MainPage.xaml.cs` located in the folder [Simlyn UWP](https://github.com/chris-to-pher/Simlyn/tree/master/Simlyn%20UWP) porject. Update the following parameters (you get the information from the Azure Portal):
        - `private string iotHubUri = "<Your IoT Hub Uri>";`
        - `private string deviceKey = "<Your Device Key>";`
        - `deviceClient = DeviceClient.Create(iotHubUri, new DeviceAuthenticationWithRegistrySymmetricKey("<Your Device Name>", deviceKey), TransportType.Mqtt);`
    - Connect Visual Studio to your remote Raspberry device by following [this](https://docs.microsoft.com/en-us/windows/iot-core/develop-your-app/appdeployment) tutorial
    - Build the Visual Studio solution (Ctrl + Shift + B). This could take a while as VS downloads and installs all NuGet packages used in the project
    - Deploy the app to the remote device (you can publish it as well). As we are running the sample on a Raspberry Pi 3, make sure that you selected the target platform “ARM”.
    - You should now see some output in the console. You can verify the streaming by switching to the IoT Hub in the Azure portal.

3. Configure and Publish the Web API

    - Make sure that Cross-Origin Resource Sharing (CORS) [is enabled](https://docs.microsoft.com/en-us/rest/api/storageservices/cross-origin-resource-sharing--cors--support-for-the-azure-storage-services)
	- If you havent done so far, install [.NET Core 2.0 or later](https://www.microsoft.com/net/download/windows) on your machine
    - Open the [Web API project](https://github.com/chris-to-pher/Simlyn/tree/master/Simlyn%20Web%20API) and switch to the `Globals.cs` class in the Helpers folder. Edit the following parameters:
        - `public static readonly string DocDBDatabaseId = "<Your Database ID>";`
        - `public static readonly string DocDBEndpoint = "<Your Cosmos DB Endpoint Uri>";`
        - `public static readonly string DocDBAuthKey = "<Your Doc DB Auth key>";`
        - `public static readonly string DocDBCollectionHistory = "<Your Collection Name>";`
    - Right click on the project and select `Publish`. Deploy the API to one of the apps you created in step 1
    - [Swagger](https://swagger.io/) is part of the project, so you can browse to `<resourcename>.azurewebsites.net/swagger` to see the .NET controllers and operations used in the project
   
4.	Configure and Publish the Node Web App

    - Make sure that the node app enabled [Web Sockets](https://azure.microsoft.com/en-us/blog/introduction-to-websockets-on-windows-azure-web-sites/). Also check if the App settings `Azure.IoT.IoTHub.ConnectionString` and `Azure.IoT.IoTHub.ConsumerGroup` are set properly.
	- I recommend to use [Visual Studio Code](https://code.visualstudio.com/) for editing JavaScript and HTML files
    - Open the directroy [Simlyn Node App](https://blaaah.de) and switch to `public/javascripts/` folder. Edit the following variable: 
        - `var apiService = '<Your FQDN of the API // e.g., https://simlyn-backend.azurewebsites.net/api>'` in `index.js`
		- `var apiService = '<Your FQDN of the API // e.g., https://simlyn-backend.azurewebsites.net/api>'` in `iotaflash.js`
		- `var UseMockedData = false` in `index.js`
	- Switch to `IOTAHelpers/globals.js`and update the variables listed below  (use the online generator get create a a seed and generate an address using the wallet)
		- `oneSeed`
		- `twoSeed`
		- `oneSettlement`
		- `twoSettlement`
    - Switch to the second web app and enable local Git deployment by following this tutorias
	- Enable local git repository deployment by following [this tutorial](https://docs.microsoft.com/en-us/azure/app-service/app-service-deploy-local-git)
    - Publish the Node app to Azure by running the cmdlets below
        - `git remote add simlynnodeapp <Git clone URL from portal>`
        - `git push simlynnodeapp master:master`
    - The deployment will take some time as the command start the build and release process
    - After clicking on the “End Simulation” button, the Final Bundle gets created. I did not implement the `AttachToTangle` function so the demo gets automatically reset
    
4. Enabling Power BI to visualize the coordinates provided by the Cosmos DB database

    - Download the [Power BI Desktop](https://powerbi.microsoft.com/de-de/desktop/) app
    - Create a new project and import the data from the Cosmos DB database. You can walk through [this guide](https://docs.microsoft.com/en-us/azure/cosmos-db/powerbi-visualize)
    - Open the `Query Editor`, and select the `coordinates`column
    - Select the `coordinates` field, and create a new `Power BI Map`

![Simlyn Power BI](https://raw.githubusercontent.com/chris-to-pher/Simlyn/master/Screenshots/Simlyn_PowerBi.JPG)

## Offline Mode
You can also run Simlyn in offline mode. This means that the Node app has no interaction to the cloud and the hardware device.

1. Open the command line tool and set the environment variables below
    - `set Azure.IoT.IoTHub.ConnectionString=<randomstring>`
    - `set Azure.IoT.IoTHub.ConsumerGroup=<randomstring>`
2. Open the Node app using Visual Studio Code or your preferred IDE. Set the `mockedData` boolean to true 
    - `var mockedData = true` in `public/javascripts/index.js`
3.  Switch to `IOTAHelpers/globals.js` and update the variables listed below (use the online generator get create a a seed and generate an address using the wallet)
		- `oneSeed`
		- `twoSeed`
		- `oneSettlement`
		- `twoSettlement`
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
