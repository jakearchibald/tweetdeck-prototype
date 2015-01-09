'use strict';

const React = require('react');
const cx = React.addons.classSet;
const utils = require('../lib/utils');

module.exports = React.createClass({
  displayName: 'Item',

  onTweetClick({target}) {
    // ignore taps on interactive elements
    if (utils.closest(target, 'button, a, input')) return;
  },

  propTypes: {
    item: React.PropTypes.object.isRequired,
    onFavorite: React.PropTypes.func.isRequired,
    onRetweet: React.PropTypes.func.isRequired
  },

  shouldComponentUpdate(nextProps, nextState) {
    return (this.props.item.source !== nextProps.item.source);
  },

  onFavorite() {
    if (!this.props.item.favorited) {
      this.props.onFavorite(this.props.item);
    }
  },

  onRetweet() {
    if (!this.props.item.retweeted) {
      this.props.onRetweet(this.props.item);
    }
  },

  render() {
    const classes = cx({
      'tweet--hero': this.props.item.heroImg,
      'tweet': !this.props.item.heroImg,
      'tweet--favorited': this.props.item.source.favorited,
      'tweet--retweeted': this.props.item.source.retweeted
    });
    return (
      <article onClick={this.onTweetClick} className={classes} key={this.props.item.id}>
        {this.props.item.heroImg ?
          <div>
            <div className="tweet__hero-img" style={{backgroundImage: "url('" + this.props.item.heroImg + "')"}}></div>
            <div className="tweet__hero-overlay"></div>
          </div>
        :null}
        {this.props.item.retweetedBy ?
          <div className="tweet__retweet">{this.props.item.retweetedBy.name} retweeted</div>
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
            <button onClick={this.onRetweet} className="tweet__rt-button" dangerouslySetInnerHTML={{__html:"<svg viewBox='0 0 42.7 24.9'><use xlink:href='static/imgs/sprite.svg#retweet'/></svg>"}}></button>
            <span className="tweet__fav-count">{this.props.item.favoriteCount || ""}</span>
            <button onClick={this.onFavorite} className="tweet__fav-button" dangerouslySetInnerHTML={{__html:"<svg viewBox='0 0 29.2 27.5'><use xlink:href='static/imgs/sprite.svg#fave'/></svg>"}}></button>
          </div>
        </div>
      </article>
    );
  }
});
