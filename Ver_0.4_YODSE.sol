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

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
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
    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

/*********************************************************************************************************************
* @dev see https://github.com/ethereum/EIPs/issues/20
*/

contract TokenERC20 is Ownable
{
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
    mapping (address => mapping (address => uint256)) public allowance;

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

    function _transfer(address _from, address _to, uint256 _value) internal
    {
        require(_to != 0x0);
        require(balanceOf[_from] >= _value);
        require(balanceOf[_to] + _value > balanceOf[_to]);
        uint previousBalances = balanceOf[_from] + balanceOf[_to];
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        Transfer(_from, _to, _value);
        assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    function transfer(address _to, uint256 _value) public
    {
        _transfer(msg.sender, _to, _value);
    }

    function burn(uint256 _value) public onlyOwner
    returns (bool success)
    {
        require(balanceOf[msg.sender] >= _value);   // Check if the sender has enough
        balanceOf[msg.sender] -= _value;            // Subtract from the sender
        totalSupply -= _value;                      // Updates totalSupply
        avaliableSupply -= _value;
        Burn(msg.sender, _value);
        return true;
    }
}

/*********************************************************************************************************************
* @dev Extending standart token ERC20
*/

contract ERC20Extending is TokenERC20
{
    function transferTokensFromContract(address _to, uint256 _value) public onlyOwner
    {
        avaliableSupply -= _value;
        _value = _value*DEC;
        _transfer(this, _to, _value);
    }
}
/*********************************************************************************************************************
----------------------------------------------------------------------------------------------------------------------
* @dev YodseCrowdsale contract
*/
contract YodseCrowdsale is TokenERC20, ERC20Extending
{
    using SafeMath for uint;
    // 1000 ether
    uint public constant softCapPreIco = 1000000000000000000000;
    // 3000 ether
    uint public constant hardCapPreIco = 3000000000000000000000; // ?????
    // 7000 ether
    uint public constant softCapMainSale = 7000000000000000000000;
    // 40 000 ether
    uint public constant hardCapMainISale = 40000000000000000000000;

    //event SaleFinished(string info);

    // address beneficiary 0x6a59CB8b2dfa32522902bbecf75659D54dD63F95
    //address 2 ropsten testnetwork
    address public beneficiary = 0xCe66E79f59eafACaf4CaBaA317CaB4857487E3a1;
    uint public startPreIcoDate = 1519453359; // 1520208001
    uint public endPreIcoDate = 1521417601;
    uint public startIcoDate = 1522540800;
    uint public endIcoDate = 1527811199;

    uint public discount = 0;

    uint public weisRaised;

    bool public isFinalized = false;

    event Finalized();

    // Supply for public token sale
    // uint256 public constant marketSupply = 60000000*DEC; //60 000 000
    // Supply for team and developers
    uint256 constant teamReserve = 15000000; //*DEC; // 15 000 000
    // Supply for advisers, consultants and other
    // uint256 constant consultReserve = 6000000*DEC; // 6 000 000
    // Supply for Reserve fond
    // uint256 constant contingencyFund = 10000000*DEC;// 10 000 000
    // tokens for contingency fund
    // uint256 constant marketingReserve = 5900000*DEC; //5 900 000
    // tokens for testers
    // uint256 constant testReserve = 100000*DEC; // 100 000
    // tokens for bounty programs
    // uint256 constant bountyReserve = 3000000*DEC; //3 000 000


    // variable counts the number of investora after call sell function.
    uint256 public investors = 0;

    function YodseCrowdsale() public TokenERC20(100000000, "Your Open Direct Sales Ecosystem", "YODSE")
    {
        //uint issuedTokenSupply = totalSupply();
        //uint teamReserveTokens = issuedTokenSupply.mul();
        //transfer(beneficiary, teamReserve);
    }

    modifier isUnderHardCap() {
        require(beneficiary.balance <= hardCapMainISale);
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
            // token discount ICO (11 - 31 may 2018) 0%
        } else {
            _amount = _amount.add(withDiscount(_amount, 3));
        }
        require(amount > avaliableSupply); // проверка что запрашиваемое количество токенов меньше чем есть на балансе
        avaliableSupply -= _amount;
        _transfer(this, _investor, _amount);
        balanceOf[msg.sender] = balanceOf[msg.sender] + amount;

        investors +=1;
    }

    function withDiscount(uint256 _amount, uint _percent) internal pure
    returns (uint256)
    {
        return ((_amount * _percent) / 100);
    }


    function setEndData(uint newEndIcoDate) public onlyOwner {
        endIcoDate  = newEndIcoDate;
    }

    function () isUnderHardCap public payable
    {
        require(now > startPreIcoDate && now < endIcoDate);
        sell(msg.sender, msg.value);
        //require(now > startIcoDate && now < endIcoDate); проверка на промежуток между концом пре и началом основного
        assert(msg.value >= 1 ether / 1000); // проверка что отправляемые средства >= 0,001 ethereum
        beneficiary.transfer(msg.value); // средства отправляюся на адрес бенефециара
        weisRaised = weisRaised.add(msg.value);  // добавляем получаные средства в собранное
    }

    function refundPreICO() public {
        require(weisRaised < softCapPreIco && now > endPreIcoDate);
        uint value = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        msg.sender.transfer(value);
    }

    function refundICO() public {
        require(weisRaised < softCapMainSale && now > endIcoDate);
        uint value = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        msg.sender.transfer(value);
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

    /*
    function distributionTokens () public onlyOwner {

         transfer();
     }
    */
}