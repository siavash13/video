<template>
  <div id="rooms-list">
    <h2>Rooms List</h2>
    <div class="rooms-list-table">
      <span
        class="btn btn-small"
        :class="{ disabled : loading }"
        @click="getRoomsList"
      >
        {{ (!loading)? 'Get Rooms List' : 'Please Wait ...' }}
      </span>
      <table v-if="showRooms && !loading">
        <thead>
        <tr>
          <th>Room Name</th>
          <th>Room ID</th>
          <th>Start Date</th>
        </tr>
        </thead>
        <tbody v-if="rooms.length > 0">
        <tr
          v-for="(room, index) in rooms"
          :key="'room_' + index"
          @click="joinRoom(room._id)"
        >
          <td>
            {{ room.name }}
          </td>
          <td class="text-center">
            {{ room._id }}
          </td>
          <td class="text-center">
            {{ room.start_time.split('T')[0] }}
          </td>
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

<script setup>
import { ref, defineProps } from 'vue'
import axios from '../../utils/Webrtc/Axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const apiClient = axios.getInstance()

const props = defineProps({
  token: {
    type: String,
    required: true
  }
})

const loading = ref(false)
const showRooms = ref(false)
const rooms = ref([])
const room = ref({
  id: null
})
const message = ref({
  status: false,
    text: '',
    color: 'green'
})

room.value.id = route.params.room_id

const joinRoom = (roomId) => {
  router.push({
    name: 'webrtcJoinRoom',
    params: { roomId: roomId }
  })
}

const getRoomsList = () => {
  if (loading.value) {
    return
  }

  let headers = {
    'user-token': props.token
  }

  loading.value = true

  apiClient.get('/api/rooms/user', {
    headers: headers
  }).then(response => {
    rooms.value = response.data.rooms
  }).finally(() => {
    loading.value = false
    showRooms.value = true
  })
}

</script>

<style lang="scss">
#rooms-list {
  width: 100%;
  display: inline-block;
  padding: 10px;
  margin: 0 0 0 50px;
  border: 1px dashed #718096;

  @media (max-width: 768px) {
    width: unset;
    margin: 0;
  }

  .rooms-list-table {
    text-align: left;
    cursor: pointer;

    table {
      width: 100%;
      margin-top: 15px;
      border-collapse: collapse;

      thead {
        th {
          font-size: .9em;
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
