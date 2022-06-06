import PeerJS from 'peerjs';
import socketConfig from "../../configs/socket";


class VideoPeer
{
  constructor() {
    this.videoPeer = new PeerJS(undefined, {
      host: socketConfig.peer_host,
      port: socketConfig.peer_port,
    });
  }

  async open() {
    return new Promise((resolve, reject) => {
      this.videoPeer.on('open', (id) => {
        resolve(id);
        return;
      });
    });
  }
}

export default VideoPeer;
