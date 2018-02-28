pragma solidity ^0.4.18;

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
library SafeMath {
    /**
    * @dev Multiplies two numbers, throws on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }
    /**
    * @dev Integer division of two numbers, truncating the quotient.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }
    /**
    * @dev Substracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }
    /**
    * @dev Adds two numbers, throws on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}
/*********************************************************************************************************************
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;
    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    function Ownable() public {
        owner = msg.sender;
    }
    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}
/*********************************************************************************************************************
* @dev see https://github.com/ethereum/EIPs/issues/20
*/
contract TokenERC20 is Ownable {
    using SafeMath for uint;

    string public name;
    string public symbol;
    uint256 public decimals = 8;
    uint256 DEC = 10 ** uint256(decimals);
    address public owner;  //0x6a59CB8b2dfa32522902bbecf75659D54dD63F95
    // all tokens
    uint256 public totalSupply;
    // tokens for sale
    uint256 public avaliableSupply;  // totalSupply - all reserve
    uint256 public constant buyPrice = 1000 szabo; //0,001 ether

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
        Transfer(_from, _to, _value);
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
        Burn(msg.sender, _value);
        return true;
    }
}
/*********************************************************************************************************************
----------------------------------------------------------------------------------------------------------------------
* @dev YodseCrowdsale contract
*/
contract YodseCrowdsale is TokenERC20 {
    using SafeMath for uint;
    // 1000 ether
    uint public constant softCapPreIco = 1000000000000000000000;
    // 3000 ether
    uint public constant hardCapPreIco = 3000000000000000000000;
    // 7000 ether
    uint public constant softCapMainSale = 7000000000000000000000;
    // 40 000 ether
    uint public constant hardCapMainISale = 40000000000000000000000;
    // address beneficiary 0x6a59CB8b2dfa32522902bbecf75659D54dD63F95
    address public beneficiary = 0x6a59CB8b2dfa32522902bbecf75659D54dD63F95;
    uint public startPreIcoDate = 1520208001; // Monday, 05-Mar-18 00:00:01 UTC
    uint public endPreIcoDate = 1521503999; // Monday, 19-Mar-18 23:59:59 UTC
    uint public startIcoDate = 1522281601; // Thursday, 29-Mar-18 00:00:01 UTC
    uint public endIcoDate = 1527811199; // Thursday, 31-May-18 23:59:59 UTC
    // Supply for team and developers
    uint256 constant teamReserve = 15000000; //15 000 000
    // Supply for advisers, consultants and other
    uint256 constant consultReserve = 6000000; //6 000 000
    // Supply for Reserve fond
    uint256 constant contingencyFund = 10000000;// 10 000 000
    // tokens for contingency fund
    uint256 constant marketingReserve = 5900000; //5 900 000
    // tokens for testers
    uint256 constant testReserve = 100000; // 100 000
    // tokens for bounty programs
    uint256 constant bountyReserve = 3000000; //3 000 000
    // variable counts the number of investora after call sell function.
    //uint256 public investors = 0;

    address team = 0x2Ab1dF22ef514ab94518862082E653457A5c1aFc; //  !!!! TEST ADDRESS
    address reserve = 0x7eDE8260e573d3A3dDfc058f19309DF5a1f7397E; //  !!!! TEST ADDRESS//
    address consult = 0x7c64258824cf4058AACe9490823974bdEA5f366e; //  !!!! TEST ADDRESS//
    address marketing = 0x7B97BF2df716932aaED4DfF09806D97b70C165d6; //  !!!! TEST ADDRESS//
    address bounty = 0xADc50Ae48B4D97a140eC0f037e85e7a0B13453C4; //  !!!! TEST ADDRESS//
    address test = 0x253579153746cD2D09C89e73810E369ac6F16115; //  !!!! TEST ADDRESS//

    bool distribute = false;
    //bool transferFrozen = false;
    uint public weisRaised;
    bool public isFinalized = false;

    event Finalized();

    mapping (address => bool) public onChain;
    address[] public tokenHolders;  // tokenHolders.length - вернет общее количество инвесторов
    mapping(address => uint) public balances; // храним адрес инвестора и исколь он инвестировал
    mapping(address => uint) tokenFrozenTeam; // храним адрес разработчиков
    mapping(address => uint) tokenFrozenReserve; // храним адрес резервного фонда
    mapping(address => uint) tokenFrozenConsult; // храним адрес Консультантов
    mapping(address => uint) tokenFrozenBounty; // храним адрес Баунти

    function YodseCrowdsale() public TokenERC20(100000000, "Your Open Direct Sales Ecosystem", "YODSE") {}

    modifier isUnderHardCap() {
        require(beneficiary.balance <= hardCapMainISale);
        _;
    }

    modifier holdersSupport() { //чьи заморож токены остались (team, consult, reserve, bounty)
        require(msg.sender == team || msg.sender == reserve || msg.sender == consult ||  msg.sender == bounty );
        _;
    }

    function sell(address _investor, uint256 amount) internal {
        uint256 _amount = amount.mul(DEC).div(buyPrice);

        // token discount PreIco (5 - 19 mart 2018) 30%
        if (now > startPreIcoDate && now < endPreIcoDate) {
            _amount = _amount.add(withDiscount(_amount, 30));

            // token discount ICO (1 - 10 april 2018) 20%
        } else if (now > startIcoDate && now < startIcoDate + 864000) { // 864000 = 10 days
            _amount = _amount.add(withDiscount(_amount, 20));

            // token discount ICO (11 - 20 april 2018) 15%
        } else if (now > startIcoDate + 864000 && now < startIcoDate + 1728000) {
            _amount = _amount.add(withDiscount(_amount, 15));

            // token discount ICO (21 - 30 april 2018) 10%
        } else if (now > startIcoDate + 1728000 && now < startIcoDate + 2592000) {
            _amount = _amount.add(withDiscount(_amount, 10));

            // token discount ICO (1 - 10 may 2018) 5%
        } else if (now > startIcoDate + 2592000 && now < startIcoDate + 3456000) {
            _amount = _amount.add(withDiscount(_amount, 5));

            // token discount ICO (11 - 31 may 2018) 3%
        } else if (now > startIcoDate + 3456001 && now < endIcoDate) {
            _amount = _amount.add(withDiscount(_amount, 3));

            // token discount ICO (11 - 31 may 2018) 0%
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
        require(weisRaised >= softCapMainSale); // проверка когда можно вывести эфир
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
    }

    // функция возврата средств инвесторам при недостижении SoftCapPreICO
    function refundPreICO() public {
        require(weisRaised < softCapPreIco && now > endPreIcoDate);
        uint value = balances[msg.sender];  //
        balances[msg.sender] = 0;
        msg.sender.transfer(value);
        weisRaised -= value;
    }
    // функция возврата средств инвесторам при недостижении SoftCapICO
    function refundICO() public {
        require(weisRaised < softCapMainSale && now > endIcoDate);
        uint value = balances[msg.sender];  //
        balances[msg.sender] = 0;
        msg.sender.transfer(value);
        weisRaised -= value;
    }
    /**
   * @dev Must be called after crowdsale ends, to do some extra finalization
   * work. Calls the contract's finalization function.
   */
    function finalize() onlyOwner public {
        require(!isFinalized); // нельзя вызвать второй раз (проверка что не true)
        require(now > endIcoDate || weisRaised > softCapMainSale);

        finalization();
        Finalized();

        isFinalized = true;
        Burn(msg.sender, avaliableSupply);
    }
    /**
     * @dev Can be overridden to add finalization logic. The overriding function
     * should call super.finalization() to ensure the chain of finalization is
     * executed entirely.
     */
    function finalization() internal pure {
    }

    function distributionTokens() public onlyOwner {
        require(!distribute);

        _transfer(this, beneficiary, 24500000*DEC); // frozen all
        _transfer(this, team, 7500000*DEC); // immediately Team 1/2
        tokenFrozenTeam[reserve] += 7500000*DEC; // кладем в меппинг первые токены
        _transfer(this, consult, 2000000*DEC); // immediately advisers 1/3
        _transfer(this, test, 100000*DEC); // immediately testers all
        _transfer(this, marketing, 5900000*DEC); // immediately marketing all
        avaliableSupply -= 40000000*DEC;
        distribute = true;
    }
    // функция выдачи замороженных токенов членам команды
    function tokenTransferFromHolding(address) public  holdersSupport {
        //require(!transferFrozen);
        require(now > endIcoDate);

        // !!! team - 7 500 000 после 1.1.2020

        // !!! consult - 2 000 000 после 1.9.2018 и 2 000 000 после 1.1.2019

        // !!! reserve - 10 000 000 после 1.1.2019

        // bounty - 1 500 000 после endIcoDate + 2592000 (30 дней) и 1 500 000 после endIcoDate + 5184000 (30 дней)

        if (msg.sender == reserve && now > 1546300801) { // 1546300801 -  01/01/2019 @ 12:00am (UTC)
            //require(tokenFrozenReserve[reserve] == 7500000*DEC;);
            _transfer(beneficiary, reserve, 10000000*DEC);
            balanceOf[beneficiary] -= 10000000*DEC;
            tokenFrozenReserve[reserve] += 10000000*DEC;
        }


        else if (msg.sender == team && now > 1577836801) { // 1577836801 - 01/01/2020 @ 12:00am (UTC)
            require(tokenFrozenReserve[reserve] == 7500000*DEC); // не может быть меньше так как если они выведут токены - на меппинг это не отразится
            //tokenFrozenTeam[reserve] == 0;
            _transfer(beneficiary, team, 75000000*DEC); // перевели еще токены
            balanceOf[beneficiary] -= 75000000*DEC; // списали с бенефициара
            tokenFrozenReserve[reserve] -= 15000000*DEC; // списали с мепинга и сделали его == 0
        }

        else if (msg.sender == consult && now > 1535760001) { // 1535760001 - 09/01/2018 @ 12:00am (UTC)
            _transfer(beneficiary, consult, 2000000*DEC);
            balanceOf[beneficiary] -= 75000000*DEC;
        }
        else if (msg.sender == consult && now > 1546300801) { // 1546300801 -  01/01/2019 @ 12:00am (UTC)
            _transfer(beneficiary, consult, 2000000*DEC);
            balanceOf[beneficiary] -= 75000000*DEC;
        }
        else if (msg.sender == bounty && now > endIcoDate + 2592000) { // 1535760001 - 09/01/2018 @ 12:00am (UTC)
            _transfer(beneficiary, consult, 1500000*DEC);
            balanceOf[beneficiary] -= 1500000*DEC;
        }
        else if (msg.sender == bounty && now > endIcoDate + 5184000) { // 1546300801 -  01/01/2019 @ 12:00am (UTC)
            _transfer(beneficiary, consult, 1500000*DEC);
            balanceOf[beneficiary] -= 1500000*DEC;
        }
    }
}