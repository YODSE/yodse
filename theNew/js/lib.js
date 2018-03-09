var MAINET_RPC_URL = 'https://mainnet.infura.io/metamask' ;
var ROPSTEN_RPC_URL = 'https://ropsten.infura.io/metamask' ;
var KOVAN_RPC_URL = 'https://kovan.infura.io/metamask' ;
var RINKEBY_RPC_URL = 'https://rinkeby.infura.io/metamask' ;

var CURRENT_URL = RINKEBY_RPC_URL ;



const contractAddress   = "0x6dad0f29eb06c419eb32c78736981ce03533f8e0";

const contractABI = [
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "investors",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "tokenFOrSale",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "symbol",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "string"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "startPreIcoDate",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "startIcoDate",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [
                    			{
                    				"name": "",
                    				"type": "address"
                    			}
                    		],
                    		"name": "tokenFrozenConsult",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "owner",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "address"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [
                    			{
                    				"name": "",
                    				"type": "address"
                    			}
                    		],
                    		"name": "onChain",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "bool"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "name",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "string"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "isFinalized",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "bool"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "weisRaised",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [
                    			{
                    				"name": "",
                    				"type": "address"
                    			}
                    		],
                    		"name": "tokenFrozenReserve",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "hardCapPreIco",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [
                    			{
                    				"name": "",
                    				"type": "address"
                    			}
                    		],
                    		"name": "tokenFrozenTeam",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "hardCapMainISale",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"name": "tokenHolders",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "address"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "buyPrice",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [
                    			{
                    				"name": "",
                    				"type": "address"
                    			}
                    		],
                    		"name": "balanceOf",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "endPreIcoDate",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "totalSupply",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "endIcoDate",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "avaliableSupply",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [],
                    		"name": "decimals",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"constant": true,
                    		"inputs": [
                    			{
                    				"name": "",
                    				"type": "address"
                    			}
                    		],
                    		"name": "balances",
                    		"outputs": [
                    			{
                    				"name": "",
                    				"type": "uint256"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "view",
                    		"type": "function"
                    	},
                    	{
                    		"anonymous": false,
                    		"inputs": [
                    			{
                    				"indexed": true,
                    				"name": "from",
                    				"type": "address"
                    			},
                    			{
                    				"indexed": false,
                    				"name": "value",
                    				"type": "uint256"
                    			}
                    		],
                    		"name": "Burn",
                    		"type": "event"
                    	},
                    	{
                    		"inputs": [],
                    		"payable": false,
                    		"stateMutability": "nonpayable",
                    		"type": "constructor"
                    	},
                    	{
                    		"constant": false,
                    		"inputs": [
                    			{
                    				"name": "_to",
                    				"type": "address"
                    			}
                    		],
                    		"name": "withdrawEthFromContract",
                    		"outputs": [],
                    		"payable": false,
                    		"stateMutability": "nonpayable",
                    		"type": "function"
                    	},
                    	{
                    		"constant": false,
                    		"inputs": [],
                    		"name": "distributionTokens",
                    		"outputs": [],
                    		"payable": false,
                    		"stateMutability": "nonpayable",
                    		"type": "function"
                    	},
                    	{
                    		"anonymous": false,
                    		"inputs": [],
                    		"name": "Finalized",
                    		"type": "event"
                    	},
                    	{
                    		"anonymous": false,
                    		"inputs": [
                    			{
                    				"indexed": true,
                    				"name": "from",
                    				"type": "address"
                    			},
                    			{
                    				"indexed": true,
                    				"name": "to",
                    				"type": "address"
                    			},
                    			{
                    				"indexed": false,
                    				"name": "value",
                    				"type": "uint256"
                    			}
                    		],
                    		"name": "Transfer",
                    		"type": "event"
                    	},
                    	{
                    		"constant": false,
                    		"inputs": [
                    			{
                    				"name": "_to",
                    				"type": "address"
                    			},
                    			{
                    				"name": "_value",
                    				"type": "uint256"
                    			}
                    		],
                    		"name": "transfer",
                    		"outputs": [],
                    		"payable": false,
                    		"stateMutability": "nonpayable",
                    		"type": "function"
                    	},
                    	{
                    		"constant": false,
                    		"inputs": [
                    			{
                    				"name": "",
                    				"type": "address"
                    			}
                    		],
                    		"name": "tokenTransferFromHolding",
                    		"outputs": [],
                    		"payable": false,
                    		"stateMutability": "nonpayable",
                    		"type": "function"
                    	},
                    	{
                    		"constant": false,
                    		"inputs": [],
                    		"name": "finalize",
                    		"outputs": [],
                    		"payable": false,
                    		"stateMutability": "nonpayable",
                    		"type": "function"
                    	},
                    	{
                    		"payable": true,
                    		"stateMutability": "payable",
                    		"type": "fallback"
                    	},
                    	{
                    		"constant": false,
                    		"inputs": [
                    			{
                    				"name": "newEndIcoDate",
                    				"type": "uint256"
                    			}
                    		],
                    		"name": "setEndData",
                    		"outputs": [],
                    		"payable": false,
                    		"stateMutability": "nonpayable",
                    		"type": "function"
                    	},
                    	{
                    		"constant": false,
                    		"inputs": [
                    			{
                    				"name": "_value",
                    				"type": "uint256"
                    			}
                    		],
                    		"name": "burn",
                    		"outputs": [
                    			{
                    				"name": "success",
                    				"type": "bool"
                    			}
                    		],
                    		"payable": false,
                    		"stateMutability": "nonpayable",
                    		"type": "function"
                    	}
                    ];


$(document).ready(function(){

    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider(CURRENT_URL));
    }

    var myContract = web3.eth.contract(contractABI);
    var myContractInstance = myContract.at(contractAddress);


    var availableSupply = 0;
    var totalSupply = 0;
    var investors = 0;
    var buyPrice = 0;
    var weisRaised = 0;
    var hardCapMainISale = 0;


    myContractInstance.avaliableSupply(function(err, res){
        var avaliableSupply = res['c'][0].toString() //+ res['c'][1].toString();
        $('#avaliableSupply').html(avaliableSupply);
        console.log(avaliableSupply);
    });

     myContractInstance.totalSupply(function(err, res){
              var totalSupply = res['c'][0].toString();
              $('#totalSupply').html(totalSupply);
              console.log(totalSupply);
          });
 myContractInstance.buyPrice(function(err, res){
          var buyPrice = res['c'][0].toString();// + res['c'][1].toString();
          $('#buyPrice').html(buyPrice);
          console.log(buyPrice);
      });
myContractInstance.weisRaised(function(err, res){
          var weisRaised = web3.fromWei(res , 'ether');// + res['c'][1].toString();
          weisRaised = weisRaised['c'][0].toString();
          $('#weisRaised').html(weisRaised);
          console.log(weisRaised);
      });

      myContractInstance.hardCapMainISale(function(err, res){
                   var hardCapMainISale = web3.fromWei(res , 'ether');// + res['c'][1].toString();
                   hardCapMainISale = hardCapMainISale['c'][0].toString();
                   $('#hardCapMainISale').html(hardCapMainISale);
                   console.log(hardCapMainISale);
               });

      myContractInstance.investors(function(err, res){
          var investors = res['c'][0].toString();
          $('#investors').html(investors);
      });
});