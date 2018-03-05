(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Accounts=f()}})(function(){var define,module,exports;return(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){(function(global,Buffer){var _=require('underscore');var Tx=require('ethereumjs-tx');var LocalStore=require('localstorejs');var BigNumber=require('bignumber.js');var JSZip=require("jszip");var FileSaver=require("node-safe-filesaver");global.CryptoJS=require('browserify-cryptojs');require('browserify-cryptojs/components/enc-base64');require('browserify-cryptojs/components/md5');require('browserify-cryptojs/components/evpkdf');require('browserify-cryptojs/components/cipher-core');require('browserify-cryptojs/components/aes');var Accounts=module.exports=function(options){if(_.isUndefined(options))
    options={};var defaultOptions={varName:'ethereumAccounts',minPassphraseLength:6,requirePassphrase:!1,selectNew:!0,defaultGasPrice:'useWeb3',request:function(accountObject){var passphrase=prompt("Please enter your account passphrase for address "+accountObject.address.substr(0,8)+'...',"passphrase");if(passphrase==null)
    passphrase='';return String(passphrase)}};this.options=_.extend(defaultOptions,options);defineProperties(this);var accounts=LocalStore.get(this.options.varName);if(_.isUndefined(accounts)||!_.isObject(accounts))
    LocalStore.set(this.options.varName,{})};var formatHex=function(str){if(_.isUndefined(str))
    str='00';return String(str).length%2?'0'+String(str):String(str)};var formatNumber=function(num){if(_.isUndefined(num)||num==0)
    num='00';if(_.isString(num)||_.isNumber(num))
    num=new BigNumber(String(num));if(isBigNumber(num))
    num=num.toString(16);return formatHex(num)};var formatAddress=function(addr,format){if(_.isUndefined(format)||!_.isString(format))
    format='hex';if(_.isUndefined(addr)||!_.isString(addr))
    addr='0000000000000000000000000000000000000000';if(addr.substr(0,2)=='0x'&&format=='raw')
    addr=addr.substr(2);if(addr.substr(0,2)!='0x'&&format=='hex')
    addr='0x'+addr;return addr};var randomBytes=function(length){var charset="abcdef0123456789";var i;var result="";var isOpera=Object.prototype.toString.call(window.opera)=='[object Opera]';if(window.crypto&&window.crypto.getRandomValues){values=new Uint32Array(length);window.crypto.getRandomValues(values);for(i=0;i<length;i++){result+=charset[values[i]%charset.length]}
    return result}else if(isOpera){for(i=0;i<length;i++){result+=charset[Math.floor(Math.random()*charset.length)]}
    return result}
else throw new Error("Your browser sucks and can't generate secure random numbers")}
    var isBigNumber=function(value){if(_.isUndefined(value)||!_.isObject(value))
        return!1;return(value instanceof BigNumber)?!0:!1};var isAddress=function(address){return/^(0x)?[0-9a-f]{40}$/.test(address)};var defineProperties=function(context){Object.defineProperty(context,'length',{get:function(){var count=0;_.each(this.get(),function(account,accountIndex){if(_.isUndefined(account)||!_.isObject(account)||_.isString(account))
        return;if(!_.has(account,'encrypted')||!_.has(account,'private'))
        return;count+=1});return count}})};Accounts.prototype.isPassphrase=function(passphrase){if(!_.isUndefined(passphrase)&&_.isString(passphrase)&&!_.isEmpty(passphrase)&&String(passphrase).length>this.options.minPassphraseLength)
        return!0};Accounts.prototype.set=function(address,accountObject){var accounts=LocalStore.get('ethereumAccounts');if(_.isObject(accountObject))
        accounts[formatAddress(address)]=accountObject;else delete accounts[formatAddress(address)];this.log('Setting account object at address: '+address+' to account object '+String(accountObject));LocalStore.set(this.options.varName,accounts)};Accounts.prototype.remove=function(address){this.set(address,null)};Accounts.prototype.new=function(passphrase){var private=new Buffer(randomBytes(64),'hex');var public=ethUtil.privateToPublic(private);var address=formatAddress(ethUtil.publicToAddress(public).toString('hex'));var accountObject={address:address,encrypted:!1,locked:!1,hash:ethUtil.sha3(public.toString('hex')+private.toString('hex')).toString('hex')};if((!_.isUndefined(passphrase)&&!_.isEmpty(passphrase))||this.options.requirePassphrase){if(this.isPassphrase(passphrase)){private=CryptoJS.AES.encrypt(private.toString('hex'),passphrase).toString();public=CryptoJS.AES.encrypt(public.toString('hex'),passphrase).toString();accountObject.encrypted=!0;accountObject.locked=!0}else{this.log('The passphrase you tried to use was invalid.');private=private.toString('hex')
        public=public.toString('hex')}}else{private=private.toString('hex')
        public=public.toString('hex')}
        accountObject.private=private;accountObject.public=public;this.set(address,accountObject);this.log('New address created');if(this.options.selectNew)
            this.select(accountObject.address);return accountObject};Accounts.prototype.select=function(address){var accounts=LocalStore.get(this.options.varName);accounts.selected=address;LocalStore.set(this.options.varName,accounts)};Accounts.prototype.get=function(address,passphrase){var accounts=LocalStore.get(this.options.varName);if(_.isUndefined(address)||_.isEmpty(address))
        return accounts;if(address=='selected')
        address=accounts.selected;address=formatAddress(address);var accountObject={address:address};if(!this.contains(address))
        return accountObject;accountObject=accounts[address];if(_.isEmpty(accountObject))
        return accountObject;if(this.isPassphrase(passphrase)&&accountObject.encrypted){try{accountObject.private=CryptoJS.AES.decrypt(accountObject.private,passphrase).toString(CryptoJS.enc.Utf8);accountObject.public=CryptoJS.AES.decrypt(accountObject.public,passphrase).toString(CryptoJS.enc.Utf8);if(ethUtil.sha3(accountObject.public+accountObject.private).toString('hex')==accountObject.hash)
        accountObject.locked=!1}catch(e){this.log('Error while decrypting public/private keys: '+String(e))}}
        return accountObject};Accounts.prototype.clear=function(){this.log('Clearing all accounts');LocalStore.set(this.options.varName,{})};Accounts.prototype.contains=function(address){var accounts=LocalStore.get(this.options.varName);if(_.isUndefined(address)||_.isEmpty(address))
        return!1;address=formatAddress(address);if(_.has(accounts,address))
        return(!_.isUndefined(accounts[address])&&!_.isEmpty(accounts[address]));return!1};Accounts.prototype.export=function(){this.log('Exported accounts');return JSON.stringify(this.get())};Accounts.prototype.import=function(JSON_data){var JSON_data=JSON_data.trim();var parsed=JSON.parse(JSON_data);var count=0;var _this=this;_.each(parsed,function(accountObject,accountIndex){if(!_.has(accountObject,'private')||!_.has(accountObject,'hash')||!_.has(accountObject,'address')||!_.has(accountObject,'encrypted')||!_.has(accountObject,'locked'))
        return;count+=1;_this.set(accountObject.address,accountObject)});this.log('Imported '+String(count)+' accounts');return count};Accounts.prototype.backup=function(){var zip=new JSZip();zip.file("wallet",this.export());var content=zip.generate({type:"blob"});var dateString=new Date();this.log('Saving wallet as: '+"wallet-"+dateString.toISOString()+".zip");FileSaver.saveAs(content,"wallet-"+dateString.toISOString()+".zip")};Accounts.prototype.log=function(){};Accounts.prototype.list=function(){var accounts=LocalStore.get('ethereumAccounts'),return_array=[];_.each(_.keys(accounts),function(accountKey,accountIndex){if(accountKey!="selected")
        return_array.push(accounts[accountKey])});return return_array};Accounts.prototype.hasAddress=function(address,callback){callback(null,this.contains(address))}
    Accounts.prototype.signTransaction=function(tx_params,callback){var accounts=this;if(!accounts.contains(tx_params.from)){callback(new Error("Cannot sign transaction; from address not found in accounts list."))}
        var account=accounts.get(tx_params.from);if(account.encrypted){account=accounts.get(tx_params.from,accounts.options.request(account))}
        if(account.locked){callback(new Error("Cannot sign transaction. Account locked!"));return}
        var rawTx={nonce:formatHex(ethUtil.stripHexPrefix(tx_params.nonce)),gasPrice:formatHex(ethUtil.stripHexPrefix(tx_params.gasPrice)),gasLimit:formatHex(new BigNumber('3141592').toString(16)),value:'00',data:''};if(tx_params.gasPrice!=null)
            rawTx.gasPrice=formatHex(ethUtil.stripHexPrefix(tx_params.gasPrice));if(tx_params.gas!=null)
            rawTx.gasLimit=formatHex(ethUtil.stripHexPrefix(tx_params.gas));if(tx_params.to!=null)
            rawTx.to=formatHex(ethUtil.stripHexPrefix(tx_params.to));if(tx_params.value!=null)
            rawTx.value=formatHex(ethUtil.stripHexPrefix(tx_params.value));if(tx_params.data!=null)
            rawTx.data=formatHex(ethUtil.stripHexPrefix(tx_params.data));var privateKey=new Buffer(account.private,'hex');function signTx(err){var tx=new Tx(rawTx);tx.sign(privateKey);var serializedTx='0x'+tx.serialize().toString('hex');callback(err,serializedTx)};if(rawTx.gasPrice=='00')
            web3.eth.getGasPrice(function(err,result){if(err)
                return signTx(err);else rawTx.gasPrice=formatHex(ethUtil.stripHexPrefix(result));signTx(null)});else signTx(null)}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{},require("buffer").Buffer)},{"bignumber.js":2,"browserify-cryptojs":8,"browserify-cryptojs/components/aes":3,"browserify-cryptojs/components/cipher-core":4,"browserify-cryptojs/components/enc-base64":5,"browserify-cryptojs/components/evpkdf":6,"browserify-cryptojs/components/md5":7,"buffer":111,"ethereumjs-tx":10,"jszip":75,"localstorejs":106,"node-safe-filesaver":107,"underscore":108}],2:[function(require,module,exports){;(function(global){'use strict';var BigNumber,crypto,parseNumeric,isNumeric=/^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,mathceil=Math.ceil,mathfloor=Math.floor,notBool=' not a boolean or binary digit',roundingMode='rounding mode',tooManyDigits='number type has more than 15 significant digits',ALPHABET='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_',BASE=1e14,LOG_BASE=14,MAX_SAFE_INTEGER=0x1fffffffffffff,POWS_TEN=[1,10,100,1e3,1e4,1e5,1e6,1e7,1e8,1e9,1e10,1e11,1e12,1e13],SQRT_BASE=1e7,MAX=1E9;function another(configObj){var div,id=0,P=BigNumber.prototype,ONE=new BigNumber(1),DECIMAL_PLACES=20,ROUNDING_MODE=4,TO_EXP_NEG=-7,TO_EXP_POS=21,MIN_EXP=-1e7,MAX_EXP=1e7,ERRORS=!0,isValidInt=intValidatorWithErrors,CRYPTO=!1,MODULO_MODE=1,POW_PRECISION=100,FORMAT={decimalSeparator:'.',groupSeparator:',',groupSize:3,secondaryGroupSize:0,fractionGroupSeparator:'\xA0',fractionGroupSize:0};function BigNumber(n,b){var c,e,i,num,len,str,x=this;if(!(x instanceof BigNumber)){if(ERRORS)raise(26,'constructor call without new',n);return new BigNumber(n,b)}
    if(b==null||!isValidInt(b,2,64,id,'base')){if(n instanceof BigNumber){x.s=n.s;x.e=n.e;x.c=(n=n.c)?n.slice():n;id=0;return}
        if((num=typeof n=='number')&&n*0==0){x.s=1/n<0?(n=-n,-1):1;if(n===~~n){for(e=0,i=n;i>=10;i/=10,e++);x.e=e;x.c=[n];id=0;return}
            str=n+''}else{if(!isNumeric.test(str=n+''))return parseNumeric(x,str,num);x.s=str.charCodeAt(0)===45?(str=str.slice(1),-1):1}}else{b=b|0;str=n+'';if(b==10){x=new BigNumber(n instanceof BigNumber?n:str);return round(x,DECIMAL_PLACES+x.e+1,ROUNDING_MODE)}
        if((num=typeof n=='number')&&n*0!=0||!(new RegExp('^-?'+(c='['+ALPHABET.slice(0,b)+']+')+'(?:\\.'+c+')?$',b<37?'i':'')).test(str)){return parseNumeric(x,str,num,b)}
        if(num){x.s=1/n<0?(str=str.slice(1),-1):1;if(ERRORS&&str.replace(/^0\.0*|\./,'').length>15){raise(id,tooManyDigits,n)}
            num=!1}else{x.s=str.charCodeAt(0)===45?(str=str.slice(1),-1):1}
        str=convertBase(str,10,b,x.s)}
    if((e=str.indexOf('.'))>-1)str=str.replace('.','');if((i=str.search(/e/i))>0){if(e<0)e=i;e+=+str.slice(i+1);str=str.substring(0,i)}else if(e<0){e=str.length}
    for(i=0;str.charCodeAt(i)===48;i++);for(len=str.length;str.charCodeAt(--len)===48;);str=str.slice(i,len+1);if(str){len=str.length;if(num&&ERRORS&&len>15)raise(id,tooManyDigits,x.s*n);e=e-i-1;if(e>MAX_EXP){x.c=x.e=null}else if(e<MIN_EXP){x.c=[x.e=0]}else{x.e=e;x.c=[];i=(e+1)%LOG_BASE;if(e<0)i+=LOG_BASE;if(i<len){if(i)x.c.push(+str.slice(0,i));for(len-=LOG_BASE;i<len;){x.c.push(+str.slice(i,i+=LOG_BASE))}
        str=str.slice(i);i=LOG_BASE-str.length}else{i-=len}
        for(;i--;str+='0');x.c.push(+str)}}else{x.c=[x.e=0]}
    id=0}
    BigNumber.another=another;BigNumber.ROUND_UP=0;BigNumber.ROUND_DOWN=1;BigNumber.ROUND_CEIL=2;BigNumber.ROUND_FLOOR=3;BigNumber.ROUND_HALF_UP=4;BigNumber.ROUND_HALF_DOWN=5;BigNumber.ROUND_HALF_EVEN=6;BigNumber.ROUND_HALF_CEIL=7;BigNumber.ROUND_HALF_FLOOR=8;BigNumber.EUCLID=9;BigNumber.config=function(){var v,p,i=0,r={},a=arguments,o=a[0],has=o&&typeof o=='object'?function(){if(o.hasOwnProperty(p))return(v=o[p])!=null}:function(){if(a.length>i)return(v=a[i++])!=null};if(has(p='DECIMAL_PLACES')&&isValidInt(v,0,MAX,2,p)){DECIMAL_PLACES=v|0}
        r[p]=DECIMAL_PLACES;if(has(p='ROUNDING_MODE')&&isValidInt(v,0,8,2,p)){ROUNDING_MODE=v|0}
        r[p]=ROUNDING_MODE;if(has(p='EXPONENTIAL_AT')){if(isArray(v)){if(isValidInt(v[0],-MAX,0,2,p)&&isValidInt(v[1],0,MAX,2,p)){TO_EXP_NEG=v[0]|0;TO_EXP_POS=v[1]|0}}else if(isValidInt(v,-MAX,MAX,2,p)){TO_EXP_NEG=-(TO_EXP_POS=(v<0?-v:v)|0)}}
        r[p]=[TO_EXP_NEG,TO_EXP_POS];if(has(p='RANGE')){if(isArray(v)){if(isValidInt(v[0],-MAX,-1,2,p)&&isValidInt(v[1],1,MAX,2,p)){MIN_EXP=v[0]|0;MAX_EXP=v[1]|0}}else if(isValidInt(v,-MAX,MAX,2,p)){if(v|0)MIN_EXP=-(MAX_EXP=(v<0?-v:v)|0);else if(ERRORS)raise(2,p+' cannot be zero',v)}}
        r[p]=[MIN_EXP,MAX_EXP];if(has(p='ERRORS')){if(v===!!v||v===1||v===0){id=0;isValidInt=(ERRORS=!!v)?intValidatorWithErrors:intValidatorNoErrors}else if(ERRORS){raise(2,p+notBool,v)}}
        r[p]=ERRORS;if(has(p='CRYPTO')){if(v===!!v||v===1||v===0){CRYPTO=!!(v&&crypto&&typeof crypto=='object');if(v&&!CRYPTO&&ERRORS)raise(2,'crypto unavailable',crypto)}else if(ERRORS){raise(2,p+notBool,v)}}
        r[p]=CRYPTO;if(has(p='MODULO_MODE')&&isValidInt(v,0,9,2,p)){MODULO_MODE=v|0}
        r[p]=MODULO_MODE;if(has(p='POW_PRECISION')&&isValidInt(v,0,MAX,2,p)){POW_PRECISION=v|0}
        r[p]=POW_PRECISION;if(has(p='FORMAT')){if(typeof v=='object'){FORMAT=v}else if(ERRORS){raise(2,p+' not an object',v)}}
        r[p]=FORMAT;return r};BigNumber.max=function(){return maxOrMin(arguments,P.lt)};BigNumber.min=function(){return maxOrMin(arguments,P.gt)};BigNumber.random=(function(){var pow2_53=0x20000000000000;var random53bitInt=(Math.random()*pow2_53)&0x1fffff?function(){return mathfloor(Math.random()*pow2_53)}:function(){return((Math.random()*0x40000000|0)*0x800000)+(Math.random()*0x800000|0)};return function(dp){var a,b,e,k,v,i=0,c=[],rand=new BigNumber(ONE);dp=dp==null||!isValidInt(dp,0,MAX,14)?DECIMAL_PLACES:dp|0;k=mathceil(dp/LOG_BASE);if(CRYPTO){if(crypto&&crypto.getRandomValues){a=crypto.getRandomValues(new Uint32Array(k*=2));for(;i<k;){v=a[i]*0x20000+(a[i+1]>>>11);if(v>=9e15){b=crypto.getRandomValues(new Uint32Array(2));a[i]=b[0];a[i+1]=b[1]}else{c.push(v%1e14);i+=2}}
        i=k/2}else if(crypto&&crypto.randomBytes){a=crypto.randomBytes(k*=7);for(;i<k;){v=((a[i]&31)*0x1000000000000)+(a[i+1]*0x10000000000)+(a[i+2]*0x100000000)+(a[i+3]*0x1000000)+(a[i+4]<<16)+(a[i+5]<<8)+a[i+6];if(v>=9e15){crypto.randomBytes(7).copy(a,i)}else{c.push(v%1e14);i+=7}}
        i=k/7}else if(ERRORS){raise(14,'crypto unavailable',crypto)}}
        if(!i){for(;i<k;){v=random53bitInt();if(v<9e15)c[i++]=v%1e14}}
        k=c[--i];dp%=LOG_BASE;if(k&&dp){v=POWS_TEN[LOG_BASE-dp];c[i]=mathfloor(k/v)*v}
        for(;c[i]===0;c.pop(),i--);if(i<0){c=[e=0]}else{for(e=-1;c[0]===0;c.shift(),e-=LOG_BASE);for(i=1,v=c[0];v>=10;v/=10,i++);if(i<LOG_BASE)e-=LOG_BASE-i}
        rand.e=e;rand.c=c;return rand}})();function convertBase(str,baseOut,baseIn,sign){var d,e,k,r,x,xc,y,i=str.indexOf('.'),dp=DECIMAL_PLACES,rm=ROUNDING_MODE;if(baseIn<37)str=str.toLowerCase();if(i>=0){k=POW_PRECISION;POW_PRECISION=0;str=str.replace('.','');y=new BigNumber(baseIn);x=y.pow(str.length-i);POW_PRECISION=k;y.c=toBaseOut(toFixedPoint(coeffToString(x.c),x.e),10,baseOut);y.e=y.c.length}
        xc=toBaseOut(str,baseIn,baseOut);e=k=xc.length;for(;xc[--k]==0;xc.pop());if(!xc[0])return'0';if(i<0){--e}else{x.c=xc;x.e=e;x.s=sign;x=div(x,y,dp,rm,baseOut);xc=x.c;r=x.r;e=x.e}
        d=e+dp+1;i=xc[d];k=baseOut/2;r=r||d<0||xc[d+1]!=null;r=rm<4?(i!=null||r)&&(rm==0||rm==(x.s<0?3:2)):i>k||i==k&&(rm==4||r||rm==6&&xc[d-1]&1||rm==(x.s<0?8:7));if(d<1||!xc[0]){str=r?toFixedPoint('1',-dp):'0'}else{xc.length=d;if(r){for(--baseOut;++xc[--d]>baseOut;){xc[d]=0;if(!d){++e;xc.unshift(1)}}}
            for(k=xc.length;!xc[--k];);for(i=0,str='';i<=k;str+=ALPHABET.charAt(xc[i++]));str=toFixedPoint(str,e)}
        return str}
    div=(function(){function multiply(x,k,base){var m,temp,xlo,xhi,carry=0,i=x.length,klo=k%SQRT_BASE,khi=k/SQRT_BASE|0;for(x=x.slice();i--;){xlo=x[i]%SQRT_BASE;xhi=x[i]/SQRT_BASE|0;m=khi*xlo+xhi*klo;temp=klo*xlo+((m%SQRT_BASE)*SQRT_BASE)+carry;carry=(temp/base|0)+(m/SQRT_BASE|0)+khi*xhi;x[i]=temp%base}
        if(carry)x.unshift(carry);return x}
        function compare(a,b,aL,bL){var i,cmp;if(aL!=bL){cmp=aL>bL?1:-1}else{for(i=cmp=0;i<aL;i++){if(a[i]!=b[i]){cmp=a[i]>b[i]?1:-1;break}}}
            return cmp}
        function subtract(a,b,aL,base){var i=0;for(;aL--;){a[aL]-=i;i=a[aL]<b[aL]?1:0;a[aL]=i*base+a[aL]-b[aL]}
            for(;!a[0]&&a.length>1;a.shift());}
        return function(x,y,dp,rm,base){var cmp,e,i,more,n,prod,prodL,q,qc,rem,remL,rem0,xi,xL,yc0,yL,yz,s=x.s==y.s?1:-1,xc=x.c,yc=y.c;if(!xc||!xc[0]||!yc||!yc[0]){return new BigNumber(!x.s||!y.s||(xc?yc&&xc[0]==yc[0]:!yc)?NaN:xc&&xc[0]==0||!yc?s*0:s/0)}
            q=new BigNumber(s);qc=q.c=[];e=x.e-y.e;s=dp+e+1;if(!base){base=BASE;e=bitFloor(x.e/LOG_BASE)-bitFloor(y.e/LOG_BASE);s=s/LOG_BASE|0}
            for(i=0;yc[i]==(xc[i]||0);i++);if(yc[i]>(xc[i]||0))e--;if(s<0){qc.push(1);more=!0}else{xL=xc.length;yL=yc.length;i=0;s+=2;n=mathfloor(base/(yc[0]+1));if(n>1){yc=multiply(yc,n,base);xc=multiply(xc,n,base);yL=yc.length;xL=xc.length}
                xi=yL;rem=xc.slice(0,yL);remL=rem.length;for(;remL<yL;rem[remL++]=0);yz=yc.slice();yz.unshift(0);yc0=yc[0];if(yc[1]>=base/2)yc0++;do{n=0;cmp=compare(yc,rem,yL,remL);if(cmp<0){rem0=rem[0];if(yL!=remL)rem0=rem0*base+(rem[1]||0);n=mathfloor(rem0/yc0);if(n>1){if(n>=base)n=base-1;prod=multiply(yc,n,base);prodL=prod.length;remL=rem.length;while(compare(prod,rem,prodL,remL)==1){n--;subtract(prod,yL<prodL?yz:yc,prodL,base);prodL=prod.length;cmp=1}}else{if(n==0){cmp=n=1}
                    prod=yc.slice();prodL=prod.length}
                    if(prodL<remL)prod.unshift(0);subtract(rem,prod,remL,base);remL=rem.length;if(cmp==-1){while(compare(yc,rem,yL,remL)<1){n++;subtract(rem,yL<remL?yz:yc,remL,base);remL=rem.length}}}else if(cmp===0){n++;rem=[0]}
                    qc[i++]=n;if(rem[0]){rem[remL++]=xc[xi]||0}else{rem=[xc[xi]];remL=1}}while((xi++<xL||rem[0]!=null)&&s--);more=rem[0]!=null;if(!qc[0])qc.shift()}
            if(base==BASE){for(i=1,s=qc[0];s>=10;s/=10,i++);round(q,dp+(q.e=i+e*LOG_BASE-1)+1,rm,more)}else{q.e=e;q.r=+more}
            return q}})();function format(n,i,rm,caller){var c0,e,ne,len,str;rm=rm!=null&&isValidInt(rm,0,8,caller,roundingMode)?rm|0:ROUNDING_MODE;if(!n.c)return n.toString();c0=n.c[0];ne=n.e;if(i==null){str=coeffToString(n.c);str=caller==19||caller==24&&ne<=TO_EXP_NEG?toExponential(str,ne):toFixedPoint(str,ne)}else{n=round(new BigNumber(n),i,rm);e=n.e;str=coeffToString(n.c);len=str.length;if(caller==19||caller==24&&(i<=e||e<=TO_EXP_NEG)){for(;len<i;str+='0',len++);str=toExponential(str,e)}else{i-=ne;str=toFixedPoint(str,e);if(e+1>len){if(--i>0)for(str+='.';i--;str+='0');}else{i+=e-len;if(i>0){if(e+1==len)str+='.';for(;i--;str+='0');}}}}
        return n.s<0&&c0?'-'+str:str}
    function maxOrMin(args,method){var m,n,i=0;if(isArray(args[0]))args=args[0];m=new BigNumber(args[0]);for(;++i<args.length;){n=new BigNumber(args[i]);if(!n.s){m=n;break}else if(method.call(m,n)){m=n}}
        return m}
    function intValidatorWithErrors(n,min,max,caller,name){if(n<min||n>max||n!=truncate(n)){raise(caller,(name||'decimal places')+(n<min||n>max?' out of range':' not an integer'),n)}
        return!0}
    function normalise(n,c,e){var i=1,j=c.length;for(;!c[--j];c.pop());for(j=c[0];j>=10;j/=10,i++);if((e=i+e*LOG_BASE-1)>MAX_EXP){n.c=n.e=null}else if(e<MIN_EXP){n.c=[n.e=0]}else{n.e=e;n.c=c}
        return n}
    parseNumeric=(function(){var basePrefix=/^(-?)0([xbo])/i,dotAfter=/^([^.]+)\.$/,dotBefore=/^\.([^.]+)$/,isInfinityOrNaN=/^-?(Infinity|NaN)$/,whitespaceOrPlus=/^\s*\+|^\s+|\s+$/g;return function(x,str,num,b){var base,s=num?str:str.replace(whitespaceOrPlus,'');if(isInfinityOrNaN.test(s)){x.s=isNaN(s)?null:s<0?-1:1}else{if(!num){s=s.replace(basePrefix,function(m,p1,p2){base=(p2=p2.toLowerCase())=='x'?16:p2=='b'?2:8;return!b||b==base?p1:m});if(b){base=b;s=s.replace(dotAfter,'$1').replace(dotBefore,'0.$1')}
        if(str!=s)return new BigNumber(s,base)}
        if(ERRORS)raise(id,'not a'+(b?' base '+b:'')+' number',str);x.s=null}
        x.c=x.e=null;id=0}})();function raise(caller,msg,val){var error=new Error(['new BigNumber','cmp','config','div','divToInt','eq','gt','gte','lt','lte','minus','mod','plus','precision','random','round','shift','times','toDigits','toExponential','toFixed','toFormat','toFraction','pow','toPrecision','toString','BigNumber'][caller]+'() '+msg+': '+val);error.name='BigNumber Error';id=0;throw error}
    function round(x,sd,rm,r){var d,i,j,k,n,ni,rd,xc=x.c,pows10=POWS_TEN;if(xc){out:{for(d=1,k=xc[0];k>=10;k/=10,d++);i=sd-d;if(i<0){i+=LOG_BASE;j=sd;n=xc[ni=0];rd=n/pows10[d-j-1]%10|0}else{ni=mathceil((i+1)/LOG_BASE);if(ni>=xc.length){if(r){for(;xc.length<=ni;xc.push(0));n=rd=0;d=1;i%=LOG_BASE;j=i-LOG_BASE+1}else{break out}}else{n=k=xc[ni];for(d=1;k>=10;k/=10,d++);i%=LOG_BASE;j=i-LOG_BASE+d;rd=j<0?0:n/pows10[d-j-1]%10|0}}
        r=r||sd<0||xc[ni+1]!=null||(j<0?n:n%pows10[d-j-1]);r=rm<4?(rd||r)&&(rm==0||rm==(x.s<0?3:2)):rd>5||rd==5&&(rm==4||r||rm==6&&((i>0?j>0?n/pows10[d-j]:0:xc[ni-1])%10)&1||rm==(x.s<0?8:7));if(sd<1||!xc[0]){xc.length=0;if(r){sd-=x.e+1;xc[0]=pows10[sd%LOG_BASE];x.e=-sd||0}else{xc[0]=x.e=0}
            return x}
        if(i==0){xc.length=ni;k=1;ni--}else{xc.length=ni+1;k=pows10[LOG_BASE-i];xc[ni]=j>0?mathfloor(n/pows10[d-j]%pows10[j])*k:0}
        if(r){for(;;){if(ni==0){for(i=1,j=xc[0];j>=10;j/=10,i++);j=xc[0]+=k;for(k=1;j>=10;j/=10,k++);if(i!=k){x.e++;if(xc[0]==BASE)xc[0]=1}
            break}else{xc[ni]+=k;if(xc[ni]!=BASE)break;xc[ni--]=0;k=1}}}
        for(i=xc.length;xc[--i]===0;xc.pop());}
        if(x.e>MAX_EXP){x.c=x.e=null}else if(x.e<MIN_EXP){x.c=[x.e=0]}}
        return x}
    P.absoluteValue=P.abs=function(){var x=new BigNumber(this);if(x.s<0)x.s=1;return x};P.ceil=function(){return round(new BigNumber(this),this.e+1,2)};P.comparedTo=P.cmp=function(y,b){id=1;return compare(this,new BigNumber(y,b))};P.decimalPlaces=P.dp=function(){var n,v,c=this.c;if(!c)return null;n=((v=c.length-1)-bitFloor(this.e/LOG_BASE))*LOG_BASE;if(v=c[v])for(;v%10==0;v/=10,n--);if(n<0)n=0;return n};P.dividedBy=P.div=function(y,b){id=3;return div(this,new BigNumber(y,b),DECIMAL_PLACES,ROUNDING_MODE)};P.dividedToIntegerBy=P.divToInt=function(y,b){id=4;return div(this,new BigNumber(y,b),0,1)};P.equals=P.eq=function(y,b){id=5;return compare(this,new BigNumber(y,b))===0};P.floor=function(){return round(new BigNumber(this),this.e+1,3)};P.greaterThan=P.gt=function(y,b){id=6;return compare(this,new BigNumber(y,b))>0};P.greaterThanOrEqualTo=P.gte=function(y,b){id=7;return(b=compare(this,new BigNumber(y,b)))===1||b===0};P.isFinite=function(){return!!this.c};P.isInteger=P.isInt=function(){return!!this.c&&bitFloor(this.e/LOG_BASE)>this.c.length-2};P.isNaN=function(){return!this.s};P.isNegative=P.isNeg=function(){return this.s<0};P.isZero=function(){return!!this.c&&this.c[0]==0};P.lessThan=P.lt=function(y,b){id=8;return compare(this,new BigNumber(y,b))<0};P.lessThanOrEqualTo=P.lte=function(y,b){id=9;return(b=compare(this,new BigNumber(y,b)))===-1||b===0};P.minus=P.sub=function(y,b){var i,j,t,xLTy,x=this,a=x.s;id=10;y=new BigNumber(y,b);b=y.s;if(!a||!b)return new BigNumber(NaN);if(a!=b){y.s=-b;return x.plus(y)}
        var xe=x.e/LOG_BASE,ye=y.e/LOG_BASE,xc=x.c,yc=y.c;if(!xe||!ye){if(!xc||!yc)return xc?(y.s=-b,y):new BigNumber(yc?x:NaN);if(!xc[0]||!yc[0]){return yc[0]?(y.s=-b,y):new BigNumber(xc[0]?x:ROUNDING_MODE==3?-0:0)}}
        xe=bitFloor(xe);ye=bitFloor(ye);xc=xc.slice();if(a=xe-ye){if(xLTy=a<0){a=-a;t=xc}else{ye=xe;t=yc}
            t.reverse();for(b=a;b--;t.push(0));t.reverse()}else{j=(xLTy=(a=xc.length)<(b=yc.length))?a:b;for(a=b=0;b<j;b++){if(xc[b]!=yc[b]){xLTy=xc[b]<yc[b];break}}}
        if(xLTy)t=xc,xc=yc,yc=t,y.s=-y.s;b=(j=yc.length)-(i=xc.length);if(b>0)for(;b--;xc[i++]=0);b=BASE-1;for(;j>a;){if(xc[--j]<yc[j]){for(i=j;i&&!xc[--i];xc[i]=b);--xc[i];xc[j]+=BASE}
            xc[j]-=yc[j]}
        for(;xc[0]==0;xc.shift(),--ye);if(!xc[0]){y.s=ROUNDING_MODE==3?-1:1;y.c=[y.e=0];return y}
        return normalise(y,xc,ye)};P.modulo=P.mod=function(y,b){var q,s,x=this;id=11;y=new BigNumber(y,b);if(!x.c||!y.s||y.c&&!y.c[0]){return new BigNumber(NaN)}else if(!y.c||x.c&&!x.c[0]){return new BigNumber(x)}
        if(MODULO_MODE==9){s=y.s;y.s=1;q=div(x,y,0,3);y.s=s;q.s*=s}else{q=div(x,y,0,MODULO_MODE)}
        return x.minus(q.times(y))};P.negated=P.neg=function(){var x=new BigNumber(this);x.s=-x.s||null;return x};P.plus=P.add=function(y,b){var t,x=this,a=x.s;id=12;y=new BigNumber(y,b);b=y.s;if(!a||!b)return new BigNumber(NaN);if(a!=b){y.s=-b;return x.minus(y)}
        var xe=x.e/LOG_BASE,ye=y.e/LOG_BASE,xc=x.c,yc=y.c;if(!xe||!ye){if(!xc||!yc)return new BigNumber(a/0);if(!xc[0]||!yc[0])return yc[0]?y:new BigNumber(xc[0]?x:a*0)}
        xe=bitFloor(xe);ye=bitFloor(ye);xc=xc.slice();if(a=xe-ye){if(a>0){ye=xe;t=yc}else{a=-a;t=xc}
            t.reverse();for(;a--;t.push(0));t.reverse()}
        a=xc.length;b=yc.length;if(a-b<0)t=yc,yc=xc,xc=t,b=a;for(a=0;b;){a=(xc[--b]=xc[b]+yc[b]+a)/BASE|0;xc[b]%=BASE}
        if(a){xc.unshift(a);++ye}
        return normalise(y,xc,ye)};P.precision=P.sd=function(z){var n,v,x=this,c=x.c;if(z!=null&&z!==!!z&&z!==1&&z!==0){if(ERRORS)raise(13,'argument'+notBool,z);if(z!=!!z)z=null}
        if(!c)return null;v=c.length-1;n=v*LOG_BASE+1;if(v=c[v]){for(;v%10==0;v/=10,n--);for(v=c[0];v>=10;v/=10,n++);}
        if(z&&x.e+1>n)n=x.e+1;return n};P.round=function(dp,rm){var n=new BigNumber(this);if(dp==null||isValidInt(dp,0,MAX,15)){round(n,~~dp+this.e+1,rm==null||!isValidInt(rm,0,8,15,roundingMode)?ROUNDING_MODE:rm|0)}
        return n};P.shift=function(k){var n=this;return isValidInt(k,-MAX_SAFE_INTEGER,MAX_SAFE_INTEGER,16,'argument')?n.times('1e'+truncate(k)):new BigNumber(n.c&&n.c[0]&&(k<-MAX_SAFE_INTEGER||k>MAX_SAFE_INTEGER)?n.s*(k<0?0:1/0):n)};P.squareRoot=P.sqrt=function(){var m,n,r,rep,t,x=this,c=x.c,s=x.s,e=x.e,dp=DECIMAL_PLACES+4,half=new BigNumber('0.5');if(s!==1||!c||!c[0]){return new BigNumber(!s||s<0&&(!c||c[0])?NaN:c?x:1/0)}
        s=Math.sqrt(+x);if(s==0||s==1/0){n=coeffToString(c);if((n.length+e)%2==0)n+='0';s=Math.sqrt(n);e=bitFloor((e+1)/2)-(e<0||e%2);if(s==1/0){n='1e'+e}else{n=s.toExponential();n=n.slice(0,n.indexOf('e')+1)+e}
            r=new BigNumber(n)}else{r=new BigNumber(s+'')}
        if(r.c[0]){e=r.e;s=e+dp;if(s<3)s=0;for(;;){t=r;r=half.times(t.plus(div(x,t,dp,1)));if(coeffToString(t.c).slice(0,s)===(n=coeffToString(r.c)).slice(0,s)){if(r.e<e)--s;n=n.slice(s-3,s+1);if(n=='9999'||!rep&&n=='4999'){if(!rep){round(t,t.e+DECIMAL_PLACES+2,0);if(t.times(t).eq(x)){r=t;break}}
            dp+=4;s+=4;rep=1}else{if(!+n||!+n.slice(1)&&n.charAt(0)=='5'){round(r,r.e+DECIMAL_PLACES+2,1);m=!r.times(r).eq(x)}
            break}}}}
        return round(r,r.e+DECIMAL_PLACES+1,ROUNDING_MODE,m)};P.times=P.mul=function(y,b){var c,e,i,j,k,m,xcL,xlo,xhi,ycL,ylo,yhi,zc,base,sqrtBase,x=this,xc=x.c,yc=(id=17,y=new BigNumber(y,b)).c;if(!xc||!yc||!xc[0]||!yc[0]){if(!x.s||!y.s||xc&&!xc[0]&&!yc||yc&&!yc[0]&&!xc){y.c=y.e=y.s=null}else{y.s*=x.s;if(!xc||!yc){y.c=y.e=null}else{y.c=[0];y.e=0}}
        return y}
        e=bitFloor(x.e/LOG_BASE)+bitFloor(y.e/LOG_BASE);y.s*=x.s;xcL=xc.length;ycL=yc.length;if(xcL<ycL)zc=xc,xc=yc,yc=zc,i=xcL,xcL=ycL,ycL=i;for(i=xcL+ycL,zc=[];i--;zc.push(0));base=BASE;sqrtBase=SQRT_BASE;for(i=ycL;--i>=0;){c=0;ylo=yc[i]%sqrtBase;yhi=yc[i]/sqrtBase|0;for(k=xcL,j=i+k;j>i;){xlo=xc[--k]%sqrtBase;xhi=xc[k]/sqrtBase|0;m=yhi*xlo+xhi*ylo;xlo=ylo*xlo+((m%sqrtBase)*sqrtBase)+zc[j]+c;c=(xlo/base|0)+(m/sqrtBase|0)+yhi*xhi;zc[j--]=xlo%base}
            zc[j]=c}
        if(c){++e}else{zc.shift()}
        return normalise(y,zc,e)};P.toDigits=function(sd,rm){var n=new BigNumber(this);sd=sd==null||!isValidInt(sd,1,MAX,18,'precision')?null:sd|0;rm=rm==null||!isValidInt(rm,0,8,18,roundingMode)?ROUNDING_MODE:rm|0;return sd?round(n,sd,rm):n};P.toExponential=function(dp,rm){return format(this,dp!=null&&isValidInt(dp,0,MAX,19)?~~dp+1:null,rm,19)};P.toFixed=function(dp,rm){return format(this,dp!=null&&isValidInt(dp,0,MAX,20)?~~dp+this.e+1:null,rm,20)};P.toFormat=function(dp,rm){var str=format(this,dp!=null&&isValidInt(dp,0,MAX,21)?~~dp+this.e+1:null,rm,21);if(this.c){var i,arr=str.split('.'),g1=+FORMAT.groupSize,g2=+FORMAT.secondaryGroupSize,groupSeparator=FORMAT.groupSeparator,intPart=arr[0],fractionPart=arr[1],isNeg=this.s<0,intDigits=isNeg?intPart.slice(1):intPart,len=intDigits.length;if(g2)i=g1,g1=g2,g2=i,len-=i;if(g1>0&&len>0){i=len%g1||g1;intPart=intDigits.substr(0,i);for(;i<len;i+=g1){intPart+=groupSeparator+intDigits.substr(i,g1)}
        if(g2>0)intPart+=groupSeparator+intDigits.slice(i);if(isNeg)intPart='-'+intPart}
        str=fractionPart?intPart+FORMAT.decimalSeparator+((g2=+FORMAT.fractionGroupSize)?fractionPart.replace(new RegExp('\\d{'+g2+'}\\B','g'),'$&'+FORMAT.fractionGroupSeparator):fractionPart):intPart}
        return str};P.toFraction=function(md){var arr,d0,d2,e,exp,n,n0,q,s,k=ERRORS,x=this,xc=x.c,d=new BigNumber(ONE),n1=d0=new BigNumber(ONE),d1=n0=new BigNumber(ONE);if(md!=null){ERRORS=!1;n=new BigNumber(md);ERRORS=k;if(!(k=n.isInt())||n.lt(ONE)){if(ERRORS){raise(22,'max denominator '+(k?'out of range':'not an integer'),md)}
        md=!k&&n.c&&round(n,n.e+1,1).gte(ONE)?n:null}}
        if(!xc)return x.toString();s=coeffToString(xc);e=d.e=s.length-x.e-1;d.c[0]=POWS_TEN[(exp=e%LOG_BASE)<0?LOG_BASE+exp:exp];md=!md||n.cmp(d)>0?(e>0?d:n1):n;exp=MAX_EXP;MAX_EXP=1/0;n=new BigNumber(s);n0.c[0]=0;for(;;){q=div(n,d,0,1);d2=d0.plus(q.times(d1));if(d2.cmp(md)==1)break;d0=d1;d1=d2;n1=n0.plus(q.times(d2=n1));n0=d2;d=n.minus(q.times(d2=d));n=d2}
        d2=div(md.minus(d0),d1,0,1);n0=n0.plus(d2.times(n1));d0=d0.plus(d2.times(d1));n0.s=n1.s=x.s;e*=2;arr=div(n1,d1,e,ROUNDING_MODE).minus(x).abs().cmp(div(n0,d0,e,ROUNDING_MODE).minus(x).abs())<1?[n1.toString(),d1.toString()]:[n0.toString(),d0.toString()];MAX_EXP=exp;return arr};P.toNumber=function(){var x=this;return+x||(x.s?x.s*0:NaN)};P.toPower=P.pow=function(n){var k,y,i=mathfloor(n<0?-n:+n),x=this;if(!isValidInt(n,-MAX_SAFE_INTEGER,MAX_SAFE_INTEGER,23,'exponent')&&(!isFinite(n)||i>MAX_SAFE_INTEGER&&(n/=0)||parseFloat(n)!=n&&!(n=NaN))){return new BigNumber(Math.pow(+x,n))}
        k=POW_PRECISION?mathceil(POW_PRECISION/LOG_BASE+2):0;y=new BigNumber(ONE);for(;;){if(i%2){y=y.times(x);if(!y.c)break;if(k&&y.c.length>k)y.c.length=k}
            i=mathfloor(i/2);if(!i)break;x=x.times(x);if(k&&x.c&&x.c.length>k)x.c.length=k}
        if(n<0)y=ONE.div(y);return k?round(y,POW_PRECISION,ROUNDING_MODE):y};P.toPrecision=function(sd,rm){return format(this,sd!=null&&isValidInt(sd,1,MAX,24,'precision')?sd|0:null,rm,24)};P.toString=function(b){var str,n=this,s=n.s,e=n.e;if(e===null){if(s){str='Infinity';if(s<0)str='-'+str}else{str='NaN'}}else{str=coeffToString(n.c);if(b==null||!isValidInt(b,2,64,25,'base')){str=e<=TO_EXP_NEG||e>=TO_EXP_POS?toExponential(str,e):toFixedPoint(str,e)}else{str=convertBase(toFixedPoint(str,e),b|0,10,s)}
        if(s<0&&n.c[0])str='-'+str}
        return str};P.truncated=P.trunc=function(){return round(new BigNumber(this),this.e+1,1)};P.valueOf=P.toJSON=function(){return this.toString()};if(configObj!=null)BigNumber.config(configObj);return BigNumber}
    function bitFloor(n){var i=n|0;return n>0||n===i?i:i-1}
    function coeffToString(a){var s,z,i=1,j=a.length,r=a[0]+'';for(;i<j;){s=a[i++]+'';z=LOG_BASE-s.length;for(;z--;s='0'+s);r+=s}
        for(j=r.length;r.charCodeAt(--j)===48;);return r.slice(0,j+1||1)}
    function compare(x,y){var a,b,xc=x.c,yc=y.c,i=x.s,j=y.s,k=x.e,l=y.e;if(!i||!j)return null;a=xc&&!xc[0];b=yc&&!yc[0];if(a||b)return a?b?0:-j:i;if(i!=j)return i;a=i<0;b=k==l;if(!xc||!yc)return b?0:!xc^a?1:-1;if(!b)return k>l^a?1:-1;j=(k=xc.length)<(l=yc.length)?k:l;for(i=0;i<j;i++)if(xc[i]!=yc[i])return xc[i]>yc[i]^a?1:-1;return k==l?0:k>l^a?1:-1}
    function intValidatorNoErrors(n,min,max){return(n=truncate(n))>=min&&n<=max}
    function isArray(obj){return Object.prototype.toString.call(obj)=='[object Array]'}
    function toBaseOut(str,baseIn,baseOut){var j,arr=[0],arrL,i=0,len=str.length;for(;i<len;){for(arrL=arr.length;arrL--;arr[arrL]*=baseIn);arr[j=0]+=ALPHABET.indexOf(str.charAt(i++));for(;j<arr.length;j++){if(arr[j]>baseOut-1){if(arr[j+1]==null)arr[j+1]=0;arr[j+1]+=arr[j]/baseOut|0;arr[j]%=baseOut}}}
        return arr.reverse()}
    function toExponential(str,e){return(str.length>1?str.charAt(0)+'.'+str.slice(1):str)+(e<0?'e':'e+')+e}
    function toFixedPoint(str,e){var len,z;if(e<0){for(z='0.';++e;z+='0');str=z+str}else{len=str.length;if(++e>len){for(z='0',e-=len;--e;z+='0');str+=z}else if(e<len){str=str.slice(0,e)+'.'+str.slice(e)}}
        return str}
    function truncate(n){n=parseFloat(n);return n<0?mathceil(n):mathfloor(n)}
    BigNumber=another();if(typeof define=='function'&&define.amd){define(function(){return BigNumber})}else if(typeof module!='undefined'&&module.exports){module.exports=BigNumber;if(!crypto)try{crypto=require('crypto')}catch(e){}}else{global.BigNumber=BigNumber}})(this)},{"crypto":115}],3:[function(require,module,exports){(function(){var C=CryptoJS;var C_lib=C.lib;var BlockCipher=C_lib.BlockCipher;var C_algo=C.algo;var SBOX=[];var INV_SBOX=[];var SUB_MIX_0=[];var SUB_MIX_1=[];var SUB_MIX_2=[];var SUB_MIX_3=[];var INV_SUB_MIX_0=[];var INV_SUB_MIX_1=[];var INV_SUB_MIX_2=[];var INV_SUB_MIX_3=[];(function(){var d=[];for(var i=0;i<256;i++){if(i<128){d[i]=i<<1}else{d[i]=(i<<1)^0x11b}}
    var x=0;var xi=0;for(var i=0;i<256;i++){var sx=xi^(xi<<1)^(xi<<2)^(xi<<3)^(xi<<4);sx=(sx>>>8)^(sx&0xff)^0x63;SBOX[x]=sx;INV_SBOX[sx]=x;var x2=d[x];var x4=d[x2];var x8=d[x4];var t=(d[sx]*0x101)^(sx*0x1010100);SUB_MIX_0[x]=(t<<24)|(t>>>8);SUB_MIX_1[x]=(t<<16)|(t>>>16);SUB_MIX_2[x]=(t<<8)|(t>>>24);SUB_MIX_3[x]=t;var t=(x8*0x1010101)^(x4*0x10001)^(x2*0x101)^(x*0x1010100);INV_SUB_MIX_0[sx]=(t<<24)|(t>>>8);INV_SUB_MIX_1[sx]=(t<<16)|(t>>>16);INV_SUB_MIX_2[sx]=(t<<8)|(t>>>24);INV_SUB_MIX_3[sx]=t;if(!x){x=xi=1}else{x=x2^d[d[d[x8^x2]]];xi^=d[d[xi]]}}}());var RCON=[0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];var AES=C_algo.AES=BlockCipher.extend({_doReset:function(){var key=this._key;var keyWords=key.words;var keySize=key.sigBytes/4;var nRounds=this._nRounds=keySize+6
    var ksRows=(nRounds+1)*4;var keySchedule=this._keySchedule=[];for(var ksRow=0;ksRow<ksRows;ksRow++){if(ksRow<keySize){keySchedule[ksRow]=keyWords[ksRow]}else{var t=keySchedule[ksRow-1];if(!(ksRow%keySize)){t=(t<<8)|(t>>>24);t=(SBOX[t>>>24]<<24)|(SBOX[(t>>>16)&0xff]<<16)|(SBOX[(t>>>8)&0xff]<<8)|SBOX[t&0xff];t^=RCON[(ksRow/keySize)|0]<<24}else if(keySize>6&&ksRow%keySize==4){t=(SBOX[t>>>24]<<24)|(SBOX[(t>>>16)&0xff]<<16)|(SBOX[(t>>>8)&0xff]<<8)|SBOX[t&0xff]}
        keySchedule[ksRow]=keySchedule[ksRow-keySize]^t}}
    var invKeySchedule=this._invKeySchedule=[];for(var invKsRow=0;invKsRow<ksRows;invKsRow++){var ksRow=ksRows-invKsRow;if(invKsRow%4){var t=keySchedule[ksRow]}else{var t=keySchedule[ksRow-4]}
        if(invKsRow<4||ksRow<=4){invKeySchedule[invKsRow]=t}else{invKeySchedule[invKsRow]=INV_SUB_MIX_0[SBOX[t>>>24]]^INV_SUB_MIX_1[SBOX[(t>>>16)&0xff]]^INV_SUB_MIX_2[SBOX[(t>>>8)&0xff]]^INV_SUB_MIX_3[SBOX[t&0xff]]}}},encryptBlock:function(M,offset){this._doCryptBlock(M,offset,this._keySchedule,SUB_MIX_0,SUB_MIX_1,SUB_MIX_2,SUB_MIX_3,SBOX)},decryptBlock:function(M,offset){var t=M[offset+1];M[offset+1]=M[offset+3];M[offset+3]=t;this._doCryptBlock(M,offset,this._invKeySchedule,INV_SUB_MIX_0,INV_SUB_MIX_1,INV_SUB_MIX_2,INV_SUB_MIX_3,INV_SBOX);var t=M[offset+1];M[offset+1]=M[offset+3];M[offset+3]=t},_doCryptBlock:function(M,offset,keySchedule,SUB_MIX_0,SUB_MIX_1,SUB_MIX_2,SUB_MIX_3,SBOX){var nRounds=this._nRounds;var s0=M[offset]^keySchedule[0];var s1=M[offset+1]^keySchedule[1];var s2=M[offset+2]^keySchedule[2];var s3=M[offset+3]^keySchedule[3];var ksRow=4;for(var round=1;round<nRounds;round++){var t0=SUB_MIX_0[s0>>>24]^SUB_MIX_1[(s1>>>16)&0xff]^SUB_MIX_2[(s2>>>8)&0xff]^SUB_MIX_3[s3&0xff]^keySchedule[ksRow++];var t1=SUB_MIX_0[s1>>>24]^SUB_MIX_1[(s2>>>16)&0xff]^SUB_MIX_2[(s3>>>8)&0xff]^SUB_MIX_3[s0&0xff]^keySchedule[ksRow++];var t2=SUB_MIX_0[s2>>>24]^SUB_MIX_1[(s3>>>16)&0xff]^SUB_MIX_2[(s0>>>8)&0xff]^SUB_MIX_3[s1&0xff]^keySchedule[ksRow++];var t3=SUB_MIX_0[s3>>>24]^SUB_MIX_1[(s0>>>16)&0xff]^SUB_MIX_2[(s1>>>8)&0xff]^SUB_MIX_3[s2&0xff]^keySchedule[ksRow++];s0=t0;s1=t1;s2=t2;s3=t3}
    var t0=((SBOX[s0>>>24]<<24)|(SBOX[(s1>>>16)&0xff]<<16)|(SBOX[(s2>>>8)&0xff]<<8)|SBOX[s3&0xff])^keySchedule[ksRow++];var t1=((SBOX[s1>>>24]<<24)|(SBOX[(s2>>>16)&0xff]<<16)|(SBOX[(s3>>>8)&0xff]<<8)|SBOX[s0&0xff])^keySchedule[ksRow++];var t2=((SBOX[s2>>>24]<<24)|(SBOX[(s3>>>16)&0xff]<<16)|(SBOX[(s0>>>8)&0xff]<<8)|SBOX[s1&0xff])^keySchedule[ksRow++];var t3=((SBOX[s3>>>24]<<24)|(SBOX[(s0>>>16)&0xff]<<16)|(SBOX[(s1>>>8)&0xff]<<8)|SBOX[s2&0xff])^keySchedule[ksRow++];M[offset]=t0;M[offset+1]=t1;M[offset+2]=t2;M[offset+3]=t3},keySize:256/32});C.AES=BlockCipher._createHelper(AES)}())},{}],4:[function(require,module,exports){CryptoJS.lib.Cipher||(function(undefined){var C=CryptoJS;var C_lib=C.lib;var Base=C_lib.Base;var WordArray=C_lib.WordArray;var BufferedBlockAlgorithm=C_lib.BufferedBlockAlgorithm;var C_enc=C.enc;var Utf8=C_enc.Utf8;var Base64=C_enc.Base64;var C_algo=C.algo;var EvpKDF=C_algo.EvpKDF;var Cipher=C_lib.Cipher=BufferedBlockAlgorithm.extend({cfg:Base.extend(),createEncryptor:function(key,cfg){return this.create(this._ENC_XFORM_MODE,key,cfg)},createDecryptor:function(key,cfg){return this.create(this._DEC_XFORM_MODE,key,cfg)},init:function(xformMode,key,cfg){this.cfg=this.cfg.extend(cfg);this._xformMode=xformMode;this._key=key;this.reset()},reset:function(){BufferedBlockAlgorithm.reset.call(this);this._doReset()},process:function(dataUpdate){this._append(dataUpdate);return this._process()},finalize:function(dataUpdate){if(dataUpdate){this._append(dataUpdate)}
    var finalProcessedData=this._doFinalize();return finalProcessedData},keySize:128/32,ivSize:128/32,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:(function(){function selectCipherStrategy(key){if(typeof key=='string'){return PasswordBasedCipher}else{return SerializableCipher}}
    return function(cipher){return{encrypt:function(message,key,cfg){return selectCipherStrategy(key).encrypt(cipher,message,key,cfg)},decrypt:function(ciphertext,key,cfg){return selectCipherStrategy(key).decrypt(cipher,ciphertext,key,cfg)}}}}())});var StreamCipher=C_lib.StreamCipher=Cipher.extend({_doFinalize:function(){var finalProcessedBlocks=this._process(!!'flush');return finalProcessedBlocks},blockSize:1});var C_mode=C.mode={};var BlockCipherMode=C_lib.BlockCipherMode=Base.extend({createEncryptor:function(cipher,iv){return this.Encryptor.create(cipher,iv)},createDecryptor:function(cipher,iv){return this.Decryptor.create(cipher,iv)},init:function(cipher,iv){this._cipher=cipher;this._iv=iv}});var CBC=C_mode.CBC=(function(){var CBC=BlockCipherMode.extend();CBC.Encryptor=CBC.extend({processBlock:function(words,offset){var cipher=this._cipher;var blockSize=cipher.blockSize;xorBlock.call(this,words,offset,blockSize);cipher.encryptBlock(words,offset);this._prevBlock=words.slice(offset,offset+blockSize)}});CBC.Decryptor=CBC.extend({processBlock:function(words,offset){var cipher=this._cipher;var blockSize=cipher.blockSize;var thisBlock=words.slice(offset,offset+blockSize);cipher.decryptBlock(words,offset);xorBlock.call(this,words,offset,blockSize);this._prevBlock=thisBlock}});function xorBlock(words,offset,blockSize){var iv=this._iv;if(iv){var block=iv;this._iv=undefined}else{var block=this._prevBlock}
    for(var i=0;i<blockSize;i++){words[offset+i]^=block[i]}}
    return CBC}());var C_pad=C.pad={};var Pkcs7=C_pad.Pkcs7={pad:function(data,blockSize){var blockSizeBytes=blockSize*4;var nPaddingBytes=blockSizeBytes-data.sigBytes%blockSizeBytes;var paddingWord=(nPaddingBytes<<24)|(nPaddingBytes<<16)|(nPaddingBytes<<8)|nPaddingBytes;var paddingWords=[];for(var i=0;i<nPaddingBytes;i+=4){paddingWords.push(paddingWord)}
    var padding=WordArray.create(paddingWords,nPaddingBytes);data.concat(padding)},unpad:function(data){var nPaddingBytes=data.words[(data.sigBytes-1)>>>2]&0xff;data.sigBytes-=nPaddingBytes}};var BlockCipher=C_lib.BlockCipher=Cipher.extend({cfg:Cipher.cfg.extend({mode:CBC,padding:Pkcs7}),reset:function(){Cipher.reset.call(this);var cfg=this.cfg;var iv=cfg.iv;var mode=cfg.mode;if(this._xformMode==this._ENC_XFORM_MODE){var modeCreator=mode.createEncryptor}else{var modeCreator=mode.createDecryptor;this._minBufferSize=1}
    this._mode=modeCreator.call(mode,this,iv&&iv.words)},_doProcessBlock:function(words,offset){this._mode.processBlock(words,offset)},_doFinalize:function(){var padding=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){padding.pad(this._data,this.blockSize);var finalProcessedBlocks=this._process(!!'flush')}else{var finalProcessedBlocks=this._process(!!'flush');padding.unpad(finalProcessedBlocks)}
    return finalProcessedBlocks},blockSize:128/32});var CipherParams=C_lib.CipherParams=Base.extend({init:function(cipherParams){this.mixIn(cipherParams)},toString:function(formatter){return(formatter||this.formatter).stringify(this)}});var C_format=C.format={};var OpenSSLFormatter=C_format.OpenSSL={stringify:function(cipherParams){var ciphertext=cipherParams.ciphertext;var salt=cipherParams.salt;if(salt){var wordArray=WordArray.create([0x53616c74,0x65645f5f]).concat(salt).concat(ciphertext)}else{var wordArray=ciphertext}
    return wordArray.toString(Base64)},parse:function(openSSLStr){var ciphertext=Base64.parse(openSSLStr);var ciphertextWords=ciphertext.words;if(ciphertextWords[0]==0x53616c74&&ciphertextWords[1]==0x65645f5f){var salt=WordArray.create(ciphertextWords.slice(2,4));ciphertextWords.splice(0,4);ciphertext.sigBytes-=16}
    return CipherParams.create({ciphertext:ciphertext,salt:salt})}};var SerializableCipher=C_lib.SerializableCipher=Base.extend({cfg:Base.extend({format:OpenSSLFormatter}),encrypt:function(cipher,message,key,cfg){cfg=this.cfg.extend(cfg);var encryptor=cipher.createEncryptor(key,cfg);var ciphertext=encryptor.finalize(message);var cipherCfg=encryptor.cfg;return CipherParams.create({ciphertext:ciphertext,key:key,iv:cipherCfg.iv,algorithm:cipher,mode:cipherCfg.mode,padding:cipherCfg.padding,blockSize:cipher.blockSize,formatter:cfg.format})},decrypt:function(cipher,ciphertext,key,cfg){cfg=this.cfg.extend(cfg);ciphertext=this._parse(ciphertext,cfg.format);var plaintext=cipher.createDecryptor(key,cfg).finalize(ciphertext.ciphertext);return plaintext},_parse:function(ciphertext,format){if(typeof ciphertext=='string'){return format.parse(ciphertext,this)}else{return ciphertext}}});var C_kdf=C.kdf={};var OpenSSLKdf=C_kdf.OpenSSL={execute:function(password,keySize,ivSize,salt){if(!salt){salt=WordArray.random(64/8)}
    var key=EvpKDF.create({keySize:keySize+ivSize}).compute(password,salt);var iv=WordArray.create(key.words.slice(keySize),ivSize*4);key.sigBytes=keySize*4;return CipherParams.create({key:key,iv:iv,salt:salt})}};var PasswordBasedCipher=C_lib.PasswordBasedCipher=SerializableCipher.extend({cfg:SerializableCipher.cfg.extend({kdf:OpenSSLKdf}),encrypt:function(cipher,message,password,cfg){cfg=this.cfg.extend(cfg);var derivedParams=cfg.kdf.execute(password,cipher.keySize,cipher.ivSize);cfg.iv=derivedParams.iv;var ciphertext=SerializableCipher.encrypt.call(this,cipher,message,derivedParams.key,cfg);ciphertext.mixIn(derivedParams);return ciphertext},decrypt:function(cipher,ciphertext,password,cfg){cfg=this.cfg.extend(cfg);ciphertext=this._parse(ciphertext,cfg.format);var derivedParams=cfg.kdf.execute(password,cipher.keySize,cipher.ivSize,ciphertext.salt);cfg.iv=derivedParams.iv;var plaintext=SerializableCipher.decrypt.call(this,cipher,ciphertext,derivedParams.key,cfg);return plaintext}})}())},{}],5:[function(require,module,exports){(function(){var C=CryptoJS;var C_lib=C.lib;var WordArray=C_lib.WordArray;var C_enc=C.enc;var Base64=C_enc.Base64={stringify:function(wordArray){var words=wordArray.words;var sigBytes=wordArray.sigBytes;var map=this._map;wordArray.clamp();var base64Chars=[];for(var i=0;i<sigBytes;i+=3){var byte1=(words[i>>>2]>>>(24-(i%4)*8))&0xff;var byte2=(words[(i+1)>>>2]>>>(24-((i+1)%4)*8))&0xff;var byte3=(words[(i+2)>>>2]>>>(24-((i+2)%4)*8))&0xff;var triplet=(byte1<<16)|(byte2<<8)|byte3;for(var j=0;(j<4)&&(i+j*0.75<sigBytes);j++){base64Chars.push(map.charAt((triplet>>>(6*(3-j)))&0x3f))}}
    var paddingChar=map.charAt(64);if(paddingChar){while(base64Chars.length%4){base64Chars.push(paddingChar)}}
    return base64Chars.join('')},parse:function(base64Str){var base64StrLength=base64Str.length;var map=this._map;var paddingChar=map.charAt(64);if(paddingChar){var paddingIndex=base64Str.indexOf(paddingChar);if(paddingIndex!=-1){base64StrLength=paddingIndex}}
    var words=[];var nBytes=0;for(var i=0;i<base64StrLength;i++){if(i%4){var bits1=map.indexOf(base64Str.charAt(i-1))<<((i%4)*2);var bits2=map.indexOf(base64Str.charAt(i))>>>(6-(i%4)*2);words[nBytes>>>2]|=(bits1|bits2)<<(24-(nBytes%4)*8);nBytes++}}
    return WordArray.create(words,nBytes)},_map:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='}}())},{}],6:[function(require,module,exports){(function(){var C=CryptoJS;var C_lib=C.lib;var Base=C_lib.Base;var WordArray=C_lib.WordArray;var C_algo=C.algo;var MD5=C_algo.MD5;var EvpKDF=C_algo.EvpKDF=Base.extend({cfg:Base.extend({keySize:128/32,hasher:MD5,iterations:1}),init:function(cfg){this.cfg=this.cfg.extend(cfg)},compute:function(password,salt){var cfg=this.cfg;var hasher=cfg.hasher.create();var derivedKey=WordArray.create();var derivedKeyWords=derivedKey.words;var keySize=cfg.keySize;var iterations=cfg.iterations;while(derivedKeyWords.length<keySize){if(block){hasher.update(block)}
    var block=hasher.update(password).finalize(salt);hasher.reset();for(var i=1;i<iterations;i++){block=hasher.finalize(block);hasher.reset()}
    derivedKey.concat(block)}
    derivedKey.sigBytes=keySize*4;return derivedKey}});C.EvpKDF=function(password,salt,cfg){return EvpKDF.create(cfg).compute(password,salt)}}())},{}],7:[function(require,module,exports){(function(Math){var C=CryptoJS;var C_lib=C.lib;var WordArray=C_lib.WordArray;var Hasher=C_lib.Hasher;var C_algo=C.algo;var T=[];(function(){for(var i=0;i<64;i++){T[i]=(Math.abs(Math.sin(i+1))*0x100000000)|0}}());var MD5=C_algo.MD5=Hasher.extend({_doReset:function(){this._hash=new WordArray.init([0x67452301,0xefcdab89,0x98badcfe,0x10325476])},_doProcessBlock:function(M,offset){for(var i=0;i<16;i++){var offset_i=offset+i;var M_offset_i=M[offset_i];M[offset_i]=((((M_offset_i<<8)|(M_offset_i>>>24))&0x00ff00ff)|(((M_offset_i<<24)|(M_offset_i>>>8))&0xff00ff00))}
    var H=this._hash.words;var M_offset_0=M[offset+0];var M_offset_1=M[offset+1];var M_offset_2=M[offset+2];var M_offset_3=M[offset+3];var M_offset_4=M[offset+4];var M_offset_5=M[offset+5];var M_offset_6=M[offset+6];var M_offset_7=M[offset+7];var M_offset_8=M[offset+8];var M_offset_9=M[offset+9];var M_offset_10=M[offset+10];var M_offset_11=M[offset+11];var M_offset_12=M[offset+12];var M_offset_13=M[offset+13];var M_offset_14=M[offset+14];var M_offset_15=M[offset+15];var a=H[0];var b=H[1];var c=H[2];var d=H[3];a=FF(a,b,c,d,M_offset_0,7,T[0]);d=FF(d,a,b,c,M_offset_1,12,T[1]);c=FF(c,d,a,b,M_offset_2,17,T[2]);b=FF(b,c,d,a,M_offset_3,22,T[3]);a=FF(a,b,c,d,M_offset_4,7,T[4]);d=FF(d,a,b,c,M_offset_5,12,T[5]);c=FF(c,d,a,b,M_offset_6,17,T[6]);b=FF(b,c,d,a,M_offset_7,22,T[7]);a=FF(a,b,c,d,M_offset_8,7,T[8]);d=FF(d,a,b,c,M_offset_9,12,T[9]);c=FF(c,d,a,b,M_offset_10,17,T[10]);b=FF(b,c,d,a,M_offset_11,22,T[11]);a=FF(a,b,c,d,M_offset_12,7,T[12]);d=FF(d,a,b,c,M_offset_13,12,T[13]);c=FF(c,d,a,b,M_offset_14,17,T[14]);b=FF(b,c,d,a,M_offset_15,22,T[15]);a=GG(a,b,c,d,M_offset_1,5,T[16]);d=GG(d,a,b,c,M_offset_6,9,T[17]);c=GG(c,d,a,b,M_offset_11,14,T[18]);b=GG(b,c,d,a,M_offset_0,20,T[19]);a=GG(a,b,c,d,M_offset_5,5,T[20]);d=GG(d,a,b,c,M_offset_10,9,T[21]);c=GG(c,d,a,b,M_offset_15,14,T[22]);b=GG(b,c,d,a,M_offset_4,20,T[23]);a=GG(a,b,c,d,M_offset_9,5,T[24]);d=GG(d,a,b,c,M_offset_14,9,T[25]);c=GG(c,d,a,b,M_offset_3,14,T[26]);b=GG(b,c,d,a,M_offset_8,20,T[27]);a=GG(a,b,c,d,M_offset_13,5,T[28]);d=GG(d,a,b,c,M_offset_2,9,T[29]);c=GG(c,d,a,b,M_offset_7,14,T[30]);b=GG(b,c,d,a,M_offset_12,20,T[31]);a=HH(a,b,c,d,M_offset_5,4,T[32]);d=HH(d,a,b,c,M_offset_8,11,T[33]);c=HH(c,d,a,b,M_offset_11,16,T[34]);b=HH(b,c,d,a,M_offset_14,23,T[35]);a=HH(a,b,c,d,M_offset_1,4,T[36]);d=HH(d,a,b,c,M_offset_4,11,T[37]);c=HH(c,d,a,b,M_offset_7,16,T[38]);b=HH(b,c,d,a,M_offset_10,23,T[39]);a=HH(a,b,c,d,M_offset_13,4,T[40]);d=HH(d,a,b,c,M_offset_0,11,T[41]);c=HH(c,d,a,b,M_offset_3,16,T[42]);b=HH(b,c,d,a,M_offset_6,23,T[43]);a=HH(a,b,c,d,M_offset_9,4,T[44]);d=HH(d,a,b,c,M_offset_12,11,T[45]);c=HH(c,d,a,b,M_offset_15,16,T[46]);b=HH(b,c,d,a,M_offset_2,23,T[47]);a=II(a,b,c,d,M_offset_0,6,T[48]);d=II(d,a,b,c,M_offset_7,10,T[49]);c=II(c,d,a,b,M_offset_14,15,T[50]);b=II(b,c,d,a,M_offset_5,21,T[51]);a=II(a,b,c,d,M_offset_12,6,T[52]);d=II(d,a,b,c,M_offset_3,10,T[53]);c=II(c,d,a,b,M_offset_10,15,T[54]);b=II(b,c,d,a,M_offset_1,21,T[55]);a=II(a,b,c,d,M_offset_8,6,T[56]);d=II(d,a,b,c,M_offset_15,10,T[57]);c=II(c,d,a,b,M_offset_6,15,T[58]);b=II(b,c,d,a,M_offset_13,21,T[59]);a=II(a,b,c,d,M_offset_4,6,T[60]);d=II(d,a,b,c,M_offset_11,10,T[61]);c=II(c,d,a,b,M_offset_2,15,T[62]);b=II(b,c,d,a,M_offset_9,21,T[63]);H[0]=(H[0]+a)|0;H[1]=(H[1]+b)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0},_doFinalize:function(){var data=this._data;var dataWords=data.words;var nBitsTotal=this._nDataBytes*8;var nBitsLeft=data.sigBytes*8;dataWords[nBitsLeft>>>5]|=0x80<<(24-nBitsLeft%32);var nBitsTotalH=Math.floor(nBitsTotal/0x100000000);var nBitsTotalL=nBitsTotal;dataWords[(((nBitsLeft+64)>>>9)<<4)+15]=((((nBitsTotalH<<8)|(nBitsTotalH>>>24))&0x00ff00ff)|(((nBitsTotalH<<24)|(nBitsTotalH>>>8))&0xff00ff00));dataWords[(((nBitsLeft+64)>>>9)<<4)+14]=((((nBitsTotalL<<8)|(nBitsTotalL>>>24))&0x00ff00ff)|(((nBitsTotalL<<24)|(nBitsTotalL>>>8))&0xff00ff00));data.sigBytes=(dataWords.length+1)*4;this._process();var hash=this._hash;var H=hash.words;for(var i=0;i<4;i++){var H_i=H[i];H[i]=(((H_i<<8)|(H_i>>>24))&0x00ff00ff)|(((H_i<<24)|(H_i>>>8))&0xff00ff00)}
    return hash},clone:function(){var clone=Hasher.clone.call(this);clone._hash=this._hash.clone();return clone}});function FF(a,b,c,d,x,s,t){var n=a+((b&c)|(~b&d))+x+t;return((n<<s)|(n>>>(32-s)))+b}
    function GG(a,b,c,d,x,s,t){var n=a+((b&d)|(c&~d))+x+t;return((n<<s)|(n>>>(32-s)))+b}
    function HH(a,b,c,d,x,s,t){var n=a+(b^c^d)+x+t;return((n<<s)|(n>>>(32-s)))+b}
    function II(a,b,c,d,x,s,t){var n=a+(c^(b|~d))+x+t;return((n<<s)|(n>>>(32-s)))+b}
    C.MD5=Hasher._createHelper(MD5);C.HmacMD5=Hasher._createHmacHelper(MD5)}(Math))},{}],8:[function(require,module,exports){var CryptoJS=CryptoJS||(function(Math,undefined){var C={};var C_lib=C.lib={};var Base=C_lib.Base=(function(){function F(){}
    return{extend:function(overrides){F.prototype=this;var subtype=new F();if(overrides){subtype.mixIn(overrides)}
        if(!subtype.hasOwnProperty('init')){subtype.init=function(){subtype.$super.init.apply(this,arguments)}}
        subtype.init.prototype=subtype;subtype.$super=this;return subtype},create:function(){var instance=this.extend();instance.init.apply(instance,arguments);return instance},init:function(){},mixIn:function(properties){for(var propertyName in properties){if(properties.hasOwnProperty(propertyName)){this[propertyName]=properties[propertyName]}}
        if(properties.hasOwnProperty('toString')){this.toString=properties.toString}},clone:function(){return this.init.prototype.extend(this)}}}());var WordArray=C_lib.WordArray=Base.extend({init:function(words,sigBytes){words=this.words=words||[];if(sigBytes!=undefined){this.sigBytes=sigBytes}else{this.sigBytes=words.length*4}},toString:function(encoder){return(encoder||Hex).stringify(this)},concat:function(wordArray){var thisWords=this.words;var thatWords=wordArray.words;var thisSigBytes=this.sigBytes;var thatSigBytes=wordArray.sigBytes;this.clamp();if(thisSigBytes%4){for(var i=0;i<thatSigBytes;i++){var thatByte=(thatWords[i>>>2]>>>(24-(i%4)*8))&0xff;thisWords[(thisSigBytes+i)>>>2]|=thatByte<<(24-((thisSigBytes+i)%4)*8)}}else if(thatWords.length>0xffff){for(var i=0;i<thatSigBytes;i+=4){thisWords[(thisSigBytes+i)>>>2]=thatWords[i>>>2]}}else{thisWords.push.apply(thisWords,thatWords)}
    this.sigBytes+=thatSigBytes;return this},clamp:function(){var words=this.words;var sigBytes=this.sigBytes;words[sigBytes>>>2]&=0xffffffff<<(32-(sigBytes%4)*8);words.length=Math.ceil(sigBytes/4)},clone:function(){var clone=Base.clone.call(this);clone.words=this.words.slice(0);return clone},random:function(nBytes){var words=[];for(var i=0;i<nBytes;i+=4){words.push((Math.random()*0x100000000)|0)}
    return new WordArray.init(words,nBytes)}});var C_enc=C.enc={};var Hex=C_enc.Hex={stringify:function(wordArray){var words=wordArray.words;var sigBytes=wordArray.sigBytes;var hexChars=[];for(var i=0;i<sigBytes;i++){var bite=(words[i>>>2]>>>(24-(i%4)*8))&0xff;hexChars.push((bite>>>4).toString(16));hexChars.push((bite&0x0f).toString(16))}
    return hexChars.join('')},parse:function(hexStr){var hexStrLength=hexStr.length;var words=[];for(var i=0;i<hexStrLength;i+=2){words[i>>>3]|=parseInt(hexStr.substr(i,2),16)<<(24-(i%8)*4)}
    return new WordArray.init(words,hexStrLength/2)}};var Latin1=C_enc.Latin1={stringify:function(wordArray){var words=wordArray.words;var sigBytes=wordArray.sigBytes;var latin1Chars=[];for(var i=0;i<sigBytes;i++){var bite=(words[i>>>2]>>>(24-(i%4)*8))&0xff;latin1Chars.push(String.fromCharCode(bite))}
    return latin1Chars.join('')},parse:function(latin1Str){var latin1StrLength=latin1Str.length;var words=[];for(var i=0;i<latin1StrLength;i++){words[i>>>2]|=(latin1Str.charCodeAt(i)&0xff)<<(24-(i%4)*8)}
    return new WordArray.init(words,latin1StrLength)}};var Utf8=C_enc.Utf8={stringify:function(wordArray){try{return decodeURIComponent(escape(Latin1.stringify(wordArray)))}catch(e){throw new Error('Malformed UTF-8 data')}},parse:function(utf8Str){return Latin1.parse(unescape(encodeURIComponent(utf8Str)))}};var BufferedBlockAlgorithm=C_lib.BufferedBlockAlgorithm=Base.extend({reset:function(){this._data=new WordArray.init();this._nDataBytes=0},_append:function(data){if(typeof data=='string'){data=Utf8.parse(data)}
    this._data.concat(data);this._nDataBytes+=data.sigBytes},_process:function(doFlush){var data=this._data;var dataWords=data.words;var dataSigBytes=data.sigBytes;var blockSize=this.blockSize;var blockSizeBytes=blockSize*4;var nBlocksReady=dataSigBytes/blockSizeBytes;if(doFlush){nBlocksReady=Math.ceil(nBlocksReady)}else{nBlocksReady=Math.max((nBlocksReady|0)-this._minBufferSize,0)}
    var nWordsReady=nBlocksReady*blockSize;var nBytesReady=Math.min(nWordsReady*4,dataSigBytes);if(nWordsReady){for(var offset=0;offset<nWordsReady;offset+=blockSize){this._doProcessBlock(dataWords,offset)}
        var processedWords=dataWords.splice(0,nWordsReady);data.sigBytes-=nBytesReady}
    return new WordArray.init(processedWords,nBytesReady)},clone:function(){var clone=Base.clone.call(this);clone._data=this._data.clone();return clone},_minBufferSize:0});var Hasher=C_lib.Hasher=BufferedBlockAlgorithm.extend({cfg:Base.extend(),init:function(cfg){this.cfg=this.cfg.extend(cfg);this.reset()},reset:function(){BufferedBlockAlgorithm.reset.call(this);this._doReset()},update:function(messageUpdate){this._append(messageUpdate);this._process();return this},finalize:function(messageUpdate){if(messageUpdate){this._append(messageUpdate)}
    var hash=this._doFinalize();return hash},blockSize:512/32,_createHelper:function(hasher){return function(message,cfg){return new hasher.init(cfg).finalize(message)}},_createHmacHelper:function(hasher){return function(message,key){return new C_algo.HMAC.init(hasher,key).finalize(message)}}});var C_algo=C.algo={};return C}(Math));module.exports=CryptoJS},{}],9:[function(require,module,exports){(function(Buffer){const utils=require('ethereumjs-util');const BN=require('bn.js');const ec=require('elliptic').ec('secp256k1');exports.txVerifySignature=function(){var msgHash=this.hash(!1);var pubKey=this.getSenderPublicKey();if(pubKey){var sig={r:new BN(this.r),s:new BN(this.s)};return ec.verify(new BN(msgHash),sig,ec.keyFromPublic(pubKey))}else{return!1}};exports.txSign=function(privateKey){var msgHash=this.hash(!1);var sig=ec.sign(new BN(msgHash),new BN(privateKey));var key=ec.keyFromPrivate(new BN(privateKey));this.r=new Buffer(sig.r.toArray());this.s=new Buffer(sig.s.toArray());this.v=sig.recoveryParam+27;this._senderPubKey=!1};exports.txGetSenderPublicKey=function(){var msgHash=this.hash(!1);if(!this._senderPubKey){this._senderPubKey=!1;try{var r=ec.recoverPubKey(new BN(msgHash),{r:new BN(this.r),s:new BN(this.s)},utils.bufferToInt(this.v)-27);var rj=r.toJSON();this._senderPubKey=Buffer.concat([new Buffer([4]),new Buffer(rj[0].toArray()),new Buffer(rj[1].toArray())])}catch(e){}}
    return this._senderPubKey}}).call(this,require("buffer").Buffer)},{"bn.js":11,"buffer":111,"elliptic":12,"ethereumjs-util":37}],10:[function(require,module,exports){(function(global,Buffer){const BN=require('bn.js')
    const rlp=require('rlp')
    const ethUtil=require('ethereumjs-util')
    const fees=require('ethereum-common').fees
    const ecdsaOps=require('./ecdsaOps.js')
    global.Buffer=Buffer
    global.ethUtil=ethUtil
    var Transaction=module.exports=function(data){var self=this
        const fields=[{name:'nonce',word:!0,noZero:!0,default:new Buffer([])},{name:'gasPrice',word:!0,default:new Buffer([])},{name:'gasLimit',word:!0,default:new Buffer([])},{name:'to',empty:!0,length:20,default:new Buffer([])},{name:'value',empty:!0,word:!0,noZero:!0,default:new Buffer([])},{name:'data',empty:!0,default:new Buffer([0])},{name:'v',length:1,default:new Buffer([0x1c])},{name:'r',pad:!0,length:32,default:ethUtil.zeros(32)},{name:'s',pad:!0,length:32,default:ethUtil.zeros(32)}]
        Object.defineProperty(this,'from',{enumerable:!1,configurable:!0,get:function(){if(this._from)
            return this._from
            return this._from=this.getSenderAddress()},set:function(v){this._from=v}})
        ethUtil.defineProperties(this,fields,data)}
    Transaction.prototype.serialize=function(){return rlp.encode(this.raw)}
    Transaction.prototype.hash=function(signature){var toHash
        if(typeof signature==='undefined')
            signature=!0
        if(signature)
            toHash=this.raw
        else toHash=this.raw.slice(0,6)
        return ethUtil.sha3(rlp.encode(toHash))}
    Transaction.prototype.getSenderAddress=function(){const pubKey=this.getSenderPublicKey()
        return ethUtil.pubToAddress(pubKey)}
    Transaction.prototype.getSenderPublicKey=ecdsaOps.txGetSenderPublicKey
    Transaction.prototype.verifySignature=ecdsaOps.txVerifySignature
    Transaction.prototype.sign=ecdsaOps.txSign
    Transaction.prototype.getDataFee=function(){const data=this.raw[5]
        var cost=new BN(0)
        for(var i=0;i<data.length;i++){if(data[i]===0)
            cost.iaddn(fees.txDataZeroGas.v)
        else cost.iaddn(fees.txDataNonZeroGas.v)}
        return cost}
    Transaction.prototype.getBaseFee=function(){return this.getDataFee().addn(fees.txGas.v)}
    Transaction.prototype.getUpfrontCost=function(){return new BN(this.gasLimit).mul(new BN(this.gasPrice)).addn(this.value)}
    Transaction.prototype.validate=function(){return this.verifySignature()&&(Number(this.getBaseFee().toString())<=ethUtil.bufferToInt(this.gasLimit))}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{},require("buffer").Buffer)},{"./ecdsaOps.js":9,"bn.js":11,"buffer":111,"ethereum-common":35,"ethereumjs-util":37,"rlp":66}],11:[function(require,module,exports){(function(module,exports){'use strict';function assert(val,msg){if(!val)
    throw new Error(msg||'Assertion failed')}
    function inherits(ctor,superCtor){ctor.super_=superCtor;var TempCtor=function(){};TempCtor.prototype=superCtor.prototype;ctor.prototype=new TempCtor();ctor.prototype.constructor=ctor}
    function BN(number,base,endian){if(number!==null&&typeof number==='object'&&Array.isArray(number.words)){return number}
        this.sign=!1;this.words=null;this.length=0;this.red=null;if(base==='le'||base==='be'){endian=base;base=10}
        if(number!==null)
            this._init(number||0,base||10,endian||'be')}
    if(typeof module==='object')
        module.exports=BN;else exports.BN=BN;BN.BN=BN;BN.wordSize=26;BN.prototype._init=function init(number,base,endian){if(typeof number==='number'){return this._initNumber(number,base,endian)}else if(typeof number==='object'){return this._initArray(number,base,endian)}
        if(base==='hex')
            base=16;assert(base===(base|0)&&base>=2&&base<=36);number=number.toString().replace(/\s+/g,'');var start=0;if(number[0]==='-')
            start++;if(base===16)
            this._parseHex(number,start);else this._parseBase(number,base,start);if(number[0]==='-')
            this.sign=!0;this.strip();if(endian!=='le')
            return;this._initArray(this.toArray(),base,endian)};BN.prototype._initNumber=function _initNumber(number,base,endian){if(number<0){this.sign=!0;number=-number}
        if(number<0x4000000){this.words=[number&0x3ffffff];this.length=1}else if(number<0x10000000000000){this.words=[number&0x3ffffff,(number/0x4000000)&0x3ffffff];this.length=2}else{assert(number<0x20000000000000);this.words=[number&0x3ffffff,(number/0x4000000)&0x3ffffff,1];this.length=3}
        if(endian!=='le')
            return;this._initArray(this.toArray(),base,endian)};BN.prototype._initArray=function _initArray(number,base,endian){assert(typeof number.length==='number');if(number.length<=0){this.words=[0];this.length=1;return this}
        this.length=Math.ceil(number.length/3);this.words=new Array(this.length);for(var i=0;i<this.length;i++)
            this.words[i]=0;var off=0;if(endian==='be'){for(var i=number.length-1,j=0;i>=0;i-=3){var w=number[i]|(number[i-1]<<8)|(number[i-2]<<16);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]=(w>>>(26-off))&0x3ffffff;off+=24;if(off>=26){off-=26;j++}}}else if(endian==='le'){for(var i=0,j=0;i<number.length;i+=3){var w=number[i]|(number[i+1]<<8)|(number[i+2]<<16);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]=(w>>>(26-off))&0x3ffffff;off+=24;if(off>=26){off-=26;j++}}}
        return this.strip()};function parseHex(str,start,end){var r=0;var len=Math.min(str.length,end);for(var i=start;i<len;i++){var c=str.charCodeAt(i)-48;r<<=4;if(c>=49&&c<=54)
        r|=c-49+0xa;else if(c>=17&&c<=22)
        r|=c-17+0xa;else r|=c&0xf}
        return r}
    BN.prototype._parseHex=function _parseHex(number,start){this.length=Math.ceil((number.length-start)/6);this.words=new Array(this.length);for(var i=0;i<this.length;i++)
        this.words[i]=0;var off=0;for(var i=number.length-6,j=0;i>=start;i-=6){var w=parseHex(number,i,i+6);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]|=w>>>(26-off)&0x3fffff;off+=24;if(off>=26){off-=26;j++}}
        if(i+6!==start){var w=parseHex(number,start,i+6);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]|=w>>>(26-off)&0x3fffff}
        this.strip()};function parseBase(str,start,end,mul){var r=0;var len=Math.min(str.length,end);for(var i=start;i<len;i++){var c=str.charCodeAt(i)-48;r*=mul;if(c>=49)
        r+=c-49+0xa;else if(c>=17)
        r+=c-17+0xa;else r+=c}
        return r}
    BN.prototype._parseBase=function _parseBase(number,base,start){this.words=[0];this.length=1;for(var limbLen=0,limbPow=1;limbPow<=0x3ffffff;limbPow*=base)
        limbLen++;limbLen--;limbPow=(limbPow/base)|0;var total=number.length-start;var mod=total%limbLen;var end=Math.min(total,total-mod)+start;var word=0;for(var i=start;i<end;i+=limbLen){word=parseBase(number,i,i+limbLen,base);this.imuln(limbPow);if(this.words[0]+word<0x4000000)
        this.words[0]+=word;else this._iaddn(word)}
        if(mod!==0){var pow=1;var word=parseBase(number,i,number.length,base);for(var i=0;i<mod;i++)
            pow*=base;this.imuln(pow);if(this.words[0]+word<0x4000000)
            this.words[0]+=word;else this._iaddn(word)}};BN.prototype.copy=function copy(dest){dest.words=new Array(this.length);for(var i=0;i<this.length;i++)
        dest.words[i]=this.words[i];dest.length=this.length;dest.sign=this.sign;dest.red=this.red};BN.prototype.clone=function clone(){var r=new BN(null);this.copy(r);return r};BN.prototype.strip=function strip(){while(this.length>1&&this.words[this.length-1]===0)
        this.length--;return this._normSign()};BN.prototype._normSign=function _normSign(){if(this.length===1&&this.words[0]===0)
        this.sign=!1;return this};BN.prototype.inspect=function inspect(){return(this.red?'<BN-R: ':'<BN: ')+this.toString(16)+'>'};var zeros=['','0','00','000','0000','00000','000000','0000000','00000000','000000000','0000000000','00000000000','000000000000','0000000000000','00000000000000','000000000000000','0000000000000000','00000000000000000','000000000000000000','0000000000000000000','00000000000000000000','000000000000000000000','0000000000000000000000','00000000000000000000000','000000000000000000000000','0000000000000000000000000'];var groupSizes=[0,0,25,16,12,11,10,9,8,8,7,7,7,7,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5];var groupBases=[0,0,33554432,43046721,16777216,48828125,60466176,40353607,16777216,43046721,10000000,19487171,35831808,62748517,7529536,11390625,16777216,24137569,34012224,47045881,64000000,4084101,5153632,6436343,7962624,9765625,11881376,14348907,17210368,20511149,24300000,28629151,33554432,39135393,45435424,52521875,60466176];BN.prototype.toString=function toString(base,padding){base=base||10;if(base===16||base==='hex'){var out='';var off=0;var padding=padding|0||1;var carry=0;for(var i=0;i<this.length;i++){var w=this.words[i];var word=(((w<<off)|carry)&0xffffff).toString(16);carry=(w>>>(24-off))&0xffffff;if(carry!==0||i!==this.length-1)
        out=zeros[6-word.length]+word+out;else out=word+out;off+=2;if(off>=26){off-=26;i--}}
        if(carry!==0)
            out=carry.toString(16)+out;while(out.length%padding!==0)
            out='0'+out;if(this.sign)
            out='-'+out;return out}else if(base===(base|0)&&base>=2&&base<=36){var groupSize=groupSizes[base];var groupBase=groupBases[base];var out='';var c=this.clone();c.sign=!1;while(c.cmpn(0)!==0){var r=c.modn(groupBase).toString(base);c=c.idivn(groupBase);if(c.cmpn(0)!==0)
        out=zeros[groupSize-r.length]+r+out;else out=r+out}
        if(this.cmpn(0)===0)
            out='0'+out;if(this.sign)
            out='-'+out;return out}else{assert(!1,'Base should be between 2 and 36')}};BN.prototype.toJSON=function toJSON(){return this.toString(16)};BN.prototype.toArray=function toArray(endian){this.strip();var res=new Array(this.byteLength());res[0]=0;var q=this.clone();if(endian!=='le'){for(var i=0;q.cmpn(0)!==0;i++){var b=q.andln(0xff);q.ishrn(8);res[res.length-i-1]=b}}else{for(var i=0;q.cmpn(0)!==0;i++){var b=q.andln(0xff);q.ishrn(8);res[i]=b}}
        return res};if(Math.clz32){BN.prototype._countBits=function _countBits(w){return 32-Math.clz32(w)}}else{BN.prototype._countBits=function _countBits(w){var t=w;var r=0;if(t>=0x1000){r+=13;t>>>=13}
        if(t>=0x40){r+=7;t>>>=7}
        if(t>=0x8){r+=4;t>>>=4}
        if(t>=0x02){r+=2;t>>>=2}
        return r+t}}
    BN.prototype._zeroBits=function _zeroBits(w){if(w===0)
        return 26;var t=w;var r=0;if((t&0x1fff)===0){r+=13;t>>>=13}
        if((t&0x7f)===0){r+=7;t>>>=7}
        if((t&0xf)===0){r+=4;t>>>=4}
        if((t&0x3)===0){r+=2;t>>>=2}
        if((t&0x1)===0)
            r++;return r};BN.prototype.bitLength=function bitLength(){var hi=0;var w=this.words[this.length-1];var hi=this._countBits(w);return(this.length-1)*26+hi};BN.prototype.zeroBits=function zeroBits(){if(this.cmpn(0)===0)
        return 0;var r=0;for(var i=0;i<this.length;i++){var b=this._zeroBits(this.words[i]);r+=b;if(b!==26)
        break}
        return r};BN.prototype.byteLength=function byteLength(){return Math.ceil(this.bitLength()/8)};BN.prototype.neg=function neg(){if(this.cmpn(0)===0)
        return this.clone();var r=this.clone();r.sign=!this.sign;return r};BN.prototype.ior=function ior(num){this.sign=this.sign||num.sign;while(this.length<num.length)
        this.words[this.length++]=0;for(var i=0;i<num.length;i++)
        this.words[i]=this.words[i]|num.words[i];return this.strip()};BN.prototype.or=function or(num){if(this.length>num.length)
        return this.clone().ior(num);else return num.clone().ior(this)};BN.prototype.iand=function iand(num){this.sign=this.sign&&num.sign;var b;if(this.length>num.length)
        b=num;else b=this;for(var i=0;i<b.length;i++)
        this.words[i]=this.words[i]&num.words[i];this.length=b.length;return this.strip()};BN.prototype.and=function and(num){if(this.length>num.length)
        return this.clone().iand(num);else return num.clone().iand(this)};BN.prototype.ixor=function ixor(num){this.sign=this.sign||num.sign;var a;var b;if(this.length>num.length){a=this;b=num}else{a=num;b=this}
        for(var i=0;i<b.length;i++)
            this.words[i]=a.words[i]^b.words[i];if(this!==a)
            for(;i<a.length;i++)
                this.words[i]=a.words[i];this.length=a.length;return this.strip()};BN.prototype.xor=function xor(num){if(this.length>num.length)
        return this.clone().ixor(num);else return num.clone().ixor(this)};BN.prototype.setn=function setn(bit,val){assert(typeof bit==='number'&&bit>=0);var off=(bit/26)|0;var wbit=bit%26;while(this.length<=off)
        this.words[this.length++]=0;if(val)
        this.words[off]=this.words[off]|(1<<wbit);else this.words[off]=this.words[off]&~(1<<wbit);return this.strip()};BN.prototype.iadd=function iadd(num){if(this.sign&&!num.sign){this.sign=!1;var r=this.isub(num);this.sign=!this.sign;return this._normSign()}else if(!this.sign&&num.sign){num.sign=!1;var r=this.isub(num);num.sign=!0;return r._normSign()}
        var a;var b;if(this.length>num.length){a=this;b=num}else{a=num;b=this}
        var carry=0;for(var i=0;i<b.length;i++){var r=a.words[i]+b.words[i]+carry;this.words[i]=r&0x3ffffff;carry=r>>>26}
        for(;carry!==0&&i<a.length;i++){var r=a.words[i]+carry;this.words[i]=r&0x3ffffff;carry=r>>>26}
        this.length=a.length;if(carry!==0){this.words[this.length]=carry;this.length++}else if(a!==this){for(;i<a.length;i++)
            this.words[i]=a.words[i]}
        return this};BN.prototype.add=function add(num){if(num.sign&&!this.sign){num.sign=!1;var res=this.sub(num);num.sign=!0;return res}else if(!num.sign&&this.sign){this.sign=!1;var res=num.sub(this);this.sign=!0;return res}
        if(this.length>num.length)
            return this.clone().iadd(num);else return num.clone().iadd(this)};BN.prototype.isub=function isub(num){if(num.sign){num.sign=!1;var r=this.iadd(num);num.sign=!0;return r._normSign()}else if(this.sign){this.sign=!1;this.iadd(num);this.sign=!0;return this._normSign()}
        var cmp=this.cmp(num);if(cmp===0){this.sign=!1;this.length=1;this.words[0]=0;return this}
        var a;var b;if(cmp>0){a=this;b=num}else{a=num;b=this}
        var carry=0;for(var i=0;i<b.length;i++){var r=a.words[i]-b.words[i]+carry;carry=r>>26;this.words[i]=r&0x3ffffff}
        for(;carry!==0&&i<a.length;i++){var r=a.words[i]+carry;carry=r>>26;this.words[i]=r&0x3ffffff}
        if(carry===0&&i<a.length&&a!==this)
            for(;i<a.length;i++)
                this.words[i]=a.words[i];this.length=Math.max(this.length,i);if(a!==this)
            this.sign=!0;return this.strip()};BN.prototype.sub=function sub(num){return this.clone().isub(num)};BN.prototype._smallMulTo=function _smallMulTo(num,out){out.sign=num.sign!==this.sign;out.length=this.length+num.length;var carry=0;for(var k=0;k<out.length-1;k++){var ncarry=carry>>>26;var rword=carry&0x3ffffff;var maxJ=Math.min(k,num.length-1);for(var j=Math.max(0,k-this.length+1);j<=maxJ;j++){var i=k-j;var a=this.words[i]|0;var b=num.words[j]|0;var r=a*b;var lo=r&0x3ffffff;ncarry=(ncarry+((r/0x4000000)|0))|0;lo=(lo+rword)|0;rword=lo&0x3ffffff;ncarry=(ncarry+(lo>>>26))|0}
        out.words[k]=rword;carry=ncarry}
        if(carry!==0){out.words[k]=carry}else{out.length--}
        return out.strip()};BN.prototype._bigMulTo=function _bigMulTo(num,out){out.sign=num.sign!==this.sign;out.length=this.length+num.length;var carry=0;var hncarry=0;for(var k=0;k<out.length-1;k++){var ncarry=hncarry;hncarry=0;var rword=carry&0x3ffffff;var maxJ=Math.min(k,num.length-1);for(var j=Math.max(0,k-this.length+1);j<=maxJ;j++){var i=k-j;var a=this.words[i]|0;var b=num.words[j]|0;var r=a*b;var lo=r&0x3ffffff;ncarry=(ncarry+((r/0x4000000)|0))|0;lo=(lo+rword)|0;rword=lo&0x3ffffff;ncarry=(ncarry+(lo>>>26))|0;hncarry+=ncarry>>>26;ncarry&=0x3ffffff}
        out.words[k]=rword;carry=ncarry;ncarry=hncarry}
        if(carry!==0){out.words[k]=carry}else{out.length--}
        return out.strip()};BN.prototype.mulTo=function mulTo(num,out){var res;if(this.length+num.length<63)
        res=this._smallMulTo(num,out);else res=this._bigMulTo(num,out);return res};BN.prototype.mul=function mul(num){var out=new BN(null);out.words=new Array(this.length+num.length);return this.mulTo(num,out)};BN.prototype.imul=function imul(num){if(this.cmpn(0)===0||num.cmpn(0)===0){this.words[0]=0;this.length=1;return this}
        var tlen=this.length;var nlen=num.length;this.sign=num.sign!==this.sign;this.length=this.length+num.length;this.words[this.length-1]=0;for(var k=this.length-2;k>=0;k--){var carry=0;var rword=0;var maxJ=Math.min(k,nlen-1);for(var j=Math.max(0,k-tlen+1);j<=maxJ;j++){var i=k-j;var a=this.words[i];var b=num.words[j];var r=a*b;var lo=r&0x3ffffff;carry+=(r/0x4000000)|0;lo+=rword;rword=lo&0x3ffffff;carry+=lo>>>26}
            this.words[k]=rword;this.words[k+1]+=carry;carry=0}
        var carry=0;for(var i=1;i<this.length;i++){var w=this.words[i]+carry;this.words[i]=w&0x3ffffff;carry=w>>>26}
        return this.strip()};BN.prototype.imuln=function imuln(num){assert(typeof num==='number');var carry=0;for(var i=0;i<this.length;i++){var w=this.words[i]*num;var lo=(w&0x3ffffff)+(carry&0x3ffffff);carry>>=26;carry+=(w/0x4000000)|0;carry+=lo>>>26;this.words[i]=lo&0x3ffffff}
        if(carry!==0){this.words[i]=carry;this.length++}
        return this};BN.prototype.muln=function muln(num){return this.clone().imuln(num)};BN.prototype.sqr=function sqr(){return this.mul(this)};BN.prototype.isqr=function isqr(){return this.mul(this)};BN.prototype.ishln=function ishln(bits){assert(typeof bits==='number'&&bits>=0);var r=bits%26;var s=(bits-r)/26;var carryMask=(0x3ffffff>>>(26-r))<<(26-r);if(r!==0){var carry=0;for(var i=0;i<this.length;i++){var newCarry=this.words[i]&carryMask;var c=(this.words[i]-newCarry)<<r;this.words[i]=c|carry;carry=newCarry>>>(26-r)}
        if(carry){this.words[i]=carry;this.length++}}
        if(s!==0){for(var i=this.length-1;i>=0;i--)
            this.words[i+s]=this.words[i];for(var i=0;i<s;i++)
            this.words[i]=0;this.length+=s}
        return this.strip()};BN.prototype.ishrn=function ishrn(bits,hint,extended){assert(typeof bits==='number'&&bits>=0);var h;if(hint)
        h=(hint-(hint%26))/26;else h=0;var r=bits%26;var s=Math.min((bits-r)/26,this.length);var mask=0x3ffffff^((0x3ffffff>>>r)<<r);var maskedWords=extended;h-=s;h=Math.max(0,h);if(maskedWords){for(var i=0;i<s;i++)
        maskedWords.words[i]=this.words[i];maskedWords.length=s}
        if(s===0){}else if(this.length>s){this.length-=s;for(var i=0;i<this.length;i++)
            this.words[i]=this.words[i+s]}else{this.words[0]=0;this.length=1}
        var carry=0;for(var i=this.length-1;i>=0&&(carry!==0||i>=h);i--){var word=this.words[i];this.words[i]=(carry<<(26-r))|(word>>>r);carry=word&mask}
        if(maskedWords&&carry!==0)
            maskedWords.words[maskedWords.length++]=carry;if(this.length===0){this.words[0]=0;this.length=1}
        this.strip();return this};BN.prototype.shln=function shln(bits){return this.clone().ishln(bits)};BN.prototype.shrn=function shrn(bits){return this.clone().ishrn(bits)};BN.prototype.testn=function testn(bit){assert(typeof bit==='number'&&bit>=0);var r=bit%26;var s=(bit-r)/26;var q=1<<r;if(this.length<=s){return!1}
        var w=this.words[s];return!!(w&q)};BN.prototype.imaskn=function imaskn(bits){assert(typeof bits==='number'&&bits>=0);var r=bits%26;var s=(bits-r)/26;assert(!this.sign,'imaskn works only with positive numbers');if(r!==0)
        s++;this.length=Math.min(s,this.length);if(r!==0){var mask=0x3ffffff^((0x3ffffff>>>r)<<r);this.words[this.length-1]&=mask}
        return this.strip()};BN.prototype.maskn=function maskn(bits){return this.clone().imaskn(bits)};BN.prototype.iaddn=function iaddn(num){assert(typeof num==='number');if(num<0)
        return this.isubn(-num);if(this.sign){if(this.length===1&&this.words[0]<num){this.words[0]=num-this.words[0];this.sign=!1;return this}
        this.sign=!1;this.isubn(num);this.sign=!0;return this}
        return this._iaddn(num)};BN.prototype._iaddn=function _iaddn(num){this.words[0]+=num;for(var i=0;i<this.length&&this.words[i]>=0x4000000;i++){this.words[i]-=0x4000000;if(i===this.length-1)
        this.words[i+1]=1;else this.words[i+1]++}
        this.length=Math.max(this.length,i+1);return this};BN.prototype.isubn=function isubn(num){assert(typeof num==='number');if(num<0)
        return this.iaddn(-num);if(this.sign){this.sign=!1;this.iaddn(num);this.sign=!0;return this}
        this.words[0]-=num;for(var i=0;i<this.length&&this.words[i]<0;i++){this.words[i]+=0x4000000;this.words[i+1]-=1}
        return this.strip()};BN.prototype.addn=function addn(num){return this.clone().iaddn(num)};BN.prototype.subn=function subn(num){return this.clone().isubn(num)};BN.prototype.iabs=function iabs(){this.sign=!1;return this};BN.prototype.abs=function abs(){return this.clone().iabs()};BN.prototype._ishlnsubmul=function _ishlnsubmul(num,mul,shift){var len=num.length+shift;var i;if(this.words.length<len){var t=new Array(len);for(var i=0;i<this.length;i++)
        t[i]=this.words[i];this.words=t}else{i=this.length}
        this.length=Math.max(this.length,len);for(;i<this.length;i++)
            this.words[i]=0;var carry=0;for(var i=0;i<num.length;i++){var w=this.words[i+shift]+carry;var right=num.words[i]*mul;w-=right&0x3ffffff;carry=(w>>26)-((right/0x4000000)|0);this.words[i+shift]=w&0x3ffffff}
        for(;i<this.length-shift;i++){var w=this.words[i+shift]+carry;carry=w>>26;this.words[i+shift]=w&0x3ffffff}
        if(carry===0)
            return this.strip();assert(carry===-1);carry=0;for(var i=0;i<this.length;i++){var w=-this.words[i]+carry;carry=w>>26;this.words[i]=w&0x3ffffff}
        this.sign=!0;return this.strip()};BN.prototype._wordDiv=function _wordDiv(num,mode){var shift=this.length-num.length;var a=this.clone();var b=num;var bhi=b.words[b.length-1];var bhiBits=this._countBits(bhi);shift=26-bhiBits;if(shift!==0){b=b.shln(shift);a.ishln(shift);bhi=b.words[b.length-1]}
        var m=a.length-b.length;var q;if(mode!=='mod'){q=new BN(null);q.length=m+1;q.words=new Array(q.length);for(var i=0;i<q.length;i++)
            q.words[i]=0}
        var diff=a.clone()._ishlnsubmul(b,1,m);if(!diff.sign){a=diff;if(q)
            q.words[m]=1}
        for(var j=m-1;j>=0;j--){var qj=a.words[b.length+j]*0x4000000+a.words[b.length+j-1];qj=Math.min((qj/bhi)|0,0x3ffffff);a._ishlnsubmul(b,qj,j);while(a.sign){qj--;a.sign=!1;a._ishlnsubmul(b,1,j);if(a.cmpn(0)!==0)
            a.sign=!a.sign}
            if(q)
                q.words[j]=qj}
        if(q)
            q.strip();a.strip();if(mode!=='div'&&shift!==0)
            a.ishrn(shift);return{div:q?q:null,mod:a}};BN.prototype.divmod=function divmod(num,mode){assert(num.cmpn(0)!==0);if(this.sign&&!num.sign){var res=this.neg().divmod(num,mode);var div;var mod;if(mode!=='mod')
        div=res.div.neg();if(mode!=='div')
        mod=res.mod.cmpn(0)===0?res.mod:num.sub(res.mod);return{div:div,mod:mod}}else if(!this.sign&&num.sign){var res=this.divmod(num.neg(),mode);var div;if(mode!=='mod')
        div=res.div.neg();return{div:div,mod:res.mod}}else if(this.sign&&num.sign){return this.neg().divmod(num.neg(),mode)}
        if(num.length>this.length||this.cmp(num)<0)
            return{div:new BN(0),mod:this};if(num.length===1){if(mode==='div')
            return{div:this.divn(num.words[0]),mod:null};else if(mode==='mod')
            return{div:null,mod:new BN(this.modn(num.words[0]))};return{div:this.divn(num.words[0]),mod:new BN(this.modn(num.words[0]))}}
        return this._wordDiv(num,mode)};BN.prototype.div=function div(num){return this.divmod(num,'div').div};BN.prototype.mod=function mod(num){return this.divmod(num,'mod').mod};BN.prototype.divRound=function divRound(num){var dm=this.divmod(num);if(dm.mod.cmpn(0)===0)
        return dm.div;var mod=dm.div.sign?dm.mod.isub(num):dm.mod;var half=num.shrn(1);var r2=num.andln(1);var cmp=mod.cmp(half);if(cmp<0||r2===1&&cmp===0)
        return dm.div;return dm.div.sign?dm.div.isubn(1):dm.div.iaddn(1)};BN.prototype.modn=function modn(num){assert(num<=0x3ffffff);var p=(1<<26)%num;var acc=0;for(var i=this.length-1;i>=0;i--)
        acc=(p*acc+this.words[i])%num;return acc};BN.prototype.idivn=function idivn(num){assert(num<=0x3ffffff);var carry=0;for(var i=this.length-1;i>=0;i--){var w=this.words[i]+carry*0x4000000;this.words[i]=(w/num)|0;carry=w%num}
        return this.strip()};BN.prototype.divn=function divn(num){return this.clone().idivn(num)};BN.prototype.egcd=function egcd(p){assert(!p.sign);assert(p.cmpn(0)!==0);var x=this;var y=p.clone();if(x.sign)
        x=x.mod(p);else x=x.clone();var A=new BN(1);var B=new BN(0);var C=new BN(0);var D=new BN(1);var g=0;while(x.isEven()&&y.isEven()){x.ishrn(1);y.ishrn(1);++g}
        var yp=y.clone();var xp=x.clone();while(x.cmpn(0)!==0){while(x.isEven()){x.ishrn(1);if(A.isEven()&&B.isEven()){A.ishrn(1);B.ishrn(1)}else{A.iadd(yp).ishrn(1);B.isub(xp).ishrn(1)}}
            while(y.isEven()){y.ishrn(1);if(C.isEven()&&D.isEven()){C.ishrn(1);D.ishrn(1)}else{C.iadd(yp).ishrn(1);D.isub(xp).ishrn(1)}}
            if(x.cmp(y)>=0){x.isub(y);A.isub(C);B.isub(D)}else{y.isub(x);C.isub(A);D.isub(B)}}
        return{a:C,b:D,gcd:y.ishln(g)}};BN.prototype._invmp=function _invmp(p){assert(!p.sign);assert(p.cmpn(0)!==0);var a=this;var b=p.clone();if(a.sign)
        a=a.mod(p);else a=a.clone();var x1=new BN(1);var x2=new BN(0);var delta=b.clone();while(a.cmpn(1)>0&&b.cmpn(1)>0){while(a.isEven()){a.ishrn(1);if(x1.isEven())
        x1.ishrn(1);else x1.iadd(delta).ishrn(1)}
        while(b.isEven()){b.ishrn(1);if(x2.isEven())
            x2.ishrn(1);else x2.iadd(delta).ishrn(1)}
        if(a.cmp(b)>=0){a.isub(b);x1.isub(x2)}else{b.isub(a);x2.isub(x1)}}
        if(a.cmpn(1)===0)
            return x1;else return x2};BN.prototype.gcd=function gcd(num){if(this.cmpn(0)===0)
        return num.clone();if(num.cmpn(0)===0)
        return this.clone();var a=this.clone();var b=num.clone();a.sign=!1;b.sign=!1;for(var shift=0;a.isEven()&&b.isEven();shift++){a.ishrn(1);b.ishrn(1)}
        do{while(a.isEven())
            a.ishrn(1);while(b.isEven())
            b.ishrn(1);var r=a.cmp(b);if(r<0){var t=a;a=b;b=t}else if(r===0||b.cmpn(1)===0){break}
            a.isub(b)}while(!0);return b.ishln(shift)};BN.prototype.invm=function invm(num){return this.egcd(num).a.mod(num)};BN.prototype.isEven=function isEven(){return(this.words[0]&1)===0};BN.prototype.isOdd=function isOdd(){return(this.words[0]&1)===1};BN.prototype.andln=function andln(num){return this.words[0]&num};BN.prototype.bincn=function bincn(bit){assert(typeof bit==='number');var r=bit%26;var s=(bit-r)/26;var q=1<<r;if(this.length<=s){for(var i=this.length;i<s+1;i++)
        this.words[i]=0;this.words[s]|=q;this.length=s+1;return this}
        var carry=q;for(var i=s;carry!==0&&i<this.length;i++){var w=this.words[i];w+=carry;carry=w>>>26;w&=0x3ffffff;this.words[i]=w}
        if(carry!==0){this.words[i]=carry;this.length++}
        return this};BN.prototype.cmpn=function cmpn(num){var sign=num<0;if(sign)
        num=-num;if(this.sign&&!sign)
        return-1;else if(!this.sign&&sign)
        return 1;num&=0x3ffffff;this.strip();var res;if(this.length>1){res=1}else{var w=this.words[0];res=w===num?0:w<num?-1:1}
        if(this.sign)
            res=-res;return res};BN.prototype.cmp=function cmp(num){if(this.sign&&!num.sign)
        return-1;else if(!this.sign&&num.sign)
        return 1;var res=this.ucmp(num);if(this.sign)
        return-res;else return res};BN.prototype.ucmp=function ucmp(num){if(this.length>num.length)
        return 1;else if(this.length<num.length)
        return-1;var res=0;for(var i=this.length-1;i>=0;i--){var a=this.words[i];var b=num.words[i];if(a===b)
        continue;if(a<b)
        res=-1;else if(a>b)
        res=1;break}
        return res};BN.red=function red(num){return new Red(num)};BN.prototype.toRed=function toRed(ctx){assert(!this.red,'Already a number in reduction context');assert(!this.sign,'red works only with positives');return ctx.convertTo(this)._forceRed(ctx)};BN.prototype.fromRed=function fromRed(){assert(this.red,'fromRed works only with numbers in reduction context');return this.red.convertFrom(this)};BN.prototype._forceRed=function _forceRed(ctx){this.red=ctx;return this};BN.prototype.forceRed=function forceRed(ctx){assert(!this.red,'Already a number in reduction context');return this._forceRed(ctx)};BN.prototype.redAdd=function redAdd(num){assert(this.red,'redAdd works only with red numbers');return this.red.add(this,num)};BN.prototype.redIAdd=function redIAdd(num){assert(this.red,'redIAdd works only with red numbers');return this.red.iadd(this,num)};BN.prototype.redSub=function redSub(num){assert(this.red,'redSub works only with red numbers');return this.red.sub(this,num)};BN.prototype.redISub=function redISub(num){assert(this.red,'redISub works only with red numbers');return this.red.isub(this,num)};BN.prototype.redShl=function redShl(num){assert(this.red,'redShl works only with red numbers');return this.red.shl(this,num)};BN.prototype.redMul=function redMul(num){assert(this.red,'redMul works only with red numbers');this.red._verify2(this,num);return this.red.mul(this,num)};BN.prototype.redIMul=function redIMul(num){assert(this.red,'redMul works only with red numbers');this.red._verify2(this,num);return this.red.imul(this,num)};BN.prototype.redSqr=function redSqr(){assert(this.red,'redSqr works only with red numbers');this.red._verify1(this);return this.red.sqr(this)};BN.prototype.redISqr=function redISqr(){assert(this.red,'redISqr works only with red numbers');this.red._verify1(this);return this.red.isqr(this)};BN.prototype.redSqrt=function redSqrt(){assert(this.red,'redSqrt works only with red numbers');this.red._verify1(this);return this.red.sqrt(this)};BN.prototype.redInvm=function redInvm(){assert(this.red,'redInvm works only with red numbers');this.red._verify1(this);return this.red.invm(this)};BN.prototype.redNeg=function redNeg(){assert(this.red,'redNeg works only with red numbers');this.red._verify1(this);return this.red.neg(this)};BN.prototype.redPow=function redPow(num){assert(this.red&&!num.red,'redPow(normalNum)');this.red._verify1(this);return this.red.pow(this,num)};var primes={k256:null,p224:null,p192:null,p25519:null};function MPrime(name,p){this.name=name;this.p=new BN(p,16);this.n=this.p.bitLength();this.k=new BN(1).ishln(this.n).isub(this.p);this.tmp=this._tmp()}
    MPrime.prototype._tmp=function _tmp(){var tmp=new BN(null);tmp.words=new Array(Math.ceil(this.n/13));return tmp};MPrime.prototype.ireduce=function ireduce(num){var r=num;var rlen;do{this.split(r,this.tmp);r=this.imulK(r);r=r.iadd(this.tmp);rlen=r.bitLength()}while(rlen>this.n);var cmp=rlen<this.n?-1:r.ucmp(this.p);if(cmp===0){r.words[0]=0;r.length=1}else if(cmp>0){r.isub(this.p)}else{r.strip()}
        return r};MPrime.prototype.split=function split(input,out){input.ishrn(this.n,0,out)};MPrime.prototype.imulK=function imulK(num){return num.imul(this.k)};function K256(){MPrime.call(this,'k256','ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f')}
    inherits(K256,MPrime);K256.prototype.split=function split(input,output){var mask=0x3fffff;var outLen=Math.min(input.length,9);for(var i=0;i<outLen;i++)
        output.words[i]=input.words[i];output.length=outLen;if(input.length<=9){input.words[0]=0;input.length=1;return}
        var prev=input.words[9];output.words[output.length++]=prev&mask;for(var i=10;i<input.length;i++){var next=input.words[i];input.words[i-10]=((next&mask)<<4)|(prev>>>22);prev=next}
        input.words[i-10]=prev>>>22;input.length-=9};K256.prototype.imulK=function imulK(num){num.words[num.length]=0;num.words[num.length+1]=0;num.length+=2;var hi;var lo=0;for(var i=0;i<num.length;i++){var w=num.words[i];hi=w*0x40;lo+=w*0x3d1;hi+=(lo/0x4000000)|0;lo&=0x3ffffff;num.words[i]=lo;lo=hi}
        if(num.words[num.length-1]===0){num.length--;if(num.words[num.length-1]===0)
            num.length--}
        return num};function P224(){MPrime.call(this,'p224','ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001')}
    inherits(P224,MPrime);function P192(){MPrime.call(this,'p192','ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff')}
    inherits(P192,MPrime);function P25519(){MPrime.call(this,'25519','7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed')}
    inherits(P25519,MPrime);P25519.prototype.imulK=function imulK(num){var carry=0;for(var i=0;i<num.length;i++){var hi=num.words[i]*0x13+carry;var lo=hi&0x3ffffff;hi>>>=26;num.words[i]=lo;carry=hi}
        if(carry!==0)
            num.words[num.length++]=carry;return num};BN._prime=function prime(name){if(primes[name])
        return primes[name];var prime;if(name==='k256')
        prime=new K256();else if(name==='p224')
        prime=new P224();else if(name==='p192')
        prime=new P192();else if(name==='p25519')
        prime=new P25519();else throw new Error('Unknown prime '+name);primes[name]=prime;return prime};function Red(m){if(typeof m==='string'){var prime=BN._prime(m);this.m=prime.p;this.prime=prime}else{this.m=m;this.prime=null}}
    Red.prototype._verify1=function _verify1(a){assert(!a.sign,'red works only with positives');assert(a.red,'red works only with red numbers')};Red.prototype._verify2=function _verify2(a,b){assert(!a.sign&&!b.sign,'red works only with positives');assert(a.red&&a.red===b.red,'red works only with red numbers')};Red.prototype.imod=function imod(a){if(this.prime)
        return this.prime.ireduce(a)._forceRed(this);return a.mod(this.m)._forceRed(this)};Red.prototype.neg=function neg(a){var r=a.clone();r.sign=!r.sign;return r.iadd(this.m)._forceRed(this)};Red.prototype.add=function add(a,b){this._verify2(a,b);var res=a.add(b);if(res.cmp(this.m)>=0)
        res.isub(this.m);return res._forceRed(this)};Red.prototype.iadd=function iadd(a,b){this._verify2(a,b);var res=a.iadd(b);if(res.cmp(this.m)>=0)
        res.isub(this.m);return res};Red.prototype.sub=function sub(a,b){this._verify2(a,b);var res=a.sub(b);if(res.cmpn(0)<0)
        res.iadd(this.m);return res._forceRed(this)};Red.prototype.isub=function isub(a,b){this._verify2(a,b);var res=a.isub(b);if(res.cmpn(0)<0)
        res.iadd(this.m);return res};Red.prototype.shl=function shl(a,num){this._verify1(a);return this.imod(a.shln(num))};Red.prototype.imul=function imul(a,b){this._verify2(a,b);return this.imod(a.imul(b))};Red.prototype.mul=function mul(a,b){this._verify2(a,b);return this.imod(a.mul(b))};Red.prototype.isqr=function isqr(a){return this.imul(a,a)};Red.prototype.sqr=function sqr(a){return this.mul(a,a)};Red.prototype.sqrt=function sqrt(a){if(a.cmpn(0)===0)
        return a.clone();var mod3=this.m.andln(3);assert(mod3%2===1);if(mod3===3){var pow=this.m.add(new BN(1)).ishrn(2);var r=this.pow(a,pow);return r}
        var q=this.m.subn(1);var s=0;while(q.cmpn(0)!==0&&q.andln(1)===0){s++;q.ishrn(1)}
        assert(q.cmpn(0)!==0);var one=new BN(1).toRed(this);var nOne=one.redNeg();var lpow=this.m.subn(1).ishrn(1);var z=this.m.bitLength();z=new BN(2*z*z).toRed(this);while(this.pow(z,lpow).cmp(nOne)!==0)
            z.redIAdd(nOne);var c=this.pow(z,q);var r=this.pow(a,q.addn(1).ishrn(1));var t=this.pow(a,q);var m=s;while(t.cmp(one)!==0){var tmp=t;for(var i=0;tmp.cmp(one)!==0;i++)
            tmp=tmp.redSqr();assert(i<m);var b=this.pow(c,new BN(1).ishln(m-i-1));r=r.redMul(b);c=b.redSqr();t=t.redMul(c);m=i}
        return r};Red.prototype.invm=function invm(a){var inv=a._invmp(this.m);if(inv.sign){inv.sign=!1;return this.imod(inv).redNeg()}else{return this.imod(inv)}};Red.prototype.pow=function pow(a,num){var w=[];if(num.cmpn(0)===0)
        return new BN(1);var q=num.clone();while(q.cmpn(0)!==0){w.push(q.andln(1));q.ishrn(1)}
        var res=a;for(var i=0;i<w.length;i++,res=this.sqr(res))
            if(w[i]!==0)
                break;if(++i<w.length){for(var q=this.sqr(res);i<w.length;i++,q=this.sqr(q)){if(w[i]===0)
            continue;res=this.mul(res,q)}}
        return res};Red.prototype.convertTo=function convertTo(num){var r=num.mod(this.m);if(r===num)
        return r.clone();else return r};Red.prototype.convertFrom=function convertFrom(num){var res=num.clone();res.red=null;return res};BN.mont=function mont(num){return new Mont(num)};function Mont(m){Red.call(this,m);this.shift=this.m.bitLength();if(this.shift%26!==0)
        this.shift+=26-(this.shift%26);this.r=new BN(1).ishln(this.shift);this.r2=this.imod(this.r.sqr());this.rinv=this.r._invmp(this.m);this.minv=this.rinv.mul(this.r).isubn(1).div(this.m);this.minv.sign=!0;this.minv=this.minv.mod(this.r)}
    inherits(Mont,Red);Mont.prototype.convertTo=function convertTo(num){return this.imod(num.shln(this.shift))};Mont.prototype.convertFrom=function convertFrom(num){var r=this.imod(num.mul(this.rinv));r.red=null;return r};Mont.prototype.imul=function imul(a,b){if(a.cmpn(0)===0||b.cmpn(0)===0){a.words[0]=0;a.length=1;return a}
        var t=a.imul(b);var c=t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);var u=t.isub(c).ishrn(this.shift);var res=u;if(u.cmp(this.m)>=0)
            res=u.isub(this.m);else if(u.cmpn(0)<0)
            res=u.iadd(this.m);return res._forceRed(this)};Mont.prototype.mul=function mul(a,b){if(a.cmpn(0)===0||b.cmpn(0)===0)
        return new BN(0)._forceRed(this);var t=a.mul(b);var c=t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);var u=t.isub(c).ishrn(this.shift);var res=u;if(u.cmp(this.m)>=0)
        res=u.isub(this.m);else if(u.cmpn(0)<0)
        res=u.iadd(this.m);return res._forceRed(this)};Mont.prototype.invm=function invm(a){var res=this.imod(a._invmp(this.m).mul(this.r2));return res._forceRed(this)}})(typeof module==='undefined'||module,this)},{}],12:[function(require,module,exports){'use strict';var elliptic=exports;elliptic.version=require('../package.json').version;elliptic.utils=require('./elliptic/utils');elliptic.rand=require('brorand');elliptic.hmacDRBG=require('./elliptic/hmac-drbg');elliptic.curve=require('./elliptic/curve');elliptic.curves=require('./elliptic/curves');elliptic.ec=require('./elliptic/ec')},{"../package.json":33,"./elliptic/curve":15,"./elliptic/curves":18,"./elliptic/ec":19,"./elliptic/hmac-drbg":22,"./elliptic/utils":24,"brorand":25}],13:[function(require,module,exports){'use strict';var bn=require('bn.js');var elliptic=require('../../elliptic');var getNAF=elliptic.utils.getNAF;var getJSF=elliptic.utils.getJSF;var assert=elliptic.utils.assert;function BaseCurve(type,conf){this.type=type;this.p=new bn(conf.p,16);this.red=conf.prime?bn.red(conf.prime):bn.mont(this.p);this.zero=new bn(0).toRed(this.red);this.one=new bn(1).toRed(this.red);this.two=new bn(2).toRed(this.red);this.n=conf.n&&new bn(conf.n,16);this.g=conf.g&&this.pointFromJSON(conf.g,conf.gRed);this._wnafT1=new Array(4);this._wnafT2=new Array(4);this._wnafT3=new Array(4);this._wnafT4=new Array(4)}
    module.exports=BaseCurve;BaseCurve.prototype.point=function point(){throw new Error('Not implemented')};BaseCurve.prototype.validate=function validate(){throw new Error('Not implemented')};BaseCurve.prototype._fixedNafMul=function _fixedNafMul(p,k){assert(p.precomputed);var doubles=p._getDoubles();var naf=getNAF(k,1);var I=(1<<(doubles.step+1))-(doubles.step%2===0?2:1);I/=3;var repr=[];for(var j=0;j<naf.length;j+=doubles.step){var nafW=0;for(var k=j+doubles.step-1;k>=j;k--)
        nafW=(nafW<<1)+naf[k];repr.push(nafW)}
        var a=this.jpoint(null,null,null);var b=this.jpoint(null,null,null);for(var i=I;i>0;i--){for(var j=0;j<repr.length;j++){var nafW=repr[j];if(nafW===i)
            b=b.mixedAdd(doubles.points[j]);else if(nafW===-i)
            b=b.mixedAdd(doubles.points[j].neg())}
            a=a.add(b)}
        return a.toP()};BaseCurve.prototype._wnafMul=function _wnafMul(p,k){var w=4;var nafPoints=p._getNAFPoints(w);w=nafPoints.wnd;var wnd=nafPoints.points;var naf=getNAF(k,w);var acc=this.jpoint(null,null,null);for(var i=naf.length-1;i>=0;i--){for(var k=0;i>=0&&naf[i]===0;i--)
        k++;if(i>=0)
        k++;acc=acc.dblp(k);if(i<0)
        break;var z=naf[i];assert(z!==0);if(p.type==='affine'){if(z>0)
        acc=acc.mixedAdd(wnd[(z-1)>>1]);else acc=acc.mixedAdd(wnd[(-z-1)>>1].neg())}else{if(z>0)
        acc=acc.add(wnd[(z-1)>>1]);else acc=acc.add(wnd[(-z-1)>>1].neg())}}
        return p.type==='affine'?acc.toP():acc};BaseCurve.prototype._wnafMulAdd=function _wnafMulAdd(defW,points,coeffs,len){var wndWidth=this._wnafT1;var wnd=this._wnafT2;var naf=this._wnafT3;var max=0;for(var i=0;i<len;i++){var p=points[i];var nafPoints=p._getNAFPoints(defW);wndWidth[i]=nafPoints.wnd;wnd[i]=nafPoints.points}
        for(var i=len-1;i>=1;i-=2){var a=i-1;var b=i;if(wndWidth[a]!==1||wndWidth[b]!==1){naf[a]=getNAF(coeffs[a],wndWidth[a]);naf[b]=getNAF(coeffs[b],wndWidth[b]);max=Math.max(naf[a].length,max);max=Math.max(naf[b].length,max);continue}
            var comb=[points[a],null,null,points[b]];if(points[a].y.cmp(points[b].y)===0){comb[1]=points[a].add(points[b]);comb[2]=points[a].toJ().mixedAdd(points[b].neg())}else if(points[a].y.cmp(points[b].y.redNeg())===0){comb[1]=points[a].toJ().mixedAdd(points[b]);comb[2]=points[a].add(points[b].neg())}else{comb[1]=points[a].toJ().mixedAdd(points[b]);comb[2]=points[a].toJ().mixedAdd(points[b].neg())}
            var index=[-3,-1,-5,-7,0,7,5,1,3];var jsf=getJSF(coeffs[a],coeffs[b]);max=Math.max(jsf[0].length,max);naf[a]=new Array(max);naf[b]=new Array(max);for(var j=0;j<max;j++){var ja=jsf[0][j]|0;var jb=jsf[1][j]|0;naf[a][j]=index[(ja+1)*3+(jb+1)];naf[b][j]=0;wnd[a]=comb}}
        var acc=this.jpoint(null,null,null);var tmp=this._wnafT4;for(var i=max;i>=0;i--){var k=0;while(i>=0){var zero=!0;for(var j=0;j<len;j++){tmp[j]=naf[j][i]|0;if(tmp[j]!==0)
            zero=!1}
            if(!zero)
                break;k++;i--}
            if(i>=0)
                k++;acc=acc.dblp(k);if(i<0)
                break;for(var j=0;j<len;j++){var z=tmp[j];var p;if(z===0)
                continue;else if(z>0)
                p=wnd[j][(z-1)>>1];else if(z<0)
                p=wnd[j][(-z-1)>>1].neg();if(p.type==='affine')
                acc=acc.mixedAdd(p);else acc=acc.add(p)}}
        for(var i=0;i<len;i++)
            wnd[i]=null;return acc.toP()};function BasePoint(curve,type){this.curve=curve;this.type=type;this.precomputed=null}
    BaseCurve.BasePoint=BasePoint;BasePoint.prototype.validate=function validate(){return this.curve.validate(this)};BasePoint.prototype.precompute=function precompute(power){if(this.precomputed)
        return this;var precomputed={doubles:null,naf:null,beta:null};precomputed.naf=this._getNAFPoints(8);precomputed.doubles=this._getDoubles(4,power);precomputed.beta=this._getBeta();this.precomputed=precomputed;return this};BasePoint.prototype._hasDoubles=function _hasDoubles(k){if(!this.precomputed)
        return!1;var doubles=this.precomputed.doubles;if(!doubles)
        return!1;return doubles.points.length>=Math.ceil((k.bitLength()+1)/doubles.step)};BasePoint.prototype._getDoubles=function _getDoubles(step,power){if(this.precomputed&&this.precomputed.doubles)
        return this.precomputed.doubles;var doubles=[this];var acc=this;for(var i=0;i<power;i+=step){for(var j=0;j<step;j++)
        acc=acc.dbl();doubles.push(acc)}
        return{step:step,points:doubles}};BasePoint.prototype._getNAFPoints=function _getNAFPoints(wnd){if(this.precomputed&&this.precomputed.naf)
        return this.precomputed.naf;var res=[this];var max=(1<<wnd)-1;var dbl=max===1?null:this.dbl();for(var i=1;i<max;i++)
        res[i]=res[i-1].add(dbl);return{wnd:wnd,points:res}};BasePoint.prototype._getBeta=function _getBeta(){return null};BasePoint.prototype.dblp=function dblp(k){var r=this;for(var i=0;i<k;i++)
        r=r.dbl();return r}},{"../../elliptic":12,"bn.js":11}],14:[function(require,module,exports){'use strict';var curve=require('../curve');var elliptic=require('../../elliptic');var bn=require('bn.js');var inherits=require('inherits');var Base=curve.base;var assert=elliptic.utils.assert;function EdwardsCurve(conf){this.twisted=(conf.a|0)!==1;this.mOneA=this.twisted&&(conf.a|0)===-1;this.extended=this.mOneA;Base.call(this,'edwards',conf);this.a=new bn(conf.a,16).mod(this.red.m).toRed(this.red);this.c=new bn(conf.c,16).toRed(this.red);this.c2=this.c.redSqr();this.d=new bn(conf.d,16).toRed(this.red);this.dd=this.d.redAdd(this.d);assert(!this.twisted||this.c.fromRed().cmpn(1)===0);this.oneC=(conf.c|0)===1}
    inherits(EdwardsCurve,Base);module.exports=EdwardsCurve;EdwardsCurve.prototype._mulA=function _mulA(num){if(this.mOneA)
        return num.redNeg();else return this.a.redMul(num)};EdwardsCurve.prototype._mulC=function _mulC(num){if(this.oneC)
        return num;else return this.c.redMul(num)};EdwardsCurve.prototype.jpoint=function jpoint(x,y,z,t){return this.point(x,y,z,t)};EdwardsCurve.prototype.pointFromX=function pointFromX(odd,x){x=new bn(x,16);if(!x.red)
        x=x.toRed(this.red);var x2=x.redSqr();var rhs=this.c2.redSub(this.a.redMul(x2));var lhs=this.one.redSub(this.c2.redMul(this.d).redMul(x2));var y=rhs.redMul(lhs.redInvm()).redSqrt();var isOdd=y.fromRed().isOdd();if(odd&&!isOdd||!odd&&isOdd)
        y=y.redNeg();return this.point(x,y,curve.one)};EdwardsCurve.prototype.validate=function validate(point){if(point.isInfinity())
        return!0;point.normalize();var x2=point.x.redSqr();var y2=point.y.redSqr();var lhs=x2.redMul(this.a).redAdd(y2);var rhs=this.c2.redMul(this.one.redAdd(this.d.redMul(x2).redMul(y2)));return lhs.cmp(rhs)===0};function Point(curve,x,y,z,t){Base.BasePoint.call(this,curve,'projective');if(x===null&&y===null&&z===null){this.x=this.curve.zero;this.y=this.curve.one;this.z=this.curve.one;this.t=this.curve.zero;this.zOne=!0}else{this.x=new bn(x,16);this.y=new bn(y,16);this.z=z?new bn(z,16):this.curve.one;this.t=t&&new bn(t,16);if(!this.x.red)
        this.x=this.x.toRed(this.curve.red);if(!this.y.red)
        this.y=this.y.toRed(this.curve.red);if(!this.z.red)
        this.z=this.z.toRed(this.curve.red);if(this.t&&!this.t.red)
        this.t=this.t.toRed(this.curve.red);this.zOne=this.z===this.curve.one;if(this.curve.extended&&!this.t){this.t=this.x.redMul(this.y);if(!this.zOne)
        this.t=this.t.redMul(this.z.redInvm())}}}
    inherits(Point,Base.BasePoint);EdwardsCurve.prototype.pointFromJSON=function pointFromJSON(obj){return Point.fromJSON(this,obj)};EdwardsCurve.prototype.point=function point(x,y,z,t){return new Point(this,x,y,z,t)};Point.fromJSON=function fromJSON(curve,obj){return new Point(curve,obj[0],obj[1],obj[2])};Point.prototype.inspect=function inspect(){if(this.isInfinity())
        return'<EC Point Infinity>';return'<EC Point x: '+this.x.fromRed().toString(16,2)+' y: '+this.y.fromRed().toString(16,2)+' z: '+this.z.fromRed().toString(16,2)+'>'};Point.prototype.isInfinity=function isInfinity(){return this.x.cmpn(0)===0&&this.y.cmp(this.z)===0};Point.prototype._extDbl=function _extDbl(){var a=this.x.redSqr();var b=this.y.redSqr();var c=this.z.redSqr();c=c.redIAdd(c);var d=this.curve._mulA(a);var e=this.x.redAdd(this.y).redSqr().redISub(a).redISub(b);var g=d.redAdd(b);var f=g.redSub(c);var h=d.redSub(b);var nx=e.redMul(f);var ny=g.redMul(h);var nt=e.redMul(h);var nz=f.redMul(g);return this.curve.point(nx,ny,nz,nt)};Point.prototype._projDbl=function _projDbl(){var b=this.x.redAdd(this.y).redSqr();var c=this.x.redSqr();var d=this.y.redSqr();var nx;var ny;var nz;if(this.curve.twisted){var e=this.curve._mulA(c);var f=e.redAdd(d);if(this.zOne){nx=b.redSub(c).redSub(d).redMul(f.redSub(this.curve.two));ny=f.redMul(e.redSub(d));nz=f.redSqr().redSub(f).redSub(f)}else{var h=this.z.redSqr();var j=f.redSub(h).redISub(h);nx=b.redSub(c).redISub(d).redMul(j);ny=f.redMul(e.redSub(d));nz=f.redMul(j)}}else{var e=c.redAdd(d);var h=this.curve._mulC(this.c.redMul(this.z)).redSqr();var j=e.redSub(h).redSub(h);nx=this.curve._mulC(b.redISub(e)).redMul(j);ny=this.curve._mulC(e).redMul(c.redISub(d));nz=e.redMul(j)}
        return this.curve.point(nx,ny,nz)};Point.prototype.dbl=function dbl(){if(this.isInfinity())
        return this;if(this.curve.extended)
        return this._extDbl();else return this._projDbl()};Point.prototype._extAdd=function _extAdd(p){var a=this.y.redSub(this.x).redMul(p.y.redSub(p.x));var b=this.y.redAdd(this.x).redMul(p.y.redAdd(p.x));var c=this.t.redMul(this.curve.dd).redMul(p.t);var d=this.z.redMul(p.z.redAdd(p.z));var e=b.redSub(a);var f=d.redSub(c);var g=d.redAdd(c);var h=b.redAdd(a);var nx=e.redMul(f);var ny=g.redMul(h);var nt=e.redMul(h);var nz=f.redMul(g);return this.curve.point(nx,ny,nz,nt)};Point.prototype._projAdd=function _projAdd(p){var a=this.z.redMul(p.z);var b=a.redSqr();var c=this.x.redMul(p.x);var d=this.y.redMul(p.y);var e=this.curve.d.redMul(c).redMul(d);var f=b.redSub(e);var g=b.redAdd(e);var tmp=this.x.redAdd(this.y).redMul(p.x.redAdd(p.y)).redISub(c).redISub(d);var nx=a.redMul(f).redMul(tmp);var ny;var nz;if(this.curve.twisted){ny=a.redMul(g).redMul(d.redSub(this.curve._mulA(c)));nz=f.redMul(g)}else{ny=a.redMul(g).redMul(d.redSub(c));nz=this.curve._mulC(f).redMul(g)}
        return this.curve.point(nx,ny,nz)};Point.prototype.add=function add(p){if(this.isInfinity())
        return p;if(p.isInfinity())
        return this;if(this.curve.extended)
        return this._extAdd(p);else return this._projAdd(p)};Point.prototype.mul=function mul(k){if(this._hasDoubles(k))
        return this.curve._fixedNafMul(this,k);else return this.curve._wnafMul(this,k)};Point.prototype.mulAdd=function mulAdd(k1,p,k2){return this.curve._wnafMulAdd(1,[this,p],[k1,k2],2)};Point.prototype.normalize=function normalize(){if(this.zOne)
        return this;var zi=this.z.redInvm();this.x=this.x.redMul(zi);this.y=this.y.redMul(zi);if(this.t)
        this.t=this.t.redMul(zi);this.z=this.curve.one;this.zOne=!0;return this};Point.prototype.neg=function neg(){return this.curve.point(this.x.redNeg(),this.y,this.z,this.t&&this.t.redNeg())};Point.prototype.getX=function getX(){this.normalize();return this.x.fromRed()};Point.prototype.getY=function getY(){this.normalize();return this.y.fromRed()};Point.prototype.toP=Point.prototype.normalize;Point.prototype.mixedAdd=Point.prototype.add},{"../../elliptic":12,"../curve":15,"bn.js":11,"inherits":32}],15:[function(require,module,exports){'use strict';var curve=exports;curve.base=require('./base');curve.short=require('./short');curve.mont=require('./mont');curve.edwards=require('./edwards')},{"./base":13,"./edwards":14,"./mont":16,"./short":17}],16:[function(require,module,exports){'use strict';var curve=require('../curve');var bn=require('bn.js');var inherits=require('inherits');var Base=curve.base;function MontCurve(conf){Base.call(this,'mont',conf);this.a=new bn(conf.a,16).toRed(this.red);this.b=new bn(conf.b,16).toRed(this.red);this.i4=new bn(4).toRed(this.red).redInvm();this.two=new bn(2).toRed(this.red);this.a24=this.i4.redMul(this.a.redAdd(this.two))}
    inherits(MontCurve,Base);module.exports=MontCurve;MontCurve.prototype.validate=function validate(point){var x=point.normalize().x;var x2=x.redSqr();var rhs=x2.redMul(x).redAdd(x2.redMul(this.a)).redAdd(x);var y=rhs.redSqrt();return y.redSqr().cmp(rhs)===0};function Point(curve,x,z){Base.BasePoint.call(this,curve,'projective');if(x===null&&z===null){this.x=this.curve.one;this.z=this.curve.zero}else{this.x=new bn(x,16);this.z=new bn(z,16);if(!this.x.red)
        this.x=this.x.toRed(this.curve.red);if(!this.z.red)
        this.z=this.z.toRed(this.curve.red)}}
    inherits(Point,Base.BasePoint);MontCurve.prototype.point=function point(x,z){return new Point(this,x,z)};MontCurve.prototype.pointFromJSON=function pointFromJSON(obj){return Point.fromJSON(this,obj)};Point.prototype.precompute=function precompute(){};Point.fromJSON=function fromJSON(curve,obj){return new Point(curve,obj[0],obj[1]||curve.one)};Point.prototype.inspect=function inspect(){if(this.isInfinity())
        return'<EC Point Infinity>';return'<EC Point x: '+this.x.fromRed().toString(16,2)+' z: '+this.z.fromRed().toString(16,2)+'>'};Point.prototype.isInfinity=function isInfinity(){return this.z.cmpn(0)===0};Point.prototype.dbl=function dbl(){var a=this.x.redAdd(this.z);var aa=a.redSqr();var b=this.x.redSub(this.z);var bb=b.redSqr();var c=aa.redSub(bb);var nx=aa.redMul(bb);var nz=c.redMul(bb.redAdd(this.curve.a24.redMul(c)));return this.curve.point(nx,nz)};Point.prototype.add=function add(){throw new Error('Not supported on Montgomery curve')};Point.prototype.diffAdd=function diffAdd(p,diff){var a=this.x.redAdd(this.z);var b=this.x.redSub(this.z);var c=p.x.redAdd(p.z);var d=p.x.redSub(p.z);var da=d.redMul(a);var cb=c.redMul(b);var nx=diff.z.redMul(da.redAdd(cb).redSqr());var nz=diff.x.redMul(da.redISub(cb).redSqr());return this.curve.point(nx,nz)};Point.prototype.mul=function mul(k){var t=k.clone();var a=this;var b=this.curve.point(null,null);var c=this;for(var bits=[];t.cmpn(0)!==0;t.ishrn(1))
        bits.push(t.andln(1));for(var i=bits.length-1;i>=0;i--){if(bits[i]===0){a=a.diffAdd(b,c);b=b.dbl()}else{b=a.diffAdd(b,c);a=a.dbl()}}
        return b};Point.prototype.mulAdd=function mulAdd(){throw new Error('Not supported on Montgomery curve')};Point.prototype.normalize=function normalize(){this.x=this.x.redMul(this.z.redInvm());this.z=this.curve.one;return this};Point.prototype.getX=function getX(){this.normalize();return this.x.fromRed()}},{"../curve":15,"bn.js":11,"inherits":32}],17:[function(require,module,exports){'use strict';var curve=require('../curve');var elliptic=require('../../elliptic');var bn=require('bn.js');var inherits=require('inherits');var Base=curve.base;var assert=elliptic.utils.assert;function ShortCurve(conf){Base.call(this,'short',conf);this.a=new bn(conf.a,16).toRed(this.red);this.b=new bn(conf.b,16).toRed(this.red);this.tinv=this.two.redInvm();this.zeroA=this.a.fromRed().cmpn(0)===0;this.threeA=this.a.fromRed().sub(this.p).cmpn(-3)===0;this.endo=this._getEndomorphism(conf);this._endoWnafT1=new Array(4);this._endoWnafT2=new Array(4)}
    inherits(ShortCurve,Base);module.exports=ShortCurve;ShortCurve.prototype._getEndomorphism=function _getEndomorphism(conf){if(!this.zeroA||!this.g||!this.n||this.p.modn(3)!==1)
        return;var beta;var lambda;if(conf.beta){beta=new bn(conf.beta,16).toRed(this.red)}else{var betas=this._getEndoRoots(this.p);beta=betas[0].cmp(betas[1])<0?betas[0]:betas[1];beta=beta.toRed(this.red)}
        if(conf.lambda){lambda=new bn(conf.lambda,16)}else{var lambdas=this._getEndoRoots(this.n);if(this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta))===0){lambda=lambdas[0]}else{lambda=lambdas[1];assert(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta))===0)}}
        var basis;if(conf.basis){basis=conf.basis.map(function(vec){return{a:new bn(vec.a,16),b:new bn(vec.b,16)}})}else{basis=this._getEndoBasis(lambda)}
        return{beta:beta,lambda:lambda,basis:basis}};ShortCurve.prototype._getEndoRoots=function _getEndoRoots(num){var red=num===this.p?this.red:bn.mont(num);var tinv=new bn(2).toRed(red).redInvm();var ntinv=tinv.redNeg();var s=new bn(3).toRed(red).redNeg().redSqrt().redMul(tinv);var l1=ntinv.redAdd(s).fromRed();var l2=ntinv.redSub(s).fromRed();return[l1,l2]};ShortCurve.prototype._getEndoBasis=function _getEndoBasis(lambda){var aprxSqrt=this.n.shrn(Math.floor(this.n.bitLength()/2));var u=lambda;var v=this.n.clone();var x1=new bn(1);var y1=new bn(0);var x2=new bn(0);var y2=new bn(1);var a0;var b0;var a1;var b1;var a2;var b2;var prevR;var i=0;var r;var x;while(u.cmpn(0)!==0){var q=v.div(u);r=v.sub(q.mul(u));x=x2.sub(q.mul(x1));var y=y2.sub(q.mul(y1));if(!a1&&r.cmp(aprxSqrt)<0){a0=prevR.neg();b0=x1;a1=r.neg();b1=x}else if(a1&&++i===2){break}
        prevR=r;v=u;u=r;x2=x1;x1=x;y2=y1;y1=y}
        a2=r.neg();b2=x;var len1=a1.sqr().add(b1.sqr());var len2=a2.sqr().add(b2.sqr());if(len2.cmp(len1)>=0){a2=a0;b2=b0}
        if(a1.sign){a1=a1.neg();b1=b1.neg()}
        if(a2.sign){a2=a2.neg();b2=b2.neg()}
        return[{a:a1,b:b1},{a:a2,b:b2}]};ShortCurve.prototype._endoSplit=function _endoSplit(k){var basis=this.endo.basis;var v1=basis[0];var v2=basis[1];var c1=v2.b.mul(k).divRound(this.n);var c2=v1.b.neg().mul(k).divRound(this.n);var p1=c1.mul(v1.a);var p2=c2.mul(v2.a);var q1=c1.mul(v1.b);var q2=c2.mul(v2.b);var k1=k.sub(p1).sub(p2);var k2=q1.add(q2).neg();return{k1:k1,k2:k2}};ShortCurve.prototype.pointFromX=function pointFromX(odd,x){x=new bn(x,16);if(!x.red)
        x=x.toRed(this.red);var y2=x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b);var y=y2.redSqrt();var isOdd=y.fromRed().isOdd();if(odd&&!isOdd||!odd&&isOdd)
        y=y.redNeg();return this.point(x,y)};ShortCurve.prototype.validate=function validate(point){if(point.inf)
        return!0;var x=point.x;var y=point.y;var ax=this.a.redMul(x);var rhs=x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);return y.redSqr().redISub(rhs).cmpn(0)===0};ShortCurve.prototype._endoWnafMulAdd=function _endoWnafMulAdd(points,coeffs){var npoints=this._endoWnafT1;var ncoeffs=this._endoWnafT2;for(var i=0;i<points.length;i++){var split=this._endoSplit(coeffs[i]);var p=points[i];var beta=p._getBeta();if(split.k1.sign){split.k1.sign=!split.k1.sign;p=p.neg(!0)}
        if(split.k2.sign){split.k2.sign=!split.k2.sign;beta=beta.neg(!0)}
        npoints[i*2]=p;npoints[i*2+1]=beta;ncoeffs[i*2]=split.k1;ncoeffs[i*2+1]=split.k2}
        var res=this._wnafMulAdd(1,npoints,ncoeffs,i*2);for(var j=0;j<i*2;j++){npoints[j]=null;ncoeffs[j]=null}
        return res};function Point(curve,x,y,isRed){Base.BasePoint.call(this,curve,'affine');if(x===null&&y===null){this.x=null;this.y=null;this.inf=!0}else{this.x=new bn(x,16);this.y=new bn(y,16);if(isRed){this.x.forceRed(this.curve.red);this.y.forceRed(this.curve.red)}
        if(!this.x.red)
            this.x=this.x.toRed(this.curve.red);if(!this.y.red)
            this.y=this.y.toRed(this.curve.red);this.inf=!1}}
    inherits(Point,Base.BasePoint);ShortCurve.prototype.point=function point(x,y,isRed){return new Point(this,x,y,isRed)};ShortCurve.prototype.pointFromJSON=function pointFromJSON(obj,red){return Point.fromJSON(this,obj,red)};Point.prototype._getBeta=function _getBeta(){if(!this.curve.endo)
        return;var pre=this.precomputed;if(pre&&pre.beta)
        return pre.beta;var beta=this.curve.point(this.x.redMul(this.curve.endo.beta),this.y);if(pre){var curve=this.curve;var endoMul=function(p){return curve.point(p.x.redMul(curve.endo.beta),p.y)};pre.beta=beta;beta.precomputed={beta:null,naf:pre.naf&&{wnd:pre.naf.wnd,points:pre.naf.points.map(endoMul)},doubles:pre.doubles&&{step:pre.doubles.step,points:pre.doubles.points.map(endoMul)}}}
        return beta};Point.prototype.toJSON=function toJSON(){if(!this.precomputed)
        return[this.x,this.y];return[this.x,this.y,this.precomputed&&{doubles:this.precomputed.doubles&&{step:this.precomputed.doubles.step,points:this.precomputed.doubles.points.slice(1)},naf:this.precomputed.naf&&{wnd:this.precomputed.naf.wnd,points:this.precomputed.naf.points.slice(1)}}]};Point.fromJSON=function fromJSON(curve,obj,red){if(typeof obj==='string')
        obj=JSON.parse(obj);var res=curve.point(obj[0],obj[1],red);if(!obj[2])
        return res;function obj2point(obj){return curve.point(obj[0],obj[1],red)}
        var pre=obj[2];res.precomputed={beta:null,doubles:pre.doubles&&{step:pre.doubles.step,points:[res].concat(pre.doubles.points.map(obj2point))},naf:pre.naf&&{wnd:pre.naf.wnd,points:[res].concat(pre.naf.points.map(obj2point))}};return res};Point.prototype.inspect=function inspect(){if(this.isInfinity())
        return'<EC Point Infinity>';return'<EC Point x: '+this.x.fromRed().toString(16,2)+' y: '+this.y.fromRed().toString(16,2)+'>'};Point.prototype.isInfinity=function isInfinity(){return this.inf};Point.prototype.add=function add(p){if(this.inf)
        return p;if(p.inf)
        return this;if(this.eq(p))
        return this.dbl();if(this.neg().eq(p))
        return this.curve.point(null,null);if(this.x.cmp(p.x)===0)
        return this.curve.point(null,null);var c=this.y.redSub(p.y);if(c.cmpn(0)!==0)
        c=c.redMul(this.x.redSub(p.x).redInvm());var nx=c.redSqr().redISub(this.x).redISub(p.x);var ny=c.redMul(this.x.redSub(nx)).redISub(this.y);return this.curve.point(nx,ny)};Point.prototype.dbl=function dbl(){if(this.inf)
        return this;var ys1=this.y.redAdd(this.y);if(ys1.cmpn(0)===0)
        return this.curve.point(null,null);var a=this.curve.a;var x2=this.x.redSqr();var dyinv=ys1.redInvm();var c=x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv);var nx=c.redSqr().redISub(this.x.redAdd(this.x));var ny=c.redMul(this.x.redSub(nx)).redISub(this.y);return this.curve.point(nx,ny)};Point.prototype.getX=function getX(){return this.x.fromRed()};Point.prototype.getY=function getY(){return this.y.fromRed()};Point.prototype.mul=function mul(k){k=new bn(k,16);if(this._hasDoubles(k))
        return this.curve._fixedNafMul(this,k);else if(this.curve.endo)
        return this.curve._endoWnafMulAdd([this],[k]);else return this.curve._wnafMul(this,k)};Point.prototype.mulAdd=function mulAdd(k1,p2,k2){var points=[this,p2];var coeffs=[k1,k2];if(this.curve.endo)
        return this.curve._endoWnafMulAdd(points,coeffs);else return this.curve._wnafMulAdd(1,points,coeffs,2)};Point.prototype.eq=function eq(p){return this===p||this.inf===p.inf&&(this.inf||this.x.cmp(p.x)===0&&this.y.cmp(p.y)===0)};Point.prototype.neg=function neg(_precompute){if(this.inf)
        return this;var res=this.curve.point(this.x,this.y.redNeg());if(_precompute&&this.precomputed){var pre=this.precomputed;var negate=function(p){return p.neg()};res.precomputed={naf:pre.naf&&{wnd:pre.naf.wnd,points:pre.naf.points.map(negate)},doubles:pre.doubles&&{step:pre.doubles.step,points:pre.doubles.points.map(negate)}}}
        return res};Point.prototype.toJ=function toJ(){if(this.inf)
        return this.curve.jpoint(null,null,null);var res=this.curve.jpoint(this.x,this.y,this.curve.one);return res};function JPoint(curve,x,y,z){Base.BasePoint.call(this,curve,'jacobian');if(x===null&&y===null&&z===null){this.x=this.curve.one;this.y=this.curve.one;this.z=new bn(0)}else{this.x=new bn(x,16);this.y=new bn(y,16);this.z=new bn(z,16)}
        if(!this.x.red)
            this.x=this.x.toRed(this.curve.red);if(!this.y.red)
            this.y=this.y.toRed(this.curve.red);if(!this.z.red)
            this.z=this.z.toRed(this.curve.red);this.zOne=this.z===this.curve.one}
    inherits(JPoint,Base.BasePoint);ShortCurve.prototype.jpoint=function jpoint(x,y,z){return new JPoint(this,x,y,z)};JPoint.prototype.toP=function toP(){if(this.isInfinity())
        return this.curve.point(null,null);var zinv=this.z.redInvm();var zinv2=zinv.redSqr();var ax=this.x.redMul(zinv2);var ay=this.y.redMul(zinv2).redMul(zinv);return this.curve.point(ax,ay)};JPoint.prototype.neg=function neg(){return this.curve.jpoint(this.x,this.y.redNeg(),this.z)};JPoint.prototype.add=function add(p){if(this.isInfinity())
        return p;if(p.isInfinity())
        return this;var pz2=p.z.redSqr();var z2=this.z.redSqr();var u1=this.x.redMul(pz2);var u2=p.x.redMul(z2);var s1=this.y.redMul(pz2.redMul(p.z));var s2=p.y.redMul(z2.redMul(this.z));var h=u1.redSub(u2);var r=s1.redSub(s2);if(h.cmpn(0)===0){if(r.cmpn(0)!==0)
        return this.curve.jpoint(null,null,null);else return this.dbl()}
        var h2=h.redSqr();var h3=h2.redMul(h);var v=u1.redMul(h2);var nx=r.redSqr().redIAdd(h3).redISub(v).redISub(v);var ny=r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));var nz=this.z.redMul(p.z).redMul(h);return this.curve.jpoint(nx,ny,nz)};JPoint.prototype.mixedAdd=function mixedAdd(p){if(this.isInfinity())
        return p.toJ();if(p.isInfinity())
        return this;var z2=this.z.redSqr();var u1=this.x;var u2=p.x.redMul(z2);var s1=this.y;var s2=p.y.redMul(z2).redMul(this.z);var h=u1.redSub(u2);var r=s1.redSub(s2);if(h.cmpn(0)===0){if(r.cmpn(0)!==0)
        return this.curve.jpoint(null,null,null);else return this.dbl()}
        var h2=h.redSqr();var h3=h2.redMul(h);var v=u1.redMul(h2);var nx=r.redSqr().redIAdd(h3).redISub(v).redISub(v);var ny=r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));var nz=this.z.redMul(h);return this.curve.jpoint(nx,ny,nz)};JPoint.prototype.dblp=function dblp(pow){if(pow===0)
        return this;if(this.isInfinity())
        return this;if(!pow)
        return this.dbl();if(this.curve.zeroA||this.curve.threeA){var r=this;for(var i=0;i<pow;i++)
        r=r.dbl();return r}
        var a=this.curve.a;var tinv=this.curve.tinv;var jx=this.x;var jy=this.y;var jz=this.z;var jz4=jz.redSqr().redSqr();var jyd=jy.redAdd(jy);for(var i=0;i<pow;i++){var jx2=jx.redSqr();var jyd2=jyd.redSqr();var jyd4=jyd2.redSqr();var c=jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));var t1=jx.redMul(jyd2);var nx=c.redSqr().redISub(t1.redAdd(t1));var t2=t1.redISub(nx);var dny=c.redMul(t2);dny=dny.redIAdd(dny).redISub(jyd4);var nz=jyd.redMul(jz);if(i+1<pow)
            jz4=jz4.redMul(jyd4);jx=nx;jz=nz;jyd=dny}
        return this.curve.jpoint(jx,jyd.redMul(tinv),jz)};JPoint.prototype.dbl=function dbl(){if(this.isInfinity())
        return this;if(this.curve.zeroA)
        return this._zeroDbl();else if(this.curve.threeA)
        return this._threeDbl();else return this._dbl()};JPoint.prototype._zeroDbl=function _zeroDbl(){var nx;var ny;var nz;if(this.zOne){var xx=this.x.redSqr();var yy=this.y.redSqr();var yyyy=yy.redSqr();var s=this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);s=s.redIAdd(s);var m=xx.redAdd(xx).redIAdd(xx);var t=m.redSqr().redISub(s).redISub(s);var yyyy8=yyyy.redIAdd(yyyy);yyyy8=yyyy8.redIAdd(yyyy8);yyyy8=yyyy8.redIAdd(yyyy8);nx=t;ny=m.redMul(s.redISub(t)).redISub(yyyy8);nz=this.y.redAdd(this.y)}else{var a=this.x.redSqr();var b=this.y.redSqr();var c=b.redSqr();var d=this.x.redAdd(b).redSqr().redISub(a).redISub(c);d=d.redIAdd(d);var e=a.redAdd(a).redIAdd(a);var f=e.redSqr();var c8=c.redIAdd(c);c8=c8.redIAdd(c8);c8=c8.redIAdd(c8);nx=f.redISub(d).redISub(d);ny=e.redMul(d.redISub(nx)).redISub(c8);nz=this.y.redMul(this.z);nz=nz.redIAdd(nz)}
        return this.curve.jpoint(nx,ny,nz)};JPoint.prototype._threeDbl=function _threeDbl(){var nx;var ny;var nz;if(this.zOne){var xx=this.x.redSqr();var yy=this.y.redSqr();var yyyy=yy.redSqr();var s=this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);s=s.redIAdd(s);var m=xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a);var t=m.redSqr().redISub(s).redISub(s);nx=t;var yyyy8=yyyy.redIAdd(yyyy);yyyy8=yyyy8.redIAdd(yyyy8);yyyy8=yyyy8.redIAdd(yyyy8);ny=m.redMul(s.redISub(t)).redISub(yyyy8);nz=this.y.redAdd(this.y)}else{var delta=this.z.redSqr();var gamma=this.y.redSqr();var beta=this.x.redMul(gamma);var alpha=this.x.redSub(delta).redMul(this.x.redAdd(delta));alpha=alpha.redAdd(alpha).redIAdd(alpha);var beta4=beta.redIAdd(beta);beta4=beta4.redIAdd(beta4);var beta8=beta4.redAdd(beta4);nx=alpha.redSqr().redISub(beta8);nz=this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta);var ggamma8=gamma.redSqr();ggamma8=ggamma8.redIAdd(ggamma8);ggamma8=ggamma8.redIAdd(ggamma8);ggamma8=ggamma8.redIAdd(ggamma8);ny=alpha.redMul(beta4.redISub(nx)).redISub(ggamma8)}
        return this.curve.jpoint(nx,ny,nz)};JPoint.prototype._dbl=function _dbl(){var a=this.curve.a;var jx=this.x;var jy=this.y;var jz=this.z;var jz4=jz.redSqr().redSqr();var jx2=jx.redSqr();var jy2=jy.redSqr();var c=jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));var jxd4=jx.redAdd(jx);jxd4=jxd4.redIAdd(jxd4);var t1=jxd4.redMul(jy2);var nx=c.redSqr().redISub(t1.redAdd(t1));var t2=t1.redISub(nx);var jyd8=jy2.redSqr();jyd8=jyd8.redIAdd(jyd8);jyd8=jyd8.redIAdd(jyd8);jyd8=jyd8.redIAdd(jyd8);var ny=c.redMul(t2).redISub(jyd8);var nz=jy.redAdd(jy).redMul(jz);return this.curve.jpoint(nx,ny,nz)};JPoint.prototype.trpl=function trpl(){if(!this.curve.zeroA)
        return this.dbl().add(this);var xx=this.x.redSqr();var yy=this.y.redSqr();var zz=this.z.redSqr();var yyyy=yy.redSqr();var m=xx.redAdd(xx).redIAdd(xx);var mm=m.redSqr();var e=this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);e=e.redIAdd(e);e=e.redAdd(e).redIAdd(e);e=e.redISub(mm);var ee=e.redSqr();var t=yyyy.redIAdd(yyyy);t=t.redIAdd(t);t=t.redIAdd(t);t=t.redIAdd(t);var u=m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t);var yyu4=yy.redMul(u);yyu4=yyu4.redIAdd(yyu4);yyu4=yyu4.redIAdd(yyu4);var nx=this.x.redMul(ee).redISub(yyu4);nx=nx.redIAdd(nx);nx=nx.redIAdd(nx);var ny=this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)));ny=ny.redIAdd(ny);ny=ny.redIAdd(ny);ny=ny.redIAdd(ny);var nz=this.z.redAdd(e).redSqr().redISub(zz).redISub(ee);return this.curve.jpoint(nx,ny,nz)};JPoint.prototype.mul=function mul(k,kbase){k=new bn(k,kbase);return this.curve._wnafMul(this,k)};JPoint.prototype.eq=function eq(p){if(p.type==='affine')
        return this.eq(p.toJ());if(this===p)
        return!0;var z2=this.z.redSqr();var pz2=p.z.redSqr();if(this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0)!==0)
        return!1;var z3=z2.redMul(this.z);var pz3=pz2.redMul(p.z);return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0)===0};JPoint.prototype.inspect=function inspect(){if(this.isInfinity())
        return'<EC JPoint Infinity>';return'<EC JPoint x: '+this.x.toString(16,2)+' y: '+this.y.toString(16,2)+' z: '+this.z.toString(16,2)+'>'};JPoint.prototype.isInfinity=function isInfinity(){return this.z.cmpn(0)===0}},{"../../elliptic":12,"../curve":15,"bn.js":11,"inherits":32}],18:[function(require,module,exports){'use strict';var curves=exports;var hash=require('hash.js');var elliptic=require('../elliptic');var assert=elliptic.utils.assert;function PresetCurve(options){if(options.type==='short')
    this.curve=new elliptic.curve.short(options);else if(options.type==='edwards')
    this.curve=new elliptic.curve.edwards(options);else this.curve=new elliptic.curve.mont(options);this.g=this.curve.g;this.n=this.curve.n;this.hash=options.hash;assert(this.g.validate(),'Invalid curve');assert(this.g.mul(this.n).isInfinity(),'Invalid curve, G*N != O')}
    curves.PresetCurve=PresetCurve;function defineCurve(name,options){Object.defineProperty(curves,name,{configurable:!0,enumerable:!0,get:function(){var curve=new PresetCurve(options);Object.defineProperty(curves,name,{configurable:!0,enumerable:!0,value:curve});return curve}})}
    defineCurve('p192',{type:'short',prime:'p192',p:'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff',a:'ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc',b:'64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1',n:'ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831',hash:hash.sha256,gRed:!1,g:['188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012','07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811']});defineCurve('p224',{type:'short',prime:'p224',p:'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001',a:'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe',b:'b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4',n:'ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d',hash:hash.sha256,gRed:!1,g:['b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21','bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34']});defineCurve('p256',{type:'short',prime:null,p:'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff',a:'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc',b:'5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b',n:'ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551',hash:hash.sha256,gRed:!1,g:['6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296','4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5']});defineCurve('curve25519',{type:'mont',prime:'p25519',p:'7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',a:'76d06',b:'0',n:'1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',hash:hash.sha256,gRed:!1,g:['9']});defineCurve('ed25519',{type:'edwards',prime:'p25519',p:'7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',a:'-1',c:'1',d:'52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3',n:'1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',hash:hash.sha256,gRed:!1,g:['216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a','6666666666666666666666666666666666666666666666666666666666666658']});var pre;try{pre=require('./precomputed/secp256k1')}catch(e){pre=undefined}
    defineCurve('secp256k1',{type:'short',prime:'k256',p:'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f',a:'0',b:'7',n:'ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141',h:'1',hash:hash.sha256,beta:'7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee',lambda:'5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72',basis:[{a:'3086d221a7d46bcde86c90e49284eb15',b:'-e4437ed6010e88286f547fa90abfe4c3'},{a:'114ca50f7a8e2f3f657c1108d9d44cfd8',b:'3086d221a7d46bcde86c90e49284eb15'}],gRed:!1,g:['79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798','483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8',pre]})},{"../elliptic":12,"./precomputed/secp256k1":23,"hash.js":26}],19:[function(require,module,exports){'use strict';var bn=require('bn.js');var elliptic=require('../../elliptic');var utils=elliptic.utils;var assert=utils.assert;var KeyPair=require('./key');var Signature=require('./signature');function EC(options){if(!(this instanceof EC))
    return new EC(options);if(typeof options==='string'){assert(elliptic.curves.hasOwnProperty(options),'Unknown curve '+options);options=elliptic.curves[options]}
    if(options instanceof elliptic.curves.PresetCurve)
        options={curve:options};this.curve=options.curve.curve;this.n=this.curve.n;this.nh=this.n.shrn(1);this.g=this.curve.g;this.g=options.curve.g;this.g.precompute(options.curve.n.bitLength()+1);this.hash=options.hash||options.curve.hash}
    module.exports=EC;EC.prototype.keyPair=function keyPair(options){return new KeyPair(this,options)};EC.prototype.keyFromPrivate=function keyFromPrivate(priv,enc){return KeyPair.fromPrivate(this,priv,enc)};EC.prototype.keyFromPublic=function keyFromPublic(pub,enc){return KeyPair.fromPublic(this,pub,enc)};EC.prototype.genKeyPair=function genKeyPair(options){if(!options)
        options={};var drbg=new elliptic.hmacDRBG({hash:this.hash,pers:options.pers,entropy:options.entropy||elliptic.rand(this.hash.hmacStrength),nonce:this.n.toArray()});var bytes=this.n.byteLength();var ns2=this.n.sub(new bn(2));do{var priv=new bn(drbg.generate(bytes));if(priv.cmp(ns2)>0)
        continue;priv.iaddn(1);return this.keyFromPrivate(priv)}while(!0)};EC.prototype._truncateToN=function truncateToN(msg,truncOnly){var delta=msg.byteLength()*8-this.n.bitLength();if(delta>0)
        msg=msg.shrn(delta);if(!truncOnly&&msg.cmp(this.n)>=0)
        return msg.sub(this.n);else return msg};EC.prototype.sign=function sign(msg,key,enc,options){if(typeof enc==='object'){options=enc;enc=null}
        if(!options)
            options={};key=this.keyFromPrivate(key,enc);msg=this._truncateToN(new bn(msg,16));var bytes=this.n.byteLength();var bkey=key.getPrivate().toArray();for(var i=bkey.length;i<21;i++)
            bkey.unshift(0);var nonce=msg.toArray();for(var i=nonce.length;i<bytes;i++)
            nonce.unshift(0);var drbg=new elliptic.hmacDRBG({hash:this.hash,entropy:bkey,nonce:nonce});var ns1=this.n.sub(new bn(1));do{var k=new bn(drbg.generate(this.n.byteLength()));k=this._truncateToN(k,!0);if(k.cmpn(1)<=0||k.cmp(ns1)>=0)
            continue;var kp=this.g.mul(k);if(kp.isInfinity())
            continue;var kpX=kp.getX();var r=kpX.mod(this.n);if(r.cmpn(0)===0)
            continue;var s=k.invm(this.n).mul(r.mul(key.getPrivate()).iadd(msg)).mod(this.n);if(s.cmpn(0)===0)
            continue;if(options.canonical&&s.cmp(this.nh)>0)
            s=this.n.sub(s);var recoveryParam=(kp.getY().isOdd()?1:0)|(kpX.cmp(r)!==0?2:0);return new Signature({r:r,s:s,recoveryParam:recoveryParam})}while(!0)};EC.prototype.verify=function verify(msg,signature,key,enc){msg=this._truncateToN(new bn(msg,16));key=this.keyFromPublic(key,enc);signature=new Signature(signature,'hex');var r=signature.r;var s=signature.s;if(r.cmpn(1)<0||r.cmp(this.n)>=0)
        return!1;if(s.cmpn(1)<0||s.cmp(this.n)>=0)
        return!1;var sinv=s.invm(this.n);var u1=sinv.mul(msg).mod(this.n);var u2=sinv.mul(r).mod(this.n);var p=this.g.mulAdd(u1,key.getPublic(),u2);if(p.isInfinity())
        return!1;return p.getX().mod(this.n).cmp(r)===0};EC.prototype.recoverPubKey=function(msg,signature,j,enc){assert((3&j)===j,'The recovery param is more than two bits');signature=new Signature(signature,enc);var n=this.n;var e=new bn(msg);var r=signature.r;var s=signature.s;var isYOdd=j&1;var isSecondKey=j>>1;if(r.cmp(this.curve.p.mod(this.curve.n))>=0&&isSecondKey)
        throw new Error('Unable to find sencond key candinate');r=this.curve.pointFromX(isYOdd,r);var eNeg=e.neg().mod(n);var rInv=signature.r.invm(n);return r.mul(s).add(this.g.mul(eNeg)).mul(rInv)};EC.prototype.getKeyRecoveryParam=function(e,signature,Q,enc){signature=new Signature(signature,enc);if(signature.recoveryParam!==null)
        return signature.recoveryParam;for(var i=0;i<4;i++){var Qprime=this.recoverPubKey(e,signature,i);if(Qprime.eq(Q))
        return i}
        throw new Error('Unable to find valid recovery factor')}},{"../../elliptic":12,"./key":20,"./signature":21,"bn.js":11}],20:[function(require,module,exports){'use strict';var bn=require('bn.js');var elliptic=require('../../elliptic');var utils=elliptic.utils;function KeyPair(ec,options){this.ec=ec;this.priv=null;this.pub=null;if(options.priv)
    this._importPrivate(options.priv,options.privEnc);if(options.pub)
    this._importPublic(options.pub,options.pubEnc)}
    module.exports=KeyPair;KeyPair.fromPublic=function fromPublic(ec,pub,enc){if(pub instanceof KeyPair)
        return pub;return new KeyPair(ec,{pub:pub,pubEnc:enc})};KeyPair.fromPrivate=function fromPrivate(ec,priv,enc){if(priv instanceof KeyPair)
        return priv;return new KeyPair(ec,{priv:priv,privEnc:enc})};KeyPair.prototype.validate=function validate(){var pub=this.getPublic();if(pub.isInfinity())
        return{result:!1,reason:'Invalid public key'};if(!pub.validate())
        return{result:!1,reason:'Public key is not a point'};if(!pub.mul(this.ec.curve.n).isInfinity())
        return{result:!1,reason:'Public key * N != O'};return{result:!0,reason:null}};KeyPair.prototype.getPublic=function getPublic(compact,enc){if(!this.pub)
        this.pub=this.ec.g.mul(this.priv);if(typeof compact==='string'){enc=compact;compact=null}
        if(!enc)
            return this.pub;var len=this.ec.curve.p.byteLength();var x=this.pub.getX().toArray();for(var i=x.length;i<len;i++)
            x.unshift(0);var res;if(this.ec.curve.type!=='mont'){if(compact){res=[this.pub.getY().isEven()?0x02:0x03].concat(x)}else{var y=this.pub.getY().toArray();for(var i=y.length;i<len;i++)
            y.unshift(0);var res=[0x04].concat(x,y)}}else{res=x}
        return utils.encode(res,enc)};KeyPair.prototype.getPrivate=function getPrivate(enc){if(enc==='hex')
        return this.priv.toString(16,2);else return this.priv};KeyPair.prototype._importPrivate=function _importPrivate(key,enc){this.priv=new bn(key,enc||16);this.priv=this.priv.mod(this.ec.curve.n)};KeyPair.prototype._importPublic=function _importPublic(key,enc){if(key.x||key.y){this.pub=this.ec.curve.point(key.x,key.y);return}
        key=utils.toArray(key,enc);if(this.ec.curve.type!=='mont')
            return this._importPublicShort(key);else return this._importPublicMont(key)};KeyPair.prototype._importPublicShort=function _importPublicShort(key){var len=this.ec.curve.p.byteLength();if(key[0]===0x04&&key.length-1===2*len){this.pub=this.ec.curve.point(key.slice(1,1+len),key.slice(1+len,1+2*len))}else if((key[0]===0x02||key[0]===0x03)&&key.length-1===len){this.pub=this.ec.curve.pointFromX(key[0]===0x03,key.slice(1,1+len))}};KeyPair.prototype._importPublicMont=function _importPublicMont(key){this.pub=this.ec.curve.point(key,1)};KeyPair.prototype.derive=function derive(pub){return pub.mul(this.priv).getX()};KeyPair.prototype.sign=function sign(msg){return this.ec.sign(msg,this)};KeyPair.prototype.verify=function verify(msg,signature){return this.ec.verify(msg,signature,this)};KeyPair.prototype.inspect=function inspect(){return'<Key priv: '+(this.priv&&this.priv.toString(16,2))+' pub: '+(this.pub&&this.pub.inspect())+' >'}},{"../../elliptic":12,"bn.js":11}],21:[function(require,module,exports){'use strict';var bn=require('bn.js');var elliptic=require('../../elliptic');var utils=elliptic.utils;var assert=utils.assert;function Signature(options,enc){if(options instanceof Signature)
    return options;if(this._importDER(options,enc))
    return;assert(options.r&&options.s,'Signature without r or s');this.r=new bn(options.r,16);this.s=new bn(options.s,16);if(options.recoveryParam!==null)
    this.recoveryParam=options.recoveryParam;else this.recoveryParam=null}
    module.exports=Signature;Signature.prototype._importDER=function _importDER(data,enc){data=utils.toArray(data,enc);if(data.length<6||data[0]!==0x30||data[2]!==0x02)
        return!1;var total=data[1];if(1+total>data.length)
        return!1;var rlen=data[3];if(rlen>=0x80)
        return!1;if(4+rlen+2>=data.length)
        return!1;if(data[4+rlen]!==0x02)
        return!1;var slen=data[5+rlen];if(slen>=0x80)
        return!1;if(4+rlen+2+slen>data.length)
        return!1;this.r=new bn(data.slice(4,4+rlen));this.s=new bn(data.slice(4+rlen+2,4+rlen+2+slen));this.recoveryParam=null;return!0};Signature.prototype.toDER=function toDER(enc){var r=this.r.toArray();var s=this.s.toArray();if(r[0]&0x80)
        r=[0].concat(r);if(s[0]&0x80)
        s=[0].concat(s);var total=r.length+s.length+4;var res=[0x30,total,0x02,r.length];res=res.concat(r,[0x02,s.length],s);return utils.encode(res,enc)}},{"../../elliptic":12,"bn.js":11}],22:[function(require,module,exports){'use strict';var hash=require('hash.js');var elliptic=require('../elliptic');var utils=elliptic.utils;var assert=utils.assert;function HmacDRBG(options){if(!(this instanceof HmacDRBG))
    return new HmacDRBG(options);this.hash=options.hash;this.predResist=!!options.predResist;this.outLen=this.hash.outSize;this.minEntropy=options.minEntropy||this.hash.hmacStrength;this.reseed=null;this.reseedInterval=null;this.K=null;this.V=null;var entropy=utils.toArray(options.entropy,options.entropyEnc);var nonce=utils.toArray(options.nonce,options.nonceEnc);var pers=utils.toArray(options.pers,options.persEnc);assert(entropy.length>=(this.minEntropy/8),'Not enough entropy. Minimum is: '+this.minEntropy+' bits');this._init(entropy,nonce,pers)}
    module.exports=HmacDRBG;HmacDRBG.prototype._init=function init(entropy,nonce,pers){var seed=entropy.concat(nonce).concat(pers);this.K=new Array(this.outLen/8);this.V=new Array(this.outLen/8);for(var i=0;i<this.V.length;i++){this.K[i]=0x00;this.V[i]=0x01}
        this._update(seed);this.reseed=1;this.reseedInterval=0x1000000000000};HmacDRBG.prototype._hmac=function hmac(){return new hash.hmac(this.hash,this.K)};HmacDRBG.prototype._update=function update(seed){var kmac=this._hmac().update(this.V).update([0x00]);if(seed)
        kmac=kmac.update(seed);this.K=kmac.digest();this.V=this._hmac().update(this.V).digest();if(!seed)
        return;this.K=this._hmac().update(this.V).update([0x01]).update(seed).digest();this.V=this._hmac().update(this.V).digest()};HmacDRBG.prototype.reseed=function reseed(entropy,entropyEnc,add,addEnc){if(typeof entropyEnc!=='string'){addEnc=add;add=entropyEnc;entropyEnc=null}
        entropy=utils.toBuffer(entropy,entropyEnc);add=utils.toBuffer(add,addEnc);assert(entropy.length>=(this.minEntropy/8),'Not enough entropy. Minimum is: '+this.minEntropy+' bits');this._update(entropy.concat(add||[]));this.reseed=1};HmacDRBG.prototype.generate=function generate(len,enc,add,addEnc){if(this.reseed>this.reseedInterval)
        throw new Error('Reseed is required');if(typeof enc!=='string'){addEnc=add;add=enc;enc=null}
        if(add){add=utils.toArray(add,addEnc);this._update(add)}
        var temp=[];while(temp.length<len){this.V=this._hmac().update(this.V).digest();temp=temp.concat(this.V)}
        var res=temp.slice(0,len);this._update(add);this.reseed++;return utils.encode(res,enc)}},{"../elliptic":12,"hash.js":26}],23:[function(require,module,exports){module.exports={doubles:{step:4,points:[['e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a','f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821'],['8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508','11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf'],['175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739','d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695'],['363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640','4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9'],['8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c','4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36'],['723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda','96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f'],['eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa','5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999'],['100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0','cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09'],['e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d','9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d'],['feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d','e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088'],['da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1','9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d'],['53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0','5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8'],['8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047','10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a'],['385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862','283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453'],['6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7','7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160'],['3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd','56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0'],['85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83','7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6'],['948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a','53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589'],['6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8','bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17'],['e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d','4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda'],['e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725','7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd'],['213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754','4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2'],['4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c','17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6'],['fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6','6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f'],['76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39','c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01'],['c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891','893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3'],['d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b','febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f'],['b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03','2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7'],['e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d','eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78'],['a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070','7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1'],['90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4','e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150'],['8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da','662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82'],['e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11','1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc'],['8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e','efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b'],['e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41','2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51'],['b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef','67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45'],['d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8','db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120'],['324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d','648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84'],['4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96','35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d'],['9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd','ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d'],['6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5','9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8'],['a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266','40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8'],['7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71','34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac'],['928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac','c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f'],['85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751','1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962'],['ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e','493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907'],['827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241','c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec'],['eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3','be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d'],['e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f','4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414'],['1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19','aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd'],['146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be','b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0'],['fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9','6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811'],['da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2','8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1'],['a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13','7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c'],['174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c','ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73'],['959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba','2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd'],['d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151','e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405'],['64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073','d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589'],['8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458','38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e'],['13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b','69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27'],['bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366','d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1'],['8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa','40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482'],['8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0','620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945'],['dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787','7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573'],['f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e','ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82']]},naf:{wnd:7,points:[['f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9','388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672'],['2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4','d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6'],['5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc','6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da'],['acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe','cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37'],['774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb','d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b'],['f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8','ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81'],['d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e','581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58'],['defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34','4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77'],['2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c','85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a'],['352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5','321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c'],['2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f','2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67'],['9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714','73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402'],['daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729','a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55'],['c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db','2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482'],['6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4','e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82'],['1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5','b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396'],['605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479','2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49'],['62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d','80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf'],['80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f','1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a'],['7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb','d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7'],['d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9','eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933'],['49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963','758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a'],['77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74','958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6'],['f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530','e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37'],['463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b','5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e'],['f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247','cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6'],['caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1','cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476'],['2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120','4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40'],['7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435','91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61'],['754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18','673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683'],['e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8','59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5'],['186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb','3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b'],['df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f','55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417'],['5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143','efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868'],['290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba','e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a'],['af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45','f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6'],['766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a','744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996'],['59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e','c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e'],['f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8','e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d'],['7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c','30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2'],['948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519','e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e'],['7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab','100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437'],['3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca','ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311'],['d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf','8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4'],['1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610','68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575'],['733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4','f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d'],['15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c','d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d'],['a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940','edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629'],['e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980','a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06'],['311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3','66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374'],['34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf','9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee'],['f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63','4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1'],['d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448','fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b'],['32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf','5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661'],['7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5','8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6'],['ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6','8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e'],['16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5','5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d'],['eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99','f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc'],['78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51','f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4'],['494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5','42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c'],['a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5','204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b'],['c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997','4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913'],['841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881','73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154'],['5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5','39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865'],['36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66','d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc'],['336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726','ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224'],['8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede','6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e'],['1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94','60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6'],['85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31','3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511'],['29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51','b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b'],['a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252','ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2'],['4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5','cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c'],['d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b','6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3'],['ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4','322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d'],['af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f','6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700'],['e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889','2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4'],['591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246','b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196'],['11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984','998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4'],['3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a','b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257'],['cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030','bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13'],['c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197','6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096'],['c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593','c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38'],['a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef','21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f'],['347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38','60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448'],['da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a','49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a'],['c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111','5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4'],['4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502','7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437'],['3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea','be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7'],['cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26','8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d'],['b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986','39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a'],['d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e','62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54'],['48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4','25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77'],['dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda','ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517'],['6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859','cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10'],['e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f','f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125'],['eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c','6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e'],['13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942','fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1'],['ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a','1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2'],['b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80','5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423'],['ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d','438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8'],['8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1','cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758'],['52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63','c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375'],['e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352','6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d'],['7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193','ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec'],['5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00','9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0'],['32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58','ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c'],['e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7','d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4'],['8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8','c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f'],['4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e','67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649'],['3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d','cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826'],['674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b','299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5'],['d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f','f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87'],['30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6','462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b'],['be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297','62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc'],['93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a','7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c'],['b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c','ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f'],['d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52','4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a'],['d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb','bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46'],['463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065','bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f'],['7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917','603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03'],['74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9','cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08'],['30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3','553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8'],['9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57','712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373'],['176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66','ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3'],['75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8','9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8'],['809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721','9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1'],['1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180','4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9']]}}},{}],24:[function(require,module,exports){'use strict';var utils=exports;utils.assert=function assert(val,msg){if(!val)
    throw new Error(msg||'Assertion failed')};function toArray(msg,enc){if(Array.isArray(msg))
    return msg.slice();if(!msg)
    return[];var res=[];if(typeof msg!=='string'){for(var i=0;i<msg.length;i++)
    res[i]=msg[i]|0;return res}
    if(!enc){for(var i=0;i<msg.length;i++){var c=msg.charCodeAt(i);var hi=c>>8;var lo=c&0xff;if(hi)
        res.push(hi,lo);else res.push(lo)}}else if(enc==='hex'){msg=msg.replace(/[^a-z0-9]+/ig,'');if(msg.length%2!==0)
        msg='0'+msg;for(var i=0;i<msg.length;i+=2)
        res.push(parseInt(msg[i]+msg[i+1],16));}
    return res}
    utils.toArray=toArray;function zero2(word){if(word.length===1)
        return'0'+word;else return word}
    utils.zero2=zero2;function toHex(msg){var res='';for(var i=0;i<msg.length;i++)
        res+=zero2(msg[i].toString(16));return res}
    utils.toHex=toHex;utils.encode=function encode(arr,enc){if(enc==='hex')
        return toHex(arr);else return arr};function getNAF(num,w){var naf=[];var ws=1<<(w+1);var k=num.clone();while(k.cmpn(1)>=0){var z;if(k.isOdd()){var mod=k.andln(ws-1);if(mod>(ws>>1)-1)
        z=(ws>>1)-mod;else z=mod;k.isubn(z)}else{z=0}
        naf.push(z);var shift=(k.cmpn(0)!==0&&k.andln(ws-1)===0)?(w+1):1;for(var i=1;i<shift;i++)
            naf.push(0);k.ishrn(shift)}
        return naf}
    utils.getNAF=getNAF;function getJSF(k1,k2){var jsf=[[],[]];k1=k1.clone();k2=k2.clone();var d1=0;var d2=0;while(k1.cmpn(-d1)>0||k2.cmpn(-d2)>0){var m14=(k1.andln(3)+d1)&3;var m24=(k2.andln(3)+d2)&3;if(m14===3)
        m14=-1;if(m24===3)
        m24=-1;var u1;if((m14&1)===0){u1=0}else{var m8=(k1.andln(7)+d1)&7;if((m8===3||m8===5)&&m24===2)
        u1=-m14;else u1=m14}
        jsf[0].push(u1);var u2;if((m24&1)===0){u2=0}else{var m8=(k2.andln(7)+d2)&7;if((m8===3||m8===5)&&m14===2)
            u2=-m24;else u2=m24}
        jsf[1].push(u2);if(2*d1===u1+1)
            d1=1-d1;if(2*d2===u2+1)
            d2=1-d2;k1.ishrn(1);k2.ishrn(1)}
        return jsf}
    utils.getJSF=getJSF},{}],25:[function(require,module,exports){var r;module.exports=function rand(len){if(!r)
    r=new Rand(null);return r.generate(len)};function Rand(rand){this.rand=rand}
    module.exports.Rand=Rand;Rand.prototype.generate=function generate(len){return this._rand(len)};if(typeof window==='object'){if(window.crypto&&window.crypto.getRandomValues){Rand.prototype._rand=function _rand(n){var arr=new Uint8Array(n);window.crypto.getRandomValues(arr);return arr}}else if(window.msCrypto&&window.msCrypto.getRandomValues){Rand.prototype._rand=function _rand(n){var arr=new Uint8Array(n);window.msCrypto.getRandomValues(arr);return arr}}else{Rand.prototype._rand=function(){throw new Error('Not implemented yet')}}}else{try{var crypto=require('cry'+'pto');Rand.prototype._rand=function _rand(n){return crypto.randomBytes(n)}}catch(e){Rand.prototype._rand=function _rand(n){var res=new Uint8Array(n);for(var i=0;i<res.length;i++)
        res[i]=this.rand.getByte();return res}}}},{}],26:[function(require,module,exports){var hash=exports;hash.utils=require('./hash/utils');hash.common=require('./hash/common');hash.sha=require('./hash/sha');hash.ripemd=require('./hash/ripemd');hash.hmac=require('./hash/hmac');hash.sha1=hash.sha.sha1;hash.sha256=hash.sha.sha256;hash.sha224=hash.sha.sha224;hash.sha384=hash.sha.sha384;hash.sha512=hash.sha.sha512;hash.ripemd160=hash.ripemd.ripemd160},{"./hash/common":27,"./hash/hmac":28,"./hash/ripemd":29,"./hash/sha":30,"./hash/utils":31}],27:[function(require,module,exports){var hash=require('../hash');var utils=hash.utils;var assert=utils.assert;function BlockHash(){this.pending=null;this.pendingTotal=0;this.blockSize=this.constructor.blockSize;this.outSize=this.constructor.outSize;this.hmacStrength=this.constructor.hmacStrength;this.padLength=this.constructor.padLength/8;this.endian='big';this._delta8=this.blockSize/8;this._delta32=this.blockSize/32}
    exports.BlockHash=BlockHash;BlockHash.prototype.update=function update(msg,enc){msg=utils.toArray(msg,enc);if(!this.pending)
        this.pending=msg;else this.pending=this.pending.concat(msg);this.pendingTotal+=msg.length;if(this.pending.length>=this._delta8){msg=this.pending;var r=msg.length%this._delta8;this.pending=msg.slice(msg.length-r,msg.length);if(this.pending.length===0)
        this.pending=null;msg=utils.join32(msg,0,msg.length-r,this.endian);for(var i=0;i<msg.length;i+=this._delta32)
        this._update(msg,i,i+this._delta32);}
        return this};BlockHash.prototype.digest=function digest(enc){this.update(this._pad());assert(this.pending===null);return this._digest(enc)};BlockHash.prototype._pad=function pad(){var len=this.pendingTotal;var bytes=this._delta8;var k=bytes-((len+this.padLength)%bytes);var res=new Array(k+this.padLength);res[0]=0x80;for(var i=1;i<k;i++)
        res[i]=0;len<<=3;if(this.endian==='big'){for(var t=8;t<this.padLength;t++)
        res[i++]=0;res[i++]=0;res[i++]=0;res[i++]=0;res[i++]=0;res[i++]=(len>>>24)&0xff;res[i++]=(len>>>16)&0xff;res[i++]=(len>>>8)&0xff;res[i++]=len&0xff}else{res[i++]=len&0xff;res[i++]=(len>>>8)&0xff;res[i++]=(len>>>16)&0xff;res[i++]=(len>>>24)&0xff;res[i++]=0;res[i++]=0;res[i++]=0;res[i++]=0;for(var t=8;t<this.padLength;t++)
        res[i++]=0}
        return res}},{"../hash":26}],28:[function(require,module,exports){var hmac=exports;var hash=require('../hash');var utils=hash.utils;var assert=utils.assert;function Hmac(hash,key,enc){if(!(this instanceof Hmac))
    return new Hmac(hash,key,enc);this.Hash=hash;this.blockSize=hash.blockSize/8;this.outSize=hash.outSize/8;this.inner=null;this.outer=null;this._init(utils.toArray(key,enc))}
    module.exports=Hmac;Hmac.prototype._init=function init(key){if(key.length>this.blockSize)
        key=new this.Hash().update(key).digest();assert(key.length<=this.blockSize);for(var i=key.length;i<this.blockSize;i++)
        key.push(0);for(var i=0;i<key.length;i++)
        key[i]^=0x36;this.inner=new this.Hash().update(key);for(var i=0;i<key.length;i++)
        key[i]^=0x6a;this.outer=new this.Hash().update(key)};Hmac.prototype.update=function update(msg,enc){this.inner.update(msg,enc);return this};Hmac.prototype.digest=function digest(enc){this.outer.update(this.inner.digest());return this.outer.digest(enc)}},{"../hash":26}],29:[function(require,module,exports){var hash=require('../hash');var utils=hash.utils;var rotl32=utils.rotl32;var sum32=utils.sum32;var sum32_3=utils.sum32_3;var sum32_4=utils.sum32_4;var BlockHash=hash.common.BlockHash;function RIPEMD160(){if(!(this instanceof RIPEMD160))
    return new RIPEMD160();BlockHash.call(this);this.h=[0x67452301,0xefcdab89,0x98badcfe,0x10325476,0xc3d2e1f0];this.endian='little'}
    utils.inherits(RIPEMD160,BlockHash);exports.ripemd160=RIPEMD160;RIPEMD160.blockSize=512;RIPEMD160.outSize=160;RIPEMD160.hmacStrength=192;RIPEMD160.padLength=64;RIPEMD160.prototype._update=function update(msg,start){var A=this.h[0];var B=this.h[1];var C=this.h[2];var D=this.h[3];var E=this.h[4];var Ah=A;var Bh=B;var Ch=C;var Dh=D;var Eh=E;for(var j=0;j<80;j++){var T=sum32(rotl32(sum32_4(A,f(j,B,C,D),msg[r[j]+start],K(j)),s[j]),E);A=E;E=D;D=rotl32(C,10);C=B;B=T;T=sum32(rotl32(sum32_4(Ah,f(79-j,Bh,Ch,Dh),msg[rh[j]+start],Kh(j)),sh[j]),Eh);Ah=Eh;Eh=Dh;Dh=rotl32(Ch,10);Ch=Bh;Bh=T}
        T=sum32_3(this.h[1],C,Dh);this.h[1]=sum32_3(this.h[2],D,Eh);this.h[2]=sum32_3(this.h[3],E,Ah);this.h[3]=sum32_3(this.h[4],A,Bh);this.h[4]=sum32_3(this.h[0],B,Ch);this.h[0]=T};RIPEMD160.prototype._digest=function digest(enc){if(enc==='hex')
        return utils.toHex32(this.h,'little');else return utils.split32(this.h,'little')};function f(j,x,y,z){if(j<=15)
        return x^y^z;else if(j<=31)
        return(x&y)|((~x)&z);else if(j<=47)
        return(x|(~y))^z;else if(j<=63)
        return(x&z)|(y&(~z));else return x^(y|(~z))}
    function K(j){if(j<=15)
        return 0x00000000;else if(j<=31)
        return 0x5a827999;else if(j<=47)
        return 0x6ed9eba1;else if(j<=63)
        return 0x8f1bbcdc;else return 0xa953fd4e}
    function Kh(j){if(j<=15)
        return 0x50a28be6;else if(j<=31)
        return 0x5c4dd124;else if(j<=47)
        return 0x6d703ef3;else if(j<=63)
        return 0x7a6d76e9;else return 0x00000000}
    var r=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13];var rh=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11];var s=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6];var sh=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]},{"../hash":26}],30:[function(require,module,exports){var hash=require('../hash');var utils=hash.utils;var assert=utils.assert;var rotr32=utils.rotr32;var rotl32=utils.rotl32;var sum32=utils.sum32;var sum32_4=utils.sum32_4;var sum32_5=utils.sum32_5;var rotr64_hi=utils.rotr64_hi;var rotr64_lo=utils.rotr64_lo;var shr64_hi=utils.shr64_hi;var shr64_lo=utils.shr64_lo;var sum64=utils.sum64;var sum64_hi=utils.sum64_hi;var sum64_lo=utils.sum64_lo;var sum64_4_hi=utils.sum64_4_hi;var sum64_4_lo=utils.sum64_4_lo;var sum64_5_hi=utils.sum64_5_hi;var sum64_5_lo=utils.sum64_5_lo;var BlockHash=hash.common.BlockHash;var sha256_K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];var sha512_K=[0x428a2f98,0xd728ae22,0x71374491,0x23ef65cd,0xb5c0fbcf,0xec4d3b2f,0xe9b5dba5,0x8189dbbc,0x3956c25b,0xf348b538,0x59f111f1,0xb605d019,0x923f82a4,0xaf194f9b,0xab1c5ed5,0xda6d8118,0xd807aa98,0xa3030242,0x12835b01,0x45706fbe,0x243185be,0x4ee4b28c,0x550c7dc3,0xd5ffb4e2,0x72be5d74,0xf27b896f,0x80deb1fe,0x3b1696b1,0x9bdc06a7,0x25c71235,0xc19bf174,0xcf692694,0xe49b69c1,0x9ef14ad2,0xefbe4786,0x384f25e3,0x0fc19dc6,0x8b8cd5b5,0x240ca1cc,0x77ac9c65,0x2de92c6f,0x592b0275,0x4a7484aa,0x6ea6e483,0x5cb0a9dc,0xbd41fbd4,0x76f988da,0x831153b5,0x983e5152,0xee66dfab,0xa831c66d,0x2db43210,0xb00327c8,0x98fb213f,0xbf597fc7,0xbeef0ee4,0xc6e00bf3,0x3da88fc2,0xd5a79147,0x930aa725,0x06ca6351,0xe003826f,0x14292967,0x0a0e6e70,0x27b70a85,0x46d22ffc,0x2e1b2138,0x5c26c926,0x4d2c6dfc,0x5ac42aed,0x53380d13,0x9d95b3df,0x650a7354,0x8baf63de,0x766a0abb,0x3c77b2a8,0x81c2c92e,0x47edaee6,0x92722c85,0x1482353b,0xa2bfe8a1,0x4cf10364,0xa81a664b,0xbc423001,0xc24b8b70,0xd0f89791,0xc76c51a3,0x0654be30,0xd192e819,0xd6ef5218,0xd6990624,0x5565a910,0xf40e3585,0x5771202a,0x106aa070,0x32bbd1b8,0x19a4c116,0xb8d2d0c8,0x1e376c08,0x5141ab53,0x2748774c,0xdf8eeb99,0x34b0bcb5,0xe19b48a8,0x391c0cb3,0xc5c95a63,0x4ed8aa4a,0xe3418acb,0x5b9cca4f,0x7763e373,0x682e6ff3,0xd6b2b8a3,0x748f82ee,0x5defb2fc,0x78a5636f,0x43172f60,0x84c87814,0xa1f0ab72,0x8cc70208,0x1a6439ec,0x90befffa,0x23631e28,0xa4506ceb,0xde82bde9,0xbef9a3f7,0xb2c67915,0xc67178f2,0xe372532b,0xca273ece,0xea26619c,0xd186b8c7,0x21c0c207,0xeada7dd6,0xcde0eb1e,0xf57d4f7f,0xee6ed178,0x06f067aa,0x72176fba,0x0a637dc5,0xa2c898a6,0x113f9804,0xbef90dae,0x1b710b35,0x131c471b,0x28db77f5,0x23047d84,0x32caab7b,0x40c72493,0x3c9ebe0a,0x15c9bebc,0x431d67c4,0x9c100d4c,0x4cc5d4be,0xcb3e42b6,0x597f299c,0xfc657e2a,0x5fcb6fab,0x3ad6faec,0x6c44198c,0x4a475817];var sha1_K=[0x5A827999,0x6ED9EBA1,0x8F1BBCDC,0xCA62C1D6];function SHA256(){if(!(this instanceof SHA256))
    return new SHA256();BlockHash.call(this);this.h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];this.k=sha256_K;this.W=new Array(64)}
    utils.inherits(SHA256,BlockHash);exports.sha256=SHA256;SHA256.blockSize=512;SHA256.outSize=256;SHA256.hmacStrength=192;SHA256.padLength=64;SHA256.prototype._update=function _update(msg,start){var W=this.W;for(var i=0;i<16;i++)
        W[i]=msg[start+i];for(;i<W.length;i++)
        W[i]=sum32_4(g1_256(W[i-2]),W[i-7],g0_256(W[i-15]),W[i-16]);var a=this.h[0];var b=this.h[1];var c=this.h[2];var d=this.h[3];var e=this.h[4];var f=this.h[5];var g=this.h[6];var h=this.h[7];assert(this.k.length===W.length);for(var i=0;i<W.length;i++){var T1=sum32_5(h,s1_256(e),ch32(e,f,g),this.k[i],W[i]);var T2=sum32(s0_256(a),maj32(a,b,c));h=g;g=f;f=e;e=sum32(d,T1);d=c;c=b;b=a;a=sum32(T1,T2)}
        this.h[0]=sum32(this.h[0],a);this.h[1]=sum32(this.h[1],b);this.h[2]=sum32(this.h[2],c);this.h[3]=sum32(this.h[3],d);this.h[4]=sum32(this.h[4],e);this.h[5]=sum32(this.h[5],f);this.h[6]=sum32(this.h[6],g);this.h[7]=sum32(this.h[7],h)};SHA256.prototype._digest=function digest(enc){if(enc==='hex')
        return utils.toHex32(this.h,'big');else return utils.split32(this.h,'big')};function SHA224(){if(!(this instanceof SHA224))
        return new SHA224();SHA256.call(this);this.h=[0xc1059ed8,0x367cd507,0x3070dd17,0xf70e5939,0xffc00b31,0x68581511,0x64f98fa7,0xbefa4fa4]}
    utils.inherits(SHA224,SHA256);exports.sha224=SHA224;SHA224.blockSize=512;SHA224.outSize=224;SHA224.hmacStrength=192;SHA224.padLength=64;SHA224.prototype._digest=function digest(enc){if(enc==='hex')
        return utils.toHex32(this.h.slice(0,7),'big');else return utils.split32(this.h.slice(0,7),'big')};function SHA512(){if(!(this instanceof SHA512))
        return new SHA512();BlockHash.call(this);this.h=[0x6a09e667,0xf3bcc908,0xbb67ae85,0x84caa73b,0x3c6ef372,0xfe94f82b,0xa54ff53a,0x5f1d36f1,0x510e527f,0xade682d1,0x9b05688c,0x2b3e6c1f,0x1f83d9ab,0xfb41bd6b,0x5be0cd19,0x137e2179];this.k=sha512_K;this.W=new Array(160)}
    utils.inherits(SHA512,BlockHash);exports.sha512=SHA512;SHA512.blockSize=1024;SHA512.outSize=512;SHA512.hmacStrength=192;SHA512.padLength=128;SHA512.prototype._prepareBlock=function _prepareBlock(msg,start){var W=this.W;for(var i=0;i<32;i++)
        W[i]=msg[start+i];for(;i<W.length;i+=2){var c0_hi=g1_512_hi(W[i-4],W[i-3]);var c0_lo=g1_512_lo(W[i-4],W[i-3]);var c1_hi=W[i-14];var c1_lo=W[i-13];var c2_hi=g0_512_hi(W[i-30],W[i-29]);var c2_lo=g0_512_lo(W[i-30],W[i-29]);var c3_hi=W[i-32];var c3_lo=W[i-31];W[i]=sum64_4_hi(c0_hi,c0_lo,c1_hi,c1_lo,c2_hi,c2_lo,c3_hi,c3_lo);W[i+1]=sum64_4_lo(c0_hi,c0_lo,c1_hi,c1_lo,c2_hi,c2_lo,c3_hi,c3_lo)}};SHA512.prototype._update=function _update(msg,start){this._prepareBlock(msg,start);var W=this.W;var ah=this.h[0];var al=this.h[1];var bh=this.h[2];var bl=this.h[3];var ch=this.h[4];var cl=this.h[5];var dh=this.h[6];var dl=this.h[7];var eh=this.h[8];var el=this.h[9];var fh=this.h[10];var fl=this.h[11];var gh=this.h[12];var gl=this.h[13];var hh=this.h[14];var hl=this.h[15];assert(this.k.length===W.length);for(var i=0;i<W.length;i+=2){var c0_hi=hh;var c0_lo=hl;var c1_hi=s1_512_hi(eh,el);var c1_lo=s1_512_lo(eh,el);var c2_hi=ch64_hi(eh,el,fh,fl,gh,gl);var c2_lo=ch64_lo(eh,el,fh,fl,gh,gl);var c3_hi=this.k[i];var c3_lo=this.k[i+1];var c4_hi=W[i];var c4_lo=W[i+1];var T1_hi=sum64_5_hi(c0_hi,c0_lo,c1_hi,c1_lo,c2_hi,c2_lo,c3_hi,c3_lo,c4_hi,c4_lo);var T1_lo=sum64_5_lo(c0_hi,c0_lo,c1_hi,c1_lo,c2_hi,c2_lo,c3_hi,c3_lo,c4_hi,c4_lo);var c0_hi=s0_512_hi(ah,al);var c0_lo=s0_512_lo(ah,al);var c1_hi=maj64_hi(ah,al,bh,bl,ch,cl);var c1_lo=maj64_lo(ah,al,bh,bl,ch,cl);var T2_hi=sum64_hi(c0_hi,c0_lo,c1_hi,c1_lo);var T2_lo=sum64_lo(c0_hi,c0_lo,c1_hi,c1_lo);hh=gh;hl=gl;gh=fh;gl=fl;fh=eh;fl=el;eh=sum64_hi(dh,dl,T1_hi,T1_lo);el=sum64_lo(dl,dl,T1_hi,T1_lo);dh=ch;dl=cl;ch=bh;cl=bl;bh=ah;bl=al;ah=sum64_hi(T1_hi,T1_lo,T2_hi,T2_lo);al=sum64_lo(T1_hi,T1_lo,T2_hi,T2_lo)}
        sum64(this.h,0,ah,al);sum64(this.h,2,bh,bl);sum64(this.h,4,ch,cl);sum64(this.h,6,dh,dl);sum64(this.h,8,eh,el);sum64(this.h,10,fh,fl);sum64(this.h,12,gh,gl);sum64(this.h,14,hh,hl)};SHA512.prototype._digest=function digest(enc){if(enc==='hex')
        return utils.toHex32(this.h,'big');else return utils.split32(this.h,'big')};function SHA384(){if(!(this instanceof SHA384))
        return new SHA384();SHA512.call(this);this.h=[0xcbbb9d5d,0xc1059ed8,0x629a292a,0x367cd507,0x9159015a,0x3070dd17,0x152fecd8,0xf70e5939,0x67332667,0xffc00b31,0x8eb44a87,0x68581511,0xdb0c2e0d,0x64f98fa7,0x47b5481d,0xbefa4fa4]}
    utils.inherits(SHA384,SHA512);exports.sha384=SHA384;SHA384.blockSize=1024;SHA384.outSize=384;SHA384.hmacStrength=192;SHA384.padLength=128;SHA384.prototype._digest=function digest(enc){if(enc==='hex')
        return utils.toHex32(this.h.slice(0,12),'big');else return utils.split32(this.h.slice(0,12),'big')};function SHA1(){if(!(this instanceof SHA1))
        return new SHA1();BlockHash.call(this);this.h=[0x67452301,0xefcdab89,0x98badcfe,0x10325476,0xc3d2e1f0];this.W=new Array(80)}
    utils.inherits(SHA1,BlockHash);exports.sha1=SHA1;SHA1.blockSize=512;SHA1.outSize=160;SHA1.hmacStrength=80;SHA1.padLength=64;SHA1.prototype._update=function _update(msg,start){var W=this.W;for(var i=0;i<16;i++)
        W[i]=msg[start+i];for(;i<W.length;i++)
        W[i]=rotl32(W[i-3]^W[i-8]^W[i-14]^W[i-16],1);var a=this.h[0];var b=this.h[1];var c=this.h[2];var d=this.h[3];var e=this.h[4];for(var i=0;i<W.length;i++){var s=~~(i/20);var t=sum32_5(rotl32(a,5),ft_1(s,b,c,d),e,W[i],sha1_K[s]);e=d;d=c;c=rotl32(b,30);b=a;a=t}
        this.h[0]=sum32(this.h[0],a);this.h[1]=sum32(this.h[1],b);this.h[2]=sum32(this.h[2],c);this.h[3]=sum32(this.h[3],d);this.h[4]=sum32(this.h[4],e)};SHA1.prototype._digest=function digest(enc){if(enc==='hex')
        return utils.toHex32(this.h,'big');else return utils.split32(this.h,'big')};function ch32(x,y,z){return(x&y)^((~x)&z)}
    function maj32(x,y,z){return(x&y)^(x&z)^(y&z)}
    function p32(x,y,z){return x^y^z}
    function s0_256(x){return rotr32(x,2)^rotr32(x,13)^rotr32(x,22)}
    function s1_256(x){return rotr32(x,6)^rotr32(x,11)^rotr32(x,25)}
    function g0_256(x){return rotr32(x,7)^rotr32(x,18)^(x>>>3)}
    function g1_256(x){return rotr32(x,17)^rotr32(x,19)^(x>>>10)}
    function ft_1(s,x,y,z){if(s===0)
        return ch32(x,y,z);if(s===1||s===3)
        return p32(x,y,z);if(s===2)
        return maj32(x,y,z)}
    function ch64_hi(xh,xl,yh,yl,zh,zl){var r=(xh&yh)^((~xh)&zh);if(r<0)
        r+=0x100000000;return r}
    function ch64_lo(xh,xl,yh,yl,zh,zl){var r=(xl&yl)^((~xl)&zl);if(r<0)
        r+=0x100000000;return r}
    function maj64_hi(xh,xl,yh,yl,zh,zl){var r=(xh&yh)^(xh&zh)^(yh&zh);if(r<0)
        r+=0x100000000;return r}
    function maj64_lo(xh,xl,yh,yl,zh,zl){var r=(xl&yl)^(xl&zl)^(yl&zl);if(r<0)
        r+=0x100000000;return r}
    function s0_512_hi(xh,xl){var c0_hi=rotr64_hi(xh,xl,28);var c1_hi=rotr64_hi(xl,xh,2);var c2_hi=rotr64_hi(xl,xh,7);var r=c0_hi^c1_hi^c2_hi;if(r<0)
        r+=0x100000000;return r}
    function s0_512_lo(xh,xl){var c0_lo=rotr64_lo(xh,xl,28);var c1_lo=rotr64_lo(xl,xh,2);var c2_lo=rotr64_lo(xl,xh,7);var r=c0_lo^c1_lo^c2_lo;if(r<0)
        r+=0x100000000;return r}
    function s1_512_hi(xh,xl){var c0_hi=rotr64_hi(xh,xl,14);var c1_hi=rotr64_hi(xh,xl,18);var c2_hi=rotr64_hi(xl,xh,9);var r=c0_hi^c1_hi^c2_hi;if(r<0)
        r+=0x100000000;return r}
    function s1_512_lo(xh,xl){var c0_lo=rotr64_lo(xh,xl,14);var c1_lo=rotr64_lo(xh,xl,18);var c2_lo=rotr64_lo(xl,xh,9);var r=c0_lo^c1_lo^c2_lo;if(r<0)
        r+=0x100000000;return r}
    function g0_512_hi(xh,xl){var c0_hi=rotr64_hi(xh,xl,1);var c1_hi=rotr64_hi(xh,xl,8);var c2_hi=shr64_hi(xh,xl,7);var r=c0_hi^c1_hi^c2_hi;if(r<0)
        r+=0x100000000;return r}
    function g0_512_lo(xh,xl){var c0_lo=rotr64_lo(xh,xl,1);var c1_lo=rotr64_lo(xh,xl,8);var c2_lo=shr64_lo(xh,xl,7);var r=c0_lo^c1_lo^c2_lo;if(r<0)
        r+=0x100000000;return r}
    function g1_512_hi(xh,xl){var c0_hi=rotr64_hi(xh,xl,19);var c1_hi=rotr64_hi(xl,xh,29);var c2_hi=shr64_hi(xh,xl,6);var r=c0_hi^c1_hi^c2_hi;if(r<0)
        r+=0x100000000;return r}
    function g1_512_lo(xh,xl){var c0_lo=rotr64_lo(xh,xl,19);var c1_lo=rotr64_lo(xl,xh,29);var c2_lo=shr64_lo(xh,xl,6);var r=c0_lo^c1_lo^c2_lo;if(r<0)
        r+=0x100000000;return r}},{"../hash":26}],31:[function(require,module,exports){var utils=exports;var inherits=require('inherits');function toArray(msg,enc){if(Array.isArray(msg))
    return msg.slice();if(!msg)
    return[];var res=[];if(typeof msg==='string'){if(!enc){for(var i=0;i<msg.length;i++){var c=msg.charCodeAt(i);var hi=c>>8;var lo=c&0xff;if(hi)
    res.push(hi,lo);else res.push(lo)}}else if(enc==='hex'){msg=msg.replace(/[^a-z0-9]+/ig,'');if(msg.length%2!==0)
    msg='0'+msg;for(var i=0;i<msg.length;i+=2)
    res.push(parseInt(msg[i]+msg[i+1],16));}}else{for(var i=0;i<msg.length;i++)
    res[i]=msg[i]|0}
    return res}
    utils.toArray=toArray;function toHex(msg){var res='';for(var i=0;i<msg.length;i++)
        res+=zero2(msg[i].toString(16));return res}
    utils.toHex=toHex;function htonl(w){var res=(w>>>24)|((w>>>8)&0xff00)|((w<<8)&0xff0000)|((w&0xff)<<24);return res>>>0}
    utils.htonl=htonl;function toHex32(msg,endian){var res='';for(var i=0;i<msg.length;i++){var w=msg[i];if(endian==='little')
        w=htonl(w);res+=zero8(w.toString(16))}
        return res}
    utils.toHex32=toHex32;function zero2(word){if(word.length===1)
        return'0'+word;else return word}
    utils.zero2=zero2;function zero8(word){if(word.length===7)
        return'0'+word;else if(word.length===6)
        return'00'+word;else if(word.length===5)
        return'000'+word;else if(word.length===4)
        return'0000'+word;else if(word.length===3)
        return'00000'+word;else if(word.length===2)
        return'000000'+word;else if(word.length===1)
        return'0000000'+word;else return word}
    utils.zero8=zero8;function join32(msg,start,end,endian){var len=end-start;assert(len%4===0);var res=new Array(len/4);for(var i=0,k=start;i<res.length;i++,k+=4){var w;if(endian==='big')
        w=(msg[k]<<24)|(msg[k+1]<<16)|(msg[k+2]<<8)|msg[k+3];else w=(msg[k+3]<<24)|(msg[k+2]<<16)|(msg[k+1]<<8)|msg[k];res[i]=w>>>0}
        return res}
    utils.join32=join32;function split32(msg,endian){var res=new Array(msg.length*4);for(var i=0,k=0;i<msg.length;i++,k+=4){var m=msg[i];if(endian==='big'){res[k]=m>>>24;res[k+1]=(m>>>16)&0xff;res[k+2]=(m>>>8)&0xff;res[k+3]=m&0xff}else{res[k+3]=m>>>24;res[k+2]=(m>>>16)&0xff;res[k+1]=(m>>>8)&0xff;res[k]=m&0xff}}
        return res}
    utils.split32=split32;function rotr32(w,b){return(w>>>b)|(w<<(32-b))}
    utils.rotr32=rotr32;function rotl32(w,b){return(w<<b)|(w>>>(32-b))}
    utils.rotl32=rotl32;function sum32(a,b){return(a+b)>>>0}
    utils.sum32=sum32;function sum32_3(a,b,c){return(a+b+c)>>>0}
    utils.sum32_3=sum32_3;function sum32_4(a,b,c,d){return(a+b+c+d)>>>0}
    utils.sum32_4=sum32_4;function sum32_5(a,b,c,d,e){return(a+b+c+d+e)>>>0}
    utils.sum32_5=sum32_5;function assert(cond,msg){if(!cond)
        throw new Error(msg||'Assertion failed')}
    utils.assert=assert;utils.inherits=inherits;function sum64(buf,pos,ah,al){var bh=buf[pos];var bl=buf[pos+1];var lo=(al+bl)>>>0;var hi=(lo<al?1:0)+ah+bh;buf[pos]=hi>>>0;buf[pos+1]=lo}
    exports.sum64=sum64;function sum64_hi(ah,al,bh,bl){var lo=(al+bl)>>>0;var hi=(lo<al?1:0)+ah+bh;return hi>>>0};exports.sum64_hi=sum64_hi;function sum64_lo(ah,al,bh,bl){var lo=al+bl;return lo>>>0};exports.sum64_lo=sum64_lo;function sum64_4_hi(ah,al,bh,bl,ch,cl,dh,dl){var carry=0;var lo=al;lo=(lo+bl)>>>0;carry+=lo<al?1:0;lo=(lo+cl)>>>0;carry+=lo<cl?1:0;lo=(lo+dl)>>>0;carry+=lo<dl?1:0;var hi=ah+bh+ch+dh+carry;return hi>>>0};exports.sum64_4_hi=sum64_4_hi;function sum64_4_lo(ah,al,bh,bl,ch,cl,dh,dl){var lo=al+bl+cl+dl;return lo>>>0};exports.sum64_4_lo=sum64_4_lo;function sum64_5_hi(ah,al,bh,bl,ch,cl,dh,dl,eh,el){var carry=0;var lo=al;lo=(lo+bl)>>>0;carry+=lo<al?1:0;lo=(lo+cl)>>>0;carry+=lo<cl?1:0;lo=(lo+dl)>>>0;carry+=lo<dl?1:0;lo=(lo+el)>>>0;carry+=lo<el?1:0;var hi=ah+bh+ch+dh+eh+carry;return hi>>>0};exports.sum64_5_hi=sum64_5_hi;function sum64_5_lo(ah,al,bh,bl,ch,cl,dh,dl,eh,el){var lo=al+bl+cl+dl+el;return lo>>>0};exports.sum64_5_lo=sum64_5_lo;function rotr64_hi(ah,al,num){var r=(al<<(32-num))|(ah>>>num);return r>>>0};exports.rotr64_hi=rotr64_hi;function rotr64_lo(ah,al,num){var r=(ah<<(32-num))|(al>>>num);return r>>>0};exports.rotr64_lo=rotr64_lo;function shr64_hi(ah,al,num){return ah>>>num};exports.shr64_hi=shr64_hi;function shr64_lo(ah,al,num){var r=(ah<<(32-num))|(al>>>num);return r>>>0};exports.shr64_lo=shr64_lo},{"inherits":32}],32:[function(require,module,exports){if(typeof Object.create==='function'){module.exports=function inherits(ctor,superCtor){ctor.super_=superCtor
    ctor.prototype=Object.create(superCtor.prototype,{constructor:{value:ctor,enumerable:!1,writable:!0,configurable:!0}})}}else{module.exports=function inherits(ctor,superCtor){ctor.super_=superCtor
    var TempCtor=function(){}
    TempCtor.prototype=superCtor.prototype
    ctor.prototype=new TempCtor()
    ctor.prototype.constructor=ctor}}},{}],33:[function(require,module,exports){module.exports={"name":"elliptic","version":"3.1.0","description":"EC cryptography","main":"lib/elliptic.js","scripts":{"test":"make lint && mocha --reporter=spec test/*-test.js"},"repository":{"type":"git","url":"git+ssh://git@github.com/indutny/elliptic.git"},"keywords":["EC","Elliptic","curve","Cryptography"],"author":{"name":"Fedor Indutny","email":"fedor@indutny.com"},"license":"MIT","bugs":{"url":"https://github.com/indutny/elliptic/issues"},"homepage":"https://github.com/indutny/elliptic","devDependencies":{"browserify":"^3.44.2","jscs":"^1.11.3","jshint":"^2.6.0","mocha":"^2.1.0","uglify-js":"^2.4.13"},"dependencies":{"bn.js":"^2.0.3","brorand":"^1.0.1","hash.js":"^1.0.0","inherits":"^2.0.1"},"gitHead":"d86cd2a8178f7e7cecbd6dd92eea084e2ab44c13","_id":"elliptic@3.1.0","_shasum":"c21682ef762769b56a74201609105da11d5f60cc","_from":"elliptic@^3.1.0","_npmVersion":"2.11.0","_nodeVersion":"2.2.1","_npmUser":{"name":"indutny","email":"fedor@indutny.com"},"maintainers":[{"name":"indutny","email":"fedor@indutny.com"}],"dist":{"shasum":"c21682ef762769b56a74201609105da11d5f60cc","tarball":"http://registry.npmjs.org/elliptic/-/elliptic-3.1.0.tgz"},"directories":{},"_resolved":"https://registry.npmjs.org/elliptic/-/elliptic-3.1.0.tgz","readme":"ERROR: No README data found!"}},{}],34:[function(require,module,exports){module.exports={"0000000000000000000000000000000000000001":"1","0000000000000000000000000000000000000002":"1","0000000000000000000000000000000000000003":"1","0000000000000000000000000000000000000004":"1","dbdbdb2cbd23b783741e8d7fcf51e459b497e4a6":"1606938044258990275541962092341162602522202993782792835301376","e6716f9544a56c530d868e4bfbacb172315bdead":"1606938044258990275541962092341162602522202993782792835301376","b9c015918bdaba24b4ff057a92a3873d6eb201be":"1606938044258990275541962092341162602522202993782792835301376","1a26338f0d905e295fccb71fa9ea849ffa12aaf4":"1606938044258990275541962092341162602522202993782792835301376","2ef47100e0787b915105fd5e3f4ff6752079d5cb":"1606938044258990275541962092341162602522202993782792835301376","cd2a3d9f938e13cd947ec05abc7fe734df8dd826":"1606938044258990275541962092341162602522202993782792835301376","6c386a4b26f73c802f34673f7248bb118f97424a":"1606938044258990275541962092341162602522202993782792835301376","e4157b34ea9615cfbde6b4fda419828124b70c78":"1606938044258990275541962092341162602522202993782792835301376"}},{}],35:[function(require,module,exports){module.exports={allotments:require('./genesis.json'),fees:require('./params.json')}},{"./genesis.json":34,"./params.json":36}],36:[function(require,module,exports){module.exports={"genesisGasLimit":{"v":3141592,"d":"Gas limit of the Genesis block."},"minGasLimit":{"v":125000,"d":"Minimum the gas limit may ever be."},"gasLimitBoundDivisor":{"v":1024,"d":"The bound divisor of the gas limit, used in update calculations."},"genesisDifficulty":{"v":131072,"d":"Difficulty of the Genesis block."},"minimumDifficulty":{"v":131072,"d":"The minimum that the difficulty may ever be."},"difficultyBoundDivisor":{"v":2048,"d":"The bound divisor of the difficulty, used in the update calculations."},"durationLimit":{"v":8,"d":"The decision boundary on the blocktime duration used to determine whether difficulty should go up or not."},"maximumExtraDataSize":{"v":1024,"d":"Maximum size extra data may be after Genesis."},"epochDuration":{"v":30000,"d":"Duration between proof-of-work epochs."},"stackLimit":{"v":1024,"d":"Maximum size of VM stack allowed."},"callCreateDepth":{"v":1024,"d":"Maximum depth of call/create stack."},"tierStepGas":{"v":[0,2,3,5,8,10,20],"d":"Once per operation, for a selection of them."},"expGas":{"v":10,"d":"Once per EXP instuction."},"expByteGas":{"v":10,"d":"Times ceil(log256(exponent)) for the EXP instruction."},"sha3Gas":{"v":30,"d":"Once per SHA3 operation."},"sha3WordGas":{"v":6,"d":"Once per word of the SHA3 operation's data."},"sloadGas":{"v":50,"d":"Once per SLOAD operation."},"sstoreSetGas":{"v":20000,"d":"Once per SSTORE operation if the zeroness changes from zero."},"sstoreResetGas":{"v":5000,"d":"Once per SSTORE operation if the zeroness does not change from zero."},"sstoreRefundGas":{"v":15000,"d":"Once per SSTORE operation if the zeroness changes to zero."},"jumpdestGas":{"v":1,"d":"Refunded gas, once per SSTORE operation if the zeroness changes to zero."},"logGas":{"v":375,"d":"Per LOG* operation."},"logDataGas":{"v":8,"d":"Per byte in a LOG* operation's data."},"logTopicGas":{"v":375,"d":"Multiplied by the * of the LOG*, per LOG transaction. e.g. LOG0 incurs 0 * c_txLogTopicGas, LOG4 incurs 4 * c_txLogTopicGas."},"createGas":{"v":32000,"d":"Once per CREATE operation & contract-creation transaction."},"callGas":{"v":40,"d":"Once per CALL operation & message call transaction."},"callStipend":{"v":2300,"d":"Free gas given at beginning of call."},"callValueTransferGas":{"v":9000,"d":"Paid for CALL when the value transfor is non-zero."},"callNewAccountGas":{"v":25000,"d":"Paid for CALL when the destination address didn't exist prior."},"suicideRefundGas":{"v":24000,"d":"Refunded following a suicide operation."},"memoryGas":{"v":3,"d":"Times the address of the (highest referenced byte in memory + 1). NOTE: referencing happens on read, write and in instructions such as RETURN and CALL."},"quadCoeffDiv":{"v":512,"d":"Divisor for the quadratic particle of the memory cost equation."},"createDataGas":{"v":200,"d":""},"txGas":{"v":21000,"d":"Per transaction. NOTE: Not payable on data of calls between transactions."},"txDataZeroGas":{"v":4,"d":"Per byte of data attached to a transaction that equals zero. NOTE: Not payable on data of calls between transactions."},"txDataNonZeroGas":{"v":68,"d":"Per byte of data attached to a transaction that is not equal to zero. NOTE: Not payable on data of calls between transactions."},"copyGas":{"v":3,"d":"Multiplied by the number of 32-byte words that are copied (round up) for any *COPY operation and added."},"ecrecoverGas":{"v":3000,"d":""},"sha256Gas":{"v":60,"d":""},"sha256WordGas":{"v":12,"d":""},"ripemd160Gas":{"v":600,"d":""},"ripemd160WordGas":{"v":120,"d":""},"identityGas":{"v":15,"d":""},"identityWordGas":{"v":3,"d":""},"minerReward":{"v":"1500000000000000000","d":"the amount a miner get rewarded for mining a block"},"uncleReward":{"v":"1406250000000000000","d":"The amount of wei a miner of an uncle block gets for being inculded in the blockchain"},"nephewReward":{"v":"46875000000000000","d":"the amount a miner gets for inculding a uncle"}}},{}],37:[function(require,module,exports){(function(Buffer){const SHA3=require('sha3')
    const ec=require('elliptic').ec('secp256k1')
    const assert=require('assert')
    const rlp=require('rlp')
    const BN=require('bn.js')
    exports.MAX_INTEGER=new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',16)
    exports.TWO_POW256=new BN('115792089237316195423570985008687907853269984665640564039457584007913129639936')
    exports.SHA3_NULL='c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
    exports.SHA3_RLP_ARRAY='1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347'
    exports.SHA3_RLP='56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421'
    exports.BN=BN
    exports.rlp=rlp
    exports.zeros=function(bytes){var buf=new Buffer(bytes)
        buf.fill(0)
        return buf}
    exports.pad=function(msg,length){msg=exports.toBuffer(msg)
        if(msg.length<length){var buf=exports.zeros(length)
            msg.copy(buf,length-msg.length)
            return buf}
        return msg.slice(-length)}
    exports.unpad=exports.stripZeros=function(a){a=exports.stripHexPrefix(a)
        var first=a[0]
        while(a.length>0&&first.toString()==='0'){a=a.slice(1)
            first=a[0]}
        return a}
    exports.toBuffer=function(v){if(!Buffer.isBuffer(v)){if(typeof v==='string'){v=new Buffer(padToEven(exports.stripHexPrefix(v)),'hex')}else if(typeof v==='number'){v=exports.intToBuffer(v)}else if(v===null||v===undefined){v=new Buffer([])}else if(v.toArray){v=new Buffer(v.toArray())}else{throw new Error('invalid type')}}
        return v}
    exports.intToHex=function(i){assert(i%1===0,'number is not a interger')
        assert(i>=0,'number must be positive')
        var hex=i.toString(16)
        if(hex.length%2){hex='0'+hex}
        return hex}
    exports.intToBuffer=function(i){var hex=exports.intToHex(i)
        return new Buffer(hex,'hex')}
    exports.bufferToInt=function(buf){buf=exports.toBuffer(buf)
        if(buf.length===0){return 0}
        return parseInt(buf.toString('hex'),16)}
    exports.fromSigned=function(num){if(num.length===32&&num[0]>=128){return new BN(num).sub(exports.TWO_POW256)}
        return new BN(num)}
    exports.toUnsigned=function(num){if(num.cmpn(0)===-1){return new Buffer(num.add(exports.TWO_POW256).toArray())}
        return new Buffer(num.toArray())}
    exports.sha3=function(a,bytes){a=exports.toBuffer(a)
        if(!bytes)bytes=256
        var h=new SHA3.SHA3Hash(bytes)
        if(a){h.update(a)}
        return new Buffer(h.digest('hex'),'hex')}
    exports.pubToAddress=exports.publicToAddress=function(pubKey){pubKey=exports.toBuffer(pubKey)
        var hash=new SHA3.SHA3Hash(256)
        hash.update(pubKey.slice(-64))
        return new Buffer(hash.digest('hex').slice(-40),'hex')}
    var privateToPublic=exports.privateToPublic=function(privateKey){privateKey=exports.toBuffer(privateKey)
        privateKey=new BN(privateKey)
        var key=ec.keyFromPrivate(privateKey).getPublic().toJSON()
        return new Buffer(key[0].toArray().concat(key[1].toArray()))}
    exports.privateToAddress=function(privateKey){return exports.publicToAddress(privateToPublic(privateKey))}
    exports.generateAddress=function(from,nonce){from=exports.toBuffer(from)
        nonce=new Buffer(new BN(nonce).toArray())
        if(nonce.toString('hex')==='00'){nonce=0}
        var hash=exports.sha3(rlp.encode([new Buffer(from,'hex'),nonce]))
        return hash.slice(12)}
    exports.isHexPrefixed=function(str){return str.slice(0,2)==='0x'}
    exports.stripHexPrefix=function(str){if(typeof str!=='string'){return str}
        return exports.isHexPrefixed(str)?str.slice(2):str}
    exports.addHexPrefix=function(str){if(typeof str!=='string'){return str}
        return exports.isHexPrefixed(str)?'0x'+str:str}
    exports.defineProperties=function(self,fields,data){self.raw=[]
        self._fields=[]
        self.toJSON=function(label){if(label){var obj={}
            for(var prop in this){if(typeof this[prop]!=='function'&&prop!=='raw'&&prop!=='_fields'){obj[prop]=this[prop].toString('hex')}}
            return obj}
            return exports.baToJSON(this.raw)}
        fields.forEach(function(field,i){self._fields.push(field.name)
            Object.defineProperty(self,field.name,{enumerable:!0,configurable:!0,get:function(){return this.raw[i]},set:function(v){v=exports.toBuffer(v)
                if(v.toString('hex')==='00'&&!field.allowZero){v=new Buffer([])}
                if(field.allowLess&&field.length){v=exports.stripZeros(v)
                    assert(field.length>=v.length)}else if(!(field.empty&&v.length===0)&&field.length){assert(field.length===v.length,'The field '+field.name+'must have byte length of '+field.length)}
                this.raw[i]=v}})
            if(field.default){self[field.name]=field.default}})
        if(data){if(typeof data==='string'){data=new Buffer(exports.stripHexPrefix(data),'hex')}
            if(Buffer.isBuffer(data)){data=rlp.decode(data)}
            if(Array.isArray(data)){if(data.length>self._fields.length){throw(new Error('wrong number of fields in data'))}
                data.forEach(function(d,i){self[self._fields[i]]=typeof d==='string'?new Buffer(d,'hex'):d})}else if(typeof data==='object'){for(var prop in data){if(self._fields.indexOf(prop)!==-1){self[prop]=data[prop]}}}else{throw new Error('invalid data')}}}
    exports.printBA=function(ba){if(Buffer.isBuffer(ba)){if(ba.length===0){console.log('new Buffer(0)')}else{console.log("new Buffer('"+ba.toString('hex')+"', 'hex')")}}else if(ba instanceof Array){console.log('[')
        for(var i=0;i<ba.length;i++){exports.printBA(ba[i])
            console.log(',')}
        console.log(']')}else{console.log(ba)}}
    exports.baToJSON=function(ba){if(Buffer.isBuffer(ba)){return ba.toString('hex')}else if(ba instanceof Array){var array=[]
        for(var i=0;i<ba.length;i++){array.push(exports.baToJSON(ba[i]))}
        return array}}
    function padToEven(a){if(a.length%2)a='0'+a
        return a}}).call(this,require("buffer").Buffer)},{"assert":109,"bn.js":38,"buffer":111,"elliptic":41,"rlp":66,"sha3":39}],38:[function(require,module,exports){(function(module,exports){'use strict';function assert(val,msg){if(!val)
    throw new Error(msg||'Assertion failed')}
    function inherits(ctor,superCtor){ctor.super_=superCtor;var TempCtor=function(){};TempCtor.prototype=superCtor.prototype;ctor.prototype=new TempCtor();ctor.prototype.constructor=ctor}
    function BN(number,base,endian){if(number!==null&&typeof number==='object'&&Array.isArray(number.words)){return number}
        this.sign=!1;this.words=null;this.length=0;this.red=null;if(base==='le'||base==='be'){endian=base;base=10}
        if(number!==null)
            this._init(number||0,base||10,endian||'be')}
    if(typeof module==='object')
        module.exports=BN;else exports.BN=BN;BN.BN=BN;BN.wordSize=26;BN.max=function max(left,right){if(left.cmp(right)>0)
        return left;else return right};BN.min=function min(left,right){if(left.cmp(right)<0)
        return left;else return right};BN.prototype._init=function init(number,base,endian){if(typeof number==='number'){return this._initNumber(number,base,endian)}else if(typeof number==='object'){return this._initArray(number,base,endian)}
        if(base==='hex')
            base=16;assert(base===(base|0)&&base>=2&&base<=36);number=number.toString().replace(/\s+/g,'');var start=0;if(number[0]==='-')
            start++;if(base===16)
            this._parseHex(number,start);else this._parseBase(number,base,start);if(number[0]==='-')
            this.sign=!0;this.strip();if(endian!=='le')
            return;this._initArray(this.toArray(),base,endian)};BN.prototype._initNumber=function _initNumber(number,base,endian){if(number<0){this.sign=!0;number=-number}
        if(number<0x4000000){this.words=[number&0x3ffffff];this.length=1}else if(number<0x10000000000000){this.words=[number&0x3ffffff,(number/0x4000000)&0x3ffffff];this.length=2}else{assert(number<0x20000000000000);this.words=[number&0x3ffffff,(number/0x4000000)&0x3ffffff,1];this.length=3}
        if(endian!=='le')
            return;this._initArray(this.toArray(),base,endian)};BN.prototype._initArray=function _initArray(number,base,endian){assert(typeof number.length==='number');if(number.length<=0){this.words=[0];this.length=1;return this}
        this.length=Math.ceil(number.length/3);this.words=new Array(this.length);for(var i=0;i<this.length;i++)
            this.words[i]=0;var off=0;if(endian==='be'){for(var i=number.length-1,j=0;i>=0;i-=3){var w=number[i]|(number[i-1]<<8)|(number[i-2]<<16);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]=(w>>>(26-off))&0x3ffffff;off+=24;if(off>=26){off-=26;j++}}}else if(endian==='le'){for(var i=0,j=0;i<number.length;i+=3){var w=number[i]|(number[i+1]<<8)|(number[i+2]<<16);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]=(w>>>(26-off))&0x3ffffff;off+=24;if(off>=26){off-=26;j++}}}
        return this.strip()};function parseHex(str,start,end){var r=0;var len=Math.min(str.length,end);for(var i=start;i<len;i++){var c=str.charCodeAt(i)-48;r<<=4;if(c>=49&&c<=54)
        r|=c-49+0xa;else if(c>=17&&c<=22)
        r|=c-17+0xa;else r|=c&0xf}
        return r}
    BN.prototype._parseHex=function _parseHex(number,start){this.length=Math.ceil((number.length-start)/6);this.words=new Array(this.length);for(var i=0;i<this.length;i++)
        this.words[i]=0;var off=0;for(var i=number.length-6,j=0;i>=start;i-=6){var w=parseHex(number,i,i+6);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]|=w>>>(26-off)&0x3fffff;off+=24;if(off>=26){off-=26;j++}}
        if(i+6!==start){var w=parseHex(number,start,i+6);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]|=w>>>(26-off)&0x3fffff}
        this.strip()};function parseBase(str,start,end,mul){var r=0;var len=Math.min(str.length,end);for(var i=start;i<len;i++){var c=str.charCodeAt(i)-48;r*=mul;if(c>=49)
        r+=c-49+0xa;else if(c>=17)
        r+=c-17+0xa;else r+=c}
        return r}
    BN.prototype._parseBase=function _parseBase(number,base,start){this.words=[0];this.length=1;for(var limbLen=0,limbPow=1;limbPow<=0x3ffffff;limbPow*=base)
        limbLen++;limbLen--;limbPow=(limbPow/base)|0;var total=number.length-start;var mod=total%limbLen;var end=Math.min(total,total-mod)+start;var word=0;for(var i=start;i<end;i+=limbLen){word=parseBase(number,i,i+limbLen,base);this.imuln(limbPow);if(this.words[0]+word<0x4000000)
        this.words[0]+=word;else this._iaddn(word)}
        if(mod!==0){var pow=1;var word=parseBase(number,i,number.length,base);for(var i=0;i<mod;i++)
            pow*=base;this.imuln(pow);if(this.words[0]+word<0x4000000)
            this.words[0]+=word;else this._iaddn(word)}};BN.prototype.copy=function copy(dest){dest.words=new Array(this.length);for(var i=0;i<this.length;i++)
        dest.words[i]=this.words[i];dest.length=this.length;dest.sign=this.sign;dest.red=this.red};BN.prototype.clone=function clone(){var r=new BN(null);this.copy(r);return r};BN.prototype.strip=function strip(){while(this.length>1&&this.words[this.length-1]===0)
        this.length--;return this._normSign()};BN.prototype._normSign=function _normSign(){if(this.length===1&&this.words[0]===0)
        this.sign=!1;return this};BN.prototype.inspect=function inspect(){return(this.red?'<BN-R: ':'<BN: ')+this.toString(16)+'>'};var zeros=['','0','00','000','0000','00000','000000','0000000','00000000','000000000','0000000000','00000000000','000000000000','0000000000000','00000000000000','000000000000000','0000000000000000','00000000000000000','000000000000000000','0000000000000000000','00000000000000000000','000000000000000000000','0000000000000000000000','00000000000000000000000','000000000000000000000000','0000000000000000000000000'];var groupSizes=[0,0,25,16,12,11,10,9,8,8,7,7,7,7,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5];var groupBases=[0,0,33554432,43046721,16777216,48828125,60466176,40353607,16777216,43046721,10000000,19487171,35831808,62748517,7529536,11390625,16777216,24137569,34012224,47045881,64000000,4084101,5153632,6436343,7962624,9765625,11881376,14348907,17210368,20511149,24300000,28629151,33554432,39135393,45435424,52521875,60466176];BN.prototype.toString=function toString(base,padding){base=base||10;var padding=padding|0||1;if(base===16||base==='hex'){var out='';var off=0;var carry=0;for(var i=0;i<this.length;i++){var w=this.words[i];var word=(((w<<off)|carry)&0xffffff).toString(16);carry=(w>>>(24-off))&0xffffff;if(carry!==0||i!==this.length-1)
        out=zeros[6-word.length]+word+out;else out=word+out;off+=2;if(off>=26){off-=26;i--}}
        if(carry!==0)
            out=carry.toString(16)+out;while(out.length%padding!==0)
            out='0'+out;if(this.sign)
            out='-'+out;return out}else if(base===(base|0)&&base>=2&&base<=36){var groupSize=groupSizes[base];var groupBase=groupBases[base];var out='';var c=this.clone();c.sign=!1;while(c.cmpn(0)!==0){var r=c.modn(groupBase).toString(base);c=c.idivn(groupBase);if(c.cmpn(0)!==0)
        out=zeros[groupSize-r.length]+r+out;else out=r+out}
        if(this.cmpn(0)===0)
            out='0'+out;while(out.length%padding!==0)
            out='0'+out;if(this.sign)
            out='-'+out;return out}else{assert(!1,'Base should be between 2 and 36')}};BN.prototype.toJSON=function toJSON(){return this.toString(16)};BN.prototype.toArray=function toArray(endian,length){this.strip();var littleEndian=endian==='le';var res=new Array(this.byteLength());res[0]=0;var q=this.clone();if(!littleEndian){for(var i=0;q.cmpn(0)!==0;i++){var b=q.andln(0xff);q.iushrn(8);res[res.length-i-1]=b}}else{for(var i=0;q.cmpn(0)!==0;i++){var b=q.andln(0xff);q.iushrn(8);res[i]=b}}
        if(length){assert(res.length<=length,'byte array longer than desired length');while(res.length<length){if(littleEndian)
            res.push(0);else res.unshift(0)}}
        return res};if(Math.clz32){BN.prototype._countBits=function _countBits(w){return 32-Math.clz32(w)}}else{BN.prototype._countBits=function _countBits(w){var t=w;var r=0;if(t>=0x1000){r+=13;t>>>=13}
        if(t>=0x40){r+=7;t>>>=7}
        if(t>=0x8){r+=4;t>>>=4}
        if(t>=0x02){r+=2;t>>>=2}
        return r+t}}
    BN.prototype._zeroBits=function _zeroBits(w){if(w===0)
        return 26;var t=w;var r=0;if((t&0x1fff)===0){r+=13;t>>>=13}
        if((t&0x7f)===0){r+=7;t>>>=7}
        if((t&0xf)===0){r+=4;t>>>=4}
        if((t&0x3)===0){r+=2;t>>>=2}
        if((t&0x1)===0)
            r++;return r};BN.prototype.bitLength=function bitLength(){var hi=0;var w=this.words[this.length-1];var hi=this._countBits(w);return(this.length-1)*26+hi};BN.prototype.zeroBits=function zeroBits(){if(this.cmpn(0)===0)
        return 0;var r=0;for(var i=0;i<this.length;i++){var b=this._zeroBits(this.words[i]);r+=b;if(b!==26)
        break}
        return r};BN.prototype.byteLength=function byteLength(){return Math.ceil(this.bitLength()/8)};BN.prototype.neg=function neg(){if(this.cmpn(0)===0)
        return this.clone();var r=this.clone();r.sign=!this.sign;return r};BN.prototype.iuor=function iuor(num){while(this.length<num.length)
        this.words[this.length++]=0;for(var i=0;i<num.length;i++)
        this.words[i]=this.words[i]|num.words[i];return this.strip()};BN.prototype.ior=function ior(num){assert(!this.sign&&!num.sign);return this.iuor(num)};BN.prototype.or=function or(num){if(this.length>num.length)
        return this.clone().ior(num);else return num.clone().ior(this)};BN.prototype.uor=function uor(num){if(this.length>num.length)
        return this.clone().iuor(num);else return num.clone().iuor(this)};BN.prototype.iuand=function iuand(num){var b;if(this.length>num.length)
        b=num;else b=this;for(var i=0;i<b.length;i++)
        this.words[i]=this.words[i]&num.words[i];this.length=b.length;return this.strip()};BN.prototype.iand=function iand(num){assert(!this.sign&&!num.sign);return this.iuand(num)};BN.prototype.and=function and(num){if(this.length>num.length)
        return this.clone().iand(num);else return num.clone().iand(this)};BN.prototype.uand=function uand(num){if(this.length>num.length)
        return this.clone().iuand(num);else return num.clone().iuand(this)};BN.prototype.iuxor=function iuxor(num){var a;var b;if(this.length>num.length){a=this;b=num}else{a=num;b=this}
        for(var i=0;i<b.length;i++)
            this.words[i]=a.words[i]^b.words[i];if(this!==a)
            for(;i<a.length;i++)
                this.words[i]=a.words[i];this.length=a.length;return this.strip()};BN.prototype.ixor=function ixor(num){assert(!this.sign&&!num.sign);return this.iuxor(num)};BN.prototype.xor=function xor(num){if(this.length>num.length)
        return this.clone().ixor(num);else return num.clone().ixor(this)};BN.prototype.uxor=function uxor(num){if(this.length>num.length)
        return this.clone().iuxor(num);else return num.clone().iuxor(this)};BN.prototype.setn=function setn(bit,val){assert(typeof bit==='number'&&bit>=0);var off=(bit/26)|0;var wbit=bit%26;while(this.length<=off)
        this.words[this.length++]=0;if(val)
        this.words[off]=this.words[off]|(1<<wbit);else this.words[off]=this.words[off]&~(1<<wbit);return this.strip()};BN.prototype.iadd=function iadd(num){if(this.sign&&!num.sign){this.sign=!1;var r=this.isub(num);this.sign=!this.sign;return this._normSign()}else if(!this.sign&&num.sign){num.sign=!1;var r=this.isub(num);num.sign=!0;return r._normSign()}
        var a;var b;if(this.length>num.length){a=this;b=num}else{a=num;b=this}
        var carry=0;for(var i=0;i<b.length;i++){var r=a.words[i]+b.words[i]+carry;this.words[i]=r&0x3ffffff;carry=r>>>26}
        for(;carry!==0&&i<a.length;i++){var r=a.words[i]+carry;this.words[i]=r&0x3ffffff;carry=r>>>26}
        this.length=a.length;if(carry!==0){this.words[this.length]=carry;this.length++}else if(a!==this){for(;i<a.length;i++)
            this.words[i]=a.words[i]}
        return this};BN.prototype.add=function add(num){if(num.sign&&!this.sign){num.sign=!1;var res=this.sub(num);num.sign=!0;return res}else if(!num.sign&&this.sign){this.sign=!1;var res=num.sub(this);this.sign=!0;return res}
        if(this.length>num.length)
            return this.clone().iadd(num);else return num.clone().iadd(this)};BN.prototype.isub=function isub(num){if(num.sign){num.sign=!1;var r=this.iadd(num);num.sign=!0;return r._normSign()}else if(this.sign){this.sign=!1;this.iadd(num);this.sign=!0;return this._normSign()}
        var cmp=this.cmp(num);if(cmp===0){this.sign=!1;this.length=1;this.words[0]=0;return this}
        var a;var b;if(cmp>0){a=this;b=num}else{a=num;b=this}
        var carry=0;for(var i=0;i<b.length;i++){var r=a.words[i]-b.words[i]+carry;carry=r>>26;this.words[i]=r&0x3ffffff}
        for(;carry!==0&&i<a.length;i++){var r=a.words[i]+carry;carry=r>>26;this.words[i]=r&0x3ffffff}
        if(carry===0&&i<a.length&&a!==this)
            for(;i<a.length;i++)
                this.words[i]=a.words[i];this.length=Math.max(this.length,i);if(a!==this)
            this.sign=!0;return this.strip()};BN.prototype.sub=function sub(num){return this.clone().isub(num)};BN.prototype._smallMulTo=function _smallMulTo(num,out){out.sign=num.sign!==this.sign;out.length=this.length+num.length;var carry=0;for(var k=0;k<out.length-1;k++){var ncarry=carry>>>26;var rword=carry&0x3ffffff;var maxJ=Math.min(k,num.length-1);for(var j=Math.max(0,k-this.length+1);j<=maxJ;j++){var i=k-j;var a=this.words[i]|0;var b=num.words[j]|0;var r=a*b;var lo=r&0x3ffffff;ncarry=(ncarry+((r/0x4000000)|0))|0;lo=(lo+rword)|0;rword=lo&0x3ffffff;ncarry=(ncarry+(lo>>>26))|0}
        out.words[k]=rword;carry=ncarry}
        if(carry!==0){out.words[k]=carry}else{out.length--}
        return out.strip()};BN.prototype._bigMulTo=function _bigMulTo(num,out){out.sign=num.sign!==this.sign;out.length=this.length+num.length;var carry=0;var hncarry=0;for(var k=0;k<out.length-1;k++){var ncarry=hncarry;hncarry=0;var rword=carry&0x3ffffff;var maxJ=Math.min(k,num.length-1);for(var j=Math.max(0,k-this.length+1);j<=maxJ;j++){var i=k-j;var a=this.words[i]|0;var b=num.words[j]|0;var r=a*b;var lo=r&0x3ffffff;ncarry=(ncarry+((r/0x4000000)|0))|0;lo=(lo+rword)|0;rword=lo&0x3ffffff;ncarry=(ncarry+(lo>>>26))|0;hncarry+=ncarry>>>26;ncarry&=0x3ffffff}
        out.words[k]=rword;carry=ncarry;ncarry=hncarry}
        if(carry!==0){out.words[k]=carry}else{out.length--}
        return out.strip()};BN.prototype.mulTo=function mulTo(num,out){var res;if(this.length+num.length<63)
        res=this._smallMulTo(num,out);else res=this._bigMulTo(num,out);return res};BN.prototype.mul=function mul(num){var out=new BN(null);out.words=new Array(this.length+num.length);return this.mulTo(num,out)};BN.prototype.imul=function imul(num){if(this.cmpn(0)===0||num.cmpn(0)===0){this.words[0]=0;this.length=1;return this}
        var tlen=this.length;var nlen=num.length;this.sign=num.sign!==this.sign;this.length=this.length+num.length;this.words[this.length-1]=0;for(var k=this.length-2;k>=0;k--){var carry=0;var rword=0;var maxJ=Math.min(k,nlen-1);for(var j=Math.max(0,k-tlen+1);j<=maxJ;j++){var i=k-j;var a=this.words[i];var b=num.words[j];var r=a*b;var lo=r&0x3ffffff;carry+=(r/0x4000000)|0;lo+=rword;rword=lo&0x3ffffff;carry+=lo>>>26}
            this.words[k]=rword;this.words[k+1]+=carry;carry=0}
        var carry=0;for(var i=1;i<this.length;i++){var w=this.words[i]+carry;this.words[i]=w&0x3ffffff;carry=w>>>26}
        return this.strip()};BN.prototype.imuln=function imuln(num){assert(typeof num==='number');var carry=0;for(var i=0;i<this.length;i++){var w=this.words[i]*num;var lo=(w&0x3ffffff)+(carry&0x3ffffff);carry>>=26;carry+=(w/0x4000000)|0;carry+=lo>>>26;this.words[i]=lo&0x3ffffff}
        if(carry!==0){this.words[i]=carry;this.length++}
        return this};BN.prototype.muln=function muln(num){return this.clone().imuln(num)};BN.prototype.sqr=function sqr(){return this.mul(this)};BN.prototype.isqr=function isqr(){return this.mul(this)};BN.prototype.iushln=function iushln(bits){assert(typeof bits==='number'&&bits>=0);var r=bits%26;var s=(bits-r)/26;var carryMask=(0x3ffffff>>>(26-r))<<(26-r);if(r!==0){var carry=0;for(var i=0;i<this.length;i++){var newCarry=this.words[i]&carryMask;var c=(this.words[i]-newCarry)<<r;this.words[i]=c|carry;carry=newCarry>>>(26-r)}
        if(carry){this.words[i]=carry;this.length++}}
        if(s!==0){for(var i=this.length-1;i>=0;i--)
            this.words[i+s]=this.words[i];for(var i=0;i<s;i++)
            this.words[i]=0;this.length+=s}
        return this.strip()};BN.prototype.ishln=function ishln(bits){assert(!this.sign);return this.iushln(bits)};BN.prototype.iushrn=function iushrn(bits,hint,extended){assert(typeof bits==='number'&&bits>=0);var h;if(hint)
        h=(hint-(hint%26))/26;else h=0;var r=bits%26;var s=Math.min((bits-r)/26,this.length);var mask=0x3ffffff^((0x3ffffff>>>r)<<r);var maskedWords=extended;h-=s;h=Math.max(0,h);if(maskedWords){for(var i=0;i<s;i++)
        maskedWords.words[i]=this.words[i];maskedWords.length=s}
        if(s===0){}else if(this.length>s){this.length-=s;for(var i=0;i<this.length;i++)
            this.words[i]=this.words[i+s]}else{this.words[0]=0;this.length=1}
        var carry=0;for(var i=this.length-1;i>=0&&(carry!==0||i>=h);i--){var word=this.words[i];this.words[i]=(carry<<(26-r))|(word>>>r);carry=word&mask}
        if(maskedWords&&carry!==0)
            maskedWords.words[maskedWords.length++]=carry;if(this.length===0){this.words[0]=0;this.length=1}
        this.strip();return this};BN.prototype.ishrn=function ishrn(bits,hint,extended){assert(!this.sign);return this.iushrn(bits,hint,extended)};BN.prototype.shln=function shln(bits){return this.clone().ishln(bits)};BN.prototype.ushln=function ushln(bits){return this.clone().iushln(bits)};BN.prototype.shrn=function shrn(bits){return this.clone().ishrn(bits)};BN.prototype.ushrn=function ushrn(bits){return this.clone().iushrn(bits)};BN.prototype.testn=function testn(bit){assert(typeof bit==='number'&&bit>=0);var r=bit%26;var s=(bit-r)/26;var q=1<<r;if(this.length<=s){return!1}
        var w=this.words[s];return!!(w&q)};BN.prototype.imaskn=function imaskn(bits){assert(typeof bits==='number'&&bits>=0);var r=bits%26;var s=(bits-r)/26;assert(!this.sign,'imaskn works only with positive numbers');if(r!==0)
        s++;this.length=Math.min(s,this.length);if(r!==0){var mask=0x3ffffff^((0x3ffffff>>>r)<<r);this.words[this.length-1]&=mask}
        return this.strip()};BN.prototype.maskn=function maskn(bits){return this.clone().imaskn(bits)};BN.prototype.iaddn=function iaddn(num){assert(typeof num==='number');if(num<0)
        return this.isubn(-num);if(this.sign){if(this.length===1&&this.words[0]<num){this.words[0]=num-this.words[0];this.sign=!1;return this}
        this.sign=!1;this.isubn(num);this.sign=!0;return this}
        return this._iaddn(num)};BN.prototype._iaddn=function _iaddn(num){this.words[0]+=num;for(var i=0;i<this.length&&this.words[i]>=0x4000000;i++){this.words[i]-=0x4000000;if(i===this.length-1)
        this.words[i+1]=1;else this.words[i+1]++}
        this.length=Math.max(this.length,i+1);return this};BN.prototype.isubn=function isubn(num){assert(typeof num==='number');if(num<0)
        return this.iaddn(-num);if(this.sign){this.sign=!1;this.iaddn(num);this.sign=!0;return this}
        this.words[0]-=num;for(var i=0;i<this.length&&this.words[i]<0;i++){this.words[i]+=0x4000000;this.words[i+1]-=1}
        return this.strip()};BN.prototype.addn=function addn(num){return this.clone().iaddn(num)};BN.prototype.subn=function subn(num){return this.clone().isubn(num)};BN.prototype.iabs=function iabs(){this.sign=!1;return this};BN.prototype.abs=function abs(){return this.clone().iabs()};BN.prototype._ishlnsubmul=function _ishlnsubmul(num,mul,shift){var len=num.length+shift;var i;if(this.words.length<len){var t=new Array(len);for(var i=0;i<this.length;i++)
        t[i]=this.words[i];this.words=t}else{i=this.length}
        this.length=Math.max(this.length,len);for(;i<this.length;i++)
            this.words[i]=0;var carry=0;for(var i=0;i<num.length;i++){var w=this.words[i+shift]+carry;var right=num.words[i]*mul;w-=right&0x3ffffff;carry=(w>>26)-((right/0x4000000)|0);this.words[i+shift]=w&0x3ffffff}
        for(;i<this.length-shift;i++){var w=this.words[i+shift]+carry;carry=w>>26;this.words[i+shift]=w&0x3ffffff}
        if(carry===0)
            return this.strip();assert(carry===-1);carry=0;for(var i=0;i<this.length;i++){var w=-this.words[i]+carry;carry=w>>26;this.words[i]=w&0x3ffffff}
        this.sign=!0;return this.strip()};BN.prototype._wordDiv=function _wordDiv(num,mode){var shift=this.length-num.length;var a=this.clone();var b=num;var bhi=b.words[b.length-1];var bhiBits=this._countBits(bhi);shift=26-bhiBits;if(shift!==0){b=b.ushln(shift);a.iushln(shift);bhi=b.words[b.length-1]}
        var m=a.length-b.length;var q;if(mode!=='mod'){q=new BN(null);q.length=m+1;q.words=new Array(q.length);for(var i=0;i<q.length;i++)
            q.words[i]=0}
        var diff=a.clone()._ishlnsubmul(b,1,m);if(!diff.sign){a=diff;if(q)
            q.words[m]=1}
        for(var j=m-1;j>=0;j--){var qj=a.words[b.length+j]*0x4000000+a.words[b.length+j-1];qj=Math.min((qj/bhi)|0,0x3ffffff);a._ishlnsubmul(b,qj,j);while(a.sign){qj--;a.sign=!1;a._ishlnsubmul(b,1,j);if(a.cmpn(0)!==0)
            a.sign=!a.sign}
            if(q)
                q.words[j]=qj}
        if(q)
            q.strip();a.strip();if(mode!=='div'&&shift!==0)
            a.iushrn(shift);return{div:q?q:null,mod:a}};BN.prototype.divmod=function divmod(num,mode,positive){assert(num.cmpn(0)!==0);if(this.sign&&!num.sign){var res=this.neg().divmod(num,mode);var div;var mod;if(mode!=='mod')
        div=res.div.neg();if(mode!=='div'){mod=res.mod.neg();if(positive&&mod.neg)
        mod=mod.add(num)}
        return{div:div,mod:mod}}else if(!this.sign&&num.sign){var res=this.divmod(num.neg(),mode);var div;if(mode!=='mod')
        div=res.div.neg();return{div:div,mod:res.mod}}else if(this.sign&&num.sign){var res=this.neg().divmod(num.neg(),mode);var mod;if(mode!=='div'){mod=res.mod.neg();if(positive&&mod.neg)
        mod=mod.isub(num)}
        return{div:res.div,mod:mod}}
        if(num.length>this.length||this.cmp(num)<0)
            return{div:new BN(0),mod:this};if(num.length===1){if(mode==='div')
            return{div:this.divn(num.words[0]),mod:null};else if(mode==='mod')
            return{div:null,mod:new BN(this.modn(num.words[0]))};return{div:this.divn(num.words[0]),mod:new BN(this.modn(num.words[0]))}}
        return this._wordDiv(num,mode)};BN.prototype.div=function div(num){return this.divmod(num,'div',!1).div};BN.prototype.mod=function mod(num){return this.divmod(num,'mod',!1).mod};BN.prototype.umod=function umod(num){return this.divmod(num,'mod',!0).mod};BN.prototype.divRound=function divRound(num){var dm=this.divmod(num);if(dm.mod.cmpn(0)===0)
        return dm.div;var mod=dm.div.sign?dm.mod.isub(num):dm.mod;var half=num.ushrn(1);var r2=num.andln(1);var cmp=mod.cmp(half);if(cmp<0||r2===1&&cmp===0)
        return dm.div;return dm.div.sign?dm.div.isubn(1):dm.div.iaddn(1)};BN.prototype.modn=function modn(num){assert(num<=0x3ffffff);var p=(1<<26)%num;var acc=0;for(var i=this.length-1;i>=0;i--)
        acc=(p*acc+this.words[i])%num;return acc};BN.prototype.idivn=function idivn(num){assert(num<=0x3ffffff);var carry=0;for(var i=this.length-1;i>=0;i--){var w=this.words[i]+carry*0x4000000;this.words[i]=(w/num)|0;carry=w%num}
        return this.strip()};BN.prototype.divn=function divn(num){return this.clone().idivn(num)};BN.prototype.egcd=function egcd(p){assert(!p.sign);assert(p.cmpn(0)!==0);var x=this;var y=p.clone();if(x.sign)
        x=x.umod(p);else x=x.clone();var A=new BN(1);var B=new BN(0);var C=new BN(0);var D=new BN(1);var g=0;while(x.isEven()&&y.isEven()){x.iushrn(1);y.iushrn(1);++g}
        var yp=y.clone();var xp=x.clone();while(x.cmpn(0)!==0){while(x.isEven()){x.iushrn(1);if(A.isEven()&&B.isEven()){A.iushrn(1);B.iushrn(1)}else{A.iadd(yp).iushrn(1);B.isub(xp).iushrn(1)}}
            while(y.isEven()){y.iushrn(1);if(C.isEven()&&D.isEven()){C.iushrn(1);D.iushrn(1)}else{C.iadd(yp).iushrn(1);D.isub(xp).iushrn(1)}}
            if(x.cmp(y)>=0){x.isub(y);A.isub(C);B.isub(D)}else{y.isub(x);C.isub(A);D.isub(B)}}
        return{a:C,b:D,gcd:y.iushln(g)}};BN.prototype._invmp=function _invmp(p){assert(!p.sign);assert(p.cmpn(0)!==0);var a=this;var b=p.clone();if(a.sign)
        a=a.umod(p);else a=a.clone();var x1=new BN(1);var x2=new BN(0);var delta=b.clone();while(a.cmpn(1)>0&&b.cmpn(1)>0){while(a.isEven()){a.iushrn(1);if(x1.isEven())
        x1.iushrn(1);else x1.iadd(delta).iushrn(1)}
        while(b.isEven()){b.iushrn(1);if(x2.isEven())
            x2.iushrn(1);else x2.iadd(delta).iushrn(1)}
        if(a.cmp(b)>=0){a.isub(b);x1.isub(x2)}else{b.isub(a);x2.isub(x1)}}
        var res;if(a.cmpn(1)===0)
            res=x1;else res=x2;if(res.cmpn(0)<0)
            res.iadd(p);return res};BN.prototype.gcd=function gcd(num){if(this.cmpn(0)===0)
        return num.clone();if(num.cmpn(0)===0)
        return this.clone();var a=this.clone();var b=num.clone();a.sign=!1;b.sign=!1;for(var shift=0;a.isEven()&&b.isEven();shift++){a.iushrn(1);b.iushrn(1)}
        do{while(a.isEven())
            a.iushrn(1);while(b.isEven())
            b.iushrn(1);var r=a.cmp(b);if(r<0){var t=a;a=b;b=t}else if(r===0||b.cmpn(1)===0){break}
            a.isub(b)}while(!0);return b.iushln(shift)};BN.prototype.invm=function invm(num){return this.egcd(num).a.umod(num)};BN.prototype.isEven=function isEven(){return(this.words[0]&1)===0};BN.prototype.isOdd=function isOdd(){return(this.words[0]&1)===1};BN.prototype.andln=function andln(num){return this.words[0]&num};BN.prototype.bincn=function bincn(bit){assert(typeof bit==='number');var r=bit%26;var s=(bit-r)/26;var q=1<<r;if(this.length<=s){for(var i=this.length;i<s+1;i++)
        this.words[i]=0;this.words[s]|=q;this.length=s+1;return this}
        var carry=q;for(var i=s;carry!==0&&i<this.length;i++){var w=this.words[i];w+=carry;carry=w>>>26;w&=0x3ffffff;this.words[i]=w}
        if(carry!==0){this.words[i]=carry;this.length++}
        return this};BN.prototype.cmpn=function cmpn(num){var sign=num<0;if(sign)
        num=-num;if(this.sign&&!sign)
        return-1;else if(!this.sign&&sign)
        return 1;num&=0x3ffffff;this.strip();var res;if(this.length>1){res=1}else{var w=this.words[0];res=w===num?0:w<num?-1:1}
        if(this.sign)
            res=-res;return res};BN.prototype.cmp=function cmp(num){if(this.sign&&!num.sign)
        return-1;else if(!this.sign&&num.sign)
        return 1;var res=this.ucmp(num);if(this.sign)
        return-res;else return res};BN.prototype.ucmp=function ucmp(num){if(this.length>num.length)
        return 1;else if(this.length<num.length)
        return-1;var res=0;for(var i=this.length-1;i>=0;i--){var a=this.words[i];var b=num.words[i];if(a===b)
        continue;if(a<b)
        res=-1;else if(a>b)
        res=1;break}
        return res};BN.red=function red(num){return new Red(num)};BN.prototype.toRed=function toRed(ctx){assert(!this.red,'Already a number in reduction context');assert(!this.sign,'red works only with positives');return ctx.convertTo(this)._forceRed(ctx)};BN.prototype.fromRed=function fromRed(){assert(this.red,'fromRed works only with numbers in reduction context');return this.red.convertFrom(this)};BN.prototype._forceRed=function _forceRed(ctx){this.red=ctx;return this};BN.prototype.forceRed=function forceRed(ctx){assert(!this.red,'Already a number in reduction context');return this._forceRed(ctx)};BN.prototype.redAdd=function redAdd(num){assert(this.red,'redAdd works only with red numbers');return this.red.add(this,num)};BN.prototype.redIAdd=function redIAdd(num){assert(this.red,'redIAdd works only with red numbers');return this.red.iadd(this,num)};BN.prototype.redSub=function redSub(num){assert(this.red,'redSub works only with red numbers');return this.red.sub(this,num)};BN.prototype.redISub=function redISub(num){assert(this.red,'redISub works only with red numbers');return this.red.isub(this,num)};BN.prototype.redShl=function redShl(num){assert(this.red,'redShl works only with red numbers');return this.red.ushl(this,num)};BN.prototype.redMul=function redMul(num){assert(this.red,'redMul works only with red numbers');this.red._verify2(this,num);return this.red.mul(this,num)};BN.prototype.redIMul=function redIMul(num){assert(this.red,'redMul works only with red numbers');this.red._verify2(this,num);return this.red.imul(this,num)};BN.prototype.redSqr=function redSqr(){assert(this.red,'redSqr works only with red numbers');this.red._verify1(this);return this.red.sqr(this)};BN.prototype.redISqr=function redISqr(){assert(this.red,'redISqr works only with red numbers');this.red._verify1(this);return this.red.isqr(this)};BN.prototype.redSqrt=function redSqrt(){assert(this.red,'redSqrt works only with red numbers');this.red._verify1(this);return this.red.sqrt(this)};BN.prototype.redInvm=function redInvm(){assert(this.red,'redInvm works only with red numbers');this.red._verify1(this);return this.red.invm(this)};BN.prototype.redNeg=function redNeg(){assert(this.red,'redNeg works only with red numbers');this.red._verify1(this);return this.red.neg(this)};BN.prototype.redPow=function redPow(num){assert(this.red&&!num.red,'redPow(normalNum)');this.red._verify1(this);return this.red.pow(this,num)};var primes={k256:null,p224:null,p192:null,p25519:null};function MPrime(name,p){this.name=name;this.p=new BN(p,16);this.n=this.p.bitLength();this.k=new BN(1).iushln(this.n).isub(this.p);this.tmp=this._tmp()}
    MPrime.prototype._tmp=function _tmp(){var tmp=new BN(null);tmp.words=new Array(Math.ceil(this.n/13));return tmp};MPrime.prototype.ireduce=function ireduce(num){var r=num;var rlen;do{this.split(r,this.tmp);r=this.imulK(r);r=r.iadd(this.tmp);rlen=r.bitLength()}while(rlen>this.n);var cmp=rlen<this.n?-1:r.ucmp(this.p);if(cmp===0){r.words[0]=0;r.length=1}else if(cmp>0){r.isub(this.p)}else{r.strip()}
        return r};MPrime.prototype.split=function split(input,out){input.iushrn(this.n,0,out)};MPrime.prototype.imulK=function imulK(num){return num.imul(this.k)};function K256(){MPrime.call(this,'k256','ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f')}
    inherits(K256,MPrime);K256.prototype.split=function split(input,output){var mask=0x3fffff;var outLen=Math.min(input.length,9);for(var i=0;i<outLen;i++)
        output.words[i]=input.words[i];output.length=outLen;if(input.length<=9){input.words[0]=0;input.length=1;return}
        var prev=input.words[9];output.words[output.length++]=prev&mask;for(var i=10;i<input.length;i++){var next=input.words[i];input.words[i-10]=((next&mask)<<4)|(prev>>>22);prev=next}
        input.words[i-10]=prev>>>22;input.length-=9};K256.prototype.imulK=function imulK(num){num.words[num.length]=0;num.words[num.length+1]=0;num.length+=2;var hi;var lo=0;for(var i=0;i<num.length;i++){var w=num.words[i];hi=w*0x40;lo+=w*0x3d1;hi+=(lo/0x4000000)|0;lo&=0x3ffffff;num.words[i]=lo;lo=hi}
        if(num.words[num.length-1]===0){num.length--;if(num.words[num.length-1]===0)
            num.length--}
        return num};function P224(){MPrime.call(this,'p224','ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001')}
    inherits(P224,MPrime);function P192(){MPrime.call(this,'p192','ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff')}
    inherits(P192,MPrime);function P25519(){MPrime.call(this,'25519','7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed')}
    inherits(P25519,MPrime);P25519.prototype.imulK=function imulK(num){var carry=0;for(var i=0;i<num.length;i++){var hi=num.words[i]*0x13+carry;var lo=hi&0x3ffffff;hi>>>=26;num.words[i]=lo;carry=hi}
        if(carry!==0)
            num.words[num.length++]=carry;return num};BN._prime=function prime(name){if(primes[name])
        return primes[name];var prime;if(name==='k256')
        prime=new K256();else if(name==='p224')
        prime=new P224();else if(name==='p192')
        prime=new P192();else if(name==='p25519')
        prime=new P25519();else throw new Error('Unknown prime '+name);primes[name]=prime;return prime};function Red(m){if(typeof m==='string'){var prime=BN._prime(m);this.m=prime.p;this.prime=prime}else{this.m=m;this.prime=null}}
    Red.prototype._verify1=function _verify1(a){assert(!a.sign,'red works only with positives');assert(a.red,'red works only with red numbers')};Red.prototype._verify2=function _verify2(a,b){assert(!a.sign&&!b.sign,'red works only with positives');assert(a.red&&a.red===b.red,'red works only with red numbers')};Red.prototype.imod=function imod(a){if(this.prime)
        return this.prime.ireduce(a)._forceRed(this);return a.umod(this.m)._forceRed(this)};Red.prototype.neg=function neg(a){var r=a.clone();r.sign=!r.sign;return r.iadd(this.m)._forceRed(this)};Red.prototype.add=function add(a,b){this._verify2(a,b);var res=a.add(b);if(res.cmp(this.m)>=0)
        res.isub(this.m);return res._forceRed(this)};Red.prototype.iadd=function iadd(a,b){this._verify2(a,b);var res=a.iadd(b);if(res.cmp(this.m)>=0)
        res.isub(this.m);return res};Red.prototype.sub=function sub(a,b){this._verify2(a,b);var res=a.sub(b);if(res.cmpn(0)<0)
        res.iadd(this.m);return res._forceRed(this)};Red.prototype.isub=function isub(a,b){this._verify2(a,b);var res=a.isub(b);if(res.cmpn(0)<0)
        res.iadd(this.m);return res};Red.prototype.shl=function shl(a,num){this._verify1(a);return this.imod(a.ushln(num))};Red.prototype.imul=function imul(a,b){this._verify2(a,b);return this.imod(a.imul(b))};Red.prototype.mul=function mul(a,b){this._verify2(a,b);return this.imod(a.mul(b))};Red.prototype.isqr=function isqr(a){return this.imul(a,a)};Red.prototype.sqr=function sqr(a){return this.mul(a,a)};Red.prototype.sqrt=function sqrt(a){if(a.cmpn(0)===0)
        return a.clone();var mod3=this.m.andln(3);assert(mod3%2===1);if(mod3===3){var pow=this.m.add(new BN(1)).iushrn(2);var r=this.pow(a,pow);return r}
        var q=this.m.subn(1);var s=0;while(q.cmpn(0)!==0&&q.andln(1)===0){s++;q.iushrn(1)}
        assert(q.cmpn(0)!==0);var one=new BN(1).toRed(this);var nOne=one.redNeg();var lpow=this.m.subn(1).iushrn(1);var z=this.m.bitLength();z=new BN(2*z*z).toRed(this);while(this.pow(z,lpow).cmp(nOne)!==0)
            z.redIAdd(nOne);var c=this.pow(z,q);var r=this.pow(a,q.addn(1).iushrn(1));var t=this.pow(a,q);var m=s;while(t.cmp(one)!==0){var tmp=t;for(var i=0;tmp.cmp(one)!==0;i++)
            tmp=tmp.redSqr();assert(i<m);var b=this.pow(c,new BN(1).iushln(m-i-1));r=r.redMul(b);c=b.redSqr();t=t.redMul(c);m=i}
        return r};Red.prototype.invm=function invm(a){var inv=a._invmp(this.m);if(inv.sign){inv.sign=!1;return this.imod(inv).redNeg()}else{return this.imod(inv)}};Red.prototype.pow=function pow(a,num){var w=[];if(num.cmpn(0)===0)
        return new BN(1);var q=num.clone();while(q.cmpn(0)!==0){w.push(q.andln(1));q.iushrn(1)}
        var res=a;for(var i=0;i<w.length;i++,res=this.sqr(res))
            if(w[i]!==0)
                break;if(++i<w.length){for(var q=this.sqr(res);i<w.length;i++,q=this.sqr(q)){if(w[i]===0)
            continue;res=this.mul(res,q)}}
        return res};Red.prototype.convertTo=function convertTo(num){var r=num.umod(this.m);if(r===num)
        return r.clone();else return r};Red.prototype.convertFrom=function convertFrom(num){var res=num.clone();res.red=null;return res};BN.mont=function mont(num){return new Mont(num)};function Mont(m){Red.call(this,m);this.shift=this.m.bitLength();if(this.shift%26!==0)
        this.shift+=26-(this.shift%26);this.r=new BN(1).iushln(this.shift);this.r2=this.imod(this.r.sqr());this.rinv=this.r._invmp(this.m);this.minv=this.rinv.mul(this.r).isubn(1).div(this.m);this.minv=this.minv.umod(this.r);this.minv=this.r.sub(this.minv)}
    inherits(Mont,Red);Mont.prototype.convertTo=function convertTo(num){return this.imod(num.ushln(this.shift))};Mont.prototype.convertFrom=function convertFrom(num){var r=this.imod(num.mul(this.rinv));r.red=null;return r};Mont.prototype.imul=function imul(a,b){if(a.cmpn(0)===0||b.cmpn(0)===0){a.words[0]=0;a.length=1;return a}
        var t=a.imul(b);var c=t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);var u=t.isub(c).iushrn(this.shift);var res=u;if(u.cmp(this.m)>=0)
            res=u.isub(this.m);else if(u.cmpn(0)<0)
            res=u.iadd(this.m);return res._forceRed(this)};Mont.prototype.mul=function mul(a,b){if(a.cmpn(0)===0||b.cmpn(0)===0)
        return new BN(0)._forceRed(this);var t=a.mul(b);var c=t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);var u=t.isub(c).iushrn(this.shift);var res=u;if(u.cmp(this.m)>=0)
        res=u.isub(this.m);else if(u.cmpn(0)<0)
        res=u.iadd(this.m);return res._forceRed(this)};Mont.prototype.invm=function invm(a){var res=this.imod(a._invmp(this.m).mul(this.r2));return res._forceRed(this)}})(typeof module==='undefined'||module,this)},{}],39:[function(require,module,exports){(function(Buffer){const Sha3=require('js-sha3')
    var hash=function(bitcount){this.content=''
        this.bitcount=bitcount?'keccak_'+bitcount:'keccak_512'}
    hash.prototype.update=function(i){this.content=Buffer.isBuffer(i)?i:new Buffer(i)}
    hash.prototype.digest=function(encoding){var result=Sha3[this.bitcount](this.content)
        if(encoding==='hex')
            return result
        else return new Buffer(result,'hex').toString('binary')}
    module.exports={SHA3Hash:hash}}).call(this,require("buffer").Buffer)},{"buffer":111,"js-sha3":40}],40:[function(require,module,exports){(function(global){;(function(root,undefined){'use strict';var NODE_JS=typeof(module)!='undefined';if(NODE_JS){root=global;if(root.JS_SHA3_TEST){root.navigator={userAgent:'Chrome'}}}
    var CHROME=(root.JS_SHA3_TEST||!NODE_JS)&&navigator.userAgent.indexOf('Chrome')!=-1;var HEX_CHARS='0123456789abcdef'.split('');var KECCAK_PADDING=[1,256,65536,16777216];var PADDING=[6,1536,393216,100663296];var SHIFT=[0,8,16,24];var RC=[1,0,32898,0,32906,2147483648,2147516416,2147483648,32907,0,2147483649,0,2147516545,2147483648,32777,2147483648,138,0,136,0,2147516425,0,2147483658,0,2147516555,0,139,2147483648,32905,2147483648,32771,2147483648,32770,2147483648,128,2147483648,32778,0,2147483658,2147483648,2147516545,2147483648,32896,2147483648,2147483649,0,2147516424,2147483648];var blocks=[],s=[];var keccak_224=function(message){return keccak(message,224,KECCAK_PADDING)};var keccak_256=function(message){return keccak(message,256,KECCAK_PADDING)};var keccak_384=function(message){return keccak(message,384,KECCAK_PADDING)};var sha3_224=function(message){return keccak(message,224,PADDING)};var sha3_256=function(message){return keccak(message,256,PADDING)};var sha3_384=function(message){return keccak(message,384,PADDING)};var sha3_512=function(message){return keccak(message,512,PADDING)};var keccak=function(message,bits,padding){var notString=typeof(message)!='string';if(notString&&message.constructor==root.ArrayBuffer){message=new Uint8Array(message)}
        if(bits===undefined){bits=512;padding=KECCAK_PADDING}
        var block,code,end=!1,index=0,start=0,length=message.length,n,i,h,l,c0,c1,c2,c3,c4,c5,c6,c7,c8,c9,b0,b1,b2,b3,b4,b5,b6,b7,b8,b9,b10,b11,b12,b13,b14,b15,b16,b17,b18,b19,b20,b21,b22,b23,b24,b25,b26,b27,b28,b29,b30,b31,b32,b33,b34,b35,b36,b37,b38,b39,b40,b41,b42,b43,b44,b45,b46,b47,b48,b49;var blockCount=(1600-bits*2)/32;var byteCount=blockCount*4;for(i=0;i<50;++i){s[i]=0}
        block=0;do{blocks[0]=block;for(i=1;i<blockCount+1;++i){blocks[i]=0}
            if(notString){for(i=start;index<length&&i<byteCount;++index){blocks[i>>2]|=message[index]<<SHIFT[i++&3]}}else{for(i=start;index<length&&i<byteCount;++index){code=message.charCodeAt(index);if(code<0x80){blocks[i>>2]|=code<<SHIFT[i++&3]}else if(code<0x800){blocks[i>>2]|=(0xc0|(code>>6))<<SHIFT[i++&3];blocks[i>>2]|=(0x80|(code&0x3f))<<SHIFT[i++&3]}else if(code<0xd800||code>=0xe000){blocks[i>>2]|=(0xe0|(code>>12))<<SHIFT[i++&3];blocks[i>>2]|=(0x80|((code>>6)&0x3f))<<SHIFT[i++&3];blocks[i>>2]|=(0x80|(code&0x3f))<<SHIFT[i++&3]}else{code=0x10000+(((code&0x3ff)<<10)|(message.charCodeAt(++index)&0x3ff));blocks[i>>2]|=(0xf0|(code>>18))<<SHIFT[i++&3];blocks[i>>2]|=(0x80|((code>>12)&0x3f))<<SHIFT[i++&3];blocks[i>>2]|=(0x80|((code>>6)&0x3f))<<SHIFT[i++&3];blocks[i>>2]|=(0x80|(code&0x3f))<<SHIFT[i++&3]}}}
            start=i-byteCount;if(index==length){blocks[i>>2]|=padding[i&3];++index}
            block=blocks[blockCount];if(index>length&&i<byteCount){blocks[blockCount-1]|=0x80000000;end=!0}
            for(i=0;i<blockCount;++i){s[i]^=blocks[i]}
            for(n=0;n<48;n+=2){c0=s[0]^s[10]^s[20]^s[30]^s[40];c1=s[1]^s[11]^s[21]^s[31]^s[41];c2=s[2]^s[12]^s[22]^s[32]^s[42];c3=s[3]^s[13]^s[23]^s[33]^s[43];c4=s[4]^s[14]^s[24]^s[34]^s[44];c5=s[5]^s[15]^s[25]^s[35]^s[45];c6=s[6]^s[16]^s[26]^s[36]^s[46];c7=s[7]^s[17]^s[27]^s[37]^s[47];c8=s[8]^s[18]^s[28]^s[38]^s[48];c9=s[9]^s[19]^s[29]^s[39]^s[49];h=c8^((c2<<1)|(c3>>>31));l=c9^((c3<<1)|(c2>>>31));s[0]^=h;s[1]^=l;s[10]^=h;s[11]^=l;s[20]^=h;s[21]^=l;s[30]^=h;s[31]^=l;s[40]^=h;s[41]^=l;h=c0^((c4<<1)|(c5>>>31));l=c1^((c5<<1)|(c4>>>31));s[2]^=h;s[3]^=l;s[12]^=h;s[13]^=l;s[22]^=h;s[23]^=l;s[32]^=h;s[33]^=l;s[42]^=h;s[43]^=l;h=c2^((c6<<1)|(c7>>>31));l=c3^((c7<<1)|(c6>>>31));s[4]^=h;s[5]^=l;s[14]^=h;s[15]^=l;s[24]^=h;s[25]^=l;s[34]^=h;s[35]^=l;s[44]^=h;s[45]^=l;h=c4^((c8<<1)|(c9>>>31));l=c5^((c9<<1)|(c8>>>31));s[6]^=h;s[7]^=l;s[16]^=h;s[17]^=l;s[26]^=h;s[27]^=l;s[36]^=h;s[37]^=l;s[46]^=h;s[47]^=l;h=c6^((c0<<1)|(c1>>>31));l=c7^((c1<<1)|(c0>>>31));s[8]^=h;s[9]^=l;s[18]^=h;s[19]^=l;s[28]^=h;s[29]^=l;s[38]^=h;s[39]^=l;s[48]^=h;s[49]^=l;b0=s[0];b1=s[1];b32=(s[11]<<4)|(s[10]>>>28);b33=(s[10]<<4)|(s[11]>>>28);b14=(s[20]<<3)|(s[21]>>>29);b15=(s[21]<<3)|(s[20]>>>29);b46=(s[31]<<9)|(s[30]>>>23);b47=(s[30]<<9)|(s[31]>>>23);b28=(s[40]<<18)|(s[41]>>>14);b29=(s[41]<<18)|(s[40]>>>14);b20=(s[2]<<1)|(s[3]>>>31);b21=(s[3]<<1)|(s[2]>>>31);b2=(s[13]<<12)|(s[12]>>>20);b3=(s[12]<<12)|(s[13]>>>20);b34=(s[22]<<10)|(s[23]>>>22);b35=(s[23]<<10)|(s[22]>>>22);b16=(s[33]<<13)|(s[32]>>>19);b17=(s[32]<<13)|(s[33]>>>19);b48=(s[42]<<2)|(s[43]>>>30);b49=(s[43]<<2)|(s[42]>>>30);b40=(s[5]<<30)|(s[4]>>>2);b41=(s[4]<<30)|(s[5]>>>2);b22=(s[14]<<6)|(s[15]>>>26);b23=(s[15]<<6)|(s[14]>>>26);b4=(s[25]<<11)|(s[24]>>>21);b5=(s[24]<<11)|(s[25]>>>21);b36=(s[34]<<15)|(s[35]>>>17);b37=(s[35]<<15)|(s[34]>>>17);b18=(s[45]<<29)|(s[44]>>>3);b19=(s[44]<<29)|(s[45]>>>3);b10=(s[6]<<28)|(s[7]>>>4);b11=(s[7]<<28)|(s[6]>>>4);b42=(s[17]<<23)|(s[16]>>>9);b43=(s[16]<<23)|(s[17]>>>9);b24=(s[26]<<25)|(s[27]>>>7);b25=(s[27]<<25)|(s[26]>>>7);b6=(s[36]<<21)|(s[37]>>>11);b7=(s[37]<<21)|(s[36]>>>11);b38=(s[47]<<24)|(s[46]>>>8);b39=(s[46]<<24)|(s[47]>>>8);b30=(s[8]<<27)|(s[9]>>>5);b31=(s[9]<<27)|(s[8]>>>5);b12=(s[18]<<20)|(s[19]>>>12);b13=(s[19]<<20)|(s[18]>>>12);b44=(s[29]<<7)|(s[28]>>>25);b45=(s[28]<<7)|(s[29]>>>25);b26=(s[38]<<8)|(s[39]>>>24);b27=(s[39]<<8)|(s[38]>>>24);b8=(s[48]<<14)|(s[49]>>>18);b9=(s[49]<<14)|(s[48]>>>18);s[0]=b0^(~b2&b4);s[1]=b1^(~b3&b5);s[10]=b10^(~b12&b14);s[11]=b11^(~b13&b15);s[20]=b20^(~b22&b24);s[21]=b21^(~b23&b25);s[30]=b30^(~b32&b34);s[31]=b31^(~b33&b35);s[40]=b40^(~b42&b44);s[41]=b41^(~b43&b45);s[2]=b2^(~b4&b6);s[3]=b3^(~b5&b7);s[12]=b12^(~b14&b16);s[13]=b13^(~b15&b17);s[22]=b22^(~b24&b26);s[23]=b23^(~b25&b27);s[32]=b32^(~b34&b36);s[33]=b33^(~b35&b37);s[42]=b42^(~b44&b46);s[43]=b43^(~b45&b47);s[4]=b4^(~b6&b8);s[5]=b5^(~b7&b9);s[14]=b14^(~b16&b18);s[15]=b15^(~b17&b19);s[24]=b24^(~b26&b28);s[25]=b25^(~b27&b29);s[34]=b34^(~b36&b38);s[35]=b35^(~b37&b39);s[44]=b44^(~b46&b48);s[45]=b45^(~b47&b49);s[6]=b6^(~b8&b0);s[7]=b7^(~b9&b1);s[16]=b16^(~b18&b10);s[17]=b17^(~b19&b11);s[26]=b26^(~b28&b20);s[27]=b27^(~b29&b21);s[36]=b36^(~b38&b30);s[37]=b37^(~b39&b31);s[46]=b46^(~b48&b40);s[47]=b47^(~b49&b41);s[8]=b8^(~b0&b2);s[9]=b9^(~b1&b3);s[18]=b18^(~b10&b12);s[19]=b19^(~b11&b13);s[28]=b28^(~b20&b22);s[29]=b29^(~b21&b23);s[38]=b38^(~b30&b32);s[39]=b39^(~b31&b33);s[48]=b48^(~b40&b42);s[49]=b49^(~b41&b43);s[0]^=RC[n];s[1]^=RC[n+1]}}while(!end);var hex='';if(CHROME){b0=s[0];b1=s[1];b2=s[2];b3=s[3];b4=s[4];b5=s[5];b6=s[6];b7=s[7];b8=s[8];b9=s[9];b10=s[10];b11=s[11];b12=s[12];b13=s[13];b14=s[14];b15=s[15];hex+=HEX_CHARS[(b0>>4)&0x0F]+HEX_CHARS[b0&0x0F]+HEX_CHARS[(b0>>12)&0x0F]+HEX_CHARS[(b0>>8)&0x0F]+HEX_CHARS[(b0>>20)&0x0F]+HEX_CHARS[(b0>>16)&0x0F]+HEX_CHARS[(b0>>28)&0x0F]+HEX_CHARS[(b0>>24)&0x0F]+HEX_CHARS[(b1>>4)&0x0F]+HEX_CHARS[b1&0x0F]+HEX_CHARS[(b1>>12)&0x0F]+HEX_CHARS[(b1>>8)&0x0F]+HEX_CHARS[(b1>>20)&0x0F]+HEX_CHARS[(b1>>16)&0x0F]+HEX_CHARS[(b1>>28)&0x0F]+HEX_CHARS[(b1>>24)&0x0F]+HEX_CHARS[(b2>>4)&0x0F]+HEX_CHARS[b2&0x0F]+HEX_CHARS[(b2>>12)&0x0F]+HEX_CHARS[(b2>>8)&0x0F]+HEX_CHARS[(b2>>20)&0x0F]+HEX_CHARS[(b2>>16)&0x0F]+HEX_CHARS[(b2>>28)&0x0F]+HEX_CHARS[(b2>>24)&0x0F]+HEX_CHARS[(b3>>4)&0x0F]+HEX_CHARS[b3&0x0F]+HEX_CHARS[(b3>>12)&0x0F]+HEX_CHARS[(b3>>8)&0x0F]+HEX_CHARS[(b3>>20)&0x0F]+HEX_CHARS[(b3>>16)&0x0F]+HEX_CHARS[(b3>>28)&0x0F]+HEX_CHARS[(b3>>24)&0x0F]+HEX_CHARS[(b4>>4)&0x0F]+HEX_CHARS[b4&0x0F]+HEX_CHARS[(b4>>12)&0x0F]+HEX_CHARS[(b4>>8)&0x0F]+HEX_CHARS[(b4>>20)&0x0F]+HEX_CHARS[(b4>>16)&0x0F]+HEX_CHARS[(b4>>28)&0x0F]+HEX_CHARS[(b4>>24)&0x0F]+HEX_CHARS[(b5>>4)&0x0F]+HEX_CHARS[b5&0x0F]+HEX_CHARS[(b5>>12)&0x0F]+HEX_CHARS[(b5>>8)&0x0F]+HEX_CHARS[(b5>>20)&0x0F]+HEX_CHARS[(b5>>16)&0x0F]+HEX_CHARS[(b5>>28)&0x0F]+HEX_CHARS[(b5>>24)&0x0F]+HEX_CHARS[(b6>>4)&0x0F]+HEX_CHARS[b6&0x0F]+HEX_CHARS[(b6>>12)&0x0F]+HEX_CHARS[(b6>>8)&0x0F]+HEX_CHARS[(b6>>20)&0x0F]+HEX_CHARS[(b6>>16)&0x0F]+HEX_CHARS[(b6>>28)&0x0F]+HEX_CHARS[(b6>>24)&0x0F];if(bits>=256){hex+=HEX_CHARS[(b7>>4)&0x0F]+HEX_CHARS[b7&0x0F]+HEX_CHARS[(b7>>12)&0x0F]+HEX_CHARS[(b7>>8)&0x0F]+HEX_CHARS[(b7>>20)&0x0F]+HEX_CHARS[(b7>>16)&0x0F]+HEX_CHARS[(b7>>28)&0x0F]+HEX_CHARS[(b7>>24)&0x0F]}
            if(bits>=384){hex+=HEX_CHARS[(b8>>4)&0x0F]+HEX_CHARS[b8&0x0F]+HEX_CHARS[(b8>>12)&0x0F]+HEX_CHARS[(b8>>8)&0x0F]+HEX_CHARS[(b8>>20)&0x0F]+HEX_CHARS[(b8>>16)&0x0F]+HEX_CHARS[(b8>>28)&0x0F]+HEX_CHARS[(b8>>24)&0x0F]+HEX_CHARS[(b9>>4)&0x0F]+HEX_CHARS[b9&0x0F]+HEX_CHARS[(b9>>12)&0x0F]+HEX_CHARS[(b9>>8)&0x0F]+HEX_CHARS[(b9>>20)&0x0F]+HEX_CHARS[(b9>>16)&0x0F]+HEX_CHARS[(b9>>28)&0x0F]+HEX_CHARS[(b9>>24)&0x0F]+HEX_CHARS[(b10>>4)&0x0F]+HEX_CHARS[b10&0x0F]+HEX_CHARS[(b10>>12)&0x0F]+HEX_CHARS[(b10>>8)&0x0F]+HEX_CHARS[(b10>>20)&0x0F]+HEX_CHARS[(b10>>16)&0x0F]+HEX_CHARS[(b10>>28)&0x0F]+HEX_CHARS[(b10>>24)&0x0F]+HEX_CHARS[(b11>>4)&0x0F]+HEX_CHARS[b11&0x0F]+HEX_CHARS[(b11>>12)&0x0F]+HEX_CHARS[(b11>>8)&0x0F]+HEX_CHARS[(b11>>20)&0x0F]+HEX_CHARS[(b11>>16)&0x0F]+HEX_CHARS[(b11>>28)&0x0F]+HEX_CHARS[(b11>>24)&0x0F]}
            if(bits==512){hex+=HEX_CHARS[(b12>>4)&0x0F]+HEX_CHARS[b12&0x0F]+HEX_CHARS[(b12>>12)&0x0F]+HEX_CHARS[(b12>>8)&0x0F]+HEX_CHARS[(b12>>20)&0x0F]+HEX_CHARS[(b12>>16)&0x0F]+HEX_CHARS[(b12>>28)&0x0F]+HEX_CHARS[(b12>>24)&0x0F]+HEX_CHARS[(b13>>4)&0x0F]+HEX_CHARS[b13&0x0F]+HEX_CHARS[(b13>>12)&0x0F]+HEX_CHARS[(b13>>8)&0x0F]+HEX_CHARS[(b13>>20)&0x0F]+HEX_CHARS[(b13>>16)&0x0F]+HEX_CHARS[(b13>>28)&0x0F]+HEX_CHARS[(b13>>24)&0x0F]+HEX_CHARS[(b14>>4)&0x0F]+HEX_CHARS[b14&0x0F]+HEX_CHARS[(b14>>12)&0x0F]+HEX_CHARS[(b14>>8)&0x0F]+HEX_CHARS[(b14>>20)&0x0F]+HEX_CHARS[(b14>>16)&0x0F]+HEX_CHARS[(b14>>28)&0x0F]+HEX_CHARS[(b14>>24)&0x0F]+HEX_CHARS[(b15>>4)&0x0F]+HEX_CHARS[b15&0x0F]+HEX_CHARS[(b15>>12)&0x0F]+HEX_CHARS[(b15>>8)&0x0F]+HEX_CHARS[(b15>>20)&0x0F]+HEX_CHARS[(b15>>16)&0x0F]+HEX_CHARS[(b15>>28)&0x0F]+HEX_CHARS[(b15>>24)&0x0F]}}else{for(i=0,n=bits/32;i<n;++i){h=s[i];hex+=HEX_CHARS[(h>>4)&0x0F]+HEX_CHARS[h&0x0F]+HEX_CHARS[(h>>12)&0x0F]+HEX_CHARS[(h>>8)&0x0F]+HEX_CHARS[(h>>20)&0x0F]+HEX_CHARS[(h>>16)&0x0F]+HEX_CHARS[(h>>28)&0x0F]+HEX_CHARS[(h>>24)&0x0F]}}
        return hex};if(!root.JS_SHA3_TEST&&NODE_JS){module.exports={sha3_512:sha3_512,sha3_384:sha3_384,sha3_256:sha3_256,sha3_224:sha3_224,keccak_512:keccak,keccak_384:keccak_384,keccak_256:keccak_256,keccak_224:keccak_224}}else if(root){root.sha3_512=sha3_512;root.sha3_384=sha3_384;root.sha3_256=sha3_256;root.sha3_224=sha3_224;root.keccak_512=keccak;root.keccak_384=keccak_384;root.keccak_256=keccak_256;root.keccak_224=keccak_224}}(this))}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],41:[function(require,module,exports){'use strict';var elliptic=exports;elliptic.version=require('../package.json').version;elliptic.utils=require('./elliptic/utils');elliptic.rand=require('brorand');elliptic.hmacDRBG=require('./elliptic/hmac-drbg');elliptic.curve=require('./elliptic/curve');elliptic.curves=require('./elliptic/curves');elliptic.ec=require('./elliptic/ec');elliptic.eddsa=require('./elliptic/eddsa')},{"../package.json":65,"./elliptic/curve":44,"./elliptic/curves":47,"./elliptic/ec":48,"./elliptic/eddsa":51,"./elliptic/hmac-drbg":54,"./elliptic/utils":56,"brorand":57}],42:[function(require,module,exports){'use strict';var bn=require('bn.js');var elliptic=require('../../elliptic');var utils=elliptic.utils;var getNAF=utils.getNAF;var getJSF=utils.getJSF;var assert=utils.assert;function BaseCurve(type,conf){this.type=type;this.p=new bn(conf.p,16);this.red=conf.prime?bn.red(conf.prime):bn.mont(this.p);this.zero=new bn(0).toRed(this.red);this.one=new bn(1).toRed(this.red);this.two=new bn(2).toRed(this.red);this.n=conf.n&&new bn(conf.n,16);this.g=conf.g&&this.pointFromJSON(conf.g,conf.gRed);this._wnafT1=new Array(4);this._wnafT2=new Array(4);this._wnafT3=new Array(4);this._wnafT4=new Array(4)}
    module.exports=BaseCurve;BaseCurve.prototype.point=function point(){throw new Error('Not implemented')};BaseCurve.prototype.validate=function validate(){throw new Error('Not implemented')};BaseCurve.prototype._fixedNafMul=function _fixedNafMul(p,k){assert(p.precomputed);var doubles=p._getDoubles();var naf=getNAF(k,1);var I=(1<<(doubles.step+1))-(doubles.step%2===0?2:1);I/=3;var repr=[];for(var j=0;j<naf.length;j+=doubles.step){var nafW=0;for(var k=j+doubles.step-1;k>=j;k--)
        nafW=(nafW<<1)+naf[k];repr.push(nafW)}
        var a=this.jpoint(null,null,null);var b=this.jpoint(null,null,null);for(var i=I;i>0;i--){for(var j=0;j<repr.length;j++){var nafW=repr[j];if(nafW===i)
            b=b.mixedAdd(doubles.points[j]);else if(nafW===-i)
            b=b.mixedAdd(doubles.points[j].neg())}
            a=a.add(b)}
        return a.toP()};BaseCurve.prototype._wnafMul=function _wnafMul(p,k){var w=4;var nafPoints=p._getNAFPoints(w);w=nafPoints.wnd;var wnd=nafPoints.points;var naf=getNAF(k,w);var acc=this.jpoint(null,null,null);for(var i=naf.length-1;i>=0;i--){for(var k=0;i>=0&&naf[i]===0;i--)
        k++;if(i>=0)
        k++;acc=acc.dblp(k);if(i<0)
        break;var z=naf[i];assert(z!==0);if(p.type==='affine'){if(z>0)
        acc=acc.mixedAdd(wnd[(z-1)>>1]);else acc=acc.mixedAdd(wnd[(-z-1)>>1].neg())}else{if(z>0)
        acc=acc.add(wnd[(z-1)>>1]);else acc=acc.add(wnd[(-z-1)>>1].neg())}}
        return p.type==='affine'?acc.toP():acc};BaseCurve.prototype._wnafMulAdd=function _wnafMulAdd(defW,points,coeffs,len){var wndWidth=this._wnafT1;var wnd=this._wnafT2;var naf=this._wnafT3;var max=0;for(var i=0;i<len;i++){var p=points[i];var nafPoints=p._getNAFPoints(defW);wndWidth[i]=nafPoints.wnd;wnd[i]=nafPoints.points}
        for(var i=len-1;i>=1;i-=2){var a=i-1;var b=i;if(wndWidth[a]!==1||wndWidth[b]!==1){naf[a]=getNAF(coeffs[a],wndWidth[a]);naf[b]=getNAF(coeffs[b],wndWidth[b]);max=Math.max(naf[a].length,max);max=Math.max(naf[b].length,max);continue}
            var comb=[points[a],null,null,points[b]];if(points[a].y.cmp(points[b].y)===0){comb[1]=points[a].add(points[b]);comb[2]=points[a].toJ().mixedAdd(points[b].neg())}else if(points[a].y.cmp(points[b].y.redNeg())===0){comb[1]=points[a].toJ().mixedAdd(points[b]);comb[2]=points[a].add(points[b].neg())}else{comb[1]=points[a].toJ().mixedAdd(points[b]);comb[2]=points[a].toJ().mixedAdd(points[b].neg())}
            var index=[-3,-1,-5,-7,0,7,5,1,3];var jsf=getJSF(coeffs[a],coeffs[b]);max=Math.max(jsf[0].length,max);naf[a]=new Array(max);naf[b]=new Array(max);for(var j=0;j<max;j++){var ja=jsf[0][j]|0;var jb=jsf[1][j]|0;naf[a][j]=index[(ja+1)*3+(jb+1)];naf[b][j]=0;wnd[a]=comb}}
        var acc=this.jpoint(null,null,null);var tmp=this._wnafT4;for(var i=max;i>=0;i--){var k=0;while(i>=0){var zero=!0;for(var j=0;j<len;j++){tmp[j]=naf[j][i]|0;if(tmp[j]!==0)
            zero=!1}
            if(!zero)
                break;k++;i--}
            if(i>=0)
                k++;acc=acc.dblp(k);if(i<0)
                break;for(var j=0;j<len;j++){var z=tmp[j];var p;if(z===0)
                continue;else if(z>0)
                p=wnd[j][(z-1)>>1];else if(z<0)
                p=wnd[j][(-z-1)>>1].neg();if(p.type==='affine')
                acc=acc.mixedAdd(p);else acc=acc.add(p)}}
        for(var i=0;i<len;i++)
            wnd[i]=null;return acc.toP()};function BasePoint(curve,type){this.curve=curve;this.type=type;this.precomputed=null}
    BaseCurve.BasePoint=BasePoint;BasePoint.prototype.eq=function eq(){throw new Error('Not implemented')};BasePoint.prototype.validate=function validate(){return this.curve.validate(this)};BaseCurve.prototype.decodePoint=function decodePoint(bytes,enc){bytes=utils.toArray(bytes,enc);var len=this.p.byteLength();if(bytes[0]===0x04&&bytes.length-1===2*len){return this.point(bytes.slice(1,1+len),bytes.slice(1+len,1+2*len))}else if((bytes[0]===0x02||bytes[0]===0x03)&&bytes.length-1===len){return this.pointFromX(bytes.slice(1,1+len),bytes[0]===0x03)}
        throw new Error('Unknown point format')};BasePoint.prototype.encodeCompressed=function encodeCompressed(enc){return this.encode(enc,!0)};BasePoint.prototype._encode=function _encode(compact){var len=this.curve.p.byteLength();var x=this.getX().toArray('be',len);if(compact)
        return[this.getY().isEven()?0x02:0x03].concat(x);return[0x04].concat(x,this.getY().toArray('be',len))};BasePoint.prototype.encode=function encode(enc,compact){return utils.encode(this._encode(compact),enc)};BasePoint.prototype.precompute=function precompute(power){if(this.precomputed)
        return this;var precomputed={doubles:null,naf:null,beta:null};precomputed.naf=this._getNAFPoints(8);precomputed.doubles=this._getDoubles(4,power);precomputed.beta=this._getBeta();this.precomputed=precomputed;return this};BasePoint.prototype._hasDoubles=function _hasDoubles(k){if(!this.precomputed)
        return!1;var doubles=this.precomputed.doubles;if(!doubles)
        return!1;return doubles.points.length>=Math.ceil((k.bitLength()+1)/doubles.step)};BasePoint.prototype._getDoubles=function _getDoubles(step,power){if(this.precomputed&&this.precomputed.doubles)
        return this.precomputed.doubles;var doubles=[this];var acc=this;for(var i=0;i<power;i+=step){for(var j=0;j<step;j++)
        acc=acc.dbl();doubles.push(acc)}
        return{step:step,points:doubles}};BasePoint.prototype._getNAFPoints=function _getNAFPoints(wnd){if(this.precomputed&&this.precomputed.naf)
        return this.precomputed.naf;var res=[this];var max=(1<<wnd)-1;var dbl=max===1?null:this.dbl();for(var i=1;i<max;i++)
        res[i]=res[i-1].add(dbl);return{wnd:wnd,points:res}};BasePoint.prototype._getBeta=function _getBeta(){return null};BasePoint.prototype.dblp=function dblp(k){var r=this;for(var i=0;i<k;i++)
        r=r.dbl();return r}},{"../../elliptic":41,"bn.js":38}],43:[function(require,module,exports){'use strict';var curve=require('../curve');var elliptic=require('../../elliptic');var bn=require('bn.js');var inherits=require('inherits');var Base=curve.base;var assert=elliptic.utils.assert;function EdwardsCurve(conf){this.twisted=(conf.a|0)!==1;this.mOneA=this.twisted&&(conf.a|0)===-1;this.extended=this.mOneA;Base.call(this,'edwards',conf);this.a=new bn(conf.a,16).umod(this.red.m);this.a=this.a.toRed(this.red);this.c=new bn(conf.c,16).toRed(this.red);this.c2=this.c.redSqr();this.d=new bn(conf.d,16).toRed(this.red);this.dd=this.d.redAdd(this.d);assert(!this.twisted||this.c.fromRed().cmpn(1)===0);this.oneC=(conf.c|0)===1}
    inherits(EdwardsCurve,Base);module.exports=EdwardsCurve;EdwardsCurve.prototype._mulA=function _mulA(num){if(this.mOneA)
        return num.redNeg();else return this.a.redMul(num)};EdwardsCurve.prototype._mulC=function _mulC(num){if(this.oneC)
        return num;else return this.c.redMul(num)};EdwardsCurve.prototype.jpoint=function jpoint(x,y,z,t){return this.point(x,y,z,t)};EdwardsCurve.prototype.pointFromX=function pointFromX(x,odd){x=new bn(x,16);if(!x.red)
        x=x.toRed(this.red);var x2=x.redSqr();var rhs=this.c2.redSub(this.a.redMul(x2));var lhs=this.one.redSub(this.c2.redMul(this.d).redMul(x2));var y=rhs.redMul(lhs.redInvm()).redSqrt();var isOdd=y.fromRed().isOdd();if(odd&&!isOdd||!odd&&isOdd)
        y=y.redNeg();return this.point(x,y)};EdwardsCurve.prototype.pointFromY=function pointFromY(y,odd){y=new bn(y,16);if(!y.red)
        y=y.toRed(this.red);var y2=y.redSqr();var lhs=y2.redSub(this.one);var rhs=y2.redMul(this.d).redAdd(this.one);var x2=lhs.redMul(rhs.redInvm());if(x2.cmp(this.zero)===0){if(odd)
        throw new Error('invalid point');else return this.point(this.zero,y)}
        var x=x2.redSqrt();if(x.redSqr().redSub(x2).cmp(this.zero)!==0)
            throw new Error('invalid point');if(x.isOdd()!==odd)
            x=x.redNeg();return this.point(x,y)};EdwardsCurve.prototype.validate=function validate(point){if(point.isInfinity())
        return!0;point.normalize();var x2=point.x.redSqr();var y2=point.y.redSqr();var lhs=x2.redMul(this.a).redAdd(y2);var rhs=this.c2.redMul(this.one.redAdd(this.d.redMul(x2).redMul(y2)));return lhs.cmp(rhs)===0};function Point(curve,x,y,z,t){Base.BasePoint.call(this,curve,'projective');if(x===null&&y===null&&z===null){this.x=this.curve.zero;this.y=this.curve.one;this.z=this.curve.one;this.t=this.curve.zero;this.zOne=!0}else{this.x=new bn(x,16);this.y=new bn(y,16);this.z=z?new bn(z,16):this.curve.one;this.t=t&&new bn(t,16);if(!this.x.red)
        this.x=this.x.toRed(this.curve.red);if(!this.y.red)
        this.y=this.y.toRed(this.curve.red);if(!this.z.red)
        this.z=this.z.toRed(this.curve.red);if(this.t&&!this.t.red)
        this.t=this.t.toRed(this.curve.red);this.zOne=this.z===this.curve.one;if(this.curve.extended&&!this.t){this.t=this.x.redMul(this.y);if(!this.zOne)
        this.t=this.t.redMul(this.z.redInvm())}}}
    inherits(Point,Base.BasePoint);EdwardsCurve.prototype.pointFromJSON=function pointFromJSON(obj){return Point.fromJSON(this,obj)};EdwardsCurve.prototype.point=function point(x,y,z,t){return new Point(this,x,y,z,t)};Point.fromJSON=function fromJSON(curve,obj){return new Point(curve,obj[0],obj[1],obj[2])};Point.prototype.inspect=function inspect(){if(this.isInfinity())
        return'<EC Point Infinity>';return'<EC Point x: '+this.x.fromRed().toString(16,2)+' y: '+this.y.fromRed().toString(16,2)+' z: '+this.z.fromRed().toString(16,2)+'>'};Point.prototype.isInfinity=function isInfinity(){return this.x.cmpn(0)===0&&this.y.cmp(this.z)===0};Point.prototype._extDbl=function _extDbl(){var a=this.x.redSqr();var b=this.y.redSqr();var c=this.z.redSqr();c=c.redIAdd(c);var d=this.curve._mulA(a);var e=this.x.redAdd(this.y).redSqr().redISub(a).redISub(b);var g=d.redAdd(b);var f=g.redSub(c);var h=d.redSub(b);var nx=e.redMul(f);var ny=g.redMul(h);var nt=e.redMul(h);var nz=f.redMul(g);return this.curve.point(nx,ny,nz,nt)};Point.prototype._projDbl=function _projDbl(){var b=this.x.redAdd(this.y).redSqr();var c=this.x.redSqr();var d=this.y.redSqr();var nx;var ny;var nz;if(this.curve.twisted){var e=this.curve._mulA(c);var f=e.redAdd(d);if(this.zOne){nx=b.redSub(c).redSub(d).redMul(f.redSub(this.curve.two));ny=f.redMul(e.redSub(d));nz=f.redSqr().redSub(f).redSub(f)}else{var h=this.z.redSqr();var j=f.redSub(h).redISub(h);nx=b.redSub(c).redISub(d).redMul(j);ny=f.redMul(e.redSub(d));nz=f.redMul(j)}}else{var e=c.redAdd(d);var h=this.curve._mulC(this.c.redMul(this.z)).redSqr();var j=e.redSub(h).redSub(h);nx=this.curve._mulC(b.redISub(e)).redMul(j);ny=this.curve._mulC(e).redMul(c.redISub(d));nz=e.redMul(j)}
        return this.curve.point(nx,ny,nz)};Point.prototype.dbl=function dbl(){if(this.isInfinity())
        return this;if(this.curve.extended)
        return this._extDbl();else return this._projDbl()};Point.prototype._extAdd=function _extAdd(p){var a=this.y.redSub(this.x).redMul(p.y.redSub(p.x));var b=this.y.redAdd(this.x).redMul(p.y.redAdd(p.x));var c=this.t.redMul(this.curve.dd).redMul(p.t);var d=this.z.redMul(p.z.redAdd(p.z));var e=b.redSub(a);var f=d.redSub(c);var g=d.redAdd(c);var h=b.redAdd(a);var nx=e.redMul(f);var ny=g.redMul(h);var nt=e.redMul(h);var nz=f.redMul(g);return this.curve.point(nx,ny,nz,nt)};Point.prototype._projAdd=function _projAdd(p){var a=this.z.redMul(p.z);var b=a.redSqr();var c=this.x.redMul(p.x);var d=this.y.redMul(p.y);var e=this.curve.d.redMul(c).redMul(d);var f=b.redSub(e);var g=b.redAdd(e);var tmp=this.x.redAdd(this.y).redMul(p.x.redAdd(p.y)).redISub(c).redISub(d);var nx=a.redMul(f).redMul(tmp);var ny;var nz;if(this.curve.twisted){ny=a.redMul(g).redMul(d.redSub(this.curve._mulA(c)));nz=f.redMul(g)}else{ny=a.redMul(g).redMul(d.redSub(c));nz=this.curve._mulC(f).redMul(g)}
        return this.curve.point(nx,ny,nz)};Point.prototype.add=function add(p){if(this.isInfinity())
        return p;if(p.isInfinity())
        return this;if(this.curve.extended)
        return this._extAdd(p);else return this._projAdd(p)};Point.prototype.mul=function mul(k){if(this._hasDoubles(k))
        return this.curve._fixedNafMul(this,k);else return this.curve._wnafMul(this,k)};Point.prototype.mulAdd=function mulAdd(k1,p,k2){return this.curve._wnafMulAdd(1,[this,p],[k1,k2],2)};Point.prototype.normalize=function normalize(){if(this.zOne)
        return this;var zi=this.z.redInvm();this.x=this.x.redMul(zi);this.y=this.y.redMul(zi);if(this.t)
        this.t=this.t.redMul(zi);this.z=this.curve.one;this.zOne=!0;return this};Point.prototype.neg=function neg(){return this.curve.point(this.x.redNeg(),this.y,this.z,this.t&&this.t.redNeg())};Point.prototype.getX=function getX(){this.normalize();return this.x.fromRed()};Point.prototype.getY=function getY(){this.normalize();return this.y.fromRed()};Point.prototype.eq=function eq(other){return this===other||this.getX().cmp(other.getX())===0&&this.getY().cmp(other.getY())===0};Point.prototype.toP=Point.prototype.normalize;Point.prototype.mixedAdd=Point.prototype.add},{"../../elliptic":41,"../curve":44,"bn.js":38,"inherits":64}],44:[function(require,module,exports){arguments[4][15][0].apply(exports,arguments)},{"./base":42,"./edwards":43,"./mont":45,"./short":46,"dup":15}],45:[function(require,module,exports){'use strict';var curve=require('../curve');var bn=require('bn.js');var inherits=require('inherits');var Base=curve.base;var elliptic=require('../../elliptic');var utils=elliptic.utils;function MontCurve(conf){Base.call(this,'mont',conf);this.a=new bn(conf.a,16).toRed(this.red);this.b=new bn(conf.b,16).toRed(this.red);this.i4=new bn(4).toRed(this.red).redInvm();this.two=new bn(2).toRed(this.red);this.a24=this.i4.redMul(this.a.redAdd(this.two))}
    inherits(MontCurve,Base);module.exports=MontCurve;MontCurve.prototype.validate=function validate(point){var x=point.normalize().x;var x2=x.redSqr();var rhs=x2.redMul(x).redAdd(x2.redMul(this.a)).redAdd(x);var y=rhs.redSqrt();return y.redSqr().cmp(rhs)===0};function Point(curve,x,z){Base.BasePoint.call(this,curve,'projective');if(x===null&&z===null){this.x=this.curve.one;this.z=this.curve.zero}else{this.x=new bn(x,16);this.z=new bn(z,16);if(!this.x.red)
        this.x=this.x.toRed(this.curve.red);if(!this.z.red)
        this.z=this.z.toRed(this.curve.red)}}
    inherits(Point,Base.BasePoint);MontCurve.prototype.decodePoint=function decodePoint(bytes,enc){return this.point(utils.toArray(bytes,enc),1)};MontCurve.prototype.point=function point(x,z){return new Point(this,x,z)};MontCurve.prototype.pointFromJSON=function pointFromJSON(obj){return Point.fromJSON(this,obj)};Point.prototype.precompute=function precompute(){};Point.prototype._encode=function _encode(){return this.getX().toArray('be',this.curve.p.byteLength())};Point.fromJSON=function fromJSON(curve,obj){return new Point(curve,obj[0],obj[1]||curve.one)};Point.prototype.inspect=function inspect(){if(this.isInfinity())
        return'<EC Point Infinity>';return'<EC Point x: '+this.x.fromRed().toString(16,2)+' z: '+this.z.fromRed().toString(16,2)+'>'};Point.prototype.isInfinity=function isInfinity(){return this.z.cmpn(0)===0};Point.prototype.dbl=function dbl(){var a=this.x.redAdd(this.z);var aa=a.redSqr();var b=this.x.redSub(this.z);var bb=b.redSqr();var c=aa.redSub(bb);var nx=aa.redMul(bb);var nz=c.redMul(bb.redAdd(this.curve.a24.redMul(c)));return this.curve.point(nx,nz)};Point.prototype.add=function add(){throw new Error('Not supported on Montgomery curve')};Point.prototype.diffAdd=function diffAdd(p,diff){var a=this.x.redAdd(this.z);var b=this.x.redSub(this.z);var c=p.x.redAdd(p.z);var d=p.x.redSub(p.z);var da=d.redMul(a);var cb=c.redMul(b);var nx=diff.z.redMul(da.redAdd(cb).redSqr());var nz=diff.x.redMul(da.redISub(cb).redSqr());return this.curve.point(nx,nz)};Point.prototype.mul=function mul(k){var t=k.clone();var a=this;var b=this.curve.point(null,null);var c=this;for(var bits=[];t.cmpn(0)!==0;t.iushrn(1))
        bits.push(t.andln(1));for(var i=bits.length-1;i>=0;i--){if(bits[i]===0){a=a.diffAdd(b,c);b=b.dbl()}else{b=a.diffAdd(b,c);a=a.dbl()}}
        return b};Point.prototype.mulAdd=function mulAdd(){throw new Error('Not supported on Montgomery curve')};Point.prototype.eq=function eq(other){return this.getX().cmp(other.getX())===0};Point.prototype.normalize=function normalize(){this.x=this.x.redMul(this.z.redInvm());this.z=this.curve.one;return this};Point.prototype.getX=function getX(){this.normalize();return this.x.fromRed()}},{"../../elliptic":41,"../curve":44,"bn.js":38,"inherits":64}],46:[function(require,module,exports){'use strict';var curve=require('../curve');var elliptic=require('../../elliptic');var bn=require('bn.js');var inherits=require('inherits');var Base=curve.base;var assert=elliptic.utils.assert;function ShortCurve(conf){Base.call(this,'short',conf);this.a=new bn(conf.a,16).toRed(this.red);this.b=new bn(conf.b,16).toRed(this.red);this.tinv=this.two.redInvm();this.zeroA=this.a.fromRed().cmpn(0)===0;this.threeA=this.a.fromRed().sub(this.p).cmpn(-3)===0;this.endo=this._getEndomorphism(conf);this._endoWnafT1=new Array(4);this._endoWnafT2=new Array(4)}
    inherits(ShortCurve,Base);module.exports=ShortCurve;ShortCurve.prototype._getEndomorphism=function _getEndomorphism(conf){if(!this.zeroA||!this.g||!this.n||this.p.modn(3)!==1)
        return;var beta;var lambda;if(conf.beta){beta=new bn(conf.beta,16).toRed(this.red)}else{var betas=this._getEndoRoots(this.p);beta=betas[0].cmp(betas[1])<0?betas[0]:betas[1];beta=beta.toRed(this.red)}
        if(conf.lambda){lambda=new bn(conf.lambda,16)}else{var lambdas=this._getEndoRoots(this.n);if(this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta))===0){lambda=lambdas[0]}else{lambda=lambdas[1];assert(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta))===0)}}
        var basis;if(conf.basis){basis=conf.basis.map(function(vec){return{a:new bn(vec.a,16),b:new bn(vec.b,16)}})}else{basis=this._getEndoBasis(lambda)}
        return{beta:beta,lambda:lambda,basis:basis}};ShortCurve.prototype._getEndoRoots=function _getEndoRoots(num){var red=num===this.p?this.red:bn.mont(num);var tinv=new bn(2).toRed(red).redInvm();var ntinv=tinv.redNeg();var s=new bn(3).toRed(red).redNeg().redSqrt().redMul(tinv);var l1=ntinv.redAdd(s).fromRed();var l2=ntinv.redSub(s).fromRed();return[l1,l2]};ShortCurve.prototype._getEndoBasis=function _getEndoBasis(lambda){var aprxSqrt=this.n.ushrn(Math.floor(this.n.bitLength()/2));var u=lambda;var v=this.n.clone();var x1=new bn(1);var y1=new bn(0);var x2=new bn(0);var y2=new bn(1);var a0;var b0;var a1;var b1;var a2;var b2;var prevR;var i=0;var r;var x;while(u.cmpn(0)!==0){var q=v.div(u);r=v.sub(q.mul(u));x=x2.sub(q.mul(x1));var y=y2.sub(q.mul(y1));if(!a1&&r.cmp(aprxSqrt)<0){a0=prevR.neg();b0=x1;a1=r.neg();b1=x}else if(a1&&++i===2){break}
        prevR=r;v=u;u=r;x2=x1;x1=x;y2=y1;y1=y}
        a2=r.neg();b2=x;var len1=a1.sqr().add(b1.sqr());var len2=a2.sqr().add(b2.sqr());if(len2.cmp(len1)>=0){a2=a0;b2=b0}
        if(a1.sign){a1=a1.neg();b1=b1.neg()}
        if(a2.sign){a2=a2.neg();b2=b2.neg()}
        return[{a:a1,b:b1},{a:a2,b:b2}]};ShortCurve.prototype._endoSplit=function _endoSplit(k){var basis=this.endo.basis;var v1=basis[0];var v2=basis[1];var c1=v2.b.mul(k).divRound(this.n);var c2=v1.b.neg().mul(k).divRound(this.n);var p1=c1.mul(v1.a);var p2=c2.mul(v2.a);var q1=c1.mul(v1.b);var q2=c2.mul(v2.b);var k1=k.sub(p1).sub(p2);var k2=q1.add(q2).neg();return{k1:k1,k2:k2}};ShortCurve.prototype.pointFromX=function pointFromX(x,odd){x=new bn(x,16);if(!x.red)
        x=x.toRed(this.red);var y2=x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b);var y=y2.redSqrt();var isOdd=y.fromRed().isOdd();if(odd&&!isOdd||!odd&&isOdd)
        y=y.redNeg();return this.point(x,y)};ShortCurve.prototype.validate=function validate(point){if(point.inf)
        return!0;var x=point.x;var y=point.y;var ax=this.a.redMul(x);var rhs=x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);return y.redSqr().redISub(rhs).cmpn(0)===0};ShortCurve.prototype._endoWnafMulAdd=function _endoWnafMulAdd(points,coeffs){var npoints=this._endoWnafT1;var ncoeffs=this._endoWnafT2;for(var i=0;i<points.length;i++){var split=this._endoSplit(coeffs[i]);var p=points[i];var beta=p._getBeta();if(split.k1.sign){split.k1.sign=!split.k1.sign;p=p.neg(!0)}
        if(split.k2.sign){split.k2.sign=!split.k2.sign;beta=beta.neg(!0)}
        npoints[i*2]=p;npoints[i*2+1]=beta;ncoeffs[i*2]=split.k1;ncoeffs[i*2+1]=split.k2}
        var res=this._wnafMulAdd(1,npoints,ncoeffs,i*2);for(var j=0;j<i*2;j++){npoints[j]=null;ncoeffs[j]=null}
        return res};function Point(curve,x,y,isRed){Base.BasePoint.call(this,curve,'affine');if(x===null&&y===null){this.x=null;this.y=null;this.inf=!0}else{this.x=new bn(x,16);this.y=new bn(y,16);if(isRed){this.x.forceRed(this.curve.red);this.y.forceRed(this.curve.red)}
        if(!this.x.red)
            this.x=this.x.toRed(this.curve.red);if(!this.y.red)
            this.y=this.y.toRed(this.curve.red);this.inf=!1}}
    inherits(Point,Base.BasePoint);ShortCurve.prototype.point=function point(x,y,isRed){return new Point(this,x,y,isRed)};ShortCurve.prototype.pointFromJSON=function pointFromJSON(obj,red){return Point.fromJSON(this,obj,red)};Point.prototype._getBeta=function _getBeta(){if(!this.curve.endo)
        return;var pre=this.precomputed;if(pre&&pre.beta)
        return pre.beta;var beta=this.curve.point(this.x.redMul(this.curve.endo.beta),this.y);if(pre){var curve=this.curve;var endoMul=function(p){return curve.point(p.x.redMul(curve.endo.beta),p.y)};pre.beta=beta;beta.precomputed={beta:null,naf:pre.naf&&{wnd:pre.naf.wnd,points:pre.naf.points.map(endoMul)},doubles:pre.doubles&&{step:pre.doubles.step,points:pre.doubles.points.map(endoMul)}}}
        return beta};Point.prototype.toJSON=function toJSON(){if(!this.precomputed)
        return[this.x,this.y];return[this.x,this.y,this.precomputed&&{doubles:this.precomputed.doubles&&{step:this.precomputed.doubles.step,points:this.precomputed.doubles.points.slice(1)},naf:this.precomputed.naf&&{wnd:this.precomputed.naf.wnd,points:this.precomputed.naf.points.slice(1)}}]};Point.fromJSON=function fromJSON(curve,obj,red){if(typeof obj==='string')
        obj=JSON.parse(obj);var res=curve.point(obj[0],obj[1],red);if(!obj[2])
        return res;function obj2point(obj){return curve.point(obj[0],obj[1],red)}
        var pre=obj[2];res.precomputed={beta:null,doubles:pre.doubles&&{step:pre.doubles.step,points:[res].concat(pre.doubles.points.map(obj2point))},naf:pre.naf&&{wnd:pre.naf.wnd,points:[res].concat(pre.naf.points.map(obj2point))}};return res};Point.prototype.inspect=function inspect(){if(this.isInfinity())
        return'<EC Point Infinity>';return'<EC Point x: '+this.x.fromRed().toString(16,2)+' y: '+this.y.fromRed().toString(16,2)+'>'};Point.prototype.isInfinity=function isInfinity(){return this.inf};Point.prototype.add=function add(p){if(this.inf)
        return p;if(p.inf)
        return this;if(this.eq(p))
        return this.dbl();if(this.neg().eq(p))
        return this.curve.point(null,null);if(this.x.cmp(p.x)===0)
        return this.curve.point(null,null);var c=this.y.redSub(p.y);if(c.cmpn(0)!==0)
        c=c.redMul(this.x.redSub(p.x).redInvm());var nx=c.redSqr().redISub(this.x).redISub(p.x);var ny=c.redMul(this.x.redSub(nx)).redISub(this.y);return this.curve.point(nx,ny)};Point.prototype.dbl=function dbl(){if(this.inf)
        return this;var ys1=this.y.redAdd(this.y);if(ys1.cmpn(0)===0)
        return this.curve.point(null,null);var a=this.curve.a;var x2=this.x.redSqr();var dyinv=ys1.redInvm();var c=x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv);var nx=c.redSqr().redISub(this.x.redAdd(this.x));var ny=c.redMul(this.x.redSub(nx)).redISub(this.y);return this.curve.point(nx,ny)};Point.prototype.getX=function getX(){return this.x.fromRed()};Point.prototype.getY=function getY(){return this.y.fromRed()};Point.prototype.mul=function mul(k){k=new bn(k,16);if(this._hasDoubles(k))
        return this.curve._fixedNafMul(this,k);else if(this.curve.endo)
        return this.curve._endoWnafMulAdd([this],[k]);else return this.curve._wnafMul(this,k)};Point.prototype.mulAdd=function mulAdd(k1,p2,k2){var points=[this,p2];var coeffs=[k1,k2];if(this.curve.endo)
        return this.curve._endoWnafMulAdd(points,coeffs);else return this.curve._wnafMulAdd(1,points,coeffs,2)};Point.prototype.eq=function eq(p){return this===p||this.inf===p.inf&&(this.inf||this.x.cmp(p.x)===0&&this.y.cmp(p.y)===0)};Point.prototype.neg=function neg(_precompute){if(this.inf)
        return this;var res=this.curve.point(this.x,this.y.redNeg());if(_precompute&&this.precomputed){var pre=this.precomputed;var negate=function(p){return p.neg()};res.precomputed={naf:pre.naf&&{wnd:pre.naf.wnd,points:pre.naf.points.map(negate)},doubles:pre.doubles&&{step:pre.doubles.step,points:pre.doubles.points.map(negate)}}}
        return res};Point.prototype.toJ=function toJ(){if(this.inf)
        return this.curve.jpoint(null,null,null);var res=this.curve.jpoint(this.x,this.y,this.curve.one);return res};function JPoint(curve,x,y,z){Base.BasePoint.call(this,curve,'jacobian');if(x===null&&y===null&&z===null){this.x=this.curve.one;this.y=this.curve.one;this.z=new bn(0)}else{this.x=new bn(x,16);this.y=new bn(y,16);this.z=new bn(z,16)}
        if(!this.x.red)
            this.x=this.x.toRed(this.curve.red);if(!this.y.red)
            this.y=this.y.toRed(this.curve.red);if(!this.z.red)
            this.z=this.z.toRed(this.curve.red);this.zOne=this.z===this.curve.one}
    inherits(JPoint,Base.BasePoint);ShortCurve.prototype.jpoint=function jpoint(x,y,z){return new JPoint(this,x,y,z)};JPoint.prototype.toP=function toP(){if(this.isInfinity())
        return this.curve.point(null,null);var zinv=this.z.redInvm();var zinv2=zinv.redSqr();var ax=this.x.redMul(zinv2);var ay=this.y.redMul(zinv2).redMul(zinv);return this.curve.point(ax,ay)};JPoint.prototype.neg=function neg(){return this.curve.jpoint(this.x,this.y.redNeg(),this.z)};JPoint.prototype.add=function add(p){if(this.isInfinity())
        return p;if(p.isInfinity())
        return this;var pz2=p.z.redSqr();var z2=this.z.redSqr();var u1=this.x.redMul(pz2);var u2=p.x.redMul(z2);var s1=this.y.redMul(pz2.redMul(p.z));var s2=p.y.redMul(z2.redMul(this.z));var h=u1.redSub(u2);var r=s1.redSub(s2);if(h.cmpn(0)===0){if(r.cmpn(0)!==0)
        return this.curve.jpoint(null,null,null);else return this.dbl()}
        var h2=h.redSqr();var h3=h2.redMul(h);var v=u1.redMul(h2);var nx=r.redSqr().redIAdd(h3).redISub(v).redISub(v);var ny=r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));var nz=this.z.redMul(p.z).redMul(h);return this.curve.jpoint(nx,ny,nz)};JPoint.prototype.mixedAdd=function mixedAdd(p){if(this.isInfinity())
        return p.toJ();if(p.isInfinity())
        return this;var z2=this.z.redSqr();var u1=this.x;var u2=p.x.redMul(z2);var s1=this.y;var s2=p.y.redMul(z2).redMul(this.z);var h=u1.redSub(u2);var r=s1.redSub(s2);if(h.cmpn(0)===0){if(r.cmpn(0)!==0)
        return this.curve.jpoint(null,null,null);else return this.dbl()}
        var h2=h.redSqr();var h3=h2.redMul(h);var v=u1.redMul(h2);var nx=r.redSqr().redIAdd(h3).redISub(v).redISub(v);var ny=r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));var nz=this.z.redMul(h);return this.curve.jpoint(nx,ny,nz)};JPoint.prototype.dblp=function dblp(pow){if(pow===0)
        return this;if(this.isInfinity())
        return this;if(!pow)
        return this.dbl();if(this.curve.zeroA||this.curve.threeA){var r=this;for(var i=0;i<pow;i++)
        r=r.dbl();return r}
        var a=this.curve.a;var tinv=this.curve.tinv;var jx=this.x;var jy=this.y;var jz=this.z;var jz4=jz.redSqr().redSqr();var jyd=jy.redAdd(jy);for(var i=0;i<pow;i++){var jx2=jx.redSqr();var jyd2=jyd.redSqr();var jyd4=jyd2.redSqr();var c=jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));var t1=jx.redMul(jyd2);var nx=c.redSqr().redISub(t1.redAdd(t1));var t2=t1.redISub(nx);var dny=c.redMul(t2);dny=dny.redIAdd(dny).redISub(jyd4);var nz=jyd.redMul(jz);if(i+1<pow)
            jz4=jz4.redMul(jyd4);jx=nx;jz=nz;jyd=dny}
        return this.curve.jpoint(jx,jyd.redMul(tinv),jz)};JPoint.prototype.dbl=function dbl(){if(this.isInfinity())
        return this;if(this.curve.zeroA)
        return this._zeroDbl();else if(this.curve.threeA)
        return this._threeDbl();else return this._dbl()};JPoint.prototype._zeroDbl=function _zeroDbl(){var nx;var ny;var nz;if(this.zOne){var xx=this.x.redSqr();var yy=this.y.redSqr();var yyyy=yy.redSqr();var s=this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);s=s.redIAdd(s);var m=xx.redAdd(xx).redIAdd(xx);var t=m.redSqr().redISub(s).redISub(s);var yyyy8=yyyy.redIAdd(yyyy);yyyy8=yyyy8.redIAdd(yyyy8);yyyy8=yyyy8.redIAdd(yyyy8);nx=t;ny=m.redMul(s.redISub(t)).redISub(yyyy8);nz=this.y.redAdd(this.y)}else{var a=this.x.redSqr();var b=this.y.redSqr();var c=b.redSqr();var d=this.x.redAdd(b).redSqr().redISub(a).redISub(c);d=d.redIAdd(d);var e=a.redAdd(a).redIAdd(a);var f=e.redSqr();var c8=c.redIAdd(c);c8=c8.redIAdd(c8);c8=c8.redIAdd(c8);nx=f.redISub(d).redISub(d);ny=e.redMul(d.redISub(nx)).redISub(c8);nz=this.y.redMul(this.z);nz=nz.redIAdd(nz)}
        return this.curve.jpoint(nx,ny,nz)};JPoint.prototype._threeDbl=function _threeDbl(){var nx;var ny;var nz;if(this.zOne){var xx=this.x.redSqr();var yy=this.y.redSqr();var yyyy=yy.redSqr();var s=this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);s=s.redIAdd(s);var m=xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a);var t=m.redSqr().redISub(s).redISub(s);nx=t;var yyyy8=yyyy.redIAdd(yyyy);yyyy8=yyyy8.redIAdd(yyyy8);yyyy8=yyyy8.redIAdd(yyyy8);ny=m.redMul(s.redISub(t)).redISub(yyyy8);nz=this.y.redAdd(this.y)}else{var delta=this.z.redSqr();var gamma=this.y.redSqr();var beta=this.x.redMul(gamma);var alpha=this.x.redSub(delta).redMul(this.x.redAdd(delta));alpha=alpha.redAdd(alpha).redIAdd(alpha);var beta4=beta.redIAdd(beta);beta4=beta4.redIAdd(beta4);var beta8=beta4.redAdd(beta4);nx=alpha.redSqr().redISub(beta8);nz=this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta);var ggamma8=gamma.redSqr();ggamma8=ggamma8.redIAdd(ggamma8);ggamma8=ggamma8.redIAdd(ggamma8);ggamma8=ggamma8.redIAdd(ggamma8);ny=alpha.redMul(beta4.redISub(nx)).redISub(ggamma8)}
        return this.curve.jpoint(nx,ny,nz)};JPoint.prototype._dbl=function _dbl(){var a=this.curve.a;var jx=this.x;var jy=this.y;var jz=this.z;var jz4=jz.redSqr().redSqr();var jx2=jx.redSqr();var jy2=jy.redSqr();var c=jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));var jxd4=jx.redAdd(jx);jxd4=jxd4.redIAdd(jxd4);var t1=jxd4.redMul(jy2);var nx=c.redSqr().redISub(t1.redAdd(t1));var t2=t1.redISub(nx);var jyd8=jy2.redSqr();jyd8=jyd8.redIAdd(jyd8);jyd8=jyd8.redIAdd(jyd8);jyd8=jyd8.redIAdd(jyd8);var ny=c.redMul(t2).redISub(jyd8);var nz=jy.redAdd(jy).redMul(jz);return this.curve.jpoint(nx,ny,nz)};JPoint.prototype.trpl=function trpl(){if(!this.curve.zeroA)
        return this.dbl().add(this);var xx=this.x.redSqr();var yy=this.y.redSqr();var zz=this.z.redSqr();var yyyy=yy.redSqr();var m=xx.redAdd(xx).redIAdd(xx);var mm=m.redSqr();var e=this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);e=e.redIAdd(e);e=e.redAdd(e).redIAdd(e);e=e.redISub(mm);var ee=e.redSqr();var t=yyyy.redIAdd(yyyy);t=t.redIAdd(t);t=t.redIAdd(t);t=t.redIAdd(t);var u=m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t);var yyu4=yy.redMul(u);yyu4=yyu4.redIAdd(yyu4);yyu4=yyu4.redIAdd(yyu4);var nx=this.x.redMul(ee).redISub(yyu4);nx=nx.redIAdd(nx);nx=nx.redIAdd(nx);var ny=this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)));ny=ny.redIAdd(ny);ny=ny.redIAdd(ny);ny=ny.redIAdd(ny);var nz=this.z.redAdd(e).redSqr().redISub(zz).redISub(ee);return this.curve.jpoint(nx,ny,nz)};JPoint.prototype.mul=function mul(k,kbase){k=new bn(k,kbase);return this.curve._wnafMul(this,k)};JPoint.prototype.eq=function eq(p){if(p.type==='affine')
        return this.eq(p.toJ());if(this===p)
        return!0;var z2=this.z.redSqr();var pz2=p.z.redSqr();if(this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0)!==0)
        return!1;var z3=z2.redMul(this.z);var pz3=pz2.redMul(p.z);return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0)===0};JPoint.prototype.inspect=function inspect(){if(this.isInfinity())
        return'<EC JPoint Infinity>';return'<EC JPoint x: '+this.x.toString(16,2)+' y: '+this.y.toString(16,2)+' z: '+this.z.toString(16,2)+'>'};JPoint.prototype.isInfinity=function isInfinity(){return this.z.cmpn(0)===0}},{"../../elliptic":41,"../curve":44,"bn.js":38,"inherits":64}],47:[function(require,module,exports){arguments[4][18][0].apply(exports,arguments)},{"../elliptic":41,"./precomputed/secp256k1":55,"dup":18,"hash.js":58}],48:[function(require,module,exports){'use strict';var bn=require('bn.js');var elliptic=require('../../elliptic');var utils=elliptic.utils;var assert=utils.assert;var KeyPair=require('./key');var Signature=require('./signature');function EC(options){if(!(this instanceof EC))
    return new EC(options);if(typeof options==='string'){assert(elliptic.curves.hasOwnProperty(options),'Unknown curve '+options);options=elliptic.curves[options]}
    if(options instanceof elliptic.curves.PresetCurve)
        options={curve:options};this.curve=options.curve.curve;this.n=this.curve.n;this.nh=this.n.ushrn(1);this.g=this.curve.g;this.g=options.curve.g;this.g.precompute(options.curve.n.bitLength()+1);this.hash=options.hash||options.curve.hash}
    module.exports=EC;EC.prototype.keyPair=function keyPair(options){return new KeyPair(this,options)};EC.prototype.keyFromPrivate=function keyFromPrivate(priv,enc){return KeyPair.fromPrivate(this,priv,enc)};EC.prototype.keyFromPublic=function keyFromPublic(pub,enc){return KeyPair.fromPublic(this,pub,enc)};EC.prototype.genKeyPair=function genKeyPair(options){if(!options)
        options={};var drbg=new elliptic.hmacDRBG({hash:this.hash,pers:options.pers,entropy:options.entropy||elliptic.rand(this.hash.hmacStrength),nonce:this.n.toArray()});var bytes=this.n.byteLength();var ns2=this.n.sub(new bn(2));do{var priv=new bn(drbg.generate(bytes));if(priv.cmp(ns2)>0)
        continue;priv.iaddn(1);return this.keyFromPrivate(priv)}while(!0)};EC.prototype._truncateToN=function truncateToN(msg,truncOnly){var delta=msg.byteLength()*8-this.n.bitLength();if(delta>0)
        msg=msg.ushrn(delta);if(!truncOnly&&msg.cmp(this.n)>=0)
        return msg.sub(this.n);else return msg};EC.prototype.sign=function sign(msg,key,enc,options){if(typeof enc==='object'){options=enc;enc=null}
        if(!options)
            options={};key=this.keyFromPrivate(key,enc);msg=this._truncateToN(new bn(msg,16));var bytes=this.n.byteLength();var bkey=key.getPrivate().toArray();for(var i=bkey.length;i<21;i++)
            bkey.unshift(0);var nonce=msg.toArray();for(var i=nonce.length;i<bytes;i++)
            nonce.unshift(0);var drbg=new elliptic.hmacDRBG({hash:this.hash,entropy:bkey,nonce:nonce});var ns1=this.n.sub(new bn(1));do{var k=new bn(drbg.generate(this.n.byteLength()));k=this._truncateToN(k,!0);if(k.cmpn(1)<=0||k.cmp(ns1)>=0)
            continue;var kp=this.g.mul(k);if(kp.isInfinity())
            continue;var kpX=kp.getX();var r=kpX.umod(this.n);if(r.cmpn(0)===0)
            continue;var s=k.invm(this.n).mul(r.mul(key.getPrivate()).iadd(msg));s=s.umod(this.n);if(s.cmpn(0)===0)
            continue;if(options.canonical&&s.cmp(this.nh)>0)
            s=this.n.sub(s);var recoveryParam=(kp.getY().isOdd()?1:0)|(kpX.cmp(r)!==0?2:0);return new Signature({r:r,s:s,recoveryParam:recoveryParam})}while(!0)};EC.prototype.verify=function verify(msg,signature,key,enc){msg=this._truncateToN(new bn(msg,16));key=this.keyFromPublic(key,enc);signature=new Signature(signature,'hex');var r=signature.r;var s=signature.s;if(r.cmpn(1)<0||r.cmp(this.n)>=0)
        return!1;if(s.cmpn(1)<0||s.cmp(this.n)>=0)
        return!1;var sinv=s.invm(this.n);var u1=sinv.mul(msg).umod(this.n);var u2=sinv.mul(r).umod(this.n);var p=this.g.mulAdd(u1,key.getPublic(),u2);if(p.isInfinity())
        return!1;return p.getX().umod(this.n).cmp(r)===0};EC.prototype.recoverPubKey=function(msg,signature,j,enc){assert((3&j)===j,'The recovery param is more than two bits');signature=new Signature(signature,enc);var n=this.n;var e=new bn(msg);var r=signature.r;var s=signature.s;var isYOdd=j&1;var isSecondKey=j>>1;if(r.cmp(this.curve.p.umod(this.curve.n))>=0&&isSecondKey)
        throw new Error('Unable to find sencond key candinate');r=this.curve.pointFromX(r,isYOdd);var eNeg=e.neg().umod(n);var rInv=signature.r.invm(n);return r.mul(s).add(this.g.mul(eNeg)).mul(rInv)};EC.prototype.getKeyRecoveryParam=function(e,signature,Q,enc){signature=new Signature(signature,enc);if(signature.recoveryParam!==null)
        return signature.recoveryParam;for(var i=0;i<4;i++){var Qprime=this.recoverPubKey(e,signature,i);if(Qprime.eq(Q))
        return i}
        throw new Error('Unable to find valid recovery factor')}},{"../../elliptic":41,"./key":49,"./signature":50,"bn.js":38}],49:[function(require,module,exports){'use strict';var bn=require('bn.js');function KeyPair(ec,options){this.ec=ec;this.priv=null;this.pub=null;if(options.priv)
    this._importPrivate(options.priv,options.privEnc);if(options.pub)
    this._importPublic(options.pub,options.pubEnc)}
    module.exports=KeyPair;KeyPair.fromPublic=function fromPublic(ec,pub,enc){if(pub instanceof KeyPair)
        return pub;return new KeyPair(ec,{pub:pub,pubEnc:enc})};KeyPair.fromPrivate=function fromPrivate(ec,priv,enc){if(priv instanceof KeyPair)
        return priv;return new KeyPair(ec,{priv:priv,privEnc:enc})};KeyPair.prototype.validate=function validate(){var pub=this.getPublic();if(pub.isInfinity())
        return{result:!1,reason:'Invalid public key'};if(!pub.validate())
        return{result:!1,reason:'Public key is not a point'};if(!pub.mul(this.ec.curve.n).isInfinity())
        return{result:!1,reason:'Public key * N != O'};return{result:!0,reason:null}};KeyPair.prototype.getPublic=function getPublic(compact,enc){if(typeof compact==='string'){enc=compact;compact=null}
        if(!this.pub)
            this.pub=this.ec.g.mul(this.priv);if(!enc)
            return this.pub;return this.pub.encode(enc,compact)};KeyPair.prototype.getPrivate=function getPrivate(enc){if(enc==='hex')
        return this.priv.toString(16,2);else return this.priv};KeyPair.prototype._importPrivate=function _importPrivate(key,enc){this.priv=new bn(key,enc||16);this.priv=this.priv.umod(this.ec.curve.n)};KeyPair.prototype._importPublic=function _importPublic(key,enc){if(key.x||key.y){this.pub=this.ec.curve.point(key.x,key.y);return}
        this.pub=this.ec.curve.decodePoint(key,enc)};KeyPair.prototype.derive=function derive(pub){return pub.mul(this.priv).getX()};KeyPair.prototype.sign=function sign(msg,enc,options){return this.ec.sign(msg,this,enc,options)};KeyPair.prototype.verify=function verify(msg,signature){return this.ec.verify(msg,signature,this)};KeyPair.prototype.inspect=function inspect(){return'<Key priv: '+(this.priv&&this.priv.toString(16,2))+' pub: '+(this.pub&&this.pub.inspect())+' >'}},{"bn.js":38}],50:[function(require,module,exports){arguments[4][21][0].apply(exports,arguments)},{"../../elliptic":41,"bn.js":38,"dup":21}],51:[function(require,module,exports){'use strict';var hash=require('hash.js');var elliptic=require('../../elliptic');var utils=elliptic.utils;var assert=utils.assert;var parseBytes=utils.parseBytes;var KeyPair=require('./key');var Signature=require('./signature');function EDDSA(curve){assert(curve==='ed25519','only tested with ed25519 so far');if(!(this instanceof EDDSA))
    return new EDDSA(curve);var curve=elliptic.curves[curve].curve;this.curve=curve;this.g=curve.g;this.g.precompute(curve.n.bitLength()+1);this.pointClass=curve.point().constructor;this.encodingLength=Math.ceil(curve.n.bitLength()/8);this.hash=hash.sha512}
    module.exports=EDDSA;EDDSA.prototype.sign=function sign(message,secret){message=parseBytes(message);var key=this.keyFromSecret(secret);var r=this.hashInt(key.messagePrefix(),message);var R=this.g.mul(r);var Rencoded=this.encodePoint(R);var s_=this.hashInt(Rencoded,key.pubBytes(),message).mul(key.priv());var S=r.add(s_).umod(this.curve.n);return this.makeSignature({R:R,S:S,Rencoded:Rencoded})};EDDSA.prototype.verify=function verify(message,sig,pub){message=parseBytes(message);sig=this.makeSignature(sig);var key=this.keyFromPublic(pub);var h=this.hashInt(sig.Rencoded(),key.pubBytes(),message);var SG=this.g.mul(sig.S());var RplusAh=sig.R().add(key.pub().mul(h));return RplusAh.eq(SG)};EDDSA.prototype.hashInt=function hashInt(){var hash=this.hash();for(var i=0;i<arguments.length;i++)
        hash.update(arguments[i]);return utils.intFromLE(hash.digest()).umod(this.curve.n)};EDDSA.prototype.keyFromPublic=function keyFromPublic(pub){return KeyPair.fromPublic(this,pub)};EDDSA.prototype.keyFromSecret=function keyFromSecret(secret){return KeyPair.fromSecret(this,secret)};EDDSA.prototype.makeSignature=function makeSignature(sig){if(sig instanceof Signature)
        return sig;return new Signature(this,sig)};EDDSA.prototype.encodePoint=function encodePoint(point){var enc=point.getY().toArray('le',this.encodingLength);enc[this.encodingLength-1]|=point.getX().isOdd()?0x80:0;return enc};EDDSA.prototype.decodePoint=function decodePoint(bytes){bytes=utils.parseBytes(bytes);var lastIx=bytes.length-1;var normed=bytes.slice(0,lastIx).concat(bytes[lastIx]&~0x80);var xIsOdd=(bytes[lastIx]&0x80)!==0;var y=utils.intFromLE(normed);return this.curve.pointFromY(y,xIsOdd)};EDDSA.prototype.encodeInt=function encodeInt(num){return num.toArray('le',this.encodingLength)};EDDSA.prototype.decodeInt=function decodeInt(bytes){return utils.intFromLE(bytes)};EDDSA.prototype.isPoint=function isPoint(val){return val instanceof this.pointClass}},{"../../elliptic":41,"./key":52,"./signature":53,"hash.js":58}],52:[function(require,module,exports){'use strict';var elliptic=require('../../elliptic');var utils=elliptic.utils;var assert=utils.assert;var parseBytes=utils.parseBytes;var lazyComputed=utils.lazyComputed;function KeyPair(eddsa,params){this.eddsa=eddsa;this._secret=parseBytes(params.secret);if(eddsa.isPoint(params.pub))
    this._pub=params.pub;else this._pubBytes=parseBytes(params.pub)}
    KeyPair.fromPublic=function fromPublic(eddsa,pub){if(pub instanceof KeyPair)
        return pub;return new KeyPair(eddsa,{pub:pub})};KeyPair.fromSecret=function fromSecret(eddsa,secret){if(secret instanceof KeyPair)
        return secret;return new KeyPair(eddsa,{secret:secret})};KeyPair.prototype.secret=function secret(){return this._secret};lazyComputed(KeyPair,'pubBytes',function pubBytes(){return this.eddsa.encodePoint(this.pub())});lazyComputed(KeyPair,'pub',function pub(){if(this._pubBytes)
        return this.eddsa.decodePoint(this._pubBytes);return this.eddsa.g.mul(this.priv())});lazyComputed(KeyPair,'privBytes',function privBytes(){var eddsa=this.eddsa;var hash=this.hash();var lastIx=eddsa.encodingLength-1;var a=hash.slice(0,eddsa.encodingLength);a[0]&=248;a[lastIx]&=127;a[lastIx]|=64;return a});lazyComputed(KeyPair,'priv',function priv(){return this.eddsa.decodeInt(this.privBytes())});lazyComputed(KeyPair,'hash',function hash(){return this.eddsa.hash().update(this.secret()).digest()});lazyComputed(KeyPair,'messagePrefix',function messagePrefix(){return this.hash().slice(this.eddsa.encodingLength)});KeyPair.prototype.sign=function sign(message){assert(this._secret,'KeyPair can only verify');return this.eddsa.sign(message,this)};KeyPair.prototype.verify=function verify(message,sig){return this.eddsa.verify(message,sig,this)};KeyPair.prototype.getSecret=function getSecret(enc){assert(this._secret,'KeyPair is public only');return utils.encode(this.secret(),enc)};KeyPair.prototype.getPublic=function getPublic(enc){return utils.encode(this.pubBytes(),enc)};module.exports=KeyPair},{"../../elliptic":41}],53:[function(require,module,exports){'use strict';var bn=require('bn.js');var elliptic=require('../../elliptic');var utils=elliptic.utils;var assert=utils.assert;var lazyComputed=utils.lazyComputed;var parseBytes=utils.parseBytes;function Signature(eddsa,sig){this.eddsa=eddsa;if(typeof sig!=='object')
    sig=parseBytes(sig);if(Array.isArray(sig)){sig={R:sig.slice(0,eddsa.encodingLength),S:sig.slice(eddsa.encodingLength)}}
    assert(sig.R&&sig.S,'Signature without R or S');if(eddsa.isPoint(sig.R))
        this._R=sig.R;if(sig.S instanceof bn)
        this._S=sig.S;this._Rencoded=Array.isArray(sig.R)?sig.R:sig.Rencoded;this._Sencoded=Array.isArray(sig.S)?sig.S:sig.Sencoded}
    lazyComputed(Signature,'S',function S(){return this.eddsa.decodeInt(this.Sencoded())});lazyComputed(Signature,'R',function S(){return this.eddsa.decodePoint(this.Rencoded())});lazyComputed(Signature,'Rencoded',function S(){return this.eddsa.encodePoint(this.R())});lazyComputed(Signature,'Sencoded',function S(){return this.eddsa.encodeInt(this.S())});Signature.prototype.toBytes=function toBytes(){return this.Rencoded().concat(this.Sencoded())};Signature.prototype.toHex=function toHex(){return utils.encode(this.toBytes(),'hex').toUpperCase()};module.exports=Signature},{"../../elliptic":41,"bn.js":38}],54:[function(require,module,exports){arguments[4][22][0].apply(exports,arguments)},{"../elliptic":41,"dup":22,"hash.js":58}],55:[function(require,module,exports){arguments[4][23][0].apply(exports,arguments)},{"dup":23}],56:[function(require,module,exports){'use strict';var utils=exports;var bn=require('bn.js');utils.assert=function assert(val,msg){if(!val)
    throw new Error(msg||'Assertion failed')};function toArray(msg,enc){if(Array.isArray(msg))
    return msg.slice();if(!msg)
    return[];var res=[];if(typeof msg!=='string'){for(var i=0;i<msg.length;i++)
    res[i]=msg[i]|0;return res}
    if(!enc){for(var i=0;i<msg.length;i++){var c=msg.charCodeAt(i);var hi=c>>8;var lo=c&0xff;if(hi)
        res.push(hi,lo);else res.push(lo)}}else if(enc==='hex'){msg=msg.replace(/[^a-z0-9]+/ig,'');if(msg.length%2!==0)
        msg='0'+msg;for(var i=0;i<msg.length;i+=2)
        res.push(parseInt(msg[i]+msg[i+1],16));}
    return res}
    utils.toArray=toArray;function zero2(word){if(word.length===1)
        return'0'+word;else return word}
    utils.zero2=zero2;function toHex(msg){var res='';for(var i=0;i<msg.length;i++)
        res+=zero2(msg[i].toString(16));return res}
    utils.toHex=toHex;utils.encode=function encode(arr,enc){if(enc==='hex')
        return toHex(arr);else return arr};function getNAF(num,w){var naf=[];var ws=1<<(w+1);var k=num.clone();while(k.cmpn(1)>=0){var z;if(k.isOdd()){var mod=k.andln(ws-1);if(mod>(ws>>1)-1)
        z=(ws>>1)-mod;else z=mod;k.isubn(z)}else{z=0}
        naf.push(z);var shift=(k.cmpn(0)!==0&&k.andln(ws-1)===0)?(w+1):1;for(var i=1;i<shift;i++)
            naf.push(0);k.iushrn(shift)}
        return naf}
    utils.getNAF=getNAF;function getJSF(k1,k2){var jsf=[[],[]];k1=k1.clone();k2=k2.clone();var d1=0;var d2=0;while(k1.cmpn(-d1)>0||k2.cmpn(-d2)>0){var m14=(k1.andln(3)+d1)&3;var m24=(k2.andln(3)+d2)&3;if(m14===3)
        m14=-1;if(m24===3)
        m24=-1;var u1;if((m14&1)===0){u1=0}else{var m8=(k1.andln(7)+d1)&7;if((m8===3||m8===5)&&m24===2)
        u1=-m14;else u1=m14}
        jsf[0].push(u1);var u2;if((m24&1)===0){u2=0}else{var m8=(k2.andln(7)+d2)&7;if((m8===3||m8===5)&&m14===2)
            u2=-m24;else u2=m24}
        jsf[1].push(u2);if(2*d1===u1+1)
            d1=1-d1;if(2*d2===u2+1)
            d2=1-d2;k1.iushrn(1);k2.iushrn(1)}
        return jsf}
    utils.getJSF=getJSF;function lazyComputed(obj,name,computer){var key='_'+name;obj.prototype[name]=function lazyComputed(){return this[key]!==undefined?this[key]:this[key]=computer.apply(this,arguments)}}
    utils.lazyComputed=lazyComputed;function parseBytes(bytes){return typeof bytes==='string'?utils.toArray(bytes,'hex'):bytes}
    utils.parseBytes=parseBytes;function intFromLE(bytes){return new bn(bytes,'hex','le')}
    utils.intFromLE=intFromLE},{"bn.js":38}],57:[function(require,module,exports){arguments[4][25][0].apply(exports,arguments)},{"dup":25}],58:[function(require,module,exports){arguments[4][26][0].apply(exports,arguments)},{"./hash/common":59,"./hash/hmac":60,"./hash/ripemd":61,"./hash/sha":62,"./hash/utils":63,"dup":26}],59:[function(require,module,exports){arguments[4][27][0].apply(exports,arguments)},{"../hash":58,"dup":27}],60:[function(require,module,exports){arguments[4][28][0].apply(exports,arguments)},{"../hash":58,"dup":28}],61:[function(require,module,exports){arguments[4][29][0].apply(exports,arguments)},{"../hash":58,"dup":29}],62:[function(require,module,exports){arguments[4][30][0].apply(exports,arguments)},{"../hash":58,"dup":30}],63:[function(require,module,exports){arguments[4][31][0].apply(exports,arguments)},{"dup":31,"inherits":64}],64:[function(require,module,exports){arguments[4][32][0].apply(exports,arguments)},{"dup":32}],65:[function(require,module,exports){module.exports={"name":"elliptic","version":"5.1.0","description":"EC cryptography","main":"lib/elliptic.js","scripts":{"test":"make lint && mocha --reporter=spec test/*-test.js"},"repository":{"type":"git","url":"git+ssh://git@github.com/indutny/elliptic.git"},"keywords":["EC","Elliptic","curve","Cryptography"],"author":{"name":"Fedor Indutny","email":"fedor@indutny.com"},"license":"MIT","bugs":{"url":"https://github.com/indutny/elliptic/issues"},"homepage":"https://github.com/indutny/elliptic","devDependencies":{"browserify":"^3.44.2","jscs":"^1.11.3","jshint":"^2.6.0","mocha":"^2.1.0","uglify-js":"^2.4.13"},"dependencies":{"bn.js":"^3.1.1","brorand":"^1.0.1","hash.js":"^1.0.0","inherits":"^2.0.1"},"gitHead":"4f12b8f6bcb16e38d4a038af2d963dc10d175bde","_id":"elliptic@5.1.0","_shasum":"5658dfa7625a6a8fc687a5b8f249376bb271e6e9","_from":"elliptic@^5.0.0","_npmVersion":"2.12.1","_nodeVersion":"2.3.4","_npmUser":{"name":"indutny","email":"fedor@indutny.com"},"maintainers":[{"name":"indutny","email":"fedor@indutny.com"}],"dist":{"shasum":"5658dfa7625a6a8fc687a5b8f249376bb271e6e9","tarball":"http://registry.npmjs.org/elliptic/-/elliptic-5.1.0.tgz"},"directories":{},"_resolved":"https://registry.npmjs.org/elliptic/-/elliptic-5.1.0.tgz","readme":"ERROR: No README data found!"}},{}],66:[function(require,module,exports){(function(Buffer){const assert=require('assert')
    exports.encode=function(input){if(input instanceof Array){var output=[]
        for(var i=0;i<input.length;i++){output.push(exports.encode(input[i]))}
        var buf=Buffer.concat(output)
        return Buffer.concat([encodeLength(buf.length,192),buf])}else{input=toBuffer(input)
        if(input.length===1&&input[0]<128){return input}else{return Buffer.concat([encodeLength(input.length,128),input])}}}
    function safeParseInt(v,base){if(v.slice(0,2)==='00'){throw(new Error('invalid RLP: extra zeros'))}
        return parseInt(v,base)}
    function encodeLength(len,offset){if(len<56){return new Buffer([len+offset])}else{var hexLength=intToHex(len)
        var lLength=hexLength.length/2
        var firstByte=intToHex(offset+55+lLength)
        return new Buffer(firstByte+hexLength,'hex')}}
    exports.decode=function(input,stream){if(!input||input.length===0){return new Buffer([])}
        input=toBuffer(input)
        var decoded=_decode(input)
        if(stream){return decoded}
        assert.equal(decoded.remainder.length,0,'invalid remainder')
        return decoded.data}
    exports.getLength=function(input){if(!input||input.length===0){return new Buffer([])}
        input=toBuffer(input)
        var firstByte=input[0]
        if(firstByte<=0x7f){return input.length}else if(firstByte<=0xb7){return firstByte-0x7f}else if(firstByte<=0xbf){return firstByte-0xb6}else if(firstByte<=0xf7){return firstByte-0xbf}else{var llength=firstByte-0xf6
            var length=safeParseInt(input.slice(1,llength).toString('hex'),16)
            return llength+length}}
    function _decode(input){var length,llength,data,innerRemainder,d
        var decoded=[]
        var firstByte=input[0]
        if(firstByte<=0x7f){return{data:input.slice(0,1),remainder:input.slice(1)}}else if(firstByte<=0xb7){length=firstByte-0x7f
            if(firstByte===0x80){data=new Buffer([])}else{data=input.slice(1,length)}
            if(length===2&&data[0]<0x80){throw new Error('invalid rlp encoding: byte must be less 0x80')}
            return{data:data,remainder:input.slice(length)}}else if(firstByte<=0xbf){llength=firstByte-0xb6
            length=safeParseInt(input.slice(1,llength).toString('hex'),16)
            data=input.slice(llength,length+llength)
            if(data.length<length){throw(new Error('invalid RLP'))}
            return{data:data,remainder:input.slice(length+llength)}}else if(firstByte<=0xf7){length=firstByte-0xbf
            innerRemainder=input.slice(1,length)
            while(innerRemainder.length){d=_decode(innerRemainder)
                decoded.push(d.data)
                innerRemainder=d.remainder}
            return{data:decoded,remainder:input.slice(length)}}else{llength=firstByte-0xf6
            length=safeParseInt(input.slice(1,llength).toString('hex'),16)
            var totalLength=llength+length
            if(totalLength>input.length){throw new Error('invalid rlp: total length is larger than the data')}
            innerRemainder=input.slice(llength,totalLength)
            if(innerRemainder.length===0){throw new Error('invalid rlp, List has a invalid length')}
            while(innerRemainder.length){d=_decode(innerRemainder)
                decoded.push(d.data)
                innerRemainder=d.remainder}
            return{data:decoded,remainder:input.slice(totalLength)}}}
    function isHexPrefixed(str){return str.slice(0,2)==='0x'}
    function stripHexPrefix(str){if(typeof str!=='string'){return str}
        return isHexPrefixed(str)?str.slice(2):str}
    function intToHex(i){var hex=i.toString(16)
        if(hex.length%2){hex='0'+hex}
        return hex}
    function padToEven(a){if(a.length%2)a='0'+a
        return a}
    function intToBuffer(i){var hex=intToHex(i)
        return new Buffer(hex,'hex')}
    function toBuffer(v){if(!Buffer.isBuffer(v)){if(typeof v==='string'){v=new Buffer(padToEven(stripHexPrefix(v)),'hex')}else if(typeof v==='number'){if(!v){v=new Buffer([])}else{v=intToBuffer(v)}}else if(v===null||v===undefined){v=new Buffer([])}else if(v.toArray){v=new Buffer(v.toArray())}else{throw new Error('invalid type')}}
        return v}}).call(this,require("buffer").Buffer)},{"assert":109,"buffer":111}],67:[function(require,module,exports){'use strict';var _keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";exports.encode=function(input,utf8){var output="";var chr1,chr2,chr3,enc1,enc2,enc3,enc4;var i=0;while(i<input.length){chr1=input.charCodeAt(i++);chr2=input.charCodeAt(i++);chr3=input.charCodeAt(i++);enc1=chr1>>2;enc2=((chr1&3)<<4)|(chr2>>4);enc3=((chr2&15)<<2)|(chr3>>6);enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64}
else if(isNaN(chr3)){enc4=64}
    output=output+_keyStr.charAt(enc1)+_keyStr.charAt(enc2)+_keyStr.charAt(enc3)+_keyStr.charAt(enc4)}
    return output};exports.decode=function(input,utf8){var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<input.length){enc1=_keyStr.indexOf(input.charAt(i++));enc2=_keyStr.indexOf(input.charAt(i++));enc3=_keyStr.indexOf(input.charAt(i++));enc4=_keyStr.indexOf(input.charAt(i++));chr1=(enc1<<2)|(enc2>>4);chr2=((enc2&15)<<4)|(enc3>>2);chr3=((enc3&3)<<6)|enc4;output=output+String.fromCharCode(chr1);if(enc3!=64){output=output+String.fromCharCode(chr2)}
    if(enc4!=64){output=output+String.fromCharCode(chr3)}}
    return output}},{}],68:[function(require,module,exports){'use strict';function CompressedObject(){this.compressedSize=0;this.uncompressedSize=0;this.crc32=0;this.compressionMethod=null;this.compressedContent=null}
    CompressedObject.prototype={getContent:function(){return null},getCompressedContent:function(){return null}};module.exports=CompressedObject},{}],69:[function(require,module,exports){'use strict';exports.STORE={magic:"\x00\x00",compress:function(content,compressionOptions){return content},uncompress:function(content){return content},compressInputType:null,uncompressInputType:null};exports.DEFLATE=require('./flate')},{"./flate":74}],70:[function(require,module,exports){'use strict';var utils=require('./utils');var table=[0x00000000,0x77073096,0xEE0E612C,0x990951BA,0x076DC419,0x706AF48F,0xE963A535,0x9E6495A3,0x0EDB8832,0x79DCB8A4,0xE0D5E91E,0x97D2D988,0x09B64C2B,0x7EB17CBD,0xE7B82D07,0x90BF1D91,0x1DB71064,0x6AB020F2,0xF3B97148,0x84BE41DE,0x1ADAD47D,0x6DDDE4EB,0xF4D4B551,0x83D385C7,0x136C9856,0x646BA8C0,0xFD62F97A,0x8A65C9EC,0x14015C4F,0x63066CD9,0xFA0F3D63,0x8D080DF5,0x3B6E20C8,0x4C69105E,0xD56041E4,0xA2677172,0x3C03E4D1,0x4B04D447,0xD20D85FD,0xA50AB56B,0x35B5A8FA,0x42B2986C,0xDBBBC9D6,0xACBCF940,0x32D86CE3,0x45DF5C75,0xDCD60DCF,0xABD13D59,0x26D930AC,0x51DE003A,0xC8D75180,0xBFD06116,0x21B4F4B5,0x56B3C423,0xCFBA9599,0xB8BDA50F,0x2802B89E,0x5F058808,0xC60CD9B2,0xB10BE924,0x2F6F7C87,0x58684C11,0xC1611DAB,0xB6662D3D,0x76DC4190,0x01DB7106,0x98D220BC,0xEFD5102A,0x71B18589,0x06B6B51F,0x9FBFE4A5,0xE8B8D433,0x7807C9A2,0x0F00F934,0x9609A88E,0xE10E9818,0x7F6A0DBB,0x086D3D2D,0x91646C97,0xE6635C01,0x6B6B51F4,0x1C6C6162,0x856530D8,0xF262004E,0x6C0695ED,0x1B01A57B,0x8208F4C1,0xF50FC457,0x65B0D9C6,0x12B7E950,0x8BBEB8EA,0xFCB9887C,0x62DD1DDF,0x15DA2D49,0x8CD37CF3,0xFBD44C65,0x4DB26158,0x3AB551CE,0xA3BC0074,0xD4BB30E2,0x4ADFA541,0x3DD895D7,0xA4D1C46D,0xD3D6F4FB,0x4369E96A,0x346ED9FC,0xAD678846,0xDA60B8D0,0x44042D73,0x33031DE5,0xAA0A4C5F,0xDD0D7CC9,0x5005713C,0x270241AA,0xBE0B1010,0xC90C2086,0x5768B525,0x206F85B3,0xB966D409,0xCE61E49F,0x5EDEF90E,0x29D9C998,0xB0D09822,0xC7D7A8B4,0x59B33D17,0x2EB40D81,0xB7BD5C3B,0xC0BA6CAD,0xEDB88320,0x9ABFB3B6,0x03B6E20C,0x74B1D29A,0xEAD54739,0x9DD277AF,0x04DB2615,0x73DC1683,0xE3630B12,0x94643B84,0x0D6D6A3E,0x7A6A5AA8,0xE40ECF0B,0x9309FF9D,0x0A00AE27,0x7D079EB1,0xF00F9344,0x8708A3D2,0x1E01F268,0x6906C2FE,0xF762575D,0x806567CB,0x196C3671,0x6E6B06E7,0xFED41B76,0x89D32BE0,0x10DA7A5A,0x67DD4ACC,0xF9B9DF6F,0x8EBEEFF9,0x17B7BE43,0x60B08ED5,0xD6D6A3E8,0xA1D1937E,0x38D8C2C4,0x4FDFF252,0xD1BB67F1,0xA6BC5767,0x3FB506DD,0x48B2364B,0xD80D2BDA,0xAF0A1B4C,0x36034AF6,0x41047A60,0xDF60EFC3,0xA867DF55,0x316E8EEF,0x4669BE79,0xCB61B38C,0xBC66831A,0x256FD2A0,0x5268E236,0xCC0C7795,0xBB0B4703,0x220216B9,0x5505262F,0xC5BA3BBE,0xB2BD0B28,0x2BB45A92,0x5CB36A04,0xC2D7FFA7,0xB5D0CF31,0x2CD99E8B,0x5BDEAE1D,0x9B64C2B0,0xEC63F226,0x756AA39C,0x026D930A,0x9C0906A9,0xEB0E363F,0x72076785,0x05005713,0x95BF4A82,0xE2B87A14,0x7BB12BAE,0x0CB61B38,0x92D28E9B,0xE5D5BE0D,0x7CDCEFB7,0x0BDBDF21,0x86D3D2D4,0xF1D4E242,0x68DDB3F8,0x1FDA836E,0x81BE16CD,0xF6B9265B,0x6FB077E1,0x18B74777,0x88085AE6,0xFF0F6A70,0x66063BCA,0x11010B5C,0x8F659EFF,0xF862AE69,0x616BFFD3,0x166CCF45,0xA00AE278,0xD70DD2EE,0x4E048354,0x3903B3C2,0xA7672661,0xD06016F7,0x4969474D,0x3E6E77DB,0xAED16A4A,0xD9D65ADC,0x40DF0B66,0x37D83BF0,0xA9BCAE53,0xDEBB9EC5,0x47B2CF7F,0x30B5FFE9,0xBDBDF21C,0xCABAC28A,0x53B39330,0x24B4A3A6,0xBAD03605,0xCDD70693,0x54DE5729,0x23D967BF,0xB3667A2E,0xC4614AB8,0x5D681B02,0x2A6F2B94,0xB40BBE37,0xC30C8EA1,0x5A05DF1B,0x2D02EF8D];module.exports=function crc32(input,crc){if(typeof input==="undefined"||!input.length){return 0}
    var isArray=utils.getTypeOf(input)!=="string";if(typeof(crc)=="undefined"){crc=0}
    var x=0;var y=0;var b=0;crc=crc^(-1);for(var i=0,iTop=input.length;i<iTop;i++){b=isArray?input[i]:input.charCodeAt(i);y=(crc^b)&0xFF;x=table[y];crc=(crc>>>8)^x}
    return crc^(-1)}},{"./utils":87}],71:[function(require,module,exports){'use strict';var utils=require('./utils');function DataReader(data){this.data=null;this.length=0;this.index=0}
    DataReader.prototype={checkOffset:function(offset){this.checkIndex(this.index+offset)},checkIndex:function(newIndex){if(this.length<newIndex||newIndex<0){throw new Error("End of data reached (data length = "+this.length+", asked index = "+(newIndex)+"). Corrupted zip ?")}},setIndex:function(newIndex){this.checkIndex(newIndex);this.index=newIndex},skip:function(n){this.setIndex(this.index+n)},byteAt:function(i){},readInt:function(size){var result=0,i;this.checkOffset(size);for(i=this.index+size-1;i>=this.index;i--){result=(result<<8)+this.byteAt(i)}
        this.index+=size;return result},readString:function(size){return utils.transformTo("string",this.readData(size))},readData:function(size){},lastIndexOfSignature:function(sig){},readDate:function(){var dostime=this.readInt(4);return new Date(((dostime>>25)&0x7f)+1980,((dostime>>21)&0x0f)-1,(dostime>>16)&0x1f,(dostime>>11)&0x1f,(dostime>>5)&0x3f,(dostime&0x1f)<<1)}};module.exports=DataReader},{"./utils":87}],72:[function(require,module,exports){'use strict';exports.base64=!1;exports.binary=!1;exports.dir=!1;exports.createFolders=!1;exports.date=null;exports.compression=null;exports.compressionOptions=null;exports.comment=null;exports.unixPermissions=null;exports.dosPermissions=null},{}],73:[function(require,module,exports){'use strict';var utils=require('./utils');exports.string2binary=function(str){return utils.string2binary(str)};exports.string2Uint8Array=function(str){return utils.transformTo("uint8array",str)};exports.uint8Array2String=function(array){return utils.transformTo("string",array)};exports.string2Blob=function(str){var buffer=utils.transformTo("arraybuffer",str);return utils.arrayBuffer2Blob(buffer)};exports.arrayBuffer2Blob=function(buffer){return utils.arrayBuffer2Blob(buffer)};exports.transformTo=function(outputType,input){return utils.transformTo(outputType,input)};exports.getTypeOf=function(input){return utils.getTypeOf(input)};exports.checkSupport=function(type){return utils.checkSupport(type)};exports.MAX_VALUE_16BITS=utils.MAX_VALUE_16BITS;exports.MAX_VALUE_32BITS=utils.MAX_VALUE_32BITS;exports.pretty=function(str){return utils.pretty(str)};exports.findCompression=function(compressionMethod){return utils.findCompression(compressionMethod)};exports.isRegExp=function(object){return utils.isRegExp(object)}},{"./utils":87}],74:[function(require,module,exports){'use strict';var USE_TYPEDARRAY=(typeof Uint8Array!=='undefined')&&(typeof Uint16Array!=='undefined')&&(typeof Uint32Array!=='undefined');var pako=require("pako");exports.uncompressInputType=USE_TYPEDARRAY?"uint8array":"array";exports.compressInputType=USE_TYPEDARRAY?"uint8array":"array";exports.magic="\x08\x00";exports.compress=function(input,compressionOptions){return pako.deflateRaw(input,{level:compressionOptions.level||-1})};exports.uncompress=function(input){return pako.inflateRaw(input)}},{"pako":90}],75:[function(require,module,exports){'use strict';var base64=require('./base64');function JSZip(data,options){if(!(this instanceof JSZip))return new JSZip(data,options);this.files={};this.comment=null;this.root="";if(data){this.load(data,options)}
    this.clone=function(){var newObj=new JSZip();for(var i in this){if(typeof this[i]!=="function"){newObj[i]=this[i]}}
        return newObj}}
    JSZip.prototype=require('./object');JSZip.prototype.load=require('./load');JSZip.support=require('./support');JSZip.defaults=require('./defaults');JSZip.utils=require('./deprecatedPublicUtils');JSZip.base64={encode:function(input){return base64.encode(input)},decode:function(input){return base64.decode(input)}};JSZip.compressions=require('./compressions');module.exports=JSZip},{"./base64":67,"./compressions":69,"./defaults":72,"./deprecatedPublicUtils":73,"./load":76,"./object":79,"./support":83}],76:[function(require,module,exports){'use strict';var base64=require('./base64');var ZipEntries=require('./zipEntries');module.exports=function(data,options){var files,zipEntries,i,input;options=options||{};if(options.base64){data=base64.decode(data)}
    zipEntries=new ZipEntries(data,options);files=zipEntries.files;for(i=0;i<files.length;i++){input=files[i];this.file(input.fileName,input.decompressed,{binary:!0,optimizedBinaryString:!0,date:input.date,dir:input.dir,comment:input.fileComment.length?input.fileComment:null,unixPermissions:input.unixPermissions,dosPermissions:input.dosPermissions,createFolders:options.createFolders})}
    if(zipEntries.zipComment.length){this.comment=zipEntries.zipComment}
    return this}},{"./base64":67,"./zipEntries":88}],77:[function(require,module,exports){(function(Buffer){'use strict';module.exports=function(data,encoding){return new Buffer(data,encoding)};module.exports.test=function(b){return Buffer.isBuffer(b)}}).call(this,require("buffer").Buffer)},{"buffer":111}],78:[function(require,module,exports){'use strict';var Uint8ArrayReader=require('./uint8ArrayReader');function NodeBufferReader(data){this.data=data;this.length=this.data.length;this.index=0}
    NodeBufferReader.prototype=new Uint8ArrayReader();NodeBufferReader.prototype.readData=function(size){this.checkOffset(size);var result=this.data.slice(this.index,this.index+size);this.index+=size;return result};module.exports=NodeBufferReader},{"./uint8ArrayReader":84}],79:[function(require,module,exports){'use strict';var support=require('./support');var utils=require('./utils');var crc32=require('./crc32');var signature=require('./signature');var defaults=require('./defaults');var base64=require('./base64');var compressions=require('./compressions');var CompressedObject=require('./compressedObject');var nodeBuffer=require('./nodeBuffer');var utf8=require('./utf8');var StringWriter=require('./stringWriter');var Uint8ArrayWriter=require('./uint8ArrayWriter');var getRawData=function(file){if(file._data instanceof CompressedObject){file._data=file._data.getContent();file.options.binary=!0;file.options.base64=!1;if(utils.getTypeOf(file._data)==="uint8array"){var copy=file._data;file._data=new Uint8Array(copy.length);if(copy.length!==0){file._data.set(copy,0)}}}
    return file._data};var getBinaryData=function(file){var result=getRawData(file),type=utils.getTypeOf(result);if(type==="string"){if(!file.options.binary){if(support.nodebuffer){return nodeBuffer(result,"utf-8")}}
    return file.asBinary()}
    return result};var dataToString=function(asUTF8){var result=getRawData(this);if(result===null||typeof result==="undefined"){return""}
    if(this.options.base64){result=base64.decode(result)}
    if(asUTF8&&this.options.binary){result=out.utf8decode(result)}
    else{result=utils.transformTo("string",result)}
    if(!asUTF8&&!this.options.binary){result=utils.transformTo("string",out.utf8encode(result))}
    return result};var ZipObject=function(name,data,options){this.name=name;this.dir=options.dir;this.date=options.date;this.comment=options.comment;this.unixPermissions=options.unixPermissions;this.dosPermissions=options.dosPermissions;this._data=data;this.options=options;this._initialMetadata={dir:options.dir,date:options.date}};ZipObject.prototype={asText:function(){return dataToString.call(this,!0)},asBinary:function(){return dataToString.call(this,!1)},asNodeBuffer:function(){var result=getBinaryData(this);return utils.transformTo("nodebuffer",result)},asUint8Array:function(){var result=getBinaryData(this);return utils.transformTo("uint8array",result)},asArrayBuffer:function(){return this.asUint8Array().buffer}};var decToHex=function(dec,bytes){var hex="",i;for(i=0;i<bytes;i++){hex+=String.fromCharCode(dec&0xff);dec=dec>>>8}
    return hex};var extend=function(){var result={},i,attr;for(i=0;i<arguments.length;i++){for(attr in arguments[i]){if(arguments[i].hasOwnProperty(attr)&&typeof result[attr]==="undefined"){result[attr]=arguments[i][attr]}}}
    return result};var prepareFileAttrs=function(o){o=o||{};if(o.base64===!0&&(o.binary===null||o.binary===undefined)){o.binary=!0}
    o=extend(o,defaults);o.date=o.date||new Date();if(o.compression!==null)o.compression=o.compression.toUpperCase();return o};var fileAdd=function(name,data,o){var dataType=utils.getTypeOf(data),parent;o=prepareFileAttrs(o);if(typeof o.unixPermissions==="string"){o.unixPermissions=parseInt(o.unixPermissions,8)}
    if(o.unixPermissions&&(o.unixPermissions&0x4000)){o.dir=!0}
    if(o.dosPermissions&&(o.dosPermissions&0x0010)){o.dir=!0}
    if(o.dir){name=forceTrailingSlash(name)}
    if(o.createFolders&&(parent=parentFolder(name))){folderAdd.call(this,parent,!0)}
    if(o.dir||data===null||typeof data==="undefined"){o.base64=!1;o.binary=!1;data=null;dataType=null}
    else if(dataType==="string"){if(o.binary&&!o.base64){if(o.optimizedBinaryString!==!0){data=utils.string2binary(data)}}}
    else{o.base64=!1;o.binary=!0;if(!dataType&&!(data instanceof CompressedObject)){throw new Error("The data of '"+name+"' is in an unsupported format !")}
        if(dataType==="arraybuffer"){data=utils.transformTo("uint8array",data)}}
    var object=new ZipObject(name,data,o);this.files[name]=object;return object};var parentFolder=function(path){if(path.slice(-1)=='/'){path=path.substring(0,path.length-1)}
    var lastSlash=path.lastIndexOf('/');return(lastSlash>0)?path.substring(0,lastSlash):""};var forceTrailingSlash=function(path){if(path.slice(-1)!="/"){path+="/"}
    return path};var folderAdd=function(name,createFolders){createFolders=(typeof createFolders!=='undefined')?createFolders:!1;name=forceTrailingSlash(name);if(!this.files[name]){fileAdd.call(this,name,null,{dir:!0,createFolders:createFolders})}
    return this.files[name]};var generateCompressedObjectFrom=function(file,compression,compressionOptions){var result=new CompressedObject(),content;if(file._data instanceof CompressedObject){result.uncompressedSize=file._data.uncompressedSize;result.crc32=file._data.crc32;if(result.uncompressedSize===0||file.dir){compression=compressions.STORE;result.compressedContent="";result.crc32=0}
else if(file._data.compressionMethod===compression.magic){result.compressedContent=file._data.getCompressedContent()}
else{content=file._data.getContent();result.compressedContent=compression.compress(utils.transformTo(compression.compressInputType,content),compressionOptions)}}
else{content=getBinaryData(file);if(!content||content.length===0||file.dir){compression=compressions.STORE;content=""}
    result.uncompressedSize=content.length;result.crc32=crc32(content);result.compressedContent=compression.compress(utils.transformTo(compression.compressInputType,content),compressionOptions)}
    result.compressedSize=result.compressedContent.length;result.compressionMethod=compression.magic;return result};var generateUnixExternalFileAttr=function(unixPermissions,isDir){var result=unixPermissions;if(!unixPermissions){result=isDir?0x41fd:0x81b4}
    return(result&0xFFFF)<<16};var generateDosExternalFileAttr=function(dosPermissions,isDir){return(dosPermissions||0)&0x3F};var generateZipParts=function(name,file,compressedObject,offset,platform){var data=compressedObject.compressedContent,utfEncodedFileName=utils.transformTo("string",utf8.utf8encode(file.name)),comment=file.comment||"",utfEncodedComment=utils.transformTo("string",utf8.utf8encode(comment)),useUTF8ForFileName=utfEncodedFileName.length!==file.name.length,useUTF8ForComment=utfEncodedComment.length!==comment.length,o=file.options,dosTime,dosDate,extraFields="",unicodePathExtraField="",unicodeCommentExtraField="",dir,date;if(file._initialMetadata.dir!==file.dir){dir=file.dir}else{dir=o.dir}
    if(file._initialMetadata.date!==file.date){date=file.date}else{date=o.date}
    var extFileAttr=0;var versionMadeBy=0;if(dir){extFileAttr|=0x00010}
    if(platform==="UNIX"){versionMadeBy=0x031E;extFileAttr|=generateUnixExternalFileAttr(file.unixPermissions,dir)}else{versionMadeBy=0x0014;extFileAttr|=generateDosExternalFileAttr(file.dosPermissions,dir)}
    dosTime=date.getHours();dosTime=dosTime<<6;dosTime=dosTime|date.getMinutes();dosTime=dosTime<<5;dosTime=dosTime|date.getSeconds()/2;dosDate=date.getFullYear()-1980;dosDate=dosDate<<4;dosDate=dosDate|(date.getMonth()+1);dosDate=dosDate<<5;dosDate=dosDate|date.getDate();if(useUTF8ForFileName){unicodePathExtraField=decToHex(1,1)+decToHex(crc32(utfEncodedFileName),4)+utfEncodedFileName;extraFields+="\x75\x70"+decToHex(unicodePathExtraField.length,2)+unicodePathExtraField}
    if(useUTF8ForComment){unicodeCommentExtraField=decToHex(1,1)+decToHex(this.crc32(utfEncodedComment),4)+utfEncodedComment;extraFields+="\x75\x63"+decToHex(unicodeCommentExtraField.length,2)+unicodeCommentExtraField}
    var header="";header+="\x0A\x00";header+=(useUTF8ForFileName||useUTF8ForComment)?"\x00\x08":"\x00\x00";header+=compressedObject.compressionMethod;header+=decToHex(dosTime,2);header+=decToHex(dosDate,2);header+=decToHex(compressedObject.crc32,4);header+=decToHex(compressedObject.compressedSize,4);header+=decToHex(compressedObject.uncompressedSize,4);header+=decToHex(utfEncodedFileName.length,2);header+=decToHex(extraFields.length,2);var fileRecord=signature.LOCAL_FILE_HEADER+header+utfEncodedFileName+extraFields;var dirRecord=signature.CENTRAL_FILE_HEADER+decToHex(versionMadeBy,2)+header+decToHex(utfEncodedComment.length,2)+"\x00\x00"+"\x00\x00"+decToHex(extFileAttr,4)+decToHex(offset,4)+utfEncodedFileName+extraFields+utfEncodedComment;return{fileRecord:fileRecord,dirRecord:dirRecord,compressedObject:compressedObject}};var out={load:function(stream,options){throw new Error("Load method is not defined. Is the file jszip-load.js included ?")},filter:function(search){var result=[],filename,relativePath,file,fileClone;for(filename in this.files){if(!this.files.hasOwnProperty(filename)){continue}
    file=this.files[filename];fileClone=new ZipObject(file.name,file._data,extend(file.options));relativePath=filename.slice(this.root.length,filename.length);if(filename.slice(0,this.root.length)===this.root&&search(relativePath,fileClone)){result.push(fileClone)}}
    return result},file:function(name,data,o){if(arguments.length===1){if(utils.isRegExp(name)){var regexp=name;return this.filter(function(relativePath,file){return!file.dir&&regexp.test(relativePath)})}
else{return this.filter(function(relativePath,file){return!file.dir&&relativePath===name})[0]||null}}
else{name=this.root+name;fileAdd.call(this,name,data,o)}
    return this},folder:function(arg){if(!arg){return this}
    if(utils.isRegExp(arg)){return this.filter(function(relativePath,file){return file.dir&&arg.test(relativePath)})}
    var name=this.root+arg;var newFolder=folderAdd.call(this,name);var ret=this.clone();ret.root=newFolder.name;return ret},remove:function(name){name=this.root+name;var file=this.files[name];if(!file){if(name.slice(-1)!="/"){name+="/"}
    file=this.files[name]}
    if(file&&!file.dir){delete this.files[name]}else{var kids=this.filter(function(relativePath,file){return file.name.slice(0,name.length)===name});for(var i=0;i<kids.length;i++){delete this.files[kids[i].name]}}
    return this},generate:function(options){options=extend(options||{},{base64:!0,compression:"STORE",compressionOptions:null,type:"base64",platform:"DOS",comment:null,mimeType:'application/zip'});utils.checkSupport(options.type);if(options.platform==='darwin'||options.platform==='freebsd'||options.platform==='linux'||options.platform==='sunos'){options.platform="UNIX"}
    if(options.platform==='win32'){options.platform="DOS"}
    var zipData=[],localDirLength=0,centralDirLength=0,writer,i,utfEncodedComment=utils.transformTo("string",this.utf8encode(options.comment||this.comment||""));for(var name in this.files){if(!this.files.hasOwnProperty(name)){continue}
        var file=this.files[name];var compressionName=file.options.compression||options.compression.toUpperCase();var compression=compressions[compressionName];if(!compression){throw new Error(compressionName+" is not a valid compression method !")}
        var compressionOptions=file.options.compressionOptions||options.compressionOptions||{};var compressedObject=generateCompressedObjectFrom.call(this,file,compression,compressionOptions);var zipPart=generateZipParts.call(this,name,file,compressedObject,localDirLength,options.platform);localDirLength+=zipPart.fileRecord.length+compressedObject.compressedSize;centralDirLength+=zipPart.dirRecord.length;zipData.push(zipPart)}
    var dirEnd="";dirEnd=signature.CENTRAL_DIRECTORY_END+"\x00\x00"+"\x00\x00"+decToHex(zipData.length,2)+decToHex(zipData.length,2)+decToHex(centralDirLength,4)+decToHex(localDirLength,4)+decToHex(utfEncodedComment.length,2)+utfEncodedComment;var typeName=options.type.toLowerCase();if(typeName==="uint8array"||typeName==="arraybuffer"||typeName==="blob"||typeName==="nodebuffer"){writer=new Uint8ArrayWriter(localDirLength+centralDirLength+dirEnd.length)}else{writer=new StringWriter(localDirLength+centralDirLength+dirEnd.length)}
    for(i=0;i<zipData.length;i++){writer.append(zipData[i].fileRecord);writer.append(zipData[i].compressedObject.compressedContent)}
    for(i=0;i<zipData.length;i++){writer.append(zipData[i].dirRecord)}
    writer.append(dirEnd);var zip=writer.finalize();switch(options.type.toLowerCase()){case"uint8array":case"arraybuffer":case"nodebuffer":return utils.transformTo(options.type.toLowerCase(),zip);case"blob":return utils.arrayBuffer2Blob(utils.transformTo("arraybuffer",zip),options.mimeType);case"base64":return(options.base64)?base64.encode(zip):zip;default:return zip}},crc32:function(input,crc){return crc32(input,crc)},utf8encode:function(string){return utils.transformTo("string",utf8.utf8encode(string))},utf8decode:function(input){return utf8.utf8decode(input)}};module.exports=out},{"./base64":67,"./compressedObject":68,"./compressions":69,"./crc32":70,"./defaults":72,"./nodeBuffer":77,"./signature":80,"./stringWriter":82,"./support":83,"./uint8ArrayWriter":85,"./utf8":86,"./utils":87}],80:[function(require,module,exports){'use strict';exports.LOCAL_FILE_HEADER="PK\x03\x04";exports.CENTRAL_FILE_HEADER="PK\x01\x02";exports.CENTRAL_DIRECTORY_END="PK\x05\x06";exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x06\x07";exports.ZIP64_CENTRAL_DIRECTORY_END="PK\x06\x06";exports.DATA_DESCRIPTOR="PK\x07\x08"},{}],81:[function(require,module,exports){'use strict';var DataReader=require('./dataReader');var utils=require('./utils');function StringReader(data,optimizedBinaryString){this.data=data;if(!optimizedBinaryString){this.data=utils.string2binary(this.data)}
    this.length=this.data.length;this.index=0}
    StringReader.prototype=new DataReader();StringReader.prototype.byteAt=function(i){return this.data.charCodeAt(i)};StringReader.prototype.lastIndexOfSignature=function(sig){return this.data.lastIndexOf(sig)};StringReader.prototype.readData=function(size){this.checkOffset(size);var result=this.data.slice(this.index,this.index+size);this.index+=size;return result};module.exports=StringReader},{"./dataReader":71,"./utils":87}],82:[function(require,module,exports){'use strict';var utils=require('./utils');var StringWriter=function(){this.data=[]};StringWriter.prototype={append:function(input){input=utils.transformTo("string",input);this.data.push(input)},finalize:function(){return this.data.join("")}};module.exports=StringWriter},{"./utils":87}],83:[function(require,module,exports){(function(Buffer){'use strict';exports.base64=!0;exports.array=!0;exports.string=!0;exports.arraybuffer=typeof ArrayBuffer!=="undefined"&&typeof Uint8Array!=="undefined";exports.nodebuffer=typeof Buffer!=="undefined";exports.uint8array=typeof Uint8Array!=="undefined";if(typeof ArrayBuffer==="undefined"){exports.blob=!1}
else{var buffer=new ArrayBuffer(0);try{exports.blob=new Blob([buffer],{type:"application/zip"}).size===0}
catch(e){try{var Builder=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder;var builder=new Builder();builder.append(buffer);exports.blob=builder.getBlob('application/zip').size===0}
catch(e){exports.blob=!1}}}}).call(this,require("buffer").Buffer)},{"buffer":111}],84:[function(require,module,exports){'use strict';var DataReader=require('./dataReader');function Uint8ArrayReader(data){if(data){this.data=data;this.length=this.data.length;this.index=0}}
    Uint8ArrayReader.prototype=new DataReader();Uint8ArrayReader.prototype.byteAt=function(i){return this.data[i]};Uint8ArrayReader.prototype.lastIndexOfSignature=function(sig){var sig0=sig.charCodeAt(0),sig1=sig.charCodeAt(1),sig2=sig.charCodeAt(2),sig3=sig.charCodeAt(3);for(var i=this.length-4;i>=0;--i){if(this.data[i]===sig0&&this.data[i+1]===sig1&&this.data[i+2]===sig2&&this.data[i+3]===sig3){return i}}
        return-1};Uint8ArrayReader.prototype.readData=function(size){this.checkOffset(size);if(size===0){return new Uint8Array(0)}
        var result=this.data.subarray(this.index,this.index+size);this.index+=size;return result};module.exports=Uint8ArrayReader},{"./dataReader":71}],85:[function(require,module,exports){'use strict';var utils=require('./utils');var Uint8ArrayWriter=function(length){this.data=new Uint8Array(length);this.index=0};Uint8ArrayWriter.prototype={append:function(input){if(input.length!==0){input=utils.transformTo("uint8array",input);this.data.set(input,this.index);this.index+=input.length}},finalize:function(){return this.data}};module.exports=Uint8ArrayWriter},{"./utils":87}],86:[function(require,module,exports){'use strict';var utils=require('./utils');var support=require('./support');var nodeBuffer=require('./nodeBuffer');var _utf8len=new Array(256);for(var i=0;i<256;i++){_utf8len[i]=(i>=252?6:i>=248?5:i>=240?4:i>=224?3:i>=192?2:1)}
    _utf8len[254]=_utf8len[254]=1;var string2buf=function(str){var buf,c,c2,m_pos,i,str_len=str.length,buf_len=0;for(m_pos=0;m_pos<str_len;m_pos++){c=str.charCodeAt(m_pos);if((c&0xfc00)===0xd800&&(m_pos+1<str_len)){c2=str.charCodeAt(m_pos+1);if((c2&0xfc00)===0xdc00){c=0x10000+((c-0xd800)<<10)+(c2-0xdc00);m_pos++}}
        buf_len+=c<0x80?1:c<0x800?2:c<0x10000?3:4}
        if(support.uint8array){buf=new Uint8Array(buf_len)}else{buf=new Array(buf_len)}
        for(i=0,m_pos=0;i<buf_len;m_pos++){c=str.charCodeAt(m_pos);if((c&0xfc00)===0xd800&&(m_pos+1<str_len)){c2=str.charCodeAt(m_pos+1);if((c2&0xfc00)===0xdc00){c=0x10000+((c-0xd800)<<10)+(c2-0xdc00);m_pos++}}
            if(c<0x80){buf[i++]=c}else if(c<0x800){buf[i++]=0xC0|(c>>>6);buf[i++]=0x80|(c&0x3f)}else if(c<0x10000){buf[i++]=0xE0|(c>>>12);buf[i++]=0x80|(c>>>6&0x3f);buf[i++]=0x80|(c&0x3f)}else{buf[i++]=0xf0|(c>>>18);buf[i++]=0x80|(c>>>12&0x3f);buf[i++]=0x80|(c>>>6&0x3f);buf[i++]=0x80|(c&0x3f)}}
        return buf};var utf8border=function(buf,max){var pos;max=max||buf.length;if(max>buf.length){max=buf.length}
        pos=max-1;while(pos>=0&&(buf[pos]&0xC0)===0x80){pos--}
        if(pos<0){return max}
        if(pos===0){return max}
        return(pos+_utf8len[buf[pos]]>max)?pos:max};var buf2string=function(buf){var str,i,out,c,c_len;var len=buf.length;var utf16buf=new Array(len*2);for(out=0,i=0;i<len;){c=buf[i++];if(c<0x80){utf16buf[out++]=c;continue}
        c_len=_utf8len[c];if(c_len>4){utf16buf[out++]=0xfffd;i+=c_len-1;continue}
        c&=c_len===2?0x1f:c_len===3?0x0f:0x07;while(c_len>1&&i<len){c=(c<<6)|(buf[i++]&0x3f);c_len--}
        if(c_len>1){utf16buf[out++]=0xfffd;continue}
        if(c<0x10000){utf16buf[out++]=c}else{c-=0x10000;utf16buf[out++]=0xd800|((c>>10)&0x3ff);utf16buf[out++]=0xdc00|(c&0x3ff)}}
        if(utf16buf.length!==out){if(utf16buf.subarray){utf16buf=utf16buf.subarray(0,out)}else{utf16buf.length=out}}
        return utils.applyFromCharCode(utf16buf)};exports.utf8encode=function utf8encode(str){if(support.nodebuffer){return nodeBuffer(str,"utf-8")}
        return string2buf(str)};exports.utf8decode=function utf8decode(buf){if(support.nodebuffer){return utils.transformTo("nodebuffer",buf).toString("utf-8")}
        buf=utils.transformTo(support.uint8array?"uint8array":"array",buf);var result=[],k=0,len=buf.length,chunk=65536;while(k<len){var nextBoundary=utf8border(buf,Math.min(k+chunk,len));if(support.uint8array){result.push(buf2string(buf.subarray(k,nextBoundary)))}else{result.push(buf2string(buf.slice(k,nextBoundary)))}
            k=nextBoundary}
        return result.join("")}},{"./nodeBuffer":77,"./support":83,"./utils":87}],87:[function(require,module,exports){'use strict';var support=require('./support');var compressions=require('./compressions');var nodeBuffer=require('./nodeBuffer');exports.string2binary=function(str){var result="";for(var i=0;i<str.length;i++){result+=String.fromCharCode(str.charCodeAt(i)&0xff)}
    return result};exports.arrayBuffer2Blob=function(buffer,mimeType){exports.checkSupport("blob");mimeType=mimeType||'application/zip';try{return new Blob([buffer],{type:mimeType})}
catch(e){try{var Builder=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder;var builder=new Builder();builder.append(buffer);return builder.getBlob(mimeType)}
catch(e){throw new Error("Bug : can't construct the Blob.")}}};function identity(input){return input}
    function stringToArrayLike(str,array){for(var i=0;i<str.length;++i){array[i]=str.charCodeAt(i)&0xFF}
        return array}
    function arrayLikeToString(array){var chunk=65536;var result=[],len=array.length,type=exports.getTypeOf(array),k=0,canUseApply=!0;try{switch(type){case"uint8array":String.fromCharCode.apply(null,new Uint8Array(0));break;case"nodebuffer":String.fromCharCode.apply(null,nodeBuffer(0));break}}catch(e){canUseApply=!1}
        if(!canUseApply){var resultStr="";for(var i=0;i<array.length;i++){resultStr+=String.fromCharCode(array[i])}
            return resultStr}
        while(k<len&&chunk>1){try{if(type==="array"||type==="nodebuffer"){result.push(String.fromCharCode.apply(null,array.slice(k,Math.min(k+chunk,len))))}
        else{result.push(String.fromCharCode.apply(null,array.subarray(k,Math.min(k+chunk,len))))}
            k+=chunk}
        catch(e){chunk=Math.floor(chunk/2)}}
        return result.join("")}
    exports.applyFromCharCode=arrayLikeToString;function arrayLikeToArrayLike(arrayFrom,arrayTo){for(var i=0;i<arrayFrom.length;i++){arrayTo[i]=arrayFrom[i]}
        return arrayTo}
    var transform={};transform.string={"string":identity,"array":function(input){return stringToArrayLike(input,new Array(input.length))},"arraybuffer":function(input){return transform.string.uint8array(input).buffer},"uint8array":function(input){return stringToArrayLike(input,new Uint8Array(input.length))},"nodebuffer":function(input){return stringToArrayLike(input,nodeBuffer(input.length))}};transform.array={"string":arrayLikeToString,"array":identity,"arraybuffer":function(input){return(new Uint8Array(input)).buffer},"uint8array":function(input){return new Uint8Array(input)},"nodebuffer":function(input){return nodeBuffer(input)}};transform.arraybuffer={"string":function(input){return arrayLikeToString(new Uint8Array(input))},"array":function(input){return arrayLikeToArrayLike(new Uint8Array(input),new Array(input.byteLength))},"arraybuffer":identity,"uint8array":function(input){return new Uint8Array(input)},"nodebuffer":function(input){return nodeBuffer(new Uint8Array(input))}};transform.uint8array={"string":arrayLikeToString,"array":function(input){return arrayLikeToArrayLike(input,new Array(input.length))},"arraybuffer":function(input){return input.buffer},"uint8array":identity,"nodebuffer":function(input){return nodeBuffer(input)}};transform.nodebuffer={"string":arrayLikeToString,"array":function(input){return arrayLikeToArrayLike(input,new Array(input.length))},"arraybuffer":function(input){return transform.nodebuffer.uint8array(input).buffer},"uint8array":function(input){return arrayLikeToArrayLike(input,new Uint8Array(input.length))},"nodebuffer":identity};exports.transformTo=function(outputType,input){if(!input){input=""}
        if(!outputType){return input}
        exports.checkSupport(outputType);var inputType=exports.getTypeOf(input);var result=transform[inputType][outputType](input);return result};exports.getTypeOf=function(input){if(typeof input==="string"){return"string"}
        if(Object.prototype.toString.call(input)==="[object Array]"){return"array"}
        if(support.nodebuffer&&nodeBuffer.test(input)){return"nodebuffer"}
        if(support.uint8array&&input instanceof Uint8Array){return"uint8array"}
        if(support.arraybuffer&&input instanceof ArrayBuffer){return"arraybuffer"}};exports.checkSupport=function(type){var supported=support[type.toLowerCase()];if(!supported){throw new Error(type+" is not supported by this browser")}};exports.MAX_VALUE_16BITS=65535;exports.MAX_VALUE_32BITS=-1;exports.pretty=function(str){var res='',code,i;for(i=0;i<(str||"").length;i++){code=str.charCodeAt(i);res+='\\x'+(code<16?"0":"")+code.toString(16).toUpperCase()}
        return res};exports.findCompression=function(compressionMethod){for(var method in compressions){if(!compressions.hasOwnProperty(method)){continue}
        if(compressions[method].magic===compressionMethod){return compressions[method]}}
        return null};exports.isRegExp=function(object){return Object.prototype.toString.call(object)==="[object RegExp]"}},{"./compressions":69,"./nodeBuffer":77,"./support":83}],88:[function(require,module,exports){'use strict';var StringReader=require('./stringReader');var NodeBufferReader=require('./nodeBufferReader');var Uint8ArrayReader=require('./uint8ArrayReader');var utils=require('./utils');var sig=require('./signature');var ZipEntry=require('./zipEntry');var support=require('./support');var jszipProto=require('./object');function ZipEntries(data,loadOptions){this.files=[];this.loadOptions=loadOptions;if(data){this.load(data)}}
    ZipEntries.prototype={checkSignature:function(expectedSignature){var signature=this.reader.readString(4);if(signature!==expectedSignature){throw new Error("Corrupted zip or bug : unexpected signature "+"("+utils.pretty(signature)+", expected "+utils.pretty(expectedSignature)+")")}},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2);this.diskWithCentralDirStart=this.reader.readInt(2);this.centralDirRecordsOnThisDisk=this.reader.readInt(2);this.centralDirRecords=this.reader.readInt(2);this.centralDirSize=this.reader.readInt(4);this.centralDirOffset=this.reader.readInt(4);this.zipCommentLength=this.reader.readInt(2);this.zipComment=this.reader.readString(this.zipCommentLength);this.zipComment=jszipProto.utf8decode(this.zipComment)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8);this.versionMadeBy=this.reader.readString(2);this.versionNeeded=this.reader.readInt(2);this.diskNumber=this.reader.readInt(4);this.diskWithCentralDirStart=this.reader.readInt(4);this.centralDirRecordsOnThisDisk=this.reader.readInt(8);this.centralDirRecords=this.reader.readInt(8);this.centralDirSize=this.reader.readInt(8);this.centralDirOffset=this.reader.readInt(8);this.zip64ExtensibleData={};var extraDataSize=this.zip64EndOfCentralSize-44,index=0,extraFieldId,extraFieldLength,extraFieldValue;while(index<extraDataSize){extraFieldId=this.reader.readInt(2);extraFieldLength=this.reader.readInt(4);extraFieldValue=this.reader.readString(extraFieldLength);this.zip64ExtensibleData[extraFieldId]={id:extraFieldId,length:extraFieldLength,value:extraFieldValue}}},readBlockZip64EndOfCentralLocator:function(){this.diskWithZip64CentralDirStart=this.reader.readInt(4);this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8);this.disksCount=this.reader.readInt(4);if(this.disksCount>1){throw new Error("Multi-volumes zip are not supported")}},readLocalFiles:function(){var i,file;for(i=0;i<this.files.length;i++){file=this.files[i];this.reader.setIndex(file.localHeaderOffset);this.checkSignature(sig.LOCAL_FILE_HEADER);file.readLocalPart(this.reader);file.handleUTF8();file.processAttributes()}},readCentralDir:function(){var file;this.reader.setIndex(this.centralDirOffset);while(this.reader.readString(4)===sig.CENTRAL_FILE_HEADER){file=new ZipEntry({zip64:this.zip64},this.loadOptions);file.readCentralPart(this.reader);this.files.push(file)}},readEndOfCentral:function(){var offset=this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);if(offset===-1){var isGarbage=!0;try{this.reader.setIndex(0);this.checkSignature(sig.LOCAL_FILE_HEADER);isGarbage=!1}catch(e){}
        if(isGarbage){throw new Error("Can't find end of central directory : is this a zip file ? "+"If it is, see http://stuk.github.io/jszip/documentation/howto/read_zip.html")}else{throw new Error("Corrupted zip : can't find end of central directory")}}
        this.reader.setIndex(offset);this.checkSignature(sig.CENTRAL_DIRECTORY_END);this.readBlockEndOfCentral();if(this.diskNumber===utils.MAX_VALUE_16BITS||this.diskWithCentralDirStart===utils.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===utils.MAX_VALUE_16BITS||this.centralDirRecords===utils.MAX_VALUE_16BITS||this.centralDirSize===utils.MAX_VALUE_32BITS||this.centralDirOffset===utils.MAX_VALUE_32BITS){this.zip64=!0;offset=this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);if(offset===-1){throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator")}
            this.reader.setIndex(offset);this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);this.readBlockZip64EndOfCentralLocator();this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);this.readBlockZip64EndOfCentral()}},prepareReader:function(data){var type=utils.getTypeOf(data);if(type==="string"&&!support.uint8array){this.reader=new StringReader(data,this.loadOptions.optimizedBinaryString)}
    else if(type==="nodebuffer"){this.reader=new NodeBufferReader(data)}
    else{this.reader=new Uint8ArrayReader(utils.transformTo("uint8array",data))}},load:function(data){this.prepareReader(data);this.readEndOfCentral();this.readCentralDir();this.readLocalFiles()}};module.exports=ZipEntries},{"./nodeBufferReader":78,"./object":79,"./signature":80,"./stringReader":81,"./support":83,"./uint8ArrayReader":84,"./utils":87,"./zipEntry":89}],89:[function(require,module,exports){'use strict';var StringReader=require('./stringReader');var utils=require('./utils');var CompressedObject=require('./compressedObject');var jszipProto=require('./object');var MADE_BY_DOS=0x00;var MADE_BY_UNIX=0x03;function ZipEntry(options,loadOptions){this.options=options;this.loadOptions=loadOptions}
    ZipEntry.prototype={isEncrypted:function(){return(this.bitFlag&0x0001)===0x0001},useUTF8:function(){return(this.bitFlag&0x0800)===0x0800},prepareCompressedContent:function(reader,from,length){return function(){var previousIndex=reader.index;reader.setIndex(from);var compressedFileData=reader.readData(length);reader.setIndex(previousIndex);return compressedFileData}},prepareContent:function(reader,from,length,compression,uncompressedSize){return function(){var compressedFileData=utils.transformTo(compression.uncompressInputType,this.getCompressedContent());var uncompressedFileData=compression.uncompress(compressedFileData);if(uncompressedFileData.length!==uncompressedSize){throw new Error("Bug : uncompressed data size mismatch")}
        return uncompressedFileData}},readLocalPart:function(reader){var compression,localExtraFieldsLength;reader.skip(22);this.fileNameLength=reader.readInt(2);localExtraFieldsLength=reader.readInt(2);this.fileName=reader.readString(this.fileNameLength);reader.skip(localExtraFieldsLength);if(this.compressedSize==-1||this.uncompressedSize==-1){throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory "+"(compressedSize == -1 || uncompressedSize == -1)")}
        compression=utils.findCompression(this.compressionMethod);if(compression===null){throw new Error("Corrupted zip : compression "+utils.pretty(this.compressionMethod)+" unknown (inner file : "+this.fileName+")")}
        this.decompressed=new CompressedObject();this.decompressed.compressedSize=this.compressedSize;this.decompressed.uncompressedSize=this.uncompressedSize;this.decompressed.crc32=this.crc32;this.decompressed.compressionMethod=this.compressionMethod;this.decompressed.getCompressedContent=this.prepareCompressedContent(reader,reader.index,this.compressedSize,compression);this.decompressed.getContent=this.prepareContent(reader,reader.index,this.compressedSize,compression,this.uncompressedSize);if(this.loadOptions.checkCRC32){this.decompressed=utils.transformTo("string",this.decompressed.getContent());if(jszipProto.crc32(this.decompressed)!==this.crc32){throw new Error("Corrupted zip : CRC32 mismatch")}}},readCentralPart:function(reader){this.versionMadeBy=reader.readInt(2);this.versionNeeded=reader.readInt(2);this.bitFlag=reader.readInt(2);this.compressionMethod=reader.readString(2);this.date=reader.readDate();this.crc32=reader.readInt(4);this.compressedSize=reader.readInt(4);this.uncompressedSize=reader.readInt(4);this.fileNameLength=reader.readInt(2);this.extraFieldsLength=reader.readInt(2);this.fileCommentLength=reader.readInt(2);this.diskNumberStart=reader.readInt(2);this.internalFileAttributes=reader.readInt(2);this.externalFileAttributes=reader.readInt(4);this.localHeaderOffset=reader.readInt(4);if(this.isEncrypted()){throw new Error("Encrypted zip are not supported")}
        this.fileName=reader.readString(this.fileNameLength);this.readExtraFields(reader);this.parseZIP64ExtraField(reader);this.fileComment=reader.readString(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null;this.dosPermissions=null;var madeBy=this.versionMadeBy>>8;this.dir=this.externalFileAttributes&0x0010?!0:!1;if(madeBy===MADE_BY_DOS){this.dosPermissions=this.externalFileAttributes&0x3F}
        if(madeBy===MADE_BY_UNIX){this.unixPermissions=(this.externalFileAttributes>>16)&0xFFFF}
        if(!this.dir&&this.fileName.slice(-1)==='/'){this.dir=!0}},parseZIP64ExtraField:function(reader){if(!this.extraFields[0x0001]){return}
        var extraReader=new StringReader(this.extraFields[0x0001].value);if(this.uncompressedSize===utils.MAX_VALUE_32BITS){this.uncompressedSize=extraReader.readInt(8)}
        if(this.compressedSize===utils.MAX_VALUE_32BITS){this.compressedSize=extraReader.readInt(8)}
        if(this.localHeaderOffset===utils.MAX_VALUE_32BITS){this.localHeaderOffset=extraReader.readInt(8)}
        if(this.diskNumberStart===utils.MAX_VALUE_32BITS){this.diskNumberStart=extraReader.readInt(4)}},readExtraFields:function(reader){var start=reader.index,extraFieldId,extraFieldLength,extraFieldValue;this.extraFields=this.extraFields||{};while(reader.index<start+this.extraFieldsLength){extraFieldId=reader.readInt(2);extraFieldLength=reader.readInt(2);extraFieldValue=reader.readString(extraFieldLength);this.extraFields[extraFieldId]={id:extraFieldId,length:extraFieldLength,value:extraFieldValue}}},handleUTF8:function(){if(this.useUTF8()){this.fileName=jszipProto.utf8decode(this.fileName);this.fileComment=jszipProto.utf8decode(this.fileComment)}else{var upath=this.findExtraFieldUnicodePath();if(upath!==null){this.fileName=upath}
        var ucomment=this.findExtraFieldUnicodeComment();if(ucomment!==null){this.fileComment=ucomment}}},findExtraFieldUnicodePath:function(){var upathField=this.extraFields[0x7075];if(upathField){var extraReader=new StringReader(upathField.value);if(extraReader.readInt(1)!==1){return null}
        if(jszipProto.crc32(this.fileName)!==extraReader.readInt(4)){return null}
        return jszipProto.utf8decode(extraReader.readString(upathField.length-5))}
        return null},findExtraFieldUnicodeComment:function(){var ucommentField=this.extraFields[0x6375];if(ucommentField){var extraReader=new StringReader(ucommentField.value);if(extraReader.readInt(1)!==1){return null}
        if(jszipProto.crc32(this.fileComment)!==extraReader.readInt(4)){return null}
        return jszipProto.utf8decode(extraReader.readString(ucommentField.length-5))}
        return null}};module.exports=ZipEntry},{"./compressedObject":68,"./object":79,"./stringReader":81,"./utils":87}],90:[function(require,module,exports){'use strict';var assign=require('./lib/utils/common').assign;var deflate=require('./lib/deflate');var inflate=require('./lib/inflate');var constants=require('./lib/zlib/constants');var pako={};assign(pako,deflate,inflate,constants);module.exports=pako},{"./lib/deflate":91,"./lib/inflate":92,"./lib/utils/common":93,"./lib/zlib/constants":96}],91:[function(require,module,exports){'use strict';var zlib_deflate=require('./zlib/deflate.js');var utils=require('./utils/common');var strings=require('./utils/strings');var msg=require('./zlib/messages');var zstream=require('./zlib/zstream');var toString=Object.prototype.toString;var Z_NO_FLUSH=0;var Z_FINISH=4;var Z_OK=0;var Z_STREAM_END=1;var Z_SYNC_FLUSH=2;var Z_DEFAULT_COMPRESSION=-1;var Z_DEFAULT_STRATEGY=0;var Z_DEFLATED=8;var Deflate=function(options){this.options=utils.assign({level:Z_DEFAULT_COMPRESSION,method:Z_DEFLATED,chunkSize:16384,windowBits:15,memLevel:8,strategy:Z_DEFAULT_STRATEGY,to:''},options||{});var opt=this.options;if(opt.raw&&(opt.windowBits>0)){opt.windowBits=-opt.windowBits}
else if(opt.gzip&&(opt.windowBits>0)&&(opt.windowBits<16)){opt.windowBits+=16}
    this.err=0;this.msg='';this.ended=!1;this.chunks=[];this.strm=new zstream();this.strm.avail_out=0;var status=zlib_deflate.deflateInit2(this.strm,opt.level,opt.method,opt.windowBits,opt.memLevel,opt.strategy);if(status!==Z_OK){throw new Error(msg[status])}
    if(opt.header){zlib_deflate.deflateSetHeader(this.strm,opt.header)}};Deflate.prototype.push=function(data,mode){var strm=this.strm;var chunkSize=this.options.chunkSize;var status,_mode;if(this.ended){return!1}
    _mode=(mode===~~mode)?mode:((mode===!0)?Z_FINISH:Z_NO_FLUSH);if(typeof data==='string'){strm.input=strings.string2buf(data)}else if(toString.call(data)==='[object ArrayBuffer]'){strm.input=new Uint8Array(data)}else{strm.input=data}
    strm.next_in=0;strm.avail_in=strm.input.length;do{if(strm.avail_out===0){strm.output=new utils.Buf8(chunkSize);strm.next_out=0;strm.avail_out=chunkSize}
        status=zlib_deflate.deflate(strm,_mode);if(status!==Z_STREAM_END&&status!==Z_OK){this.onEnd(status);this.ended=!0;return!1}
        if(strm.avail_out===0||(strm.avail_in===0&&(_mode===Z_FINISH||_mode===Z_SYNC_FLUSH))){if(this.options.to==='string'){this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output,strm.next_out)))}else{this.onData(utils.shrinkBuf(strm.output,strm.next_out))}}}while((strm.avail_in>0||strm.avail_out===0)&&status!==Z_STREAM_END);if(_mode===Z_FINISH){status=zlib_deflate.deflateEnd(this.strm);this.onEnd(status);this.ended=!0;return status===Z_OK}
    if(_mode===Z_SYNC_FLUSH){this.onEnd(Z_OK);strm.avail_out=0;return!0}
    return!0};Deflate.prototype.onData=function(chunk){this.chunks.push(chunk)};Deflate.prototype.onEnd=function(status){if(status===Z_OK){if(this.options.to==='string'){this.result=this.chunks.join('')}else{this.result=utils.flattenChunks(this.chunks)}}
    this.chunks=[];this.err=status;this.msg=this.strm.msg};function deflate(input,options){var deflator=new Deflate(options);deflator.push(input,!0);if(deflator.err){throw deflator.msg}
    return deflator.result}
    function deflateRaw(input,options){options=options||{};options.raw=!0;return deflate(input,options)}
    function gzip(input,options){options=options||{};options.gzip=!0;return deflate(input,options)}
    exports.Deflate=Deflate;exports.deflate=deflate;exports.deflateRaw=deflateRaw;exports.gzip=gzip},{"./utils/common":93,"./utils/strings":94,"./zlib/deflate.js":98,"./zlib/messages":103,"./zlib/zstream":105}],92:[function(require,module,exports){'use strict';var zlib_inflate=require('./zlib/inflate.js');var utils=require('./utils/common');var strings=require('./utils/strings');var c=require('./zlib/constants');var msg=require('./zlib/messages');var zstream=require('./zlib/zstream');var gzheader=require('./zlib/gzheader');var toString=Object.prototype.toString;var Inflate=function(options){this.options=utils.assign({chunkSize:16384,windowBits:0,to:''},options||{});var opt=this.options;if(opt.raw&&(opt.windowBits>=0)&&(opt.windowBits<16)){opt.windowBits=-opt.windowBits;if(opt.windowBits===0){opt.windowBits=-15}}
    if((opt.windowBits>=0)&&(opt.windowBits<16)&&!(options&&options.windowBits)){opt.windowBits+=32}
    if((opt.windowBits>15)&&(opt.windowBits<48)){if((opt.windowBits&15)===0){opt.windowBits|=15}}
    this.err=0;this.msg='';this.ended=!1;this.chunks=[];this.strm=new zstream();this.strm.avail_out=0;var status=zlib_inflate.inflateInit2(this.strm,opt.windowBits);if(status!==c.Z_OK){throw new Error(msg[status])}
    this.header=new gzheader();zlib_inflate.inflateGetHeader(this.strm,this.header)};Inflate.prototype.push=function(data,mode){var strm=this.strm;var chunkSize=this.options.chunkSize;var status,_mode;var next_out_utf8,tail,utf8str;var allowBufError=!1;if(this.ended){return!1}
    _mode=(mode===~~mode)?mode:((mode===!0)?c.Z_FINISH:c.Z_NO_FLUSH);if(typeof data==='string'){strm.input=strings.binstring2buf(data)}else if(toString.call(data)==='[object ArrayBuffer]'){strm.input=new Uint8Array(data)}else{strm.input=data}
    strm.next_in=0;strm.avail_in=strm.input.length;do{if(strm.avail_out===0){strm.output=new utils.Buf8(chunkSize);strm.next_out=0;strm.avail_out=chunkSize}
        status=zlib_inflate.inflate(strm,c.Z_NO_FLUSH);if(status===c.Z_BUF_ERROR&&allowBufError===!0){status=c.Z_OK;allowBufError=!1}
        if(status!==c.Z_STREAM_END&&status!==c.Z_OK){this.onEnd(status);this.ended=!0;return!1}
        if(strm.next_out){if(strm.avail_out===0||status===c.Z_STREAM_END||(strm.avail_in===0&&(_mode===c.Z_FINISH||_mode===c.Z_SYNC_FLUSH))){if(this.options.to==='string'){next_out_utf8=strings.utf8border(strm.output,strm.next_out);tail=strm.next_out-next_out_utf8;utf8str=strings.buf2string(strm.output,next_out_utf8);strm.next_out=tail;strm.avail_out=chunkSize-tail;if(tail){utils.arraySet(strm.output,strm.output,next_out_utf8,tail,0)}
            this.onData(utf8str)}else{this.onData(utils.shrinkBuf(strm.output,strm.next_out))}}}
        if(strm.avail_in===0&&strm.avail_out===0){allowBufError=!0}}while((strm.avail_in>0||strm.avail_out===0)&&status!==c.Z_STREAM_END);if(status===c.Z_STREAM_END){_mode=c.Z_FINISH}
    if(_mode===c.Z_FINISH){status=zlib_inflate.inflateEnd(this.strm);this.onEnd(status);this.ended=!0;return status===c.Z_OK}
    if(_mode===c.Z_SYNC_FLUSH){this.onEnd(c.Z_OK);strm.avail_out=0;return!0}
    return!0};Inflate.prototype.onData=function(chunk){this.chunks.push(chunk)};Inflate.prototype.onEnd=function(status){if(status===c.Z_OK){if(this.options.to==='string'){this.result=this.chunks.join('')}else{this.result=utils.flattenChunks(this.chunks)}}
    this.chunks=[];this.err=status;this.msg=this.strm.msg};function inflate(input,options){var inflator=new Inflate(options);inflator.push(input,!0);if(inflator.err){throw inflator.msg}
    return inflator.result}
    function inflateRaw(input,options){options=options||{};options.raw=!0;return inflate(input,options)}
    exports.Inflate=Inflate;exports.inflate=inflate;exports.inflateRaw=inflateRaw;exports.ungzip=inflate},{"./utils/common":93,"./utils/strings":94,"./zlib/constants":96,"./zlib/gzheader":99,"./zlib/inflate.js":101,"./zlib/messages":103,"./zlib/zstream":105}],93:[function(require,module,exports){'use strict';var TYPED_OK=(typeof Uint8Array!=='undefined')&&(typeof Uint16Array!=='undefined')&&(typeof Int32Array!=='undefined');exports.assign=function(obj){var sources=Array.prototype.slice.call(arguments,1);while(sources.length){var source=sources.shift();if(!source){continue}
    if(typeof source!=='object'){throw new TypeError(source+'must be non-object')}
    for(var p in source){if(source.hasOwnProperty(p)){obj[p]=source[p]}}}
    return obj};exports.shrinkBuf=function(buf,size){if(buf.length===size){return buf}
    if(buf.subarray){return buf.subarray(0,size)}
    buf.length=size;return buf};var fnTyped={arraySet:function(dest,src,src_offs,len,dest_offs){if(src.subarray&&dest.subarray){dest.set(src.subarray(src_offs,src_offs+len),dest_offs);return}
    for(var i=0;i<len;i++){dest[dest_offs+i]=src[src_offs+i]}},flattenChunks:function(chunks){var i,l,len,pos,chunk,result;len=0;for(i=0,l=chunks.length;i<l;i++){len+=chunks[i].length}
    result=new Uint8Array(len);pos=0;for(i=0,l=chunks.length;i<l;i++){chunk=chunks[i];result.set(chunk,pos);pos+=chunk.length}
    return result}};var fnUntyped={arraySet:function(dest,src,src_offs,len,dest_offs){for(var i=0;i<len;i++){dest[dest_offs+i]=src[src_offs+i]}},flattenChunks:function(chunks){return[].concat.apply([],chunks)}};exports.setTyped=function(on){if(on){exports.Buf8=Uint8Array;exports.Buf16=Uint16Array;exports.Buf32=Int32Array;exports.assign(exports,fnTyped)}else{exports.Buf8=Array;exports.Buf16=Array;exports.Buf32=Array;exports.assign(exports,fnUntyped)}};exports.setTyped(TYPED_OK)},{}],94:[function(require,module,exports){'use strict';var utils=require('./common');var STR_APPLY_OK=!0;var STR_APPLY_UIA_OK=!0;try{String.fromCharCode.apply(null,[0])}catch(__){STR_APPLY_OK=!1}
    try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(__){STR_APPLY_UIA_OK=!1}
    var _utf8len=new utils.Buf8(256);for(var q=0;q<256;q++){_utf8len[q]=(q>=252?6:q>=248?5:q>=240?4:q>=224?3:q>=192?2:1)}
    _utf8len[254]=_utf8len[254]=1;exports.string2buf=function(str){var buf,c,c2,m_pos,i,str_len=str.length,buf_len=0;for(m_pos=0;m_pos<str_len;m_pos++){c=str.charCodeAt(m_pos);if((c&0xfc00)===0xd800&&(m_pos+1<str_len)){c2=str.charCodeAt(m_pos+1);if((c2&0xfc00)===0xdc00){c=0x10000+((c-0xd800)<<10)+(c2-0xdc00);m_pos++}}
        buf_len+=c<0x80?1:c<0x800?2:c<0x10000?3:4}
        buf=new utils.Buf8(buf_len);for(i=0,m_pos=0;i<buf_len;m_pos++){c=str.charCodeAt(m_pos);if((c&0xfc00)===0xd800&&(m_pos+1<str_len)){c2=str.charCodeAt(m_pos+1);if((c2&0xfc00)===0xdc00){c=0x10000+((c-0xd800)<<10)+(c2-0xdc00);m_pos++}}
            if(c<0x80){buf[i++]=c}else if(c<0x800){buf[i++]=0xC0|(c>>>6);buf[i++]=0x80|(c&0x3f)}else if(c<0x10000){buf[i++]=0xE0|(c>>>12);buf[i++]=0x80|(c>>>6&0x3f);buf[i++]=0x80|(c&0x3f)}else{buf[i++]=0xf0|(c>>>18);buf[i++]=0x80|(c>>>12&0x3f);buf[i++]=0x80|(c>>>6&0x3f);buf[i++]=0x80|(c&0x3f)}}
        return buf};function buf2binstring(buf,len){if(len<65537){if((buf.subarray&&STR_APPLY_UIA_OK)||(!buf.subarray&&STR_APPLY_OK)){return String.fromCharCode.apply(null,utils.shrinkBuf(buf,len))}}
        var result='';for(var i=0;i<len;i++){result+=String.fromCharCode(buf[i])}
        return result}
    exports.buf2binstring=function(buf){return buf2binstring(buf,buf.length)};exports.binstring2buf=function(str){var buf=new utils.Buf8(str.length);for(var i=0,len=buf.length;i<len;i++){buf[i]=str.charCodeAt(i)}
        return buf};exports.buf2string=function(buf,max){var i,out,c,c_len;var len=max||buf.length;var utf16buf=new Array(len*2);for(out=0,i=0;i<len;){c=buf[i++];if(c<0x80){utf16buf[out++]=c;continue}
        c_len=_utf8len[c];if(c_len>4){utf16buf[out++]=0xfffd;i+=c_len-1;continue}
        c&=c_len===2?0x1f:c_len===3?0x0f:0x07;while(c_len>1&&i<len){c=(c<<6)|(buf[i++]&0x3f);c_len--}
        if(c_len>1){utf16buf[out++]=0xfffd;continue}
        if(c<0x10000){utf16buf[out++]=c}else{c-=0x10000;utf16buf[out++]=0xd800|((c>>10)&0x3ff);utf16buf[out++]=0xdc00|(c&0x3ff)}}
        return buf2binstring(utf16buf,out)};exports.utf8border=function(buf,max){var pos;max=max||buf.length;if(max>buf.length){max=buf.length}
        pos=max-1;while(pos>=0&&(buf[pos]&0xC0)===0x80){pos--}
        if(pos<0){return max}
        if(pos===0){return max}
        return(pos+_utf8len[buf[pos]]>max)?pos:max}},{"./common":93}],95:[function(require,module,exports){'use strict';function adler32(adler,buf,len,pos){var s1=(adler&0xffff)|0,s2=((adler>>>16)&0xffff)|0,n=0;while(len!==0){n=len>2000?2000:len;len-=n;do{s1=(s1+buf[pos++])|0;s2=(s2+s1)|0}while(--n);s1%=65521;s2%=65521}
    return(s1|(s2<<16))|0}
    module.exports=adler32},{}],96:[function(require,module,exports){module.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],97:[function(require,module,exports){'use strict';function makeTable(){var c,table=[];for(var n=0;n<256;n++){c=n;for(var k=0;k<8;k++){c=((c&1)?(0xEDB88320^(c>>>1)):(c>>>1))}
    table[n]=c}
    return table}
    var crcTable=makeTable();function crc32(crc,buf,len,pos){var t=crcTable,end=pos+len;crc=crc^(-1);for(var i=pos;i<end;i++){crc=(crc>>>8)^t[(crc^buf[i])&0xFF]}
        return(crc^(-1))}
    module.exports=crc32},{}],98:[function(require,module,exports){'use strict';var utils=require('../utils/common');var trees=require('./trees');var adler32=require('./adler32');var crc32=require('./crc32');var msg=require('./messages');var Z_NO_FLUSH=0;var Z_PARTIAL_FLUSH=1;var Z_FULL_FLUSH=3;var Z_FINISH=4;var Z_BLOCK=5;var Z_OK=0;var Z_STREAM_END=1;var Z_STREAM_ERROR=-2;var Z_DATA_ERROR=-3;var Z_BUF_ERROR=-5;var Z_DEFAULT_COMPRESSION=-1;var Z_FILTERED=1;var Z_HUFFMAN_ONLY=2;var Z_RLE=3;var Z_FIXED=4;var Z_DEFAULT_STRATEGY=0;var Z_UNKNOWN=2;var Z_DEFLATED=8;var MAX_MEM_LEVEL=9;var MAX_WBITS=15;var DEF_MEM_LEVEL=8;var LENGTH_CODES=29;var LITERALS=256;var L_CODES=LITERALS+1+LENGTH_CODES;var D_CODES=30;var BL_CODES=19;var HEAP_SIZE=2*L_CODES+1;var MAX_BITS=15;var MIN_MATCH=3;var MAX_MATCH=258;var MIN_LOOKAHEAD=(MAX_MATCH+MIN_MATCH+1);var PRESET_DICT=0x20;var INIT_STATE=42;var EXTRA_STATE=69;var NAME_STATE=73;var COMMENT_STATE=91;var HCRC_STATE=103;var BUSY_STATE=113;var FINISH_STATE=666;var BS_NEED_MORE=1;var BS_BLOCK_DONE=2;var BS_FINISH_STARTED=3;var BS_FINISH_DONE=4;var OS_CODE=0x03;function err(strm,errorCode){strm.msg=msg[errorCode];return errorCode}
    function rank(f){return((f)<<1)-((f)>4?9:0)}
    function zero(buf){var len=buf.length;while(--len>=0){buf[len]=0}}
    function flush_pending(strm){var s=strm.state;var len=s.pending;if(len>strm.avail_out){len=strm.avail_out}
        if(len===0){return}
        utils.arraySet(strm.output,s.pending_buf,s.pending_out,len,strm.next_out);strm.next_out+=len;s.pending_out+=len;strm.total_out+=len;strm.avail_out-=len;s.pending-=len;if(s.pending===0){s.pending_out=0}}
    function flush_block_only(s,last){trees._tr_flush_block(s,(s.block_start>=0?s.block_start:-1),s.strstart-s.block_start,last);s.block_start=s.strstart;flush_pending(s.strm)}
    function put_byte(s,b){s.pending_buf[s.pending++]=b}
    function putShortMSB(s,b){s.pending_buf[s.pending++]=(b>>>8)&0xff;s.pending_buf[s.pending++]=b&0xff}
    function read_buf(strm,buf,start,size){var len=strm.avail_in;if(len>size){len=size}
        if(len===0){return 0}
        strm.avail_in-=len;utils.arraySet(buf,strm.input,strm.next_in,len,start);if(strm.state.wrap===1){strm.adler=adler32(strm.adler,buf,len,start)}
        else if(strm.state.wrap===2){strm.adler=crc32(strm.adler,buf,len,start)}
        strm.next_in+=len;strm.total_in+=len;return len}
    function longest_match(s,cur_match){var chain_length=s.max_chain_length;var scan=s.strstart;var match;var len;var best_len=s.prev_length;var nice_match=s.nice_match;var limit=(s.strstart>(s.w_size-MIN_LOOKAHEAD))?s.strstart-(s.w_size-MIN_LOOKAHEAD):0;var _win=s.window;var wmask=s.w_mask;var prev=s.prev;var strend=s.strstart+MAX_MATCH;var scan_end1=_win[scan+best_len-1];var scan_end=_win[scan+best_len];if(s.prev_length>=s.good_match){chain_length>>=2}
        if(nice_match>s.lookahead){nice_match=s.lookahead}
        do{match=cur_match;if(_win[match+best_len]!==scan_end||_win[match+best_len-1]!==scan_end1||_win[match]!==_win[scan]||_win[++match]!==_win[scan+1]){continue}
            scan+=2;match++;do{}while(_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&scan<strend);len=MAX_MATCH-(strend-scan);scan=strend-MAX_MATCH;if(len>best_len){s.match_start=cur_match;best_len=len;if(len>=nice_match){break}
                scan_end1=_win[scan+best_len-1];scan_end=_win[scan+best_len]}}while((cur_match=prev[cur_match&wmask])>limit&&--chain_length!==0);if(best_len<=s.lookahead){return best_len}
        return s.lookahead}
    function fill_window(s){var _w_size=s.w_size;var p,n,m,more,str;do{more=s.window_size-s.lookahead-s.strstart;if(s.strstart>=_w_size+(_w_size-MIN_LOOKAHEAD)){utils.arraySet(s.window,s.window,_w_size,_w_size,0);s.match_start-=_w_size;s.strstart-=_w_size;s.block_start-=_w_size;n=s.hash_size;p=n;do{m=s.head[--p];s.head[p]=(m>=_w_size?m-_w_size:0)}while(--n);n=_w_size;p=n;do{m=s.prev[--p];s.prev[p]=(m>=_w_size?m-_w_size:0)}while(--n);more+=_w_size}
        if(s.strm.avail_in===0){break}
        n=read_buf(s.strm,s.window,s.strstart+s.lookahead,more);s.lookahead+=n;if(s.lookahead+s.insert>=MIN_MATCH){str=s.strstart-s.insert;s.ins_h=s.window[str];s.ins_h=((s.ins_h<<s.hash_shift)^s.window[str+1])&s.hash_mask;while(s.insert){s.ins_h=((s.ins_h<<s.hash_shift)^s.window[str+MIN_MATCH-1])&s.hash_mask;s.prev[str&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=str;str++;s.insert--;if(s.lookahead+s.insert<MIN_MATCH){break}}}}while(s.lookahead<MIN_LOOKAHEAD&&s.strm.avail_in!==0)}
    function deflate_stored(s,flush){var max_block_size=0xffff;if(max_block_size>s.pending_buf_size-5){max_block_size=s.pending_buf_size-5}
        for(;;){if(s.lookahead<=1){fill_window(s);if(s.lookahead===0&&flush===Z_NO_FLUSH){return BS_NEED_MORE}
            if(s.lookahead===0){break}}
            s.strstart+=s.lookahead;s.lookahead=0;var max_start=s.block_start+max_block_size;if(s.strstart===0||s.strstart>=max_start){s.lookahead=s.strstart-max_start;s.strstart=max_start;flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}
            if(s.strstart-s.block_start>=(s.w_size-MIN_LOOKAHEAD)){flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}}
        s.insert=0;if(flush===Z_FINISH){flush_block_only(s,!0);if(s.strm.avail_out===0){return BS_FINISH_STARTED}
            return BS_FINISH_DONE}
        if(s.strstart>s.block_start){flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}
        return BS_NEED_MORE}
    function deflate_fast(s,flush){var hash_head;var bflush;for(;;){if(s.lookahead<MIN_LOOKAHEAD){fill_window(s);if(s.lookahead<MIN_LOOKAHEAD&&flush===Z_NO_FLUSH){return BS_NEED_MORE}
        if(s.lookahead===0){break;}}
        hash_head=0;if(s.lookahead>=MIN_MATCH){s.ins_h=((s.ins_h<<s.hash_shift)^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart;}
        if(hash_head!==0&&((s.strstart-hash_head)<=(s.w_size-MIN_LOOKAHEAD))){s.match_length=longest_match(s,hash_head);}
        if(s.match_length>=MIN_MATCH){bflush=trees._tr_tally(s,s.strstart-s.match_start,s.match_length-MIN_MATCH);s.lookahead-=s.match_length;if(s.match_length<=s.max_lazy_match&&s.lookahead>=MIN_MATCH){s.match_length--;do{s.strstart++;s.ins_h=((s.ins_h<<s.hash_shift)^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart}while(--s.match_length!==0);s.strstart++}else{s.strstart+=s.match_length;s.match_length=0;s.ins_h=s.window[s.strstart];s.ins_h=((s.ins_h<<s.hash_shift)^s.window[s.strstart+1])&s.hash_mask}}else{bflush=trees._tr_tally(s,0,s.window[s.strstart]);s.lookahead--;s.strstart++}
        if(bflush){flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}}
        s.insert=((s.strstart<(MIN_MATCH-1))?s.strstart:MIN_MATCH-1);if(flush===Z_FINISH){flush_block_only(s,!0);if(s.strm.avail_out===0){return BS_FINISH_STARTED}
            return BS_FINISH_DONE}
        if(s.last_lit){flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}
        return BS_BLOCK_DONE}
    function deflate_slow(s,flush){var hash_head;var bflush;var max_insert;for(;;){if(s.lookahead<MIN_LOOKAHEAD){fill_window(s);if(s.lookahead<MIN_LOOKAHEAD&&flush===Z_NO_FLUSH){return BS_NEED_MORE}
        if(s.lookahead===0){break}}
        hash_head=0;if(s.lookahead>=MIN_MATCH){s.ins_h=((s.ins_h<<s.hash_shift)^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart;}
        s.prev_length=s.match_length;s.prev_match=s.match_start;s.match_length=MIN_MATCH-1;if(hash_head!==0&&s.prev_length<s.max_lazy_match&&s.strstart-hash_head<=(s.w_size-MIN_LOOKAHEAD)){s.match_length=longest_match(s,hash_head);if(s.match_length<=5&&(s.strategy===Z_FILTERED||(s.match_length===MIN_MATCH&&s.strstart-s.match_start>4096))){s.match_length=MIN_MATCH-1}}
        if(s.prev_length>=MIN_MATCH&&s.match_length<=s.prev_length){max_insert=s.strstart+s.lookahead-MIN_MATCH;bflush=trees._tr_tally(s,s.strstart-1-s.prev_match,s.prev_length-MIN_MATCH);s.lookahead-=s.prev_length-1;s.prev_length-=2;do{if(++s.strstart<=max_insert){s.ins_h=((s.ins_h<<s.hash_shift)^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart;}}while(--s.prev_length!==0);s.match_available=0;s.match_length=MIN_MATCH-1;s.strstart++;if(bflush){flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}}else if(s.match_available){bflush=trees._tr_tally(s,0,s.window[s.strstart-1]);if(bflush){flush_block_only(s,!1);}
            s.strstart++;s.lookahead--;if(s.strm.avail_out===0){return BS_NEED_MORE}}else{s.match_available=1;s.strstart++;s.lookahead--}}
        if(s.match_available){bflush=trees._tr_tally(s,0,s.window[s.strstart-1]);s.match_available=0}
        s.insert=s.strstart<MIN_MATCH-1?s.strstart:MIN_MATCH-1;if(flush===Z_FINISH){flush_block_only(s,!0);if(s.strm.avail_out===0){return BS_FINISH_STARTED}
            return BS_FINISH_DONE}
        if(s.last_lit){flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}
        return BS_BLOCK_DONE}
    function deflate_rle(s,flush){var bflush;var prev;var scan,strend;var _win=s.window;for(;;){if(s.lookahead<=MAX_MATCH){fill_window(s);if(s.lookahead<=MAX_MATCH&&flush===Z_NO_FLUSH){return BS_NEED_MORE}
        if(s.lookahead===0){break}}
        s.match_length=0;if(s.lookahead>=MIN_MATCH&&s.strstart>0){scan=s.strstart-1;prev=_win[scan];if(prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]){strend=s.strstart+MAX_MATCH;do{}while(prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&scan<strend);s.match_length=MAX_MATCH-(strend-scan);if(s.match_length>s.lookahead){s.match_length=s.lookahead}}}
        if(s.match_length>=MIN_MATCH){bflush=trees._tr_tally(s,1,s.match_length-MIN_MATCH);s.lookahead-=s.match_length;s.strstart+=s.match_length;s.match_length=0}else{bflush=trees._tr_tally(s,0,s.window[s.strstart]);s.lookahead--;s.strstart++}
        if(bflush){flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}}
        s.insert=0;if(flush===Z_FINISH){flush_block_only(s,!0);if(s.strm.avail_out===0){return BS_FINISH_STARTED}
            return BS_FINISH_DONE}
        if(s.last_lit){flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}
        return BS_BLOCK_DONE}
    function deflate_huff(s,flush){var bflush;for(;;){if(s.lookahead===0){fill_window(s);if(s.lookahead===0){if(flush===Z_NO_FLUSH){return BS_NEED_MORE}
        break;}}
        s.match_length=0;bflush=trees._tr_tally(s,0,s.window[s.strstart]);s.lookahead--;s.strstart++;if(bflush){flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}}
        s.insert=0;if(flush===Z_FINISH){flush_block_only(s,!0);if(s.strm.avail_out===0){return BS_FINISH_STARTED}
            return BS_FINISH_DONE}
        if(s.last_lit){flush_block_only(s,!1);if(s.strm.avail_out===0){return BS_NEED_MORE}}
        return BS_BLOCK_DONE}
    var Config=function(good_length,max_lazy,nice_length,max_chain,func){this.good_length=good_length;this.max_lazy=max_lazy;this.nice_length=nice_length;this.max_chain=max_chain;this.func=func};var configuration_table;configuration_table=[new Config(0,0,0,0,deflate_stored),new Config(4,4,8,4,deflate_fast),new Config(4,5,16,8,deflate_fast),new Config(4,6,32,32,deflate_fast),new Config(4,4,16,16,deflate_slow),new Config(8,16,32,32,deflate_slow),new Config(8,16,128,128,deflate_slow),new Config(8,32,128,256,deflate_slow),new Config(32,128,258,1024,deflate_slow),new Config(32,258,258,4096,deflate_slow)];function lm_init(s){s.window_size=2*s.w_size;zero(s.head);s.max_lazy_match=configuration_table[s.level].max_lazy;s.good_match=configuration_table[s.level].good_length;s.nice_match=configuration_table[s.level].nice_length;s.max_chain_length=configuration_table[s.level].max_chain;s.strstart=0;s.block_start=0;s.lookahead=0;s.insert=0;s.match_length=s.prev_length=MIN_MATCH-1;s.match_available=0;s.ins_h=0}
    function DeflateState(){this.strm=null;this.status=0;this.pending_buf=null;this.pending_buf_size=0;this.pending_out=0;this.pending=0;this.wrap=0;this.gzhead=null;this.gzindex=0;this.method=Z_DEFLATED;this.last_flush=-1;this.w_size=0;this.w_bits=0;this.w_mask=0;this.window=null;this.window_size=0;this.prev=null;this.head=null;this.ins_h=0;this.hash_size=0;this.hash_bits=0;this.hash_mask=0;this.hash_shift=0;this.block_start=0;this.match_length=0;this.prev_match=0;this.match_available=0;this.strstart=0;this.match_start=0;this.lookahead=0;this.prev_length=0;this.max_chain_length=0;this.max_lazy_match=0;this.level=0;this.strategy=0;this.good_match=0;this.nice_match=0;this.dyn_ltree=new utils.Buf16(HEAP_SIZE*2);this.dyn_dtree=new utils.Buf16((2*D_CODES+1)*2);this.bl_tree=new utils.Buf16((2*BL_CODES+1)*2);zero(this.dyn_ltree);zero(this.dyn_dtree);zero(this.bl_tree);this.l_desc=null;this.d_desc=null;this.bl_desc=null;this.bl_count=new utils.Buf16(MAX_BITS+1);this.heap=new utils.Buf16(2*L_CODES+1);zero(this.heap);this.heap_len=0;this.heap_max=0;this.depth=new utils.Buf16(2*L_CODES+1);zero(this.depth);this.l_buf=0;this.lit_bufsize=0;this.last_lit=0;this.d_buf=0;this.opt_len=0;this.static_len=0;this.matches=0;this.insert=0;this.bi_buf=0;this.bi_valid=0}
    function deflateResetKeep(strm){var s;if(!strm||!strm.state){return err(strm,Z_STREAM_ERROR)}
        strm.total_in=strm.total_out=0;strm.data_type=Z_UNKNOWN;s=strm.state;s.pending=0;s.pending_out=0;if(s.wrap<0){s.wrap=-s.wrap;}
        s.status=(s.wrap?INIT_STATE:BUSY_STATE);strm.adler=(s.wrap===2)?0:1;s.last_flush=Z_NO_FLUSH;trees._tr_init(s);return Z_OK}
    function deflateReset(strm){var ret=deflateResetKeep(strm);if(ret===Z_OK){lm_init(strm.state)}
        return ret}
    function deflateSetHeader(strm,head){if(!strm||!strm.state){return Z_STREAM_ERROR}
        if(strm.state.wrap!==2){return Z_STREAM_ERROR}
        strm.state.gzhead=head;return Z_OK}
    function deflateInit2(strm,level,method,windowBits,memLevel,strategy){if(!strm){return Z_STREAM_ERROR}
        var wrap=1;if(level===Z_DEFAULT_COMPRESSION){level=6}
        if(windowBits<0){wrap=0;windowBits=-windowBits}
        else if(windowBits>15){wrap=2;windowBits-=16}
        if(memLevel<1||memLevel>MAX_MEM_LEVEL||method!==Z_DEFLATED||windowBits<8||windowBits>15||level<0||level>9||strategy<0||strategy>Z_FIXED){return err(strm,Z_STREAM_ERROR)}
        if(windowBits===8){windowBits=9}
        var s=new DeflateState();strm.state=s;s.strm=strm;s.wrap=wrap;s.gzhead=null;s.w_bits=windowBits;s.w_size=1<<s.w_bits;s.w_mask=s.w_size-1;s.hash_bits=memLevel+7;s.hash_size=1<<s.hash_bits;s.hash_mask=s.hash_size-1;s.hash_shift=~~((s.hash_bits+MIN_MATCH-1)/MIN_MATCH);s.window=new utils.Buf8(s.w_size*2);s.head=new utils.Buf16(s.hash_size);s.prev=new utils.Buf16(s.w_size);s.lit_bufsize=1<<(memLevel+6);s.pending_buf_size=s.lit_bufsize*4;s.pending_buf=new utils.Buf8(s.pending_buf_size);s.d_buf=s.lit_bufsize>>1;s.l_buf=(1+2)*s.lit_bufsize;s.level=level;s.strategy=strategy;s.method=method;return deflateReset(strm)}
    function deflateInit(strm,level){return deflateInit2(strm,level,Z_DEFLATED,MAX_WBITS,DEF_MEM_LEVEL,Z_DEFAULT_STRATEGY)}
    function deflate(strm,flush){var old_flush,s;var beg,val;if(!strm||!strm.state||flush>Z_BLOCK||flush<0){return strm?err(strm,Z_STREAM_ERROR):Z_STREAM_ERROR}
        s=strm.state;if(!strm.output||(!strm.input&&strm.avail_in!==0)||(s.status===FINISH_STATE&&flush!==Z_FINISH)){return err(strm,(strm.avail_out===0)?Z_BUF_ERROR:Z_STREAM_ERROR)}
        s.strm=strm;old_flush=s.last_flush;s.last_flush=flush;if(s.status===INIT_STATE){if(s.wrap===2){strm.adler=0;put_byte(s,31);put_byte(s,139);put_byte(s,8);if(!s.gzhead){put_byte(s,0);put_byte(s,0);put_byte(s,0);put_byte(s,0);put_byte(s,0);put_byte(s,s.level===9?2:(s.strategy>=Z_HUFFMAN_ONLY||s.level<2?4:0));put_byte(s,OS_CODE);s.status=BUSY_STATE}
        else{put_byte(s,(s.gzhead.text?1:0)+(s.gzhead.hcrc?2:0)+(!s.gzhead.extra?0:4)+(!s.gzhead.name?0:8)+(!s.gzhead.comment?0:16));put_byte(s,s.gzhead.time&0xff);put_byte(s,(s.gzhead.time>>8)&0xff);put_byte(s,(s.gzhead.time>>16)&0xff);put_byte(s,(s.gzhead.time>>24)&0xff);put_byte(s,s.level===9?2:(s.strategy>=Z_HUFFMAN_ONLY||s.level<2?4:0));put_byte(s,s.gzhead.os&0xff);if(s.gzhead.extra&&s.gzhead.extra.length){put_byte(s,s.gzhead.extra.length&0xff);put_byte(s,(s.gzhead.extra.length>>8)&0xff)}
            if(s.gzhead.hcrc){strm.adler=crc32(strm.adler,s.pending_buf,s.pending,0)}
            s.gzindex=0;s.status=EXTRA_STATE}}
        else{var header=(Z_DEFLATED+((s.w_bits-8)<<4))<<8;var level_flags=-1;if(s.strategy>=Z_HUFFMAN_ONLY||s.level<2){level_flags=0}else if(s.level<6){level_flags=1}else if(s.level===6){level_flags=2}else{level_flags=3}
            header|=(level_flags<<6);if(s.strstart!==0){header|=PRESET_DICT}
            header+=31-(header%31);s.status=BUSY_STATE;putShortMSB(s,header);if(s.strstart!==0){putShortMSB(s,strm.adler>>>16);putShortMSB(s,strm.adler&0xffff)}
            strm.adler=1}}
        if(s.status===EXTRA_STATE){if(s.gzhead.extra){beg=s.pending;while(s.gzindex<(s.gzhead.extra.length&0xffff)){if(s.pending===s.pending_buf_size){if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}
            flush_pending(strm);beg=s.pending;if(s.pending===s.pending_buf_size){break}}
            put_byte(s,s.gzhead.extra[s.gzindex]&0xff);s.gzindex++}
            if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}
            if(s.gzindex===s.gzhead.extra.length){s.gzindex=0;s.status=NAME_STATE}}
        else{s.status=NAME_STATE}}
        if(s.status===NAME_STATE){if(s.gzhead.name){beg=s.pending;do{if(s.pending===s.pending_buf_size){if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}
            flush_pending(strm);beg=s.pending;if(s.pending===s.pending_buf_size){val=1;break}}
            if(s.gzindex<s.gzhead.name.length){val=s.gzhead.name.charCodeAt(s.gzindex++)&0xff}else{val=0}
            put_byte(s,val)}while(val!==0);if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}
            if(val===0){s.gzindex=0;s.status=COMMENT_STATE}}
        else{s.status=COMMENT_STATE}}
        if(s.status===COMMENT_STATE){if(s.gzhead.comment){beg=s.pending;do{if(s.pending===s.pending_buf_size){if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}
            flush_pending(strm);beg=s.pending;if(s.pending===s.pending_buf_size){val=1;break}}
            if(s.gzindex<s.gzhead.comment.length){val=s.gzhead.comment.charCodeAt(s.gzindex++)&0xff}else{val=0}
            put_byte(s,val)}while(val!==0);if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}
            if(val===0){s.status=HCRC_STATE}}
        else{s.status=HCRC_STATE}}
        if(s.status===HCRC_STATE){if(s.gzhead.hcrc){if(s.pending+2>s.pending_buf_size){flush_pending(strm)}
            if(s.pending+2<=s.pending_buf_size){put_byte(s,strm.adler&0xff);put_byte(s,(strm.adler>>8)&0xff);strm.adler=0;s.status=BUSY_STATE}}
        else{s.status=BUSY_STATE}}
        if(s.pending!==0){flush_pending(strm);if(strm.avail_out===0){s.last_flush=-1;return Z_OK}}else if(strm.avail_in===0&&rank(flush)<=rank(old_flush)&&flush!==Z_FINISH){return err(strm,Z_BUF_ERROR)}
        if(s.status===FINISH_STATE&&strm.avail_in!==0){return err(strm,Z_BUF_ERROR)}
        if(strm.avail_in!==0||s.lookahead!==0||(flush!==Z_NO_FLUSH&&s.status!==FINISH_STATE)){var bstate=(s.strategy===Z_HUFFMAN_ONLY)?deflate_huff(s,flush):(s.strategy===Z_RLE?deflate_rle(s,flush):configuration_table[s.level].func(s,flush));if(bstate===BS_FINISH_STARTED||bstate===BS_FINISH_DONE){s.status=FINISH_STATE}
            if(bstate===BS_NEED_MORE||bstate===BS_FINISH_STARTED){if(strm.avail_out===0){s.last_flush=-1;}
                return Z_OK}
            if(bstate===BS_BLOCK_DONE){if(flush===Z_PARTIAL_FLUSH){trees._tr_align(s)}
            else if(flush!==Z_BLOCK){trees._tr_stored_block(s,0,0,!1);if(flush===Z_FULL_FLUSH){zero(s.head);if(s.lookahead===0){s.strstart=0;s.block_start=0;s.insert=0}}}
                flush_pending(strm);if(strm.avail_out===0){s.last_flush=-1;return Z_OK}}}
        if(flush!==Z_FINISH){return Z_OK}
        if(s.wrap<=0){return Z_STREAM_END}
        if(s.wrap===2){put_byte(s,strm.adler&0xff);put_byte(s,(strm.adler>>8)&0xff);put_byte(s,(strm.adler>>16)&0xff);put_byte(s,(strm.adler>>24)&0xff);put_byte(s,strm.total_in&0xff);put_byte(s,(strm.total_in>>8)&0xff);put_byte(s,(strm.total_in>>16)&0xff);put_byte(s,(strm.total_in>>24)&0xff)}
        else{putShortMSB(s,strm.adler>>>16);putShortMSB(s,strm.adler&0xffff)}
        flush_pending(strm);if(s.wrap>0){s.wrap=-s.wrap}
        return s.pending!==0?Z_OK:Z_STREAM_END}
    function deflateEnd(strm){var status;if(!strm||!strm.state){return Z_STREAM_ERROR}
        status=strm.state.status;if(status!==INIT_STATE&&status!==EXTRA_STATE&&status!==NAME_STATE&&status!==COMMENT_STATE&&status!==HCRC_STATE&&status!==BUSY_STATE&&status!==FINISH_STATE){return err(strm,Z_STREAM_ERROR)}
        strm.state=null;return status===BUSY_STATE?err(strm,Z_DATA_ERROR):Z_OK}
    exports.deflateInit=deflateInit;exports.deflateInit2=deflateInit2;exports.deflateReset=deflateReset;exports.deflateResetKeep=deflateResetKeep;exports.deflateSetHeader=deflateSetHeader;exports.deflate=deflate;exports.deflateEnd=deflateEnd;exports.deflateInfo='pako deflate (from Nodeca project)'},{"../utils/common":93,"./adler32":95,"./crc32":97,"./messages":103,"./trees":104}],99:[function(require,module,exports){'use strict';function GZheader(){this.text=0;this.time=0;this.xflags=0;this.os=0;this.extra=null;this.extra_len=0;this.name='';this.comment='';this.hcrc=0;this.done=!1}
    module.exports=GZheader},{}],100:[function(require,module,exports){'use strict';var BAD=30;var TYPE=12;module.exports=function inflate_fast(strm,start){var state;var _in;var last;var _out;var beg;var end;var dmax;var wsize;var whave;var wnext;var s_window;var hold;var bits;var lcode;var dcode;var lmask;var dmask;var here;var op;var len;var dist;var from;var from_source;var input,output;state=strm.state;_in=strm.next_in;input=strm.input;last=_in+(strm.avail_in-5);_out=strm.next_out;output=strm.output;beg=_out-(start-strm.avail_out);end=_out+(strm.avail_out-257);dmax=state.dmax;wsize=state.wsize;whave=state.whave;wnext=state.wnext;s_window=state.window;hold=state.hold;bits=state.bits;lcode=state.lencode;dcode=state.distcode;lmask=(1<<state.lenbits)-1;dmask=(1<<state.distbits)-1;top:do{if(bits<15){hold+=input[_in++]<<bits;bits+=8;hold+=input[_in++]<<bits;bits+=8}
    here=lcode[hold&lmask];dolen:for(;;){op=here>>>24;hold>>>=op;bits-=op;op=(here>>>16)&0xff;if(op===0){output[_out++]=here&0xffff}
    else if(op&16){len=here&0xffff;op&=15;if(op){if(bits<op){hold+=input[_in++]<<bits;bits+=8}
        len+=hold&((1<<op)-1);hold>>>=op;bits-=op}
        if(bits<15){hold+=input[_in++]<<bits;bits+=8;hold+=input[_in++]<<bits;bits+=8}
        here=dcode[hold&dmask];dodist:for(;;){op=here>>>24;hold>>>=op;bits-=op;op=(here>>>16)&0xff;if(op&16){dist=here&0xffff;op&=15;if(bits<op){hold+=input[_in++]<<bits;bits+=8;if(bits<op){hold+=input[_in++]<<bits;bits+=8}}
            dist+=hold&((1<<op)-1);if(dist>dmax){strm.msg='invalid distance too far back';state.mode=BAD;break top}
            hold>>>=op;bits-=op;op=_out-beg;if(dist>op){op=dist-op;if(op>whave){if(state.sane){strm.msg='invalid distance too far back';state.mode=BAD;break top}}
                from=0;from_source=s_window;if(wnext===0){from+=wsize-op;if(op<len){len-=op;do{output[_out++]=s_window[from++]}while(--op);from=_out-dist;from_source=output}}
                else if(wnext<op){from+=wsize+wnext-op;op-=wnext;if(op<len){len-=op;do{output[_out++]=s_window[from++]}while(--op);from=0;if(wnext<len){op=wnext;len-=op;do{output[_out++]=s_window[from++]}while(--op);from=_out-dist;from_source=output}}}
                else{from+=wnext-op;if(op<len){len-=op;do{output[_out++]=s_window[from++]}while(--op);from=_out-dist;from_source=output}}
                while(len>2){output[_out++]=from_source[from++];output[_out++]=from_source[from++];output[_out++]=from_source[from++];len-=3}
                if(len){output[_out++]=from_source[from++];if(len>1){output[_out++]=from_source[from++]}}}
            else{from=_out-dist;do{output[_out++]=output[from++];output[_out++]=output[from++];output[_out++]=output[from++];len-=3}while(len>2);if(len){output[_out++]=output[from++];if(len>1){output[_out++]=output[from++]}}}}
        else if((op&64)===0){here=dcode[(here&0xffff)+(hold&((1<<op)-1))];continue dodist}
        else{strm.msg='invalid distance code';state.mode=BAD;break top}
            break}}
    else if((op&64)===0){here=lcode[(here&0xffff)+(hold&((1<<op)-1))];continue dolen}
    else if(op&32){state.mode=TYPE;break top}
    else{strm.msg='invalid literal/length code';state.mode=BAD;break top}
        break}}while(_in<last&&_out<end);len=bits>>3;_in-=len;bits-=len<<3;hold&=(1<<bits)-1;strm.next_in=_in;strm.next_out=_out;strm.avail_in=(_in<last?5+(last-_in):5-(_in-last));strm.avail_out=(_out<end?257+(end-_out):257-(_out-end));state.hold=hold;state.bits=bits;return}},{}],101:[function(require,module,exports){'use strict';var utils=require('../utils/common');var adler32=require('./adler32');var crc32=require('./crc32');var inflate_fast=require('./inffast');var inflate_table=require('./inftrees');var CODES=0;var LENS=1;var DISTS=2;var Z_FINISH=4;var Z_BLOCK=5;var Z_TREES=6;var Z_OK=0;var Z_STREAM_END=1;var Z_NEED_DICT=2;var Z_STREAM_ERROR=-2;var Z_DATA_ERROR=-3;var Z_MEM_ERROR=-4;var Z_BUF_ERROR=-5;var Z_DEFLATED=8;var HEAD=1;var FLAGS=2;var TIME=3;var OS=4;var EXLEN=5;var EXTRA=6;var NAME=7;var COMMENT=8;var HCRC=9;var DICTID=10;var DICT=11;var TYPE=12;var TYPEDO=13;var STORED=14;var COPY_=15;var COPY=16;var TABLE=17;var LENLENS=18;var CODELENS=19;var LEN_=20;var LEN=21;var LENEXT=22;var DIST=23;var DISTEXT=24;var MATCH=25;var LIT=26;var CHECK=27;var LENGTH=28;var DONE=29;var BAD=30;var MEM=31;var SYNC=32;var ENOUGH_LENS=852;var ENOUGH_DISTS=592;var MAX_WBITS=15;var DEF_WBITS=MAX_WBITS;function ZSWAP32(q){return(((q>>>24)&0xff)+((q>>>8)&0xff00)+((q&0xff00)<<8)+((q&0xff)<<24))}
    function InflateState(){this.mode=0;this.last=!1;this.wrap=0;this.havedict=!1;this.flags=0;this.dmax=0;this.check=0;this.total=0;this.head=null;this.wbits=0;this.wsize=0;this.whave=0;this.wnext=0;this.window=null;this.hold=0;this.bits=0;this.length=0;this.offset=0;this.extra=0;this.lencode=null;this.distcode=null;this.lenbits=0;this.distbits=0;this.ncode=0;this.nlen=0;this.ndist=0;this.have=0;this.next=null;this.lens=new utils.Buf16(320);this.work=new utils.Buf16(288);this.lendyn=null;this.distdyn=null;this.sane=0;this.back=0;this.was=0;}
    function inflateResetKeep(strm){var state;if(!strm||!strm.state){return Z_STREAM_ERROR}
        state=strm.state;strm.total_in=strm.total_out=state.total=0;strm.msg='';if(state.wrap){strm.adler=state.wrap&1}
        state.mode=HEAD;state.last=0;state.havedict=0;state.dmax=32768;state.head=null;state.hold=0;state.bits=0;state.lencode=state.lendyn=new utils.Buf32(ENOUGH_LENS);state.distcode=state.distdyn=new utils.Buf32(ENOUGH_DISTS);state.sane=1;state.back=-1;return Z_OK}
    function inflateReset(strm){var state;if(!strm||!strm.state){return Z_STREAM_ERROR}
        state=strm.state;state.wsize=0;state.whave=0;state.wnext=0;return inflateResetKeep(strm)}
    function inflateReset2(strm,windowBits){var wrap;var state;if(!strm||!strm.state){return Z_STREAM_ERROR}
        state=strm.state;if(windowBits<0){wrap=0;windowBits=-windowBits}
        else{wrap=(windowBits>>4)+1;if(windowBits<48){windowBits&=15}}
        if(windowBits&&(windowBits<8||windowBits>15)){return Z_STREAM_ERROR}
        if(state.window!==null&&state.wbits!==windowBits){state.window=null}
        state.wrap=wrap;state.wbits=windowBits;return inflateReset(strm)}
    function inflateInit2(strm,windowBits){var ret;var state;if(!strm){return Z_STREAM_ERROR}
        state=new InflateState();strm.state=state;state.window=null;ret=inflateReset2(strm,windowBits);if(ret!==Z_OK){strm.state=null}
        return ret}
    function inflateInit(strm){return inflateInit2(strm,DEF_WBITS)}
    var virgin=!0;var lenfix,distfix;function fixedtables(state){if(virgin){var sym;lenfix=new utils.Buf32(512);distfix=new utils.Buf32(32);sym=0;while(sym<144){state.lens[sym++]=8}
        while(sym<256){state.lens[sym++]=9}
        while(sym<280){state.lens[sym++]=7}
        while(sym<288){state.lens[sym++]=8}
        inflate_table(LENS,state.lens,0,288,lenfix,0,state.work,{bits:9});sym=0;while(sym<32){state.lens[sym++]=5}
        inflate_table(DISTS,state.lens,0,32,distfix,0,state.work,{bits:5});virgin=!1}
        state.lencode=lenfix;state.lenbits=9;state.distcode=distfix;state.distbits=5}
    function updatewindow(strm,src,end,copy){var dist;var state=strm.state;if(state.window===null){state.wsize=1<<state.wbits;state.wnext=0;state.whave=0;state.window=new utils.Buf8(state.wsize)}
        if(copy>=state.wsize){utils.arraySet(state.window,src,end-state.wsize,state.wsize,0);state.wnext=0;state.whave=state.wsize}
        else{dist=state.wsize-state.wnext;if(dist>copy){dist=copy}
            utils.arraySet(state.window,src,end-copy,dist,state.wnext);copy-=dist;if(copy){utils.arraySet(state.window,src,end-copy,copy,0);state.wnext=copy;state.whave=state.wsize}
            else{state.wnext+=dist;if(state.wnext===state.wsize){state.wnext=0}
                if(state.whave<state.wsize){state.whave+=dist}}}
        return 0}
    function inflate(strm,flush){var state;var input,output;var next;var put;var have,left;var hold;var bits;var _in,_out;var copy;var from;var from_source;var here=0;var here_bits,here_op,here_val;var last_bits,last_op,last_val;var len;var ret;var hbuf=new utils.Buf8(4);var opts;var n;var order=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!strm||!strm.state||!strm.output||(!strm.input&&strm.avail_in!==0)){return Z_STREAM_ERROR}
        state=strm.state;if(state.mode===TYPE){state.mode=TYPEDO}
        put=strm.next_out;output=strm.output;left=strm.avail_out;next=strm.next_in;input=strm.input;have=strm.avail_in;hold=state.hold;bits=state.bits;_in=have;_out=left;ret=Z_OK;inf_leave:for(;;){switch(state.mode){case HEAD:if(state.wrap===0){state.mode=TYPEDO;break}
            while(bits<16){if(have===0){break inf_leave}
                have--;hold+=input[next++]<<bits;bits+=8}
            if((state.wrap&2)&&hold===0x8b1f){state.check=0;hbuf[0]=hold&0xff;hbuf[1]=(hold>>>8)&0xff;state.check=crc32(state.check,hbuf,2,0);hold=0;bits=0;state.mode=FLAGS;break}
            state.flags=0;if(state.head){state.head.done=!1}
            if(!(state.wrap&1)||(((hold&0xff)<<8)+(hold>>8))%31){strm.msg='incorrect header check';state.mode=BAD;break}
            if((hold&0x0f)!==Z_DEFLATED){strm.msg='unknown compression method';state.mode=BAD;break}
            hold>>>=4;bits-=4;len=(hold&0x0f)+8;if(state.wbits===0){state.wbits=len}
            else if(len>state.wbits){strm.msg='invalid window size';state.mode=BAD;break}
            state.dmax=1<<len;strm.adler=state.check=1;state.mode=hold&0x200?DICTID:TYPE;hold=0;bits=0;break;case FLAGS:while(bits<16){if(have===0){break inf_leave}
            have--;hold+=input[next++]<<bits;bits+=8}
            state.flags=hold;if((state.flags&0xff)!==Z_DEFLATED){strm.msg='unknown compression method';state.mode=BAD;break}
            if(state.flags&0xe000){strm.msg='unknown header flags set';state.mode=BAD;break}
            if(state.head){state.head.text=((hold>>8)&1)}
            if(state.flags&0x0200){hbuf[0]=hold&0xff;hbuf[1]=(hold>>>8)&0xff;state.check=crc32(state.check,hbuf,2,0)}
            hold=0;bits=0;state.mode=TIME;case TIME:while(bits<32){if(have===0){break inf_leave}
            have--;hold+=input[next++]<<bits;bits+=8}
            if(state.head){state.head.time=hold}
            if(state.flags&0x0200){hbuf[0]=hold&0xff;hbuf[1]=(hold>>>8)&0xff;hbuf[2]=(hold>>>16)&0xff;hbuf[3]=(hold>>>24)&0xff;state.check=crc32(state.check,hbuf,4,0)}
            hold=0;bits=0;state.mode=OS;case OS:while(bits<16){if(have===0){break inf_leave}
            have--;hold+=input[next++]<<bits;bits+=8}
            if(state.head){state.head.xflags=(hold&0xff);state.head.os=(hold>>8)}
            if(state.flags&0x0200){hbuf[0]=hold&0xff;hbuf[1]=(hold>>>8)&0xff;state.check=crc32(state.check,hbuf,2,0)}
            hold=0;bits=0;state.mode=EXLEN;case EXLEN:if(state.flags&0x0400){while(bits<16){if(have===0){break inf_leave}
            have--;hold+=input[next++]<<bits;bits+=8}
            state.length=hold;if(state.head){state.head.extra_len=hold}
            if(state.flags&0x0200){hbuf[0]=hold&0xff;hbuf[1]=(hold>>>8)&0xff;state.check=crc32(state.check,hbuf,2,0)}
            hold=0;bits=0}
        else if(state.head){state.head.extra=null}
            state.mode=EXTRA;case EXTRA:if(state.flags&0x0400){copy=state.length;if(copy>have){copy=have}
            if(copy){if(state.head){len=state.head.extra_len-state.length;if(!state.head.extra){state.head.extra=new Array(state.head.extra_len)}
                utils.arraySet(state.head.extra,input,next,copy,len)}
                if(state.flags&0x0200){state.check=crc32(state.check,input,copy,next)}
                have-=copy;next+=copy;state.length-=copy}
            if(state.length){break inf_leave}}
            state.length=0;state.mode=NAME;case NAME:if(state.flags&0x0800){if(have===0){break inf_leave}
            copy=0;do{len=input[next+copy++];if(state.head&&len&&(state.length<65536)){state.head.name+=String.fromCharCode(len)}}while(len&&copy<have);if(state.flags&0x0200){state.check=crc32(state.check,input,copy,next)}
            have-=copy;next+=copy;if(len){break inf_leave}}
        else if(state.head){state.head.name=null}
            state.length=0;state.mode=COMMENT;case COMMENT:if(state.flags&0x1000){if(have===0){break inf_leave}
            copy=0;do{len=input[next+copy++];if(state.head&&len&&(state.length<65536)){state.head.comment+=String.fromCharCode(len)}}while(len&&copy<have);if(state.flags&0x0200){state.check=crc32(state.check,input,copy,next)}
            have-=copy;next+=copy;if(len){break inf_leave}}
        else if(state.head){state.head.comment=null}
            state.mode=HCRC;case HCRC:if(state.flags&0x0200){while(bits<16){if(have===0){break inf_leave}
            have--;hold+=input[next++]<<bits;bits+=8}
            if(hold!==(state.check&0xffff)){strm.msg='header crc mismatch';state.mode=BAD;break}
            hold=0;bits=0}
            if(state.head){state.head.hcrc=((state.flags>>9)&1);state.head.done=!0}
            strm.adler=state.check=0;state.mode=TYPE;break;case DICTID:while(bits<32){if(have===0){break inf_leave}
            have--;hold+=input[next++]<<bits;bits+=8}
            strm.adler=state.check=ZSWAP32(hold);hold=0;bits=0;state.mode=DICT;case DICT:if(state.havedict===0){strm.next_out=put;strm.avail_out=left;strm.next_in=next;strm.avail_in=have;state.hold=hold;state.bits=bits;return Z_NEED_DICT}
            strm.adler=state.check=1;state.mode=TYPE;case TYPE:if(flush===Z_BLOCK||flush===Z_TREES){break inf_leave}
            case TYPEDO:if(state.last){hold>>>=bits&7;bits-=bits&7;state.mode=CHECK;break}
                while(bits<3){if(have===0){break inf_leave}
                    have--;hold+=input[next++]<<bits;bits+=8}
                state.last=(hold&0x01);hold>>>=1;bits-=1;switch((hold&0x03)){case 0:state.mode=STORED;break;case 1:fixedtables(state);state.mode=LEN_;if(flush===Z_TREES){hold>>>=2;bits-=2;break inf_leave}
                break;case 2:state.mode=TABLE;break;case 3:strm.msg='invalid block type';state.mode=BAD}
                hold>>>=2;bits-=2;break;case STORED:hold>>>=bits&7;bits-=bits&7;while(bits<32){if(have===0){break inf_leave}
                have--;hold+=input[next++]<<bits;bits+=8}
                if((hold&0xffff)!==((hold>>>16)^0xffff)){strm.msg='invalid stored block lengths';state.mode=BAD;break}
                state.length=hold&0xffff;hold=0;bits=0;state.mode=COPY_;if(flush===Z_TREES){break inf_leave}
            case COPY_:state.mode=COPY;case COPY:copy=state.length;if(copy){if(copy>have){copy=have}
                if(copy>left){copy=left}
                if(copy===0){break inf_leave}
                utils.arraySet(output,input,next,copy,put);have-=copy;next+=copy;left-=copy;put+=copy;state.length-=copy;break}
                state.mode=TYPE;break;case TABLE:while(bits<14){if(have===0){break inf_leave}
                have--;hold+=input[next++]<<bits;bits+=8}
                state.nlen=(hold&0x1f)+257;hold>>>=5;bits-=5;state.ndist=(hold&0x1f)+1;hold>>>=5;bits-=5;state.ncode=(hold&0x0f)+4;hold>>>=4;bits-=4;if(state.nlen>286||state.ndist>30){strm.msg='too many length or distance symbols';state.mode=BAD;break}
                state.have=0;state.mode=LENLENS;case LENLENS:while(state.have<state.ncode){while(bits<3){if(have===0){break inf_leave}
                have--;hold+=input[next++]<<bits;bits+=8}
                state.lens[order[state.have++]]=(hold&0x07);hold>>>=3;bits-=3}
                while(state.have<19){state.lens[order[state.have++]]=0}
                state.lencode=state.lendyn;state.lenbits=7;opts={bits:state.lenbits};ret=inflate_table(CODES,state.lens,0,19,state.lencode,0,state.work,opts);state.lenbits=opts.bits;if(ret){strm.msg='invalid code lengths set';state.mode=BAD;break}
                state.have=0;state.mode=CODELENS;case CODELENS:while(state.have<state.nlen+state.ndist){for(;;){here=state.lencode[hold&((1<<state.lenbits)-1)];here_bits=here>>>24;here_op=(here>>>16)&0xff;here_val=here&0xffff;if((here_bits)<=bits){break}
                if(have===0){break inf_leave}
                have--;hold+=input[next++]<<bits;bits+=8}
                if(here_val<16){hold>>>=here_bits;bits-=here_bits;state.lens[state.have++]=here_val}
                else{if(here_val===16){n=here_bits+2;while(bits<n){if(have===0){break inf_leave}
                    have--;hold+=input[next++]<<bits;bits+=8}
                    hold>>>=here_bits;bits-=here_bits;if(state.have===0){strm.msg='invalid bit length repeat';state.mode=BAD;break}
                    len=state.lens[state.have-1];copy=3+(hold&0x03);hold>>>=2;bits-=2}
                else if(here_val===17){n=here_bits+3;while(bits<n){if(have===0){break inf_leave}
                    have--;hold+=input[next++]<<bits;bits+=8}
                    hold>>>=here_bits;bits-=here_bits;len=0;copy=3+(hold&0x07);hold>>>=3;bits-=3}
                else{n=here_bits+7;while(bits<n){if(have===0){break inf_leave}
                    have--;hold+=input[next++]<<bits;bits+=8}
                    hold>>>=here_bits;bits-=here_bits;len=0;copy=11+(hold&0x7f);hold>>>=7;bits-=7}
                    if(state.have+copy>state.nlen+state.ndist){strm.msg='invalid bit length repeat';state.mode=BAD;break}
                    while(copy--){state.lens[state.have++]=len}}}
                if(state.mode===BAD){break}
                if(state.lens[256]===0){strm.msg='invalid code -- missing end-of-block';state.mode=BAD;break}
                state.lenbits=9;opts={bits:state.lenbits};ret=inflate_table(LENS,state.lens,0,state.nlen,state.lencode,0,state.work,opts);state.lenbits=opts.bits;if(ret){strm.msg='invalid literal/lengths set';state.mode=BAD;break}
                state.distbits=6;state.distcode=state.distdyn;opts={bits:state.distbits};ret=inflate_table(DISTS,state.lens,state.nlen,state.ndist,state.distcode,0,state.work,opts);state.distbits=opts.bits;if(ret){strm.msg='invalid distances set';state.mode=BAD;break}
                state.mode=LEN_;if(flush===Z_TREES){break inf_leave}
            case LEN_:state.mode=LEN;case LEN:if(have>=6&&left>=258){strm.next_out=put;strm.avail_out=left;strm.next_in=next;strm.avail_in=have;state.hold=hold;state.bits=bits;inflate_fast(strm,_out);put=strm.next_out;output=strm.output;left=strm.avail_out;next=strm.next_in;input=strm.input;have=strm.avail_in;hold=state.hold;bits=state.bits;if(state.mode===TYPE){state.back=-1}
                break}
                state.back=0;for(;;){here=state.lencode[hold&((1<<state.lenbits)-1)];here_bits=here>>>24;here_op=(here>>>16)&0xff;here_val=here&0xffff;if(here_bits<=bits){break}
                    if(have===0){break inf_leave}
                    have--;hold+=input[next++]<<bits;bits+=8}
                if(here_op&&(here_op&0xf0)===0){last_bits=here_bits;last_op=here_op;last_val=here_val;for(;;){here=state.lencode[last_val+((hold&((1<<(last_bits+last_op))-1))>>last_bits)];here_bits=here>>>24;here_op=(here>>>16)&0xff;here_val=here&0xffff;if((last_bits+here_bits)<=bits){break}
                    if(have===0){break inf_leave}
                    have--;hold+=input[next++]<<bits;bits+=8}
                    hold>>>=last_bits;bits-=last_bits;state.back+=last_bits}
                hold>>>=here_bits;bits-=here_bits;state.back+=here_bits;state.length=here_val;if(here_op===0){state.mode=LIT;break}
                if(here_op&32){state.back=-1;state.mode=TYPE;break}
                if(here_op&64){strm.msg='invalid literal/length code';state.mode=BAD;break}
                state.extra=here_op&15;state.mode=LENEXT;case LENEXT:if(state.extra){n=state.extra;while(bits<n){if(have===0){break inf_leave}
                have--;hold+=input[next++]<<bits;bits+=8}
                state.length+=hold&((1<<state.extra)-1);hold>>>=state.extra;bits-=state.extra;state.back+=state.extra}
                state.was=state.length;state.mode=DIST;case DIST:for(;;){here=state.distcode[hold&((1<<state.distbits)-1)];here_bits=here>>>24;here_op=(here>>>16)&0xff;here_val=here&0xffff;if((here_bits)<=bits){break}
                if(have===0){break inf_leave}
                have--;hold+=input[next++]<<bits;bits+=8}
                if((here_op&0xf0)===0){last_bits=here_bits;last_op=here_op;last_val=here_val;for(;;){here=state.distcode[last_val+((hold&((1<<(last_bits+last_op))-1))>>last_bits)];here_bits=here>>>24;here_op=(here>>>16)&0xff;here_val=here&0xffff;if((last_bits+here_bits)<=bits){break}
                    if(have===0){break inf_leave}
                    have--;hold+=input[next++]<<bits;bits+=8}
                    hold>>>=last_bits;bits-=last_bits;state.back+=last_bits}
                hold>>>=here_bits;bits-=here_bits;state.back+=here_bits;if(here_op&64){strm.msg='invalid distance code';state.mode=BAD;break}
                state.offset=here_val;state.extra=(here_op)&15;state.mode=DISTEXT;case DISTEXT:if(state.extra){n=state.extra;while(bits<n){if(have===0){break inf_leave}
                have--;hold+=input[next++]<<bits;bits+=8}
                state.offset+=hold&((1<<state.extra)-1);hold>>>=state.extra;bits-=state.extra;state.back+=state.extra}
                if(state.offset>state.dmax){strm.msg='invalid distance too far back';state.mode=BAD;break}
                state.mode=MATCH;case MATCH:if(left===0){break inf_leave}
                copy=_out-left;if(state.offset>copy){copy=state.offset-copy;if(copy>state.whave){if(state.sane){strm.msg='invalid distance too far back';state.mode=BAD;break}}
                    if(copy>state.wnext){copy-=state.wnext;from=state.wsize-copy}
                    else{from=state.wnext-copy}
                    if(copy>state.length){copy=state.length}
                    from_source=state.window}
                else{from_source=output;from=put-state.offset;copy=state.length}
                if(copy>left){copy=left}
                left-=copy;state.length-=copy;do{output[put++]=from_source[from++]}while(--copy);if(state.length===0){state.mode=LEN}
                break;case LIT:if(left===0){break inf_leave}
                output[put++]=state.length;left--;state.mode=LEN;break;case CHECK:if(state.wrap){while(bits<32){if(have===0){break inf_leave}
                have--;hold|=input[next++]<<bits;bits+=8}
                _out-=left;strm.total_out+=_out;state.total+=_out;if(_out){strm.adler=state.check=(state.flags?crc32(state.check,output,_out,put-_out):adler32(state.check,output,_out,put-_out))}
                _out=left;if((state.flags?hold:ZSWAP32(hold))!==state.check){strm.msg='incorrect data check';state.mode=BAD;break}
                hold=0;bits=0}
                state.mode=LENGTH;case LENGTH:if(state.wrap&&state.flags){while(bits<32){if(have===0){break inf_leave}
                have--;hold+=input[next++]<<bits;bits+=8}
                if(hold!==(state.total&0xffffffff)){strm.msg='incorrect length check';state.mode=BAD;break}
                hold=0;bits=0}
                state.mode=DONE;case DONE:ret=Z_STREAM_END;break inf_leave;case BAD:ret=Z_DATA_ERROR;break inf_leave;case MEM:return Z_MEM_ERROR;case SYNC:default:return Z_STREAM_ERROR}}
        strm.next_out=put;strm.avail_out=left;strm.next_in=next;strm.avail_in=have;state.hold=hold;state.bits=bits;if(state.wsize||(_out!==strm.avail_out&&state.mode<BAD&&(state.mode<CHECK||flush!==Z_FINISH))){if(updatewindow(strm,strm.output,strm.next_out,_out-strm.avail_out)){state.mode=MEM;return Z_MEM_ERROR}}
        _in-=strm.avail_in;_out-=strm.avail_out;strm.total_in+=_in;strm.total_out+=_out;state.total+=_out;if(state.wrap&&_out){strm.adler=state.check=(state.flags?crc32(state.check,output,_out,strm.next_out-_out):adler32(state.check,output,_out,strm.next_out-_out))}
        strm.data_type=state.bits+(state.last?64:0)+(state.mode===TYPE?128:0)+(state.mode===LEN_||state.mode===COPY_?256:0);if(((_in===0&&_out===0)||flush===Z_FINISH)&&ret===Z_OK){ret=Z_BUF_ERROR}
        return ret}
    function inflateEnd(strm){if(!strm||!strm.state){return Z_STREAM_ERROR}
        var state=strm.state;if(state.window){state.window=null}
        strm.state=null;return Z_OK}
    function inflateGetHeader(strm,head){var state;if(!strm||!strm.state){return Z_STREAM_ERROR}
        state=strm.state;if((state.wrap&2)===0){return Z_STREAM_ERROR}
        state.head=head;head.done=!1;return Z_OK}
    exports.inflateReset=inflateReset;exports.inflateReset2=inflateReset2;exports.inflateResetKeep=inflateResetKeep;exports.inflateInit=inflateInit;exports.inflateInit2=inflateInit2;exports.inflate=inflate;exports.inflateEnd=inflateEnd;exports.inflateGetHeader=inflateGetHeader;exports.inflateInfo='pako inflate (from Nodeca project)'},{"../utils/common":93,"./adler32":95,"./crc32":97,"./inffast":100,"./inftrees":102}],102:[function(require,module,exports){'use strict';var utils=require('../utils/common');var MAXBITS=15;var ENOUGH_LENS=852;var ENOUGH_DISTS=592;var CODES=0;var LENS=1;var DISTS=2;var lbase=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0];var lext=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78];var dbase=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0];var dext=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];module.exports=function inflate_table(type,lens,lens_index,codes,table,table_index,work,opts)
{var bits=opts.bits;var len=0;var sym=0;var min=0,max=0;var root=0;var curr=0;var drop=0;var left=0;var used=0;var huff=0;var incr;var fill;var low;var mask;var next;var base=null;var base_index=0;var end;var count=new utils.Buf16(MAXBITS+1);var offs=new utils.Buf16(MAXBITS+1);var extra=null;var extra_index=0;var here_bits,here_op,here_val;for(len=0;len<=MAXBITS;len++){count[len]=0}
    for(sym=0;sym<codes;sym++){count[lens[lens_index+sym]]++}
    root=bits;for(max=MAXBITS;max>=1;max--){if(count[max]!==0){break}}
    if(root>max){root=max}
    if(max===0){table[table_index++]=(1<<24)|(64<<16)|0;table[table_index++]=(1<<24)|(64<<16)|0;opts.bits=1;return 0;/* no symbols, but wait for decoding to report error */}
    for(min=1;min<max;min++){if(count[min]!==0){break}}
    if(root<min){root=min}
    left=1;for(len=1;len<=MAXBITS;len++){left<<=1;left-=count[len];if(left<0){return-1}/* over-subscribed */}
    if(left>0&&(type===CODES||max!==1)){return-1;/* incomplete set */}
    offs[1]=0;for(len=1;len<MAXBITS;len++){offs[len+1]=offs[len]+count[len]}
    for(sym=0;sym<codes;sym++){if(lens[lens_index+sym]!==0){work[offs[lens[lens_index+sym]]++]=sym}}
    if(type===CODES){base=extra=work;end=19}else if(type===LENS){base=lbase;base_index-=257;extra=lext;extra_index-=257;end=256}else{base=dbase;extra=dext;end=-1}
    huff=0;sym=0;len=min;next=table_index;curr=root;drop=0;low=-1;used=1<<root;mask=used-1;if((type===LENS&&used>ENOUGH_LENS)||(type===DISTS&&used>ENOUGH_DISTS)){return 1}
    var i=0;for(;;){i++;here_bits=len-drop;if(work[sym]<end){here_op=0;here_val=work[sym]}
else if(work[sym]>end){here_op=extra[extra_index+work[sym]];here_val=base[base_index+work[sym]]}
else{here_op=32+64;here_val=0}
    incr=1<<(len-drop);fill=1<<curr;min=fill;do{fill-=incr;table[next+(huff>>drop)+fill]=(here_bits<<24)|(here_op<<16)|here_val|0}while(fill!==0);incr=1<<(len-1);while(huff&incr){incr>>=1}
    if(incr!==0){huff&=incr-1;huff+=incr}else{huff=0}
    sym++;if(--count[len]===0){if(len===max){break}
        len=lens[lens_index+work[sym]]}
    if(len>root&&(huff&mask)!==low){if(drop===0){drop=root}
        next+=min;curr=len-drop;left=1<<curr;while(curr+drop<max){left-=count[curr+drop];if(left<=0){break}
            curr++;left<<=1}
        used+=1<<curr;if((type===LENS&&used>ENOUGH_LENS)||(type===DISTS&&used>ENOUGH_DISTS)){return 1}
        low=huff&mask;table[low]=(root<<24)|(curr<<16)|(next-table_index)|0}}
    if(huff!==0){table[next+huff]=((len-drop)<<24)|(64<<16)|0}
    opts.bits=root;return 0}},{"../utils/common":93}],103:[function(require,module,exports){'use strict';module.exports={'2':'need dictionary','1':'stream end','0':'','-1':'file error','-2':'stream error','-3':'data error','-4':'insufficient memory','-5':'buffer error','-6':'incompatible version'}},{}],104:[function(require,module,exports){'use strict';var utils=require('../utils/common');var Z_FIXED=4;var Z_BINARY=0;var Z_TEXT=1;var Z_UNKNOWN=2;function zero(buf){var len=buf.length;while(--len>=0){buf[len]=0}}
    var STORED_BLOCK=0;var STATIC_TREES=1;var DYN_TREES=2;var MIN_MATCH=3;var MAX_MATCH=258;var LENGTH_CODES=29;var LITERALS=256;var L_CODES=LITERALS+1+LENGTH_CODES;var D_CODES=30;var BL_CODES=19;var HEAP_SIZE=2*L_CODES+1;var MAX_BITS=15;var Buf_size=16;var MAX_BL_BITS=7;var END_BLOCK=256;var REP_3_6=16;var REPZ_3_10=17;var REPZ_11_138=18;var extra_lbits=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];var extra_dbits=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];var extra_blbits=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];var bl_order=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];var DIST_CODE_LEN=512;var static_ltree=new Array((L_CODES+2)*2);zero(static_ltree);var static_dtree=new Array(D_CODES*2);zero(static_dtree);var _dist_code=new Array(DIST_CODE_LEN);zero(_dist_code);var _length_code=new Array(MAX_MATCH-MIN_MATCH+1);zero(_length_code);var base_length=new Array(LENGTH_CODES);zero(base_length);var base_dist=new Array(D_CODES);zero(base_dist);var StaticTreeDesc=function(static_tree,extra_bits,extra_base,elems,max_length){this.static_tree=static_tree;this.extra_bits=extra_bits;this.extra_base=extra_base;this.elems=elems;this.max_length=max_length;this.has_stree=static_tree&&static_tree.length};var static_l_desc;var static_d_desc;var static_bl_desc;var TreeDesc=function(dyn_tree,stat_desc){this.dyn_tree=dyn_tree;this.max_code=0;this.stat_desc=stat_desc;/* the corresponding static tree */};function d_code(dist){return dist<256?_dist_code[dist]:_dist_code[256+(dist>>>7)]}
    function put_short(s,w){s.pending_buf[s.pending++]=(w)&0xff;s.pending_buf[s.pending++]=(w>>>8)&0xff}
    function send_bits(s,value,length){if(s.bi_valid>(Buf_size-length)){s.bi_buf|=(value<<s.bi_valid)&0xffff;put_short(s,s.bi_buf);s.bi_buf=value>>(Buf_size-s.bi_valid);s.bi_valid+=length-Buf_size}else{s.bi_buf|=(value<<s.bi_valid)&0xffff;s.bi_valid+=length}}
    function send_code(s,c,tree){send_bits(s,tree[c*2],tree[c*2+1])}
    function bi_reverse(code,len){var res=0;do{res|=code&1;code>>>=1;res<<=1}while(--len>0);return res>>>1}
    function bi_flush(s){if(s.bi_valid===16){put_short(s,s.bi_buf);s.bi_buf=0;s.bi_valid=0}else if(s.bi_valid>=8){s.pending_buf[s.pending++]=s.bi_buf&0xff;s.bi_buf>>=8;s.bi_valid-=8}}
    function gen_bitlen(s,desc)
    {var tree=desc.dyn_tree;var max_code=desc.max_code;var stree=desc.stat_desc.static_tree;var has_stree=desc.stat_desc.has_stree;var extra=desc.stat_desc.extra_bits;var base=desc.stat_desc.extra_base;var max_length=desc.stat_desc.max_length;var h;var n,m;var bits;var xbits;var f;var overflow=0;for(bits=0;bits<=MAX_BITS;bits++){s.bl_count[bits]=0}
        tree[s.heap[s.heap_max]*2+1]=0;for(h=s.heap_max+1;h<HEAP_SIZE;h++){n=s.heap[h];bits=tree[tree[n*2+1]*2+1]+1;if(bits>max_length){bits=max_length;overflow++}
        tree[n*2+1]=bits;if(n>max_code){continue}
        s.bl_count[bits]++;xbits=0;if(n>=base){xbits=extra[n-base]}
        f=tree[n*2];s.opt_len+=f*(bits+xbits);if(has_stree){s.static_len+=f*(stree[n*2+1]+xbits)}}
        if(overflow===0){return}
        do{bits=max_length-1;while(s.bl_count[bits]===0){bits--}
            s.bl_count[bits]--;s.bl_count[bits+1]+=2;s.bl_count[max_length]--;overflow-=2}while(overflow>0);for(bits=max_length;bits!==0;bits--){n=s.bl_count[bits];while(n!==0){m=s.heap[--h];if(m>max_code){continue}
        if(tree[m*2+1]!==bits){s.opt_len+=(bits-tree[m*2+1])*tree[m*2];tree[m*2+1]=bits}
        n--}}}
    function gen_codes(tree,max_code,bl_count)
    {var next_code=new Array(MAX_BITS+1);var code=0;var bits;var n;for(bits=1;bits<=MAX_BITS;bits++){next_code[bits]=code=(code+bl_count[bits-1])<<1}
        for(n=0;n<=max_code;n++){var len=tree[n*2+1];if(len===0){continue}
            tree[n*2]=bi_reverse(next_code[len]++,len)}}
    function tr_static_init(){var n;var bits;var length;var code;var dist;var bl_count=new Array(MAX_BITS+1);length=0;for(code=0;code<LENGTH_CODES-1;code++){base_length[code]=length;for(n=0;n<(1<<extra_lbits[code]);n++){_length_code[length++]=code}}
        _length_code[length-1]=code;dist=0;for(code=0;code<16;code++){base_dist[code]=dist;for(n=0;n<(1<<extra_dbits[code]);n++){_dist_code[dist++]=code}}
        dist>>=7;for(;code<D_CODES;code++){base_dist[code]=dist<<7;for(n=0;n<(1<<(extra_dbits[code]-7));n++){_dist_code[256+dist++]=code}}
        for(bits=0;bits<=MAX_BITS;bits++){bl_count[bits]=0}
        n=0;while(n<=143){static_ltree[n*2+1]=8;n++;bl_count[8]++}
        while(n<=255){static_ltree[n*2+1]=9;n++;bl_count[9]++}
        while(n<=279){static_ltree[n*2+1]=7;n++;bl_count[7]++}
        while(n<=287){static_ltree[n*2+1]=8;n++;bl_count[8]++}
        gen_codes(static_ltree,L_CODES+1,bl_count);for(n=0;n<D_CODES;n++){static_dtree[n*2+1]=5;static_dtree[n*2]=bi_reverse(n,5)}
        static_l_desc=new StaticTreeDesc(static_ltree,extra_lbits,LITERALS+1,L_CODES,MAX_BITS);static_d_desc=new StaticTreeDesc(static_dtree,extra_dbits,0,D_CODES,MAX_BITS);static_bl_desc=new StaticTreeDesc(new Array(0),extra_blbits,0,BL_CODES,MAX_BL_BITS)}
    function init_block(s){var n;for(n=0;n<L_CODES;n++){s.dyn_ltree[n*2]=0}
        for(n=0;n<D_CODES;n++){s.dyn_dtree[n*2]=0}
        for(n=0;n<BL_CODES;n++){s.bl_tree[n*2]=0}
        s.dyn_ltree[END_BLOCK*2]=1;s.opt_len=s.static_len=0;s.last_lit=s.matches=0}
    function bi_windup(s)
    {if(s.bi_valid>8){put_short(s,s.bi_buf)}else if(s.bi_valid>0){s.pending_buf[s.pending++]=s.bi_buf}
        s.bi_buf=0;s.bi_valid=0}
    function copy_block(s,buf,len,header)
    {bi_windup(s);if(header){put_short(s,len);put_short(s,~len)}
        utils.arraySet(s.pending_buf,s.window,buf,len,s.pending);s.pending+=len}
    function smaller(tree,n,m,depth){var _n2=n*2;var _m2=m*2;return(tree[_n2]<tree[_m2]||(tree[_n2]===tree[_m2]&&depth[n]<=depth[m]))}
    function pqdownheap(s,tree,k)
    {var v=s.heap[k];var j=k<<1;while(j<=s.heap_len){if(j<s.heap_len&&smaller(tree,s.heap[j+1],s.heap[j],s.depth)){j++}
        if(smaller(tree,v,s.heap[j],s.depth)){break}
        s.heap[k]=s.heap[j];k=j;j<<=1}
        s.heap[k]=v}
    function compress_block(s,ltree,dtree)
    {var dist;var lc;var lx=0;var code;var extra;if(s.last_lit!==0){do{dist=(s.pending_buf[s.d_buf+lx*2]<<8)|(s.pending_buf[s.d_buf+lx*2+1]);lc=s.pending_buf[s.l_buf+lx];lx++;if(dist===0){send_code(s,lc,ltree)}else{code=_length_code[lc];send_code(s,code+LITERALS+1,ltree);extra=extra_lbits[code];if(extra!==0){lc-=base_length[code];send_bits(s,lc,extra);/* send the extra length bits */}
        dist--;code=d_code(dist);send_code(s,code,dtree);extra=extra_dbits[code];if(extra!==0){dist-=base_dist[code];send_bits(s,dist,extra);/* send the extra distance bits */}}}while(lx<s.last_lit)}
        send_code(s,END_BLOCK,ltree)}
    function build_tree(s,desc)
    {var tree=desc.dyn_tree;var stree=desc.stat_desc.static_tree;var has_stree=desc.stat_desc.has_stree;var elems=desc.stat_desc.elems;var n,m;var max_code=-1;var node;s.heap_len=0;s.heap_max=HEAP_SIZE;for(n=0;n<elems;n++){if(tree[n*2]!==0){s.heap[++s.heap_len]=max_code=n;s.depth[n]=0}else{tree[n*2+1]=0}}
        while(s.heap_len<2){node=s.heap[++s.heap_len]=(max_code<2?++max_code:0);tree[node*2]=1;s.depth[node]=0;s.opt_len--;if(has_stree){s.static_len-=stree[node*2+1]}/* node is 0 or 1 so it does not have extra bits */}
        desc.max_code=max_code;for(n=(s.heap_len>>1);n>=1;n--){pqdownheap(s,tree,n)}
        node=elems;do{n=s.heap[1];s.heap[1]=s.heap[s.heap_len--];pqdownheap(s,tree,1);m=s.heap[1];s.heap[--s.heap_max]=n;s.heap[--s.heap_max]=m;tree[node*2]=tree[n*2]+tree[m*2];s.depth[node]=(s.depth[n]>=s.depth[m]?s.depth[n]:s.depth[m])+1;tree[n*2+1]=tree[m*2+1]=node;s.heap[1]=node++;pqdownheap(s,tree,1)}while(s.heap_len>=2);s.heap[--s.heap_max]=s.heap[1];gen_bitlen(s,desc);gen_codes(tree,max_code,s.bl_count)}
    function scan_tree(s,tree,max_code)
    {var n;var prevlen=-1;var curlen;var nextlen=tree[0*2+1];var count=0;var max_count=7;var min_count=4;if(nextlen===0){max_count=138;min_count=3}
        tree[(max_code+1)*2+1]=0xffff;for(n=0;n<=max_code;n++){curlen=nextlen;nextlen=tree[(n+1)*2+1];if(++count<max_count&&curlen===nextlen){continue}else if(count<min_count){s.bl_tree[curlen*2]+=count}else if(curlen!==0){if(curlen!==prevlen){s.bl_tree[curlen*2]++}
        s.bl_tree[REP_3_6*2]++}else if(count<=10){s.bl_tree[REPZ_3_10*2]++}else{s.bl_tree[REPZ_11_138*2]++}
        count=0;prevlen=curlen;if(nextlen===0){max_count=138;min_count=3}else if(curlen===nextlen){max_count=6;min_count=3}else{max_count=7;min_count=4}}}
    function send_tree(s,tree,max_code)
    {var n;var prevlen=-1;var curlen;var nextlen=tree[0*2+1];var count=0;var max_count=7;var min_count=4;if(nextlen===0){max_count=138;min_count=3}
        for(n=0;n<=max_code;n++){curlen=nextlen;nextlen=tree[(n+1)*2+1];if(++count<max_count&&curlen===nextlen){continue}else if(count<min_count){do{send_code(s,curlen,s.bl_tree)}while(--count!==0)}else if(curlen!==0){if(curlen!==prevlen){send_code(s,curlen,s.bl_tree);count--}
            send_code(s,REP_3_6,s.bl_tree);send_bits(s,count-3,2)}else if(count<=10){send_code(s,REPZ_3_10,s.bl_tree);send_bits(s,count-3,3)}else{send_code(s,REPZ_11_138,s.bl_tree);send_bits(s,count-11,7)}
            count=0;prevlen=curlen;if(nextlen===0){max_count=138;min_count=3}else if(curlen===nextlen){max_count=6;min_count=3}else{max_count=7;min_count=4}}}
    function build_bl_tree(s){var max_blindex;scan_tree(s,s.dyn_ltree,s.l_desc.max_code);scan_tree(s,s.dyn_dtree,s.d_desc.max_code);build_tree(s,s.bl_desc);for(max_blindex=BL_CODES-1;max_blindex>=3;max_blindex--){if(s.bl_tree[bl_order[max_blindex]*2+1]!==0){break}}
        s.opt_len+=3*(max_blindex+1)+5+5+4;return max_blindex}
    function send_all_trees(s,lcodes,dcodes,blcodes)
    {var rank;send_bits(s,lcodes-257,5);send_bits(s,dcodes-1,5);send_bits(s,blcodes-4,4);for(rank=0;rank<blcodes;rank++){send_bits(s,s.bl_tree[bl_order[rank]*2+1],3)}
        send_tree(s,s.dyn_ltree,lcodes-1);send_tree(s,s.dyn_dtree,dcodes-1)}
    function detect_data_type(s){var black_mask=0xf3ffc07f;var n;for(n=0;n<=31;n++,black_mask>>>=1){if((black_mask&1)&&(s.dyn_ltree[n*2]!==0)){return Z_BINARY}}
        if(s.dyn_ltree[9*2]!==0||s.dyn_ltree[10*2]!==0||s.dyn_ltree[13*2]!==0){return Z_TEXT}
        for(n=32;n<LITERALS;n++){if(s.dyn_ltree[n*2]!==0){return Z_TEXT}}
        return Z_BINARY}
    var static_init_done=!1;function _tr_init(s)
    {if(!static_init_done){tr_static_init();static_init_done=!0}
        s.l_desc=new TreeDesc(s.dyn_ltree,static_l_desc);s.d_desc=new TreeDesc(s.dyn_dtree,static_d_desc);s.bl_desc=new TreeDesc(s.bl_tree,static_bl_desc);s.bi_buf=0;s.bi_valid=0;init_block(s)}
    function _tr_stored_block(s,buf,stored_len,last)
    {send_bits(s,(STORED_BLOCK<<1)+(last?1:0),3);copy_block(s,buf,stored_len,!0);/* with header */}
    function _tr_align(s){send_bits(s,STATIC_TREES<<1,3);send_code(s,END_BLOCK,static_ltree);bi_flush(s)}
    function _tr_flush_block(s,buf,stored_len,last)
    {var opt_lenb,static_lenb;var max_blindex=0;if(s.level>0){if(s.strm.data_type===Z_UNKNOWN){s.strm.data_type=detect_data_type(s)}
        build_tree(s,s.l_desc);build_tree(s,s.d_desc);max_blindex=build_bl_tree(s);opt_lenb=(s.opt_len+3+7)>>>3;static_lenb=(s.static_len+3+7)>>>3;if(static_lenb<=opt_lenb){opt_lenb=static_lenb}}else{opt_lenb=static_lenb=stored_len+5;/* force a stored block */}
        if((stored_len+4<=opt_lenb)&&(buf!==-1)){_tr_stored_block(s,buf,stored_len,last)}else if(s.strategy===Z_FIXED||static_lenb===opt_lenb){send_bits(s,(STATIC_TREES<<1)+(last?1:0),3);compress_block(s,static_ltree,static_dtree)}else{send_bits(s,(DYN_TREES<<1)+(last?1:0),3);send_all_trees(s,s.l_desc.max_code+1,s.d_desc.max_code+1,max_blindex+1);compress_block(s,s.dyn_ltree,s.dyn_dtree)}
        init_block(s);if(last){bi_windup(s)}}
    function _tr_tally(s,dist,lc)
    {s.pending_buf[s.d_buf+s.last_lit*2]=(dist>>>8)&0xff;s.pending_buf[s.d_buf+s.last_lit*2+1]=dist&0xff;s.pending_buf[s.l_buf+s.last_lit]=lc&0xff;s.last_lit++;if(dist===0){s.dyn_ltree[lc*2]++}else{s.matches++;dist--;s.dyn_ltree[(_length_code[lc]+LITERALS+1)*2]++;s.dyn_dtree[d_code(dist)*2]++}
        return(s.last_lit===s.lit_bufsize-1)}
    exports._tr_init=_tr_init;exports._tr_stored_block=_tr_stored_block;exports._tr_flush_block=_tr_flush_block;exports._tr_tally=_tr_tally;exports._tr_align=_tr_align},{"../utils/common":93}],105:[function(require,module,exports){'use strict';function ZStream(){this.input=null;this.next_in=0;this.avail_in=0;this.total_in=0;this.output=null;this.next_out=0;this.avail_out=0;this.total_out=0;this.msg='';this.state=null;this.data_type=2;this.adler=0}
    module.exports=ZStream},{}],106:[function(require,module,exports){var _=require('underscore');var LocalStore=module.exports={keys:{},deps:{},_ensureDeps:function(key){if(!this.deps[key]&&(typeof Tracker!=="undefined")){this.deps[key]=new Tracker.Dependency}},set:function(key,value,options,callback){this._ensureDeps(key);if(typeof chrome!=='undefined'&&chrome.storage){var item={};item[key]=value;chrome.storage.local.set(item,function(){if((!options||options.reactive!==!1)&&(typeof Tracker!="undefined"))
    this.deps[key].changed();if(_.isFunction(callback))
    callback()})}else{if(_.isObject(value))
    value=JSON.stringify(value);try{localStorage.setItem(key,value)}catch(e){}
    if((!options||options.reactive!==!1)&&(typeof Tracker!=="undefined"))
        this.deps[key].changed();if(_.isFunction(callback))
        callback()}},get:function(key,options,callback){this._ensureDeps(key);if((!options||options.reactive!==!1)&&(typeof Tracker!=="undefined"))
    this.deps[key].depend();if(typeof chrome!=='undefined'&&chrome.storage){chrome.storage.local.get(key,callback)}else{var value=localStorage.getItem(key),retunValue=value;if(value&&_.isString(value)){try{retunValue=JSON.parse(value)}catch(error){retunValue=value}}
    return retunValue}}}},{"underscore":108}],107:[function(require,module,exports){var saveAs=saveAs||(function(view){"use strict";if(typeof view==="undefined"){return}
    if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}
    var doc=view.document,get_URL=function(){return view.URL||view.webkitURL||view},save_link=doc.createElementNS("http://www.w3.org/1999/xhtml","a"),can_use_save_link="download" in save_link,click=function(node){var event=doc.createEvent("MouseEvents");event.initMouseEvent("click",!0,!1,view,0,0,0,0,0,!1,!1,!1,!1,0,null);node.dispatchEvent(event)},webkit_req_fs=view.webkitRequestFileSystem,req_fs=view.requestFileSystem||webkit_req_fs||view.mozRequestFileSystem,throw_outside=function(ex){(view.setImmediate||view.setTimeout)(function(){throw ex},0)},force_saveable_type="application/octet-stream",fs_min_size=0,arbitrary_revoke_timeout=500,revoke=function(file){var revoker=function(){if(typeof file==="string"){get_URL().revokeObjectURL(file)}else{file.remove()}};if(view.chrome){revoker()}else{setTimeout(revoker,arbitrary_revoke_timeout)}},dispatch=function(filesaver,event_types,event){event_types=[].concat(event_types);var i=event_types.length;while(i--){var listener=filesaver["on"+event_types[i]];if(typeof listener==="function"){try{listener.call(filesaver,event||filesaver)}catch(ex){throw_outside(ex)}}}},auto_bom=function(blob){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)){return new Blob(["\ufeff",blob],{type:blob.type})}
        return blob},FileSaver=function(blob,name){blob=auto_bom(blob);var filesaver=this,type=blob.type,blob_changed=!1,object_url,target_view,dispatch_all=function(){dispatch(filesaver,"writestart progress write writeend".split(" "))},fs_error=function(){if(blob_changed||!object_url){object_url=get_URL().createObjectURL(blob)}
        if(target_view){target_view.location.href=object_url}else{var new_tab=view.open(object_url,"_blank");if(new_tab==undefined&&typeof safari!=="undefined"){view.location.href=object_url}}
        filesaver.readyState=filesaver.DONE;dispatch_all();revoke(object_url)},abortable=function(func){return function(){if(filesaver.readyState!==filesaver.DONE){return func.apply(this,arguments)}}},create_if_not_found={create:!0,exclusive:!1},slice;filesaver.readyState=filesaver.INIT;if(!name){name="download"}
        if(can_use_save_link){object_url=get_URL().createObjectURL(blob);save_link.href=object_url;save_link.download=name;click(save_link);filesaver.readyState=filesaver.DONE;dispatch_all();revoke(object_url);return}
        if(view.chrome&&type&&type!==force_saveable_type){slice=blob.slice||blob.webkitSlice;blob=slice.call(blob,0,blob.size,force_saveable_type);blob_changed=!0}
        if(webkit_req_fs&&name!=="download"){name+=".download"}
        if(type===force_saveable_type||webkit_req_fs){target_view=view}
        if(!req_fs){fs_error();return}
        fs_min_size+=blob.size;req_fs(view.TEMPORARY,fs_min_size,abortable(function(fs){fs.root.getDirectory("saved",create_if_not_found,abortable(function(dir){var save=function(){dir.getFile(name,create_if_not_found,abortable(function(file){file.createWriter(abortable(function(writer){writer.onwriteend=function(event){target_view.location.href=file.toURL();filesaver.readyState=filesaver.DONE;dispatch(filesaver,"writeend",event);revoke(file)};writer.onerror=function(){var error=writer.error;if(error.code!==error.ABORT_ERR){fs_error()}};"writestart progress write abort".split(" ").forEach(function(event){writer["on"+event]=filesaver["on"+event]});writer.write(blob);filesaver.abort=function(){writer.abort();filesaver.readyState=filesaver.DONE};filesaver.readyState=filesaver.WRITING}),fs_error)}),fs_error)};dir.getFile(name,{create:!1},abortable(function(file){file.remove();save()}),abortable(function(ex){if(ex.code===ex.NOT_FOUND_ERR){save()}else{fs_error()}}))}),fs_error)}),fs_error)},FS_proto=FileSaver.prototype,saveAs=function(blob,name){return new FileSaver(blob,name)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(blob,name){return navigator.msSaveOrOpenBlob(auto_bom(blob),name)}}
    FS_proto.abort=function(){var filesaver=this;filesaver.readyState=filesaver.DONE;dispatch(filesaver,"abort")};FS_proto.readyState=FS_proto.INIT=0;FS_proto.WRITING=1;FS_proto.DONE=2;FS_proto.error=FS_proto.onwritestart=FS_proto.onprogress=FS_proto.onwrite=FS_proto.onabort=FS_proto.onerror=FS_proto.onwriteend=null;return saveAs}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content));if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if((typeof define!=="undefined"&&define!==null)&&(define.amd!=null)){define([],function(){return saveAs})}},{}],108:[function(require,module,exports){(function(){var root=this;var previousUnderscore=root._;var ArrayProto=Array.prototype,ObjProto=Object.prototype,FuncProto=Function.prototype;var push=ArrayProto.push,slice=ArrayProto.slice,toString=ObjProto.toString,hasOwnProperty=ObjProto.hasOwnProperty;var nativeIsArray=Array.isArray,nativeKeys=Object.keys,nativeBind=FuncProto.bind,nativeCreate=Object.create;var Ctor=function(){};var _=function(obj){if(obj instanceof _)return obj;if(!(this instanceof _))return new _(obj);this._wrapped=obj};if(typeof exports!=='undefined'){if(typeof module!=='undefined'&&module.exports){exports=module.exports=_}
    exports._=_}else{root._=_}
    _.VERSION='1.8.3';var optimizeCb=function(func,context,argCount){if(context===void 0)return func;switch(argCount==null?3:argCount){case 1:return function(value){return func.call(context,value)};case 2:return function(value,other){return func.call(context,value,other)};case 3:return function(value,index,collection){return func.call(context,value,index,collection)};case 4:return function(accumulator,value,index,collection){return func.call(context,accumulator,value,index,collection)}}
        return function(){return func.apply(context,arguments)}};var cb=function(value,context,argCount){if(value==null)return _.identity;if(_.isFunction(value))return optimizeCb(value,context,argCount);if(_.isObject(value))return _.matcher(value);return _.property(value)};_.iteratee=function(value,context){return cb(value,context,Infinity)};var createAssigner=function(keysFunc,undefinedOnly){return function(obj){var length=arguments.length;if(length<2||obj==null)return obj;for(var index=1;index<length;index++){var source=arguments[index],keys=keysFunc(source),l=keys.length;for(var i=0;i<l;i++){var key=keys[i];if(!undefinedOnly||obj[key]===void 0)obj[key]=source[key]}}
        return obj}};var baseCreate=function(prototype){if(!_.isObject(prototype))return{};if(nativeCreate)return nativeCreate(prototype);Ctor.prototype=prototype;var result=new Ctor;Ctor.prototype=null;return result};var property=function(key){return function(obj){return obj==null?void 0:obj[key]}};var MAX_ARRAY_INDEX=Math.pow(2,53)-1;var getLength=property('length');var isArrayLike=function(collection){var length=getLength(collection);return typeof length=='number'&&length>=0&&length<=MAX_ARRAY_INDEX};_.each=_.forEach=function(obj,iteratee,context){iteratee=optimizeCb(iteratee,context);var i,length;if(isArrayLike(obj)){for(i=0,length=obj.length;i<length;i++){iteratee(obj[i],i,obj)}}else{var keys=_.keys(obj);for(i=0,length=keys.length;i<length;i++){iteratee(obj[keys[i]],keys[i],obj)}}
        return obj};_.map=_.collect=function(obj,iteratee,context){iteratee=cb(iteratee,context);var keys=!isArrayLike(obj)&&_.keys(obj),length=(keys||obj).length,results=Array(length);for(var index=0;index<length;index++){var currentKey=keys?keys[index]:index;results[index]=iteratee(obj[currentKey],currentKey,obj)}
        return results};function createReduce(dir){function iterator(obj,iteratee,memo,keys,index,length){for(;index>=0&&index<length;index+=dir){var currentKey=keys?keys[index]:index;memo=iteratee(memo,obj[currentKey],currentKey,obj)}
        return memo}
        return function(obj,iteratee,memo,context){iteratee=optimizeCb(iteratee,context,4);var keys=!isArrayLike(obj)&&_.keys(obj),length=(keys||obj).length,index=dir>0?0:length-1;if(arguments.length<3){memo=obj[keys?keys[index]:index];index+=dir}
            return iterator(obj,iteratee,memo,keys,index,length)}}
    _.reduce=_.foldl=_.inject=createReduce(1);_.reduceRight=_.foldr=createReduce(-1);_.find=_.detect=function(obj,predicate,context){var key;if(isArrayLike(obj)){key=_.findIndex(obj,predicate,context)}else{key=_.findKey(obj,predicate,context)}
        if(key!==void 0&&key!==-1)return obj[key]};_.filter=_.select=function(obj,predicate,context){var results=[];predicate=cb(predicate,context);_.each(obj,function(value,index,list){if(predicate(value,index,list))results.push(value)});return results};_.reject=function(obj,predicate,context){return _.filter(obj,_.negate(cb(predicate)),context)};_.every=_.all=function(obj,predicate,context){predicate=cb(predicate,context);var keys=!isArrayLike(obj)&&_.keys(obj),length=(keys||obj).length;for(var index=0;index<length;index++){var currentKey=keys?keys[index]:index;if(!predicate(obj[currentKey],currentKey,obj))return!1}
        return!0};_.some=_.any=function(obj,predicate,context){predicate=cb(predicate,context);var keys=!isArrayLike(obj)&&_.keys(obj),length=(keys||obj).length;for(var index=0;index<length;index++){var currentKey=keys?keys[index]:index;if(predicate(obj[currentKey],currentKey,obj))return!0}
        return!1};_.contains=_.includes=_.include=function(obj,item,fromIndex,guard){if(!isArrayLike(obj))obj=_.values(obj);if(typeof fromIndex!='number'||guard)fromIndex=0;return _.indexOf(obj,item,fromIndex)>=0};_.invoke=function(obj,method){var args=slice.call(arguments,2);var isFunc=_.isFunction(method);return _.map(obj,function(value){var func=isFunc?method:value[method];return func==null?func:func.apply(value,args)})};_.pluck=function(obj,key){return _.map(obj,_.property(key))};_.where=function(obj,attrs){return _.filter(obj,_.matcher(attrs))};_.findWhere=function(obj,attrs){return _.find(obj,_.matcher(attrs))};_.max=function(obj,iteratee,context){var result=-Infinity,lastComputed=-Infinity,value,computed;if(iteratee==null&&obj!=null){obj=isArrayLike(obj)?obj:_.values(obj);for(var i=0,length=obj.length;i<length;i++){value=obj[i];if(value>result){result=value}}}else{iteratee=cb(iteratee,context);_.each(obj,function(value,index,list){computed=iteratee(value,index,list);if(computed>lastComputed||computed===-Infinity&&result===-Infinity){result=value;lastComputed=computed}})}
        return result};_.min=function(obj,iteratee,context){var result=Infinity,lastComputed=Infinity,value,computed;if(iteratee==null&&obj!=null){obj=isArrayLike(obj)?obj:_.values(obj);for(var i=0,length=obj.length;i<length;i++){value=obj[i];if(value<result){result=value}}}else{iteratee=cb(iteratee,context);_.each(obj,function(value,index,list){computed=iteratee(value,index,list);if(computed<lastComputed||computed===Infinity&&result===Infinity){result=value;lastComputed=computed}})}
        return result};_.shuffle=function(obj){var set=isArrayLike(obj)?obj:_.values(obj);var length=set.length;var shuffled=Array(length);for(var index=0,rand;index<length;index++){rand=_.random(0,index);if(rand!==index)shuffled[index]=shuffled[rand];shuffled[rand]=set[index]}
        return shuffled};_.sample=function(obj,n,guard){if(n==null||guard){if(!isArrayLike(obj))obj=_.values(obj);return obj[_.random(obj.length-1)]}
        return _.shuffle(obj).slice(0,Math.max(0,n))};_.sortBy=function(obj,iteratee,context){iteratee=cb(iteratee,context);return _.pluck(_.map(obj,function(value,index,list){return{value:value,index:index,criteria:iteratee(value,index,list)}}).sort(function(left,right){var a=left.criteria;var b=right.criteria;if(a!==b){if(a>b||a===void 0)return 1;if(a<b||b===void 0)return-1}
        return left.index-right.index}),'value')};var group=function(behavior){return function(obj,iteratee,context){var result={};iteratee=cb(iteratee,context);_.each(obj,function(value,index){var key=iteratee(value,index,obj);behavior(result,value,key)});return result}};_.groupBy=group(function(result,value,key){if(_.has(result,key))result[key].push(value);else result[key]=[value]});_.indexBy=group(function(result,value,key){result[key]=value});_.countBy=group(function(result,value,key){if(_.has(result,key))result[key]++;else result[key]=1});_.toArray=function(obj){if(!obj)return[];if(_.isArray(obj))return slice.call(obj);if(isArrayLike(obj))return _.map(obj,_.identity);return _.values(obj)};_.size=function(obj){if(obj==null)return 0;return isArrayLike(obj)?obj.length:_.keys(obj).length};_.partition=function(obj,predicate,context){predicate=cb(predicate,context);var pass=[],fail=[];_.each(obj,function(value,key,obj){(predicate(value,key,obj)?pass:fail).push(value)});return[pass,fail]};_.first=_.head=_.take=function(array,n,guard){if(array==null)return void 0;if(n==null||guard)return array[0];return _.initial(array,array.length-n)};_.initial=function(array,n,guard){return slice.call(array,0,Math.max(0,array.length-(n==null||guard?1:n)))};_.last=function(array,n,guard){if(array==null)return void 0;if(n==null||guard)return array[array.length-1];return _.rest(array,Math.max(0,array.length-n))};_.rest=_.tail=_.drop=function(array,n,guard){return slice.call(array,n==null||guard?1:n)};_.compact=function(array){return _.filter(array,_.identity)};var flatten=function(input,shallow,strict,startIndex){var output=[],idx=0;for(var i=startIndex||0,length=getLength(input);i<length;i++){var value=input[i];if(isArrayLike(value)&&(_.isArray(value)||_.isArguments(value))){if(!shallow)value=flatten(value,shallow,strict);var j=0,len=value.length;output.length+=len;while(j<len){output[idx++]=value[j++]}}else if(!strict){output[idx++]=value}}
        return output};_.flatten=function(array,shallow){return flatten(array,shallow,!1)};_.without=function(array){return _.difference(array,slice.call(arguments,1))};_.uniq=_.unique=function(array,isSorted,iteratee,context){if(!_.isBoolean(isSorted)){context=iteratee;iteratee=isSorted;isSorted=!1}
        if(iteratee!=null)iteratee=cb(iteratee,context);var result=[];var seen=[];for(var i=0,length=getLength(array);i<length;i++){var value=array[i],computed=iteratee?iteratee(value,i,array):value;if(isSorted){if(!i||seen!==computed)result.push(value);seen=computed}else if(iteratee){if(!_.contains(seen,computed)){seen.push(computed);result.push(value)}}else if(!_.contains(result,value)){result.push(value)}}
        return result};_.union=function(){return _.uniq(flatten(arguments,!0,!0))};_.intersection=function(array){var result=[];var argsLength=arguments.length;for(var i=0,length=getLength(array);i<length;i++){var item=array[i];if(_.contains(result,item))continue;for(var j=1;j<argsLength;j++){if(!_.contains(arguments[j],item))break}
        if(j===argsLength)result.push(item)}
        return result};_.difference=function(array){var rest=flatten(arguments,!0,!0,1);return _.filter(array,function(value){return!_.contains(rest,value)})};_.zip=function(){return _.unzip(arguments)};_.unzip=function(array){var length=array&&_.max(array,getLength).length||0;var result=Array(length);for(var index=0;index<length;index++){result[index]=_.pluck(array,index)}
        return result};_.object=function(list,values){var result={};for(var i=0,length=getLength(list);i<length;i++){if(values){result[list[i]]=values[i]}else{result[list[i][0]]=list[i][1]}}
        return result};function createPredicateIndexFinder(dir){return function(array,predicate,context){predicate=cb(predicate,context);var length=getLength(array);var index=dir>0?0:length-1;for(;index>=0&&index<length;index+=dir){if(predicate(array[index],index,array))return index}
        return-1}}
    _.findIndex=createPredicateIndexFinder(1);_.findLastIndex=createPredicateIndexFinder(-1);_.sortedIndex=function(array,obj,iteratee,context){iteratee=cb(iteratee,context,1);var value=iteratee(obj);var low=0,high=getLength(array);while(low<high){var mid=Math.floor((low+high)/2);if(iteratee(array[mid])<value)low=mid+1;else high=mid}
        return low};function createIndexFinder(dir,predicateFind,sortedIndex){return function(array,item,idx){var i=0,length=getLength(array);if(typeof idx=='number'){if(dir>0){i=idx>=0?idx:Math.max(idx+length,i)}else{length=idx>=0?Math.min(idx+1,length):idx+length+1}}else if(sortedIndex&&idx&&length){idx=sortedIndex(array,item);return array[idx]===item?idx:-1}
        if(item!==item){idx=predicateFind(slice.call(array,i,length),_.isNaN);return idx>=0?idx+i:-1}
        for(idx=dir>0?i:length-1;idx>=0&&idx<length;idx+=dir){if(array[idx]===item)return idx}
        return-1}}
    _.indexOf=createIndexFinder(1,_.findIndex,_.sortedIndex);_.lastIndexOf=createIndexFinder(-1,_.findLastIndex);_.range=function(start,stop,step){if(stop==null){stop=start||0;start=0}
        step=step||1;var length=Math.max(Math.ceil((stop-start)/step),0);var range=Array(length);for(var idx=0;idx<length;idx++,start+=step){range[idx]=start}
        return range};var executeBound=function(sourceFunc,boundFunc,context,callingContext,args){if(!(callingContext instanceof boundFunc))return sourceFunc.apply(context,args);var self=baseCreate(sourceFunc.prototype);var result=sourceFunc.apply(self,args);if(_.isObject(result))return result;return self};_.bind=function(func,context){if(nativeBind&&func.bind===nativeBind)return nativeBind.apply(func,slice.call(arguments,1));if(!_.isFunction(func))throw new TypeError('Bind must be called on a function');var args=slice.call(arguments,2);var bound=function(){return executeBound(func,bound,context,this,args.concat(slice.call(arguments)))};return bound};_.partial=function(func){var boundArgs=slice.call(arguments,1);var bound=function(){var position=0,length=boundArgs.length;var args=Array(length);for(var i=0;i<length;i++){args[i]=boundArgs[i]===_?arguments[position++]:boundArgs[i]}
        while(position<arguments.length)args.push(arguments[position++]);return executeBound(func,bound,this,this,args)};return bound};_.bindAll=function(obj){var i,length=arguments.length,key;if(length<=1)throw new Error('bindAll must be passed function names');for(i=1;i<length;i++){key=arguments[i];obj[key]=_.bind(obj[key],obj)}
        return obj};_.memoize=function(func,hasher){var memoize=function(key){var cache=memoize.cache;var address=''+(hasher?hasher.apply(this,arguments):key);if(!_.has(cache,address))cache[address]=func.apply(this,arguments);return cache[address]};memoize.cache={};return memoize};_.delay=function(func,wait){var args=slice.call(arguments,2);return setTimeout(function(){return func.apply(null,args)},wait)};_.defer=_.partial(_.delay,_,1);_.throttle=function(func,wait,options){var context,args,result;var timeout=null;var previous=0;if(!options)options={};var later=function(){previous=options.leading===!1?0:_.now();timeout=null;result=func.apply(context,args);if(!timeout)context=args=null};return function(){var now=_.now();if(!previous&&options.leading===!1)previous=now;var remaining=wait-(now-previous);context=this;args=arguments;if(remaining<=0||remaining>wait){if(timeout){clearTimeout(timeout);timeout=null}
        previous=now;result=func.apply(context,args);if(!timeout)context=args=null}else if(!timeout&&options.trailing!==!1){timeout=setTimeout(later,remaining)}
        return result}};_.debounce=function(func,wait,immediate){var timeout,args,context,timestamp,result;var later=function(){var last=_.now()-timestamp;if(last<wait&&last>=0){timeout=setTimeout(later,wait-last)}else{timeout=null;if(!immediate){result=func.apply(context,args);if(!timeout)context=args=null}}};return function(){context=this;args=arguments;timestamp=_.now();var callNow=immediate&&!timeout;if(!timeout)timeout=setTimeout(later,wait);if(callNow){result=func.apply(context,args);context=args=null}
        return result}};_.wrap=function(func,wrapper){return _.partial(wrapper,func)};_.negate=function(predicate){return function(){return!predicate.apply(this,arguments)}};_.compose=function(){var args=arguments;var start=args.length-1;return function(){var i=start;var result=args[start].apply(this,arguments);while(i--)result=args[i].call(this,result);return result}};_.after=function(times,func){return function(){if(--times<1){return func.apply(this,arguments)}}};_.before=function(times,func){var memo;return function(){if(--times>0){memo=func.apply(this,arguments)}
        if(times<=1)func=null;return memo}};_.once=_.partial(_.before,2);var hasEnumBug=!{toString:null}.propertyIsEnumerable('toString');var nonEnumerableProps=['valueOf','isPrototypeOf','toString','propertyIsEnumerable','hasOwnProperty','toLocaleString'];function collectNonEnumProps(obj,keys){var nonEnumIdx=nonEnumerableProps.length;var constructor=obj.constructor;var proto=(_.isFunction(constructor)&&constructor.prototype)||ObjProto;var prop='constructor';if(_.has(obj,prop)&&!_.contains(keys,prop))keys.push(prop);while(nonEnumIdx--){prop=nonEnumerableProps[nonEnumIdx];if(prop in obj&&obj[prop]!==proto[prop]&&!_.contains(keys,prop)){keys.push(prop)}}}
    _.keys=function(obj){if(!_.isObject(obj))return[];if(nativeKeys)return nativeKeys(obj);var keys=[];for(var key in obj)if(_.has(obj,key))keys.push(key);if(hasEnumBug)collectNonEnumProps(obj,keys);return keys};_.allKeys=function(obj){if(!_.isObject(obj))return[];var keys=[];for(var key in obj)keys.push(key);if(hasEnumBug)collectNonEnumProps(obj,keys);return keys};_.values=function(obj){var keys=_.keys(obj);var length=keys.length;var values=Array(length);for(var i=0;i<length;i++){values[i]=obj[keys[i]]}
        return values};_.mapObject=function(obj,iteratee,context){iteratee=cb(iteratee,context);var keys=_.keys(obj),length=keys.length,results={},currentKey;for(var index=0;index<length;index++){currentKey=keys[index];results[currentKey]=iteratee(obj[currentKey],currentKey,obj)}
        return results};_.pairs=function(obj){var keys=_.keys(obj);var length=keys.length;var pairs=Array(length);for(var i=0;i<length;i++){pairs[i]=[keys[i],obj[keys[i]]]}
        return pairs};_.invert=function(obj){var result={};var keys=_.keys(obj);for(var i=0,length=keys.length;i<length;i++){result[obj[keys[i]]]=keys[i]}
        return result};_.functions=_.methods=function(obj){var names=[];for(var key in obj){if(_.isFunction(obj[key]))names.push(key)}
        return names.sort()};_.extend=createAssigner(_.allKeys);_.extendOwn=_.assign=createAssigner(_.keys);_.findKey=function(obj,predicate,context){predicate=cb(predicate,context);var keys=_.keys(obj),key;for(var i=0,length=keys.length;i<length;i++){key=keys[i];if(predicate(obj[key],key,obj))return key}};_.pick=function(object,oiteratee,context){var result={},obj=object,iteratee,keys;if(obj==null)return result;if(_.isFunction(oiteratee)){keys=_.allKeys(obj);iteratee=optimizeCb(oiteratee,context)}else{keys=flatten(arguments,!1,!1,1);iteratee=function(value,key,obj){return key in obj};obj=Object(obj)}
        for(var i=0,length=keys.length;i<length;i++){var key=keys[i];var value=obj[key];if(iteratee(value,key,obj))result[key]=value}
        return result};_.omit=function(obj,iteratee,context){if(_.isFunction(iteratee)){iteratee=_.negate(iteratee)}else{var keys=_.map(flatten(arguments,!1,!1,1),String);iteratee=function(value,key){return!_.contains(keys,key)}}
        return _.pick(obj,iteratee,context)};_.defaults=createAssigner(_.allKeys,!0);_.create=function(prototype,props){var result=baseCreate(prototype);if(props)_.extendOwn(result,props);return result};_.clone=function(obj){if(!_.isObject(obj))return obj;return _.isArray(obj)?obj.slice():_.extend({},obj)};_.tap=function(obj,interceptor){interceptor(obj);return obj};_.isMatch=function(object,attrs){var keys=_.keys(attrs),length=keys.length;if(object==null)return!length;var obj=Object(object);for(var i=0;i<length;i++){var key=keys[i];if(attrs[key]!==obj[key]||!(key in obj))return!1}
        return!0};var eq=function(a,b,aStack,bStack){if(a===b)return a!==0||1/a===1/b;if(a==null||b==null)return a===b;if(a instanceof _)a=a._wrapped;if(b instanceof _)b=b._wrapped;var className=toString.call(a);if(className!==toString.call(b))return!1;switch(className){case '[object RegExp]':case '[object String]':return ''+a===''+b;case '[object Number]':if(+a!==+a)return+b!==+b;return+a===0?1/+a===1/b:+a===+b;case '[object Date]':case '[object Boolean]':return+a===+b}
        var areArrays=className==='[object Array]';if(!areArrays){if(typeof a!='object'||typeof b!='object')return!1;var aCtor=a.constructor,bCtor=b.constructor;if(aCtor!==bCtor&&!(_.isFunction(aCtor)&&aCtor instanceof aCtor&&_.isFunction(bCtor)&&bCtor instanceof bCtor)&&('constructor' in a&&'constructor' in b)){return!1}}
        aStack=aStack||[];bStack=bStack||[];var length=aStack.length;while(length--){if(aStack[length]===a)return bStack[length]===b}
        aStack.push(a);bStack.push(b);if(areArrays){length=a.length;if(length!==b.length)return!1;while(length--){if(!eq(a[length],b[length],aStack,bStack))return!1}}else{var keys=_.keys(a),key;length=keys.length;if(_.keys(b).length!==length)return!1;while(length--){key=keys[length];if(!(_.has(b,key)&&eq(a[key],b[key],aStack,bStack)))return!1}}
        aStack.pop();bStack.pop();return!0};_.isEqual=function(a,b){return eq(a,b)};_.isEmpty=function(obj){if(obj==null)return!0;if(isArrayLike(obj)&&(_.isArray(obj)||_.isString(obj)||_.isArguments(obj)))return obj.length===0;return _.keys(obj).length===0};_.isElement=function(obj){return!!(obj&&obj.nodeType===1)};_.isArray=nativeIsArray||function(obj){return toString.call(obj)==='[object Array]'};_.isObject=function(obj){var type=typeof obj;return type==='function'||type==='object'&&!!obj};_.each(['Arguments','Function','String','Number','Date','RegExp','Error'],function(name){_['is'+name]=function(obj){return toString.call(obj)==='[object '+name+']'}});if(!_.isArguments(arguments)){_.isArguments=function(obj){return _.has(obj,'callee')}}
    if(typeof/./!='function'&&typeof Int8Array!='object'){_.isFunction=function(obj){return typeof obj=='function'||!1}}
    _.isFinite=function(obj){return isFinite(obj)&&!isNaN(parseFloat(obj))};_.isNaN=function(obj){return _.isNumber(obj)&&obj!==+obj};_.isBoolean=function(obj){return obj===!0||obj===!1||toString.call(obj)==='[object Boolean]'};_.isNull=function(obj){return obj===null};_.isUndefined=function(obj){return obj===void 0};_.has=function(obj,key){return obj!=null&&hasOwnProperty.call(obj,key)};_.noConflict=function(){root._=previousUnderscore;return this};_.identity=function(value){return value};_.constant=function(value){return function(){return value}};_.noop=function(){};_.property=property;_.propertyOf=function(obj){return obj==null?function(){}:function(key){return obj[key]}};_.matcher=_.matches=function(attrs){attrs=_.extendOwn({},attrs);return function(obj){return _.isMatch(obj,attrs)}};_.times=function(n,iteratee,context){var accum=Array(Math.max(0,n));iteratee=optimizeCb(iteratee,context,1);for(var i=0;i<n;i++)accum[i]=iteratee(i);return accum};_.random=function(min,max){if(max==null){max=min;min=0}
        return min+Math.floor(Math.random()*(max-min+1))};_.now=Date.now||function(){return new Date().getTime()};var escapeMap={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','`':'&#x60;'};var unescapeMap=_.invert(escapeMap);var createEscaper=function(map){var escaper=function(match){return map[match]};var source='(?:'+_.keys(map).join('|')+')';var testRegexp=RegExp(source);var replaceRegexp=RegExp(source,'g');return function(string){string=string==null?'':''+string;return testRegexp.test(string)?string.replace(replaceRegexp,escaper):string}};_.escape=createEscaper(escapeMap);_.unescape=createEscaper(unescapeMap);_.result=function(object,property,fallback){var value=object==null?void 0:object[property];if(value===void 0){value=fallback}
        return _.isFunction(value)?value.call(object):value};var idCounter=0;_.uniqueId=function(prefix){var id=++idCounter+'';return prefix?prefix+id:id};_.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var noMatch=/(.)^/;var escapes={"'":"'",'\\':'\\','\r':'r','\n':'n','\u2028':'u2028','\u2029':'u2029'};var escaper=/\\|'|\r|\n|\u2028|\u2029/g;var escapeChar=function(match){return '\\'+escapes[match]};_.template=function(text,settings,oldSettings){if(!settings&&oldSettings)settings=oldSettings;settings=_.defaults({},settings,_.templateSettings);var matcher=RegExp([(settings.escape||noMatch).source,(settings.interpolate||noMatch).source,(settings.evaluate||noMatch).source].join('|')+'|$','g');var index=0;var source="__p+='";text.replace(matcher,function(match,escape,interpolate,evaluate,offset){source+=text.slice(index,offset).replace(escaper,escapeChar);index=offset+match.length;if(escape){source+="'+\n((__t=("+escape+"))==null?'':_.escape(__t))+\n'"}else if(interpolate){source+="'+\n((__t=("+interpolate+"))==null?'':__t)+\n'"}else if(evaluate){source+="';\n"+evaluate+"\n__p+='"}
        return match});source+="';\n";if(!settings.variable)source='with(obj||{}){\n'+source+'}\n';source="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+source+'return __p;\n';try{var render=new Function(settings.variable||'obj','_',source)}catch(e){e.source=source;throw e}
        var template=function(data){return render.call(this,data,_)};var argument=settings.variable||'obj';template.source='function('+argument+'){\n'+source+'}';return template};_.chain=function(obj){var instance=_(obj);instance._chain=!0;return instance};var result=function(instance,obj){return instance._chain?_(obj).chain():obj};_.mixin=function(obj){_.each(_.functions(obj),function(name){var func=_[name]=obj[name];_.prototype[name]=function(){var args=[this._wrapped];push.apply(args,arguments);return result(this,func.apply(_,args))}})};_.mixin(_);_.each(['pop','push','reverse','shift','sort','splice','unshift'],function(name){var method=ArrayProto[name];_.prototype[name]=function(){var obj=this._wrapped;method.apply(obj,arguments);if((name==='shift'||name==='splice')&&obj.length===0)delete obj[0];return result(this,obj)}});_.each(['concat','join','slice'],function(name){var method=ArrayProto[name];_.prototype[name]=function(){return result(this,method.apply(this._wrapped,arguments))}});_.prototype.value=function(){return this._wrapped};_.prototype.valueOf=_.prototype.toJSON=_.prototype.value;_.prototype.toString=function(){return ''+this._wrapped};if(typeof define==='function'&&define.amd){define('underscore',[],function(){return _})}}.call(this))},{}],109:[function(require,module,exports){var util=require('util/');var pSlice=Array.prototype.slice;var hasOwn=Object.prototype.hasOwnProperty;var assert=module.exports=ok;assert.AssertionError=function AssertionError(options){this.name='AssertionError';this.actual=options.actual;this.expected=options.expected;this.operator=options.operator;if(options.message){this.message=options.message;this.generatedMessage=!1}else{this.message=getMessage(this);this.generatedMessage=!0}
    var stackStartFunction=options.stackStartFunction||fail;if(Error.captureStackTrace){Error.captureStackTrace(this,stackStartFunction)}
    else{var err=new Error();if(err.stack){var out=err.stack;var fn_name=stackStartFunction.name;var idx=out.indexOf('\n'+fn_name);if(idx>=0){var next_line=out.indexOf('\n',idx+1);out=out.substring(next_line+1)}
        this.stack=out}}};util.inherits(assert.AssertionError,Error);function replacer(key,value){if(util.isUndefined(value)){return ''+value}
    if(util.isNumber(value)&&!isFinite(value)){return value.toString()}
    if(util.isFunction(value)||util.isRegExp(value)){return value.toString()}
    return value}
    function truncate(s,n){if(util.isString(s)){return s.length<n?s:s.slice(0,n)}else{return s}}
    function getMessage(self){return truncate(JSON.stringify(self.actual,replacer),128)+' '+self.operator+' '+truncate(JSON.stringify(self.expected,replacer),128)}
    function fail(actual,expected,message,operator,stackStartFunction){throw new assert.AssertionError({message:message,actual:actual,expected:expected,operator:operator,stackStartFunction:stackStartFunction})}
    assert.fail=fail;function ok(value,message){if(!value)fail(value,!0,message,'==',assert.ok)}
    assert.ok=ok;assert.equal=function equal(actual,expected,message){if(actual!=expected)fail(actual,expected,message,'==',assert.equal)};assert.notEqual=function notEqual(actual,expected,message){if(actual==expected){fail(actual,expected,message,'!=',assert.notEqual)}};assert.deepEqual=function deepEqual(actual,expected,message){if(!_deepEqual(actual,expected)){fail(actual,expected,message,'deepEqual',assert.deepEqual)}};function _deepEqual(actual,expected){if(actual===expected){return!0}else if(util.isBuffer(actual)&&util.isBuffer(expected)){if(actual.length!=expected.length)return!1;for(var i=0;i<actual.length;i++){if(actual[i]!==expected[i])return!1}
        return!0}else if(util.isDate(actual)&&util.isDate(expected)){return actual.getTime()===expected.getTime()}else if(util.isRegExp(actual)&&util.isRegExp(expected)){return actual.source===expected.source&&actual.global===expected.global&&actual.multiline===expected.multiline&&actual.lastIndex===expected.lastIndex&&actual.ignoreCase===expected.ignoreCase}else if(!util.isObject(actual)&&!util.isObject(expected)){return actual==expected}else{return objEquiv(actual,expected)}}
    function isArguments(object){return Object.prototype.toString.call(object)=='[object Arguments]'}
    function objEquiv(a,b){if(util.isNullOrUndefined(a)||util.isNullOrUndefined(b))
        return!1;if(a.prototype!==b.prototype)return!1;if(util.isPrimitive(a)||util.isPrimitive(b)){return a===b}
        var aIsArgs=isArguments(a),bIsArgs=isArguments(b);if((aIsArgs&&!bIsArgs)||(!aIsArgs&&bIsArgs))
            return!1;if(aIsArgs){a=pSlice.call(a);b=pSlice.call(b);return _deepEqual(a,b)}
        var ka=objectKeys(a),kb=objectKeys(b),key,i;if(ka.length!=kb.length)
            return!1;ka.sort();kb.sort();for(i=ka.length-1;i>=0;i--){if(ka[i]!=kb[i])
            return!1}
        for(i=ka.length-1;i>=0;i--){key=ka[i];if(!_deepEqual(a[key],b[key]))return!1}
        return!0}
    assert.notDeepEqual=function notDeepEqual(actual,expected,message){if(_deepEqual(actual,expected)){fail(actual,expected,message,'notDeepEqual',assert.notDeepEqual)}};assert.strictEqual=function strictEqual(actual,expected,message){if(actual!==expected){fail(actual,expected,message,'===',assert.strictEqual)}};assert.notStrictEqual=function notStrictEqual(actual,expected,message){if(actual===expected){fail(actual,expected,message,'!==',assert.notStrictEqual)}};function expectedException(actual,expected){if(!actual||!expected){return!1}
        if(Object.prototype.toString.call(expected)=='[object RegExp]'){return expected.test(actual)}else if(actual instanceof expected){return!0}else if(expected.call({},actual)===!0){return!0}
        return!1}
    function _throws(shouldThrow,block,expected,message){var actual;if(util.isString(expected)){message=expected;expected=null}
        try{block()}catch(e){actual=e}
        message=(expected&&expected.name?' ('+expected.name+').':'.')+(message?' '+message:'.');if(shouldThrow&&!actual){fail(actual,expected,'Missing expected exception'+message)}
        if(!shouldThrow&&expectedException(actual,expected)){fail(actual,expected,'Got unwanted exception'+message)}
        if((shouldThrow&&actual&&expected&&!expectedException(actual,expected))||(!shouldThrow&&actual)){throw actual}}
    assert.throws=function(block,error,message){_throws.apply(this,[!0].concat(pSlice.call(arguments)))};assert.doesNotThrow=function(block,message){_throws.apply(this,[!1].concat(pSlice.call(arguments)))};assert.ifError=function(err){if(err){throw err}};var objectKeys=Object.keys||function(obj){var keys=[];for(var key in obj){if(hasOwn.call(obj,key))keys.push(key)}
        return keys}},{"util/":270}],110:[function(require,module,exports){},{}],111:[function(require,module,exports){var base64=require('base64-js')
    var ieee754=require('ieee754')
    var isArray=require('is-array')
    exports.Buffer=Buffer
    exports.SlowBuffer=SlowBuffer
    exports.INSPECT_MAX_BYTES=50
    Buffer.poolSize=8192
    var kMaxLength=0x3fffffff
    var rootParent={}
    Buffer.TYPED_ARRAY_SUPPORT=(function(){try{var buf=new ArrayBuffer(0)
        var arr=new Uint8Array(buf)
        arr.foo=function(){return 42}
        return arr.foo()===42&&typeof arr.subarray==='function'&&new Uint8Array(1).subarray(1,1).byteLength===0}catch(e){return!1}})()
    function Buffer(arg){if(!(this instanceof Buffer)){if(arguments.length>1)return new Buffer(arg,arguments[1])
        return new Buffer(arg)}
        this.length=0
        this.parent=undefined
        if(typeof arg==='number'){return fromNumber(this,arg)}
        if(typeof arg==='string'){return fromString(this,arg,arguments.length>1?arguments[1]:'utf8')}
        return fromObject(this,arg)}
    function fromNumber(that,length){that=allocate(that,length<0?0:checked(length)|0)
        if(!Buffer.TYPED_ARRAY_SUPPORT){for(var i=0;i<length;i++){that[i]=0}}
        return that}
    function fromString(that,string,encoding){if(typeof encoding!=='string'||encoding==='')encoding='utf8'
        var length=byteLength(string,encoding)|0
        that=allocate(that,length)
        that.write(string,encoding)
        return that}
    function fromObject(that,object){if(Buffer.isBuffer(object))return fromBuffer(that,object)
        if(isArray(object))return fromArray(that,object)
        if(object==null){throw new TypeError('must start with number, buffer, array or string')}
        if(typeof ArrayBuffer!=='undefined'&&object.buffer instanceof ArrayBuffer){return fromTypedArray(that,object)}
        if(object.length)return fromArrayLike(that,object)
        return fromJsonObject(that,object)}
    function fromBuffer(that,buffer){var length=checked(buffer.length)|0
        that=allocate(that,length)
        buffer.copy(that,0,0,length)
        return that}
    function fromArray(that,array){var length=checked(array.length)|0
        that=allocate(that,length)
        for(var i=0;i<length;i+=1){that[i]=array[i]&255}
        return that}
    function fromTypedArray(that,array){var length=checked(array.length)|0
        that=allocate(that,length)
        for(var i=0;i<length;i+=1){that[i]=array[i]&255}
        return that}
    function fromArrayLike(that,array){var length=checked(array.length)|0
        that=allocate(that,length)
        for(var i=0;i<length;i+=1){that[i]=array[i]&255}
        return that}
    function fromJsonObject(that,object){var array
        var length=0
        if(object.type==='Buffer'&&isArray(object.data)){array=object.data
            length=checked(array.length)|0}
        that=allocate(that,length)
        for(var i=0;i<length;i+=1){that[i]=array[i]&255}
        return that}
    function allocate(that,length){if(Buffer.TYPED_ARRAY_SUPPORT){that=Buffer._augment(new Uint8Array(length))}else{that.length=length
        that._isBuffer=!0}
        var fromPool=length!==0&&length<=Buffer.poolSize>>>1
        if(fromPool)that.parent=rootParent
        return that}
    function checked(length){if(length>=kMaxLength){throw new RangeError('Attempt to allocate Buffer larger than maximum '+'size: 0x'+kMaxLength.toString(16)+' bytes')}
        return length|0}
    function SlowBuffer(subject,encoding){if(!(this instanceof SlowBuffer))return new SlowBuffer(subject,encoding)
        var buf=new Buffer(subject,encoding)
        delete buf.parent
        return buf}
    Buffer.isBuffer=function isBuffer(b){return!!(b!=null&&b._isBuffer)}
    Buffer.compare=function compare(a,b){if(!Buffer.isBuffer(a)||!Buffer.isBuffer(b)){throw new TypeError('Arguments must be Buffers')}
        if(a===b)return 0
        var x=a.length
        var y=b.length
        var i=0
        var len=Math.min(x,y)
        while(i<len){if(a[i]!==b[i])break
            ++i}
        if(i!==len){x=a[i]
            y=b[i]}
        if(x<y)return-1
        if(y<x)return 1
        return 0}
    Buffer.isEncoding=function isEncoding(encoding){switch(String(encoding).toLowerCase()){case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'raw':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':return!0
        default:return!1}}
    Buffer.concat=function concat(list,length){if(!isArray(list))throw new TypeError('list argument must be an Array of Buffers.')
        if(list.length===0){return new Buffer(0)}else if(list.length===1){return list[0]}
        var i
        if(length===undefined){length=0
            for(i=0;i<list.length;i++){length+=list[i].length}}
        var buf=new Buffer(length)
        var pos=0
        for(i=0;i<list.length;i++){var item=list[i]
            item.copy(buf,pos)
            pos+=item.length}
        return buf}
    function byteLength(string,encoding){if(typeof string!=='string')string=String(string)
        if(string.length===0)return 0
        switch(encoding||'utf8'){case 'ascii':case 'binary':case 'raw':return string.length
            case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':return string.length*2
            case 'hex':return string.length>>>1
            case 'utf8':case 'utf-8':return utf8ToBytes(string).length
            case 'base64':return base64ToBytes(string).length
            default:return string.length}}
    Buffer.byteLength=byteLength
    Buffer.prototype.length=undefined
    Buffer.prototype.parent=undefined
    Buffer.prototype.toString=function toString(encoding,start,end){var loweredCase=!1
        start=start|0
        end=end===undefined||end===Infinity?this.length:end|0
        if(!encoding)encoding='utf8'
        if(start<0)start=0
        if(end>this.length)end=this.length
        if(end<=start)return ''
        while(!0){switch(encoding){case 'hex':return hexSlice(this,start,end)
            case 'utf8':case 'utf-8':return utf8Slice(this,start,end)
            case 'ascii':return asciiSlice(this,start,end)
            case 'binary':return binarySlice(this,start,end)
            case 'base64':return base64Slice(this,start,end)
            case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':return utf16leSlice(this,start,end)
            default:if(loweredCase)throw new TypeError('Unknown encoding: '+encoding)
                encoding=(encoding+'').toLowerCase()
                loweredCase=!0}}}
    Buffer.prototype.equals=function equals(b){if(!Buffer.isBuffer(b))throw new TypeError('Argument must be a Buffer')
        if(this===b)return!0
        return Buffer.compare(this,b)===0}
    Buffer.prototype.inspect=function inspect(){var str=''
        var max=exports.INSPECT_MAX_BYTES
        if(this.length>0){str=this.toString('hex',0,max).match(/.{2}/g).join(' ')
            if(this.length>max)str+=' ... '}
        return '<Buffer '+str+'>'}
    Buffer.prototype.compare=function compare(b){if(!Buffer.isBuffer(b))throw new TypeError('Argument must be a Buffer')
        if(this===b)return 0
        return Buffer.compare(this,b)}
    Buffer.prototype.indexOf=function indexOf(val,byteOffset){if(byteOffset>0x7fffffff)byteOffset=0x7fffffff
    else if(byteOffset<-0x80000000)byteOffset=-0x80000000
        byteOffset>>=0
        if(this.length===0)return-1
        if(byteOffset>=this.length)return-1
        if(byteOffset<0)byteOffset=Math.max(this.length+byteOffset,0)
        if(typeof val==='string'){if(val.length===0)return-1
            return String.prototype.indexOf.call(this,val,byteOffset)}
        if(Buffer.isBuffer(val)){return arrayIndexOf(this,val,byteOffset)}
        if(typeof val==='number'){if(Buffer.TYPED_ARRAY_SUPPORT&&Uint8Array.prototype.indexOf==='function'){return Uint8Array.prototype.indexOf.call(this,val,byteOffset)}
            return arrayIndexOf(this,[val],byteOffset)}
        function arrayIndexOf(arr,val,byteOffset){var foundIndex=-1
            for(var i=0;byteOffset+i<arr.length;i++){if(arr[byteOffset+i]===val[foundIndex===-1?0:i-foundIndex]){if(foundIndex===-1)foundIndex=i
                if(i-foundIndex+1===val.length)return byteOffset+foundIndex}else{foundIndex=-1}}
            return-1}
        throw new TypeError('val must be string, number or Buffer')}
    Buffer.prototype.get=function get(offset){console.log('.get() is deprecated. Access using array indexes instead.')
        return this.readUInt8(offset)}
    Buffer.prototype.set=function set(v,offset){console.log('.set() is deprecated. Access using array indexes instead.')
        return this.writeUInt8(v,offset)}
    function hexWrite(buf,string,offset,length){offset=Number(offset)||0
        var remaining=buf.length-offset
        if(!length){length=remaining}else{length=Number(length)
            if(length>remaining){length=remaining}}
        var strLen=string.length
        if(strLen%2!==0)throw new Error('Invalid hex string')
        if(length>strLen/2){length=strLen/2}
        for(var i=0;i<length;i++){var parsed=parseInt(string.substr(i*2,2),16)
            if(isNaN(parsed))throw new Error('Invalid hex string')
            buf[offset+i]=parsed}
        return i}
    function utf8Write(buf,string,offset,length){return blitBuffer(utf8ToBytes(string,buf.length-offset),buf,offset,length)}
    function asciiWrite(buf,string,offset,length){return blitBuffer(asciiToBytes(string),buf,offset,length)}
    function binaryWrite(buf,string,offset,length){return asciiWrite(buf,string,offset,length)}
    function base64Write(buf,string,offset,length){return blitBuffer(base64ToBytes(string),buf,offset,length)}
    function ucs2Write(buf,string,offset,length){return blitBuffer(utf16leToBytes(string,buf.length-offset),buf,offset,length)}
    Buffer.prototype.write=function write(string,offset,length,encoding){if(offset===undefined){encoding='utf8'
        length=this.length
        offset=0}else if(length===undefined&&typeof offset==='string'){encoding=offset
        length=this.length
        offset=0}else if(isFinite(offset)){offset=offset|0
        if(isFinite(length)){length=length|0
            if(encoding===undefined)encoding='utf8'}else{encoding=length
            length=undefined}}else{var swap=encoding
        encoding=offset
        offset=length|0
        length=swap}
        var remaining=this.length-offset
        if(length===undefined||length>remaining)length=remaining
        if((string.length>0&&(length<0||offset<0))||offset>this.length){throw new RangeError('attempt to write outside buffer bounds')}
        if(!encoding)encoding='utf8'
        var loweredCase=!1
        for(;;){switch(encoding){case 'hex':return hexWrite(this,string,offset,length)
            case 'utf8':case 'utf-8':return utf8Write(this,string,offset,length)
            case 'ascii':return asciiWrite(this,string,offset,length)
            case 'binary':return binaryWrite(this,string,offset,length)
            case 'base64':return base64Write(this,string,offset,length)
            case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':return ucs2Write(this,string,offset,length)
            default:if(loweredCase)throw new TypeError('Unknown encoding: '+encoding)
                encoding=(''+encoding).toLowerCase()
                loweredCase=!0}}}
    Buffer.prototype.toJSON=function toJSON(){return{type:'Buffer',data:Array.prototype.slice.call(this._arr||this,0)}}
    function base64Slice(buf,start,end){if(start===0&&end===buf.length){return base64.fromByteArray(buf)}else{return base64.fromByteArray(buf.slice(start,end))}}
    function utf8Slice(buf,start,end){var res=''
        var tmp=''
        end=Math.min(buf.length,end)
        for(var i=start;i<end;i++){if(buf[i]<=0x7F){res+=decodeUtf8Char(tmp)+String.fromCharCode(buf[i])
            tmp=''}else{tmp+='%'+buf[i].toString(16)}}
        return res+decodeUtf8Char(tmp)}
    function asciiSlice(buf,start,end){var ret=''
        end=Math.min(buf.length,end)
        for(var i=start;i<end;i++){ret+=String.fromCharCode(buf[i]&0x7F)}
        return ret}
    function binarySlice(buf,start,end){var ret=''
        end=Math.min(buf.length,end)
        for(var i=start;i<end;i++){ret+=String.fromCharCode(buf[i])}
        return ret}
    function hexSlice(buf,start,end){var len=buf.length
        if(!start||start<0)start=0
        if(!end||end<0||end>len)end=len
        var out=''
        for(var i=start;i<end;i++){out+=toHex(buf[i])}
        return out}
    function utf16leSlice(buf,start,end){var bytes=buf.slice(start,end)
        var res=''
        for(var i=0;i<bytes.length;i+=2){res+=String.fromCharCode(bytes[i]+bytes[i+1]*256)}
        return res}
    Buffer.prototype.slice=function slice(start,end){var len=this.length
        start=~~start
        end=end===undefined?len:~~end
        if(start<0){start+=len
            if(start<0)start=0}else if(start>len){start=len}
        if(end<0){end+=len
            if(end<0)end=0}else if(end>len){end=len}
        if(end<start)end=start
        var newBuf
        if(Buffer.TYPED_ARRAY_SUPPORT){newBuf=Buffer._augment(this.subarray(start,end))}else{var sliceLen=end-start
            newBuf=new Buffer(sliceLen,undefined)
            for(var i=0;i<sliceLen;i++){newBuf[i]=this[i+start]}}
        if(newBuf.length)newBuf.parent=this.parent||this
        return newBuf}
    function checkOffset(offset,ext,length){if((offset%1)!==0||offset<0)throw new RangeError('offset is not uint')
        if(offset+ext>length)throw new RangeError('Trying to access beyond buffer length')}
    Buffer.prototype.readUIntLE=function readUIntLE(offset,byteLength,noAssert){offset=offset|0
        byteLength=byteLength|0
        if(!noAssert)checkOffset(offset,byteLength,this.length)
        var val=this[offset]
        var mul=1
        var i=0
        while(++i<byteLength&&(mul*=0x100)){val+=this[offset+i]*mul}
        return val}
    Buffer.prototype.readUIntBE=function readUIntBE(offset,byteLength,noAssert){offset=offset|0
        byteLength=byteLength|0
        if(!noAssert){checkOffset(offset,byteLength,this.length)}
        var val=this[offset+ --byteLength]
        var mul=1
        while(byteLength>0&&(mul*=0x100)){val+=this[offset+ --byteLength]*mul}
        return val}
    Buffer.prototype.readUInt8=function readUInt8(offset,noAssert){if(!noAssert)checkOffset(offset,1,this.length)
        return this[offset]}
    Buffer.prototype.readUInt16LE=function readUInt16LE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length)
        return this[offset]|(this[offset+1]<<8)}
    Buffer.prototype.readUInt16BE=function readUInt16BE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length)
        return(this[offset]<<8)|this[offset+1]}
    Buffer.prototype.readUInt32LE=function readUInt32LE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length)
        return((this[offset])|(this[offset+1]<<8)|(this[offset+2]<<16))+(this[offset+3]*0x1000000)}
    Buffer.prototype.readUInt32BE=function readUInt32BE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length)
        return(this[offset]*0x1000000)+((this[offset+1]<<16)|(this[offset+2]<<8)|this[offset+3])}
    Buffer.prototype.readIntLE=function readIntLE(offset,byteLength,noAssert){offset=offset|0
        byteLength=byteLength|0
        if(!noAssert)checkOffset(offset,byteLength,this.length)
        var val=this[offset]
        var mul=1
        var i=0
        while(++i<byteLength&&(mul*=0x100)){val+=this[offset+i]*mul}
        mul*=0x80
        if(val>=mul)val-=Math.pow(2,8*byteLength)
        return val}
    Buffer.prototype.readIntBE=function readIntBE(offset,byteLength,noAssert){offset=offset|0
        byteLength=byteLength|0
        if(!noAssert)checkOffset(offset,byteLength,this.length)
        var i=byteLength
        var mul=1
        var val=this[offset+ --i]
        while(i>0&&(mul*=0x100)){val+=this[offset+ --i]*mul}
        mul*=0x80
        if(val>=mul)val-=Math.pow(2,8*byteLength)
        return val}
    Buffer.prototype.readInt8=function readInt8(offset,noAssert){if(!noAssert)checkOffset(offset,1,this.length)
        if(!(this[offset]&0x80))return(this[offset])
        return((0xff-this[offset]+1)*-1)}
    Buffer.prototype.readInt16LE=function readInt16LE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length)
        var val=this[offset]|(this[offset+1]<<8)
        return(val&0x8000)?val|0xFFFF0000:val}
    Buffer.prototype.readInt16BE=function readInt16BE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length)
        var val=this[offset+1]|(this[offset]<<8)
        return(val&0x8000)?val|0xFFFF0000:val}
    Buffer.prototype.readInt32LE=function readInt32LE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length)
        return(this[offset])|(this[offset+1]<<8)|(this[offset+2]<<16)|(this[offset+3]<<24)}
    Buffer.prototype.readInt32BE=function readInt32BE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length)
        return(this[offset]<<24)|(this[offset+1]<<16)|(this[offset+2]<<8)|(this[offset+3])}
    Buffer.prototype.readFloatLE=function readFloatLE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length)
        return ieee754.read(this,offset,!0,23,4)}
    Buffer.prototype.readFloatBE=function readFloatBE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length)
        return ieee754.read(this,offset,!1,23,4)}
    Buffer.prototype.readDoubleLE=function readDoubleLE(offset,noAssert){if(!noAssert)checkOffset(offset,8,this.length)
        return ieee754.read(this,offset,!0,52,8)}
    Buffer.prototype.readDoubleBE=function readDoubleBE(offset,noAssert){if(!noAssert)checkOffset(offset,8,this.length)
        return ieee754.read(this,offset,!1,52,8)}
    function checkInt(buf,value,offset,ext,max,min){if(!Buffer.isBuffer(buf))throw new TypeError('buffer must be a Buffer instance')
        if(value>max||value<min)throw new RangeError('value is out of bounds')
        if(offset+ext>buf.length)throw new RangeError('index out of range')}
    Buffer.prototype.writeUIntLE=function writeUIntLE(value,offset,byteLength,noAssert){value=+value
        offset=offset|0
        byteLength=byteLength|0
        if(!noAssert)checkInt(this,value,offset,byteLength,Math.pow(2,8*byteLength),0)
        var mul=1
        var i=0
        this[offset]=value&0xFF
        while(++i<byteLength&&(mul*=0x100)){this[offset+i]=(value/mul)&0xFF}
        return offset+byteLength}
    Buffer.prototype.writeUIntBE=function writeUIntBE(value,offset,byteLength,noAssert){value=+value
        offset=offset|0
        byteLength=byteLength|0
        if(!noAssert)checkInt(this,value,offset,byteLength,Math.pow(2,8*byteLength),0)
        var i=byteLength-1
        var mul=1
        this[offset+i]=value&0xFF
        while(--i>=0&&(mul*=0x100)){this[offset+i]=(value/mul)&0xFF}
        return offset+byteLength}
    Buffer.prototype.writeUInt8=function writeUInt8(value,offset,noAssert){value=+value
        offset=offset|0
        if(!noAssert)checkInt(this,value,offset,1,0xff,0)
        if(!Buffer.TYPED_ARRAY_SUPPORT)value=Math.floor(value)
        this[offset]=value
        return offset+1}
    function objectWriteUInt16(buf,value,offset,littleEndian){if(value<0)value=0xffff+value+1
        for(var i=0,j=Math.min(buf.length-offset,2);i<j;i++){buf[offset+i]=(value&(0xff<<(8*(littleEndian?i:1-i))))>>>(littleEndian?i:1-i)*8}}
    Buffer.prototype.writeUInt16LE=function writeUInt16LE(value,offset,noAssert){value=+value
        offset=offset|0
        if(!noAssert)checkInt(this,value,offset,2,0xffff,0)
        if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value
            this[offset+1]=(value>>>8)}else{objectWriteUInt16(this,value,offset,!0)}
        return offset+2}
    Buffer.prototype.writeUInt16BE=function writeUInt16BE(value,offset,noAssert){value=+value
        offset=offset|0
        if(!noAssert)checkInt(this,value,offset,2,0xffff,0)
        if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=(value>>>8)
            this[offset+1]=value}else{objectWriteUInt16(this,value,offset,!1)}
        return offset+2}
    function objectWriteUInt32(buf,value,offset,littleEndian){if(value<0)value=0xffffffff+value+1
        for(var i=0,j=Math.min(buf.length-offset,4);i<j;i++){buf[offset+i]=(value>>>(littleEndian?i:3-i)*8)&0xff}}
    Buffer.prototype.writeUInt32LE=function writeUInt32LE(value,offset,noAssert){value=+value
        offset=offset|0
        if(!noAssert)checkInt(this,value,offset,4,0xffffffff,0)
        if(Buffer.TYPED_ARRAY_SUPPORT){this[offset+3]=(value>>>24)
            this[offset+2]=(value>>>16)
            this[offset+1]=(value>>>8)
            this[offset]=value}else{objectWriteUInt32(this,value,offset,!0)}
        return offset+4}
    Buffer.prototype.writeUInt32BE=function writeUInt32BE(value,offset,noAssert){value=+value
        offset=offset|0
        if(!noAssert)checkInt(this,value,offset,4,0xffffffff,0)
        if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=(value>>>24)
            this[offset+1]=(value>>>16)
            this[offset+2]=(value>>>8)
            this[offset+3]=value}else{objectWriteUInt32(this,value,offset,!1)}
        return offset+4}
    Buffer.prototype.writeIntLE=function writeIntLE(value,offset,byteLength,noAssert){value=+value
        offset=offset|0
        if(!noAssert){var limit=Math.pow(2,8*byteLength-1)
            checkInt(this,value,offset,byteLength,limit-1,-limit)}
        var i=0
        var mul=1
        var sub=value<0?1:0
        this[offset]=value&0xFF
        while(++i<byteLength&&(mul*=0x100)){this[offset+i]=((value/mul)>>0)-sub&0xFF}
        return offset+byteLength}
    Buffer.prototype.writeIntBE=function writeIntBE(value,offset,byteLength,noAssert){value=+value
        offset=offset|0
        if(!noAssert){var limit=Math.pow(2,8*byteLength-1)
            checkInt(this,value,offset,byteLength,limit-1,-limit)}
        var i=byteLength-1
        var mul=1
        var sub=value<0?1:0
        this[offset+i]=value&0xFF
        while(--i>=0&&(mul*=0x100)){this[offset+i]=((value/mul)>>0)-sub&0xFF}
        return offset+byteLength}
    Buffer.prototype.writeInt8=function writeInt8(value,offset,noAssert){value=+value
        offset=offset|0
        if(!noAssert)checkInt(this,value,offset,1,0x7f,-0x80)
        if(!Buffer.TYPED_ARRAY_SUPPORT)value=Math.floor(value)
        if(value<0)value=0xff+value+1
        this[offset]=value
        return offset+1}
    Buffer.prototype.writeInt16LE=function writeInt16LE(value,offset,noAssert){value=+value
        offset=offset|0
        if(!noAssert)checkInt(this,value,offset,2,0x7fff,-0x8000)
        if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value
            this[offset+1]=(value>>>8)}else{objectWriteUInt16(this,value,offset,!0)}
        return offset+2}
    Buffer.prototype.writeInt16BE=function writeInt16BE(value,offset,noAssert){value=+value
        offset=offset|0
        if(!noAssert)checkInt(this,value,offset,2,0x7fff,-0x8000)
        if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=(value>>>8)
            this[offset+1]=value}else{objectWriteUInt16(this,value,offset,!1)}
        return offset+2}
    Buffer.prototype.writeInt32LE=function writeInt32LE(value,offset,noAssert){value=+value
        offset=offset|0
        if(!noAssert)checkInt(this,value,offset,4,0x7fffffff,-0x80000000)
        if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value
            this[offset+1]=(value>>>8)
            this[offset+2]=(value>>>16)
            this[offset+3]=(value>>>24)}else{objectWriteUInt32(this,value,offset,!0)}
        return offset+4}
    Buffer.prototype.writeInt32BE=function writeInt32BE(value,offset,noAssert){value=+value
        offset=offset|0
        if(!noAssert)checkInt(this,value,offset,4,0x7fffffff,-0x80000000)
        if(value<0)value=0xffffffff+value+1
        if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=(value>>>24)
            this[offset+1]=(value>>>16)
            this[offset+2]=(value>>>8)
            this[offset+3]=value}else{objectWriteUInt32(this,value,offset,!1)}
        return offset+4}
    function checkIEEE754(buf,value,offset,ext,max,min){if(value>max||value<min)throw new RangeError('value is out of bounds')
        if(offset+ext>buf.length)throw new RangeError('index out of range')
        if(offset<0)throw new RangeError('index out of range')}
    function writeFloat(buf,value,offset,littleEndian,noAssert){if(!noAssert){checkIEEE754(buf,value,offset,4,3.4028234663852886e+38,-3.4028234663852886e+38)}
        ieee754.write(buf,value,offset,littleEndian,23,4)
        return offset+4}
    Buffer.prototype.writeFloatLE=function writeFloatLE(value,offset,noAssert){return writeFloat(this,value,offset,!0,noAssert)}
    Buffer.prototype.writeFloatBE=function writeFloatBE(value,offset,noAssert){return writeFloat(this,value,offset,!1,noAssert)}
    function writeDouble(buf,value,offset,littleEndian,noAssert){if(!noAssert){checkIEEE754(buf,value,offset,8,1.7976931348623157E+308,-1.7976931348623157E+308)}
        ieee754.write(buf,value,offset,littleEndian,52,8)
        return offset+8}
    Buffer.prototype.writeDoubleLE=function writeDoubleLE(value,offset,noAssert){return writeDouble(this,value,offset,!0,noAssert)}
    Buffer.prototype.writeDoubleBE=function writeDoubleBE(value,offset,noAssert){return writeDouble(this,value,offset,!1,noAssert)}
    Buffer.prototype.copy=function copy(target,targetStart,start,end){if(!start)start=0
        if(!end&&end!==0)end=this.length
        if(targetStart>=target.length)targetStart=target.length
        if(!targetStart)targetStart=0
        if(end>0&&end<start)end=start
        if(end===start)return 0
        if(target.length===0||this.length===0)return 0
        if(targetStart<0){throw new RangeError('targetStart out of bounds')}
        if(start<0||start>=this.length)throw new RangeError('sourceStart out of bounds')
        if(end<0)throw new RangeError('sourceEnd out of bounds')
        if(end>this.length)end=this.length
        if(target.length-targetStart<end-start){end=target.length-targetStart+start}
        var len=end-start
        if(len<1000||!Buffer.TYPED_ARRAY_SUPPORT){for(var i=0;i<len;i++){target[i+targetStart]=this[i+start]}}else{target._set(this.subarray(start,start+len),targetStart)}
        return len}
    Buffer.prototype.fill=function fill(value,start,end){if(!value)value=0
        if(!start)start=0
        if(!end)end=this.length
        if(end<start)throw new RangeError('end < start')
        if(end===start)return
        if(this.length===0)return
        if(start<0||start>=this.length)throw new RangeError('start out of bounds')
        if(end<0||end>this.length)throw new RangeError('end out of bounds')
        var i
        if(typeof value==='number'){for(i=start;i<end;i++){this[i]=value}}else{var bytes=utf8ToBytes(value.toString())
            var len=bytes.length
            for(i=start;i<end;i++){this[i]=bytes[i%len]}}
        return this}
    Buffer.prototype.toArrayBuffer=function toArrayBuffer(){if(typeof Uint8Array!=='undefined'){if(Buffer.TYPED_ARRAY_SUPPORT){return(new Buffer(this)).buffer}else{var buf=new Uint8Array(this.length)
        for(var i=0,len=buf.length;i<len;i+=1){buf[i]=this[i]}
        return buf.buffer}}else{throw new TypeError('Buffer.toArrayBuffer not supported in this browser')}}
    var BP=Buffer.prototype
    Buffer._augment=function _augment(arr){arr.constructor=Buffer
        arr._isBuffer=!0
        arr._set=arr.set
        arr.get=BP.get
        arr.set=BP.set
        arr.write=BP.write
        arr.toString=BP.toString
        arr.toLocaleString=BP.toString
        arr.toJSON=BP.toJSON
        arr.equals=BP.equals
        arr.compare=BP.compare
        arr.indexOf=BP.indexOf
        arr.copy=BP.copy
        arr.slice=BP.slice
        arr.readUIntLE=BP.readUIntLE
        arr.readUIntBE=BP.readUIntBE
        arr.readUInt8=BP.readUInt8
        arr.readUInt16LE=BP.readUInt16LE
        arr.readUInt16BE=BP.readUInt16BE
        arr.readUInt32LE=BP.readUInt32LE
        arr.readUInt32BE=BP.readUInt32BE
        arr.readIntLE=BP.readIntLE
        arr.readIntBE=BP.readIntBE
        arr.readInt8=BP.readInt8
        arr.readInt16LE=BP.readInt16LE
        arr.readInt16BE=BP.readInt16BE
        arr.readInt32LE=BP.readInt32LE
        arr.readInt32BE=BP.readInt32BE
        arr.readFloatLE=BP.readFloatLE
        arr.readFloatBE=BP.readFloatBE
        arr.readDoubleLE=BP.readDoubleLE
        arr.readDoubleBE=BP.readDoubleBE
        arr.writeUInt8=BP.writeUInt8
        arr.writeUIntLE=BP.writeUIntLE
        arr.writeUIntBE=BP.writeUIntBE
        arr.writeUInt16LE=BP.writeUInt16LE
        arr.writeUInt16BE=BP.writeUInt16BE
        arr.writeUInt32LE=BP.writeUInt32LE
        arr.writeUInt32BE=BP.writeUInt32BE
        arr.writeIntLE=BP.writeIntLE
        arr.writeIntBE=BP.writeIntBE
        arr.writeInt8=BP.writeInt8
        arr.writeInt16LE=BP.writeInt16LE
        arr.writeInt16BE=BP.writeInt16BE
        arr.writeInt32LE=BP.writeInt32LE
        arr.writeInt32BE=BP.writeInt32BE
        arr.writeFloatLE=BP.writeFloatLE
        arr.writeFloatBE=BP.writeFloatBE
        arr.writeDoubleLE=BP.writeDoubleLE
        arr.writeDoubleBE=BP.writeDoubleBE
        arr.fill=BP.fill
        arr.inspect=BP.inspect
        arr.toArrayBuffer=BP.toArrayBuffer
        return arr}
    var INVALID_BASE64_RE=/[^+\/0-9A-z\-]/g
    function base64clean(str){str=stringtrim(str).replace(INVALID_BASE64_RE,'')
        if(str.length<2)return ''
        while(str.length%4!==0){str=str+'='}
        return str}
    function stringtrim(str){if(str.trim)return str.trim()
        return str.replace(/^\s+|\s+$/g,'')}
    function toHex(n){if(n<16)return '0'+n.toString(16)
        return n.toString(16)}
    function utf8ToBytes(string,units){units=units||Infinity
        var codePoint
        var length=string.length
        var leadSurrogate=null
        var bytes=[]
        var i=0
        for(;i<length;i++){codePoint=string.charCodeAt(i)
            if(codePoint>0xD7FF&&codePoint<0xE000){if(leadSurrogate){if(codePoint<0xDC00){if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD)
                leadSurrogate=codePoint
                continue}else{codePoint=leadSurrogate-0xD800<<10|codePoint-0xDC00|0x10000
                leadSurrogate=null}}else{if(codePoint>0xDBFF){if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD)
                continue}else if(i+1===length){if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD)
                continue}else{leadSurrogate=codePoint
                continue}}}else if(leadSurrogate){if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD)
                leadSurrogate=null}
            if(codePoint<0x80){if((units-=1)<0)break
                bytes.push(codePoint)}else if(codePoint<0x800){if((units-=2)<0)break
                bytes.push(codePoint>>0x6|0xC0,codePoint&0x3F|0x80)}else if(codePoint<0x10000){if((units-=3)<0)break
                bytes.push(codePoint>>0xC|0xE0,codePoint>>0x6&0x3F|0x80,codePoint&0x3F|0x80)}else if(codePoint<0x200000){if((units-=4)<0)break
                bytes.push(codePoint>>0x12|0xF0,codePoint>>0xC&0x3F|0x80,codePoint>>0x6&0x3F|0x80,codePoint&0x3F|0x80)}else{throw new Error('Invalid code point')}}
        return bytes}
    function asciiToBytes(str){var byteArray=[]
        for(var i=0;i<str.length;i++){byteArray.push(str.charCodeAt(i)&0xFF)}
        return byteArray}
    function utf16leToBytes(str,units){var c,hi,lo
        var byteArray=[]
        for(var i=0;i<str.length;i++){if((units-=2)<0)break
            c=str.charCodeAt(i)
            hi=c>>8
            lo=c%256
            byteArray.push(lo)
            byteArray.push(hi)}
        return byteArray}
    function base64ToBytes(str){return base64.toByteArray(base64clean(str))}
    function blitBuffer(src,dst,offset,length){for(var i=0;i<length;i++){if((i+offset>=dst.length)||(i>=src.length))break
        dst[i+offset]=src[i]}
        return i}
    function decodeUtf8Char(str){try{return decodeURIComponent(str)}catch(err){return String.fromCharCode(0xFFFD)}}},{"base64-js":112,"ieee754":113,"is-array":114}],112:[function(require,module,exports){var lookup='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';(function(exports){'use strict';var Arr=(typeof Uint8Array!=='undefined')?Uint8Array:Array
    var PLUS='+'.charCodeAt(0)
    var SLASH='/'.charCodeAt(0)
    var NUMBER='0'.charCodeAt(0)
    var LOWER='a'.charCodeAt(0)
    var UPPER='A'.charCodeAt(0)
    var PLUS_URL_SAFE='-'.charCodeAt(0)
    var SLASH_URL_SAFE='_'.charCodeAt(0)
    function decode(elt){var code=elt.charCodeAt(0)
        if(code===PLUS||code===PLUS_URL_SAFE)
            return 62
        if(code===SLASH||code===SLASH_URL_SAFE)
            return 63
        if(code<NUMBER)
            return-1
        if(code<NUMBER+10)
            return code-NUMBER+26+26
        if(code<UPPER+26)
            return code-UPPER
        if(code<LOWER+26)
            return code-LOWER+26}
    function b64ToByteArray(b64){var i,j,l,tmp,placeHolders,arr
        if(b64.length%4>0){throw new Error('Invalid string. Length must be a multiple of 4')}
        var len=b64.length
        placeHolders='='===b64.charAt(len-2)?2:'='===b64.charAt(len-1)?1:0
        arr=new Arr(b64.length*3/4-placeHolders)
        l=placeHolders>0?b64.length-4:b64.length
        var L=0
        function push(v){arr[L++]=v}
        for(i=0,j=0;i<l;i+=4,j+=3){tmp=(decode(b64.charAt(i))<<18)|(decode(b64.charAt(i+1))<<12)|(decode(b64.charAt(i+2))<<6)|decode(b64.charAt(i+3))
            push((tmp&0xFF0000)>>16)
            push((tmp&0xFF00)>>8)
            push(tmp&0xFF)}
        if(placeHolders===2){tmp=(decode(b64.charAt(i))<<2)|(decode(b64.charAt(i+1))>>4)
            push(tmp&0xFF)}else if(placeHolders===1){tmp=(decode(b64.charAt(i))<<10)|(decode(b64.charAt(i+1))<<4)|(decode(b64.charAt(i+2))>>2)
            push((tmp>>8)&0xFF)
            push(tmp&0xFF)}
        return arr}
    function uint8ToBase64(uint8){var i,extraBytes=uint8.length%3,output="",temp,length
        function encode(num){return lookup.charAt(num)}
        function tripletToBase64(num){return encode(num>>18&0x3F)+encode(num>>12&0x3F)+encode(num>>6&0x3F)+encode(num&0x3F)}
        for(i=0,length=uint8.length-extraBytes;i<length;i+=3){temp=(uint8[i]<<16)+(uint8[i+1]<<8)+(uint8[i+2])
            output+=tripletToBase64(temp)}
        switch(extraBytes){case 1:temp=uint8[uint8.length-1]
            output+=encode(temp>>2)
            output+=encode((temp<<4)&0x3F)
            output+='=='
            break
            case 2:temp=(uint8[uint8.length-2]<<8)+(uint8[uint8.length-1])
                output+=encode(temp>>10)
                output+=encode((temp>>4)&0x3F)
                output+=encode((temp<<2)&0x3F)
                output+='='
                break}
        return output}
    exports.toByteArray=b64ToByteArray
    exports.fromByteArray=uint8ToBase64}(typeof exports==='undefined'?(this.base64js={}):exports))},{}],113:[function(require,module,exports){exports.read=function(buffer,offset,isLE,mLen,nBytes){var e,m
    var eLen=nBytes*8-mLen-1
    var eMax=(1<<eLen)-1
    var eBias=eMax>>1
    var nBits=-7
    var i=isLE?(nBytes-1):0
    var d=isLE?-1:1
    var s=buffer[offset+i]
    i+=d
    e=s&((1<<(-nBits))-1)
    s>>=(-nBits)
    nBits+=eLen
    for(;nBits>0;e=e*256+buffer[offset+i],i+=d,nBits-=8){}
    m=e&((1<<(-nBits))-1)
    e>>=(-nBits)
    nBits+=mLen
    for(;nBits>0;m=m*256+buffer[offset+i],i+=d,nBits-=8){}
    if(e===0){e=1-eBias}else if(e===eMax){return m?NaN:((s?-1:1)*Infinity)}else{m=m+Math.pow(2,mLen)
        e=e-eBias}
    return(s?-1:1)*m*Math.pow(2,e-mLen)}
    exports.write=function(buffer,value,offset,isLE,mLen,nBytes){var e,m,c
        var eLen=nBytes*8-mLen-1
        var eMax=(1<<eLen)-1
        var eBias=eMax>>1
        var rt=(mLen===23?Math.pow(2,-24)-Math.pow(2,-77):0)
        var i=isLE?0:(nBytes-1)
        var d=isLE?1:-1
        var s=value<0||(value===0&&1/value<0)?1:0
        value=Math.abs(value)
        if(isNaN(value)||value===Infinity){m=isNaN(value)?1:0
            e=eMax}else{e=Math.floor(Math.log(value)/Math.LN2)
            if(value*(c=Math.pow(2,-e))<1){e--
                c*=2}
            if(e+eBias>=1){value+=rt/c}else{value+=rt*Math.pow(2,1-eBias)}
            if(value*c>=2){e++
                c/=2}
            if(e+eBias>=eMax){m=0
                e=eMax}else if(e+eBias>=1){m=(value*c-1)*Math.pow(2,mLen)
                e=e+eBias}else{m=value*Math.pow(2,eBias-1)*Math.pow(2,mLen)
                e=0}}
        for(;mLen>=8;buffer[offset+i]=m&0xff,i+=d,m/=256,mLen-=8){}
        e=(e<<mLen)|m
        eLen+=mLen
        for(;eLen>0;buffer[offset+i]=e&0xff,i+=d,e/=256,eLen-=8){}
        buffer[offset+i-d]|=s*128}},{}],114:[function(require,module,exports){var isArray=Array.isArray;var str=Object.prototype.toString;module.exports=isArray||function(val){return!!val&&'[object Array]'==str.call(val)}},{}],115:[function(require,module,exports){'use strict';exports.randomBytes=exports.rng=exports.pseudoRandomBytes=exports.prng=require('randombytes')
    exports.createHash=exports.Hash=require('create-hash')
    exports.createHmac=exports.Hmac=require('create-hmac')
    var hashes=['sha1','sha224','sha256','sha384','sha512','md5','rmd160'].concat(Object.keys(require('browserify-sign/algos')))
    exports.getHashes=function(){return hashes}
    var p=require('pbkdf2')
    exports.pbkdf2=p.pbkdf2
    exports.pbkdf2Sync=p.pbkdf2Sync
    var aes=require('browserify-aes');['Cipher','createCipher','Cipheriv','createCipheriv','Decipher','createDecipher','Decipheriv','createDecipheriv','getCiphers','listCiphers'].forEach(function(key){exports[key]=aes[key]})
    var dh=require('diffie-hellman');['DiffieHellmanGroup','createDiffieHellmanGroup','getDiffieHellman','createDiffieHellman','DiffieHellman'].forEach(function(key){exports[key]=dh[key]})
    var sign=require('browserify-sign');['createSign','Sign','createVerify','Verify'].forEach(function(key){exports[key]=sign[key]})
    exports.createECDH=require('create-ecdh')
    var publicEncrypt=require('public-encrypt');['publicEncrypt','privateEncrypt','publicDecrypt','privateDecrypt'].forEach(function(key){exports[key]=publicEncrypt[key]});['createCredentials'].forEach(function(name){exports[name]=function(){throw new Error(['sorry, '+name+' is not implemented yet','we accept pull requests','https://github.com/crypto-browserify/crypto-browserify'].join('\n'))}})},{"browserify-aes":119,"browserify-sign":135,"browserify-sign/algos":134,"create-ecdh":181,"create-hash":204,"create-hmac":216,"diffie-hellman":217,"pbkdf2":224,"public-encrypt":225,"randombytes":251}],116:[function(require,module,exports){(function(Buffer){var md5=require('create-hash/md5')
    module.exports=EVP_BytesToKey
    function EVP_BytesToKey(password,keyLen,ivLen){if(!Buffer.isBuffer(password)){password=new Buffer(password,'binary')}
        keyLen=keyLen/8
        ivLen=ivLen||0
        var ki=0
        var ii=0
        var key=new Buffer(keyLen)
        var iv=new Buffer(ivLen)
        var addmd=0
        var md_buf
        var i
        var bufs=[]
        while(!0){if(addmd++>0){bufs.push(md_buf)}
            bufs.push(password)
            md_buf=md5(Buffer.concat(bufs))
            bufs=[]
            i=0
            if(keyLen>0){while(!0){if(keyLen===0){break}
                if(i===md_buf.length){break}
                key[ki++]=md_buf[i]
                keyLen--
                i++}}
            if(ivLen>0&&i!==md_buf.length){while(!0){if(ivLen===0){break}
                if(i===md_buf.length){break}
                iv[ii++]=md_buf[i]
                ivLen--
                i++}}
            if(keyLen===0&&ivLen===0){break}}
        for(i=0;i<md_buf.length;i++){md_buf[i]=0}
        return{key:key,iv:iv}}}).call(this,require("buffer").Buffer)},{"buffer":111,"create-hash/md5":206}],117:[function(require,module,exports){(function(Buffer){var uint_max=Math.pow(2,32)
    function fixup_uint32(x){var ret,x_pos
        ret=x>uint_max||x<0?(x_pos=Math.abs(x)%uint_max,x<0?uint_max-x_pos:x_pos):x
        return ret}
    function scrub_vec(v){for(var i=0;i<v.length;v++){v[i]=0}
        return!1}
    function Global(){this.SBOX=[]
        this.INV_SBOX=[]
        this.SUB_MIX=[[],[],[],[]]
        this.INV_SUB_MIX=[[],[],[],[]]
        this.init()
        this.RCON=[0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36]}
    Global.prototype.init=function(){var d,i,sx,t,x,x2,x4,x8,xi,_i
        d=(function(){var _i,_results
            _results=[]
            for(i=_i=0;_i<256;i=++_i){if(i<128){_results.push(i<<1)}else{_results.push((i<<1)^0x11b)}}
            return _results})()
        x=0
        xi=0
        for(i=_i=0;_i<256;i=++_i){sx=xi^(xi<<1)^(xi<<2)^(xi<<3)^(xi<<4)
            sx=(sx>>>8)^(sx&0xff)^0x63
            this.SBOX[x]=sx
            this.INV_SBOX[sx]=x
            x2=d[x]
            x4=d[x2]
            x8=d[x4]
            t=(d[sx]*0x101)^(sx*0x1010100)
            this.SUB_MIX[0][x]=(t<<24)|(t>>>8)
            this.SUB_MIX[1][x]=(t<<16)|(t>>>16)
            this.SUB_MIX[2][x]=(t<<8)|(t>>>24)
            this.SUB_MIX[3][x]=t
            t=(x8*0x1010101)^(x4*0x10001)^(x2*0x101)^(x*0x1010100)
            this.INV_SUB_MIX[0][sx]=(t<<24)|(t>>>8)
            this.INV_SUB_MIX[1][sx]=(t<<16)|(t>>>16)
            this.INV_SUB_MIX[2][sx]=(t<<8)|(t>>>24)
            this.INV_SUB_MIX[3][sx]=t
            if(x===0){x=xi=1}else{x=x2^d[d[d[x8^x2]]]
                xi^=d[d[xi]]}}
        return!0}
    var G=new Global()
    AES.blockSize=4*4
    AES.prototype.blockSize=AES.blockSize
    AES.keySize=256/8
    AES.prototype.keySize=AES.keySize
    function bufferToArray(buf){var len=buf.length/4
        var out=new Array(len)
        var i=-1
        while(++i<len){out[i]=buf.readUInt32BE(i*4)}
        return out}
    function AES(key){this._key=bufferToArray(key)
        this._doReset()}
    AES.prototype._doReset=function(){var invKsRow,keySize,keyWords,ksRow,ksRows,t
        keyWords=this._key
        keySize=keyWords.length
        this._nRounds=keySize+6
        ksRows=(this._nRounds+1)*4
        this._keySchedule=[]
        for(ksRow=0;ksRow<ksRows;ksRow++){this._keySchedule[ksRow]=ksRow<keySize?keyWords[ksRow]:(t=this._keySchedule[ksRow-1],(ksRow%keySize)===0?(t=(t<<8)|(t>>>24),t=(G.SBOX[t>>>24]<<24)|(G.SBOX[(t>>>16)&0xff]<<16)|(G.SBOX[(t>>>8)&0xff]<<8)|G.SBOX[t&0xff],t^=G.RCON[(ksRow/keySize)|0]<<24):keySize>6&&ksRow%keySize===4?t=(G.SBOX[t>>>24]<<24)|(G.SBOX[(t>>>16)&0xff]<<16)|(G.SBOX[(t>>>8)&0xff]<<8)|G.SBOX[t&0xff]:void 0,this._keySchedule[ksRow-keySize]^t)}
        this._invKeySchedule=[]
        for(invKsRow=0;invKsRow<ksRows;invKsRow++){ksRow=ksRows-invKsRow
            t=this._keySchedule[ksRow-(invKsRow%4?0:4)]
            this._invKeySchedule[invKsRow]=invKsRow<4||ksRow<=4?t:G.INV_SUB_MIX[0][G.SBOX[t>>>24]]^G.INV_SUB_MIX[1][G.SBOX[(t>>>16)&0xff]]^G.INV_SUB_MIX[2][G.SBOX[(t>>>8)&0xff]]^G.INV_SUB_MIX[3][G.SBOX[t&0xff]]}
        return!0}
    AES.prototype.encryptBlock=function(M){M=bufferToArray(new Buffer(M))
        var out=this._doCryptBlock(M,this._keySchedule,G.SUB_MIX,G.SBOX)
        var buf=new Buffer(16)
        buf.writeUInt32BE(out[0],0)
        buf.writeUInt32BE(out[1],4)
        buf.writeUInt32BE(out[2],8)
        buf.writeUInt32BE(out[3],12)
        return buf}
    AES.prototype.decryptBlock=function(M){M=bufferToArray(new Buffer(M))
        var temp=[M[3],M[1]]
        M[1]=temp[0]
        M[3]=temp[1]
        var out=this._doCryptBlock(M,this._invKeySchedule,G.INV_SUB_MIX,G.INV_SBOX)
        var buf=new Buffer(16)
        buf.writeUInt32BE(out[0],0)
        buf.writeUInt32BE(out[3],4)
        buf.writeUInt32BE(out[2],8)
        buf.writeUInt32BE(out[1],12)
        return buf}
    AES.prototype.scrub=function(){scrub_vec(this._keySchedule)
        scrub_vec(this._invKeySchedule)
        scrub_vec(this._key)}
    AES.prototype._doCryptBlock=function(M,keySchedule,SUB_MIX,SBOX){var ksRow,s0,s1,s2,s3,t0,t1,t2,t3
        s0=M[0]^keySchedule[0]
        s1=M[1]^keySchedule[1]
        s2=M[2]^keySchedule[2]
        s3=M[3]^keySchedule[3]
        ksRow=4
        for(var round=1;round<this._nRounds;round++){t0=SUB_MIX[0][s0>>>24]^SUB_MIX[1][(s1>>>16)&0xff]^SUB_MIX[2][(s2>>>8)&0xff]^SUB_MIX[3][s3&0xff]^keySchedule[ksRow++]
            t1=SUB_MIX[0][s1>>>24]^SUB_MIX[1][(s2>>>16)&0xff]^SUB_MIX[2][(s3>>>8)&0xff]^SUB_MIX[3][s0&0xff]^keySchedule[ksRow++]
            t2=SUB_MIX[0][s2>>>24]^SUB_MIX[1][(s3>>>16)&0xff]^SUB_MIX[2][(s0>>>8)&0xff]^SUB_MIX[3][s1&0xff]^keySchedule[ksRow++]
            t3=SUB_MIX[0][s3>>>24]^SUB_MIX[1][(s0>>>16)&0xff]^SUB_MIX[2][(s1>>>8)&0xff]^SUB_MIX[3][s2&0xff]^keySchedule[ksRow++]
            s0=t0
            s1=t1
            s2=t2
            s3=t3}
        t0=((SBOX[s0>>>24]<<24)|(SBOX[(s1>>>16)&0xff]<<16)|(SBOX[(s2>>>8)&0xff]<<8)|SBOX[s3&0xff])^keySchedule[ksRow++]
        t1=((SBOX[s1>>>24]<<24)|(SBOX[(s2>>>16)&0xff]<<16)|(SBOX[(s3>>>8)&0xff]<<8)|SBOX[s0&0xff])^keySchedule[ksRow++]
        t2=((SBOX[s2>>>24]<<24)|(SBOX[(s3>>>16)&0xff]<<16)|(SBOX[(s0>>>8)&0xff]<<8)|SBOX[s1&0xff])^keySchedule[ksRow++]
        t3=((SBOX[s3>>>24]<<24)|(SBOX[(s0>>>16)&0xff]<<16)|(SBOX[(s1>>>8)&0xff]<<8)|SBOX[s2&0xff])^keySchedule[ksRow++]
        return[fixup_uint32(t0),fixup_uint32(t1),fixup_uint32(t2),fixup_uint32(t3)]}
    exports.AES=AES}).call(this,require("buffer").Buffer)},{"buffer":111}],118:[function(require,module,exports){(function(Buffer){var aes=require('./aes')
    var Transform=require('./cipherBase')
    var inherits=require('inherits')
    var GHASH=require('./ghash')
    var xor=require('./xor')
    inherits(StreamCipher,Transform)
    module.exports=StreamCipher
    function StreamCipher(mode,key,iv,decrypt){if(!(this instanceof StreamCipher)){return new StreamCipher(mode,key,iv)}
        Transform.call(this)
        this._finID=Buffer.concat([iv,new Buffer([0,0,0,1])])
        iv=Buffer.concat([iv,new Buffer([0,0,0,2])])
        this._cipher=new aes.AES(key)
        this._prev=new Buffer(iv.length)
        this._cache=new Buffer('')
        this._secCache=new Buffer('')
        this._decrypt=decrypt
        this._alen=0
        this._len=0
        iv.copy(this._prev)
        this._mode=mode
        var h=new Buffer(4)
        h.fill(0)
        this._ghash=new GHASH(this._cipher.encryptBlock(h))
        this._authTag=null
        this._called=!1}
    StreamCipher.prototype._update=function(chunk){if(!this._called&&this._alen){var rump=16-(this._alen%16)
        if(rump<16){rump=new Buffer(rump)
            rump.fill(0)
            this._ghash.update(rump)}}
        this._called=!0
        var out=this._mode.encrypt(this,chunk)
        if(this._decrypt){this._ghash.update(chunk)}else{this._ghash.update(out)}
        this._len+=chunk.length
        return out}
    StreamCipher.prototype._final=function(){if(this._decrypt&&!this._authTag){throw new Error('Unsupported state or unable to authenticate data')}
        var tag=xor(this._ghash.final(this._alen*8,this._len*8),this._cipher.encryptBlock(this._finID))
        if(this._decrypt){if(xorTest(tag,this._authTag)){throw new Error('Unsupported state or unable to authenticate data')}}else{this._authTag=tag}
        this._cipher.scrub()}
    StreamCipher.prototype.getAuthTag=function getAuthTag(){if(!this._decrypt&&Buffer.isBuffer(this._authTag)){return this._authTag}else{throw new Error('Attempting to get auth tag in unsupported state')}}
    StreamCipher.prototype.setAuthTag=function setAuthTag(tag){if(this._decrypt){this._authTag=tag}else{throw new Error('Attempting to set auth tag in unsupported state')}}
    StreamCipher.prototype.setAAD=function setAAD(buf){if(!this._called){this._ghash.update(buf)
        this._alen+=buf.length}else{throw new Error('Attempting to set AAD in unsupported state')}}
    function xorTest(a,b){var out=0
        if(a.length!==b.length){out++}
        var len=Math.min(a.length,b.length)
        var i=-1
        while(++i<len){out+=(a[i]^b[i])}
        return out}}).call(this,require("buffer").Buffer)},{"./aes":117,"./cipherBase":120,"./ghash":123,"./xor":133,"buffer":111,"inherits":253}],119:[function(require,module,exports){var ciphers=require('./encrypter')
    exports.createCipher=exports.Cipher=ciphers.createCipher
    exports.createCipheriv=exports.Cipheriv=ciphers.createCipheriv
    var deciphers=require('./decrypter')
    exports.createDecipher=exports.Decipher=deciphers.createDecipher
    exports.createDecipheriv=exports.Decipheriv=deciphers.createDecipheriv
    var modes=require('./modes')
    function getCiphers(){return Object.keys(modes)}
    exports.listCiphers=exports.getCiphers=getCiphers},{"./decrypter":121,"./encrypter":122,"./modes":124}],120:[function(require,module,exports){(function(Buffer){var Transform=require('stream').Transform
    var inherits=require('inherits')
    module.exports=CipherBase
    inherits(CipherBase,Transform)
    function CipherBase(){Transform.call(this)}
    CipherBase.prototype.update=function(data,inputEnc,outputEnc){if(typeof data==='string'){data=new Buffer(data,inputEnc)}
        var outData=this._update(data)
        if(outputEnc){outData=outData.toString(outputEnc)}
        return outData}
    CipherBase.prototype._transform=function(data,_,next){this.push(this._update(data))
        next()}
    CipherBase.prototype._flush=function(next){try{this.push(this._final())}catch(e){return next(e)}
        next()}
    CipherBase.prototype.final=function(outputEnc){var outData=this._final()||new Buffer('')
        if(outputEnc){outData=outData.toString(outputEnc)}
        return outData}}).call(this,require("buffer").Buffer)},{"buffer":111,"inherits":253,"stream":267}],121:[function(require,module,exports){(function(Buffer){var aes=require('./aes')
    var Transform=require('./cipherBase')
    var inherits=require('inherits')
    var modes=require('./modes')
    var StreamCipher=require('./streamCipher')
    var AuthCipher=require('./authCipher')
    var ebtk=require('./EVP_BytesToKey')
    inherits(Decipher,Transform)
    function Decipher(mode,key,iv){if(!(this instanceof Decipher)){return new Decipher(mode,key,iv)}
        Transform.call(this)
        this._cache=new Splitter()
        this._last=void 0
        this._cipher=new aes.AES(key)
        this._prev=new Buffer(iv.length)
        iv.copy(this._prev)
        this._mode=mode
        this._autopadding=!0}
    Decipher.prototype._update=function(data){this._cache.add(data)
        var chunk
        var thing
        var out=[]
        while((chunk=this._cache.get(this._autopadding))){thing=this._mode.decrypt(this,chunk)
            out.push(thing)}
        return Buffer.concat(out)}
    Decipher.prototype._final=function(){var chunk=this._cache.flush()
        if(this._autopadding){return unpad(this._mode.decrypt(this,chunk))}else if(chunk){throw new Error('data not multiple of block length')}}
    Decipher.prototype.setAutoPadding=function(setTo){this._autopadding=!!setTo}
    function Splitter(){if(!(this instanceof Splitter)){return new Splitter()}
        this.cache=new Buffer('')}
    Splitter.prototype.add=function(data){this.cache=Buffer.concat([this.cache,data])}
    Splitter.prototype.get=function(autoPadding){var out
        if(autoPadding){if(this.cache.length>16){out=this.cache.slice(0,16)
            this.cache=this.cache.slice(16)
            return out}}else{if(this.cache.length>=16){out=this.cache.slice(0,16)
            this.cache=this.cache.slice(16)
            return out}}
        return null}
    Splitter.prototype.flush=function(){if(this.cache.length){return this.cache}}
    function unpad(last){var padded=last[15]
        var i=-1
        while(++i<padded){if(last[(i+(16-padded))]!==padded){throw new Error('unable to decrypt data')}}
        if(padded===16){return}
        return last.slice(0,16-padded)}
    var modelist={ECB:require('./modes/ecb'),CBC:require('./modes/cbc'),CFB:require('./modes/cfb'),CFB8:require('./modes/cfb8'),CFB1:require('./modes/cfb1'),OFB:require('./modes/ofb'),CTR:require('./modes/ctr'),GCM:require('./modes/ctr')}
    function createDecipheriv(suite,password,iv){var config=modes[suite.toLowerCase()]
        if(!config){throw new TypeError('invalid suite type')}
        if(typeof iv==='string'){iv=new Buffer(iv)}
        if(typeof password==='string'){password=new Buffer(password)}
        if(password.length!==config.key/8){throw new TypeError('invalid key length '+password.length)}
        if(iv.length!==config.iv){throw new TypeError('invalid iv length '+iv.length)}
        if(config.type==='stream'){return new StreamCipher(modelist[config.mode],password,iv,!0)}else if(config.type==='auth'){return new AuthCipher(modelist[config.mode],password,iv,!0)}
        return new Decipher(modelist[config.mode],password,iv)}
    function createDecipher(suite,password){var config=modes[suite.toLowerCase()]
        if(!config){throw new TypeError('invalid suite type')}
        var keys=ebtk(password,config.key,config.iv)
        return createDecipheriv(suite,keys.key,keys.iv)}
    exports.createDecipher=createDecipher
    exports.createDecipheriv=createDecipheriv}).call(this,require("buffer").Buffer)},{"./EVP_BytesToKey":116,"./aes":117,"./authCipher":118,"./cipherBase":120,"./modes":124,"./modes/cbc":125,"./modes/cfb":126,"./modes/cfb1":127,"./modes/cfb8":128,"./modes/ctr":129,"./modes/ecb":130,"./modes/ofb":131,"./streamCipher":132,"buffer":111,"inherits":253}],122:[function(require,module,exports){(function(Buffer){var aes=require('./aes')
    var Transform=require('./cipherBase')
    var inherits=require('inherits')
    var modes=require('./modes')
    var ebtk=require('./EVP_BytesToKey')
    var StreamCipher=require('./streamCipher')
    var AuthCipher=require('./authCipher')
    inherits(Cipher,Transform)
    function Cipher(mode,key,iv){if(!(this instanceof Cipher)){return new Cipher(mode,key,iv)}
        Transform.call(this)
        this._cache=new Splitter()
        this._cipher=new aes.AES(key)
        this._prev=new Buffer(iv.length)
        iv.copy(this._prev)
        this._mode=mode
        this._autopadding=!0}
    Cipher.prototype._update=function(data){this._cache.add(data)
        var chunk
        var thing
        var out=[]
        while((chunk=this._cache.get())){thing=this._mode.encrypt(this,chunk)
            out.push(thing)}
        return Buffer.concat(out)}
    Cipher.prototype._final=function(){var chunk=this._cache.flush()
        if(this._autopadding){chunk=this._mode.encrypt(this,chunk)
            this._cipher.scrub()
            return chunk}else if(chunk.toString('hex')!=='10101010101010101010101010101010'){this._cipher.scrub()
            throw new Error('data not multiple of block length')}}
    Cipher.prototype.setAutoPadding=function(setTo){this._autopadding=!!setTo}
    function Splitter(){if(!(this instanceof Splitter)){return new Splitter()}
        this.cache=new Buffer('')}
    Splitter.prototype.add=function(data){this.cache=Buffer.concat([this.cache,data])}
    Splitter.prototype.get=function(){if(this.cache.length>15){var out=this.cache.slice(0,16)
        this.cache=this.cache.slice(16)
        return out}
        return null}
    Splitter.prototype.flush=function(){var len=16-this.cache.length
        var padBuff=new Buffer(len)
        var i=-1
        while(++i<len){padBuff.writeUInt8(len,i)}
        var out=Buffer.concat([this.cache,padBuff])
        return out}
    var modelist={ECB:require('./modes/ecb'),CBC:require('./modes/cbc'),CFB:require('./modes/cfb'),CFB8:require('./modes/cfb8'),CFB1:require('./modes/cfb1'),OFB:require('./modes/ofb'),CTR:require('./modes/ctr'),GCM:require('./modes/ctr')}
    function createCipheriv(suite,password,iv){var config=modes[suite.toLowerCase()]
        if(!config){throw new TypeError('invalid suite type')}
        if(typeof iv==='string'){iv=new Buffer(iv)}
        if(typeof password==='string'){password=new Buffer(password)}
        if(password.length!==config.key/8){throw new TypeError('invalid key length '+password.length)}
        if(iv.length!==config.iv){throw new TypeError('invalid iv length '+iv.length)}
        if(config.type==='stream'){return new StreamCipher(modelist[config.mode],password,iv)}else if(config.type==='auth'){return new AuthCipher(modelist[config.mode],password,iv)}
        return new Cipher(modelist[config.mode],password,iv)}
    function createCipher(suite,password){var config=modes[suite.toLowerCase()]
        if(!config){throw new TypeError('invalid suite type')}
        var keys=ebtk(password,config.key,config.iv)
        return createCipheriv(suite,keys.key,keys.iv)}
    exports.createCipheriv=createCipheriv
    exports.createCipher=createCipher}).call(this,require("buffer").Buffer)},{"./EVP_BytesToKey":116,"./aes":117,"./authCipher":118,"./cipherBase":120,"./modes":124,"./modes/cbc":125,"./modes/cfb":126,"./modes/cfb1":127,"./modes/cfb8":128,"./modes/ctr":129,"./modes/ecb":130,"./modes/ofb":131,"./streamCipher":132,"buffer":111,"inherits":253}],123:[function(require,module,exports){(function(Buffer){var zeros=new Buffer(16)
    zeros.fill(0)
    module.exports=GHASH
    function GHASH(key){this.h=key
        this.state=new Buffer(16)
        this.state.fill(0)
        this.cache=new Buffer('')}
    GHASH.prototype.ghash=function(block){var i=-1
        while(++i<block.length){this.state[i]^=block[i]}
        this._multiply()}
    GHASH.prototype._multiply=function(){var Vi=toArray(this.h)
        var Zi=[0,0,0,0]
        var j,xi,lsb_Vi
        var i=-1
        while(++i<128){xi=(this.state[~~(i/8)]&(1<<(7-i%8)))!==0
            if(xi){Zi=xor(Zi,Vi)}
            lsb_Vi=(Vi[3]&1)!==0
            for(j=3;j>0;j--){Vi[j]=(Vi[j]>>>1)|((Vi[j-1]&1)<<31)}
            Vi[0]=Vi[0]>>>1
            if(lsb_Vi){Vi[0]=Vi[0]^(0xe1<<24)}}
        this.state=fromArray(Zi)}
    GHASH.prototype.update=function(buf){this.cache=Buffer.concat([this.cache,buf])
        var chunk
        while(this.cache.length>=16){chunk=this.cache.slice(0,16)
            this.cache=this.cache.slice(16)
            this.ghash(chunk)}}
    GHASH.prototype.final=function(abl,bl){if(this.cache.length){this.ghash(Buffer.concat([this.cache,zeros],16))}
        this.ghash(fromArray([0,abl,0,bl]))
        return this.state}
    function toArray(buf){return[buf.readUInt32BE(0),buf.readUInt32BE(4),buf.readUInt32BE(8),buf.readUInt32BE(12)]}
    function fromArray(out){out=out.map(fixup_uint32)
        var buf=new Buffer(16)
        buf.writeUInt32BE(out[0],0)
        buf.writeUInt32BE(out[1],4)
        buf.writeUInt32BE(out[2],8)
        buf.writeUInt32BE(out[3],12)
        return buf}
    var uint_max=Math.pow(2,32)
    function fixup_uint32(x){var ret,x_pos
        ret=x>uint_max||x<0?(x_pos=Math.abs(x)%uint_max,x<0?uint_max-x_pos:x_pos):x
        return ret}
    function xor(a,b){return[a[0]^b[0],a[1]^b[1],a[2]^b[2],a[3]^b[3]]}}).call(this,require("buffer").Buffer)},{"buffer":111}],124:[function(require,module,exports){exports['aes-128-ecb']={cipher:'AES',key:128,iv:0,mode:'ECB',type:'block'}
    exports['aes-192-ecb']={cipher:'AES',key:192,iv:0,mode:'ECB',type:'block'}
    exports['aes-256-ecb']={cipher:'AES',key:256,iv:0,mode:'ECB',type:'block'}
    exports['aes-128-cbc']={cipher:'AES',key:128,iv:16,mode:'CBC',type:'block'}
    exports['aes-192-cbc']={cipher:'AES',key:192,iv:16,mode:'CBC',type:'block'}
    exports['aes-256-cbc']={cipher:'AES',key:256,iv:16,mode:'CBC',type:'block'}
    exports.aes128=exports['aes-128-cbc']
    exports.aes192=exports['aes-192-cbc']
    exports.aes256=exports['aes-256-cbc']
    exports['aes-128-cfb']={cipher:'AES',key:128,iv:16,mode:'CFB',type:'stream'}
    exports['aes-192-cfb']={cipher:'AES',key:192,iv:16,mode:'CFB',type:'stream'}
    exports['aes-256-cfb']={cipher:'AES',key:256,iv:16,mode:'CFB',type:'stream'}
    exports['aes-128-cfb8']={cipher:'AES',key:128,iv:16,mode:'CFB8',type:'stream'}
    exports['aes-192-cfb8']={cipher:'AES',key:192,iv:16,mode:'CFB8',type:'stream'}
    exports['aes-256-cfb8']={cipher:'AES',key:256,iv:16,mode:'CFB8',type:'stream'}
    exports['aes-128-cfb1']={cipher:'AES',key:128,iv:16,mode:'CFB1',type:'stream'}
    exports['aes-192-cfb1']={cipher:'AES',key:192,iv:16,mode:'CFB1',type:'stream'}
    exports['aes-256-cfb1']={cipher:'AES',key:256,iv:16,mode:'CFB1',type:'stream'}
    exports['aes-128-ofb']={cipher:'AES',key:128,iv:16,mode:'OFB',type:'stream'}
    exports['aes-192-ofb']={cipher:'AES',key:192,iv:16,mode:'OFB',type:'stream'}
    exports['aes-256-ofb']={cipher:'AES',key:256,iv:16,mode:'OFB',type:'stream'}
    exports['aes-128-ctr']={cipher:'AES',key:128,iv:16,mode:'CTR',type:'stream'}
    exports['aes-192-ctr']={cipher:'AES',key:192,iv:16,mode:'CTR',type:'stream'}
    exports['aes-256-ctr']={cipher:'AES',key:256,iv:16,mode:'CTR',type:'stream'}
    exports['aes-128-gcm']={cipher:'AES',key:128,iv:12,mode:'GCM',type:'auth'}
    exports['aes-192-gcm']={cipher:'AES',key:192,iv:12,mode:'GCM',type:'auth'}
    exports['aes-256-gcm']={cipher:'AES',key:256,iv:12,mode:'GCM',type:'auth'}},{}],125:[function(require,module,exports){var xor=require('../xor')
    exports.encrypt=function(self,block){var data=xor(block,self._prev)
        self._prev=self._cipher.encryptBlock(data)
        return self._prev}
    exports.decrypt=function(self,block){var pad=self._prev
        self._prev=block
        var out=self._cipher.decryptBlock(block)
        return xor(out,pad)}},{"../xor":133}],126:[function(require,module,exports){(function(Buffer){var xor=require('../xor')
    exports.encrypt=function(self,data,decrypt){var out=new Buffer('')
        var len
        while(data.length){if(self._cache.length===0){self._cache=self._cipher.encryptBlock(self._prev)
            self._prev=new Buffer('')}
            if(self._cache.length<=data.length){len=self._cache.length
                out=Buffer.concat([out,encryptStart(self,data.slice(0,len),decrypt)])
                data=data.slice(len)}else{out=Buffer.concat([out,encryptStart(self,data,decrypt)])
                break}}
        return out}
    function encryptStart(self,data,decrypt){var len=data.length
        var out=xor(data,self._cache)
        self._cache=self._cache.slice(len)
        self._prev=Buffer.concat([self._prev,decrypt?data:out])
        return out}}).call(this,require("buffer").Buffer)},{"../xor":133,"buffer":111}],127:[function(require,module,exports){(function(Buffer){function encryptByte(self,byteParam,decrypt){var pad
    var i=-1
    var len=8
    var out=0
    var bit,value
    while(++i<len){pad=self._cipher.encryptBlock(self._prev)
        bit=(byteParam&(1<<(7-i)))?0x80:0
        value=pad[0]^bit
        out+=((value&0x80)>>(i%8))
        self._prev=shiftIn(self._prev,decrypt?bit:value)}
    return out}
    exports.encrypt=function(self,chunk,decrypt){var len=chunk.length
        var out=new Buffer(len)
        var i=-1
        while(++i<len){out[i]=encryptByte(self,chunk[i],decrypt)}
        return out}
    function shiftIn(buffer,value){var len=buffer.length
        var i=-1
        var out=new Buffer(buffer.length)
        buffer=Buffer.concat([buffer,new Buffer([value])])
        while(++i<len){out[i]=buffer[i]<<1|buffer[i+1]>>(7)}
        return out}}).call(this,require("buffer").Buffer)},{"buffer":111}],128:[function(require,module,exports){(function(Buffer){function encryptByte(self,byteParam,decrypt){var pad=self._cipher.encryptBlock(self._prev)
    var out=pad[0]^byteParam
    self._prev=Buffer.concat([self._prev.slice(1),new Buffer([decrypt?byteParam:out])])
    return out}
    exports.encrypt=function(self,chunk,decrypt){var len=chunk.length
        var out=new Buffer(len)
        var i=-1
        while(++i<len){out[i]=encryptByte(self,chunk[i],decrypt)}
        return out}}).call(this,require("buffer").Buffer)},{"buffer":111}],129:[function(require,module,exports){(function(Buffer){var xor=require('../xor')
    function getBlock(self){var out=self._cipher.encryptBlock(self._prev)
        incr32(self._prev)
        return out}
    exports.encrypt=function(self,chunk){while(self._cache.length<chunk.length){self._cache=Buffer.concat([self._cache,getBlock(self)])}
        var pad=self._cache.slice(0,chunk.length)
        self._cache=self._cache.slice(chunk.length)
        return xor(chunk,pad)}
    function incr32(iv){var len=iv.length
        var item
        while(len--){item=iv.readUInt8(len)
            if(item===255){iv.writeUInt8(0,len)}else{item++
                iv.writeUInt8(item,len)
                break}}}}).call(this,require("buffer").Buffer)},{"../xor":133,"buffer":111}],130:[function(require,module,exports){exports.encrypt=function(self,block){return self._cipher.encryptBlock(block)}
    exports.decrypt=function(self,block){return self._cipher.decryptBlock(block)}},{}],131:[function(require,module,exports){(function(Buffer){var xor=require('../xor')
    function getBlock(self){self._prev=self._cipher.encryptBlock(self._prev)
        return self._prev}
    exports.encrypt=function(self,chunk){while(self._cache.length<chunk.length){self._cache=Buffer.concat([self._cache,getBlock(self)])}
        var pad=self._cache.slice(0,chunk.length)
        self._cache=self._cache.slice(chunk.length)
        return xor(chunk,pad)}}).call(this,require("buffer").Buffer)},{"../xor":133,"buffer":111}],132:[function(require,module,exports){(function(Buffer){var aes=require('./aes')
    var Transform=require('./cipherBase')
    var inherits=require('inherits')
    inherits(StreamCipher,Transform)
    module.exports=StreamCipher
    function StreamCipher(mode,key,iv,decrypt){if(!(this instanceof StreamCipher)){return new StreamCipher(mode,key,iv)}
        Transform.call(this)
        this._cipher=new aes.AES(key)
        this._prev=new Buffer(iv.length)
        this._cache=new Buffer('')
        this._secCache=new Buffer('')
        this._decrypt=decrypt
        iv.copy(this._prev)
        this._mode=mode}
    StreamCipher.prototype._update=function(chunk){return this._mode.encrypt(this,chunk,this._decrypt)}
    StreamCipher.prototype._final=function(){this._cipher.scrub()}}).call(this,require("buffer").Buffer)},{"./aes":117,"./cipherBase":120,"buffer":111,"inherits":253}],133:[function(require,module,exports){(function(Buffer){module.exports=xor
    function xor(a,b){var len=Math.min(a.length,b.length)
        var out=new Buffer(len)
        var i=-1
        while(++i<len){out.writeUInt8(a[i]^b[i],i)}
        return out}}).call(this,require("buffer").Buffer)},{"buffer":111}],134:[function(require,module,exports){(function(Buffer){'use strict'
    exports['RSA-SHA224']=exports.sha224WithRSAEncryption={sign:'rsa',hash:'sha224',id:new Buffer('302d300d06096086480165030402040500041c','hex')}
    exports['RSA-SHA256']=exports.sha256WithRSAEncryption={sign:'rsa',hash:'sha256',id:new Buffer('3031300d060960864801650304020105000420','hex')}
    exports['RSA-SHA384']=exports.sha384WithRSAEncryption={sign:'rsa',hash:'sha384',id:new Buffer('3041300d060960864801650304020205000430','hex')}
    exports['RSA-SHA512']=exports.sha512WithRSAEncryption={sign:'rsa',hash:'sha512',id:new Buffer('3051300d060960864801650304020305000440','hex')}
    exports['RSA-SHA1']={sign:'rsa',hash:'sha1',id:new Buffer('3021300906052b0e03021a05000414','hex')}
    exports['ecdsa-with-SHA1']={sign:'ecdsa',hash:'sha1',id:new Buffer('','hex')}
    exports.DSA=exports['DSA-SHA1']=exports['DSA-SHA']={sign:'dsa',hash:'sha1',id:new Buffer('','hex')}
    exports['DSA-SHA224']=exports['DSA-WITH-SHA224']={sign:'dsa',hash:'sha224',id:new Buffer('','hex')}
    exports['DSA-SHA256']=exports['DSA-WITH-SHA256']={sign:'dsa',hash:'sha256',id:new Buffer('','hex')}
    exports['DSA-SHA384']=exports['DSA-WITH-SHA384']={sign:'dsa',hash:'sha384',id:new Buffer('','hex')}
    exports['DSA-SHA512']=exports['DSA-WITH-SHA512']={sign:'dsa',hash:'sha512',id:new Buffer('','hex')}
    exports['DSA-RIPEMD160']={sign:'dsa',hash:'rmd160',id:new Buffer('','hex')}
    exports['RSA-RIPEMD160']=exports.ripemd160WithRSA={sign:'rsa',hash:'rmd160',id:new Buffer('3021300906052b2403020105000414','hex')}
    exports['RSA-MD5']=exports.md5WithRSAEncryption={sign:'rsa',hash:'md5',id:new Buffer('3020300c06082a864886f70d020505000410','hex')}}).call(this,require("buffer").Buffer)},{"buffer":111}],135:[function(require,module,exports){(function(Buffer){'use strict'
    var sign=require('./sign')
    var verify=require('./verify')
    var stream=require('stream')
    var inherits=require('inherits')
    var _algos=require('./algos')
    var createHash=require('create-hash')
    var algos={}
    Object.keys(_algos).forEach(function(key){algos[key]=algos[key.toLowerCase()]=_algos[key]})
    exports.createSign=exports.Sign=createSign
    function createSign(algorithm){return new Sign(algorithm)}
    exports.createVerify=exports.Verify=createVerify
    function createVerify(algorithm){return new Verify(algorithm)}
    inherits(Sign,stream.Writable)
    function Sign(algorithm){stream.Writable.call(this)
        var data=algos[algorithm]
        if(!data)
            throw new Error('Unknown message digest')
        this._hashType=data.hash
        this._hash=createHash(data.hash)
        this._tag=data.id
        this._signType=data.sign}
    Sign.prototype._write=function _write(data,_,done){this._hash.update(data)
        done()}
    Sign.prototype.update=function update(data,enc){if(typeof data==='string')
        data=new Buffer(data,enc)
        this._hash.update(data)
        return this}
    Sign.prototype.sign=function signMethod(key,enc){this.end()
        var hash=this._hash.digest()
        var sig=sign(Buffer.concat([this._tag,hash]),key,this._hashType,this._signType)
        if(enc){sig=sig.toString(enc)}
        return sig}
    inherits(Verify,stream.Writable)
    function Verify(algorithm){stream.Writable.call(this)
        var data=algos[algorithm]
        if(!data)
            throw new Error('Unknown message digest')
        this._hash=createHash(data.hash)
        this._tag=data.id
        this._signType=data.sign}
    Verify.prototype._write=function _write(data,_,done){this._hash.update(data)
        done()}
    Verify.prototype.update=function update(data,enc){if(typeof data==='string')
        data=new Buffer(data,enc)
        this._hash.update(data)
        return this}
    Verify.prototype.verify=function verifyMethod(key,sig,enc){this.end()
        var hash=this._hash.digest()
        if(typeof sig==='string')
            sig=new Buffer(sig,enc)
        return verify(sig,Buffer.concat([this._tag,hash]),key,this._signType)}}).call(this,require("buffer").Buffer)},{"./algos":134,"./sign":178,"./verify":179,"buffer":111,"create-hash":204,"inherits":253,"stream":267}],136:[function(require,module,exports){'use strict'
    exports['1.3.132.0.10']='secp256k1'
    exports['1.3.132.0.33']='p224'
    exports['1.2.840.10045.3.1.1']='p192'
    exports['1.2.840.10045.3.1.7']='p256'},{}],137:[function(require,module,exports){(function(module,exports){'use strict';function assert(val,msg){if(!val)
    throw new Error(msg||'Assertion failed')}
    function inherits(ctor,superCtor){ctor.super_=superCtor;var TempCtor=function(){};TempCtor.prototype=superCtor.prototype;ctor.prototype=new TempCtor();ctor.prototype.constructor=ctor}
    function BN(number,base,endian){if(number!==null&&typeof number==='object'&&Array.isArray(number.words)){return number}
        this.sign=!1;this.words=null;this.length=0;this.red=null;if(base==='le'||base==='be'){endian=base;base=10}
        if(number!==null)
            this._init(number||0,base||10,endian||'be')}
    if(typeof module==='object')
        module.exports=BN;else exports.BN=BN;BN.BN=BN;BN.wordSize=26;BN.prototype._init=function init(number,base,endian){if(typeof number==='number'){if(number<0){this.sign=!0;number=-number}
        if(number<0x4000000){this.words=[number&0x3ffffff];this.length=1}else if(number<0x10000000000000){this.words=[number&0x3ffffff,(number/0x4000000)&0x3ffffff];this.length=2}else{assert(number<0x20000000000000);this.words=[number&0x3ffffff,(number/0x4000000)&0x3ffffff,1];this.length=3}
        return}else if(typeof number==='object'){return this._initArray(number,base,endian)}
        if(base==='hex')
            base=16;assert(base===(base|0)&&base>=2&&base<=36);number=number.toString().replace(/\s+/g,'');var start=0;if(number[0]==='-')
            start++;if(base===16)
            this._parseHex(number,start);else this._parseBase(number,base,start);if(number[0]==='-')
            this.sign=!0;this.strip()};BN.prototype._initArray=function _initArray(number,base,endian){assert(typeof number.length==='number');if(number.length<=0){this.words=[0];this.length=1;return this}
        this.length=Math.ceil(number.length/3);this.words=new Array(this.length);for(var i=0;i<this.length;i++)
            this.words[i]=0;var off=0;if(endian==='be'){for(var i=number.length-1,j=0;i>=0;i-=3){var w=number[i]|(number[i-1]<<8)|(number[i-2]<<16);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]=(w>>>(26-off))&0x3ffffff;off+=24;if(off>=26){off-=26;j++}}}else if(endian==='le'){for(var i=0,j=0;i<number.length;i+=3){var w=number[i]|(number[i+1]<<8)|(number[i+2]<<16);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]=(w>>>(26-off))&0x3ffffff;off+=24;if(off>=26){off-=26;j++}}}
        return this.strip()};function parseHex(str,start,end){var r=0;var len=Math.min(str.length,end);for(var i=start;i<len;i++){var c=str.charCodeAt(i)-48;r<<=4;if(c>=49&&c<=54)
        r|=c-49+0xa;else if(c>=17&&c<=22)
        r|=c-17+0xa;else r|=c&0xf}
        return r}
    BN.prototype._parseHex=function _parseHex(number,start){this.length=Math.ceil((number.length-start)/6);this.words=new Array(this.length);for(var i=0;i<this.length;i++)
        this.words[i]=0;var off=0;for(var i=number.length-6,j=0;i>=start;i-=6){var w=parseHex(number,i,i+6);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]|=w>>>(26-off)&0x3fffff;off+=24;if(off>=26){off-=26;j++}}
        if(i+6!==start){var w=parseHex(number,start,i+6);this.words[j]|=(w<<off)&0x3ffffff;this.words[j+1]|=w>>>(26-off)&0x3fffff}
        this.strip()};function parseBase(str,start,end,mul){var r=0;var len=Math.min(str.length,end);for(var i=start;i<len;i++){var c=str.charCodeAt(i)-48;r*=mul;if(c>=49)
        r+=c-49+0xa;else if(c>=17)
        r+=c-17+0xa;else r+=c}
        return r}
    BN.prototype._parseBase=function _parseBase(number,base,start){this.words=[0];this.length=1;for(var limbLen=0,limbPow=1;limbPow<=0x3ffffff;limbPow*=base)
        limbLen++;limbLen--;limbPow=(limbPow/base)|0;var total=number.length-start;var mod=total%limbLen;var end=Math.min(total,total-mod)+start;var word=0;for(var i=start;i<end;i+=limbLen){word=parseBase(number,i,i+limbLen,base);this.imuln(limbPow);if(this.words[0]+word<0x4000000)
        this.words[0]+=word;else this._iaddn(word)}
        if(mod!==0){var pow=1;var word=parseBase(number,i,number.length,base);for(var i=0;i<mod;i++)
            pow*=base;this.imuln(pow);if(this.words[0]+word<0x4000000)
            this.words[0]+=word;else this._iaddn(word)}};BN.prototype.copy=function copy(dest){dest.words=new Array(this.length);for(var i=0;i<this.length;i++)
        dest.words[i]=this.words[i];dest.length=this.length;dest.sign=this.sign;dest.red=this.red};BN.prototype.clone=function clone(){var r=new BN(null);this.copy(r);return r};BN.prototype.strip=function strip(){while(this.length>1&&this.words[this.length-1]===0)
        this.length--;return this._normSign()};BN.prototype._normSign=function _normSign(){if(this.length===1&&this.words[0]===0)
        this.sign=!1;return this};BN.prototype.inspect=function inspect(){return(this.red?'<BN-R: ':'<BN: ')+this.toString(16)+'>'};var zeros=['','0','00','000','0000','00000','000000','0000000','00000000','000000000','0000000000','00000000000','000000000000','0000000000000','00000000000000','000000000000000','0000000000000000','00000000000000000','000000000000000000','0000000000000000000','00000000000000000000','000000000000000000000','0000000000000000000000','00000000000000000000000','000000000000000000000000','0000000000000000000000000'];var groupSizes=[0,0,25,16,12,11,10,9,8,8,7,7,7,7,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5];var groupBases=[0,0,33554432,43046721,16777216,48828125,60466176,40353607,16777216,43046721,10000000,19487171,35831808,62748517,7529536,11390625,16777216,24137569,34012224,47045881,64000000,4084101,5153632,6436343,7962624,9765625,11881376,14348907,17210368,20511149,24300000,28629151,33554432,39135393,45435424,52521875,60466176];BN.prototype.toString=function toString(base,padding){base=base||10;if(base===16||base==='hex'){var out='';var off=0;var padding=padding|0||1;var carry=0;for(var i=0;i<this.length;i++){var w=this.words[i];var word=(((w<<off)|carry)&0xffffff).toString(16);carry=(w>>>(24-off))&0xffffff;if(carry!==0||i!==this.length-1)
        out=zeros[6-word.length]+word+out;else out=word+out;off+=2;if(off>=26){off-=26;i--}}
        if(carry!==0)
            out=carry.toString(16)+out;while(out.length%padding!==0)
            out='0'+out;if(this.sign)
            out='-'+out;return out}else if(base===(base|0)&&base>=2&&base<=36){var groupSize=groupSizes[base];var groupBase=groupBases[base];var out='';var c=this.clone();c.sign=!1;while(c.cmpn(0)!==0){var r=c.modn(groupBase).toString(base);c=c.idivn(groupBase);if(c.cmpn(0)!==0)
        out=zeros[groupSize-r.length]+r+out;else out=r+out}
        if(this.cmpn(0)===0)
            out='0'+out;if(this.sign)
            out='-'+out;return out}else{assert(!1,'Base should be between 2 and 36')}};BN.prototype.toJSON=function toJSON(){return this.toString(16)};BN.prototype.toArray=function toArray(){this.strip();var res=new Array(this.byteLength());res[0]=0;var q=this.clone();for(var i=0;q.cmpn(0)!==0;i++){var b=q.andln(0xff);q.ishrn(8);res[res.length-i-1]=b}
        return res};if(Math.clz32){BN.prototype._countBits=function _countBits(w){return 32-Math.clz32(w)}}else{BN.prototype._countBits=function _countBits(w){var t=w;var r=0;if(t>=0x1000){r+=13;t>>>=13}
        if(t>=0x40){r+=7;t>>>=7}
        if(t>=0x8){r+=4;t>>>=4}
        if(t>=0x02){r+=2;t>>>=2}
        return r+t}}
    BN.prototype._zeroBits=function _zeroBits(w){if(w===0)
        return 26;var t=w;var r=0;if((t&0x1fff)===0){r+=13;t>>>=13}
        if((t&0x7f)===0){r+=7;t>>>=7}
        if((t&0xf)===0){r+=4;t>>>=4}
        if((t&0x3)===0){r+=2;t>>>=2}
        if((t&0x1)===0)
            r++;return r};BN.prototype.bitLength=function bitLength(){var hi=0;var w=this.words[this.length-1];var hi=this._countBits(w);return(this.length-1)*26+hi};BN.prototype.zeroBits=function zeroBits(){if(this.cmpn(0)===0)
        return 0;var r=0;for(var i=0;i<this.length;i++){var b=this._zeroBits(this.words[i]);r+=b;if(b!==26)
        break}
        return r};BN.prototype.byteLength=function byteLength(){return Math.ceil(this.bitLength()/8)};BN.prototype.neg=function neg(){if(this.cmpn(0)===0)
        return this.clone();var r=this.clone();r.sign=!this.sign;return r};BN.prototype.ior=function ior(num){this.sign=this.sign||num.sign;while(this.length<num.length)
        this.words[this.length++]=0;for(var i=0;i<num.length;i++)
        this.words[i]=this.words[i]|num.words[i];return this.strip()};BN.prototype.or=function or(num){if(this.length>num.length)
        return this.clone().ior(num);else return num.clone().ior(this)};BN.prototype.iand=function iand(num){this.sign=this.sign&&num.sign;var b;if(this.length>num.length)
        b=num;else b=this;for(var i=0;i<b.length;i++)
        this.words[i]=this.words[i]&num.words[i];this.length=b.length;return this.strip()};BN.prototype.and=function and(num){if(this.length>num.length)
        return this.clone().iand(num);else return num.clone().iand(this)};BN.prototype.ixor=function ixor(num){this.sign=this.sign||num.sign;var a;var b;if(this.length>num.length){a=this;b=num}else{a=num;b=this}
        for(var i=0;i<b.length;i++)
            this.words[i]=a.words[i]^b.words[i];if(this!==a)
            for(;i<a.length;i++)
                this.words[i]=a.words[i];this.length=a.length;return this.strip()};BN.prototype.xor=function xor(num){if(this.length>num.length)
        return this.clone().ixor(num);else return num.clone().ixor(this)};BN.prototype.setn=function setn(bit,val){assert(typeof bit==='number'&&bit>=0);var off=(bit/26)|0;var wbit=bit%26;while(this.length<=off)
        this.words[this.length++]=0;if(val)
        this.words[off]=this.words[off]|(1<<wbit);else this.words[off]=this.words[off]&~(1<<wbit);return this.strip()};BN.prototype.iadd=function iadd(num){if(this.sign&&!num.sign){this.sign=!1;var r=this.isub(num);this.sign=!this.sign;return this._normSign()}else if(!this.sign&&num.sign){num.sign=!1;var r=this.isub(num);num.sign=!0;return r._normSign()}
        var a;var b;if(this.length>num.length){a=this;b=num}else{a=num;b=this}
        var carry=0;for(var i=0;i<b.length;i++){var r=a.words[i]+b.words[i]+carry;this.words[i]=r&0x3ffffff;carry=r>>>26}
        for(;carry!==0&&i<a.length;i++){var r=a.words[i]+carry;this.words[i]=r&0x3ffffff;carry=r>>>26}
        this.length=a.length;if(carry!==0){this.words[this.length]=carry;this.length++}else if(a!==this){for(;i<a.length;i++)
            this.words[i]=a.words[i]}
        return this};BN.prototype.add=function add(num){if(num.sign&&!this.sign){num.sign=!1;var res=this.sub(num);num.sign=!0;return res}else if(!num.sign&&this.sign){this.sign=!1;var res=num.sub(this);this.sign=!0;return res}
        if(this.length>num.length)
            return this.clone().iadd(num);else return num.clone().iadd(this)};BN.prototype.isub=function isub(num){if(num.sign){num.sign=!1;var r=this.iadd(num);num.sign=!0;return r._normSign()}else if(this.sign){this.sign=!1;this.iadd(num);this.sign=!0;return this._normSign()}
        var cmp=this.cmp(num);if(cmp===0){this.sign=!1;this.length=1;this.words[0]=0;return this}
        var a;var b;if(cmp>0){a=this;b=num}else{a=num;b=this}
        var carry=0;for(var i=0;i<b.length;i++){var r=a.words[i]-b.words[i]+carry;carry=r>>26;this.words[i]=r&0x3ffffff}
        for(;carry!==0&&i<a.length;i++){var r=a.words[i]+carry;carry=r>>26;this.words[i]=r&0x3ffffff}
        if(carry===0&&i<a.length&&a!==this)
            for(;i<a.length;i++)
                this.words[i]=a.words[i];this.length=Math.max(this.length,i);if(a!==this)
            this.sign=!0;return this.strip()};BN.prototype.sub=function sub(num){return this.clone().isub(num)};BN.prototype._smallMulTo=function _smallMulTo(num,out){out.sign=num.sign!==this.sign;out.length=this.length+num.length;var carry=0;for(var k=0;k<out.length-1;k++){var ncarry=carry>>>26;var rword=carry&0x3ffffff;var maxJ=Math.min(k,num.length-1);for(var j=Math.max(0,k-this.length+1);j<=maxJ;j++){var i=k-j;var a=this.words[i]|0;var b=num.words[j]|0;var r=a*b;var lo=r&0x3ffffff;ncarry=(ncarry+((r/0x4000000)|0))|0;lo=(lo+rword)|0;rword=lo&0x3ffffff;ncarry=(ncarry+(lo>>>26))|0}
        out.words[k]=rword;carry=ncarry}
        if(carry!==0){out.words[k]=carry}else{out.length--}
        return out.strip()};BN.prototype._bigMulTo=function _bigMulTo(num,out){out.sign=num.sign!==this.sign;out.length=this.length+num.length;var carry=0;var hncarry=0;for(var k=0;k<out.length-1;k++){var ncarry=hncarry;hncarry=0;var rword=carry&0x3ffffff;var maxJ=Math.min(k,num.length-1);for(var j=Math.max(0,k-this.length+1);j<=maxJ;j++){var i=k-j;var a=this.words[i]|0;var b=num.words[j]|0;var r=a*b;var lo=r&0x3ffffff;ncarry=(ncarry+((r/0x4000000)|0))|0;lo=(lo+rword)|0;rword=lo&0x3ffffff;ncarry=(ncarry+(lo>>>26))|0;hncarry+=ncarry>>>26;ncarry&=0x3ffffff}
        out.words[k]=rword;carry=ncarry;ncarry=hncarry}
        if(carry!==0){out.words[k]=carry}else{out.length--}
        return out.strip()};BN.prototype.mulTo=function mulTo(num,out){var res;if(this.length+num.length<63)
        res=this._smallMulTo(num,out);else res=this._bigMulTo(num,out);return res};BN.prototype.mul=function mul(num){var out=new BN(null);out.words=new Array(this.length+num.length);return this.mulTo(num,out)};BN.prototype.imul=function imul(num){if(this.cmpn(0)===0||num.cmpn(0)===0){this.words[0]=0;this.length=1;return this}
        var tlen=this.length;var nlen=num.length;this.sign=num.sign!==this.sign;this.length=this.length+num.length;this.words[this.length-1]=0;for(var k=this.length-2;k>=0;k--){var carry=0;var rword=0;var maxJ=Math.min(k,nlen-1);for(var j=Math.max(0,k-tlen+1);j<=maxJ;j++){var i=k-j;var a=this.words[i];var b=num.words[j];var r=a*b;var lo=r&0x3ffffff;carry+=(r/0x4000000)|0;lo+=rword;rword=lo&0x3ffffff;carry+=lo>>>26}
            this.words[k]=rword;this.words[k+1]+=carry;carry=0}
        var carry=0;for(var i=1;i<this.length;i++){var w=this.words[i]+carry;this.words[i]=w&0x3ffffff;carry=w>>>26}
        return this.strip()};BN.prototype.imuln=function imuln(num){assert(typeof num==='number');var carry=0;for(var i=0;i<this.length;i++){var w=this.words[i]*num;var lo=(w&0x3ffffff)+(carry&0x3ffffff);carry>>=26;carry+=(w/0x4000000)|0;carry+=lo>>>26;this.words[i]=lo&0x3ffffff}
        if(carry!==0){this.words[i]=carry;this.length++}
        return this};BN.prototype.sqr=function sqr(){return this.mul(this)};BN.prototype.isqr=function isqr(){return this.mul(this)};BN.prototype.ishln=function ishln(bits){assert(typeof bits==='number'&&bits>=0);var r=bits%26;var s=(bits-r)/26;var carryMask=(0x3ffffff>>>(26-r))<<(26-r);if(r!==0){var carry=0;for(var i=0;i<this.length;i++){var newCarry=this.words[i]&carryMask;var c=(this.words[i]-newCarry)<<r;this.words[i]=c|carry;carry=newCarry>>>(26-r)}
        if(carry){this.words[i]=carry;this.length++}}
        if(s!==0){for(var i=this.length-1;i>=0;i--)
            this.words[i+s]=this.words[i];for(var i=0;i<s;i++)
            this.words[i]=0;this.length+=s}
        return this.strip()};BN.prototype.ishrn=function ishrn(bits,hint,extended){assert(typeof bits==='number'&&bits>=0);var h;if(hint)
        h=(hint-(hint%26))/26;else h=0;var r=bits%26;var s=Math.min((bits-r)/26,this.length);var mask=0x3ffffff^((0x3ffffff>>>r)<<r);var maskedWords=extended;h-=s;h=Math.max(0,h);if(maskedWords){for(var i=0;i<s;i++)
        maskedWords.words[i]=this.words[i];maskedWords.length=s}
        if(s===0){}else if(this.length>s){this.length-=s;for(var i=0;i<this.length;i++)
            this.words[i]=this.words[i+s]}else{this.words[0]=0;this.length=1}
        var carry=0;for(var i=this.length-1;i>=0&&(carry!==0||i>=h);i--){var word=this.words[i];this.words[i]=(carry<<(26-r))|(word>>>r);carry=word&mask}
        if(maskedWords&&carry!==0)
            maskedWords.words[maskedWords.length++]=carry;if(this.length===0){this.words[0]=0;this.length=1}
        this.strip();return this};BN.prototype.shln=function shln(bits){return this.clone().ishln(bits)};BN.prototype.shrn=function shrn(bits){return this.clone().ishrn(bits)};BN.prototype.testn=function testn(bit){assert(typeof bit==='number'&&bit>=0);var r=bit%26;var s=(bit-r)/26;var q=1<<r;if(this.length<=s){return!1}
        var w=this.words[s];return!!(w&q)};BN.prototype.imaskn=function imaskn(bits){assert(typeof bits==='number'&&bits>=0);var r=bits%26;var s=(bits-r)/26;assert(!this.sign,'imaskn works only with positive numbers');if(r!==0)
        s++;this.length=Math.min(s,this.length);if(r!==0){var mask=0x3ffffff^((0x3ffffff>>>r)<<r);this.words[this.length-1]&=mask}
        return this.strip()};BN.prototype.maskn=function maskn(bits){return this.clone().imaskn(bits)};BN.prototype.iaddn=function iaddn(num){assert(typeof num==='number');if(num<0)
        return this.isubn(-num);if(this.sign){if(this.length===1&&this.words[0]<num){this.words[0]=num-this.words[0];this.sign=!1;return this}
        this.sign=!1;this.isubn(num);this.sign=!0;return this}
        return this._iaddn(num)};BN.prototype._iaddn=function _iaddn(num){this.words[0]+=num;for(var i=0;i<this.length&&this.words[i]>=0x4000000;i++){this.words[i]-=0x4000000;if(i===this.length-1)
        this.words[i+1]=1;else this.words[i+1]++}
        this.length=Math.max(this.length,i+1);return this};BN.prototype.isubn=function isubn(num){assert(typeof num==='number');if(num<0)
        return this.iaddn(-num);if(this.sign){this.sign=!1;this.iaddn(num);this.sign=!0;return this}
        this.words[0]-=num;for(var i=0;i<this.length&&this.words[i]<0;i++){this.words[i]+=0x4000000;this.words[i+1]-=1}
        return this.strip()};BN.prototype.addn=function addn(num){return this.clone().iaddn(num)};BN.prototype.subn=function subn(num){return this.clone().isubn(num)};BN.prototype.iabs=function iabs(){this.sign=!1;return this};BN.prototype.abs=function abs(){return this.clone().iabs()};BN.prototype._ishlnsubmul=function _ishlnsubmul(num,mul,shift){var len=num.length+shift;var i;if(this.words.length<len){var t=new Array(len);for(var i=0;i<this.length;i++)
        t[i]=this.words[i];this.words=t}else{i=this.length}
        this.length=Math.max(this.length,len);for(;i<this.length;i++)
            this.words[i]=0;var carry=0;for(var i=0;i<num.length;i++){var w=this.words[i+shift]+carry;var right=num.words[i]*mul;w-=right&0x3ffffff;carry=(w>>26)-((right/0x4000000)|0);this.words[i+shift]=w&0x3ffffff}
        for(;i<this.length-shift;i++){var w=this.words[i+shift]+carry;carry=w>>26;this.words[i+shift]=w&0x3ffffff}
        if(carry===0)
            return this.strip();assert(carry===-1);carry=0;for(var i=0;i<this.length;i++){var w=-this.words[i]+carry;carry=w>>26;this.words[i]=w&0x3ffffff}
        this.sign=!0;return this.strip()};BN.prototype._wordDiv=function _wordDiv(num,mode){var shift=this.length-num.length;var a=this.clone();var b=num;var bhi=b.words[b.length-1];var bhiBits=this._countBits(bhi);shift=26-bhiBits;if(shift!==0){b=b.shln(shift);a.ishln(shift);bhi=b.words[b.length-1]}
        var m=a.length-b.length;var q;if(mode!=='mod'){q=new BN(null);q.length=m+1;q.words=new Array(q.length);for(var i=0;i<q.length;i++)
            q.words[i]=0}
        var diff=a.clone()._ishlnsubmul(b,1,m);if(!diff.sign){a=diff;if(q)
            q.words[m]=1}
        for(var j=m-1;j>=0;j--){var qj=a.words[b.length+j]*0x4000000+a.words[b.length+j-1];qj=Math.min((qj/bhi)|0,0x3ffffff);a._ishlnsubmul(b,qj,j);while(a.sign){qj--;a.sign=!1;a._ishlnsubmul(b,1,j);if(a.cmpn(0)!==0)
            a.sign=!a.sign}
            if(q)
                q.words[j]=qj}
        if(q)
            q.strip();a.strip();if(mode!=='div'&&shift!==0)
            a.ishrn(shift);return{div:q?q:null,mod:a}};BN.prototype.divmod=function divmod(num,mode){assert(num.cmpn(0)!==0);if(this.sign&&!num.sign){var res=this.neg().divmod(num,mode);var div;var mod;if(mode!=='mod')
        div=res.div.neg();if(mode!=='div')
        mod=res.mod.cmpn(0)===0?res.mod:num.sub(res.mod);return{div:div,mod:mod}}else if(!this.sign&&num.sign){var res=this.divmod(num.neg(),mode);var div;if(mode!=='mod')
        div=res.div.neg();return{div:div,mod:res.mod}}else if(this.sign&&num.sign){return this.neg().divmod(num.neg(),mode)}
        if(num.length>this.length||this.cmp(num)<0)
            return{div:new BN(0),mod:this};if(num.length===1){if(mode==='div')
            return{div:this.divn(num.words[0]),mod:null};else if(mode==='mod')
            return{div:null,mod:new BN(this.modn(num.words[0]))};return{div:this.divn(num.words[0]),mod:new BN(this.modn(num.words[0]))}}
        return this._wordDiv(num,mode)};BN.prototype.div=function div(num){return this.divmod(num,'div').div};BN.prototype.mod=function mod(num){return this.divmod(num,'mod').mod};BN.prototype.divRound=function divRound(num){var dm=this.divmod(num);if(dm.mod.cmpn(0)===0)
        return dm.div;var mod=dm.div.sign?dm.mod.isub(num):dm.mod;var half=num.shrn(1);var r2=num.andln(1);var cmp=mod.cmp(half);if(cmp<0||r2===1&&cmp===0)
        return dm.div;return dm.div.sign?dm.div.isubn(1):dm.div.iaddn(1)};BN.prototype.modn=function modn(num){assert(num<=0x3ffffff);var p=(1<<26)%num;var acc=0;for(var i=this.length-1;i>=0;i--)
        acc=(p*acc+this.words[i])%num;return acc};BN.prototype.idivn=function idivn(num){assert(num<=0x3ffffff);var carry=0;for(var i=this.length-1;i>=0;i--){var w=this.words[i]+carry*0x4000000;this.words[i]=(w/num)|0;carry=w%num}
        return this.strip()};BN.prototype.divn=function divn(num){return this.clone().idivn(num)};BN.prototype.egcd=function egcd(p){assert(!p.sign);assert(p.cmpn(0)!==0);var x=this;var y=p.clone();if(x.sign)
        x=x.mod(p);else x=x.clone();var A=new BN(1);var B=new BN(0);var C=new BN(0);var D=new BN(1);var g=0;while(x.isEven()&&y.isEven()){x.ishrn(1);y.ishrn(1);++g}
        var yp=y.clone();var xp=x.clone();while(x.cmpn(0)!==0){while(x.isEven()){x.ishrn(1);if(A.isEven()&&B.isEven()){A.ishrn(1);B.ishrn(1)}else{A.iadd(yp).ishrn(1);B.isub(xp).ishrn(1)}}
            while(y.isEven()){y.ishrn(1);if(C.isEven()&&D.isEven()){C.ishrn(1);D.ishrn(1)}else{C.iadd(yp).ishrn(1);D.isub(xp).ishrn(1)}}
            if(x.cmp(y)>=0){x.isub(y);A.isub(C);B.isub(D)}else{y.isub(x);C.isub(A);D.isub(B)}}
        return{a:C,b:D,gcd:y.ishln(g)}};BN.prototype._invmp=function _invmp(p){assert(!p.sign);assert(p.cmpn(0)!==0);var a=this;var b=p.clone();if(a.sign)
        a=a.mod(p);else a=a.clone();var x1=new BN(1);var x2=new BN(0);var delta=b.clone();while(a.cmpn(1)>0&&b.cmpn(1)>0){while(a.isEven()){a.ishrn(1);if(x1.isEven())
        x1.ishrn(1);else x1.iadd(delta).ishrn(1)}
        while(b.isEven()){b.ishrn(1);if(x2.isEven())
            x2.ishrn(1);else x2.iadd(delta).ishrn(1)}
        if(a.cmp(b)>=0){a.isub(b);x1.isub(x2)}else{b.isub(a);x2.isub(x1)}}
        if(a.cmpn(1)===0)
            return x1;else return x2};BN.prototype.gcd=function gcd(num){if(this.cmpn(0)===0)
        return num.clone();if(num.cmpn(0)===0)
        return this.clone();var a=this.clone();var b=num.clone();a.sign=!1;b.sign=!1;for(var shift=0;a.isEven()&&b.isEven();shift++){a.ishrn(1);b.ishrn(1)}
        do{while(a.isEven())
            a.ishrn(1);while(b.isEven())
            b.ishrn(1);var r=a.cmp(b);if(r<0){var t=a;a=b;b=t}else if(r===0||b.cmpn(1)===0){break}
            a.isub(b)}while(!0);return b.ishln(shift)};BN.prototype.invm=function invm(num){return this.egcd(num).a.mod(num)};BN.prototype.isEven=function isEven(){return(this.words[0]&1)===0};BN.prototype.isOdd=function isOdd(){return(this.words[0]&1)===1};BN.prototype.andln=function andln(num){return this.words[0]&num};BN.prototype.bincn=function bincn(bit){assert(typeof bit==='number');var r=bit%26;var s=(bit-r)/26;var q=1<<r;if(this.length<=s){for(var i=this.length;i<s+1;i++)
        this.words[i]=0;this.words[s]|=q;this.length=s+1;return this}
        var carry=q;for(var i=s;carry!==0&&i<this.length;i++){var w=this.words[i];w+=carry;carry=w>>>26;w&=0x3ffffff;this.words[i]=w}
        if(carry!==0){this.words[i]=carry;this.length++}
        return this};BN.prototype.cmpn=function cmpn(num){var sign=num<0;if(sign)
        num=-num;if(this.sign&&!sign)
        return-1;else if(!this.sign&&sign)
        return 1;num&=0x3ffffff;this.strip();var res;if(this.length>1){res=1}else{var w=this.words[0];res=w===num?0:w<num?-1:1}
        if(this.sign)
            res=-res;return res};BN.prototype.cmp=function cmp(num){if(this.sign&&!num.sign)
        return-1;else if(!this.sign&&num.sign)
        return 1;var res=this.ucmp(num);if(this.sign)
        return-res;else return res};BN.prototype.ucmp=function ucmp(num){if(this.length>num.length)
        return 1;else if(this.length<num.length)
        return-1;var res=0;for(var i=this.length-1;i>=0;i--){var a=this.words[i];var b=num.words[i];if(a===b)
        continue;if(a<b)
        res=-1;else if(a>b)
        res=1;break}
        return res};BN.red=function red(num){return new Red(num)};BN.prototype.toRed=function toRed(ctx){assert(!this.red,'Already a number in reduction context');assert(!this.sign,'red works only with positives');return ctx.convertTo(this)._forceRed(ctx)};BN.prototype.fromRed=function fromRed(){assert(this.red,'fromRed works only with numbers in reduction context');return this.red.convertFrom(this)};BN.prototype._forceRed=function _forceRed(ctx){this.red=ctx;return this};BN.prototype.forceRed=function forceRed(ctx){assert(!this.red,'Already a number in reduction context');return this._forceRed(ctx)};BN.prototype.redAdd=function redAdd(num){assert(this.red,'redAdd works only with red numbers');return this.red.add(this,num)};BN.prototype.redIAdd=function redIAdd(num){assert(this.red,'redIAdd works only with red numbers');return this.red.iadd(this,num)};BN.prototype.redSub=function redSub(num){assert(this.red,'redSub works only with red numbers');return this.red.sub(this,num)};BN.prototype.redISub=function redISub(num){assert(this.red,'redISub works only with red numbers');return this.red.isub(this,num)};BN.prototype.redShl=function redShl(num){assert(this.red,'redShl works only with red numbers');return this.red.shl(this,num)};BN.prototype.redMul=function redMul(num){assert(this.red,'redMul works only with red numbers');this.red._verify2(this,num);return this.red.mul(this,num)};BN.prototype.redIMul=function redIMul(num){assert(this.red,'redMul works only with red numbers');this.red._verify2(this,num);return this.red.imul(this,num)};BN.prototype.redSqr=function redSqr(){assert(this.red,'redSqr works only with red numbers');this.red._verify1(this);return this.red.sqr(this)};BN.prototype.redISqr=function redISqr(){assert(this.red,'redISqr works only with red numbers');this.red._verify1(this);return this.red.isqr(this)};BN.prototype.redSqrt=function redSqrt(){assert(this.red,'redSqrt works only with red numbers');this.red._verify1(this);return this.red.sqrt(this)};BN.prototype.redInvm=function redInvm(){assert(this.red,'redInvm works only with red numbers');this.red._verify1(this);return this.red.invm(this)};BN.prototype.redNeg=function redNeg(){assert(this.red,'redNeg works only with red numbers');this.red._verify1(this);return this.red.neg(this)};BN.prototype.redPow=function redPow(num){assert(this.red&&!num.red,'redPow(normalNum)');this.red._verify1(this);return this.red.pow(this,num)};var primes={k256:null,p224:null,p192:null,p25519:null};function MPrime(name,p){this.name=name;this.p=new BN(p,16);this.n=this.p.bitLength();this.k=new BN(1).ishln(this.n).isub(this.p);this.tmp=this._tmp()}
    MPrime.prototype._tmp=function _tmp(){var tmp=new BN(null);tmp.words=new Array(Math.ceil(this.n/13));return tmp};MPrime.prototype.ireduce=function ireduce(num){var r=num;var rlen;do{this.split(r,this.tmp);r=this.imulK(r);r=r.iadd(this.tmp);rlen=r.bitLength()}while(rlen>this.n);var cmp=rlen<this.n?-1:r.ucmp(this.p);if(cmp===0){r.words[0]=0;r.length=1}else if(cmp>0){r.isub(this.p)}else{r.strip()}
        return r};MPrime.prototype.split=function split(input,out){input.ishrn(this.n,0,out)};MPrime.prototype.imulK=function imulK(num){return num.imul(this.k)};function K256(){MPrime.call(this,'k256','ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f')}
    inherits(K256,MPrime);K256.prototype.split=function split(input,output){var mask=0x3fffff;var outLen=Math.min(input.length,9);for(var i=0;i<outLen;i++)
        output.words[i]=input.words[i];output.length=outLen;if(input.length<=9){input.words[0]=0;input.length=1;return}
        var prev=input.words[9];output.words[output.length++]=prev&mask;for(var i=10;i<input.length;i++){var next=input.words[i];input.words[i-10]=((next&mask)<<4)|(prev>>>22);prev=next}
        input.words[i-10]=prev>>>22;input.length-=9};K256.prototype.imulK=function imulK(num){num.words[num.length]=0;num.words[num.length+1]=0;num.length+=2;var hi;var lo=0;for(var i=0;i<num.length;i++){var w=num.words[i];hi=w*0x40;lo+=w*0x3d1;hi+=(lo/0x4000000)|0;lo&=0x3ffffff;num.words[i]=lo;lo=hi}
        if(num.words[num.length-1]===0){num.length--;if(num.words[num.length-1]===0)
            num.length--}
        return num};function P224(){MPrime.call(this,'p224','ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001')}
    inherits(P224,MPrime);function P192(){MPrime.call(this,'p192','ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff')}
    inherits(P192,MPrime);function P25519(){MPrime.call(this,'25519','7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed')}
    inherits(P25519,MPrime);P25519.prototype.imulK=function imulK(num){var carry=0;for(var i=0;i<num.length;i++){var hi=num.words[i]*0x13+carry;var lo=hi&0x3ffffff;hi>>>=26;num.words[i]=lo;carry=hi}
        if(carry!==0)
            num.words[num.length++]=carry;return num};BN._prime=function prime(name){if(primes[name])
        return primes[name];var prime;if(name==='k256')
        prime=new K256();else if(name==='p224')
        prime=new P224();else if(name==='p192')
        prime=new P192();else if(name==='p25519')
        prime=new P25519();else throw new Error('Unknown prime '+name);primes[name]=prime;return prime};function Red(m){if(typeof m==='string'){var prime=BN._prime(m);this.m=prime.p;this.prime=prime}else{this.m=m;this.prime=null}}
    Red.prototype._verify1=function _verify1(a){assert(!a.sign,'red works only with positives');assert(a.red,'red works only with red numbers')};Red.prototype._verify2=function _verify2(a,b){assert(!a.sign&&!b.sign,'red works only with positives');assert(a.red&&a.red===b.red,'red works only with red numbers')};Red.prototype.imod=function imod(a){if(this.prime)
        return this.prime.ireduce(a)._forceRed(this);return a.mod(this.m)._forceRed(this)};Red.prototype.neg=function neg(a){var r=a.clone();r.sign=!r.sign;return r.iadd(this.m)._forceRed(this)};Red.prototype.add=function add(a,b){this._verify2(a,b);var res=a.add(b);if(res.cmp(this.m)>=0)
        res.isub(this.m);return res._forceRed(this)};Red.prototype.iadd=function iadd(a,b){this._verify2(a,b);var res=a.iadd(b);if(res.cmp(this.m)>=0)
        res.isub(this.m);return res};Red.prototype.sub=function sub(a,b){this._verify2(a,b);var res=a.sub(b);if(res.cmpn(0)<0)
        res.iadd(this.m);return res._forceRed(this)};Red.prototype.isub=function isub(a,b){this._verify2(a,b);var res=a.isub(b);if(res.cmpn(0)<0)
        res.iadd(this.m);return res};Red.prototype.shl=function shl(a,num){this._verify1(a);return this.imod(a.shln(num))};Red.prototype.imul=function imul(a,b){this._verify2(a,b);return this.imod(a.imul(b))};Red.prototype.mul=function mul(a,b){this._verify2(a,b);return this.imod(a.mul(b))};Red.prototype.isqr=function isqr(a){return this.imul(a,a)};Red.prototype.sqr=function sqr(a){return this.mul(a,a)};Red.prototype.sqrt=function sqrt(a){if(a.cmpn(0)===0)
        return a.clone();var mod3=this.m.andln(3);assert(mod3%2===1);if(mod3===3){var pow=this.m.add(new BN(1)).ishrn(2);var r=this.pow(a,pow);return r}
        var q=this.m.subn(1);var s=0;while(q.cmpn(0)!==0&&q.andln(1)===0){s++;q.ishrn(1)}
        assert(q.cmpn(0)!==0);var one=new BN(1).toRed(this);var nOne=one.redNeg();var lpow=this.m.subn(1).ishrn(1);var z=this.m.bitLength();z=new BN(2*z*z).toRed(this);while(this.pow(z,lpow).cmp(nOne)!==0)
            z.redIAdd(nOne);var c=this.pow(z,q);var r=this.pow(a,q.addn(1).ishrn(1));var t=this.pow(a,q);var m=s;while(t.cmp(one)!==0){var tmp=t;for(var i=0;tmp.cmp(one)!==0;i++)
            tmp=tmp.redSqr();assert(i<m);var b=this.pow(c,new BN(1).ishln(m-i-1));r=r.redMul(b);c=b.redSqr();t=t.redMul(c);m=i}
        return r};Red.prototype.invm=function invm(a){var inv=a._invmp(this.m);if(inv.sign){inv.sign=!1;return this.imod(inv).redNeg()}else{return this.imod(inv)}};Red.prototype.pow=function pow(a,num){var w=[];if(num.cmpn(0)===0)
        return new BN(1);var q=num.clone();while(q.cmpn(0)!==0){w.push(q.andln(1));q.ishrn(1)}
        var res=a;for(var i=0;i<w.length;i++,res=this.sqr(res))
            if(w[i]!==0)
                break;if(++i<w.length){for(var q=this.sqr(res);i<w.length;i++,q=this.sqr(q)){if(w[i]===0)
            continue;res=this.mul(res,q)}}
        return res};Red.prototype.convertTo=function convertTo(num){var r=num.mod(this.m);if(r===num)
        return r.clone();else return r};Red.prototype.convertFrom=function convertFrom(num){var res=num.clone();res.red=null;return res};BN.mont=function mont(num){return new Mont(num)};function Mont(m){Red.call(this,m);this.shift=this.m.bitLength();if(this.shift%26!==0)
        this.shift+=26-(this.shift%26);this.r=new BN(1).ishln(this.shift);this.r2=this.imod(this.r.sqr());this.rinv=this.r._invmp(this.m);this.minv=this.rinv.mul(this.r).isubn(1).div(this.m);this.minv.sign=!0;this.minv=this.minv.mod(this.r)}
    inherits(Mont,Red);Mont.prototype.convertTo=function convertTo(num){return this.imod(num.shln(this.shift))};Mont.prototype.convertFrom=function convertFrom(num){var r=this.imod(num.mul(this.rinv));r.red=null;return r};Mont.prototype.imul=function imul(a,b){if(a.cmpn(0)===0||b.cmpn(0)===0){a.words[0]=0;a.length=1;return a}
        var t=a.imul(b);var c=t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);var u=t.isub(c).ishrn(this.shift);var res=u;if(u.cmp(this.m)>=0)
            res=u.isub(this.m);else if(u.cmpn(0)<0)
            res=u.iadd(this.m);return res._forceRed(this)};Mont.prototype.mul=function mul(a,b){if(a.cmpn(0)===0||b.cmpn(0)===0)
        return new BN(0)._forceRed(this);var t=a.mul(b);var c=t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);var u=t.isub(c).ishrn(this.shift);var res=u;if(u.cmp(this.m)>=0)
        res=u.isub(this.m);else if(u.cmpn(0)<0)
        res=u.iadd(this.m);return res._forceRed(this)};Mont.prototype.invm=function invm(a){var res=this.imod(a._invmp(this.m).mul(this.r2));return res._forceRed(this)}})(typeof module==='undefined'||module,this)},{}],138:[function(require,module,exports){(function(Buffer){var bn=require('bn.js');var randomBytes=require('randombytes');module.exports=crt;function blind(priv){var r=getr(priv);var blinder=r.toRed(bn.mont(priv.modulus)).redPow(new bn(priv.publicExponent)).fromRed();return{blinder:blinder,unblinder:r.invm(priv.modulus)}}
    function crt(msg,priv){var blinds=blind(priv);var len=priv.modulus.byteLength();var mod=bn.mont(priv.modulus);var blinded=new bn(msg).mul(blinds.blinder).mod(priv.modulus);var c1=blinded.toRed(bn.mont(priv.prime1));var c2=blinded.toRed(bn.mont(priv.prime2));var qinv=priv.coefficient;var p=priv.prime1;var q=priv.prime2;var m1=c1.redPow(priv.exponent1);var m2=c2.redPow(priv.exponent2);m1=m1.fromRed();m2=m2.fromRed();var h=m1.isub(m2).imul(qinv).mod(p);h.imul(q);m2.iadd(h);var out=new Buffer(m2.imul(blinds.unblinder).mod(priv.modulus).toArray());if(out.length<len){var prefix=new Buffer(len-out.length);prefix.fill(0);out=Buffer.concat([prefix,out],len)}
        return out}
    crt.getr=getr;function getr(priv){var len=priv.modulus.byteLength();var r=new bn(randomBytes(len));while(r.cmp(priv.modulus)>=0||!r.mod(priv.prime1)||!r.mod(priv.prime2)){r=new bn(randomBytes(len))}
        return r}}).call(this,require("buffer").Buffer)},{"bn.js":137,"buffer":111,"randombytes":251}],139:[function(require,module,exports){arguments[4][12][0].apply(exports,arguments)},{"../package.json":159,"./elliptic/curve":142,"./elliptic/curves":145,"./elliptic/ec":146,"./elliptic/hmac-drbg":149,"./elliptic/utils":151,"brorand":152,"dup":12}],140:[function(require,module,exports){arguments[4][13][0].apply(exports,arguments)},{"../../elliptic":139,"bn.js":137,"dup":13}],141:[function(require,module,exports){arguments[4][14][0].apply(exports,arguments)},{"../../elliptic":139,"../curve":142,"bn.js":137,"dup":14,"inherits":253}],142:[function(require,module,exports){arguments[4][15][0].apply(exports,arguments)},{"./base":140,"./edwards":141,"./mont":143,"./short":144,"dup":15}],143:[function(require,module,exports){arguments[4][16][0].apply(exports,arguments)},{"../curve":142,"bn.js":137,"dup":16,"inherits":253}],144:[function(require,module,exports){arguments[4][17][0].apply(exports,arguments)},{"../../elliptic":139,"../curve":142,"bn.js":137,"dup":17,"inherits":253}],145:[function(require,module,exports){arguments[4][18][0].apply(exports,arguments)},{"../elliptic":139,"./precomputed/secp256k1":150,"dup":18,"hash.js":153}],146:[function(require,module,exports){arguments[4][19][0].apply(exports,arguments)},{"../../elliptic":139,"./key":147,"./signature":148,"bn.js":137,"dup":19}],147:[function(require,module,exports){arguments[4][20][0].apply(exports,arguments)},{"../../elliptic":139,"bn.js":137,"dup":20}],148:[function(require,module,exports){arguments[4][21][0].apply(exports,arguments)},{"../../elliptic":139,"bn.js":137,"dup":21}],149:[function(require,module,exports){arguments[4][22][0].apply(exports,arguments)},{"../elliptic":139,"dup":22,"hash.js":153}],150:[function(require,module,exports){arguments[4][23][0].apply(exports,arguments)},{"dup":23}],151:[function(require,module,exports){arguments[4][24][0].apply(exports,arguments)},{"dup":24}],152:[function(require,module,exports){arguments[4][25][0].apply(exports,arguments)},{"dup":25}],153:[function(require,module,exports){arguments[4][26][0].apply(exports,arguments)},{"./hash/common":154,"./hash/hmac":155,"./hash/ripemd":156,"./hash/sha":157,"./hash/utils":158,"dup":26}],154:[function(require,module,exports){arguments[4][27][0].apply(exports,arguments)},{"../hash":153,"dup":27}],155:[function(require,module,exports){arguments[4][28][0].apply(exports,arguments)},{"../hash":153,"dup":28}],156:[function(require,module,exports){arguments[4][29][0].apply(exports,arguments)},{"../hash":153,"dup":29}],157:[function(require,module,exports){arguments[4][30][0].apply(exports,arguments)},{"../hash":153,"dup":30}],158:[function(require,module,exports){arguments[4][31][0].apply(exports,arguments)},{"dup":31,"inherits":253}],159:[function(require,module,exports){module.exports={"name":"elliptic","version":"3.1.0","description":"EC cryptography","main":"lib/elliptic.js","scripts":{"test":"make lint && mocha --reporter=spec test/*-test.js"},"repository":{"type":"git","url":"git+ssh://git@github.com/indutny/elliptic.git"},"keywords":["EC","Elliptic","curve","Cryptography"],"author":{"name":"Fedor Indutny","email":"fedor@indutny.com"},"license":"MIT","bugs":{"url":"https://github.com/indutny/elliptic/issues"},"homepage":"https://github.com/indutny/elliptic","devDependencies":{"browserify":"^3.44.2","jscs":"^1.11.3","jshint":"^2.6.0","mocha":"^2.1.0","uglify-js":"^2.4.13"},"dependencies":{"bn.js":"^2.0.3","brorand":"^1.0.1","hash.js":"^1.0.0","inherits":"^2.0.1"},"gitHead":"d86cd2a8178f7e7cecbd6dd92eea084e2ab44c13","_id":"elliptic@3.1.0","_shasum":"c21682ef762769b56a74201609105da11d5f60cc","_from":"elliptic@^3.0.0","_npmVersion":"2.11.0","_nodeVersion":"2.2.1","_npmUser":{"name":"indutny","email":"fedor@indutny.com"},"maintainers":[{"name":"indutny","email":"fedor@indutny.com"}],"dist":{"shasum":"c21682ef762769b56a74201609105da11d5f60cc","tarball":"http://registry.npmjs.org/elliptic/-/elliptic-3.1.0.tgz"},"directories":{},"_resolved":"https://registry.npmjs.org/elliptic/-/elliptic-3.1.0.tgz","readme":"ERROR: No README data found!"}},{}],160:[function(require,module,exports){(function(Buffer){var createHash=require('create-hash');module.exports=function evp(password,salt,keyLen){keyLen=keyLen/8;var ki=0;var ii=0;var key=new Buffer(keyLen);var addmd=0;var md,md_buf;var i;while(!0){md=createHash('md5');if(addmd++>0){md.update(md_buf)}
    md.update(password);md.update(salt);md_buf=md.digest();i=0;if(keyLen>0){while(!0){if(keyLen===0){break}
        if(i===md_buf.length){break}
        key[ki++]=md_buf[i++];keyLen--}}
    if(keyLen===0){break}}
    for(i=0;i<md_buf.length;i++){md_buf[i]=0}
    return key}}).call(this,require("buffer").Buffer)},{"buffer":111,"create-hash":204}],161:[function(require,module,exports){module.exports={"2.16.840.1.101.3.4.1.1":"aes-128-ecb","2.16.840.1.101.3.4.1.2":"aes-128-cbc","2.16.840.1.101.3.4.1.3":"aes-128-ofb","2.16.840.1.101.3.4.1.4":"aes-128-cfb","2.16.840.1.101.3.4.1.21":"aes-192-ecb","2.16.840.1.101.3.4.1.22":"aes-192-cbc","2.16.840.1.101.3.4.1.23":"aes-192-ofb","2.16.840.1.101.3.4.1.24":"aes-192-cfb","2.16.840.1.101.3.4.1.41":"aes-256-ecb","2.16.840.1.101.3.4.1.42":"aes-256-cbc","2.16.840.1.101.3.4.1.43":"aes-256-ofb","2.16.840.1.101.3.4.1.44":"aes-256-cfb"}},{}],162:[function(require,module,exports){var asn1=require('asn1.js');var RSAPrivateKey=asn1.define('RSAPrivateKey',function(){this.seq().obj(this.key('version').int(),this.key('modulus').int(),this.key('publicExponent').int(),this.key('privateExponent').int(),this.key('prime1').int(),this.key('prime2').int(),this.key('exponent1').int(),this.key('exponent2').int(),this.key('coefficient').int())});exports.RSAPrivateKey=RSAPrivateKey;var RSAPublicKey=asn1.define('RSAPublicKey',function(){this.seq().obj(this.key('modulus').int(),this.key('publicExponent').int())});exports.RSAPublicKey=RSAPublicKey;var PublicKey=asn1.define('SubjectPublicKeyInfo',function(){this.seq().obj(this.key('algorithm').use(AlgorithmIdentifier),this.key('subjectPublicKey').bitstr())});exports.PublicKey=PublicKey;var AlgorithmIdentifier=asn1.define('AlgorithmIdentifier',function(){this.seq().obj(this.key('algorithm').objid(),this.key('none').null_().optional(),this.key('curve').objid().optional(),this.key('params').seq().obj(this.key('p').int(),this.key('q').int(),this.key('g').int()).optional())});var PrivateKeyInfo=asn1.define('PrivateKeyInfo',function(){this.seq().obj(this.key('version').int(),this.key('algorithm').use(AlgorithmIdentifier),this.key('subjectPrivateKey').octstr())});exports.PrivateKey=PrivateKeyInfo;var EncryptedPrivateKeyInfo=asn1.define('EncryptedPrivateKeyInfo',function(){this.seq().obj(this.key('algorithm').seq().obj(this.key('id').objid(),this.key('decrypt').seq().obj(this.key('kde').seq().obj(this.key('id').objid(),this.key('kdeparams').seq().obj(this.key('salt').octstr(),this.key('iters').int())),this.key('cipher').seq().obj(this.key('algo').objid(),this.key('iv').octstr()))),this.key('subjectPrivateKey').octstr())});exports.EncryptedPrivateKey=EncryptedPrivateKeyInfo;var DSAPrivateKey=asn1.define('DSAPrivateKey',function(){this.seq().obj(this.key('version').int(),this.key('p').int(),this.key('q').int(),this.key('g').int(),this.key('pub_key').int(),this.key('priv_key').int())});exports.DSAPrivateKey=DSAPrivateKey;exports.DSAparam=asn1.define('DSAparam',function(){this.int()});var ECPrivateKey=asn1.define('ECPrivateKey',function(){this.seq().obj(this.key('version').int(),this.key('privateKey').octstr(),this.key('parameters').optional().explicit(0).use(ECParameters),this.key('publicKey').optional().explicit(1).bitstr())});exports.ECPrivateKey=ECPrivateKey;var ECParameters=asn1.define('ECParameters',function(){this.choice({namedCurve:this.objid()})});exports.signature=asn1.define('signature',function(){this.seq().obj(this.key('r').int(),this.key('s').int())})},{"asn1.js":165}],163:[function(require,module,exports){(function(Buffer){var findProc=/Proc-Type: 4,ENCRYPTED\r?\nDEK-Info: AES-((?:128)|(?:192)|(?:256))-CBC,([0-9A-H]+)\r?\n\r?\n([0-9A-z\n\r\+\/\=]+)\r?\n/m;var startRegex=/^-----BEGIN (.*) KEY-----\r?\n/m;var fullRegex=/^-----BEGIN (.*) KEY-----\r?\n([0-9A-z\n\r\+\/\=]+)\r?\n-----END \1 KEY-----$/m;var evp=require('./EVP_BytesToKey');var ciphers=require('browserify-aes');module.exports=function(okey,password){var key=okey.toString();var match=key.match(findProc);var decrypted;if(!match){var match2=key.match(fullRegex);decrypted=new Buffer(match2[2].replace(/\r?\n/g,''),'base64')}else{var suite='aes'+match[1];var iv=new Buffer(match[2],'hex');var cipherText=new Buffer(match[3].replace(/\r?\n/g,''),'base64');var cipherKey=evp(password,iv.slice(0,8),parseInt(match[1]));var out=[];var cipher=ciphers.createDecipheriv(suite,cipherKey,iv);out.push(cipher.update(cipherText));out.push(cipher.final());decrypted=Buffer.concat(out)}
    var tag=key.match(startRegex)[1]+' KEY';return{tag:tag,data:decrypted}};function wrap(str){var chunks=[]
    for(var i=0;i<str.length;i+=64){chunks.push(str.slice(i,i+64))}
    return chunks.join("\n")}}).call(this,require("buffer").Buffer)},{"./EVP_BytesToKey":160,"browserify-aes":119,"buffer":111}],164:[function(require,module,exports){(function(Buffer){var asn1=require('./asn1');var aesid=require('./aesid.json');var fixProc=require('./fixProc');var ciphers=require('browserify-aes');var compat=require('pbkdf2');module.exports=parseKeys;function parseKeys(buffer){var password;if(typeof buffer==='object'&&!Buffer.isBuffer(buffer)){password=buffer.passphrase;buffer=buffer.key}
    if(typeof buffer==='string'){buffer=new Buffer(buffer)}
    var stripped=fixProc(buffer,password);var type=stripped.tag;var data=stripped.data;var subtype,ndata;switch(type){case 'PUBLIC KEY':ndata=asn1.PublicKey.decode(data,'der');subtype=ndata.algorithm.algorithm.join('.');switch(subtype){case '1.2.840.113549.1.1.1':return asn1.RSAPublicKey.decode(ndata.subjectPublicKey.data,'der');case '1.2.840.10045.2.1':ndata.subjectPrivateKey=ndata.subjectPublicKey;return{type:'ec',data:ndata};case '1.2.840.10040.4.1':ndata.algorithm.params.pub_key=asn1.DSAparam.decode(ndata.subjectPublicKey.data,'der');return{type:'dsa',data:ndata.algorithm.params};default:throw new Error('unknown key id '+subtype)}
        throw new Error('unknown key type '+type);case 'ENCRYPTED PRIVATE KEY':data=asn1.EncryptedPrivateKey.decode(data,'der');data=decrypt(data,password);case 'PRIVATE KEY':ndata=asn1.PrivateKey.decode(data,'der');subtype=ndata.algorithm.algorithm.join('.');switch(subtype){case '1.2.840.113549.1.1.1':return asn1.RSAPrivateKey.decode(ndata.subjectPrivateKey,'der');case '1.2.840.10045.2.1':return{curve:ndata.algorithm.curve,privateKey:asn1.ECPrivateKey.decode(ndata.subjectPrivateKey,'der').privateKey};case '1.2.840.10040.4.1':ndata.algorithm.params.priv_key=asn1.DSAparam.decode(ndata.subjectPrivateKey,'der');return{type:'dsa',params:ndata.algorithm.params};default:throw new Error('unknown key id '+subtype)}
        throw new Error('unknown key type '+type);case 'RSA PUBLIC KEY':return asn1.RSAPublicKey.decode(data,'der');case 'RSA PRIVATE KEY':return asn1.RSAPrivateKey.decode(data,'der');case 'DSA PRIVATE KEY':return{type:'dsa',params:asn1.DSAPrivateKey.decode(data,'der')};case 'EC PRIVATE KEY':data=asn1.ECPrivateKey.decode(data,'der');return{curve:data.parameters.value,privateKey:data.privateKey};default:throw new Error('unknown key type '+type)}}
    parseKeys.signature=asn1.signature;function decrypt(data,password){var salt=data.algorithm.decrypt.kde.kdeparams.salt;var iters=parseInt(data.algorithm.decrypt.kde.kdeparams.iters.toString(),10);var algo=aesid[data.algorithm.decrypt.cipher.algo.join('.')];var iv=data.algorithm.decrypt.cipher.iv;var cipherText=data.subjectPrivateKey;var keylen=parseInt(algo.split('-')[1],10)/8;var key=compat.pbkdf2Sync(password,salt,iters,keylen);var cipher=ciphers.createDecipheriv(algo,key,iv);var out=[];out.push(cipher.update(cipherText));out.push(cipher.final());return Buffer.concat(out)}}).call(this,require("buffer").Buffer)},{"./aesid.json":161,"./asn1":162,"./fixProc":163,"browserify-aes":119,"buffer":111,"pbkdf2":224}],165:[function(require,module,exports){var asn1=exports;asn1.bignum=require('bn.js');asn1.define=require('./asn1/api').define;asn1.base=require('./asn1/base');asn1.constants=require('./asn1/constants');asn1.decoders=require('./asn1/decoders');asn1.encoders=require('./asn1/encoders')},{"./asn1/api":166,"./asn1/base":168,"./asn1/constants":172,"./asn1/decoders":174,"./asn1/encoders":176,"bn.js":137}],166:[function(require,module,exports){var asn1=require('../asn1');var inherits=require('inherits');var api=exports;api.define=function define(name,body){return new Entity(name,body)};function Entity(name,body){this.name=name;this.body=body;this.decoders={};this.encoders={}};Entity.prototype._createNamed=function createNamed(base){var named;try{named=require('vm').runInThisContext('(function '+this.name+'(entity) {\n'+'  this._initNamed(entity);\n'+'})')}catch(e){named=function(entity){this._initNamed(entity)}}
    inherits(named,base);named.prototype._initNamed=function initnamed(entity){base.call(this,entity)};return new named(this)};Entity.prototype._getDecoder=function _getDecoder(enc){if(!this.decoders.hasOwnProperty(enc))
    this.decoders[enc]=this._createNamed(asn1.decoders[enc]);return this.decoders[enc]};Entity.prototype.decode=function decode(data,enc,options){return this._getDecoder(enc).decode(data,options)};Entity.prototype._getEncoder=function _getEncoder(enc){if(!this.encoders.hasOwnProperty(enc))
    this.encoders[enc]=this._createNamed(asn1.encoders[enc]);return this.encoders[enc]};Entity.prototype.encode=function encode(data,enc,reporter){return this._getEncoder(enc).encode(data,reporter)}},{"../asn1":165,"inherits":253,"vm":271}],167:[function(require,module,exports){var inherits=require('inherits');var Reporter=require('../base').Reporter;var Buffer=require('buffer').Buffer;function DecoderBuffer(base,options){Reporter.call(this,options);if(!Buffer.isBuffer(base)){this.error('Input not Buffer');return}
    this.base=base;this.offset=0;this.length=base.length}
    inherits(DecoderBuffer,Reporter);exports.DecoderBuffer=DecoderBuffer;DecoderBuffer.prototype.save=function save(){return{offset:this.offset,reporter:Reporter.prototype.save.call(this)}};DecoderBuffer.prototype.restore=function restore(save){var res=new DecoderBuffer(this.base);res.offset=save.offset;res.length=this.offset;this.offset=save.offset;Reporter.prototype.restore.call(this,save.reporter);return res};DecoderBuffer.prototype.isEmpty=function isEmpty(){return this.offset===this.length};DecoderBuffer.prototype.readUInt8=function readUInt8(fail){if(this.offset+1<=this.length)
        return this.base.readUInt8(this.offset++,!0);else return this.error(fail||'DecoderBuffer overrun')}
    DecoderBuffer.prototype.skip=function skip(bytes,fail){if(!(this.offset+bytes<=this.length))
        return this.error(fail||'DecoderBuffer overrun');var res=new DecoderBuffer(this.base);res._reporterState=this._reporterState;res.offset=this.offset;res.length=this.offset+bytes;this.offset+=bytes;return res}
    DecoderBuffer.prototype.raw=function raw(save){return this.base.slice(save?save.offset:this.offset,this.length)}
    function EncoderBuffer(value,reporter){if(Array.isArray(value)){this.length=0;this.value=value.map(function(item){if(!(item instanceof EncoderBuffer))
        item=new EncoderBuffer(item,reporter);this.length+=item.length;return item},this)}else if(typeof value==='number'){if(!(0<=value&&value<=0xff))
        return reporter.error('non-byte EncoderBuffer value');this.value=value;this.length=1}else if(typeof value==='string'){this.value=value;this.length=Buffer.byteLength(value)}else if(Buffer.isBuffer(value)){this.value=value;this.length=value.length}else{return reporter.error('Unsupported type: '+typeof value)}}
    exports.EncoderBuffer=EncoderBuffer;EncoderBuffer.prototype.join=function join(out,offset){if(!out)
        out=new Buffer(this.length);if(!offset)
        offset=0;if(this.length===0)
        return out;if(Array.isArray(this.value)){this.value.forEach(function(item){item.join(out,offset);offset+=item.length})}else{if(typeof this.value==='number')
        out[offset]=this.value;else if(typeof this.value==='string')
        out.write(this.value,offset);else if(Buffer.isBuffer(this.value))
        this.value.copy(out,offset);offset+=this.length}
        return out}},{"../base":168,"buffer":111,"inherits":253}],168:[function(require,module,exports){var base=exports;base.Reporter=require('./reporter').Reporter;base.DecoderBuffer=require('./buffer').DecoderBuffer;base.EncoderBuffer=require('./buffer').EncoderBuffer;base.Node=require('./node')},{"./buffer":167,"./node":169,"./reporter":170}],169:[function(require,module,exports){var Reporter=require('../base').Reporter;var EncoderBuffer=require('../base').EncoderBuffer;var assert=require('minimalistic-assert');var tags=['seq','seqof','set','setof','octstr','bitstr','objid','bool','gentime','utctime','null_','enum','int','ia5str'];var methods=['key','obj','use','optional','explicit','implicit','def','choice','any'].concat(tags);var overrided=['_peekTag','_decodeTag','_use','_decodeStr','_decodeObjid','_decodeTime','_decodeNull','_decodeInt','_decodeBool','_decodeList','_encodeComposite','_encodeStr','_encodeObjid','_encodeTime','_encodeNull','_encodeInt','_encodeBool'];function Node(enc,parent){var state={};this._baseState=state;state.enc=enc;state.parent=parent||null;state.children=null;state.tag=null;state.args=null;state.reverseArgs=null;state.choice=null;state.optional=!1;state.any=!1;state.obj=!1;state.use=null;state.useDecoder=null;state.key=null;state['default']=null;state.explicit=null;state.implicit=null;if(!state.parent){state.children=[];this._wrap()}}
    module.exports=Node;var stateProps=['enc','parent','children','tag','args','reverseArgs','choice','optional','any','obj','use','alteredUse','key','default','explicit','implicit'];Node.prototype.clone=function clone(){var state=this._baseState;var cstate={};stateProps.forEach(function(prop){cstate[prop]=state[prop]});var res=new this.constructor(cstate.parent);res._baseState=cstate;return res};Node.prototype._wrap=function wrap(){var state=this._baseState;methods.forEach(function(method){this[method]=function _wrappedMethod(){var clone=new this.constructor(this);state.children.push(clone);return clone[method].apply(clone,arguments)}},this)};Node.prototype._init=function init(body){var state=this._baseState;assert(state.parent===null);body.call(this);state.children=state.children.filter(function(child){return child._baseState.parent===this},this);assert.equal(state.children.length,1,'Root node can have only one child')};Node.prototype._useArgs=function useArgs(args){var state=this._baseState;var children=args.filter(function(arg){return arg instanceof this.constructor},this);args=args.filter(function(arg){return!(arg instanceof this.constructor)},this);if(children.length!==0){assert(state.children===null);state.children=children;children.forEach(function(child){child._baseState.parent=this},this)}
        if(args.length!==0){assert(state.args===null);state.args=args;state.reverseArgs=args.map(function(arg){if(typeof arg!=='object'||arg.constructor!==Object)
            return arg;var res={};Object.keys(arg).forEach(function(key){if(key==(key|0))
            key|=0;var value=arg[key];res[value]=key});return res})}};overrided.forEach(function(method){Node.prototype[method]=function _overrided(){var state=this._baseState;throw new Error(method+' not implemented for encoding: '+state.enc)}});tags.forEach(function(tag){Node.prototype[tag]=function _tagMethod(){var state=this._baseState;var args=Array.prototype.slice.call(arguments);assert(state.tag===null);state.tag=tag;this._useArgs(args);return this}});Node.prototype.use=function use(item){var state=this._baseState;assert(state.use===null);state.use=item;return this};Node.prototype.optional=function optional(){var state=this._baseState;state.optional=!0;return this};Node.prototype.def=function def(val){var state=this._baseState;assert(state['default']===null);state['default']=val;state.optional=!0;return this};Node.prototype.explicit=function explicit(num){var state=this._baseState;assert(state.explicit===null&&state.implicit===null);state.explicit=num;return this};Node.prototype.implicit=function implicit(num){var state=this._baseState;assert(state.explicit===null&&state.implicit===null);state.implicit=num;return this};Node.prototype.obj=function obj(){var state=this._baseState;var args=Array.prototype.slice.call(arguments);state.obj=!0;if(args.length!==0)
        this._useArgs(args);return this};Node.prototype.key=function key(newKey){var state=this._baseState;assert(state.key===null);state.key=newKey;return this};Node.prototype.any=function any(){var state=this._baseState;state.any=!0;return this};Node.prototype.choice=function choice(obj){var state=this._baseState;assert(state.choice===null);state.choice=obj;this._useArgs(Object.keys(obj).map(function(key){return obj[key]}));return this};Node.prototype._decode=function decode(input){var state=this._baseState;if(state.parent===null)
        return input.wrapResult(state.children[0]._decode(input));var result=state['default'];var present=!0;var prevKey;if(state.key!==null)
        prevKey=input.enterKey(state.key);if(state.optional){present=this._peekTag(input,state.explicit!==null?state.explicit:state.implicit!==null?state.implicit:state.tag||0,state.any);if(input.isError(present))
        return present}
        var prevObj;if(state.obj&&present)
            prevObj=input.enterObject();if(present){if(state.explicit!==null){var explicit=this._decodeTag(input,state.explicit);if(input.isError(explicit))
            return explicit;input=explicit}
            if(state.use===null&&state.choice===null){if(state.any)
                var save=input.save();var body=this._decodeTag(input,state.implicit!==null?state.implicit:state.tag,state.any);if(input.isError(body))
                return body;if(state.any)
                result=input.raw(save);else input=body}
            if(state.any)
                result=result;else if(state.choice===null)
                result=this._decodeGeneric(state.tag,input);else result=this._decodeChoice(input);if(input.isError(result))
                return result;if(!state.any&&state.choice===null&&state.children!==null){var fail=state.children.some(function decodeChildren(child){child._decode(input)});if(fail)
                return err}}
        if(state.obj&&present)
            result=input.leaveObject(prevObj);if(state.key!==null&&(result!==null||present===!0))
            input.leaveKey(prevKey,state.key,result);return result};Node.prototype._decodeGeneric=function decodeGeneric(tag,input){var state=this._baseState;if(tag==='seq'||tag==='set')
        return null;if(tag==='seqof'||tag==='setof')
        return this._decodeList(input,tag,state.args[0]);else if(tag==='octstr'||tag==='bitstr'||tag==='ia5str')
        return this._decodeStr(input,tag);else if(tag==='objid'&&state.args)
        return this._decodeObjid(input,state.args[0],state.args[1]);else if(tag==='objid')
        return this._decodeObjid(input,null,null);else if(tag==='gentime'||tag==='utctime')
        return this._decodeTime(input,tag);else if(tag==='null_')
        return this._decodeNull(input);else if(tag==='bool')
        return this._decodeBool(input);else if(tag==='int'||tag==='enum')
        return this._decodeInt(input,state.args&&state.args[0]);else if(state.use!==null)
        return this._getUse(state.use,input._reporterState.obj)._decode(input);else return input.error('unknown tag: '+tag);return null};Node.prototype._getUse=function _getUse(entity,obj){var state=this._baseState;state.useDecoder=this._use(entity,obj);assert(state.useDecoder._baseState.parent===null);state.useDecoder=state.useDecoder._baseState.children[0];if(state.implicit!==state.useDecoder._baseState.implicit){state.useDecoder=state.useDecoder.clone();state.useDecoder._baseState.implicit=state.implicit}
        return state.useDecoder};Node.prototype._decodeChoice=function decodeChoice(input){var state=this._baseState;var result=null;var match=!1;Object.keys(state.choice).some(function(key){var save=input.save();var node=state.choice[key];try{var value=node._decode(input);if(input.isError(value))
        return!1;result={type:key,value:value};match=!0}catch(e){input.restore(save);return!1}
        return!0},this);if(!match)
        return input.error('Choice not matched');return result};Node.prototype._createEncoderBuffer=function createEncoderBuffer(data){return new EncoderBuffer(data,this.reporter)};Node.prototype._encode=function encode(data,reporter,parent){var state=this._baseState;if(state['default']!==null&&state['default']===data)
        return;var result=this._encodeValue(data,reporter,parent);if(result===undefined)
        return;if(this._skipDefault(result,reporter,parent))
        return;return result};Node.prototype._encodeValue=function encode(data,reporter,parent){var state=this._baseState;if(state.parent===null)
        return state.children[0]._encode(data,reporter||new Reporter());var result=null;var present=!0;this.reporter=reporter;if(state.optional&&data===undefined){if(state['default']!==null)
        data=state['default']
    else return}
        var prevKey;var content=null;var primitive=!1;if(state.any){result=this._createEncoderBuffer(data)}else if(state.choice){result=this._encodeChoice(data,reporter)}else if(state.children){content=state.children.map(function(child){if(child._baseState.tag==='null_')
            return child._encode(null,reporter,data);if(child._baseState.key===null)
            return reporter.error('Child should have a key');var prevKey=reporter.enterKey(child._baseState.key);if(typeof data!=='object')
            return reporter.error('Child expected, but input is not object');var res=child._encode(data[child._baseState.key],reporter,data);reporter.leaveKey(prevKey);return res},this).filter(function(child){return child});content=this._createEncoderBuffer(content)}else{if(state.tag==='seqof'||state.tag==='setof'){if(!(state.args&&state.args.length===1))
            return reporter.error('Too many args for : '+state.tag);if(!Array.isArray(data))
            return reporter.error('seqof/setof, but data is not Array');var child=this.clone();child._baseState.implicit=null;content=this._createEncoderBuffer(data.map(function(item){var state=this._baseState;return this._getUse(state.args[0],data)._encode(item,reporter)},child))}else if(state.use!==null){result=this._getUse(state.use,parent)._encode(data,reporter)}else{content=this._encodePrimitive(state.tag,data);primitive=!0}}
        var result;if(!state.any&&state.choice===null){var tag=state.implicit!==null?state.implicit:state.tag;var cls=state.implicit===null?'universal':'context';if(tag===null){if(state.use===null)
            reporter.error('Tag could be ommited only for .use()')}else{if(state.use===null)
            result=this._encodeComposite(tag,primitive,cls,content)}}
        if(state.explicit!==null)
            result=this._encodeComposite(state.explicit,!1,'context',result);return result};Node.prototype._encodeChoice=function encodeChoice(data,reporter){var state=this._baseState;var node=state.choice[data.type];if(!node){assert(!1,data.type+' not found in '+JSON.stringify(Object.keys(state.choice)))}
        return node._encode(data.value,reporter)};Node.prototype._encodePrimitive=function encodePrimitive(tag,data){var state=this._baseState;if(tag==='octstr'||tag==='bitstr'||tag==='ia5str')
        return this._encodeStr(data,tag);else if(tag==='objid'&&state.args)
        return this._encodeObjid(data,state.reverseArgs[0],state.args[1]);else if(tag==='objid')
        return this._encodeObjid(data,null,null);else if(tag==='gentime'||tag==='utctime')
        return this._encodeTime(data,tag);else if(tag==='null_')
        return this._encodeNull();else if(tag==='int'||tag==='enum')
        return this._encodeInt(data,state.args&&state.reverseArgs[0]);else if(tag==='bool')
        return this._encodeBool(data);else throw new Error('Unsupported tag: '+tag)}},{"../base":168,"minimalistic-assert":177}],170:[function(require,module,exports){var inherits=require('inherits');function Reporter(options){this._reporterState={obj:null,path:[],options:options||{},errors:[]}}
    exports.Reporter=Reporter;Reporter.prototype.isError=function isError(obj){return obj instanceof ReporterError};Reporter.prototype.save=function save(){var state=this._reporterState;return{obj:state.obj,pathLen:state.path.length}};Reporter.prototype.restore=function restore(data){var state=this._reporterState;state.obj=data.obj;state.path=state.path.slice(0,data.pathLen)};Reporter.prototype.enterKey=function enterKey(key){return this._reporterState.path.push(key)};Reporter.prototype.leaveKey=function leaveKey(index,key,value){var state=this._reporterState;state.path=state.path.slice(0,index-1);if(state.obj!==null)
        state.obj[key]=value};Reporter.prototype.enterObject=function enterObject(){var state=this._reporterState;var prev=state.obj;state.obj={};return prev};Reporter.prototype.leaveObject=function leaveObject(prev){var state=this._reporterState;var now=state.obj;state.obj=prev;return now};Reporter.prototype.error=function error(msg){var err;var state=this._reporterState;var inherited=msg instanceof ReporterError;if(inherited){err=msg}else{err=new ReporterError(state.path.map(function(elem){return '['+JSON.stringify(elem)+']'}).join(''),msg.message||msg,msg.stack)}
        if(!state.options.partial)
            throw err;if(!inherited)
            state.errors.push(err);return err};Reporter.prototype.wrapResult=function wrapResult(result){var state=this._reporterState;if(!state.options.partial)
        return result;return{result:this.isError(result)?null:result,errors:state.errors}};function ReporterError(path,msg){this.path=path;this.rethrow(msg)};inherits(ReporterError,Error);ReporterError.prototype.rethrow=function rethrow(msg){this.message=msg+' at: '+(this.path||'(shallow)');Error.captureStackTrace(this,ReporterError);return this}},{"inherits":253}],171:[function(require,module,exports){var constants=require('../constants');exports.tagClass={0:'universal',1:'application',2:'context',3:'private'};exports.tagClassByName=constants._reverse(exports.tagClass);exports.tag={0x00:'end',0x01:'bool',0x02:'int',0x03:'bitstr',0x04:'octstr',0x05:'null_',0x06:'objid',0x07:'objDesc',0x08:'external',0x09:'real',0x0a:'enum',0x0b:'embed',0x0c:'utf8str',0x0d:'relativeOid',0x10:'seq',0x11:'set',0x12:'numstr',0x13:'printstr',0x14:'t61str',0x15:'videostr',0x16:'ia5str',0x17:'utctime',0x18:'gentime',0x19:'graphstr',0x1a:'iso646str',0x1b:'genstr',0x1c:'unistr',0x1d:'charstr',0x1e:'bmpstr'};exports.tagByName=constants._reverse(exports.tag)},{"../constants":172}],172:[function(require,module,exports){var constants=exports;constants._reverse=function reverse(map){var res={};Object.keys(map).forEach(function(key){if((key|0)==key)
    key=key|0;var value=map[key];res[value]=key});return res};constants.der=require('./der')},{"./der":171}],173:[function(require,module,exports){var inherits=require('inherits');var asn1=require('../../asn1');var base=asn1.base;var bignum=asn1.bignum;var der=asn1.constants.der;function DERDecoder(entity){this.enc='der';this.name=entity.name;this.entity=entity;this.tree=new DERNode();this.tree._init(entity.body)};module.exports=DERDecoder;DERDecoder.prototype.decode=function decode(data,options){if(!(data instanceof base.DecoderBuffer))
    data=new base.DecoderBuffer(data,options);return this.tree._decode(data,options)};function DERNode(parent){base.Node.call(this,'der',parent)}
    inherits(DERNode,base.Node);DERNode.prototype._peekTag=function peekTag(buffer,tag,any){if(buffer.isEmpty())
        return!1;var state=buffer.save();var decodedTag=derDecodeTag(buffer,'Failed to peek tag: "'+tag+'"');if(buffer.isError(decodedTag))
        return decodedTag;buffer.restore(state);return decodedTag.tag===tag||decodedTag.tagStr===tag||any};DERNode.prototype._decodeTag=function decodeTag(buffer,tag,any){var decodedTag=derDecodeTag(buffer,'Failed to decode tag of "'+tag+'"');if(buffer.isError(decodedTag))
        return decodedTag;var len=derDecodeLen(buffer,decodedTag.primitive,'Failed to get length of "'+tag+'"');if(buffer.isError(len))
        return len;if(!any&&decodedTag.tag!==tag&&decodedTag.tagStr!==tag&&decodedTag.tagStr+'of'!==tag){return buffer.error('Failed to match tag: "'+tag+'"')}
        if(decodedTag.primitive||len!==null)
            return buffer.skip(len,'Failed to match body of: "'+tag+'"');var state=buffer.start();var res=this._skipUntilEnd(buffer,'Failed to skip indefinite length body: "'+this.tag+'"');if(buffer.isError(res))
            return res;return buffer.cut(state)};DERNode.prototype._skipUntilEnd=function skipUntilEnd(buffer,fail){while(!0){var tag=derDecodeTag(buffer,fail);if(buffer.isError(tag))
        return tag;var len=derDecodeLen(buffer,tag.primitive,fail);if(buffer.isError(len))
        return len;var res;if(tag.primitive||len!==null)
        res=buffer.skip(len)
    else res=this._skipUntilEnd(buffer,fail);if(buffer.isError(res))
        return res;if(tag.tagStr==='end')
        break}};DERNode.prototype._decodeList=function decodeList(buffer,tag,decoder){var result=[];while(!buffer.isEmpty()){var possibleEnd=this._peekTag(buffer,'end');if(buffer.isError(possibleEnd))
        return possibleEnd;var res=decoder.decode(buffer,'der');if(buffer.isError(res)&&possibleEnd)
        break;result.push(res)}
        return result};DERNode.prototype._decodeStr=function decodeStr(buffer,tag){if(tag==='octstr'){return buffer.raw()}else if(tag==='bitstr'){var unused=buffer.readUInt8();if(buffer.isError(unused))
        return unused;return{unused:unused,data:buffer.raw()}}else if(tag==='ia5str'){return buffer.raw().toString()}else{return this.error('Decoding of string type: '+tag+' unsupported')}};DERNode.prototype._decodeObjid=function decodeObjid(buffer,values,relative){var identifiers=[];var ident=0;while(!buffer.isEmpty()){var subident=buffer.readUInt8();ident<<=7;ident|=subident&0x7f;if((subident&0x80)===0){identifiers.push(ident);ident=0}}
        if(subident&0x80)
            identifiers.push(ident);var first=(identifiers[0]/40)|0;var second=identifiers[0]%40;if(relative)
            result=identifiers;else result=[first,second].concat(identifiers.slice(1));if(values)
            result=values[result.join(' ')];return result};DERNode.prototype._decodeTime=function decodeTime(buffer,tag){var str=buffer.raw().toString();if(tag==='gentime'){var year=str.slice(0,4)|0;var mon=str.slice(4,6)|0;var day=str.slice(6,8)|0;var hour=str.slice(8,10)|0;var min=str.slice(10,12)|0;var sec=str.slice(12,14)|0}else if(tag==='utctime'){var year=str.slice(0,2)|0;var mon=str.slice(2,4)|0;var day=str.slice(4,6)|0;var hour=str.slice(6,8)|0;var min=str.slice(8,10)|0;var sec=str.slice(10,12)|0;if(year<70)
        year=2000+year;else year=1900+year}else{return this.error('Decoding '+tag+' time is not supported yet')}
        return Date.UTC(year,mon-1,day,hour,min,sec,0)};DERNode.prototype._decodeNull=function decodeNull(buffer){return null};DERNode.prototype._decodeBool=function decodeBool(buffer){var res=buffer.readUInt8();if(buffer.isError(res))
        return res;else return res!==0};DERNode.prototype._decodeInt=function decodeInt(buffer,values){var raw=buffer.raw();var res=new bignum(raw);if(values)
        res=values[res.toString(10)]||res;return res};DERNode.prototype._use=function use(entity,obj){if(typeof entity==='function')
        entity=entity(obj);return entity._getDecoder('der').tree};function derDecodeTag(buf,fail){var tag=buf.readUInt8(fail);if(buf.isError(tag))
        return tag;var cls=der.tagClass[tag>>6];var primitive=(tag&0x20)===0;if((tag&0x1f)===0x1f){var oct=tag;tag=0;while((oct&0x80)===0x80){oct=buf.readUInt8(fail);if(buf.isError(oct))
        return oct;tag<<=7;tag|=oct&0x7f}}else{tag&=0x1f}
        var tagStr=der.tag[tag];return{cls:cls,primitive:primitive,tag:tag,tagStr:tagStr}}
    function derDecodeLen(buf,primitive,fail){var len=buf.readUInt8(fail);if(buf.isError(len))
        return len;if(!primitive&&len===0x80)
        return null;if((len&0x80)===0){return len}
        var num=len&0x7f;if(num>=4)
            return buf.error('length octect is too long');len=0;for(var i=0;i<num;i++){len<<=8;var j=buf.readUInt8(fail);if(buf.isError(j))
            return j;len|=j}
        return len}},{"../../asn1":165,"inherits":253}],174:[function(require,module,exports){var decoders=exports;decoders.der=require('./der')},{"./der":173}],175:[function(require,module,exports){var inherits=require('inherits');var Buffer=require('buffer').Buffer;var asn1=require('../../asn1');var base=asn1.base;var bignum=asn1.bignum;var der=asn1.constants.der;function DEREncoder(entity){this.enc='der';this.name=entity.name;this.entity=entity;this.tree=new DERNode();this.tree._init(entity.body)};module.exports=DEREncoder;DEREncoder.prototype.encode=function encode(data,reporter){return this.tree._encode(data,reporter).join()};function DERNode(parent){base.Node.call(this,'der',parent)}
    inherits(DERNode,base.Node);DERNode.prototype._encodeComposite=function encodeComposite(tag,primitive,cls,content){var encodedTag=encodeTag(tag,primitive,cls,this.reporter);if(content.length<0x80){var header=new Buffer(2);header[0]=encodedTag;header[1]=content.length;return this._createEncoderBuffer([header,content])}
        var lenOctets=1;for(var i=content.length;i>=0x100;i>>=8)
            lenOctets++;var header=new Buffer(1+1+lenOctets);header[0]=encodedTag;header[1]=0x80|lenOctets;for(var i=1+lenOctets,j=content.length;j>0;i--,j>>=8)
            header[i]=j&0xff;return this._createEncoderBuffer([header,content])};DERNode.prototype._encodeStr=function encodeStr(str,tag){if(tag==='octstr')
        return this._createEncoderBuffer(str);else if(tag==='bitstr')
        return this._createEncoderBuffer([str.unused|0,str.data]);else if(tag==='ia5str')
        return this._createEncoderBuffer(str);return this.reporter.error('Encoding of string type: '+tag+' unsupported')};DERNode.prototype._encodeObjid=function encodeObjid(id,values,relative){if(typeof id==='string'){if(!values)
        return this.reporter.error('string objid given, but no values map found');if(!values.hasOwnProperty(id))
        return this.reporter.error('objid not found in values map');id=values[id].split(/\s+/g);for(var i=0;i<id.length;i++)
        id[i]|=0}else if(Array.isArray(id)){id=id.slice()}
        if(!Array.isArray(id)){return this.reporter.error('objid() should be either array or string, '+'got: '+JSON.stringify(id))}
        if(!relative){if(id[1]>=40)
            return this.reporter.error('Second objid identifier OOB');id.splice(0,2,id[0]*40+id[1])}
        var size=0;for(var i=0;i<id.length;i++){var ident=id[i];for(size++;ident>=0x80;ident>>=7)
            size++}
        var objid=new Buffer(size);var offset=objid.length-1;for(var i=id.length-1;i>=0;i--){var ident=id[i];objid[offset--]=ident&0x7f;while((ident>>=7)>0)
            objid[offset--]=0x80|(ident&0x7f)}
        return this._createEncoderBuffer(objid)};function two(num){if(num<10)
        return '0'+num;else return num}
    DERNode.prototype._encodeTime=function encodeTime(time,tag){var str;var date=new Date(time);if(tag==='gentime'){str=[two(date.getFullYear()),two(date.getUTCMonth()+1),two(date.getUTCDate()),two(date.getUTCHours()),two(date.getUTCMinutes()),two(date.getUTCSeconds()),'Z'].join('')}else if(tag==='utctime'){str=[two(date.getFullYear()%100),two(date.getUTCMonth()+1),two(date.getUTCDate()),two(date.getUTCHours()),two(date.getUTCMinutes()),two(date.getUTCSeconds()),'Z'].join('')}else{this.reporter.error('Encoding '+tag+' time is not supported yet')}
        return this._encodeStr(str,'octstr')};DERNode.prototype._encodeNull=function encodeNull(){return this._createEncoderBuffer('')};DERNode.prototype._encodeInt=function encodeInt(num,values){if(typeof num==='string'){if(!values)
        return this.reporter.error('String int or enum given, but no values map');if(!values.hasOwnProperty(num)){return this.reporter.error('Values map doesn\'t contain: '+JSON.stringify(num))}
        num=values[num]}
        if(typeof num!=='number'&&!Buffer.isBuffer(num)){var numArray=num.toArray();if(num.sign===!1&&numArray[0]&0x80){numArray.unshift(0)}
            num=new Buffer(numArray)}
        if(Buffer.isBuffer(num)){var size=num.length;if(num.length===0)
            size++;var out=new Buffer(size);num.copy(out);if(num.length===0)
            out[0]=0
            return this._createEncoderBuffer(out)}
        if(num<0x80)
            return this._createEncoderBuffer(num);if(num<0x100)
            return this._createEncoderBuffer([0,num]);var size=1;for(var i=num;i>=0x100;i>>=8)
            size++;var out=new Array(size);for(var i=out.length-1;i>=0;i--){out[i]=num&0xff;num>>=8}
        if(out[0]&0x80){out.unshift(0)}
        return this._createEncoderBuffer(new Buffer(out))};DERNode.prototype._encodeBool=function encodeBool(value){return this._createEncoderBuffer(value?0xff:0)};DERNode.prototype._use=function use(entity,obj){if(typeof entity==='function')
        entity=entity(obj);return entity._getEncoder('der').tree};DERNode.prototype._skipDefault=function skipDefault(dataBuffer,reporter,parent){var state=this._baseState;var i;if(state['default']===null)
        return!1;var data=dataBuffer.join();if(state.defaultBuffer===undefined)
        state.defaultBuffer=this._encodeValue(state['default'],reporter,parent).join();if(data.length!==state.defaultBuffer.length)
        return!1;for(i=0;i<data.length;i++)
        if(data[i]!==state.defaultBuffer[i])
            return!1;return!0};function encodeTag(tag,primitive,cls,reporter){var res;if(tag==='seqof')
        tag='seq';else if(tag==='setof')
        tag='set';if(der.tagByName.hasOwnProperty(tag))
        res=der.tagByName[tag];else if(typeof tag==='number'&&(tag|0)===tag)
        res=tag;else return reporter.error('Unknown tag: '+tag);if(res>=0x1f)
        return reporter.error('Multi-octet tag encoding unsupported');if(!primitive)
        res|=0x20;res|=(der.tagClassByName[cls||'universal']<<6);return res}},{"../../asn1":165,"buffer":111,"inherits":253}],176:[function(require,module,exports){var encoders=exports;encoders.der=require('./der')},{"./der":175}],177:[function(require,module,exports){module.exports=assert;function assert(val,msg){if(!val)
    throw new Error(msg||'Assertion failed')}
    assert.equal=function assertEqual(l,r,msg){if(l!=r)
        throw new Error(msg||('Assertion failed: '+l+' != '+r))}},{}],178:[function(require,module,exports){(function(Buffer){var parseKeys=require('parse-asn1')
    var BN=require('bn.js')
    var elliptic=require('elliptic')
    var crt=require('browserify-rsa')
    var createHmac=require('create-hmac')
    var curves=require('./curves')
    module.exports=sign
    function sign(hash,key,hashType,signType){var priv=parseKeys(key)
        if(priv.curve){if(signType!=='ecdsa'){throw new Error('wrong private key type')}
            return ecSign(hash,priv)}else if(priv.type==='dsa'){return dsaSign(hash,priv,hashType)
            if(signType!=='dsa'){throw new Error('wrong private key type')}}else{if(signType!=='rsa'){throw new Error('wrong private key type')}}
        var len=priv.modulus.byteLength()
        var pad=[0,1]
        while(hash.length+pad.length+1<len){pad.push(0xff)}
        pad.push(0x00)
        var i=-1
        while(++i<hash.length){pad.push(hash[i])}
        var out=crt(pad,priv)
        return out}
    function ecSign(hash,priv){var curveId=curves[priv.curve.join('.')]
        if(!curveId)
            throw new Error('unknown curve '+priv.curve.join('.'))
        var curve=new elliptic.ec(curveId)
        var key=curve.genKeyPair()
        key._importPrivate(priv.privateKey)
        var out=key.sign(hash)
        return new Buffer(out.toDER())}
    function dsaSign(hash,priv,algo){var x=priv.params.priv_key
        var p=priv.params.p
        var q=priv.params.q
        var montq=BN.mont(q)
        var g=priv.params.g
        var r=new BN(0)
        var k
        var H=bits2int(hash,q).mod(q)
        var s=!1
        var kv=getKey(x,q,hash,algo)
        while(s===!1){k=makeKey(q,kv,algo)
            r=makeR(g,k,p,q)
            s=k.invm(q).imul(H.add(x.mul(r))).mod(q)
            if(!s.cmpn(0)){s=!1
                r=new BN(0)}}
        return toDER(r,s)}
    function toDER(r,s){r=r.toArray()
        s=s.toArray()
        if(r[0]&0x80)
            r=[0].concat(r)
        if(s[0]&0x80)
            s=[0].concat(s)
        var total=r.length+s.length+4
        var res=[0x30,total,0x02,r.length]
        res=res.concat(r,[0x02,s.length],s)
        return new Buffer(res)}
    module.exports.getKey=getKey
    function getKey(x,q,hash,algo){x=new Buffer(x.toArray())
        if(x.length<q.byteLength()){var zeros=new Buffer(q.byteLength()-x.length)
            zeros.fill(0)
            x=Buffer.concat([zeros,x])}
        var hlen=hash.length
        var hbits=bits2octets(hash,q)
        var v=new Buffer(hlen)
        v.fill(1)
        var k=new Buffer(hlen)
        k.fill(0)
        k=createHmac(algo,k).update(v).update(new Buffer([0])).update(x).update(hbits).digest()
        v=createHmac(algo,k).update(v).digest()
        k=createHmac(algo,k).update(v).update(new Buffer([1])).update(x).update(hbits).digest()
        v=createHmac(algo,k).update(v).digest()
        return{k:k,v:v}}
    function bits2int(obits,q){var bits=new BN(obits)
        var shift=(obits.length<<3)-q.bitLength()
        if(shift>0){bits.ishrn(shift)}
        return bits}
    function bits2octets(bits,q){bits=bits2int(bits,q)
        bits=bits.mod(q)
        var out=new Buffer(bits.toArray())
        if(out.length<q.byteLength()){var zeros=new Buffer(q.byteLength()-out.length)
            zeros.fill(0)
            out=Buffer.concat([zeros,out])}
        return out}
    module.exports.makeKey=makeKey
    function makeKey(q,kv,algo){var t
        var k
        while(!0){t=new Buffer('')
            while(t.length*8<q.bitLength()){kv.v=createHmac(algo,kv.k).update(kv.v).digest()
                t=Buffer.concat([t,kv.v])}
            k=bits2int(t,q)
            kv.k=createHmac(algo,kv.k).update(kv.v).update(new Buffer([0])).digest()
            kv.v=createHmac(algo,kv.k).update(kv.v).digest()
            if(k.cmp(q)===-1){return k}}}
    function makeR(g,k,p,q){return g.toRed(BN.mont(p)).redPow(k).fromRed().mod(q)}}).call(this,require("buffer").Buffer)},{"./curves":136,"bn.js":137,"browserify-rsa":138,"buffer":111,"create-hmac":216,"elliptic":139,"parse-asn1":164}],179:[function(require,module,exports){(function(Buffer){'use strict'
    var parseKeys=require('parse-asn1')
    var elliptic=require('elliptic')
    var curves=require('./curves')
    var BN=require('bn.js')
    module.exports=verify
    function verify(sig,hash,key,signType){var pub=parseKeys(key)
        if(pub.type==='ec'){if(signType!=='ecdsa'){throw new Error('wrong public key type')}
            return ecVerify(sig,hash,pub)}else if(pub.type==='dsa'){if(signType!=='dsa'){throw new Error('wrong public key type')}
            return dsaVerify(sig,hash,pub)}else{if(signType!=='rsa'){throw new Error('wrong public key type')}}
        var len=pub.modulus.byteLength()
        var pad=[1]
        var padNum=0
        while(hash.length+pad.length+2<len){pad.push(0xff)
            padNum++}
        pad.push(0x00)
        var i=-1
        while(++i<hash.length){pad.push(hash[i])}
        pad=new Buffer(pad)
        var red=BN.mont(pub.modulus)
        sig=new BN(sig).toRed(red)
        sig=sig.redPow(new BN(pub.publicExponent))
        sig=new Buffer(sig.fromRed().toArray())
        var out=0
        if(padNum<8){out=1}
        len=Math.min(sig.length,pad.length)
        if(sig.length!==pad.length){out=1}
        i=-1
        while(++i<len){out|=(sig[i]^pad[i])}
        return out===0}
    function ecVerify(sig,hash,pub){var curveId=curves[pub.data.algorithm.curve.join('.')]
        if(!curveId)
            throw new Error('unknown curve '+pub.data.algorithm.curve.join('.'))
        var curve=new elliptic.ec(curveId)
        var pubkey=pub.data.subjectPrivateKey.data
        return curve.verify(hash,sig,pubkey)}
    function dsaVerify(sig,hash,pub){var p=pub.data.p
        var q=pub.data.q
        var g=pub.data.g
        var y=pub.data.pub_key
        var unpacked=parseKeys.signature.decode(sig,'der')
        var s=unpacked.s
        var r=unpacked.r
        checkValue(s,q)
        checkValue(r,q)
        var montq=BN.mont(q)
        var montp=BN.mont(p)
        var w=s.invm(q)
        var v=g.toRed(montp).redPow(new BN(hash).mul(w).mod(q)).fromRed().mul(y.toRed(montp).redPow(r.mul(w).mod(q)).fromRed()).mod(p).mod(q)
        return!v.cmp(r)}
    function checkValue(b,q){if(b.cmpn(0)<=0){throw new Error('invalid sig')}
        if(b.cmp(q)>=q){throw new Error('invalid sig')}}}).call(this,require("buffer").Buffer)},{"./curves":136,"bn.js":137,"buffer":111,"elliptic":139,"parse-asn1":164}],180:[function(require,module,exports){(function(Buffer){var elliptic=require('elliptic');var BN=require('bn.js');module.exports=function createECDH(curve){return new ECDH(curve)};var aliases={secp256k1:{name:'secp256k1',byteLength:32},secp224r1:{name:'p224',byteLength:28},prime256v1:{name:'p256',byteLength:32},prime192v1:{name:'p192',byteLength:24},ed25519:{name:'ed25519',byteLength:32}};aliases.p224=aliases.secp224r1;aliases.p256=aliases.secp256r1=aliases.prime256v1;aliases.p192=aliases.secp192r1=aliases.prime192v1;function ECDH(curve){this.curveType=aliases[curve];if(!this.curveType){this.curveType={name:curve}}
    this.curve=new elliptic.ec(this.curveType.name);this.keys=void 0}
    ECDH.prototype.generateKeys=function(enc,format){this.keys=this.curve.genKeyPair();return this.getPublicKey(enc,format)};ECDH.prototype.computeSecret=function(other,inenc,enc){inenc=inenc||'utf8';if(!Buffer.isBuffer(other)){other=new Buffer(other,inenc)}
        var otherPub=this.curve.keyFromPublic(other).getPublic();var out=otherPub.mul(this.keys.getPrivate()).getX();return formatReturnValue(out,enc,this.curveType.byteLength)};ECDH.prototype.getPublicKey=function(enc,format){var key=this.keys.getPublic(format==='compressed',!0);if(format==='hybrid'){if(key[key.length-1]%2){key[0]=7}else{key[0]=6}}
        return formatReturnValue(key,enc)};ECDH.prototype.getPrivateKey=function(enc){return formatReturnValue(this.keys.getPrivate(),enc)};ECDH.prototype.setPublicKey=function(pub,enc){enc=enc||'utf8';if(!Buffer.isBuffer(pub)){pub=new Buffer(pub,enc)}
        this.keys._importPublic(pub);return this};ECDH.prototype.setPrivateKey=function(priv,enc){enc=enc||'utf8';if(!Buffer.isBuffer(priv)){priv=new Buffer(priv,enc)}
        var _priv=new BN(priv);_priv=_priv.toString(16);this.keys._importPrivate(_priv);return this};function formatReturnValue(bn,enc,len){if(!Array.isArray(bn)){bn=bn.toArray()}
        var buf=new Buffer(bn);if(len&&buf.length<len){var zeros=new Buffer(len-buf.length);zeros.fill(0);buf=Buffer.concat([zeros,buf])}
        if(!enc){return buf}else{return buf.toString(enc)}}}).call(this,require("buffer").Buffer)},{"bn.js":182,"buffer":111,"elliptic":183}],181:[function(require,module,exports){var createECDH=require('crypto').createECDH;module.exports=createECDH||require('./browser')},{"./browser":180,"crypto":115}],182:[function(require,module,exports){arguments[4][137][0].apply(exports,arguments)},{"dup":137}],183:[function(require,module,exports){arguments[4][12][0].apply(exports,arguments)},{"../package.json":203,"./elliptic/curve":186,"./elliptic/curves":189,"./elliptic/ec":190,"./elliptic/hmac-drbg":193,"./elliptic/utils":195,"brorand":196,"dup":12}],184:[function(require,module,exports){arguments[4][13][0].apply(exports,arguments)},{"../../elliptic":183,"bn.js":182,"dup":13}],185:[function(require,module,exports){arguments[4][14][0].apply(exports,arguments)},{"../../elliptic":183,"../curve":186,"bn.js":182,"dup":14,"inherits":253}],186:[function(require,module,exports){arguments[4][15][0].apply(exports,arguments)},{"./base":184,"./edwards":185,"./mont":187,"./short":188,"dup":15}],187:[function(require,module,exports){arguments[4][16][0].apply(exports,arguments)},{"../curve":186,"bn.js":182,"dup":16,"inherits":253}],188:[function(require,module,exports){arguments[4][17][0].apply(exports,arguments)},{"../../elliptic":183,"../curve":186,"bn.js":182,"dup":17,"inherits":253}],189:[function(require,module,exports){arguments[4][18][0].apply(exports,arguments)},{"../elliptic":183,"./precomputed/secp256k1":194,"dup":18,"hash.js":197}],190:[function(require,module,exports){arguments[4][19][0].apply(exports,arguments)},{"../../elliptic":183,"./key":191,"./signature":192,"bn.js":182,"dup":19}],191:[function(require,module,exports){arguments[4][20][0].apply(exports,arguments)},{"../../elliptic":183,"bn.js":182,"dup":20}],192:[function(require,module,exports){arguments[4][21][0].apply(exports,arguments)},{"../../elliptic":183,"bn.js":182,"dup":21}],193:[function(require,module,exports){arguments[4][22][0].apply(exports,arguments)},{"../elliptic":183,"dup":22,"hash.js":197}],194:[function(require,module,exports){arguments[4][23][0].apply(exports,arguments)},{"dup":23}],195:[function(require,module,exports){arguments[4][24][0].apply(exports,arguments)},{"dup":24}],196:[function(require,module,exports){arguments[4][25][0].apply(exports,arguments)},{"dup":25}],197:[function(require,module,exports){arguments[4][26][0].apply(exports,arguments)},{"./hash/common":198,"./hash/hmac":199,"./hash/ripemd":200,"./hash/sha":201,"./hash/utils":202,"dup":26}],198:[function(require,module,exports){arguments[4][27][0].apply(exports,arguments)},{"../hash":197,"dup":27}],199:[function(require,module,exports){arguments[4][28][0].apply(exports,arguments)},{"../hash":197,"dup":28}],200:[function(require,module,exports){arguments[4][29][0].apply(exports,arguments)},{"../hash":197,"dup":29}],201:[function(require,module,exports){arguments[4][30][0].apply(exports,arguments)},{"../hash":197,"dup":30}],202:[function(require,module,exports){arguments[4][31][0].apply(exports,arguments)},{"dup":31,"inherits":253}],203:[function(require,module,exports){arguments[4][159][0].apply(exports,arguments)},{"dup":159}],204:[function(require,module,exports){(function(Buffer){'use strict';var inherits=require('inherits')
    var md5=require('./md5')
    var rmd160=require('ripemd160')
    var sha=require('sha.js')
    var Transform=require('stream').Transform
    function HashNoConstructor(hash){Transform.call(this)
        this._hash=hash
        this.buffers=[]}
    inherits(HashNoConstructor,Transform)
    HashNoConstructor.prototype._transform=function(data,_,next){this.buffers.push(data)
        next()}
    HashNoConstructor.prototype._flush=function(next){this.push(this.digest())
        next()}
    HashNoConstructor.prototype.update=function(data,enc){if(typeof data==='string'){data=new Buffer(data,enc)}
        this.buffers.push(data)
        return this}
    HashNoConstructor.prototype.digest=function(enc){var buf=Buffer.concat(this.buffers)
        var r=this._hash(buf)
        this.buffers=null
        return enc?r.toString(enc):r}
    function Hash(hash){Transform.call(this)
        this._hash=hash}
    inherits(Hash,Transform)
    Hash.prototype._transform=function(data,enc,next){if(enc)data=new Buffer(data,enc)
        this._hash.update(data)
        next()}
    Hash.prototype._flush=function(next){this.push(this._hash.digest())
        this._hash=null
        next()}
    Hash.prototype.update=function(data,enc){if(typeof data==='string'){data=new Buffer(data,enc)}
        this._hash.update(data)
        return this}
    Hash.prototype.digest=function(enc){var outData=this._hash.digest()
        return enc?outData.toString(enc):outData}
    module.exports=function createHash(alg){if('md5'===alg)return new HashNoConstructor(md5)
        if('rmd160'===alg)return new HashNoConstructor(rmd160)
        return new Hash(sha(alg))}}).call(this,require("buffer").Buffer)},{"./md5":206,"buffer":111,"inherits":253,"ripemd160":207,"sha.js":209,"stream":267}],205:[function(require,module,exports){(function(Buffer){'use strict';var intSize=4;var zeroBuffer=new Buffer(intSize);zeroBuffer.fill(0);var chrsz=8;function toArray(buf,bigEndian){if((buf.length%intSize)!==0){var len=buf.length+(intSize-(buf.length%intSize));buf=Buffer.concat([buf,zeroBuffer],len)}
    var arr=[];var fn=bigEndian?buf.readInt32BE:buf.readInt32LE;for(var i=0;i<buf.length;i+=intSize){arr.push(fn.call(buf,i))}
    return arr}
    function toBuffer(arr,size,bigEndian){var buf=new Buffer(size);var fn=bigEndian?buf.writeInt32BE:buf.writeInt32LE;for(var i=0;i<arr.length;i++){fn.call(buf,arr[i],i*4,!0)}
        return buf}
    function hash(buf,fn,hashSize,bigEndian){if(!Buffer.isBuffer(buf))buf=new Buffer(buf);var arr=fn(toArray(buf,bigEndian),buf.length*chrsz);return toBuffer(arr,hashSize,bigEndian)}
    exports.hash=hash}).call(this,require("buffer").Buffer)},{"buffer":111}],206:[function(require,module,exports){'use strict';var helpers=require('./helpers');function core_md5(x,len)
{x[len>>5]|=0x80<<((len)%32);x[(((len+64)>>>9)<<4)+14]=len;var a=1732584193;var b=-271733879;var c=-1732584194;var d=271733878;for(var i=0;i<x.length;i+=16)
{var olda=a;var oldb=b;var oldc=c;var oldd=d;a=md5_ff(a,b,c,d,x[i+0],7,-680876936);d=md5_ff(d,a,b,c,x[i+1],12,-389564586);c=md5_ff(c,d,a,b,x[i+2],17,606105819);b=md5_ff(b,c,d,a,x[i+3],22,-1044525330);a=md5_ff(a,b,c,d,x[i+4],7,-176418897);d=md5_ff(d,a,b,c,x[i+5],12,1200080426);c=md5_ff(c,d,a,b,x[i+6],17,-1473231341);b=md5_ff(b,c,d,a,x[i+7],22,-45705983);a=md5_ff(a,b,c,d,x[i+8],7,1770035416);d=md5_ff(d,a,b,c,x[i+9],12,-1958414417);c=md5_ff(c,d,a,b,x[i+10],17,-42063);b=md5_ff(b,c,d,a,x[i+11],22,-1990404162);a=md5_ff(a,b,c,d,x[i+12],7,1804603682);d=md5_ff(d,a,b,c,x[i+13],12,-40341101);c=md5_ff(c,d,a,b,x[i+14],17,-1502002290);b=md5_ff(b,c,d,a,x[i+15],22,1236535329);a=md5_gg(a,b,c,d,x[i+1],5,-165796510);d=md5_gg(d,a,b,c,x[i+6],9,-1069501632);c=md5_gg(c,d,a,b,x[i+11],14,643717713);b=md5_gg(b,c,d,a,x[i+0],20,-373897302);a=md5_gg(a,b,c,d,x[i+5],5,-701558691);d=md5_gg(d,a,b,c,x[i+10],9,38016083);c=md5_gg(c,d,a,b,x[i+15],14,-660478335);b=md5_gg(b,c,d,a,x[i+4],20,-405537848);a=md5_gg(a,b,c,d,x[i+9],5,568446438);d=md5_gg(d,a,b,c,x[i+14],9,-1019803690);c=md5_gg(c,d,a,b,x[i+3],14,-187363961);b=md5_gg(b,c,d,a,x[i+8],20,1163531501);a=md5_gg(a,b,c,d,x[i+13],5,-1444681467);d=md5_gg(d,a,b,c,x[i+2],9,-51403784);c=md5_gg(c,d,a,b,x[i+7],14,1735328473);b=md5_gg(b,c,d,a,x[i+12],20,-1926607734);a=md5_hh(a,b,c,d,x[i+5],4,-378558);d=md5_hh(d,a,b,c,x[i+8],11,-2022574463);c=md5_hh(c,d,a,b,x[i+11],16,1839030562);b=md5_hh(b,c,d,a,x[i+14],23,-35309556);a=md5_hh(a,b,c,d,x[i+1],4,-1530992060);d=md5_hh(d,a,b,c,x[i+4],11,1272893353);c=md5_hh(c,d,a,b,x[i+7],16,-155497632);b=md5_hh(b,c,d,a,x[i+10],23,-1094730640);a=md5_hh(a,b,c,d,x[i+13],4,681279174);d=md5_hh(d,a,b,c,x[i+0],11,-358537222);c=md5_hh(c,d,a,b,x[i+3],16,-722521979);b=md5_hh(b,c,d,a,x[i+6],23,76029189);a=md5_hh(a,b,c,d,x[i+9],4,-640364487);d=md5_hh(d,a,b,c,x[i+12],11,-421815835);c=md5_hh(c,d,a,b,x[i+15],16,530742520);b=md5_hh(b,c,d,a,x[i+2],23,-995338651);a=md5_ii(a,b,c,d,x[i+0],6,-198630844);d=md5_ii(d,a,b,c,x[i+7],10,1126891415);c=md5_ii(c,d,a,b,x[i+14],15,-1416354905);b=md5_ii(b,c,d,a,x[i+5],21,-57434055);a=md5_ii(a,b,c,d,x[i+12],6,1700485571);d=md5_ii(d,a,b,c,x[i+3],10,-1894986606);c=md5_ii(c,d,a,b,x[i+10],15,-1051523);b=md5_ii(b,c,d,a,x[i+1],21,-2054922799);a=md5_ii(a,b,c,d,x[i+8],6,1873313359);d=md5_ii(d,a,b,c,x[i+15],10,-30611744);c=md5_ii(c,d,a,b,x[i+6],15,-1560198380);b=md5_ii(b,c,d,a,x[i+13],21,1309151649);a=md5_ii(a,b,c,d,x[i+4],6,-145523070);d=md5_ii(d,a,b,c,x[i+11],10,-1120210379);c=md5_ii(c,d,a,b,x[i+2],15,718787259);b=md5_ii(b,c,d,a,x[i+9],21,-343485551);a=safe_add(a,olda);b=safe_add(b,oldb);c=safe_add(c,oldc);d=safe_add(d,oldd)}
    return Array(a,b,c,d)}
    function md5_cmn(q,a,b,x,s,t)
    {return safe_add(bit_rol(safe_add(safe_add(a,q),safe_add(x,t)),s),b)}
    function md5_ff(a,b,c,d,x,s,t)
    {return md5_cmn((b&c)|((~b)&d),a,b,x,s,t)}
    function md5_gg(a,b,c,d,x,s,t)
    {return md5_cmn((b&d)|(c&(~d)),a,b,x,s,t)}
    function md5_hh(a,b,c,d,x,s,t)
    {return md5_cmn(b^c^d,a,b,x,s,t)}
    function md5_ii(a,b,c,d,x,s,t)
    {return md5_cmn(c^(b|(~d)),a,b,x,s,t)}
    function safe_add(x,y)
    {var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF)}
    function bit_rol(num,cnt)
    {return(num<<cnt)|(num>>>(32-cnt))}
    module.exports=function md5(buf){return helpers.hash(buf,core_md5,16)}},{"./helpers":205}],207:[function(require,module,exports){(function(Buffer){var zl=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]
    var zr=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]
    var sl=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]
    var sr=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]
    var hl=[0x00000000,0x5A827999,0x6ED9EBA1,0x8F1BBCDC,0xA953FD4E]
    var hr=[0x50A28BE6,0x5C4DD124,0x6D703EF3,0x7A6D76E9,0x00000000]
    function bytesToWords(bytes){var words=[]
        for(var i=0,b=0;i<bytes.length;i++,b+=8){words[b>>>5]|=bytes[i]<<(24-b%32)}
        return words}
    function wordsToBytes(words){var bytes=[]
        for(var b=0;b<words.length*32;b+=8){bytes.push((words[b>>>5]>>>(24-b%32))&0xFF)}
        return bytes}
    function processBlock(H,M,offset){for(var i=0;i<16;i++){var offset_i=offset+i
        var M_offset_i=M[offset_i]
        M[offset_i]=((((M_offset_i<<8)|(M_offset_i>>>24))&0x00ff00ff)|(((M_offset_i<<24)|(M_offset_i>>>8))&0xff00ff00))}
        var al,bl,cl,dl,el
        var ar,br,cr,dr,er
        ar=al=H[0]
        br=bl=H[1]
        cr=cl=H[2]
        dr=dl=H[3]
        er=el=H[4]
        var t
        for(i=0;i<80;i+=1){t=(al+M[offset+zl[i]])|0
            if(i<16){t+=f1(bl,cl,dl)+hl[0]}else if(i<32){t+=f2(bl,cl,dl)+hl[1]}else if(i<48){t+=f3(bl,cl,dl)+hl[2]}else if(i<64){t+=f4(bl,cl,dl)+hl[3]}else{t+=f5(bl,cl,dl)+hl[4]}
            t=t|0
            t=rotl(t,sl[i])
            t=(t+el)|0
            al=el
            el=dl
            dl=rotl(cl,10)
            cl=bl
            bl=t
            t=(ar+M[offset+zr[i]])|0
            if(i<16){t+=f5(br,cr,dr)+hr[0]}else if(i<32){t+=f4(br,cr,dr)+hr[1]}else if(i<48){t+=f3(br,cr,dr)+hr[2]}else if(i<64){t+=f2(br,cr,dr)+hr[3]}else{t+=f1(br,cr,dr)+hr[4]}
            t=t|0
            t=rotl(t,sr[i])
            t=(t+er)|0
            ar=er
            er=dr
            dr=rotl(cr,10)
            cr=br
            br=t}
        t=(H[1]+cl+dr)|0
        H[1]=(H[2]+dl+er)|0
        H[2]=(H[3]+el+ar)|0
        H[3]=(H[4]+al+br)|0
        H[4]=(H[0]+bl+cr)|0
        H[0]=t}
    function f1(x,y,z){return((x)^(y)^(z))}
    function f2(x,y,z){return(((x)&(y))|((~x)&(z)))}
    function f3(x,y,z){return(((x)|(~(y)))^(z))}
    function f4(x,y,z){return(((x)&(z))|((y)&(~(z))))}
    function f5(x,y,z){return((x)^((y)|(~(z))))}
    function rotl(x,n){return(x<<n)|(x>>>(32-n))}
    function ripemd160(message){var H=[0x67452301,0xEFCDAB89,0x98BADCFE,0x10325476,0xC3D2E1F0]
        if(typeof message==='string'){message=new Buffer(message,'utf8')}
        var m=bytesToWords(message)
        var nBitsLeft=message.length*8
        var nBitsTotal=message.length*8
        m[nBitsLeft>>>5]|=0x80<<(24-nBitsLeft%32)
        m[(((nBitsLeft+64)>>>9)<<4)+14]=((((nBitsTotal<<8)|(nBitsTotal>>>24))&0x00ff00ff)|(((nBitsTotal<<24)|(nBitsTotal>>>8))&0xff00ff00))
        for(var i=0;i<m.length;i+=16){processBlock(H,m,i)}
        for(i=0;i<5;i++){var H_i=H[i]
            H[i]=(((H_i<<8)|(H_i>>>24))&0x00ff00ff)|(((H_i<<24)|(H_i>>>8))&0xff00ff00)}
        var digestbytes=wordsToBytes(H)
        return new Buffer(digestbytes)}
    module.exports=ripemd160}).call(this,require("buffer").Buffer)},{"buffer":111}],208:[function(require,module,exports){(function(Buffer){function Hash(blockSize,finalSize){this._block=new Buffer(blockSize)
    this._finalSize=finalSize
    this._blockSize=blockSize
    this._len=0
    this._s=0}
    Hash.prototype.update=function(data,enc){if(typeof data==='string'){enc=enc||'utf8'
        data=new Buffer(data,enc)}
        var l=this._len+=data.length
        var s=this._s||0
        var f=0
        var buffer=this._block
        while(s<l){var t=Math.min(data.length,f+this._blockSize-(s%this._blockSize))
            var ch=(t-f)
            for(var i=0;i<ch;i++){buffer[(s%this._blockSize)+i]=data[i+f]}
            s+=ch
            f+=ch
            if((s%this._blockSize)===0){this._update(buffer)}}
        this._s=s
        return this}
    Hash.prototype.digest=function(enc){var l=this._len*8
        this._block[this._len%this._blockSize]=0x80
        this._block.fill(0,this._len%this._blockSize+1)
        if(l%(this._blockSize*8)>=this._finalSize*8){this._update(this._block)
            this._block.fill(0)}
        this._block.writeInt32BE(l,this._blockSize-4)
        var hash=this._update(this._block)||this._hash()
        return enc?hash.toString(enc):hash}
    Hash.prototype._update=function(){throw new Error('_update must be implemented by subclass')}
    module.exports=Hash}).call(this,require("buffer").Buffer)},{"buffer":111}],209:[function(require,module,exports){var exports=module.exports=function SHA(algorithm){algorithm=algorithm.toLowerCase()
    var Algorithm=exports[algorithm]
    if(!Algorithm)throw new Error(algorithm+' is not supported (we accept pull requests)')
    return new Algorithm()}
    exports.sha=require('./sha')
    exports.sha1=require('./sha1')
    exports.sha224=require('./sha224')
    exports.sha256=require('./sha256')
    exports.sha384=require('./sha384')
    exports.sha512=require('./sha512')},{"./sha":210,"./sha1":211,"./sha224":212,"./sha256":213,"./sha384":214,"./sha512":215}],210:[function(require,module,exports){(function(Buffer){var inherits=require('inherits')
    var Hash=require('./hash')
    var W=new Array(80)
    function Sha(){this.init()
        this._w=W
        Hash.call(this,64,56)}
    inherits(Sha,Hash)
    Sha.prototype.init=function(){this._a=0x67452301|0
        this._b=0xefcdab89|0
        this._c=0x98badcfe|0
        this._d=0x10325476|0
        this._e=0xc3d2e1f0|0
        return this}
    function rol(num,cnt){return(num<<cnt)|(num>>>(32-cnt))}
    Sha.prototype._update=function(M){var W=this._w
        var a=this._a
        var b=this._b
        var c=this._c
        var d=this._d
        var e=this._e
        var j=0,k
        function calcW(){return W[j-3]^W[j-8]^W[j-14]^W[j-16]}
        function loop(w,f){W[j]=w
            var t=rol(a,5)+f+e+w+k
            e=d
            d=c
            c=rol(b,30)
            b=a
            a=t
            j++}
        k=1518500249
        while(j<16)loop(M.readInt32BE(j*4),(b&c)|((~b)&d))
        while(j<20)loop(calcW(),(b&c)|((~b)&d))
        k=1859775393
        while(j<40)loop(calcW(),b^c^d)
        k=-1894007588
        while(j<60)loop(calcW(),(b&c)|(b&d)|(c&d))
        k=-899497514
        while(j<80)loop(calcW(),b^c^d)
        this._a=(a+this._a)|0
        this._b=(b+this._b)|0
        this._c=(c+this._c)|0
        this._d=(d+this._d)|0
        this._e=(e+this._e)|0}
    Sha.prototype._hash=function(){var H=new Buffer(20)
        H.writeInt32BE(this._a|0,0)
        H.writeInt32BE(this._b|0,4)
        H.writeInt32BE(this._c|0,8)
        H.writeInt32BE(this._d|0,12)
        H.writeInt32BE(this._e|0,16)
        return H}
    module.exports=Sha}).call(this,require("buffer").Buffer)},{"./hash":208,"buffer":111,"inherits":253}],211:[function(require,module,exports){(function(Buffer){var inherits=require('inherits')
    var Hash=require('./hash')
    var W=new Array(80)
    function Sha1(){this.init()
        this._w=W
        Hash.call(this,64,56)}
    inherits(Sha1,Hash)
    Sha1.prototype.init=function(){this._a=0x67452301|0
        this._b=0xefcdab89|0
        this._c=0x98badcfe|0
        this._d=0x10325476|0
        this._e=0xc3d2e1f0|0
        return this}
    function rol(num,cnt){return(num<<cnt)|(num>>>(32-cnt))}
    Sha1.prototype._update=function(M){var W=this._w
        var a=this._a
        var b=this._b
        var c=this._c
        var d=this._d
        var e=this._e
        var j=0,k
        function calcW(){return rol(W[j-3]^W[j-8]^W[j-14]^W[j-16],1)}
        function loop(w,f){W[j]=w
            var t=rol(a,5)+f+e+w+k
            e=d
            d=c
            c=rol(b,30)
            b=a
            a=t
            j++}
        k=1518500249
        while(j<16)loop(M.readInt32BE(j*4),(b&c)|((~b)&d))
        while(j<20)loop(calcW(),(b&c)|((~b)&d))
        k=1859775393
        while(j<40)loop(calcW(),b^c^d)
        k=-1894007588
        while(j<60)loop(calcW(),(b&c)|(b&d)|(c&d))
        k=-899497514
        while(j<80)loop(calcW(),b^c^d)
        this._a=(a+this._a)|0
        this._b=(b+this._b)|0
        this._c=(c+this._c)|0
        this._d=(d+this._d)|0
        this._e=(e+this._e)|0}
    Sha1.prototype._hash=function(){var H=new Buffer(20)
        H.writeInt32BE(this._a|0,0)
        H.writeInt32BE(this._b|0,4)
        H.writeInt32BE(this._c|0,8)
        H.writeInt32BE(this._d|0,12)
        H.writeInt32BE(this._e|0,16)
        return H}
    module.exports=Sha1}).call(this,require("buffer").Buffer)},{"./hash":208,"buffer":111,"inherits":253}],212:[function(require,module,exports){(function(Buffer){var inherits=require('inherits')
    var Sha256=require('./sha256')
    var Hash=require('./hash')
    var W=new Array(64)
    function Sha224(){this.init()
        this._w=W
        Hash.call(this,64,56)}
    inherits(Sha224,Sha256)
    Sha224.prototype.init=function(){this._a=0xc1059ed8|0
        this._b=0x367cd507|0
        this._c=0x3070dd17|0
        this._d=0xf70e5939|0
        this._e=0xffc00b31|0
        this._f=0x68581511|0
        this._g=0x64f98fa7|0
        this._h=0xbefa4fa4|0
        return this}
    Sha224.prototype._hash=function(){var H=new Buffer(28)
        H.writeInt32BE(this._a,0)
        H.writeInt32BE(this._b,4)
        H.writeInt32BE(this._c,8)
        H.writeInt32BE(this._d,12)
        H.writeInt32BE(this._e,16)
        H.writeInt32BE(this._f,20)
        H.writeInt32BE(this._g,24)
        return H}
    module.exports=Sha224}).call(this,require("buffer").Buffer)},{"./hash":208,"./sha256":213,"buffer":111,"inherits":253}],213:[function(require,module,exports){(function(Buffer){var inherits=require('inherits')
    var Hash=require('./hash')
    var K=[0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0x0FC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x06CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2]
    var W=new Array(64)
    function Sha256(){this.init()
        this._w=W
        Hash.call(this,64,56)}
    inherits(Sha256,Hash)
    Sha256.prototype.init=function(){this._a=0x6a09e667|0
        this._b=0xbb67ae85|0
        this._c=0x3c6ef372|0
        this._d=0xa54ff53a|0
        this._e=0x510e527f|0
        this._f=0x9b05688c|0
        this._g=0x1f83d9ab|0
        this._h=0x5be0cd19|0
        return this}
    function S(X,n){return(X>>>n)|(X<<(32-n))}
    function R(X,n){return(X>>>n)}
    function Ch(x,y,z){return((x&y)^((~x)&z))}
    function Maj(x,y,z){return((x&y)^(x&z)^(y&z))}
    function Sigma0256(x){return(S(x,2)^S(x,13)^S(x,22))}
    function Sigma1256(x){return(S(x,6)^S(x,11)^S(x,25))}
    function Gamma0256(x){return(S(x,7)^S(x,18)^R(x,3))}
    function Gamma1256(x){return(S(x,17)^S(x,19)^R(x,10))}
    Sha256.prototype._update=function(M){var W=this._w
        var a=this._a|0
        var b=this._b|0
        var c=this._c|0
        var d=this._d|0
        var e=this._e|0
        var f=this._f|0
        var g=this._g|0
        var h=this._h|0
        var j=0
        function calcW(){return Gamma1256(W[j-2])+W[j-7]+Gamma0256(W[j-15])+W[j-16]}
        function loop(w){W[j]=w
            var T1=h+Sigma1256(e)+Ch(e,f,g)+K[j]+w
            var T2=Sigma0256(a)+Maj(a,b,c)
            h=g
            g=f
            f=e
            e=d+T1
            d=c
            c=b
            b=a
            a=T1+T2
            j++}
        while(j<16)loop(M.readInt32BE(j*4))
        while(j<64)loop(calcW())
        this._a=(a+this._a)|0
        this._b=(b+this._b)|0
        this._c=(c+this._c)|0
        this._d=(d+this._d)|0
        this._e=(e+this._e)|0
        this._f=(f+this._f)|0
        this._g=(g+this._g)|0
        this._h=(h+this._h)|0}
    Sha256.prototype._hash=function(){var H=new Buffer(32)
        H.writeInt32BE(this._a,0)
        H.writeInt32BE(this._b,4)
        H.writeInt32BE(this._c,8)
        H.writeInt32BE(this._d,12)
        H.writeInt32BE(this._e,16)
        H.writeInt32BE(this._f,20)
        H.writeInt32BE(this._g,24)
        H.writeInt32BE(this._h,28)
        return H}
    module.exports=Sha256}).call(this,require("buffer").Buffer)},{"./hash":208,"buffer":111,"inherits":253}],214:[function(require,module,exports){(function(Buffer){var inherits=require('inherits')
    var SHA512=require('./sha512')
    var Hash=require('./hash')
    var W=new Array(160)
    function Sha384(){this.init()
        this._w=W
        Hash.call(this,128,112)}
    inherits(Sha384,SHA512)
    Sha384.prototype.init=function(){this._a=0xcbbb9d5d|0
        this._b=0x629a292a|0
        this._c=0x9159015a|0
        this._d=0x152fecd8|0
        this._e=0x67332667|0
        this._f=0x8eb44a87|0
        this._g=0xdb0c2e0d|0
        this._h=0x47b5481d|0
        this._al=0xc1059ed8|0
        this._bl=0x367cd507|0
        this._cl=0x3070dd17|0
        this._dl=0xf70e5939|0
        this._el=0xffc00b31|0
        this._fl=0x68581511|0
        this._gl=0x64f98fa7|0
        this._hl=0xbefa4fa4|0
        return this}
    Sha384.prototype._hash=function(){var H=new Buffer(48)
        function writeInt64BE(h,l,offset){H.writeInt32BE(h,offset)
            H.writeInt32BE(l,offset+4)}
        writeInt64BE(this._a,this._al,0)
        writeInt64BE(this._b,this._bl,8)
        writeInt64BE(this._c,this._cl,16)
        writeInt64BE(this._d,this._dl,24)
        writeInt64BE(this._e,this._el,32)
        writeInt64BE(this._f,this._fl,40)
        return H}
    module.exports=Sha384}).call(this,require("buffer").Buffer)},{"./hash":208,"./sha512":215,"buffer":111,"inherits":253}],215:[function(require,module,exports){(function(Buffer){var inherits=require('inherits')
    var Hash=require('./hash')
    var K=[0x428a2f98,0xd728ae22,0x71374491,0x23ef65cd,0xb5c0fbcf,0xec4d3b2f,0xe9b5dba5,0x8189dbbc,0x3956c25b,0xf348b538,0x59f111f1,0xb605d019,0x923f82a4,0xaf194f9b,0xab1c5ed5,0xda6d8118,0xd807aa98,0xa3030242,0x12835b01,0x45706fbe,0x243185be,0x4ee4b28c,0x550c7dc3,0xd5ffb4e2,0x72be5d74,0xf27b896f,0x80deb1fe,0x3b1696b1,0x9bdc06a7,0x25c71235,0xc19bf174,0xcf692694,0xe49b69c1,0x9ef14ad2,0xefbe4786,0x384f25e3,0x0fc19dc6,0x8b8cd5b5,0x240ca1cc,0x77ac9c65,0x2de92c6f,0x592b0275,0x4a7484aa,0x6ea6e483,0x5cb0a9dc,0xbd41fbd4,0x76f988da,0x831153b5,0x983e5152,0xee66dfab,0xa831c66d,0x2db43210,0xb00327c8,0x98fb213f,0xbf597fc7,0xbeef0ee4,0xc6e00bf3,0x3da88fc2,0xd5a79147,0x930aa725,0x06ca6351,0xe003826f,0x14292967,0x0a0e6e70,0x27b70a85,0x46d22ffc,0x2e1b2138,0x5c26c926,0x4d2c6dfc,0x5ac42aed,0x53380d13,0x9d95b3df,0x650a7354,0x8baf63de,0x766a0abb,0x3c77b2a8,0x81c2c92e,0x47edaee6,0x92722c85,0x1482353b,0xa2bfe8a1,0x4cf10364,0xa81a664b,0xbc423001,0xc24b8b70,0xd0f89791,0xc76c51a3,0x0654be30,0xd192e819,0xd6ef5218,0xd6990624,0x5565a910,0xf40e3585,0x5771202a,0x106aa070,0x32bbd1b8,0x19a4c116,0xb8d2d0c8,0x1e376c08,0x5141ab53,0x2748774c,0xdf8eeb99,0x34b0bcb5,0xe19b48a8,0x391c0cb3,0xc5c95a63,0x4ed8aa4a,0xe3418acb,0x5b9cca4f,0x7763e373,0x682e6ff3,0xd6b2b8a3,0x748f82ee,0x5defb2fc,0x78a5636f,0x43172f60,0x84c87814,0xa1f0ab72,0x8cc70208,0x1a6439ec,0x90befffa,0x23631e28,0xa4506ceb,0xde82bde9,0xbef9a3f7,0xb2c67915,0xc67178f2,0xe372532b,0xca273ece,0xea26619c,0xd186b8c7,0x21c0c207,0xeada7dd6,0xcde0eb1e,0xf57d4f7f,0xee6ed178,0x06f067aa,0x72176fba,0x0a637dc5,0xa2c898a6,0x113f9804,0xbef90dae,0x1b710b35,0x131c471b,0x28db77f5,0x23047d84,0x32caab7b,0x40c72493,0x3c9ebe0a,0x15c9bebc,0x431d67c4,0x9c100d4c,0x4cc5d4be,0xcb3e42b6,0x597f299c,0xfc657e2a,0x5fcb6fab,0x3ad6faec,0x6c44198c,0x4a475817]
    var W=new Array(160)
    function Sha512(){this.init()
        this._w=W
        Hash.call(this,128,112)}
    inherits(Sha512,Hash)
    Sha512.prototype.init=function(){this._a=0x6a09e667|0
        this._b=0xbb67ae85|0
        this._c=0x3c6ef372|0
        this._d=0xa54ff53a|0
        this._e=0x510e527f|0
        this._f=0x9b05688c|0
        this._g=0x1f83d9ab|0
        this._h=0x5be0cd19|0
        this._al=0xf3bcc908|0
        this._bl=0x84caa73b|0
        this._cl=0xfe94f82b|0
        this._dl=0x5f1d36f1|0
        this._el=0xade682d1|0
        this._fl=0x2b3e6c1f|0
        this._gl=0xfb41bd6b|0
        this._hl=0x137e2179|0
        return this}
    function S(X,Xl,n){return(X>>>n)|(Xl<<(32-n))}
    function Ch(x,y,z){return((x&y)^((~x)&z))}
    function Maj(x,y,z){return((x&y)^(x&z)^(y&z))}
    Sha512.prototype._update=function(M){var W=this._w
        var a=this._a|0
        var b=this._b|0
        var c=this._c|0
        var d=this._d|0
        var e=this._e|0
        var f=this._f|0
        var g=this._g|0
        var h=this._h|0
        var al=this._al|0
        var bl=this._bl|0
        var cl=this._cl|0
        var dl=this._dl|0
        var el=this._el|0
        var fl=this._fl|0
        var gl=this._gl|0
        var hl=this._hl|0
        var i=0,j=0
        var Wi,Wil
        function calcW(){var x=W[j-15*2]
            var xl=W[j-15*2+1]
            var gamma0=S(x,xl,1)^S(x,xl,8)^(x>>>7)
            var gamma0l=S(xl,x,1)^S(xl,x,8)^S(xl,x,7)
            x=W[j-2*2]
            xl=W[j-2*2+1]
            var gamma1=S(x,xl,19)^S(xl,x,29)^(x>>>6)
            var gamma1l=S(xl,x,19)^S(x,xl,29)^S(xl,x,6)
            var Wi7=W[j-7*2]
            var Wi7l=W[j-7*2+1]
            var Wi16=W[j-16*2]
            var Wi16l=W[j-16*2+1]
            Wil=gamma0l+Wi7l
            Wi=gamma0+Wi7+((Wil>>>0)<(gamma0l>>>0)?1:0)
            Wil=Wil+gamma1l
            Wi=Wi+gamma1+((Wil>>>0)<(gamma1l>>>0)?1:0)
            Wil=Wil+Wi16l
            Wi=Wi+Wi16+((Wil>>>0)<(Wi16l>>>0)?1:0)}
        function loop(){W[j]=Wi
            W[j+1]=Wil
            var maj=Maj(a,b,c)
            var majl=Maj(al,bl,cl)
            var sigma0h=S(a,al,28)^S(al,a,2)^S(al,a,7)
            var sigma0l=S(al,a,28)^S(a,al,2)^S(a,al,7)
            var sigma1h=S(e,el,14)^S(e,el,18)^S(el,e,9)
            var sigma1l=S(el,e,14)^S(el,e,18)^S(e,el,9)
            var Ki=K[j]
            var Kil=K[j+1]
            var ch=Ch(e,f,g)
            var chl=Ch(el,fl,gl)
            var t1l=hl+sigma1l
            var t1=h+sigma1h+((t1l>>>0)<(hl>>>0)?1:0)
            t1l=t1l+chl
            t1=t1+ch+((t1l>>>0)<(chl>>>0)?1:0)
            t1l=t1l+Kil
            t1=t1+Ki+((t1l>>>0)<(Kil>>>0)?1:0)
            t1l=t1l+Wil
            t1=t1+Wi+((t1l>>>0)<(Wil>>>0)?1:0)
            var t2l=sigma0l+majl
            var t2=sigma0h+maj+((t2l>>>0)<(sigma0l>>>0)?1:0)
            h=g
            hl=gl
            g=f
            gl=fl
            f=e
            fl=el
            el=(dl+t1l)|0
            e=(d+t1+((el>>>0)<(dl>>>0)?1:0))|0
            d=c
            dl=cl
            c=b
            cl=bl
            b=a
            bl=al
            al=(t1l+t2l)|0
            a=(t1+t2+((al>>>0)<(t1l>>>0)?1:0))|0
            i++
            j+=2}
        while(i<16){Wi=M.readInt32BE(j*4)
            Wil=M.readInt32BE(j*4+4)
            loop()}
        while(i<80){calcW()
            loop()}
        this._al=(this._al+al)|0
        this._bl=(this._bl+bl)|0
        this._cl=(this._cl+cl)|0
        this._dl=(this._dl+dl)|0
        this._el=(this._el+el)|0
        this._fl=(this._fl+fl)|0
        this._gl=(this._gl+gl)|0
        this._hl=(this._hl+hl)|0
        this._a=(this._a+a+((this._al>>>0)<(al>>>0)?1:0))|0
        this._b=(this._b+b+((this._bl>>>0)<(bl>>>0)?1:0))|0
        this._c=(this._c+c+((this._cl>>>0)<(cl>>>0)?1:0))|0
        this._d=(this._d+d+((this._dl>>>0)<(dl>>>0)?1:0))|0
        this._e=(this._e+e+((this._el>>>0)<(el>>>0)?1:0))|0
        this._f=(this._f+f+((this._fl>>>0)<(fl>>>0)?1:0))|0
        this._g=(this._g+g+((this._gl>>>0)<(gl>>>0)?1:0))|0
        this._h=(this._h+h+((this._hl>>>0)<(hl>>>0)?1:0))|0}
    Sha512.prototype._hash=function(){var H=new Buffer(64)
        function writeInt64BE(h,l,offset){H.writeInt32BE(h,offset)
            H.writeInt32BE(l,offset+4)}
        writeInt64BE(this._a,this._al,0)
        writeInt64BE(this._b,this._bl,8)
        writeInt64BE(this._c,this._cl,16)
        writeInt64BE(this._d,this._dl,24)
        writeInt64BE(this._e,this._el,32)
        writeInt64BE(this._f,this._fl,40)
        writeInt64BE(this._g,this._gl,48)
        writeInt64BE(this._h,this._hl,56)
        return H}
    module.exports=Sha512}).call(this,require("buffer").Buffer)},{"./hash":208,"buffer":111,"inherits":253}],216:[function(require,module,exports){(function(Buffer){'use strict';var createHash=require('create-hash/browser');var inherits=require('inherits')
    var Transform=require('stream').Transform
    var ZEROS=new Buffer(128)
    ZEROS.fill(0)
    function Hmac(alg,key){Transform.call(this)
        if(typeof key==='string'){key=new Buffer(key)}
        var blocksize=(alg==='sha512'||alg==='sha384')?128:64
        this._alg=alg
        this._key=key
        if(key.length>blocksize){key=createHash(alg).update(key).digest()}else if(key.length<blocksize){key=Buffer.concat([key,ZEROS],blocksize)}
        var ipad=this._ipad=new Buffer(blocksize)
        var opad=this._opad=new Buffer(blocksize)
        for(var i=0;i<blocksize;i++){ipad[i]=key[i]^0x36
            opad[i]=key[i]^0x5C}
        this._hash=createHash(alg).update(ipad)}
    inherits(Hmac,Transform)
    Hmac.prototype.update=function(data,enc){this._hash.update(data,enc)
        return this}
    Hmac.prototype._transform=function(data,_,next){this._hash.update(data)
        next()}
    Hmac.prototype._flush=function(next){this.push(this.digest())
        next()}
    Hmac.prototype.digest=function(enc){var h=this._hash.digest()
        return createHash(this._alg).update(this._opad).update(h).digest(enc)}
    module.exports=function createHmac(alg,key){return new Hmac(alg,key)}}).call(this,require("buffer").Buffer)},{"buffer":111,"create-hash/browser":204,"inherits":253,"stream":267}],217:[function(require,module,exports){(function(Buffer){var generatePrime=require('./lib/generatePrime');var primes=require('./lib/primes');var DH=require('./lib/dh');function getDiffieHellman(mod){var prime=new Buffer(primes[mod].prime,'hex');var gen=new Buffer(primes[mod].gen,'hex');return new DH(prime,gen)}
    function createDiffieHellman(prime,enc,generator,genc){if(Buffer.isBuffer(enc)||(typeof enc==='string'&&['hex','binary','base64'].indexOf(enc)===-1)){genc=generator;generator=enc;enc=undefined}
        enc=enc||'binary';genc=genc||'binary';generator=generator||new Buffer([2]);if(!Buffer.isBuffer(generator)){generator=new Buffer(generator,genc)}
        if(typeof prime==='number'){return new DH(generatePrime(prime,generator),generator,!0)}
        if(!Buffer.isBuffer(prime)){prime=new Buffer(prime,enc)}
        return new DH(prime,generator,!0)}
    exports.DiffieHellmanGroup=exports.createDiffieHellmanGroup=exports.getDiffieHellman=getDiffieHellman;exports.createDiffieHellman=exports.DiffieHellman=createDiffieHellman}).call(this,require("buffer").Buffer)},{"./lib/dh":218,"./lib/generatePrime":219,"./lib/primes":220,"buffer":111}],218:[function(require,module,exports){(function(Buffer){var BN=require('bn.js');var MillerRabin=require('miller-rabin');var millerRabin=new MillerRabin();var TWENTYFOUR=new BN(24);var ELEVEN=new BN(11);var TEN=new BN(10);var THREE=new BN(3);var SEVEN=new BN(7);var primes=require('./generatePrime');var randomBytes=require('randombytes');module.exports=DH;function setPublicKey(pub,enc){enc=enc||'utf8';if(!Buffer.isBuffer(pub)){pub=new Buffer(pub,enc)}
    this._pub=new BN(pub);return this}
    function setPrivateKey(priv,enc){enc=enc||'utf8';if(!Buffer.isBuffer(priv)){priv=new Buffer(priv,enc)}
        this._priv=new BN(priv);return this}
    var primeCache={};function checkPrime(prime,generator){var gen=generator.toString('hex');var hex=[gen,prime.toString(16)].join('_');if(hex in primeCache){return primeCache[hex]}
        var error=0;if(prime.isEven()||!primes.simpleSieve||!primes.fermatTest(prime)||!millerRabin.test(prime)){error+=1;if(gen==='02'||gen==='05'){error+=8}else{error+=4}
            primeCache[hex]=error;return error}
        if(!millerRabin.test(prime.shrn(1))){error+=2}
        var rem;switch(gen){case '02':if(prime.mod(TWENTYFOUR).cmp(ELEVEN)){error+=8}
            break;case '05':rem=prime.mod(TEN);if(rem.cmp(THREE)&&rem.cmp(SEVEN)){error+=8}
            break;default:error+=4}
        primeCache[hex]=error;return error}
    function defineError(self,error){try{Object.defineProperty(self,'verifyError',{enumerable:!0,value:error,writable:!1})}catch(e){self.verifyError=error}}
    function DH(prime,generator,malleable){this.setGenerator(generator);this.__prime=new BN(prime);this._prime=BN.mont(this.__prime);this._primeLen=prime.length;this._pub=void 0;this._priv=void 0;if(malleable){this.setPublicKey=setPublicKey;this.setPrivateKey=setPrivateKey;defineError(this,checkPrime(this.__prime,generator))}else{defineError(this,8)}}
    DH.prototype.generateKeys=function(){if(!this._priv){this._priv=new BN(randomBytes(this._primeLen))}
        this._pub=this._gen.toRed(this._prime).redPow(this._priv).fromRed();return this.getPublicKey()};DH.prototype.computeSecret=function(other){other=new BN(other);other=other.toRed(this._prime);var secret=other.redPow(this._priv).fromRed();var out=new Buffer(secret.toArray());var prime=this.getPrime();if(out.length<prime.length){var front=new Buffer(prime.length-out.length);front.fill(0);out=Buffer.concat([front,out])}
        return out};DH.prototype.getPublicKey=function getPublicKey(enc){return formatReturnValue(this._pub,enc)};DH.prototype.getPrivateKey=function getPrivateKey(enc){return formatReturnValue(this._priv,enc)};DH.prototype.getPrime=function(enc){return formatReturnValue(this.__prime,enc)};DH.prototype.getGenerator=function(enc){return formatReturnValue(this._gen,enc)};DH.prototype.setGenerator=function(gen,enc){enc=enc||'utf8';if(!Buffer.isBuffer(gen)){gen=new Buffer(gen,enc)}
        this._gen=new BN(gen);return this};function formatReturnValue(bn,enc){var buf=new Buffer(bn.toArray());if(!enc){return buf}else{return buf.toString(enc)}}}).call(this,require("buffer").Buffer)},{"./generatePrime":219,"bn.js":221,"buffer":111,"miller-rabin":222,"randombytes":251}],219:[function(require,module,exports){var randomBytes=require('randombytes');module.exports=findPrime;findPrime.simpleSieve=simpleSieve;findPrime.fermatTest=fermatTest;var BN=require('bn.js');var TWENTYFOUR=new BN(24);var MillerRabin=require('miller-rabin');var millerRabin=new MillerRabin();var ONE=new BN(1);var TWO=new BN(2);var FIVE=new BN(5);var SIXTEEN=new BN(16);var EIGHT=new BN(8);var TEN=new BN(10);var THREE=new BN(3);var SEVEN=new BN(7);var ELEVEN=new BN(11);var FOUR=new BN(4);var TWELVE=new BN(12);var primes=null;function _getPrimes(){if(primes!==null)
    return primes;var limit=0x100000;var res=[];res[0]=2;for(var i=1,k=3;k<limit;k+=2){var sqrt=Math.ceil(Math.sqrt(k));for(var j=0;j<i&&res[j]<=sqrt;j++)
    if(k%res[j]===0)
        break;if(i!==j&&res[j]<=sqrt)
    continue;res[i++]=k}
    primes=res;return res}
    function simpleSieve(p){var primes=_getPrimes();for(var i=0;i<primes.length;i++)
        if(p.modn(primes[i])===0){if(p.cmpn(primes[i])===0){return!0}else{return!1}}
        return!0}
    function fermatTest(p){var red=BN.mont(p);return TWO.toRed(red).redPow(p.subn(1)).fromRed().cmpn(1)===0}
    function findPrime(bits,gen){if(bits<16){if(gen===2||gen===5){return new BN([0x8c,0x7b])}else{return new BN([0x8c,0x27])}}
        gen=new BN(gen);var runs,comp;function generateRandom(bits){runs=-1;var out=new BN(randomBytes(Math.ceil(bits/8)));while(out.bitLength()>bits){out.ishrn(1)}
            if(out.isEven()){out.iadd(ONE)}
            if(!out.testn(1)){out.iadd(TWO)}
            if(!gen.cmp(TWO)){while(out.mod(TWENTYFOUR).cmp(ELEVEN)){out.iadd(FOUR)}
                comp={major:[TWENTYFOUR],minor:[TWELVE]}}else if(!gen.cmp(FIVE)){rem=out.mod(TEN);while(rem.cmp(THREE)){out.iadd(FOUR);rem=out.mod(TEN)}
                comp={major:[FOUR,SIXTEEN],minor:[TWO,EIGHT]}}else{comp={major:[FOUR],minor:[TWO]}}
            return out}
        var num=generateRandom(bits);var n2=num.shrn(1);while(!0){while(num.bitLength()>bits){num=generateRandom(bits);n2=num.shrn(1)}
            runs++;if(simpleSieve(n2)&&simpleSieve(num)&&fermatTest(n2)&&fermatTest(num)&&millerRabin.test(n2)&&millerRabin.test(num)){return num}
            num.iadd(comp.major[runs%comp.major.length]);n2.iadd(comp.minor[runs%comp.minor.length])}}},{"bn.js":221,"miller-rabin":222,"randombytes":251}],220:[function(require,module,exports){module.exports={"modp1":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a63a3620ffffffffffffffff"},"modp2":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece65381ffffffffffffffff"},"modp5":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca237327ffffffffffffffff"},"modp14":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aacaa68ffffffffffffffff"},"modp15":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a93ad2caffffffffffffffff"},"modp16":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c934063199ffffffffffffffff"},"modp17":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c93402849236c3fab4d27c7026c1d4dcb2602646dec9751e763dba37bdf8ff9406ad9e530ee5db382f413001aeb06a53ed9027d831179727b0865a8918da3edbebcf9b14ed44ce6cbaced4bb1bdb7f1447e6cc254b332051512bd7af426fb8f401378cd2bf5983ca01c64b92ecf032ea15d1721d03f482d7ce6e74fef6d55e702f46980c82b5a84031900b1c9e59e7c97fbec7e8f323a97a7e36cc88be0f1d45b7ff585ac54bd407b22b4154aacc8f6d7ebf48e1d814cc5ed20f8037e0a79715eef29be32806a1d58bb7c5da76f550aa3d8a1fbff0eb19ccb1a313d55cda56c9ec2ef29632387fe8d76e3c0468043e8f663f4860ee12bf2d5b0b7474d6e694f91e6dcc4024ffffffffffffffff"},"modp18":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c93402849236c3fab4d27c7026c1d4dcb2602646dec9751e763dba37bdf8ff9406ad9e530ee5db382f413001aeb06a53ed9027d831179727b0865a8918da3edbebcf9b14ed44ce6cbaced4bb1bdb7f1447e6cc254b332051512bd7af426fb8f401378cd2bf5983ca01c64b92ecf032ea15d1721d03f482d7ce6e74fef6d55e702f46980c82b5a84031900b1c9e59e7c97fbec7e8f323a97a7e36cc88be0f1d45b7ff585ac54bd407b22b4154aacc8f6d7ebf48e1d814cc5ed20f8037e0a79715eef29be32806a1d58bb7c5da76f550aa3d8a1fbff0eb19ccb1a313d55cda56c9ec2ef29632387fe8d76e3c0468043e8f663f4860ee12bf2d5b0b7474d6e694f91e6dbe115974a3926f12fee5e438777cb6a932df8cd8bec4d073b931ba3bc832b68d9dd300741fa7bf8afc47ed2576f6936ba424663aab639c5ae4f5683423b4742bf1c978238f16cbe39d652de3fdb8befc848ad922222e04a4037c0713eb57a81a23f0c73473fc646cea306b4bcbc8862f8385ddfa9d4b7fa2c087e879683303ed5bdd3a062b3cf5b3a278a66d2a13f83f44f82ddf310ee074ab6a364597e899a0255dc164f31cc50846851df9ab48195ded7ea1b1d510bd7ee74d73faf36bc31ecfa268359046f4eb879f924009438b481c6cd7889a002ed5ee382bc9190da6fc026e479558e4475677e9aa9e3050e2765694dfc81f56e880b96e7160c980dd98edd3dfffffffffffffffff"}}},{}],221:[function(require,module,exports){arguments[4][137][0].apply(exports,arguments)},{"dup":137}],222:[function(require,module,exports){var bn=require('bn.js');var brorand=require('brorand');function MillerRabin(rand){this.rand=rand||new brorand.Rand()}
    module.exports=MillerRabin;MillerRabin.create=function create(rand){return new MillerRabin(rand)};MillerRabin.prototype._rand=function _rand(n){var len=n.bitLength();var buf=this.rand.generate(Math.ceil(len/8));buf[0]|=3;var mask=len&0x7;if(mask!==0)
        buf[buf.length-1]>>=7-mask;return new bn(buf)}
    MillerRabin.prototype.test=function test(n,k,cb){var len=n.bitLength();var red=bn.mont(n);var rone=new bn(1).toRed(red);if(!k)
        k=Math.max(1,(len/48)|0);var n1=n.subn(1);var n2=n1.subn(1);for(var s=0;!n1.testn(s);s++){}
        var d=n.shrn(s);var rn1=n1.toRed(red);var prime=!0;for(;k>0;k--){var a=this._rand(n2);if(cb)
            cb(a);var x=a.toRed(red).redPow(d);if(x.cmp(rone)===0||x.cmp(rn1)===0)
            continue;for(var i=1;i<s;i++){x=x.redSqr();if(x.cmp(rone)===0)
            return!1;if(x.cmp(rn1)===0)
            break}
            if(i===s)
                return!1}
        return prime};MillerRabin.prototype.getDivisor=function getDivisor(n,k){var len=n.bitLength();var red=bn.mont(n);var rone=new bn(1).toRed(red);if(!k)
        k=Math.max(1,(len/48)|0);var n1=n.subn(1);var n2=n1.subn(1);for(var s=0;!n1.testn(s);s++){}
        var d=n.shrn(s);var rn1=n1.toRed(red);for(;k>0;k--){var a=this._rand(n2);var g=n.gcd(a);if(g.cmpn(1)!==0)
            return g;var x=a.toRed(red).redPow(d);if(x.cmp(rone)===0||x.cmp(rn1)===0)
            continue;for(var i=1;i<s;i++){x=x.redSqr();if(x.cmp(rone)===0)
            return x.fromRed().subn(1).gcd(n);if(x.cmp(rn1)===0)
            break}
            if(i===s){x=x.redSqr();return x.fromRed().subn(1).gcd(n)}}
        return!1}},{"bn.js":221,"brorand":223}],223:[function(require,module,exports){arguments[4][25][0].apply(exports,arguments)},{"dup":25}],224:[function(require,module,exports){(function(Buffer){var createHmac=require('create-hmac')
    var MAX_ALLOC=Math.pow(2,30)-1
    exports.pbkdf2=pbkdf2
    function pbkdf2(password,salt,iterations,keylen,digest,callback){if(typeof digest==='function'){callback=digest
        digest=undefined}
        if(typeof callback!=='function'){throw new Error('No callback provided to pbkdf2')}
        var result=pbkdf2Sync(password,salt,iterations,keylen,digest)
        setTimeout(function(){callback(undefined,result)})}
    exports.pbkdf2Sync=pbkdf2Sync
    function pbkdf2Sync(password,salt,iterations,keylen,digest){if(typeof iterations!=='number'){throw new TypeError('Iterations not a number')}
        if(iterations<0){throw new TypeError('Bad iterations')}
        if(typeof keylen!=='number'){throw new TypeError('Key length not a number')}
        if(keylen<0||keylen>MAX_ALLOC){throw new TypeError('Bad key length')}
        digest=digest||'sha1'
        if(!Buffer.isBuffer(password))password=new Buffer(password,'binary')
        if(!Buffer.isBuffer(salt))salt=new Buffer(salt,'binary')
        var hLen
        var l=1
        var DK=new Buffer(keylen)
        var block1=new Buffer(salt.length+4)
        salt.copy(block1,0,0,salt.length)
        var r
        var T
        for(var i=1;i<=l;i++){block1.writeUInt32BE(i,salt.length)
            var U=createHmac(digest,password).update(block1).digest()
            if(!hLen){hLen=U.length
                T=new Buffer(hLen)
                l=Math.ceil(keylen/hLen)
                r=keylen-(l-1)*hLen}
            U.copy(T,0,0,hLen)
            for(var j=1;j<iterations;j++){U=createHmac(digest,password).update(U).digest()
                for(var k=0;k<hLen;k++){T[k]^=U[k]}}
            var destPos=(i-1)*hLen
            var len=(i===l?r:hLen)
            T.copy(DK,destPos,0,len)}
        return DK}}).call(this,require("buffer").Buffer)},{"buffer":111,"create-hmac":216}],225:[function(require,module,exports){exports.publicEncrypt=require('./publicEncrypt');exports.privateDecrypt=require('./privateDecrypt');exports.privateEncrypt=function privateEncrypt(key,buf){return exports.publicEncrypt(key,buf,!0)};exports.publicDecrypt=function publicDecrypt(key,buf){return exports.privateDecrypt(key,buf,!0)}},{"./privateDecrypt":247,"./publicEncrypt":248}],226:[function(require,module,exports){(function(Buffer){var createHash=require('create-hash');module.exports=function(seed,len){var t=new Buffer('');var i=0,c;while(t.length<len){c=i2ops(i++);t=Buffer.concat([t,createHash('sha1').update(seed).update(c).digest()])}
    return t.slice(0,len)};function i2ops(c){var out=new Buffer(4);out.writeUInt32BE(c,0);return out}}).call(this,require("buffer").Buffer)},{"buffer":111,"create-hash":204}],227:[function(require,module,exports){arguments[4][137][0].apply(exports,arguments)},{"dup":137}],228:[function(require,module,exports){arguments[4][138][0].apply(exports,arguments)},{"bn.js":227,"buffer":111,"dup":138,"randombytes":251}],229:[function(require,module,exports){arguments[4][160][0].apply(exports,arguments)},{"buffer":111,"create-hash":204,"dup":160}],230:[function(require,module,exports){arguments[4][161][0].apply(exports,arguments)},{"dup":161}],231:[function(require,module,exports){arguments[4][162][0].apply(exports,arguments)},{"asn1.js":234,"dup":162}],232:[function(require,module,exports){arguments[4][163][0].apply(exports,arguments)},{"./EVP_BytesToKey":229,"browserify-aes":119,"buffer":111,"dup":163}],233:[function(require,module,exports){arguments[4][164][0].apply(exports,arguments)},{"./aesid.json":230,"./asn1":231,"./fixProc":232,"browserify-aes":119,"buffer":111,"dup":164,"pbkdf2":224}],234:[function(require,module,exports){arguments[4][165][0].apply(exports,arguments)},{"./asn1/api":235,"./asn1/base":237,"./asn1/constants":241,"./asn1/decoders":243,"./asn1/encoders":245,"bn.js":227,"dup":165}],235:[function(require,module,exports){arguments[4][166][0].apply(exports,arguments)},{"../asn1":234,"dup":166,"inherits":253,"vm":271}],236:[function(require,module,exports){arguments[4][167][0].apply(exports,arguments)},{"../base":237,"buffer":111,"dup":167,"inherits":253}],237:[function(require,module,exports){arguments[4][168][0].apply(exports,arguments)},{"./buffer":236,"./node":238,"./reporter":239,"dup":168}],238:[function(require,module,exports){arguments[4][169][0].apply(exports,arguments)},{"../base":237,"dup":169,"minimalistic-assert":246}],239:[function(require,module,exports){arguments[4][170][0].apply(exports,arguments)},{"dup":170,"inherits":253}],240:[function(require,module,exports){arguments[4][171][0].apply(exports,arguments)},{"../constants":241,"dup":171}],241:[function(require,module,exports){arguments[4][172][0].apply(exports,arguments)},{"./der":240,"dup":172}],242:[function(require,module,exports){arguments[4][173][0].apply(exports,arguments)},{"../../asn1":234,"dup":173,"inherits":253}],243:[function(require,module,exports){arguments[4][174][0].apply(exports,arguments)},{"./der":242,"dup":174}],244:[function(require,module,exports){arguments[4][175][0].apply(exports,arguments)},{"../../asn1":234,"buffer":111,"dup":175,"inherits":253}],245:[function(require,module,exports){arguments[4][176][0].apply(exports,arguments)},{"./der":244,"dup":176}],246:[function(require,module,exports){arguments[4][177][0].apply(exports,arguments)},{"dup":177}],247:[function(require,module,exports){(function(Buffer){var parseKeys=require('parse-asn1');var mgf=require('./mgf');var xor=require('./xor');var bn=require('bn.js');var crt=require('browserify-rsa');var createHash=require('create-hash');var withPublic=require('./withPublic');module.exports=function privateDecrypt(private_key,enc,reverse){var padding;if(private_key.padding){padding=private_key.padding}else if(reverse){padding=1}else{padding=4}
    var key=parseKeys(private_key);var k=key.modulus.byteLength();if(enc.length>k||new bn(enc).cmp(key.modulus)>=0){throw new Error('decryption error')}
    var msg;if(reverse){msg=withPublic(new bn(enc),key)}else{msg=crt(enc,key)}
    var zBuffer=new Buffer(k-msg.length);zBuffer.fill(0);msg=Buffer.concat([zBuffer,msg],k);if(padding===4){return oaep(key,msg)}else if(padding===1){return pkcs1(key,msg,reverse)}else if(padding===3){return msg}else{throw new Error('unknown padding')}};function oaep(key,msg){var n=key.modulus;var k=key.modulus.byteLength();var mLen=msg.length;var iHash=createHash('sha1').update(new Buffer('')).digest();var hLen=iHash.length;var hLen2=2*hLen;if(msg[0]!==0){throw new Error('decryption error')}
    var maskedSeed=msg.slice(1,hLen+1);var maskedDb=msg.slice(hLen+1);var seed=xor(maskedSeed,mgf(maskedDb,hLen));var db=xor(maskedDb,mgf(seed,k-hLen-1));if(compare(iHash,db.slice(0,hLen))){throw new Error('decryption error')}
    var i=hLen;while(db[i]===0){i++}
    if(db[i++]!==1){throw new Error('decryption error')}
    return db.slice(i)}
    function pkcs1(key,msg,reverse){var p1=msg.slice(0,2);var i=2;var status=0;while(msg[i++]!==0){if(i>=msg.length){status++;break}}
        var ps=msg.slice(2,i-1);var p2=msg.slice(i-1,i);if((p1.toString('hex')!=='0002'&&!reverse)||(p1.toString('hex')!=='0001'&&reverse)){status++}
        if(ps.length<8){status++}
        if(status){throw new Error('decryption error')}
        return msg.slice(i)}
    function compare(a,b){a=new Buffer(a);b=new Buffer(b);var dif=0;var len=a.length;if(a.length!==b.length){dif++;len=Math.min(a.length,b.length)}
        var i=-1;while(++i<len){dif+=(a[i]^b[i])}
        return dif}}).call(this,require("buffer").Buffer)},{"./mgf":226,"./withPublic":249,"./xor":250,"bn.js":227,"browserify-rsa":228,"buffer":111,"create-hash":204,"parse-asn1":233}],248:[function(require,module,exports){(function(Buffer){var parseKeys=require('parse-asn1');var randomBytes=require('randombytes');var createHash=require('create-hash');var mgf=require('./mgf');var xor=require('./xor');var bn=require('bn.js');var withPublic=require('./withPublic');var crt=require('browserify-rsa');var constants={RSA_PKCS1_OAEP_PADDING:4,RSA_PKCS1_PADDIN:1,RSA_NO_PADDING:3};module.exports=function publicEncrypt(public_key,msg,reverse){var padding;if(public_key.padding){padding=public_key.padding}else if(reverse){padding=1}else{padding=4}
    var key=parseKeys(public_key);var paddedMsg;if(padding===4){paddedMsg=oaep(key,msg)}else if(padding===1){paddedMsg=pkcs1(key,msg,reverse)}else if(padding===3){paddedMsg=new bn(msg);if(paddedMsg.cmp(key.modulus)>=0){throw new Error('data too long for modulus')}}else{throw new Error('unknown padding')}
    if(reverse){return crt(paddedMsg,key)}else{return withPublic(paddedMsg,key)}};function oaep(key,msg){var k=key.modulus.byteLength();var mLen=msg.length;var iHash=createHash('sha1').update(new Buffer('')).digest();var hLen=iHash.length;var hLen2=2*hLen;if(mLen>k-hLen2-2){throw new Error('message too long')}
    var ps=new Buffer(k-mLen-hLen2-2);ps.fill(0);var dblen=k-hLen-1;var seed=randomBytes(hLen);var maskedDb=xor(Buffer.concat([iHash,ps,new Buffer([1]),msg],dblen),mgf(seed,dblen));var maskedSeed=xor(seed,mgf(maskedDb,hLen));return new bn(Buffer.concat([new Buffer([0]),maskedSeed,maskedDb],k))}
    function pkcs1(key,msg,reverse){var mLen=msg.length;var k=key.modulus.byteLength();if(mLen>k-11){throw new Error('message too long')}
        var ps;if(reverse){ps=new Buffer(k-mLen-3);ps.fill(0xff)}else{ps=nonZero(k-mLen-3)}
        return new bn(Buffer.concat([new Buffer([0,reverse?1:2]),ps,new Buffer([0]),msg],k))}
    function nonZero(len,crypto){var out=new Buffer(len);var i=0;var cache=randomBytes(len*2);var cur=0;var num;while(i<len){if(cur===cache.length){cache=randomBytes(len*2);cur=0}
        num=cache[cur++];if(num){out[i++]=num}}
        return out}}).call(this,require("buffer").Buffer)},{"./mgf":226,"./withPublic":249,"./xor":250,"bn.js":227,"browserify-rsa":228,"buffer":111,"create-hash":204,"parse-asn1":233,"randombytes":251}],249:[function(require,module,exports){(function(Buffer){var bn=require('bn.js');function withPublic(paddedMsg,key){return new Buffer(paddedMsg.toRed(bn.mont(key.modulus)).redPow(new bn(key.publicExponent)).fromRed().toArray())}
    module.exports=withPublic}).call(this,require("buffer").Buffer)},{"bn.js":227,"buffer":111}],250:[function(require,module,exports){module.exports=function xor(a,b){var len=a.length;var i=-1;while(++i<len){a[i]^=b[i]}
    return a}},{}],251:[function(require,module,exports){(function(process,global,Buffer){'use strict';var crypto=global.crypto||global.msCrypto
    if(crypto&&crypto.getRandomValues){module.exports=randomBytes}else{module.exports=oldBrowser}
    function randomBytes(size,cb){var bytes=new Buffer(size);crypto.getRandomValues(bytes);if(typeof cb==='function'){return process.nextTick(function(){cb(null,bytes)})}
        return bytes}
    function oldBrowser(){throw new Error('secure random number generation not supported by this browser\n'+'use chrome, FireFox or Internet Explorer 11')}}).call(this,require('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{},require("buffer").Buffer)},{"_process":255,"buffer":111}],252:[function(require,module,exports){function EventEmitter(){this._events=this._events||{};this._maxListeners=this._maxListeners||undefined}
    module.exports=EventEmitter;EventEmitter.EventEmitter=EventEmitter;EventEmitter.prototype._events=undefined;EventEmitter.prototype._maxListeners=undefined;EventEmitter.defaultMaxListeners=10;EventEmitter.prototype.setMaxListeners=function(n){if(!isNumber(n)||n<0||isNaN(n))
        throw TypeError('n must be a positive number');this._maxListeners=n;return this};EventEmitter.prototype.emit=function(type){var er,handler,len,args,i,listeners;if(!this._events)
        this._events={};if(type==='error'){if(!this._events.error||(isObject(this._events.error)&&!this._events.error.length)){er=arguments[1];if(er instanceof Error){throw er}
        throw TypeError('Uncaught, unspecified "error" event.')}}
        handler=this._events[type];if(isUndefined(handler))
            return!1;if(isFunction(handler)){switch(arguments.length){case 1:handler.call(this);break;case 2:handler.call(this,arguments[1]);break;case 3:handler.call(this,arguments[1],arguments[2]);break;default:len=arguments.length;args=new Array(len-1);for(i=1;i<len;i++)
            args[i-1]=arguments[i];handler.apply(this,args)}}else if(isObject(handler)){len=arguments.length;args=new Array(len-1);for(i=1;i<len;i++)
            args[i-1]=arguments[i];listeners=handler.slice();len=listeners.length;for(i=0;i<len;i++)
            listeners[i].apply(this,args);}
        return!0};EventEmitter.prototype.addListener=function(type,listener){var m;if(!isFunction(listener))
        throw TypeError('listener must be a function');if(!this._events)
        this._events={};if(this._events.newListener)
        this.emit('newListener',type,isFunction(listener.listener)?listener.listener:listener);if(!this._events[type])
        this._events[type]=listener;else if(isObject(this._events[type]))
        this._events[type].push(listener);else this._events[type]=[this._events[type],listener];if(isObject(this._events[type])&&!this._events[type].warned){var m;if(!isUndefined(this._maxListeners)){m=this._maxListeners}else{m=EventEmitter.defaultMaxListeners}
        if(m&&m>0&&this._events[type].length>m){this._events[type].warned=!0;console.error('(node) warning: possible EventEmitter memory '+'leak detected. %d listeners added. '+'Use emitter.setMaxListeners() to increase limit.',this._events[type].length);if(typeof console.trace==='function'){console.trace()}}}
        return this};EventEmitter.prototype.on=EventEmitter.prototype.addListener;EventEmitter.prototype.once=function(type,listener){if(!isFunction(listener))
        throw TypeError('listener must be a function');var fired=!1;function g(){this.removeListener(type,g);if(!fired){fired=!0;listener.apply(this,arguments)}}
        g.listener=listener;this.on(type,g);return this};EventEmitter.prototype.removeListener=function(type,listener){var list,position,length,i;if(!isFunction(listener))
        throw TypeError('listener must be a function');if(!this._events||!this._events[type])
        return this;list=this._events[type];length=list.length;position=-1;if(list===listener||(isFunction(list.listener)&&list.listener===listener)){delete this._events[type];if(this._events.removeListener)
        this.emit('removeListener',type,listener)}else if(isObject(list)){for(i=length;i-->0;){if(list[i]===listener||(list[i].listener&&list[i].listener===listener)){position=i;break}}
        if(position<0)
            return this;if(list.length===1){list.length=0;delete this._events[type]}else{list.splice(position,1)}
        if(this._events.removeListener)
            this.emit('removeListener',type,listener)}
        return this};EventEmitter.prototype.removeAllListeners=function(type){var key,listeners;if(!this._events)
        return this;if(!this._events.removeListener){if(arguments.length===0)
        this._events={};else if(this._events[type])
        delete this._events[type];return this}
        if(arguments.length===0){for(key in this._events){if(key==='removeListener')continue;this.removeAllListeners(key)}
            this.removeAllListeners('removeListener');this._events={};return this}
        listeners=this._events[type];if(isFunction(listeners)){this.removeListener(type,listeners)}else{while(listeners.length)
            this.removeListener(type,listeners[listeners.length-1])}
        delete this._events[type];return this};EventEmitter.prototype.listeners=function(type){var ret;if(!this._events||!this._events[type])
        ret=[];else if(isFunction(this._events[type]))
        ret=[this._events[type]];else ret=this._events[type].slice();return ret};EventEmitter.listenerCount=function(emitter,type){var ret;if(!emitter._events||!emitter._events[type])
        ret=0;else if(isFunction(emitter._events[type]))
        ret=1;else ret=emitter._events[type].length;return ret};function isFunction(arg){return typeof arg==='function'}
    function isNumber(arg){return typeof arg==='number'}
    function isObject(arg){return typeof arg==='object'&&arg!==null}
    function isUndefined(arg){return arg===void 0}},{}],253:[function(require,module,exports){arguments[4][32][0].apply(exports,arguments)},{"dup":32}],254:[function(require,module,exports){module.exports=Array.isArray||function(arr){return Object.prototype.toString.call(arr)=='[object Array]'}},{}],255:[function(require,module,exports){var process=module.exports={};var queue=[];var draining=!1;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){draining=!1;if(currentQueue.length){queue=currentQueue.concat(queue)}else{queueIndex=-1}
    if(queue.length){drainQueue()}}
    function drainQueue(){if(draining){return}
        var timeout=setTimeout(cleanUpNextTick);draining=!0;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){currentQueue[queueIndex].run()}
            queueIndex=-1;len=queue.length}
        currentQueue=null;draining=!1;clearTimeout(timeout)}
    process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i]}}
        queue.push(new Item(fun,args));if(queue.length===1&&!draining){setTimeout(drainQueue,0)}};function Item(fun,array){this.fun=fun;this.array=array}
    Item.prototype.run=function(){this.fun.apply(null,this.array)};process.title='browser';process.browser=!0;process.env={};process.argv=[];process.version='';process.versions={};function noop(){}
    process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.binding=function(name){throw new Error('process.binding is not supported')};process.cwd=function(){return '/'};process.chdir=function(dir){throw new Error('process.chdir is not supported')};process.umask=function(){return 0}},{}],256:[function(require,module,exports){module.exports=require("./lib/_stream_duplex.js")},{"./lib/_stream_duplex.js":257}],257:[function(require,module,exports){(function(process){module.exports=Duplex;var objectKeys=Object.keys||function(obj){var keys=[];for(var key in obj)keys.push(key);return keys}
    var util=require('core-util-is');util.inherits=require('inherits');var Readable=require('./_stream_readable');var Writable=require('./_stream_writable');util.inherits(Duplex,Readable);forEach(objectKeys(Writable.prototype),function(method){if(!Duplex.prototype[method])
        Duplex.prototype[method]=Writable.prototype[method]});function Duplex(options){if(!(this instanceof Duplex))
        return new Duplex(options);Readable.call(this,options);Writable.call(this,options);if(options&&options.readable===!1)
        this.readable=!1;if(options&&options.writable===!1)
        this.writable=!1;this.allowHalfOpen=!0;if(options&&options.allowHalfOpen===!1)
        this.allowHalfOpen=!1;this.once('end',onend)}
    function onend(){if(this.allowHalfOpen||this._writableState.ended)
        return;process.nextTick(this.end.bind(this))}
    function forEach(xs,f){for(var i=0,l=xs.length;i<l;i++){f(xs[i],i)}}}).call(this,require('_process'))},{"./_stream_readable":259,"./_stream_writable":261,"_process":255,"core-util-is":262,"inherits":253}],258:[function(require,module,exports){module.exports=PassThrough;var Transform=require('./_stream_transform');var util=require('core-util-is');util.inherits=require('inherits');util.inherits(PassThrough,Transform);function PassThrough(options){if(!(this instanceof PassThrough))
    return new PassThrough(options);Transform.call(this,options)}
    PassThrough.prototype._transform=function(chunk,encoding,cb){cb(null,chunk)}},{"./_stream_transform":260,"core-util-is":262,"inherits":253}],259:[function(require,module,exports){(function(process){module.exports=Readable;var isArray=require('isarray');var Buffer=require('buffer').Buffer;Readable.ReadableState=ReadableState;var EE=require('events').EventEmitter;if(!EE.listenerCount)EE.listenerCount=function(emitter,type){return emitter.listeners(type).length};var Stream=require('stream');var util=require('core-util-is');util.inherits=require('inherits');var StringDecoder;var debug=require('util');if(debug&&debug.debuglog){debug=debug.debuglog('stream')}else{debug=function(){}}
    util.inherits(Readable,Stream);function ReadableState(options,stream){var Duplex=require('./_stream_duplex');options=options||{};var hwm=options.highWaterMark;var defaultHwm=options.objectMode?16:16*1024;this.highWaterMark=(hwm||hwm===0)?hwm:defaultHwm;this.highWaterMark=~~this.highWaterMark;this.buffer=[];this.length=0;this.pipes=null;this.pipesCount=0;this.flowing=null;this.ended=!1;this.endEmitted=!1;this.reading=!1;this.sync=!0;this.needReadable=!1;this.emittedReadable=!1;this.readableListening=!1;this.objectMode=!!options.objectMode;if(stream instanceof Duplex)
        this.objectMode=this.objectMode||!!options.readableObjectMode;this.defaultEncoding=options.defaultEncoding||'utf8';this.ranOut=!1;this.awaitDrain=0;this.readingMore=!1;this.decoder=null;this.encoding=null;if(options.encoding){if(!StringDecoder)
        StringDecoder=require('string_decoder/').StringDecoder;this.decoder=new StringDecoder(options.encoding);this.encoding=options.encoding}}
    function Readable(options){var Duplex=require('./_stream_duplex');if(!(this instanceof Readable))
        return new Readable(options);this._readableState=new ReadableState(options,this);this.readable=!0;Stream.call(this)}
    Readable.prototype.push=function(chunk,encoding){var state=this._readableState;if(util.isString(chunk)&&!state.objectMode){encoding=encoding||state.defaultEncoding;if(encoding!==state.encoding){chunk=new Buffer(chunk,encoding);encoding=''}}
        return readableAddChunk(this,state,chunk,encoding,!1)};Readable.prototype.unshift=function(chunk){var state=this._readableState;return readableAddChunk(this,state,chunk,'',!0)};function readableAddChunk(stream,state,chunk,encoding,addToFront){var er=chunkInvalid(state,chunk);if(er){stream.emit('error',er)}else if(util.isNullOrUndefined(chunk)){state.reading=!1;if(!state.ended)
        onEofChunk(stream,state)}else if(state.objectMode||chunk&&chunk.length>0){if(state.ended&&!addToFront){var e=new Error('stream.push() after EOF');stream.emit('error',e)}else if(state.endEmitted&&addToFront){var e=new Error('stream.unshift() after end event');stream.emit('error',e)}else{if(state.decoder&&!addToFront&&!encoding)
        chunk=state.decoder.write(chunk);if(!addToFront)
        state.reading=!1;if(state.flowing&&state.length===0&&!state.sync){stream.emit('data',chunk);stream.read(0)}else{state.length+=state.objectMode?1:chunk.length;if(addToFront)
        state.buffer.unshift(chunk);else state.buffer.push(chunk);if(state.needReadable)
        emitReadable(stream)}
        maybeReadMore(stream,state)}}else if(!addToFront){state.reading=!1}
        return needMoreData(state)}
    function needMoreData(state){return!state.ended&&(state.needReadable||state.length<state.highWaterMark||state.length===0)}
    Readable.prototype.setEncoding=function(enc){if(!StringDecoder)
        StringDecoder=require('string_decoder/').StringDecoder;this._readableState.decoder=new StringDecoder(enc);this._readableState.encoding=enc;return this};var MAX_HWM=0x800000;function roundUpToNextPowerOf2(n){if(n>=MAX_HWM){n=MAX_HWM}else{n--;for(var p=1;p<32;p<<=1)n|=n>>p;n++}
        return n}
    function howMuchToRead(n,state){if(state.length===0&&state.ended)
        return 0;if(state.objectMode)
        return n===0?0:1;if(isNaN(n)||util.isNull(n)){if(state.flowing&&state.buffer.length)
        return state.buffer[0].length;else return state.length}
        if(n<=0)
            return 0;if(n>state.highWaterMark)
            state.highWaterMark=roundUpToNextPowerOf2(n);if(n>state.length){if(!state.ended){state.needReadable=!0;return 0}else return state.length}
        return n}
    Readable.prototype.read=function(n){debug('read',n);var state=this._readableState;var nOrig=n;if(!util.isNumber(n)||n>0)
        state.emittedReadable=!1;if(n===0&&state.needReadable&&(state.length>=state.highWaterMark||state.ended)){debug('read: emitReadable',state.length,state.ended);if(state.length===0&&state.ended)
        endReadable(this);else emitReadable(this);return null}
        n=howMuchToRead(n,state);if(n===0&&state.ended){if(state.length===0)
            endReadable(this);return null}
        var doRead=state.needReadable;debug('need readable',doRead);if(state.length===0||state.length-n<state.highWaterMark){doRead=!0;debug('length less than watermark',doRead)}
        if(state.ended||state.reading){doRead=!1;debug('reading or ended',doRead)}
        if(doRead){debug('do read');state.reading=!0;state.sync=!0;if(state.length===0)
            state.needReadable=!0;this._read(state.highWaterMark);state.sync=!1}
        if(doRead&&!state.reading)
            n=howMuchToRead(nOrig,state);var ret;if(n>0)
            ret=fromList(n,state);else ret=null;if(util.isNull(ret)){state.needReadable=!0;n=0}
        state.length-=n;if(state.length===0&&!state.ended)
            state.needReadable=!0;if(nOrig!==n&&state.ended&&state.length===0)
            endReadable(this);if(!util.isNull(ret))
            this.emit('data',ret);return ret};function chunkInvalid(state,chunk){var er=null;if(!util.isBuffer(chunk)&&!util.isString(chunk)&&!util.isNullOrUndefined(chunk)&&!state.objectMode){er=new TypeError('Invalid non-string/buffer chunk')}
        return er}
    function onEofChunk(stream,state){if(state.decoder&&!state.ended){var chunk=state.decoder.end();if(chunk&&chunk.length){state.buffer.push(chunk);state.length+=state.objectMode?1:chunk.length}}
        state.ended=!0;emitReadable(stream)}
    function emitReadable(stream){var state=stream._readableState;state.needReadable=!1;if(!state.emittedReadable){debug('emitReadable',state.flowing);state.emittedReadable=!0;if(state.sync)
        process.nextTick(function(){emitReadable_(stream)});else emitReadable_(stream)}}
    function emitReadable_(stream){debug('emit readable');stream.emit('readable');flow(stream)}
    function maybeReadMore(stream,state){if(!state.readingMore){state.readingMore=!0;process.nextTick(function(){maybeReadMore_(stream,state)})}}
    function maybeReadMore_(stream,state){var len=state.length;while(!state.reading&&!state.flowing&&!state.ended&&state.length<state.highWaterMark){debug('maybeReadMore read 0');stream.read(0);if(len===state.length)
        break;else len=state.length}
        state.readingMore=!1}
    Readable.prototype._read=function(n){this.emit('error',new Error('not implemented'))};Readable.prototype.pipe=function(dest,pipeOpts){var src=this;var state=this._readableState;switch(state.pipesCount){case 0:state.pipes=dest;break;case 1:state.pipes=[state.pipes,dest];break;default:state.pipes.push(dest);break}
        state.pipesCount+=1;debug('pipe count=%d opts=%j',state.pipesCount,pipeOpts);var doEnd=(!pipeOpts||pipeOpts.end!==!1)&&dest!==process.stdout&&dest!==process.stderr;var endFn=doEnd?onend:cleanup;if(state.endEmitted)
            process.nextTick(endFn);else src.once('end',endFn);dest.on('unpipe',onunpipe);function onunpipe(readable){debug('onunpipe');if(readable===src){cleanup()}}
        function onend(){debug('onend');dest.end()}
        var ondrain=pipeOnDrain(src);dest.on('drain',ondrain);function cleanup(){debug('cleanup');dest.removeListener('close',onclose);dest.removeListener('finish',onfinish);dest.removeListener('drain',ondrain);dest.removeListener('error',onerror);dest.removeListener('unpipe',onunpipe);src.removeListener('end',onend);src.removeListener('end',cleanup);src.removeListener('data',ondata);if(state.awaitDrain&&(!dest._writableState||dest._writableState.needDrain))
            ondrain()}
        src.on('data',ondata);function ondata(chunk){debug('ondata');var ret=dest.write(chunk);if(!1===ret){debug('false write response, pause',src._readableState.awaitDrain);src._readableState.awaitDrain++;src.pause()}}
        function onerror(er){debug('onerror',er);unpipe();dest.removeListener('error',onerror);if(EE.listenerCount(dest,'error')===0)
            dest.emit('error',er)}
        if(!dest._events||!dest._events.error)
            dest.on('error',onerror);else if(isArray(dest._events.error))
            dest._events.error.unshift(onerror);else dest._events.error=[onerror,dest._events.error];function onclose(){dest.removeListener('finish',onfinish);unpipe()}
        dest.once('close',onclose);function onfinish(){debug('onfinish');dest.removeListener('close',onclose);unpipe()}
        dest.once('finish',onfinish);function unpipe(){debug('unpipe');src.unpipe(dest)}
        dest.emit('pipe',src);if(!state.flowing){debug('pipe resume');src.resume()}
        return dest};function pipeOnDrain(src){return function(){var state=src._readableState;debug('pipeOnDrain',state.awaitDrain);if(state.awaitDrain)
        state.awaitDrain--;if(state.awaitDrain===0&&EE.listenerCount(src,'data')){state.flowing=!0;flow(src)}}}
    Readable.prototype.unpipe=function(dest){var state=this._readableState;if(state.pipesCount===0)
        return this;if(state.pipesCount===1){if(dest&&dest!==state.pipes)
        return this;if(!dest)
        dest=state.pipes;state.pipes=null;state.pipesCount=0;state.flowing=!1;if(dest)
        dest.emit('unpipe',this);return this}
        if(!dest){var dests=state.pipes;var len=state.pipesCount;state.pipes=null;state.pipesCount=0;state.flowing=!1;for(var i=0;i<len;i++)
            dests[i].emit('unpipe',this);return this}
        var i=indexOf(state.pipes,dest);if(i===-1)
            return this;state.pipes.splice(i,1);state.pipesCount-=1;if(state.pipesCount===1)
            state.pipes=state.pipes[0];dest.emit('unpipe',this);return this};Readable.prototype.on=function(ev,fn){var res=Stream.prototype.on.call(this,ev,fn);if(ev==='data'&&!1!==this._readableState.flowing){this.resume()}
        if(ev==='readable'&&this.readable){var state=this._readableState;if(!state.readableListening){state.readableListening=!0;state.emittedReadable=!1;state.needReadable=!0;if(!state.reading){var self=this;process.nextTick(function(){debug('readable nexttick read 0');self.read(0)})}else if(state.length){emitReadable(this,state)}}}
        return res};Readable.prototype.addListener=Readable.prototype.on;Readable.prototype.resume=function(){var state=this._readableState;if(!state.flowing){debug('resume');state.flowing=!0;if(!state.reading){debug('resume read 0');this.read(0)}
        resume(this,state)}
        return this};function resume(stream,state){if(!state.resumeScheduled){state.resumeScheduled=!0;process.nextTick(function(){resume_(stream,state)})}}
    function resume_(stream,state){state.resumeScheduled=!1;stream.emit('resume');flow(stream);if(state.flowing&&!state.reading)
        stream.read(0)}
    Readable.prototype.pause=function(){debug('call pause flowing=%j',this._readableState.flowing);if(!1!==this._readableState.flowing){debug('pause');this._readableState.flowing=!1;this.emit('pause')}
        return this};function flow(stream){var state=stream._readableState;debug('flow',state.flowing);if(state.flowing){do{var chunk=stream.read()}while(null!==chunk&&state.flowing)}}
    Readable.prototype.wrap=function(stream){var state=this._readableState;var paused=!1;var self=this;stream.on('end',function(){debug('wrapped end');if(state.decoder&&!state.ended){var chunk=state.decoder.end();if(chunk&&chunk.length)
        self.push(chunk)}
        self.push(null)});stream.on('data',function(chunk){debug('wrapped data');if(state.decoder)
        chunk=state.decoder.write(chunk);if(!chunk||!state.objectMode&&!chunk.length)
        return;var ret=self.push(chunk);if(!ret){paused=!0;stream.pause()}});for(var i in stream){if(util.isFunction(stream[i])&&util.isUndefined(this[i])){this[i]=function(method){return function(){return stream[method].apply(stream,arguments)}}(i)}}
        var events=['error','close','destroy','pause','resume'];forEach(events,function(ev){stream.on(ev,self.emit.bind(self,ev))});self._read=function(n){debug('wrapped _read',n);if(paused){paused=!1;stream.resume()}};return self};Readable._fromList=fromList;function fromList(n,state){var list=state.buffer;var length=state.length;var stringMode=!!state.decoder;var objectMode=!!state.objectMode;var ret;if(list.length===0)
        return null;if(length===0)
        ret=null;else if(objectMode)
        ret=list.shift();else if(!n||n>=length){if(stringMode)
        ret=list.join('');else ret=Buffer.concat(list,length);list.length=0}else{if(n<list[0].length){var buf=list[0];ret=buf.slice(0,n);list[0]=buf.slice(n)}else if(n===list[0].length){ret=list.shift()}else{if(stringMode)
        ret='';else ret=new Buffer(n);var c=0;for(var i=0,l=list.length;i<l&&c<n;i++){var buf=list[0];var cpy=Math.min(n-c,buf.length);if(stringMode)
        ret+=buf.slice(0,cpy);else buf.copy(ret,c,0,cpy);if(cpy<buf.length)
        list[0]=buf.slice(cpy);else list.shift();c+=cpy}}}
        return ret}
    function endReadable(stream){var state=stream._readableState;if(state.length>0)
        throw new Error('endReadable called on non-empty stream');if(!state.endEmitted){state.ended=!0;process.nextTick(function(){if(!state.endEmitted&&state.length===0){state.endEmitted=!0;stream.readable=!1;stream.emit('end')}})}}
    function forEach(xs,f){for(var i=0,l=xs.length;i<l;i++){f(xs[i],i)}}
    function indexOf(xs,x){for(var i=0,l=xs.length;i<l;i++){if(xs[i]===x)return i}
        return-1}}).call(this,require('_process'))},{"./_stream_duplex":257,"_process":255,"buffer":111,"core-util-is":262,"events":252,"inherits":253,"isarray":254,"stream":267,"string_decoder/":268,"util":110}],260:[function(require,module,exports){module.exports=Transform;var Duplex=require('./_stream_duplex');var util=require('core-util-is');util.inherits=require('inherits');util.inherits(Transform,Duplex);function TransformState(options,stream){this.afterTransform=function(er,data){return afterTransform(stream,er,data)};this.needTransform=!1;this.transforming=!1;this.writecb=null;this.writechunk=null}
    function afterTransform(stream,er,data){var ts=stream._transformState;ts.transforming=!1;var cb=ts.writecb;if(!cb)
        return stream.emit('error',new Error('no writecb in Transform class'));ts.writechunk=null;ts.writecb=null;if(!util.isNullOrUndefined(data))
        stream.push(data);if(cb)
        cb(er);var rs=stream._readableState;rs.reading=!1;if(rs.needReadable||rs.length<rs.highWaterMark){stream._read(rs.highWaterMark)}}
    function Transform(options){if(!(this instanceof Transform))
        return new Transform(options);Duplex.call(this,options);this._transformState=new TransformState(options,this);var stream=this;this._readableState.needReadable=!0;this._readableState.sync=!1;this.once('prefinish',function(){if(util.isFunction(this._flush))
        this._flush(function(er){done(stream,er)});else done(stream)})}
    Transform.prototype.push=function(chunk,encoding){this._transformState.needTransform=!1;return Duplex.prototype.push.call(this,chunk,encoding)};Transform.prototype._transform=function(chunk,encoding,cb){throw new Error('not implemented')};Transform.prototype._write=function(chunk,encoding,cb){var ts=this._transformState;ts.writecb=cb;ts.writechunk=chunk;ts.writeencoding=encoding;if(!ts.transforming){var rs=this._readableState;if(ts.needTransform||rs.needReadable||rs.length<rs.highWaterMark)
        this._read(rs.highWaterMark)}};Transform.prototype._read=function(n){var ts=this._transformState;if(!util.isNull(ts.writechunk)&&ts.writecb&&!ts.transforming){ts.transforming=!0;this._transform(ts.writechunk,ts.writeencoding,ts.afterTransform)}else{ts.needTransform=!0}};function done(stream,er){if(er)
        return stream.emit('error',er);var ws=stream._writableState;var ts=stream._transformState;if(ws.length)
        throw new Error('calling transform done when ws.length != 0');if(ts.transforming)
        throw new Error('calling transform done when still transforming');return stream.push(null)}},{"./_stream_duplex":257,"core-util-is":262,"inherits":253}],261:[function(require,module,exports){(function(process){module.exports=Writable;var Buffer=require('buffer').Buffer;Writable.WritableState=WritableState;var util=require('core-util-is');util.inherits=require('inherits');var Stream=require('stream');util.inherits(Writable,Stream);function WriteReq(chunk,encoding,cb){this.chunk=chunk;this.encoding=encoding;this.callback=cb}
    function WritableState(options,stream){var Duplex=require('./_stream_duplex');options=options||{};var hwm=options.highWaterMark;var defaultHwm=options.objectMode?16:16*1024;this.highWaterMark=(hwm||hwm===0)?hwm:defaultHwm;this.objectMode=!!options.objectMode;if(stream instanceof Duplex)
        this.objectMode=this.objectMode||!!options.writableObjectMode;this.highWaterMark=~~this.highWaterMark;this.needDrain=!1;this.ending=!1;this.ended=!1;this.finished=!1;var noDecode=options.decodeStrings===!1;this.decodeStrings=!noDecode;this.defaultEncoding=options.defaultEncoding||'utf8';this.length=0;this.writing=!1;this.corked=0;this.sync=!0;this.bufferProcessing=!1;this.onwrite=function(er){onwrite(stream,er)};this.writecb=null;this.writelen=0;this.buffer=[];this.pendingcb=0;this.prefinished=!1;this.errorEmitted=!1}
    function Writable(options){var Duplex=require('./_stream_duplex');if(!(this instanceof Writable)&&!(this instanceof Duplex))
        return new Writable(options);this._writableState=new WritableState(options,this);this.writable=!0;Stream.call(this)}
    Writable.prototype.pipe=function(){this.emit('error',new Error('Cannot pipe. Not readable.'))};function writeAfterEnd(stream,state,cb){var er=new Error('write after end');stream.emit('error',er);process.nextTick(function(){cb(er)})}
    function validChunk(stream,state,chunk,cb){var valid=!0;if(!util.isBuffer(chunk)&&!util.isString(chunk)&&!util.isNullOrUndefined(chunk)&&!state.objectMode){var er=new TypeError('Invalid non-string/buffer chunk');stream.emit('error',er);process.nextTick(function(){cb(er)});valid=!1}
        return valid}
    Writable.prototype.write=function(chunk,encoding,cb){var state=this._writableState;var ret=!1;if(util.isFunction(encoding)){cb=encoding;encoding=null}
        if(util.isBuffer(chunk))
            encoding='buffer';else if(!encoding)
            encoding=state.defaultEncoding;if(!util.isFunction(cb))
            cb=function(){};if(state.ended)
            writeAfterEnd(this,state,cb);else if(validChunk(this,state,chunk,cb)){state.pendingcb++;ret=writeOrBuffer(this,state,chunk,encoding,cb)}
        return ret};Writable.prototype.cork=function(){var state=this._writableState;state.corked++};Writable.prototype.uncork=function(){var state=this._writableState;if(state.corked){state.corked--;if(!state.writing&&!state.corked&&!state.finished&&!state.bufferProcessing&&state.buffer.length)
        clearBuffer(this,state)}};function decodeChunk(state,chunk,encoding){if(!state.objectMode&&state.decodeStrings!==!1&&util.isString(chunk)){chunk=new Buffer(chunk,encoding)}
        return chunk}
    function writeOrBuffer(stream,state,chunk,encoding,cb){chunk=decodeChunk(state,chunk,encoding);if(util.isBuffer(chunk))
        encoding='buffer';var len=state.objectMode?1:chunk.length;state.length+=len;var ret=state.length<state.highWaterMark;if(!ret)
        state.needDrain=!0;if(state.writing||state.corked)
        state.buffer.push(new WriteReq(chunk,encoding,cb));else doWrite(stream,state,!1,len,chunk,encoding,cb);return ret}
    function doWrite(stream,state,writev,len,chunk,encoding,cb){state.writelen=len;state.writecb=cb;state.writing=!0;state.sync=!0;if(writev)
        stream._writev(chunk,state.onwrite);else stream._write(chunk,encoding,state.onwrite);state.sync=!1}
    function onwriteError(stream,state,sync,er,cb){if(sync)
        process.nextTick(function(){state.pendingcb--;cb(er)});else{state.pendingcb--;cb(er)}
        stream._writableState.errorEmitted=!0;stream.emit('error',er)}
    function onwriteStateUpdate(state){state.writing=!1;state.writecb=null;state.length-=state.writelen;state.writelen=0}
    function onwrite(stream,er){var state=stream._writableState;var sync=state.sync;var cb=state.writecb;onwriteStateUpdate(state);if(er)
        onwriteError(stream,state,sync,er,cb);else{var finished=needFinish(stream,state);if(!finished&&!state.corked&&!state.bufferProcessing&&state.buffer.length){clearBuffer(stream,state)}
        if(sync){process.nextTick(function(){afterWrite(stream,state,finished,cb)})}else{afterWrite(stream,state,finished,cb)}}}
    function afterWrite(stream,state,finished,cb){if(!finished)
        onwriteDrain(stream,state);state.pendingcb--;cb();finishMaybe(stream,state)}
    function onwriteDrain(stream,state){if(state.length===0&&state.needDrain){state.needDrain=!1;stream.emit('drain')}}
    function clearBuffer(stream,state){state.bufferProcessing=!0;if(stream._writev&&state.buffer.length>1){var cbs=[];for(var c=0;c<state.buffer.length;c++)
        cbs.push(state.buffer[c].callback);state.pendingcb++;doWrite(stream,state,!0,state.length,state.buffer,'',function(err){for(var i=0;i<cbs.length;i++){state.pendingcb--;cbs[i](err)}});state.buffer=[]}else{for(var c=0;c<state.buffer.length;c++){var entry=state.buffer[c];var chunk=entry.chunk;var encoding=entry.encoding;var cb=entry.callback;var len=state.objectMode?1:chunk.length;doWrite(stream,state,!1,len,chunk,encoding,cb);if(state.writing){c++;break}}
        if(c<state.buffer.length)
            state.buffer=state.buffer.slice(c);else state.buffer.length=0}
        state.bufferProcessing=!1}
    Writable.prototype._write=function(chunk,encoding,cb){cb(new Error('not implemented'))};Writable.prototype._writev=null;Writable.prototype.end=function(chunk,encoding,cb){var state=this._writableState;if(util.isFunction(chunk)){cb=chunk;chunk=null;encoding=null}else if(util.isFunction(encoding)){cb=encoding;encoding=null}
        if(!util.isNullOrUndefined(chunk))
            this.write(chunk,encoding);if(state.corked){state.corked=1;this.uncork()}
        if(!state.ending&&!state.finished)
            endWritable(this,state,cb)};function needFinish(stream,state){return(state.ending&&state.length===0&&!state.finished&&!state.writing)}
    function prefinish(stream,state){if(!state.prefinished){state.prefinished=!0;stream.emit('prefinish')}}
    function finishMaybe(stream,state){var need=needFinish(stream,state);if(need){if(state.pendingcb===0){prefinish(stream,state);state.finished=!0;stream.emit('finish')}else prefinish(stream,state)}
        return need}
    function endWritable(stream,state,cb){state.ending=!0;finishMaybe(stream,state);if(cb){if(state.finished)
        process.nextTick(cb);else stream.once('finish',cb)}
        state.ended=!0}}).call(this,require('_process'))},{"./_stream_duplex":257,"_process":255,"buffer":111,"core-util-is":262,"inherits":253,"stream":267}],262:[function(require,module,exports){(function(Buffer){function isArray(ar){return Array.isArray(ar)}
    exports.isArray=isArray;function isBoolean(arg){return typeof arg==='boolean'}
    exports.isBoolean=isBoolean;function isNull(arg){return arg===null}
    exports.isNull=isNull;function isNullOrUndefined(arg){return arg==null}
    exports.isNullOrUndefined=isNullOrUndefined;function isNumber(arg){return typeof arg==='number'}
    exports.isNumber=isNumber;function isString(arg){return typeof arg==='string'}
    exports.isString=isString;function isSymbol(arg){return typeof arg==='symbol'}
    exports.isSymbol=isSymbol;function isUndefined(arg){return arg===void 0}
    exports.isUndefined=isUndefined;function isRegExp(re){return isObject(re)&&objectToString(re)==='[object RegExp]'}
    exports.isRegExp=isRegExp;function isObject(arg){return typeof arg==='object'&&arg!==null}
    exports.isObject=isObject;function isDate(d){return isObject(d)&&objectToString(d)==='[object Date]'}
    exports.isDate=isDate;function isError(e){return isObject(e)&&(objectToString(e)==='[object Error]'||e instanceof Error)}
    exports.isError=isError;function isFunction(arg){return typeof arg==='function'}
    exports.isFunction=isFunction;function isPrimitive(arg){return arg===null||typeof arg==='boolean'||typeof arg==='number'||typeof arg==='string'||typeof arg==='symbol'||typeof arg==='undefined'}
    exports.isPrimitive=isPrimitive;function isBuffer(arg){return Buffer.isBuffer(arg)}
    exports.isBuffer=isBuffer;function objectToString(o){return Object.prototype.toString.call(o)}}).call(this,require("buffer").Buffer)},{"buffer":111}],263:[function(require,module,exports){module.exports=require("./lib/_stream_passthrough.js")},{"./lib/_stream_passthrough.js":258}],264:[function(require,module,exports){exports=module.exports=require('./lib/_stream_readable.js');exports.Stream=require('stream');exports.Readable=exports;exports.Writable=require('./lib/_stream_writable.js');exports.Duplex=require('./lib/_stream_duplex.js');exports.Transform=require('./lib/_stream_transform.js');exports.PassThrough=require('./lib/_stream_passthrough.js')},{"./lib/_stream_duplex.js":257,"./lib/_stream_passthrough.js":258,"./lib/_stream_readable.js":259,"./lib/_stream_transform.js":260,"./lib/_stream_writable.js":261,"stream":267}],265:[function(require,module,exports){module.exports=require("./lib/_stream_transform.js")},{"./lib/_stream_transform.js":260}],266:[function(require,module,exports){module.exports=require("./lib/_stream_writable.js")},{"./lib/_stream_writable.js":261}],267:[function(require,module,exports){module.exports=Stream;var EE=require('events').EventEmitter;var inherits=require('inherits');inherits(Stream,EE);Stream.Readable=require('readable-stream/readable.js');Stream.Writable=require('readable-stream/writable.js');Stream.Duplex=require('readable-stream/duplex.js');Stream.Transform=require('readable-stream/transform.js');Stream.PassThrough=require('readable-stream/passthrough.js');Stream.Stream=Stream;function Stream(){EE.call(this)}
    Stream.prototype.pipe=function(dest,options){var source=this;function ondata(chunk){if(dest.writable){if(!1===dest.write(chunk)&&source.pause){source.pause()}}}
        source.on('data',ondata);function ondrain(){if(source.readable&&source.resume){source.resume()}}
        dest.on('drain',ondrain);if(!dest._isStdio&&(!options||options.end!==!1)){source.on('end',onend);source.on('close',onclose)}
        var didOnEnd=!1;function onend(){if(didOnEnd)return;didOnEnd=!0;dest.end()}
        function onclose(){if(didOnEnd)return;didOnEnd=!0;if(typeof dest.destroy==='function')dest.destroy()}
        function onerror(er){cleanup();if(EE.listenerCount(this,'error')===0){throw er}}
        source.on('error',onerror);dest.on('error',onerror);function cleanup(){source.removeListener('data',ondata);dest.removeListener('drain',ondrain);source.removeListener('end',onend);source.removeListener('close',onclose);source.removeListener('error',onerror);dest.removeListener('error',onerror);source.removeListener('end',cleanup);source.removeListener('close',cleanup);dest.removeListener('close',cleanup)}
        source.on('end',cleanup);source.on('close',cleanup);dest.on('close',cleanup);dest.emit('pipe',source);return dest}},{"events":252,"inherits":253,"readable-stream/duplex.js":256,"readable-stream/passthrough.js":263,"readable-stream/readable.js":264,"readable-stream/transform.js":265,"readable-stream/writable.js":266}],268:[function(require,module,exports){var Buffer=require('buffer').Buffer;var isBufferEncoding=Buffer.isEncoding||function(encoding){switch(encoding&&encoding.toLowerCase()){case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':return!0;default:return!1}}
    function assertEncoding(encoding){if(encoding&&!isBufferEncoding(encoding)){throw new Error('Unknown encoding: '+encoding)}}
    var StringDecoder=exports.StringDecoder=function(encoding){this.encoding=(encoding||'utf8').toLowerCase().replace(/[-_]/,'');assertEncoding(encoding);switch(this.encoding){case 'utf8':this.surrogateSize=3;break;case 'ucs2':case 'utf16le':this.surrogateSize=2;this.detectIncompleteChar=utf16DetectIncompleteChar;break;case 'base64':this.surrogateSize=3;this.detectIncompleteChar=base64DetectIncompleteChar;break;default:this.write=passThroughWrite;return}
        this.charBuffer=new Buffer(6);this.charReceived=0;this.charLength=0};StringDecoder.prototype.write=function(buffer){var charStr='';while(this.charLength){var available=(buffer.length>=this.charLength-this.charReceived)?this.charLength-this.charReceived:buffer.length;buffer.copy(this.charBuffer,this.charReceived,0,available);this.charReceived+=available;if(this.charReceived<this.charLength){return ''}
        buffer=buffer.slice(available,buffer.length);charStr=this.charBuffer.slice(0,this.charLength).toString(this.encoding);var charCode=charStr.charCodeAt(charStr.length-1);if(charCode>=0xD800&&charCode<=0xDBFF){this.charLength+=this.surrogateSize;charStr='';continue}
        this.charReceived=this.charLength=0;if(buffer.length===0){return charStr}
        break}
        this.detectIncompleteChar(buffer);var end=buffer.length;if(this.charLength){buffer.copy(this.charBuffer,0,buffer.length-this.charReceived,end);end-=this.charReceived}
        charStr+=buffer.toString(this.encoding,0,end);var end=charStr.length-1;var charCode=charStr.charCodeAt(end);if(charCode>=0xD800&&charCode<=0xDBFF){var size=this.surrogateSize;this.charLength+=size;this.charReceived+=size;this.charBuffer.copy(this.charBuffer,size,0,size);buffer.copy(this.charBuffer,0,0,size);return charStr.substring(0,end)}
        return charStr};StringDecoder.prototype.detectIncompleteChar=function(buffer){var i=(buffer.length>=3)?3:buffer.length;for(;i>0;i--){var c=buffer[buffer.length-i];if(i==1&&c>>5==0x06){this.charLength=2;break}
        if(i<=2&&c>>4==0x0E){this.charLength=3;break}
        if(i<=3&&c>>3==0x1E){this.charLength=4;break}}
        this.charReceived=i};StringDecoder.prototype.end=function(buffer){var res='';if(buffer&&buffer.length)
        res=this.write(buffer);if(this.charReceived){var cr=this.charReceived;var buf=this.charBuffer;var enc=this.encoding;res+=buf.slice(0,cr).toString(enc)}
        return res};function passThroughWrite(buffer){return buffer.toString(this.encoding)}
    function utf16DetectIncompleteChar(buffer){this.charReceived=buffer.length%2;this.charLength=this.charReceived?2:0}
    function base64DetectIncompleteChar(buffer){this.charReceived=buffer.length%3;this.charLength=this.charReceived?3:0}},{"buffer":111}],269:[function(require,module,exports){module.exports=function isBuffer(arg){return arg&&typeof arg==='object'&&typeof arg.copy==='function'&&typeof arg.fill==='function'&&typeof arg.readUInt8==='function'}},{}],270:[function(require,module,exports){(function(process,global){var formatRegExp=/%[sdj%]/g;exports.format=function(f){if(!isString(f)){var objects=[];for(var i=0;i<arguments.length;i++){objects.push(inspect(arguments[i]))}
    return objects.join(' ')}
    var i=1;var args=arguments;var len=args.length;var str=String(f).replace(formatRegExp,function(x){if(x==='%%')return '%';if(i>=len)return x;switch(x){case '%s':return String(args[i++]);case '%d':return Number(args[i++]);case '%j':try{return JSON.stringify(args[i++])}catch(_){return '[Circular]'}
        default:return x}});for(var x=args[i];i<len;x=args[++i]){if(isNull(x)||!isObject(x)){str+=' '+x}else{str+=' '+inspect(x)}}
    return str};exports.deprecate=function(fn,msg){if(isUndefined(global.process)){return function(){return exports.deprecate(fn,msg).apply(this,arguments)}}
    if(process.noDeprecation===!0){return fn}
    var warned=!1;function deprecated(){if(!warned){if(process.throwDeprecation){throw new Error(msg)}else if(process.traceDeprecation){console.trace(msg)}else{console.error(msg)}
        warned=!0}
        return fn.apply(this,arguments)}
    return deprecated};var debugs={};var debugEnviron;exports.debuglog=function(set){if(isUndefined(debugEnviron))
    debugEnviron=process.env.NODE_DEBUG||'';set=set.toUpperCase();if(!debugs[set]){if(new RegExp('\\b'+set+'\\b','i').test(debugEnviron)){var pid=process.pid;debugs[set]=function(){var msg=exports.format.apply(exports,arguments);console.error('%s %d: %s',set,pid,msg)}}else{debugs[set]=function(){}}}
    return debugs[set]};function inspect(obj,opts){var ctx={seen:[],stylize:stylizeNoColor};if(arguments.length>=3)ctx.depth=arguments[2];if(arguments.length>=4)ctx.colors=arguments[3];if(isBoolean(opts)){ctx.showHidden=opts}else if(opts){exports._extend(ctx,opts)}
    if(isUndefined(ctx.showHidden))ctx.showHidden=!1;if(isUndefined(ctx.depth))ctx.depth=2;if(isUndefined(ctx.colors))ctx.colors=!1;if(isUndefined(ctx.customInspect))ctx.customInspect=!0;if(ctx.colors)ctx.stylize=stylizeWithColor;return formatValue(ctx,obj,ctx.depth)}
    exports.inspect=inspect;inspect.colors={'bold':[1,22],'italic':[3,23],'underline':[4,24],'inverse':[7,27],'white':[37,39],'grey':[90,39],'black':[30,39],'blue':[34,39],'cyan':[36,39],'green':[32,39],'magenta':[35,39],'red':[31,39],'yellow':[33,39]};inspect.styles={'special':'cyan','number':'yellow','boolean':'yellow','undefined':'grey','null':'bold','string':'green','date':'magenta','regexp':'red'};function stylizeWithColor(str,styleType){var style=inspect.styles[styleType];if(style){return '\u001b['+inspect.colors[style][0]+'m'+str+'\u001b['+inspect.colors[style][1]+'m'}else{return str}}
    function stylizeNoColor(str,styleType){return str}
    function arrayToHash(array){var hash={};array.forEach(function(val,idx){hash[val]=!0});return hash}
    function formatValue(ctx,value,recurseTimes){if(ctx.customInspect&&value&&isFunction(value.inspect)&&value.inspect!==exports.inspect&&!(value.constructor&&value.constructor.prototype===value)){var ret=value.inspect(recurseTimes,ctx);if(!isString(ret)){ret=formatValue(ctx,ret,recurseTimes)}
        return ret}
        var primitive=formatPrimitive(ctx,value);if(primitive){return primitive}
        var keys=Object.keys(value);var visibleKeys=arrayToHash(keys);if(ctx.showHidden){keys=Object.getOwnPropertyNames(value)}
        if(isError(value)&&(keys.indexOf('message')>=0||keys.indexOf('description')>=0)){return formatError(value)}
        if(keys.length===0){if(isFunction(value)){var name=value.name?': '+value.name:'';return ctx.stylize('[Function'+name+']','special')}
            if(isRegExp(value)){return ctx.stylize(RegExp.prototype.toString.call(value),'regexp')}
            if(isDate(value)){return ctx.stylize(Date.prototype.toString.call(value),'date')}
            if(isError(value)){return formatError(value)}}
        var base='',array=!1,braces=['{','}'];if(isArray(value)){array=!0;braces=['[',']']}
        if(isFunction(value)){var n=value.name?': '+value.name:'';base=' [Function'+n+']'}
        if(isRegExp(value)){base=' '+RegExp.prototype.toString.call(value)}
        if(isDate(value)){base=' '+Date.prototype.toUTCString.call(value)}
        if(isError(value)){base=' '+formatError(value)}
        if(keys.length===0&&(!array||value.length==0)){return braces[0]+base+braces[1]}
        if(recurseTimes<0){if(isRegExp(value)){return ctx.stylize(RegExp.prototype.toString.call(value),'regexp')}else{return ctx.stylize('[Object]','special')}}
        ctx.seen.push(value);var output;if(array){output=formatArray(ctx,value,recurseTimes,visibleKeys,keys)}else{output=keys.map(function(key){return formatProperty(ctx,value,recurseTimes,visibleKeys,key,array)})}
        ctx.seen.pop();return reduceToSingleString(output,base,braces)}
    function formatPrimitive(ctx,value){if(isUndefined(value))
        return ctx.stylize('undefined','undefined');if(isString(value)){var simple='\''+JSON.stringify(value).replace(/^"|"$/g,'').replace(/'/g,"\\'").replace(/\\"/g,'"')+'\'';return ctx.stylize(simple,'string')}
        if(isNumber(value))
            return ctx.stylize(''+value,'number');if(isBoolean(value))
            return ctx.stylize(''+value,'boolean');if(isNull(value))
            return ctx.stylize('null','null')}
    function formatError(value){return '['+Error.prototype.toString.call(value)+']'}
    function formatArray(ctx,value,recurseTimes,visibleKeys,keys){var output=[];for(var i=0,l=value.length;i<l;++i){if(hasOwnProperty(value,String(i))){output.push(formatProperty(ctx,value,recurseTimes,visibleKeys,String(i),!0))}else{output.push('')}}
        keys.forEach(function(key){if(!key.match(/^\d+$/)){output.push(formatProperty(ctx,value,recurseTimes,visibleKeys,key,!0))}});return output}
    function formatProperty(ctx,value,recurseTimes,visibleKeys,key,array){var name,str,desc;desc=Object.getOwnPropertyDescriptor(value,key)||{value:value[key]};if(desc.get){if(desc.set){str=ctx.stylize('[Getter/Setter]','special')}else{str=ctx.stylize('[Getter]','special')}}else{if(desc.set){str=ctx.stylize('[Setter]','special')}}
        if(!hasOwnProperty(visibleKeys,key)){name='['+key+']'}
        if(!str){if(ctx.seen.indexOf(desc.value)<0){if(isNull(recurseTimes)){str=formatValue(ctx,desc.value,null)}else{str=formatValue(ctx,desc.value,recurseTimes-1)}
            if(str.indexOf('\n')>-1){if(array){str=str.split('\n').map(function(line){return '  '+line}).join('\n').substr(2)}else{str='\n'+str.split('\n').map(function(line){return '   '+line}).join('\n')}}}else{str=ctx.stylize('[Circular]','special')}}
        if(isUndefined(name)){if(array&&key.match(/^\d+$/)){return str}
            name=JSON.stringify(''+key);if(name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)){name=name.substr(1,name.length-2);name=ctx.stylize(name,'name')}else{name=name.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'");name=ctx.stylize(name,'string')}}
        return name+': '+str}
    function reduceToSingleString(output,base,braces){var numLinesEst=0;var length=output.reduce(function(prev,cur){numLinesEst++;if(cur.indexOf('\n')>=0)numLinesEst++;return prev+cur.replace(/\u001b\[\d\d?m/g,'').length+1},0);if(length>60){return braces[0]+(base===''?'':base+'\n ')+' '+output.join(',\n  ')+' '+braces[1]}
        return braces[0]+base+' '+output.join(', ')+' '+braces[1]}
    function isArray(ar){return Array.isArray(ar)}
    exports.isArray=isArray;function isBoolean(arg){return typeof arg==='boolean'}
    exports.isBoolean=isBoolean;function isNull(arg){return arg===null}
    exports.isNull=isNull;function isNullOrUndefined(arg){return arg==null}
    exports.isNullOrUndefined=isNullOrUndefined;function isNumber(arg){return typeof arg==='number'}
    exports.isNumber=isNumber;function isString(arg){return typeof arg==='string'}
    exports.isString=isString;function isSymbol(arg){return typeof arg==='symbol'}
    exports.isSymbol=isSymbol;function isUndefined(arg){return arg===void 0}
    exports.isUndefined=isUndefined;function isRegExp(re){return isObject(re)&&objectToString(re)==='[object RegExp]'}
    exports.isRegExp=isRegExp;function isObject(arg){return typeof arg==='object'&&arg!==null}
    exports.isObject=isObject;function isDate(d){return isObject(d)&&objectToString(d)==='[object Date]'}
    exports.isDate=isDate;function isError(e){return isObject(e)&&(objectToString(e)==='[object Error]'||e instanceof Error)}
    exports.isError=isError;function isFunction(arg){return typeof arg==='function'}
    exports.isFunction=isFunction;function isPrimitive(arg){return arg===null||typeof arg==='boolean'||typeof arg==='number'||typeof arg==='string'||typeof arg==='symbol'||typeof arg==='undefined'}
    exports.isPrimitive=isPrimitive;exports.isBuffer=require('./support/isBuffer');function objectToString(o){return Object.prototype.toString.call(o)}
    function pad(n){return n<10?'0'+n.toString(10):n.toString(10)}
    var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];function timestamp(){var d=new Date();var time=[pad(d.getHours()),pad(d.getMinutes()),pad(d.getSeconds())].join(':');return[d.getDate(),months[d.getMonth()],time].join(' ')}
    exports.log=function(){console.log('%s - %s',timestamp(),exports.format.apply(exports,arguments))};exports.inherits=require('inherits');exports._extend=function(origin,add){if(!add||!isObject(add))return origin;var keys=Object.keys(add);var i=keys.length;while(i--){origin[keys[i]]=add[keys[i]]}
        return origin};function hasOwnProperty(obj,prop){return Object.prototype.hasOwnProperty.call(obj,prop)}}).call(this,require('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./support/isBuffer":269,"_process":255,"inherits":253}],271:[function(require,module,exports){var indexOf=require('indexof');var Object_keys=function(obj){if(Object.keys)return Object.keys(obj)
else{var res=[];for(var key in obj)res.push(key)
    return res}};var forEach=function(xs,fn){if(xs.forEach)return xs.forEach(fn)
else for(var i=0;i<xs.length;i++){fn(xs[i],i,xs)}};var defineProp=(function(){try{Object.defineProperty({},'_',{});return function(obj,name,value){Object.defineProperty(obj,name,{writable:!0,enumerable:!1,configurable:!0,value:value})}}catch(e){return function(obj,name,value){obj[name]=value}}}());var globals=['Array','Boolean','Date','Error','EvalError','Function','Infinity','JSON','Math','NaN','Number','Object','RangeError','ReferenceError','RegExp','String','SyntaxError','TypeError','URIError','decodeURI','decodeURIComponent','encodeURI','encodeURIComponent','escape','eval','isFinite','isNaN','parseFloat','parseInt','undefined','unescape'];function Context(){}
    Context.prototype={};var Script=exports.Script=function NodeScript(code){if(!(this instanceof Script))return new Script(code);this.code=code};Script.prototype.runInContext=function(context){if(!(context instanceof Context)){throw new TypeError("needs a 'context' argument.")}
        var iframe=document.createElement('iframe');if(!iframe.style)iframe.style={};iframe.style.display='none';document.body.appendChild(iframe);var win=iframe.contentWindow;var wEval=win.eval,wExecScript=win.execScript;if(!wEval&&wExecScript){wExecScript.call(win,'null');wEval=win.eval}
        forEach(Object_keys(context),function(key){win[key]=context[key]});forEach(globals,function(key){if(context[key]){win[key]=context[key]}});var winKeys=Object_keys(win);var res=wEval.call(win,this.code);forEach(Object_keys(win),function(key){if(key in context||indexOf(winKeys,key)===-1){context[key]=win[key]}});forEach(globals,function(key){if(!(key in context)){defineProp(context,key,win[key])}});document.body.removeChild(iframe);return res};Script.prototype.runInThisContext=function(){return eval(this.code)};Script.prototype.runInNewContext=function(context){var ctx=Script.createContext(context);var res=this.runInContext(ctx);forEach(Object_keys(ctx),function(key){context[key]=ctx[key]});return res};forEach(Object_keys(Script.prototype),function(name){exports[name]=Script[name]=function(code){var s=Script(code);return s[name].apply(s,[].slice.call(arguments,1))}});exports.createScript=function(code){return exports.Script(code)};exports.createContext=Script.createContext=function(context){var copy=new Context();if(typeof context==='object'){forEach(Object_keys(context),function(key){copy[key]=context[key]})}
        return copy}},{"indexof":272}],272:[function(require,module,exports){var indexOf=[].indexOf;module.exports=function(arr,obj){if(indexOf)return arr.indexOf(obj);for(var i=0;i<arr.length;++i){if(arr[i]===obj)return i}
    return-1}},{}]},{},[1])(1)})