
@contract ERC20Basic

@contract ERC20 is ERC20Basic

contract StandardToken is ERC20, BasicToken 
 
@contract Ownable 

@contract MintableToken is StandardToken, Ownable 
 
@library SafeMath
 
@contract YodseToken is MintableToken    

contract YodseCrowdsale is YodseToken