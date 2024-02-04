import Socket from "./Socket";
import PeerJs from "./PeerJs";
import configs from "../../configs";

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
    this.configs = configs.webrtc;

    this.Room = require('./modules/Room')();
    this.Media = require('./modules/Media')();
    this.People = require('./modules/People')();
    this.Events = require('./modules/Events')();

    this.options.micMute = false;
  }

  setup({ options, callback, connections, waitingList, userSettings }) {
    this.options = Object.assign(this.options, options);
    this.callback = Object.assign(this.callback, callback);
    this.userSettings = userSettings;

    this.Room.setup(this, options);
    this.Media.setup(this, options);
    this.People.setup(this, connections, waitingList, options);
  }

  async initial(options) {
    this.socketObject = new Socket();
    this.socketObject.initial(options).then(() => {
      this.socketObject.initialized = true;
      this.socket = this.socketObject.socket;

      this.Events.setup(this);
      this.Events.listen();

      // set events
      this.on('peerJsData', 'muteMedia', this.Media.setConnectionMediaStatus);

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
    return new Promise(async (resolve, reject) => {
      try {
        await new PeerJs(this.Events).then((peerJsObject) => {
          this.peerJsObject = peerJsObject;
          this.peerJs = this.peerJsObject.videoPeer;
          this.peerJsId = this.peerJsObject.getId();

          resolve(this.peerJsId);
        });
      } catch(error) {
        reject(error);
      }
    });
  }

  /**
   * Start grab user media and stream
   */
  startStreamUserMedia(devices) {
    return new Promise((resolve, reject) => {
      try {
        this.Media.grab(
          devices,
          this.userSettings.camDisable,
          this.userSettings.micDisable,
        ).then((media) => {
          this.peerJs.on('call', async (mediaConnection) => {
            const dataConnection = this.peerJs.connect(mediaConnection.peer);
            await this.People.add(mediaConnection, dataConnection);
            mediaConnection.answer(this.Media.userMedia);
          });

          this.userSettings.peerJsId = this.peerJsId;
          this.Media.streamVideo(null, media);
          resolve(true);
        });
      } catch(error) {
        reject(error);
      }
    });
  }

  /**
   * Connect To New Joined User
   */
  async connectToNewUser(data) {
    const mediaConnection = this.peerJs.call(data.peerJsId, this.Media.userMedia);
    const dataConnection = this.peerJs.connect(data.peerJsId);

    await this.People.add(mediaConnection, dataConnection, data);

    mediaConnection.on('close', () => {
      console.log('Close user...' + mediaConnection.peer);
    });
    mediaConnection.on('error', (error) => {
      console.log('error user... ' + error);
    });
  }

  /**
   * Request to run user action
   */
  runAction(roomId, action) {
    this.socket.emit('run-room-action', roomId, action);
  }

  /**
   * Define event
   */
  on(type, event, method) {
    this.Events.addEvent(type, event, method);
  }

  async getDevices() {
    return await navigator.mediaDevices.enumerateDevices().then(devices => {
      return devices.filter(item => {
        return item.deviceId !== 'default' && item.deviceId !== 'communications';
      });
    }).catch((error) => {
      console.log(error);
      return false;
    });
  }

  camelToKebab(name) {
    name = name.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

    return name;
  }

  kebabToCamel(name) {
    name = name.replace(/-[a-z]/g, m => m.slice(1).toUpperCase());

    return name;
  }

}

/**
 * initial webrtc
 */
let options = {};
options.port = configs.webrtc.webrtc_url;

const webrtc = new Webrtc();
webrtc.initial(options);

export default webrtc;
