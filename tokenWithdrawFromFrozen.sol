pragma solidity ^0.4.0;

contract tokenWithdrawFromFrozen {

    address team = 0x0cdb839B52404d49417C8Ded6c3E2157A06CdD37;
    address reserve = 0x7eDE8260e573d3A3dDfc058f19309DF5a1f7397E;
    address consult = 0x7eDE8260e573d3A3dDfc058f19309DF5a1f7397E;
    address marketing = 0x7B97BF2df716932aaED4DfF09806D97b70C165d6;
    address bounty = 0xADc50Ae48B4D97a140eC0f037e85e7a0B13453C4;
    address test = 0xADc50Ae48B4D97a140eC0f037e85e7a0B13453C4;

    modifier holdersSupport() {
        require(msg.sender == team || msg.sender == reserve || msg.sender == consult || msg.sender == marketing|| msg.sender == bounty );
        _;
    }

    function tokenWithdrawFromFrozen(){
    }

    function tokenTransferFromHolding(address _to, uint _value) public only holdersSupport {

        if (msg.sender == team ) { // то отправитель имеет право вызывать функцию
            require(_value > teamReserve); // проверка на дату на сумму на превышение на соблюдение условий
            _transfer(this, _to, _value); // отсылка средст на указанный кошелек в указанном количестве + плата за газ

            require(now > 1577836801 || _value <= 7500000*DEC); //01/01/2020 @ 12:00am (UTC)

            teamReserve -= _value;
        }
        else if (msg.sender == consult) {
            require(_value > consultReserve); // проверка на дату на сумму на превышение на соблюдение условий
            _transfer(this, _to, _value);
            consultReserve -= _value;
        }
        else if (msg.sender == reserve) {
            require(_value > contingencyFund); // проверка на дату на сумму на превышение на соблюдение условий
            _transfer(this, _to, _value);
            contingencyFund -= _value;
        }
        else revert(false);
    }

    function distributionTokens() public onlyOwner {
        require(distribute = true);

        //_to = beneficiary;
        //_value = teamReserve+consultReserve+contingencyFund+marketingReserve+testReserve+bountyReserve;
        //_value = _value*DEC;
        //avaliableSupply -= _value;

        _transfer(this, beneficiary, 24500000*DEC); // frozen all
        _transfer(this, team, 7500000*DEC); // immediately Team 1/2
        _transfer(this, consult, 2000000*DEC); // immediately advisers 1/3
        _transfer(this, test, 100000*DEC); // immediately testers all
        _transfer(this, marketing, 5900000*DEC); // immediately marketing all
        // immediately 15 500 000
        avaliableSupply -= 40000000*DEC;

        distribute = true;
    }

    /*
    old version
    function distributionTokens(address _to, uint256 _value) public onlyOwner {
        require(distribute = true);
        _to = beneficiary;
        _value = teamReserve+consultReserve+contingencyFund+marketingReserve+testReserve+bountyReserve;
        _value = _value*DEC;
        avaliableSupply -= _value;
        _transfer(this, _to, _value);
        distribute = true;
    }
    */
}
    //token hold
    //по разным адресам
    //modifaer tokenhold
    //require(addreqs != какой то)
    //require(now < какое то число)
    //require(value < holdBalance)