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
        <label>Authorisable:</label>
        <input
          type="checkbox"
          v-model="room.authorisable"
          :value="true"
        />
      </div>
      <div>
        <input v-if="!loading" type="submit" value="Create Room"/>
        <span v-else>Please wait ...</span>
      </div>
    </form>

    <div v-if="message.status" :class="message.type">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import axios from '../../utils/Webrtc/Axios'

const apiClient = axios.getInstance()

const props = defineProps({
  token: {
    type: String,
    required: true
  }
})


const loading = ref(false)
const room = ref({
  name: null,
  moderator: 'moderator',
  start_time: '2022-08-06 08:30:00',
  end_time: '2022-08-06 08:31:00',
  authorisable: false,
})
const roomMinTime = ref('2022-08-06 08:30:00')
const message = ref({
  status: false,
  text: '',
  type: 'success'
})

const createRoom = (e) => {
  e.preventDefault()
  message.value.status = false
  let headers = {
    'user-token': props.token
  }

  if (!(room.value.name && room.value.moderator && room.value.start_time && room.value.end_time)) {
    message.value.type = 'error'
    message.value.text = 'Please fill all required fields.'
    message.value.status = true
    return false
  }

  loading.value = true

  apiClient.post('/api/rooms', room.value, {
    headers: headers
  }).then(response => {
    message.value.type = 'success'
    message.value.text = 'Room created successfully! Room Id is: ' + response.data.room.id
  }, error => {
    message.value.type = 'error'
    message.value.text = 'Error happened! ' + error.response.data.message
  }).finally(() => {
    loading.value = false
    message.value.status = true
  })
}

const setRoomStartEndTime = () => {
  roomMinTime.value = setDateTimeFormat()
  room.value.start_time = setDateTimeFormat(1)
  room.value.end_time = setDateTimeFormat(10)
}

const setDateTimeFormat = (minutes = 0) => {
  let dateTime
  let dateObject = new Date(Date.now())

  dateObject.setDate(dateObject.getDate() + 2)
  dateObject.setMinutes(dateObject.getMinutes() + minutes)
  dateTime = dateObject.toISOString()

  return dateTime.substring(0, dateTime.indexOf("T") + 6)
}


setRoomStartEndTime()
</script>

<style lang="scss">
#room-register {
  width: 100%;
  display: inline-block;
  padding: 10px;
  margin: 0 50px 0 0;
  border: 1px dashed #718096;

  @media (max-width: 768px) {
    width: unset;
    margin: 0 0 50px 0;
  }

  div {
    margin-bottom: 20px;

    label {
      width: 120px;
      display: inline-block;
    }

    input[type=checkbox] {
      min-width: 200px;
    }

    input[type=text] {
      display: inline-block;
    }
  }
}
</style>
