var columnTitles = {
  'home': {title: 'Home'},
  'usertimeline': {title: 'Home'},
  'interactions': {title: 'Notifications'},
  'mentions': {title: 'Mentions'},
  'search': {},
  'list': {},
  'direct': {title:'Messages'},
  'usertweets': 'User',
  'favorites': {title: 'Favorites'},
  'networkactivity': {title: 'Activity'},
  'scheduled': {title: 'Scheduled'},
  'dataminr': {}
};

module.exports.getTitle = function getTitle(feedtype) {
  return columnTitles[feedtype].title;
};