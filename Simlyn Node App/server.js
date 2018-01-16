// Node
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const moment = require('moment');
const path = require('path');
const iotHubClient = require('./IoTHub/iot-hub.js');

// Custom Libs
const IOTAFlashLib = require('./IOTAHelpers/iotaflash')
const globals = require('./IOTAHelpers/globals');

const Helpers = require("./IOTAFlashLibs/functions")

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// IOTA Flashes
var oneFlash, twoFlash;

// IOTA Flash Multisigs
var oneMultisigs = [], twoMultisigs = [];

// Step 1: Initialize Flash Objects
app.get('/api/initializeFlashChannels', function(req, res) {

  // Prepare Flashes
  oneFlash = IOTAFlashLib.getOneFlash()
  twoFlash = IOTAFlashLib.getTwoFlash()

  res.send('OK');
});

// Step 2: Create Digests
app.get('/api/createDigests', function(req, res) {

  oneFlash = IOTAFlashLib.getOneDigest(oneFlash);
  twoFlash = IOTAFlashLib.getTwoDigest(twoFlash);

  res.send(twoFlash);
})

// Step 3: Initial Multisig
app.get('/api/createInitialMultisig', function (req, res) {

  let allDigests = []
  allDigests[oneFlash.userIndex] = oneFlash.partialDigests
  allDigests[twoFlash.userIndex] = twoFlash.partialDigests

  oneMultisigs = IOTAFlashLib.getOneMultisigs(oneFlash, allDigests);
  twoMultisigs = IOTAFlashLib.getTwoMultisigs(twoFlash, allDigests);

  res.send(oneMultisigs);
})

// Step 4: Consume and organise addresses for use
app.get('/api/consumeandorganise', function(req, res) {

  // Set remainder address (Same on both users)
  oneFlash.flash.remainderAddress = oneMultisigs
  twoFlash.flash.remainderAddress = twoMultisigs

  // Nest trees
  for (let i = 1; i < oneMultisigs.length; i++) {
    oneMultisigs[i - 1].children.push(oneMultisigs[i])
  }
  for (let i = 1; i < twoMultisigs.length; i++) {
    twoMultisigs[i - 1].children.push(twoMultisigs[i])
  }

  // Set Flash root
  oneFlash.flash.root = oneMultisigs
  twoFlash.flash.root = twoMultisigs

  // Set settlement addresses (Usually sent over when the digests are.)
  let settlementAddresses = [globals.oneSettlement, globals.twoSettlement]
  oneFlash.flash.settlementAddresses = settlementAddresses
  twoFlash.flash.settlementAddresses = settlementAddresses

  // Set digest/key index
  oneFlash.index = oneFlash.partialDigests.length
  twoFlash.index = twoFlash.partialDigests.length

  console.log("Channel Setup!")
  console.log(
    "Transactable tokens: ",
    oneFlash.flash.deposit.reduce((acc, v) => acc + v)
  )

  res.send(oneFlash);
})

// Step 5: Transacting
app.get('/api/transacting', function(req, res) {

  var signedBundles = IOTAFlashLib.startTransaction(oneFlash, twoFlash);

  // Apply transfers to User ONE
  oneFlash = Helpers.applyTransfers(oneFlash, signedBundles)
  oneFlash.bundles = signedBundles
  
  // Apply transfers to User TWO
  twoFlash = Helpers.applyTransfers(twoFlash, signedBundles)
  twoFlash.bundles = signedBundles
  
  console.log("Transaction Applied!")
  console.log(
    "Transactable tokens: ",
    oneFlash.flash.deposit.reduce((acc, v) => acc + v)
  )
  
  res.send(oneFlash);
})

// Step 6: Closing Channel
app.get('/api/closingchannel', function(req, res) {
  res.send(IOTAFlashLib.closeChannel(oneFlash, twoFlash));
})

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        console.log('sending data ' + data);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

var iotHubReader = new iotHubClient(process.env['Azure.IoT.IoTHub.ConnectionString'], process.env['Azure.IoT.IoTHub.ConsumerGroup']);
iotHubReader.startReadMessage(function (obj, date) {
  try {
    console.log(date);
    date = date || Date.now()
    wss.broadcast(JSON.stringify(Object.assign(obj, { time: moment.utc(date).format('YYYY:MM:DD[T]hh:mm:ss') })));
  } catch (err) {
    console.log(obj);
    console.error(err);
  }
});



var port = normalizePort(process.env.PORT || '3000');
server.listen(port, function listening() {
  console.log('Listening on %d', server.address().port);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}