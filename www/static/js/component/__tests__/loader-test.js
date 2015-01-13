'use strict';

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

jest.dontMock('../loader');

describe('Loader', function () {
  var Loader = require('../loader');

  it('renders a button with loading=false', function () {
    var item = TestUtils.renderIntoDocument(
      <Loader loading={false} />
    );
    var button = TestUtils.findRenderedDOMComponentWithClass(
      item, 'column-loader-button');
    expect(button.getDOMNode().textContent.trim()).toBe('More Tweets please!');
  });

  it('renders a spinner with loading=true', function () {
    var item = TestUtils.renderIntoDocument(
      <Loader loading={true} />
    );
    // Throws if it cannot find the node.
    TestUtils.findRenderedDOMComponentWithClass(item, 'column-loader-spinner');
  });
});
