/////////////////////////////////////
// Proof-of-concept implementation for PathJoin
// Author: Pedro Moreno-Sanchez
// Email: pmorenos@purdue.edu
//
// Note: This implementation is insecure! Do not use it with your credit! 
//       This implementation has been written purely to evaluate the feasibility of PathJoin.




//Installation instructions:
//	1. Install NodeJS and the Node Package Manager (npm). Most Linux distros have a package for NodeJS, but make sure you have version 0.12.0 or higher.
//	2. Use npm to install Babel globally: npm install -g babel
//	3. Use npm to install RippleAPI: npm install ripple-lib
//  4. Use npm to install all other dependencies required in this script
//  5. Copy the index.js file into node_modules/elliptic/lib/elliptic/eddsa/ (it contains the implementation of distributed signature algorithm)
//  6. Fill the fields in the script with the wallets in your experiment.
//	7. You can run the example with : babel-node test-pathjoin.js




'use strict';


const elliptic = require('elliptic');
const Ed25519 = elliptic.eddsa('ed25519');
const hashjs = require('hash.js');
const RippleAPI = require('ripple-lib').RippleAPI; 
const keypairs = require('ripple-keypairs');
const binary = require('ripple-binary-codec');
const assert = require('assert');
var addressCodec = require('ripple-address-codec');

const api = new RippleAPI({server: 'wss://s1.ripple.com:443'}); //Connect to a Ripple server
const instructions = {maxLedgerVersionOffset: 5, fee: '0.012'}; //Set the configuration


//Users input wallets for the input shared wallet (Win)
// You need to create a fresh wallet for each of the users
// Current test has only 5 users. It can easily be extended for more users
const wala_in_add = '';
const wala_in_secret = '';
const walb_in_add = '';
const walb_in_secret = '';
const walc_in_add = '';
const walc_in_secret = '';
const wald_in_add = '';
const wald_in_secret = '';
const wale_in_add = '';
const wale_in_secret = '';
 

//Users input wallets for the output shared (Wout)
// You need to create a fresh wallet for each of the users
// Current test has only 5 users. It can easily be extended for more users
const wala_out_add = '';
const wala_out_secret = '';
const walb_out_add = '';
const walb_out_secret = '';
const walc_out_add = '';
const walc_out_secret = '';
const wald_out_add = '';
const wald_out_secret = '';
const wale_out_add = '';
const wale_out_secret = '';


//Users input wallets 
// You need to set these wallets whith those ones where users have 
//their IOU to be mixed
const ain_add = '';
const ain_secret = '';
const bin_add = '';
const bin_secret = '';
const cin_add = '';
const cin_secret = '';
const din_add = '';
const din_secret = '';
const ein_add = '';
const ein_secret = '';


//Users output wallets
//You need to set these wallets whith those ones where users will receive 
//their mixed IOU
const aout_add = '';
const aout_secret = '';
const bout_add = '';
const bout_secret = '';
const cout_add = '';
const cout_secret = '';
const dout_add = '';
const dout_secret = '';
const eout_add = '';
const eout_secret = '';



//Gateway wallet
const gw_add = '';



///////
//Variables


const w_in = 1  // To notify functions to do operations regarding input shared wallet
const w_out = 2  // To notify functions to do operations regarding output shared wallet

//Include here the shared input wallet. This can be created with calculateAddress function
const win_add = '';

//Include here the shared output wallet. This can be created with calculateAddress function
const wout_add = '';


//////////
//Transactions structures
//Payment in XRP
const payment = {
  source: {
    address: '', //source wallet
    maxAmount: {
      value: '', //source amount
      currency: 'XRP'
    }
  },
  destination: {
    address: , //destination wallet
    amount: {
      value: '', //destination amount (most of the cases is the same as source amount)
      currency: 'XRP'
    }
  }
};


const settings = {
  "defaultRipple" : true
};


//Create a trust line
const trustline = {
  "currency": "", //curenncy (3 letters)
  "counterparty": "", //counterparty in the credit link
  "limit": "0",  //upper limit in the credit link
  "qualityIn": 1.0, // change these values to set fees for the transaction
  "qualityOut": 1.0,
  "ripplingDisabled": true, //Disabled rippling by default (see paper for details)
  "frozen": false, //See Ripple documentation for details about this field
  "memos": [ //Memo field (can be set to empty)
    {
      "type": "PathShuffletest",
      "format": "plain/text",
      "data": "texted data"
    }
  ]
};


//Create a IOU payment
const payment_path = {
  "source": {
    "address": '', //Source wallet
    "maxAmount": { 
      "value": "", //Source amount
      "currency": "", //Source currency
      "counterparty": "" //First wallet in the payment path
    }
  },
  "destination": { 
    "address": "", //Destionation wallet
    "amount": {
      "value": "", //Destionation amount (the same as source amount if no fees)
      "currency": "", //Destination currency (the same as source currency)
      "counterparty": ""  //The wallet before the destination in payment path
    }
  },
  "paths": '' //Path field as obtained from getpaths function in ripple-lib (see https://github.com/ripple/ripple-lib/blob/develop/docs/index.md)
};


//Structure to call getpaths in ripple-lib (see https://github.com/ripple/ripple-lib/blob/develop/docs/index.md)
const pathfind = {
  "source": {
    "address": "" //source wallet
  },
  "destination": {
    "address": "", //destination wallet
    "amount": {
      "currency": "PSH", //destination currency
      "value" : "41", //destination amount
      "counterparty" : "" //last hop before destination in the payment path
    }
  }
};


//////Auxiliary functions
function hash(message) {
  return hashjs.sha512().update(message).digest().slice(0, 32);
}



function bytesToHex(a) {
  return a.map(function(byteValue) {
    const hex = byteValue.toString(16).toUpperCase();
    return hex.length > 1 ? hex : '0' + hex;
  }).join('');
}

function quit(message) {
  console.log(message);
  process.exit(0);
}

function fail(message) {
  console.error(message);
  console.log("Disconnecting");
  api.disconnect();
  process.exit(1);
}



//Generate a fresh key from a secret string
function generateKey(secret_param) {
	const priv = keypairs.deriveKeypair(secret_param).privateKey;
    const raw = keypairs.myHexToBytes(priv).slice(1);
    
    const key = Ed25519.keyFromSecret(raw);
    return key;
}


//Calculate the id of a shared wallet
function calculateAddress(wallet_id) {
	if (wallet_id == w_in) {
		const secret1 = wala_in_secret;
		const secret2 = walb_in_secret;
		const secret3 = walc_in_secret;
		const secret4 = wald_in_secret;
		const secret5 = wale_in_secret;
		
		const key1 = generateKey(secret1);
		const key2 = generateKey(secret2);
		const key3 = generateKey(secret3);
		const key4 = generateKey(secret4);
		const key5 = generateKey(secret5);


		var key_all_pub = key1.pub().add(key2.pub().add(key3.pub().add(key4.pub().add(key5.pub()))));
		var key_total = Ed25519.keyFromPublic(key_all_pub);

		var my_address = keypairs.deriveAddress('ED' + bytesToHex(key_total.pubBytes()));

		console.log("address for shared wallet is");
		console.log(my_address);

	}
	else if (wallet_id == w_out) {
		const secret1 = wala_out_secret;
		const secret2 = walb_out_secret;
		const secret3 = walc_out_secret;
		const secret4 = wald_out_secret;
		const secret5 = wale_out_secret;
		
		const key1 = generateKey(secret1);
		const key2 = generateKey(secret2);
		const key3 = generateKey(secret3);
		const key4 = generateKey(secret4);
		const key5 = generateKey(secret5);


		var key_all_pub = key1.pub().add(key2.pub().add(key3.pub().add(key4.pub().add(key5.pub()))));
		var key_total = Ed25519.keyFromPublic(key_all_pub);

		var my_address = keypairs.deriveAddress('ED' + bytesToHex(key_total.pubBytes()));

		console.log("address for shared wallet is");
		console.log(my_address);
	}

	
}


//Compute the signature on a transaction involving a shared wallet
function computeSignature(wallet_id, txJSON) {
  
  if (wallet_id == w_in) {
	console.log ("Signing a transaction for Wallet in");
    const random_1 = Ed25519.computeR(Math.random().toString()); 
	const random_2 = Ed25519.computeR(Math.random().toString()); 
	const random_3 = Ed25519.computeR(Math.random().toString()); 
	const random_4 = Ed25519.computeR(Math.random().toString()); 
	const random_5 = Ed25519.computeR(Math.random().toString()); 
	
	var random_all = random_1.R.add(random_2.R.add(random_3.R.add(random_4.R.add(random_5.R))));
	

	const secret1 = wala_in_secret;
	const secret2 = walb_in_secret;
	const secret3 = walc_in_secret;
	const secret4 = wald_in_secret;
	const secret5 = wale_in_secret;
	
	var key1 = generateKey(secret1);
	var key2 = generateKey(secret2);
	var key3 = generateKey(secret3);
	var key4 = generateKey(secret4);
	var key5 = generateKey(secret5);

	
	var key_all_pub = key1.pub().add(key2.pub().add(key3.pub().add(key4.pub().add(key5.pub()))));
	var key_total = Ed25519.keyFromPublic(key_all_pub);

	
	txJSON.SigningPubKey = 'ED' + bytesToHex(key_total.pubBytes());
	var signingData = keypairs.myHexToBytes(binary.encodeForSigning(txJSON));
	
	var my_address = keypairs.deriveAddress('ED' + bytesToHex(key_total.pubBytes()));

	console.log("Win address is");
	console.log(my_address);

	
	var share_1 = Ed25519.sign_share(signingData, key1.priv(), random_1.r, random_all, key_total.pubBytes());
	var share_2 = Ed25519.sign_share(signingData, key2.priv(), random_2.r, random_all, key_total.pubBytes());
	var share_3 = Ed25519.sign_share(signingData, key3.priv(), random_3.r, random_all, key_total.pubBytes());
	var share_4 = Ed25519.sign_share(signingData, key4.priv(), random_4.r, random_all, key_total.pubBytes());
	var share_5 = Ed25519.sign_share(signingData, key5.priv(), random_5.r, random_all, key_total.pubBytes());
	
	var total_s = Ed25519.add_shares(share_1, Ed25519.add_shares(share_2, Ed25519.add_shares(share_3, Ed25519.add_shares(share_4, share_5))));
	
	var signature = Ed25519.encodeSignature(random_all, total_s);
	console.log("Signature verification");
	console.log(Ed25519.verify(signingData, signature, key_total));
	return signature;
  }
  else if (wallet_id == w_out) {
	console.log ("Signing a transaction for Wallet out");
    const random_1 = Ed25519.computeR(Math.random().toString()); 
	const random_2 = Ed25519.computeR(Math.random().toString()); 
	const random_3 = Ed25519.computeR(Math.random().toString()); 
	const random_4 = Ed25519.computeR(Math.random().toString()); 
	const random_5 = Ed25519.computeR(Math.random().toString()); 
	var random_all = random_1.R.add(random_2.R.add(random_3.R.add(random_4.R.add(random_5.R))));
	  


	const secret1 = wala_out_secret;
	const secret2 = walb_out_secret;
	const secret3 = walc_out_secret;
	const secret4 = wald_out_secret;
	const secret5 = wale_out_secret;
	
	const key1 = generateKey(secret1);
	const key2 = generateKey(secret2);
	const key3 = generateKey(secret3);
	const key4 = generateKey(secret4);
	const key5 = generateKey(secret5);


	var key_all_pub = key1.pub().add(key2.pub().add(key3.pub().add(key4.pub().add(key5.pub()))));
	var key_total = Ed25519.keyFromPublic(key_all_pub);

	
	txJSON.SigningPubKey = 'ED' + bytesToHex(key_total.pubBytes());
	const signingData = keypairs.myHexToBytes(binary.encodeForSigning(txJSON));
	
	var my_address = keypairs.deriveAddress('ED' + bytesToHex(key_total.pubBytes()));

	console.log("Wout address is");
	console.log(my_address);



	const share_1 = Ed25519.sign_share(signingData, key1.priv(), random_1.r, random_all, key_total.pubBytes());
	const share_2 = Ed25519.sign_share(signingData, key2.priv(), random_2.r, random_all, key_total.pubBytes());
	const share_3 = Ed25519.sign_share(signingData, key3.priv(), random_3.r, random_all, key_total.pubBytes());
	const share_4 = Ed25519.sign_share(signingData, key4.priv(), random_4.r, random_all, key_total.pubBytes());
	const share_5 = Ed25519.sign_share(signingData, key5.priv(), random_5.r, random_all, key_total.pubBytes());

	var total_s = Ed25519.add_shares(share_1, Ed25519.add_shares(share_2, Ed25519.add_shares(share_3, Ed25519.add_shares(share_4, share_5))));
	console.log(total_s);

	const signature = Ed25519.encodeSignature(random_all, total_s);
	console.log("Signature verification");
	console.log(Ed25519.verify(signingData, signature, key_total));
	return signature;
	  
  }
  
}


//Wrapper function to sign a transaction using a shared wallet
function wrapper_sign(wallet_id, txJSON) {
  const tx = JSON.parse(txJSON);
  
  
  tx.TxnSignature = computeSignature(wallet_id, tx);
  const serialized = binary.encode(tx);
  return {
    signedTransaction: serialized,
    id: serialized
  };
}




///////Main function

//First connect to the server
api.connect().then(() => {
	
	
//Useful ripple-lib calls to track the state of the network	
/*	 console.log('Connected...');
	return api.getSettings(wtwo_add).then(settings => {
	console.log(settings);
	console.log(JSON.stringify(settings, null, 2));
	quit("Done!");
	});	
*/
	
/*  console.log('Connected...');
  return api.getBalances(wout_add).then(balances => {
    console.log(JSON.stringify(balances, null, 2));
    quit("Done!");
  });	
*/	


/*  console.log('Connected...');
  return api.getTrustlines(win_add).then(trustlines =>{
    console.log(JSON.stringify(trustlines, null, 2));
    quit("Done!");
  });	
*/

/*
  console.log('Connected...');
  return api.getPaths(pathfind)
  .then(paths => {
	  console.log(paths)
	  quit("Done!");

  });
*/
  


  ////Use this piece of code to submit a transaction with a non-shared wallet
  //return api.preparePayment(wallet, payment, instructions).then(prepared => { 
  //api.submit(api.sign(prepared.txJSON, ein_secret)["signedTransaction"]).then(quit, fail);
  //});
  
   ////Use this piece of code to set a link with a non-shared wallet
  //return api.prepareTrustline(wallet, trustline).then(prepared => {
  //api.submit(api.sign(prepared.txJSON, ein_secret)["signedTransaction"]).then(quit, fail);
  //});
  
  
  
  
  
  ////Use this piece of code to submit a transaction with a shared wallet
  return api.preparePayment(win_add, payment_path, instructions).then(prepared => {
    console.log('Payment transaction prepared...');
    console.log('Transaction');
    console.log(prepared.txJSON);
    const signedTransaction = wrapper_sign(w_in, prepared.txJSON);
    console.log('Payment transaction signed...');
    
    console.log(binary.decode(signedTransaction["signedTransaction"]));
    
    console.log("signature is");
    console.log(signedTransaction["signedTransaction"]);
     
    api.submit(signedTransaction["signedTransaction"]).then(quit, fail);
  });
  
  
  ////Use this piece of code to set a credit link with a shared wallet
  /*return api.prepareTrustline(wallet, trustline).then(prepared => {
    console.log('Payment transaction prepared...');
    console.log('Transaction');
    console.log(prepared.txJSON);
    const signedTransaction = wrapper_sign(w_in, prepared.txJSON);
    console.log('Payment transaction signed...');
    
    console.log(binary.decode(signedTransaction["signedTransaction"]));
    
    console.log("signature is");
    console.log(signedTransaction["signedTransaction"]);
     
    api.submit(signedTransaction["signedTransaction"]).then(quit, fail);
  });*/
  
}).catch(fail);

