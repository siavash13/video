module.exports = () => {

  const People = {
    parent: null,
    connections: null,
    usersReference: null,
  }

  People.setup = (parent, connections, usersReference) => {
    this.parent = parent;
    this.connections = connections;
    this.usersReference = usersReference;
  }

  /**
   * Add peer js user connection
   */
  People.add = async (call, data = false) => {
    let index = this.connections.findIndex(x => x.id === call.peer);

    if (index === -1) {
      let userIndex = this.parent.Room.information.users.findIndex(x => x.peerJsId === call.peer);

      let count = this.connections.push({
        id: call.peer,
        peerJsId: call.peer,
        call: call,
        active: true,
        name: ((userIndex !== -1)? this.parent.Room.information.users[userIndex].name : ''),
        isCreator: ((userIndex !== -1)? this.parent.Room.information.users[userIndex].roomCreator : false),
      });

      if (data) {
        this.connections[(count - 1)].name = data.name;
        this.connections[(count - 1)].isCreator = data.roomCreator;
      }

      call.on('stream', peerVideoStream => {
        let peerRef = document.querySelector(this.usersReference+'-'+call.peer);
        this.parent.Media.stream(peerRef, peerVideoStream);
      });

      return (count - 1);
    }

    return index;
  }

  People.remove = (data) => {
    let index = this.connections.findIndex(x => x.peerJsId === data.peerJsId);

    if (index > -1) {
      this.connections[index].call.close();
      this.connections.splice(index, 1);
    }
  }

  People.closeAll = () => {
    this.connections.forEach((connection) => {
      connection.call.close();
    });

    this.connections = [];
  }

  People.getConnections = () => {
    return this.connections;
  }

  return People;
}
