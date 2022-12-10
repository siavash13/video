module.exports = () => {

  const action = {};

  action.run = (parent, data) => {
    alert(data.attributes.message || '');
  }

  return action;
}
