var React = require('react');

module.exports = React.createClass({
  componentDidMount() {
    // TODO: This is yucky, get rid of it.
    this.refs.container.getDOMNode().classList.remove('closed');
  },

  render() {
    return (
      <div className="modal-overlay">
        <div className="modal-dialog closed" ref="container">
          {this.props.contentComponent}
        </div>
      </div>
    );
  }
});
