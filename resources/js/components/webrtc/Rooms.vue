<template>
  <div>
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
    <div v-else class="error">
      {{ this.error }}
    </div>
  </div>
</template>

<script>
import RoomsList from "./RoomsList";
import RoomCreate from "./RoomCreate";
import webRTCHelper from "@/utils/WebRTC/webRTCHelper";

export default {
  name: "Rooms",
  created() {
    this.getUserAccessToken();
  },
  mixins: [webRTCHelper],
  data() {
    return {
      token: null,
      waitingDots: '.',
      interval: null,
      error: null,
    }
  },
  methods: {
    getUserAccessToken() {
      this.interval = setInterval(this.setWaitingDots, 500);

      this.webrtcGetUserToken((token) => {
        this.token = token;
        clearInterval(this.interval);
      });
    },
    setWaitingDots() {
      if(this.waitingDots.length < 3) {
        this.waitingDots = this.waitingDots.concat('.');
      } else {
        this.waitingDots = '';
      }
    },
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  components: {
    RoomCreate,
    RoomsList,
  },
}
</script>

<style lang="scss">
  #rooms-section {
    display: flex;
    justify-content: space-around;
    text-align: center;

    .error {
      color: red;
    }
  }
</style>
