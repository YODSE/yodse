/*
PreICO

Покупатели токенов на pre-ICO и ICO на любую сумму становятся участниками реферальной программы, и им выплачивается вознаграждение в размере 5% от суммы покупок привлеченных рефералов.
Первым покупателям токенов на pre-ICO и ICO на сумму не менее 1000 USD будет предусмотрен повышенный реферальный процент по сравнению с обычными держателями токенов и составит 7%.
Реферальный фонд токенов в размере 10% от общего выпущенного количества блокируется до 01.01.2019г. (за исключением реферальных выплат в период pre-ICO и ICO),и дальнейшие выплаты рефералам будут доступны с 01.01.2019г. в соответствии с реферальной программой.

+ Оракул, меняющий цену 2 раза в сутки(сделано)

+ блокмрованме средств реферальых
*/

pragma solidity ^0.4.21;

import "https://github.com/oraclize/ethereum-api/oraclizeAPI_0.5.sol";
/*
* @author Ivan Borisov (2622610@gmail.com) (Github.com/pillardevelopment)
* @dev Source code hence -
* https://github.com/PillarDevelopment/Barbarossa-Git/blob/master/contracts/BarbarossaInvestToken.sol
*
*/
/*********************************************************************************************************************
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
import "https://github.com/oraclize/ethereum-api/oraclizeAPI_0.5.sol";

library SafeMath {

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

contract Ownable {
    address public owner;

    function Ownable() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}

contract TokenERC20 is Ownable {
    using SafeMath for uint;

    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 DEC = 10 ** decimals;
    address public owner;  //0x6a59CB8b2dfa32522902bbecf75659D54dD63F95
    // all tokens
    uint256 public totalSupply;
    // tokens for sale
    uint256 public avaliableSupply;  // totalSupply - all reserve

    mapping (address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);

    function TokenERC20(
        uint256 initialSupply,
        string tokenName,
        string tokenSymbol
    ) public
    {
        totalSupply = initialSupply * DEC;  // Update total supply with the decimal amount
        balanceOf[this] = totalSupply;                // Give the creator all initial tokens
        avaliableSupply = balanceOf[this];            // Show how much tokens on contract
        name = tokenName;                                   // Set the name for display purposes
        symbol = tokenSymbol;                               // Set the symbol for display purposes
        owner = msg.sender;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != 0x0);
        require(balanceOf[_from] >= _value);
        require(balanceOf[_to] + _value > balanceOf[_to]);
        uint previousBalances = balanceOf[_from] + balanceOf[_to];
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    function transfer(address _to, uint256 _value) public {
        _transfer(msg.sender, _to, _value);
    }

    function burn(uint256 _value) public onlyOwner returns (bool success) {
        require(balanceOf[msg.sender] >= _value);   // Check if the sender has enough
        balanceOf[msg.sender] -= _value;            // Subtract from the sender
        totalSupply -= _value;                      // Updates totalSupply
        avaliableSupply -= _value;
        emit Burn(msg.sender, _value);
        return true;
    }
}
/*********************************************************************************************************************
----------------------------------------------------------------------------------------------------------------------
* @dev YodseCrowdsale contract
*/
contract YodseCrowdsale is TokenERC20, usingOraclize {
    using SafeMath for uint;

    uint public constant softcapPreSale = 1000000*1e18; // 1,000,000 USD

    uint public constant hardCapPreIco = 3000000*1e18; // 3,000,000 USD

    uint public constant softCapMainSale = 7000000*1e18; // 7,000,000 USD

    uint public constant hardCapMainISale = 40000000*1e18; // 40,000,000 USD


    // address beneficiary 0x6a59CB8b2dfa32522902bbecf75659D54dD63F95
    address beneficiary = 0x6a59cb8b2dfa32522902bbecf75659d54dd63f95;

    uint public startPreIcoDate = 1523754000; // 04/15/2018 @ 1:00am (UTC)
    uint public endPreIcoDate = 1525050000; // 04/30/2018 @ 1:00am (UTC)

    uint public startIcoDate = 1526346000; // 05/15/2018 @ 1:00am (UTC)
    uint public endIcoDate = 1529888400; // 06/25/2018 @ 1:00am (UTC)

    // Supply for team and developers
    uint256 constant teamReserve = 15000000; //15 000 000
    // Supply for advisers, consultants and other
    uint256 constant consultReserve = 6000000; //6 000 000
    // Supply for Reserve fond
    uint256 constant referalFund = 10000000;// 10 000 000
    // tokens for contingency fund
    uint256 constant marketingReserve = 6000000; //6 000 000

    // tokens for bounty programs
    uint256 constant bountyReserve = 3000000; //3 000 000

    // variable counts the number of investors after call sell function.
    uint256 public investors;

    uint256 public etherBuyPrice; //0,001 ether
    uint256 public tokenNominal = 1000000000000000000; // 1 token = 1 USD
    uint public usdToEther;

    address team = 0xcc2fb3e7f4bc1b8948fa5163319cfe728dd1a471;
    address referal = 0x7c2c0ae6bac57e7d01198e6024b181f04e109faf;
    address consult = 0x135a7a2986ae47c8b054f1e0e1f1e0be0f58435b;
    address marketing = 0xb76329f2531675e8b3b2873d68c452d83aae072c;
    address bounty = 0xd340b5fcabf905f82ab5bb199925adcba11adcdb;

    bool distribute = false;
    uint public weisRaised;
    bool public isFinalized = false;

    event Finalized();
    event newOraclizeQuery(string description);
    event newPriceTicker(uint price);
    event AuthorizedReferer(address _referer, uint256 _time);

    mapping (address => bool) public onChain;
    address[] public tokenHolders;  // tokenHolders.length
    mapping(address => uint) public balances; // храним адрес инвестора и исколь он инвестировал
    mapping(address => uint) public tokenFrozenTeam; // safe address developers
    mapping(address => uint) public tokenFrozenReserve; // safe address ReserveFond
    mapping(address => uint) public tokenFrozenConsult; // safe address advisers
    mapping(address => uint256) public investedEther;
    mapping(address=>bool) public refererlist;


    function YodseCrowdsale() public TokenERC20(100000000, "Your Open Direct Sales Ecosystem", "YODSE") {

    }

    modifier isUnderHardCap() {
        require( weisRaised <= hardCapMainISale);
        _;
    }

    modifier holdersSupport() { //чьи заморож токены остались (team, consult, reserve, bounty)
        require(msg.sender == team || msg.sender == referal || msg.sender == consult /*msg.sender==bounty*/);
        _;
    }

    function sell(address _investor, uint256 amount) internal {
        uint256 _amount = amount.mul(DEC).div(etherBuyPrice);
        // token discount PreIco (15 - 30 april  2018) 30%
        if (now > startPreIcoDate && now < endPreIcoDate) {
            _amount = _amount.add(withDiscount(_amount, 30));
            // 1526346000
            // token discount ICO 15.05.2018 - 25.05.2018 - 20%
        } else if (now > startIcoDate && now < startIcoDate + 864000) { // 864000 = 10 days
            _amount = _amount.add(withDiscount(_amount, 20));

            // token discount ICO 25.05.2018 - 05.06.2018 - 15%
        } else if (now >= startIcoDate + 864000 && now < startIcoDate + 1814400) {
            _amount = _amount.add(withDiscount(_amount, 15));

            // token discount ICO 05.06.2018 - 12.06.2018 - 10%
        } else if (now >= startIcoDate + 1814400 && now < startIcoDate + 2419200) {
            _amount = _amount.add(withDiscount(_amount, 10));

            // token discount ICO 12.06.2018 - 17.06.2018 - 5%
        } else if (now >= startIcoDate + 2419200 && now < startIcoDate + 2851200) {
            _amount = _amount.add(withDiscount(_amount, 5));

            // token discount ICO 17.06.2018 - 25.06.2018 - 3%
        } else if (now >= startIcoDate + 2851200 && now < endIcoDate) {
            _amount = _amount.add(withDiscount(_amount, 3));


        } else {
            _amount = _amount.add(withDiscount(_amount, 0));
        }
        require(amount > avaliableSupply); // проверка что запрашиваемое количество токенов меньше чем есть на балансе
        avaliableSupply -= _amount;
        _transfer(this, _investor, _amount);
        if (!onChain[msg.sender]) {
            tokenHolders.push(msg.sender);
            onChain[msg.sender] = true;
        }
        investors = tokenHolders.length;
    }

    function withDiscount(uint256 _amount, uint _percent) internal pure returns (uint256) {
        return ((_amount * _percent) / 100);
    }
    // функция изменения даты окончания ICO собственником контракта
    function setEndData(uint newEndIcoDate) public onlyOwner {
        endIcoDate  = newEndIcoDate;
    }
    // функция для отправки эфира с контракта
    function withdrawEthFromContract(address _to) public onlyOwner
    {
        //require(weisRaised >= softCapMainSale); // проверка когда можно вывести эфир
        _to.transfer(weisRaised);
    }
    // функция payable для отправки эфира на адрес
    function () isUnderHardCap public payable {
        require(now > startPreIcoDate && now < endIcoDate);
        sell(msg.sender, msg.value);
        // проверка что отправляемые средства >= 0,001 ethereum
        assert(msg.value >= 1 ether / 1000);
        //beneficiary.transfer(msg.value); // средства отправляюся на адрес бенефециара
        // добавляем получаные средства в собранное
        weisRaised = weisRaised.add(msg.value);
        // добавляем в адрес инвестора количество инвестированных эфиров
        balances[msg.sender] = balances[msg.sender].add(msg.value);
        //investors  += 1;
        investedEther[msg.sender] = investedEther[msg.sender].add(msg.value);
        inRefererList(msg.sender);
    }

    function finalize() onlyOwner public {
        require(!isFinalized);
        require(now > endIcoDate);

        finalization();
        emit Finalized();

        isFinalized = true;
        emit Burn(msg.sender, avaliableSupply);
    }

    function finalization() internal pure {
    }

    function distributionTokens() public onlyOwner {
        require(!distribute);
        _transfer(this, beneficiary, 21500000*DEC); // frozen all
        _transfer(this, team, 7500000*DEC); // immediately Team 1/2
        tokenFrozenTeam[team] = tokenFrozenTeam[team].add(7500000*DEC);
        _transfer(this, consult, 2000000*DEC); // immediately advisers 1/3
        tokenFrozenConsult[consult] = tokenFrozenConsult[consult].add(4000000*DEC); // в меппинг кладем 6 000 000 - 4 000 000

        _transfer(this, marketing, marketingReserve*DEC); // immediately marketing all
        _transfer(this, bounty, bountyReserve*DEC);
        tokenFrozenReserve[referal] = tokenFrozenReserve[referal].add(10000000*DEC);  // immediately reserve all
        avaliableSupply -= 40000000*DEC;
        distribute = true;
    }
    // функция выдачи замороженных токенов членам команды
    function tokenTransferFromHolding(address) public  holdersSupport {
        require(now > endIcoDate);
        // !!! reserve - 10 000 000 после 1.1.2019
        if (msg.sender == referal && now > 1546300801) { // 1546300801 -  01/01/2019 @ 12:00am (UTC)
            require(tokenFrozenReserve[referal] == 10000000*DEC);  // не может быть меньше так как даже если они выведут токены - на меппинг это не отразится
            //require(tokenFrozenReserve[reserve] == 7500000*DEC;);
            _transfer(beneficiary, referal, 10000000*DEC);
            balanceOf[beneficiary] = balanceOf[beneficiary].sub(10000000*DEC); // списали с бенефициара
            tokenFrozenReserve[referal] = 0; // списали с мепинга и сделали его == 0 чтобы второй раз не вывели
        }
        // !!! team - 7 500 000 после 1.1.2020
        else if (msg.sender == team /* */ && now > 1577836801) { // 1577836801 - 01/01/2020 @ 12:00am (UTC)
            require(tokenFrozenTeam[team] == 7500000*DEC);  // не может быть меньше так как даже если они выведут токены - на меппинг это не отразится
            //tokenFrozenTeam[team] == 0;
            _transfer(beneficiary, team, 7500000*DEC); // перевели еще токены
            balanceOf[beneficiary] = balanceOf[beneficiary].sub(7500000*DEC); // списали с бенефициара
            tokenFrozenTeam[team] = 0; // списали с мепинга и сделали его == 0 чтобы второй раз не вывели
        }
        // !!! consult - 2 000 000 после 1.9.2018
        else if (msg.sender == consult && now > 1535760001) { // 1535760001 - 09/01/2018 @ 12:00am (UTC)
            require(tokenFrozenConsult[consult] == 4000000*DEC); // не может быть меньше так как даже если они выведут токены - на меппинг это не отразится
            _transfer(beneficiary, consult, 2000000*DEC);
            balanceOf[beneficiary] = balanceOf[beneficiary].sub(2000000*DEC); // списали с бенефициара
            tokenFrozenConsult[consult] = tokenFrozenConsult[consult].sub(2000000*DEC); // списали с мепинга и уменьшили его до 2 000 000 чтобы прошел следующую проверку после  1.1.2019
        }
        // и 2 000 000 после 1.1.2019
        else if (msg.sender == consult && now > 1546300801) { // 1546300801 -  01/01/2019 @ 12:00am (UTC)
            require(tokenFrozenConsult[consult] == 2000000*DEC); // не может быть меньше так как даже если они выведут токены - на меппинг это не отразится
            _transfer(beneficiary, consult, 2000000*DEC);
            balanceOf[beneficiary] = balanceOf[beneficiary].sub(2000000*DEC); // списали с бенефициара
            tokenFrozenConsult[consult] = 0; // списали с мепинга и сделали его == 0 чтобы второй раз не вывели
        }
    }

    function __callback(bytes32 myid, string result) public {
        if (msg.sender != oraclize_cbAddress()) throw;
        usdToEther = parseInt(result, 0);
        updatePriceUsdToEther();
        etherBuyPrice = tokenNominal/usdToEther;
        emit newPriceTicker(usdToEther);
    }

    function updatePriceUsdToEther() payable public onlyOwner  {
        if (oraclize_getPrice("URL") > this.balance ){
            emit newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
            return;
        } else {
            emit newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
            oraclize_query(200, "URL", "json(https://min-api.cryptocompare.com/data/pricehistorical?fsym=ETH&tsyms=USD ).ETH.USD");
        }
    }
    // в случае ошибки при вызове оракула
    function manualPriceUpdate(uint _usdPrice) public onlyOwner {
        usdToEther = _usdPrice;
        etherBuyPrice = tokenNominal.div(usdToEther);
    }

    function refundPreICO() public {
        require(weisRaised*usdToEther < softcapPreSale && now > endPreIcoDate);
        require(investedEther[msg.sender] > 0);
        uint rate = investedEther[msg.sender];
        investedEther[msg.sender] = 0;
        msg.sender.transfer(rate);
        weisRaised = weisRaised.sub(rate);
    }

    function inRefererList(address referer) internal{
        require(!isRefererlisted(referer));
        refererlist[referer] = true;
        emit AuthorizedReferer(referer, now);
    }

    function isRefererlisted(address referer) public view returns(bool) {
        return refererlist[referer];
    }
}