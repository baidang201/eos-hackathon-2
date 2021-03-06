const Eos = require('eosjs');
const Gpio = require('onoff').Gpio;

const conf = require('./config.js');

const led1 = new Gpio(conf.pins.led1, 'out');
const led2 = new Gpio(conf.pins.led2, 'out');


let eos = Eos({
    keyProvider: conf.eos.privateKey,
    chainId: conf.eos.chainId,
    httpEndpoint: conf.eos.httpEndpoint,
});


async function sendTrx(data) {
    try {
        let contract = await eos.contract(conf.eos.contract);

        await contract.devicesignal(conf.eos.accountName, data, {authorization: conf.eos.accountName});
        tickLed(led2);
    } catch (e) {
        console.log("EOS ERROR:", e);
    }
}


/*
function sendTrx(data) {
    setTimeout(() => {
        tickLed(led2);
    }, 500);
}
*/


function tickLed(led) {
    led.writeSync(led.readSync() ^ 1);
    setTimeout(() => {
        led.writeSync(led.readSync() ^ 1);
    }, 70);
}


let spawn = require("child_process").spawn;
let pythonProcess = spawn('python', ["readRfid.py"], {env: {PYTHONPATH: "./libs/MFRC522"}});

let lastTick = {};
pythonProcess.stdout.on('data', (data) => {
    let uid = 0;
    let json = null;
    try {
        json = JSON.parse(data);
        uid = json.uid[0];
        uid = (uid << 8) | json.uid[1];
        uid = (uid << 8) | json.uid[2];
        uid = (uid << 8) | json.uid[3];
    } catch(e) {
        console.log(e.toString());
        return;
    }

    console.log(uid);
    if (lastTick[uid.toString()] && (new Date().getTime() - lastTick[uid.toString()]) < 500)
        return;

    tickLed(led1);
    sendTrx(uid);

    lastTick[uid.toString()] = new Date().getTime();
});


process.on('SIGINT', function () {
    led1.unexport();
    led2.unexport();
});
