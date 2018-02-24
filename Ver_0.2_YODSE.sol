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
/* Interface delete at prodaction
interface tokenRecipient
{
    function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public;
}
*/

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

    uint256 public totalSupply;
    uint256 public avaliableSupply;  // totalSupply - all reserve
    uint256 public constant buyPrice = 1000 szabo; //0,001 ether

    mapping (address => uint256) public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    //event Approval(address indexed _owner, address indexed _spender, uint256 _value);

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
    /*
    function transferFrom(address _from, address _to, uint256 _value) public
            returns (bool success)
        {
            require(_value <= allowance[_from][msg.sender]);
            allowance[_from][msg.sender] -= _value;
            _transfer(_from, _to, _value);
            return true;
        }

        function approve(address _spender, uint256 _value) public
            returns (bool success)
        {
            allowance[msg.sender][_spender] = _value;
            return true;
        }

        function approveAndCall(address _spender, uint256 _value, bytes _extraData) public onlyOwner
            returns (bool success)
        {
            tokenRecipient spender = tokenRecipient(_spender);

            if (approve(_spender, _value)) {
                spender.receiveApproval(msg.sender, _value, this, _extraData);
                return true;
            }
        }

        function increaseApproval (address _spender, uint _addedValue) public
            returns (bool success)
        {
            allowance[msg.sender][_spender] = allowance[msg.sender][_spender].add(_addedValue);

            Approval(msg.sender, _spender, allowance[msg.sender][_spender]);

            return true;
        }

        function decreaseApproval (address _spender, uint _subtractedValue) public
            returns (bool success)
        {
            uint oldValue = allowance[msg.sender][_spender];
            if (_subtractedValue > oldValue) {
                allowance[msg.sender][_spender] = 0;
            } else {
                allowance[msg.sender][_spender] = oldValue.sub(_subtractedValue);
            }
            Approval(msg.sender, _spender, allowance[msg.sender][_spender]);
            return true;
        }
    */
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
    /*
    function burnFrom(address _from, uint256 _value) public onlyOwner
        returns (bool success)
    {
        require(balanceOf[_from] >= _value);                // Check if the targeted balance is enough
        require(_value <= allowance[_from][msg.sender]);    // Check allowance
        balanceOf[_from] -= _value;                         // Subtract from the targeted balance
        allowance[_from][msg.sender] -= _value;             // Subtract from the sender's allowance
        totalSupply -= _value;                              // Update totalSupply
        avaliableSupply -= _value;
        Burn(_from, _value);
        return true;
    } */
}
/*********************************************************************************************************************
* @title Pausable
* @dev Base contract which allows children to implement an emergency stop mechanism.
*/
contract Pauseble is TokenERC20
{
    event EPause();
    event EUnpause();

    bool public paused = true;
    // Start Date(Pre_ICO) 03/05/2018 @ 12:00am (UTC)
    //uint public startPreIcoDate = 1520208001;
    // EndDate(PRE_ICO) 03/19/2018 @ 12:00am (UTC)
    //uint public endPreIcoDate = 1521417601;
    // Start Date(PreICO) 04/01/2018 @ 12:00am (UTC)
    //uint public startIcoDate = 1522540800;
    // EndDate(ICO) 05/31/2018 @ 11:59pm (UTC)
    //uint public endIcoDate = 1527811199;
    /**
       * @dev Modifier to make a function callable only when the contract is not paused.
       */
    modifier whenNotPaused()
    {
        require(!paused);
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused()
    {
        require(paused);
        _;
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() public onlyOwner
    {
        paused = true;
        EPause();
    }
    /**
         * @dev requare called by the owner to pause, stop sell
         */
    function pauseInternal() internal
    {
        paused = true;
        EPause();
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpause() public onlyOwner
    {
        paused = false;
        EUnpause();
    }
}
/*********************************************************************************************************************
* @dev Extending standart token ERC20
*/

contract ERC20Extending is TokenERC20
{

    function transferEthFromContract(address _to, uint256 amount) public onlyOwner
    {
        amount = amount * DEC;
        _to.transfer(amount);
    }

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
contract YodseCrowdsale is Pauseble
{
    using SafeMath for uint;
    // 0 = Selling not sratrting; 1 = PreIco Sale; 2 = Main Token Sale (main ICO)
    uint public stage = 0;
    //
    uint public constant hardCapPreIco = 1000000000000000000000;
    //
    uint public constant softCapPreIco = 3000000000000000000000;

    //
    uint public constant hardCapMainISale = 7000000000000000000000;
    //
    uint public constant softCapMainSale = 40000000000000000000000;

    event SaleFinished(string info);
    // address beneficiary 0x6a59CB8b2dfa32522902bbecf75659D54dD63F95
    //address 2 ropsten testnetwork
    address public beneficiary = 0xCe66E79f59eafACaf4CaBaA317CaB4857487E3a1;

    // модификатор проверяет не достигнут ли хардкап на пресейле и мен сейле
    modifier isUnderHardCap() {
        require(beneficiary.balance <= hardCapPreIco);
        _;
    }

    struct Ico {
    uint256  startPreIcoDate; // = 1520208001;
    uint endPreIcoDate; // = 1521417601;
    uint startIcoDate; // = 1522540800;
    uint endIcoDate; // = 1527811199;
        uint256 marketSupply; // tokens for sale
        uint8 discount; // bonuses for investors
    }

    Ico public Selling;

    function SaleStatus() internal constant
    returns (string)
    {
        if (1 == stage) {
            return "PreSale";
        } else if(2 == stage) {
            return "Main Sale";
        }
        return "Now currently no sale";
    }

    function sell(address _investor, uint256 amount) internal // тут запилить логику дисконта если такой то день то
    {
        uint256 _amount = amount.mul(DEC).div(buyPrice);
        if (1 == stage) {
            _amount = _amount.add(withDiscount(_amount, Selling.discount));
        }
        else if (2 == stage) {
            _amount = _amount.add(withDiscount(_amount, Selling.discount));
        }

        if (Selling.tokens < _amount)
        {
            SaleFinished(SaleStatus());
            pauseInternal();
            revert();
        }
        Selling.tokens -= _amount;
        avaliableSupply -= _amount;
        _transfer(this, _investor, _amount);
    }

    function startSelling(
        uint256 _startPreIcoDate,
        uint _endPreIcoDate,
        uint _startIcoDate,
        uint _endIcoDate,
        uint256 _marketSupply,
        uint8 _discount) public onlyOwner
    {
        require(_tokens * DEC <= _marketSupply);
        startPreIcoDate = _startPreIcoDate;
        Selling = Ico (_marketSupply * DEC, _startPreIcoDate, _endPreIcoDate, _startIcoDate,
            _endIcoDate, _discount);
        stage += 1;
        unpause();
    }

    function withDiscount(uint256 _amount, uint _percent) internal pure
    returns (uint256)
    {
        return ((_amount * _percent) / 100);
    }
}
/*********************************************************************************************************************
*
*/
contract YodseaContract is ERC20Extending, YodseCrowdsale
{

    uint public weisRaised;

    function YodseaContract() public TokenERC20(
            100000000,
            "Your Open Direct Sales Ecosystem)",
            "YODSE")
    {

    }

    function () public payable
    {
        assert(msg.value >= 1 ether / 1000); // проверка что отправляемые средства >= 0,001 ethereum
        sell(msg.sender, msg.value);
        beneficiary.transfer(msg.value); // средства отправляюся на адрес бенефециара
        weisRaised = weisRaised.add(msg.value);  // добавляем получаные средства в собранное
    }
}