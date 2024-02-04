import PeerJS from 'peerjs';
import configs from "../../configs/webrtc";


class VideoPeer
{
  constructor(Events) {
    return new Promise((resolve, reject) => {
      console.log()
      this.videoPeer = new PeerJS(undefined, {
        host: configs.peer_host,
        port: configs.peer_port,
        secure: /^true$/i.test(configs.peer_secure),
        referrerPolicy: '',
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
