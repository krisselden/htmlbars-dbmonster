exports.__esModule = true;
exports.RenderState = RenderState;
exports.blockFor = blockFor;
exports.renderAndCleanup = renderAndCleanup;
exports.clearMorph = clearMorph;
exports.clearMorphList = clearMorphList;

var _htmlbarsUtilMorphUtils = require("../htmlbars-util/morph-utils");

function RenderState(renderNode, morphList) {
  // The morph list that is no longer needed and can be
  // destroyed.
  this.morphListToClear = morphList;

  // The morph list that needs to be pruned of any items
  // that were not yielded on a subsequent render.
  this.morphListToPrune = null;

  // A map of morphs for each item yielded in during this
  // rendering pass. Any morphs in the DOM but not in this map
  // will be pruned during cleanup.
  this.handledMorphs = {};
  this.collisions = undefined;

  // The morph to clear once rendering is complete. By
  // default, we set this to the previous morph (to catch
  // the case where nothing is yielded; in that case, we
  // should just clear the morph). Otherwise this gets set
  // to null if anything is rendered.
  this.morphToClear = renderNode;

  this.shadowOptions = null;
}

function blockFor(render, template, blockOptions) {
  var block = function (env, blockArguments, self, renderNode, parentScope, visitor) {
    if (renderNode.lastResult) {
      renderNode.lastResult.revalidateWith(env, undefined, self, blockArguments, visitor);
    } else {
      var options = { renderState: new RenderState(renderNode) };

      var scope = blockOptions.scope;
      var shadowScope = scope ? env.hooks.createChildScope(scope) : env.hooks.createFreshScope();
      var attributes = blockOptions.attributes;

      env.hooks.bindShadowScope(env, parentScope, shadowScope, blockOptions.options);

      if (self !== undefined) {
        env.hooks.bindSelf(env, shadowScope, self);
      } else if (blockOptions.self !== undefined) {
        env.hooks.bindSelf(env, shadowScope, blockOptions.self);
      }

      bindBlocks(env, shadowScope, blockOptions.yieldTo);

      renderAndCleanup(renderNode, env, options, null, function () {
        options.renderState.morphToClear = null;
        render(template, env, shadowScope, { renderNode: renderNode, blockArguments: blockArguments, attributes: attributes });
      });
    }
  };

  block.arity = template.arity;

  return block;
}

function bindBlocks(env, shadowScope, blocks) {
  if (!blocks) {
    return;
  }
  if (typeof blocks === 'function') {
    env.hooks.bindBlock(env, shadowScope, blocks);
  } else {
    for (var name in blocks) {
      if (blocks.hasOwnProperty(name)) {
        env.hooks.bindBlock(env, shadowScope, blocks[name], name);
      }
    }
  }
}

function renderAndCleanup(morph, env, options, shadowOptions, callback) {
  // The RenderState object is used to collect information about what the
  // helper or hook being invoked has yielded. Once it has finished either
  // yielding multiple items (via yieldItem) or a single template (via
  // yieldTemplate), we detect what was rendered and how it differs from
  // the previous render, cleaning up old state in DOM as appropriate.
  var renderState = options.renderState;
  renderState.collisions = undefined;
  renderState.shadowOptions = shadowOptions;

  // Invoke the callback, instructing it to save information about what it
  // renders into RenderState.
  var result = callback(options);

  // The hook can opt-out of cleanup if it handled cleanup itself.
  if (result && result.handled) {
    return;
  }

  var morphMap = morph.morphMap;

  // Walk the morph list, clearing any items that were yielded in a previous
  // render but were not yielded during this render.
  var morphList = renderState.morphListToPrune;
  if (morphList) {
    var handledMorphs = renderState.handledMorphs;
    var item = morphList.firstChildMorph;

    while (item) {
      var next = item.nextMorph;

      // If we don't see the key in handledMorphs, it wasn't
      // yielded in and we can safely remove it from DOM.
      if (!(item.key in handledMorphs)) {
        delete morphMap[item.key];
        clearMorph(item, env, true);
        item.destroy();
      }

      item = next;
    }
  }

  morphList = renderState.morphListToClear;
  if (morphList) {
    clearMorphList(morphList, morph, env);
  }

  var toClear = renderState.morphToClear;
  if (toClear) {
    clearMorph(toClear, env);
  }
}

function clearMorph(morph, env, destroySelf) {
  var cleanup = env.hooks.cleanupRenderNode;
  var destroy = env.hooks.destroyRenderNode;
  var willCleanup = env.hooks.willCleanupTree;
  var didCleanup = env.hooks.didCleanupTree;

  function destroyNode(node) {
    if (cleanup) {
      cleanup(node);
    }
    if (destroy) {
      destroy(node);
    }
  }

  if (willCleanup) {
    willCleanup(env, morph, destroySelf);
  }
  if (cleanup) {
    cleanup(morph);
  }
  if (destroySelf && destroy) {
    destroy(morph);
  }

  _htmlbarsUtilMorphUtils.visitChildren(morph.childNodes, destroyNode);

  // TODO: Deal with logical children that are not in the DOM tree
  morph.clear();
  if (didCleanup) {
    didCleanup(env, morph, destroySelf);
  }

  morph.lastResult = null;
  morph.lastYielded = null;
  morph.childNodes = null;
}

function clearMorphList(morphList, morph, env) {
  var item = morphList.firstChildMorph;

  while (item) {
    var next = item.nextMorph;
    delete morph.morphMap[item.key];
    clearMorph(item, env, true);
    item.destroy();

    item = next;
  }

  // Remove the MorphList from the morph.
  morphList.clear();
  morph.morphList = null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUVnQixXQUFXLEdBQVgsV0FBVztRQXlCWCxRQUFRLEdBQVIsUUFBUTtRQWdEUixnQkFBZ0IsR0FBaEIsZ0JBQWdCO1FBc0RoQixVQUFVLEdBQVYsVUFBVTtRQTBCVixjQUFjLEdBQWQsY0FBYzs7c0NBM0pBLDhCQUE4Qjs7QUFFckQsU0FBUyxXQUFXLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRTs7O0FBR2pELE1BQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7Ozs7QUFJbEMsTUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQzs7Ozs7QUFLN0IsTUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDeEIsTUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7Ozs7Ozs7QUFPNUIsTUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUM7O0FBRS9CLE1BQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0NBQzNCOztBQUVNLFNBQVMsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFO0FBQ3ZELE1BQUksS0FBSyxHQUFHLFVBQVMsR0FBRyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUU7QUFDaEYsUUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFO0FBQ3pCLGdCQUFVLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDckYsTUFBTTtBQUNMLFVBQUksT0FBTyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7O0FBRTNELFVBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7QUFDL0IsVUFBSSxXQUFXLEdBQUcsS0FB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Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdmlzaXRDaGlsZHJlbiB9IGZyb20gXCIuLi9odG1sYmFycy11dGlsL21vcnBoLXV0aWxzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5kZXJTdGF0ZShyZW5kZXJOb2RlLCBtb3JwaExpc3QpIHtcbiAgLy8gVGhlIG1vcnBoIGxpc3QgdGhhdCBpcyBubyBsb25nZXIgbmVlZGVkIGFuZCBjYW4gYmVcbiAgLy8gZGVzdHJveWVkLlxuICB0aGlzLm1vcnBoTGlzdFRvQ2xlYXIgPSBtb3JwaExpc3Q7XG5cbiAgLy8gVGhlIG1vcnBoIGxpc3QgdGhhdCBuZWVkcyB0byBiZSBwcnVuZWQgb2YgYW55IGl0ZW1zXG4gIC8vIHRoYXQgd2VyZSBub3QgeWllbGRlZCBvbiBhIHN1YnNlcXVlbnQgcmVuZGVyLlxuICB0aGlzLm1vcnBoTGlzdFRvUHJ1bmUgPSBudWxsO1xuXG4gIC8vIEEgbWFwIG9mIG1vcnBocyBmb3IgZWFjaCBpdGVtIHlpZWxkZWQgaW4gZHVyaW5nIHRoaXNcbiAgLy8gcmVuZGVyaW5nIHBhc3MuIEFueSBtb3JwaHMgaW4gdGhlIERPTSBidXQgbm90IGluIHRoaXMgbWFwXG4gIC8vIHdpbGwgYmUgcHJ1bmVkIGR1cmluZyBjbGVhbnVwLlxuICB0aGlzLmhhbmRsZWRNb3JwaHMgPSB7fTtcbiAgdGhpcy5jb2xsaXNpb25zID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBtb3JwaCB0byBjbGVhciBvbmNlIHJlbmRlcmluZyBpcyBjb21wbGV0ZS4gQnlcbiAgLy8gZGVmYXVsdCwgd2Ugc2V0IHRoaXMgdG8gdGhlIHByZXZpb3VzIG1vcnBoICh0byBjYXRjaFxuICAvLyB0aGUgY2FzZSB3aGVyZSBub3RoaW5nIGlzIHlpZWxkZWQ7IGluIHRoYXQgY2FzZSwgd2VcbiAgLy8gc2hvdWxkIGp1c3QgY2xlYXIgdGhlIG1vcnBoKS4gT3RoZXJ3aXNlIHRoaXMgZ2V0cyBzZXRcbiAgLy8gdG8gbnVsbCBpZiBhbnl0aGluZyBpcyByZW5kZXJlZC5cbiAgdGhpcy5tb3JwaFRvQ2xlYXIgPSByZW5kZXJOb2RlO1xuXG4gIHRoaXMuc2hhZG93T3B0aW9ucyA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBibG9ja0ZvcihyZW5kZXIsIHRlbXBsYXRlLCBibG9ja09wdGlvbnMpIHtcbiAgdmFyIGJsb2NrID0gZnVuY3Rpb24oZW52LCBibG9ja0FyZ3VtZW50cywgc2VsZiwgcmVuZGVyTm9kZSwgcGFyZW50U2NvcGUsIHZpc2l0b3IpIHtcbiAgICBpZiAocmVuZGVyTm9kZS5sYXN0UmVzdWx0KSB7XG4gICAgICByZW5kZXJOb2RlLmxhc3RSZXN1bHQucmV2YWxpZGF0ZVdpdGgoZW52LCB1bmRlZmluZWQsIHNlbGYsIGJsb2NrQXJndW1lbnRzLCB2aXNpdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG9wdGlvbnMgPSB7IHJlbmRlclN0YXRlOiBuZXcgUmVuZGVyU3RhdGUocmVuZGVyTm9kZSkgfTtcblxuICAgICAgdmFyIHNjb3BlID0gYmxvY2tPcHRpb25zLnNjb3BlO1xuICAgICAgdmFyIHNoYWRvd1Njb3BlID0gc2NvcGUgPyBlbnYuaG9va3MuY3JlYXRlQ2hpbGRTY29wZShzY29wZSkgOiBlbnYuaG9va3MuY3JlYXRlRnJlc2hTY29wZSgpO1xuICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBibG9ja09wdGlvbnMuYXR0cmlidXRlcztcblxuICAgICAgZW52Lmhvb2tzLmJpbmRTaGFkb3dTY29wZShlbnYsIHBhcmVudFNjb3BlLCBzaGFkb3dTY29wZSwgYmxvY2tPcHRpb25zLm9wdGlvbnMpO1xuXG4gICAgICBpZiAoc2VsZiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVudi5ob29rcy5iaW5kU2VsZihlbnYsIHNoYWRvd1Njb3BlLCBzZWxmKTtcbiAgICAgIH0gZWxzZSBpZiAoYmxvY2tPcHRpb25zLnNlbGYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBlbnYuaG9va3MuYmluZFNlbGYoZW52LCBzaGFkb3dTY29wZSwgYmxvY2tPcHRpb25zLnNlbGYpO1xuICAgICAgfVxuXG4gICAgICBiaW5kQmxvY2tzKGVudiwgc2hhZG93U2NvcGUsIGJsb2NrT3B0aW9ucy55aWVsZFRvKTtcblxuICAgICAgcmVuZGVyQW5kQ2xlYW51cChyZW5kZXJOb2RlLCBlbnYsIG9wdGlvbnMsIG51bGwsIGZ1bmN0aW9uKCkge1xuICAgICAgICBvcHRpb25zLnJlbmRlclN0YXRlLm1vcnBoVG9DbGVhciA9IG51bGw7XG4gICAgICAgIHJlbmRlcih0ZW1wbGF0ZSwgZW52LCBzaGFkb3dTY29wZSwgeyByZW5kZXJOb2RlLCBibG9ja0FyZ3VtZW50cywgYXR0cmlidXRlcyB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBibG9jay5hcml0eSA9IHRlbXBsYXRlLmFyaXR5O1xuXG4gIHJldHVybiBibG9jaztcbn1cblxuZnVuY3Rpb24gYmluZEJsb2NrcyhlbnYsIHNoYWRvd1Njb3BlLCBibG9ja3MpIHtcbiAgaWYgKCFibG9ja3MpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHR5cGVvZiBibG9ja3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICBlbnYuaG9va3MuYmluZEJsb2NrKGVudiwgc2hhZG93U2NvcGUsIGJsb2Nrcyk7XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiBibG9ja3MpIHtcbiAgICAgIGlmIChibG9ja3MuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgZW52Lmhvb2tzLmJpbmRCbG9jayhlbnYsIHNoYWRvd1Njb3BlLCBibG9ja3NbbmFtZV0sIG5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQW5kQ2xlYW51cChtb3JwaCwgZW52LCBvcHRpb25zLCBzaGFkb3dPcHRpb25zLCBjYWxsYmFjaykge1xuICAvLyBUaGUgUmVuZGVyU3RhdGUgb2JqZWN0IGlzIHVzZWQgdG8gY29sbGVjdCBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IHRoZVxuICAvLyBoZWxwZXIgb3IgaG9vayBiZWluZyBpbnZva2VkIGhhcyB5aWVsZGVkLiBPbmNlIGl0IGhhcyBmaW5pc2hlZCBlaXRoZXJcbiAgLy8geWllbGRpbmcgbXVsdGlwbGUgaXRlbXMgKHZpYSB5aWVsZEl0ZW0pIG9yIGEgc2luZ2xlIHRlbXBsYXRlICh2aWFcbiAgLy8geWllbGRUZW1wbGF0ZSksIHdlIGRldGVjdCB3aGF0IHdhcyByZW5kZXJlZCBhbmQgaG93IGl0IGRpZmZlcnMgZnJvbVxuICAvLyB0aGUgcHJldmlvdXMgcmVuZGVyLCBjbGVhbmluZyB1cCBvbGQgc3RhdGUgaW4gRE9NIGFzIGFwcHJvcHJpYXRlLlxuICB2YXIgcmVuZGVyU3RhdGUgPSBvcHRpb25zLnJlbmRlclN0YXRlO1xuICByZW5kZXJTdGF0ZS5jb2xsaXNpb25zID0gdW5kZWZpbmVkO1xuICByZW5kZXJTdGF0ZS5zaGFkb3dPcHRpb25zID0gc2hhZG93T3B0aW9ucztcblxuICAvLyBJbnZva2UgdGhlIGNhbGxiYWNrLCBpbnN0cnVjdGluZyBpdCB0byBzYXZlIGluZm9ybWF0aW9uIGFib3V0IHdoYXQgaXRcbiAgLy8gcmVuZGVycyBpbnRvIFJlbmRlclN0YXRlLlxuICB2YXIgcmVzdWx0ID0gY2FsbGJhY2sob3B0aW9ucyk7XG5cbiAgLy8gVGhlIGhvb2sgY2FuIG9wdC1vdXQgb2YgY2xlYW51cCBpZiBpdCBoYW5kbGVkIGNsZWFudXAgaXRzZWxmLlxuICBpZiAocmVzdWx0ICYmIHJlc3VsdC5oYW5kbGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG1vcnBoTWFwID0gbW9ycGgubW9ycGhNYXA7XG5cbiAgLy8gV2FsayB0aGUgbW9ycGggbGlzdCwgY2xlYXJpbmcgYW55IGl0ZW1zIHRoYXQgd2VyZSB5aWVsZGVkIGluIGEgcHJldmlvdXNcbiAgLy8gcmVuZGVyIGJ1dCB3ZXJlIG5vdCB5aWVsZGVkIGR1cmluZyB0aGlzIHJlbmRlci5cbiAgbGV0IG1vcnBoTGlzdCA9IHJlbmRlclN0YXRlLm1vcnBoTGlzdFRvUHJ1bmU7XG4gIGlmIChtb3JwaExpc3QpIHtcbiAgICBsZXQgaGFuZGxlZE1vcnBocyA9IHJlbmRlclN0YXRlLmhhbmRsZWRNb3JwaHM7XG4gICAgbGV0IGl0ZW0gPSBtb3JwaExpc3QuZmlyc3RDaGlsZE1vcnBoO1xuXG4gICAgd2hpbGUgKGl0ZW0pIHtcbiAgICAgIGxldCBuZXh0ID0gaXRlbS5uZXh0TW9ycGg7XG5cbiAgICAgIC8vIElmIHdlIGRvbid0IHNlZSB0aGUga2V5IGluIGhhbmRsZWRNb3JwaHMsIGl0IHdhc24ndFxuICAgICAgLy8geWllbGRlZCBpbiBhbmQgd2UgY2FuIHNhZmVseSByZW1vdmUgaXQgZnJvbSBET00uXG4gICAgICBpZiAoIShpdGVtLmtleSBpbiBoYW5kbGVkTW9ycGhzKSkge1xuICAgICAgICBkZWxldGUgbW9ycGhNYXBbaXRlbS5rZXldO1xuICAgICAgICBjbGVhck1vcnBoKGl0ZW0sIGVudiwgdHJ1ZSk7XG4gICAgICAgIGl0ZW0uZGVzdHJveSgpO1xuICAgICAgfVxuXG4gICAgICBpdGVtID0gbmV4dDtcbiAgICB9XG4gIH1cblxuICBtb3JwaExpc3QgPSByZW5kZXJTdGF0ZS5tb3JwaExpc3RUb0NsZWFyO1xuICBpZiAobW9ycGhMaXN0KSB7XG4gICAgY2xlYXJNb3JwaExpc3QobW9ycGhMaXN0LCBtb3JwaCwgZW52KTtcbiAgfVxuXG4gIGxldCB0b0NsZWFyID0gcmVuZGVyU3RhdGUubW9ycGhUb0NsZWFyO1xuICBpZiAodG9DbGVhcikge1xuICAgIGNsZWFyTW9ycGgodG9DbGVhciwgZW52KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJNb3JwaChtb3JwaCwgZW52LCBkZXN0cm95U2VsZikge1xuICB2YXIgY2xlYW51cCA9IGVudi5ob29rcy5jbGVhbnVwUmVuZGVyTm9kZTtcbiAgdmFyIGRlc3Ryb3kgPSBlbnYuaG9va3MuZGVzdHJveVJlbmRlck5vZGU7XG4gIHZhciB3aWxsQ2xlYW51cCA9IGVudi5ob29rcy53aWxsQ2xlYW51cFRyZWU7XG4gIHZhciBkaWRDbGVhbnVwID0gZW52Lmhvb2tzLmRpZENsZWFudXBUcmVlO1xuXG4gIGZ1bmN0aW9uIGRlc3Ryb3lOb2RlKG5vZGUpIHtcbiAgICBpZiAoY2xlYW51cCkgeyBjbGVhbnVwKG5vZGUpOyB9XG4gICAgaWYgKGRlc3Ryb3kpIHsgZGVzdHJveShub2RlKTsgfVxuICB9XG5cbiAgaWYgKHdpbGxDbGVhbnVwKSB7IHdpbGxDbGVhbnVwKGVudiwgbW9ycGgsIGRlc3Ryb3lTZWxmKTsgfVxuICBpZiAoY2xlYW51cCkgeyBjbGVhbnVwKG1vcnBoKTsgfVxuICBpZiAoZGVzdHJveVNlbGYgJiYgZGVzdHJveSkgeyBkZXN0cm95KG1vcnBoKTsgfVxuXG4gIHZpc2l0Q2hpbGRyZW4obW9ycGguY2hpbGROb2RlcywgZGVzdHJveU5vZGUpO1xuXG4gIC8vIFRPRE86IERlYWwgd2l0aCBsb2dpY2FsIGNoaWxkcmVuIHRoYXQgYXJlIG5vdCBpbiB0aGUgRE9NIHRyZWVcbiAgbW9ycGguY2xlYXIoKTtcbiAgaWYgKGRpZENsZWFudXApIHsgZGlkQ2xlYW51cChlbnYsIG1vcnBoLCBkZXN0cm95U2VsZik7IH1cblxuICBtb3JwaC5sYXN0UmVzdWx0ID0gbnVsbDtcbiAgbW9ycGgubGFzdFlpZWxkZWQgPSBudWxsO1xuICBtb3JwaC5jaGlsZE5vZGVzID0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyTW9ycGhMaXN0KG1vcnBoTGlzdCwgbW9ycGgsIGVudikge1xuICBsZXQgaXRlbSA9IG1vcnBoTGlzdC5maXJzdENoaWxkTW9ycGg7XG5cbiAgd2hpbGUgKGl0ZW0pIHtcbiAgICBsZXQgbmV4dCA9IGl0ZW0ubmV4dE1vcnBoO1xuICAgIGRlbGV0ZSBtb3JwaC5tb3JwaE1hcFtpdGVtLmtleV07XG4gICAgY2xlYXJNb3JwaChpdGVtLCBlbnYsIHRydWUpO1xuICAgIGl0ZW0uZGVzdHJveSgpO1xuXG4gICAgaXRlbSA9IG5leHQ7XG4gIH1cblxuICAvLyBSZW1vdmUgdGhlIE1vcnBoTGlzdCBmcm9tIHRoZSBtb3JwaC5cbiAgbW9ycGhMaXN0LmNsZWFyKCk7XG4gIG1vcnBoLm1vcnBoTGlzdCA9IG51bGw7XG59XG4iXX0=