const chainConfig = require('./config/chain').defaultChain;
const utils = require("./utils/utils");
const fs = require('fs');

const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { GasPrice } = require('@cosmjs/stargate');
const amino = require('@cosmjs/amino');
const {AminoMsg, StdFee} = require('@cosmjs/amino');

// minter cannot give nft to himself
async function cannot_take_from_himself(_contract, _uri) {
    console.log("1. cannot_take_from_himself");
    const deployerWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        chainConfig.deployer_mnemonic,
        {
            prefix: chainConfig.prefix
        }
    );

    // get deployer account
    const deployerAccount = (await deployerWallet.getAccounts())[0];

    const testerWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        chainConfig.tester_mnemonic,
        {
            prefix: chainConfig.prefix
        }
    );

    // get tester account
    const testerAccount = (await testerWallet.getAccounts())[0];

    // gas price
    const gasPrice = GasPrice.fromString(`0.025${chainConfig.denom}`);

    // create message to sign
    const messageToSign = utils.createMessageToSign(chainConfig.chainId, testerAccount.address, deployerAccount.address, _uri);

    // sign message
    const permitSignature = await utils.getPermitSignatureAmino(messageToSign, chainConfig.deployer_mnemonic);

    // connect deployer wallet to chain
    const deployerClient = await SigningCosmWasmClient.connectWithSigner(chainConfig.rpcEndpoint, deployerWallet, {gasPrice});

    const memo = "take nft";
    // define the take message using the address of deployer, uri of the nft and permitSignature
    const ExecuteTakeMsg = {
        "take": {
            "from": deployerAccount.address,
            "uri": _uri,
            "signature": permitSignature,
        }
    }

    try {
        // take a NFT
        const takeResponse = await deployerClient.execute(deployerAccount.address, _contract, ExecuteTakeMsg, "auto", memo);
        console.log("cannot_take_from_himself FAILED!");
    } catch (e) {
        if ((""+e).includes("Cannot take from yourself")) {
            console.log("cannot_take_from_himself SUCCESSED!");
        } else {
            console.log("cannot_take_from_himself FAILED!");
            console.log("ERROR: ", e);
        }
    }
}

// cannot give nft if incorrect message is signed
async function incorrect_message(_contract, _uri) {
    console.log("2. incorrect_message");
    const deployerWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        chainConfig.deployer_mnemonic,
        {
            prefix: chainConfig.prefix
        }
    );

    const testerWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        chainConfig.tester_mnemonic,
        {
            prefix: chainConfig.prefix
        }
    );

    // get deployer account
    const deployerAccount = (await deployerWallet.getAccounts())[0];

    // gas price
    const gasPrice = GasPrice.fromString(`0.025${chainConfig.denom}`);

    // connect tester wallet to chain
    const testerClient = await SigningCosmWasmClient.connectWithSigner(chainConfig.rpcEndpoint, testerWallet, {gasPrice});

    // get tester account
    const testerAccount = (await testerWallet.getAccounts())[0];

    // create message to sign
    const messageToSign = utils.createMessageToSign(chainConfig.chainId+"211", testerAccount.address, deployerAccount.address, _uri);

    console.log("messageToSignaaaaaaaaaaaaaaaaaa: ", messageToSign);

    // sign message
    const permitSignature = await utils.getPermitSignatureAmino(messageToSign, chainConfig.deployer_mnemonic);

    const memo = "take nft";
    // define the take message using the address of deployer, uri of the nft and permitSignature
    const ExecuteTakeMsg = {
        "take": {
            "from": deployerAccount.address,
            "uri": _uri,
            "signature": permitSignature,
        }
    }

    console.log("permitSignature: ", permitSignature);

    try {
        // take a NFT
    const takeResponse = await testerClient.execute(testerAccount.address, _contract, ExecuteTakeMsg, "auto", memo);
        console.log("incorrect_message FAILED!");
    } catch (e) {
        if ((""+e).includes("Incorrect message")) {
            console.log("incorrect_message SUCCESSED!");
        } else {
            console.log("incorrect_message FAILED!");
            console.log("ERROR: ", e);
        }
    }
}


async function take_success(_contract, _uri) {
    console.log("4. take_success");
    const deployerWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        chainConfig.deployer_mnemonic,
        {
            prefix: chainConfig.prefix
        }
    );

    const testerWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        chainConfig.tester_mnemonic,
        {
            prefix: chainConfig.prefix
        }
    );

    // get deployer account
    const deployerAccount = (await deployerWallet.getAccounts())[0];

    // gas price
    const gasPrice = GasPrice.fromString(`0.025${chainConfig.denom}`);

    // connect tester wallet to chain
    const testerClient = await SigningCosmWasmClient.connectWithSigner(chainConfig.rpcEndpoint, testerWallet, {gasPrice});

    // get tester account
    const testerAccount = (await testerWallet.getAccounts())[0];

    // create message to sign
    const messageToSign = utils.createMessageToSign(chainConfig.chainId, testerAccount.address, deployerAccount.address, _uri);

    // sign message
    const permitSignature = await utils.getPermitSignatureAmino(messageToSign, chainConfig.deployer_mnemonic);

    const memo = "take nft";
    // define the take message using the address of deployer, uri of the nft and permitSignature
    const ExecuteTakeMsg = {
        "take": {
            "from": deployerAccount.address,
            "uri": _uri,
            "signature": permitSignature,
        }
    }

    // take a NFT
    const takeResponse = await testerClient.execute(testerAccount.address, _contract, ExecuteTakeMsg, "auto", memo);

    console.log(takeResponse);
    console.log("take_success SUCCESSED!");
}


async function main() {
    const myArgs = process.argv.slice(2);
    await cannot_take_from_himself(myArgs[0], myArgs[1]);
    await incorrect_message(myArgs[0], myArgs[1]);
    // await take_success(myArgs[0], myArgs[1]);
}

main();
