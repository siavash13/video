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
    this.events = [];
    this.connections = [];
    this.initialized = false;
    this.media = null;
    this.peerJsId = null;
    this.refs = null;
    this.options = {};
    this.callback = {};

    this.options.micMute = false;
  }

  setup({ refs, videoRef, peerRef, connections, joinRoom, leftRoom, invalidRoom }) {
    this.refs  = refs;
    this.options.videoRef  = videoRef;
    this.options.peerRef   = peerRef;
    this.connections = connections;

    this.callback.joinRoom = joinRoom;
    this.callback.leftRoom = leftRoom;
    this.callback.invalidRoom = invalidRoom;
  }

  async initial(options) {
    this.socketObject = new Socket();
    this.socketObject.initial(options).then(() => {
      this.socketObject.initialized = true;
      this.socket = this.socketObject.socket;
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

    if (!status) {
      this.events = [];
    }

    if (status) {
      this.socket.on('user-connected', (peerUserId) => {
        this.connectToNewUser(peerUserId);

        if (!!this.callback.joinRoom) {
          this.callback.joinRoom(peerUserId);
        } else {
          console.log('user join room.');
        }
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
        this.stream(this.refs[this.options.peerRef][index], peerVideoStream);
      });
    });

    this.peerJsId = this.peerJsObject.getId();

    return this.peerJsId;
  }

  /**
   * Create peerJs users Connections
   */
  async createConnection(call) {
    let count = this.connections.push({
      id: call.peer,
      call: call,
      active: true,
    });

    return (count - 1);
  }

  /**
   * User Join Room
   */
  joinRoom(roomId) {
    this.socket.emit('join-room', roomId, this.peerJsId);
    this.stream(this.refs[this.options.videoRef], this.media, true);
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

    let data = Object.assign({ peerJsId: this.peerJsId, }, userData)

    this.socket.emit('left-room', roomId, data);
  }

  /**
   * Connect To New Joined User
   */
  async connectToNewUser(peerUserId) {
    const call = this.peerJs.call(peerUserId, this.media);
    let index  = await this.createConnection(call);

    call.on('stream', peerVideoStream => {
      console.log('Stream...' + index);
      this.stream(this.refs[this.options.peerRef][index], peerVideoStream);
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
    let srcObject = this.refs[this.options.videoRef].srcObject;

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
}

/**
 * initial webrtc
 */
let options = {};
options.port = socketConfig.webrtc_url;

const webrtc = new Webrtc();
webrtc.initial(options);

export default webrtc;
