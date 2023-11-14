<template>
  <div id="canvas-text" v-show="dialog || isPlay">
    <div id="canvas-text-action" class="action" :style="{ 'display': ((dialog)? 'block' : 'none')}">
      <div class="admin-section" v-if="userSettings.isCreator">
        <div class="text-section">
          <textarea rows="5" v-model="text"></textarea>
          <span
            v-if="isPlay"
            @click.prevent="pauseMessage"
            class="mx-2 c-pointer"
          >
            {{ (!isPause) ? 'Pause' : 'Resume' }}
          </span>
          <span class="mx-2 c-pointer" @click.prevent="marqueeMessage">{{ (!isPlay) ? 'Play' : 'Stop' }}</span>
        </div>
        <div
          v-if="files.length > 0"
          class="text-history"
        >
          <div
            v-for="(file, index) in files"
            :key="index"
            class="text-item"
          >
          <span
            class="text-item-text"
            @click="copyText(file.file)"
          >{{ file.file.split('/').pop() }}</span>
          </div>
        </div>
      </div>
      <div class="canvas-text-action-back" @click="show(false)"></div>
    </div>
    <div id="canvas-text-action-card">
      <div id="canvas-text-action-counter" v-if="userSettings.isCreator">
        <span
          v-if="isPlay"
          @click.prevent="pauseMessage"
          class="mx-2 c-pointer"
        >
            {{ (!isPause) ? 'Pause' : 'Resume' }}
          </span>
        <span class="mx-2 c-pointer" @click.prevent="marqueeMessage">{{ (!isPlay) ? 'Play' : 'Stop' }}</span>
      </div>
      <canvas id="canvas-text-scroll-section" height="250"/>
    </div>
  </div>
</template>

<script>
import Config from "../../../configs/webRTCsocket";
import webRTCHelper from "../../../utils/WebRTC/webRTCHelper";

export default {
  name: "CanvasTextAction",
  props: ['room', 'webrtc', 'userSettings'],
  mixins: [webRTCHelper],
  created() {
    this.getTextFromBucket();
  },
  computed: {
    disabled() {
      return (!this.text || this.text === '');
    }
  },
  data() {
    return {
      dialog: false,
      loading: false,
      text: null,
      isPlay: false,
      isPause: false,
      historyItems: [],
      files: [],
      action: {
        name: 'canvas-text',
        moderator: true,
        users: [],
        attributes: {
          play: false,
          pause: false,
          initial: false,
          message: null,
        }
      }
    }
  },
  methods: {
    show(status = true) {
      this.dialog = status;
    },
    run() {
      this.show();
    },
    copyText(url) {
      this.webrtcGetUserToken((token) => {
        let headers = {
          'user-token': token
        };

        axios.get(Config.webrtc_url + "/api/canvas-text-get?key=" + url, {
          headers: headers
        }).then(response => {
          this.text = response.data;
        });
      });
    },
    getTextFromBucket() {
      this.loading = true;

      this.webrtcGetUserToken((token) => {
        let headers = {
          'user-token': token
        };

        // this.room.id
        let roomId = '63413a3b5699a1f2c3549367';

        axios.get(Config.webrtc_url + "/api/canvas-text-list?roomId=" + roomId, {
          headers: headers
        }).then(response => {
          this.files = response.data.files.map(item => {
            return {
              file: item,
              loading: false,
            }
          });
        }).finally(() => {
          this.loading = false;
        });
      });
    },
    getTextFromStorage() {
      let store = JSON.parse(localStorage.getItem('cnidus.videoconference.canvasaction'));
      this.historyItems = (!store) ? [] : store.history;
    },
    storeTextInStorage() {
      localStorage.setItem('cnidus.videoconference.canvasaction', JSON.stringify({history: this.historyItems}));
    },
    removeText(index) {
      this.historyItems.splice(index, 1);
      this.storeTextInStorage();
    },
    getActionObject() {
      return JSON.parse(JSON.stringify(this.action));
    },
    pauseMessage() {
      if(!this.isPlay) {
        return false;
      }

      this.isPause = !this.isPause;

      let action = this.getActionObject();
      action.attributes.play = true;
      action.attributes.pause = this.isPause;

      this.webrtc.runAction(this.room.id, action);
      this.show(false);
    },
    marqueeMessage() {
      if(this.disabled && !this.isPlay) {
        return false;
      }

      this.isPlay = !this.isPlay;
      this.isPause = false;

      // store in storage
      if (this.isPlay) {
        let index = this.historyItems.findIndex(x => x === this.text);
        if (index < 0) {
          this.historyItems.push(this.text);
          this.storeTextInStorage();
        }
      }

      let action = this.getActionObject();
      action.attributes.play = this.isPlay;
      action.attributes.message = this.text;

      if(this.isPlay) {
        action.attributes.initial = true;
      }

      this.webrtc.runAction(this.room.id, action);
      this.show(false);
    },
  }
}
</script>

<style lang="scss">
#canvas-text {
  position: relative!important;

  #canvas-text-action {

    .admin-section {
      position: fixed;
      display: flex;
      z-index: 2;
      top: 50%;
      left: 50%;
      width: 600px;
      padding: 10px;
      background: #fff;
      border: 1px solid #ccc;
      transform: translate(-50%, -50%);

      @media screen and (max-width: 480px) {
        width: 90%;
      }

      .text-history {
        width: 350px;
        padding: 0px 10px;

        .text-item {
          display: flex;
          background: #cbd5e0;
          border: 1px solid #718096;
          border-radius: 5px;
          padding: 5px 15px;
          cursor: pointer;
          user-select: none;

          .text-item-text {
            width: 100%;
          }

          .text-item-remove {
            float: right;

            &:before {
              display: inline-block;
              content: '\00d7';
            }
          }
        }
      }

      .text-section {
        width: 100%;

        textarea {
          width: 100%;
        }
      }


    }

    .canvas-text-action-back {
      position: fixed;
      z-index: 1;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #000;
      opacity: 0.6;
    }
  }

  #canvas-text-action-card {
    position: relative;
    padding: 0 15px;
    border: 1px solid #333;
    border-radius: 15px;
    overflow: hidden;

    #canvas-text-action-counter {
      position: absolute;
      top: 0;
      left: 0;
      background: #ffdd00;
      padding: 5px;
      color: #333;
    }

    canvas {
      display: none;
    }
  }
}
</style>
