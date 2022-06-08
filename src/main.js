import { Codec, StreamCamera } from 'pi-camera-connect';
import { SerialPort } from 'serialport';
import WebSocket from 'ws';
import * as colors from './colors.js';
import { solveIK } from './iksolver.js';

// ---------------- CAMERA ----------------

const streamCamera = new StreamCamera({
    codec: Codec.MJPEG,
    flip: 'vertical',
    width: 1296,
    height: 730,
});

console.log('[CAM] Starting Camera...');
await streamCamera.startCapture();
console.log('[CAM] Camera is ON');

// ---------------- WEBSOCKET CLIENT ----------------

// const WS_ADDR = 'ws://192.168.43.33:8888';
const WS_ADDR = 'wss://bau-capstone-1010168.herokuapp.com';
const td = new TextDecoder();
let sendFrameIntervalId = -1;

console.log('[WS] Connecting to the server...');
const ws = new WebSocket(WS_ADDR, { handshakeTimeout: 3000 });

ws.isStarted = false;
ws.sendMessage = (msg, cb) => {
    const msgStr = JSON.stringify(msg);
    ws.send(msgStr);
};

ws.on('open', () => {
    console.log(`[WS] Connected to "${WS_ADDR}"`);
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
            console.log('[WS] Message: ', msg);

            if (msg.name === 'move') {
                sendMoveCommand({ x: msg.x, y: msg.y });
            }
        }
    }
});

ws.on('ping', (data) => {
    console.log('[WS] Ping:', data);
});

ws.on('pong', (data) => {
    console.log('[WS] Pong:', data);
});

ws.on('error', (error) => {
    console.error('[WS] Error:', error);
});

ws.on('close', (code, reason) => {
    console.log('[WS] Connection closed:', code, reason);
    clearInterval(sendFrameIntervalId);
    streamCamera.stopCapture().then(() => {
        console.log('[CAM] Camera is OFF');

        console.log('[APP] Exiting in 10 seconds...');
        setTimeout(() => {
            console.log('👋 BYE');
            process.exit();
        }, 10_000);
    });
});

function createFrameInterval(fps) {
    clearInterval(sendFrameIntervalId);
    if (fps < 1) return;
    sendFrameIntervalId = setInterval(() => sendFrameBuffer(ws), 1000 / fps);
}

function sendFrameBuffer(ws) {
    streamCamera
        .takeImage()
        .then((frameBuffer) => {
            ws.send(frameBuffer);
        })
        .catch((err) => console.error(err));
}

// #region CV
//  {
//     format: 'jpeg',
//     width: 1920,
//     height: 1080,
//     channels: 3,
//     premultiplied: false,
//     size: 50472
//  }
// const data = await sharp(imageBuffer);
// console.log(data);
// #endregion

// #region Robot

// M106 S125   --> air pump ON
// M107 S125   --> air pump OFF
// G4 P60      --> wait 1 sec (P30 = 0.5s) (P120 = 2s) (3600 = 1min)
// G0 X0 Y0 Z0 --> move
// Z+ up
// Z- down
// X+ right
// X- left
// Y+ forward
// Y- backwards
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

function onPortOpen(err) {
    // Because there's no callback to write, write errors will be emitted on the port:
    if (err) {
        console.log('Error opening port: ', err.message);
        setTimeout(() => port.open(onPortOpen), 10_000);
        return;
    }

    setTimeout(() => sendHomeCommand(), 1000);

    // G4 P60 (wait 1 seconds)
    // port.write('G0 X00 Y400');
    // port.write(Buffer.from('M105'));

    // Z+ up
    // Z- down
    // X+ right
    // X- left
    // Y+ forward
    // Y- backwards
    // setTimeout(() => {
    //     // console.log('sending commands');
    //     // port.write(Buffer.from('M106 S125\n'));
    //     // setTimeout(() => {
    //     //     port.write(Buffer.from('M107 S125\n'));
    //     // }, 3_000);

    //     // port.write(Buffer.from('G1 X0\n'));
    //     // port.write(Buffer.from('G1 X15 Y15\n'));
    //     // port.write(Buffer.from('G1 X30 Y30\n'));
    //     // port.write(Buffer.from('G1 X45 Y45\n'));
    //     // port.write(Buffer.from('G1 X90 Y90\n'));
    //     port.write(Buffer.from('G1 X1 Y1\n'));
    //     port.write(Buffer.from('G1 X175 Y5\n'));
    // }, 1_000);
}

function onPortData(data) {
    process.stdout.write(td2.decode(data, { stream: true }));
}

function sendHomeCommand() {
    const cmd = `G28\nG1 X0 Y0 Z5\n`;

    console.log(`${colors.FgCyan}${cmd}${colors.Reset}`);
    port.write(Buffer.from(cmd));
}

function sendMoveCommand(target) {
    const [t1, t3] = solveIK(target);
    const cmd = `G1 X${parseInt(t1)} Y${parseInt(t3)}\n`;

    console.log(`${colors.FgCyan}${cmd}${colors.Reset}`);
    port.write(Buffer.from(cmd));
}

// #endregion
