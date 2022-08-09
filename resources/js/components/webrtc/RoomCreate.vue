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
        <input type="text" v-model="room.start_time"/>
      </div>
      <div>
        <label>End Time:</label>
        <input type="text" v-model="room.end_time"/>
      </div>
      <div>
        <input type="submit" value="Create Room"/>
      </div>
    </form>

    <div v-if="message.status" :style="{ color:message.color }">
      {{ message.text }}
    </div>
  </div>
</template>

<script>
import socketConfig from "../../configs/socket";

export default {
  name: "RoomCreate",
  props: ['user'],
  computed: {
    baseUrl() {
      return socketConfig.webrtc_url + '/api/rooms';
    }
  },
  data() {
    return {
      room: {
        name: null,
        moderator: 'moderator',
        start_time: '2022-08-06 08:30:00',
        end_time: '2022-08-06 08:31:00',
      },
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
        'user-token': this.user.token
      };

      if (!(this.room.name && this.room.moderator && this.room.start_time && this.room.end_time)) {
        this.message.color = 'red';
        this.message.text = 'Please fill all required fields.';
        this.message.status = true;
        return false;
      }

      axios.post(this.baseUrl, this.room, {
        headers: headers
      }).then(response => {
        this.message.color = 'green';
        this.message.text = 'Room created successfully! Room Id is: ' + response.data.room.id;
      }, error => {
        this.message.color = 'red';
        this.message.text = 'Error happened! ' + error.response.data.message;
      }).finally(() => {
        this.message.status = true;
      });
    },
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
