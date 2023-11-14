<template>
  <div id="faceapi-text-action" :style="{ 'display': ((dialog)? 'block' : 'none')}">
    <div class="admin-section" v-if="userSettings.isCreator">
      <div class="text-section">
        <div class="settings mx-15">
          <div>
            <label>User:</label>
            <select
              v-model="selectedUser"
            >
              <option
                v-for="(user, index) in users"
                :key="'user-' + index"
                :value="user.peerJsId"
              >{{ user.name }}</option>
            </select>
          </div>
          <div>
            <label>Timeout:</label>
            <input type="text" v-model="timeout" placeholder="Enter timeout" />
            <span> (seconds) </span>
          </div>
        </div>
        <div class="type-options mx-15">
          <div>
            <label for="type-hat">Pirate Hat</label>
            <input id="type-hat" name="type" type="radio" value="hat" v-model="type" />
          </div>
          <div>
            <label for="type-medal">Medal</label>
            <input id="type-medal" name="type" type="radio" value="medal" v-model="type"  />
          </div>
        </div>
        <div class="mx-15">
          <button @click="startDraw" :disabled="!selectedUser || !timeout">Start Draw</button>
        </div>
      </div>
    </div>
    <div class="faceapi-action-back" @click="show(false)"></div>
  </div>
</template>

<script>
import FakeFace from "../../../assets/webrtc/images/face-profile.jpg";

export default {
  name: "FaceApiAction",
  props: ['room', 'webrtc', 'userSettings'],
  created() {
    this.setImages();

  //  this.webrtc.Media.setEvent('set-user-info', this.handleUserInfoStore, 'play');
  },
  mounted() {
    this.initialCallbacks();
    this.setActionEventListener();
  },
  computed: {
    users() {
      let users = [{
        name: 'Creator',
        peerJsId: this.userSettings.peerJsId
      }];

      this.webrtc.People.getConnections().forEach((item) => {
        users.push({
          name: item.name,
          peerJsId: item.peerJsId
        });
      });

      return users;
    }
  },
  data() {
    return {
      dialog: false,
      type: 'hat',
      timeout: 30,
      selectedUser: null,
      event: null,
      action: {
        name: 'face-api',
        moderator: true,
        users: [],
        attributes: {
          type: 'hat',
          timeout: '5',
          peerJsId: null,
        }
      },
      faceApi: {
        drawItems: ['hat', 'medal'],
        endTime: {
          hat: null,
          medal: null,
        },
        callbacks: {
          hat: null,
          medal: null,
        }
      },
      images: {
        medal: null,
        hat: null,
        faceTest: null,
      },
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
    initialCallbacks() {
      this.faceApi.callbacks.hat = this.webrtc.Media.registerFaceDetectorCallback('hat', this.draw);
      this.faceApi.callbacks.medal = this.webrtc.Media.registerFaceDetectorCallback('medal', this.draw);
    },
    startDraw() {
      let action = Object.assign({}, this.action);

      action.attributes.type = this.type;
      action.attributes.timeout = this.timeout;
      action.users.push({
        peerJsId: this.selectedUser
      });

      this.webrtc.runAction(this.room.id, action);
      this.show(false);
    },
    setActionEventListener() {
      window.addEventListener('onFaceApiAction-DetectAndDraw', this.userFaceApiListenerAction);
    },
    clearlistener() {
      window.removeEventListener('onFaceApiAction-DetectAndDraw',this.userFaceApiListenerAction);
    },
    setImages() {
      this.images.faceTest = new Image;
      this.images.faceTest.src = FakeFace;
      this.images.faceTest.onload = () => {

      }

      this.images.hat = new Image;
      this.images.hat.src = "/images/pirate-hat.webp";
      this.images.medal = new Image;
      this.images.medal.src = "/images/medal.png";
    },
    userFaceApiListenerAction(e) {
      this.faceApi.endTime[e.detail.type] = new Date();
      this.faceApi.endTime[e.detail.type].setTime(
        this.faceApi.endTime[e.detail.type].getTime() + parseInt(e.detail.timeout) * 1000
      );

      this.faceApi.callbacks[e.detail.type].enable = true;
    },
    async checkCallbackTimeOut(type) {
      let currentTime = Date.now();

      if (!this.faceApi.callbacks[type].enable) {
        return false;
      }

      if (currentTime > this.faceApi.endTime[type]) {
        this.faceApi.endTime[type] = null;
        this.faceApi.callbacks[type].enable = false;
        return false;
      }

      return true;
    },
    draw(lastPosition, canvas, type) {
      if (!this.checkCallbackTimeOut(type)) return;

      const ctx = canvas.getContext("2d");
      const methodName = 'calculate' + type.charAt(0).toUpperCase() + type.slice(1) + 'Position';
      const typePosition = this[methodName](lastPosition);

      ctx.drawImage(this.images[type],
        typePosition.posX,
        typePosition.posY,
        typePosition.width,
        typePosition.height);
    },
    calculateHatPosition(data) {
      let width = data.width * 2.6;

      return {
        width: width,
        height: this.images.hat.naturalHeight / (this.images.hat.naturalWidth / width),
        posX: data.xMin - ((width - data.width) / 2),
        posY: data.yMin - ((width - data.width) / 1.22),
      };
    },
    calculateMedalPosition(data) {
      let width = data.width / 1.8;

      return {
        width: width,
        height: this.images.medal.naturalHeight / (this.images.medal.naturalWidth / width),
        posX: data.xMin + (data.xMin / 1.32),
        posY: data.yMin + data.height + (data.height / 10)
      };
    },
  },
  unmounted() {
    this.clearlistener();
  }
}
</script>

<style lang="scss">
#faceapi-text-action {
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

    .mx-15 {
      margin: 15px 0;
    }

    .text-section {
      width: 100%;

      .settings {
        display: flex;
        justify-content: space-between;

        @media screen and (max-width:480px) {
          flex-direction: column;
        }

        div {
          label {
            margin-right: 5px;
          }

          select {
            min-width: 150px;
          }

          @media screen and (max-width:480px) {
            margin: 15px;
          }
        }
      }

      .type-options {
        width: 100%;

        div {
          display: inline-block;
          margin-right: 15px;

          label {
            margin-right: 5px;
          }

          &:last-child {
            margin-right: unset;
          }
        }
      }
    }
  }

  .faceapi-action-back {
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
</style>
