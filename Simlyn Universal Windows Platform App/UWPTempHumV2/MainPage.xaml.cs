using BuildAzure.IoT.Adafruit.BME280;
using Microsoft.Azure.Devices.Client;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace UWPTempHumV2
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        private DeviceClient deviceClient;
        private BME280Sensor _sensor;
        private string iotHubUri = "<Your IoT Hub Uri>";
        private string deviceKey = "<Your Device Key>";

        public MainPage()
        {
            //this.InitializeComponent();
            deviceClient = DeviceClient.Create(iotHubUri, new DeviceAuthenticationWithRegistrySymmetricKey("<Your Device Name>", deviceKey), TransportType.Mqtt);
            _sensor = new BME280Sensor();
            DeviceToCloudMessage();
        }

        private async void DeviceToCloudMessage()
        {
            await _sensor.Initialize();
            float temperature = 0.00f;
            float humidity = 0.00f;
            int mId = 0;
            while (true)
            {
                temperature = await _sensor.ReadTemperature();
                humidity = await _sensor.ReadHumidity();
                var sensorData = new
                {
                    messageId = mId,
                    deviceId = "Real Raspberry Device",
                    temperature = Math.Round(temperature, 5),
                    humidity = Math.Round(humidity, 5)
                };
                var messageString = JsonConvert.SerializeObject(sensorData);
                var message = new Message(Encoding.ASCII.GetBytes(messageString));
                await deviceClient.SendEventAsync(message);
                Debug.WriteLine("{0} > Sending message: {1}", DateTime.Now, messageString);
                mId++;
                Task.Delay(5000).Wait();
            }
        }
    }
}
