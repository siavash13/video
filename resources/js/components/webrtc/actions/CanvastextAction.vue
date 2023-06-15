<template>
  <div id="canvas-text-action" :style="{ 'display': ((dialog)? 'block' : 'none')}">
    <div class="admin-section" v-if="userSettings.isCreator">
      <div class="text-section">
        <textarea rows="5" v-model="text"></textarea>
        <span @click.prevent="sendMessage">{{ (!isPlay)? 'Play' : 'Stop' }}</span>
      </div>
      <div
        v-if="historyItems.length > 0"
        class="text-history"
      >
        <div
          v-for="(historyItem, index) in historyItems"
          :key="index"
          class="text-item"
        >
          <span
            class="text-item-text"
            @click="copyText(historyItem)"
          >{{ historyItem.substring(0, 20) + ' ...' }}</span>
          <span class="text-item-remove" @click="removeText(index)"></span>
        </div>
      </div>
    </div>
    <div class="canvas-text-action-back" @click="show(false)"></div>
  </div>
  <div id="canvas-text-action-card">
    <div id="canvas-text-action-counter">0</div>
    <canvas id="canvas-text-scroll-section" height="250" />
  </div>
</template>

<script>
export default {
  name: "CanvastextAction",
  props: ['room', 'webrtc', 'userSettings'],
  created() {
    this.getTextFromStorage();
  },
  data() {
    return {
      dialog: false,
      text: null,
      isPlay: false,
      historyItems: [
        'helooo how are you blablababl lblablba anjajhJA'
      ],
      action: {
        name: 'canvastext',
        moderator: true,
        users: [],
        attributes: {
          play: false,
          message: null,
        }
      }
    }
  },
  methods: {
    show(status = true) {
      this.dialog = status;

      if(!status) {
      }
    },
    run() {
      this.show();
    },
    copyText(text) {
      this.text = text;
    },
    getTextFromStorage() {
      let store = JSON.parse(localStorage.getItem('cnidus.videoconference.canvasaction'));
      this.historyItems = (!store)? [] : store.history;
    },
    storeTextInStorage() {
      localStorage.setItem('cnidus.videoconference.canvasaction', JSON.stringify({ history: this.historyItems }));
    },
    removeText(index) {
      this.historyItems.splice(index, 1);
      this.storeTextInStorage();
    },
    sendMessage() {
      this.isPlay = !this.isPlay;

      // store in storage
      if (this.isPlay) {
        let index = this.historyItems.findIndex(x => x === this.text);
        if (index < 0) {
          this.historyItems.push(this.text);
          this.storeTextInStorage();
        }
      }

      let action = Object.assign({}, this.action);
      action.attributes.play = this.isPlay;
      action.attributes.message = this.text;

      this.webrtc.runAction(this.room.id, action);
      this.show(false);
    },
  }
}
</script>

<style lang="scss">
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

    @media screen and (max-width:480px) {
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
</style>
