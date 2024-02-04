<template>
  <div id="canvas-text" v-show="dialog || isPlay">
    <div id="canvas-text-action" class="action" :style="{ 'display': ((dialog)? 'block' : 'none')}">
      <div class="admin-section" v-if="props.userSettings.isCreator">
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
      <div id="canvas-text-action-counter" v-if="props.userSettings.isCreator">
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
    <HelperItem
      ref="helper"
    />
  </div>
</template>

<script setup>
import {defineExpose, defineProps, ref, computed, onMounted} from 'vue'
import axios from '../../../utils/Webrtc/Axios'
import HelperItem from '../../../utils/Webrtc/helper.vue'

const apiClient = axios.getInstance()

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

const disabled = computed(() => {
  return (!text.value || text.value === '')
})

const helper = ref()
const dialog = ref(false)
const loading = ref(false)
const text = ref(null)
const isPlay = ref(false)
const isPause = ref(false)
const historyItems = ref([])
const files = ref([])

const action = ref({
  name: 'canvas-text',
  moderator: true,
  users: [],
  attributes: {
    play: false,
    pause: false,
    initial: false,
    message: null,
  }
})

const run = (room, data) => {
  show()
}

const show = (status = true) => {
  dialog.value = status;
}

const copyText = (url) => {
  helper.value.webrtcGetUserToken((token) => {
    let headers = {
      'user-token': token
    };

    apiClient.get('/api/canvas-text-get?key=' + url, {
      headers: headers
    }).then(response => {
      text.value = response.data
    })
  })
}

const getTextFromBucket = () => {
  loading.value = true

  helper.value.webrtcGetUserToken((token) => {
    let headers = {
      'user-token': token
    }

    let roomId = props.room.id

    apiClient.get('/api/canvas-text-list?roomId=' + roomId, {
      headers: headers
    }).then(response => {
      files.value = response.data.files.map(item => {
        return {
          file: item,
          loading: false,
        }
      })
    }).finally(() => {
      loading.value = false;
    })
  })
}

const getTextFromStorage = () =>  {
  let store = JSON.parse(localStorage.getItem('cnidus.videoconference.canvasaction'))
  historyItems.value = (!store) ? [] : store.history;
}

const storeTextInStorage = () =>  {
  localStorage.setItem('cnidus.videoconference.canvasaction', JSON.stringify({history: historyItems.value}))
}

const removeText = (index) =>  {
  historyItems.value.splice(index, 1)
  storeTextInStorage()
}

const getActionObject = () =>  {
  return JSON.parse(JSON.stringify(action.value))
}

const pauseMessage = () =>  {
  if(!isPlay.value) {
    return false
  }

  isPause.value = !isPause.value

  let actionItem = getActionObject()
  actionItem.attributes.play = true
  actionItem.attributes.pause = isPause.value

  props.webrtc.runAction(props.room.id, actionItem)
  show(false)
}

const marqueeMessage = () => {
  if(disabled.value && !isPlay.value) {
    return false
  }

  isPlay.value = !isPlay.value
  isPause.value = false

  // store in storage
  if (isPlay.value) {
    let index = historyItems.value.findIndex(x => x === text.value)
    if (index < 0) {
      historyItems.value.push(text.value)
      storeTextInStorage()
    }
  }

  let actionItem = getActionObject()
  actionItem.attributes.play = isPlay.value
  actionItem.attributes.message = text.value

  if(isPlay.value) {
    actionItem.attributes.initial = true;
  }

  props.webrtc.runAction(props.room.id, actionItem)
  show(false)
}

onMounted(() => {
  getTextFromBucket()
})


defineExpose({
  run,
  pauseMessage,
  marqueeMessage,
})

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
