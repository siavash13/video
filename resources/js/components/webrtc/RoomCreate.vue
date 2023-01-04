<template>
  <div id="room-register">
    <h2>Create Room</h2>
    <form ref="form" @submit="createRoom">
      <div>
        <label>Room Name:</label>
        <input type="text" v-model="room.name"/>
      </div>
      <div>
        <label>Moderator:</label>
        <input type="text" v-model="room.moderator"/>
      </div>
      <div>
        <label>Start Time:</label>
        <input
            type="datetime-local"
            v-model="room.start_time"
            :min="roomMinTime"
        />
      </div>
      <div>
        <label>End Time:</label>
        <input
            type="datetime-local"
            v-model="room.end_time"
            :min="room.start_time"
        />
      </div>
      <div>
        <input v-if="!loading" type="submit" value="Create Room"/>
        <span v-else>Please wait ...</span>
      </div>
    </form>

    <div v-if="message.status" :style="{ color:message.color }">
      {{ message.text }}
    </div>
  </div>
</template>

<script>
import socketConfig from "../../configs/webRTCsocket";


export default {
  name: "RoomCreate",
  props: ['token'],
  created() {
    this.setRoomStartEndTime();
  },
  computed: {
    baseUrl() {
      return socketConfig.webrtc_url + '/api/rooms';
    }
  },
  data() {
    return {
      loading: false,
      room: {
        name: null,
        moderator: 'moderator',
        start_time: '2022-08-06 08:30:00',
        end_time: '2022-08-06 08:31:00',
      },
      roomMinTime: '2022-08-06 08:30:00',
      message: {
        status: false,
        text: '',
        color: 'green'
      }
    }
  },
  methods: {
    createRoom(e) {
      e.preventDefault();
      this.message.status = false;
      let headers = {
        'user-token': this.token
      };

      if (!(this.room.name && this.room.moderator && this.room.start_time && this.room.end_time)) {
        this.message.color = 'red';
        this.message.text = 'Please fill all required fields.';
        this.message.status = true;
        return false;
      }

      this.loading = true;

      axios.post(this.baseUrl, this.room, {
        headers: headers
      }).then(response => {
        this.message.color = 'green';
        this.message.text = 'Room created successfully! Room Id is: ' + response.data.room.id;
      }, error => {
        this.message.color = 'red';
        this.message.text = 'Error happened! ' + error.response.data.message;
      }).finally(() => {
        this.loading = false;
        this.message.status = true;
      });
    },
    setRoomStartEndTime() {
      this.roomMinTime = this.setDateTimeFormat();
      this.room.start_time = this.setDateTimeFormat(1);
      this.room.end_time = this.setDateTimeFormat(10);
    },
    setDateTimeFormat(minutes = 0) {
      let dateTime = null;
      let dateObject = new Date(Date.now());

      dateObject.setDate(dateObject.getDay() + 2);
      dateObject.setMinutes(dateObject.getMinutes() + minutes);
      dateTime = dateObject.toISOString();

      return dateTime.substring(0, dateTime.indexOf("T") + 6);
    }
  },
}
</script>

<style lang="scss">
#room-register {
  width: 450px;
  display: inline-block;
  padding: 10px;
  margin: 0 50px 0 0;
  border: 1px dashed #718096;

  @media (max-width: 768px) {
    margin: 0 0 50px 0;
  }

  div {
    margin-bottom: 20px;

    label {
      width: 150px;
      display: inline-block;
    }

    input[type=text] {
      display: inline-block;
    }
  }
}
</style>
