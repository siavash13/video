<template>
  <div id="rooms-list">
    <div class="rooms-list-table">
      <span v-if="!loading" @click="getRoomsList">
        Get Rooms List
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
          <td>
            <router-link :to="{ name: 'joinRoom', params: { roomId: room._id }}">
              {{ room._id }}
            </router-link>
          </td>
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

    <div v-if="message.status" :style="{ color:message.color }">
      {{ message.text }}
    </div>
  </div>
</template>

<script>
import socketConfig from "../../configs/webRTCsocket";

export default {
  name: "RoomsList",
  props: ['token'],
  computed: {
    baseUrl() {
      return socketConfig.webrtc_url + '/api/rooms';
    }
  },
  created() {
    this.room.id = this.$route.params.room_id;
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
        'user-token': this.token
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
#rooms-list {
  width: 450px;
  display: inline-block;
  padding: 10px;
  margin: 0 0 0 50px;
  border: 1px dashed #718096;

  @media (max-width: 768px) {
    margin: 0;
  }

  .rooms-list-table {
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
