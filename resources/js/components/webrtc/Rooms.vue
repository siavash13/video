<template>
  <div id="webrtc">
    <div v-if="!!token" id="rooms-section">
        <RoomCreate
            :token="token"
        />

        <RoomsList
            :token="token"
        />
    </div>
    <div v-else-if="!error">
      <h2>Please Wait{{ waitingDots }}</h2>
      <p>Connecting to the server to get a user authorization token.</p>
    </div>
    <div v-else class="server-error error">
      {{ error }}
      <div>Please <a href="#" @click.prevent="getUserAccessToken">try again</a> later.</div>
    </div>
    <HelperItem
      ref="helper"
    />
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'
import RoomsList from './RoomsList'
import RoomCreate from './RoomCreate'
import HelperItem from '../../utils/Webrtc/helper.vue'

const helper = ref()


const token = ref()
const waitingDots = ref('.')
const interval = ref()
const error = ref()

const getUserAccessToken = () => {
  error.value = null
  interval.value = setInterval(setWaitingDots, 500)

  helper.value.webrtcGetUserToken((userToken) => {
    token.value = userToken
  }, (errorItem) => {
    error.value = errorItem
  }).finally(() => {
    clearInterval(interval.value)
  })
}

const setWaitingDots = () => {
  if(waitingDots.value.length < 3) {
    waitingDots.value = waitingDots.value.concat('.')
  } else {
    waitingDots.value = ''
  }
}

onBeforeUnmount(() => {
  clearInterval(interval.value)
})

onMounted(() => {
  getUserAccessToken()
})

</script>

<style lang="scss">
  #rooms-section {
    display: flex;
    justify-content: space-around;
    text-align: center;

    @media screen and (max-width: 480px) {
      flex-direction: column;
    }
  }
  .server-error {
    color: red;
  }
</style>
