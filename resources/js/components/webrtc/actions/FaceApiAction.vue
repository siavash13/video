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
    this.webrtc.Media.setEvent('set-user-info', this.handleUserInfoStore, 'play');
  },
  mounted() {
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

      faceDetectReady: false,
      faceApi: {
        usersData: [],
        drawItems: ['hat', 'medal'],
        endTimes: [],
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
    startDraw() {
      let action = Object.assign({}, this.action);

      action.attributes.type = this.type;
      action.attributes.timeout = this.timeout;
      action.attributes.peerJsId = this.selectedUser;

      this.webrtc.runAction(this.room.id, action);
      this.show(false);
    },
    setActionEventListener() {
      window.addEventListener('onFaceApiAction-DetectAndDraw', this.userFaceApiListenerAction);
    },
    clearAllIntervals() {
      for (let i = 1; i < 99999; i++)
        window.clearInterval(i);

      // clear window event listener
      window.removeEventListener('onFaceApiAction-DetectAndDraw',this.userFaceApiListenerAction);
    },
    setImages() {
      this.images.faceTest = new Image;
      this.images.faceTest.src = FakeFace;
      this.images.faceTest.onload = () => {
        this.prepareFaceDetector();
      }

      this.images.hat = new Image;
      this.images.hat.src = "/images/pirate-hat.webp";
      this.images.medal = new Image;
      this.images.medal.src = "/images/medal.png";
    },
    async handleUserInfoStore(video) {
      try {
        await this.findFaceApiUserDataByPeerId(video.dataset.peerid)
      } catch (error) {
        const canvas = (video.classList.contains('video-content')) ?
          document.querySelector('.video-content-canvas') :
          document.querySelector('.peer-content-canvas-' + video.dataset.peerid);

        this.faceApi.usersData.push({
          peerJsId: video.dataset.peerid,
          active: false,
          video: video,
          canvas: canvas,
        });
      }
    },
    findFaceApiUserDataByPeerId(peerId) {
      return new Promise((resolve, reject) => {
        let index = this.faceApi.usersData.findIndex(x => x.peerJsId === peerId);
        (index > -1) ? resolve(this.faceApi.usersData[index]) : reject('cant find user');
      });
    },
    setFaceLastPosition(peerId, box) {
      let index = this.faceApi.usersData.findIndex(x => x.peerJsId === peerId);
      this.faceApi.usersData[index].faceLastPosition = box;
    },
    userFaceApiListenerAction(e) {
      let indexUserData = this.faceApi.usersData.findIndex(x => x.peerJsId === e.detail.peerJsId);
      let indexEndTimes = this.faceApi.endTimes.findIndex(x => x.peerJsId === e.detail.peerJsId);

      if (indexEndTimes < 0) {
        indexEndTimes = this.faceApi.endTimes.push({
          peerJsId: e.detail.peerJsId,
          count: 0,
          hat: null,
          medal: null,
        }) - 1;
      }

      this.faceApi.endTimes[indexEndTimes][e.detail.type] = new Date();
      this.faceApi.endTimes[indexEndTimes][e.detail.type].setTime(
        this.faceApi.endTimes[indexEndTimes][e.detail.type].getTime() + parseInt(e.detail.timeout) * 1000
      );

      let count = 0;
      this.faceApi.drawItems.forEach(type => {
        if (!!this.faceApi.endTimes[indexEndTimes][type])
          count += 1;
      });

      this.faceApi.endTimes[indexEndTimes]['count'] = count;

      if (!this.faceApi.usersData[indexUserData].active) {
        this.detectFaceFromVideo(e.detail.peerJsId);
      }
    },
    async detectFaceFromVideo(peerId) {
      let faceApiData;

      try {
        faceApiData = await this.findFaceApiUserDataByPeerId(peerId);

        faceApiData.active = true;

        const detections = await faceAPI.detectSingleFace(faceApiData.video,
          new faceAPI.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const dims = faceAPI.matchDimensions(faceApiData.canvas, faceApiData.video, true);
        const resizedResults = faceAPI.resizeResults(detections, dims);

        this.setFaceLastPosition(peerId, resizedResults.alignedRect.box);

        // faceAPI.draw.drawDetections(faceApiData.canvas, resizedResults);
        // faceAPI.draw.drawFaceLandmarks(canvas, resizedResults);
        this.draw(faceApiData);
      } catch (error) {
        // console.log(error);
      }

      // check timer
      if (!!faceApiData) {
        this.checkDrawTypesTimer(faceApiData);
      }
    },
    async draw(faceApiData) {
      let index = this.faceApi.endTimes.findIndex(x => x.peerJsId === faceApiData.peerJsId);
      let currentTime = Date.now();
      let ctx = faceApiData.canvas.getContext("2d");

      ctx.clearRect(0, 0, faceApiData.canvas.width, faceApiData.canvas.height);

      this.faceApi.drawItems.forEach((type) => {
        if (!this.faceApi.endTimes[index][type]) {
          return;
        }

        if (currentTime > this.faceApi.endTimes[index][type]) {
          this.faceApi.endTimes[index].count -= 1;
          this.faceApi.endTimes[index][type] = null;
          return;
        }

        let functionName = 'calculate' + type.charAt(0).toUpperCase() + type.slice(1) + 'Position';
        let attributes = this[functionName](faceApiData);

        ctx.drawImage(this.images[type],
          attributes.posX,
          attributes.posY,
          attributes.width,
          attributes.height);
      });
    },
    calculateHatPosition(data) {
      let width = data.faceLastPosition.width * 2.6;

      return {
        width: width,
        height: this.images.hat.naturalHeight / (this.images.hat.naturalWidth / width),
        posX: data.faceLastPosition.x - ((width - data.faceLastPosition.width) / 2),
        posY: data.faceLastPosition.y - ((width - data.faceLastPosition.width) / 1.22),
      };
    },
    calculateMedalPosition(data) {
      let width = data.faceLastPosition.width / 1.8;

      return {
        width: width,
        height: this.images.medal.naturalHeight / (this.images.medal.naturalWidth / width),
        posX: data.faceLastPosition.x + (data.faceLastPosition.x / 1.32),
        posY: data.faceLastPosition.y + data.faceLastPosition.height + (data.faceLastPosition.height / 10)
      };
    },
    checkDrawTypesTimer(faceApiData) {
      let index = this.faceApi.endTimes.findIndex(x => x.peerJsId === faceApiData.peerJsId);

      if (this.faceApi.endTimes[index].count > 0) {
        setTimeout(async () => {
          await this.detectFaceFromVideo(faceApiData.peerJsId);
        });
      } else {
        faceApiData.active = false;
        this.clearUserDrawCanvas(faceApiData.peerJsId);
      }
    },
    async clearUserDrawCanvas(peerId) {
      const faceApiData = await this.findFaceApiUserDataByPeerId(peerId);
      let ctx = faceApiData.canvas.getContext("2d");
      ctx.clearRect(0, 0, faceApiData.canvas.width, faceApiData.canvas.height);
    },
    async prepareFaceDetector() {
      await faceAPI.detectSingleFace(this.images.faceTest,
        new faceAPI.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .then(res => {
          this.faceDetectReady = true;
        });
    }
  },
  unmounted() {
    // clear canvas text render interval
    this.clearAllIntervals();
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
