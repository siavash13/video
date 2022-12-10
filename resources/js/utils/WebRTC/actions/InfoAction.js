module.exports = () => {

  const action = {};

  action.run = (parent, data) => {
    console.log(data);
    console.log('test connected?!');
  }

  return action;
}
