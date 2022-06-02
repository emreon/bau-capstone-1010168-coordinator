// https://stackoverflow.com/questions/36373486/set-encoding-for-a-nodejs-transform-stream-in-a-safe-manner
// https://nodejs.org/dist/latest-v5.x/docs/api/string_decoder.html
import { StringDecoder } from 'string_decoder';
var d = new StringDecoder('utf8');
// var b = Buffer.from('🇹🇷');
// var b = Buffer.from([0xf0, 0x9f, 0x87, 0xb9, 0xf0, 0x9f, 0x87, 0xb7]);
var b = Buffer.from([0xf0, 0x9f, 0x87]);
var b2 = Buffer.from([0xb9, 0xf0, 0x9f, 0x87, 0xb7]);
d.write(b);

console.log(b); //write buffer
console.log('decoded:', d.write(b2)); // write decoded buffer;
console.log('end:', Buffer.from(d.end()));
