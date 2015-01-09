'use strict';

const React = require('react');
const ColumnItem = require('./column-item');
const cx = React.addons.classSet;

module.exports = React.createClass({
  displayName: 'Thread',

  getInitialState() {
    return {
      blurBg: false
    };
  },

  onScroll(event) {
    this.setState({
      blurBg: event.target.scrollTop > 100
    });
  },

  render() {
    const classes = cx({
      'thread': true,
      'thread--hero': this.props.item.heroImg,
      'blur-bg': this.state.blurBg
    });

    return <div className={classes} onScroll={this.onScroll}>
      <button className="unbutton thread__close-button" onClick={this.props.onClose}>
        <svg viewBox="0 0 34 34" dangerouslySetInnerHTML={{__html:"<use xlink:href='static/imgs/sprite.svg#x'/>"}}></svg>
      </button>
      <div className="root-tweet">
        <ColumnItem
          item={this.props.item}
          key={this.props.item.id}
          onFavorite={function(){}}
          onActivateTweet={function(){}}
          onRetweet={function(){}} />
      </div>
      <div className="thread__replies">
        <article className="tweet">
          <div className="tweet__content">
            <h1 className="tweet__title">
              <img className="tweet__avatar" src="https://pbs.twimg.com/profile_images/520827394379501568/-nr4H4-Y_bigger.jpeg" alt="" />
              <span className="tweet__title-text">
                <span className="tweet__time--spacer">3m</span>
                <span className="tweet__name-combo">
                  <span className="tweet__name">Michael Mathews </span>
                  <span className="tweet__username">@micmath</span>
                </span>
                <span className="tweet__time">3m</span>
              </span>
            </h1>
            <div className="tweet__body">Erik Meijer: "Agile must be destroyed, once and for all"  <a href="http://t.co/XCIAa4PVLA">buff.ly/1xNELDI</a></div>
          </div>
        </article>
        <article className="tweet">
          <div className="tweet__content">
            <h1 className="tweet__title">
              <img className="tweet__avatar" src="https://pbs.twimg.com/profile_images/520827394379501568/-nr4H4-Y_bigger.jpeg" alt="" />
              <span className="tweet__title-text">
                <span className="tweet__time--spacer">3m</span>
                <span className="tweet__name-combo">
                  <span className="tweet__name">Michael Mathews </span>
                  <span className="tweet__username">@micmath</span>
                </span>
                <span className="tweet__time">3m</span>
              </span>
            </h1>
            <div className="tweet__body">Erik Meijer: "Agile must be destroyed, once and for all"  <a href="http://t.co/XCIAa4PVLA">buff.ly/1xNELDI</a></div>
          </div>
        </article>
      </div>
    </div>
  }
});