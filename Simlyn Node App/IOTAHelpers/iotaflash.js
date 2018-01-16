const globals = require('./globals');

// IOTA Flash Libs
const IOTACrypto = require('iota.crypto.js')
const transfer = require("../IOTAFlashLibs/transfer")
const multisig = require("../IOTAFlashLibs/multisig")
const Helpers = require("../IOTAFlashLibs//functions")

function getOneFlash() {
    return {
        userIndex: 0,
        userSeed: globals.oneSeed,
        index: 0,
        security: globals.SECURITY,
        depth: globals.TREE_DEPTH,
        bundles: [],
        partialDigests: [],
        flash: {
          signersCount: globals.SIGNERS_COUNT,
          balance: globals.CHANNEL_BALANCE,
          deposit: globals.DEPOSITS.slice(), // Clone correctly
          outputs: {},
          transfers: []
        }
    }
}

function getTwoFlash() {
    return {
        userIndex: 1,
        userSeed: globals.twoSeed,
        index: 0,
        security: globals.SECURITY,
        depth: globals.TREE_DEPTH,
        bundles: [],
        partialDigests: [],
        flash: {
          signersCount: globals.SIGNERS_COUNT,
          balance: globals.CHANNEL_BALANCE,
          deposit: globals.DEPOSITS.slice(), // Clone correctly
          outputs: {},
          transfers: []
        }
    }
}

function getOneDigest(_oneFlash) {
    var oneFlash = _oneFlash;
    for (let i = 0; i < globals.TREE_DEPTH + 1; i++) {
        // Create new digest
        const digest = multisig.getDigest(
          oneFlash.userSeed,
          oneFlash.index,
          oneFlash.security
        )
        // Increment key index
        oneFlash.index++
        oneFlash.partialDigests.push(digest)
      }
    return oneFlash;
}

function getTwoDigest(_twoFlash) {
    var twoFlash = _twoFlash;
    for (let i = 0; i < globals.TREE_DEPTH + 1; i++) {
        // Create new digest
        const digest = multisig.getDigest(
          twoFlash.userSeed,
          twoFlash.index,
          twoFlash.security
        )
        // Increment key index
        twoFlash.index++
        twoFlash.partialDigests.push(digest)
      }
    return twoFlash;
}

function getOneMultisigs(_oneFlash, allDigests) {

    var oneFlash = _oneFlash,
        _addy = {};

    oneFlash.partialDigests.map((digest, index) => {
        // Create address
        let addy = multisig.composeAddress(
          allDigests.map(userDigests => userDigests[index])
        )
        // Add key index in
        addy.index = digest.index
        // Add the signing index to the object IMPORTANT
        addy.signingIndex = oneFlash.userIndex * digest.security
        // Get the sum of all digest security to get address security sum
        addy.securitySum = allDigests
          .map(userDigests => userDigests[index])
          .reduce((acc, v) => acc + v.security, 0)
        // Add Security
        addy.security = digest.security
        _addy = addy;      
    })
    return _addy;
}

function getTwoMultisigs(_twoFlash, allDigests) {

    var twoFlash = _twoFlash,
        _addy = {};

        twoFlash.partialDigests.map((digest, index) => {
            // Create address
            let addy = multisig.composeAddress(
              allDigests.map(userDigests => userDigests[index])
            )
            // Add key index in
            addy.index = digest.index
            // Add the signing index to the object IMPORTANT
            addy.signingIndex = twoFlash.userIndex * digest.security
            // Get the sum of all digest security to get address security sum
            addy.securitySum = allDigests
              .map(userDigests => userDigests[index])
              .reduce((acc, v) => acc + v.security, 0)
            // Add Security
            addy.security = digest.security
            _addy = addy;
          })
    
        return _addy;
}

function startTransaction(oneFlash, twoFlash) {
    let transfers = [
        {
          value: 1,
          address: globals.twoSettlement
        }
      ]
    
    // create Tx
    let bundles = Helpers.createTransaction(oneFlash, transfers, false)
    
    // Get signatures for the bundles
    let oneSignatures = Helpers.signTransaction(oneFlash, bundles)
    let twoSignatures = Helpers.signTransaction(twoFlash, bundles)

    // Sign bundle with your ignatures
    let signedBundles = transfer.appliedSignatures(bundles, oneSignatures)
    signedBundles = transfer.appliedSignatures(signedBundles, twoSignatures)

    return signedBundles;
}

function closeChannel(_oneFlash, _twoFlash) {

    oneFlash = _oneFlash;
    twoFlash = _twoFlash;

    // Supplying the CORRECT varibles to create a closing bundle
    bundles = Helpers.createTransaction(
        oneFlash,
        oneFlash.flash.settlementAddresses,
        true
    )

    /////////////////////////////////
    /// SIGN BUNDLES

    // Get signatures for the bundles
    oneSignatures = Helpers.signTransaction(oneFlash, bundles)

    // Generate USER TWO'S Singatures
    twoSignatures = Helpers.signTransaction(twoFlash, bundles)

    // Sign bundle with your USER ONE'S signatures
    signedBundles = transfer.appliedSignatures(bundles, oneSignatures)

    // ADD USER TWOS'S signatures to the partially signed bundles
    signedBundles = transfer.appliedSignatures(signedBundles, twoSignatures)

    /////////////////////////////////
    /// APPLY SIGNED BUNDLES

    // Apply transfers to User ONE
    oneFlash = Helpers.applyTransfers(oneFlash, signedBundles)
    // Save latest channel bundles
    oneFlash.bundles = signedBundles

    // Apply transfers to User TWO
    twoFlash = Helpers.applyTransfers(twoFlash, signedBundles)
    // Save latest channel bundles
    twoFlash.bundles = signedBundles

    console.log("Channel Closed")
    console.log("Final Bundle to be attached: ")
    console.log(signedBundles[0])

    return signedBundles[0];
}


module.exports = {
    'getOneFlash'        : getOneFlash,
    'getTwoFlash'        : getTwoFlash,
    'getOneDigest'       : getOneDigest,
    'getTwoDigest'       : getTwoDigest,
    'getOneMultisigs'    : getOneMultisigs,
    'getTwoMultisigs'    : getTwoMultisigs,
    'startTransaction'   : startTransaction,
    'closeChannel'       : closeChannel
}