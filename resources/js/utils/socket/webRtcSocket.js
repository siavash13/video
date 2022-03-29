import Socket from "./Socket";
import socketConfig from '../../configs/socket';

let options = {};
let socket  = new Socket();

options.port = socketConfig.webrtc_url;

socket.initial(options).then(() => {
    socket.initialized = true;
}).catch(err => {
    console.log('error happened for webrtc initial', err);
});

export default socket;
