'use strict';

const React = require('react');
const utils = require('../lib/utils');

module.exports = React.createClass({
  displayName: 'Item',

  render() {
    return (
      <article className="tweet media" key={this.props.item.id}>
        <h1 className="tweet__title">
          <img className="tweet__avatar" src={this.props.item.user.avatarBigger} alt="" />
          <span className="tweet__title-text">
            <span className="tweet__name">{this.props.item.user.name} </span>
            <span className="tweet__username">@{this.props.item.user.screenName} </span>
            <span className="tweet__time">{utils.relativeTime(this.props.item.date.getTime())}</span>
          </span>
        </h1>
        <div className="tweet__user">
        </div>
        <div className="tweet__body" dangerouslySetInnerHTML={{__html: this.props.item.getHTML()}} />
      </article>
    );
  }
});
