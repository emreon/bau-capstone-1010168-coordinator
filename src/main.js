import { Codec, StreamCamera } from 'pi-camera-connect';
import sharp from 'sharp';
import WebSocket from 'ws';

const runApp = async () => {
    const streamCamera = new StreamCamera({
        codec: Codec.MJPEG,
    });

    console.log('Waiting 1 second...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await streamCamera.startCapture();
    // await nextFrame(streamCamera, 30);
    const imageBuffer = await streamCamera.takeImage();
    const data = await sharp(imageBuffer);
    console.log(data);
    await streamCamera.stopCapture();
};

async function nextFrame(streamCamera, frameIndex) {
    if (frameIndex < 0) return undefined;

    const imageBuffer = await streamCamera.takeImage();
    console.log('Buffer Length:', imageBuffer.length);

    //  {
    //     format: 'jpeg',
    //     width: 1920,
    //     height: 1080,
    //     channels: 3,
    //     premultiplied: false,
    //     size: 50472
    //  }
    // const data = await sharp(imageBuffer).toFile(`images/frame_${(frameIndex + '').padStart(3, '0')}.jpg`);
    const data = await sharp(imageBuffer);
    console.log(data);

    await nextFrame(streamCamera, frameIndex - 1);
}

// runApp();

// -------- CAMERA --------

const streamCamera = new StreamCamera({
    codec: Codec.MJPEG,
    flip: 'both',
    // width: 640,
    // height: 480,
});

console.log('[APP] Starting Camera...');
await streamCamera.startCapture();

// await nextFrame(streamCamera, 30);
// const imageBuffer = await streamCamera.takeImage();
// const data = await sharp(imageBuffer);
// console.log(data);
// await streamCamera.stopCapture();

// -------- WEBSOCKET CLIENT --------

console.log('[APP] Connecting to the server...');

const WS_ADDR = 'ws://192.168.1.222:8888';
const ws = new WebSocket(WS_ADDR, { handshakeTimeout: 3000 });
const td = new TextDecoder();
let sendFrameIntervalId = -1;
let fps = 0;

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
    if (!isBinary) {
        const msgStr = td.decode(data);
        const msg = JSON.parse(msgStr);
        handleMessage(ws, msg);
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
        console.log('BYE');
        process.exit();
    });
});

function handleMessage(ws, msg) {
    console.log('[WS] Message:', msg);

    if (msg === 'start') {
        if (ws.isStarted) return;
        ws.isStarted = true;
        createFrameInterval(10);
    } else if (msg === 'stop') {
        if (!ws.isStarted) return;
        ws.isStarted = false;
        clearInterval(sendFrameIntervalId);
    }
}

function sendFrameBuffer(ws) {
    streamCamera
        .takeImage()
        .then((frameBuffer) => {
            ws.send(frameBuffer);
        })
        .catch((err) => console.error(err));
}

function createFrameInterval(fps) {
    clearInterval(sendFrameIntervalId);
    if (fps < 1) return;
    sendFrameIntervalId = setInterval(() => sendFrameBuffer(ws), 1000 / fps);
}

// console.log(`message:`, e);
// if (e.data instanceof ArrayBuffer) {
//     frameChunks.push(e.data);
// } else if (e.data === 'end') {
//     frameBlob = new Blob(frameChunks, { type: 'image/png' });
//     const frameEl = document.getElementById('frame');
//     if (frameEl.src) URL.revokeObjectURL(frameEl.src);
//     frameEl.src = URL.createObjectURL(frameBlob);
//     frameEl.onload = function (e) {
//         console.log('loaded', e);
//     };
// }
