'use strict';

const React = require('react');

module.exports = React.createClass({
  displayName: 'Item',

  render() {
    return (
      <article className="tweet media" key={this.props.item.id}>
        <div className="tweet__avatar media__img">
          <img src={this.props.item.user.avatarBigger} alt="" />
        </div>
        <div className="tweet__user">
          <span className="tweet__user__name">{this.props.item.user.name} </span>
          <span className="tweet__user__username">@{this.props.item.user.screenName}</span>
        </div>
        <div className="media__body" dangerouslySetInnerHTML={{__html: this.props.item.getHTML()}} />
      </article>
    );
  }
});
