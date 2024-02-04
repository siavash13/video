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

const run = (room, data) => {
  setTimeout(() => {
    props.webrtc.runAction(room.id, {
      name: 'ban',
      moderator: true,
      users: [],
      attributes: {
        ban: {
          peerJsId: data.peerJsId
        }
      }
    });
  }, 5000)
}

defineExpose({
  run
})
</script>
