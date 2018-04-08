pragma solidity ^0.4.18;

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";

contract DollardPriceContract is usingOraclize {  // добавлены функции __callback, updatedPrice

    uint public ethusdPrice;  // цена которую мы парсим из Kraken
    uint public tokenPrice; // пересчитаная цена токена
    uint public tokenNomianl;// номинал токена в usd
     uint256 public decimals = 2;
    uint256 DEC = 10 ** uint256(decimals);
    event updatedPrice(string price);
    event newOraclizeQuery(string description);

    function DollardPriceContract() payable {  // функция принимает бабки и отправляет значение обратно, ее надо сделать публичной и тогда можно убрать другую
        updatePrice();
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) throw;
        ethusdPrice  = parseInt(result, 1);
        updatedPrice(result);
        updatePrice();
    }

    function  () public payable {
    }

    function updatePrice() payable {

         uint256 _tokenPrice = tokenNomianl.mul(DEC).div(ethusdPrice);
        if (oraclize_getPrice("URL") > this.balance) {
            newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query(43200, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.[0]");
        }
    }

    function sell(address _investor, uint256 amount) internal
    {
        uint256 _tokenPrice = tokenNomianl.mul(DEC).div(ethusdPrice);

    }
}









/**
* Обновляемый оракул каждые 60 секунд с вызовом при инициализации
*/


pragma solidity ^0.4.21;

import "https://github.com/oraclize/ethereum-api/oraclizeAPI_0.5.sol";

contract DollarCost is usingOraclize {

    uint public dollarCost;

    event newOraclizeQuery(string description);
    event newPriceTicker(uint price);

    function DollarCost() {
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        update();
    }

    function __callback(bytes32 myid, string result, bytes proof) public {// В эту функцию ораклайзер будет присылать нам результат

        if (msg.sender != oraclize_cbAddress()) throw;// Проверяем, что функцию действительно вызывает ораклайзер
        dollarCost = parseInt(result, 0);// Обновляем переменную со стоимостью доллара
        newPriceTicker(dollarCost);
        update();
    }

    function update() /* public */ payable {
        if (oraclize_getPrice("URL") > this.balance){ // Проверяем, что хватает средств на вызов функции
            newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
            return;
        } else {
            newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
            oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.[0]");
        }
    }
}










