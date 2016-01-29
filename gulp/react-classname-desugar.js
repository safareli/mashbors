import React from 'react';
import R from 'ramda';
import expand from 'brace-expansion';

const createElement = React.createElement
const desugar = R.compose(R.join(' '), R.flatten, R.map(expand), R.split(' '))

// monkeypatch React
React.createElement = function(el, opts, ...args) {
  var params = Array.prototype.slice.call(arguments)
  if (opts && opts.className) {
    params = [el, R.assoc('className',desugar(opts.className),opts), ...args]
  }
  return createElement.apply(this, params);
};


module.exports = desugar;
