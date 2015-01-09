var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

jest.dontMock('../column-item');

describe('ColumnItem', function () {
  var ColumnItem = require('../column-item');
  var itemData = {
    user: {
      name: 'Taylor Swift',
      screenName: 'taylorswift13'
    },
    source: {
      favorited: false,
      retweeted: false
    },
    id: 1337,
    date: new Date(1420565760748),
    getHTML() {
      return '<b>shake</b> it off.';
    }
  };

  it('renders', function () {
    var favCb = jest.genMockFn();
    var rtCb = jest.genMockFn();
    var item = TestUtils.renderIntoDocument(
      <ColumnItem item={itemData} onFavorite={favCb} onRetweet={rtCb} />
    );
    var username = TestUtils.findRenderedDOMComponentWithClass(
      item, 'tweet__username');
    expect(username.getDOMNode().textContent.trim()).toEqual('@taylorswift13');
  });

  it('calls to favorite callback', function () {
    var favCb = jest.genMockFn();
    var rtCb = jest.genMockFn();
    var item = TestUtils.renderIntoDocument(
      <ColumnItem item={itemData} onFavorite={favCb} onRetweet={rtCb} />
    );
    var fav = TestUtils.findRenderedDOMComponentWithClass(
      item, 'tweet__fav-button');

    expect(favCb).not.toBeCalled();
    TestUtils.Simulate.click(fav);
    expect(favCb).toBeCalled();
  });

  it('calls to retweet callback', function () {
    var favCb = jest.genMockFn();
    var rtCb = jest.genMockFn();
    var item = TestUtils.renderIntoDocument(
      <ColumnItem item={itemData} onFavorite={favCb} onRetweet={rtCb} />
    );
    var fav = TestUtils.findRenderedDOMComponentWithClass(
      item, 'tweet__rt-button');

    expect(rtCb).not.toBeCalled();
    TestUtils.Simulate.click(fav);
    expect(rtCb).toBeCalled();
  });
});
