'use strict';

const React = require('react');
const DOM = React.DOM;

module.exports = React.createClass({
  displayName: 'Item',

  render: function () {
    return (
      <article className="tweet media" key={this.props.item.id}>
        <div className="tweet__avatar media__img">
          <img src={this.props.item.user.avatar} alt="User Avatar" />
        </div>
        <div className="media__body" dangerouslySetInnerHTML={{__html: this.props.item.getHTML()}} />
      </article>
    );
  }
});
