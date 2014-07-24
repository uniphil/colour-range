var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var husl = require('./husl');
var interp = require('./interpolate');


Backbone.$ = $;


var InterpolatorSetting = Backbone.Model.extend({
  defaults: {
    component: undefined,
    name: undefined,
    fnType: 'pow',  // 'pow' or 'skew'
    val: 1,
    min: 0,
    max: 2
  },
  getPow: function() {
    var frozenVal = this.get('val');
    return function Power(index) { return Math.pow(index, frozenVal); };
  }
});


var InterpolatorsSettings = Backbone.Collection.extend({
  model: InterpolatorSetting
})


var Ranger = Backbone.View.extend({
  className: 'control',
  model: InterpolatorSetting,
  template: _.template('<label for="<%= component %>"><%= name %>: <span class="val"><%= val %></span></label>' +
                       '<input id="<%= component %>" name="<%= component %>" min="<%= min %>" max="<%= max %>" value="<%= val %>"" type="range" step="0.05" />'),
  events: {
    'change input': 'changeInput',
  },
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    this.val = this.$('.val');
    return this;
  },
  changeInput: function(event) {
    this.model.set('val', +event.target.value);
    this.val.text(this.model.get('val'));
  }
});


var ControlsView = Backbone.View.extend({
  template: _.template('<label for="lights">Lights</label>' +
                       '<input id="lights" name="lights" type="range" max="255" value="255" />' +
                       '<div class="othercontrols"></div>'),
  events: {
    'change input#lights': 'setLights'
  },
  initialize: function() {
    this.collection = new InterpolatorsSettings([
      {
        component: 'hue',
        name: 'Hue Skew',
        fnType: 'skew',
        val: 0,
        min: -1,
        max: 1
      },
      {
        component: 'sat',
        name: 'Saturation',
        fnType: 'level',
        val: 0.8,
        min: 0,
        max: 1
      },
      {
        component: 'val',
        name: 'Value Power',
        fnType: 'pow',
        val: 1,
        min: 0,
        max: 2.5
      }
    ]);
    this.rangers = this.collection.map(function(interpolator) {
      return new Ranger({model: interpolator});
    });
  },
  render: function() {
    this.$el.html(this.template());
    this.$el.append(_.map(this.rangers, function(ranger) { return ranger.render().el; }));
    return this;
  },
  setLights: function(e) {
    var l = e.target.value;
    $('body').css({background: 'rgb(' + l + ',' + l + ',' + l +')'});
  }
});


var Demoer = Backbone.View.extend({
  className: 'demoer',
  template: _.template('<% _.each(colours, function(colour) { %>' +
                       '  <div class="colour" style="background: <%= colour %>"></div>' +
                       '<% }); %>'),
  initialize: function(options) {
    var hue = Math.random();
    this.range = [[hue, 0.8, 0.3],
                  [hue, 0.8, 0.9]];
    this.interpolator = interp(this.range);
    this.listenTo(options.interps, 'change:val', this.interpUpdate);
  },
  render: function() {
    var colours = _.map(_.range(8), function(n) {
      var i = n / 7;  // 0..1, inclusive
      var raw = this.interpolator(i);
      return husl.toHex(raw[0]*360, raw[1]*100, raw[2]*100);
    }, this);
    this.$el.html(this.template({colours: colours}));
    return this;
  },
  interpUpdate: function(interpSetting, val) {
    if (interpSetting.get('fnType') === 'pow') {
      this.interpolator[interpSetting.get('component')](interpSetting.getPow());
    } else if (interpSetting.get('fnType') === 'skew') {
      this.range[1][0] = this.range[0][0] + val;
      this.interpolator.range(this.range);
    } else {
      this.range[0][1] = this.range[1][1] = val;
      this.interpolator.range(this.range);
    }
    this.render();
  }
});


var Demoers = Backbone.View.extend({
  initialize: function(options) {
    var numSamples = 72;
    this.demoers = _.map(_.range(numSamples), function(n) {
      return new Demoer({
        interps: this.collection,
        hue: n / numSamples
      });
    }, this);
  },
  render: function() {
    this.$el.html(_.map(this.demoers, function(demoer) { return demoer.render().el; }));
    return this;
  }
})


window.controls = (new ControlsView({el: '#controls'})).render();
window.demoers = (new Demoers({el: '#demos', collection: controls.collection})).render();

