<template>
  <div id="video-conference">
    <div v-show="!roomIsValid" style="color:red;">
      The desired room was not found! Please try to connect to an available room.
      <a href="#" @click.prevent="leftTheRoom()">Back</a>
    </div>
    <div class="box" v-show="roomIsValid">
      <div>
        <a href="#" @click.prevent="leftTheRoom">Left Room</a>
      </div>
      <video id="video-content" class="video-item" ref="video"></video>
    </div>
    <div
      class="box"
      v-show="roomIsValid"
      v-for="(connection, index) in connections"
      :key="'connection_' + index"
    >
      <video v-show="connection.active" id="peer-content" class="video-item" ref="peer"></video>
    </div>
  </div>
</template>

<script>
import { inject } from "vue";

export default {
  name: "VideoConference",
  setup() {
    const webrtc = inject('webrtc');

    return {
      webrtc,
    }
  },
  data() {
    return {
      room: null,
      token: null,
      roomIsValid: true,
      connections: [],
    }
  },
  methods: {
    async connect() {
      if (!this.webrtc.socket.connected) {
        this.webrtc.connection({
          token: this.token
        });

        this.webrtc.socket.on("connect", () => {
          console.log('socket connected!');
        });
      }
    },
    async initialize(room = null, token = null) {
      this.room = room;
      this.token = token;
      this.roomIsValid = true;
      this.connections = [];

      if (!this.webrtc.socket) {
        return;
      }

      if(!this.token) {
        console.log('Connection is not established with server.');
        return;
      }

      if(!this.room || !this.room.id) {
        console.log('Please set the room id for joining.');
        return;
      }

      await this.connect();

      this.webrtc.setup({
        refs: this.$refs,
        videoRef: 'video',
        peerRef:  'peer',
        connections: this.connections,
        joinRoom: this.userJoinRoom,
        leftRoom: this.userLeftRoom,
        invalidRoom: this.invalidRoom,
      });

      try {
        await this.webrtc.initialPeerJs();
        this.webrtc.joinRoom(this.room.id);
      } catch (error) {
        console.log('webrtc initialize error:');
        console.log(error);
      }
    },
    async leftTheRoom() {
      let data = {
        username: 'user-name',
      };

      this.webrtc.leftRoom(this.room.id, data);
      this.exitConference();
    },
    exitConference() {
      this.$emit('onCloseConference');
    },
    userLeftRoom(data) {
      console.log(data.username + ' left room!');
    },
    userJoinRoom(peerUserId) {
      console.log('user join to room: ' + peerUserId);
    },
    invalidRoom() {
      this.roomIsValid = false;
    },
  },
  beforeUnmount() {
    this.leftTheRoom();
  }
}
</script>

<style lang="scss">
#video-conference {
  .box {
    display: inline-block;
    width: 100%;
    max-width: 480px;
    padding: 15px;

    @media (max-width: 480px) {
      max-width: 100%;
    }

    video {
      width: 100%;
      border-radius: 8px;
    }
  }
}
</style>
