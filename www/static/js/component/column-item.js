'use strict';

const React = require('react');

module.exports = React.createClass({
  displayName: 'Item',

  render() {
    return (
      <article className="tweet media" key={this.props.item.id}>
        <div className="tweet__avatar media__img">
          <img src={this.props.item.user.avatar} alt="User Avatar" srcSet={this.props.item.user.avatarBigger + " 2x"} />
        </div>
        <div className="media__body" dangerouslySetInnerHTML={{__html: this.props.item.getHTML()}} />
      </article>
    );
  }
});
