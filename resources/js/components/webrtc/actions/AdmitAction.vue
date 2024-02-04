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
  name: 'admit',
  moderator: true,
  users: [],
  attributes: {
    status: false,
    peerJsId: null,
  }
})

const run = (room, data) => {
  const actionItem = JSON.parse(JSON.stringify(action.value))

  actionItem.attributes = data
  actionItem.users.push({
    peerJsId: data.peerJsId,
    status: 'waiting'
  })

  props.webrtc.runAction(room.id, actionItem)
}

defineExpose({
  run
})
</script>
