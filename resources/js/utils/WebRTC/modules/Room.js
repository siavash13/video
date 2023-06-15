module.exports = () => {

  const Room = {
    parent: null,
    information: null,
    videoRef: null,
    actions: [],
  };

  Room.setup = (parent, videoReference) => {
    this.parent = parent;
    this.videoRef = videoReference;
    this.actions = [];
  }

  /**
   * User Join to Room
   */
  Room.join = (roomId, userData) => {
    let data = Object.assign({ peerJsId: this.parent.peerJsId, }, userData)
    this.parent.socket.emit('join-room', roomId, data);
  }

  /**
   * User notify to server join room successfully
   */
  Room.notifyJoinSuccess = (roomId) => {
    this.parent.socket.emit('join-room-successfully', roomId, {
      peerJsId: this.parent.peerJsId
    });
  }

  /**
   * User Left the Room
   */
  Room.left = (roomId, userData = {}) => {
    this.parent.People.closeAll();
    this.parent.Media.release();
    this.parent.peerJs.destroy();

    let data = Object.assign({ peerJsId: this.parent.peerJsId, }, userData)

    this.parent.socket.emit('left-room', roomId, data, (data) => {
      this.parent.socket.close();
      this.parent.socket = null;
    });
  }

  Room.runRequestedAction = (action) => {
    let _actionName = action.name.toLowerCase();
    _actionName = _actionName.charAt(0).toUpperCase() + _actionName.slice(1);
    let index = this.actions.findIndex(x => x.name === _actionName);

    try {
      let actionItem;

      if(index > -1) {
        actionItem = this.actions[index].item;
      } else {
        actionItem = require('../actions/' + _actionName + 'Action')();
        this.actions.push({
          name: _actionName,
          item: actionItem
        });
      }

      actionItem.run(this.parent, action);
    } catch (error) {
      console.log('action run failed!');
      console.log(error);
    }
  }

  return Room;
}
