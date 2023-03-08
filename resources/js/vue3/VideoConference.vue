<template>
  <div id="video-conference">
    <div v-show="!roomIsValid" style="color:red;">
      The desired room was not found! Please try to connect to an available room.
      <a href="#" @click.prevent="leftTheRoom()">Back</a>
    </div>

    <component
        v-if="themeReady"
        v-show="roomIsValid"
        :is="themeLayout"
        :connections="connections"
        :userSettings="userSettings"
        @onLeftRoom="leftTheRoom"
        @onRunAction="runAction"
    />

    <VideoConferenceActions
        ref="actions"
        :room="room"
        :webrtc="webrtc"
        :connections="connections"
        :userSettings="userSettings"
    />

  </div>
</template>

<script>
import { inject, shallowRef } from "vue";
import VideoConferenceActions from "./VideoConferenceActions";
import webRTCsocket from "../../configs/webRTCsocket";

export default {
  name: "VideoConference",
  setup() {
    const webrtc = inject('webrtc');

    return {
      webrtc,
    }
  },
  async created() {
    await this.setThemeLayout();
  },
  props: ['name'],
  data() {
    return {
      room: null,
      token: null,
      roomIsValid: true,
      connections: [],
      userSettings: {
        isCreator: false,
      },
      theme: webRTCsocket.videoconference_theme,
      themeReady: false,
      themeLayout: shallowRef(null),
    }
  },
  methods: {
    connect() {
      return new Promise((resolve, reject) => {
        if (!this.webrtc.socket.connected) {
          this.webrtc.connection({
            token: this.token
          });

          this.webrtc.socket.once("connect", () => {
            console.log('socket connected!');
            resolve(true);
          });
        }
      });
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

      this.connect().then(async () => {
        this.webrtc.setup({
          options: {
            videoRef: '.video-content',
            peerRef:  '.peer-content',
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
          await this.webrtc.initialPeerJs();
          this.webrtc.Room.join(this.room.id,{
            name: this.name
          });
        } catch (error) {
          console.log('webrtc initialize error:');
          console.log(error);
        }
      });
    },
    async leftTheRoom() {
      let data = {
        username: this.name,
      };

      this.webrtc.Room.left(this.room.id, data);
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
    }
  },
  beforeUnmount() {
    this.leftTheRoom();
  },
  components: {
    VideoConferenceActions,
  }
}
</script>
