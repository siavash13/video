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
  name: 'terminate',
  moderator: true,
  users: [],
  attributes: {}
})

const run = (room, data) => {
  props.webrtc.runAction(room.id, action.value)
}

defineExpose({
  run
})
</script>
