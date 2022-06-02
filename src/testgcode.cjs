const { SerialPort } = require('serialport');

// https://www.npmjs.com/package/serialport
// https://serialport.io/docs/api-serialport
var port = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 250_000,
    // baudRate: 115200,
    // dataBits: 8,
    // parity: 'none',
    // stopBits: 1,
    // flowControl: false,
    autoOpen: false,
});

// var ByteLength = require('@serialport/parser-byte-length');
// var parser = port.pipe(new ByteLength({length: 16}));

// parser.on('data', function (data) {
//     var dataUTF8 = data.toString('utf-8');
//     if (dataUTF8.substring(0, 1) === ":") {
//         console.log('Data: ' + data);
//     }
// });

port.open(function (err) {
    // Because there's no callback to write, write errors will be emitted on the port:
    if (err) {
        return console.log('Error opening port: ', err.message);
    }

    // G4 P60 (wait 1 seconds)
    // port.write('G0 X00 Y400');
    // port.write(Buffer.from('M105'));

    // Z+ up
    // Z- down
    // X+ right
    // X- left
    // Y+ forward
    // Y- backwards
    setTimeout(() => {
        console.log('sending commands');
        port.write(Buffer.from('M106 S125\n'));
        setTimeout(() => {
            port.write(Buffer.from('M107 S125\n'));
        }, 3_000);
    }, 1_000);
});

port.on('data', function (data) {
    console.log(data.toString());
});
