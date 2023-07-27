import PeerJS from 'peerjs';
import socketConfig from "../../configs/webRTCsocket";


class VideoPeer
{
  constructor(Events) {
    return new Promise((resolve, reject) => {
      this.videoPeer = new PeerJS(undefined, {
        host: socketConfig.peer_host,
        port: socketConfig.peer_port,
      }).on('open', (id) => {
        this.peerJsId = id;
        resolve(this);
      }).on('connection', (connection) => {
        connection.on('data', function(data) {
          data.peerJsId = connection.peer;
          Events.handler('peerJsData', data.event || 'unknown', data);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  getId() {
    return this.peerJsId;
  }
}

export default VideoPeer;
