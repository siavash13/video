<template>
  <div>
    <div class="d-flex my-2">
      <a href="#" class="btn btn-danger" @click.prevent="leftTheRoom">Left Room</a>
    </div>
    <div class="d-flex my-2 room-actions">
      <a
        v-if="userSettings.isCreator"
        class="action-item btn btn-small btn-danger mx-2"
        @click.prevent="runAction('terminate')"
      >
        Terminate
      </a>
      <a
        v-if="userSettings.isCreator"
        class="action-item btn btn-small btn-info mx-2"
        @click.prevent="runAction('canvastext')"
      >
        Canvas Teleprompter
      </a>
      <a
        v-if="userSettings.isCreator"
        class="action-item btn btn-small btn-info mx-2"
        @click.prevent="runAction('faceapi')"
      >
        Face Detect
      </a>
      <a
        class="action-item btn btn-small btn-info mx-2"
        @click.prevent="runAction('info')"
      >
        Info Log
      </a>
    </div>
    <div
      id="video-conference-users"
      :class="{ 'two-user-joined': (connections.length <= 1), 'multi-user-joined': (connections.length > 1)}"
    >
      <div
        :class="{ 'room-creator': userSettings.isCreator , 'room-user': !userSettings.isCreator }"
      >
        <div class="room-item">
          <div class="user-actions"></div>
          <div class="user-video">
            <video class="video-content video-item" :data-peerId="userSettings.peerJsId"></video>
            <canvas class="video-content-canvas"></canvas>
            <canvas class="video-content-canvas-draw"></canvas>
          </div>
        </div>
      </div>

      <div
        v-for="(connection, index) in connections"
        :key="'connection_' + index"
        :class="{ 'room-creator': connection.isCreator , 'room-user': !connection.isCreator }"
      >
        <div class="room-item">
          <div class="user-name" v-text="connection.name"></div>
          <div class="user-actions">
            <a
              v-if="userSettings.isCreator"
              class="ban-user btn btn-small btn-danger mx-2"
              @click.prevent="runAction('ban', {
                peerJsId: connection.peerJsId
              })"
            >
              Ban
            </a>
            <a
              class="alert-user btn btn-small btn-info mx-2"
              @click.prevent="runAction('alert', {
                peerJsId: connection.peerJsId
              })"
            >
              Alert
            </a>
            <a
              v-if="userSettings.isCreator"
              class="btn btn-small btn-danger mx-2"
              @click.prevent="runAction('multi', {
                peerJsId: connection.peerJsId
              })"
            >
              Ban in 5 sec
            </a>
          </div>
          <div class="user-video">
            <video
              v-show="connection.active"
              class="peer-content video-item"
              :class="'peer-content-' + connection.id"
              :data-peerid="connection.id"
            ></video>
            <canvas
              class="video-peer-content-canvas"
              :class="'peer-content-canvas-' + connection.id"
            ></canvas>
            <canvas
              class="video-peer-content-canvas-draw"
              :class="'peer-content-canvas-draw-' + connection.id"
            ></canvas>
          </div>
        </div>
      </div>
    </div>
    <span id="faceapi-action-event"></span>
  </div>
</template>

<script>
import {inject} from "vue";
import FakeFace from "../../../assets/webrtc/images/face-profile.jpg"

export default {
  setup() {
    const webrtc = inject('webrtc');

    return {
      webrtc,
    }
  },
  name: "CanvasfaceVideoConference",
  props: ['connections', 'userSettings'],
  created() {
    this.setImages();
    this.webrtc.Media.setEvent('set-user-info', this.handleUserInfoStore, 'play');
  },
  mounted() {
    this.setActionEventListener();
  },
  data() {
    return {
      faceDetectReady: false,
      faceApi: {
        usersData: [],
        drawItems: ['hat', 'medal'],
        endTimes: [],
      },
      event: null,
      images: {
        medal: null,
        hat: null,
        faceTest: null,
      },
    }
  },
  methods: {
    leftTheRoom() {
      this.$emit('onLeftRoom');
    },
    runAction(name, data = {}) {
      this.$emit('onRunAction', {
        name: name,
        data: data
      });
    },
    clearAllIntervals() {
      for (let i = 1; i < 99999; i++)
        window.clearInterval(i);

      // clear window event listener
      window.removeEventListener('onFaceApiAction-DetectAndDraw',
        this.userFaceApiListenerAction);
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

        const canvasDraw = (video.classList.contains('video-content')) ?
          document.querySelector('.video-content-canvas-draw') :
          document.querySelector('.peer-content-canvas-draw-' + video.dataset.peerid);

        this.faceApi.usersData.push({
          peerJsId: video.dataset.peerid,
          active: false,
          video: video,
          canvas: canvas,
          canvasDraw: canvasDraw,
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
    setActionEventListener() {
      window.addEventListener('onFaceApiAction-DetectAndDraw',
        this.userFaceApiListenerAction);
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

        faceApiData.canvasDraw.width = faceApiData.canvas.width;
        faceApiData.canvasDraw.height = faceApiData.canvas.height;

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
      let ctx = faceApiData.canvasDraw.getContext("2d");

      ctx.clearRect(0, 0, faceApiData.canvasDraw.width, faceApiData.canvasDraw.height);

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
      let ctx1 = faceApiData.canvas.getContext("2d");
      let ctx2 = faceApiData.canvasDraw.getContext("2d");
      ctx1.clearRect(0, 0, faceApiData.canvas.width, faceApiData.canvas.height);
      ctx2.clearRect(0, 0, faceApiData.canvasDraw.width, faceApiData.canvasDraw.height);
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
#video-conference-users {
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  @media (min-width: 960px) {
    width: 60%;
    margin: auto;
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
      z-index: 2;
      left: 15px;
      bottom: 15px;
      display: inline-block;
      color: #fff;
      padding: 5px 10px;
      overflow: hidden;
      border-bottom-left-radius: 8px;

      &:before {
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

    .user-actions {
      min-height: 20px;
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
        z-index: 9999;
        width: 100%;
        height: 100%;
      }
    }
  }

  canvas {
    position: absolute;
  }
}

.action-item {
  cursor: pointer;
}
</style>
