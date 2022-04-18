<template>
  <div>
    <div @click="connect">Click</div>
    <video id="video-content" ref="video"></video>
    <video id="peer-content" ref="peer"></video>
  </div>
</template>

<script>
import PeerJS from "peerjs";
import {inject} from "vue";
import socketConfig from "../../configs/socket";

export default {
  name: "VideoConference",
  setup() {
    const webrtc = inject('webrtc');

    return {
      webrtc
    }
  },
  created() {
    this.initialize();
  },
  data() {
    return {
      myPeer: Object,
      peerConfig: {
        room: "room3",
      }
    }
  },
  methods: {
    connect() {


      if (!this.webrtc.socket.connected) {
        this.webrtc.connection({
          id: socketConfig.webrtc_app_id,
          token: socketConfig.webrtc_app_secret
        });


        this.webrtc.socket.on("connect", () => {
          console.log('connected!');
        });
      }


    },
    async initialize() {
      if (!this.webrtc.socket) {
        return;
      }


      this.myPeer = new PeerJS(undefined, {
        host: socketConfig.host,
        port: socketConfig.port,
      });

      try {
        const thisUserId = await this.peerOpen();

        this.myPeer.on('call', call => {
          call.answer(stream);

          call.on('stream', peerVideoStream => {
            console.log('Ever this event happend')
            this.addVideoStream(this.$refs.peer, peerVideoStream);
          });
        });

        const stream = await this.browserMedia();

        this.webrtc.socket.on('user-connected', peerUserId => {
          console.log('peerUserId is', peerUserId);
          this.connectToNewUser(peerUserId, stream);
        });

        this.webrtc.joinRoom(this.peerConfig.room, thisUserId);

        this.addVideoStream(this.$refs.video, stream);

      } catch (error) {
        console.log('webrtc initialize error:');
        console.log(error);
      }
    },
    async browserMedia() {
      return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        }).then(stream => {
          resolve(stream)
        }).catch(err => {
          reject(err);
        });
      });
    },
    async userConnected() {
      return new Promise((resolve, reject) => {
        this.webrtc.socket.on('user-connected', userId => {
          if (!userId) {
            resolve(userId);
            return;
          }
          reject('User Id is null');
          return;
        });
      });
    },
    async peerOpen() {
      return new Promise((resolve, reject) => {
        this.myPeer.on('open', (id) => {
          resolve(id);
          return;
        });
      });
    },
    connectToNewUser(peerUserId, stream) {
      const call = this.myPeer.call(peerUserId, stream);
      call.on('stream', peerVideoStream => {
        this.addVideoStream(this.$refs.peer, peerVideoStream);
      });
      call.on('close', () => {
        this.$refs.video.remove();
      });
    },
    addVideoStream(video, stream) {
      video.muted = true;
      video.srcObject = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
    },
  }
}
</script>
