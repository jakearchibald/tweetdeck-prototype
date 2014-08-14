function User(data) {
  this.screenName = data.screenName;
  this.id = data.id;
  this.session = data.session;
}

module.exports = User;