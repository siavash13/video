<template>
  <div id="room-section">
    <div v-if="!!user">
      <div v-show="!initalizeVideo">
        <RoomCreate
            :user="user"
        />

        <RoomJoin
            :user="user"
            @onRoomJoin="joinToRoom"
        />
      </div>

      <div v-show="initalizeVideo">
        <VideoConference
          ref="conference"
          @onCloseConference="closeConference"
          :user="user"
        />
      </div>
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
import VideoConference from "./VideoConference";

export default {
  name: "Rooms",
  created() {
    this.getUserAccessToken();
  },
  data() {
    return {
      user: null,
      room: {
        id: null
      },
      waitingDots: '.',
      interval: null,
      error: null,
      initalizeVideo: false,
    }
  },
  methods: {
    getUserAccessToken() {
      this.interval = setInterval(this.setWaitingDots, 500);

      axios.get('/videoconference/userToken').then(response => {
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
    },
    joinToRoom(room) {
      this.initalizeVideo = true;
      this.$refs.conference.initialize(room);
    },
    closeConference() {
      this.initalizeVideo = false;
    },
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  components: {
    RoomCreate,
    RoomJoin,
    VideoConference,
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
