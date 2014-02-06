'use strict';

var EventEmitter = require('eventemitter2').EventEmitter2,

    _ = require('lodash'),

    Module;

Module = function (app, config) {
    config = config || {};

    EventEmitter.call(this, {
        wildcard: true,
        delimiter: ':'
    });

    this.app = app;
    this.id = config.id;
    this.config = _.extend({}, this.defaults, _.omit(config, 'id'));
    this.initialize();
};

_.extend(Module.prototype, _.omit(EventEmitter.prototype, 'constructor'));

Module.extend = function (extended) {
    var child = function () { return Module.apply(this, arguments); };
    _.extend(child.prototype, _.omit(Module.prototype, 'constructor'), extended);
    return child;
};

Module.prototype.template = 'json';

Module.prototype.initialize = function () {};

Module.prototype.updateData = function (data) {
    this.data = data;
    this.emit('update:data', data);
};

module.exports = Module;