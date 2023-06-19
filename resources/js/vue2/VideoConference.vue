<template>
  <div id="video-conference">
    <component
        v-if="themeReady && isReady"
        v-show="roomIsValid"
        :is="themeLayout"
        :connections="connections"
        :userSettings="userSettings"
        @onLeftRoom="leftTheRoom"
        @onRunAction="runAction"
    />

    <VideoConferenceActions
        ref="actions"
        v-if="themeReady && isReady"
        :room="room"
        :webrtc="$webrtc"
        :connections="connections"
        :userSettings="userSettings"
    />
  </div>
</template>

<script>
import VideoConferenceActions from "./VideoConferenceActions";
import webRTCsocket from "../../configs/webRTCsocket";

export default {
  name: "VideoConference",
  async created() {
    await this.setThemeLayout();
    window.addEventListener('onConnectToRoomSuccess', this.eventHandlerConnectToRoomSuccess);
  },
  props: ['name'],
  data() {
    return {
      room: null,
      token: null,
      loading: false,
      isReady: false,
      connectionFailed: false,
      connectionTimeout: 10,
      reconnectAttemptCount: 3,
      attemptCount: 0,
      roomIsValid: true,
      connections: [],
      userSettings: {
        isCreator: false,
      },
      theme: webRTCsocket.videoconference_theme,
      themeReady: false,
      themeLayout: null,
    }
  },
  methods: {
    connect() {
      return new Promise((resolve, reject) => {
        if (!this.$webrtc.socket.connected) {
          this.$webrtc.connection({
            token: this.token
          });

          this.$webrtc.socket.once("connect", () => {
            console.log('socket connected!');
            resolve(true);
          });
        }
      });
    },
    async initialize(room = null, token = null) {
      this.room = room;
      this.token = token;
      this.loading = true;
      this.isReady = false;
      this.roomIsValid = true;
      this.connections = [];

      if (!this.$webrtc.socket) {
        return;
      }

      if (!this.token) {
        console.log('Connection is not established with server.');
        return;
      }

      if (!this.room || !this.room.id) {
        console.log('Please set the room id for joining.');
        return;
      }

      this.connect().then(async () => {
        this.$webrtc.setup({
          options: {
            videoRef: '.video-content',
            peerRef: '.peer-content',
          },
          callback: {
            joinRoom: this.userJoinRoom,
            leftRoom: this.userLeftRoom,
            invalidRoom: this.invalidRoom,
            exitConference: this.exitConference,
            banInRoom: this.banInRoom,
          },
          connections: this.connections,
          userSettings: this.userSettings,
        });

        try {
          this.$webrtc.initialPeerJs().then(async (peerJsId) => {
            this.startEstablishingConnection();
          }).catch((error) => {
            this.$emit('onPeerJsConnectionFailed');
          });
        } catch (error) {
          console.log('webrtc initialize error:');
          console.log(error);
        }
      });
    },
    startEstablishingConnection() {
      this.connectionFailed = false;
      this.attemptCount = 0;
      this.establishingConnection();
    },
    establishingConnection() {
      if (this.isReady) {
        return;
      }

      this.$webrtc.Room.join(this.room.id, {
        name: this.name
      });

      this.attemptCount += 1;

      if (this.attemptCount <= this.reconnectAttemptCount) {
        setTimeout(this.establishingConnection, this.connectionTimeout * 1000);
      } else {
        this.connectionFailed = true;
      }
    },
    async leftTheRoom() {
      let data = {
        username: this.name,
      };

      this.$webrtc.leftRoom(this.room.id, data);
      this.exitConference();
    },
    exitConference() {
      this.$emit('onCloseConference');
    },
    userLeftRoom(data) {
      console.log(data.username + ' left room!');
    },
    userJoinRoom(data) {
      console.log('user join to room: ' + data.peerJsId);
    },
    invalidRoom() {
      this.roomIsValid = false;
	    this.$emit('onAuthorizeRoomInvalid');
    },
    async setThemeLayout() {
      let theme = null;
      let themeName = this.capitalizeFirstLetter(this.theme);

      try {
        theme = await this.loadThemeLayout(themeName);
      } catch(error) {
        theme = await this.loadThemeLayout('Default');
      }

      this.themeReady = true;
      this.themeLayout = theme.default;
    },
    async loadThemeLayout(themeName) {
      let layout = async () => import('./themes/' + themeName + 'VideoConference.vue');
      return await layout();
    },
    capitalizeFirstLetter(text) {
      let _text = text.toLowerCase();
      return _text.charAt(0).toUpperCase() + _text.slice(1);
    },
    runAction(action) {
      this.$refs.actions.runAction(action);
    },
    banInRoom(data) {
      alert('you are ban! :))))');
      this.exitConference();
    },
    eventHandlerConnectToRoomSuccess(data) {
      this.loading = false;
      this.isReady = true;
	  
	    this.$emit('onConnectionInitialed', data.detail);

      this.$nextTick(async () => {
	    await this.$webrtc.startStreamUserMedia();
		  this.$webrtc.Room.notifyJoinSuccess(this.room.id);
      });
    }
  },
  beforeUnmount() {
    this.leftTheRoom();
    window.removeEventListener('onRoomInformationReceived',
        this.eventHandlerConnectToRoomSuccess);
  },
  components: {
    VideoConferenceActions,
  }
}
</script>

<style lang="scss">
@import "../../assets/webrtc/scss/DefaultThemeStyle.scss";
</style>