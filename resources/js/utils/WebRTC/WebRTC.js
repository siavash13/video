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
    this.connections = [];
    this.userSettings = {};
    this.initialized = false;
    this.media = null;
    this.peerJsId = null;
    this.options = {};
    this.callback = {};
    this.roomSettings = {};

    this.options.micMute = false;
  }

  setup({ videoRef, peerRef, connections, userSettings, joinRoom, leftRoom, invalidRoom }) {
    this.options.videoRef  = videoRef;
    this.options.peerRef   = peerRef;
    this.connections = connections;
    this.userSettings = userSettings;

    this.callback.joinRoom = joinRoom;
    this.callback.leftRoom = leftRoom;
    this.callback.invalidRoom = invalidRoom;
  }

  async initial(options) {
    this.socketObject = new Socket();
    this.socketObject.initial(options).then(() => {
      this.socketObject.initialized = true;
      this.socket = this.socketObject.socket;

      // set socket listeners
      this.socket.on('user-connected', (data) => {
        this.connectToNewUser(data);

        console.log('user-connected');
        console.log(data);

        if (!!this.callback.joinRoom) {
          this.callback.joinRoom(data);
        } else {
          console.log('user join room.');
        }
      });

      this.socket.on('room-information', (data) => {
        this.roomSettings = data;

        let index = data.users.findIndex(x => x.peerJsId === this.peerJsId);

        if(data.users[index].roomCreator) {
          this.userSettings['isCreator'] = true;
        }

        console.log('room-information');
        console.log(data);
      });

      this.socket.on('user-left-room', (data) => {
        let index = this.connections.findIndex(x => x.id === data.peerJsId);
        this.connections[index].call.close();
        this.connections[index].active = false;

        if (!!this.callback.leftRoom) {
          this.callback.leftRoom(data);
        } else {
          console.log('user left room.');
        }
      });

      this.socket.on('room-id-invalid', () => {
        if (!!this.callback.invalidRoom) {
          this.callback.invalidRoom();
        } else {
          console.log('room id is invalid!');
        }
      });

    }).catch(err => {
      console.log('error happened for webrtc initial', err);
    });
  }

  /**
   * Start User Socket Connection
   */
  connection(data, status = true) {
    this.socket.io.opts.query = {
      "user-id": data.id || null,
      "user-token": data.token
    };

    if (status) {

    }

    return status ? this.socket.open() : this.socket.close;
  }

  /**
   * Start PeerJs Connection
   */
  async initialPeerJs() {
    this.peerJsObject = new PeerJs();
    this.peerJs = this.peerJsObject.videoPeer;

    await this.grabMedia();

    this.peerJs.on('call', async call => {
      let index = await this.createConnection(call);
      call.answer(this.media);
      call.on('stream', peerVideoStream => {
        let peerRef = document.querySelectorAll(this.options.peerRef);
        this.stream(peerRef[index], peerVideoStream);
      });
    });

    this.peerJsId = this.peerJsObject.getId();

    return this.peerJsId;
  }

  /**
   * Create peerJs users Connections
   */
  async createConnection(call) {
    let index = this.connections.findIndex(x => x.id === call.peer);

    if (index === -1) {
      let count = this.connections.push({
        id: call.peer,
        call: call,
        active: true,
        isCreator: false,
      });

      if(!!this.roomSettings.users) {
        let userIndex = this.roomSettings.users.findIndex(x => x.peerJsId === call.peer);

        if (userIndex > -1) {
          this.connections[(count - 1)].isCreator = this.roomSettings.users[userIndex].roomCreator;
        }
      }

      return (count - 1);
    }

    return index;
  }

  /**
   * User Join Room
   */
  joinRoom(roomId, userData = {}) {
    let data = Object.assign({ peerJsId: this.peerJsId, }, userData)

    this.socket.emit('join-room', roomId, data);
    let videoRef = document.querySelector(this.options.videoRef);
    this.stream(videoRef, this.media, true);
  }

  /**
   * User Left Room
   */
  leftRoom(roomId, userData = {}) {
    this.connections.forEach((connection) => {
      connection.call.close();
    });

    this.releaseMedia();
    this.connections = [];
    this.peerJs.destroy();

    let data = Object.assign({ peerJsId: this.peerJsId, }, userData)

    this.socket.emit('left-room', roomId, data, (data) => {
      console.log(data);
      this.socket = null;
    });

  }

  /**
   * Connect To New Joined User
   */
  async connectToNewUser(data) {
    const call = this.peerJs.call(data.peerJsId, this.media);
    let index  = await this.createConnection(call);

    this.setConnectionName(index, (data.name || null));
    this.setConnectionCreatorStatus(index, data.roomCreator);

    call.on('stream', peerVideoStream => {
      console.log('Stream...' + index);

      let peerRef = document.querySelectorAll(this.options.peerRef);
      this.stream(peerRef[index], peerVideoStream);
    });
    call.on('close', () => {
      console.log('Close user...' + call.peer);
    });
    call.on('error', (error) => {
      console.log('error user... ' + error);
    });
  }

  /**
   * Grab User Media
   */
  async grabMedia() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(media => {
        this.media = media;
        resolve(this.media)
      }).catch(err => {
        reject(err);
      });
    });
  }

  /**
   * Release User Media
   */
  releaseMedia() {
    let videoRef = document.querySelector(this.options.videoRef);
    let srcObject = videoRef.srcObject;

    const stream = srcObject;
    const tracks = stream.getTracks();

    tracks.forEach((track) => {
      track.stop();
    });

    srcObject = null;
  }

  /**
   * Stream Connection Media
   */
  stream(video, media, mute = false) {
    video.muted = mute;
    video.srcObject = media;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
  }

  setConnectionName(index, name) {
    this.connections[index].name = name;
  }

  setConnectionCreatorStatus(index, status) {
    this.connections[index].isCreator = status;
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
