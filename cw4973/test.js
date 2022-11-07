const chainConfig = require('./config/chain').defaultChain;

const fs = require('fs');

const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { GasPrice } = require('@cosmjs/stargate');
const amino = require('@cosmjs/amino');
const {AminoMsg, StdFee} = require('@cosmjs/amino');

function createMessageToSign(chainID, active, passive, uri) {
    const AGREEMENT = 'Agreement(address active,address passive,string tokenURI)';

    // create message to sign based on concating AGREEMENT, signer, receiver, and uri
    const message = AGREEMENT + active + passive + uri;

    const mess = {
        type: "sign/MsgSignData",
        value: {
            signer: String(passive),
            data: String(message)
        }
    };

    console.log("mess: ", mess);

    const fee = {
        gas: "0",
        amount: []
    };

    console.log("fee: ", fee);

    const messageToSign = amino.makeSignDoc(mess, fee, String(chainID), "",  0, 0);

    return messageToSign;
}

