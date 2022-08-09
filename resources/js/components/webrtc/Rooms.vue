<template>
  <div id="room-section">
    <div v-if="!!user">
      <RoomCreate
        :user="user"
      />

      <RoomJoin
        :user="user"
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
import RoomJoin from "./RoomJoin";
import RoomCreate from "./RoomCreate";

export default {
  name: "Rooms",
  created() {
    this.getUserAccessToken();
  },
  data() {
    return {
      user: null,
      waitingDots: '.',
      interval: null,
      error: null,
    }
  },
  methods: {
    getUserAccessToken() {
      this.interval = setInterval(this.setWaitingDots, 500);

      axios.get('/api/videoconference/userToken').then(response => {
        this.user = response.data.data;
      }, error => {
        this.error = 'Error happened! ' + error.response.data.message;
      }).finally(() => {
        clearInterval(this.interval);
      });
    },
    setWaitingDots() {
      if(this.waitingDots.length < 3) {
        this.waitingDots = this.waitingDots.concat('.');
      } else {
        this.waitingDots = '';
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  components: {
    RoomCreate,
    RoomJoin,
  },
}
</script>

<style lang="scss">
  #room-section {
    margin-top: 100px;
    text-align: center;

    .error {
      color: red;
    }
  }
</style>
