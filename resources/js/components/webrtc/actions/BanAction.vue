<template>
  <span></span>
</template>

<script setup>
import {defineExpose, defineProps, ref} from 'vue'

const props = defineProps({
  webrtc: {
    type: Object,
    required: true
  }
})

const action = ref({
  name: 'ban',
  moderator: true,
  users: [],
  attributes: {
    ban: {}
  }
})

const run = (room, data) => {
  let actionItem = JSON.parse(JSON.stringify(action.value))

  actionItem.attributes.ban = data;

  props.webrtc.runAction(room.id, actionItem)
}

defineExpose({
  run
})
</script>
