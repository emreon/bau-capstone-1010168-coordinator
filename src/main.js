import { Codec, StreamCamera } from 'pi-camera-connect';
import sharp from 'sharp';
// const streamCamera = new StreamCamera({
//     codec: Codec.MJPEG,
// });
// const videoStream = streamCamera.createStream();
// await streamCamera.startCapture();
// videoStream.on('data', (data) => console.log('New video data', data));
// // Wait 5 seconds
// await new Promise((resolve) => setTimeout(() => resolve(), 5000));
// await streamCamera.stopCapture();
import { io } from 'socket.io-client';

const runApp = async () => {
    const streamCamera = new StreamCamera({
        codec: Codec.MJPEG,
    });

    await streamCamera.startCapture();
    await nextFrame(streamCamera, 30);
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
    const data = await sharp(imageBuffer).toFile(`images/frame_${(frameIndex + '').padStart(3, '0')}.jpg`);
    console.log(data);

    await nextFrame(streamCamera, frameIndex - 1);
}

runApp();

const socket = io('ws://192.168.1.222');

socket.on('connect', () => {
    console.log('Connected:', socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on('disconnect', () => {
    console.log('Disconnected.', socket.id); // undefined
});
