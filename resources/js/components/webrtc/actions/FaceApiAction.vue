<template>
  <div id="faceapi-text-action" :style="{ 'display': ((dialog)? 'block' : 'none')}">
    <div class="admin-section" v-if="props.userSettings.isCreator">
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

<script setup>
import {defineExpose, defineProps, ref, computed, onMounted, onUnmounted} from 'vue'
import FakeFace from "../../../assets/webrtc/images/face-profile.jpg";

const props = defineProps({
  webrtc: {
    type: Object,
    required: true
  },
  room: {
    type: Object,
    required: true
  },
  userSettings: {
    type: Object,
    required: true
  }
})

const users = computed(() => {
  let users = [{
    name: 'Creator',
    peerJsId: props.userSettings.peerJsId
  }]

  props.webrtc.People.getConnections().forEach((item) => {
    users.push({
      name: item.name,
      peerJsId: item.peerJsId
    })
  })

  return users;
})

const dialog = ref(false)
const type= ref('hat')
const timeout= ref(30)
const selectedUser= ref()
const event= ref()
const faceApi= ref({
  drawItems: ['hat', 'medal'],
  endTime: {
    hat: null,
    medal: null,
  },
  callbacks: {
    hat: null,
    medal: null,
  }
})
const images= ref({
  medal: null,
  hat: null,
  faceTest: null,
})

const action = ref({
  name: 'face-api',
  moderator: true,
  users: [],
  attributes: {
    type: 'hat',
    timeout: '5',
    peerJsId: null,
  }
})


const show = (status = true) => {
  dialog.value = status;

  if(!status) {
  }
}

const run = () => {
  show()
}

const initialCallbacks = () => {
  faceApi.value.callbacks.hat = props.webrtc.Media.registerFaceDetectorCallback('hat', draw);
  faceApi.value.callbacks.medal = props.webrtc.Media.registerFaceDetectorCallback('medal', draw);
}

const startDraw = () => {
  let actionItem = JSON.parse(JSON.stringify(action.value))

  actionItem.attributes.type = type.value
  actionItem.attributes.timeout = timeout.value
  actionItem.users.push({
    peerJsId: selectedUser.value
  })

  props.webrtc.runAction(props.room.id, actionItem)
  show(false)
}

const setActionEventListener = () => {
  window.addEventListener('onFaceApiAction-DetectAndDraw', userFaceApiListenerAction);
}

const clearListener = () => {
  window.removeEventListener('onFaceApiAction-DetectAndDraw', userFaceApiListenerAction);
}

const setImages = () => {
  images.value.faceTest = new Image
  images.value.faceTest.src = FakeFace
  images.value.faceTest.onload = () => {

  }

  images.value.hat = new Image
  images.value.hat.src = '/images/pirate-hat.webp'
  images.value.medal = new Image
  images.value.medal.src = '/images/medal.png'
}

const userFaceApiListenerAction = (e) => {
  faceApi.value.endTime[e.detail.type] = new Date()
  faceApi.value.endTime[e.detail.type].setTime(
      faceApi.value.endTime[e.detail.type].getTime() + parseInt(e.detail.timeout) * 1000
  )

  faceApi.value.callbacks[e.detail.type].enable = true
}

const checkCallbackTimeOut = async (type) => {
  let currentTime = Date.now()

  if (!faceApi.value.callbacks[type].enable) {
    return false
  }

  if (currentTime > faceApi.value.endTime[type]) {
    faceApi.value.endTime[type] = null
    faceApi.value.callbacks[type].enable = false
    return false
  }

  return true
}

const draw = (lastPosition, canvas, type) => {
  if (!checkCallbackTimeOut(type)) return

  const ctx = canvas.getContext("2d")
  const methodName = 'calculate' + type.charAt(0).toUpperCase() + type.slice(1) + 'Position'
  const typePosition = calculatePositions[methodName](lastPosition)

  ctx.drawImage(images.value[type],
      typePosition.posX,
      typePosition.posY,
      typePosition.width,
      typePosition.height)
}


const calculatePositions = {
  calculateHatPosition: (data) => {
    let width = data.width * 2.6;

    return {
      width: width,
      height: images.value.hat.naturalHeight / (images.value.hat.naturalWidth / width),
      posX: data.xMin - ((width - data.width) / 2),
      posY: data.yMin - ((width - data.width) / 1.22),
    };
  },
  calculateMedalPosition: (data) => {
    let width = data.width / 1.8;

    return {
      width: width,
      height: images.value.medal.naturalHeight / (images.value.medal.naturalWidth / width),
      posX: data.xMin + (data.xMin / 1.32),
      posY: data.yMin + data.height + (data.height / 10)
    };
  }
}

onMounted(() => {
  initialCallbacks()
  setActionEventListener()
})

onUnmounted(() => {
  clearListener()
})

setImages()

defineExpose({
  run
})

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
