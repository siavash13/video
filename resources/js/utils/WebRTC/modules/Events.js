module.exports = () => {

  const Events = {
    parent: null,
    socket: null,
  };

  Events.setup = (parent) => {
    this.parent = parent;
    this.socket = this.parent.socket;
  }

  Events.listen = () => {
    this.socket.on('user-connected', (data) => {
      this.parent.connectToNewUser(data);
      this.parent.callbackAction('joinRoom', data, 'user join room.');
    });

    this.socket.on('room-information', (data) => {
      this.parent.Room.information = data;

      let index = data.users.findIndex(x => x.peerJsId === this.parent.peerJsId);

      if(data.users[index].roomCreator) {
        this.parent.userSettings['isCreator'] = true;
      }
    });

    this.socket.on('user-left-room', (data) => {
      this.parent.People.remove(data);
      this.parent.callbackAction('leftRoom', data, 'user left room.');
    });

    this.socket.on('room-id-invalid', () => {
      this.parent.callbackAction('invalidRoom', {}, 'room id is invalid!');
    });

    this.socket.on('run-action', (action) => {
      this.parent.Room.runRequestedAction(action);
    });

    this.socket.on('successfully-run-action', (action) => {
      console.log('Action run successfully!');
      console.log(action);
    });

    this.socket.on('failed-run-action', (action) => {
      console.log('Action failed to run!');
      console.log(action);
    });

    this.socket.on('you-are-ban', (data) => {
      this.parent.callbackAction('banInRoom', data, 'you are ban!!!');
    });

    this.socket.on('info-room-data', (data) => {
      console.log(data);
    });
  }

  return Events;

}
