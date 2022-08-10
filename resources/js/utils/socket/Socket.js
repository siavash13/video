import socketio from 'socket.io-client';
import peerjs from '../peerjs/PeerJs';

class SocketIO
{
  constructor() {
    this.socket = null;
    this.peerJS = null;
    this.events = [];
    this.initialized = false;
  }

  async initial(options) {
    this.socket = socketio(options.port, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket'],
    });
  }

  connectPeerJs() {
    this.peerJS = new peerjs();
  }

  listen(event_name, callback) {
    if (this.initialized) {
      this.events.push(event_name);
      this.socket.on(event_name, callback);
    } else {
      callback('Socket Not Initialized yet');
    }
  }

  getEventsList() {
    return this.events;
  }

  connection(data, status = true) {
    this.socket.io.opts.query = {
      "user-id": data.id || null,
      "user-token": data.token
    };

    if (!status) {
      this.events = [];
    }

    return status ? this.socket.open() : this.socket.close;
  }

  restoredCheck = {
    timeout: (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    restored: async () => {
      if (this.initialized) {
        return true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await this.restoredCheck.restored()
      }
    }
  }

  async restored() {
    return await this.restoredCheck.restored();
  }

  joinRoom(roomId, userId) {
    this.socket.emit('join-room', roomId, userId );
  }

  onJoinRoom(userId) {

  }
}

export default SocketIO;

