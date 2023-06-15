import Socket from "./Socket";
import PeerJs from "./PeerJs";
import socketConfig from '../../configs/webRTCsocket';

class Webrtc
{
  constructor() {
    this.socketObject = null;
    this.peerJsObject = null;
    this.socket = null;
    this.peerJs = null;
    this.userSettings = {};
    this.initialized = false;
    this.peerJsId = null;
    this.options = {};
    this.callback = {};

    this.Room = require('./modules/Room')();
    this.Media = require('./modules/Media')();
    this.People = require('./modules/People')();
    this.Events = require('./modules/Events')();

    this.options.micMute = false;
  }

  setup({ options, callback, connections, userSettings }) {
    this.options = Object.assign(this.options, options);
    this.callback = Object.assign(this.callback, callback);
    this.userSettings = userSettings;

    this.Media.setup(this, options.videoRef);
    this.Room.setup(this, options.videoRef);
    this.People.setup(this, connections, options.peerRef);
  }

  async initial(options) {
    this.socketObject = new Socket();
    this.socketObject.initial(options).then(() => {
      this.socketObject.initialized = true;
      this.socket = this.socketObject.socket;

      this.Events.setup(this);
      this.Events.listen();

    }).catch(err => {
      console.log('error happened for webrtc initial', err);
    });
  }

  callbackAction(name, data = {}, consoleText = 'callback function not set.') {
    if (!!this.callback[name]) {
      this.callback[name](data);
    } else {
      console.log(consoleText);
    }
  }

  /**
   * Start User Socket Connection
   */
  connection(data, status = true) {
    this.socket.io.opts.query = {
      "user-id": data.id || null,
      "user-token": data.token
    };

    return status ? this.socket.open() : this.socket.close;
  }

  /**
   * Start PeerJs Connection
   */
  async initialPeerJs() {
    return new Promise(async (resolve) => {
      await new PeerJs().then((peerJsObject) => {
        this.peerJsObject = peerJsObject;
        this.peerJs = this.peerJsObject.videoPeer;
        this.peerJsId = this.peerJsObject.getId();

        resolve(this.peerJsId);
      });
    });
  }

  /**
   * Start grab user media and stream
   */
  startStreamUserMedia() {
    return new Promise((resolve) => {
      this.Media.grab().then((media) => {
        this.peerJs.on('call', async (call) => {
          await this.People.add(call);
          console.log(media);
          call.answer(media);
        });

        this.userSettings.peerJsId = this.peerJsId;
        this.Media.streamUserMedia();
        resolve(true);
      });
    });

  }

  /**
   * Connect To New Joined User
   */
  async connectToNewUser(data) {
    const call = this.peerJs.call(data.peerJsId, this.Media.userMedia);
    await this.People.add(call, data);

    call.on('close', () => {
      console.log('Close user...' + call.peer);
    });
    call.on('error', (error) => {
      console.log('error user... ' + error);
    });
  }

  /**
   * Request to run user action
   */
  runAction(roomId, action) {
    this.socket.emit('run-room-action', roomId, action);
  }
}

/**
 * initial webrtc
 */
let options = {};
options.port = socketConfig.webrtc_url;

const webrtc = new Webrtc();
webrtc.initial(options);

export default webrtc;
