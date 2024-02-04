<template>
  <span></span>
</template>

<script setup>
import { defineProps, defineExpose, ref } from 'vue'

const props = defineProps({
  webrtc: {
    type: Object,
    required: true
  }
})

const action = ref({
  name: 'mute-user-mic',
  moderator: true,
  users: [],
  attributes: {}
})

const run = (room, data) => {
  const actionItem = JSON.parse(JSON.stringify(action.value))

  actionItem.users.push({
    peerJsId: data.peerJsId
  })

  props.webrtc.runAction(room.id, actionItem)
}

defineExpose({
  run
})
</script>
