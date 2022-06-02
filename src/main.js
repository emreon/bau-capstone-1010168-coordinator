import { Codec, StreamCamera } from 'pi-camera-connect';
import WebSocket from 'ws';

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

const WS_ADDR = 'ws://192.168.1.222:8888';
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
        console.log('[WS] Message: ', msg);

        // Start sending frames
        if (msg.type === 'start') {
            if (ws.isStarted) return;
            console.log('[WS] Start', '| Target FPS:', msg.targetFPS);

            ws.isStarted = true;
            createFrameInterval(msg.targetFPS);
        }
        // Stop sending frames
        else if (msg === 'stop') {
            if (!ws.isStarted) return;
            console.log('[WS] Stop');

            ws.isStarted = false;
            clearInterval(sendFrameIntervalId);
        }
        // Change target FPS
        else if (msg.type === 'fps') {
            if (!ws.isStarted) return;
            console.log('[WS] Target FPS:', msg.targetFPS);

            createFrameInterval(msg.targetFPS);
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
        console.log('👋 BYE');
        process.exit();
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

// ---------------- CV ----------------

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

// ---------------- ROBOT ----------------

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

// import { SerialPort } from 'serialport'
