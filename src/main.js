const PiCamera = require('pi-camera');
const myCamera = new PiCamera({
    mode: 'photo',
    width: 640,
    height: 480,
    nopreview: true,
});

myCamera
    .snapDataUrl()
    .then((result) => {
        // Your picture was captured
        console.log('<img src="${result}">');
    })
    .catch((error) => {
        // Handle your error
        console.error(error);
    });
