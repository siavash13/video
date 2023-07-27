module.exports = () => {

  const People = {
    parent: null,
    connections: null,
    options: null,
  }

  People.setup = (parent, connections, options) => {
    this.parent = parent;
    this.connections = connections;
    this.options = options;
  }

  /**
   * Add peer js user connection
   */
  People.add = async (mediaConnection, dataConnection, data = false) => {
    let index = this.connections.findIndex(x => x.id === mediaConnection.peer);

    if (index === -1) {
      let userIndex = this.parent.Room.information.users.findIndex(x => x.peerJsId === mediaConnection.peer);

      let count = this.connections.push({
        id: mediaConnection.peer,
        peerJsId: mediaConnection.peer,
        mediaConnection: mediaConnection,
        dataConnection: dataConnection,
        active: false,
        camMute: true,
        micMute: true,
        name: ((userIndex !== -1)? this.parent.Room.information.users[userIndex].name : ''),
        isCreator: ((userIndex !== -1)? this.parent.Room.information.users[userIndex].roomCreator : false),
      });

      if (data) {
        this.connections[(count - 1)].name = data.name;
        this.connections[(count - 1)].isCreator = data.roomCreator;
      }

      dataConnection.on('open', () => {
        dataConnection.send({
          event: 'muteMedia',
          camMute: this.parent.userSettings.camDisable,
          micMute: this.parent.userSettings.micDisable
        });
      });

      mediaConnection.on('stream', peerVideoStream => {
        this.parent.Media.streamVideo(mediaConnection.peer, peerVideoStream);
        this.parent.Media.streamAudio(mediaConnection.peer, peerVideoStream);
        this.connections[(count - 1)].active = true;
      });

      return (count - 1);
    }

    return index;
  }

  People.remove = (data) => {
    let index = this.connections.findIndex(x => x.peerJsId === data.peerJsId);

    if (index > -1) {
      this.connections[index].mediaConnection.close();
      this.connections[index].dataConnection.close();
      this.connections.splice(index, 1);
    }
  }

  People.closeAll = () => {
    this.connections.forEach((connection) => {
      connection.mediaConnection.close();
      connection.dataConnection.close();
    });

    this.connections = [];
  }

  People.getConnections = () => {
    return this.connections;
  }

  return People;
}
