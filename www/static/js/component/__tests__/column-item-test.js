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
    id: 1337,
    date: new Date(1420565760748),
    getHTML: function () {
      return "<b>hello</b> world"
    }
  };

  it('renders', function () {
    var item = TestUtils.renderIntoDocument(
      <ColumnItem item={itemData} />
    );
    var username = TestUtils.findRenderedDOMComponentWithClass(
      item, 'tweet__username');
    expect(username.getDOMNode().textContent.trim()).toEqual('@taylorswift13');
  });
});
