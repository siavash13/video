<template>
  <div id="faceapi-text-action" :style="{ 'display': ((dialog)? 'block' : 'none')}">
    <div class="admin-section" v-if="userSettings.isCreator">
      <div class="text-section">
        <div class="settings mx-15">
          <div>
            <label>User:</label>
            <select
              v-model="selectedUser"
            >
              <option
                v-for="(user, index) in users"
                :key="'user-' + index"
                :value="user.peerJsId"
              >{{ user.name }}</option>
            </select>
          </div>
          <div>
            <label>Timeout:</label>
            <input type="text" v-model="timeout" placeholder="Enter timeout" />
            <span> (seconds) </span>
          </div>
        </div>
        <div class="type-options mx-15">
          <div>
            <label for="type-hat">Pirate Hat</label>
            <input id="type-hat" name="type" type="radio" value="hat" v-model="type" />
          </div>
          <div>
            <label for="type-medal">Medal</label>
            <input id="type-medal" name="type" type="radio" value="medal" v-model="type"  />
          </div>
        </div>
        <div class="mx-15">
          <button @click="startDraw" :disabled="!selectedUser || !timeout">Start Draw</button>
        </div>
      </div>
    </div>
    <div class="faceapi-action-back" @click="show(false)"></div>
  </div>
</template>

<script>
export default {
  name: "FaceApiAction",
  props: ['room', 'webrtc', 'userSettings'],
  created() {

  },
  computed: {
    users() {
      let users = [{
        name: 'Creator',
        peerJsId: this.userSettings.peerJsId
      }];

      this.webrtc.People.getConnections().forEach((item) => {
        users.push({
          name: item.name,
          peerJsId: item.peerJsId
        });
      });

      return users;
    }
  },
  data() {
    return {
      dialog: false,
      type: 'hat',
      timeout: 30,
      selectedUser: null,
      event: null,
      action: {
        name: 'faceapi',
        moderator: true,
        users: [],
        attributes: {
          type: 'hat',
          timeout: '5',
          peerJsId: null,
        }
      }
    }
  },
  methods: {
    show(status = true) {
      this.dialog = status;

      if(!status) {
      }
    },
    run() {
      this.show();
    },
    startDraw() {
      let action = Object.assign({}, this.action);

      action.attributes.type = this.type;
      action.attributes.timeout = this.timeout;
      action.attributes.peerJsId = this.selectedUser;

      this.webrtc.runAction(this.room.id, action);
      this.show(false);
    },
  }
}
</script>

<style lang="scss">
#faceapi-text-action {
  .admin-section {
    position: fixed;
    display: flex;
    z-index: 2;
    top: 50%;
    left: 50%;
    width: 600px;
    padding: 10px;
    background: #fff;
    border: 1px solid #ccc;
    transform: translate(-50%, -50%);

    @media screen and (max-width:480px) {
      width: 90%;
    }

    .mx-15 {
      margin: 15px 0;
    }

    .text-section {
      width: 100%;

      .settings {
        display: flex;
        justify-content: space-between;

        @media screen and (max-width:480px) {
          flex-direction: column;
        }

        div {
          label {
            margin-right: 5px;
          }

          select {
            min-width: 150px;
          }

          @media screen and (max-width:480px) {
            margin: 15px;
          }
        }
      }

      .type-options {
        width: 100%;

        div {
          display: inline-block;
          margin-right: 15px;

          label {
            margin-right: 5px;
          }

          &:last-child {
            margin-right: unset;
          }
        }
      }
    }
  }

  .faceapi-action-back {
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    opacity: 0.6;
  }
}
</style>
