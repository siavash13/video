import PeerJS from 'peerjs';
import socketConfig from "../../configs/webRTCsocket";


class VideoPeer
{
  constructor() {
    this.videoPeer = new PeerJS(undefined, {
      host: socketConfig.peer_host,
      port: socketConfig.peer_port,
    }).on('open', (id) => {
      this.peerJsId = id;
    });
  }

  getId() {
    return this.peerJsId;
  }
}

export default VideoPeer;
