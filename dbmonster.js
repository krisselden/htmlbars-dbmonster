/* global define: false */

define('dbmonster',
['dbmonster/template', 'dom-helper', 'htmlbars-runtime/hooks'],
function (templateSpec, domHelper, hooks) {
  function DBMonster(env, template) {
    this.env = env;
    this.template = template;
    this.result = undefined;
  }

  DBMonster.prototype = {
    render: function (dbs) {
      var result = this.template.render({
        dbs: dbs
      }, this.env);

      this.result = result;

      return result.fragment;
    },
    rerender: function (dbs) {
      this.result.rerender(this.env, {
        dbs: dbs
      });
    }
  };

  var helpers = {
    each: function (params) {
      var list = params[0];
      for (var i=0, l=list.length; i<l; i++) {
        var item = list[i];
        if (this.arity > 0) {
          this.yieldItem(item.key || item.name, [item]);
        }
      }
    }
  };

  var partials = {};

  var DOMHelper = domHelper['default'];

  var env = {
    dom: new DOMHelper(),
    hooks: hooks,
    helpers: helpers,
    partials: partials,
    useFragmentCache: true
  };

  var template = hooks.wrap(templateSpec);

  return new DBMonster(env, template);
});
