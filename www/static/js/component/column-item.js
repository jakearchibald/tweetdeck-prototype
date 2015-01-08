'use strict';

const React = require('react');
const utils = require('../lib/utils');

module.exports = React.createClass({
  displayName: 'Item',

  render() {
    return (
      <article className={this.props.item.heroImg ? "tweet-hero" : "tweet"} key={this.props.item.id}>
        {this.props.item.heroImg ?
          <div>
            <div className="tweet__hero-img" style={{backgroundImage: "url('" + this.props.item.heroImg + "')"}}></div>
            <div className="tweet__hero-overlay"></div>
          </div>
        :null}
        <div className="tweet__content">
          <h1 className="tweet__title">
            <img className="tweet__avatar" src={this.props.item.user.avatarBigger} alt="" />
            <span className="tweet__title-text">
              <span className="tweet__time--spacer">{utils.relativeTime(this.props.item.date.getTime())}</span>
              <span className="tweet__name-combo">
                <span className="tweet__name">{this.props.item.user.name} </span>
                <span className="tweet__username">@{this.props.item.user.screenName}</span>
              </span>
              <span className="tweet__time">{utils.relativeTime(this.props.item.date.getTime())}</span>
            </span>
          </h1>
          <div className="tweet__body" dangerouslySetInnerHTML={{__html: this.props.item.getHTML()}} />
          <div className="tweet__actions">
            <span className="tweet__rt-count">{this.props.item.retweetCount || ""}</span>
            <button className="tweet__rt-button" dangerouslySetInnerHTML={{__html:"<svg viewBox='0 0 42.7 24.9'><use xlink:href='static/imgs/sprite.svg#retweet'/></svg>"}}></button>
            <span className="tweet__fav-count">{this.props.item.favoriteCount || ""}</span>
            <button className="tweet__fav-button" dangerouslySetInnerHTML={{__html:"<svg viewBox='0 0 29.2 27.5'><use xlink:href='static/imgs/sprite.svg#fave'/></svg>"}}></button>
          </div>
        </div>
      </article>
    );
  }
});
