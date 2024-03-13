<template>
  <div id="video-conference">
    <component
        v-if="themeReady && isReady"
        v-show="roomIsValid"
        :is="themeLayout"
        :connections="connections"
        :userSettings="userSettings"
        :commands="commands"
    >
      <template v-slot:modules>
        <ChatModule
          :ref="(obj) => modules['chat'] = obj"
         :webrtc="webrtc"
         :runAction="commands.run"
        />

        <PeopleModule
          :ref="(obj) => modules['people'] = obj"
          :webrtc="webrtc"
          :waitingList="waitingList"
          :runAction="commands.run"
        />
      </template>
      <template v-slot:actions>
        <VideoConferenceActions
          ref="actions"
          v-if="themeReady && isReady"
          :room="room"
          :webrtc="webrtc"
          :connections="connections"
          :userSettings="userSettings"
        />
      </template>
    </component>
  </div>
</template>

<script setup>
import {defineProps, defineExpose, defineEmits, inject, shallowRef, ref, nextTick, onBeforeUnmount} from 'vue'
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-converter'

import VideoConferenceActions from './VideoConferenceActions.vue'
import ChatModule from './modules/ChatModule.vue'
import PeopleModule from './modules/PeopleModule.vue'
import configs from '../../configs'

const webrtc = inject('webrtc')

const emit = defineEmits([
    'onPeerJsConnectionFailed',
    'onCloseConference',
    'onAuthorizeRoomInvalid',
    'onSetWaitingStatus',
    'onConnectionInitialed',
])

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  devices: {
    type: Object,
    required: true
  },
  camDisable: {
    type: Boolean,
    required: true,
    default: false
  },
  micDisable: {
    type: Boolean,
    required: true,
    default: false
  },
  waiting: {
    type: Boolean,
    required: true,
    default: true
  }
})

const actions = ref()
const modules = ref({
  chat: null,
  people: null
})
const room = ref(null)
const token = ref(null)
const loading = ref(false)
const isReady = ref(false)
const connectionFailed = ref(false)
const connectionTimeout = ref(10)
const reconnectAttemptCount = ref(3)
const attemptCount = ref(0)
const roomIsValid = ref(true)
const connections = ref([])
const waitingList = ref([])
const userSettings = ref({
  isCreator: false,
  isBrowserWindowActive: true,
})
const theme = ref(configs.webrtc.videoconference_theme)
const themeReady = ref(false)
const themeLayout = shallowRef(null)
const commands = ref({
  mute: (device) => { deviceMuteControl(device) },
  left: () => { leftTheRoom() },
  run: (name, data = {}) => {
    actions.value.runAction({name: name, data: data })
  },
  open: (name) => { openModule(name) }
})

const connect = () => {
  return new Promise((resolve, reject) => {
    if (!webrtc.socket.connected) {
      webrtc.connection({
        token: token.value
      });

      webrtc.socket.once("connect", () => {
        console.log('socket connected!');
        resolve(true);
      });
    }
  });
}

const initialize = async (roomItem = null, tokenItem = null) => {
  room.value = roomItem
  token.value = tokenItem
  loading.value = true
  isReady.value = false
  roomIsValid.value = true
  connections.value = []
  waitingList.value = []

  if (!webrtc.socket) {
    return
  }

  if(!token.value) {
    console.log('Connection is not established with server.')
    return
  }

  if(!room.value || !room.value.id) {
    console.log('Please set the room id for joining.')
    return
  }

  userSettings.value = Object.assign({
    camDisable: props.camDisable,
    micDisable: props.micDisable,
  }, userSettings.value)

  connect().then(async () => {
    webrtc.setup({
      options: {
        name: props.name,
        roomId: room.value.id,
        localVideoRef: 'video-item',
        remoteVideoRef: 'remote-video',
        remoteAudioRef: 'remote-audio',
        resolution: props.devices.resolution
      },
      callback: {
        joinRoom: userJoinRoom,
        leftRoom: userLeftRoom,
        invalidRoom: invalidRoom,
        exitConference: exitConference,
        banInRoom: banInRoom,
      },
      connections: connections.value,
      waitingList: waitingList.value,
      userSettings: userSettings.value,
    });

    try {
      webrtc.initialPeerJs().then(async (peerJsId) => {
        startEstablishingConnection()
      }).catch((error) => {
        emit('onPeerJsConnectionFailed')
      })
    } catch (error) {
      console.log('webrtc initialize error:')
      console.log(error)
    }
  })
}

const startEstablishingConnection = () => {
  connectionFailed.value = false
  attemptCount.value = 0
  establishingConnection()
}

const establishingConnection = () => {
  if(isReady.value || props.waiting) {
    return
  }

  webrtc.Room.join(room.value.id,{
    name: props.name
  })

  attemptCount.value += 1

  if(attemptCount.value <= reconnectAttemptCount.value) {
    setTimeout(establishingConnection, connectionTimeout.value * 1000)
  } else {
    connectionFailed.value = true;
  }
}

const leftTheRoom = async () =>  {
  let data = {
    username: props.name,
  }

  webrtc.Room.left(room.value?.id, data);
  exitConference()
}

const deviceMuteControl = (device) =>  {
  if(device === 'camera') {
    userSettings.value.camDisable = !userSettings.value.camDisable
    webrtc.Media.muteCamera()
  } else {
    userSettings.value.micDisable = !userSettings.value.micDisable
    webrtc.Media.muteMicrophone()
  }
}

const exitConference = () => {
  emit('onCloseConference')
}

const userLeftRoom = (data) =>  {
  console.log(data?.username + ' left room!')
}

const userJoinRoom = (data) =>  {
  console.log('user join to room: ' + data.peerJsId)
}

const invalidRoom = () => {
  roomIsValid.value = false;
  emit('onAuthorizeRoomInvalid')
}

const setThemeLayout = async () => {
  let themeItem = null;
  let themeName = capitalizeFirstLetter(theme.value);

  try {
    themeItem = await loadThemeLayout(themeName)
  } catch(error) {
    themeItem = await loadThemeLayout('Default')
  }

  themeReady.value = true
  themeLayout.value = themeItem.default
}

const loadThemeLayout = async (themeName) => {
  let layout = async () => import('./themes/' + themeName + 'VideoConference.vue')
  return await layout()
}

const capitalizeFirstLetter = (text) =>  {
  let _text = text.toLowerCase()
  return _text.charAt(0).toUpperCase() + _text.slice(1)
}

const openModule = (name) =>  {
  modules.value[name].open(room.value)
}

const banInRoom = (data) =>  {
  alert('you are ban!')
  exitConference()
}

const eventHandlerConnectToRoomSuccess = (data) =>  {
  loading.value = false
  isReady.value = true

  emit('onSetWaitingStatus', true)
  emit('onConnectionInitialed', data.detail)

  if(data.detail.waitList && data.detail.waitList.length > 0) {
    waitingList.value = data.detail.waitList
  }

  nextTick(async () => {
    await webrtc.startStreamUserMedia(props.devices)
    webrtc.Room.notifyJoinSuccess(room.value.id)
  })
}

const eventHandlerWaitUntilHostAdmit = () => {
  emit('onSetWaitingStatus', true)
}

/**
 * Fix mobile device browser minimize stream bug
 */
const checkBrowserWindowVisibility = (e) => {
  if (document.visibilityState === 'hidden') {
    webrtc.Media.sendUserMediaMuteStatusByDataConnection(true, true)
  } else {
    webrtc.Media.sendUserMediaMuteStatusByDataConnection(
      userSettings.value.camDisable,
      userSettings.value.micDisable
    )
  }
}

onBeforeUnmount(() => {
  leftTheRoom()
  window.removeEventListener('onWaitUntilAdmit', eventHandlerWaitUntilHostAdmit)
  window.removeEventListener('onConnectToRoomSuccess', eventHandlerConnectToRoomSuccess)

  if (webrtc.isMobileDevice()) {
    window.removeEventListener('visibilitychange', checkBrowserWindowVisibility)
  }
})

setThemeLayout()
window.addEventListener('onWaitUntilAdmit', eventHandlerWaitUntilHostAdmit)
window.addEventListener('onConnectToRoomSuccess', eventHandlerConnectToRoomSuccess)

if (webrtc.isMobileDevice()) {
  window.addEventListener('visibilitychange', checkBrowserWindowVisibility)
}


defineExpose({
  initialize
})
</script>

<style lang="scss">
@import "../../assets/webrtc/scss/DefaultThemeStyle.scss";
</style>
