# PathJoin
PathJoin: Enabling Atomic Transactions in Ripple

###Disclaimer
This implementation is insecure! Do not use it with your credit! This implementation has been written purely to evaluate the feasibility of PathJoin.

A careful, full implementation is required before PathJoin can be used in practice. In particular, we require:

 - A full implementation of the distributed signature scheme (i.e., management of the shared wallets) in a distributed manner. 
 - A full implementation of the DiceMix protocol to use PathJoin for credit mixing. 
 
Still, you can download our prototype if you are interested in testing the PathJoin functionality. 
 
##Setup instructions

The prototype code is included in the test-pathjoin.js file. Follow these instructions to test PathJoin:


1. Install NodeJS and the Node Package Manager (npm). Most Linux distros have a package for NodeJS, but make sure you have version 0.12.0 or higher.
1. Use npm to install Babel globally: npm install -g babel
1. Use npm to install RippleAPI: npm install ripple-lib
1. Use npm to install all other dependencies required in the test-pathjoin.js script (see lines 27-34 in the code)
1. Copy the index.js file into node_modules/elliptic/lib/elliptic/eddsa/ (it contains the prototype  implementation of the distributed signature algorithm)
1. Fill the fields in the script test-pathjoin.js with the wallets in your experiment.
1. You can run the example with: babel-node test-pathjoin.js
