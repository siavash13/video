module.exports = () => {

  const Room = {
    parent: null,
    information: null,
    videoRef: null,
  };

  Room.setup = (parent, videoReference) => {
    this.parent = parent;
    this.videoRef = videoReference;
  }

  /**
   * User Join to Room
   */
  Room.join = (roomId, userData) => {
    let data = Object.assign({ peerJsId: this.parent.peerJsId, }, userData)

    this.parent.socket.emit('join-room', roomId, data);
    let videoRef = document.querySelector(this.videoRef);
    this.parent.Media.stream(videoRef, this.parent.Media.userMedia, true);
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

    try {
      const actionItem = require('../actions/' + _actionName + 'Action');
      actionItem().run(this.parent, action);
    } catch (error) {
      console.log('action not find!');
    }
  }

  return Room;
}
