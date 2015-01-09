'use strict';

module.exports = {
  byDate(a, b) {
    return b.date - a.date;
  },

  byCreatedAtAsc(a, b) {
    return (new Date(a.created_at).getTime()) - (new Date(b.created_at).getTime());
  },

  byCreatedAtDesc(a, b) {
    return (new Date(b.created_at).getTime()) - (new Date(a.created_at).getTime());
  }
};
