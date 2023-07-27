<template>
  <div>
    <slot name="actions"></slot>
    <div id="video-meeting">
      <div
        id="video-conference-users"
        :class="{ 'two-user-joined': (connections.length <= 1), 'multi-user-joined': (connections.length > 1)}"
      >
        <div
          :class="{ 'room-creator': userSettings.isCreator , 'room-user': !userSettings.isCreator }"
        >
          <div class="room-item">
            <div v-if="userSettings.micDisable" class="microphone-mute">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic-mute" viewBox="0 0 16 16">
                <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879l-1-1V3a2 2 0 0 0-3.997-.118l-.845-.845A3.001 3.001 0 0 1 11 3z"/>
                <path d="m9.486 10.607-.748-.748A2 2 0 0 1 6 8v-.878l-1-1V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
              </svg>
            </div>
            <div class="user-video">
              <div v-if="userSettings.camDisable" class="camera-mute">
                <p>Camera off</p>
              </div>
              <video
                id="video-item"
                class="video-content video-item"
                :data-peerId="userSettings.peerJsId"
              ></video>
              <canvas class="video-content-canvas"></canvas>
            </div>
          </div>
        </div>

        <div
          v-for="(connection, index) in connections"
          :key="'connection_' + index"
          :class="{ 'room-creator': connection.isCreator , 'room-user': !connection.isCreator }"
        >
          <div class="room-item">
            <div class="user-name">
              <span>{{ connection.name }}</span>
            </div>
            <div v-if="connection.micMute" class="microphone-mute">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic-mute" viewBox="0 0 16 16">
                <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879l-1-1V3a2 2 0 0 0-3.997-.118l-.845-.845A3.001 3.001 0 0 1 11 3z"/>
                <path d="m9.486 10.607-.748-.748A2 2 0 0 1 6 8v-.878l-1-1V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
              </svg>
            </div>
            <div class="user-video">
              <div v-if="connection.camMute" class="camera-mute">
                <p>Camera off</p>
              </div>
              <video
                v-show="connection.active"
                :id="'remote-video-' + connection.id"
                class="peer-content video-item"
                :class="'peer-content-' + connection.id"
                :data-peerid="connection.id"
              ></video>
              <audio autoplay
                :id="'remote-audio-' + connection.id"
                :data-peerid="connection.id"
              ></audio>
              <canvas
                class="video-peer-content-canvas"
                :class="'peer-content-canvas-' + connection.id"
              ></canvas>
            </div>
          </div>
        </div>
      </div>
      <CommandsDeckModule
        :user-settings="userSettings"
        :commands="commands"
      />
    </div>
    <slot name="modules"></slot>
  </div>
</template>

<script>
import {inject} from "vue";
import CommandsDeckModule from "../modules/CommandsDeckModule";

export default {
  setup() {
    const webrtc = inject('webrtc');

    return {
      webrtc,
    }
  },
  name: "CanvasfaceVideoConference",
  props: ['commands', 'connections', 'userSettings'],
  data() {
    return {

    }
  },
  methods: {
    clearAllIntervals() {
      for (let i = 1; i < 99999; i++)
        window.clearInterval(i);
    },
  },
  components: {
    CommandsDeckModule,
  },
  unmounted() {
    // clear canvas text render interval
    this.clearAllIntervals();
  }
}
</script>

<style lang="scss">
#video-meeting {

}
#video-conference-users {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 60px;

  @media (min-width: 960px) {
    width: 60%;
    margin: auto auto 60px auto;
  }

  &.two-user-joined {
    flex-wrap: nowrap;

    .room-creator {
      width: 50%;
      order: 1;
    }

    .room-user {
      width: 50%;
      order: 2;
    }

    @media (max-width: 768px) {
      .room-creator,
      .room-user {
        width: 50%;
      }
    }
  }

  &.multi-user-joined {
    .room-creator {
      width: 100%;
      order: 1;
      padding: 10px;

      .room-item {
        width: 500px;
      }
    }

    .room-user {
      display: inline-block;
      width: 150px;
      order: 2;
      padding: 10px;

      .room-item {
        height: 150px;
      }
    }
  }

  .room-item {
    position: relative;
    padding: 15px;

    .user-name {
      position: absolute;
      z-index: 3;
      left: 15px;
      bottom: 15px;
      display: inline-block;
      color: #fff;
      padding: 5px 10px;
      overflow: hidden;
      border-top-right-radius: 8px;
      border-bottom-left-radius: 8px;

      span {
        position: relative;
        z-index: 1;
      }

      &:after {
        content: ' ';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        opacity: 0.6;
        background: #000;
      }
    }

    .user-video {
      position: relative;
      width: 100%;
      padding-bottom: 100%;

      video {
        position: absolute;
        z-index: 1;
        width: 100%;
        height: 100%;
        border-radius: 8px;
        object-fit: cover;
      }

      canvas {
        z-index: 2;
        width: 100%;
        height: 100%;
      }
    }
  }

  canvas {
    position: absolute;
  }
}

</style>
