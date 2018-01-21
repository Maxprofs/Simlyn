$(document).ready(function () {

  var timeData = [],
      temperatureData = [],
      humidityData = [],
      apiService = 'https://simlyn-backend.azurewebsites.net/api';

  var data = {
    labels: timeData,
    datasets: [
      {
        fill: false,
        label: 'Temperature',
        yAxisID: 'Temperature',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: temperatureData
      },
      {
        fill: false,
        label: 'Humidity',
        yAxisID: 'Humidity',
        borderColor: "rgba(24, 120, 240, 1)",
        pointBoarderColor: "rgba(24, 120, 240, 1)",
        backgroundColor: "rgba(24, 120, 240, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
        pointHoverBorderColor: "rgba(24, 120, 240, 1)",
        data: humidityData
      }
    ]
  }

  var basicOption = {
    title: {
      display: false
    },
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature(C)',
          display: true
        },
        position: 'left',
      }, {
          id: 'Humidity',
          type: 'linear',
          scaleLabel: {
            labelString: 'Humidity(%)',
            display: true
          },
          position: 'right'
        }]
    }
  }

    //Get the context of the canvas element we want to select
    var ctx = document.getElementById("myChart").getContext("2d");
    var optionsNoAnimation = { animation: false }
    var myLineChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: basicOption
    });

  //////////////////////////////////////
  // Custom
    var UseMockedData = true,
        simulationRunning = true;
  ////////////////////////////////////////

  // Show Flash Channel Transaction
  showTransactionHistory.addEventListener('click', function() {
    var i = 1;
    $.get(
      apiService + '/Histories',
      function(data) {
         data.forEach(function(obj) { 
           // Hide "Loading data" span
           $('#loadingData').hide();
           $('#transactionHistoryOutput tbody').append('<tr><th scope="row">' + i++ + '</th><td>' + obj.message + ' </td><td>' + obj.amount + '</td><td>'+obj.coordinates+'</td><td>'+obj.datetime+'</td></tr>');
         });
      }
  );
  })

  // Prepare Channel
  prepareFlashChannels.addEventListener('click', function() {    
    InitializeFlashObjects();

    // Show Stop Simulation Button, Hide Start Simulation Button
    $('#prepareFlashChannels').hide();
    $('#closeChannel').show();
  })

  // Close Channel
  closeChannel.addEventListener('click', function() {

    simulationRunning = false;
    writeToConsole('Simulation stopped, Closing channel.')
    writeToConsole('Please wait for the final bundle to be completed. This may take some seconds...')

    $.get(
      server + 'api/closingchannel',
      function(data) {
         console.log(data);
         $('#finalbundles').val(JSON.stringify(data));
         $('#finalModal').modal('toggle');
      }
    );
  })

  attachToTangle.addEventListener('click', function() {
   window.location.reload(); // Force reload
  })

  // Button Stuff
  startSimulation.addEventListener('click', function() {
    writeToConsole('Setup completed, starting to receive remote data');
    if(UseMockedData) {
      var dataIndex = 0;
      var deviceId = 'Raspberry Pi Web Client';

      (function(){

        if(simulationRunning)
        {
          message = {
            "messageId" : dataIndex,
            "deviceId" : deviceId,
            "temperature" : randomInRange(20, 23),
            "humidity" : randomInRange(50, 54),
            "time": getCurrentJSTime()
        };

        try {
            var obj = message;
            if(!obj.time || !obj.temperature) {
              return;
            }
            timeData.push(obj.time);
            temperatureData.push(obj.temperature);
            // only keep no more than 50 points in the line chart
            const maxLen = 50;
            var len = timeData.length;
            if (len > maxLen) {
              timeData.shift();
              temperatureData.shift();
            }
      
            if (obj.humidity) {
              humidityData.push(obj.humidity);
            }
            if (humidityData.length > maxLen) {
              humidityData.shift();
            }
      
            myLineChart.update();
            writeToConsole('Message: ' + JSON.stringify(message));
            ReadyForProcessing(message);
          } catch (err) {
            console.error(err);
          }

        dataIndex++;
        }
        setTimeout(arguments.callee, 1000);
    })();
    }
    else {
      var ws = new WebSocket('wss://' + location.host);
      ws.onopen = function () {
        console.log('Successfully connect WebSocket');
      }
      ws.onmessage = function (message) {
        console.log(message.data);
        writeToConsole('receive message: ' + JSON.stringify(message.data));
        try {
          var obj = JSON.parse(message.data);
          if(!obj.time || !obj.temperature) {
            return;
          }
          timeData.push(obj.time);
          temperatureData.push(obj.temperature);
          // only keep no more than 50 points in the line chart
          const maxLen = 50;
          var len = timeData.length;
          if (len > maxLen) {
            timeData.shift();
            temperatureData.shift();
          }
    
          if (obj.humidity) {
            humidityData.push(obj.humidity);
          }
          if (humidityData.length > maxLen) {
            humidityData.shift();
          }
    
          myLineChart.update();
          ReadyForProcessing(message.data);
        } catch (err) {
          console.error(err);
        }
      }
    }
 });

 function writeToFlashTxOutout(message) {
  if(message) {
    var ul = document.getElementById("flashtransactions");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(getCurrentJSDateTime() + ': ' + message));
    ul.appendChild(li);
  
    // Refocus list
    var messageBody = document.querySelector('#scrollablelistflashtx');
    messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
   }
 }

 function writeToConsole(message) {
   if(message) {
    var ul = document.getElementById("output");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(getCurrentJSDateTime() + ': ' + message));
    ul.appendChild(li);
  
    // Refocus list
    var messageBody = document.querySelector('#scrollablelist');
    messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
   }
 }

 function randomInRange(min, max) {
  return Math.random() < 0.5 ? ((1-Math.random()) * (max-min) + min) : (Math.random() * (max-min) + min);
 }

 function getCurrentJSTime() {
  var currentdate = new Date(); 
  return currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds();
 }

 function getCurrentJSDateTime() {
  var currentdate = new Date(); 
  return            currentdate.getDate() + "/"
                  + (currentdate.getMonth()+1)  + "/" 
                  + currentdate.getFullYear() + " @ "  
                  + currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds();
 }

});