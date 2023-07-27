<template>
  <div id="chat-module" :style="{ 'display': ((dialog)? 'block' : 'none')}">
    <div class="chat-module-box">
      <div class="chat-section-heading">
        <h3>Messages</h3>
        <span class="close" @click="show(false)"></span>
      </div>
      <div class="chat-section-interface">
        <div class="messages" ref="messages">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message-item">
            <span>{{ message.from }}</span>
            <small>{{ message.time }}</small>
            <small v-if="message.private"> (private)</small>
            <p>{{ message.text }}</p>
          </div>
        </div>
        <div class="user-send">
          <select
            v-if="!!users"
            v-model="selectedUser"
          >
            <option
              v-for="(user, index) in users"
              :key="index"
              :value="user?.peerJsId"
            >{{ user?.name }}</option>
          </select>
          <textarea
            rows="3"
            v-model="text"
            placeholder="Enter message ..."
          ></textarea>
          <button :disabled="!text" @click="sendMessage">Send</button>
        </div>
      </div>
    </div>
    <div class="chat-module-back" @click="show(false)"></div>
  </div>
</template>

<script>
export default {
  name: "ChatModule",
  props: ['webrtc', 'runAction'],
  created() {
    this.setActionEventListener();
  },
  computed: {
    users() {
      let users = [{
        name: 'Everyone',
        peerJsId: null
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
  watch: {
    users(value) {
      let index = value.findIndex(x => x.peerJsId === this.selectedUser);

      if(index < 0) {
        this.selectedUser = null;
      }
    }
  },
  data() {
    return {
      text: null,
      dialog: false,
      room: null,
      messages: [],
      selectedUser: null,
      action: {
        name: 'chat',
        moderator: false,
        users: [],
        attributes: {
          message: '',
          sender: null,
          private: false,
        }
      }
    }
  },
  methods: {
    show(status = true) {
      this.dialog = status;

      if(status) {
        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
      }
    },
    open(room) {
      this.room = room;
      this.show();
    },
    sendMessage() {
      let action = { ...this.action};
      action.attributes.message = this.text;
      action.attributes.sender = this.webrtc.peerJsId;

      if(this.selectedUser) {
        action.attributes.private = true;
        action.users = [{
          peerJsId: this.selectedUser
        }];
      }

      this.webrtc.runAction(this.room.id, action);
      this.insertMessage('You', this.text, action.attributes.private);
      this.text = null;
    },
    setActionEventListener() {
      window.addEventListener('onChatAction-ReceivedMessage',
        this.receivedMessageAction);
    },
    receivedMessageAction(e) {
      let user = this.users.find(x => x.peerJsId === e.detail.sender);

      if(!user) {
        if(e.detail.sender === this.webrtc.peerJsId) {
          return;
        }

        user = {
          name: 'unknown'
        };
      }

      this.insertMessage(user.name, e.detail.message, e.detail.private);
    },
    getCurrentTime() {
      let date = new Date;
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let ampm = hours >= 12 ? 'pm' : 'am';

      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0'+minutes : minutes;

      return hours + ':' + minutes + ' ' + ampm;
    },
    insertMessage(name, message, privateType = false) {
      this.messages.push({
        from: name,
        text: message,
        time: this.getCurrentTime(),
        private: privateType
      });

      this.$nextTick(() => {
        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
      });
    }
  },
  unmounted() {
    window.removeEventListener('onChatAction-ReceivedMessage',
      this.receivedMessageAction);
  }
}
</script>

<style lang="scss">
#chat-module {
  .chat-section-heading {
    padding: 10px;
  }

  .chat-section-interface {
    display: flex;
    flex: auto;
    flex-direction: column;
    justify-content: space-between;
    overflow: auto;
    padding: 10px;

    .messages {
      overflow-x: hidden;
      overflow-y: scroll;

      .message-item {
        color: #333;
        margin: 10px 0;

        &:first-child {
          margin-top: 0;
        }

        span {
          font-size: .9em;
          margin-right: 15px;
          font-weight: bold;
        }
        small {
          color: #777;
          font-size: .8em;
        }
        p {

        }
      }
    }

    .user-send {
      position: relative;
      display: flex;
      flex-direction: column;

      select {
        position: absolute;
        right: 0;
        min-width: 60px;
        cursor: pointer;
        text-align: right;
        font-weight: bold;
        border: 0;
        background: none;
        appearance: none;
        outline: none;
      }

      textarea {
        padding: 5px;
        margin-top: 25px;
        margin-bottom: 10px;
      }

      button {
        @media screen and (max-width: 480px) {
          margin-bottom: 50px;
        }
      }
    }
  }

  .chat-module-box {
    position: fixed;
    flex-direction: column;
    display: flex;
    z-index: 999999;
    top: 0;
    right: 0;
    width: 350px;
    height: 100vh;
    background: #fff;
    border: 1px solid #ccc;
  }

  .chat-module-back {
    position: fixed;
    z-index: 999998;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    opacity: 0.6;
  }
}
</style>
