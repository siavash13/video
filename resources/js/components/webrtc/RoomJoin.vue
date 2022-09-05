<template>
  <div id="room-join">
    <div class="rooms-list">
      <span v-if="!loading" @click="getRoomsList">
        {{ (!showRooms)? 'Show' : 'Hide' }} Rooms List {{ (!showRooms)? '+' : '-' }}
      </span>
      <span v-else>Please Wait ...</span>
      <table v-if="showRooms && !loading">
        <thead>
        <tr>
          <th>ID</th>
          <th>Start Date</th>
        </tr>
        </thead>
        <tbody v-if="rooms.length > 0">
        <tr
            v-for="(room, index) in rooms"
            :key="'room_' + index"
        >
          <td>{{ room._id }}</td>
          <td>{{ room.start_time }}</td>
        </tr>
        </tbody>
        <tbody v-else>
        <tr>
          <td colspan="2">Nothing found!</td>
        </tr>
        </tbody>
      </table>
    </div>

    <h2>Join Room</h2>
    <form ref="form" @submit="joinRoom">
      <div>
        <label>Room ID:</label>
        <input type="text" v-model="room.id"/>
      </div>
      <div>
        <input type="submit" :disabled="(!room.id)" value="Join Room"/>
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
  name: "RoomJoin",
  props: ['user'],
  computed: {
    baseUrl() {
      return socketConfig.webrtc_url + '/api/rooms';
    }
  },
  data() {
    return {
      room: {
        id: null,
      },
      rooms: [],
      message: {
        status: false,
        text: '',
        color: 'green'
      },
      showRooms: false,
      loading: false,
    }
  },
  methods: {
    joinRoom(e) {
      e.preventDefault();
      this.message.status = false;

      if (!this.room.id) {
        this.message.color = 'red';
        this.message.text = 'Please enter room id.';
        this.message.status = true;
        return false;
      }

      this.$emit('onRoomJoin', this.room);
    },
    getRoomsList() {
      this.showRooms = !this.showRooms;

      if (!this.showRooms) {
        return;
      }

      let headers = {
        'user-token': this.user.token
      };

      this.loading = true;

      axios.get(this.baseUrl + '/user', {
        headers: headers
      }).then(response => {
        this.rooms = response.data.rooms;
      }).finally(() => {
        this.loading = false;
      });
    },
  },
}
</script>

<style lang="scss">
#room-join {
  width: 450px;
  display: inline-block;
  padding: 10px;
  margin: 0 0 0 50px;
  border: 1px dashed #718096;

  @media (max-width: 768px) {
    margin: 0;
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

  .rooms-list {
    text-align: left;
    cursor: pointer;

    table {
      width: 100%;
      border-collapse: collapse;

      thed {
        th {
          text-align: center;
          border: 1px solid #ccc;
          padding: 2px;
        }
      }

      tbody {
        tr {
          &:nth-child(odd) {
            background-color: #d9d9d9;
          }

          &:nth-child(even) {
            background-color: #e7e7e7;
          }

          td {
            border: 1px solid #ccc;
            padding: 2px;
          }

        }
      }
    }
  }
}
</style>
