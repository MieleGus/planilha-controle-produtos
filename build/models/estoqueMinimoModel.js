"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var schema = new Schema({
  codigo: {
    type: String,
    required: false
  },
  quantidade: {
    type: Number,
    required: false
  }
});

var _default = mongoose.model('estoque_minimos', schema);

exports["default"] = _default;