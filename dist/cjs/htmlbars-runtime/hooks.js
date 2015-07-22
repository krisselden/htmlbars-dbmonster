exports.__esModule = true;
exports.wrap = wrap;
exports.wrapForHelper = wrapForHelper;
exports.hostYieldWithShadowTemplate = hostYieldWithShadowTemplate;
exports.createScope = createScope;
exports.createFreshScope = createFreshScope;
exports.bindShadowScope = bindShadowScope;
exports.createChildScope = createChildScope;
exports.bindSelf = bindSelf;
exports.updateSelf = updateSelf;
exports.bindLocal = bindLocal;
exports.updateLocal = updateLocal;
exports.bindBlock = bindBlock;
exports.block = block;
exports.continueBlock = continueBlock;
exports.hostBlock = hostBlock;
exports.handleRedirect = handleRedirect;
exports.handleKeyword = handleKeyword;
exports.linkRenderNode = linkRenderNode;
exports.inline = inline;
exports.keyword = keyword;
exports.invokeHelper = invokeHelper;
exports.classify = classify;
exports.partial = partial;
exports.range = range;
exports.element = element;
exports.attribute = attribute;
exports.subexpr = subexpr;
exports.get = get;
exports.getRoot = getRoot;
exports.getChild = getChild;
exports.getValue = getValue;
exports.getCellOrValue = getCellOrValue;
exports.component = component;
exports.concat = concat;
exports.hasHelper = hasHelper;
exports.lookupHelper = lookupHelper;
exports.bindScope = bindScope;
exports.updateScope = updateScope;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _render = require("./render");

var _render2 = _interopRequireDefault(_render);

var _morphRangeMorphList = require("../morph-range/morph-list");

var _morphRangeMorphList2 = _interopRequireDefault(_morphRangeMorphList);

var _htmlbarsUtilObjectUtils = require("../htmlbars-util/object-utils");

var _htmlbarsUtilMorphUtils = require("../htmlbars-util/morph-utils");

var _htmlbarsUtilTemplateUtils = require("../htmlbars-util/template-utils");

/**
  HTMLBars delegates the runtime behavior of a template to
  hooks provided by the host environment. These hooks explain
  the lexical environment of a Handlebars template, the internal
  representation of references, and the interaction between an
  HTMLBars template and the DOM it is managing.

  While HTMLBars host hooks have access to all of this internal
  machinery, templates and helpers have access to the abstraction
  provided by the host hooks.

  ## The Lexical Environment

  The default lexical environment of an HTMLBars template includes:

  * Any local variables, provided by *block arguments*
  * The current value of `self`

  ## Simple Nesting

  Let's look at a simple template with a nested block:

  ```hbs
  <h1>{{title}}</h1>

  {{#if author}}
    <p class="byline">{{author}}</p>
  {{/if}}
  ```

  In this case, the lexical environment at the top-level of the
  template does not change inside of the `if` block. This is
  achieved via an implementation of `if` that looks like this:

  ```js
  registerHelper('if', function(params) {
    if (!!params[0]) {
      return this.yield();
    }
  });
  ```

  A call to `this.yield` invokes the child template using the
  current lexical environment.

  ## Block Arguments

  It is possible for nested blocks to introduce new local
  variables:

  ```hbs
  {{#count-calls as |i|}}
  <h1>{{title}}</h1>
  <p>Called {{i}} times</p>
  {{/count}}
  ```

  In this example, the child block inherits its surrounding
  lexical environment, but augments it with a single new
  variable binding.

  The implementation of `count-calls` supplies the value of
  `i`, but does not otherwise alter the environment:

  ```js
  var count = 0;
  registerHelper('count-calls', function() {
    return this.yield([ ++count ]);
  });
  ```
*/

function wrap(template) {
  if (template === null) {
    return null;
  }

  return {
    meta: template.meta,
    arity: template.arity,
    raw: template,
    render: function (self, env, options, blockArguments) {
      var scope = env.hooks.createFreshScope();

      options = options || {};
      options.self = self;
      options.blockArguments = blockArguments;

      return _render2.default(template, env, scope, options);
    }
  };
}

function wrapForHelper(template, env, scope, morph, renderState, visitor) {
  if (!template) {
    return {
      yieldIn: yieldInShadowTemplate(null, env, scope, morph, renderState, visitor)
    };
  }

  var yieldArgs = yieldTemplate(template, env, scope, morph, renderState, visitor);

  return {
    meta: template.meta,
    arity: template.arity,
    yield: yieldArgs,
    yieldItem: yieldItem(template, env, scope, morph, renderState, visitor),
    yieldIn: yieldInShadowTemplate(template, env, scope, morph, renderState, visitor),
    raw: template,

    render: function (self, blockArguments) {
      yieldArgs(blockArguments, self);
    }
  };
}

// Called by a user-land helper to render a template.
function yieldTemplate(template, env, parentScope, morph, renderState, visitor) {
  return function (blockArguments, self) {
    // Render state is used to track the progress of the helper (since it
    // may call into us multiple times). As the user-land helper calls
    // into library code, we track what needs to be cleaned up after the
    // helper has returned.
    //
    // Here, we remember that a template has been yielded and so we do not
    // need to remove the previous template. (If no template is yielded
    // this render by the helper, we assume nothing should be shown and
    // remove any previous rendered templates.)
    renderState.morphToClear = null;

    // In this conditional is true, it means that on the previous rendering pass
    // the helper yielded multiple items via `yieldItem()`, but this time they
    // are yielding a single template. In that case, we mark the morph list for
    // cleanup so it is removed from the DOM.
    if (morph.morphList) {
      _htmlbarsUtilTemplateUtils.clearMorphList(morph.morphList, morph, env);
      renderState.morphListToClear = null;
    }

    var scope = parentScope;

    if (morph.lastYielded && isStableTemplate(template, morph.lastYielded)) {
      return morph.lastResult.revalidateWith(env, undefined, self, blockArguments, visitor);
    }

    // Check to make sure that we actually **need** a new scope, and can't
    // share the parent scope. Note that we need to move this check into
    // a host hook, because the host's notion of scope may require a new
    // scope in more cases than the ones we can determine statically.
    if (self !== undefined || parentScope === null || template.arity) {
      scope = env.hooks.createChildScope(parentScope);
    }

    morph.lastYielded = { self: self, template: template, shadowTemplate: null };

    // Render the template that was selected by the helper
    _render2.default(template, env, scope, { renderNode: morph, self: self, blockArguments: blockArguments });
  };
}

function yieldItem(template, env, parentScope, morph, renderState, visitor) {
  // Initialize state that tracks multiple items being
  // yielded in.
  var currentMorph = null;

  // Candidate morphs for deletion.
  var candidates = {};

  // Reuse existing MorphList if this is not a first-time
  // render.
  var morphList = morph.morphList;
  if (morphList) {
    currentMorph = morphList.firstChildMorph;
  }

  // Advances the currentMorph pointer to the morph in the previously-rendered
  // list that matches the yielded key. While doing so, it marks any morphs
  // that it advances past as candidates for deletion. Assuming those morphs
  // are not yielded in later, they will be removed in the prune step during
  // cleanup.
  // Note that this helper function assumes that the morph being seeked to is
  // guaranteed to exist in the previous MorphList; if this is called and the
  // morph does not exist, it will result in an infinite loop
  function advanceToKey(key) {
    var seek = currentMorph;

    while (seek.key !== key) {
      candidates[seek.key] = seek;
      seek = seek.nextMorph;
    }

    currentMorph = seek.nextMorph;
    return seek;
  }

  return function (_key, blockArguments, self) {
    if (typeof _key !== 'string') {
      throw new Error("You must provide a string key when calling `yieldItem`; you provided " + _key);
    }

    // At least one item has been yielded, so we do not wholesale
    // clear the last MorphList but instead apply a prune operation.
    renderState.morphListToClear = null;
    morph.lastYielded = null;

    var morphList, morphMap;

    if (!morph.morphList) {
      morph.morphList = new _morphRangeMorphList2.default();
      morph.morphMap = {};
      morph.setMorphList(morph.morphList);
    }

    morphList = morph.morphList;
    morphMap = morph.morphMap;

    // A map of morphs that have been yielded in on this
    // rendering pass. Any morphs that do not make it into
    // this list will be pruned from the MorphList during the cleanup
    // process.
    var handledMorphs = renderState.handledMorphs;
    var key = undefined;

    if (handledMorphs[_key]) {
      var collisions = renderState.collisions;
      if (collisions === undefined) {
        collisions = renderState.collisions = {};
      }
      var count = collisions[_key] | 0;
      collisions[_key] = ++count;
      key = _key + '-11c3fd46-300c-11e5-932c-5cf9388a6f6c-' + count;
    } else {
      key = _key;
    }

    if (currentMorph && currentMorph.key === key) {
      yieldTemplate(template, env, parentScope, currentMorph, renderState, visitor)(blockArguments, self);
      currentMorph = currentMorph.nextMorph;
      handledMorphs[key] = currentMorph;
    } else if (morphMap[key] !== undefined) {
      var foundMorph = morphMap[key];

      if (key in candidates) {
        // If we already saw this morph, move it forward to this position
        morphList.insertBeforeMorph(foundMorph, currentMorph);
      } else {
        // Otherwise, move the pointer forward to the existing morph for this key
        advanceToKey(key);
      }

      handledMorphs[foundMorph.key] = foundMorph;
      yieldTemplate(template, env, parentScope, foundMorph, renderState, visitor)(blockArguments, self);
    } else {
      var childMorph = _render.createChildMorph(env.dom, morph);
      childMorph.key = key;
      morphMap[key] = handledMorphs[key] = childMorph;
      morphList.insertBeforeMorph(childMorph, currentMorph);
      yieldTemplate(template, env, parentScope, childMorph, renderState, visitor)(blockArguments, self);
    }

    renderState.morphListToPrune = morphList;
    morph.childNodes = null;
  };
}

function isStableTemplate(template, lastYielded) {
  return !lastYielded.shadowTemplate && template === lastYielded.template;
}

function yieldInShadowTemplate(template, env, parentScope, morph, renderState, visitor) {
  var hostYield = hostYieldWithShadowTemplate(template, env, parentScope, morph, renderState, visitor);

  return function (shadowTemplate, self) {
    hostYield(shadowTemplate, env, self, []);
  };
}

function hostYieldWithShadowTemplate(template, env, parentScope, morph, renderState, visitor) {
  return function (shadowTemplate, env, self, blockArguments) {
    renderState.morphToClear = null;

    if (morph.lastYielded && isStableShadowRoot(template, shadowTemplate, morph.lastYielded)) {
      return morph.lastResult.revalidateWith(env, undefined, self, blockArguments, visitor);
    }

    var shadowScope = env.hooks.createFreshScope();
    env.hooks.bindShadowScope(env, parentScope, shadowScope, renderState.shadowOptions);
    blockToYield.arity = template.arity;
    env.hooks.bindBlock(env, shadowScope, blockToYield);

    morph.lastYielded = { self: self, template: template, shadowTemplate: shadowTemplate };

    // Render the shadow template with the block available
    _render2.default(shadowTemplate.raw, env, shadowScope, { renderNode: morph, self: self, blockArguments: blockArguments });
  };

  function blockToYield(env, blockArguments, self, renderNode, shadowParent, visitor) {
    if (renderNode.lastResult) {
      renderNode.lastResult.revalidateWith(env, undefined, undefined, blockArguments, visitor);
    } else {
      var scope = parentScope;

      // Since a yielded template shares a `self` with its original context,
      // we only need to create a new scope if the template has block parameters
      if (template.arity) {
        scope = env.hooks.createChildScope(parentScope);
      }

      _render2.default(template, env, scope, { renderNode: renderNode, self: self, blockArguments: blockArguments });
    }
  }
}

function isStableShadowRoot(template, shadowTemplate, lastYielded) {
  return template === lastYielded.template && shadowTemplate === lastYielded.shadowTemplate;
}

function optionsFor(template, inverse, env, scope, morph, visitor) {
  // If there was a template yielded last time, set morphToClear so it will be cleared
  // if no template is yielded on this render.
  var morphToClear = morph.lastResult ? morph : null;
  var renderState = new _htmlbarsUtilTemplateUtils.RenderState(morphToClear, morph.morphList || null);

  return {
    templates: {
      template: wrapForHelper(template, env, scope, morph, renderState, visitor),
      inverse: wrapForHelper(inverse, env, scope, morph, renderState, visitor)
    },
    renderState: renderState
  };
}

function thisFor(options) {
  return {
    arity: options.template.arity,
    yield: options.template.yield,
    yieldItem: options.template.yieldItem,
    yieldIn: options.template.yieldIn
  };
}

/**
  Host Hook: createScope

  @param {Scope?} parentScope
  @return Scope

  Corresponds to entering a new HTMLBars block.

  This hook is invoked when a block is entered with
  a new `self` or additional local variables.

  When invoked for a top-level template, the
  `parentScope` is `null`, and this hook should return
  a fresh Scope.

  When invoked for a child template, the `parentScope`
  is the scope for the parent environment.

  Note that the `Scope` is an opaque value that is
  passed to other host hooks. For example, the `get`
  hook uses the scope to retrieve a value for a given
  scope and variable name.
*/

function createScope(env, parentScope) {
  if (parentScope) {
    return env.hooks.createChildScope(parentScope);
  } else {
    return env.hooks.createFreshScope();
  }
}

function createFreshScope() {
  // because `in` checks have unpredictable performance, keep a
  // separate dictionary to track whether a local was bound.
  // See `bindLocal` for more information.
  return { self: null, blocks: {}, locals: {}, localPresent: {} };
}

/**
  Host Hook: bindShadowScope

  @param {Scope?} parentScope
  @return Scope

  Corresponds to rendering a new template into an existing
  render tree, but with a new top-level lexical scope. This
  template is called the "shadow root".

  If a shadow template invokes `{{yield}}`, it will render
  the block provided to the shadow root in the original
  lexical scope.

  ```hbs
  {{!-- post template --}}
  <p>{{props.title}}</p>
  {{yield}}

  {{!-- blog template --}}
  {{#post title="Hello world"}}
    <p>by {{byline}}</p>
    <article>This is my first post</article>
  {{/post}}

  {{#post title="Goodbye world"}}
    <p>by {{byline}}</p>
    <article>This is my last post</article>
  {{/post}}
  ```

  ```js
  helpers.post = function(params, hash, options) {
    options.template.yieldIn(postTemplate, { props: hash });
  };

  blog.render({ byline: "Yehuda Katz" });
  ```

  Produces:

  ```html
  <p>Hello world</p>
  <p>by Yehuda Katz</p>
  <article>This is my first post</article>

  <p>Goodbye world</p>
  <p>by Yehuda Katz</p>
  <article>This is my last post</article>
  ```

  In short, `yieldIn` creates a new top-level scope for the
  provided template and renders it, making the original block
  available to `{{yield}}` in that template.
*/

function bindShadowScope(env /*, parentScope, shadowScope */) {
  return env.hooks.createFreshScope();
}

function createChildScope(parent) {
  var scope = Object.create(parent);
  scope.locals = Object.create(parent.locals);
  return scope;
}

/**
  Host Hook: bindSelf

  @param {Scope} scope
  @param {any} self

  Corresponds to entering a template.

  This hook is invoked when the `self` value for a scope is ready to be bound.

  The host must ensure that child scopes reflect the change to the `self` in
  future calls to the `get` hook.
*/

function bindSelf(env, scope, self) {
  scope.self = self;
}

function updateSelf(env, scope, self) {
  env.hooks.bindSelf(env, scope, self);
}

/**
  Host Hook: bindLocal

  @param {Environment} env
  @param {Scope} scope
  @param {String} name
  @param {any} value

  Corresponds to entering a template with block arguments.

  This hook is invoked when a local variable for a scope has been provided.

  The host must ensure that child scopes reflect the change in future calls
  to the `get` hook.
*/

function bindLocal(env, scope, name, value) {
  scope.localPresent[name] = true;
  scope.locals[name] = value;
}

function updateLocal(env, scope, name, value) {
  env.hooks.bindLocal(env, scope, name, value);
}

/**
  Host Hook: bindBlock

  @param {Environment} env
  @param {Scope} scope
  @param {Function} block

  Corresponds to entering a shadow template that was invoked by a block helper with
  `yieldIn`.

  This hook is invoked with an opaque block that will be passed along
  to the shadow template, and inserted into the shadow template when
  `{{yield}}` is used. Optionally provide a non-default block name
  that can be targeted by `{{yield to=blockName}}`.
*/

function bindBlock(env, scope, block) {
  var name = arguments.length <= 3 || arguments[3] === undefined ? 'default' : arguments[3];

  scope.blocks[name] = block;
}

/**
  Host Hook: block

  @param {RenderNode} renderNode
  @param {Environment} env
  @param {Scope} scope
  @param {String} path
  @param {Array} params
  @param {Object} hash
  @param {Block} block
  @param {Block} elseBlock

  Corresponds to:

  ```hbs
  {{#helper param1 param2 key1=val1 key2=val2}}
    {{!-- child template --}}
  {{/helper}}
  ```

  This host hook is a workhorse of the system. It is invoked
  whenever a block is encountered, and is responsible for
  resolving the helper to call, and then invoke it.

  The helper should be invoked with:

  - `{Array} params`: the parameters passed to the helper
    in the template.
  - `{Object} hash`: an object containing the keys and values passed
    in the hash position in the template.

  The values in `params` and `hash` will already be resolved
  through a previous call to the `get` host hook.

  The helper should be invoked with a `this` value that is
  an object with one field:

  `{Function} yield`: when invoked, this function executes the
  block with the current scope. It takes an optional array of
  block parameters. If block parameters are supplied, HTMLBars
  will invoke the `bindLocal` host hook to bind the supplied
  values to the block arguments provided by the template.

  In general, the default implementation of `block` should work
  for most host environments. It delegates to other host hooks
  where appropriate, and properly invokes the helper with the
  appropriate arguments.
*/

function block(morph, env, scope, path, params, hash, template, inverse, visitor) {
  if (handleRedirect(morph, env, scope, path, params, hash, template, inverse, visitor)) {
    return;
  }

  continueBlock(morph, env, scope, path, params, hash, template, inverse, visitor);
}

function continueBlock(morph, env, scope, path, params, hash, template, inverse, visitor) {
  hostBlock(morph, env, scope, template, inverse, null, visitor, function (options) {
    var helper = env.hooks.lookupHelper(env, scope, path);
    return env.hooks.invokeHelper(morph, env, scope, visitor, params, hash, helper, options.templates, thisFor(options.templates));
  });
}

function hostBlock(morph, env, scope, template, inverse, shadowOptions, visitor, callback) {
  var options = optionsFor(template, inverse, env, scope, morph, visitor);
  _htmlbarsUtilTemplateUtils.renderAndCleanup(morph, env, options, shadowOptions, callback);
}

function handleRedirect(morph, env, scope, path, params, hash, template, inverse, visitor) {
  if (!path) {
    return false;
  }

  var redirect = env.hooks.classify(env, scope, path);
  if (redirect) {
    switch (redirect) {
      case 'component':
        env.hooks.component(morph, env, scope, path, params, hash, { default: template, inverse: inverse }, visitor);break;
      case 'inline':
        env.hooks.inline(morph, env, scope, path, params, hash, visitor);break;
      case 'block':
        env.hooks.block(morph, env, scope, path, params, hash, template, inverse, visitor);break;
      default:
        throw new Error("Internal HTMLBars redirection to " + redirect + " not supported");
    }
    return true;
  }

  if (handleKeyword(path, morph, env, scope, params, hash, template, inverse, visitor)) {
    return true;
  }

  return false;
}

function handleKeyword(path, morph, env, scope, params, hash, template, inverse, visitor) {
  var keyword = env.hooks.keywords[path];
  if (!keyword) {
    return false;
  }

  if (typeof keyword === 'function') {
    return keyword(morph, env, scope, params, hash, template, inverse, visitor);
  }

  if (keyword.willRender) {
    keyword.willRender(morph, env);
  }

  var lastState, newState;
  if (keyword.setupState) {
    lastState = _htmlbarsUtilObjectUtils.shallowCopy(morph.state);
    newState = morph.state = keyword.setupState(lastState, env, scope, params, hash);
  }

  if (keyword.childEnv) {
    // Build the child environment...
    env = keyword.childEnv(morph.state, env);

    // ..then save off the child env builder on the render node. If the render
    // node tree is re-rendered and this node is not dirty, the child env
    // builder will still be invoked so that child dirty render nodes still get
    // the correct child env.
    morph.buildChildEnv = keyword.childEnv;
  }

  var firstTime = !morph.rendered;

  if (keyword.isEmpty) {
    var isEmpty = keyword.isEmpty(morph.state, env, scope, params, hash);

    if (isEmpty) {
      if (!firstTime) {
        _htmlbarsUtilTemplateUtils.clearMorph(morph, env, false);
      }
      return true;
    }
  }

  if (firstTime) {
    if (keyword.render) {
      keyword.render(morph, env, scope, params, hash, template, inverse, visitor);
    }
    morph.rendered = true;
    return true;
  }

  var isStable;
  if (keyword.isStable) {
    isStable = keyword.isStable(lastState, newState);
  } else {
    isStable = stableState(lastState, newState);
  }

  if (isStable) {
    if (keyword.rerender) {
      var newEnv = keyword.rerender(morph, env, scope, params, hash, template, inverse, visitor);
      env = newEnv || env;
    }
    _htmlbarsUtilMorphUtils.validateChildMorphs(env, morph, visitor);
    return true;
  } else {
    _htmlbarsUtilTemplateUtils.clearMorph(morph, env, false);
  }

  // If the node is unstable, re-render from scratch
  if (keyword.render) {
    keyword.render(morph, env, scope, params, hash, template, inverse, visitor);
    morph.rendered = true;
    return true;
  }
}

function stableState(oldState, newState) {
  if (_htmlbarsUtilObjectUtils.keyLength(oldState) !== _htmlbarsUtilObjectUtils.keyLength(newState)) {
    return false;
  }

  for (var prop in oldState) {
    if (oldState[prop] !== newState[prop]) {
      return false;
    }
  }

  return true;
}

function linkRenderNode() /* morph, env, scope, params, hash */{
  return;
}

/**
  Host Hook: inline

  @param {RenderNode} renderNode
  @param {Environment} env
  @param {Scope} scope
  @param {String} path
  @param {Array} params
  @param {Hash} hash

  Corresponds to:

  ```hbs
  {{helper param1 param2 key1=val1 key2=val2}}
  ```

  This host hook is similar to the `block` host hook, but it
  invokes helpers that do not supply an attached block.

  Like the `block` hook, the helper should be invoked with:

  - `{Array} params`: the parameters passed to the helper
    in the template.
  - `{Object} hash`: an object containing the keys and values passed
    in the hash position in the template.

  The values in `params` and `hash` will already be resolved
  through a previous call to the `get` host hook.

  In general, the default implementation of `inline` should work
  for most host environments. It delegates to other host hooks
  where appropriate, and properly invokes the helper with the
  appropriate arguments.

  The default implementation of `inline` also makes `partial`
  a keyword. Instead of invoking a helper named `partial`,
  it invokes the `partial` host hook.
*/

function inline(morph, env, scope, path, params, hash, visitor) {
  if (handleRedirect(morph, env, scope, path, params, hash, null, null, visitor)) {
    return;
  }

  var value = undefined,
      hasValue = undefined;
  if (morph.linkedResult) {
    value = env.hooks.getValue(morph.linkedResult);
    hasValue = true;
  } else {
    var options = optionsFor(null, null, env, scope, morph);

    var helper = env.hooks.lookupHelper(env, scope, path);
    var result = env.hooks.invokeHelper(morph, env, scope, visitor, params, hash, helper, options.templates, thisFor(options.templates));

    if (result && result.link) {
      morph.linkedResult = result.value;
      _htmlbarsUtilMorphUtils.linkParams(env, scope, morph, '@content-helper', [morph.linkedResult], null);
    }

    if (result && 'value' in result) {
      value = env.hooks.getValue(result.value);
      hasValue = true;
    }
  }

  if (hasValue) {
    if (morph.lastValue !== value) {
      morph.setContent(value);
    }
    morph.lastValue = value;
  }
}

function keyword(path, morph, env, scope, params, hash, template, inverse, visitor) {
  handleKeyword(path, morph, env, scope, params, hash, template, inverse, visitor);
}

function invokeHelper(morph, env, scope, visitor, _params, _hash, helper, templates, context) {
  var params = normalizeArray(env, _params);
  var hash = normalizeObject(env, _hash);
  return { value: helper.call(context, params, hash, templates) };
}

function normalizeArray(env, array) {
  var out = new Array(array.length);

  for (var i = 0, l = array.length; i < l; i++) {
    out[i] = env.hooks.getCellOrValue(array[i]);
  }

  return out;
}

function normalizeObject(env, object) {
  var out = {};

  for (var prop in object) {
    out[prop] = env.hooks.getCellOrValue(object[prop]);
  }

  return out;
}

function classify() /* env, scope, path */{
  return null;
}

var keywords = {
  partial: function (morph, env, scope, params) {
    var value = env.hooks.partial(morph, env, scope, params[0]);
    morph.setContent(value);
    return true;
  },

  yield: function (morph, env, scope, params, hash, template, inverse, visitor) {
    // the current scope is provided purely for the creation of shadow
    // scopes; it should not be provided to user code.

    var to = env.hooks.getValue(hash.to) || 'default';
    if (scope.blocks[to]) {
      scope.blocks[to](env, params, hash.self, morph, scope, visitor);
    }
    return true;
  },

  hasBlock: function (morph, env, scope, params) {
    var name = env.hooks.getValue(params[0]) || 'default';
    return !!scope.blocks[name];
  },

  hasBlockParams: function (morph, env, scope, params) {
    var name = env.hooks.getValue(params[0]) || 'default';
    return !!(scope.blocks[name] && scope.blocks[name].arity);
  }

};

/**
  Host Hook: partial

  @param {RenderNode} renderNode
  @param {Environment} env
  @param {Scope} scope
  @param {String} path

  Corresponds to:

  ```hbs
  {{partial "location"}}
  ```

  This host hook is invoked by the default implementation of
  the `inline` hook. This makes `partial` a keyword in an
  HTMLBars environment using the default `inline` host hook.

  It is implemented as a host hook so that it can retrieve
  the named partial out of the `Environment`. Helpers, in
  contrast, only have access to the values passed in to them,
  and not to the ambient lexical environment.

  The host hook should invoke the referenced partial with
  the ambient `self`.
*/
exports.keywords = keywords;

function partial(renderNode, env, scope, path) {
  var template = env.partials[path];
  return template.render(scope.self, env, {}).fragment;
}

/**
  Host hook: range

  @param {RenderNode} renderNode
  @param {Environment} env
  @param {Scope} scope
  @param {any} value

  Corresponds to:

  ```hbs
  {{content}}
  {{{unescaped}}}
  ```

  This hook is responsible for updating a render node
  that represents a range of content with a value.
*/

function range(morph, env, scope, path, value, visitor) {
  if (handleRedirect(morph, env, scope, path, [value], {}, null, null, visitor)) {
    return;
  }

  value = env.hooks.getValue(value);

  if (morph.lastValue !== value) {
    morph.setContent(value);
  }

  morph.lastValue = value;
}

/**
  Host hook: element

  @param {RenderNode} renderNode
  @param {Environment} env
  @param {Scope} scope
  @param {String} path
  @param {Array} params
  @param {Hash} hash

  Corresponds to:

  ```hbs
  <div {{bind-attr foo=bar}}></div>
  ```

  This hook is responsible for invoking a helper that
  modifies an element.

  Its purpose is largely legacy support for awkward
  idioms that became common when using the string-based
  Handlebars engine.

  Most of the uses of the `element` hook are expected
  to be superseded by component syntax and the
  `attribute` hook.
*/

function element(morph, env, scope, path, params, hash, visitor) {
  if (handleRedirect(morph, env, scope, path, params, hash, null, null, visitor)) {
    return;
  }

  var helper = env.hooks.lookupHelper(env, scope, path);
  if (helper) {
    env.hooks.invokeHelper(null, env, scope, null, params, hash, helper, { element: morph.element });
  }
}

/**
  Host hook: attribute

  @param {RenderNode} renderNode
  @param {Environment} env
  @param {String} name
  @param {any} value

  Corresponds to:

  ```hbs
  <div foo={{bar}}></div>
  ```

  This hook is responsible for updating a render node
  that represents an element's attribute with a value.

  It receives the name of the attribute as well as an
  already-resolved value, and should update the render
  node with the value if appropriate.
*/

function attribute(morph, env, scope, name, value) {
  value = env.hooks.getValue(value);

  if (morph.lastValue !== value) {
    morph.setContent(value);
  }

  morph.lastValue = value;
}

function subexpr(env, scope, helperName, params, hash) {
  var helper = env.hooks.lookupHelper(env, scope, helperName);
  var result = env.hooks.invokeHelper(null, env, scope, null, params, hash, helper, {});
  if (result && 'value' in result) {
    return env.hooks.getValue(result.value);
  }
}

/**
  Host Hook: get

  @param {Environment} env
  @param {Scope} scope
  @param {String} path

  Corresponds to:

  ```hbs
  {{foo.bar}}
    ^

  {{helper foo.bar key=value}}
           ^           ^
  ```

  This hook is the "leaf" hook of the system. It is used to
  resolve a path relative to the current scope.
*/

function get(env, scope, path) {
  if (path === '') {
    return scope.self;
  }

  var keys = path.split('.');
  var value = env.hooks.getRoot(scope, keys[0])[0];

  for (var i = 1; i < keys.length; i++) {
    if (value) {
      value = env.hooks.getChild(value, keys[i]);
    } else {
      break;
    }
  }

  return value;
}

function getRoot(scope, key) {
  if (scope.localPresent[key]) {
    return [scope.locals[key]];
  } else if (scope.self) {
    return [scope.self[key]];
  } else {
    return [undefined];
  }
}

function getChild(value, key) {
  return value[key];
}

function getValue(reference) {
  return reference;
}

function getCellOrValue(reference) {
  return reference;
}

function component(morph, env, scope, tagName, params, attrs, templates, visitor) {
  if (env.hooks.hasHelper(env, scope, tagName)) {
    return env.hooks.block(morph, env, scope, tagName, params, attrs, templates.default, templates.inverse, visitor);
  }

  componentFallback(morph, env, scope, tagName, attrs, templates.default);
}

function concat(env, params) {
  var value = "";
  for (var i = 0, l = params.length; i < l; i++) {
    value += env.hooks.getValue(params[i]);
  }
  return value;
}

function componentFallback(morph, env, scope, tagName, attrs, template) {
  var element = env.dom.createElement(tagName);
  for (var name in attrs) {
    element.setAttribute(name, env.hooks.getValue(attrs[name]));
  }
  var fragment = _render2.default(template, env, scope, {}).fragment;
  element.appendChild(fragment);
  morph.setNode(element);
}

function hasHelper(env, scope, helperName) {
  return env.helpers[helperName] !== undefined;
}

function lookupHelper(env, scope, helperName) {
  return env.helpers[helperName];
}

function bindScope() /* env, scope */{
  // this function is used to handle host-specified extensions to scope
  // other than `self`, `locals` and `block`.
}

function updateScope(env, scope) {
  env.hooks.bindScope(env, scope);
}

exports.default = {
  // fundamental hooks that you will likely want to override
  bindLocal: bindLocal,
  bindSelf: bindSelf,
  bindScope: bindScope,
  classify: classify,
  component: component,
  concat: concat,
  createFreshScope: createFreshScope,
  getChild: getChild,
  getRoot: getRoot,
  getValue: getValue,
  getCellOrValue: getCellOrValue,
  keywords: keywords,
  linkRenderNode: linkRenderNode,
  partial: partial,
  subexpr: subexpr,

  // fundamental hooks with good default behavior
  bindBlock: bindBlock,
  bindShadowScope: bindShadowScope,
  updateLocal: updateLocal,
  updateSelf: updateSelf,
  updateScope: updateScope,
  createChildScope: createChildScope,
  hasHelper: hasHelper,
  lookupHelper: lookupHelper,
  invokeHelper: invokeHelper,
  cleanupRenderNode: null,
  destroyRenderNode: null,
  willCleanupTree: null,
  didCleanupTree: null,
  willRenderNode: null,
  didRenderNode: null,

  // derived hooks
  attribute: attribute,
  block: block,
  createScope: createScope,
  element: element,
  get: get,
  inline: inline,
  range: range,
  keyword: keyword
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUvaG9va3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQWdGZ0IsSUFBSSxHQUFKLElBQUk7UUFtQkosYUFBYSxHQUFiLGFBQWE7UUF3TGIsMkJBQTJCLEdBQTNCLDJCQUEyQjtRQXVGM0IsV0FBVyxHQUFYLFdBQVc7UUFRWCxnQkFBZ0IsR0FBaEIsZ0JBQWdCO1FBOERoQixlQUFlLEdBQWYsZUFBZTtRQUlmLGdCQUFnQixHQUFoQixnQkFBZ0I7UUFtQmhCLFFBQVEsR0FBUixRQUFRO1FBSVIsVUFBVSxHQUFWLFVBQVU7UUFtQlYsU0FBUyxHQUFULFNBQVM7UUFLVCxXQUFXLEdBQVgsV0FBVztRQW1CWCxTQUFTLEdBQVQsU0FBUztRQW9EVCxLQUFLLEdBQUwsS0FBSztRQVFMLGFBQWEsR0FBYixhQUFhO1FBT2IsU0FBUyxHQUFULFNBQVM7UUFLVCxjQUFjLEdBQWQsY0FBYztRQXVCZCxhQUFhLEdBQWIsYUFBYTtRQW9GYixjQUFjLEdBQWQsY0FBYztRQTBDZCxNQUFNLEdBQU4sTUFBTTtRQWtDTixPQUFPLEdBQVAsT0FBTztRQUlQLFlBQVksR0FBWixZQUFZO1FBMEJaLFFBQVEsR0FBUixRQUFRO1FBNERSLE9BQU8sR0FBUCxPQUFPO1FBdUJQLEtBQUssR0FBTCxLQUFLO1FBeUNMLE9BQU8sR0FBUCxPQUFPO1FBZ0NQLFNBQVMsR0FBVCxTQUFTO1FBVVQsT0FBTyxHQUFQLE9BQU87UUEwQlAsR0FBRyxHQUFILEdBQUc7UUFtQkgsT0FBTyxHQUFQLE9BQU87UUFVUCxRQUFRLEdBQVIsUUFBUTtRQUlSLFFBQVEsR0FBUixRQUFRO1FBSVIsY0FBYyxHQUFkLGNBQWM7UUFJZCxTQUFTLEdBQVQsU0FBUztRQVFULE1BQU0sR0FBTixNQUFNO1FBa0JOLFNBQVMsR0FBVCxTQUFTO1FBSVQsWUFBWSxHQUFaLFlBQVk7UUFJWixTQUFTLEdBQVQsU0FBUztRQUtULFdBQVcsR0FBWCxXQUFXOzs7O3NCQTNpQ1IsVUFBVTs7OzttQ0FDUCwyQkFBMkI7Ozs7dUNBRVYsK0JBQStCOztzQ0FDbEMsOEJBQThCOzt5Q0FDUSxpQ0FBaUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkVwRyxTQUFTLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDN0IsTUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO0FBQUUsV0FBTyxJQUFJLENBQUM7R0FBRzs7QUFFeEMsU0FBTztBQUNMLFFBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtBQUNuQixTQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7QUFDckIsT0FBRyxFQUFFLFFBQVE7QUFDYixVQUFNLEVBQUUsVUFBUyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUU7QUFDbkQsVUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztBQUV6QyxhQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztBQUN4QixhQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNwQixhQUFPLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQzs7QUFFeEMsYUFBTyxpQkFBTyxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztLQUM5QztHQUNGLENBQUM7Q0FDSDs7QUFFTSxTQUFTLGFBQWEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRTtBQUMvRSxNQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsV0FBTztBQUNMLGFBQU8sRUFBRSxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQztLQUM5RSxDQUFDO0dBQ0g7O0FBRUQsTUFBSSxTQUFTLEdBQUcsYUFBYSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRWpGLFNBQU87QUFDTCxRQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7QUFDbkIsU0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO0FBQ3JCLFNBQUssRUFBRSxTQUFTO0FBQ2hCLGFBQVMsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUM7QUFDdkUsV0FBTyxFQUFFLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDO0FBQ2pGLE9BQUcsRUFBRSxRQUFROztBQUViLFVBQU0sRUFBRSxVQUFTLElBQUksRUFBRSxjQUFjLEVBQUU7QUFDckMsZUFBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNqQztHQUNGLENBQUM7Q0FDSDs7O0FBR0QsU0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUU7QUFDOUUsU0FBTyxVQUFTLGNBQWMsRUFBRSxJQUFJLEVBQUU7Ozs7Ozs7Ozs7QUFVcEMsZUFBVyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Ozs7OztBQU1oQyxRQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUU7QUFDbkIsaUNBeEk0QixjQUFjLENBd0kzQixLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM1QyxpQkFBVyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztLQUNyQzs7QUFFRCxRQUFJLEtBQUssR0FBRyxXQUFXLENBQUM7O0FBRXhCLFFBQUksS0FBSyxDQUFDLFdBQVcsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQ3RFLGFBQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3ZGOzs7Ozs7QUFNRCxRQUFJLElBQUksS0FBSyxTQUFTLElBQUksV0FBVyxLQUFLLElBQUksSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ2hFLFdBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2pEOztBQUVELFNBQUssQ0FBQyxXQUFXLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDOzs7QUFHN0UscUJBQU8sUUFBUSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7R0FDakcsQ0FBQztDQUNIOztBQUVELFNBQVMsU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFOzs7QUFHMUUsTUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDOzs7QUFHeEIsTUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDOzs7O0FBSXBCLE1BQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDaEMsTUFBSSxTQUFTLEVBQUU7QUFDYixnQkFBWSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUM7R0FDMUM7Ozs7Ozs7Ozs7QUFVRCxXQUFTLFlBQVksQ0FBQyxHQUFHLEVBQUU7QUFDekIsUUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDOztBQUV4QixXQUFPLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFO0FBQ3ZCLGdCQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM1QixVQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUN2Qjs7QUFFRCxnQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDOUIsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxTQUFPLFVBQVMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUU7QUFDMUMsUUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDNUIsWUFBTSxJQUFJLEtBQUssQ0FBQyx1RUFBdUUsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNqRzs7OztBQUlELGVBQVcsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDcEMsU0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7O0FBRXpCLFFBQUksU0FBUyxFQUFFLFFBQVEsQ0FBQzs7QUFFeEIsUUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7QUFDcEIsV0FBSyxDQUFDLFNBQVMsR0FBRyxtQ0FBZSxDQUFDO0FBQ2xDLFdBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFdBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3JDOztBQUVELGFBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO0FBQzVCLFlBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDOzs7Ozs7QUFNMUIsUUFBSSxhQUFhLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQztBQUM5QyxRQUFJLEdBQUcsWUFBQSxDQUFDOztBQUVSLFFBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3ZCLFVBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUM7QUFDeEMsVUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO0FBQzVCLGtCQUFVLEdBQUcsV0FBVyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7T0FDMUM7QUFDRCxVQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLGdCQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7QUFDM0IsU0FBRyxHQUFHLElBQUksR0FBRyx3Q0FBd0MsR0FBRyxLQUFLLENBQUM7S0FDL0QsTUFBTTtBQUNMLFNBQUcsR0FBRyxJQUFJLENBQUM7S0FDWjs7QUFFRCxRQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBRTtBQUM1QyxtQkFBYSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BHLGtCQUFZLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQztBQUN0QyxtQkFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQztLQUNuQyxNQUFNLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUN0QyxVQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRS9CLFVBQUksR0FBRyxJQUFJLFVBQVUsRUFBRTs7QUFFckIsaUJBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7T0FDdkQsTUFBTTs7QUFFTCxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ25COztBQUVELG1CQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUMzQyxtQkFBYSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ25HLE1BQU07QUFDTCxVQUFJLFVBQVUsR0FBRyxRQWpRZCxnQkFBZ0IsQ0FpUWUsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNsRCxnQkFBVSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDckIsY0FBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUM7QUFDaEQsZUFBUyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN0RCxtQkFBYSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ25HOztBQUVELGVBQVcsQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7QUFDekMsU0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7R0FDekIsQ0FBQztDQUNIOztBQUVELFNBQVMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRTtBQUMvQyxTQUFPLENBQUMsV0FBVyxDQUFDLGNBQWMsSUFBSSxRQUFRLEtBQUssV0FBVyxDQUFDLFFBQVEsQ0FBQztDQUN6RTs7QUFFRCxTQUFTLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFO0FBQ3RGLE1BQUksU0FBUyxHQUFHLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRXJHLFNBQU8sVUFBUyxjQUFjLEVBQUUsSUFBSSxFQUFFO0FBQ3BDLGFBQVMsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztHQUMxQyxDQUFDO0NBQ0g7O0FBRU0sU0FBUywyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRTtBQUNuRyxTQUFPLFVBQVMsY0FBYyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFO0FBQ3pELGVBQVcsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDOztBQUVoQyxRQUFJLEtBQUssQ0FBQyxXQUFXLElBQUksa0JBQWtCLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDeEYsYUFBTyxLQUFLLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDdkY7O0FBRUQsUUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQy9DLE9BQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNwRixnQkFBWSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0FBQ3BDLE9BQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7O0FBRXBELFNBQUssQ0FBQyxXQUFXLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxDQUFDOzs7QUFHdkYscUJBQU8sY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO0dBQ2pILENBQUM7O0FBRUYsV0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUU7QUFDbEYsUUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFO0FBQ3pCLGdCQUFVLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDMUYsTUFBTTtBQUNMLFVBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQzs7OztBQUl4QixVQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDbEIsYUFBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDakQ7O0FBRUQsdUJBQU8sUUFBUSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7S0FDdEc7R0FDRjtDQUNGOztBQUVELFNBQVMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUU7QUFDakUsU0FBTyxRQUFRLEtBQUssV0FBVyxDQUFDLFFBQVEsSUFBSSxjQUFjLEtBQUssV0FBVyxDQUFDLGNBQWMsQ0FBQztDQUMzRjs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTs7O0FBR2pFLE1BQUksWUFBWSxHQUFHLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNuRCxNQUFJLFdBQVcsR0FBRywrQkFsVVgsV0FBVyxDQWtVZ0IsWUFBWSxFQUFFLEtBQUssQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLENBQUM7O0FBRXpFLFNBQU87QUFDTCxhQUFTLEVBQUU7QUFDVCxjQUFRLEVBQUUsYUFBYSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDO0FBQzFFLGFBQU8sRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUM7S0FDekU7QUFDRCxlQUFXLEVBQUUsV0FBVztHQUN6QixDQUFDO0NBQ0g7O0FBRUQsU0FBUyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ3hCLFNBQU87QUFDTCxTQUFLLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLO0FBQzdCLFNBQUssRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUs7QUFDN0IsYUFBUyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUztBQUNyQyxXQUFPLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPO0dBQ2xDLENBQUM7Q0FDSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5Qk0sU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRTtBQUM1QyxNQUFJLFdBQVcsRUFBRTtBQUNmLFdBQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUNoRCxNQUFNO0FBQ0wsV0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDckM7Q0FDRjs7QUFFTSxTQUFTLGdCQUFnQixHQUFHOzs7O0FBSWpDLFNBQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLENBQUM7Q0FDakU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5RE0sU0FBUyxlQUFlLENBQUMsR0FBRyxrQ0FBa0M7QUFDbkUsU0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7Q0FDckM7O0FBRU0sU0FBUyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7QUFDdkMsTUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxPQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVDLFNBQU8sS0FBSyxDQUFDO0NBQ2Q7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlTSxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtBQUN6QyxPQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztDQUNuQjs7QUFFTSxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtBQUMzQyxLQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3RDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQk0sU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO0FBQ2pELE9BQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2hDLE9BQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0NBQzVCOztBQUVNLFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUNuRCxLQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztDQUM5Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJNLFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFrQjtNQUFoQixJQUFJLHlEQUFDLFNBQVM7O0FBQ3pELE9BQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0NBQzVCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrRE0sU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDdkYsTUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRTtBQUNyRixXQUFPO0dBQ1I7O0FBRUQsZUFBYSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDbEY7O0FBRU0sU0FBUyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDL0YsV0FBUyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFTLE9BQU8sRUFBRTtBQUMvRSxRQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RELFdBQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0dBQ2hJLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDaEcsTUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEUsNkJBOWpCZ0QsZ0JBQWdCLENBOGpCL0MsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQ2hFOztBQUVNLFNBQVMsY0FBYyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ2hHLE1BQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELE1BQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEQsTUFBSSxRQUFRLEVBQUU7QUFDWixZQUFPLFFBQVE7QUFDYixXQUFLLFdBQVc7QUFBRSxXQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzNILFdBQUssUUFBUTtBQUFFLFdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQ3ZGLFdBQUssT0FBTztBQUFFLFdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDeEc7QUFBUyxjQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxHQUFHLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQUEsS0FDN0Y7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELE1BQUksYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFDcEYsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxTQUFPLEtBQUssQ0FBQztDQUNkOztBQUVNLFNBQVMsYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQy9GLE1BQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLE1BQUksQ0FBQyxPQUFPLEVBQUU7QUFBRSxXQUFPLEtBQUssQ0FBQztHQUFFOztBQUUvQixNQUFJLE9BQU8sT0FBTyxLQUFLLFVBQVUsRUFBRTtBQUNqQyxXQUFPLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDN0U7O0FBRUQsTUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO0FBQ3RCLFdBQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQ2hDOztBQUVELE1BQUksU0FBUyxFQUFFLFFBQVEsQ0FBQztBQUN4QixNQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUU7QUFDdEIsYUFBUyxHQUFHLHlCQXhtQkksV0FBVyxDQXdtQkgsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLFlBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQ2xGOztBQUVELE1BQUksT0FBTyxDQUFDLFFBQVEsRUFBRTs7QUFFcEIsT0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQzs7Ozs7O0FBTXpDLFNBQUssQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztHQUN4Qzs7QUFFRCxNQUFJLFNBQVMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7O0FBRWhDLE1BQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUNuQixRQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXJFLFFBQUksT0FBTyxFQUFFO0FBQ1gsVUFBSSxDQUFDLFNBQVMsRUFBRTtBQUFFLG1DQTNuQkYsVUFBVSxDQTJuQkcsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztPQUFFO0FBQ2xELGFBQU8sSUFBSSxDQUFDO0tBQ2I7R0FDRjs7QUFFRCxNQUFJLFNBQVMsRUFBRTtBQUNiLFFBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUNsQixhQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUM3RTtBQUNELFNBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsTUFBSSxRQUFRLENBQUM7QUFDYixNQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7QUFDcEIsWUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQ2xELE1BQU07QUFDTCxZQUFRLEdBQUcsV0FBVyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztHQUM3Qzs7QUFFRCxNQUFJLFFBQVEsRUFBRTtBQUNaLFFBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtBQUNwQixVQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMzRixTQUFHLEdBQUcsTUFBTSxJQUFJLEdBQUcsQ0FBQztLQUNyQjtBQUNELDRCQXJwQkssbUJBQW1CLENBcXBCSixHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3pDLFdBQU8sSUFBSSxDQUFDO0dBQ2IsTUFBTTtBQUNMLCtCQXZwQmtCLFVBQVUsQ0F1cEJqQixLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQy9COzs7QUFHRCxNQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDbEIsV0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDNUUsU0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDdEIsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGOztBQUVELFNBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUU7QUFDdkMsTUFBSSx5QkFycUJHLFNBQVMsQ0FxcUJGLFFBQVEsQ0FBQyxLQUFLLHlCQXJxQnJCLFNBQVMsQ0FxcUJzQixRQUFRLENBQUMsRUFBRTtBQUFFLFdBQU8sS0FBSyxDQUFDO0dBQUU7O0FBRWxFLE9BQUssSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO0FBQ3pCLFFBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUFFLGFBQU8sS0FBSyxDQUFDO0tBQUU7R0FDekQ7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFTSxTQUFTLGNBQWMsd0NBQXdDO0FBQ3BFLFNBQU87Q0FDUjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3Q00sU0FBUyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3JFLE1BQUksY0FBYyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFDOUUsV0FBTztHQUNSOztBQUVELE1BQUksS0FBSyxZQUFBO01BQUUsUUFBUSxZQUFBLENBQUM7QUFDcEIsTUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFO0FBQ3RCLFNBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDL0MsWUFBUSxHQUFHLElBQUksQ0FBQztHQUNqQixNQUFNO0FBQ0wsUUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFeEQsUUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0RCxRQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7O0FBRXJJLFFBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDekIsV0FBSyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2xDLDhCQXR1QkcsVUFBVSxDQXN1QkYsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDOUU7O0FBRUQsUUFBSSxNQUFNLElBQUksT0FBTyxJQUFJLE1BQU0sRUFBRTtBQUMvQixXQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLGNBQVEsR0FBRyxJQUFJLENBQUM7S0FDakI7R0FDRjs7QUFFRCxNQUFJLFFBQVEsRUFBRTtBQUNaLFFBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUU7QUFDN0IsV0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN6QjtBQUNELFNBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0dBQ3pCO0NBQ0Y7O0FBRU0sU0FBUyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUc7QUFDMUYsZUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDbEY7O0FBRU0sU0FBUyxZQUFZLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUU7QUFDbkcsTUFBSSxNQUFNLEdBQUcsY0FBYyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMxQyxNQUFJLElBQUksR0FBRyxlQUFlLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3ZDLFNBQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDO0NBQ2pFOztBQUVELFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDbEMsTUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVsQyxPQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RDLE9BQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUM3Qzs7QUFFRCxTQUFPLEdBQUcsQ0FBQztDQUNaOztBQUVELFNBQVMsZUFBZSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFDcEMsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDOztBQUViLE9BQUssSUFBSSxJQUFJLElBQUksTUFBTSxFQUFHO0FBQ3hCLE9BQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUNwRDs7QUFFRCxTQUFPLEdBQUcsQ0FBQztDQUNaOztBQUVNLFNBQVMsUUFBUSx5QkFBeUI7QUFDL0MsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFTSxJQUFJLFFBQVEsR0FBRztBQUNwQixTQUFPLEVBQUUsVUFBUyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDM0MsUUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsU0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN4QixXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELE9BQUssRUFBRSxVQUFTLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUU7Ozs7QUFJM0UsUUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLFNBQVMsQ0FBQztBQUNsRCxRQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDcEIsV0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNqRTtBQUNELFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsVUFBUSxFQUFFLFVBQVMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQzVDLFFBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQztBQUN0RCxXQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzdCOztBQUVELGdCQUFjLEVBQUUsVUFBUyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDbEQsUUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDO0FBQ3RELFdBQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUEsQUFBQyxDQUFDO0dBQzNEOztDQUVGLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUE1QlMsUUFBUSxHQUFSLFFBQVE7O0FBd0RaLFNBQVMsT0FBTyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtBQUNwRCxNQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFNBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7Q0FDdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CTSxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUM3RCxNQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRTtBQUM3RSxXQUFPO0dBQ1I7O0FBRUQsT0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVsQyxNQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssS0FBSyxFQUFFO0FBQzdCLFNBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDekI7O0FBRUQsT0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7Q0FDekI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCTSxTQUFTLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDdEUsTUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRTtBQUM5RSxXQUFPO0dBQ1I7O0FBRUQsTUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0RCxNQUFJLE1BQU0sRUFBRTtBQUNWLE9BQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztHQUNsRztDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1Qk0sU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUN4RCxPQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWxDLE1BQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUU7QUFDN0IsU0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUN6Qjs7QUFFRCxPQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztDQUN6Qjs7QUFFTSxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQzVELE1BQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDNUQsTUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLE1BQUksTUFBTSxJQUFJLE9BQU8sSUFBSSxNQUFNLEVBQUU7QUFBRSxXQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUFFO0NBQzlFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCTSxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtBQUNwQyxNQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7QUFDZixXQUFPLEtBQUssQ0FBQyxJQUFJLENBQUM7R0FDbkI7O0FBRUQsTUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixNQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWpELE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3BDLFFBQUksS0FBSyxFQUFFO0FBQ1QsV0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QyxNQUFNO0FBQ0wsWUFBTTtLQUNQO0dBQ0Y7O0FBRUQsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFTSxTQUFTLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO0FBQ2xDLE1BQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUMzQixXQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO0FBQ3JCLFdBQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDMUIsTUFBTTtBQUNMLFdBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUNwQjtDQUNGOztBQUVNLFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUU7QUFDbkMsU0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDbkI7O0FBRU0sU0FBUyxRQUFRLENBQUMsU0FBUyxFQUFFO0FBQ2xDLFNBQU8sU0FBUyxDQUFDO0NBQ2xCOztBQUVNLFNBQVMsY0FBYyxDQUFDLFNBQVMsRUFBRTtBQUN4QyxTQUFPLFNBQVMsQ0FBQztDQUNsQjs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFO0FBQ3ZGLE1BQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRTtBQUM1QyxXQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztHQUNsSDs7QUFFRCxtQkFBaUIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUN6RTs7QUFFTSxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFO0FBQ2xDLE1BQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNmLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDN0MsU0FBSyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ3hDO0FBQ0QsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO0FBQ3RFLE1BQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdDLE9BQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO0FBQ3RCLFdBQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDN0Q7QUFDRCxNQUFJLFFBQVEsR0FBRyxpQkFBTyxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDekQsU0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5QixPQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ3hCOztBQUVNLFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFO0FBQ2hELFNBQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLENBQUM7Q0FDOUM7O0FBRU0sU0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUU7QUFDbkQsU0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQ2hDOztBQUVNLFNBQVMsU0FBUyxtQkFBbUI7OztDQUczQzs7QUFFTSxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQ3RDLEtBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUNqQzs7a0JBRWM7O0FBRWIsV0FBUyxFQUFFLFNBQVM7QUFDcEIsVUFBUSxFQUFFLFFBQVE7QUFDbEIsV0FBUyxFQUFFLFNBQVM7QUFDcEIsVUFBUSxFQUFFLFFBQVE7QUFDbEIsV0FBUyxFQUFFLFNBQVM7QUFDcEIsUUFBTSxFQUFFLE1BQU07QUFDZCxrQkFBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsVUFBUSxFQUFFLFFBQVE7QUFDbEIsU0FBTyxFQUFFLE9BQU87QUFDaEIsVUFBUSxFQUFFLFFBQVE7QUFDbEIsZ0JBQWMsRUFBRSxjQUFjO0FBQzlCLFVBQVEsRUFBRSxRQUFRO0FBQ2xCLGdCQUFjLEVBQUUsY0FBYztBQUM5QixTQUFPLEVBQUUsT0FBTztBQUNoQixTQUFPLEVBQUUsT0FBTzs7O0FBR2hCLFdBQVMsRUFBRSxTQUFTO0FBQ3BCLGlCQUFlLEVBQUUsZUFBZTtBQUNoQyxhQUFXLEVBQUUsV0FBVztBQUN4QixZQUFVLEVBQUUsVUFBVTtBQUN0QixhQUFXLEVBQUUsV0FBVztBQUN4QixrQkFBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsV0FBUyxFQUFFLFNBQVM7QUFDcEIsY0FBWSxFQUFFLFlBQVk7QUFDMUIsY0FBWSxFQUFFLFlBQVk7QUFDMUIsbUJBQWlCLEVBQUUsSUFBSTtBQUN2QixtQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLGlCQUFlLEVBQUUsSUFBSTtBQUNyQixnQkFBYyxFQUFFLElBQUk7QUFDcEIsZ0JBQWMsRUFBRSxJQUFJO0FBQ3BCLGVBQWEsRUFBRSxJQUFJOzs7QUFHbkIsV0FBUyxFQUFFLFNBQVM7QUFDcEIsT0FBSyxFQUFFLEtBQUs7QUFDWixhQUFXLEVBQUUsV0FBVztBQUN4QixTQUFPLEVBQUUsT0FBTztBQUNoQixLQUFHLEVBQUUsR0FBRztBQUNSLFFBQU0sRUFBRSxNQUFNO0FBQ2QsT0FBSyxFQUFFLEtBQUs7QUFDWixTQUFPLEVBQUUsT0FBTztDQUNqQiIsImZpbGUiOiJodG1sYmFycy1ydW50aW1lL2hvb2tzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlbmRlciBmcm9tIFwiLi9yZW5kZXJcIjtcbmltcG9ydCBNb3JwaExpc3QgZnJvbSBcIi4uL21vcnBoLXJhbmdlL21vcnBoLWxpc3RcIjtcbmltcG9ydCB7IGNyZWF0ZUNoaWxkTW9ycGggfSBmcm9tIFwiLi9yZW5kZXJcIjtcbmltcG9ydCB7IGtleUxlbmd0aCwgc2hhbGxvd0NvcHkgfSBmcm9tIFwiLi4vaHRtbGJhcnMtdXRpbC9vYmplY3QtdXRpbHNcIjtcbmltcG9ydCB7IHZhbGlkYXRlQ2hpbGRNb3JwaHMgfSBmcm9tIFwiLi4vaHRtbGJhcnMtdXRpbC9tb3JwaC11dGlsc1wiO1xuaW1wb3J0IHsgUmVuZGVyU3RhdGUsIGNsZWFyTW9ycGgsIGNsZWFyTW9ycGhMaXN0LCByZW5kZXJBbmRDbGVhbnVwIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHNcIjtcbmltcG9ydCB7IGxpbmtQYXJhbXMgfSBmcm9tIFwiLi4vaHRtbGJhcnMtdXRpbC9tb3JwaC11dGlsc1wiO1xuXG4vKipcbiAgSFRNTEJhcnMgZGVsZWdhdGVzIHRoZSBydW50aW1lIGJlaGF2aW9yIG9mIGEgdGVtcGxhdGUgdG9cbiAgaG9va3MgcHJvdmlkZWQgYnkgdGhlIGhvc3QgZW52aXJvbm1lbnQuIFRoZXNlIGhvb2tzIGV4cGxhaW5cbiAgdGhlIGxleGljYWwgZW52aXJvbm1lbnQgb2YgYSBIYW5kbGViYXJzIHRlbXBsYXRlLCB0aGUgaW50ZXJuYWxcbiAgcmVwcmVzZW50YXRpb24gb2YgcmVmZXJlbmNlcywgYW5kIHRoZSBpbnRlcmFjdGlvbiBiZXR3ZWVuIGFuXG4gIEhUTUxCYXJzIHRlbXBsYXRlIGFuZCB0aGUgRE9NIGl0IGlzIG1hbmFnaW5nLlxuXG4gIFdoaWxlIEhUTUxCYXJzIGhvc3QgaG9va3MgaGF2ZSBhY2Nlc3MgdG8gYWxsIG9mIHRoaXMgaW50ZXJuYWxcbiAgbWFjaGluZXJ5LCB0ZW1wbGF0ZXMgYW5kIGhlbHBlcnMgaGF2ZSBhY2Nlc3MgdG8gdGhlIGFic3RyYWN0aW9uXG4gIHByb3ZpZGVkIGJ5IHRoZSBob3N0IGhvb2tzLlxuXG4gICMjIFRoZSBMZXhpY2FsIEVudmlyb25tZW50XG5cbiAgVGhlIGRlZmF1bHQgbGV4aWNhbCBlbnZpcm9ubWVudCBvZiBhbiBIVE1MQmFycyB0ZW1wbGF0ZSBpbmNsdWRlczpcblxuICAqIEFueSBsb2NhbCB2YXJpYWJsZXMsIHByb3ZpZGVkIGJ5ICpibG9jayBhcmd1bWVudHMqXG4gICogVGhlIGN1cnJlbnQgdmFsdWUgb2YgYHNlbGZgXG5cbiAgIyMgU2ltcGxlIE5lc3RpbmdcblxuICBMZXQncyBsb29rIGF0IGEgc2ltcGxlIHRlbXBsYXRlIHdpdGggYSBuZXN0ZWQgYmxvY2s6XG5cbiAgYGBgaGJzXG4gIDxoMT57e3RpdGxlfX08L2gxPlxuXG4gIHt7I2lmIGF1dGhvcn19XG4gICAgPHAgY2xhc3M9XCJieWxpbmVcIj57e2F1dGhvcn19PC9wPlxuICB7ey9pZn19XG4gIGBgYFxuXG4gIEluIHRoaXMgY2FzZSwgdGhlIGxleGljYWwgZW52aXJvbm1lbnQgYXQgdGhlIHRvcC1sZXZlbCBvZiB0aGVcbiAgdGVtcGxhdGUgZG9lcyBub3QgY2hhbmdlIGluc2lkZSBvZiB0aGUgYGlmYCBibG9jay4gVGhpcyBpc1xuICBhY2hpZXZlZCB2aWEgYW4gaW1wbGVtZW50YXRpb24gb2YgYGlmYCB0aGF0IGxvb2tzIGxpa2UgdGhpczpcblxuICBgYGBqc1xuICByZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICBpZiAoISFwYXJhbXNbMF0pIHtcbiAgICAgIHJldHVybiB0aGlzLnlpZWxkKCk7XG4gICAgfVxuICB9KTtcbiAgYGBgXG5cbiAgQSBjYWxsIHRvIGB0aGlzLnlpZWxkYCBpbnZva2VzIHRoZSBjaGlsZCB0ZW1wbGF0ZSB1c2luZyB0aGVcbiAgY3VycmVudCBsZXhpY2FsIGVudmlyb25tZW50LlxuXG4gICMjIEJsb2NrIEFyZ3VtZW50c1xuXG4gIEl0IGlzIHBvc3NpYmxlIGZvciBuZXN0ZWQgYmxvY2tzIHRvIGludHJvZHVjZSBuZXcgbG9jYWxcbiAgdmFyaWFibGVzOlxuXG4gIGBgYGhic1xuICB7eyNjb3VudC1jYWxscyBhcyB8aXx9fVxuICA8aDE+e3t0aXRsZX19PC9oMT5cbiAgPHA+Q2FsbGVkIHt7aX19IHRpbWVzPC9wPlxuICB7ey9jb3VudH19XG4gIGBgYFxuXG4gIEluIHRoaXMgZXhhbXBsZSwgdGhlIGNoaWxkIGJsb2NrIGluaGVyaXRzIGl0cyBzdXJyb3VuZGluZ1xuICBsZXhpY2FsIGVudmlyb25tZW50LCBidXQgYXVnbWVudHMgaXQgd2l0aCBhIHNpbmdsZSBuZXdcbiAgdmFyaWFibGUgYmluZGluZy5cblxuICBUaGUgaW1wbGVtZW50YXRpb24gb2YgYGNvdW50LWNhbGxzYCBzdXBwbGllcyB0aGUgdmFsdWUgb2ZcbiAgYGlgLCBidXQgZG9lcyBub3Qgb3RoZXJ3aXNlIGFsdGVyIHRoZSBlbnZpcm9ubWVudDpcblxuICBgYGBqc1xuICB2YXIgY291bnQgPSAwO1xuICByZWdpc3RlckhlbHBlcignY291bnQtY2FsbHMnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy55aWVsZChbICsrY291bnQgXSk7XG4gIH0pO1xuICBgYGBcbiovXG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwKHRlbXBsYXRlKSB7XG4gIGlmICh0ZW1wbGF0ZSA9PT0gbnVsbCkgeyByZXR1cm4gbnVsbDsgIH1cblxuICByZXR1cm4ge1xuICAgIG1ldGE6IHRlbXBsYXRlLm1ldGEsXG4gICAgYXJpdHk6IHRlbXBsYXRlLmFyaXR5LFxuICAgIHJhdzogdGVtcGxhdGUsXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzZWxmLCBlbnYsIG9wdGlvbnMsIGJsb2NrQXJndW1lbnRzKSB7XG4gICAgICB2YXIgc2NvcGUgPSBlbnYuaG9va3MuY3JlYXRlRnJlc2hTY29wZSgpO1xuXG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIG9wdGlvbnMuc2VsZiA9IHNlbGY7XG4gICAgICBvcHRpb25zLmJsb2NrQXJndW1lbnRzID0gYmxvY2tBcmd1bWVudHM7XG5cbiAgICAgIHJldHVybiByZW5kZXIodGVtcGxhdGUsIGVudiwgc2NvcGUsIG9wdGlvbnMpO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBGb3JIZWxwZXIodGVtcGxhdGUsIGVudiwgc2NvcGUsIG1vcnBoLCByZW5kZXJTdGF0ZSwgdmlzaXRvcikge1xuICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHlpZWxkSW46IHlpZWxkSW5TaGFkb3dUZW1wbGF0ZShudWxsLCBlbnYsIHNjb3BlLCBtb3JwaCwgcmVuZGVyU3RhdGUsIHZpc2l0b3IpXG4gICAgfTtcbiAgfVxuXG4gIHZhciB5aWVsZEFyZ3MgPSB5aWVsZFRlbXBsYXRlKHRlbXBsYXRlLCBlbnYsIHNjb3BlLCBtb3JwaCwgcmVuZGVyU3RhdGUsIHZpc2l0b3IpO1xuXG4gIHJldHVybiB7XG4gICAgbWV0YTogdGVtcGxhdGUubWV0YSxcbiAgICBhcml0eTogdGVtcGxhdGUuYXJpdHksXG4gICAgeWllbGQ6IHlpZWxkQXJncyxcbiAgICB5aWVsZEl0ZW06IHlpZWxkSXRlbSh0ZW1wbGF0ZSwgZW52LCBzY29wZSwgbW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKSxcbiAgICB5aWVsZEluOiB5aWVsZEluU2hhZG93VGVtcGxhdGUodGVtcGxhdGUsIGVudiwgc2NvcGUsIG1vcnBoLCByZW5kZXJTdGF0ZSwgdmlzaXRvciksXG4gICAgcmF3OiB0ZW1wbGF0ZSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2VsZiwgYmxvY2tBcmd1bWVudHMpIHtcbiAgICAgIHlpZWxkQXJncyhibG9ja0FyZ3VtZW50cywgc2VsZik7XG4gICAgfVxuICB9O1xufVxuXG4vLyBDYWxsZWQgYnkgYSB1c2VyLWxhbmQgaGVscGVyIHRvIHJlbmRlciBhIHRlbXBsYXRlLlxuZnVuY3Rpb24geWllbGRUZW1wbGF0ZSh0ZW1wbGF0ZSwgZW52LCBwYXJlbnRTY29wZSwgbW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbihibG9ja0FyZ3VtZW50cywgc2VsZikge1xuICAgIC8vIFJlbmRlciBzdGF0ZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBwcm9ncmVzcyBvZiB0aGUgaGVscGVyIChzaW5jZSBpdFxuICAgIC8vIG1heSBjYWxsIGludG8gdXMgbXVsdGlwbGUgdGltZXMpLiBBcyB0aGUgdXNlci1sYW5kIGhlbHBlciBjYWxsc1xuICAgIC8vIGludG8gbGlicmFyeSBjb2RlLCB3ZSB0cmFjayB3aGF0IG5lZWRzIHRvIGJlIGNsZWFuZWQgdXAgYWZ0ZXIgdGhlXG4gICAgLy8gaGVscGVyIGhhcyByZXR1cm5lZC5cbiAgICAvL1xuICAgIC8vIEhlcmUsIHdlIHJlbWVtYmVyIHRoYXQgYSB0ZW1wbGF0ZSBoYXMgYmVlbiB5aWVsZGVkIGFuZCBzbyB3ZSBkbyBub3RcbiAgICAvLyBuZWVkIHRvIHJlbW92ZSB0aGUgcHJldmlvdXMgdGVtcGxhdGUuIChJZiBubyB0ZW1wbGF0ZSBpcyB5aWVsZGVkXG4gICAgLy8gdGhpcyByZW5kZXIgYnkgdGhlIGhlbHBlciwgd2UgYXNzdW1lIG5vdGhpbmcgc2hvdWxkIGJlIHNob3duIGFuZFxuICAgIC8vIHJlbW92ZSBhbnkgcHJldmlvdXMgcmVuZGVyZWQgdGVtcGxhdGVzLilcbiAgICByZW5kZXJTdGF0ZS5tb3JwaFRvQ2xlYXIgPSBudWxsO1xuXG4gICAgLy8gSW4gdGhpcyBjb25kaXRpb25hbCBpcyB0cnVlLCBpdCBtZWFucyB0aGF0IG9uIHRoZSBwcmV2aW91cyByZW5kZXJpbmcgcGFzc1xuICAgIC8vIHRoZSBoZWxwZXIgeWllbGRlZCBtdWx0aXBsZSBpdGVtcyB2aWEgYHlpZWxkSXRlbSgpYCwgYnV0IHRoaXMgdGltZSB0aGV5XG4gICAgLy8gYXJlIHlpZWxkaW5nIGEgc2luZ2xlIHRlbXBsYXRlLiBJbiB0aGF0IGNhc2UsIHdlIG1hcmsgdGhlIG1vcnBoIGxpc3QgZm9yXG4gICAgLy8gY2xlYW51cCBzbyBpdCBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAgICBpZiAobW9ycGgubW9ycGhMaXN0KSB7XG4gICAgICBjbGVhck1vcnBoTGlzdChtb3JwaC5tb3JwaExpc3QsIG1vcnBoLCBlbnYpO1xuICAgICAgcmVuZGVyU3RhdGUubW9ycGhMaXN0VG9DbGVhciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHNjb3BlID0gcGFyZW50U2NvcGU7XG5cbiAgICBpZiAobW9ycGgubGFzdFlpZWxkZWQgJiYgaXNTdGFibGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgbW9ycGgubGFzdFlpZWxkZWQpKSB7XG4gICAgICByZXR1cm4gbW9ycGgubGFzdFJlc3VsdC5yZXZhbGlkYXRlV2l0aChlbnYsIHVuZGVmaW5lZCwgc2VsZiwgYmxvY2tBcmd1bWVudHMsIHZpc2l0b3IpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRvIG1ha2Ugc3VyZSB0aGF0IHdlIGFjdHVhbGx5ICoqbmVlZCoqIGEgbmV3IHNjb3BlLCBhbmQgY2FuJ3RcbiAgICAvLyBzaGFyZSB0aGUgcGFyZW50IHNjb3BlLiBOb3RlIHRoYXQgd2UgbmVlZCB0byBtb3ZlIHRoaXMgY2hlY2sgaW50b1xuICAgIC8vIGEgaG9zdCBob29rLCBiZWNhdXNlIHRoZSBob3N0J3Mgbm90aW9uIG9mIHNjb3BlIG1heSByZXF1aXJlIGEgbmV3XG4gICAgLy8gc2NvcGUgaW4gbW9yZSBjYXNlcyB0aGFuIHRoZSBvbmVzIHdlIGNhbiBkZXRlcm1pbmUgc3RhdGljYWxseS5cbiAgICBpZiAoc2VsZiAhPT0gdW5kZWZpbmVkIHx8IHBhcmVudFNjb3BlID09PSBudWxsIHx8IHRlbXBsYXRlLmFyaXR5KSB7XG4gICAgICBzY29wZSA9IGVudi5ob29rcy5jcmVhdGVDaGlsZFNjb3BlKHBhcmVudFNjb3BlKTtcbiAgICB9XG5cbiAgICBtb3JwaC5sYXN0WWllbGRlZCA9IHsgc2VsZjogc2VsZiwgdGVtcGxhdGU6IHRlbXBsYXRlLCBzaGFkb3dUZW1wbGF0ZTogbnVsbCB9O1xuXG4gICAgLy8gUmVuZGVyIHRoZSB0ZW1wbGF0ZSB0aGF0IHdhcyBzZWxlY3RlZCBieSB0aGUgaGVscGVyXG4gICAgcmVuZGVyKHRlbXBsYXRlLCBlbnYsIHNjb3BlLCB7IHJlbmRlck5vZGU6IG1vcnBoLCBzZWxmOiBzZWxmLCBibG9ja0FyZ3VtZW50czogYmxvY2tBcmd1bWVudHMgfSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHlpZWxkSXRlbSh0ZW1wbGF0ZSwgZW52LCBwYXJlbnRTY29wZSwgbW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKSB7XG4gIC8vIEluaXRpYWxpemUgc3RhdGUgdGhhdCB0cmFja3MgbXVsdGlwbGUgaXRlbXMgYmVpbmdcbiAgLy8geWllbGRlZCBpbi5cbiAgdmFyIGN1cnJlbnRNb3JwaCA9IG51bGw7XG5cbiAgLy8gQ2FuZGlkYXRlIG1vcnBocyBmb3IgZGVsZXRpb24uXG4gIHZhciBjYW5kaWRhdGVzID0ge307XG5cbiAgLy8gUmV1c2UgZXhpc3RpbmcgTW9ycGhMaXN0IGlmIHRoaXMgaXMgbm90IGEgZmlyc3QtdGltZVxuICAvLyByZW5kZXIuXG4gIHZhciBtb3JwaExpc3QgPSBtb3JwaC5tb3JwaExpc3Q7XG4gIGlmIChtb3JwaExpc3QpIHtcbiAgICBjdXJyZW50TW9ycGggPSBtb3JwaExpc3QuZmlyc3RDaGlsZE1vcnBoO1xuICB9XG5cbiAgLy8gQWR2YW5jZXMgdGhlIGN1cnJlbnRNb3JwaCBwb2ludGVyIHRvIHRoZSBtb3JwaCBpbiB0aGUgcHJldmlvdXNseS1yZW5kZXJlZFxuICAvLyBsaXN0IHRoYXQgbWF0Y2hlcyB0aGUgeWllbGRlZCBrZXkuIFdoaWxlIGRvaW5nIHNvLCBpdCBtYXJrcyBhbnkgbW9ycGhzXG4gIC8vIHRoYXQgaXQgYWR2YW5jZXMgcGFzdCBhcyBjYW5kaWRhdGVzIGZvciBkZWxldGlvbi4gQXNzdW1pbmcgdGhvc2UgbW9ycGhzXG4gIC8vIGFyZSBub3QgeWllbGRlZCBpbiBsYXRlciwgdGhleSB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIHBydW5lIHN0ZXAgZHVyaW5nXG4gIC8vIGNsZWFudXAuXG4gIC8vIE5vdGUgdGhhdCB0aGlzIGhlbHBlciBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgdGhlIG1vcnBoIGJlaW5nIHNlZWtlZCB0byBpc1xuICAvLyBndWFyYW50ZWVkIHRvIGV4aXN0IGluIHRoZSBwcmV2aW91cyBNb3JwaExpc3Q7IGlmIHRoaXMgaXMgY2FsbGVkIGFuZCB0aGVcbiAgLy8gbW9ycGggZG9lcyBub3QgZXhpc3QsIGl0IHdpbGwgcmVzdWx0IGluIGFuIGluZmluaXRlIGxvb3BcbiAgZnVuY3Rpb24gYWR2YW5jZVRvS2V5KGtleSkge1xuICAgIGxldCBzZWVrID0gY3VycmVudE1vcnBoO1xuXG4gICAgd2hpbGUgKHNlZWsua2V5ICE9PSBrZXkpIHtcbiAgICAgIGNhbmRpZGF0ZXNbc2Vlay5rZXldID0gc2VlaztcbiAgICAgIHNlZWsgPSBzZWVrLm5leHRNb3JwaDtcbiAgICB9XG5cbiAgICBjdXJyZW50TW9ycGggPSBzZWVrLm5leHRNb3JwaDtcbiAgICByZXR1cm4gc2VlaztcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihfa2V5LCBibG9ja0FyZ3VtZW50cywgc2VsZikge1xuICAgIGlmICh0eXBlb2YgX2tleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHByb3ZpZGUgYSBzdHJpbmcga2V5IHdoZW4gY2FsbGluZyBgeWllbGRJdGVtYDsgeW91IHByb3ZpZGVkIFwiICsgX2tleSk7XG4gICAgfVxuXG4gICAgLy8gQXQgbGVhc3Qgb25lIGl0ZW0gaGFzIGJlZW4geWllbGRlZCwgc28gd2UgZG8gbm90IHdob2xlc2FsZVxuICAgIC8vIGNsZWFyIHRoZSBsYXN0IE1vcnBoTGlzdCBidXQgaW5zdGVhZCBhcHBseSBhIHBydW5lIG9wZXJhdGlvbi5cbiAgICByZW5kZXJTdGF0ZS5tb3JwaExpc3RUb0NsZWFyID0gbnVsbDtcbiAgICBtb3JwaC5sYXN0WWllbGRlZCA9IG51bGw7XG5cbiAgICB2YXIgbW9ycGhMaXN0LCBtb3JwaE1hcDtcblxuICAgIGlmICghbW9ycGgubW9ycGhMaXN0KSB7XG4gICAgICBtb3JwaC5tb3JwaExpc3QgPSBuZXcgTW9ycGhMaXN0KCk7XG4gICAgICBtb3JwaC5tb3JwaE1hcCA9IHt9O1xuICAgICAgbW9ycGguc2V0TW9ycGhMaXN0KG1vcnBoLm1vcnBoTGlzdCk7XG4gICAgfVxuXG4gICAgbW9ycGhMaXN0ID0gbW9ycGgubW9ycGhMaXN0O1xuICAgIG1vcnBoTWFwID0gbW9ycGgubW9ycGhNYXA7XG5cbiAgICAvLyBBIG1hcCBvZiBtb3JwaHMgdGhhdCBoYXZlIGJlZW4geWllbGRlZCBpbiBvbiB0aGlzXG4gICAgLy8gcmVuZGVyaW5nIHBhc3MuIEFueSBtb3JwaHMgdGhhdCBkbyBub3QgbWFrZSBpdCBpbnRvXG4gICAgLy8gdGhpcyBsaXN0IHdpbGwgYmUgcHJ1bmVkIGZyb20gdGhlIE1vcnBoTGlzdCBkdXJpbmcgdGhlIGNsZWFudXBcbiAgICAvLyBwcm9jZXNzLlxuICAgIGxldCBoYW5kbGVkTW9ycGhzID0gcmVuZGVyU3RhdGUuaGFuZGxlZE1vcnBocztcbiAgICBsZXQga2V5O1xuXG4gICAgaWYgKGhhbmRsZWRNb3JwaHNbX2tleV0pIHtcbiAgICAgIGxldCBjb2xsaXNpb25zID0gcmVuZGVyU3RhdGUuY29sbGlzaW9ucztcbiAgICAgIGlmIChjb2xsaXNpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29sbGlzaW9ucyA9IHJlbmRlclN0YXRlLmNvbGxpc2lvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGxldCBjb3VudCA9IGNvbGxpc2lvbnNbX2tleV0gfCAwO1xuICAgICAgY29sbGlzaW9uc1tfa2V5XSA9ICsrY291bnQ7XG4gICAgICBrZXkgPSBfa2V5ICsgJy0xMWMzZmQ0Ni0zMDBjLTExZTUtOTMyYy01Y2Y5Mzg4YTZmNmMtJyArIGNvdW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXkgPSBfa2V5O1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50TW9ycGggJiYgY3VycmVudE1vcnBoLmtleSA9PT0ga2V5KSB7XG4gICAgICB5aWVsZFRlbXBsYXRlKHRlbXBsYXRlLCBlbnYsIHBhcmVudFNjb3BlLCBjdXJyZW50TW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKShibG9ja0FyZ3VtZW50cywgc2VsZik7XG4gICAgICBjdXJyZW50TW9ycGggPSBjdXJyZW50TW9ycGgubmV4dE1vcnBoO1xuICAgICAgaGFuZGxlZE1vcnBoc1trZXldID0gY3VycmVudE1vcnBoO1xuICAgIH0gZWxzZSBpZiAobW9ycGhNYXBba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsZXQgZm91bmRNb3JwaCA9IG1vcnBoTWFwW2tleV07XG5cbiAgICAgIGlmIChrZXkgaW4gY2FuZGlkYXRlcykge1xuICAgICAgICAvLyBJZiB3ZSBhbHJlYWR5IHNhdyB0aGlzIG1vcnBoLCBtb3ZlIGl0IGZvcndhcmQgdG8gdGhpcyBwb3NpdGlvblxuICAgICAgICBtb3JwaExpc3QuaW5zZXJ0QmVmb3JlTW9ycGgoZm91bmRNb3JwaCwgY3VycmVudE1vcnBoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE90aGVyd2lzZSwgbW92ZSB0aGUgcG9pbnRlciBmb3J3YXJkIHRvIHRoZSBleGlzdGluZyBtb3JwaCBmb3IgdGhpcyBrZXlcbiAgICAgICAgYWR2YW5jZVRvS2V5KGtleSk7XG4gICAgICB9XG5cbiAgICAgIGhhbmRsZWRNb3JwaHNbZm91bmRNb3JwaC5rZXldID0gZm91bmRNb3JwaDtcbiAgICAgIHlpZWxkVGVtcGxhdGUodGVtcGxhdGUsIGVudiwgcGFyZW50U2NvcGUsIGZvdW5kTW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKShibG9ja0FyZ3VtZW50cywgc2VsZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjaGlsZE1vcnBoID0gY3JlYXRlQ2hpbGRNb3JwaChlbnYuZG9tLCBtb3JwaCk7XG4gICAgICBjaGlsZE1vcnBoLmtleSA9IGtleTtcbiAgICAgIG1vcnBoTWFwW2tleV0gPSBoYW5kbGVkTW9ycGhzW2tleV0gPSBjaGlsZE1vcnBoO1xuICAgICAgbW9ycGhMaXN0Lmluc2VydEJlZm9yZU1vcnBoKGNoaWxkTW9ycGgsIGN1cnJlbnRNb3JwaCk7XG4gICAgICB5aWVsZFRlbXBsYXRlKHRlbXBsYXRlLCBlbnYsIHBhcmVudFNjb3BlLCBjaGlsZE1vcnBoLCByZW5kZXJTdGF0ZSwgdmlzaXRvcikoYmxvY2tBcmd1bWVudHMsIHNlbGYpO1xuICAgIH1cblxuICAgIHJlbmRlclN0YXRlLm1vcnBoTGlzdFRvUHJ1bmUgPSBtb3JwaExpc3Q7XG4gICAgbW9ycGguY2hpbGROb2RlcyA9IG51bGw7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGlzU3RhYmxlVGVtcGxhdGUodGVtcGxhdGUsIGxhc3RZaWVsZGVkKSB7XG4gIHJldHVybiAhbGFzdFlpZWxkZWQuc2hhZG93VGVtcGxhdGUgJiYgdGVtcGxhdGUgPT09IGxhc3RZaWVsZGVkLnRlbXBsYXRlO1xufVxuXG5mdW5jdGlvbiB5aWVsZEluU2hhZG93VGVtcGxhdGUodGVtcGxhdGUsIGVudiwgcGFyZW50U2NvcGUsIG1vcnBoLCByZW5kZXJTdGF0ZSwgdmlzaXRvcikge1xuICB2YXIgaG9zdFlpZWxkID0gaG9zdFlpZWxkV2l0aFNoYWRvd1RlbXBsYXRlKHRlbXBsYXRlLCBlbnYsIHBhcmVudFNjb3BlLCBtb3JwaCwgcmVuZGVyU3RhdGUsIHZpc2l0b3IpO1xuXG4gIHJldHVybiBmdW5jdGlvbihzaGFkb3dUZW1wbGF0ZSwgc2VsZikge1xuICAgIGhvc3RZaWVsZChzaGFkb3dUZW1wbGF0ZSwgZW52LCBzZWxmLCBbXSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBob3N0WWllbGRXaXRoU2hhZG93VGVtcGxhdGUodGVtcGxhdGUsIGVudiwgcGFyZW50U2NvcGUsIG1vcnBoLCByZW5kZXJTdGF0ZSwgdmlzaXRvcikge1xuICByZXR1cm4gZnVuY3Rpb24oc2hhZG93VGVtcGxhdGUsIGVudiwgc2VsZiwgYmxvY2tBcmd1bWVudHMpIHtcbiAgICByZW5kZXJTdGF0ZS5tb3JwaFRvQ2xlYXIgPSBudWxsO1xuXG4gICAgaWYgKG1vcnBoLmxhc3RZaWVsZGVkICYmIGlzU3RhYmxlU2hhZG93Um9vdCh0ZW1wbGF0ZSwgc2hhZG93VGVtcGxhdGUsIG1vcnBoLmxhc3RZaWVsZGVkKSkge1xuICAgICAgcmV0dXJuIG1vcnBoLmxhc3RSZXN1bHQucmV2YWxpZGF0ZVdpdGgoZW52LCB1bmRlZmluZWQsIHNlbGYsIGJsb2NrQXJndW1lbnRzLCB2aXNpdG9yKTtcbiAgICB9XG5cbiAgICB2YXIgc2hhZG93U2NvcGUgPSBlbnYuaG9va3MuY3JlYXRlRnJlc2hTY29wZSgpO1xuICAgIGVudi5ob29rcy5iaW5kU2hhZG93U2NvcGUoZW52LCBwYXJlbnRTY29wZSwgc2hhZG93U2NvcGUsIHJlbmRlclN0YXRlLnNoYWRvd09wdGlvbnMpO1xuICAgIGJsb2NrVG9ZaWVsZC5hcml0eSA9IHRlbXBsYXRlLmFyaXR5O1xuICAgIGVudi5ob29rcy5iaW5kQmxvY2soZW52LCBzaGFkb3dTY29wZSwgYmxvY2tUb1lpZWxkKTtcblxuICAgIG1vcnBoLmxhc3RZaWVsZGVkID0geyBzZWxmOiBzZWxmLCB0ZW1wbGF0ZTogdGVtcGxhdGUsIHNoYWRvd1RlbXBsYXRlOiBzaGFkb3dUZW1wbGF0ZSB9O1xuXG4gICAgLy8gUmVuZGVyIHRoZSBzaGFkb3cgdGVtcGxhdGUgd2l0aCB0aGUgYmxvY2sgYXZhaWxhYmxlXG4gICAgcmVuZGVyKHNoYWRvd1RlbXBsYXRlLnJhdywgZW52LCBzaGFkb3dTY29wZSwgeyByZW5kZXJOb2RlOiBtb3JwaCwgc2VsZjogc2VsZiwgYmxvY2tBcmd1bWVudHM6IGJsb2NrQXJndW1lbnRzIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGJsb2NrVG9ZaWVsZChlbnYsIGJsb2NrQXJndW1lbnRzLCBzZWxmLCByZW5kZXJOb2RlLCBzaGFkb3dQYXJlbnQsIHZpc2l0b3IpIHtcbiAgICBpZiAocmVuZGVyTm9kZS5sYXN0UmVzdWx0KSB7XG4gICAgICByZW5kZXJOb2RlLmxhc3RSZXN1bHQucmV2YWxpZGF0ZVdpdGgoZW52LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgYmxvY2tBcmd1bWVudHMsIHZpc2l0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2NvcGUgPSBwYXJlbnRTY29wZTtcblxuICAgICAgLy8gU2luY2UgYSB5aWVsZGVkIHRlbXBsYXRlIHNoYXJlcyBhIGBzZWxmYCB3aXRoIGl0cyBvcmlnaW5hbCBjb250ZXh0LFxuICAgICAgLy8gd2Ugb25seSBuZWVkIHRvIGNyZWF0ZSBhIG5ldyBzY29wZSBpZiB0aGUgdGVtcGxhdGUgaGFzIGJsb2NrIHBhcmFtZXRlcnNcbiAgICAgIGlmICh0ZW1wbGF0ZS5hcml0eSkge1xuICAgICAgICBzY29wZSA9IGVudi5ob29rcy5jcmVhdGVDaGlsZFNjb3BlKHBhcmVudFNjb3BlKTtcbiAgICAgIH1cblxuICAgICAgcmVuZGVyKHRlbXBsYXRlLCBlbnYsIHNjb3BlLCB7IHJlbmRlck5vZGU6IHJlbmRlck5vZGUsIHNlbGY6IHNlbGYsIGJsb2NrQXJndW1lbnRzOiBibG9ja0FyZ3VtZW50cyB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNTdGFibGVTaGFkb3dSb290KHRlbXBsYXRlLCBzaGFkb3dUZW1wbGF0ZSwgbGFzdFlpZWxkZWQpIHtcbiAgcmV0dXJuIHRlbXBsYXRlID09PSBsYXN0WWllbGRlZC50ZW1wbGF0ZSAmJiBzaGFkb3dUZW1wbGF0ZSA9PT0gbGFzdFlpZWxkZWQuc2hhZG93VGVtcGxhdGU7XG59XG5cbmZ1bmN0aW9uIG9wdGlvbnNGb3IodGVtcGxhdGUsIGludmVyc2UsIGVudiwgc2NvcGUsIG1vcnBoLCB2aXNpdG9yKSB7XG4gIC8vIElmIHRoZXJlIHdhcyBhIHRlbXBsYXRlIHlpZWxkZWQgbGFzdCB0aW1lLCBzZXQgbW9ycGhUb0NsZWFyIHNvIGl0IHdpbGwgYmUgY2xlYXJlZFxuICAvLyBpZiBubyB0ZW1wbGF0ZSBpcyB5aWVsZGVkIG9uIHRoaXMgcmVuZGVyLlxuICB2YXIgbW9ycGhUb0NsZWFyID0gbW9ycGgubGFzdFJlc3VsdCA/IG1vcnBoIDogbnVsbDtcbiAgdmFyIHJlbmRlclN0YXRlID0gbmV3IFJlbmRlclN0YXRlKG1vcnBoVG9DbGVhciwgbW9ycGgubW9ycGhMaXN0IHx8IG51bGwpO1xuXG4gIHJldHVybiB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICB0ZW1wbGF0ZTogd3JhcEZvckhlbHBlcih0ZW1wbGF0ZSwgZW52LCBzY29wZSwgbW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKSxcbiAgICAgIGludmVyc2U6IHdyYXBGb3JIZWxwZXIoaW52ZXJzZSwgZW52LCBzY29wZSwgbW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKVxuICAgIH0sXG4gICAgcmVuZGVyU3RhdGU6IHJlbmRlclN0YXRlXG4gIH07XG59XG5cbmZ1bmN0aW9uIHRoaXNGb3Iob3B0aW9ucykge1xuICByZXR1cm4ge1xuICAgIGFyaXR5OiBvcHRpb25zLnRlbXBsYXRlLmFyaXR5LFxuICAgIHlpZWxkOiBvcHRpb25zLnRlbXBsYXRlLnlpZWxkLFxuICAgIHlpZWxkSXRlbTogb3B0aW9ucy50ZW1wbGF0ZS55aWVsZEl0ZW0sXG4gICAgeWllbGRJbjogb3B0aW9ucy50ZW1wbGF0ZS55aWVsZEluXG4gIH07XG59XG5cbi8qKlxuICBIb3N0IEhvb2s6IGNyZWF0ZVNjb3BlXG5cbiAgQHBhcmFtIHtTY29wZT99IHBhcmVudFNjb3BlXG4gIEByZXR1cm4gU2NvcGVcblxuICBDb3JyZXNwb25kcyB0byBlbnRlcmluZyBhIG5ldyBIVE1MQmFycyBibG9jay5cblxuICBUaGlzIGhvb2sgaXMgaW52b2tlZCB3aGVuIGEgYmxvY2sgaXMgZW50ZXJlZCB3aXRoXG4gIGEgbmV3IGBzZWxmYCBvciBhZGRpdGlvbmFsIGxvY2FsIHZhcmlhYmxlcy5cblxuICBXaGVuIGludm9rZWQgZm9yIGEgdG9wLWxldmVsIHRlbXBsYXRlLCB0aGVcbiAgYHBhcmVudFNjb3BlYCBpcyBgbnVsbGAsIGFuZCB0aGlzIGhvb2sgc2hvdWxkIHJldHVyblxuICBhIGZyZXNoIFNjb3BlLlxuXG4gIFdoZW4gaW52b2tlZCBmb3IgYSBjaGlsZCB0ZW1wbGF0ZSwgdGhlIGBwYXJlbnRTY29wZWBcbiAgaXMgdGhlIHNjb3BlIGZvciB0aGUgcGFyZW50IGVudmlyb25tZW50LlxuXG4gIE5vdGUgdGhhdCB0aGUgYFNjb3BlYCBpcyBhbiBvcGFxdWUgdmFsdWUgdGhhdCBpc1xuICBwYXNzZWQgdG8gb3RoZXIgaG9zdCBob29rcy4gRm9yIGV4YW1wbGUsIHRoZSBgZ2V0YFxuICBob29rIHVzZXMgdGhlIHNjb3BlIHRvIHJldHJpZXZlIGEgdmFsdWUgZm9yIGEgZ2l2ZW5cbiAgc2NvcGUgYW5kIHZhcmlhYmxlIG5hbWUuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNjb3BlKGVudiwgcGFyZW50U2NvcGUpIHtcbiAgaWYgKHBhcmVudFNjb3BlKSB7XG4gICAgcmV0dXJuIGVudi5ob29rcy5jcmVhdGVDaGlsZFNjb3BlKHBhcmVudFNjb3BlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZW52Lmhvb2tzLmNyZWF0ZUZyZXNoU2NvcGUoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRnJlc2hTY29wZSgpIHtcbiAgLy8gYmVjYXVzZSBgaW5gIGNoZWNrcyBoYXZlIHVucHJlZGljdGFibGUgcGVyZm9ybWFuY2UsIGtlZXAgYVxuICAvLyBzZXBhcmF0ZSBkaWN0aW9uYXJ5IHRvIHRyYWNrIHdoZXRoZXIgYSBsb2NhbCB3YXMgYm91bmQuXG4gIC8vIFNlZSBgYmluZExvY2FsYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgcmV0dXJuIHsgc2VsZjogbnVsbCwgYmxvY2tzOiB7fSwgbG9jYWxzOiB7fSwgbG9jYWxQcmVzZW50OiB7fSB9O1xufVxuXG4vKipcbiAgSG9zdCBIb29rOiBiaW5kU2hhZG93U2NvcGVcblxuICBAcGFyYW0ge1Njb3BlP30gcGFyZW50U2NvcGVcbiAgQHJldHVybiBTY29wZVxuXG4gIENvcnJlc3BvbmRzIHRvIHJlbmRlcmluZyBhIG5ldyB0ZW1wbGF0ZSBpbnRvIGFuIGV4aXN0aW5nXG4gIHJlbmRlciB0cmVlLCBidXQgd2l0aCBhIG5ldyB0b3AtbGV2ZWwgbGV4aWNhbCBzY29wZS4gVGhpc1xuICB0ZW1wbGF0ZSBpcyBjYWxsZWQgdGhlIFwic2hhZG93IHJvb3RcIi5cblxuICBJZiBhIHNoYWRvdyB0ZW1wbGF0ZSBpbnZva2VzIGB7e3lpZWxkfX1gLCBpdCB3aWxsIHJlbmRlclxuICB0aGUgYmxvY2sgcHJvdmlkZWQgdG8gdGhlIHNoYWRvdyByb290IGluIHRoZSBvcmlnaW5hbFxuICBsZXhpY2FsIHNjb3BlLlxuXG4gIGBgYGhic1xuICB7eyEtLSBwb3N0IHRlbXBsYXRlIC0tfX1cbiAgPHA+e3twcm9wcy50aXRsZX19PC9wPlxuICB7e3lpZWxkfX1cblxuICB7eyEtLSBibG9nIHRlbXBsYXRlIC0tfX1cbiAge3sjcG9zdCB0aXRsZT1cIkhlbGxvIHdvcmxkXCJ9fVxuICAgIDxwPmJ5IHt7YnlsaW5lfX08L3A+XG4gICAgPGFydGljbGU+VGhpcyBpcyBteSBmaXJzdCBwb3N0PC9hcnRpY2xlPlxuICB7ey9wb3N0fX1cblxuICB7eyNwb3N0IHRpdGxlPVwiR29vZGJ5ZSB3b3JsZFwifX1cbiAgICA8cD5ieSB7e2J5bGluZX19PC9wPlxuICAgIDxhcnRpY2xlPlRoaXMgaXMgbXkgbGFzdCBwb3N0PC9hcnRpY2xlPlxuICB7ey9wb3N0fX1cbiAgYGBgXG5cbiAgYGBganNcbiAgaGVscGVycy5wb3N0ID0gZnVuY3Rpb24ocGFyYW1zLCBoYXNoLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucy50ZW1wbGF0ZS55aWVsZEluKHBvc3RUZW1wbGF0ZSwgeyBwcm9wczogaGFzaCB9KTtcbiAgfTtcblxuICBibG9nLnJlbmRlcih7IGJ5bGluZTogXCJZZWh1ZGEgS2F0elwiIH0pO1xuICBgYGBcblxuICBQcm9kdWNlczpcblxuICBgYGBodG1sXG4gIDxwPkhlbGxvIHdvcmxkPC9wPlxuICA8cD5ieSBZZWh1ZGEgS2F0ejwvcD5cbiAgPGFydGljbGU+VGhpcyBpcyBteSBmaXJzdCBwb3N0PC9hcnRpY2xlPlxuXG4gIDxwPkdvb2RieWUgd29ybGQ8L3A+XG4gIDxwPmJ5IFllaHVkYSBLYXR6PC9wPlxuICA8YXJ0aWNsZT5UaGlzIGlzIG15IGxhc3QgcG9zdDwvYXJ0aWNsZT5cbiAgYGBgXG5cbiAgSW4gc2hvcnQsIGB5aWVsZEluYCBjcmVhdGVzIGEgbmV3IHRvcC1sZXZlbCBzY29wZSBmb3IgdGhlXG4gIHByb3ZpZGVkIHRlbXBsYXRlIGFuZCByZW5kZXJzIGl0LCBtYWtpbmcgdGhlIG9yaWdpbmFsIGJsb2NrXG4gIGF2YWlsYWJsZSB0byBge3t5aWVsZH19YCBpbiB0aGF0IHRlbXBsYXRlLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kU2hhZG93U2NvcGUoZW52IC8qLCBwYXJlbnRTY29wZSwgc2hhZG93U2NvcGUgKi8pIHtcbiAgcmV0dXJuIGVudi5ob29rcy5jcmVhdGVGcmVzaFNjb3BlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDaGlsZFNjb3BlKHBhcmVudCkge1xuICB2YXIgc2NvcGUgPSBPYmplY3QuY3JlYXRlKHBhcmVudCk7XG4gIHNjb3BlLmxvY2FscyA9IE9iamVjdC5jcmVhdGUocGFyZW50LmxvY2Fscyk7XG4gIHJldHVybiBzY29wZTtcbn1cblxuLyoqXG4gIEhvc3QgSG9vazogYmluZFNlbGZcblxuICBAcGFyYW0ge1Njb3BlfSBzY29wZVxuICBAcGFyYW0ge2FueX0gc2VsZlxuXG4gIENvcnJlc3BvbmRzIHRvIGVudGVyaW5nIGEgdGVtcGxhdGUuXG5cbiAgVGhpcyBob29rIGlzIGludm9rZWQgd2hlbiB0aGUgYHNlbGZgIHZhbHVlIGZvciBhIHNjb3BlIGlzIHJlYWR5IHRvIGJlIGJvdW5kLlxuXG4gIFRoZSBob3N0IG11c3QgZW5zdXJlIHRoYXQgY2hpbGQgc2NvcGVzIHJlZmxlY3QgdGhlIGNoYW5nZSB0byB0aGUgYHNlbGZgIGluXG4gIGZ1dHVyZSBjYWxscyB0byB0aGUgYGdldGAgaG9vay5cbiovXG5leHBvcnQgZnVuY3Rpb24gYmluZFNlbGYoZW52LCBzY29wZSwgc2VsZikge1xuICBzY29wZS5zZWxmID0gc2VsZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlbGYoZW52LCBzY29wZSwgc2VsZikge1xuICBlbnYuaG9va3MuYmluZFNlbGYoZW52LCBzY29wZSwgc2VsZik7XG59XG5cbi8qKlxuICBIb3N0IEhvb2s6IGJpbmRMb2NhbFxuXG4gIEBwYXJhbSB7RW52aXJvbm1lbnR9IGVudlxuICBAcGFyYW0ge1Njb3BlfSBzY29wZVxuICBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICBAcGFyYW0ge2FueX0gdmFsdWVcblxuICBDb3JyZXNwb25kcyB0byBlbnRlcmluZyBhIHRlbXBsYXRlIHdpdGggYmxvY2sgYXJndW1lbnRzLlxuXG4gIFRoaXMgaG9vayBpcyBpbnZva2VkIHdoZW4gYSBsb2NhbCB2YXJpYWJsZSBmb3IgYSBzY29wZSBoYXMgYmVlbiBwcm92aWRlZC5cblxuICBUaGUgaG9zdCBtdXN0IGVuc3VyZSB0aGF0IGNoaWxkIHNjb3BlcyByZWZsZWN0IHRoZSBjaGFuZ2UgaW4gZnV0dXJlIGNhbGxzXG4gIHRvIHRoZSBgZ2V0YCBob29rLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kTG9jYWwoZW52LCBzY29wZSwgbmFtZSwgdmFsdWUpIHtcbiAgc2NvcGUubG9jYWxQcmVzZW50W25hbWVdID0gdHJ1ZTtcbiAgc2NvcGUubG9jYWxzW25hbWVdID0gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVMb2NhbChlbnYsIHNjb3BlLCBuYW1lLCB2YWx1ZSkge1xuICBlbnYuaG9va3MuYmluZExvY2FsKGVudiwgc2NvcGUsIG5hbWUsIHZhbHVlKTtcbn1cblxuLyoqXG4gIEhvc3QgSG9vazogYmluZEJsb2NrXG5cbiAgQHBhcmFtIHtFbnZpcm9ubWVudH0gZW52XG4gIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gIEBwYXJhbSB7RnVuY3Rpb259IGJsb2NrXG5cbiAgQ29ycmVzcG9uZHMgdG8gZW50ZXJpbmcgYSBzaGFkb3cgdGVtcGxhdGUgdGhhdCB3YXMgaW52b2tlZCBieSBhIGJsb2NrIGhlbHBlciB3aXRoXG4gIGB5aWVsZEluYC5cblxuICBUaGlzIGhvb2sgaXMgaW52b2tlZCB3aXRoIGFuIG9wYXF1ZSBibG9jayB0aGF0IHdpbGwgYmUgcGFzc2VkIGFsb25nXG4gIHRvIHRoZSBzaGFkb3cgdGVtcGxhdGUsIGFuZCBpbnNlcnRlZCBpbnRvIHRoZSBzaGFkb3cgdGVtcGxhdGUgd2hlblxuICBge3t5aWVsZH19YCBpcyB1c2VkLiBPcHRpb25hbGx5IHByb3ZpZGUgYSBub24tZGVmYXVsdCBibG9jayBuYW1lXG4gIHRoYXQgY2FuIGJlIHRhcmdldGVkIGJ5IGB7e3lpZWxkIHRvPWJsb2NrTmFtZX19YC5cbiovXG5leHBvcnQgZnVuY3Rpb24gYmluZEJsb2NrKGVudiwgc2NvcGUsIGJsb2NrLCBuYW1lPSdkZWZhdWx0Jykge1xuICBzY29wZS5ibG9ja3NbbmFtZV0gPSBibG9jaztcbn1cblxuLyoqXG4gIEhvc3QgSG9vazogYmxvY2tcblxuICBAcGFyYW0ge1JlbmRlck5vZGV9IHJlbmRlck5vZGVcbiAgQHBhcmFtIHtFbnZpcm9ubWVudH0gZW52XG4gIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gIEBwYXJhbSB7QXJyYXl9IHBhcmFtc1xuICBAcGFyYW0ge09iamVjdH0gaGFzaFxuICBAcGFyYW0ge0Jsb2NrfSBibG9ja1xuICBAcGFyYW0ge0Jsb2NrfSBlbHNlQmxvY2tcblxuICBDb3JyZXNwb25kcyB0bzpcblxuICBgYGBoYnNcbiAge3sjaGVscGVyIHBhcmFtMSBwYXJhbTIga2V5MT12YWwxIGtleTI9dmFsMn19XG4gICAge3shLS0gY2hpbGQgdGVtcGxhdGUgLS19fVxuICB7ey9oZWxwZXJ9fVxuICBgYGBcblxuICBUaGlzIGhvc3QgaG9vayBpcyBhIHdvcmtob3JzZSBvZiB0aGUgc3lzdGVtLiBJdCBpcyBpbnZva2VkXG4gIHdoZW5ldmVyIGEgYmxvY2sgaXMgZW5jb3VudGVyZWQsIGFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAgcmVzb2x2aW5nIHRoZSBoZWxwZXIgdG8gY2FsbCwgYW5kIHRoZW4gaW52b2tlIGl0LlxuXG4gIFRoZSBoZWxwZXIgc2hvdWxkIGJlIGludm9rZWQgd2l0aDpcblxuICAtIGB7QXJyYXl9IHBhcmFtc2A6IHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byB0aGUgaGVscGVyXG4gICAgaW4gdGhlIHRlbXBsYXRlLlxuICAtIGB7T2JqZWN0fSBoYXNoYDogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleXMgYW5kIHZhbHVlcyBwYXNzZWRcbiAgICBpbiB0aGUgaGFzaCBwb3NpdGlvbiBpbiB0aGUgdGVtcGxhdGUuXG5cbiAgVGhlIHZhbHVlcyBpbiBgcGFyYW1zYCBhbmQgYGhhc2hgIHdpbGwgYWxyZWFkeSBiZSByZXNvbHZlZFxuICB0aHJvdWdoIGEgcHJldmlvdXMgY2FsbCB0byB0aGUgYGdldGAgaG9zdCBob29rLlxuXG4gIFRoZSBoZWxwZXIgc2hvdWxkIGJlIGludm9rZWQgd2l0aCBhIGB0aGlzYCB2YWx1ZSB0aGF0IGlzXG4gIGFuIG9iamVjdCB3aXRoIG9uZSBmaWVsZDpcblxuICBge0Z1bmN0aW9ufSB5aWVsZGA6IHdoZW4gaW52b2tlZCwgdGhpcyBmdW5jdGlvbiBleGVjdXRlcyB0aGVcbiAgYmxvY2sgd2l0aCB0aGUgY3VycmVudCBzY29wZS4gSXQgdGFrZXMgYW4gb3B0aW9uYWwgYXJyYXkgb2ZcbiAgYmxvY2sgcGFyYW1ldGVycy4gSWYgYmxvY2sgcGFyYW1ldGVycyBhcmUgc3VwcGxpZWQsIEhUTUxCYXJzXG4gIHdpbGwgaW52b2tlIHRoZSBgYmluZExvY2FsYCBob3N0IGhvb2sgdG8gYmluZCB0aGUgc3VwcGxpZWRcbiAgdmFsdWVzIHRvIHRoZSBibG9jayBhcmd1bWVudHMgcHJvdmlkZWQgYnkgdGhlIHRlbXBsYXRlLlxuXG4gIEluIGdlbmVyYWwsIHRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mIGBibG9ja2Agc2hvdWxkIHdvcmtcbiAgZm9yIG1vc3QgaG9zdCBlbnZpcm9ubWVudHMuIEl0IGRlbGVnYXRlcyB0byBvdGhlciBob3N0IGhvb2tzXG4gIHdoZXJlIGFwcHJvcHJpYXRlLCBhbmQgcHJvcGVybHkgaW52b2tlcyB0aGUgaGVscGVyIHdpdGggdGhlXG4gIGFwcHJvcHJpYXRlIGFyZ3VtZW50cy5cbiovXG5leHBvcnQgZnVuY3Rpb24gYmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgdGVtcGxhdGUsIGludmVyc2UsIHZpc2l0b3IpIHtcbiAgaWYgKGhhbmRsZVJlZGlyZWN0KG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnRpbnVlQmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgdGVtcGxhdGUsIGludmVyc2UsIHZpc2l0b3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udGludWVCbG9jayhtb3JwaCwgZW52LCBzY29wZSwgcGF0aCwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZSwgaW52ZXJzZSwgdmlzaXRvcikge1xuICBob3N0QmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlLCBpbnZlcnNlLCBudWxsLCB2aXNpdG9yLCBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGhlbHBlciA9IGVudi5ob29rcy5sb29rdXBIZWxwZXIoZW52LCBzY29wZSwgcGF0aCk7XG4gICAgcmV0dXJuIGVudi5ob29rcy5pbnZva2VIZWxwZXIobW9ycGgsIGVudiwgc2NvcGUsIHZpc2l0b3IsIHBhcmFtcywgaGFzaCwgaGVscGVyLCBvcHRpb25zLnRlbXBsYXRlcywgdGhpc0ZvcihvcHRpb25zLnRlbXBsYXRlcykpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhvc3RCbG9jayhtb3JwaCwgZW52LCBzY29wZSwgdGVtcGxhdGUsIGludmVyc2UsIHNoYWRvd09wdGlvbnMsIHZpc2l0b3IsIGNhbGxiYWNrKSB7XG4gIHZhciBvcHRpb25zID0gb3B0aW9uc0Zvcih0ZW1wbGF0ZSwgaW52ZXJzZSwgZW52LCBzY29wZSwgbW9ycGgsIHZpc2l0b3IpO1xuICByZW5kZXJBbmRDbGVhbnVwKG1vcnBoLCBlbnYsIG9wdGlvbnMsIHNoYWRvd09wdGlvbnMsIGNhbGxiYWNrKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVJlZGlyZWN0KG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKSB7XG4gIGlmICghcGF0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciByZWRpcmVjdCA9IGVudi5ob29rcy5jbGFzc2lmeShlbnYsIHNjb3BlLCBwYXRoKTtcbiAgaWYgKHJlZGlyZWN0KSB7XG4gICAgc3dpdGNoKHJlZGlyZWN0KSB7XG4gICAgICBjYXNlICdjb21wb25lbnQnOiBlbnYuaG9va3MuY29tcG9uZW50KG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCBwYXJhbXMsIGhhc2gsIHtkZWZhdWx0OiB0ZW1wbGF0ZSwgaW52ZXJzZX0sIHZpc2l0b3IpOyBicmVhaztcbiAgICAgIGNhc2UgJ2lubGluZSc6IGVudi5ob29rcy5pbmxpbmUobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgdmlzaXRvcik7IGJyZWFrO1xuICAgICAgY2FzZSAnYmxvY2snOiBlbnYuaG9va3MuYmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgdGVtcGxhdGUsIGludmVyc2UsIHZpc2l0b3IpOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihcIkludGVybmFsIEhUTUxCYXJzIHJlZGlyZWN0aW9uIHRvIFwiICsgcmVkaXJlY3QgKyBcIiBub3Qgc3VwcG9ydGVkXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChoYW5kbGVLZXl3b3JkKHBhdGgsIG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlS2V5d29yZChwYXRoLCBtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZSwgaW52ZXJzZSwgdmlzaXRvcikge1xuICB2YXIga2V5d29yZCA9IGVudi5ob29rcy5rZXl3b3Jkc1twYXRoXTtcbiAgaWYgKCFrZXl3b3JkKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGlmICh0eXBlb2Yga2V5d29yZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBrZXl3b3JkKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKTtcbiAgfVxuXG4gIGlmIChrZXl3b3JkLndpbGxSZW5kZXIpIHtcbiAgICBrZXl3b3JkLndpbGxSZW5kZXIobW9ycGgsIGVudik7XG4gIH1cblxuICB2YXIgbGFzdFN0YXRlLCBuZXdTdGF0ZTtcbiAgaWYgKGtleXdvcmQuc2V0dXBTdGF0ZSkge1xuICAgIGxhc3RTdGF0ZSA9IHNoYWxsb3dDb3B5KG1vcnBoLnN0YXRlKTtcbiAgICBuZXdTdGF0ZSA9IG1vcnBoLnN0YXRlID0ga2V5d29yZC5zZXR1cFN0YXRlKGxhc3RTdGF0ZSwgZW52LCBzY29wZSwgcGFyYW1zLCBoYXNoKTtcbiAgfVxuXG4gIGlmIChrZXl3b3JkLmNoaWxkRW52KSB7XG4gICAgLy8gQnVpbGQgdGhlIGNoaWxkIGVudmlyb25tZW50Li4uXG4gICAgZW52ID0ga2V5d29yZC5jaGlsZEVudihtb3JwaC5zdGF0ZSwgZW52KTtcblxuICAgIC8vIC4udGhlbiBzYXZlIG9mZiB0aGUgY2hpbGQgZW52IGJ1aWxkZXIgb24gdGhlIHJlbmRlciBub2RlLiBJZiB0aGUgcmVuZGVyXG4gICAgLy8gbm9kZSB0cmVlIGlzIHJlLXJlbmRlcmVkIGFuZCB0aGlzIG5vZGUgaXMgbm90IGRpcnR5LCB0aGUgY2hpbGQgZW52XG4gICAgLy8gYnVpbGRlciB3aWxsIHN0aWxsIGJlIGludm9rZWQgc28gdGhhdCBjaGlsZCBkaXJ0eSByZW5kZXIgbm9kZXMgc3RpbGwgZ2V0XG4gICAgLy8gdGhlIGNvcnJlY3QgY2hpbGQgZW52LlxuICAgIG1vcnBoLmJ1aWxkQ2hpbGRFbnYgPSBrZXl3b3JkLmNoaWxkRW52O1xuICB9XG5cbiAgdmFyIGZpcnN0VGltZSA9ICFtb3JwaC5yZW5kZXJlZDtcblxuICBpZiAoa2V5d29yZC5pc0VtcHR5KSB7XG4gICAgdmFyIGlzRW1wdHkgPSBrZXl3b3JkLmlzRW1wdHkobW9ycGguc3RhdGUsIGVudiwgc2NvcGUsIHBhcmFtcywgaGFzaCk7XG5cbiAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgaWYgKCFmaXJzdFRpbWUpIHsgY2xlYXJNb3JwaChtb3JwaCwgZW52LCBmYWxzZSk7IH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChmaXJzdFRpbWUpIHtcbiAgICBpZiAoa2V5d29yZC5yZW5kZXIpIHtcbiAgICAgIGtleXdvcmQucmVuZGVyKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKTtcbiAgICB9XG4gICAgbW9ycGgucmVuZGVyZWQgPSB0cnVlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFyIGlzU3RhYmxlO1xuICBpZiAoa2V5d29yZC5pc1N0YWJsZSkge1xuICAgIGlzU3RhYmxlID0ga2V5d29yZC5pc1N0YWJsZShsYXN0U3RhdGUsIG5ld1N0YXRlKTtcbiAgfSBlbHNlIHtcbiAgICBpc1N0YWJsZSA9IHN0YWJsZVN0YXRlKGxhc3RTdGF0ZSwgbmV3U3RhdGUpO1xuICB9XG5cbiAgaWYgKGlzU3RhYmxlKSB7XG4gICAgaWYgKGtleXdvcmQucmVyZW5kZXIpIHtcbiAgICAgIHZhciBuZXdFbnYgPSBrZXl3b3JkLnJlcmVuZGVyKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKTtcbiAgICAgIGVudiA9IG5ld0VudiB8fCBlbnY7XG4gICAgfVxuICAgIHZhbGlkYXRlQ2hpbGRNb3JwaHMoZW52LCBtb3JwaCwgdmlzaXRvcik7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgY2xlYXJNb3JwaChtb3JwaCwgZW52LCBmYWxzZSk7XG4gIH1cblxuICAvLyBJZiB0aGUgbm9kZSBpcyB1bnN0YWJsZSwgcmUtcmVuZGVyIGZyb20gc2NyYXRjaFxuICBpZiAoa2V5d29yZC5yZW5kZXIpIHtcbiAgICBrZXl3b3JkLnJlbmRlcihtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZSwgaW52ZXJzZSwgdmlzaXRvcik7XG4gICAgbW9ycGgucmVuZGVyZWQgPSB0cnVlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0YWJsZVN0YXRlKG9sZFN0YXRlLCBuZXdTdGF0ZSkge1xuICBpZiAoa2V5TGVuZ3RoKG9sZFN0YXRlKSAhPT0ga2V5TGVuZ3RoKG5ld1N0YXRlKSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICBmb3IgKHZhciBwcm9wIGluIG9sZFN0YXRlKSB7XG4gICAgaWYgKG9sZFN0YXRlW3Byb3BdICE9PSBuZXdTdGF0ZVtwcm9wXSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlua1JlbmRlck5vZGUoLyogbW9ycGgsIGVudiwgc2NvcGUsIHBhcmFtcywgaGFzaCAqLykge1xuICByZXR1cm47XG59XG5cbi8qKlxuICBIb3N0IEhvb2s6IGlubGluZVxuXG4gIEBwYXJhbSB7UmVuZGVyTm9kZX0gcmVuZGVyTm9kZVxuICBAcGFyYW0ge0Vudmlyb25tZW50fSBlbnZcbiAgQHBhcmFtIHtTY29wZX0gc2NvcGVcbiAgQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgQHBhcmFtIHtBcnJheX0gcGFyYW1zXG4gIEBwYXJhbSB7SGFzaH0gaGFzaFxuXG4gIENvcnJlc3BvbmRzIHRvOlxuXG4gIGBgYGhic1xuICB7e2hlbHBlciBwYXJhbTEgcGFyYW0yIGtleTE9dmFsMSBrZXkyPXZhbDJ9fVxuICBgYGBcblxuICBUaGlzIGhvc3QgaG9vayBpcyBzaW1pbGFyIHRvIHRoZSBgYmxvY2tgIGhvc3QgaG9vaywgYnV0IGl0XG4gIGludm9rZXMgaGVscGVycyB0aGF0IGRvIG5vdCBzdXBwbHkgYW4gYXR0YWNoZWQgYmxvY2suXG5cbiAgTGlrZSB0aGUgYGJsb2NrYCBob29rLCB0aGUgaGVscGVyIHNob3VsZCBiZSBpbnZva2VkIHdpdGg6XG5cbiAgLSBge0FycmF5fSBwYXJhbXNgOiB0aGUgcGFyYW1ldGVycyBwYXNzZWQgdG8gdGhlIGhlbHBlclxuICAgIGluIHRoZSB0ZW1wbGF0ZS5cbiAgLSBge09iamVjdH0gaGFzaGA6IGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBrZXlzIGFuZCB2YWx1ZXMgcGFzc2VkXG4gICAgaW4gdGhlIGhhc2ggcG9zaXRpb24gaW4gdGhlIHRlbXBsYXRlLlxuXG4gIFRoZSB2YWx1ZXMgaW4gYHBhcmFtc2AgYW5kIGBoYXNoYCB3aWxsIGFscmVhZHkgYmUgcmVzb2x2ZWRcbiAgdGhyb3VnaCBhIHByZXZpb3VzIGNhbGwgdG8gdGhlIGBnZXRgIGhvc3QgaG9vay5cblxuICBJbiBnZW5lcmFsLCB0aGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiBgaW5saW5lYCBzaG91bGQgd29ya1xuICBmb3IgbW9zdCBob3N0IGVudmlyb25tZW50cy4gSXQgZGVsZWdhdGVzIHRvIG90aGVyIGhvc3QgaG9va3NcbiAgd2hlcmUgYXBwcm9wcmlhdGUsIGFuZCBwcm9wZXJseSBpbnZva2VzIHRoZSBoZWxwZXIgd2l0aCB0aGVcbiAgYXBwcm9wcmlhdGUgYXJndW1lbnRzLlxuXG4gIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mIGBpbmxpbmVgIGFsc28gbWFrZXMgYHBhcnRpYWxgXG4gIGEga2V5d29yZC4gSW5zdGVhZCBvZiBpbnZva2luZyBhIGhlbHBlciBuYW1lZCBgcGFydGlhbGAsXG4gIGl0IGludm9rZXMgdGhlIGBwYXJ0aWFsYCBob3N0IGhvb2suXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlubGluZShtb3JwaCwgZW52LCBzY29wZSwgcGF0aCwgcGFyYW1zLCBoYXNoLCB2aXNpdG9yKSB7XG4gIGlmIChoYW5kbGVSZWRpcmVjdChtb3JwaCwgZW52LCBzY29wZSwgcGF0aCwgcGFyYW1zLCBoYXNoLCBudWxsLCBudWxsLCB2aXNpdG9yKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB2YWx1ZSwgaGFzVmFsdWU7XG4gIGlmIChtb3JwaC5saW5rZWRSZXN1bHQpIHtcbiAgICB2YWx1ZSA9IGVudi5ob29rcy5nZXRWYWx1ZShtb3JwaC5saW5rZWRSZXN1bHQpO1xuICAgIGhhc1ZhbHVlID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnNGb3IobnVsbCwgbnVsbCwgZW52LCBzY29wZSwgbW9ycGgpO1xuXG4gICAgdmFyIGhlbHBlciA9IGVudi5ob29rcy5sb29rdXBIZWxwZXIoZW52LCBzY29wZSwgcGF0aCk7XG4gICAgdmFyIHJlc3VsdCA9IGVudi5ob29rcy5pbnZva2VIZWxwZXIobW9ycGgsIGVudiwgc2NvcGUsIHZpc2l0b3IsIHBhcmFtcywgaGFzaCwgaGVscGVyLCBvcHRpb25zLnRlbXBsYXRlcywgdGhpc0ZvcihvcHRpb25zLnRlbXBsYXRlcykpO1xuXG4gICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGluaykge1xuICAgICAgbW9ycGgubGlua2VkUmVzdWx0ID0gcmVzdWx0LnZhbHVlO1xuICAgICAgbGlua1BhcmFtcyhlbnYsIHNjb3BlLCBtb3JwaCwgJ0Bjb250ZW50LWhlbHBlcicsIFttb3JwaC5saW5rZWRSZXN1bHRdLCBudWxsKTtcbiAgICB9XG5cbiAgICBpZiAocmVzdWx0ICYmICd2YWx1ZScgaW4gcmVzdWx0KSB7XG4gICAgICB2YWx1ZSA9IGVudi5ob29rcy5nZXRWYWx1ZShyZXN1bHQudmFsdWUpO1xuICAgICAgaGFzVmFsdWUgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChoYXNWYWx1ZSkge1xuICAgIGlmIChtb3JwaC5sYXN0VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICBtb3JwaC5zZXRDb250ZW50KHZhbHVlKTtcbiAgICB9XG4gICAgbW9ycGgubGFzdFZhbHVlID0gdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtleXdvcmQocGF0aCwgbW9ycGgsIGVudiwgc2NvcGUsIHBhcmFtcywgaGFzaCwgdGVtcGxhdGUsIGludmVyc2UsIHZpc2l0b3IpICB7XG4gIGhhbmRsZUtleXdvcmQocGF0aCwgbW9ycGgsIGVudiwgc2NvcGUsIHBhcmFtcywgaGFzaCwgdGVtcGxhdGUsIGludmVyc2UsIHZpc2l0b3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlSGVscGVyKG1vcnBoLCBlbnYsIHNjb3BlLCB2aXNpdG9yLCBfcGFyYW1zLCBfaGFzaCwgaGVscGVyLCB0ZW1wbGF0ZXMsIGNvbnRleHQpIHtcbiAgdmFyIHBhcmFtcyA9IG5vcm1hbGl6ZUFycmF5KGVudiwgX3BhcmFtcyk7XG4gIHZhciBoYXNoID0gbm9ybWFsaXplT2JqZWN0KGVudiwgX2hhc2gpO1xuICByZXR1cm4geyB2YWx1ZTogaGVscGVyLmNhbGwoY29udGV4dCwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZXMpIH07XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KGVudiwgYXJyYXkpIHtcbiAgdmFyIG91dCA9IG5ldyBBcnJheShhcnJheS5sZW5ndGgpO1xuXG4gIGZvciAodmFyIGk9MCwgbD1hcnJheS5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgb3V0W2ldID0gZW52Lmhvb2tzLmdldENlbGxPclZhbHVlKGFycmF5W2ldKTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU9iamVjdChlbnYsIG9iamVjdCkge1xuICB2YXIgb3V0ID0ge307XG5cbiAgZm9yICh2YXIgcHJvcCBpbiBvYmplY3QpICB7XG4gICAgb3V0W3Byb3BdID0gZW52Lmhvb2tzLmdldENlbGxPclZhbHVlKG9iamVjdFtwcm9wXSk7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnkoLyogZW52LCBzY29wZSwgcGF0aCAqLykge1xuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IHZhciBrZXl3b3JkcyA9IHtcbiAgcGFydGlhbDogZnVuY3Rpb24obW9ycGgsIGVudiwgc2NvcGUsIHBhcmFtcykge1xuICAgIHZhciB2YWx1ZSA9IGVudi5ob29rcy5wYXJ0aWFsKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJhbXNbMF0pO1xuICAgIG1vcnBoLnNldENvbnRlbnQodmFsdWUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIHlpZWxkOiBmdW5jdGlvbihtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZSwgaW52ZXJzZSwgdmlzaXRvcikge1xuICAgIC8vIHRoZSBjdXJyZW50IHNjb3BlIGlzIHByb3ZpZGVkIHB1cmVseSBmb3IgdGhlIGNyZWF0aW9uIG9mIHNoYWRvd1xuICAgIC8vIHNjb3BlczsgaXQgc2hvdWxkIG5vdCBiZSBwcm92aWRlZCB0byB1c2VyIGNvZGUuXG5cbiAgICB2YXIgdG8gPSBlbnYuaG9va3MuZ2V0VmFsdWUoaGFzaC50bykgfHwgJ2RlZmF1bHQnO1xuICAgIGlmIChzY29wZS5ibG9ja3NbdG9dKSB7XG4gICAgICBzY29wZS5ibG9ja3NbdG9dKGVudiwgcGFyYW1zLCBoYXNoLnNlbGYsIG1vcnBoLCBzY29wZSwgdmlzaXRvcik7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGhhc0Jsb2NrOiBmdW5jdGlvbihtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zKSB7XG4gICAgdmFyIG5hbWUgPSBlbnYuaG9va3MuZ2V0VmFsdWUocGFyYW1zWzBdKSB8fCAnZGVmYXVsdCc7XG4gICAgcmV0dXJuICEhc2NvcGUuYmxvY2tzW25hbWVdO1xuICB9LFxuXG4gIGhhc0Jsb2NrUGFyYW1zOiBmdW5jdGlvbihtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zKSB7XG4gICAgdmFyIG5hbWUgPSBlbnYuaG9va3MuZ2V0VmFsdWUocGFyYW1zWzBdKSB8fCAnZGVmYXVsdCc7XG4gICAgcmV0dXJuICEhKHNjb3BlLmJsb2Nrc1tuYW1lXSAmJiBzY29wZS5ibG9ja3NbbmFtZV0uYXJpdHkpO1xuICB9XG5cbn07XG5cbi8qKlxuICBIb3N0IEhvb2s6IHBhcnRpYWxcblxuICBAcGFyYW0ge1JlbmRlck5vZGV9IHJlbmRlck5vZGVcbiAgQHBhcmFtIHtFbnZpcm9ubWVudH0gZW52XG4gIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG5cbiAgQ29ycmVzcG9uZHMgdG86XG5cbiAgYGBgaGJzXG4gIHt7cGFydGlhbCBcImxvY2F0aW9uXCJ9fVxuICBgYGBcblxuICBUaGlzIGhvc3QgaG9vayBpcyBpbnZva2VkIGJ5IHRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mXG4gIHRoZSBgaW5saW5lYCBob29rLiBUaGlzIG1ha2VzIGBwYXJ0aWFsYCBhIGtleXdvcmQgaW4gYW5cbiAgSFRNTEJhcnMgZW52aXJvbm1lbnQgdXNpbmcgdGhlIGRlZmF1bHQgYGlubGluZWAgaG9zdCBob29rLlxuXG4gIEl0IGlzIGltcGxlbWVudGVkIGFzIGEgaG9zdCBob29rIHNvIHRoYXQgaXQgY2FuIHJldHJpZXZlXG4gIHRoZSBuYW1lZCBwYXJ0aWFsIG91dCBvZiB0aGUgYEVudmlyb25tZW50YC4gSGVscGVycywgaW5cbiAgY29udHJhc3QsIG9ubHkgaGF2ZSBhY2Nlc3MgdG8gdGhlIHZhbHVlcyBwYXNzZWQgaW4gdG8gdGhlbSxcbiAgYW5kIG5vdCB0byB0aGUgYW1iaWVudCBsZXhpY2FsIGVudmlyb25tZW50LlxuXG4gIFRoZSBob3N0IGhvb2sgc2hvdWxkIGludm9rZSB0aGUgcmVmZXJlbmNlZCBwYXJ0aWFsIHdpdGhcbiAgdGhlIGFtYmllbnQgYHNlbGZgLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJ0aWFsKHJlbmRlck5vZGUsIGVudiwgc2NvcGUsIHBhdGgpIHtcbiAgdmFyIHRlbXBsYXRlID0gZW52LnBhcnRpYWxzW3BhdGhdO1xuICByZXR1cm4gdGVtcGxhdGUucmVuZGVyKHNjb3BlLnNlbGYsIGVudiwge30pLmZyYWdtZW50O1xufVxuXG4vKipcbiAgSG9zdCBob29rOiByYW5nZVxuXG4gIEBwYXJhbSB7UmVuZGVyTm9kZX0gcmVuZGVyTm9kZVxuICBAcGFyYW0ge0Vudmlyb25tZW50fSBlbnZcbiAgQHBhcmFtIHtTY29wZX0gc2NvcGVcbiAgQHBhcmFtIHthbnl9IHZhbHVlXG5cbiAgQ29ycmVzcG9uZHMgdG86XG5cbiAgYGBgaGJzXG4gIHt7Y29udGVudH19XG4gIHt7e3VuZXNjYXBlZH19fVxuICBgYGBcblxuICBUaGlzIGhvb2sgaXMgcmVzcG9uc2libGUgZm9yIHVwZGF0aW5nIGEgcmVuZGVyIG5vZGVcbiAgdGhhdCByZXByZXNlbnRzIGEgcmFuZ2Ugb2YgY29udGVudCB3aXRoIGEgdmFsdWUuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmdlKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCB2YWx1ZSwgdmlzaXRvcikge1xuICBpZiAoaGFuZGxlUmVkaXJlY3QobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIFt2YWx1ZV0sIHt9LCBudWxsLCBudWxsLCB2aXNpdG9yKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhbHVlID0gZW52Lmhvb2tzLmdldFZhbHVlKHZhbHVlKTtcblxuICBpZiAobW9ycGgubGFzdFZhbHVlICE9PSB2YWx1ZSkge1xuICAgIG1vcnBoLnNldENvbnRlbnQodmFsdWUpO1xuICB9XG5cbiAgbW9ycGgubGFzdFZhbHVlID0gdmFsdWU7XG59XG5cbi8qKlxuICBIb3N0IGhvb2s6IGVsZW1lbnRcblxuICBAcGFyYW0ge1JlbmRlck5vZGV9IHJlbmRlck5vZGVcbiAgQHBhcmFtIHtFbnZpcm9ubWVudH0gZW52XG4gIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gIEBwYXJhbSB7QXJyYXl9IHBhcmFtc1xuICBAcGFyYW0ge0hhc2h9IGhhc2hcblxuICBDb3JyZXNwb25kcyB0bzpcblxuICBgYGBoYnNcbiAgPGRpdiB7e2JpbmQtYXR0ciBmb289YmFyfX0+PC9kaXY+XG4gIGBgYFxuXG4gIFRoaXMgaG9vayBpcyByZXNwb25zaWJsZSBmb3IgaW52b2tpbmcgYSBoZWxwZXIgdGhhdFxuICBtb2RpZmllcyBhbiBlbGVtZW50LlxuXG4gIEl0cyBwdXJwb3NlIGlzIGxhcmdlbHkgbGVnYWN5IHN1cHBvcnQgZm9yIGF3a3dhcmRcbiAgaWRpb21zIHRoYXQgYmVjYW1lIGNvbW1vbiB3aGVuIHVzaW5nIHRoZSBzdHJpbmctYmFzZWRcbiAgSGFuZGxlYmFycyBlbmdpbmUuXG5cbiAgTW9zdCBvZiB0aGUgdXNlcyBvZiB0aGUgYGVsZW1lbnRgIGhvb2sgYXJlIGV4cGVjdGVkXG4gIHRvIGJlIHN1cGVyc2VkZWQgYnkgY29tcG9uZW50IHN5bnRheCBhbmQgdGhlXG4gIGBhdHRyaWJ1dGVgIGhvb2suXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGVsZW1lbnQobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgdmlzaXRvcikge1xuICBpZiAoaGFuZGxlUmVkaXJlY3QobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgbnVsbCwgbnVsbCwgdmlzaXRvcikpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaGVscGVyID0gZW52Lmhvb2tzLmxvb2t1cEhlbHBlcihlbnYsIHNjb3BlLCBwYXRoKTtcbiAgaWYgKGhlbHBlcikge1xuICAgIGVudi5ob29rcy5pbnZva2VIZWxwZXIobnVsbCwgZW52LCBzY29wZSwgbnVsbCwgcGFyYW1zLCBoYXNoLCBoZWxwZXIsIHsgZWxlbWVudDogbW9ycGguZWxlbWVudCB9KTtcbiAgfVxufVxuXG4vKipcbiAgSG9zdCBob29rOiBhdHRyaWJ1dGVcblxuICBAcGFyYW0ge1JlbmRlck5vZGV9IHJlbmRlck5vZGVcbiAgQHBhcmFtIHtFbnZpcm9ubWVudH0gZW52XG4gIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gIEBwYXJhbSB7YW55fSB2YWx1ZVxuXG4gIENvcnJlc3BvbmRzIHRvOlxuXG4gIGBgYGhic1xuICA8ZGl2IGZvbz17e2Jhcn19PjwvZGl2PlxuICBgYGBcblxuICBUaGlzIGhvb2sgaXMgcmVzcG9uc2libGUgZm9yIHVwZGF0aW5nIGEgcmVuZGVyIG5vZGVcbiAgdGhhdCByZXByZXNlbnRzIGFuIGVsZW1lbnQncyBhdHRyaWJ1dGUgd2l0aCBhIHZhbHVlLlxuXG4gIEl0IHJlY2VpdmVzIHRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgYXMgd2VsbCBhcyBhblxuICBhbHJlYWR5LXJlc29sdmVkIHZhbHVlLCBhbmQgc2hvdWxkIHVwZGF0ZSB0aGUgcmVuZGVyXG4gIG5vZGUgd2l0aCB0aGUgdmFsdWUgaWYgYXBwcm9wcmlhdGUuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGF0dHJpYnV0ZShtb3JwaCwgZW52LCBzY29wZSwgbmFtZSwgdmFsdWUpIHtcbiAgdmFsdWUgPSBlbnYuaG9va3MuZ2V0VmFsdWUodmFsdWUpO1xuXG4gIGlmIChtb3JwaC5sYXN0VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgbW9ycGguc2V0Q29udGVudCh2YWx1ZSk7XG4gIH1cblxuICBtb3JwaC5sYXN0VmFsdWUgPSB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1YmV4cHIoZW52LCBzY29wZSwgaGVscGVyTmFtZSwgcGFyYW1zLCBoYXNoKSB7XG4gIHZhciBoZWxwZXIgPSBlbnYuaG9va3MubG9va3VwSGVscGVyKGVudiwgc2NvcGUsIGhlbHBlck5hbWUpO1xuICB2YXIgcmVzdWx0ID0gZW52Lmhvb2tzLmludm9rZUhlbHBlcihudWxsLCBlbnYsIHNjb3BlLCBudWxsLCBwYXJhbXMsIGhhc2gsIGhlbHBlciwge30pO1xuICBpZiAocmVzdWx0ICYmICd2YWx1ZScgaW4gcmVzdWx0KSB7IHJldHVybiBlbnYuaG9va3MuZ2V0VmFsdWUocmVzdWx0LnZhbHVlKTsgfVxufVxuXG4vKipcbiAgSG9zdCBIb29rOiBnZXRcblxuICBAcGFyYW0ge0Vudmlyb25tZW50fSBlbnZcbiAgQHBhcmFtIHtTY29wZX0gc2NvcGVcbiAgQHBhcmFtIHtTdHJpbmd9IHBhdGhcblxuICBDb3JyZXNwb25kcyB0bzpcblxuICBgYGBoYnNcbiAge3tmb28uYmFyfX1cbiAgICBeXG5cbiAge3toZWxwZXIgZm9vLmJhciBrZXk9dmFsdWV9fVxuICAgICAgICAgICBeICAgICAgICAgICBeXG4gIGBgYFxuXG4gIFRoaXMgaG9vayBpcyB0aGUgXCJsZWFmXCIgaG9vayBvZiB0aGUgc3lzdGVtLiBJdCBpcyB1c2VkIHRvXG4gIHJlc29sdmUgYSBwYXRoIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50IHNjb3BlLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXQoZW52LCBzY29wZSwgcGF0aCkge1xuICBpZiAocGF0aCA9PT0gJycpIHtcbiAgICByZXR1cm4gc2NvcGUuc2VsZjtcbiAgfVxuXG4gIHZhciBrZXlzID0gcGF0aC5zcGxpdCgnLicpO1xuICB2YXIgdmFsdWUgPSBlbnYuaG9va3MuZ2V0Um9vdChzY29wZSwga2V5c1swXSlbMF07XG5cbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IGVudi5ob29rcy5nZXRDaGlsZCh2YWx1ZSwga2V5c1tpXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJvb3Qoc2NvcGUsIGtleSkge1xuICBpZiAoc2NvcGUubG9jYWxQcmVzZW50W2tleV0pIHtcbiAgICByZXR1cm4gW3Njb3BlLmxvY2Fsc1trZXldXTtcbiAgfSBlbHNlIGlmIChzY29wZS5zZWxmKSB7XG4gICAgcmV0dXJuIFtzY29wZS5zZWxmW2tleV1dO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbdW5kZWZpbmVkXTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2hpbGQodmFsdWUsIGtleSkge1xuICByZXR1cm4gdmFsdWVba2V5XTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbHVlKHJlZmVyZW5jZSkge1xuICByZXR1cm4gcmVmZXJlbmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2VsbE9yVmFsdWUocmVmZXJlbmNlKSB7XG4gIHJldHVybiByZWZlcmVuY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnQobW9ycGgsIGVudiwgc2NvcGUsIHRhZ05hbWUsIHBhcmFtcywgYXR0cnMsIHRlbXBsYXRlcywgdmlzaXRvcikge1xuICBpZiAoZW52Lmhvb2tzLmhhc0hlbHBlcihlbnYsIHNjb3BlLCB0YWdOYW1lKSkge1xuICAgIHJldHVybiBlbnYuaG9va3MuYmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHRhZ05hbWUsIHBhcmFtcywgYXR0cnMsIHRlbXBsYXRlcy5kZWZhdWx0LCB0ZW1wbGF0ZXMuaW52ZXJzZSwgdmlzaXRvcik7XG4gIH1cblxuICBjb21wb25lbnRGYWxsYmFjayhtb3JwaCwgZW52LCBzY29wZSwgdGFnTmFtZSwgYXR0cnMsIHRlbXBsYXRlcy5kZWZhdWx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdChlbnYsIHBhcmFtcykge1xuICB2YXIgdmFsdWUgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHBhcmFtcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB2YWx1ZSArPSBlbnYuaG9va3MuZ2V0VmFsdWUocGFyYW1zW2ldKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudEZhbGxiYWNrKG1vcnBoLCBlbnYsIHNjb3BlLCB0YWdOYW1lLCBhdHRycywgdGVtcGxhdGUpIHtcbiAgdmFyIGVsZW1lbnQgPSBlbnYuZG9tLmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gIGZvciAodmFyIG5hbWUgaW4gYXR0cnMpIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCBlbnYuaG9va3MuZ2V0VmFsdWUoYXR0cnNbbmFtZV0pKTtcbiAgfVxuICB2YXIgZnJhZ21lbnQgPSByZW5kZXIodGVtcGxhdGUsIGVudiwgc2NvcGUsIHt9KS5mcmFnbWVudDtcbiAgZWxlbWVudC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gIG1vcnBoLnNldE5vZGUoZWxlbWVudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNIZWxwZXIoZW52LCBzY29wZSwgaGVscGVyTmFtZSkge1xuICByZXR1cm4gZW52LmhlbHBlcnNbaGVscGVyTmFtZV0gIT09IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvb2t1cEhlbHBlcihlbnYsIHNjb3BlLCBoZWxwZXJOYW1lKSB7XG4gIHJldHVybiBlbnYuaGVscGVyc1toZWxwZXJOYW1lXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRTY29wZSgvKiBlbnYsIHNjb3BlICovKSB7XG4gIC8vIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBoYW5kbGUgaG9zdC1zcGVjaWZpZWQgZXh0ZW5zaW9ucyB0byBzY29wZVxuICAvLyBvdGhlciB0aGFuIGBzZWxmYCwgYGxvY2Fsc2AgYW5kIGBibG9ja2AuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTY29wZShlbnYsIHNjb3BlKSB7XG4gIGVudi5ob29rcy5iaW5kU2NvcGUoZW52LCBzY29wZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLy8gZnVuZGFtZW50YWwgaG9va3MgdGhhdCB5b3Ugd2lsbCBsaWtlbHkgd2FudCB0byBvdmVycmlkZVxuICBiaW5kTG9jYWw6IGJpbmRMb2NhbCxcbiAgYmluZFNlbGY6IGJpbmRTZWxmLFxuICBiaW5kU2NvcGU6IGJpbmRTY29wZSxcbiAgY2xhc3NpZnk6IGNsYXNzaWZ5LFxuICBjb21wb25lbnQ6IGNvbXBvbmVudCxcbiAgY29uY2F0OiBjb25jYXQsXG4gIGNyZWF0ZUZyZXNoU2NvcGU6IGNyZWF0ZUZyZXNoU2NvcGUsXG4gIGdldENoaWxkOiBnZXRDaGlsZCxcbiAgZ2V0Um9vdDogZ2V0Um9vdCxcbiAgZ2V0VmFsdWU6IGdldFZhbHVlLFxuICBnZXRDZWxsT3JWYWx1ZTogZ2V0Q2VsbE9yVmFsdWUsXG4gIGtleXdvcmRzOiBrZXl3b3JkcyxcbiAgbGlua1JlbmRlck5vZGU6IGxpbmtSZW5kZXJOb2RlLFxuICBwYXJ0aWFsOiBwYXJ0aWFsLFxuICBzdWJleHByOiBzdWJleHByLFxuXG4gIC8vIGZ1bmRhbWVudGFsIGhvb2tzIHdpdGggZ29vZCBkZWZhdWx0IGJlaGF2aW9yXG4gIGJpbmRCbG9jazogYmluZEJsb2NrLFxuICBiaW5kU2hhZG93U2NvcGU6IGJpbmRTaGFkb3dTY29wZSxcbiAgdXBkYXRlTG9jYWw6IHVwZGF0ZUxvY2FsLFxuICB1cGRhdGVTZWxmOiB1cGRhdGVTZWxmLFxuICB1cGRhdGVTY29wZTogdXBkYXRlU2NvcGUsXG4gIGNyZWF0ZUNoaWxkU2NvcGU6IGNyZWF0ZUNoaWxkU2NvcGUsXG4gIGhhc0hlbHBlcjogaGFzSGVscGVyLFxuICBsb29rdXBIZWxwZXI6IGxvb2t1cEhlbHBlcixcbiAgaW52b2tlSGVscGVyOiBpbnZva2VIZWxwZXIsXG4gIGNsZWFudXBSZW5kZXJOb2RlOiBudWxsLFxuICBkZXN0cm95UmVuZGVyTm9kZTogbnVsbCxcbiAgd2lsbENsZWFudXBUcmVlOiBudWxsLFxuICBkaWRDbGVhbnVwVHJlZTogbnVsbCxcbiAgd2lsbFJlbmRlck5vZGU6IG51bGwsXG4gIGRpZFJlbmRlck5vZGU6IG51bGwsXG5cbiAgLy8gZGVyaXZlZCBob29rc1xuICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZSxcbiAgYmxvY2s6IGJsb2NrLFxuICBjcmVhdGVTY29wZTogY3JlYXRlU2NvcGUsXG4gIGVsZW1lbnQ6IGVsZW1lbnQsXG4gIGdldDogZ2V0LFxuICBpbmxpbmU6IGlubGluZSxcbiAgcmFuZ2U6IHJhbmdlLFxuICBrZXl3b3JkOiBrZXl3b3JkXG59O1xuIl19