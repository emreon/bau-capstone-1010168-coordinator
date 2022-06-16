import { Codec, StreamCamera } from 'pi-camera-connect';
import { SerialPort } from 'serialport';
import WebSocket from 'ws';
import * as colors from './colors.js';
import { solveIK } from './iksolver.js';

// ---------------- CAMERA ----------------

const streamCamera = new StreamCamera({
    codec: Codec.MJPEG,
    flip: 'both',
    width: 1296,
    height: 730,
});

console.log('Starting Camera...');
await streamCamera.startCapture();
console.log('Camera is ON');

// ---------------- WEBSOCKET CLIENT ----------------

// const WS_ADDR = 'ws://192.168.2.68:8888';
const WS_ADDR = 'wss://bau-capstone-1010168.herokuapp.com';
const td = new TextDecoder();
let sendFrameIntervalId = -1;

console.log('Connecting to the server...');
const ws = new WebSocket(WS_ADDR, { handshakeTimeout: 3000 });

ws.sendMessage = (msg, cb) => {
    const msgStr = JSON.stringify(msg);
    ws.send(msgStr);
};

ws.on('open', () => {
    console.log(`Connected to "${WS_ADDR}"`);
    ws.sendMessage('🤖');
});

ws.on('message', (data, isBinary) => {
    // TEXT MESSAGE
    if (!isBinary) {
        const msgStr = td.decode(data);
        const msg = JSON.parse(msgStr);

        // SERVER: ACK
        if (msg === '🎞️') {
            sendFrameBuffer(ws);
        }

        // OTHER ...
        else {
            console.log('Message:', msg);

            // MOVE
            if (msg.name === 'move') {
                sendMoveCommand({ x: msg.x, y: msg.y });
            }
            // MOVE 2
            if (msg.name === 'move2') {
                sendMove2Command({ t1: msg.t1, t2: msg.t2 });
            }
            // PICK
            else if (msg === '🧲') {
                sendPickCommand();
            }
            // PLACE
            else if (msg === '🎯') {
                sendPlaceCommand();
            }
            // HOME
            else if (msg === '🏠') {
                sendHomeCommand();
            }
            // C2CS
            else if (msg.name === 'C2CS') {
                sendC2CSCommand(msg.wmm, msg.hmm);
            }
        }
    }
});

ws.on('ping', (data) => {
    console.log('Ping:', data);
});

ws.on('pong', (data) => {
    console.log('Pong:', data);
});

ws.on('error', (error) => {
    console.error('Socket Error:', error);
});

ws.on('close', (code, reason) => {
    console.log('Connection closed:', code, reason);
    clearInterval(sendFrameIntervalId);
    streamCamera.stopCapture().then(() => {
        console.log('Camera is OFF');

        console.log('Exiting in 10 seconds...');
        setTimeout(() => {
            console.log('BYE 👋');
            process.exit();
        }, 10_000);
    });
});

function sendFrameBuffer(ws) {
    streamCamera
        .takeImage()
        .then((frameBuffer) => {
            ws.send(frameBuffer);
        })
        .catch((err) => console.error(err));
}

// #region Robot

// M106 S125   --> air pump ON
// M107 S125   --> air pump OFF
// G4 P60      --> wait 1 sec (P30 = 0.5s) (P120 = 2s) (P3600 = 1min)
// G1 Z50      --> move to 50mm (up-down axis)
// G1 X0 Y0    --> set motor degrees (X = theta 1) (Y = theta 3)
//
// X+          --> right
// Y+          --> forward
// Z+          --> up
const td2 = new TextDecoder();

// https://www.npmjs.com/package/serialport
// https://serialport.io/docs/api-serialport
const port = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115_200,
    autoOpen: false,
});

port.open(onPortOpen);
port.on('data', onPortData);
port.on('close', onPortClose);

function onPortOpen(err) {
    // Because there's no callback to write, write errors will be emitted on the port:
    if (err) {
        console.error('Serial Error: ', err);
        setTimeout(() => port.open(onPortOpen), 10_000);
        return;
    }

    setTimeout(() => sendHomeCommand(), 1000);
}

function onPortClose(err) {
    if (err) {
        console.error('Serial Error: ', err);
    }

    console.log('Serial closed');
    setTimeout(() => port.open(onPortOpen), 10_000);
}

function onPortData(data) {
    process.stdout.write(td2.decode(data, { stream: true }));
}

function sendCommand(cmd) {
    process.stdout.write(`${colors.FgCyan}${cmd}${colors.Reset}`);
    port.write(Buffer.from(cmd));
}

function sendBulkCommands(cmdArr) {
    cmdArr.forEach((c) => process.stdout.write(`${colors.FgCyan}${c}${colors.Reset}\n`));
    const cmd = cmdArr.join('\n') + '\n';
    port.write(Buffer.from(cmd));
}

function sendHomeCommand() {
    const cmdArr = ['G28', 'G1 Z100', 'G1 X0 Y0', 'G1 X90 Y90'];
    sendBulkCommands(cmdArr);
}

function sendMoveCommand(target) {
    const [t1, t3] = solveIK(target);
    const cmd = `G1 X${parseInt(t1)} Y${parseInt(t3)}\n`;
    sendCommand(cmd);
}

function sendMove2Command(target) {
    const t1 = parseInt(target.t1);
    const t2 = parseInt(target.t2);
    const t3 = t1 + t2;
    const cmd = `G1 X${t1} Y${t3}\n`;
    sendCommand(cmd);
}

function sendPickCommand() {
    const cmdArr = ['G1 Z5', 'M106 S125', 'G4 P60', 'G1 Z100'];
    sendBulkCommands(cmdArr);
}

function sendPlaceCommand() {
    const cmd = 'M107 S125\n';
    sendCommand(cmd);
}

// Corner To Corner Sequence
function sendC2CSCommand(wmm, hmm) {
    const [t1_00, t3_00] = solveIK({ x: 0, y: 0 });
    const cmd_00 = `G1 X${parseInt(t1_00)} Y${parseInt(t3_00)}`;

    const [t1_01, t3_01] = solveIK({ x: 0, y: hmm });
    const cmd_01 = `G1 X${parseInt(t1_01)} Y${parseInt(t3_01)}`;

    const [t1_11, t3_11] = solveIK({ x: wmm, y: hmm });
    const cmd_11 = `G1 X${parseInt(t1_11)} Y${parseInt(t3_11)}`;

    const [t1_10, t3_10] = solveIK({ x: wmm, y: 0 });
    const cmd_10 = `G1 X${parseInt(t1_10)} Y${parseInt(t3_10)}`;

    const cmdArr = [cmd_00, 'G4 P60', cmd_01, 'G4 P60', cmd_11, 'G4 P60', cmd_10, 'G4 P60', cmd_00];
    sendBulkCommands(cmdArr);
}

// #endregion
