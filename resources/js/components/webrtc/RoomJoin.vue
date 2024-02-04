<template>
  <div class="webrtc-section">
    <div style="padding:10px;" v-if="!initializeVideo">
      <div id="room-join">
        <div v-if="!devicesPermissions">
          Please grant website to access your camera and microphone...
        </div>
        <div v-if="!token">
          Wait for user authorization token...
        </div>
        <div v-else-if="!startConnecting" class="connection-settings">
          <div class="info">
            <label>Name:</label>
            <input
                type="text"
                v-model="name"
            />
            <button
                :disabled="!name || (permissionsFailed.camera || permissionsFailed.microphone)"
                class="btn-join mx-2"
                @click="joinToRoom"
            >
              Join Room
            </button>
          </div>
          <div v-show="!permissionsFailed.camera && !permissionsFailed.microphone">
            <div class="device-setting">
              <button
                  class="btn-small"
                  :class="{ disabled: camDisable }"
                  @click="camDisable = !camDisable"
              >
                <svg
                    v-if="!camDisable"
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-camera-video" viewBox="0 0 16 16">
                  <path fill-rule="evenodd"
                        d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                     class="bi bi-camera-video-off" viewBox="0 0 16 16">
                  <path fill-rule="evenodd"
                        d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518l.605.847zM1.428 4.18A.999.999 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634l.58.814zM15 11.73l-3.5-1.555v-4.35L15 4.269v7.462zm-4.407 3.56-10-14 .814-.58 10 14-.814.58z"/>
                </svg>
              </button>
              <button
                  class="btn-small"
                  :class="{ disabled: micDisable }"
                  @click="micDisable = !micDisable"
              >
                <svg
                    v-if="!micDisable"
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic"
                    viewBox="0 0 16 16">
                  <path
                      d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                  <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                     class="bi bi-mic-mute" viewBox="0 0 16 16">
                  <path
                      d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879l-1-1V3a2 2 0 0 0-3.997-.118l-.845-.845A3.001 3.001 0 0 1 11 3z"/>
                  <path
                      d="m9.486 10.607-.748-.748A2 2 0 0 1 6 8v-.878l-1-1V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
                </svg>
              </button>
            </div>
            <div class="devices">
              <div>
                <label>Camera</label>
                <select v-model="cameraDevice">
                  <option
                      v-for="(camera, index) in cameras"
                      :key="'camera_device_' + index"
                      :value="camera.deviceId"
                  >
                    {{ camera.label }}
                  </option>
                </select>
              </div>
              <div>
                <label>Microphone</label>
                <select v-model="microphoneDevice">
                  <option
                      v-for="(microphone, index) in microphones"
                      :key="'microphone_device_' + index"
                      :value="microphone.deviceId"
                  >
                    {{ microphone.label }}
                  </option>
                </select>
              </div>
              <div v-if="1 === 2">
                <label>Speaker</label>
                <select v-model="speakerDevice">
                  <option
                      v-for="(speaker, index) in speakers"
                      :key="'speaker_device_' + index"
                      :value="speaker.deviceId"
                  >
                    {{ speaker.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div v-show="permissionsFailed.camera || permissionsFailed.microphone">
            <div
                v-if="!permissionsRequest && !permissionsHandleDenied"
                @click="grantPermissions"
                class="cur-pointer"
            >
              Click here to grant camera & microphone permissions.
            </div>
            <div v-if="permissionsHandleDenied">
              Please restart your browser camera and microphone permissions.
            </div>
            <div v-else>
              Please click on <strong>Allow</strong> button to grant access permissions.
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="roomIsValid">
            <div v-if="!connectionFailed">
              <p v-if="!waiting">Please wait for establishing a connection...</p>
              <p v-else>Please wait until host admit you to join room...</p>
            </div>
            <div v-else class="error">
              <div v-if="peerJsFailed">
                Sorry! apparently server doesn't respond, please contact with administration.
                <a href="#" @click.prevent="closeConference">Back</a>
              </div>
              <div v-else>
                Sorry! apparently server doesn't respond, please try again.<br/>
                <a href="#" @click.prevent="startEstablishingConnection">Try Again</a>
              </div>
            </div>
          </div>
          <div v-else class="error">
            The desired room was not found! Please try to connect to an available room.
            <a href="#" @click.prevent="closeConference">Back</a>
          </div>
        </div>
      </div>
    </div>
    <div
        style="padding:10px;"
        v-show="initializeVideo"
    >
      <VideoConference
          ref="conference"
          :name="name"
          :devices="{
            camera: cameraDevice,
            microphone: microphoneDevice,
            speaker: speakerDevice
          }"
          :camDisable="camDisable"
          :micDisable="micDisable"
          :waiting="waiting"
          @onConnectionInitialed="connectionInitialed"
          @onAuthorizeRoomInvalid="authorizeRoomInvalid"
          @onPeerJsConnectionFailed="peerJsConnectionFailed"
          @onCloseConference="closeConference"
          @onSetWaitingStatus="setWaitingStatus"
      />
    </div>
    <HelperItem
        ref="helper"
    />
  </div>
</template>

<script setup>
import {ref, inject, computed, watch, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import VideoConference from './VideoConference.vue'
import HelperItem from '../../utils/Webrtc/helper.vue'

const route = useRoute()
const router = useRouter()

const webrtc = inject('webrtc')
const helper = ref()
const conference = ref()

const devicesPermissions = ref(true)
const initializeVideo = ref(false)
const token = ref()
const name = ref('')
const devices = ref([])
const cameraDevice = ref()
const microphoneDevice = ref()
const speakerDevice = ref()
const camDisable = ref(false)
const micDisable = ref(false)
const loading = ref(false)
const waiting = ref(false)
const startConnecting = ref(false)
const roomIsValid = ref(true)
const peerJsFailed = ref(false)
const connectionFailed = ref(false)
const room = ref({
  id: null
})
const message = ref({
  status: false,
  text: '',
  color: 'green'
})

const permissionsFailed = ref({
  camera: false,
  microphone: false
})
const permissionsRequest = ref(false)
const permissionsHandleDenied = ref(false)


const cameras = computed(() => {
  return devices.value.filter(item => {
    return item.kind === 'videoinput'
  })
})

const microphones = computed(() => {
  return devices.value.filter(item => {
    return item.kind === 'audioinput'
  })
})

const speakers = computed(() => {
  return devices.value.filter(item => {
    return item.kind === 'audiooutput'
  })
})

watch(cameras, (value) => {
  if (Array.isArray(value) && value.length > 0) {
    cameraDevice.value = value[0].deviceId
  }
})
watch(microphones, (value) => {
  if (Array.isArray(value) && value.length > 0) {
    microphoneDevice.value = value[0].deviceId
  }
})
watch(speakers, (value) => {
  if (Array.isArray(value) && value.length > 0) {
    speakerDevice.value = value[0].deviceId
  }
})


const getUserAccessToken = () => {
  helper.value.webrtcGetUserToken((userToken) => {
    token.value = userToken
  })
}

const joinToRoom = () => {
  startConnecting.value = true
  conference.value.initialize(room.value, token.value)
}

const connectionInitialed = () => {
  connectionFailed.value = false
  initializeVideo.value = true
}

const authorizeRoomInvalid = () => {
  roomIsValid.value = false
}

const peerJsConnectionFailed = () => {
  connectionFailed.value = true
  peerJsFailed.value = true
}

const closeConference = () => {
  router.push({name: 'webrtcRooms'})
}

const startEstablishingConnection = () => {
  conference.value.startEstablishingConnection()
}

const setWaitingStatus = (status) => {
  waiting.value = status
}


const checkPermissions = async (permission) => {
  await navigator.permissions.query({name: permission}).then((result) => {
    permissionsFailed.value[permission] = (result.state !== "granted")
  })
}

const grantPermissions = async () => {
  if (!permissionsFailed.value.camera && !permissionsFailed.value.microphone) {
    return
  }

  permissionsRequest.value = true

  let mediaStream;

  try {
    const constraints = {audio: true, video: true}
    mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
  } catch (ex) {
    permissionsHandleDenied.value = true
  }

  if (mediaStream) {
    permissionsFailed.value = {
      camera: false,
      microphone: false
    }

    const tracks = mediaStream.getTracks()

    tracks.forEach((track) => {
      track.stop()
    })

    devices.value = await webrtc.getDevices()
  }

  permissionsRequest.value = false
}


onMounted(async () => {
  room.value.id = route.params.roomId
  devices.value = await webrtc.getDevices()

  getUserAccessToken()
  await checkPermissions('camera')
  await checkPermissions('microphone')
  await grantPermissions()
})

</script>

<style lang="scss">
#room-join {
  width: fit-content;
  margin: 25px auto;
  border: 1px dashed #6096b4;

  @media screen and (max-width: 480px) {
    width: 100%;
  }

  .connection-settings {
    padding: 25px;
  }

  .info {
    padding: 25px;
  }

  .device-setting {
    padding: 10px;
    text-align: center;

    button {
      margin-right: 5px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .devices {
    div {
      padding: 0;
      margin-bottom: 5px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  label {
    @media screen and (max-width: 480px) {
      width: 80px;
    }
  }

  .btn-join {
    margin: 0 0 0 25px;

    @media screen and (max-width: 480px) {
      position: relative;
      left: 50%;
      margin: 25px auto;
      transform: translateX(-50%);
    }
  }
}
</style>
