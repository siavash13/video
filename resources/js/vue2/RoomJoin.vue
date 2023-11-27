<template>
  <div style="padding:10px;" v-if="!initializeVideo">
    <div id="room-join">
      <div v-if="!token">
        Wait for user authorization token...
      </div>
      <div v-else-if="!startConnecting" class="connection-settings">
        <div class="info">
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
        <div class="device-setting">
          <button
            class="btn-small"
            :class="{ disabled: camDisable }"
            @click="camDisable = !camDisable"
          >
            <svg
              v-if="!camDisable"
              xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-video" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-video-off" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518l.605.847zM1.428 4.18A.999.999 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634l.58.814zM15 11.73l-3.5-1.555v-4.35L15 4.269v7.462zm-4.407 3.56-10-14 .814-.58 10 14-.814.58z"/>
            </svg>
          </button>
          <button
            class="btn-small"
            :class="{ disabled: micDisable }"
            @click="micDisable = !micDisable"
          >
            <svg
              v-if="!micDisable"
              xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic" viewBox="0 0 16 16">
              <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
              <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic-mute" viewBox="0 0 16 16">
              <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879l-1-1V3a2 2 0 0 0-3.997-.118l-.845-.845A3.001 3.001 0 0 1 11 3z"/>
              <path d="m9.486 10.607-.748-.748A2 2 0 0 1 6 8v-.878l-1-1V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
            </svg>
          </button>
        </div>
        <div class="devices">
          <div>
            <label>Camera</label>
            <select v-model="cameraDevice">
              <option
                v-for="(camera, index) in cameras"
                :key="'camera_device_' + index"
                :value="camera.deviceId"
              >
                {{ camera.label}}
              </option>
            </select>
          </div>
          <div>
            <label>Microphone</label>
            <select v-model="microphoneDevice">
              <option
                v-for="(microphone, index) in microphones"
                :key="'microphone_device_' + index"
                :value="microphone.deviceId"
              >
                {{ microphone.label}}
              </option>
            </select>
          </div>
          <div v-if="1 === 2">
            <label>Speaker</label>
            <select v-model="speakerDevice">
              <option
                v-for="(speaker, index) in speakers"
                :key="'speaker_device_' + index"
                :value="speaker.deviceId"
              >
                {{ speaker.label}}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div v-else>
        <div v-if="roomIsValid">
          <div v-if="!connectionFailed">
            <p v-if="!waiting">Please wait for establishing a connection...</p>
            <p v-else>Please wait until host admit you to join room...</p>
          </div>
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
      :devices="{
        camera: cameraDevice,
        microphone: microphoneDevice,
        speaker: speakerDevice
      }"
      :camDisable="camDisable"
      :micDisable="micDisable"
	  :waiting="waiting"
      @onConnectionInitialed="connectionInitialed"
      @onAuthorizeRoomInvalid="authorizeRoomInvalid"
      @onPeerJsConnectionFailed="peerJsConnectionFailed"
      @onCloseConference="closeConference"
	  @onSetWaitingStatus="setWaitingStatus"
    />
  </div>
</template>

<script>
import VideoConference from "./VideoConference";
import webRTCHelper from "../../utils/WebRTC/webRTCHelper";

export default {
  name: "RoomJoin",
  mixins: [webRTCHelper],
  async created() {
    this.room.id = this.$route.params.roomId;
    this.devices = await this.$webrtc.getDevices();
  },
  mounted() {
    this.getUserAccessToken();
  },
  computed: {
    cameras() {
      return this.devices.filter(item => {
        return item.kind === 'videoinput';
      });
    },
    microphones() {
      return this.devices.filter(item => {
        return item.kind === 'audioinput';
      });
    },
    speakers() {
      return this.devices.filter(item => {
        return item.kind === 'audiooutput';
      });
    },
  },
  watch: {
    cameras(value) {
      if (Array.isArray(value) && value.length > 0) {
        this.cameraDevice = value[0].deviceId;
      }
    },
    microphones(value) {
      if (Array.isArray(value) && value.length > 0) {
        this.microphoneDevice = value[0].deviceId;
      }
    },
    speakers(value) {
      if (Array.isArray(value) && value.length > 0) {
        this.speakerDevice = value[0].deviceId;
      }
    }
  },
  data() {
    return {
      initializeVideo: false,
      token: null,
      name: null,
      devices: [],
      cameraDevice: null,
      microphoneDevice: null,
      speakerDevice: null,
      camDisable: false,
      micDisable: false,
      room: {
        id: null,
      },
      message: {
        status: false,
        text: '',
        color: 'green'
      },
      loading: false,
	  waiting: false,
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
	setWaitingStatus(status) {
      this.waiting = status;
    }
  },
  components: {
    VideoConference,
  }
}
</script>

<style lang="scss">
#room-join {
  width: fit-content;
  margin: 25px auto;
  border: 1px dashed #6096b4;

  @media screen and (max-width: 480px) {
    width: 100%;
  }

  .connection-settings {
    padding: 25px;
  }

  .info {
    padding: 25px;
  }

  .device-setting {
    padding: 10px;
    text-align: center;

    button {
      margin-right: 5px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .devices {
    div {
      padding: 0;
      margin-bottom: 5px;

      &:last-child {
        margin-bottom: 0;
      }
    }
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
