<template>
  <div>
    <div>
      <a href="#" @click.prevent="leftTheRoom">Left Room</a>
    </div>
    <div
      id="video-conference-users"
      :class="{ 'two-user-joined': (connections.length <= 1), 'multi-user-joined': (connections.length > 1)}"
    >
      <div
        :class="{ 'room-creator': userSettings.isCreator , 'room-user': !userSettings.isCreator }"
      >
        <div class="room-item">
          <video class="video-content video-item"></video>
        </div>
      </div>

      <div
        v-for="(connection, index) in connections"
        :key="'connection_' + index"
        :class="{ 'room-creator': connection.isCreator , 'room-user': !connection.isCreator }"
      >
        <div class="room-item">
          <div class="user-name" v-text="connection.name"></div>
          <video v-show="connection.active" class="peer-content video-item"></video>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DefaultVideoConference",
  props: ['connections', 'userSettings'],
  data() {
    return {}
  },
  methods: {
    leftTheRoom() {
      this.$emit('onLeftRoom');
    }
  }
}
</script>

<style lang="scss">
#video-conference-users {
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  &.two-user-joined {
    flex-wrap: nowrap;

    .room-creator {
      width: 50%;
      order: 1;
    }

    .room-user {
      width: 50%;
      order: 2;
    }

    @media (max-width: 768px) {
      .room-creator,
      .room-user {
        width: 50%;

        .room-item {
          height: 45vh;
        }
      }
    }
  }

  &.multi-user-joined {
    .room-creator {
      width: 100%;
      order: 1;
      padding: 10px;

      .room-item {
        width: 500px;
      }
    }

    .room-user {
      display: inline-block;
      width: 150px;
      order: 2;
      padding: 10px;

      .room-item {
        height: 150px;
      }
    }
  }

  video {
    width: 100%;
    border-radius: 8px;
  }

  .user-name {
    position: absolute;
    left: 0;
    bottom: 0;
    display: inline-block;
    color: #fff;
    padding: 5px 10px;

    &:before {
      content: ' ';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      opacity: 0.6;
      background: #000;
    }
  }

  .room-item {
    position: relative;
   // width: 100%;
    //    height: 250px;
    //    background: #ff00ff;
  }
}
</style>
