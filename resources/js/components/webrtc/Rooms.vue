<template>
  <div>
    <form ref="form" @submit="createRoom">
      <label>Room Name:</label>
      <input type="text" v-model="room.name" />
      <label>Moderator:</label>
      <input type="text" v-model="room.moderator" />
      <label>Start Time:</label>
      <input type="text" v-model="room.start_time" />
      <label>End Time:</label>
      <input type="text" v-model="room.end_time" />

      <br />

      <input type="submit" value="Create Room" />
    </form>

    <div v-if="message.status" :style="{ color:message.color }">
      {{ message.text }}
    </div>
  </div>
</template>

<script>
import socketConfig from "../../configs/socket";

export default {
  name: "Rooms",
  data() {
    return {
      room: {
        name: '',
        moderator: 'moderator',
        start_time: null,
        end_time: null,
      },
      message: {
        status: false,
        text: '',
        color: 'green'
      }
    }
  },
  methods: {
    createRoom() {
      this.message.status = false;
      const url = socketConfig.webrtc_url + '/rooms'

      axios.post(url, this.room).then(response => {
        this.message.color = 'green';
        this.message.text = 'Room created successfully! Room Id is: ' + response.data.data.id;
      }, error => {
        this.message.color = 'red';
        this.message.text = 'Error happened! ' + error.message;
      }).finally(() => {
        this.message.status = true;
      });
    },
  },
}
</script>
