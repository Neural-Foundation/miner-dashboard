'use strict';

var Rickshaw = require('rickshaw'),
    _ = require('lodash'),
    timeHelper = require('../../handlebars/helpers/time');

module.exports = function (attributes, element, options) {
    return {
        graph: null,

        getSeries: function () {
            var self = this;

            return _.map(attributes, function (attr) {
                return _.extend({
                    color: '#cae2f7',
                    data: self.module.get('historicalData').map(function (measurement) {
                        return {
                            x: (measurement.timestamp / 1000),
                            y: measurement[attr.attr]
                        };
                    })
                }, attr);
            });
        },

        initializeGraph: function () {
            options.yFormatter = options.yFormatter.bind(this);

            this.graph = new Rickshaw.Graph({
                element: this.$(element)[0],
                height: 120,
                renderer: 'area',
                interpolation: 'linear',
                stroke: true,
                series: this.getSeries()
            });
            this.detail = new Rickshaw.Graph.HoverDetail(_.extend({
                graph: this.graph,
                xFormatter: function (value) {
                    return timeHelper(value * 1000);
                }.bind(this)
            }, options));
            this.xAxis = new Rickshaw.Graph.Axis.Time({
                graph: this.graph
            });
            this.yAxis = new Rickshaw.Graph.Axis.Y({
                graph: this.graph
            });
        },

        updateGraph: function () {
            var series = this.getSeries();

            this.graph.min = _(series).map(function (ser) {
                return _(ser.data).pluck('y').min().value();
            }).min().value() * 0.99;
            this.graph.max = _(series).map(function (ser) {
                return _(ser.data).pluck('y').max().value();
            }).max().value() * 1.01;
            _.each(this.graph.series, function (graphSeries, index) {
                graphSeries.data = series[index].data;
            });

            this.xAxis.render();
            this.yAxis.render();
            this.graph.update();
        },

        postRender: function () {
            var graphElement = this.$(element),
                graphShouldBeRendered = graphElement.length > 0 && this.module.get('historicalData');

            if (graphShouldBeRendered) {
                if (this.graph) {
                    graphElement.replaceWith(this.graph.element);
                } else {
                    this.initializeGraph();
                }
                this.updateGraph();
            }
        }
    };
};