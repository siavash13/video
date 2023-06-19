<template>
  <div style="padding:10px;" v-if="!initializeVideo">
    <div id="room-join">
      <div v-if="!token">
        Wait for user authorization token...
      </div>
      <div v-else-if="!startConnecting">
        <label>Name:</label>
        <input
          type="text"
          v-model="name"
        />
        <button
          :disabled="!name"
          class="btn-join mx-2"
          @click="joinToRoom"
        >
          Join Room
        </button>
      </div>
      <div v-else>
        <div v-if="roomIsValid">
          <p v-if="!connectionFailed">Please wait for establishing a connection...</p>
          <div v-else class="error">
            <div v-if="peerJsFailed" >
              Sorry! apparently server doesn't respond, please contact with administration.
              <a href="#" @click.prevent="closeConference">Back</a>
            </div>
            <div v-else>
              Sorry! apparently server doesn't respond, please try again.<br />
              <a href="#" @click.prevent="startEstablishingConnection">Try Again</a>
            </div>
          </div>
        </div>
        <div v-else class="error">
          The desired room was not found! Please try to connect to an available room.
          <a href="#" @click.prevent="closeConference">Back</a>
        </div>
      </div>
    </div>
  </div>
  <div
    style="padding:10px;"
    v-show="initializeVideo"
  >
    <VideoConference
      ref="conference"
      :name="name"
      @onConnectionInitialed="connectionInitialed"
      @onAuthorizeRoomInvalid="authorizeRoomInvalid"
      @onPeerJsConnectionFailed="peerJsConnectionFailed"
      @onCloseConference="closeConference"
    />
  </div>
</template>

<script>
import VideoConference from "./VideoConference";
import webRTCHelper from "../../utils/WebRTC/webRTCHelper";

export default {
  name: "RoomJoin",
  mixins: [webRTCHelper],
  created() {
    this.room.id = this.$route.params.roomId;
  },
  mounted() {
    this.getUserAccessToken();
  },
  data() {
    return {
      initializeVideo: false,
      token: null,
      name: null,
      room: {
        id: null,
      },
      message: {
        status: false,
        text: '',
        color: 'green'
      },
      loading: false,
      startConnecting: false,
      roomIsValid: true,
      peerJsFailed: false,
      connectionFailed: false,
    }
  },
  methods: {
    getUserAccessToken() {
      this.webrtcGetUserToken((token) => {
        this.token = token;
      });
    },
    joinToRoom() {
      this.startConnecting = true;
      this.$refs.conference.initialize(this.room, this.token);
    },
    connectionInitialed() {
      this.connectionFailed = false;
      this.initializeVideo = true;
    },
    authorizeRoomInvalid() {
      this.roomIsValid = false;
    },
    peerJsConnectionFailed() {
      this.connectionFailed = true;
      this.peerJsFailed = true;
    },
    closeConference() {
      this.$router.push({ name: 'webrtcRooms'});
    },
    startEstablishingConnection() {
      this.$refs.conference.startEstablishingConnection();
    },
  },
  components: {
    VideoConference,
  }
}
</script>

<style lang="scss">
#room-join {
  width: 50%;
  margin: 25px auto;
  border: 1px dashed #6096b4;

  @media screen and (max-width: 480px) {
    width: 100%;
  }

  div {
    padding: 25px;
  }

  label {
    @media screen and (max-width: 480px) {
      width: 80px;
    }
  }

  .btn-join {
    margin: 0 0 0 25px;

    @media screen and (max-width: 480px) {
      position: relative;
      left: 50%;
      margin: 25px auto;
      transform: translateX(-50%);
    }
  }
}
</style>
