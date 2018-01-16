var server = window.location.href;
var apiService = 'https://<yourapiname>.azurewebsites.net/api';

// Some Random Coordinates for Power BI
var RandomCoordinates = ["50.892373,6.994343", "48.506939,9.203804", "52.520007,13.404954", "48.135125,11.581980", "48.775846,9.182932"];

// Fixed calculation variables
var AmountOfCalls = 0,
    Divider = 10,
    SampleAddress = 'RETBXKYEJCURBZ9UBGYP9DGE9THWZL9WAZMAO9LWAKVEYGPREIOPMNOKPBA9I9ZDGREAOUQJPOWDXRFWWWOOWOUHLX';

//////////////////////////////
////  SETUP FLASH CHANNEL ////
//////////////////////////////

// Step 1
function InitializeFlashObjects() {
    $.get(
        server + 'api/initializeFlashChannels',
        function(data) {
           if(data == 'OK') {
                writeToConsole('Flash objects created successfully');
                CreateDigests(); // Continue with step 2
           }
        }
    );
}

// Step 2
function CreateDigests() {
    writeToConsole('Prepare digests, this may take some seconds...');
    $.get(
        server + 'api/createDigests',
        function(data) {
           writeToConsole('Digest for the start of the channel created');
           InitialMultisig(); //  Continue with step 3
        }
    );
}

// Step 3
function InitialMultisig() {
    $.get(
        server + 'api/createInitialMultisig',
        function(data) {
           writeToConsole('Flash Channel Multisigs successfully assigned')
           ConsumeAndOrganise() //  Continue with step 4
        }
    );
}

// Step 4
function ConsumeAndOrganise() {
    $.get(
        server + 'api/consumeandorganise',
        function(data) {
           writeToConsole('Channel setup done.')
           $("#startSimulation").click()
        }
    );
}

// Step 5
function StartTransaction() {
    $.get(
        server + 'api/transacting',
        function(data) {
           console.log(data);
        }
    );
}

// Functions
function ReadyForProcessing(message) {
    if(AmountOfCalls % Divider == 0 && AmountOfCalls > 0) StartTransfer();
    AmountOfCalls++;
}

function StartTransfer() {    
    $.get(
        server + 'api/transacting',
        function(data) {           
            var val = parseInt($('#TotalBalanceSupplier').val());
            val++;
            $('#TotalBalanceSupplier').val(val);
            val = parseInt($('#TotalBalanceConsumer').val());
            val--;
            $('#TotalBalanceConsumer').val(val);
            message = 'Consumer received 10 messages - Transfered 1 iota from consumer to producer';
            writeToFlashTxOutout(message);

            // Insert new Cosmos DB document
            addNewHistoryItem(message, 1, SampleAddress, RandomCoordinates[Math.floor(Math.random() * RandomCoordinates.length)]);
        }
    );
}

function addNewHistoryItem(message, amount, receiverAddress, coordinates) {
    $.post( 
        apiService + "/History", 
        { 
          message: message,
          amount: amount,
          receiveraddress: receiverAddress,
          coordinates: coordinates
        },
        function(data) {
          writeToFlashTxOutout('Cosmos DB response: Historiy item ' + data.id + ' successfully added');
        }
      );
}

// Helpers
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
                   + (currentdate.getMonth() + 1)  + "/" 
                   + currentdate.getFullYear() + " @ "  
                   + currentdate.getHours() + ":"  
                   + currentdate.getMinutes() + ":" 
                   + currentdate.getSeconds();
  }