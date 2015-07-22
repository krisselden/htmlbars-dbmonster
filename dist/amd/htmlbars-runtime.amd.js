define("dom-helper", ["exports", "./htmlbars-runtime/morph", "./morph-attr", "./dom-helper/build-html-dom", "./dom-helper/classes", "./dom-helper/prop"], function (exports, _htmlbarsRuntimeMorph, _morphAttr, _domHelperBuildHtmlDom, _domHelperClasses, _domHelperProp) {

  var doc = typeof document === 'undefined' ? false : document;

  var deletesBlankTextNodes = doc && (function (document) {
    var element = document.createElement('div');
    element.appendChild(document.createTextNode(''));
    var clonedElement = element.cloneNode(true);
    return clonedElement.childNodes.length === 0;
  })(doc);

  var ignoresCheckedAttribute = doc && (function (document) {
    var element = document.createElement('input');
    element.setAttribute('checked', 'checked');
    var clonedElement = element.cloneNode(false);
    return !clonedElement.checked;
  })(doc);

  var canRemoveSvgViewBoxAttribute = doc && (doc.createElementNS ? (function (document) {
    var element = document.createElementNS(_domHelperBuildHtmlDom.svgNamespace, 'svg');
    element.setAttribute('viewBox', '0 0 100 100');
    element.removeAttribute('viewBox');
    return !element.getAttribute('viewBox');
  })(doc) : true);

  var canClone = doc && (function (document) {
    var element = document.createElement('div');
    element.appendChild(document.createTextNode(' '));
    element.appendChild(document.createTextNode(' '));
    var clonedElement = element.cloneNode(true);
    return clonedElement.childNodes[0].nodeValue === ' ';
  })(doc);

  // This is not the namespace of the element, but of
  // the elements inside that elements.
  function interiorNamespace(element) {
    if (element && element.namespaceURI === _domHelperBuildHtmlDom.svgNamespace && !_domHelperBuildHtmlDom.svgHTMLIntegrationPoints[element.tagName]) {
      return _domHelperBuildHtmlDom.svgNamespace;
    } else {
      return null;
    }
  }

  // The HTML spec allows for "omitted start tags". These tags are optional
  // when their intended child is the first thing in the parent tag. For
  // example, this is a tbody start tag:
  //
  // <table>
  //   <tbody>
  //     <tr>
  //
  // The tbody may be omitted, and the browser will accept and render:
  //
  // <table>
  //   <tr>
  //
  // However, the omitted start tag will still be added to the DOM. Here
  // we test the string and context to see if the browser is about to
  // perform this cleanup.
  //
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html#optional-tags
  // describes which tags are omittable. The spec for tbody and colgroup
  // explains this behavior:
  //
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tables.html#the-tbody-element
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tables.html#the-colgroup-element
  //

  var omittedStartTagChildTest = /<([\w:]+)/;
  function detectOmittedStartTag(string, contextualElement) {
    // Omitted start tags are only inside table tags.
    if (contextualElement.tagName === 'TABLE') {
      var omittedStartTagChildMatch = omittedStartTagChildTest.exec(string);
      if (omittedStartTagChildMatch) {
        var omittedStartTagChild = omittedStartTagChildMatch[1];
        // It is already asserted that the contextual element is a table
        // and not the proper start tag. Just see if a tag was omitted.
        return omittedStartTagChild === 'tr' || omittedStartTagChild === 'col';
      }
    }
  }

  function buildSVGDOM(html, dom) {
    var div = dom.document.createElement('div');
    div.innerHTML = '<svg>' + html + '</svg>';
    return div.firstChild.childNodes;
  }

  var guid = 1;

  function ElementMorph(element, dom, namespace) {
    this.element = element;
    this.dom = dom;
    this.namespace = namespace;
    this.guid = "element" + guid++;

    this.state = {};
    this.isDirty = true;
  }

  // renderAndCleanup calls `clear` on all items in the morph map
  // just before calling `destroy` on the morph.
  //
  // As a future refactor this could be changed to set the property
  // back to its original/default value.
  ElementMorph.prototype.clear = function () {};

  ElementMorph.prototype.destroy = function () {
    this.element = null;
    this.dom = null;
  };

  /*
   * A class wrapping DOM functions to address environment compatibility,
   * namespaces, contextual elements for morph un-escaped content
   * insertion.
   *
   * When entering a template, a DOMHelper should be passed:
   *
   *   template(context, { hooks: hooks, dom: new DOMHelper() });
   *
   * TODO: support foreignObject as a passed contextual element. It has
   * a namespace (svg) that does not match its internal namespace
   * (xhtml).
   *
   * @class DOMHelper
   * @constructor
   * @param {HTMLDocument} _document The document DOM methods are proxied to
   */
  function DOMHelper(_document) {
    this.document = _document || document;
    if (!this.document) {
      throw new Error("A document object must be passed to the DOMHelper, or available on the global scope");
    }
    this.canClone = canClone;
    this.namespace = null;
  }

  var prototype = DOMHelper.prototype;
  prototype.constructor = DOMHelper;

  prototype.getElementById = function (id, rootNode) {
    rootNode = rootNode || this.document;
    return rootNode.getElementById(id);
  };

  prototype.insertBefore = function (element, childElement, referenceChild) {
    return element.insertBefore(childElement, referenceChild);
  };

  prototype.appendChild = function (element, childElement) {
    return element.appendChild(childElement);
  };

  prototype.childAt = function (element, indices) {
    var child = element;

    for (var i = 0; i < indices.length; i++) {
      child = child.childNodes.item(indices[i]);
    }

    return child;
  };

  // Note to a Fellow Implementor:
  // Ahh, accessing a child node at an index. Seems like it should be so simple,
  // doesn't it? Unfortunately, this particular method has caused us a surprising
  // amount of pain. As you'll note below, this method has been modified to walk
  // the linked list of child nodes rather than access the child by index
  // directly, even though there are two (2) APIs in the DOM that do this for us.
  // If you're thinking to yourself, "What an oversight! What an opportunity to
  // optimize this code!" then to you I say: stop! For I have a tale to tell.
  //
  // First, this code must be compatible with simple-dom for rendering on the
  // server where there is no real DOM. Previously, we accessed a child node
  // directly via `element.childNodes[index]`. While we *could* in theory do a
  // full-fidelity simulation of a live `childNodes` array, this is slow,
  // complicated and error-prone.
  //
  // "No problem," we thought, "we'll just use the similar
  // `childNodes.item(index)` API." Then, we could just implement our own `item`
  // method in simple-dom and walk the child node linked list there, allowing
  // us to retain the performance advantages of the (surely optimized) `item()`
  // API in the browser.
  //
  // Unfortunately, an enterprising soul named Samy Alzahrani discovered that in
  // IE8, accessing an item out-of-bounds via `item()` causes an exception where
  // other browsers return null. This necessitated a... check of
  // `childNodes.length`, bringing us back around to having to support a
  // full-fidelity `childNodes` array!
  //
  // Worst of all, Kris Selden investigated how browsers are actualy implemented
  // and discovered that they're all linked lists under the hood anyway. Accessing
  // `childNodes` requires them to allocate a new live collection backed by that
  // linked list, which is itself a rather expensive operation. Our assumed
  // optimization had backfired! That is the danger of magical thinking about
  // the performance of native implementations.
  //
  // And this, my friends, is why the following implementation just walks the
  // linked list, as surprised as that may make you. Please ensure you understand
  // the above before changing this and submitting a PR.
  //
  // Tom Dale, January 18th, 2015, Portland OR
  prototype.childAtIndex = function (element, index) {
    var node = element.firstChild;

    for (var idx = 0; node && idx < index; idx++) {
      node = node.nextSibling;
    }

    return node;
  };

  prototype.appendText = function (element, text) {
    return element.appendChild(this.document.createTextNode(text));
  };

  prototype.setAttribute = function (element, name, value) {
    element.setAttribute(name, String(value));
  };

  prototype.getAttribute = function (element, name) {
    return element.getAttribute(name);
  };

  prototype.setAttributeNS = function (element, namespace, name, value) {
    element.setAttributeNS(namespace, name, String(value));
  };

  prototype.getAttributeNS = function (element, namespace, name) {
    return element.getAttributeNS(namespace, name);
  };

  if (canRemoveSvgViewBoxAttribute) {
    prototype.removeAttribute = function (element, name) {
      element.removeAttribute(name);
    };
  } else {
    prototype.removeAttribute = function (element, name) {
      if (element.tagName === 'svg' && name === 'viewBox') {
        element.setAttribute(name, null);
      } else {
        element.removeAttribute(name);
      }
    };
  }

  prototype.setPropertyStrict = function (element, name, value) {
    if (value === undefined) {
      value = null;
    }

    if (value === null && (name === 'value' || name === 'type' || name === 'src')) {
      value = '';
    }

    element[name] = value;
  };

  prototype.getPropertyStrict = function (element, name) {
    return element[name];
  };

  prototype.setProperty = function (element, name, value, namespace) {
    if (element.namespaceURI === _domHelperBuildHtmlDom.svgNamespace) {
      if (_domHelperProp.isAttrRemovalValue(value)) {
        element.removeAttribute(name);
      } else {
        if (namespace) {
          element.setAttributeNS(namespace, name, value);
        } else {
          element.setAttribute(name, value);
        }
      }
    } else {
      var _normalizeProperty = _domHelperProp.normalizeProperty(element, name);

      var normalized = _normalizeProperty.normalized;
      var type = _normalizeProperty.type;

      if (type === 'prop') {
        element[normalized] = value;
      } else {
        if (_domHelperProp.isAttrRemovalValue(value)) {
          element.removeAttribute(name);
        } else {
          if (namespace && element.setAttributeNS) {
            element.setAttributeNS(namespace, name, value);
          } else {
            element.setAttribute(name, value);
          }
        }
      }
    }
  };

  if (doc && doc.createElementNS) {
    // Only opt into namespace detection if a contextualElement
    // is passed.
    prototype.createElement = function (tagName, contextualElement) {
      var namespace = this.namespace;
      if (contextualElement) {
        if (tagName === 'svg') {
          namespace = _domHelperBuildHtmlDom.svgNamespace;
        } else {
          namespace = interiorNamespace(contextualElement);
        }
      }
      if (namespace) {
        return this.document.createElementNS(namespace, tagName);
      } else {
        return this.document.createElement(tagName);
      }
    };
    prototype.setAttributeNS = function (element, namespace, name, value) {
      element.setAttributeNS(namespace, name, String(value));
    };
  } else {
    prototype.createElement = function (tagName) {
      return this.document.createElement(tagName);
    };
    prototype.setAttributeNS = function (element, namespace, name, value) {
      element.setAttribute(name, String(value));
    };
  }

  prototype.addClasses = _domHelperClasses.addClasses;
  prototype.removeClasses = _domHelperClasses.removeClasses;

  prototype.setNamespace = function (ns) {
    this.namespace = ns;
  };

  prototype.detectNamespace = function (element) {
    this.namespace = interiorNamespace(element);
  };

  prototype.createDocumentFragment = function () {
    return this.document.createDocumentFragment();
  };

  prototype.createTextNode = function (text) {
    return this.document.createTextNode(text);
  };

  prototype.createComment = function (text) {
    return this.document.createComment(text);
  };

  prototype.repairClonedNode = function (element, blankChildTextNodes, isChecked) {
    if (deletesBlankTextNodes && blankChildTextNodes.length > 0) {
      for (var i = 0, len = blankChildTextNodes.length; i < len; i++) {
        var textNode = this.document.createTextNode(''),
            offset = blankChildTextNodes[i],
            before = this.childAtIndex(element, offset);
        if (before) {
          element.insertBefore(textNode, before);
        } else {
          element.appendChild(textNode);
        }
      }
    }
    if (ignoresCheckedAttribute && isChecked) {
      element.setAttribute('checked', 'checked');
    }
  };

  prototype.cloneNode = function (element, deep) {
    var clone = element.cloneNode(!!deep);
    return clone;
  };

  prototype.AttrMorphClass = _morphAttr.default;

  prototype.createAttrMorph = function (element, attrName, namespace) {
    return new this.AttrMorphClass(element, attrName, this, namespace);
  };

  prototype.ElementMorphClass = ElementMorph;

  prototype.createElementMorph = function (element, namespace) {
    return new this.ElementMorphClass(element, this, namespace);
  };

  prototype.createUnsafeAttrMorph = function (element, attrName, namespace) {
    var morph = this.createAttrMorph(element, attrName, namespace);
    morph.escaped = false;
    return morph;
  };

  prototype.MorphClass = _htmlbarsRuntimeMorph.default;

  prototype.createMorph = function (parent, start, end, contextualElement) {
    if (contextualElement && contextualElement.nodeType === 11) {
      throw new Error("Cannot pass a fragment as the contextual element to createMorph");
    }

    if (!contextualElement && parent && parent.nodeType === 1) {
      contextualElement = parent;
    }
    var morph = new this.MorphClass(this, contextualElement);
    morph.firstNode = start;
    morph.lastNode = end;
    return morph;
  };

  prototype.createFragmentMorph = function (contextualElement) {
    if (contextualElement && contextualElement.nodeType === 11) {
      throw new Error("Cannot pass a fragment as the contextual element to createMorph");
    }

    var fragment = this.createDocumentFragment();
    return _htmlbarsRuntimeMorph.default.create(this, contextualElement, fragment);
  };

  prototype.replaceContentWithMorph = function (element) {
    var firstChild = element.firstChild;

    if (!firstChild) {
      var comment = this.createComment('');
      this.appendChild(element, comment);
      return _htmlbarsRuntimeMorph.default.create(this, element, comment);
    } else {
      var morph = _htmlbarsRuntimeMorph.default.attach(this, element, firstChild, element.lastChild);
      morph.clear();
      return morph;
    }
  };

  prototype.createUnsafeMorph = function (parent, start, end, contextualElement) {
    var morph = this.createMorph(parent, start, end, contextualElement);
    morph.parseTextAsHTML = true;
    return morph;
  };

  // This helper is just to keep the templates good looking,
  // passing integers instead of element references.
  prototype.createMorphAt = function (parent, startIndex, endIndex, contextualElement) {
    var single = startIndex === endIndex;
    var start = this.childAtIndex(parent, startIndex);
    var end = single ? start : this.childAtIndex(parent, endIndex);
    return this.createMorph(parent, start, end, contextualElement);
  };

  prototype.createUnsafeMorphAt = function (parent, startIndex, endIndex, contextualElement) {
    var morph = this.createMorphAt(parent, startIndex, endIndex, contextualElement);
    morph.parseTextAsHTML = true;
    return morph;
  };

  prototype.insertMorphBefore = function (element, referenceChild, contextualElement) {
    var insertion = this.document.createComment('');
    element.insertBefore(insertion, referenceChild);
    return this.createMorph(element, insertion, insertion, contextualElement);
  };

  prototype.appendMorph = function (element, contextualElement) {
    var insertion = this.document.createComment('');
    element.appendChild(insertion);
    return this.createMorph(element, insertion, insertion, contextualElement);
  };

  prototype.insertBoundary = function (fragment, index) {
    // this will always be null or firstChild
    var child = index === null ? null : this.childAtIndex(fragment, index);
    this.insertBefore(fragment, this.createTextNode(''), child);
  };

  prototype.setMorphHTML = function (morph, html) {
    morph.setHTML(html);
  };

  prototype.parseHTML = function (html, contextualElement) {
    var childNodes;

    if (interiorNamespace(contextualElement) === _domHelperBuildHtmlDom.svgNamespace) {
      childNodes = buildSVGDOM(html, this);
    } else {
      var nodes = _domHelperBuildHtmlDom.buildHTMLDOM(html, contextualElement, this);
      if (detectOmittedStartTag(html, contextualElement)) {
        var node = nodes[0];
        while (node && node.nodeType !== 1) {
          node = node.nextSibling;
        }
        childNodes = node.childNodes;
      } else {
        childNodes = nodes;
      }
    }

    // Copy node list to a fragment.
    var fragment = this.document.createDocumentFragment();

    if (childNodes && childNodes.length > 0) {
      var currentNode = childNodes[0];

      // We prepend an <option> to <select> boxes to absorb any browser bugs
      // related to auto-select behavior. Skip past it.
      if (contextualElement.tagName === 'SELECT') {
        currentNode = currentNode.nextSibling;
      }

      while (currentNode) {
        var tempNode = currentNode;
        currentNode = currentNode.nextSibling;

        fragment.appendChild(tempNode);
      }
    }

    return fragment;
  };

  var parsingNode;

  // Used to determine whether a URL needs to be sanitized.
  prototype.protocolForURL = function (url) {
    if (!parsingNode) {
      parsingNode = this.document.createElement('a');
    }

    parsingNode.href = url;
    return parsingNode.protocol;
  };

  exports.default = DOMHelper;
});
//# sourceMappingURL=data:application/json;base64,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QVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLENBQUM7O0FBRXRELFFBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZDLFVBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztBQUloQyxVQUFJLGlCQUFpQixDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUU7QUFDMUMsbUJBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO09BQ3ZDOztBQUVELGFBQU8sV0FBVyxFQUFFO0FBQ2xCLFlBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQztBQUMzQixtQkFBVyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUM7O0FBRXRDLGdCQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ2hDO0tBQ0Y7O0FBRUQsV0FBTyxRQUFRLENBQUM7R0FDakIsQ0FBQzs7QUFFRixNQUFJLFdBQVcsQ0FBQzs7O0FBR2hCLFdBQVMsQ0FBQyxjQUFjLEdBQUcsVUFBUyxHQUFHLEVBQUU7QUFDdkMsUUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNoQixpQkFBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2hEOztBQUVELGVBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLFdBQU8sV0FBVyxDQUFDLFFBQVEsQ0FBQztHQUM3QixDQUFDOztvQkFFYSxTQUFTIiwiZmlsZSI6ImRvbS1oZWxwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTW9ycGggZnJvbSBcIi4vaHRtbGJhcnMtcnVudGltZS9tb3JwaFwiO1xuaW1wb3J0IEF0dHJNb3JwaCBmcm9tIFwiLi9tb3JwaC1hdHRyXCI7XG5pbXBvcnQge1xuICBidWlsZEhUTUxET00sXG4gIHN2Z05hbWVzcGFjZSxcbiAgc3ZnSFRNTEludGVncmF0aW9uUG9pbnRzXG59IGZyb20gXCIuL2RvbS1oZWxwZXIvYnVpbGQtaHRtbC1kb21cIjtcbmltcG9ydCB7XG4gIGFkZENsYXNzZXMsXG4gIHJlbW92ZUNsYXNzZXNcbn0gZnJvbSBcIi4vZG9tLWhlbHBlci9jbGFzc2VzXCI7XG5pbXBvcnQge1xuICBub3JtYWxpemVQcm9wZXJ0eVxufSBmcm9tIFwiLi9kb20taGVscGVyL3Byb3BcIjtcbmltcG9ydCB7IGlzQXR0clJlbW92YWxWYWx1ZSB9IGZyb20gXCIuL2RvbS1oZWxwZXIvcHJvcFwiO1xuXG52YXIgZG9jID0gdHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyA/IGZhbHNlIDogZG9jdW1lbnQ7XG5cbnZhciBkZWxldGVzQmxhbmtUZXh0Tm9kZXMgPSBkb2MgJiYgKGZ1bmN0aW9uKGRvY3VtZW50KXtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZWxlbWVudC5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpICk7XG4gIHZhciBjbG9uZWRFbGVtZW50ID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gIHJldHVybiBjbG9uZWRFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoID09PSAwO1xufSkoZG9jKTtcblxudmFyIGlnbm9yZXNDaGVja2VkQXR0cmlidXRlID0gZG9jICYmIChmdW5jdGlvbihkb2N1bWVudCl7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xuICB2YXIgY2xvbmVkRWxlbWVudCA9IGVsZW1lbnQuY2xvbmVOb2RlKGZhbHNlKTtcbiAgcmV0dXJuICFjbG9uZWRFbGVtZW50LmNoZWNrZWQ7XG59KShkb2MpO1xuXG52YXIgY2FuUmVtb3ZlU3ZnVmlld0JveEF0dHJpYnV0ZSA9IGRvYyAmJiAoZG9jLmNyZWF0ZUVsZW1lbnROUyA/IChmdW5jdGlvbihkb2N1bWVudCl7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHN2Z05hbWVzcGFjZSwgJ3N2ZycpO1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZSgndmlld0JveCcsICcwIDAgMTAwIDEwMCcpO1xuICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndmlld0JveCcpO1xuICByZXR1cm4gIWVsZW1lbnQuZ2V0QXR0cmlidXRlKCd2aWV3Qm94Jyk7XG59KShkb2MpIDogdHJ1ZSk7XG5cbnZhciBjYW5DbG9uZSA9IGRvYyAmJiAoZnVuY3Rpb24oZG9jdW1lbnQpe1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbGVtZW50LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnICcpKTtcbiAgZWxlbWVudC5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJyAnKSk7XG4gIHZhciBjbG9uZWRFbGVtZW50ID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gIHJldHVybiBjbG9uZWRFbGVtZW50LmNoaWxkTm9kZXNbMF0ubm9kZVZhbHVlID09PSAnICc7XG59KShkb2MpO1xuXG4vLyBUaGlzIGlzIG5vdCB0aGUgbmFtZXNwYWNlIG9mIHRoZSBlbGVtZW50LCBidXQgb2Zcbi8vIHRoZSBlbGVtZW50cyBpbnNpZGUgdGhhdCBlbGVtZW50cy5cbmZ1bmN0aW9uIGludGVyaW9yTmFtZXNwYWNlKGVsZW1lbnQpe1xuICBpZiAoXG4gICAgZWxlbWVudCAmJlxuICAgIGVsZW1lbnQubmFtZXNwYWNlVVJJID09PSBzdmdOYW1lc3BhY2UgJiZcbiAgICAhc3ZnSFRNTEludGVncmF0aW9uUG9pbnRzW2VsZW1lbnQudGFnTmFtZV1cbiAgKSB7XG4gICAgcmV0dXJuIHN2Z05hbWVzcGFjZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vLyBUaGUgSFRNTCBzcGVjIGFsbG93cyBmb3IgXCJvbWl0dGVkIHN0YXJ0IHRhZ3NcIi4gVGhlc2UgdGFncyBhcmUgb3B0aW9uYWxcbi8vIHdoZW4gdGhlaXIgaW50ZW5kZWQgY2hpbGQgaXMgdGhlIGZpcnN0IHRoaW5nIGluIHRoZSBwYXJlbnQgdGFnLiBGb3Jcbi8vIGV4YW1wbGUsIHRoaXMgaXMgYSB0Ym9keSBzdGFydCB0YWc6XG4vL1xuLy8gPHRhYmxlPlxuLy8gICA8dGJvZHk+XG4vLyAgICAgPHRyPlxuLy9cbi8vIFRoZSB0Ym9keSBtYXkgYmUgb21pdHRlZCwgYW5kIHRoZSBicm93c2VyIHdpbGwgYWNjZXB0IGFuZCByZW5kZXI6XG4vL1xuLy8gPHRhYmxlPlxuLy8gICA8dHI+XG4vL1xuLy8gSG93ZXZlciwgdGhlIG9taXR0ZWQgc3RhcnQgdGFnIHdpbGwgc3RpbGwgYmUgYWRkZWQgdG8gdGhlIERPTS4gSGVyZVxuLy8gd2UgdGVzdCB0aGUgc3RyaW5nIGFuZCBjb250ZXh0IHRvIHNlZSBpZiB0aGUgYnJvd3NlciBpcyBhYm91dCB0b1xuLy8gcGVyZm9ybSB0aGlzIGNsZWFudXAuXG4vL1xuLy8gaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjb3B0aW9uYWwtdGFnc1xuLy8gZGVzY3JpYmVzIHdoaWNoIHRhZ3MgYXJlIG9taXR0YWJsZS4gVGhlIHNwZWMgZm9yIHRib2R5IGFuZCBjb2xncm91cFxuLy8gZXhwbGFpbnMgdGhpcyBiZWhhdmlvcjpcbi8vXG4vLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS90YWJsZXMuaHRtbCN0aGUtdGJvZHktZWxlbWVudFxuLy8gaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdGFibGVzLmh0bWwjdGhlLWNvbGdyb3VwLWVsZW1lbnRcbi8vXG5cbnZhciBvbWl0dGVkU3RhcnRUYWdDaGlsZFRlc3QgPSAvPChbXFx3Ol0rKS87XG5mdW5jdGlvbiBkZXRlY3RPbWl0dGVkU3RhcnRUYWcoc3RyaW5nLCBjb250ZXh0dWFsRWxlbWVudCl7XG4gIC8vIE9taXR0ZWQgc3RhcnQgdGFncyBhcmUgb25seSBpbnNpZGUgdGFibGUgdGFncy5cbiAgaWYgKGNvbnRleHR1YWxFbGVtZW50LnRhZ05hbWUgPT09ICdUQUJMRScpIHtcbiAgICB2YXIgb21pdHRlZFN0YXJ0VGFnQ2hpbGRNYXRjaCA9IG9taXR0ZWRTdGFydFRhZ0NoaWxkVGVzdC5leGVjKHN0cmluZyk7XG4gICAgaWYgKG9taXR0ZWRTdGFydFRhZ0NoaWxkTWF0Y2gpIHtcbiAgICAgIHZhciBvbWl0dGVkU3RhcnRUYWdDaGlsZCA9IG9taXR0ZWRTdGFydFRhZ0NoaWxkTWF0Y2hbMV07XG4gICAgICAvLyBJdCBpcyBhbHJlYWR5IGFzc2VydGVkIHRoYXQgdGhlIGNvbnRleHR1YWwgZWxlbWVudCBpcyBhIHRhYmxlXG4gICAgICAvLyBhbmQgbm90IHRoZSBwcm9wZXIgc3RhcnQgdGFnLiBKdXN0IHNlZSBpZiBhIHRhZyB3YXMgb21pdHRlZC5cbiAgICAgIHJldHVybiBvbWl0dGVkU3RhcnRUYWdDaGlsZCA9PT0gJ3RyJyB8fFxuICAgICAgICAgICAgIG9taXR0ZWRTdGFydFRhZ0NoaWxkID09PSAnY29sJztcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYnVpbGRTVkdET00oaHRtbCwgZG9tKXtcbiAgdmFyIGRpdiA9IGRvbS5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LmlubmVySFRNTCA9ICc8c3ZnPicraHRtbCsnPC9zdmc+JztcbiAgcmV0dXJuIGRpdi5maXJzdENoaWxkLmNoaWxkTm9kZXM7XG59XG5cbnZhciBndWlkID0gMTtcblxuZnVuY3Rpb24gRWxlbWVudE1vcnBoKGVsZW1lbnQsIGRvbSwgbmFtZXNwYWNlKSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMuZG9tID0gZG9tO1xuICB0aGlzLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgdGhpcy5ndWlkID0gXCJlbGVtZW50XCIgKyBndWlkKys7XG5cbiAgdGhpcy5zdGF0ZSA9IHt9O1xuICB0aGlzLmlzRGlydHkgPSB0cnVlO1xufVxuXG4vLyByZW5kZXJBbmRDbGVhbnVwIGNhbGxzIGBjbGVhcmAgb24gYWxsIGl0ZW1zIGluIHRoZSBtb3JwaCBtYXBcbi8vIGp1c3QgYmVmb3JlIGNhbGxpbmcgYGRlc3Ryb3lgIG9uIHRoZSBtb3JwaC5cbi8vXG4vLyBBcyBhIGZ1dHVyZSByZWZhY3RvciB0aGlzIGNvdWxkIGJlIGNoYW5nZWQgdG8gc2V0IHRoZSBwcm9wZXJ0eVxuLy8gYmFjayB0byBpdHMgb3JpZ2luYWwvZGVmYXVsdCB2YWx1ZS5cbkVsZW1lbnRNb3JwaC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHsgfTtcblxuRWxlbWVudE1vcnBoLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gIHRoaXMuZG9tID0gbnVsbDtcbn07XG5cblxuLypcbiAqIEEgY2xhc3Mgd3JhcHBpbmcgRE9NIGZ1bmN0aW9ucyB0byBhZGRyZXNzIGVudmlyb25tZW50IGNvbXBhdGliaWxpdHksXG4gKiBuYW1lc3BhY2VzLCBjb250ZXh0dWFsIGVsZW1lbnRzIGZvciBtb3JwaCB1bi1lc2NhcGVkIGNvbnRlbnRcbiAqIGluc2VydGlvbi5cbiAqXG4gKiBXaGVuIGVudGVyaW5nIGEgdGVtcGxhdGUsIGEgRE9NSGVscGVyIHNob3VsZCBiZSBwYXNzZWQ6XG4gKlxuICogICB0ZW1wbGF0ZShjb250ZXh0LCB7IGhvb2tzOiBob29rcywgZG9tOiBuZXcgRE9NSGVscGVyKCkgfSk7XG4gKlxuICogVE9ETzogc3VwcG9ydCBmb3JlaWduT2JqZWN0IGFzIGEgcGFzc2VkIGNvbnRleHR1YWwgZWxlbWVudC4gSXQgaGFzXG4gKiBhIG5hbWVzcGFjZSAoc3ZnKSB0aGF0IGRvZXMgbm90IG1hdGNoIGl0cyBpbnRlcm5hbCBuYW1lc3BhY2VcbiAqICh4aHRtbCkuXG4gKlxuICogQGNsYXNzIERPTUhlbHBlclxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0hUTUxEb2N1bWVudH0gX2RvY3VtZW50IFRoZSBkb2N1bWVudCBET00gbWV0aG9kcyBhcmUgcHJveGllZCB0b1xuICovXG5mdW5jdGlvbiBET01IZWxwZXIoX2RvY3VtZW50KXtcbiAgdGhpcy5kb2N1bWVudCA9IF9kb2N1bWVudCB8fCBkb2N1bWVudDtcbiAgaWYgKCF0aGlzLmRvY3VtZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQSBkb2N1bWVudCBvYmplY3QgbXVzdCBiZSBwYXNzZWQgdG8gdGhlIERPTUhlbHBlciwgb3IgYXZhaWxhYmxlIG9uIHRoZSBnbG9iYWwgc2NvcGVcIik7XG4gIH1cbiAgdGhpcy5jYW5DbG9uZSA9IGNhbkNsb25lO1xuICB0aGlzLm5hbWVzcGFjZSA9IG51bGw7XG59XG5cbnZhciBwcm90b3R5cGUgPSBET01IZWxwZXIucHJvdG90eXBlO1xucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRE9NSGVscGVyO1xuXG5wcm90b3R5cGUuZ2V0RWxlbWVudEJ5SWQgPSBmdW5jdGlvbihpZCwgcm9vdE5vZGUpIHtcbiAgcm9vdE5vZGUgPSByb290Tm9kZSB8fCB0aGlzLmRvY3VtZW50O1xuICByZXR1cm4gcm9vdE5vZGUuZ2V0RWxlbWVudEJ5SWQoaWQpO1xufTtcblxucHJvdG90eXBlLmluc2VydEJlZm9yZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNoaWxkRWxlbWVudCwgcmVmZXJlbmNlQ2hpbGQpIHtcbiAgcmV0dXJuIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNoaWxkRWxlbWVudCwgcmVmZXJlbmNlQ2hpbGQpO1xufTtcblxucHJvdG90eXBlLmFwcGVuZENoaWxkID0gZnVuY3Rpb24oZWxlbWVudCwgY2hpbGRFbGVtZW50KSB7XG4gIHJldHVybiBlbGVtZW50LmFwcGVuZENoaWxkKGNoaWxkRWxlbWVudCk7XG59O1xuXG5wcm90b3R5cGUuY2hpbGRBdCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGluZGljZXMpIHtcbiAgdmFyIGNoaWxkID0gZWxlbWVudDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjaGlsZCA9IGNoaWxkLmNoaWxkTm9kZXMuaXRlbShpbmRpY2VzW2ldKTtcbiAgfVxuXG4gIHJldHVybiBjaGlsZDtcbn07XG5cbi8vIE5vdGUgdG8gYSBGZWxsb3cgSW1wbGVtZW50b3I6XG4vLyBBaGgsIGFjY2Vzc2luZyBhIGNoaWxkIG5vZGUgYXQgYW4gaW5kZXguIFNlZW1zIGxpa2UgaXQgc2hvdWxkIGJlIHNvIHNpbXBsZSxcbi8vIGRvZXNuJ3QgaXQ/IFVuZm9ydHVuYXRlbHksIHRoaXMgcGFydGljdWxhciBtZXRob2QgaGFzIGNhdXNlZCB1cyBhIHN1cnByaXNpbmdcbi8vIGFtb3VudCBvZiBwYWluLiBBcyB5b3UnbGwgbm90ZSBiZWxvdywgdGhpcyBtZXRob2QgaGFzIGJlZW4gbW9kaWZpZWQgdG8gd2Fsa1xuLy8gdGhlIGxpbmtlZCBsaXN0IG9mIGNoaWxkIG5vZGVzIHJhdGhlciB0aGFuIGFjY2VzcyB0aGUgY2hpbGQgYnkgaW5kZXhcbi8vIGRpcmVjdGx5LCBldmVuIHRob3VnaCB0aGVyZSBhcmUgdHdvICgyKSBBUElzIGluIHRoZSBET00gdGhhdCBkbyB0aGlzIGZvciB1cy5cbi8vIElmIHlvdSdyZSB0aGlua2luZyB0byB5b3Vyc2VsZiwgXCJXaGF0IGFuIG92ZXJzaWdodCEgV2hhdCBhbiBvcHBvcnR1bml0eSB0b1xuLy8gb3B0aW1pemUgdGhpcyBjb2RlIVwiIHRoZW4gdG8geW91IEkgc2F5OiBzdG9wISBGb3IgSSBoYXZlIGEgdGFsZSB0byB0ZWxsLlxuLy9cbi8vIEZpcnN0LCB0aGlzIGNvZGUgbXVzdCBiZSBjb21wYXRpYmxlIHdpdGggc2ltcGxlLWRvbSBmb3IgcmVuZGVyaW5nIG9uIHRoZVxuLy8gc2VydmVyIHdoZXJlIHRoZXJlIGlzIG5vIHJlYWwgRE9NLiBQcmV2aW91c2x5LCB3ZSBhY2Nlc3NlZCBhIGNoaWxkIG5vZGVcbi8vIGRpcmVjdGx5IHZpYSBgZWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XWAuIFdoaWxlIHdlICpjb3VsZCogaW4gdGhlb3J5IGRvIGFcbi8vIGZ1bGwtZmlkZWxpdHkgc2ltdWxhdGlvbiBvZiBhIGxpdmUgYGNoaWxkTm9kZXNgIGFycmF5LCB0aGlzIGlzIHNsb3csXG4vLyBjb21wbGljYXRlZCBhbmQgZXJyb3ItcHJvbmUuXG4vL1xuLy8gXCJObyBwcm9ibGVtLFwiIHdlIHRob3VnaHQsIFwid2UnbGwganVzdCB1c2UgdGhlIHNpbWlsYXJcbi8vIGBjaGlsZE5vZGVzLml0ZW0oaW5kZXgpYCBBUEkuXCIgVGhlbiwgd2UgY291bGQganVzdCBpbXBsZW1lbnQgb3VyIG93biBgaXRlbWBcbi8vIG1ldGhvZCBpbiBzaW1wbGUtZG9tIGFuZCB3YWxrIHRoZSBjaGlsZCBub2RlIGxpbmtlZCBsaXN0IHRoZXJlLCBhbGxvd2luZ1xuLy8gdXMgdG8gcmV0YWluIHRoZSBwZXJmb3JtYW5jZSBhZHZhbnRhZ2VzIG9mIHRoZSAoc3VyZWx5IG9wdGltaXplZCkgYGl0ZW0oKWBcbi8vIEFQSSBpbiB0aGUgYnJvd3Nlci5cbi8vXG4vLyBVbmZvcnR1bmF0ZWx5LCBhbiBlbnRlcnByaXNpbmcgc291bCBuYW1lZCBTYW15IEFsemFocmFuaSBkaXNjb3ZlcmVkIHRoYXQgaW5cbi8vIElFOCwgYWNjZXNzaW5nIGFuIGl0ZW0gb3V0LW9mLWJvdW5kcyB2aWEgYGl0ZW0oKWAgY2F1c2VzIGFuIGV4Y2VwdGlvbiB3aGVyZVxuLy8gb3RoZXIgYnJvd3NlcnMgcmV0dXJuIG51bGwuIFRoaXMgbmVjZXNzaXRhdGVkIGEuLi4gY2hlY2sgb2Zcbi8vIGBjaGlsZE5vZGVzLmxlbmd0aGAsIGJyaW5naW5nIHVzIGJhY2sgYXJvdW5kIHRvIGhhdmluZyB0byBzdXBwb3J0IGFcbi8vIGZ1bGwtZmlkZWxpdHkgYGNoaWxkTm9kZXNgIGFycmF5IVxuLy9cbi8vIFdvcnN0IG9mIGFsbCwgS3JpcyBTZWxkZW4gaW52ZXN0aWdhdGVkIGhvdyBicm93c2VycyBhcmUgYWN0dWFseSBpbXBsZW1lbnRlZFxuLy8gYW5kIGRpc2NvdmVyZWQgdGhhdCB0aGV5J3JlIGFsbCBsaW5rZWQgbGlzdHMgdW5kZXIgdGhlIGhvb2QgYW55d2F5LiBBY2Nlc3Npbmdcbi8vIGBjaGlsZE5vZGVzYCByZXF1aXJlcyB0aGVtIHRvIGFsbG9jYXRlIGEgbmV3IGxpdmUgY29sbGVjdGlvbiBiYWNrZWQgYnkgdGhhdFxuLy8gbGlua2VkIGxpc3QsIHdoaWNoIGlzIGl0c2VsZiBhIHJhdGhlciBleHBlbnNpdmUgb3BlcmF0aW9uLiBPdXIgYXNzdW1lZFxuLy8gb3B0aW1pemF0aW9uIGhhZCBiYWNrZmlyZWQhIFRoYXQgaXMgdGhlIGRhbmdlciBvZiBtYWdpY2FsIHRoaW5raW5nIGFib3V0XG4vLyB0aGUgcGVyZm9ybWFuY2Ugb2YgbmF0aXZlIGltcGxlbWVudGF0aW9ucy5cbi8vXG4vLyBBbmQgdGhpcywgbXkgZnJpZW5kcywgaXMgd2h5IHRoZSBmb2xsb3dpbmcgaW1wbGVtZW50YXRpb24ganVzdCB3YWxrcyB0aGVcbi8vIGxpbmtlZCBsaXN0LCBhcyBzdXJwcmlzZWQgYXMgdGhhdCBtYXkgbWFrZSB5b3UuIFBsZWFzZSBlbnN1cmUgeW91IHVuZGVyc3RhbmRcbi8vIHRoZSBhYm92ZSBiZWZvcmUgY2hhbmdpbmcgdGhpcyBhbmQgc3VibWl0dGluZyBhIFBSLlxuLy9cbi8vIFRvbSBEYWxlLCBKYW51YXJ5IDE4dGgsIDIwMTUsIFBvcnRsYW5kIE9SXG5wcm90b3R5cGUuY2hpbGRBdEluZGV4ID0gZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgpIHtcbiAgdmFyIG5vZGUgPSBlbGVtZW50LmZpcnN0Q2hpbGQ7XG5cbiAgZm9yICh2YXIgaWR4ID0gMDsgbm9kZSAmJiBpZHggPCBpbmRleDsgaWR4KyspIHtcbiAgICBub2RlID0gbm9kZS5uZXh0U2libGluZztcbiAgfVxuXG4gIHJldHVybiBub2RlO1xufTtcblxucHJvdG90eXBlLmFwcGVuZFRleHQgPSBmdW5jdGlvbihlbGVtZW50LCB0ZXh0KSB7XG4gIHJldHVybiBlbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCkpO1xufTtcblxucHJvdG90eXBlLnNldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIHZhbHVlKSB7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIFN0cmluZyh2YWx1ZSkpO1xufTtcblxucHJvdG90eXBlLmdldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUpIHtcbiAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKG5hbWUpO1xufTtcblxucHJvdG90eXBlLnNldEF0dHJpYnV0ZU5TID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSkge1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKG5hbWVzcGFjZSwgbmFtZSwgU3RyaW5nKHZhbHVlKSk7XG59O1xuXG5wcm90b3R5cGUuZ2V0QXR0cmlidXRlTlMgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lc3BhY2UsIG5hbWUpIHtcbiAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlTlMobmFtZXNwYWNlLCBuYW1lKTtcbn07XG5cbmlmIChjYW5SZW1vdmVTdmdWaWV3Qm94QXR0cmlidXRlKXtcbiAgcHJvdG90eXBlLnJlbW92ZUF0dHJpYnV0ZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUpIHtcbiAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn0gZWxzZSB7XG4gIHByb3RvdHlwZS5yZW1vdmVBdHRyaWJ1dGUgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lKSB7XG4gICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ3N2ZycgJiYgbmFtZSA9PT0gJ3ZpZXdCb3gnKSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgfVxuICB9O1xufVxuXG5wcm90b3R5cGUuc2V0UHJvcGVydHlTdHJpY3QgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCB2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhbHVlID0gbnVsbDtcbiAgfVxuXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCAmJiAobmFtZSA9PT0gJ3ZhbHVlJyB8fCBuYW1lID09PSAndHlwZScgfHwgbmFtZSA9PT0gJ3NyYycpKSB7XG4gICAgdmFsdWUgPSAnJztcbiAgfVxuXG4gIGVsZW1lbnRbbmFtZV0gPSB2YWx1ZTtcbn07XG5cbnByb3RvdHlwZS5nZXRQcm9wZXJ0eVN0cmljdCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUpIHtcbiAgcmV0dXJuIGVsZW1lbnRbbmFtZV07XG59O1xuXG5wcm90b3R5cGUuc2V0UHJvcGVydHkgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCB2YWx1ZSwgbmFtZXNwYWNlKSB7XG4gIGlmIChlbGVtZW50Lm5hbWVzcGFjZVVSSSA9PT0gc3ZnTmFtZXNwYWNlKSB7XG4gICAgaWYgKGlzQXR0clJlbW92YWxWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobmFtZXNwYWNlKSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlTlMobmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciB7IG5vcm1hbGl6ZWQgLCB0eXBlIH0gPSBub3JtYWxpemVQcm9wZXJ0eShlbGVtZW50LCBuYW1lKTtcbiAgICBpZiAodHlwZSA9PT0gJ3Byb3AnKSB7XG4gICAgICBlbGVtZW50W25vcm1hbGl6ZWRdID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc0F0dHJSZW1vdmFsVmFsdWUodmFsdWUpKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5hbWVzcGFjZSAmJiBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKSB7XG4gICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhuYW1lc3BhY2UsIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmlmIChkb2MgJiYgZG9jLmNyZWF0ZUVsZW1lbnROUykge1xuICAvLyBPbmx5IG9wdCBpbnRvIG5hbWVzcGFjZSBkZXRlY3Rpb24gaWYgYSBjb250ZXh0dWFsRWxlbWVudFxuICAvLyBpcyBwYXNzZWQuXG4gIHByb3RvdHlwZS5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24odGFnTmFtZSwgY29udGV4dHVhbEVsZW1lbnQpIHtcbiAgICB2YXIgbmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2U7XG4gICAgaWYgKGNvbnRleHR1YWxFbGVtZW50KSB7XG4gICAgICBpZiAodGFnTmFtZSA9PT0gJ3N2ZycpIHtcbiAgICAgICAgbmFtZXNwYWNlID0gc3ZnTmFtZXNwYWNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmFtZXNwYWNlID0gaW50ZXJpb3JOYW1lc3BhY2UoY29udGV4dHVhbEVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmFtZXNwYWNlKSB7XG4gICAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCB0YWdOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5zZXRBdHRyaWJ1dGVOUyA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWVzcGFjZSwgbmFtZSwgdmFsdWUpIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKG5hbWVzcGFjZSwgbmFtZSwgU3RyaW5nKHZhbHVlKSk7XG4gIH07XG59IGVsc2Uge1xuICBwcm90b3R5cGUuY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uKHRhZ05hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICB9O1xuICBwcm90b3R5cGUuc2V0QXR0cmlidXRlTlMgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lc3BhY2UsIG5hbWUsIHZhbHVlKSB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUobmFtZSwgU3RyaW5nKHZhbHVlKSk7XG4gIH07XG59XG5cbnByb3RvdHlwZS5hZGRDbGFzc2VzID0gYWRkQ2xhc3NlcztcbnByb3RvdHlwZS5yZW1vdmVDbGFzc2VzID0gcmVtb3ZlQ2xhc3NlcztcblxucHJvdG90eXBlLnNldE5hbWVzcGFjZSA9IGZ1bmN0aW9uKG5zKSB7XG4gIHRoaXMubmFtZXNwYWNlID0gbnM7XG59O1xuXG5wcm90b3R5cGUuZGV0ZWN0TmFtZXNwYWNlID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICB0aGlzLm5hbWVzcGFjZSA9IGludGVyaW9yTmFtZXNwYWNlKGVsZW1lbnQpO1xufTtcblxucHJvdG90eXBlLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG59O1xuXG5wcm90b3R5cGUuY3JlYXRlVGV4dE5vZGUgPSBmdW5jdGlvbih0ZXh0KXtcbiAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59O1xuXG5wcm90b3R5cGUuY3JlYXRlQ29tbWVudCA9IGZ1bmN0aW9uKHRleHQpe1xuICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVDb21tZW50KHRleHQpO1xufTtcblxucHJvdG90eXBlLnJlcGFpckNsb25lZE5vZGUgPSBmdW5jdGlvbihlbGVtZW50LCBibGFua0NoaWxkVGV4dE5vZGVzLCBpc0NoZWNrZWQpe1xuICBpZiAoZGVsZXRlc0JsYW5rVGV4dE5vZGVzICYmIGJsYW5rQ2hpbGRUZXh0Tm9kZXMubGVuZ3RoID4gMCkge1xuICAgIGZvciAodmFyIGk9MCwgbGVuPWJsYW5rQ2hpbGRUZXh0Tm9kZXMubGVuZ3RoO2k8bGVuO2krKyl7XG4gICAgICB2YXIgdGV4dE5vZGUgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSxcbiAgICAgICAgICBvZmZzZXQgPSBibGFua0NoaWxkVGV4dE5vZGVzW2ldLFxuICAgICAgICAgIGJlZm9yZSA9IHRoaXMuY2hpbGRBdEluZGV4KGVsZW1lbnQsIG9mZnNldCk7XG4gICAgICBpZiAoYmVmb3JlKSB7XG4gICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRleHROb2RlLCBiZWZvcmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChpZ25vcmVzQ2hlY2tlZEF0dHJpYnV0ZSAmJiBpc0NoZWNrZWQpIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsICdjaGVja2VkJyk7XG4gIH1cbn07XG5cbnByb3RvdHlwZS5jbG9uZU5vZGUgPSBmdW5jdGlvbihlbGVtZW50LCBkZWVwKXtcbiAgdmFyIGNsb25lID0gZWxlbWVudC5jbG9uZU5vZGUoISFkZWVwKTtcbiAgcmV0dXJuIGNsb25lO1xufTtcblxucHJvdG90eXBlLkF0dHJNb3JwaENsYXNzID0gQXR0ck1vcnBoO1xuXG5wcm90b3R5cGUuY3JlYXRlQXR0ck1vcnBoID0gZnVuY3Rpb24oZWxlbWVudCwgYXR0ck5hbWUsIG5hbWVzcGFjZSl7XG4gIHJldHVybiBuZXcgdGhpcy5BdHRyTW9ycGhDbGFzcyhlbGVtZW50LCBhdHRyTmFtZSwgdGhpcywgbmFtZXNwYWNlKTtcbn07XG5cbnByb3RvdHlwZS5FbGVtZW50TW9ycGhDbGFzcyA9IEVsZW1lbnRNb3JwaDtcblxucHJvdG90eXBlLmNyZWF0ZUVsZW1lbnRNb3JwaCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWVzcGFjZSl7XG4gIHJldHVybiBuZXcgdGhpcy5FbGVtZW50TW9ycGhDbGFzcyhlbGVtZW50LCB0aGlzLCBuYW1lc3BhY2UpO1xufTtcblxucHJvdG90eXBlLmNyZWF0ZVVuc2FmZUF0dHJNb3JwaCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJOYW1lLCBuYW1lc3BhY2Upe1xuICB2YXIgbW9ycGggPSB0aGlzLmNyZWF0ZUF0dHJNb3JwaChlbGVtZW50LCBhdHRyTmFtZSwgbmFtZXNwYWNlKTtcbiAgbW9ycGguZXNjYXBlZCA9IGZhbHNlO1xuICByZXR1cm4gbW9ycGg7XG59O1xuXG5wcm90b3R5cGUuTW9ycGhDbGFzcyA9IE1vcnBoO1xuXG5wcm90b3R5cGUuY3JlYXRlTW9ycGggPSBmdW5jdGlvbihwYXJlbnQsIHN0YXJ0LCBlbmQsIGNvbnRleHR1YWxFbGVtZW50KXtcbiAgaWYgKGNvbnRleHR1YWxFbGVtZW50ICYmIGNvbnRleHR1YWxFbGVtZW50Lm5vZGVUeXBlID09PSAxMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBwYXNzIGEgZnJhZ21lbnQgYXMgdGhlIGNvbnRleHR1YWwgZWxlbWVudCB0byBjcmVhdGVNb3JwaFwiKTtcbiAgfVxuXG4gIGlmICghY29udGV4dHVhbEVsZW1lbnQgJiYgcGFyZW50ICYmIHBhcmVudC5ub2RlVHlwZSA9PT0gMSkge1xuICAgIGNvbnRleHR1YWxFbGVtZW50ID0gcGFyZW50O1xuICB9XG4gIHZhciBtb3JwaCA9IG5ldyB0aGlzLk1vcnBoQ2xhc3ModGhpcywgY29udGV4dHVhbEVsZW1lbnQpO1xuICBtb3JwaC5maXJzdE5vZGUgPSBzdGFydDtcbiAgbW9ycGgubGFzdE5vZGUgPSBlbmQ7XG4gIHJldHVybiBtb3JwaDtcbn07XG5cbnByb3RvdHlwZS5jcmVhdGVGcmFnbWVudE1vcnBoID0gZnVuY3Rpb24oY29udGV4dHVhbEVsZW1lbnQpIHtcbiAgaWYgKGNvbnRleHR1YWxFbGVtZW50ICYmIGNvbnRleHR1YWxFbGVtZW50Lm5vZGVUeXBlID09PSAxMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBwYXNzIGEgZnJhZ21lbnQgYXMgdGhlIGNvbnRleHR1YWwgZWxlbWVudCB0byBjcmVhdGVNb3JwaFwiKTtcbiAgfVxuXG4gIHZhciBmcmFnbWVudCA9IHRoaXMuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICByZXR1cm4gTW9ycGguY3JlYXRlKHRoaXMsIGNvbnRleHR1YWxFbGVtZW50LCBmcmFnbWVudCk7XG59O1xuXG5wcm90b3R5cGUucmVwbGFjZUNvbnRlbnRXaXRoTW9ycGggPSBmdW5jdGlvbihlbGVtZW50KSAge1xuICB2YXIgZmlyc3RDaGlsZCA9IGVsZW1lbnQuZmlyc3RDaGlsZDtcblxuICBpZiAoIWZpcnN0Q2hpbGQpIHtcbiAgICB2YXIgY29tbWVudCA9IHRoaXMuY3JlYXRlQ29tbWVudCgnJyk7XG4gICAgdGhpcy5hcHBlbmRDaGlsZChlbGVtZW50LCBjb21tZW50KTtcbiAgICByZXR1cm4gTW9ycGguY3JlYXRlKHRoaXMsIGVsZW1lbnQsIGNvbW1lbnQpO1xuICB9IGVsc2Uge1xuICAgIHZhciBtb3JwaCA9IE1vcnBoLmF0dGFjaCh0aGlzLCBlbGVtZW50LCBmaXJzdENoaWxkLCBlbGVtZW50Lmxhc3RDaGlsZCk7XG4gICAgbW9ycGguY2xlYXIoKTtcbiAgICByZXR1cm4gbW9ycGg7XG4gIH1cbn07XG5cbnByb3RvdHlwZS5jcmVhdGVVbnNhZmVNb3JwaCA9IGZ1bmN0aW9uKHBhcmVudCwgc3RhcnQsIGVuZCwgY29udGV4dHVhbEVsZW1lbnQpe1xuICB2YXIgbW9ycGggPSB0aGlzLmNyZWF0ZU1vcnBoKHBhcmVudCwgc3RhcnQsIGVuZCwgY29udGV4dHVhbEVsZW1lbnQpO1xuICBtb3JwaC5wYXJzZVRleHRBc0hUTUwgPSB0cnVlO1xuICByZXR1cm4gbW9ycGg7XG59O1xuXG4vLyBUaGlzIGhlbHBlciBpcyBqdXN0IHRvIGtlZXAgdGhlIHRlbXBsYXRlcyBnb29kIGxvb2tpbmcsXG4vLyBwYXNzaW5nIGludGVnZXJzIGluc3RlYWQgb2YgZWxlbWVudCByZWZlcmVuY2VzLlxucHJvdG90eXBlLmNyZWF0ZU1vcnBoQXQgPSBmdW5jdGlvbihwYXJlbnQsIHN0YXJ0SW5kZXgsIGVuZEluZGV4LCBjb250ZXh0dWFsRWxlbWVudCl7XG4gIHZhciBzaW5nbGUgPSBzdGFydEluZGV4ID09PSBlbmRJbmRleDtcbiAgdmFyIHN0YXJ0ID0gdGhpcy5jaGlsZEF0SW5kZXgocGFyZW50LCBzdGFydEluZGV4KTtcbiAgdmFyIGVuZCA9IHNpbmdsZSA/IHN0YXJ0IDogdGhpcy5jaGlsZEF0SW5kZXgocGFyZW50LCBlbmRJbmRleCk7XG4gIHJldHVybiB0aGlzLmNyZWF0ZU1vcnBoKHBhcmVudCwgc3RhcnQsIGVuZCwgY29udGV4dHVhbEVsZW1lbnQpO1xufTtcblxucHJvdG90eXBlLmNyZWF0ZVVuc2FmZU1vcnBoQXQgPSBmdW5jdGlvbihwYXJlbnQsIHN0YXJ0SW5kZXgsIGVuZEluZGV4LCBjb250ZXh0dWFsRWxlbWVudCkge1xuICB2YXIgbW9ycGggPSB0aGlzLmNyZWF0ZU1vcnBoQXQocGFyZW50LCBzdGFydEluZGV4LCBlbmRJbmRleCwgY29udGV4dHVhbEVsZW1lbnQpO1xuICBtb3JwaC5wYXJzZVRleHRBc0hUTUwgPSB0cnVlO1xuICByZXR1cm4gbW9ycGg7XG59O1xuXG5wcm90b3R5cGUuaW5zZXJ0TW9ycGhCZWZvcmUgPSBmdW5jdGlvbihlbGVtZW50LCByZWZlcmVuY2VDaGlsZCwgY29udGV4dHVhbEVsZW1lbnQpIHtcbiAgdmFyIGluc2VydGlvbiA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJyk7XG4gIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGluc2VydGlvbiwgcmVmZXJlbmNlQ2hpbGQpO1xuICByZXR1cm4gdGhpcy5jcmVhdGVNb3JwaChlbGVtZW50LCBpbnNlcnRpb24sIGluc2VydGlvbiwgY29udGV4dHVhbEVsZW1lbnQpO1xufTtcblxucHJvdG90eXBlLmFwcGVuZE1vcnBoID0gZnVuY3Rpb24oZWxlbWVudCwgY29udGV4dHVhbEVsZW1lbnQpIHtcbiAgdmFyIGluc2VydGlvbiA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJyk7XG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5zZXJ0aW9uKTtcbiAgcmV0dXJuIHRoaXMuY3JlYXRlTW9ycGgoZWxlbWVudCwgaW5zZXJ0aW9uLCBpbnNlcnRpb24sIGNvbnRleHR1YWxFbGVtZW50KTtcbn07XG5cbnByb3RvdHlwZS5pbnNlcnRCb3VuZGFyeSA9IGZ1bmN0aW9uKGZyYWdtZW50LCBpbmRleCkge1xuICAvLyB0aGlzIHdpbGwgYWx3YXlzIGJlIG51bGwgb3IgZmlyc3RDaGlsZFxuICB2YXIgY2hpbGQgPSBpbmRleCA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLmNoaWxkQXRJbmRleChmcmFnbWVudCwgaW5kZXgpO1xuICB0aGlzLmluc2VydEJlZm9yZShmcmFnbWVudCwgdGhpcy5jcmVhdGVUZXh0Tm9kZSgnJyksIGNoaWxkKTtcbn07XG5cbnByb3RvdHlwZS5zZXRNb3JwaEhUTUwgPSBmdW5jdGlvbihtb3JwaCwgaHRtbCkge1xuICBtb3JwaC5zZXRIVE1MKGh0bWwpO1xufTtcblxucHJvdG90eXBlLnBhcnNlSFRNTCA9IGZ1bmN0aW9uKGh0bWwsIGNvbnRleHR1YWxFbGVtZW50KSB7XG4gIHZhciBjaGlsZE5vZGVzO1xuXG4gIGlmIChpbnRlcmlvck5hbWVzcGFjZShjb250ZXh0dWFsRWxlbWVudCkgPT09IHN2Z05hbWVzcGFjZSkge1xuICAgIGNoaWxkTm9kZXMgPSBidWlsZFNWR0RPTShodG1sLCB0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbm9kZXMgPSBidWlsZEhUTUxET00oaHRtbCwgY29udGV4dHVhbEVsZW1lbnQsIHRoaXMpO1xuICAgIGlmIChkZXRlY3RPbWl0dGVkU3RhcnRUYWcoaHRtbCwgY29udGV4dHVhbEVsZW1lbnQpKSB7XG4gICAgICB2YXIgbm9kZSA9IG5vZGVzWzBdO1xuICAgICAgd2hpbGUgKG5vZGUgJiYgbm9kZS5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICBub2RlID0gbm9kZS5uZXh0U2libGluZztcbiAgICAgIH1cbiAgICAgIGNoaWxkTm9kZXMgPSBub2RlLmNoaWxkTm9kZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoaWxkTm9kZXMgPSBub2RlcztcbiAgICB9XG4gIH1cblxuICAvLyBDb3B5IG5vZGUgbGlzdCB0byBhIGZyYWdtZW50LlxuICB2YXIgZnJhZ21lbnQgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICBpZiAoY2hpbGROb2RlcyAmJiBjaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgY3VycmVudE5vZGUgPSBjaGlsZE5vZGVzWzBdO1xuXG4gICAgLy8gV2UgcHJlcGVuZCBhbiA8b3B0aW9uPiB0byA8c2VsZWN0PiBib3hlcyB0byBhYnNvcmIgYW55IGJyb3dzZXIgYnVnc1xuICAgIC8vIHJlbGF0ZWQgdG8gYXV0by1zZWxlY3QgYmVoYXZpb3IuIFNraXAgcGFzdCBpdC5cbiAgICBpZiAoY29udGV4dHVhbEVsZW1lbnQudGFnTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dFNpYmxpbmc7XG4gICAgfVxuXG4gICAgd2hpbGUgKGN1cnJlbnROb2RlKSB7XG4gICAgICB2YXIgdGVtcE5vZGUgPSBjdXJyZW50Tm9kZTtcbiAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dFNpYmxpbmc7XG5cbiAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKHRlbXBOb2RlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59O1xuXG52YXIgcGFyc2luZ05vZGU7XG5cbi8vIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBVUkwgbmVlZHMgdG8gYmUgc2FuaXRpemVkLlxucHJvdG90eXBlLnByb3RvY29sRm9yVVJMID0gZnVuY3Rpb24odXJsKSB7XG4gIGlmICghcGFyc2luZ05vZGUpIHtcbiAgICBwYXJzaW5nTm9kZSA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICB9XG5cbiAgcGFyc2luZ05vZGUuaHJlZiA9IHVybDtcbiAgcmV0dXJuIHBhcnNpbmdOb2RlLnByb3RvY29sO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRE9NSGVscGVyO1xuIl19
define('dom-helper/build-html-dom', ['exports'], function (exports) {
  /* global XMLSerializer:false */
  var svgHTMLIntegrationPoints = { foreignObject: 1, desc: 1, title: 1 };
  exports.svgHTMLIntegrationPoints = svgHTMLIntegrationPoints;
  var svgNamespace = 'http://www.w3.org/2000/svg';

  exports.svgNamespace = svgNamespace;
  var doc = typeof document === 'undefined' ? false : document;

  // Safari does not like using innerHTML on SVG HTML integration
  // points (desc/title/foreignObject).
  var needsIntegrationPointFix = doc && (function (document) {
    if (document.createElementNS === undefined) {
      return;
    }
    // In FF title will not accept innerHTML.
    var testEl = document.createElementNS(svgNamespace, 'title');
    testEl.innerHTML = "<div></div>";
    return testEl.childNodes.length === 0 || testEl.childNodes[0].nodeType !== 1;
  })(doc);

  // Internet Explorer prior to 9 does not allow setting innerHTML if the first element
  // is a "zero-scope" element. This problem can be worked around by making
  // the first node an invisible text node. We, like Modernizr, use &shy;
  var needsShy = doc && (function (document) {
    var testEl = document.createElement('div');
    testEl.innerHTML = "<div></div>";
    testEl.firstChild.innerHTML = "<script><\/script>";
    return testEl.firstChild.innerHTML === '';
  })(doc);

  // IE 8 (and likely earlier) likes to move whitespace preceeding
  // a script tag to appear after it. This means that we can
  // accidentally remove whitespace when updating a morph.
  var movesWhitespace = doc && (function (document) {
    var testEl = document.createElement('div');
    testEl.innerHTML = "Test: <script type='text/x-placeholder'><\/script>Value";
    return testEl.childNodes[0].nodeValue === 'Test:' && testEl.childNodes[2].nodeValue === ' Value';
  })(doc);

  var tagNamesRequiringInnerHTMLFix = doc && (function (document) {
    var tagNamesRequiringInnerHTMLFix;
    // IE 9 and earlier don't allow us to set innerHTML on col, colgroup, frameset,
    // html, style, table, tbody, tfoot, thead, title, tr. Detect this and add
    // them to an initial list of corrected tags.
    //
    // Here we are only dealing with the ones which can have child nodes.
    //
    var tableNeedsInnerHTMLFix;
    var tableInnerHTMLTestElement = document.createElement('table');
    try {
      tableInnerHTMLTestElement.innerHTML = '<tbody></tbody>';
    } catch (e) {} finally {
      tableNeedsInnerHTMLFix = tableInnerHTMLTestElement.childNodes.length === 0;
    }
    if (tableNeedsInnerHTMLFix) {
      tagNamesRequiringInnerHTMLFix = {
        colgroup: ['table'],
        table: [],
        tbody: ['table'],
        tfoot: ['table'],
        thead: ['table'],
        tr: ['table', 'tbody']
      };
    }

    // IE 8 doesn't allow setting innerHTML on a select tag. Detect this and
    // add it to the list of corrected tags.
    //
    var selectInnerHTMLTestElement = document.createElement('select');
    selectInnerHTMLTestElement.innerHTML = '<option></option>';
    if (!selectInnerHTMLTestElement.childNodes[0]) {
      tagNamesRequiringInnerHTMLFix = tagNamesRequiringInnerHTMLFix || {};
      tagNamesRequiringInnerHTMLFix.select = [];
    }
    return tagNamesRequiringInnerHTMLFix;
  })(doc);

  function scriptSafeInnerHTML(element, html) {
    // without a leading text node, IE will drop a leading script tag.
    html = '&shy;' + html;

    element.innerHTML = html;

    var nodes = element.childNodes;

    // Look for &shy; to remove it.
    var shyElement = nodes[0];
    while (shyElement.nodeType === 1 && !shyElement.nodeName) {
      shyElement = shyElement.firstChild;
    }
    // At this point it's the actual unicode character.
    if (shyElement.nodeType === 3 && shyElement.nodeValue.charAt(0) === "\u00AD") {
      var newValue = shyElement.nodeValue.slice(1);
      if (newValue.length) {
        shyElement.nodeValue = shyElement.nodeValue.slice(1);
      } else {
        shyElement.parentNode.removeChild(shyElement);
      }
    }

    return nodes;
  }

  function buildDOMWithFix(html, contextualElement) {
    var tagName = contextualElement.tagName;

    // Firefox versions < 11 do not have support for element.outerHTML.
    var outerHTML = contextualElement.outerHTML || new XMLSerializer().serializeToString(contextualElement);
    if (!outerHTML) {
      throw "Can't set innerHTML on " + tagName + " in this browser";
    }

    html = fixSelect(html, contextualElement);

    var wrappingTags = tagNamesRequiringInnerHTMLFix[tagName.toLowerCase()];

    var startTag = outerHTML.match(new RegExp("<" + tagName + "([^>]*)>", 'i'))[0];
    var endTag = '</' + tagName + '>';

    var wrappedHTML = [startTag, html, endTag];

    var i = wrappingTags.length;
    var wrappedDepth = 1 + i;
    while (i--) {
      wrappedHTML.unshift('<' + wrappingTags[i] + '>');
      wrappedHTML.push('</' + wrappingTags[i] + '>');
    }

    var wrapper = document.createElement('div');
    scriptSafeInnerHTML(wrapper, wrappedHTML.join(''));
    var element = wrapper;
    while (wrappedDepth--) {
      element = element.firstChild;
      while (element && element.nodeType !== 1) {
        element = element.nextSibling;
      }
    }
    while (element && element.tagName !== tagName) {
      element = element.nextSibling;
    }
    return element ? element.childNodes : [];
  }

  var buildDOM;
  if (needsShy) {
    buildDOM = function buildDOM(html, contextualElement, dom) {
      html = fixSelect(html, contextualElement);

      contextualElement = dom.cloneNode(contextualElement, false);
      scriptSafeInnerHTML(contextualElement, html);
      return contextualElement.childNodes;
    };
  } else {
    buildDOM = function buildDOM(html, contextualElement, dom) {
      html = fixSelect(html, contextualElement);

      contextualElement = dom.cloneNode(contextualElement, false);
      contextualElement.innerHTML = html;
      return contextualElement.childNodes;
    };
  }

  function fixSelect(html, contextualElement) {
    if (contextualElement.tagName === 'SELECT') {
      html = "<option></option>" + html;
    }

    return html;
  }

  var buildIESafeDOM;
  if (tagNamesRequiringInnerHTMLFix || movesWhitespace) {
    buildIESafeDOM = function buildIESafeDOM(html, contextualElement, dom) {
      // Make a list of the leading text on script nodes. Include
      // script tags without any whitespace for easier processing later.
      var spacesBefore = [];
      var spacesAfter = [];
      if (typeof html === 'string') {
        html = html.replace(/(\s*)(<script)/g, function (match, spaces, tag) {
          spacesBefore.push(spaces);
          return tag;
        });

        html = html.replace(/(<\/script>)(\s*)/g, function (match, tag, spaces) {
          spacesAfter.push(spaces);
          return tag;
        });
      }

      // Fetch nodes
      var nodes;
      if (tagNamesRequiringInnerHTMLFix[contextualElement.tagName.toLowerCase()]) {
        // buildDOMWithFix uses string wrappers for problematic innerHTML.
        nodes = buildDOMWithFix(html, contextualElement);
      } else {
        nodes = buildDOM(html, contextualElement, dom);
      }

      // Build a list of script tags, the nodes themselves will be
      // mutated as we add test nodes.
      var i, j, node, nodeScriptNodes;
      var scriptNodes = [];
      for (i = 0; i < nodes.length; i++) {
        node = nodes[i];
        if (node.nodeType !== 1) {
          continue;
        }
        if (node.tagName === 'SCRIPT') {
          scriptNodes.push(node);
        } else {
          nodeScriptNodes = node.getElementsByTagName('script');
          for (j = 0; j < nodeScriptNodes.length; j++) {
            scriptNodes.push(nodeScriptNodes[j]);
          }
        }
      }

      // Walk the script tags and put back their leading text nodes.
      var scriptNode, textNode, spaceBefore, spaceAfter;
      for (i = 0; i < scriptNodes.length; i++) {
        scriptNode = scriptNodes[i];
        spaceBefore = spacesBefore[i];
        if (spaceBefore && spaceBefore.length > 0) {
          textNode = dom.document.createTextNode(spaceBefore);
          scriptNode.parentNode.insertBefore(textNode, scriptNode);
        }

        spaceAfter = spacesAfter[i];
        if (spaceAfter && spaceAfter.length > 0) {
          textNode = dom.document.createTextNode(spaceAfter);
          scriptNode.parentNode.insertBefore(textNode, scriptNode.nextSibling);
        }
      }

      return nodes;
    };
  } else {
    buildIESafeDOM = buildDOM;
  }

  var buildHTMLDOM;
  if (needsIntegrationPointFix) {
    exports.buildHTMLDOM = buildHTMLDOM = function buildHTMLDOM(html, contextualElement, dom) {
      if (svgHTMLIntegrationPoints[contextualElement.tagName]) {
        return buildIESafeDOM(html, document.createElement('div'), dom);
      } else {
        return buildIESafeDOM(html, contextualElement, dom);
      }
    };
  } else {
    exports.buildHTMLDOM = buildHTMLDOM = buildIESafeDOM;
  }

  exports.buildHTMLDOM = buildHTMLDOM;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXIvYnVpbGQtaHRtbC1kb20uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDTyxNQUFJLHdCQUF3QixHQUFHLEVBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUMsQ0FBQztVQUFqRSx3QkFBd0IsR0FBeEIsd0JBQXdCO0FBQzVCLE1BQUksWUFBWSxHQUFHLDRCQUE0QixDQUFDOztVQUE1QyxZQUFZLEdBQVosWUFBWTtBQUV2QixNQUFJLEdBQUcsR0FBRyxPQUFPLFFBQVEsS0FBSyxXQUFXLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQzs7OztBQUk3RCxNQUFJLHdCQUF3QixHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVMsUUFBUSxFQUFFO0FBQ3hELFFBQUksUUFBUSxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQUU7QUFDMUMsYUFBTztLQUNSOztBQUVELFFBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzdELFVBQU0sQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDO0FBQ2pDLFdBQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQztHQUM5RSxDQUFBLENBQUUsR0FBRyxDQUFDLENBQUM7Ozs7O0FBS1IsTUFBSSxRQUFRLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBUyxRQUFRLEVBQUU7QUFDeEMsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQyxVQUFNLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQztBQUNqQyxVQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztBQUNuRCxXQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FB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Q0FBQyxDQUFDO09BQ3JEO0tBQ0YsQ0FBQztHQUNILE1BQU07QUFDTCxZQUdNLFlBQVksR0FIbEIsWUFBWSxHQUFHLGNBQWMsQ0FBQztHQUMvQjs7VUFFTyxZQUFZLEdBQVosWUFBWSIsImZpbGUiOiJkb20taGVscGVyL2J1aWxkLWh0bWwtZG9tLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIFhNTFNlcmlhbGl6ZXI6ZmFsc2UgKi9cbmV4cG9ydCB2YXIgc3ZnSFRNTEludGVncmF0aW9uUG9pbnRzID0ge2ZvcmVpZ25PYmplY3Q6IDEsIGRlc2M6IDEsIHRpdGxlOiAxfTtcbmV4cG9ydCB2YXIgc3ZnTmFtZXNwYWNlID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcblxudmFyIGRvYyA9IHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcgPyBmYWxzZSA6IGRvY3VtZW50O1xuXG4vLyBTYWZhcmkgZG9lcyBub3QgbGlrZSB1c2luZyBpbm5lckhUTUwgb24gU1ZHIEhUTUwgaW50ZWdyYXRpb25cbi8vIHBvaW50cyAoZGVzYy90aXRsZS9mb3JlaWduT2JqZWN0KS5cbnZhciBuZWVkc0ludGVncmF0aW9uUG9pbnRGaXggPSBkb2MgJiYgKGZ1bmN0aW9uKGRvY3VtZW50KSB7XG4gIGlmIChkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBJbiBGRiB0aXRsZSB3aWxsIG5vdCBhY2NlcHQgaW5uZXJIVE1MLlxuICB2YXIgdGVzdEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHN2Z05hbWVzcGFjZSwgJ3RpdGxlJyk7XG4gIHRlc3RFbC5pbm5lckhUTUwgPSBcIjxkaXY+PC9kaXY+XCI7XG4gIHJldHVybiB0ZXN0RWwuY2hpbGROb2Rlcy5sZW5ndGggPT09IDAgfHwgdGVzdEVsLmNoaWxkTm9kZXNbMF0ubm9kZVR5cGUgIT09IDE7XG59KShkb2MpO1xuXG4vLyBJbnRlcm5ldCBFeHBsb3JlciBwcmlvciB0byA5IGRvZXMgbm90IGFsbG93IHNldHRpbmcgaW5uZXJIVE1MIGlmIHRoZSBmaXJzdCBlbGVtZW50XG4vLyBpcyBhIFwiemVyby1zY29wZVwiIGVsZW1lbnQuIFRoaXMgcHJvYmxlbSBjYW4gYmUgd29ya2VkIGFyb3VuZCBieSBtYWtpbmdcbi8vIHRoZSBmaXJzdCBub2RlIGFuIGludmlzaWJsZSB0ZXh0IG5vZGUuIFdlLCBsaWtlIE1vZGVybml6ciwgdXNlICZzaHk7XG52YXIgbmVlZHNTaHkgPSBkb2MgJiYgKGZ1bmN0aW9uKGRvY3VtZW50KSB7XG4gIHZhciB0ZXN0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdGVzdEVsLmlubmVySFRNTCA9IFwiPGRpdj48L2Rpdj5cIjtcbiAgdGVzdEVsLmZpcnN0Q2hpbGQuaW5uZXJIVE1MID0gXCI8c2NyaXB0PjxcXC9zY3JpcHQ+XCI7XG4gIHJldHVybiB0ZXN0RWwuZmlyc3RDaGlsZC5pbm5lckhUTUwgPT09ICcnO1xufSkoZG9jKTtcblxuLy8gSUUgOCAoYW5kIGxpa2VseSBlYXJsaWVyKSBsaWtlcyB0byBtb3ZlIHdoaXRlc3BhY2UgcHJlY2VlZGluZ1xuLy8gYSBzY3JpcHQgdGFnIHRvIGFwcGVhciBhZnRlciBpdC4gVGhpcyBtZWFucyB0aGF0IHdlIGNhblxuLy8gYWNjaWRlbnRhbGx5IHJlbW92ZSB3aGl0ZXNwYWNlIHdoZW4gdXBkYXRpbmcgYSBtb3JwaC5cbnZhciBtb3Zlc1doaXRlc3BhY2UgPSBkb2MgJiYgKGZ1bmN0aW9uKGRvY3VtZW50KSB7XG4gIHZhciB0ZXN0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdGVzdEVsLmlubmVySFRNTCA9IFwiVGVzdDogPHNjcmlwdCB0eXBlPSd0ZXh0L3gtcGxhY2Vob2xkZXInPjxcXC9zY3JpcHQ+VmFsdWVcIjtcbiAgcmV0dXJuIHRlc3RFbC5jaGlsZE5vZGVzWzBdLm5vZGVWYWx1ZSA9PT0gJ1Rlc3Q6JyAmJlxuICAgICAgICAgIHRlc3RFbC5jaGlsZE5vZGVzWzJdLm5vZGVWYWx1ZSA9PT0gJyBWYWx1ZSc7XG59KShkb2MpO1xuXG52YXIgdGFnTmFtZXNSZXF1aXJpbmdJbm5lckhUTUxGaXggPSBkb2MgJiYgKGZ1bmN0aW9uKGRvY3VtZW50KSB7XG4gIHZhciB0YWdOYW1lc1JlcXVpcmluZ0lubmVySFRNTEZpeDtcbiAgLy8gSUUgOSBhbmQgZWFybGllciBkb24ndCBhbGxvdyB1cyB0byBzZXQgaW5uZXJIVE1MIG9uIGNvbCwgY29sZ3JvdXAsIGZyYW1lc2V0LFxuICAvLyBodG1sLCBzdHlsZSwgdGFibGUsIHRib2R5LCB0Zm9vdCwgdGhlYWQsIHRpdGxlLCB0ci4gRGV0ZWN0IHRoaXMgYW5kIGFkZFxuICAvLyB0aGVtIHRvIGFuIGluaXRpYWwgbGlzdCBvZiBjb3JyZWN0ZWQgdGFncy5cbiAgLy9cbiAgLy8gSGVyZSB3ZSBhcmUgb25seSBkZWFsaW5nIHdpdGggdGhlIG9uZXMgd2hpY2ggY2FuIGhhdmUgY2hpbGQgbm9kZXMuXG4gIC8vXG4gIHZhciB0YWJsZU5lZWRzSW5uZXJIVE1MRml4O1xuICB2YXIgdGFibGVJbm5lckhUTUxUZXN0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XG4gIHRyeSB7XG4gICAgdGFibGVJbm5lckhUTUxUZXN0RWxlbWVudC5pbm5lckhUTUwgPSAnPHRib2R5PjwvdGJvZHk+JztcbiAgfSBjYXRjaCAoZSkge1xuICB9IGZpbmFsbHkge1xuICAgIHRhYmxlTmVlZHNJbm5lckhUTUxGaXggPSAodGFibGVJbm5lckhUTUxUZXN0RWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMCk7XG4gIH1cbiAgaWYgKHRhYmxlTmVlZHNJbm5lckhUTUxGaXgpIHtcbiAgICB0YWdOYW1lc1JlcXVpcmluZ0lubmVySFRNTEZpeCA9IHtcbiAgICAgIGNvbGdyb3VwOiBbJ3RhYmxlJ10sXG4gICAgICB0YWJsZTogW10sXG4gICAgICB0Ym9keTogWyd0YWJsZSddLFxuICAgICAgdGZvb3Q6IFsndGFibGUnXSxcbiAgICAgIHRoZWFkOiBbJ3RhYmxlJ10sXG4gICAgICB0cjogWyd0YWJsZScsICd0Ym9keSddXG4gICAgfTtcbiAgfVxuXG4gIC8vIElFIDggZG9lc24ndCBhbGxvdyBzZXR0aW5nIGlubmVySFRNTCBvbiBhIHNlbGVjdCB0YWcuIERldGVjdCB0aGlzIGFuZFxuICAvLyBhZGQgaXQgdG8gdGhlIGxpc3Qgb2YgY29ycmVjdGVkIHRhZ3MuXG4gIC8vXG4gIHZhciBzZWxlY3RJbm5lckhUTUxUZXN0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpO1xuICBzZWxlY3RJbm5lckhUTUxUZXN0RWxlbWVudC5pbm5lckhUTUwgPSAnPG9wdGlvbj48L29wdGlvbj4nO1xuICBpZiAoIXNlbGVjdElubmVySFRNTFRlc3RFbGVtZW50LmNoaWxkTm9kZXNbMF0pIHtcbiAgICB0YWdOYW1lc1JlcXVpcmluZ0lubmVySFRNTEZpeCA9IHRhZ05hbWVzUmVxdWlyaW5nSW5uZXJIVE1MRml4IHx8IHt9O1xuICAgIHRhZ05hbWVzUmVxdWlyaW5nSW5uZXJIVE1MRml4LnNlbGVjdCA9IFtdO1xuICB9XG4gIHJldHVybiB0YWdOYW1lc1JlcXVpcmluZ0lubmVySFRNTEZpeDtcbn0pKGRvYyk7XG5cbmZ1bmN0aW9uIHNjcmlwdFNhZmVJbm5lckhUTUwoZWxlbWVudCwgaHRtbCkge1xuICAvLyB3aXRob3V0IGEgbGVhZGluZyB0ZXh0IG5vZGUsIElFIHdpbGwgZHJvcCBhIGxlYWRpbmcgc2NyaXB0IHRhZy5cbiAgaHRtbCA9ICcmc2h5OycraHRtbDtcblxuICBlbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG5cbiAgdmFyIG5vZGVzID0gZWxlbWVudC5jaGlsZE5vZGVzO1xuXG4gIC8vIExvb2sgZm9yICZzaHk7IHRvIHJlbW92ZSBpdC5cbiAgdmFyIHNoeUVsZW1lbnQgPSBub2Rlc1swXTtcbiAgd2hpbGUgKHNoeUVsZW1lbnQubm9kZVR5cGUgPT09IDEgJiYgIXNoeUVsZW1lbnQubm9kZU5hbWUpIHtcbiAgICBzaHlFbGVtZW50ID0gc2h5RWxlbWVudC5maXJzdENoaWxkO1xuICB9XG4gIC8vIEF0IHRoaXMgcG9pbnQgaXQncyB0aGUgYWN0dWFsIHVuaWNvZGUgY2hhcmFjdGVyLlxuICBpZiAoc2h5RWxlbWVudC5ub2RlVHlwZSA9PT0gMyAmJiBzaHlFbGVtZW50Lm5vZGVWYWx1ZS5jaGFyQXQoMCkgPT09IFwiXFx1MDBBRFwiKSB7XG4gICAgdmFyIG5ld1ZhbHVlID0gc2h5RWxlbWVudC5ub2RlVmFsdWUuc2xpY2UoMSk7XG4gICAgaWYgKG5ld1ZhbHVlLmxlbmd0aCkge1xuICAgICAgc2h5RWxlbWVudC5ub2RlVmFsdWUgPSBzaHlFbGVtZW50Lm5vZGVWYWx1ZS5zbGljZSgxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2h5RWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNoeUVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBub2Rlcztcbn1cblxuZnVuY3Rpb24gYnVpbGRET01XaXRoRml4KGh0bWwsIGNvbnRleHR1YWxFbGVtZW50KXtcbiAgdmFyIHRhZ05hbWUgPSBjb250ZXh0dWFsRWxlbWVudC50YWdOYW1lO1xuXG4gIC8vIEZpcmVmb3ggdmVyc2lvbnMgPCAxMSBkbyBub3QgaGF2ZSBzdXBwb3J0IGZvciBlbGVtZW50Lm91dGVySFRNTC5cbiAgdmFyIG91dGVySFRNTCA9IGNvbnRleHR1YWxFbGVtZW50Lm91dGVySFRNTCB8fCBuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKGNvbnRleHR1YWxFbGVtZW50KTtcbiAgaWYgKCFvdXRlckhUTUwpIHtcbiAgICB0aHJvdyBcIkNhbid0IHNldCBpbm5lckhUTUwgb24gXCIrdGFnTmFtZStcIiBpbiB0aGlzIGJyb3dzZXJcIjtcbiAgfVxuXG4gIGh0bWwgPSBmaXhTZWxlY3QoaHRtbCwgY29udGV4dHVhbEVsZW1lbnQpO1xuXG4gIHZhciB3cmFwcGluZ1RhZ3MgPSB0YWdOYW1lc1JlcXVpcmluZ0lubmVySFRNTEZpeFt0YWdOYW1lLnRvTG93ZXJDYXNlKCldO1xuXG4gIHZhciBzdGFydFRhZyA9IG91dGVySFRNTC5tYXRjaChuZXcgUmVnRXhwKFwiPFwiK3RhZ05hbWUrXCIoW14+XSopPlwiLCAnaScpKVswXTtcbiAgdmFyIGVuZFRhZyA9ICc8LycrdGFnTmFtZSsnPic7XG5cbiAgdmFyIHdyYXBwZWRIVE1MID0gW3N0YXJ0VGFnLCBodG1sLCBlbmRUYWddO1xuXG4gIHZhciBpID0gd3JhcHBpbmdUYWdzLmxlbmd0aDtcbiAgdmFyIHdyYXBwZWREZXB0aCA9IDEgKyBpO1xuICB3aGlsZShpLS0pIHtcbiAgICB3cmFwcGVkSFRNTC51bnNoaWZ0KCc8Jyt3cmFwcGluZ1RhZ3NbaV0rJz4nKTtcbiAgICB3cmFwcGVkSFRNTC5wdXNoKCc8Lycrd3JhcHBpbmdUYWdzW2ldKyc+Jyk7XG4gIH1cblxuICB2YXIgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBzY3JpcHRTYWZlSW5uZXJIVE1MKHdyYXBwZXIsIHdyYXBwZWRIVE1MLmpvaW4oJycpKTtcbiAgdmFyIGVsZW1lbnQgPSB3cmFwcGVyO1xuICB3aGlsZSAod3JhcHBlZERlcHRoLS0pIHtcbiAgICBlbGVtZW50ID0gZWxlbWVudC5maXJzdENoaWxkO1xuICAgIHdoaWxlIChlbGVtZW50ICYmIGVsZW1lbnQubm9kZVR5cGUgIT09IDEpIHtcbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50Lm5leHRTaWJsaW5nO1xuICAgIH1cbiAgfVxuICB3aGlsZSAoZWxlbWVudCAmJiBlbGVtZW50LnRhZ05hbWUgIT09IHRhZ05hbWUpIHtcbiAgICBlbGVtZW50ID0gZWxlbWVudC5uZXh0U2libGluZztcbiAgfVxuICByZXR1cm4gZWxlbWVudCA/IGVsZW1lbnQuY2hpbGROb2RlcyA6IFtdO1xufVxuXG52YXIgYnVpbGRET007XG5pZiAobmVlZHNTaHkpIHtcbiAgYnVpbGRET00gPSBmdW5jdGlvbiBidWlsZERPTShodG1sLCBjb250ZXh0dWFsRWxlbWVudCwgZG9tKXtcbiAgICBodG1sID0gZml4U2VsZWN0KGh0bWwsIGNvbnRleHR1YWxFbGVtZW50KTtcblxuICAgIGNvbnRleHR1YWxFbGVtZW50ID0gZG9tLmNsb25lTm9kZShjb250ZXh0dWFsRWxlbWVudCwgZmFsc2UpO1xuICAgIHNjcmlwdFNhZmVJbm5lckhUTUwoY29udGV4dHVhbEVsZW1lbnQsIGh0bWwpO1xuICAgIHJldHVybiBjb250ZXh0dWFsRWxlbWVudC5jaGlsZE5vZGVzO1xuICB9O1xufSBlbHNlIHtcbiAgYnVpbGRET00gPSBmdW5jdGlvbiBidWlsZERPTShodG1sLCBjb250ZXh0dWFsRWxlbWVudCwgZG9tKXtcbiAgICBodG1sID0gZml4U2VsZWN0KGh0bWwsIGNvbnRleHR1YWxFbGVtZW50KTtcblxuICAgIGNvbnRleHR1YWxFbGVtZW50ID0gZG9tLmNsb25lTm9kZShjb250ZXh0dWFsRWxlbWVudCwgZmFsc2UpO1xuICAgIGNvbnRleHR1YWxFbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIGNvbnRleHR1YWxFbGVtZW50LmNoaWxkTm9kZXM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGZpeFNlbGVjdChodG1sLCBjb250ZXh0dWFsRWxlbWVudCkge1xuICBpZiAoY29udGV4dHVhbEVsZW1lbnQudGFnTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICBodG1sID0gXCI8b3B0aW9uPjwvb3B0aW9uPlwiICsgaHRtbDtcbiAgfVxuXG4gIHJldHVybiBodG1sO1xufVxuXG52YXIgYnVpbGRJRVNhZmVET007XG5pZiAodGFnTmFtZXNSZXF1aXJpbmdJbm5lckhUTUxGaXggfHwgbW92ZXNXaGl0ZXNwYWNlKSB7XG4gIGJ1aWxkSUVTYWZlRE9NID0gZnVuY3Rpb24gYnVpbGRJRVNhZmVET00oaHRtbCwgY29udGV4dHVhbEVsZW1lbnQsIGRvbSkge1xuICAgIC8vIE1ha2UgYSBsaXN0IG9mIHRoZSBsZWFkaW5nIHRleHQgb24gc2NyaXB0IG5vZGVzLiBJbmNsdWRlXG4gICAgLy8gc2NyaXB0IHRhZ3Mgd2l0aG91dCBhbnkgd2hpdGVzcGFjZSBmb3IgZWFzaWVyIHByb2Nlc3NpbmcgbGF0ZXIuXG4gICAgdmFyIHNwYWNlc0JlZm9yZSA9IFtdO1xuICAgIHZhciBzcGFjZXNBZnRlciA9IFtdO1xuICAgIGlmICh0eXBlb2YgaHRtbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLyhcXHMqKSg8c2NyaXB0KS9nLCBmdW5jdGlvbihtYXRjaCwgc3BhY2VzLCB0YWcpIHtcbiAgICAgICAgc3BhY2VzQmVmb3JlLnB1c2goc3BhY2VzKTtcbiAgICAgICAgcmV0dXJuIHRhZztcbiAgICAgIH0pO1xuXG4gICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC8oPFxcL3NjcmlwdD4pKFxccyopL2csIGZ1bmN0aW9uKG1hdGNoLCB0YWcsIHNwYWNlcykge1xuICAgICAgICBzcGFjZXNBZnRlci5wdXNoKHNwYWNlcyk7XG4gICAgICAgIHJldHVybiB0YWc7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBGZXRjaCBub2Rlc1xuICAgIHZhciBub2RlcztcbiAgICBpZiAodGFnTmFtZXNSZXF1aXJpbmdJbm5lckhUTUxGaXhbY29udGV4dHVhbEVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpXSkge1xuICAgICAgLy8gYnVpbGRET01XaXRoRml4IHVzZXMgc3RyaW5nIHdyYXBwZXJzIGZvciBwcm9ibGVtYXRpYyBpbm5lckhUTUwuXG4gICAgICBub2RlcyA9IGJ1aWxkRE9NV2l0aEZpeChodG1sLCBjb250ZXh0dWFsRWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVzID0gYnVpbGRET00oaHRtbCwgY29udGV4dHVhbEVsZW1lbnQsIGRvbSk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgYSBsaXN0IG9mIHNjcmlwdCB0YWdzLCB0aGUgbm9kZXMgdGhlbXNlbHZlcyB3aWxsIGJlXG4gICAgLy8gbXV0YXRlZCBhcyB3ZSBhZGQgdGVzdCBub2Rlcy5cbiAgICB2YXIgaSwgaiwgbm9kZSwgbm9kZVNjcmlwdE5vZGVzO1xuICAgIHZhciBzY3JpcHROb2RlcyA9IFtdO1xuICAgIGZvciAoaT0wO2k8bm9kZXMubGVuZ3RoO2krKykge1xuICAgICAgbm9kZT1ub2Rlc1tpXTtcbiAgICAgIGlmIChub2RlLm5vZGVUeXBlICE9PSAxKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gJ1NDUklQVCcpIHtcbiAgICAgICAgc2NyaXB0Tm9kZXMucHVzaChub2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGVTY3JpcHROb2RlcyA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuICAgICAgICBmb3IgKGo9MDtqPG5vZGVTY3JpcHROb2Rlcy5sZW5ndGg7aisrKSB7XG4gICAgICAgICAgc2NyaXB0Tm9kZXMucHVzaChub2RlU2NyaXB0Tm9kZXNbal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2FsayB0aGUgc2NyaXB0IHRhZ3MgYW5kIHB1dCBiYWNrIHRoZWlyIGxlYWRpbmcgdGV4dCBub2Rlcy5cbiAgICB2YXIgc2NyaXB0Tm9kZSwgdGV4dE5vZGUsIHNwYWNlQmVmb3JlLCBzcGFjZUFmdGVyO1xuICAgIGZvciAoaT0wO2k8c2NyaXB0Tm9kZXMubGVuZ3RoO2krKykge1xuICAgICAgc2NyaXB0Tm9kZSA9IHNjcmlwdE5vZGVzW2ldO1xuICAgICAgc3BhY2VCZWZvcmUgPSBzcGFjZXNCZWZvcmVbaV07XG4gICAgICBpZiAoc3BhY2VCZWZvcmUgJiYgc3BhY2VCZWZvcmUubGVuZ3RoID4gMCkge1xuICAgICAgICB0ZXh0Tm9kZSA9IGRvbS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzcGFjZUJlZm9yZSk7XG4gICAgICAgIHNjcmlwdE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGV4dE5vZGUsIHNjcmlwdE5vZGUpO1xuICAgICAgfVxuXG4gICAgICBzcGFjZUFmdGVyID0gc3BhY2VzQWZ0ZXJbaV07XG4gICAgICBpZiAoc3BhY2VBZnRlciAmJiBzcGFjZUFmdGVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGV4dE5vZGUgPSBkb20uZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3BhY2VBZnRlcik7XG4gICAgICAgIHNjcmlwdE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGV4dE5vZGUsIHNjcmlwdE5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBub2RlcztcbiAgfTtcbn0gZWxzZSB7XG4gIGJ1aWxkSUVTYWZlRE9NID0gYnVpbGRET007XG59XG5cbnZhciBidWlsZEhUTUxET007XG5pZiAobmVlZHNJbnRlZ3JhdGlvblBvaW50Rml4KSB7XG4gIGJ1aWxkSFRNTERPTSA9IGZ1bmN0aW9uIGJ1aWxkSFRNTERPTShodG1sLCBjb250ZXh0dWFsRWxlbWVudCwgZG9tKXtcbiAgICBpZiAoc3ZnSFRNTEludGVncmF0aW9uUG9pbnRzW2NvbnRleHR1YWxFbGVtZW50LnRhZ05hbWVdKSB7XG4gICAgICByZXR1cm4gYnVpbGRJRVNhZmVET00oaHRtbCwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksIGRvbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBidWlsZElFU2FmZURPTShodG1sLCBjb250ZXh0dWFsRWxlbWVudCwgZG9tKTtcbiAgICB9XG4gIH07XG59IGVsc2Uge1xuICBidWlsZEhUTUxET00gPSBidWlsZElFU2FmZURPTTtcbn1cblxuZXhwb3J0IHtidWlsZEhUTUxET019O1xuIl19
define('dom-helper/classes', ['exports'], function (exports) {
  var doc = typeof document === 'undefined' ? false : document;

  // PhantomJS has a broken classList. See https://github.com/ariya/phantomjs/issues/12782
  var canClassList = doc && (function () {
    var d = document.createElement('div');
    if (!d.classList) {
      return false;
    }
    d.classList.add('boo');
    d.classList.add('boo', 'baz');
    return d.className === 'boo baz';
  })();

  function buildClassList(element) {
    var classString = element.getAttribute('class') || '';
    return classString !== '' && classString !== ' ' ? classString.split(' ') : [];
  }

  function intersect(containingArray, valuesArray) {
    var containingIndex = 0;
    var containingLength = containingArray.length;
    var valuesIndex = 0;
    var valuesLength = valuesArray.length;

    var intersection = new Array(valuesLength);

    // TODO: rewrite this loop in an optimal manner
    for (; containingIndex < containingLength; containingIndex++) {
      valuesIndex = 0;
      for (; valuesIndex < valuesLength; valuesIndex++) {
        if (valuesArray[valuesIndex] === containingArray[containingIndex]) {
          intersection[valuesIndex] = containingIndex;
          break;
        }
      }
    }

    return intersection;
  }

  function addClassesViaAttribute(element, classNames) {
    var existingClasses = buildClassList(element);

    var indexes = intersect(existingClasses, classNames);
    var didChange = false;

    for (var i = 0, l = classNames.length; i < l; i++) {
      if (indexes[i] === undefined) {
        didChange = true;
        existingClasses.push(classNames[i]);
      }
    }

    if (didChange) {
      element.setAttribute('class', existingClasses.length > 0 ? existingClasses.join(' ') : '');
    }
  }

  function removeClassesViaAttribute(element, classNames) {
    var existingClasses = buildClassList(element);

    var indexes = intersect(classNames, existingClasses);
    var didChange = false;
    var newClasses = [];

    for (var i = 0, l = existingClasses.length; i < l; i++) {
      if (indexes[i] === undefined) {
        newClasses.push(existingClasses[i]);
      } else {
        didChange = true;
      }
    }

    if (didChange) {
      element.setAttribute('class', newClasses.length > 0 ? newClasses.join(' ') : '');
    }
  }

  var addClasses, removeClasses;
  if (canClassList) {
    exports.addClasses = addClasses = function addClasses(element, classNames) {
      if (element.classList) {
        if (classNames.length === 1) {
          element.classList.add(classNames[0]);
        } else if (classNames.length === 2) {
          element.classList.add(classNames[0], classNames[1]);
        } else {
          element.classList.add.apply(element.classList, classNames);
        }
      } else {
        addClassesViaAttribute(element, classNames);
      }
    };
    exports.removeClasses = removeClasses = function removeClasses(element, classNames) {
      if (element.classList) {
        if (classNames.length === 1) {
          element.classList.remove(classNames[0]);
        } else if (classNames.length === 2) {
          element.classList.remove(classNames[0], classNames[1]);
        } else {
          element.classList.remove.apply(element.classList, classNames);
        }
      } else {
        removeClassesViaAttribute(element, classNames);
      }
    };
  } else {
    exports.addClasses = addClasses = addClassesViaAttribute;
    exports.removeClasses = removeClasses = removeClassesViaAttribute;
  }

  exports.addClasses = addClasses;
  exports.removeClasses = removeClasses;
});
//# sourceMappingURL=data:application/json;base64,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bHBlci9jbGFzc2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGRvYyA9IHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcgPyBmYWxzZSA6IGRvY3VtZW50O1xuXG4vLyBQaGFudG9tSlMgaGFzIGEgYnJva2VuIGNsYXNzTGlzdC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hcml5YS9waGFudG9tanMvaXNzdWVzLzEyNzgyXG52YXIgY2FuQ2xhc3NMaXN0ID0gZG9jICYmIChmdW5jdGlvbigpe1xuICB2YXIgZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBpZiAoIWQuY2xhc3NMaXN0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGQuY2xhc3NMaXN0LmFkZCgnYm9vJyk7XG4gIGQuY2xhc3NMaXN0LmFkZCgnYm9vJywgJ2JheicpO1xuICByZXR1cm4gKGQuY2xhc3NOYW1lID09PSAnYm9vIGJheicpO1xufSkoKTtcblxuZnVuY3Rpb24gYnVpbGRDbGFzc0xpc3QoZWxlbWVudCkge1xuICB2YXIgY2xhc3NTdHJpbmcgPSAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgfHwgJycpO1xuICByZXR1cm4gY2xhc3NTdHJpbmcgIT09ICcnICYmIGNsYXNzU3RyaW5nICE9PSAnICcgPyBjbGFzc1N0cmluZy5zcGxpdCgnICcpIDogW107XG59XG5cbmZ1bmN0aW9uIGludGVyc2VjdChjb250YWluaW5nQXJyYXksIHZhbHVlc0FycmF5KSB7XG4gIHZhciBjb250YWluaW5nSW5kZXggPSAwO1xuICB2YXIgY29udGFpbmluZ0xlbmd0aCA9IGNvbnRhaW5pbmdBcnJheS5sZW5ndGg7XG4gIHZhciB2YWx1ZXNJbmRleCA9IDA7XG4gIHZhciB2YWx1ZXNMZW5ndGggPSB2YWx1ZXNBcnJheS5sZW5ndGg7XG5cbiAgdmFyIGludGVyc2VjdGlvbiA9IG5ldyBBcnJheSh2YWx1ZXNMZW5ndGgpO1xuXG4gIC8vIFRPRE86IHJld3JpdGUgdGhpcyBsb29wIGluIGFuIG9wdGltYWwgbWFubmVyXG4gIGZvciAoO2NvbnRhaW5pbmdJbmRleDxjb250YWluaW5nTGVuZ3RoO2NvbnRhaW5pbmdJbmRleCsrKSB7XG4gICAgdmFsdWVzSW5kZXggPSAwO1xuICAgIGZvciAoO3ZhbHVlc0luZGV4PHZhbHVlc0xlbmd0aDt2YWx1ZXNJbmRleCsrKSB7XG4gICAgICBpZiAodmFsdWVzQXJyYXlbdmFsdWVzSW5kZXhdID09PSBjb250YWluaW5nQXJyYXlbY29udGFpbmluZ0luZGV4XSkge1xuICAgICAgICBpbnRlcnNlY3Rpb25bdmFsdWVzSW5kZXhdID0gY29udGFpbmluZ0luZGV4O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW50ZXJzZWN0aW9uO1xufVxuXG5mdW5jdGlvbiBhZGRDbGFzc2VzVmlhQXR0cmlidXRlKGVsZW1lbnQsIGNsYXNzTmFtZXMpIHtcbiAgdmFyIGV4aXN0aW5nQ2xhc3NlcyA9IGJ1aWxkQ2xhc3NMaXN0KGVsZW1lbnQpO1xuXG4gIHZhciBpbmRleGVzID0gaW50ZXJzZWN0KGV4aXN0aW5nQ2xhc3NlcywgY2xhc3NOYW1lcyk7XG4gIHZhciBkaWRDaGFuZ2UgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpPTAsIGw9Y2xhc3NOYW1lcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgaWYgKGluZGV4ZXNbaV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGlkQ2hhbmdlID0gdHJ1ZTtcbiAgICAgIGV4aXN0aW5nQ2xhc3Nlcy5wdXNoKGNsYXNzTmFtZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIGlmIChkaWRDaGFuZ2UpIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBleGlzdGluZ0NsYXNzZXMubGVuZ3RoID4gMCA/IGV4aXN0aW5nQ2xhc3Nlcy5qb2luKCcgJykgOiAnJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlQ2xhc3Nlc1ZpYUF0dHJpYnV0ZShlbGVtZW50LCBjbGFzc05hbWVzKSB7XG4gIHZhciBleGlzdGluZ0NsYXNzZXMgPSBidWlsZENsYXNzTGlzdChlbGVtZW50KTtcblxuICB2YXIgaW5kZXhlcyA9IGludGVyc2VjdChjbGFzc05hbWVzLCBleGlzdGluZ0NsYXNzZXMpO1xuICB2YXIgZGlkQ2hhbmdlID0gZmFsc2U7XG4gIHZhciBuZXdDbGFzc2VzID0gW107XG5cbiAgZm9yICh2YXIgaT0wLCBsPWV4aXN0aW5nQ2xhc3Nlcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgaWYgKGluZGV4ZXNbaV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgbmV3Q2xhc3Nlcy5wdXNoKGV4aXN0aW5nQ2xhc3Nlc1tpXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpZENoYW5nZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKGRpZENoYW5nZSkge1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsIG5ld0NsYXNzZXMubGVuZ3RoID4gMCA/IG5ld0NsYXNzZXMuam9pbignICcpIDogJycpO1xuICB9XG59XG5cbnZhciBhZGRDbGFzc2VzLCByZW1vdmVDbGFzc2VzO1xuaWYgKGNhbkNsYXNzTGlzdCkge1xuICBhZGRDbGFzc2VzID0gZnVuY3Rpb24gYWRkQ2xhc3NlcyhlbGVtZW50LCBjbGFzc05hbWVzKSB7XG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgICBpZiAoY2xhc3NOYW1lcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZXNbMF0pO1xuICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWVzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lc1swXSwgY2xhc3NOYW1lc1sxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQuYXBwbHkoZWxlbWVudC5jbGFzc0xpc3QsIGNsYXNzTmFtZXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhZGRDbGFzc2VzVmlhQXR0cmlidXRlKGVsZW1lbnQsIGNsYXNzTmFtZXMpO1xuICAgIH1cbiAgfTtcbiAgcmVtb3ZlQ2xhc3NlcyA9IGZ1bmN0aW9uIHJlbW92ZUNsYXNzZXMoZWxlbWVudCwgY2xhc3NOYW1lcykge1xuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xuICAgICAgaWYgKGNsYXNzTmFtZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWVzWzBdKTtcbiAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lcy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZXNbMF0sIGNsYXNzTmFtZXNbMV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlLmFwcGx5KGVsZW1lbnQuY2xhc3NMaXN0LCBjbGFzc05hbWVzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVtb3ZlQ2xhc3Nlc1ZpYUF0dHJpYnV0ZShlbGVtZW50LCBjbGFzc05hbWVzKTtcbiAgICB9XG4gIH07XG59IGVsc2Uge1xuICBhZGRDbGFzc2VzID0gYWRkQ2xhc3Nlc1ZpYUF0dHJpYnV0ZTtcbiAgcmVtb3ZlQ2xhc3NlcyA9IHJlbW92ZUNsYXNzZXNWaWFBdHRyaWJ1dGU7XG59XG5cbmV4cG9ydCB7XG4gIGFkZENsYXNzZXMsXG4gIHJlbW92ZUNsYXNzZXNcbn07XG4iXX0=
define('dom-helper/prop', ['exports'], function (exports) {
  exports.isAttrRemovalValue = isAttrRemovalValue;
  exports.normalizeProperty = normalizeProperty;

  function isAttrRemovalValue(value) {
    return value === null || value === undefined;
  }

  /*
   *
   * @method normalizeProperty
   * @param element {HTMLElement}
   * @param slotName {String}
   * @returns {Object} { name, type }
   */

  function normalizeProperty(element, slotName) {
    var type, normalized;

    if (slotName in element) {
      normalized = slotName;
      type = 'prop';
    } else {
      var lower = slotName.toLowerCase();
      if (lower in element) {
        type = 'prop';
        normalized = lower;
      } else {
        type = 'attr';
        normalized = slotName;
      }
    }

    if (type === 'prop' && (normalized.toLowerCase() === 'style' || preferAttr(element.tagName, normalized))) {
      type = 'attr';
    }

    return { normalized: normalized, type: type };
  }

  // properties that MUST be set as attributes, due to:
  // * browser bug
  // * strange spec outlier
  var ATTR_OVERRIDES = {

    // phantomjs < 2.0 lets you set it as a prop but won't reflect it
    // back to the attribute. button.getAttribute('type') === null
    BUTTON: { type: true, form: true },

    INPUT: {
      // TODO: remove when IE8 is droped
      // Some versions of IE (IE8) throw an exception when setting
      // `input.list = 'somestring'`:
      // https://github.com/emberjs/ember.js/issues/10908
      // https://github.com/emberjs/ember.js/issues/11364
      list: true,
      // Some version of IE (like IE9) actually throw an exception
      // if you set input.type = 'something-unknown'
      type: true,
      form: true
    },

    // element.form is actually a legitimate readOnly property, that is to be
    // mutated, but must be mutated by setAttribute...
    SELECT: { form: true },
    OPTION: { form: true },
    TEXTAREA: { form: true },
    LABEL: { form: true },
    FIELDSET: { form: true },
    LEGEND: { form: true },
    OBJECT: { form: true }
  };

  function preferAttr(tagName, propName) {
    var tag = ATTR_OVERRIDES[tagName.toUpperCase()];
    return tag && tag[propName.toLowerCase()] || false;
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXIvcHJvcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1VBQWdCLGtCQUFrQixHQUFsQixrQkFBa0I7VUFVbEIsaUJBQWlCLEdBQWpCLGlCQUFpQjs7QUFWMUIsV0FBUyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUU7QUFDeEMsV0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxTQUFTLENBQUM7R0FDOUM7Ozs7Ozs7Ozs7QUFRTSxXQUFTLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDbkQsUUFBSSxJQUFJLEVBQUUsVUFBVSxDQUFDOztBQUVyQixRQUFJLFFBQVEsSUFBSSxPQUFPLEVBQUU7QUFDdkIsZ0JBQVUsR0FBRyxRQUFRLENBQUM7QUFDdEIsVUFBSSxHQUFHLE1BQU0sQ0FBQztLQUNmLE1BQU07QUFDTCxVQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDbkMsVUFBSSxLQUFLLElBQUksT0FBTyxFQUFFO0FBQ3BCLFlBQUksR0FBRyxNQUFNLENBQUM7QUFDZCxrQkFBVSxHQUFHLEtBQUssQ0FBQztPQUNwQixNQUFNO0FBQ0wsWUFBSSxHQUFHLE1BQU0sQ0FBQztBQUNkLGtCQUFVLEdBQUcsUUFBUSxDQUFDO09BQ3ZCO0tBQ0Y7O0FBRUQsUUFBSSxJQUFJLEtBQUssTUFBTSxLQUNkLFVBQVUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxPQUFPLElBQ3BDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFBLEFBQUMsRUFBRTtBQUM3QyxVQUFJLEdBQUcsTUFBTSxDQUFDO0tBQ2Y7O0FBRUQsV0FBTyxFQUFFLFVBQVUsRUFBVixVQUFVLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBRSxDQUFDO0dBQzdCOzs7OztBQUtELE1BQUksY0FBYyxHQUFHOzs7O0FBSW5CLFVBQU0sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTs7QUFFbEMsU0FBSyxFQUFFOzs7Ozs7QUFNTCxVQUFJLEVBQUUsSUFBSTs7O0FBR1YsVUFBSSxFQUFFLElBQUk7QUFDVixVQUFJLEVBQUUsSUFBSTtLQUNYOzs7O0FBSUQsVUFBTSxFQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN4QixVQUFNLEVBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3hCLFlBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDeEIsU0FBSyxFQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN4QixZQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3hCLFVBQU0sRUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDeEIsVUFBTSxFQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtHQUN6QixDQUFDOztBQUVGLFdBQVMsVUFBVSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDckMsUUFBSSxHQUFHLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ2hELFdBQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUM7R0FDcEQiLCJmaWxlIjoiZG9tLWhlbHBlci9wcm9wLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGlzQXR0clJlbW92YWxWYWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cbi8qXG4gKlxuICogQG1ldGhvZCBub3JtYWxpemVQcm9wZXJ0eVxuICogQHBhcmFtIGVsZW1lbnQge0hUTUxFbGVtZW50fVxuICogQHBhcmFtIHNsb3ROYW1lIHtTdHJpbmd9XG4gKiBAcmV0dXJucyB7T2JqZWN0fSB7IG5hbWUsIHR5cGUgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydHkoZWxlbWVudCwgc2xvdE5hbWUpIHtcbiAgdmFyIHR5cGUsIG5vcm1hbGl6ZWQ7XG5cbiAgaWYgKHNsb3ROYW1lIGluIGVsZW1lbnQpIHtcbiAgICBub3JtYWxpemVkID0gc2xvdE5hbWU7XG4gICAgdHlwZSA9ICdwcm9wJztcbiAgfSBlbHNlIHtcbiAgICB2YXIgbG93ZXIgPSBzbG90TmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChsb3dlciBpbiBlbGVtZW50KSB7XG4gICAgICB0eXBlID0gJ3Byb3AnO1xuICAgICAgbm9ybWFsaXplZCA9IGxvd2VyO1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlID0gJ2F0dHInO1xuICAgICAgbm9ybWFsaXplZCA9IHNsb3ROYW1lO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlID09PSAncHJvcCcgJiZcbiAgICAgIChub3JtYWxpemVkLnRvTG93ZXJDYXNlKCkgPT09ICdzdHlsZScgfHxcbiAgICAgICBwcmVmZXJBdHRyKGVsZW1lbnQudGFnTmFtZSwgbm9ybWFsaXplZCkpKSB7XG4gICAgdHlwZSA9ICdhdHRyJztcbiAgfVxuXG4gIHJldHVybiB7IG5vcm1hbGl6ZWQsIHR5cGUgfTtcbn1cblxuLy8gcHJvcGVydGllcyB0aGF0IE1VU1QgYmUgc2V0IGFzIGF0dHJpYnV0ZXMsIGR1ZSB0bzpcbi8vICogYnJvd3NlciBidWdcbi8vICogc3RyYW5nZSBzcGVjIG91dGxpZXJcbnZhciBBVFRSX09WRVJSSURFUyA9IHtcblxuICAvLyBwaGFudG9tanMgPCAyLjAgbGV0cyB5b3Ugc2V0IGl0IGFzIGEgcHJvcCBidXQgd29uJ3QgcmVmbGVjdCBpdFxuICAvLyBiYWNrIHRvIHRoZSBhdHRyaWJ1dGUuIGJ1dHRvbi5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSA9PT0gbnVsbFxuICBCVVRUT046IHsgdHlwZTogdHJ1ZSwgZm9ybTogdHJ1ZSB9LFxuXG4gIElOUFVUOiB7XG4gICAgLy8gVE9ETzogcmVtb3ZlIHdoZW4gSUU4IGlzIGRyb3BlZFxuICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSUUgKElFOCkgdGhyb3cgYW4gZXhjZXB0aW9uIHdoZW4gc2V0dGluZ1xuICAgIC8vIGBpbnB1dC5saXN0ID0gJ3NvbWVzdHJpbmcnYDpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZW1iZXJqcy9lbWJlci5qcy9pc3N1ZXMvMTA5MDhcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZW1iZXJqcy9lbWJlci5qcy9pc3N1ZXMvMTEzNjRcbiAgICBsaXN0OiB0cnVlLFxuICAgIC8vIFNvbWUgdmVyc2lvbiBvZiBJRSAobGlrZSBJRTkpIGFjdHVhbGx5IHRocm93IGFuIGV4Y2VwdGlvblxuICAgIC8vIGlmIHlvdSBzZXQgaW5wdXQudHlwZSA9ICdzb21ldGhpbmctdW5rbm93bidcbiAgICB0eXBlOiB0cnVlLFxuICAgIGZvcm06IHRydWVcbiAgfSxcblxuICAvLyBlbGVtZW50LmZvcm0gaXMgYWN0dWFsbHkgYSBsZWdpdGltYXRlIHJlYWRPbmx5IHByb3BlcnR5LCB0aGF0IGlzIHRvIGJlXG4gIC8vIG11dGF0ZWQsIGJ1dCBtdXN0IGJlIG11dGF0ZWQgYnkgc2V0QXR0cmlidXRlLi4uXG4gIFNFTEVDVDogICB7IGZvcm06IHRydWUgfSxcbiAgT1BUSU9OOiAgIHsgZm9ybTogdHJ1ZSB9LFxuICBURVhUQVJFQTogeyBmb3JtOiB0cnVlIH0sXG4gIExBQkVMOiAgICB7IGZvcm06IHRydWUgfSxcbiAgRklFTERTRVQ6IHsgZm9ybTogdHJ1ZSB9LFxuICBMRUdFTkQ6ICAgeyBmb3JtOiB0cnVlIH0sXG4gIE9CSkVDVDogICB7IGZvcm06IHRydWUgfVxufTtcblxuZnVuY3Rpb24gcHJlZmVyQXR0cih0YWdOYW1lLCBwcm9wTmFtZSkge1xuICB2YXIgdGFnID0gQVRUUl9PVkVSUklERVNbdGFnTmFtZS50b1VwcGVyQ2FzZSgpXTtcbiAgcmV0dXJuIHRhZyAmJiB0YWdbcHJvcE5hbWUudG9Mb3dlckNhc2UoKV0gfHwgZmFsc2U7XG59XG4iXX0=
define('htmlbars-runtime', ['exports', './htmlbars-runtime/hooks', './htmlbars-runtime/render', '../htmlbars-util/morph-utils', '../htmlbars-util/template-utils', './htmlbars-runtime/expression-visitor', 'htmlbars-runtime/hooks'], function (exports, _htmlbarsRuntimeHooks, _htmlbarsRuntimeRender, _htmlbarsUtilMorphUtils, _htmlbarsUtilTemplateUtils, _htmlbarsRuntimeExpressionVisitor, _htmlbarsRuntimeHooks2) {

  var internal = {
    blockFor: _htmlbarsUtilTemplateUtils.blockFor,
    manualElement: _htmlbarsRuntimeRender.manualElement,
    hostBlock: _htmlbarsRuntimeHooks2.hostBlock,
    continueBlock: _htmlbarsRuntimeHooks2.continueBlock,
    hostYieldWithShadowTemplate: _htmlbarsRuntimeHooks2.hostYieldWithShadowTemplate,
    visitChildren: _htmlbarsUtilMorphUtils.visitChildren,
    validateChildMorphs: _htmlbarsRuntimeExpressionVisitor.validateChildMorphs,
    clearMorph: _htmlbarsUtilTemplateUtils.clearMorph
  };

  exports.hooks = _htmlbarsRuntimeHooks.default;
  exports.render = _htmlbarsRuntimeRender.default;
  exports.internal = internal;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFhQSxNQUFJLFFBQVEsR0FBRztBQUNiLFlBQVEsNkJBVkQsUUFBUSxBQVVHO0FBQ2xCLGlCQUFhLHlCQWJOLGFBQWEsQUFhUTtBQUM1QixhQUFTLHlCQVRULFNBQVMsQUFTVztBQUNwQixpQkFBYSx5QkFUYixhQUFhLEFBU2U7QUFDNUIsK0JBQTJCLHlCQVQzQiwyQkFBMkIsQUFTNkI7QUFDeEQsaUJBQWEsMEJBaEJOLGFBQWEsQUFnQlE7QUFDNUIsdUJBQW1CLG9DQWZaLG1CQUFtQixBQWVjO0FBQ3hDLGNBQVUsNkJBakJPLFVBQVUsQUFpQkw7R0FDdkIsQ0FBQzs7VUFHQSxLQUFLO1VBQ0wsTUFBTTtVQUNOLFFBQVEsR0FBUixRQUFRIiwiZmlsZSI6Imh0bWxiYXJzLXJ1bnRpbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaG9va3MgZnJvbSAnLi9odG1sYmFycy1ydW50aW1lL2hvb2tzJztcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9odG1sYmFycy1ydW50aW1lL3JlbmRlcic7XG5pbXBvcnQgeyBtYW51YWxFbGVtZW50IH0gZnJvbSAnLi9odG1sYmFycy1ydW50aW1lL3JlbmRlcic7XG5pbXBvcnQgeyB2aXNpdENoaWxkcmVuIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXV0aWwvbW9ycGgtdXRpbHNcIjtcbmltcG9ydCB7IGJsb2NrRm9yLCBjbGVhck1vcnBoIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHNcIjtcbmltcG9ydCB7IHZhbGlkYXRlQ2hpbGRNb3JwaHMgfSBmcm9tIFwiLi9odG1sYmFycy1ydW50aW1lL2V4cHJlc3Npb24tdmlzaXRvclwiO1xuaW1wb3J0IHtcbiAgaG9zdEJsb2NrLFxuICBjb250aW51ZUJsb2NrLFxuICBob3N0WWllbGRXaXRoU2hhZG93VGVtcGxhdGVcbn0gZnJvbSAnaHRtbGJhcnMtcnVudGltZS9ob29rcyc7XG5cblxudmFyIGludGVybmFsID0ge1xuICBibG9ja0ZvcjogYmxvY2tGb3IsXG4gIG1hbnVhbEVsZW1lbnQ6IG1hbnVhbEVsZW1lbnQsXG4gIGhvc3RCbG9jazogaG9zdEJsb2NrLFxuICBjb250aW51ZUJsb2NrOiBjb250aW51ZUJsb2NrLFxuICBob3N0WWllbGRXaXRoU2hhZG93VGVtcGxhdGU6IGhvc3RZaWVsZFdpdGhTaGFkb3dUZW1wbGF0ZSxcbiAgdmlzaXRDaGlsZHJlbjogdmlzaXRDaGlsZHJlbixcbiAgdmFsaWRhdGVDaGlsZE1vcnBoczogdmFsaWRhdGVDaGlsZE1vcnBocyxcbiAgY2xlYXJNb3JwaDogY2xlYXJNb3JwaFxufTtcblxuZXhwb3J0IHtcbiAgaG9va3MsXG4gIHJlbmRlcixcbiAgaW50ZXJuYWxcbn07XG4iXX0=
define("htmlbars-runtime/expression-visitor", ["exports", "../htmlbars-util/object-utils", "../htmlbars-util/morph-utils"], function (exports, _htmlbarsUtilObjectUtils, _htmlbarsUtilMorphUtils) {

  /**
    Node classification:
  
    # Primary Statement Nodes:
  
    These nodes are responsible for a render node that represents a morph-range.
  
    * block
    * inline
    * content
    * element
    * component
  
    # Leaf Statement Nodes:
  
    This node is responsible for a render node that represents a morph-attr.
  
    * attribute
  
    # Expression Nodes:
  
    These nodes are not directly responsible for any part of the DOM, but are
    eventually passed to a Statement Node.
  
    * get
    * subexpr
    * concat
  */

  var base = {
    acceptExpression: function (node, env, scope) {
      var ret = { value: null };

      // Primitive literals are unambiguously non-array representations of
      // themselves.
      if (typeof node !== 'object' || node === null) {
        ret.value = node;
        return ret;
      }

      switch (node[0]) {
        // can be used by manualElement
        case 'value':
          ret.value = node[1];break;
        case 'get':
          ret.value = this.get(node, env, scope);break;
        case 'subexpr':
          ret.value = this.subexpr(node, env, scope);break;
        case 'concat':
          ret.value = this.concat(node, env, scope);break;
      }

      return ret;
    },

    acceptParams: function (nodes, env, scope) {
      var arr = new Array(nodes.length);

      for (var i = 0, l = nodes.length; i < l; i++) {
        arr[i] = this.acceptExpression(nodes[i], env, scope).value;
      }

      return arr;
    },

    acceptHash: function (pairs, env, scope) {
      var object = {};

      for (var i = 0, l = pairs.length; i < l; i += 2) {
        object[pairs[i]] = this.acceptExpression(pairs[i + 1], env, scope).value;
      }

      return object;
    },

    // [ 'get', path ]
    get: function (node, env, scope) {
      return env.hooks.get(env, scope, node[1]);
    },

    // [ 'subexpr', path, params, hash ]
    subexpr: function (node, env, scope) {
      var path = node[1],
          params = node[2],
          hash = node[3];
      return env.hooks.subexpr(env, scope, path, this.acceptParams(params, env, scope), this.acceptHash(hash, env, scope));
    },

    // [ 'concat', parts ]
    concat: function (node, env, scope) {
      return env.hooks.concat(env, this.acceptParams(node[1], env, scope));
    },

    linkParamsAndHash: function (env, scope, morph, path, params, hash) {
      if (morph.linkedParams) {
        params = morph.linkedParams.params;
        hash = morph.linkedParams.hash;
      } else {
        params = params && this.acceptParams(params, env, scope);
        hash = hash && this.acceptHash(hash, env, scope);
      }

      _htmlbarsUtilMorphUtils.linkParams(env, scope, morph, path, params, hash);
      return [params, hash];
    }
  };

  var AlwaysDirtyVisitor = _htmlbarsUtilObjectUtils.merge(Object.create(base), {
    // [ 'block', path, params, hash, templateId, inverseId ]
    block: function (node, morph, env, scope, template, visitor) {
      var path = node[1],
          params = node[2],
          hash = node[3],
          templateId = node[4],
          inverseId = node[5];
      var paramsAndHash = this.linkParamsAndHash(env, scope, morph, path, params, hash);

      morph.isDirty = morph.isSubtreeDirty = false;
      env.hooks.block(morph, env, scope, path, paramsAndHash[0], paramsAndHash[1], templateId === null ? null : template.templates[templateId], inverseId === null ? null : template.templates[inverseId], visitor);
    },

    // [ 'inline', path, params, hash ]
    inline: function (node, morph, env, scope, visitor) {
      var path = node[1],
          params = node[2],
          hash = node[3];
      var paramsAndHash = this.linkParamsAndHash(env, scope, morph, path, params, hash);

      morph.isDirty = morph.isSubtreeDirty = false;
      env.hooks.inline(morph, env, scope, path, paramsAndHash[0], paramsAndHash[1], visitor);
    },

    // [ 'content', path ]
    content: function (node, morph, env, scope, visitor) {
      var path = node[1];

      morph.isDirty = morph.isSubtreeDirty = false;

      if (isHelper(env, scope, path)) {
        env.hooks.inline(morph, env, scope, path, [], {}, visitor);
        if (morph.linkedResult) {
          _htmlbarsUtilMorphUtils.linkParams(env, scope, morph, '@content-helper', [morph.linkedResult], null);
        }
        return;
      }

      var params;
      if (morph.linkedParams) {
        params = morph.linkedParams.params;
      } else {
        params = [env.hooks.get(env, scope, path)];
      }

      _htmlbarsUtilMorphUtils.linkParams(env, scope, morph, '@range', params, null);
      env.hooks.range(morph, env, scope, path, params[0], visitor);
    },

    // [ 'element', path, params, hash ]
    element: function (node, morph, env, scope, visitor) {
      var path = node[1],
          params = node[2],
          hash = node[3];
      var paramsAndHash = this.linkParamsAndHash(env, scope, morph, path, params, hash);

      morph.isDirty = morph.isSubtreeDirty = false;
      env.hooks.element(morph, env, scope, path, paramsAndHash[0], paramsAndHash[1], visitor);
    },

    // [ 'attribute', name, value ]
    attribute: function (node, morph, env, scope) {
      var name = node[1],
          value = node[2];
      var paramsAndHash = this.linkParamsAndHash(env, scope, morph, '@attribute', [value], null);

      morph.isDirty = morph.isSubtreeDirty = false;
      env.hooks.attribute(morph, env, scope, name, paramsAndHash[0][0]);
    },

    // [ 'component', path, attrs, templateId, inverseId ]
    component: function (node, morph, env, scope, template, visitor) {
      var path = node[1],
          attrs = node[2],
          templateId = node[3],
          inverseId = node[4];
      var paramsAndHash = this.linkParamsAndHash(env, scope, morph, path, [], attrs);
      var templates = {
        default: template.templates[templateId],
        inverse: template.templates[inverseId]
      };

      morph.isDirty = morph.isSubtreeDirty = false;
      env.hooks.component(morph, env, scope, path, paramsAndHash[0], paramsAndHash[1], templates, visitor);
    },

    // [ 'attributes', template ]
    attributes: function (node, morph, env, scope, parentMorph, visitor) {
      var template = node[1];
      env.hooks.attributes(morph, env, scope, template, parentMorph, visitor);
    }
  });

  exports.AlwaysDirtyVisitor = AlwaysDirtyVisitor;
  exports.default = _htmlbarsUtilObjectUtils.merge(Object.create(base), {
    // [ 'block', path, params, hash, templateId, inverseId ]
    block: function (node, morph, env, scope, template, visitor) {
      dirtyCheck(env, morph, visitor, function (visitor) {
        AlwaysDirtyVisitor.block(node, morph, env, scope, template, visitor);
      });
    },

    // [ 'inline', path, params, hash ]
    inline: function (node, morph, env, scope, visitor) {
      dirtyCheck(env, morph, visitor, function (visitor) {
        AlwaysDirtyVisitor.inline(node, morph, env, scope, visitor);
      });
    },

    // [ 'content', path ]
    content: function (node, morph, env, scope, visitor) {
      dirtyCheck(env, morph, visitor, function (visitor) {
        AlwaysDirtyVisitor.content(node, morph, env, scope, visitor);
      });
    },

    // [ 'element', path, params, hash ]
    element: function (node, morph, env, scope, template, visitor) {
      dirtyCheck(env, morph, visitor, function (visitor) {
        AlwaysDirtyVisitor.element(node, morph, env, scope, template, visitor);
      });
    },

    // [ 'attribute', name, value ]
    attribute: function (node, morph, env, scope, template) {
      dirtyCheck(env, morph, null, function () {
        AlwaysDirtyVisitor.attribute(node, morph, env, scope, template);
      });
    },

    // [ 'component', path, attrs, templateId ]
    component: function (node, morph, env, scope, template, visitor) {
      dirtyCheck(env, morph, visitor, function (visitor) {
        AlwaysDirtyVisitor.component(node, morph, env, scope, template, visitor);
      });
    },

    // [ 'attributes', template ]
    attributes: function (node, morph, env, scope, parentMorph, visitor) {
      AlwaysDirtyVisitor.attributes(node, morph, env, scope, parentMorph, visitor);
    }
  });

  function dirtyCheck(_env, morph, visitor, callback) {
    var isDirty = morph.isDirty;
    var isSubtreeDirty = morph.isSubtreeDirty;
    var env = _env;

    if (isSubtreeDirty) {
      visitor = AlwaysDirtyVisitor;
    }

    if (isDirty || isSubtreeDirty) {
      callback(visitor);
    } else {
      if (morph.buildChildEnv) {
        env = morph.buildChildEnv(morph.state, env);
      }
      _htmlbarsUtilMorphUtils.validateChildMorphs(env, morph, visitor);
    }
  }

  function isHelper(env, scope, path) {
    return env.hooks.keywords[path] !== undefined || env.hooks.hasHelper(env, scope, path);
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUvZXhwcmVzc2lvbi12aXNpdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQ0EsTUFBSSxJQUFJLEdBQUc7QUFDVCxvQkFBZ0IsRUFBRSxVQUFTLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQzNDLFVBQUksR0FBRyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDOzs7O0FBSTFCLFVBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7QUFDN0MsV0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDakIsZUFBTyxHQUFHLENBQUM7T0FDWjs7QUFFRCxjQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7O0FBRVosYUFBSyxPQUFPO0FBQUUsYUFBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDekMsYUFBSyxLQUFLO0FBQUUsYUFBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDMUQsYUFBSyxTQUFTO0FBQUUsYUFBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDbEUsYUFBSyxRQUFRO0FBQUUsYUFBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsT0FDakU7O0FBRUQsYUFBTyxHQUFHLENBQUM7S0FDWjs7QUFFRCxnQkFBWSxFQUFFLFVBQVMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDeEMs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LEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7T0FDN0M7QUFDRCw4QkEvUEssbUJBQW1CLENBK1BKLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDMUM7R0FDRjs7QUFFRCxXQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtBQUNsQyxXQUFPLEFBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxJQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDMUYiLCJmaWxlIjoiaHRtbGJhcnMtcnVudGltZS9leHByZXNzaW9uLXZpc2l0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBtZXJnZSB9IGZyb20gXCIuLi9odG1sYmFycy11dGlsL29iamVjdC11dGlsc1wiO1xuaW1wb3J0IHsgdmFsaWRhdGVDaGlsZE1vcnBocywgbGlua1BhcmFtcyB9IGZyb20gXCIuLi9odG1sYmFycy11dGlsL21vcnBoLXV0aWxzXCI7XG5cbi8qKlxuICBOb2RlIGNsYXNzaWZpY2F0aW9uOlxuXG4gICMgUHJpbWFyeSBTdGF0ZW1lbnQgTm9kZXM6XG5cbiAgVGhlc2Ugbm9kZXMgYXJlIHJlc3BvbnNpYmxlIGZvciBhIHJlbmRlciBub2RlIHRoYXQgcmVwcmVzZW50cyBhIG1vcnBoLXJhbmdlLlxuXG4gICogYmxvY2tcbiAgKiBpbmxpbmVcbiAgKiBjb250ZW50XG4gICogZWxlbWVudFxuICAqIGNvbXBvbmVudFxuXG4gICMgTGVhZiBTdGF0ZW1lbnQgTm9kZXM6XG5cbiAgVGhpcyBub2RlIGlzIHJlc3BvbnNpYmxlIGZvciBhIHJlbmRlciBub2RlIHRoYXQgcmVwcmVzZW50cyBhIG1vcnBoLWF0dHIuXG5cbiAgKiBhdHRyaWJ1dGVcblxuICAjIEV4cHJlc3Npb24gTm9kZXM6XG5cbiAgVGhlc2Ugbm9kZXMgYXJlIG5vdCBkaXJlY3RseSByZXNwb25zaWJsZSBmb3IgYW55IHBhcnQgb2YgdGhlIERPTSwgYnV0IGFyZVxuICBldmVudHVhbGx5IHBhc3NlZCB0byBhIFN0YXRlbWVudCBOb2RlLlxuXG4gICogZ2V0XG4gICogc3ViZXhwclxuICAqIGNvbmNhdFxuKi9cblxudmFyIGJhc2UgPSB7XG4gIGFjY2VwdEV4cHJlc3Npb246IGZ1bmN0aW9uKG5vZGUsIGVudiwgc2NvcGUpIHtcbiAgICB2YXIgcmV0ID0geyB2YWx1ZTogbnVsbCB9O1xuXG4gICAgLy8gUHJpbWl0aXZlIGxpdGVyYWxzIGFyZSB1bmFtYmlndW91c2x5IG5vbi1hcnJheSByZXByZXNlbnRhdGlvbnMgb2ZcbiAgICAvLyB0aGVtc2VsdmVzLlxuICAgIGlmICh0eXBlb2Ygbm9kZSAhPT0gJ29iamVjdCcgfHwgbm9kZSA9PT0gbnVsbCkge1xuICAgICAgcmV0LnZhbHVlID0gbm9kZTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgc3dpdGNoKG5vZGVbMF0pIHtcbiAgICAgIC8vIGNhbiBiZSB1c2VkIGJ5IG1hbnVhbEVsZW1lbnRcbiAgICAgIGNhc2UgJ3ZhbHVlJzogcmV0LnZhbHVlID0gbm9kZVsxXTsgYnJlYWs7XG4gICAgICBjYXNlICdnZXQnOiByZXQudmFsdWUgPSB0aGlzLmdldChub2RlLCBlbnYsIHNjb3BlKTsgYnJlYWs7XG4gICAgICBjYXNlICdzdWJleHByJzogcmV0LnZhbHVlID0gdGhpcy5zdWJleHByKG5vZGUsIGVudiwgc2NvcGUpOyBicmVhaztcbiAgICAgIGNhc2UgJ2NvbmNhdCc6IHJldC52YWx1ZSA9IHRoaXMuY29uY2F0KG5vZGUsIGVudiwgc2NvcGUpOyBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9LFxuXG4gIGFjY2VwdFBhcmFtczogZnVuY3Rpb24obm9kZXMsIGVudiwgc2NvcGUpIHtcbiAgICB2YXIgYXJyID0gbmV3IEFycmF5KG5vZGVzLmxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpPTAsIGw9bm9kZXMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgICAgYXJyW2ldID0gdGhpcy5hY2NlcHRFeHByZXNzaW9uKG5vZGVzW2ldLCBlbnYsIHNjb3BlKS52YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xuICB9LFxuXG4gIGFjY2VwdEhhc2g6IGZ1bmN0aW9uKHBhaXJzLCBlbnYsIHNjb3BlKSB7XG4gICAgdmFyIG9iamVjdCA9IHt9O1xuXG4gICAgZm9yICh2YXIgaT0wLCBsPXBhaXJzLmxlbmd0aDsgaTxsOyBpICs9IDIpIHtcbiAgICAgIG9iamVjdFtwYWlyc1tpXV0gPSB0aGlzLmFjY2VwdEV4cHJlc3Npb24ocGFpcnNbaSsxXSwgZW52LCBzY29wZSkudmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSxcblxuICAvLyBbICdnZXQnLCBwYXRoIF1cbiAgZ2V0OiBmdW5jdGlvbihub2RlLCBlbnYsIHNjb3BlKSB7XG4gICAgcmV0dXJuIGVudi5ob29rcy5nZXQoZW52LCBzY29wZSwgbm9kZVsxXSk7XG4gIH0sXG5cbiAgLy8gWyAnc3ViZXhwcicsIHBhdGgsIHBhcmFtcywgaGFzaCBdXG4gIHN1YmV4cHI6IGZ1bmN0aW9uKG5vZGUsIGVudiwgc2NvcGUpIHtcbiAgICB2YXIgcGF0aCA9IG5vZGVbMV0sIHBhcmFtcyA9IG5vZGVbMl0sIGhhc2ggPSBub2RlWzNdO1xuICAgIHJldHVybiBlbnYuaG9va3Muc3ViZXhwcihlbnYsIHNjb3BlLCBwYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjY2VwdFBhcmFtcyhwYXJhbXMsIGVudiwgc2NvcGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjY2VwdEhhc2goaGFzaCwgZW52LCBzY29wZSkpO1xuICB9LFxuXG4gIC8vIFsgJ2NvbmNhdCcsIHBhcnRzIF1cbiAgY29uY2F0OiBmdW5jdGlvbihub2RlLCBlbnYsIHNjb3BlKSB7XG4gICAgcmV0dXJuIGVudi5ob29rcy5jb25jYXQoZW52LCB0aGlzLmFjY2VwdFBhcmFtcyhub2RlWzFdLCBlbnYsIHNjb3BlKSk7XG4gIH0sXG5cbiAgbGlua1BhcmFtc0FuZEhhc2g6IGZ1bmN0aW9uKGVudiwgc2NvcGUsIG1vcnBoLCBwYXRoLCBwYXJhbXMsIGhhc2gpIHtcbiAgICBpZiAobW9ycGgubGlua2VkUGFyYW1zKSB7XG4gICAgICBwYXJhbXMgPSBtb3JwaC5saW5rZWRQYXJhbXMucGFyYW1zO1xuICAgICAgaGFzaCA9IG1vcnBoLmxpbmtlZFBhcmFtcy5oYXNoO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbXMgPSBwYXJhbXMgJiYgdGhpcy5hY2NlcHRQYXJhbXMocGFyYW1zLCBlbnYsIHNjb3BlKTtcbiAgICAgIGhhc2ggPSBoYXNoICYmIHRoaXMuYWNjZXB0SGFzaChoYXNoLCBlbnYsIHNjb3BlKTtcbiAgICB9XG5cbiAgICBsaW5rUGFyYW1zKGVudiwgc2NvcGUsIG1vcnBoLCBwYXRoLCBwYXJhbXMsIGhhc2gpO1xuICAgIHJldHVybiBbcGFyYW1zLCBoYXNoXTtcbiAgfVxufTtcblxuZXhwb3J0IHZhciBBbHdheXNEaXJ0eVZpc2l0b3IgPSBtZXJnZShPYmplY3QuY3JlYXRlKGJhc2UpLCB7XG4gIC8vIFsgJ2Jsb2NrJywgcGF0aCwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZUlkLCBpbnZlcnNlSWQgXVxuICBibG9jazogZnVuY3Rpb24obm9kZSwgbW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlLCB2aXNpdG9yKSB7XG4gICAgdmFyIHBhdGggPSBub2RlWzFdLCBwYXJhbXMgPSBub2RlWzJdLCBoYXNoID0gbm9kZVszXSwgdGVtcGxhdGVJZCA9IG5vZGVbNF0sIGludmVyc2VJZCA9IG5vZGVbNV07XG4gICAgdmFyIHBhcmFtc0FuZEhhc2ggPSB0aGlzLmxpbmtQYXJhbXNBbmRIYXNoKGVudiwgc2NvcGUsIG1vcnBoLCBwYXRoLCBwYXJhbXMsIGhhc2gpO1xuXG4gICAgbW9ycGguaXNEaXJ0eSA9IG1vcnBoLmlzU3VidHJlZURpcnR5ID0gZmFsc2U7XG4gICAgZW52Lmhvb2tzLmJsb2NrKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCBwYXJhbXNBbmRIYXNoWzBdLCBwYXJhbXNBbmRIYXNoWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVJZCA9PT0gbnVsbCA/IG51bGwgOiB0ZW1wbGF0ZS50ZW1wbGF0ZXNbdGVtcGxhdGVJZF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZlcnNlSWQgPT09IG51bGwgPyBudWxsIDogdGVtcGxhdGUudGVtcGxhdGVzW2ludmVyc2VJZF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpdG9yKTtcbiAgfSxcblxuICAvLyBbICdpbmxpbmUnLCBwYXRoLCBwYXJhbXMsIGhhc2ggXVxuICBpbmxpbmU6IGZ1bmN0aW9uKG5vZGUsIG1vcnBoLCBlbnYsIHNjb3BlLCB2aXNpdG9yKSB7XG4gICAgdmFyIHBhdGggPSBub2RlWzFdLCBwYXJhbXMgPSBub2RlWzJdLCBoYXNoID0gbm9kZVszXTtcbiAgICB2YXIgcGFyYW1zQW5kSGFzaCA9IHRoaXMubGlua1BhcmFtc0FuZEhhc2goZW52LCBzY29wZSwgbW9ycGgsIHBhdGgsIHBhcmFtcywgaGFzaCk7XG5cbiAgICBtb3JwaC5pc0RpcnR5ID0gbW9ycGguaXNTdWJ0cmVlRGlydHkgPSBmYWxzZTtcbiAgICBlbnYuaG9va3MuaW5saW5lKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCBwYXJhbXNBbmRIYXNoWzBdLCBwYXJhbXNBbmRIYXNoWzFdLCB2aXNpdG9yKTtcbiAgfSxcblxuICAvLyBbICdjb250ZW50JywgcGF0aCBdXG4gIGNvbnRlbnQ6IGZ1bmN0aW9uKG5vZGUsIG1vcnBoLCBlbnYsIHNjb3BlLCB2aXNpdG9yKSB7XG4gICAgdmFyIHBhdGggPSBub2RlWzFdO1xuXG4gICAgbW9ycGguaXNEaXJ0eSA9IG1vcnBoLmlzU3VidHJlZURpcnR5ID0gZmFsc2U7XG5cbiAgICBpZiAoaXNIZWxwZXIoZW52LCBzY29wZSwgcGF0aCkpIHtcbiAgICAgIGVudi5ob29rcy5pbmxpbmUobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIFtdLCB7fSwgdmlzaXRvcik7XG4gICAgICBpZiAobW9ycGgubGlua2VkUmVzdWx0KSB7XG4gICAgICAgIGxpbmtQYXJhbXMoZW52LCBzY29wZSwgbW9ycGgsICdAY29udGVudC1oZWxwZXInLCBbbW9ycGgubGlua2VkUmVzdWx0XSwgbnVsbCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHBhcmFtcztcbiAgICBpZiAobW9ycGgubGlua2VkUGFyYW1zKSB7XG4gICAgICBwYXJhbXMgPSBtb3JwaC5saW5rZWRQYXJhbXMucGFyYW1zO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbXMgPSBbZW52Lmhvb2tzLmdldChlbnYsIHNjb3BlLCBwYXRoKV07XG4gICAgfVxuXG4gICAgbGlua1BhcmFtcyhlbnYsIHNjb3BlLCBtb3JwaCwgJ0ByYW5nZScsIHBhcmFtcywgbnVsbCk7XG4gICAgZW52Lmhvb2tzLnJhbmdlKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCBwYXJhbXNbMF0sIHZpc2l0b3IpO1xuICB9LFxuXG4gIC8vIFsgJ2VsZW1lbnQnLCBwYXRoLCBwYXJhbXMsIGhhc2ggXVxuICBlbGVtZW50OiBmdW5jdGlvbihub2RlLCBtb3JwaCwgZW52LCBzY29wZSwgdmlzaXRvcikge1xuICAgIHZhciBwYXRoID0gbm9kZVsxXSwgcGFyYW1zID0gbm9kZVsyXSwgaGFzaCA9IG5vZGVbM107XG4gICAgdmFyIHBhcmFtc0FuZEhhc2ggPSB0aGlzLmxpbmtQYXJhbXNBbmRIYXNoKGVudiwgc2NvcGUsIG1vcnBoLCBwYXRoLCBwYXJhbXMsIGhhc2gpO1xuXG4gICAgbW9ycGguaXNEaXJ0eSA9IG1vcnBoLmlzU3VidHJlZURpcnR5ID0gZmFsc2U7XG4gICAgZW52Lmhvb2tzLmVsZW1lbnQobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtc0FuZEhhc2hbMF0sIHBhcmFtc0FuZEhhc2hbMV0sIHZpc2l0b3IpO1xuICB9LFxuXG4gIC8vIFsgJ2F0dHJpYnV0ZScsIG5hbWUsIHZhbHVlIF1cbiAgYXR0cmlidXRlOiBmdW5jdGlvbihub2RlLCBtb3JwaCwgZW52LCBzY29wZSkge1xuICAgIHZhciBuYW1lID0gbm9kZVsxXSwgdmFsdWUgPSBub2RlWzJdO1xuICAgIHZhciBwYXJhbXNBbmRIYXNoID0gdGhpcy5saW5rUGFyYW1zQW5kSGFzaChlbnYsIHNjb3BlLCBtb3JwaCwgJ0BhdHRyaWJ1dGUnLCBbdmFsdWVdLCBudWxsKTtcblxuICAgIG1vcnBoLmlzRGlydHkgPSBtb3JwaC5pc1N1YnRyZWVEaXJ0eSA9IGZhbHNlO1xuICAgIGVudi5ob29rcy5hdHRyaWJ1dGUobW9ycGgsIGVudiwgc2NvcGUsIG5hbWUsIHBhcmFtc0FuZEhhc2hbMF1bMF0pO1xuICB9LFxuXG4gIC8vIFsgJ2NvbXBvbmVudCcsIHBhdGgsIGF0dHJzLCB0ZW1wbGF0ZUlkLCBpbnZlcnNlSWQgXVxuICBjb21wb25lbnQ6IGZ1bmN0aW9uKG5vZGUsIG1vcnBoLCBlbnYsIHNjb3BlLCB0ZW1wbGF0ZSwgdmlzaXRvcikge1xuICAgIHZhciBwYXRoID0gbm9kZVsxXSwgYXR0cnMgPSBub2RlWzJdLCB0ZW1wbGF0ZUlkID0gbm9kZVszXSwgaW52ZXJzZUlkID0gbm9kZVs0XTtcbiAgICB2YXIgcGFyYW1zQW5kSGFzaCA9IHRoaXMubGlua1BhcmFtc0FuZEhhc2goZW52LCBzY29wZSwgbW9ycGgsIHBhdGgsIFtdLCBhdHRycyk7XG4gICAgdmFyIHRlbXBsYXRlcyA9IHtcbiAgICAgIGRlZmF1bHQ6IHRlbXBsYXRlLnRlbXBsYXRlc1t0ZW1wbGF0ZUlkXSxcbiAgICAgIGludmVyc2U6IHRlbXBsYXRlLnRlbXBsYXRlc1tpbnZlcnNlSWRdXG4gICAgfTtcblxuICAgIG1vcnBoLmlzRGlydHkgPSBtb3JwaC5pc1N1YnRyZWVEaXJ0eSA9IGZhbHNlO1xuICAgIGVudi5ob29rcy5jb21wb25lbnQobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtc0FuZEhhc2hbMF0sIHBhcmFtc0FuZEhhc2hbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZXMsIHZpc2l0b3IpO1xuICB9LFxuXG4gIC8vIFsgJ2F0dHJpYnV0ZXMnLCB0ZW1wbGF0ZSBdXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKG5vZGUsIG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJlbnRNb3JwaCwgdmlzaXRvcikge1xuICAgIGxldCB0ZW1wbGF0ZSA9IG5vZGVbMV07XG4gICAgZW52Lmhvb2tzLmF0dHJpYnV0ZXMobW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlLCBwYXJlbnRNb3JwaCwgdmlzaXRvcik7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBtZXJnZShPYmplY3QuY3JlYXRlKGJhc2UpLCB7XG4gIC8vIFsgJ2Jsb2NrJywgcGF0aCwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZUlkLCBpbnZlcnNlSWQgXVxuICBibG9jazogZnVuY3Rpb24obm9kZSwgbW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlLCB2aXNpdG9yKSB7XG4gICAgZGlydHlDaGVjayhlbnYsIG1vcnBoLCB2aXNpdG9yLCBmdW5jdGlvbih2aXNpdG9yKSB7XG4gICAgICBBbHdheXNEaXJ0eVZpc2l0b3IuYmxvY2sobm9kZSwgbW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlLCB2aXNpdG9yKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBbICdpbmxpbmUnLCBwYXRoLCBwYXJhbXMsIGhhc2ggXVxuICBpbmxpbmU6IGZ1bmN0aW9uKG5vZGUsIG1vcnBoLCBlbnYsIHNjb3BlLCB2aXNpdG9yKSB7XG4gICAgZGlydHlDaGVjayhlbnYsIG1vcnBoLCB2aXNpdG9yLCBmdW5jdGlvbih2aXNpdG9yKSB7XG4gICAgICBBbHdheXNEaXJ0eVZpc2l0b3IuaW5saW5lKG5vZGUsIG1vcnBoLCBlbnYsIHNjb3BlLCB2aXNpdG9yKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBbICdjb250ZW50JywgcGF0aCBdXG4gIGNvbnRlbnQ6IGZ1bmN0aW9uKG5vZGUsIG1vcnBoLCBlbnYsIHNjb3BlLCB2aXNpdG9yKSB7XG4gICAgZGlydHlDaGVjayhlbnYsIG1vcnBoLCB2aXNpdG9yLCBmdW5jdGlvbih2aXNpdG9yKSB7XG4gICAgICBBbHdheXNEaXJ0eVZpc2l0b3IuY29udGVudChub2RlLCBtb3JwaCwgZW52LCBzY29wZSwgdmlzaXRvcik7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gWyAnZWxlbWVudCcsIHBhdGgsIHBhcmFtcywgaGFzaCBdXG4gIGVsZW1lbnQ6IGZ1bmN0aW9uKG5vZGUsIG1vcnBoLCBlbnYsIHNjb3BlLCB0ZW1wbGF0ZSwgdmlzaXRvcikge1xuICAgIGRpcnR5Q2hlY2soZW52LCBtb3JwaCwgdmlzaXRvciwgZnVuY3Rpb24odmlzaXRvcikge1xuICAgICAgQWx3YXlzRGlydHlWaXNpdG9yLmVsZW1lbnQobm9kZSwgbW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlLCB2aXNpdG9yKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBbICdhdHRyaWJ1dGUnLCBuYW1lLCB2YWx1ZSBdXG4gIGF0dHJpYnV0ZTogZnVuY3Rpb24obm9kZSwgbW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlKSB7XG4gICAgZGlydHlDaGVjayhlbnYsIG1vcnBoLCBudWxsLCBmdW5jdGlvbigpIHtcbiAgICAgIEFsd2F5c0RpcnR5VmlzaXRvci5hdHRyaWJ1dGUobm9kZSwgbW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBbICdjb21wb25lbnQnLCBwYXRoLCBhdHRycywgdGVtcGxhdGVJZCBdXG4gIGNvbXBvbmVudDogZnVuY3Rpb24obm9kZSwgbW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlLCB2aXNpdG9yKSB7XG4gICAgZGlydHlDaGVjayhlbnYsIG1vcnBoLCB2aXNpdG9yLCBmdW5jdGlvbih2aXNpdG9yKSB7XG4gICAgICBBbHdheXNEaXJ0eVZpc2l0b3IuY29tcG9uZW50KG5vZGUsIG1vcnBoLCBlbnYsIHNjb3BlLCB0ZW1wbGF0ZSwgdmlzaXRvcik7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gWyAnYXR0cmlidXRlcycsIHRlbXBsYXRlIF1cbiAgYXR0cmlidXRlczogZnVuY3Rpb24obm9kZSwgbW9ycGgsIGVudiwgc2NvcGUsIHBhcmVudE1vcnBoLCB2aXNpdG9yKSB7XG4gICAgQWx3YXlzRGlydHlWaXNpdG9yLmF0dHJpYnV0ZXMobm9kZSwgbW9ycGgsIGVudiwgc2NvcGUsIHBhcmVudE1vcnBoLCB2aXNpdG9yKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGRpcnR5Q2hlY2soX2VudiwgbW9ycGgsIHZpc2l0b3IsIGNhbGxiYWNrKSB7XG4gIHZhciBpc0RpcnR5ID0gbW9ycGguaXNEaXJ0eTtcbiAgdmFyIGlzU3VidHJlZURpcnR5ID0gbW9ycGguaXNTdWJ0cmVlRGlydHk7XG4gIHZhciBlbnYgPSBfZW52O1xuXG4gIGlmIChpc1N1YnRyZWVEaXJ0eSkge1xuICAgIHZpc2l0b3IgPSBBbHdheXNEaXJ0eVZpc2l0b3I7XG4gIH1cblxuICBpZiAoaXNEaXJ0eSB8fCBpc1N1YnRyZWVEaXJ0eSkge1xuICAgIGNhbGxiYWNrKHZpc2l0b3IpO1xuICB9IGVsc2Uge1xuICAgIGlmIChtb3JwaC5idWlsZENoaWxkRW52KSB7XG4gICAgICBlbnYgPSBtb3JwaC5idWlsZENoaWxkRW52KG1vcnBoLnN0YXRlLCBlbnYpO1xuICAgIH1cbiAgICB2YWxpZGF0ZUNoaWxkTW9ycGhzKGVudiwgbW9ycGgsIHZpc2l0b3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzSGVscGVyKGVudiwgc2NvcGUsIHBhdGgpIHtcbiAgcmV0dXJuIChlbnYuaG9va3Mua2V5d29yZHNbcGF0aF0gIT09IHVuZGVmaW5lZCkgfHwgZW52Lmhvb2tzLmhhc0hlbHBlcihlbnYsIHNjb3BlLCBwYXRoKTtcbn1cbiJdfQ==
define("htmlbars-runtime/hooks", ["exports", "./render", "../morph-range/morph-list", "../htmlbars-util/object-utils", "../htmlbars-util/morph-utils", "../htmlbars-util/template-utils"], function (exports, _render, _morphRangeMorphList, _htmlbarsUtilObjectUtils, _htmlbarsUtilMorphUtils, _htmlbarsUtilTemplateUtils) {
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

        return _render.default(template, env, scope, options);
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
      _render.default(template, env, scope, { renderNode: morph, self: self, blockArguments: blockArguments });
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
        morph.morphList = new _morphRangeMorphList.default();
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
      _render.default(shadowTemplate.raw, env, shadowScope, { renderNode: morph, self: self, blockArguments: blockArguments });
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

        _render.default(template, env, scope, { renderNode: renderNode, self: self, blockArguments: blockArguments });
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
    var fragment = _render.default(template, env, scope, {}).fragment;
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUvaG9va3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtVQWdGZ0IsSUFBSSxHQUFKLElBQUk7VUFtQkosYUFBYSxHQUFiLGFBQWE7VUF3TGIsMkJBQTJCLEdBQTNCLDJCQUEyQjtVQXVGM0IsV0FBVyxHQUFYLFdBQVc7VUFRWCxnQkFBZ0IsR0FBaEIsZ0JBQWdCO1VBOERoQixlQUFlLEdBQWYsZUFBZTtVQUlmLGdCQUFnQixHQUFoQixnQkFBZ0I7VUFtQmhCLFFBQVEsR0FBUixRQUFRO1VBSVIsVUFBVSxHQUFWLFVBQVU7VUFtQlYsU0FBUyxHQUFULFNBQVM7VUFLVCxXQUFXLEdBQVgsV0FBVztVQW1CWCxTQUFTLEdBQVQsU0FBUztVQW9EVCxLQUFLLEdBQUwsS0FBSztVQVFMLGFBQWEsR0FBYixhQUFhO1VBT2IsU0FBUyxHQUFULFNBQVM7VUFLVCxjQUFjLEdBQWQsY0FBYztVQXVCZCxhQUFhLEdBQWIsYUFBYTtVQW9GYixjQUFjLEdBQWQsY0FBYztVQTBDZCxNQUFNLEdBQU4sTUFBTTtVQWtDTixPQUFPLEdBQVAsT0FBTztVQUlQLFlBQVksR0FBWixZQUFZO1VBMEJaLFFBQVEsR0FBUixRQUFRO1VBNERSLE9BQU8sR0FBUCxPQUFPO1VBdUJQLEtBQUssR0FBTCxLQUFLO1VBeUNMLE9BQU8sR0FBUCxPQUFPO1VBZ0NQLFNBQVMsR0FBVCxTQUFTO1VBVVQsT0FBTyxHQUFQLE9BQU87VUEwQlAsR0FBRyxHQUFILEdBQUc7VUFtQkgsT0FBTyxHQUFQLE9BQU87VUFVUCxRQUFRLEdBQVIsUUFBUTtVQUlSLFFBQVEsR0FBUixRQUFRO1VBSVIsY0FBYyxHQUFkLGNBQWM7VUFJZCxTQUFTLEdBQVQsU0FBUztVQVFULE1BQU0sR0FBTixNQUFNO1VBa0JOLFNBQVMsR0FBVCxTQUFTO1VBSVQsWUFBWSxHQUFaLFlBQVk7VUFJWixTQUFTLEdBQVQsU0FBUztVQUtULFdBQVcsR0FBWCxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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UyxFQUFFLFNBQVM7QUFDcEIsVUFBTSxFQUFFLE1BQU07QUFDZCxvQkFBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsWUFBUSxFQUFFLFFBQVE7QUFDbEIsV0FBTyxFQUFFLE9BQU87QUFDaEIsWUFBUSxFQUFFLFFBQVE7QUFDbEIsa0JBQWMsRUFBRSxjQUFjO0FBQzlCLFlBQVEsRUFBRSxRQUFRO0FBQ2xCLGtCQUFjLEVBQUUsY0FBYztBQUM5QixXQUFPLEVBQUUsT0FBTztBQUNoQixXQUFPLEVBQUUsT0FBTzs7O0FBR2hCLGFBQVMsRUFBRSxTQUFTO0FBQ3BCLG1CQUFlLEVBQUUsZUFBZTtBQUNoQyxlQUFXLEVBQUUsV0FBVztBQUN4QixjQUFVLEVBQUUsVUFBVTtBQUN0QixlQUFXLEVBQUUsV0FBVztBQUN4QixvQkFBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsYUFBUyxFQUFFLFNBQVM7QUFDcEIsZ0JBQVksRUFBRSxZQUFZO0FBQzFCLGdCQUFZLEVBQUUsWUFBWTtBQUMxQixxQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLHFCQUFpQixFQUFFLElBQUk7QUFDdkIsbUJBQWUsRUFBRSxJQUFJO0FBQ3JCLGtCQUFjLEVBQUUsSUFBSTtBQUNwQixrQkFBYyxFQUFFLElBQUk7QUFDcEIsaUJBQWEsRUFBRSxJQUFJOzs7QUFHbkIsYUFBUyxFQUFFLFNBQVM7QUFDcEIsU0FBSyxFQUFFLEtBQUs7QUFDWixlQUFXLEVBQUUsV0FBVztBQUN4QixXQUFPLEVBQUUsT0FBTztBQUNoQixPQUFHLEVBQUUsR0FBRztBQUNSLFVBQU0sRUFBRSxNQUFNO0FBQ2QsU0FBSyxFQUFFLEtBQUs7QUFDWixXQUFPLEVBQUUsT0FBTztHQUNqQiIsImZpbGUiOiJodG1sYmFycy1ydW50aW1lL2hvb2tzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlbmRlciBmcm9tIFwiLi9yZW5kZXJcIjtcbmltcG9ydCBNb3JwaExpc3QgZnJvbSBcIi4uL21vcnBoLXJhbmdlL21vcnBoLWxpc3RcIjtcbmltcG9ydCB7IGNyZWF0ZUNoaWxkTW9ycGggfSBmcm9tIFwiLi9yZW5kZXJcIjtcbmltcG9ydCB7IGtleUxlbmd0aCwgc2hhbGxvd0NvcHkgfSBmcm9tIFwiLi4vaHRtbGJhcnMtdXRpbC9vYmplY3QtdXRpbHNcIjtcbmltcG9ydCB7IHZhbGlkYXRlQ2hpbGRNb3JwaHMgfSBmcm9tIFwiLi4vaHRtbGJhcnMtdXRpbC9tb3JwaC11dGlsc1wiO1xuaW1wb3J0IHsgUmVuZGVyU3RhdGUsIGNsZWFyTW9ycGgsIGNsZWFyTW9ycGhMaXN0LCByZW5kZXJBbmRDbGVhbnVwIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHNcIjtcbmltcG9ydCB7IGxpbmtQYXJhbXMgfSBmcm9tIFwiLi4vaHRtbGJhcnMtdXRpbC9tb3JwaC11dGlsc1wiO1xuXG4vKipcbiAgSFRNTEJhcnMgZGVsZWdhdGVzIHRoZSBydW50aW1lIGJlaGF2aW9yIG9mIGEgdGVtcGxhdGUgdG9cbiAgaG9va3MgcHJvdmlkZWQgYnkgdGhlIGhvc3QgZW52aXJvbm1lbnQuIFRoZXNlIGhvb2tzIGV4cGxhaW5cbiAgdGhlIGxleGljYWwgZW52aXJvbm1lbnQgb2YgYSBIYW5kbGViYXJzIHRlbXBsYXRlLCB0aGUgaW50ZXJuYWxcbiAgcmVwcmVzZW50YXRpb24gb2YgcmVmZXJlbmNlcywgYW5kIHRoZSBpbnRlcmFjdGlvbiBiZXR3ZWVuIGFuXG4gIEhUTUxCYXJzIHRlbXBsYXRlIGFuZCB0aGUgRE9NIGl0IGlzIG1hbmFnaW5nLlxuXG4gIFdoaWxlIEhUTUxCYXJzIGhvc3QgaG9va3MgaGF2ZSBhY2Nlc3MgdG8gYWxsIG9mIHRoaXMgaW50ZXJuYWxcbiAgbWFjaGluZXJ5LCB0ZW1wbGF0ZXMgYW5kIGhlbHBlcnMgaGF2ZSBhY2Nlc3MgdG8gdGhlIGFic3RyYWN0aW9uXG4gIHByb3ZpZGVkIGJ5IHRoZSBob3N0IGhvb2tzLlxuXG4gICMjIFRoZSBMZXhpY2FsIEVudmlyb25tZW50XG5cbiAgVGhlIGRlZmF1bHQgbGV4aWNhbCBlbnZpcm9ubWVudCBvZiBhbiBIVE1MQmFycyB0ZW1wbGF0ZSBpbmNsdWRlczpcblxuICAqIEFueSBsb2NhbCB2YXJpYWJsZXMsIHByb3ZpZGVkIGJ5ICpibG9jayBhcmd1bWVudHMqXG4gICogVGhlIGN1cnJlbnQgdmFsdWUgb2YgYHNlbGZgXG5cbiAgIyMgU2ltcGxlIE5lc3RpbmdcblxuICBMZXQncyBsb29rIGF0IGEgc2ltcGxlIHRlbXBsYXRlIHdpdGggYSBuZXN0ZWQgYmxvY2s6XG5cbiAgYGBgaGJzXG4gIDxoMT57e3RpdGxlfX08L2gxPlxuXG4gIHt7I2lmIGF1dGhvcn19XG4gICAgPHAgY2xhc3M9XCJieWxpbmVcIj57e2F1dGhvcn19PC9wPlxuICB7ey9pZn19XG4gIGBgYFxuXG4gIEluIHRoaXMgY2FzZSwgdGhlIGxleGljYWwgZW52aXJvbm1lbnQgYXQgdGhlIHRvcC1sZXZlbCBvZiB0aGVcbiAgdGVtcGxhdGUgZG9lcyBub3QgY2hhbmdlIGluc2lkZSBvZiB0aGUgYGlmYCBibG9jay4gVGhpcyBpc1xuICBhY2hpZXZlZCB2aWEgYW4gaW1wbGVtZW50YXRpb24gb2YgYGlmYCB0aGF0IGxvb2tzIGxpa2UgdGhpczpcblxuICBgYGBqc1xuICByZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICBpZiAoISFwYXJhbXNbMF0pIHtcbiAgICAgIHJldHVybiB0aGlzLnlpZWxkKCk7XG4gICAgfVxuICB9KTtcbiAgYGBgXG5cbiAgQSBjYWxsIHRvIGB0aGlzLnlpZWxkYCBpbnZva2VzIHRoZSBjaGlsZCB0ZW1wbGF0ZSB1c2luZyB0aGVcbiAgY3VycmVudCBsZXhpY2FsIGVudmlyb25tZW50LlxuXG4gICMjIEJsb2NrIEFyZ3VtZW50c1xuXG4gIEl0IGlzIHBvc3NpYmxlIGZvciBuZXN0ZWQgYmxvY2tzIHRvIGludHJvZHVjZSBuZXcgbG9jYWxcbiAgdmFyaWFibGVzOlxuXG4gIGBgYGhic1xuICB7eyNjb3VudC1jYWxscyBhcyB8aXx9fVxuICA8aDE+e3t0aXRsZX19PC9oMT5cbiAgPHA+Q2FsbGVkIHt7aX19IHRpbWVzPC9wPlxuICB7ey9jb3VudH19XG4gIGBgYFxuXG4gIEluIHRoaXMgZXhhbXBsZSwgdGhlIGNoaWxkIGJsb2NrIGluaGVyaXRzIGl0cyBzdXJyb3VuZGluZ1xuICBsZXhpY2FsIGVudmlyb25tZW50LCBidXQgYXVnbWVudHMgaXQgd2l0aCBhIHNpbmdsZSBuZXdcbiAgdmFyaWFibGUgYmluZGluZy5cblxuICBUaGUgaW1wbGVtZW50YXRpb24gb2YgYGNvdW50LWNhbGxzYCBzdXBwbGllcyB0aGUgdmFsdWUgb2ZcbiAgYGlgLCBidXQgZG9lcyBub3Qgb3RoZXJ3aXNlIGFsdGVyIHRoZSBlbnZpcm9ubWVudDpcblxuICBgYGBqc1xuICB2YXIgY291bnQgPSAwO1xuICByZWdpc3RlckhlbHBlcignY291bnQtY2FsbHMnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy55aWVsZChbICsrY291bnQgXSk7XG4gIH0pO1xuICBgYGBcbiovXG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwKHRlbXBsYXRlKSB7XG4gIGlmICh0ZW1wbGF0ZSA9PT0gbnVsbCkgeyByZXR1cm4gbnVsbDsgIH1cblxuICByZXR1cm4ge1xuICAgIG1ldGE6IHRlbXBsYXRlLm1ldGEsXG4gICAgYXJpdHk6IHRlbXBsYXRlLmFyaXR5LFxuICAgIHJhdzogdGVtcGxhdGUsXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzZWxmLCBlbnYsIG9wdGlvbnMsIGJsb2NrQXJndW1lbnRzKSB7XG4gICAgICB2YXIgc2NvcGUgPSBlbnYuaG9va3MuY3JlYXRlRnJlc2hTY29wZSgpO1xuXG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIG9wdGlvbnMuc2VsZiA9IHNlbGY7XG4gICAgICBvcHRpb25zLmJsb2NrQXJndW1lbnRzID0gYmxvY2tBcmd1bWVudHM7XG5cbiAgICAgIHJldHVybiByZW5kZXIodGVtcGxhdGUsIGVudiwgc2NvcGUsIG9wdGlvbnMpO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBGb3JIZWxwZXIodGVtcGxhdGUsIGVudiwgc2NvcGUsIG1vcnBoLCByZW5kZXJTdGF0ZSwgdmlzaXRvcikge1xuICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHlpZWxkSW46IHlpZWxkSW5TaGFkb3dUZW1wbGF0ZShudWxsLCBlbnYsIHNjb3BlLCBtb3JwaCwgcmVuZGVyU3RhdGUsIHZpc2l0b3IpXG4gICAgfTtcbiAgfVxuXG4gIHZhciB5aWVsZEFyZ3MgPSB5aWVsZFRlbXBsYXRlKHRlbXBsYXRlLCBlbnYsIHNjb3BlLCBtb3JwaCwgcmVuZGVyU3RhdGUsIHZpc2l0b3IpO1xuXG4gIHJldHVybiB7XG4gICAgbWV0YTogdGVtcGxhdGUubWV0YSxcbiAgICBhcml0eTogdGVtcGxhdGUuYXJpdHksXG4gICAgeWllbGQ6IHlpZWxkQXJncyxcbiAgICB5aWVsZEl0ZW06IHlpZWxkSXRlbSh0ZW1wbGF0ZSwgZW52LCBzY29wZSwgbW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKSxcbiAgICB5aWVsZEluOiB5aWVsZEluU2hhZG93VGVtcGxhdGUodGVtcGxhdGUsIGVudiwgc2NvcGUsIG1vcnBoLCByZW5kZXJTdGF0ZSwgdmlzaXRvciksXG4gICAgcmF3OiB0ZW1wbGF0ZSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2VsZiwgYmxvY2tBcmd1bWVudHMpIHtcbiAgICAgIHlpZWxkQXJncyhibG9ja0FyZ3VtZW50cywgc2VsZik7XG4gICAgfVxuICB9O1xufVxuXG4vLyBDYWxsZWQgYnkgYSB1c2VyLWxhbmQgaGVscGVyIHRvIHJlbmRlciBhIHRlbXBsYXRlLlxuZnVuY3Rpb24geWllbGRUZW1wbGF0ZSh0ZW1wbGF0ZSwgZW52LCBwYXJlbnRTY29wZSwgbW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbihibG9ja0FyZ3VtZW50cywgc2VsZikge1xuICAgIC8vIFJlbmRlciBzdGF0ZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBwcm9ncmVzcyBvZiB0aGUgaGVscGVyIChzaW5jZSBpdFxuICAgIC8vIG1heSBjYWxsIGludG8gdXMgbXVsdGlwbGUgdGltZXMpLiBBcyB0aGUgdXNlci1sYW5kIGhlbHBlciBjYWxsc1xuICAgIC8vIGludG8gbGlicmFyeSBjb2RlLCB3ZSB0cmFjayB3aGF0IG5lZWRzIHRvIGJlIGNsZWFuZWQgdXAgYWZ0ZXIgdGhlXG4gICAgLy8gaGVscGVyIGhhcyByZXR1cm5lZC5cbiAgICAvL1xuICAgIC8vIEhlcmUsIHdlIHJlbWVtYmVyIHRoYXQgYSB0ZW1wbGF0ZSBoYXMgYmVlbiB5aWVsZGVkIGFuZCBzbyB3ZSBkbyBub3RcbiAgICAvLyBuZWVkIHRvIHJlbW92ZSB0aGUgcHJldmlvdXMgdGVtcGxhdGUuIChJZiBubyB0ZW1wbGF0ZSBpcyB5aWVsZGVkXG4gICAgLy8gdGhpcyByZW5kZXIgYnkgdGhlIGhlbHBlciwgd2UgYXNzdW1lIG5vdGhpbmcgc2hvdWxkIGJlIHNob3duIGFuZFxuICAgIC8vIHJlbW92ZSBhbnkgcHJldmlvdXMgcmVuZGVyZWQgdGVtcGxhdGVzLilcbiAgICByZW5kZXJTdGF0ZS5tb3JwaFRvQ2xlYXIgPSBudWxsO1xuXG4gICAgLy8gSW4gdGhpcyBjb25kaXRpb25hbCBpcyB0cnVlLCBpdCBtZWFucyB0aGF0IG9uIHRoZSBwcmV2aW91cyByZW5kZXJpbmcgcGFzc1xuICAgIC8vIHRoZSBoZWxwZXIgeWllbGRlZCBtdWx0aXBsZSBpdGVtcyB2aWEgYHlpZWxkSXRlbSgpYCwgYnV0IHRoaXMgdGltZSB0aGV5XG4gICAgLy8gYXJlIHlpZWxkaW5nIGEgc2luZ2xlIHRlbXBsYXRlLiBJbiB0aGF0IGNhc2UsIHdlIG1hcmsgdGhlIG1vcnBoIGxpc3QgZm9yXG4gICAgLy8gY2xlYW51cCBzbyBpdCBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAgICBpZiAobW9ycGgubW9ycGhMaXN0KSB7XG4gICAgICBjbGVhck1vcnBoTGlzdChtb3JwaC5tb3JwaExpc3QsIG1vcnBoLCBlbnYpO1xuICAgICAgcmVuZGVyU3RhdGUubW9ycGhMaXN0VG9DbGVhciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHNjb3BlID0gcGFyZW50U2NvcGU7XG5cbiAgICBpZiAobW9ycGgubGFzdFlpZWxkZWQgJiYgaXNTdGFibGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgbW9ycGgubGFzdFlpZWxkZWQpKSB7XG4gICAgICByZXR1cm4gbW9ycGgubGFzdFJlc3VsdC5yZXZhbGlkYXRlV2l0aChlbnYsIHVuZGVmaW5lZCwgc2VsZiwgYmxvY2tBcmd1bWVudHMsIHZpc2l0b3IpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRvIG1ha2Ugc3VyZSB0aGF0IHdlIGFjdHVhbGx5ICoqbmVlZCoqIGEgbmV3IHNjb3BlLCBhbmQgY2FuJ3RcbiAgICAvLyBzaGFyZSB0aGUgcGFyZW50IHNjb3BlLiBOb3RlIHRoYXQgd2UgbmVlZCB0byBtb3ZlIHRoaXMgY2hlY2sgaW50b1xuICAgIC8vIGEgaG9zdCBob29rLCBiZWNhdXNlIHRoZSBob3N0J3Mgbm90aW9uIG9mIHNjb3BlIG1heSByZXF1aXJlIGEgbmV3XG4gICAgLy8gc2NvcGUgaW4gbW9yZSBjYXNlcyB0aGFuIHRoZSBvbmVzIHdlIGNhbiBkZXRlcm1pbmUgc3RhdGljYWxseS5cbiAgICBpZiAoc2VsZiAhPT0gdW5kZWZpbmVkIHx8IHBhcmVudFNjb3BlID09PSBudWxsIHx8IHRlbXBsYXRlLmFyaXR5KSB7XG4gICAgICBzY29wZSA9IGVudi5ob29rcy5jcmVhdGVDaGlsZFNjb3BlKHBhcmVudFNjb3BlKTtcbiAgICB9XG5cbiAgICBtb3JwaC5sYXN0WWllbGRlZCA9IHsgc2VsZjogc2VsZiwgdGVtcGxhdGU6IHRlbXBsYXRlLCBzaGFkb3dUZW1wbGF0ZTogbnVsbCB9O1xuXG4gICAgLy8gUmVuZGVyIHRoZSB0ZW1wbGF0ZSB0aGF0IHdhcyBzZWxlY3RlZCBieSB0aGUgaGVscGVyXG4gICAgcmVuZGVyKHRlbXBsYXRlLCBlbnYsIHNjb3BlLCB7IHJlbmRlck5vZGU6IG1vcnBoLCBzZWxmOiBzZWxmLCBibG9ja0FyZ3VtZW50czogYmxvY2tBcmd1bWVudHMgfSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHlpZWxkSXRlbSh0ZW1wbGF0ZSwgZW52LCBwYXJlbnRTY29wZSwgbW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKSB7XG4gIC8vIEluaXRpYWxpemUgc3RhdGUgdGhhdCB0cmFja3MgbXVsdGlwbGUgaXRlbXMgYmVpbmdcbiAgLy8geWllbGRlZCBpbi5cbiAgdmFyIGN1cnJlbnRNb3JwaCA9IG51bGw7XG5cbiAgLy8gQ2FuZGlkYXRlIG1vcnBocyBmb3IgZGVsZXRpb24uXG4gIHZhciBjYW5kaWRhdGVzID0ge307XG5cbiAgLy8gUmV1c2UgZXhpc3RpbmcgTW9ycGhMaXN0IGlmIHRoaXMgaXMgbm90IGEgZmlyc3QtdGltZVxuICAvLyByZW5kZXIuXG4gIHZhciBtb3JwaExpc3QgPSBtb3JwaC5tb3JwaExpc3Q7XG4gIGlmIChtb3JwaExpc3QpIHtcbiAgICBjdXJyZW50TW9ycGggPSBtb3JwaExpc3QuZmlyc3RDaGlsZE1vcnBoO1xuICB9XG5cbiAgLy8gQWR2YW5jZXMgdGhlIGN1cnJlbnRNb3JwaCBwb2ludGVyIHRvIHRoZSBtb3JwaCBpbiB0aGUgcHJldmlvdXNseS1yZW5kZXJlZFxuICAvLyBsaXN0IHRoYXQgbWF0Y2hlcyB0aGUgeWllbGRlZCBrZXkuIFdoaWxlIGRvaW5nIHNvLCBpdCBtYXJrcyBhbnkgbW9ycGhzXG4gIC8vIHRoYXQgaXQgYWR2YW5jZXMgcGFzdCBhcyBjYW5kaWRhdGVzIGZvciBkZWxldGlvbi4gQXNzdW1pbmcgdGhvc2UgbW9ycGhzXG4gIC8vIGFyZSBub3QgeWllbGRlZCBpbiBsYXRlciwgdGhleSB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIHBydW5lIHN0ZXAgZHVyaW5nXG4gIC8vIGNsZWFudXAuXG4gIC8vIE5vdGUgdGhhdCB0aGlzIGhlbHBlciBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgdGhlIG1vcnBoIGJlaW5nIHNlZWtlZCB0byBpc1xuICAvLyBndWFyYW50ZWVkIHRvIGV4aXN0IGluIHRoZSBwcmV2aW91cyBNb3JwaExpc3Q7IGlmIHRoaXMgaXMgY2FsbGVkIGFuZCB0aGVcbiAgLy8gbW9ycGggZG9lcyBub3QgZXhpc3QsIGl0IHdpbGwgcmVzdWx0IGluIGFuIGluZmluaXRlIGxvb3BcbiAgZnVuY3Rpb24gYWR2YW5jZVRvS2V5KGtleSkge1xuICAgIGxldCBzZWVrID0gY3VycmVudE1vcnBoO1xuXG4gICAgd2hpbGUgKHNlZWsua2V5ICE9PSBrZXkpIHtcbiAgICAgIGNhbmRpZGF0ZXNbc2Vlay5rZXldID0gc2VlaztcbiAgICAgIHNlZWsgPSBzZWVrLm5leHRNb3JwaDtcbiAgICB9XG5cbiAgICBjdXJyZW50TW9ycGggPSBzZWVrLm5leHRNb3JwaDtcbiAgICByZXR1cm4gc2VlaztcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihfa2V5LCBibG9ja0FyZ3VtZW50cywgc2VsZikge1xuICAgIGlmICh0eXBlb2YgX2tleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHByb3ZpZGUgYSBzdHJpbmcga2V5IHdoZW4gY2FsbGluZyBgeWllbGRJdGVtYDsgeW91IHByb3ZpZGVkIFwiICsgX2tleSk7XG4gICAgfVxuXG4gICAgLy8gQXQgbGVhc3Qgb25lIGl0ZW0gaGFzIGJlZW4geWllbGRlZCwgc28gd2UgZG8gbm90IHdob2xlc2FsZVxuICAgIC8vIGNsZWFyIHRoZSBsYXN0IE1vcnBoTGlzdCBidXQgaW5zdGVhZCBhcHBseSBhIHBydW5lIG9wZXJhdGlvbi5cbiAgICByZW5kZXJTdGF0ZS5tb3JwaExpc3RUb0NsZWFyID0gbnVsbDtcbiAgICBtb3JwaC5sYXN0WWllbGRlZCA9IG51bGw7XG5cbiAgICB2YXIgbW9ycGhMaXN0LCBtb3JwaE1hcDtcblxuICAgIGlmICghbW9ycGgubW9ycGhMaXN0KSB7XG4gICAgICBtb3JwaC5tb3JwaExpc3QgPSBuZXcgTW9ycGhMaXN0KCk7XG4gICAgICBtb3JwaC5tb3JwaE1hcCA9IHt9O1xuICAgICAgbW9ycGguc2V0TW9ycGhMaXN0KG1vcnBoLm1vcnBoTGlzdCk7XG4gICAgfVxuXG4gICAgbW9ycGhMaXN0ID0gbW9ycGgubW9ycGhMaXN0O1xuICAgIG1vcnBoTWFwID0gbW9ycGgubW9ycGhNYXA7XG5cbiAgICAvLyBBIG1hcCBvZiBtb3JwaHMgdGhhdCBoYXZlIGJlZW4geWllbGRlZCBpbiBvbiB0aGlzXG4gICAgLy8gcmVuZGVyaW5nIHBhc3MuIEFueSBtb3JwaHMgdGhhdCBkbyBub3QgbWFrZSBpdCBpbnRvXG4gICAgLy8gdGhpcyBsaXN0IHdpbGwgYmUgcHJ1bmVkIGZyb20gdGhlIE1vcnBoTGlzdCBkdXJpbmcgdGhlIGNsZWFudXBcbiAgICAvLyBwcm9jZXNzLlxuICAgIGxldCBoYW5kbGVkTW9ycGhzID0gcmVuZGVyU3RhdGUuaGFuZGxlZE1vcnBocztcbiAgICBsZXQga2V5O1xuXG4gICAgaWYgKGhhbmRsZWRNb3JwaHNbX2tleV0pIHtcbiAgICAgIGxldCBjb2xsaXNpb25zID0gcmVuZGVyU3RhdGUuY29sbGlzaW9ucztcbiAgICAgIGlmIChjb2xsaXNpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29sbGlzaW9ucyA9IHJlbmRlclN0YXRlLmNvbGxpc2lvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGxldCBjb3VudCA9IGNvbGxpc2lvbnNbX2tleV0gfCAwO1xuICAgICAgY29sbGlzaW9uc1tfa2V5XSA9ICsrY291bnQ7XG4gICAgICBrZXkgPSBfa2V5ICsgJy0xMWMzZmQ0Ni0zMDBjLTExZTUtOTMyYy01Y2Y5Mzg4YTZmNmMtJyArIGNvdW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXkgPSBfa2V5O1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50TW9ycGggJiYgY3VycmVudE1vcnBoLmtleSA9PT0ga2V5KSB7XG4gICAgICB5aWVsZFRlbXBsYXRlKHRlbXBsYXRlLCBlbnYsIHBhcmVudFNjb3BlLCBjdXJyZW50TW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKShibG9ja0FyZ3VtZW50cywgc2VsZik7XG4gICAgICBjdXJyZW50TW9ycGggPSBjdXJyZW50TW9ycGgubmV4dE1vcnBoO1xuICAgICAgaGFuZGxlZE1vcnBoc1trZXldID0gY3VycmVudE1vcnBoO1xuICAgIH0gZWxzZSBpZiAobW9ycGhNYXBba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsZXQgZm91bmRNb3JwaCA9IG1vcnBoTWFwW2tleV07XG5cbiAgICAgIGlmIChrZXkgaW4gY2FuZGlkYXRlcykge1xuICAgICAgICAvLyBJZiB3ZSBhbHJlYWR5IHNhdyB0aGlzIG1vcnBoLCBtb3ZlIGl0IGZvcndhcmQgdG8gdGhpcyBwb3NpdGlvblxuICAgICAgICBtb3JwaExpc3QuaW5zZXJ0QmVmb3JlTW9ycGgoZm91bmRNb3JwaCwgY3VycmVudE1vcnBoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE90aGVyd2lzZSwgbW92ZSB0aGUgcG9pbnRlciBmb3J3YXJkIHRvIHRoZSBleGlzdGluZyBtb3JwaCBmb3IgdGhpcyBrZXlcbiAgICAgICAgYWR2YW5jZVRvS2V5KGtleSk7XG4gICAgICB9XG5cbiAgICAgIGhhbmRsZWRNb3JwaHNbZm91bmRNb3JwaC5rZXldID0gZm91bmRNb3JwaDtcbiAgICAgIHlpZWxkVGVtcGxhdGUodGVtcGxhdGUsIGVudiwgcGFyZW50U2NvcGUsIGZvdW5kTW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKShibG9ja0FyZ3VtZW50cywgc2VsZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjaGlsZE1vcnBoID0gY3JlYXRlQ2hpbGRNb3JwaChlbnYuZG9tLCBtb3JwaCk7XG4gICAgICBjaGlsZE1vcnBoLmtleSA9IGtleTtcbiAgICAgIG1vcnBoTWFwW2tleV0gPSBoYW5kbGVkTW9ycGhzW2tleV0gPSBjaGlsZE1vcnBoO1xuICAgICAgbW9ycGhMaXN0Lmluc2VydEJlZm9yZU1vcnBoKGNoaWxkTW9ycGgsIGN1cnJlbnRNb3JwaCk7XG4gICAgICB5aWVsZFRlbXBsYXRlKHRlbXBsYXRlLCBlbnYsIHBhcmVudFNjb3BlLCBjaGlsZE1vcnBoLCByZW5kZXJTdGF0ZSwgdmlzaXRvcikoYmxvY2tBcmd1bWVudHMsIHNlbGYpO1xuICAgIH1cblxuICAgIHJlbmRlclN0YXRlLm1vcnBoTGlzdFRvUHJ1bmUgPSBtb3JwaExpc3Q7XG4gICAgbW9ycGguY2hpbGROb2RlcyA9IG51bGw7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGlzU3RhYmxlVGVtcGxhdGUodGVtcGxhdGUsIGxhc3RZaWVsZGVkKSB7XG4gIHJldHVybiAhbGFzdFlpZWxkZWQuc2hhZG93VGVtcGxhdGUgJiYgdGVtcGxhdGUgPT09IGxhc3RZaWVsZGVkLnRlbXBsYXRlO1xufVxuXG5mdW5jdGlvbiB5aWVsZEluU2hhZG93VGVtcGxhdGUodGVtcGxhdGUsIGVudiwgcGFyZW50U2NvcGUsIG1vcnBoLCByZW5kZXJTdGF0ZSwgdmlzaXRvcikge1xuICB2YXIgaG9zdFlpZWxkID0gaG9zdFlpZWxkV2l0aFNoYWRvd1RlbXBsYXRlKHRlbXBsYXRlLCBlbnYsIHBhcmVudFNjb3BlLCBtb3JwaCwgcmVuZGVyU3RhdGUsIHZpc2l0b3IpO1xuXG4gIHJldHVybiBmdW5jdGlvbihzaGFkb3dUZW1wbGF0ZSwgc2VsZikge1xuICAgIGhvc3RZaWVsZChzaGFkb3dUZW1wbGF0ZSwgZW52LCBzZWxmLCBbXSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBob3N0WWllbGRXaXRoU2hhZG93VGVtcGxhdGUodGVtcGxhdGUsIGVudiwgcGFyZW50U2NvcGUsIG1vcnBoLCByZW5kZXJTdGF0ZSwgdmlzaXRvcikge1xuICByZXR1cm4gZnVuY3Rpb24oc2hhZG93VGVtcGxhdGUsIGVudiwgc2VsZiwgYmxvY2tBcmd1bWVudHMpIHtcbiAgICByZW5kZXJTdGF0ZS5tb3JwaFRvQ2xlYXIgPSBudWxsO1xuXG4gICAgaWYgKG1vcnBoLmxhc3RZaWVsZGVkICYmIGlzU3RhYmxlU2hhZG93Um9vdCh0ZW1wbGF0ZSwgc2hhZG93VGVtcGxhdGUsIG1vcnBoLmxhc3RZaWVsZGVkKSkge1xuICAgICAgcmV0dXJuIG1vcnBoLmxhc3RSZXN1bHQucmV2YWxpZGF0ZVdpdGgoZW52LCB1bmRlZmluZWQsIHNlbGYsIGJsb2NrQXJndW1lbnRzLCB2aXNpdG9yKTtcbiAgICB9XG5cbiAgICB2YXIgc2hhZG93U2NvcGUgPSBlbnYuaG9va3MuY3JlYXRlRnJlc2hTY29wZSgpO1xuICAgIGVudi5ob29rcy5iaW5kU2hhZG93U2NvcGUoZW52LCBwYXJlbnRTY29wZSwgc2hhZG93U2NvcGUsIHJlbmRlclN0YXRlLnNoYWRvd09wdGlvbnMpO1xuICAgIGJsb2NrVG9ZaWVsZC5hcml0eSA9IHRlbXBsYXRlLmFyaXR5O1xuICAgIGVudi5ob29rcy5iaW5kQmxvY2soZW52LCBzaGFkb3dTY29wZSwgYmxvY2tUb1lpZWxkKTtcblxuICAgIG1vcnBoLmxhc3RZaWVsZGVkID0geyBzZWxmOiBzZWxmLCB0ZW1wbGF0ZTogdGVtcGxhdGUsIHNoYWRvd1RlbXBsYXRlOiBzaGFkb3dUZW1wbGF0ZSB9O1xuXG4gICAgLy8gUmVuZGVyIHRoZSBzaGFkb3cgdGVtcGxhdGUgd2l0aCB0aGUgYmxvY2sgYXZhaWxhYmxlXG4gICAgcmVuZGVyKHNoYWRvd1RlbXBsYXRlLnJhdywgZW52LCBzaGFkb3dTY29wZSwgeyByZW5kZXJOb2RlOiBtb3JwaCwgc2VsZjogc2VsZiwgYmxvY2tBcmd1bWVudHM6IGJsb2NrQXJndW1lbnRzIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGJsb2NrVG9ZaWVsZChlbnYsIGJsb2NrQXJndW1lbnRzLCBzZWxmLCByZW5kZXJOb2RlLCBzaGFkb3dQYXJlbnQsIHZpc2l0b3IpIHtcbiAgICBpZiAocmVuZGVyTm9kZS5sYXN0UmVzdWx0KSB7XG4gICAgICByZW5kZXJOb2RlLmxhc3RSZXN1bHQucmV2YWxpZGF0ZVdpdGgoZW52LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgYmxvY2tBcmd1bWVudHMsIHZpc2l0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2NvcGUgPSBwYXJlbnRTY29wZTtcblxuICAgICAgLy8gU2luY2UgYSB5aWVsZGVkIHRlbXBsYXRlIHNoYXJlcyBhIGBzZWxmYCB3aXRoIGl0cyBvcmlnaW5hbCBjb250ZXh0LFxuICAgICAgLy8gd2Ugb25seSBuZWVkIHRvIGNyZWF0ZSBhIG5ldyBzY29wZSBpZiB0aGUgdGVtcGxhdGUgaGFzIGJsb2NrIHBhcmFtZXRlcnNcbiAgICAgIGlmICh0ZW1wbGF0ZS5hcml0eSkge1xuICAgICAgICBzY29wZSA9IGVudi5ob29rcy5jcmVhdGVDaGlsZFNjb3BlKHBhcmVudFNjb3BlKTtcbiAgICAgIH1cblxuICAgICAgcmVuZGVyKHRlbXBsYXRlLCBlbnYsIHNjb3BlLCB7IHJlbmRlck5vZGU6IHJlbmRlck5vZGUsIHNlbGY6IHNlbGYsIGJsb2NrQXJndW1lbnRzOiBibG9ja0FyZ3VtZW50cyB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNTdGFibGVTaGFkb3dSb290KHRlbXBsYXRlLCBzaGFkb3dUZW1wbGF0ZSwgbGFzdFlpZWxkZWQpIHtcbiAgcmV0dXJuIHRlbXBsYXRlID09PSBsYXN0WWllbGRlZC50ZW1wbGF0ZSAmJiBzaGFkb3dUZW1wbGF0ZSA9PT0gbGFzdFlpZWxkZWQuc2hhZG93VGVtcGxhdGU7XG59XG5cbmZ1bmN0aW9uIG9wdGlvbnNGb3IodGVtcGxhdGUsIGludmVyc2UsIGVudiwgc2NvcGUsIG1vcnBoLCB2aXNpdG9yKSB7XG4gIC8vIElmIHRoZXJlIHdhcyBhIHRlbXBsYXRlIHlpZWxkZWQgbGFzdCB0aW1lLCBzZXQgbW9ycGhUb0NsZWFyIHNvIGl0IHdpbGwgYmUgY2xlYXJlZFxuICAvLyBpZiBubyB0ZW1wbGF0ZSBpcyB5aWVsZGVkIG9uIHRoaXMgcmVuZGVyLlxuICB2YXIgbW9ycGhUb0NsZWFyID0gbW9ycGgubGFzdFJlc3VsdCA/IG1vcnBoIDogbnVsbDtcbiAgdmFyIHJlbmRlclN0YXRlID0gbmV3IFJlbmRlclN0YXRlKG1vcnBoVG9DbGVhciwgbW9ycGgubW9ycGhMaXN0IHx8IG51bGwpO1xuXG4gIHJldHVybiB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICB0ZW1wbGF0ZTogd3JhcEZvckhlbHBlcih0ZW1wbGF0ZSwgZW52LCBzY29wZSwgbW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKSxcbiAgICAgIGludmVyc2U6IHdyYXBGb3JIZWxwZXIoaW52ZXJzZSwgZW52LCBzY29wZSwgbW9ycGgsIHJlbmRlclN0YXRlLCB2aXNpdG9yKVxuICAgIH0sXG4gICAgcmVuZGVyU3RhdGU6IHJlbmRlclN0YXRlXG4gIH07XG59XG5cbmZ1bmN0aW9uIHRoaXNGb3Iob3B0aW9ucykge1xuICByZXR1cm4ge1xuICAgIGFyaXR5OiBvcHRpb25zLnRlbXBsYXRlLmFyaXR5LFxuICAgIHlpZWxkOiBvcHRpb25zLnRlbXBsYXRlLnlpZWxkLFxuICAgIHlpZWxkSXRlbTogb3B0aW9ucy50ZW1wbGF0ZS55aWVsZEl0ZW0sXG4gICAgeWllbGRJbjogb3B0aW9ucy50ZW1wbGF0ZS55aWVsZEluXG4gIH07XG59XG5cbi8qKlxuICBIb3N0IEhvb2s6IGNyZWF0ZVNjb3BlXG5cbiAgQHBhcmFtIHtTY29wZT99IHBhcmVudFNjb3BlXG4gIEByZXR1cm4gU2NvcGVcblxuICBDb3JyZXNwb25kcyB0byBlbnRlcmluZyBhIG5ldyBIVE1MQmFycyBibG9jay5cblxuICBUaGlzIGhvb2sgaXMgaW52b2tlZCB3aGVuIGEgYmxvY2sgaXMgZW50ZXJlZCB3aXRoXG4gIGEgbmV3IGBzZWxmYCBvciBhZGRpdGlvbmFsIGxvY2FsIHZhcmlhYmxlcy5cblxuICBXaGVuIGludm9rZWQgZm9yIGEgdG9wLWxldmVsIHRlbXBsYXRlLCB0aGVcbiAgYHBhcmVudFNjb3BlYCBpcyBgbnVsbGAsIGFuZCB0aGlzIGhvb2sgc2hvdWxkIHJldHVyblxuICBhIGZyZXNoIFNjb3BlLlxuXG4gIFdoZW4gaW52b2tlZCBmb3IgYSBjaGlsZCB0ZW1wbGF0ZSwgdGhlIGBwYXJlbnRTY29wZWBcbiAgaXMgdGhlIHNjb3BlIGZvciB0aGUgcGFyZW50IGVudmlyb25tZW50LlxuXG4gIE5vdGUgdGhhdCB0aGUgYFNjb3BlYCBpcyBhbiBvcGFxdWUgdmFsdWUgdGhhdCBpc1xuICBwYXNzZWQgdG8gb3RoZXIgaG9zdCBob29rcy4gRm9yIGV4YW1wbGUsIHRoZSBgZ2V0YFxuICBob29rIHVzZXMgdGhlIHNjb3BlIHRvIHJldHJpZXZlIGEgdmFsdWUgZm9yIGEgZ2l2ZW5cbiAgc2NvcGUgYW5kIHZhcmlhYmxlIG5hbWUuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNjb3BlKGVudiwgcGFyZW50U2NvcGUpIHtcbiAgaWYgKHBhcmVudFNjb3BlKSB7XG4gICAgcmV0dXJuIGVudi5ob29rcy5jcmVhdGVDaGlsZFNjb3BlKHBhcmVudFNjb3BlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZW52Lmhvb2tzLmNyZWF0ZUZyZXNoU2NvcGUoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRnJlc2hTY29wZSgpIHtcbiAgLy8gYmVjYXVzZSBgaW5gIGNoZWNrcyBoYXZlIHVucHJlZGljdGFibGUgcGVyZm9ybWFuY2UsIGtlZXAgYVxuICAvLyBzZXBhcmF0ZSBkaWN0aW9uYXJ5IHRvIHRyYWNrIHdoZXRoZXIgYSBsb2NhbCB3YXMgYm91bmQuXG4gIC8vIFNlZSBgYmluZExvY2FsYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgcmV0dXJuIHsgc2VsZjogbnVsbCwgYmxvY2tzOiB7fSwgbG9jYWxzOiB7fSwgbG9jYWxQcmVzZW50OiB7fSB9O1xufVxuXG4vKipcbiAgSG9zdCBIb29rOiBiaW5kU2hhZG93U2NvcGVcblxuICBAcGFyYW0ge1Njb3BlP30gcGFyZW50U2NvcGVcbiAgQHJldHVybiBTY29wZVxuXG4gIENvcnJlc3BvbmRzIHRvIHJlbmRlcmluZyBhIG5ldyB0ZW1wbGF0ZSBpbnRvIGFuIGV4aXN0aW5nXG4gIHJlbmRlciB0cmVlLCBidXQgd2l0aCBhIG5ldyB0b3AtbGV2ZWwgbGV4aWNhbCBzY29wZS4gVGhpc1xuICB0ZW1wbGF0ZSBpcyBjYWxsZWQgdGhlIFwic2hhZG93IHJvb3RcIi5cblxuICBJZiBhIHNoYWRvdyB0ZW1wbGF0ZSBpbnZva2VzIGB7e3lpZWxkfX1gLCBpdCB3aWxsIHJlbmRlclxuICB0aGUgYmxvY2sgcHJvdmlkZWQgdG8gdGhlIHNoYWRvdyByb290IGluIHRoZSBvcmlnaW5hbFxuICBsZXhpY2FsIHNjb3BlLlxuXG4gIGBgYGhic1xuICB7eyEtLSBwb3N0IHRlbXBsYXRlIC0tfX1cbiAgPHA+e3twcm9wcy50aXRsZX19PC9wPlxuICB7e3lpZWxkfX1cblxuICB7eyEtLSBibG9nIHRlbXBsYXRlIC0tfX1cbiAge3sjcG9zdCB0aXRsZT1cIkhlbGxvIHdvcmxkXCJ9fVxuICAgIDxwPmJ5IHt7YnlsaW5lfX08L3A+XG4gICAgPGFydGljbGU+VGhpcyBpcyBteSBmaXJzdCBwb3N0PC9hcnRpY2xlPlxuICB7ey9wb3N0fX1cblxuICB7eyNwb3N0IHRpdGxlPVwiR29vZGJ5ZSB3b3JsZFwifX1cbiAgICA8cD5ieSB7e2J5bGluZX19PC9wPlxuICAgIDxhcnRpY2xlPlRoaXMgaXMgbXkgbGFzdCBwb3N0PC9hcnRpY2xlPlxuICB7ey9wb3N0fX1cbiAgYGBgXG5cbiAgYGBganNcbiAgaGVscGVycy5wb3N0ID0gZnVuY3Rpb24ocGFyYW1zLCBoYXNoLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucy50ZW1wbGF0ZS55aWVsZEluKHBvc3RUZW1wbGF0ZSwgeyBwcm9wczogaGFzaCB9KTtcbiAgfTtcblxuICBibG9nLnJlbmRlcih7IGJ5bGluZTogXCJZZWh1ZGEgS2F0elwiIH0pO1xuICBgYGBcblxuICBQcm9kdWNlczpcblxuICBgYGBodG1sXG4gIDxwPkhlbGxvIHdvcmxkPC9wPlxuICA8cD5ieSBZZWh1ZGEgS2F0ejwvcD5cbiAgPGFydGljbGU+VGhpcyBpcyBteSBmaXJzdCBwb3N0PC9hcnRpY2xlPlxuXG4gIDxwPkdvb2RieWUgd29ybGQ8L3A+XG4gIDxwPmJ5IFllaHVkYSBLYXR6PC9wPlxuICA8YXJ0aWNsZT5UaGlzIGlzIG15IGxhc3QgcG9zdDwvYXJ0aWNsZT5cbiAgYGBgXG5cbiAgSW4gc2hvcnQsIGB5aWVsZEluYCBjcmVhdGVzIGEgbmV3IHRvcC1sZXZlbCBzY29wZSBmb3IgdGhlXG4gIHByb3ZpZGVkIHRlbXBsYXRlIGFuZCByZW5kZXJzIGl0LCBtYWtpbmcgdGhlIG9yaWdpbmFsIGJsb2NrXG4gIGF2YWlsYWJsZSB0byBge3t5aWVsZH19YCBpbiB0aGF0IHRlbXBsYXRlLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kU2hhZG93U2NvcGUoZW52IC8qLCBwYXJlbnRTY29wZSwgc2hhZG93U2NvcGUgKi8pIHtcbiAgcmV0dXJuIGVudi5ob29rcy5jcmVhdGVGcmVzaFNjb3BlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDaGlsZFNjb3BlKHBhcmVudCkge1xuICB2YXIgc2NvcGUgPSBPYmplY3QuY3JlYXRlKHBhcmVudCk7XG4gIHNjb3BlLmxvY2FscyA9IE9iamVjdC5jcmVhdGUocGFyZW50LmxvY2Fscyk7XG4gIHJldHVybiBzY29wZTtcbn1cblxuLyoqXG4gIEhvc3QgSG9vazogYmluZFNlbGZcblxuICBAcGFyYW0ge1Njb3BlfSBzY29wZVxuICBAcGFyYW0ge2FueX0gc2VsZlxuXG4gIENvcnJlc3BvbmRzIHRvIGVudGVyaW5nIGEgdGVtcGxhdGUuXG5cbiAgVGhpcyBob29rIGlzIGludm9rZWQgd2hlbiB0aGUgYHNlbGZgIHZhbHVlIGZvciBhIHNjb3BlIGlzIHJlYWR5IHRvIGJlIGJvdW5kLlxuXG4gIFRoZSBob3N0IG11c3QgZW5zdXJlIHRoYXQgY2hpbGQgc2NvcGVzIHJlZmxlY3QgdGhlIGNoYW5nZSB0byB0aGUgYHNlbGZgIGluXG4gIGZ1dHVyZSBjYWxscyB0byB0aGUgYGdldGAgaG9vay5cbiovXG5leHBvcnQgZnVuY3Rpb24gYmluZFNlbGYoZW52LCBzY29wZSwgc2VsZikge1xuICBzY29wZS5zZWxmID0gc2VsZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlbGYoZW52LCBzY29wZSwgc2VsZikge1xuICBlbnYuaG9va3MuYmluZFNlbGYoZW52LCBzY29wZSwgc2VsZik7XG59XG5cbi8qKlxuICBIb3N0IEhvb2s6IGJpbmRMb2NhbFxuXG4gIEBwYXJhbSB7RW52aXJvbm1lbnR9IGVudlxuICBAcGFyYW0ge1Njb3BlfSBzY29wZVxuICBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICBAcGFyYW0ge2FueX0gdmFsdWVcblxuICBDb3JyZXNwb25kcyB0byBlbnRlcmluZyBhIHRlbXBsYXRlIHdpdGggYmxvY2sgYXJndW1lbnRzLlxuXG4gIFRoaXMgaG9vayBpcyBpbnZva2VkIHdoZW4gYSBsb2NhbCB2YXJpYWJsZSBmb3IgYSBzY29wZSBoYXMgYmVlbiBwcm92aWRlZC5cblxuICBUaGUgaG9zdCBtdXN0IGVuc3VyZSB0aGF0IGNoaWxkIHNjb3BlcyByZWZsZWN0IHRoZSBjaGFuZ2UgaW4gZnV0dXJlIGNhbGxzXG4gIHRvIHRoZSBgZ2V0YCBob29rLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kTG9jYWwoZW52LCBzY29wZSwgbmFtZSwgdmFsdWUpIHtcbiAgc2NvcGUubG9jYWxQcmVzZW50W25hbWVdID0gdHJ1ZTtcbiAgc2NvcGUubG9jYWxzW25hbWVdID0gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVMb2NhbChlbnYsIHNjb3BlLCBuYW1lLCB2YWx1ZSkge1xuICBlbnYuaG9va3MuYmluZExvY2FsKGVudiwgc2NvcGUsIG5hbWUsIHZhbHVlKTtcbn1cblxuLyoqXG4gIEhvc3QgSG9vazogYmluZEJsb2NrXG5cbiAgQHBhcmFtIHtFbnZpcm9ubWVudH0gZW52XG4gIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gIEBwYXJhbSB7RnVuY3Rpb259IGJsb2NrXG5cbiAgQ29ycmVzcG9uZHMgdG8gZW50ZXJpbmcgYSBzaGFkb3cgdGVtcGxhdGUgdGhhdCB3YXMgaW52b2tlZCBieSBhIGJsb2NrIGhlbHBlciB3aXRoXG4gIGB5aWVsZEluYC5cblxuICBUaGlzIGhvb2sgaXMgaW52b2tlZCB3aXRoIGFuIG9wYXF1ZSBibG9jayB0aGF0IHdpbGwgYmUgcGFzc2VkIGFsb25nXG4gIHRvIHRoZSBzaGFkb3cgdGVtcGxhdGUsIGFuZCBpbnNlcnRlZCBpbnRvIHRoZSBzaGFkb3cgdGVtcGxhdGUgd2hlblxuICBge3t5aWVsZH19YCBpcyB1c2VkLiBPcHRpb25hbGx5IHByb3ZpZGUgYSBub24tZGVmYXVsdCBibG9jayBuYW1lXG4gIHRoYXQgY2FuIGJlIHRhcmdldGVkIGJ5IGB7e3lpZWxkIHRvPWJsb2NrTmFtZX19YC5cbiovXG5leHBvcnQgZnVuY3Rpb24gYmluZEJsb2NrKGVudiwgc2NvcGUsIGJsb2NrLCBuYW1lPSdkZWZhdWx0Jykge1xuICBzY29wZS5ibG9ja3NbbmFtZV0gPSBibG9jaztcbn1cblxuLyoqXG4gIEhvc3QgSG9vazogYmxvY2tcblxuICBAcGFyYW0ge1JlbmRlck5vZGV9IHJlbmRlck5vZGVcbiAgQHBhcmFtIHtFbnZpcm9ubWVudH0gZW52XG4gIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gIEBwYXJhbSB7QXJyYXl9IHBhcmFtc1xuICBAcGFyYW0ge09iamVjdH0gaGFzaFxuICBAcGFyYW0ge0Jsb2NrfSBibG9ja1xuICBAcGFyYW0ge0Jsb2NrfSBlbHNlQmxvY2tcblxuICBDb3JyZXNwb25kcyB0bzpcblxuICBgYGBoYnNcbiAge3sjaGVscGVyIHBhcmFtMSBwYXJhbTIga2V5MT12YWwxIGtleTI9dmFsMn19XG4gICAge3shLS0gY2hpbGQgdGVtcGxhdGUgLS19fVxuICB7ey9oZWxwZXJ9fVxuICBgYGBcblxuICBUaGlzIGhvc3QgaG9vayBpcyBhIHdvcmtob3JzZSBvZiB0aGUgc3lzdGVtLiBJdCBpcyBpbnZva2VkXG4gIHdoZW5ldmVyIGEgYmxvY2sgaXMgZW5jb3VudGVyZWQsIGFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAgcmVzb2x2aW5nIHRoZSBoZWxwZXIgdG8gY2FsbCwgYW5kIHRoZW4gaW52b2tlIGl0LlxuXG4gIFRoZSBoZWxwZXIgc2hvdWxkIGJlIGludm9rZWQgd2l0aDpcblxuICAtIGB7QXJyYXl9IHBhcmFtc2A6IHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byB0aGUgaGVscGVyXG4gICAgaW4gdGhlIHRlbXBsYXRlLlxuICAtIGB7T2JqZWN0fSBoYXNoYDogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleXMgYW5kIHZhbHVlcyBwYXNzZWRcbiAgICBpbiB0aGUgaGFzaCBwb3NpdGlvbiBpbiB0aGUgdGVtcGxhdGUuXG5cbiAgVGhlIHZhbHVlcyBpbiBgcGFyYW1zYCBhbmQgYGhhc2hgIHdpbGwgYWxyZWFkeSBiZSByZXNvbHZlZFxuICB0aHJvdWdoIGEgcHJldmlvdXMgY2FsbCB0byB0aGUgYGdldGAgaG9zdCBob29rLlxuXG4gIFRoZSBoZWxwZXIgc2hvdWxkIGJlIGludm9rZWQgd2l0aCBhIGB0aGlzYCB2YWx1ZSB0aGF0IGlzXG4gIGFuIG9iamVjdCB3aXRoIG9uZSBmaWVsZDpcblxuICBge0Z1bmN0aW9ufSB5aWVsZGA6IHdoZW4gaW52b2tlZCwgdGhpcyBmdW5jdGlvbiBleGVjdXRlcyB0aGVcbiAgYmxvY2sgd2l0aCB0aGUgY3VycmVudCBzY29wZS4gSXQgdGFrZXMgYW4gb3B0aW9uYWwgYXJyYXkgb2ZcbiAgYmxvY2sgcGFyYW1ldGVycy4gSWYgYmxvY2sgcGFyYW1ldGVycyBhcmUgc3VwcGxpZWQsIEhUTUxCYXJzXG4gIHdpbGwgaW52b2tlIHRoZSBgYmluZExvY2FsYCBob3N0IGhvb2sgdG8gYmluZCB0aGUgc3VwcGxpZWRcbiAgdmFsdWVzIHRvIHRoZSBibG9jayBhcmd1bWVudHMgcHJvdmlkZWQgYnkgdGhlIHRlbXBsYXRlLlxuXG4gIEluIGdlbmVyYWwsIHRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mIGBibG9ja2Agc2hvdWxkIHdvcmtcbiAgZm9yIG1vc3QgaG9zdCBlbnZpcm9ubWVudHMuIEl0IGRlbGVnYXRlcyB0byBvdGhlciBob3N0IGhvb2tzXG4gIHdoZXJlIGFwcHJvcHJpYXRlLCBhbmQgcHJvcGVybHkgaW52b2tlcyB0aGUgaGVscGVyIHdpdGggdGhlXG4gIGFwcHJvcHJpYXRlIGFyZ3VtZW50cy5cbiovXG5leHBvcnQgZnVuY3Rpb24gYmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgdGVtcGxhdGUsIGludmVyc2UsIHZpc2l0b3IpIHtcbiAgaWYgKGhhbmRsZVJlZGlyZWN0KG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnRpbnVlQmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgdGVtcGxhdGUsIGludmVyc2UsIHZpc2l0b3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udGludWVCbG9jayhtb3JwaCwgZW52LCBzY29wZSwgcGF0aCwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZSwgaW52ZXJzZSwgdmlzaXRvcikge1xuICBob3N0QmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlLCBpbnZlcnNlLCBudWxsLCB2aXNpdG9yLCBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGhlbHBlciA9IGVudi5ob29rcy5sb29rdXBIZWxwZXIoZW52LCBzY29wZSwgcGF0aCk7XG4gICAgcmV0dXJuIGVudi5ob29rcy5pbnZva2VIZWxwZXIobW9ycGgsIGVudiwgc2NvcGUsIHZpc2l0b3IsIHBhcmFtcywgaGFzaCwgaGVscGVyLCBvcHRpb25zLnRlbXBsYXRlcywgdGhpc0ZvcihvcHRpb25zLnRlbXBsYXRlcykpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhvc3RCbG9jayhtb3JwaCwgZW52LCBzY29wZSwgdGVtcGxhdGUsIGludmVyc2UsIHNoYWRvd09wdGlvbnMsIHZpc2l0b3IsIGNhbGxiYWNrKSB7XG4gIHZhciBvcHRpb25zID0gb3B0aW9uc0Zvcih0ZW1wbGF0ZSwgaW52ZXJzZSwgZW52LCBzY29wZSwgbW9ycGgsIHZpc2l0b3IpO1xuICByZW5kZXJBbmRDbGVhbnVwKG1vcnBoLCBlbnYsIG9wdGlvbnMsIHNoYWRvd09wdGlvbnMsIGNhbGxiYWNrKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVJlZGlyZWN0KG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKSB7XG4gIGlmICghcGF0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciByZWRpcmVjdCA9IGVudi5ob29rcy5jbGFzc2lmeShlbnYsIHNjb3BlLCBwYXRoKTtcbiAgaWYgKHJlZGlyZWN0KSB7XG4gICAgc3dpdGNoKHJlZGlyZWN0KSB7XG4gICAgICBjYXNlICdjb21wb25lbnQnOiBlbnYuaG9va3MuY29tcG9uZW50KG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCBwYXJhbXMsIGhhc2gsIHtkZWZhdWx0OiB0ZW1wbGF0ZSwgaW52ZXJzZX0sIHZpc2l0b3IpOyBicmVhaztcbiAgICAgIGNhc2UgJ2lubGluZSc6IGVudi5ob29rcy5pbmxpbmUobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgdmlzaXRvcik7IGJyZWFrO1xuICAgICAgY2FzZSAnYmxvY2snOiBlbnYuaG9va3MuYmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgdGVtcGxhdGUsIGludmVyc2UsIHZpc2l0b3IpOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihcIkludGVybmFsIEhUTUxCYXJzIHJlZGlyZWN0aW9uIHRvIFwiICsgcmVkaXJlY3QgKyBcIiBub3Qgc3VwcG9ydGVkXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChoYW5kbGVLZXl3b3JkKHBhdGgsIG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlS2V5d29yZChwYXRoLCBtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZSwgaW52ZXJzZSwgdmlzaXRvcikge1xuICB2YXIga2V5d29yZCA9IGVudi5ob29rcy5rZXl3b3Jkc1twYXRoXTtcbiAgaWYgKCFrZXl3b3JkKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGlmICh0eXBlb2Yga2V5d29yZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBrZXl3b3JkKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKTtcbiAgfVxuXG4gIGlmIChrZXl3b3JkLndpbGxSZW5kZXIpIHtcbiAgICBrZXl3b3JkLndpbGxSZW5kZXIobW9ycGgsIGVudik7XG4gIH1cblxuICB2YXIgbGFzdFN0YXRlLCBuZXdTdGF0ZTtcbiAgaWYgKGtleXdvcmQuc2V0dXBTdGF0ZSkge1xuICAgIGxhc3RTdGF0ZSA9IHNoYWxsb3dDb3B5KG1vcnBoLnN0YXRlKTtcbiAgICBuZXdTdGF0ZSA9IG1vcnBoLnN0YXRlID0ga2V5d29yZC5zZXR1cFN0YXRlKGxhc3RTdGF0ZSwgZW52LCBzY29wZSwgcGFyYW1zLCBoYXNoKTtcbiAgfVxuXG4gIGlmIChrZXl3b3JkLmNoaWxkRW52KSB7XG4gICAgLy8gQnVpbGQgdGhlIGNoaWxkIGVudmlyb25tZW50Li4uXG4gICAgZW52ID0ga2V5d29yZC5jaGlsZEVudihtb3JwaC5zdGF0ZSwgZW52KTtcblxuICAgIC8vIC4udGhlbiBzYXZlIG9mZiB0aGUgY2hpbGQgZW52IGJ1aWxkZXIgb24gdGhlIHJlbmRlciBub2RlLiBJZiB0aGUgcmVuZGVyXG4gICAgLy8gbm9kZSB0cmVlIGlzIHJlLXJlbmRlcmVkIGFuZCB0aGlzIG5vZGUgaXMgbm90IGRpcnR5LCB0aGUgY2hpbGQgZW52XG4gICAgLy8gYnVpbGRlciB3aWxsIHN0aWxsIGJlIGludm9rZWQgc28gdGhhdCBjaGlsZCBkaXJ0eSByZW5kZXIgbm9kZXMgc3RpbGwgZ2V0XG4gICAgLy8gdGhlIGNvcnJlY3QgY2hpbGQgZW52LlxuICAgIG1vcnBoLmJ1aWxkQ2hpbGRFbnYgPSBrZXl3b3JkLmNoaWxkRW52O1xuICB9XG5cbiAgdmFyIGZpcnN0VGltZSA9ICFtb3JwaC5yZW5kZXJlZDtcblxuICBpZiAoa2V5d29yZC5pc0VtcHR5KSB7XG4gICAgdmFyIGlzRW1wdHkgPSBrZXl3b3JkLmlzRW1wdHkobW9ycGguc3RhdGUsIGVudiwgc2NvcGUsIHBhcmFtcywgaGFzaCk7XG5cbiAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgaWYgKCFmaXJzdFRpbWUpIHsgY2xlYXJNb3JwaChtb3JwaCwgZW52LCBmYWxzZSk7IH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChmaXJzdFRpbWUpIHtcbiAgICBpZiAoa2V5d29yZC5yZW5kZXIpIHtcbiAgICAgIGtleXdvcmQucmVuZGVyKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKTtcbiAgICB9XG4gICAgbW9ycGgucmVuZGVyZWQgPSB0cnVlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFyIGlzU3RhYmxlO1xuICBpZiAoa2V5d29yZC5pc1N0YWJsZSkge1xuICAgIGlzU3RhYmxlID0ga2V5d29yZC5pc1N0YWJsZShsYXN0U3RhdGUsIG5ld1N0YXRlKTtcbiAgfSBlbHNlIHtcbiAgICBpc1N0YWJsZSA9IHN0YWJsZVN0YXRlKGxhc3RTdGF0ZSwgbmV3U3RhdGUpO1xuICB9XG5cbiAgaWYgKGlzU3RhYmxlKSB7XG4gICAgaWYgKGtleXdvcmQucmVyZW5kZXIpIHtcbiAgICAgIHZhciBuZXdFbnYgPSBrZXl3b3JkLnJlcmVuZGVyKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJhbXMsIGhhc2gsIHRlbXBsYXRlLCBpbnZlcnNlLCB2aXNpdG9yKTtcbiAgICAgIGVudiA9IG5ld0VudiB8fCBlbnY7XG4gICAgfVxuICAgIHZhbGlkYXRlQ2hpbGRNb3JwaHMoZW52LCBtb3JwaCwgdmlzaXRvcik7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgY2xlYXJNb3JwaChtb3JwaCwgZW52LCBmYWxzZSk7XG4gIH1cblxuICAvLyBJZiB0aGUgbm9kZSBpcyB1bnN0YWJsZSwgcmUtcmVuZGVyIGZyb20gc2NyYXRjaFxuICBpZiAoa2V5d29yZC5yZW5kZXIpIHtcbiAgICBrZXl3b3JkLnJlbmRlcihtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZSwgaW52ZXJzZSwgdmlzaXRvcik7XG4gICAgbW9ycGgucmVuZGVyZWQgPSB0cnVlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0YWJsZVN0YXRlKG9sZFN0YXRlLCBuZXdTdGF0ZSkge1xuICBpZiAoa2V5TGVuZ3RoKG9sZFN0YXRlKSAhPT0ga2V5TGVuZ3RoKG5ld1N0YXRlKSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICBmb3IgKHZhciBwcm9wIGluIG9sZFN0YXRlKSB7XG4gICAgaWYgKG9sZFN0YXRlW3Byb3BdICE9PSBuZXdTdGF0ZVtwcm9wXSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlua1JlbmRlck5vZGUoLyogbW9ycGgsIGVudiwgc2NvcGUsIHBhcmFtcywgaGFzaCAqLykge1xuICByZXR1cm47XG59XG5cbi8qKlxuICBIb3N0IEhvb2s6IGlubGluZVxuXG4gIEBwYXJhbSB7UmVuZGVyTm9kZX0gcmVuZGVyTm9kZVxuICBAcGFyYW0ge0Vudmlyb25tZW50fSBlbnZcbiAgQHBhcmFtIHtTY29wZX0gc2NvcGVcbiAgQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgQHBhcmFtIHtBcnJheX0gcGFyYW1zXG4gIEBwYXJhbSB7SGFzaH0gaGFzaFxuXG4gIENvcnJlc3BvbmRzIHRvOlxuXG4gIGBgYGhic1xuICB7e2hlbHBlciBwYXJhbTEgcGFyYW0yIGtleTE9dmFsMSBrZXkyPXZhbDJ9fVxuICBgYGBcblxuICBUaGlzIGhvc3QgaG9vayBpcyBzaW1pbGFyIHRvIHRoZSBgYmxvY2tgIGhvc3QgaG9vaywgYnV0IGl0XG4gIGludm9rZXMgaGVscGVycyB0aGF0IGRvIG5vdCBzdXBwbHkgYW4gYXR0YWNoZWQgYmxvY2suXG5cbiAgTGlrZSB0aGUgYGJsb2NrYCBob29rLCB0aGUgaGVscGVyIHNob3VsZCBiZSBpbnZva2VkIHdpdGg6XG5cbiAgLSBge0FycmF5fSBwYXJhbXNgOiB0aGUgcGFyYW1ldGVycyBwYXNzZWQgdG8gdGhlIGhlbHBlclxuICAgIGluIHRoZSB0ZW1wbGF0ZS5cbiAgLSBge09iamVjdH0gaGFzaGA6IGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBrZXlzIGFuZCB2YWx1ZXMgcGFzc2VkXG4gICAgaW4gdGhlIGhhc2ggcG9zaXRpb24gaW4gdGhlIHRlbXBsYXRlLlxuXG4gIFRoZSB2YWx1ZXMgaW4gYHBhcmFtc2AgYW5kIGBoYXNoYCB3aWxsIGFscmVhZHkgYmUgcmVzb2x2ZWRcbiAgdGhyb3VnaCBhIHByZXZpb3VzIGNhbGwgdG8gdGhlIGBnZXRgIGhvc3QgaG9vay5cblxuICBJbiBnZW5lcmFsLCB0aGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiBgaW5saW5lYCBzaG91bGQgd29ya1xuICBmb3IgbW9zdCBob3N0IGVudmlyb25tZW50cy4gSXQgZGVsZWdhdGVzIHRvIG90aGVyIGhvc3QgaG9va3NcbiAgd2hlcmUgYXBwcm9wcmlhdGUsIGFuZCBwcm9wZXJseSBpbnZva2VzIHRoZSBoZWxwZXIgd2l0aCB0aGVcbiAgYXBwcm9wcmlhdGUgYXJndW1lbnRzLlxuXG4gIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mIGBpbmxpbmVgIGFsc28gbWFrZXMgYHBhcnRpYWxgXG4gIGEga2V5d29yZC4gSW5zdGVhZCBvZiBpbnZva2luZyBhIGhlbHBlciBuYW1lZCBgcGFydGlhbGAsXG4gIGl0IGludm9rZXMgdGhlIGBwYXJ0aWFsYCBob3N0IGhvb2suXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlubGluZShtb3JwaCwgZW52LCBzY29wZSwgcGF0aCwgcGFyYW1zLCBoYXNoLCB2aXNpdG9yKSB7XG4gIGlmIChoYW5kbGVSZWRpcmVjdChtb3JwaCwgZW52LCBzY29wZSwgcGF0aCwgcGFyYW1zLCBoYXNoLCBudWxsLCBudWxsLCB2aXNpdG9yKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB2YWx1ZSwgaGFzVmFsdWU7XG4gIGlmIChtb3JwaC5saW5rZWRSZXN1bHQpIHtcbiAgICB2YWx1ZSA9IGVudi5ob29rcy5nZXRWYWx1ZShtb3JwaC5saW5rZWRSZXN1bHQpO1xuICAgIGhhc1ZhbHVlID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnNGb3IobnVsbCwgbnVsbCwgZW52LCBzY29wZSwgbW9ycGgpO1xuXG4gICAgdmFyIGhlbHBlciA9IGVudi5ob29rcy5sb29rdXBIZWxwZXIoZW52LCBzY29wZSwgcGF0aCk7XG4gICAgdmFyIHJlc3VsdCA9IGVudi5ob29rcy5pbnZva2VIZWxwZXIobW9ycGgsIGVudiwgc2NvcGUsIHZpc2l0b3IsIHBhcmFtcywgaGFzaCwgaGVscGVyLCBvcHRpb25zLnRlbXBsYXRlcywgdGhpc0ZvcihvcHRpb25zLnRlbXBsYXRlcykpO1xuXG4gICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGluaykge1xuICAgICAgbW9ycGgubGlua2VkUmVzdWx0ID0gcmVzdWx0LnZhbHVlO1xuICAgICAgbGlua1BhcmFtcyhlbnYsIHNjb3BlLCBtb3JwaCwgJ0Bjb250ZW50LWhlbHBlcicsIFttb3JwaC5saW5rZWRSZXN1bHRdLCBudWxsKTtcbiAgICB9XG5cbiAgICBpZiAocmVzdWx0ICYmICd2YWx1ZScgaW4gcmVzdWx0KSB7XG4gICAgICB2YWx1ZSA9IGVudi5ob29rcy5nZXRWYWx1ZShyZXN1bHQudmFsdWUpO1xuICAgICAgaGFzVmFsdWUgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChoYXNWYWx1ZSkge1xuICAgIGlmIChtb3JwaC5sYXN0VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICBtb3JwaC5zZXRDb250ZW50KHZhbHVlKTtcbiAgICB9XG4gICAgbW9ycGgubGFzdFZhbHVlID0gdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtleXdvcmQocGF0aCwgbW9ycGgsIGVudiwgc2NvcGUsIHBhcmFtcywgaGFzaCwgdGVtcGxhdGUsIGludmVyc2UsIHZpc2l0b3IpICB7XG4gIGhhbmRsZUtleXdvcmQocGF0aCwgbW9ycGgsIGVudiwgc2NvcGUsIHBhcmFtcywgaGFzaCwgdGVtcGxhdGUsIGludmVyc2UsIHZpc2l0b3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlSGVscGVyKG1vcnBoLCBlbnYsIHNjb3BlLCB2aXNpdG9yLCBfcGFyYW1zLCBfaGFzaCwgaGVscGVyLCB0ZW1wbGF0ZXMsIGNvbnRleHQpIHtcbiAgdmFyIHBhcmFtcyA9IG5vcm1hbGl6ZUFycmF5KGVudiwgX3BhcmFtcyk7XG4gIHZhciBoYXNoID0gbm9ybWFsaXplT2JqZWN0KGVudiwgX2hhc2gpO1xuICByZXR1cm4geyB2YWx1ZTogaGVscGVyLmNhbGwoY29udGV4dCwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZXMpIH07XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KGVudiwgYXJyYXkpIHtcbiAgdmFyIG91dCA9IG5ldyBBcnJheShhcnJheS5sZW5ndGgpO1xuXG4gIGZvciAodmFyIGk9MCwgbD1hcnJheS5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgb3V0W2ldID0gZW52Lmhvb2tzLmdldENlbGxPclZhbHVlKGFycmF5W2ldKTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU9iamVjdChlbnYsIG9iamVjdCkge1xuICB2YXIgb3V0ID0ge307XG5cbiAgZm9yICh2YXIgcHJvcCBpbiBvYmplY3QpICB7XG4gICAgb3V0W3Byb3BdID0gZW52Lmhvb2tzLmdldENlbGxPclZhbHVlKG9iamVjdFtwcm9wXSk7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnkoLyogZW52LCBzY29wZSwgcGF0aCAqLykge1xuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IHZhciBrZXl3b3JkcyA9IHtcbiAgcGFydGlhbDogZnVuY3Rpb24obW9ycGgsIGVudiwgc2NvcGUsIHBhcmFtcykge1xuICAgIHZhciB2YWx1ZSA9IGVudi5ob29rcy5wYXJ0aWFsKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXJhbXNbMF0pO1xuICAgIG1vcnBoLnNldENvbnRlbnQodmFsdWUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIHlpZWxkOiBmdW5jdGlvbihtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZSwgaW52ZXJzZSwgdmlzaXRvcikge1xuICAgIC8vIHRoZSBjdXJyZW50IHNjb3BlIGlzIHByb3ZpZGVkIHB1cmVseSBmb3IgdGhlIGNyZWF0aW9uIG9mIHNoYWRvd1xuICAgIC8vIHNjb3BlczsgaXQgc2hvdWxkIG5vdCBiZSBwcm92aWRlZCB0byB1c2VyIGNvZGUuXG5cbiAgICB2YXIgdG8gPSBlbnYuaG9va3MuZ2V0VmFsdWUoaGFzaC50bykgfHwgJ2RlZmF1bHQnO1xuICAgIGlmIChzY29wZS5ibG9ja3NbdG9dKSB7XG4gICAgICBzY29wZS5ibG9ja3NbdG9dKGVudiwgcGFyYW1zLCBoYXNoLnNlbGYsIG1vcnBoLCBzY29wZSwgdmlzaXRvcik7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGhhc0Jsb2NrOiBmdW5jdGlvbihtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zKSB7XG4gICAgdmFyIG5hbWUgPSBlbnYuaG9va3MuZ2V0VmFsdWUocGFyYW1zWzBdKSB8fCAnZGVmYXVsdCc7XG4gICAgcmV0dXJuICEhc2NvcGUuYmxvY2tzW25hbWVdO1xuICB9LFxuXG4gIGhhc0Jsb2NrUGFyYW1zOiBmdW5jdGlvbihtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zKSB7XG4gICAgdmFyIG5hbWUgPSBlbnYuaG9va3MuZ2V0VmFsdWUocGFyYW1zWzBdKSB8fCAnZGVmYXVsdCc7XG4gICAgcmV0dXJuICEhKHNjb3BlLmJsb2Nrc1tuYW1lXSAmJiBzY29wZS5ibG9ja3NbbmFtZV0uYXJpdHkpO1xuICB9XG5cbn07XG5cbi8qKlxuICBIb3N0IEhvb2s6IHBhcnRpYWxcblxuICBAcGFyYW0ge1JlbmRlck5vZGV9IHJlbmRlck5vZGVcbiAgQHBhcmFtIHtFbnZpcm9ubWVudH0gZW52XG4gIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG5cbiAgQ29ycmVzcG9uZHMgdG86XG5cbiAgYGBgaGJzXG4gIHt7cGFydGlhbCBcImxvY2F0aW9uXCJ9fVxuICBgYGBcblxuICBUaGlzIGhvc3QgaG9vayBpcyBpbnZva2VkIGJ5IHRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mXG4gIHRoZSBgaW5saW5lYCBob29rLiBUaGlzIG1ha2VzIGBwYXJ0aWFsYCBhIGtleXdvcmQgaW4gYW5cbiAgSFRNTEJhcnMgZW52aXJvbm1lbnQgdXNpbmcgdGhlIGRlZmF1bHQgYGlubGluZWAgaG9zdCBob29rLlxuXG4gIEl0IGlzIGltcGxlbWVudGVkIGFzIGEgaG9zdCBob29rIHNvIHRoYXQgaXQgY2FuIHJldHJpZXZlXG4gIHRoZSBuYW1lZCBwYXJ0aWFsIG91dCBvZiB0aGUgYEVudmlyb25tZW50YC4gSGVscGVycywgaW5cbiAgY29udHJhc3QsIG9ubHkgaGF2ZSBhY2Nlc3MgdG8gdGhlIHZhbHVlcyBwYXNzZWQgaW4gdG8gdGhlbSxcbiAgYW5kIG5vdCB0byB0aGUgYW1iaWVudCBsZXhpY2FsIGVudmlyb25tZW50LlxuXG4gIFRoZSBob3N0IGhvb2sgc2hvdWxkIGludm9rZSB0aGUgcmVmZXJlbmNlZCBwYXJ0aWFsIHdpdGhcbiAgdGhlIGFtYmllbnQgYHNlbGZgLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJ0aWFsKHJlbmRlck5vZGUsIGVudiwgc2NvcGUsIHBhdGgpIHtcbiAgdmFyIHRlbXBsYXRlID0gZW52LnBhcnRpYWxzW3BhdGhdO1xuICByZXR1cm4gdGVtcGxhdGUucmVuZGVyKHNjb3BlLnNlbGYsIGVudiwge30pLmZyYWdtZW50O1xufVxuXG4vKipcbiAgSG9zdCBob29rOiByYW5nZVxuXG4gIEBwYXJhbSB7UmVuZGVyTm9kZX0gcmVuZGVyTm9kZVxuICBAcGFyYW0ge0Vudmlyb25tZW50fSBlbnZcbiAgQHBhcmFtIHtTY29wZX0gc2NvcGVcbiAgQHBhcmFtIHthbnl9IHZhbHVlXG5cbiAgQ29ycmVzcG9uZHMgdG86XG5cbiAgYGBgaGJzXG4gIHt7Y29udGVudH19XG4gIHt7e3VuZXNjYXBlZH19fVxuICBgYGBcblxuICBUaGlzIGhvb2sgaXMgcmVzcG9uc2libGUgZm9yIHVwZGF0aW5nIGEgcmVuZGVyIG5vZGVcbiAgdGhhdCByZXByZXNlbnRzIGEgcmFuZ2Ugb2YgY29udGVudCB3aXRoIGEgdmFsdWUuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmdlKG1vcnBoLCBlbnYsIHNjb3BlLCBwYXRoLCB2YWx1ZSwgdmlzaXRvcikge1xuICBpZiAoaGFuZGxlUmVkaXJlY3QobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIFt2YWx1ZV0sIHt9LCBudWxsLCBudWxsLCB2aXNpdG9yKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhbHVlID0gZW52Lmhvb2tzLmdldFZhbHVlKHZhbHVlKTtcblxuICBpZiAobW9ycGgubGFzdFZhbHVlICE9PSB2YWx1ZSkge1xuICAgIG1vcnBoLnNldENvbnRlbnQodmFsdWUpO1xuICB9XG5cbiAgbW9ycGgubGFzdFZhbHVlID0gdmFsdWU7XG59XG5cbi8qKlxuICBIb3N0IGhvb2s6IGVsZW1lbnRcblxuICBAcGFyYW0ge1JlbmRlck5vZGV9IHJlbmRlck5vZGVcbiAgQHBhcmFtIHtFbnZpcm9ubWVudH0gZW52XG4gIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gIEBwYXJhbSB7QXJyYXl9IHBhcmFtc1xuICBAcGFyYW0ge0hhc2h9IGhhc2hcblxuICBDb3JyZXNwb25kcyB0bzpcblxuICBgYGBoYnNcbiAgPGRpdiB7e2JpbmQtYXR0ciBmb289YmFyfX0+PC9kaXY+XG4gIGBgYFxuXG4gIFRoaXMgaG9vayBpcyByZXNwb25zaWJsZSBmb3IgaW52b2tpbmcgYSBoZWxwZXIgdGhhdFxuICBtb2RpZmllcyBhbiBlbGVtZW50LlxuXG4gIEl0cyBwdXJwb3NlIGlzIGxhcmdlbHkgbGVnYWN5IHN1cHBvcnQgZm9yIGF3a3dhcmRcbiAgaWRpb21zIHRoYXQgYmVjYW1lIGNvbW1vbiB3aGVuIHVzaW5nIHRoZSBzdHJpbmctYmFzZWRcbiAgSGFuZGxlYmFycyBlbmdpbmUuXG5cbiAgTW9zdCBvZiB0aGUgdXNlcyBvZiB0aGUgYGVsZW1lbnRgIGhvb2sgYXJlIGV4cGVjdGVkXG4gIHRvIGJlIHN1cGVyc2VkZWQgYnkgY29tcG9uZW50IHN5bnRheCBhbmQgdGhlXG4gIGBhdHRyaWJ1dGVgIGhvb2suXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGVsZW1lbnQobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgdmlzaXRvcikge1xuICBpZiAoaGFuZGxlUmVkaXJlY3QobW9ycGgsIGVudiwgc2NvcGUsIHBhdGgsIHBhcmFtcywgaGFzaCwgbnVsbCwgbnVsbCwgdmlzaXRvcikpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaGVscGVyID0gZW52Lmhvb2tzLmxvb2t1cEhlbHBlcihlbnYsIHNjb3BlLCBwYXRoKTtcbiAgaWYgKGhlbHBlcikge1xuICAgIGVudi5ob29rcy5pbnZva2VIZWxwZXIobnVsbCwgZW52LCBzY29wZSwgbnVsbCwgcGFyYW1zLCBoYXNoLCBoZWxwZXIsIHsgZWxlbWVudDogbW9ycGguZWxlbWVudCB9KTtcbiAgfVxufVxuXG4vKipcbiAgSG9zdCBob29rOiBhdHRyaWJ1dGVcblxuICBAcGFyYW0ge1JlbmRlck5vZGV9IHJlbmRlck5vZGVcbiAgQHBhcmFtIHtFbnZpcm9ubWVudH0gZW52XG4gIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gIEBwYXJhbSB7YW55fSB2YWx1ZVxuXG4gIENvcnJlc3BvbmRzIHRvOlxuXG4gIGBgYGhic1xuICA8ZGl2IGZvbz17e2Jhcn19PjwvZGl2PlxuICBgYGBcblxuICBUaGlzIGhvb2sgaXMgcmVzcG9uc2libGUgZm9yIHVwZGF0aW5nIGEgcmVuZGVyIG5vZGVcbiAgdGhhdCByZXByZXNlbnRzIGFuIGVsZW1lbnQncyBhdHRyaWJ1dGUgd2l0aCBhIHZhbHVlLlxuXG4gIEl0IHJlY2VpdmVzIHRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgYXMgd2VsbCBhcyBhblxuICBhbHJlYWR5LXJlc29sdmVkIHZhbHVlLCBhbmQgc2hvdWxkIHVwZGF0ZSB0aGUgcmVuZGVyXG4gIG5vZGUgd2l0aCB0aGUgdmFsdWUgaWYgYXBwcm9wcmlhdGUuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGF0dHJpYnV0ZShtb3JwaCwgZW52LCBzY29wZSwgbmFtZSwgdmFsdWUpIHtcbiAgdmFsdWUgPSBlbnYuaG9va3MuZ2V0VmFsdWUodmFsdWUpO1xuXG4gIGlmIChtb3JwaC5sYXN0VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgbW9ycGguc2V0Q29udGVudCh2YWx1ZSk7XG4gIH1cblxuICBtb3JwaC5sYXN0VmFsdWUgPSB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1YmV4cHIoZW52LCBzY29wZSwgaGVscGVyTmFtZSwgcGFyYW1zLCBoYXNoKSB7XG4gIHZhciBoZWxwZXIgPSBlbnYuaG9va3MubG9va3VwSGVscGVyKGVudiwgc2NvcGUsIGhlbHBlck5hbWUpO1xuICB2YXIgcmVzdWx0ID0gZW52Lmhvb2tzLmludm9rZUhlbHBlcihudWxsLCBlbnYsIHNjb3BlLCBudWxsLCBwYXJhbXMsIGhhc2gsIGhlbHBlciwge30pO1xuICBpZiAocmVzdWx0ICYmICd2YWx1ZScgaW4gcmVzdWx0KSB7IHJldHVybiBlbnYuaG9va3MuZ2V0VmFsdWUocmVzdWx0LnZhbHVlKTsgfVxufVxuXG4vKipcbiAgSG9zdCBIb29rOiBnZXRcblxuICBAcGFyYW0ge0Vudmlyb25tZW50fSBlbnZcbiAgQHBhcmFtIHtTY29wZX0gc2NvcGVcbiAgQHBhcmFtIHtTdHJpbmd9IHBhdGhcblxuICBDb3JyZXNwb25kcyB0bzpcblxuICBgYGBoYnNcbiAge3tmb28uYmFyfX1cbiAgICBeXG5cbiAge3toZWxwZXIgZm9vLmJhciBrZXk9dmFsdWV9fVxuICAgICAgICAgICBeICAgICAgICAgICBeXG4gIGBgYFxuXG4gIFRoaXMgaG9vayBpcyB0aGUgXCJsZWFmXCIgaG9vayBvZiB0aGUgc3lzdGVtLiBJdCBpcyB1c2VkIHRvXG4gIHJlc29sdmUgYSBwYXRoIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50IHNjb3BlLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXQoZW52LCBzY29wZSwgcGF0aCkge1xuICBpZiAocGF0aCA9PT0gJycpIHtcbiAgICByZXR1cm4gc2NvcGUuc2VsZjtcbiAgfVxuXG4gIHZhciBrZXlzID0gcGF0aC5zcGxpdCgnLicpO1xuICB2YXIgdmFsdWUgPSBlbnYuaG9va3MuZ2V0Um9vdChzY29wZSwga2V5c1swXSlbMF07XG5cbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IGVudi5ob29rcy5nZXRDaGlsZCh2YWx1ZSwga2V5c1tpXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJvb3Qoc2NvcGUsIGtleSkge1xuICBpZiAoc2NvcGUubG9jYWxQcmVzZW50W2tleV0pIHtcbiAgICByZXR1cm4gW3Njb3BlLmxvY2Fsc1trZXldXTtcbiAgfSBlbHNlIGlmIChzY29wZS5zZWxmKSB7XG4gICAgcmV0dXJuIFtzY29wZS5zZWxmW2tleV1dO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbdW5kZWZpbmVkXTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2hpbGQodmFsdWUsIGtleSkge1xuICByZXR1cm4gdmFsdWVba2V5XTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbHVlKHJlZmVyZW5jZSkge1xuICByZXR1cm4gcmVmZXJlbmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2VsbE9yVmFsdWUocmVmZXJlbmNlKSB7XG4gIHJldHVybiByZWZlcmVuY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnQobW9ycGgsIGVudiwgc2NvcGUsIHRhZ05hbWUsIHBhcmFtcywgYXR0cnMsIHRlbXBsYXRlcywgdmlzaXRvcikge1xuICBpZiAoZW52Lmhvb2tzLmhhc0hlbHBlcihlbnYsIHNjb3BlLCB0YWdOYW1lKSkge1xuICAgIHJldHVybiBlbnYuaG9va3MuYmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHRhZ05hbWUsIHBhcmFtcywgYXR0cnMsIHRlbXBsYXRlcy5kZWZhdWx0LCB0ZW1wbGF0ZXMuaW52ZXJzZSwgdmlzaXRvcik7XG4gIH1cblxuICBjb21wb25lbnRGYWxsYmFjayhtb3JwaCwgZW52LCBzY29wZSwgdGFnTmFtZSwgYXR0cnMsIHRlbXBsYXRlcy5kZWZhdWx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdChlbnYsIHBhcmFtcykge1xuICB2YXIgdmFsdWUgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHBhcmFtcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB2YWx1ZSArPSBlbnYuaG9va3MuZ2V0VmFsdWUocGFyYW1zW2ldKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudEZhbGxiYWNrKG1vcnBoLCBlbnYsIHNjb3BlLCB0YWdOYW1lLCBhdHRycywgdGVtcGxhdGUpIHtcbiAgdmFyIGVsZW1lbnQgPSBlbnYuZG9tLmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gIGZvciAodmFyIG5hbWUgaW4gYXR0cnMpIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCBlbnYuaG9va3MuZ2V0VmFsdWUoYXR0cnNbbmFtZV0pKTtcbiAgfVxuICB2YXIgZnJhZ21lbnQgPSByZW5kZXIodGVtcGxhdGUsIGVudiwgc2NvcGUsIHt9KS5mcmFnbWVudDtcbiAgZWxlbWVudC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gIG1vcnBoLnNldE5vZGUoZWxlbWVudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNIZWxwZXIoZW52LCBzY29wZSwgaGVscGVyTmFtZSkge1xuICByZXR1cm4gZW52LmhlbHBlcnNbaGVscGVyTmFtZV0gIT09IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvb2t1cEhlbHBlcihlbnYsIHNjb3BlLCBoZWxwZXJOYW1lKSB7XG4gIHJldHVybiBlbnYuaGVscGVyc1toZWxwZXJOYW1lXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRTY29wZSgvKiBlbnYsIHNjb3BlICovKSB7XG4gIC8vIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBoYW5kbGUgaG9zdC1zcGVjaWZpZWQgZXh0ZW5zaW9ucyB0byBzY29wZVxuICAvLyBvdGhlciB0aGFuIGBzZWxmYCwgYGxvY2Fsc2AgYW5kIGBibG9ja2AuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTY29wZShlbnYsIHNjb3BlKSB7XG4gIGVudi5ob29rcy5iaW5kU2NvcGUoZW52LCBzY29wZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLy8gZnVuZGFtZW50YWwgaG9va3MgdGhhdCB5b3Ugd2lsbCBsaWtlbHkgd2FudCB0byBvdmVycmlkZVxuICBiaW5kTG9jYWw6IGJpbmRMb2NhbCxcbiAgYmluZFNlbGY6IGJpbmRTZWxmLFxuICBiaW5kU2NvcGU6IGJpbmRTY29wZSxcbiAgY2xhc3NpZnk6IGNsYXNzaWZ5LFxuICBjb21wb25lbnQ6IGNvbXBvbmVudCxcbiAgY29uY2F0OiBjb25jYXQsXG4gIGNyZWF0ZUZyZXNoU2NvcGU6IGNyZWF0ZUZyZXNoU2NvcGUsXG4gIGdldENoaWxkOiBnZXRDaGlsZCxcbiAgZ2V0Um9vdDogZ2V0Um9vdCxcbiAgZ2V0VmFsdWU6IGdldFZhbHVlLFxuICBnZXRDZWxsT3JWYWx1ZTogZ2V0Q2VsbE9yVmFsdWUsXG4gIGtleXdvcmRzOiBrZXl3b3JkcyxcbiAgbGlua1JlbmRlck5vZGU6IGxpbmtSZW5kZXJOb2RlLFxuICBwYXJ0aWFsOiBwYXJ0aWFsLFxuICBzdWJleHByOiBzdWJleHByLFxuXG4gIC8vIGZ1bmRhbWVudGFsIGhvb2tzIHdpdGggZ29vZCBkZWZhdWx0IGJlaGF2aW9yXG4gIGJpbmRCbG9jazogYmluZEJsb2NrLFxuICBiaW5kU2hhZG93U2NvcGU6IGJpbmRTaGFkb3dTY29wZSxcbiAgdXBkYXRlTG9jYWw6IHVwZGF0ZUxvY2FsLFxuICB1cGRhdGVTZWxmOiB1cGRhdGVTZWxmLFxuICB1cGRhdGVTY29wZTogdXBkYXRlU2NvcGUsXG4gIGNyZWF0ZUNoaWxkU2NvcGU6IGNyZWF0ZUNoaWxkU2NvcGUsXG4gIGhhc0hlbHBlcjogaGFzSGVscGVyLFxuICBsb29rdXBIZWxwZXI6IGxvb2t1cEhlbHBlcixcbiAgaW52b2tlSGVscGVyOiBpbnZva2VIZWxwZXIsXG4gIGNsZWFudXBSZW5kZXJOb2RlOiBudWxsLFxuICBkZXN0cm95UmVuZGVyTm9kZTogbnVsbCxcbiAgd2lsbENsZWFudXBUcmVlOiBudWxsLFxuICBkaWRDbGVhbnVwVHJlZTogbnVsbCxcbiAgd2lsbFJlbmRlck5vZGU6IG51bGwsXG4gIGRpZFJlbmRlck5vZGU6IG51bGwsXG5cbiAgLy8gZGVyaXZlZCBob29rc1xuICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZSxcbiAgYmxvY2s6IGJsb2NrLFxuICBjcmVhdGVTY29wZTogY3JlYXRlU2NvcGUsXG4gIGVsZW1lbnQ6IGVsZW1lbnQsXG4gIGdldDogZ2V0LFxuICBpbmxpbmU6IGlubGluZSxcbiAgcmFuZ2U6IHJhbmdlLFxuICBrZXl3b3JkOiBrZXl3b3JkXG59O1xuIl19
define("htmlbars-runtime/morph", ["exports", "../morph-range"], function (exports, _morphRange) {

  var guid = 1;

  function HTMLBarsMorph(domHelper, contextualElement) {
    this.super$constructor(domHelper, contextualElement);

    this.state = {};
    this.ownerNode = null;
    this.isDirty = false;
    this.isSubtreeDirty = false;
    this.lastYielded = null;
    this.lastResult = null;
    this.lastValue = null;
    this.buildChildEnv = null;
    this.morphList = null;
    this.morphMap = null;
    this.key = null;
    this.linkedParams = null;
    this.linkedResult = null;
    this.childNodes = null;
    this.rendered = false;
    this.guid = "range" + guid++;
  }

  HTMLBarsMorph.empty = function (domHelper, contextualElement) {
    var morph = new HTMLBarsMorph(domHelper, contextualElement);
    morph.clear();
    return morph;
  };

  HTMLBarsMorph.create = function (domHelper, contextualElement, node) {
    var morph = new HTMLBarsMorph(domHelper, contextualElement);
    morph.setNode(node);
    return morph;
  };

  HTMLBarsMorph.attach = function (domHelper, contextualElement, firstNode, lastNode) {
    var morph = new HTMLBarsMorph(domHelper, contextualElement);
    morph.setRange(firstNode, lastNode);
    return morph;
  };

  var prototype = HTMLBarsMorph.prototype = Object.create(_morphRange.default.prototype);
  prototype.constructor = HTMLBarsMorph;
  prototype.super$constructor = _morphRange.default;

  exports.default = HTMLBarsMorph;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUvbW9ycGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxNQUFJLElBQUksR0FBRyxDQUFDLENBQUM7O0FBRWIsV0FBUyxhQUFhLENBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUFFO0FBQ25ELFFBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzs7QUFFckQsUUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsUUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFDNUIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDckIsUUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFDaEIsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDekIsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDekIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDdEIsUUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLEdBQUcsSUFBSSxFQUFFLENBQUM7R0FDOUI7O0FBRUQsZUFBYSxDQUFDLEtBQUssR0FBRyxVQUFTLFNBQVMsRUFBRSxpQkFBaUIsRUFBRTtBQUMzRCxRQUFJLEtBQUssR0FBRyxJQUFJLGFBQWEsQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUM1RCxTQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZCxXQUFPLEtBQUssQ0FBQztHQUNkLENBQUM7O0FBRUYsZUFBYSxDQUFDLE1BQU0sR0FBRyxVQUFVLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUU7QUFDbkUsUUFBSSxLQUFLLEdBQUcsSUFBSSxhQUFhLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFDNUQsU0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQixXQUFPLEtBQUssQ0FBQztHQUNkLENBQUM7O0FBRUYsZUFBYSxDQUFDLE1BQU0sR0FBRyxVQUFVLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQ2xGLFFBQUksS0FBSyxHQUFHLElBQUksYUFBYSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVELFNBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3BDLFdBQU8sS0FBSyxDQUFDO0dBQ2QsQ0FBQzs7QUFFRixNQUFJLFNBQVMsR0FBRyxhQUFhLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQVUsU0FBUyxDQUFDLENBQUM7QUFDN0UsV0FBUyxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUM7QUFDdEMsV0FBUyxDQUFDLGlCQUFpQixzQkFBWSxDQUFDOztvQkFFekIsYUFBYSIsImZpbGUiOiJodG1sYmFycy1ydW50aW1lL21vcnBoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1vcnBoQmFzZSBmcm9tIFwiLi4vbW9ycGgtcmFuZ2VcIjtcblxudmFyIGd1aWQgPSAxO1xuXG5mdW5jdGlvbiBIVE1MQmFyc01vcnBoKGRvbUhlbHBlciwgY29udGV4dHVhbEVsZW1lbnQpIHtcbiAgdGhpcy5zdXBlciRjb25zdHJ1Y3Rvcihkb21IZWxwZXIsIGNvbnRleHR1YWxFbGVtZW50KTtcblxuICB0aGlzLnN0YXRlID0ge307XG4gIHRoaXMub3duZXJOb2RlID0gbnVsbDtcbiAgdGhpcy5pc0RpcnR5ID0gZmFsc2U7XG4gIHRoaXMuaXNTdWJ0cmVlRGlydHkgPSBmYWxzZTtcbiAgdGhpcy5sYXN0WWllbGRlZCA9IG51bGw7XG4gIHRoaXMubGFzdFJlc3VsdCA9IG51bGw7XG4gIHRoaXMubGFzdFZhbHVlID0gbnVsbDtcbiAgdGhpcy5idWlsZENoaWxkRW52ID0gbnVsbDtcbiAgdGhpcy5tb3JwaExpc3QgPSBudWxsO1xuICB0aGlzLm1vcnBoTWFwID0gbnVsbDtcbiAgdGhpcy5rZXkgPSBudWxsO1xuICB0aGlzLmxpbmtlZFBhcmFtcyA9IG51bGw7XG4gIHRoaXMubGlua2VkUmVzdWx0ID0gbnVsbDtcbiAgdGhpcy5jaGlsZE5vZGVzID0gbnVsbDtcbiAgdGhpcy5yZW5kZXJlZCA9IGZhbHNlO1xuICB0aGlzLmd1aWQgPSBcInJhbmdlXCIgKyBndWlkKys7XG59XG5cbkhUTUxCYXJzTW9ycGguZW1wdHkgPSBmdW5jdGlvbihkb21IZWxwZXIsIGNvbnRleHR1YWxFbGVtZW50KSB7XG4gIHZhciBtb3JwaCA9IG5ldyBIVE1MQmFyc01vcnBoKGRvbUhlbHBlciwgY29udGV4dHVhbEVsZW1lbnQpO1xuICBtb3JwaC5jbGVhcigpO1xuICByZXR1cm4gbW9ycGg7XG59O1xuXG5IVE1MQmFyc01vcnBoLmNyZWF0ZSA9IGZ1bmN0aW9uIChkb21IZWxwZXIsIGNvbnRleHR1YWxFbGVtZW50LCBub2RlKSB7XG4gIHZhciBtb3JwaCA9IG5ldyBIVE1MQmFyc01vcnBoKGRvbUhlbHBlciwgY29udGV4dHVhbEVsZW1lbnQpO1xuICBtb3JwaC5zZXROb2RlKG5vZGUpO1xuICByZXR1cm4gbW9ycGg7XG59O1xuXG5IVE1MQmFyc01vcnBoLmF0dGFjaCA9IGZ1bmN0aW9uIChkb21IZWxwZXIsIGNvbnRleHR1YWxFbGVtZW50LCBmaXJzdE5vZGUsIGxhc3ROb2RlKSB7XG4gIHZhciBtb3JwaCA9IG5ldyBIVE1MQmFyc01vcnBoKGRvbUhlbHBlciwgY29udGV4dHVhbEVsZW1lbnQpO1xuICBtb3JwaC5zZXRSYW5nZShmaXJzdE5vZGUsIGxhc3ROb2RlKTtcbiAgcmV0dXJuIG1vcnBoO1xufTtcblxudmFyIHByb3RvdHlwZSA9IEhUTUxCYXJzTW9ycGgucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNb3JwaEJhc2UucHJvdG90eXBlKTtcbnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhUTUxCYXJzTW9ycGg7XG5wcm90b3R5cGUuc3VwZXIkY29uc3RydWN0b3IgPSBNb3JwaEJhc2U7XG5cbmV4cG9ydCBkZWZhdWx0IEhUTUxCYXJzTW9ycGg7XG4iXX0=
define("htmlbars-runtime/render", ["exports", "../htmlbars-util/array-utils", "../htmlbars-util/morph-utils", "./expression-visitor", "./morph", "../htmlbars-util/template-utils", "../htmlbars-util/void-tag-names"], function (exports, _htmlbarsUtilArrayUtils, _htmlbarsUtilMorphUtils, _expressionVisitor, _morph, _htmlbarsUtilTemplateUtils, _htmlbarsUtilVoidTagNames) {
  exports.default = render;
  exports.manualElement = manualElement;
  exports.attachAttributes = attachAttributes;
  exports.createChildMorph = createChildMorph;
  exports.getCachedFragment = getCachedFragment;

  var svgNamespace = "http://www.w3.org/2000/svg";

  function render(template, env, scope, options) {
    var dom = env.dom;
    var contextualElement;

    if (options) {
      if (options.renderNode) {
        contextualElement = options.renderNode.contextualElement;
      } else if (options.contextualElement) {
        contextualElement = options.contextualElement;
      }
    }

    dom.detectNamespace(contextualElement);

    var renderResult = RenderResult.build(env, scope, template, options, contextualElement);
    renderResult.render();

    return renderResult;
  }

  function RenderResult(env, scope, options, rootNode, ownerNode, nodes, fragment, template, shouldSetContent) {
    this.root = rootNode;
    this.fragment = fragment;

    this.nodes = nodes;
    this.template = template;
    this.statements = template.statements.slice();
    this.env = env;
    this.scope = scope;
    this.shouldSetContent = shouldSetContent;

    this.bindScope();

    if (options.attributes !== undefined) {
      nodes.push({ state: {} });
      this.statements.push(['attributes', attachAttributes(options.attributes)]);
    }

    if (options.self !== undefined) {
      this.bindSelf(options.self);
    }
    if (options.blockArguments !== undefined) {
      this.bindLocals(options.blockArguments);
    }

    this.initializeNodes(ownerNode);
  }

  RenderResult.build = function (env, scope, template, options, contextualElement) {
    var dom = env.dom;
    var fragment = getCachedFragment(template, env);
    var nodes = template.buildRenderNodes(dom, fragment, contextualElement);

    var rootNode, ownerNode, shouldSetContent;

    if (options && options.renderNode) {
      rootNode = options.renderNode;
      ownerNode = rootNode.ownerNode;
      shouldSetContent = true;
    } else {
      rootNode = dom.createMorph(null, fragment.firstChild, fragment.lastChild, contextualElement);
      ownerNode = rootNode;
      initializeNode(rootNode, ownerNode);
      shouldSetContent = false;
    }

    if (rootNode.childNodes) {
      _htmlbarsUtilMorphUtils.visitChildren(rootNode.childNodes, function (node) {
        _htmlbarsUtilTemplateUtils.clearMorph(node, env, true);
      });
    }

    rootNode.childNodes = nodes;
    return new RenderResult(env, scope, options, rootNode, ownerNode, nodes, fragment, template, shouldSetContent);
  };

  function manualElement(tagName, attributes) {
    var statements = [];

    for (var key in attributes) {
      if (typeof attributes[key] === 'string') {
        continue;
      }
      statements.push(["attribute", key, attributes[key]]);
    }

    statements.push(['content', 'yield']);

    var template = {
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        if (tagName === 'svg') {
          dom.setNamespace(svgNamespace);
        }
        var el1 = dom.createElement(tagName);

        for (var key in attributes) {
          if (typeof attributes[key] !== 'string') {
            continue;
          }
          dom.setAttribute(el1, key, attributes[key]);
        }

        if (!_htmlbarsUtilVoidTagNames.default[tagName]) {
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
        }

        dom.appendChild(el0, el1);

        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment) {
        var element = dom.childAt(fragment, [0]);
        var morphs = [];

        for (var key in attributes) {
          if (typeof attributes[key] === 'string') {
            continue;
          }
          morphs.push(dom.createAttrMorph(element, key));
        }

        morphs.push(dom.createMorphAt(element, 0, 0));
        return morphs;
      },
      statements: statements,
      locals: [],
      templates: []
    };

    return template;
  }

  function attachAttributes(attributes) {
    var statements = [];

    for (var key in attributes) {
      if (typeof attributes[key] === 'string') {
        continue;
      }
      statements.push(["attribute", key, attributes[key]]);
    }

    var template = {
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = this.element;
        if (el0.namespaceURI === "http://www.w3.org/2000/svg") {
          dom.setNamespace(svgNamespace);
        }
        for (var key in attributes) {
          if (typeof attributes[key] !== 'string') {
            continue;
          }
          dom.setAttribute(el0, key, attributes[key]);
        }

        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom) {
        var element = this.element;
        var morphs = [];

        for (var key in attributes) {
          if (typeof attributes[key] === 'string') {
            continue;
          }
          morphs.push(dom.createAttrMorph(element, key));
        }

        return morphs;
      },
      statements: statements,
      locals: [],
      templates: [],
      element: null
    };

    return template;
  }

  RenderResult.prototype.initializeNodes = function (ownerNode) {
    _htmlbarsUtilArrayUtils.forEach(this.root.childNodes, function (node) {
      initializeNode(node, ownerNode);
    });
  };

  RenderResult.prototype.render = function () {
    this.root.lastResult = this;
    this.root.rendered = true;
    this.populateNodes(_expressionVisitor.AlwaysDirtyVisitor);

    if (this.shouldSetContent && this.root.setContent) {
      this.root.setContent(this.fragment);
    }
  };

  RenderResult.prototype.dirty = function () {
    _htmlbarsUtilMorphUtils.visitChildren([this.root], function (node) {
      node.isDirty = true;
    });
  };

  RenderResult.prototype.revalidate = function (env, self, blockArguments, scope) {
    this.revalidateWith(env, scope, self, blockArguments, _expressionVisitor.default);
  };

  RenderResult.prototype.rerender = function (env, self, blockArguments, scope) {
    this.revalidateWith(env, scope, self, blockArguments, _expressionVisitor.AlwaysDirtyVisitor);
  };

  RenderResult.prototype.revalidateWith = function (env, scope, self, blockArguments, visitor) {
    if (env !== undefined) {
      this.env = env;
    }
    if (scope !== undefined) {
      this.scope = scope;
    }
    this.updateScope();

    if (self !== undefined) {
      this.updateSelf(self);
    }
    if (blockArguments !== undefined) {
      this.updateLocals(blockArguments);
    }

    this.populateNodes(visitor);
  };

  RenderResult.prototype.destroy = function () {
    var rootNode = this.root;
    _htmlbarsUtilTemplateUtils.clearMorph(rootNode, this.env, true);
  };

  RenderResult.prototype.populateNodes = function (visitor) {
    var env = this.env;
    var scope = this.scope;
    var template = this.template;
    var nodes = this.nodes;
    var statements = this.statements;
    var i, l;

    for (i = 0, l = statements.length; i < l; i++) {
      var statement = statements[i];
      var morph = nodes[i];

      if (env.hooks.willRenderNode) {
        env.hooks.willRenderNode(morph, env, scope);
      }

      switch (statement[0]) {
        case 'block':
          visitor.block(statement, morph, env, scope, template, visitor);break;
        case 'inline':
          visitor.inline(statement, morph, env, scope, visitor);break;
        case 'content':
          visitor.content(statement, morph, env, scope, visitor);break;
        case 'element':
          visitor.element(statement, morph, env, scope, template, visitor);break;
        case 'attribute':
          visitor.attribute(statement, morph, env, scope);break;
        case 'component':
          visitor.component(statement, morph, env, scope, template, visitor);break;
        case 'attributes':
          visitor.attributes(statement, morph, env, scope, this.fragment, visitor);break;
      }

      if (env.hooks.didRenderNode) {
        env.hooks.didRenderNode(morph, env, scope);
      }
    }
  };

  RenderResult.prototype.bindScope = function () {
    this.env.hooks.bindScope(this.env, this.scope);
  };

  RenderResult.prototype.updateScope = function () {
    this.env.hooks.updateScope(this.env, this.scope);
  };

  RenderResult.prototype.bindSelf = function (self) {
    this.env.hooks.bindSelf(this.env, this.scope, self);
  };

  RenderResult.prototype.updateSelf = function (self) {
    this.env.hooks.updateSelf(this.env, this.scope, self);
  };

  RenderResult.prototype.bindLocals = function (blockArguments) {
    var localNames = this.template.locals;

    for (var i = 0, l = localNames.length; i < l; i++) {
      this.env.hooks.bindLocal(this.env, this.scope, localNames[i], blockArguments[i]);
    }
  };

  RenderResult.prototype.updateLocals = function (blockArguments) {
    var localNames = this.template.locals;

    for (var i = 0, l = localNames.length; i < l; i++) {
      this.env.hooks.updateLocal(this.env, this.scope, localNames[i], blockArguments[i]);
    }
  };

  function initializeNode(node, owner) {
    node.ownerNode = owner;
  }

  function createChildMorph(dom, parentMorph, contextualElement) {
    var morph = _morph.default.empty(dom, contextualElement || parentMorph.contextualElement);
    initializeNode(morph, parentMorph.ownerNode);
    return morph;
  }

  function getCachedFragment(template, env) {
    var dom = env.dom,
        fragment;
    if (env.useFragmentCache && dom.canClone) {
      if (template.cachedFragment === null) {
        fragment = template.buildFragment(dom);
        if (template.hasRendered) {
          template.cachedFragment = fragment;
        } else {
          template.hasRendered = true;
        }
      }
      if (template.cachedFragment) {
        fragment = dom.cloneNode(template.cachedFragment, true);
      }
    } else if (!fragment) {
      fragment = template.buildFragment(dom);
    }

    return fragment;
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUvcmVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7b0JBVXdCLE1BQU07VUF3RWQsYUFBYSxHQUFiLGFBQWE7VUF1RGIsZ0JBQWdCLEdBQWhCLGdCQUFnQjtVQTRKaEIsZ0JBQWdCLEdBQWhCLGdCQUFnQjtVQU1oQixpQkFBaUIsR0FBakIsaUJBQWlCOztBQW5TakMsTUFBSSxZQUFZLEdBQUcsNEJBQTRCLENBQUM7O0FBRWpDLFdBQVMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUM1RCxRQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO0FBQ2xCLFFBQUksaUJBQWlCLENBQUM7O0FBRXRCLFFBQUksT0FBTyxFQUFFO0FBQ1gsVUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO0FBQ3RCLHlCQUFpQixHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUM7T0FDMUQsTUFBTSxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtBQUNwQyx5QkFBaUIsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUM7T0FDL0M7S0FDRjs7QUFFRCxPQUFHLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRXZDLFFBQUksWUFBWSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFDeEYsZ0JBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFFdEIsV0FBTyxZQUFZLENBQUM7R0FDckI7O0FBRUQsV0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRTtBQUMzRyxRQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztBQUNyQixR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QUFRLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDL0MsUUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNyRCxDQUFDOztBQUVGLGNBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ2pELFFBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDdkQsQ0FBQzs7QUFFRixjQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFTLGNBQWMsRUFBRTtBQUMzRCxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQzs7QUFFdEMsU0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQyxVQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsRjtHQUNGLENBQUM7O0FBRUYsY0FBWSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBUyxjQUFjLEVBQUU7QUFDN0QsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7O0FBRXRDLFNBQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0MsVUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEY7R0FDRixDQUFDOztBQUVGLFdBQVMsY0FBYyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDbkMsUUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7R0FDeEI7O0FBRU0sV0FBUyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFO0FBQ3BFLFFBQUksS0FBSyxHQUFHLGVBQU0sS0FBSyxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsSUFBSSxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNqRixrQkFBYyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDN0MsV0FBTyxLQUFLLENBQUM7R0FDZDs7QUFFTSxXQUFTLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7QUFDL0MsUUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUc7UUFBRSxRQUFRLENBQUM7QUFDNUIsUUFBSSxHQUFHLENBQUMsZ0JBQWdCLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTtBQUN4QyxVQUFJLFFBQVEsQ0FBQyxjQUFjLEtBQUssSUFBSSxFQUFFO0FBQ3BDLGdCQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QyxZQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUU7QUFDeEIsa0JBQVEsQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO1NBQ3BDLE1BQU07QUFDTCxrQkFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDN0I7T0FDRjtBQUNELFVBQUksUUFBUSxDQUFDLGNBQWMsRUFBRTtBQUMzQixnQkFBUSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUN6RDtLQUNGLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNwQixjQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN4Qzs7QUFFRCxXQUFPLFFBQVEsQ0FBQztHQUNqQiIsImZpbGUiOiJodG1sYmFycy1ydW50aW1lL3JlbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGZvckVhY2ggfSBmcm9tIFwiLi4vaHRtbGJhcnMtdXRpbC9hcnJheS11dGlsc1wiO1xuaW1wb3J0IHsgdmlzaXRDaGlsZHJlbiB9IGZyb20gXCIuLi9odG1sYmFycy11dGlsL21vcnBoLXV0aWxzXCI7XG5pbXBvcnQgRXhwcmVzc2lvblZpc2l0b3IgZnJvbSBcIi4vZXhwcmVzc2lvbi12aXNpdG9yXCI7XG5pbXBvcnQgeyBBbHdheXNEaXJ0eVZpc2l0b3IgfSBmcm9tIFwiLi9leHByZXNzaW9uLXZpc2l0b3JcIjtcbmltcG9ydCBNb3JwaCBmcm9tIFwiLi9tb3JwaFwiO1xuaW1wb3J0IHsgY2xlYXJNb3JwaCB9IGZyb20gXCIuLi9odG1sYmFycy11dGlsL3RlbXBsYXRlLXV0aWxzXCI7XG5pbXBvcnQgdm9pZE1hcCBmcm9tICcuLi9odG1sYmFycy11dGlsL3ZvaWQtdGFnLW5hbWVzJztcblxudmFyIHN2Z05hbWVzcGFjZSA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyKHRlbXBsYXRlLCBlbnYsIHNjb3BlLCBvcHRpb25zKSB7XG4gIHZhciBkb20gPSBlbnYuZG9tO1xuICB2YXIgY29udGV4dHVhbEVsZW1lbnQ7XG5cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5yZW5kZXJOb2RlKSB7XG4gICAgICBjb250ZXh0dWFsRWxlbWVudCA9IG9wdGlvbnMucmVuZGVyTm9kZS5jb250ZXh0dWFsRWxlbWVudDtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuY29udGV4dHVhbEVsZW1lbnQpIHtcbiAgICAgIGNvbnRleHR1YWxFbGVtZW50ID0gb3B0aW9ucy5jb250ZXh0dWFsRWxlbWVudDtcbiAgICB9XG4gIH1cblxuICBkb20uZGV0ZWN0TmFtZXNwYWNlKGNvbnRleHR1YWxFbGVtZW50KTtcblxuICB2YXIgcmVuZGVyUmVzdWx0ID0gUmVuZGVyUmVzdWx0LmJ1aWxkKGVudiwgc2NvcGUsIHRlbXBsYXRlLCBvcHRpb25zLCBjb250ZXh0dWFsRWxlbWVudCk7XG4gIHJlbmRlclJlc3VsdC5yZW5kZXIoKTtcblxuICByZXR1cm4gcmVuZGVyUmVzdWx0O1xufVxuXG5mdW5jdGlvbiBSZW5kZXJSZXN1bHQoZW52LCBzY29wZSwgb3B0aW9ucywgcm9vdE5vZGUsIG93bmVyTm9kZSwgbm9kZXMsIGZyYWdtZW50LCB0ZW1wbGF0ZSwgc2hvdWxkU2V0Q29udGVudCkge1xuICB0aGlzLnJvb3QgPSByb290Tm9kZTtcbiAgdGhpcy5mcmFnbWVudCA9IGZyYWdtZW50O1xuXG4gIHRoaXMubm9kZXMgPSBub2RlcztcbiAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICB0aGlzLnN0YXRlbWVudHMgPSB0ZW1wbGF0ZS5zdGF0ZW1lbnRzLnNsaWNlKCk7XG4gIHRoaXMuZW52ID0gZW52O1xuICB0aGlzLnNjb3BlID0gc2NvcGU7XG4gIHRoaXMuc2hvdWxkU2V0Q29udGVudCA9IHNob3VsZFNldENvbnRlbnQ7XG5cbiAgdGhpcy5iaW5kU2NvcGUoKTtcblxuICBpZiAob3B0aW9ucy5hdHRyaWJ1dGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICBub2Rlcy5wdXNoKHsgc3RhdGU6IHt9IH0pO1xuICAgIHRoaXMuc3RhdGVtZW50cy5wdXNoKFsnYXR0cmlidXRlcycsIGF0dGFjaEF0dHJpYnV0ZXMob3B0aW9ucy5hdHRyaWJ1dGVzKV0pO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuc2VsZiAhPT0gdW5kZWZpbmVkKSB7IHRoaXMuYmluZFNlbGYob3B0aW9ucy5zZWxmKTsgfVxuICBpZiAob3B0aW9ucy5ibG9ja0FyZ3VtZW50cyAhPT0gdW5kZWZpbmVkKSB7IHRoaXMuYmluZExvY2FscyhvcHRpb25zLmJsb2NrQXJndW1lbnRzKTsgfVxuXG4gIHRoaXMuaW5pdGlhbGl6ZU5vZGVzKG93bmVyTm9kZSk7XG59XG5cblJlbmRlclJlc3VsdC5idWlsZCA9IGZ1bmN0aW9uKGVudiwgc2NvcGUsIHRlbXBsYXRlLCBvcHRpb25zLCBjb250ZXh0dWFsRWxlbWVudCkge1xuICB2YXIgZG9tID0gZW52LmRvbTtcbiAgdmFyIGZyYWdtZW50ID0gZ2V0Q2FjaGVkRnJhZ21lbnQodGVtcGxhdGUsIGVudik7XG4gIHZhciBub2RlcyA9IHRlbXBsYXRlLmJ1aWxkUmVuZGVyTm9kZXMoZG9tLCBmcmFnbWVudCwgY29udGV4dHVhbEVsZW1lbnQpO1xuXG4gIHZhciByb290Tm9kZSwgb3duZXJOb2RlLCBzaG91bGRTZXRDb250ZW50O1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMucmVuZGVyTm9kZSkge1xuICAgIHJvb3ROb2RlID0gb3B0aW9ucy5yZW5kZXJOb2RlO1xuICAgIG93bmVyTm9kZSA9IHJvb3ROb2RlLm93bmVyTm9kZTtcbiAgICBzaG91bGRTZXRDb250ZW50ID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByb290Tm9kZSA9IGRvbS5jcmVhdGVNb3JwaChudWxsLCBmcmFnbWVudC5maXJzdENoaWxkLCBmcmFnbWVudC5sYXN0Q2hpbGQsIGNvbnRleHR1YWxFbGVtZW50KTtcbiAgICBvd25lck5vZGUgPSByb290Tm9kZTtcbiAgICBpbml0aWFsaXplTm9kZShyb290Tm9kZSwgb3duZXJOb2RlKTtcbiAgICBzaG91bGRTZXRDb250ZW50ID0gZmFsc2U7XG4gIH1cblxuICBpZiAocm9vdE5vZGUuY2hpbGROb2Rlcykge1xuICAgIHZpc2l0Q2hpbGRyZW4ocm9vdE5vZGUuY2hpbGROb2RlcywgZnVuY3Rpb24obm9kZSkge1xuICAgICAgY2xlYXJNb3JwaChub2RlLCBlbnYsIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcm9vdE5vZGUuY2hpbGROb2RlcyA9IG5vZGVzO1xuICByZXR1cm4gbmV3IFJlbmRlclJlc3VsdChlbnYsIHNjb3BlLCBvcHRpb25zLCByb290Tm9kZSwgb3duZXJOb2RlLCBub2RlcywgZnJhZ21lbnQsIHRlbXBsYXRlLCBzaG91bGRTZXRDb250ZW50KTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW51YWxFbGVtZW50KHRhZ05hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgdmFyIHN0YXRlbWVudHMgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgIGlmICh0eXBlb2YgYXR0cmlidXRlc1trZXldID09PSAnc3RyaW5nJykgeyBjb250aW51ZTsgfVxuICAgIHN0YXRlbWVudHMucHVzaChbXCJhdHRyaWJ1dGVcIiwga2V5LCBhdHRyaWJ1dGVzW2tleV1dKTtcbiAgfVxuXG4gIHN0YXRlbWVudHMucHVzaChbJ2NvbnRlbnQnLCAneWllbGQnXSk7XG5cbiAgdmFyIHRlbXBsYXRlID0ge1xuICAgIGFyaXR5OiAwLFxuICAgIGNhY2hlZEZyYWdtZW50OiBudWxsLFxuICAgIGhhc1JlbmRlcmVkOiBmYWxzZSxcbiAgICBidWlsZEZyYWdtZW50OiBmdW5jdGlvbiBidWlsZEZyYWdtZW50KGRvbSkge1xuICAgICAgdmFyIGVsMCA9IGRvbS5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICBpZiAodGFnTmFtZSA9PT0gJ3N2ZycpIHtcbiAgICAgICAgZG9tLnNldE5hbWVzcGFjZShzdmdOYW1lc3BhY2UpO1xuICAgICAgfVxuICAgICAgdmFyIGVsMSA9IGRvbS5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZXNba2V5XSAhPT0gJ3N0cmluZycpIHsgY29udGludWU7IH1cbiAgICAgICAgZG9tLnNldEF0dHJpYnV0ZShlbDEsIGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF2b2lkTWFwW3RhZ05hbWVdKSB7XG4gICAgICAgIHZhciBlbDIgPSBkb20uY3JlYXRlQ29tbWVudChcIlwiKTtcbiAgICAgICAgZG9tLmFwcGVuZENoaWxkKGVsMSwgZWwyKTtcbiAgICAgIH1cblxuICAgICAgZG9tLmFwcGVuZENoaWxkKGVsMCwgZWwxKTtcblxuICAgICAgcmV0dXJuIGVsMDtcbiAgICB9LFxuICAgIGJ1aWxkUmVuZGVyTm9kZXM6IGZ1bmN0aW9uIGJ1aWxkUmVuZGVyTm9kZXMoZG9tLCBmcmFnbWVudCkge1xuICAgICAgdmFyIGVsZW1lbnQgPSBkb20uY2hpbGRBdChmcmFnbWVudCwgWzBdKTtcbiAgICAgIHZhciBtb3JwaHMgPSBbXTtcblxuICAgICAgZm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhdHRyaWJ1dGVzW2tleV0gPT09ICdzdHJpbmcnKSB7IGNvbnRpbnVlOyB9XG4gICAgICAgIG1vcnBocy5wdXNoKGRvbS5jcmVhdGVBdHRyTW9ycGgoZWxlbWVudCwga2V5KSk7XG4gICAgICB9XG5cbiAgICAgIG1vcnBocy5wdXNoKGRvbS5jcmVhdGVNb3JwaEF0KGVsZW1lbnQsIDAsIDApKTtcbiAgICAgIHJldHVybiBtb3JwaHM7XG4gICAgfSxcbiAgICBzdGF0ZW1lbnRzOiBzdGF0ZW1lbnRzLFxuICAgIGxvY2FsczogW10sXG4gICAgdGVtcGxhdGVzOiBbXVxuICB9O1xuXG4gIHJldHVybiB0ZW1wbGF0ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF0dGFjaEF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuICB2YXIgc3RhdGVtZW50cyA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgaWYgKHR5cGVvZiBhdHRyaWJ1dGVzW2tleV0gPT09ICdzdHJpbmcnKSB7IGNvbnRpbnVlOyB9XG4gICAgc3RhdGVtZW50cy5wdXNoKFtcImF0dHJpYnV0ZVwiLCBrZXksIGF0dHJpYnV0ZXNba2V5XV0pO1xuICB9XG5cbiAgdmFyIHRlbXBsYXRlID0ge1xuICAgIGFyaXR5OiAwLFxuICAgIGNhY2hlZEZyYWdtZW50OiBudWxsLFxuICAgIGhhc1JlbmRlcmVkOiBmYWxzZSxcbiAgICBidWlsZEZyYWdtZW50OiBmdW5jdGlvbiBidWlsZEZyYWdtZW50KGRvbSkge1xuICAgICAgdmFyIGVsMCA9IHRoaXMuZWxlbWVudDtcbiAgICAgIGlmIChlbDAubmFtZXNwYWNlVVJJID09PSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIpIHtcbiAgICAgICAgZG9tLnNldE5hbWVzcGFjZShzdmdOYW1lc3BhY2UpO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhdHRyaWJ1dGVzW2tleV0gIT09ICdzdHJpbmcnKSB7IGNvbnRpbnVlOyB9XG4gICAgICAgIGRvbS5zZXRBdHRyaWJ1dGUoZWwwLCBrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlbDA7XG4gICAgfSxcbiAgICBidWlsZFJlbmRlck5vZGVzOiBmdW5jdGlvbiBidWlsZFJlbmRlck5vZGVzKGRvbSkge1xuICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQ7XG4gICAgICB2YXIgbW9ycGhzID0gW107XG5cbiAgICAgIGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXR0cmlidXRlc1trZXldID09PSAnc3RyaW5nJykgeyBjb250aW51ZTsgfVxuICAgICAgICBtb3JwaHMucHVzaChkb20uY3JlYXRlQXR0ck1vcnBoKGVsZW1lbnQsIGtleSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbW9ycGhzO1xuICAgIH0sXG4gICAgc3RhdGVtZW50czogc3RhdGVtZW50cyxcbiAgICBsb2NhbHM6IFtdLFxuICAgIHRlbXBsYXRlczogW10sXG4gICAgZWxlbWVudDogbnVsbFxuICB9O1xuXG4gIHJldHVybiB0ZW1wbGF0ZTtcbn1cblxuUmVuZGVyUmVzdWx0LnByb3RvdHlwZS5pbml0aWFsaXplTm9kZXMgPSBmdW5jdGlvbihvd25lck5vZGUpIHtcbiAgZm9yRWFjaCh0aGlzLnJvb3QuY2hpbGROb2RlcywgZnVuY3Rpb24obm9kZSkge1xuICAgIGluaXRpYWxpemVOb2RlKG5vZGUsIG93bmVyTm9kZSk7XG4gIH0pO1xufTtcblxuUmVuZGVyUmVzdWx0LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yb290Lmxhc3RSZXN1bHQgPSB0aGlzO1xuICB0aGlzLnJvb3QucmVuZGVyZWQgPSB0cnVlO1xuICB0aGlzLnBvcHVsYXRlTm9kZXMoQWx3YXlzRGlydHlWaXNpdG9yKTtcblxuICBpZiAodGhpcy5zaG91bGRTZXRDb250ZW50ICYmIHRoaXMucm9vdC5zZXRDb250ZW50KSB7XG4gICAgdGhpcy5yb290LnNldENvbnRlbnQodGhpcy5mcmFnbWVudCk7XG4gIH1cbn07XG5cblJlbmRlclJlc3VsdC5wcm90b3R5cGUuZGlydHkgPSBmdW5jdGlvbigpIHtcbiAgdmlzaXRDaGlsZHJlbihbdGhpcy5yb290XSwgZnVuY3Rpb24obm9kZSkgeyBub2RlLmlzRGlydHkgPSB0cnVlOyB9KTtcbn07XG5cblJlbmRlclJlc3VsdC5wcm90b3R5cGUucmV2YWxpZGF0ZSA9IGZ1bmN0aW9uKGVudiwgc2VsZiwgYmxvY2tBcmd1bWVudHMsIHNjb3BlKSB7XG4gIHRoaXMucmV2YWxpZGF0ZVdpdGgoZW52LCBzY29wZSwgc2VsZiwgYmxvY2tBcmd1bWVudHMsIEV4cHJlc3Npb25WaXNpdG9yKTtcbn07XG5cblJlbmRlclJlc3VsdC5wcm90b3R5cGUucmVyZW5kZXIgPSBmdW5jdGlvbihlbnYsIHNlbGYsIGJsb2NrQXJndW1lbnRzLCBzY29wZSkge1xuICB0aGlzLnJldmFsaWRhdGVXaXRoKGVudiwgc2NvcGUsIHNlbGYsIGJsb2NrQXJndW1lbnRzLCBBbHdheXNEaXJ0eVZpc2l0b3IpO1xufTtcblxuUmVuZGVyUmVzdWx0LnByb3RvdHlwZS5yZXZhbGlkYXRlV2l0aCA9IGZ1bmN0aW9uKGVudiwgc2NvcGUsIHNlbGYsIGJsb2NrQXJndW1lbnRzLCB2aXNpdG9yKSB7XG4gIGlmIChlbnYgIT09IHVuZGVmaW5lZCkgeyB0aGlzLmVudiA9IGVudjsgfVxuICBpZiAoc2NvcGUgIT09IHVuZGVmaW5lZCkgeyB0aGlzLnNjb3BlID0gc2NvcGU7IH1cbiAgdGhpcy51cGRhdGVTY29wZSgpO1xuXG4gIGlmIChzZWxmICE9PSB1bmRlZmluZWQpIHsgdGhpcy51cGRhdGVTZWxmKHNlbGYpOyB9XG4gIGlmIChibG9ja0FyZ3VtZW50cyAhPT0gdW5kZWZpbmVkKSB7IHRoaXMudXBkYXRlTG9jYWxzKGJsb2NrQXJndW1lbnRzKTsgfVxuXG4gIHRoaXMucG9wdWxhdGVOb2Rlcyh2aXNpdG9yKTtcbn07XG5cblJlbmRlclJlc3VsdC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcm9vdE5vZGUgPSB0aGlzLnJvb3Q7XG4gIGNsZWFyTW9ycGgocm9vdE5vZGUsIHRoaXMuZW52LCB0cnVlKTtcbn07XG5cblJlbmRlclJlc3VsdC5wcm90b3R5cGUucG9wdWxhdGVOb2RlcyA9IGZ1bmN0aW9uKHZpc2l0b3IpIHtcbiAgdmFyIGVudiA9IHRoaXMuZW52O1xuICB2YXIgc2NvcGUgPSB0aGlzLnNjb3BlO1xuICB2YXIgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICB2YXIgbm9kZXMgPSB0aGlzLm5vZGVzO1xuICB2YXIgc3RhdGVtZW50cyA9IHRoaXMuc3RhdGVtZW50cztcbiAgdmFyIGksIGw7XG5cbiAgZm9yIChpPTAsIGw9c3RhdGVtZW50cy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgdmFyIHN0YXRlbWVudCA9IHN0YXRlbWVudHNbaV07XG4gICAgdmFyIG1vcnBoID0gbm9kZXNbaV07XG5cbiAgICBpZiAoZW52Lmhvb2tzLndpbGxSZW5kZXJOb2RlKSB7XG4gICAgICBlbnYuaG9va3Mud2lsbFJlbmRlck5vZGUobW9ycGgsIGVudiwgc2NvcGUpO1xuICAgIH1cblxuICAgIHN3aXRjaCAoc3RhdGVtZW50WzBdKSB7XG4gICAgICBjYXNlICdibG9jayc6IHZpc2l0b3IuYmxvY2soc3RhdGVtZW50LCBtb3JwaCwgZW52LCBzY29wZSwgdGVtcGxhdGUsIHZpc2l0b3IpOyBicmVhaztcbiAgICAgIGNhc2UgJ2lubGluZSc6IHZpc2l0b3IuaW5saW5lKHN0YXRlbWVudCwgbW9ycGgsIGVudiwgc2NvcGUsIHZpc2l0b3IpOyBicmVhaztcbiAgICAgIGNhc2UgJ2NvbnRlbnQnOiB2aXNpdG9yLmNvbnRlbnQoc3RhdGVtZW50LCBtb3JwaCwgZW52LCBzY29wZSwgdmlzaXRvcik7IGJyZWFrO1xuICAgICAgY2FzZSAnZWxlbWVudCc6IHZpc2l0b3IuZWxlbWVudChzdGF0ZW1lbnQsIG1vcnBoLCBlbnYsIHNjb3BlLCB0ZW1wbGF0ZSwgdmlzaXRvcik7IGJyZWFrO1xuICAgICAgY2FzZSAnYXR0cmlidXRlJzogdmlzaXRvci5hdHRyaWJ1dGUoc3RhdGVtZW50LCBtb3JwaCwgZW52LCBzY29wZSk7IGJyZWFrO1xuICAgICAgY2FzZSAnY29tcG9uZW50JzogdmlzaXRvci5jb21wb25lbnQoc3RhdGVtZW50LCBtb3JwaCwgZW52LCBzY29wZSwgdGVtcGxhdGUsIHZpc2l0b3IpOyBicmVhaztcbiAgICAgIGNhc2UgJ2F0dHJpYnV0ZXMnOiB2aXNpdG9yLmF0dHJpYnV0ZXMoc3RhdGVtZW50LCBtb3JwaCwgZW52LCBzY29wZSwgdGhpcy5mcmFnbWVudCwgdmlzaXRvcik7IGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChlbnYuaG9va3MuZGlkUmVuZGVyTm9kZSkge1xuICAgICAgZW52Lmhvb2tzLmRpZFJlbmRlck5vZGUobW9ycGgsIGVudiwgc2NvcGUpO1xuICAgIH1cbiAgfVxufTtcblxuUmVuZGVyUmVzdWx0LnByb3RvdHlwZS5iaW5kU2NvcGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbnYuaG9va3MuYmluZFNjb3BlKHRoaXMuZW52LCB0aGlzLnNjb3BlKTtcbn07XG5cblJlbmRlclJlc3VsdC5wcm90b3R5cGUudXBkYXRlU2NvcGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbnYuaG9va3MudXBkYXRlU2NvcGUodGhpcy5lbnYsIHRoaXMuc2NvcGUpO1xufTtcblxuUmVuZGVyUmVzdWx0LnByb3RvdHlwZS5iaW5kU2VsZiA9IGZ1bmN0aW9uKHNlbGYpIHtcbiAgdGhpcy5lbnYuaG9va3MuYmluZFNlbGYodGhpcy5lbnYsIHRoaXMuc2NvcGUsIHNlbGYpO1xufTtcblxuUmVuZGVyUmVzdWx0LnByb3RvdHlwZS51cGRhdGVTZWxmID0gZnVuY3Rpb24oc2VsZikge1xuICB0aGlzLmVudi5ob29rcy51cGRhdGVTZWxmKHRoaXMuZW52LCB0aGlzLnNjb3BlLCBzZWxmKTtcbn07XG5cblJlbmRlclJlc3VsdC5wcm90b3R5cGUuYmluZExvY2FscyA9IGZ1bmN0aW9uKGJsb2NrQXJndW1lbnRzKSB7XG4gIHZhciBsb2NhbE5hbWVzID0gdGhpcy50ZW1wbGF0ZS5sb2NhbHM7XG5cbiAgZm9yICh2YXIgaT0wLCBsPWxvY2FsTmFtZXMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgIHRoaXMuZW52Lmhvb2tzLmJpbmRMb2NhbCh0aGlzLmVudiwgdGhpcy5zY29wZSwgbG9jYWxOYW1lc1tpXSwgYmxvY2tBcmd1bWVudHNbaV0pO1xuICB9XG59O1xuXG5SZW5kZXJSZXN1bHQucHJvdG90eXBlLnVwZGF0ZUxvY2FscyA9IGZ1bmN0aW9uKGJsb2NrQXJndW1lbnRzKSB7XG4gIHZhciBsb2NhbE5hbWVzID0gdGhpcy50ZW1wbGF0ZS5sb2NhbHM7XG5cbiAgZm9yICh2YXIgaT0wLCBsPWxvY2FsTmFtZXMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgIHRoaXMuZW52Lmhvb2tzLnVwZGF0ZUxvY2FsKHRoaXMuZW52LCB0aGlzLnNjb3BlLCBsb2NhbE5hbWVzW2ldLCBibG9ja0FyZ3VtZW50c1tpXSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGluaXRpYWxpemVOb2RlKG5vZGUsIG93bmVyKSB7XG4gIG5vZGUub3duZXJOb2RlID0gb3duZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDaGlsZE1vcnBoKGRvbSwgcGFyZW50TW9ycGgsIGNvbnRleHR1YWxFbGVtZW50KSB7XG4gIHZhciBtb3JwaCA9IE1vcnBoLmVtcHR5KGRvbSwgY29udGV4dHVhbEVsZW1lbnQgfHwgcGFyZW50TW9ycGguY29udGV4dHVhbEVsZW1lbnQpO1xuICBpbml0aWFsaXplTm9kZShtb3JwaCwgcGFyZW50TW9ycGgub3duZXJOb2RlKTtcbiAgcmV0dXJuIG1vcnBoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGVkRnJhZ21lbnQodGVtcGxhdGUsIGVudikge1xuICB2YXIgZG9tID0gZW52LmRvbSwgZnJhZ21lbnQ7XG4gIGlmIChlbnYudXNlRnJhZ21lbnRDYWNoZSAmJiBkb20uY2FuQ2xvbmUpIHtcbiAgICBpZiAodGVtcGxhdGUuY2FjaGVkRnJhZ21lbnQgPT09IG51bGwpIHtcbiAgICAgIGZyYWdtZW50ID0gdGVtcGxhdGUuYnVpbGRGcmFnbWVudChkb20pO1xuICAgICAgaWYgKHRlbXBsYXRlLmhhc1JlbmRlcmVkKSB7XG4gICAgICAgIHRlbXBsYXRlLmNhY2hlZEZyYWdtZW50ID0gZnJhZ21lbnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZW1wbGF0ZS5oYXNSZW5kZXJlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0ZW1wbGF0ZS5jYWNoZWRGcmFnbWVudCkge1xuICAgICAgZnJhZ21lbnQgPSBkb20uY2xvbmVOb2RlKHRlbXBsYXRlLmNhY2hlZEZyYWdtZW50LCB0cnVlKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIWZyYWdtZW50KSB7XG4gICAgZnJhZ21lbnQgPSB0ZW1wbGF0ZS5idWlsZEZyYWdtZW50KGRvbSk7XG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG4iXX0=
define('htmlbars-util', ['exports', './htmlbars-util/safe-string', './htmlbars-util/handlebars/utils', './htmlbars-util/namespaces', './htmlbars-util/morph-utils'], function (exports, _htmlbarsUtilSafeString, _htmlbarsUtilHandlebarsUtils, _htmlbarsUtilNamespaces, _htmlbarsUtilMorphUtils) {
  exports.SafeString = _htmlbarsUtilSafeString.default;
  exports.escapeExpression = _htmlbarsUtilHandlebarsUtils.escapeExpression;
  exports.getAttrNamespace = _htmlbarsUtilNamespaces.getAttrNamespace;
  exports.validateChildMorphs = _htmlbarsUtilMorphUtils.validateChildMorphs;
  exports.linkParams = _htmlbarsUtilMorphUtils.linkParams;
  exports.dump = _htmlbarsUtilMorphUtils.dump;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtVQU1FLFVBQVU7VUFDVixnQkFBZ0IsZ0NBTlQsZ0JBQWdCO1VBT3ZCLGdCQUFnQiwyQkFOVCxnQkFBZ0I7VUFPdkIsbUJBQW1CLDJCQU5aLG1CQUFtQjtVQU8xQixVQUFVLDJCQVBrQixVQUFVO1VBUXRDLElBQUksMkJBUm9DLElBQUkiLCJmaWxlIjoiaHRtbGJhcnMtdXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTYWZlU3RyaW5nIGZyb20gJy4vaHRtbGJhcnMtdXRpbC9zYWZlLXN0cmluZyc7XG5pbXBvcnQgeyBlc2NhcGVFeHByZXNzaW9uIH0gZnJvbSAnLi9odG1sYmFycy11dGlsL2hhbmRsZWJhcnMvdXRpbHMnO1xuaW1wb3J0IHsgZ2V0QXR0ck5hbWVzcGFjZSB9IGZyb20gJy4vaHRtbGJhcnMtdXRpbC9uYW1lc3BhY2VzJztcbmltcG9ydCB7IHZhbGlkYXRlQ2hpbGRNb3JwaHMsIGxpbmtQYXJhbXMsIGR1bXAgfSBmcm9tICcuL2h0bWxiYXJzLXV0aWwvbW9ycGgtdXRpbHMnO1xuXG5leHBvcnQge1xuICBTYWZlU3RyaW5nLFxuICBlc2NhcGVFeHByZXNzaW9uLFxuICBnZXRBdHRyTmFtZXNwYWNlLFxuICB2YWxpZGF0ZUNoaWxkTW9ycGhzLFxuICBsaW5rUGFyYW1zLFxuICBkdW1wXG59O1xuIl19
define('htmlbars-util/array-utils', ['exports'], function (exports) {
  exports.forEach = forEach;
  exports.map = map;

  function forEach(array, callback, binding) {
    var i, l;
    if (binding === undefined) {
      for (i = 0, l = array.length; i < l; i++) {
        callback(array[i], i, array);
      }
    } else {
      for (i = 0, l = array.length; i < l; i++) {
        callback.call(binding, array[i], i, array);
      }
    }
  }

  function map(array, callback) {
    var output = [];
    var i, l;

    for (i = 0, l = array.length; i < l; i++) {
      output.push(callback(array[i], i, array));
    }

    return output;
  }

  var getIdx;
  if (Array.prototype.indexOf) {
    getIdx = function (array, obj, from) {
      return array.indexOf(obj, from);
    };
  } else {
    getIdx = function (array, obj, from) {
      if (from === undefined || from === null) {
        from = 0;
      } else if (from < 0) {
        from = Math.max(0, array.length + from);
      }
      for (var i = from, l = array.length; i < l; i++) {
        if (array[i] === obj) {
          return i;
        }
      }
      return -1;
    };
  }

  var isArray = Array.isArray || function (array) {
    return Object.prototype.toString.call(array) === '[object Array]';
  };

  exports.isArray = isArray;
  var indexOfArray = getIdx;
  exports.indexOfArray = indexOfArray;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvYXJyYXktdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtVQUFnQixPQUFPLEdBQVAsT0FBTztVQWFQLEdBQUcsR0FBSCxHQUFHOztBQWJaLFdBQVMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO0FBQ2hELFFBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNULFFBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtBQUN6QixXQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QyxnQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDOUI7S0FDRixNQUFNO0FBQ0wsV0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDeEMsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDNUM7S0FDRjtHQUNGOztBQUVNLFdBQVMsR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFDbkMsUUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFVCxTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QyxZQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDM0M7O0FBRUQsV0FBTyxNQUFNLENBQUM7R0FDZjs7QUFFRCxNQUFJLE1BQU0sQ0FBQztBQUNYLE1BQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7QUFDM0IsVUFBTSxHQUFHLFVBQVMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUM7QUFDakMsYUFBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNqQyxDQUFDO0dBQ0gsTUFBTTtBQUNMLFVBQU0sR0FBRyxVQUFTLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQ2xDLFVBQUksSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO0FBQ3ZDLFlBQUksR0FBRyxDQUFDLENBQUM7T0FDVixNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtBQUNuQixZQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQztPQUN6QztBQUNELFdBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDOUMsWUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ3BCLGlCQUFPLENBQUMsQ0FBQztTQUNWO09BQ0Y7QUFDRCxhQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ1gsQ0FBQztHQUNIOztBQUVNLE1BQUksT0FBTyxHQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksVUFBUyxLQUFLLEVBQUU7QUFDckQsV0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssZ0JBQWdCLENBQUM7R0FDbkUsQUFBQyxDQUFDOztVQUZRLE9BQU8sR0FBUCxPQUFPO0FBSVgsTUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDO1VBQXRCLFlBQVksR0FBWixZQUFZIiwiZmlsZSI6Imh0bWxiYXJzLXV0aWwvYXJyYXktdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gZm9yRWFjaChhcnJheSwgY2FsbGJhY2ssIGJpbmRpbmcpIHtcbiAgdmFyIGksIGw7XG4gIGlmIChiaW5kaW5nID09PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBjYWxsYmFjayhhcnJheVtpXSwgaSwgYXJyYXkpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IgKGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKGJpbmRpbmcsIGFycmF5W2ldLCBpLCBhcnJheSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXAoYXJyYXksIGNhbGxiYWNrKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgdmFyIGksIGw7XG5cbiAgZm9yIChpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIG91dHB1dC5wdXNoKGNhbGxiYWNrKGFycmF5W2ldLCBpLCBhcnJheSkpO1xuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn1cblxudmFyIGdldElkeDtcbmlmIChBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICBnZXRJZHggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBmcm9tKXtcbiAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihvYmosIGZyb20pO1xuICB9O1xufSBlbHNlIHtcbiAgZ2V0SWR4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgZnJvbSkge1xuICAgIGlmIChmcm9tID09PSB1bmRlZmluZWQgfHwgZnJvbSA9PT0gbnVsbCkge1xuICAgICAgZnJvbSA9IDA7XG4gICAgfSBlbHNlIGlmIChmcm9tIDwgMCkge1xuICAgICAgZnJvbSA9IE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCArIGZyb20pO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gZnJvbSwgbD0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoYXJyYXlbaV0gPT09IG9iaikge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuXG5leHBvcnQgdmFyIGlzQXJyYXkgPSAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihhcnJheSkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycmF5KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn0pO1xuXG5leHBvcnQgdmFyIGluZGV4T2ZBcnJheSA9IGdldElkeDtcbiJdfQ==
define("htmlbars-util/morph-utils", ["exports"], function (exports) {
  exports.visitChildren = visitChildren;
  exports.validateChildMorphs = validateChildMorphs;
  exports.linkParams = linkParams;
  exports.dump = dump;
  /*globals console*/

  function visitChildren(nodes, callback) {
    if (!nodes || nodes.length === 0) {
      return;
    }

    nodes = nodes.slice();

    while (nodes.length) {
      var node = nodes.pop();
      callback(node);

      if (node.childNodes) {
        nodes.push.apply(nodes, node.childNodes);
      } else if (node.firstChildMorph) {
        var current = node.firstChildMorph;

        while (current) {
          nodes.push(current);
          current = current.nextMorph;
        }
      } else if (node.morphList) {
        nodes.push(node.morphList);
      }
    }
  }

  function validateChildMorphs(env, morph, visitor) {
    var morphList = morph.morphList;
    if (morph.morphList) {
      var current = morphList.firstChildMorph;

      while (current) {
        var next = current.nextMorph;
        validateChildMorphs(env, current, visitor);
        current = next;
      }
    } else if (morph.lastResult) {
      morph.lastResult.revalidateWith(env, undefined, undefined, undefined, visitor);
    } else if (morph.childNodes) {
      // This means that the childNodes were wired up manually
      for (var i = 0, l = morph.childNodes.length; i < l; i++) {
        validateChildMorphs(env, morph.childNodes[i], visitor);
      }
    }
  }

  function linkParams(env, scope, morph, path, params, hash) {
    if (morph.linkedParams) {
      return;
    }

    if (env.hooks.linkRenderNode(morph, env, scope, path, params, hash)) {
      morph.linkedParams = { params: params, hash: hash };
    }
  }

  function dump(node) {
    console.group(node, node.isDirty);

    if (node.childNodes) {
      map(node.childNodes, dump);
    } else if (node.firstChildMorph) {
      var current = node.firstChildMorph;

      while (current) {
        dump(current);
        current = current.nextMorph;
      }
    } else if (node.morphList) {
      dump(node.morphList);
    }

    console.groupEnd();
  }

  function map(nodes, cb) {
    for (var i = 0, l = nodes.length; i < l; i++) {
      cb(nodes[i]);
    }
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvbW9ycGgtdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtVQUVnQixhQUFhLEdBQWIsYUFBYTtVQXdCYixtQkFBbUIsR0FBbkIsbUJBQW1CO1VBb0JuQixVQUFVLEdBQVYsVUFBVTtVQVVWLElBQUksR0FBSixJQUFJOzs7QUF0RGIsV0FBUyxhQUFhLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRTtBQUM3QyxRQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQUUsYUFBTztLQUFFOztBQUU3QyxTQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUV0QixXQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDbkIsVUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLGNBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFZixVQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDbkIsYUFBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUMxQyxNQUFNLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUMvQixZQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDOztBQUVuQyxlQUFPLE9BQU8sRUFBRTtBQUNkLGVBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEIsaUJBQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1NBQzdCO09BQ0YsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDekIsYUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDNUI7S0FDRjtHQUNGOztBQUVNLFdBQVMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFDdkQsUUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUNoQyxRQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUU7QUFDbkIsVUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQzs7QUFFeEMsYUFBTyxPQUFPLEVBQUU7QUFDZCxZQUFJLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQzdCLDJCQUFtQixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0MsZUFBTyxHQUFHLElBQUksQ0FBQztPQUNoQjtLQUNGLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFO0FBQzNCLFdBQUssQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNoRixNQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRTs7QUFFM0IsV0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDakQsMkJBQW1CLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDeEQ7S0FDRjtHQUNGOztBQUVNLFdBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ2hFLFFBQUksS0FBSyxDQUFDLFlBQVksRUFBRTtBQUN0QixhQUFPO0tBQ1I7O0FBRUQsUUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ25FLFdBQUssQ0FBQyxZQUFZLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztLQUNyRDtHQUNGOztBQUVNLFdBQVMsSUFBSSxDQUFDLElBQUksRUFBRTtBQUN6QixXQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRWxDLFFBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixTQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM1QixNQUFNLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUMvQixVQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDOztBQUVuQyxhQUFPLE9BQU8sRUFBRTtBQUNkLFlBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNkLGVBQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO09BQzdCO0tBQ0YsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDekIsVUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN0Qjs7QUFFRCxXQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7R0FDcEI7O0FBRUQsV0FBUyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRTtBQUN0QixTQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RDLFFBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNkO0dBQ0YiLCJmaWxlIjoiaHRtbGJhcnMtdXRpbC9tb3JwaC11dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qZ2xvYmFscyBjb25zb2xlKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0Q2hpbGRyZW4obm9kZXMsIGNhbGxiYWNrKSB7XG4gIGlmICghbm9kZXMgfHwgbm9kZXMubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuXG4gIG5vZGVzID0gbm9kZXMuc2xpY2UoKTtcblxuICB3aGlsZSAobm9kZXMubGVuZ3RoKSB7XG4gICAgdmFyIG5vZGUgPSBub2Rlcy5wb3AoKTtcbiAgICBjYWxsYmFjayhub2RlKTtcblxuICAgIGlmIChub2RlLmNoaWxkTm9kZXMpIHtcbiAgICAgIG5vZGVzLnB1c2guYXBwbHkobm9kZXMsIG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgfSBlbHNlIGlmIChub2RlLmZpcnN0Q2hpbGRNb3JwaCkge1xuICAgICAgdmFyIGN1cnJlbnQgPSBub2RlLmZpcnN0Q2hpbGRNb3JwaDtcblxuICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgbm9kZXMucHVzaChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dE1vcnBoO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobm9kZS5tb3JwaExpc3QpIHtcbiAgICAgIG5vZGVzLnB1c2gobm9kZS5tb3JwaExpc3QpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDaGlsZE1vcnBocyhlbnYsIG1vcnBoLCB2aXNpdG9yKSB7XG4gIHZhciBtb3JwaExpc3QgPSBtb3JwaC5tb3JwaExpc3Q7XG4gIGlmIChtb3JwaC5tb3JwaExpc3QpIHtcbiAgICB2YXIgY3VycmVudCA9IG1vcnBoTGlzdC5maXJzdENoaWxkTW9ycGg7XG5cbiAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgdmFyIG5leHQgPSBjdXJyZW50Lm5leHRNb3JwaDtcbiAgICAgIHZhbGlkYXRlQ2hpbGRNb3JwaHMoZW52LCBjdXJyZW50LCB2aXNpdG9yKTtcbiAgICAgIGN1cnJlbnQgPSBuZXh0O1xuICAgIH1cbiAgfSBlbHNlIGlmIChtb3JwaC5sYXN0UmVzdWx0KSB7XG4gICAgbW9ycGgubGFzdFJlc3VsdC5yZXZhbGlkYXRlV2l0aChlbnYsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHZpc2l0b3IpO1xuICB9IGVsc2UgaWYgKG1vcnBoLmNoaWxkTm9kZXMpIHtcbiAgICAvLyBUaGlzIG1lYW5zIHRoYXQgdGhlIGNoaWxkTm9kZXMgd2VyZSB3aXJlZCB1cCBtYW51YWxseVxuICAgIGZvciAodmFyIGk9MCwgbD1tb3JwaC5jaGlsZE5vZGVzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICAgIHZhbGlkYXRlQ2hpbGRNb3JwaHMoZW52LCBtb3JwaC5jaGlsZE5vZGVzW2ldLCB2aXNpdG9yKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmtQYXJhbXMoZW52LCBzY29wZSwgbW9ycGgsIHBhdGgsIHBhcmFtcywgaGFzaCkge1xuICBpZiAobW9ycGgubGlua2VkUGFyYW1zKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGVudi5ob29rcy5saW5rUmVuZGVyTm9kZShtb3JwaCwgZW52LCBzY29wZSwgcGF0aCwgcGFyYW1zLCBoYXNoKSkge1xuICAgIG1vcnBoLmxpbmtlZFBhcmFtcyA9IHsgcGFyYW1zOiBwYXJhbXMsIGhhc2g6IGhhc2ggfTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZHVtcChub2RlKSB7XG4gIGNvbnNvbGUuZ3JvdXAobm9kZSwgbm9kZS5pc0RpcnR5KTtcblxuICBpZiAobm9kZS5jaGlsZE5vZGVzKSB7XG4gICAgbWFwKG5vZGUuY2hpbGROb2RlcywgZHVtcCk7XG4gIH0gZWxzZSBpZiAobm9kZS5maXJzdENoaWxkTW9ycGgpIHtcbiAgICB2YXIgY3VycmVudCA9IG5vZGUuZmlyc3RDaGlsZE1vcnBoO1xuXG4gICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgIGR1bXAoY3VycmVudCk7XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0TW9ycGg7XG4gICAgfVxuICB9IGVsc2UgaWYgKG5vZGUubW9ycGhMaXN0KSB7XG4gICAgZHVtcChub2RlLm1vcnBoTGlzdCk7XG4gIH1cblxuICBjb25zb2xlLmdyb3VwRW5kKCk7XG59XG5cbmZ1bmN0aW9uIG1hcChub2RlcywgY2IpIHtcbiAgZm9yICh2YXIgaT0wLCBsPW5vZGVzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICBjYihub2Rlc1tpXSk7XG4gIH1cbn1cbiJdfQ==
define('htmlbars-util/namespaces', ['exports'], function (exports) {
  exports.getAttrNamespace = getAttrNamespace;
  // ref http://dev.w3.org/html5/spec-LC/namespaces.html
  var defaultNamespaces = {
    html: 'http://www.w3.org/1999/xhtml',
    mathml: 'http://www.w3.org/1998/Math/MathML',
    svg: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink',
    xml: 'http://www.w3.org/XML/1998/namespace'
  };

  function getAttrNamespace(attrName) {
    var namespace;

    var colonIndex = attrName.indexOf(':');
    if (colonIndex !== -1) {
      var prefix = attrName.slice(0, colonIndex);
      namespace = defaultNamespaces[prefix];
    }

    return namespace || null;
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvbmFtZXNwYWNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1VBU2dCLGdCQUFnQixHQUFoQixnQkFBZ0I7O0FBUmhDLE1BQUksaUJBQWlCLEdBQUc7QUFDdEIsUUFBSSxFQUFFLDhCQUE4QjtBQUNwQyxVQUFNLEVBQUUsb0NBQW9DO0FBQzVDLE9BQUcsRUFBRSw0QkFBNEI7QUFDakMsU0FBSyxFQUFFLDhCQUE4QjtBQUNyQyxPQUFHLEVBQUUsc0NBQXNDO0dBQzVDLENBQUM7O0FBRUssV0FBUyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7QUFDekMsUUFBSSxTQUFTLENBQUM7O0FBRWQsUUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QyxRQUFJLFVBQVUsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNyQixVQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdkM7O0FBRUQsV0FBTyxTQUFTLElBQUksSUFBSSxDQUFDO0dBQzFCIiwiZmlsZSI6Imh0bWxiYXJzLXV0aWwvbmFtZXNwYWNlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHJlZiBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjLUxDL25hbWVzcGFjZXMuaHRtbFxudmFyIGRlZmF1bHROYW1lc3BhY2VzID0ge1xuICBodG1sOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsXG4gIG1hdGhtbDogJ2h0dHA6Ly93d3cudzMub3JnLzE5OTgvTWF0aC9NYXRoTUwnLFxuICBzdmc6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsXG4gIHhsaW5rOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsXG4gIHhtbDogJ2h0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZSdcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBdHRyTmFtZXNwYWNlKGF0dHJOYW1lKSB7XG4gIHZhciBuYW1lc3BhY2U7XG5cbiAgdmFyIGNvbG9uSW5kZXggPSBhdHRyTmFtZS5pbmRleE9mKCc6Jyk7XG4gIGlmIChjb2xvbkluZGV4ICE9PSAtMSkge1xuICAgIHZhciBwcmVmaXggPSBhdHRyTmFtZS5zbGljZSgwLCBjb2xvbkluZGV4KTtcbiAgICBuYW1lc3BhY2UgPSBkZWZhdWx0TmFtZXNwYWNlc1twcmVmaXhdO1xuICB9XG5cbiAgcmV0dXJuIG5hbWVzcGFjZSB8fCBudWxsO1xufVxuIl19
define("htmlbars-util/object-utils", ["exports"], function (exports) {
  exports.merge = merge;
  exports.shallowCopy = shallowCopy;
  exports.keySet = keySet;
  exports.keyLength = keyLength;

  function merge(options, defaults) {
    for (var prop in defaults) {
      if (options.hasOwnProperty(prop)) {
        continue;
      }
      options[prop] = defaults[prop];
    }
    return options;
  }

  function shallowCopy(obj) {
    return merge({}, obj);
  }

  function keySet(obj) {
    var set = {};

    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        set[prop] = true;
      }
    }

    return set;
  }

  function keyLength(obj) {
    var count = 0;

    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        count++;
      }
    }

    return count;
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvb2JqZWN0LXV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7VUFBZ0IsS0FBSyxHQUFMLEtBQUs7VUFRTCxXQUFXLEdBQVgsV0FBVztVQUlYLE1BQU0sR0FBTixNQUFNO1VBWU4sU0FBUyxHQUFULFNBQVM7O0FBeEJsQixXQUFTLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ3ZDLFNBQUssSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO0FBQ3pCLFVBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUFFLGlCQUFTO09BQUU7QUFDL0MsYUFBTyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoQztBQUNELFdBQU8sT0FBTyxDQUFDO0dBQ2hCOztBQUVNLFdBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRTtBQUMvQixXQUFPLEtBQUssQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FDdkI7O0FBRU0sV0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQzFCLFFBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQzs7QUFFYixTQUFLLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRTtBQUNwQixVQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDNUIsV0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztPQUNsQjtLQUNGOztBQUVELFdBQU8sR0FBRyxDQUFDO0dBQ1o7O0FBRU0sV0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFO0FBQzdCLFFBQUksS0FBSyxHQUFHLENBQUMsQ0FBQzs7QUFFZCxTQUFLLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRTtBQUNwQixVQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDNUIsYUFBSyxFQUFFLENBQUM7T0FDVDtLQUNGOztBQUVELFdBQU8sS0FBSyxDQUFDO0dBQ2QiLCJmaWxlIjoiaHRtbGJhcnMtdXRpbC9vYmplY3QtdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gbWVyZ2Uob3B0aW9ucywgZGVmYXVsdHMpIHtcbiAgZm9yICh2YXIgcHJvcCBpbiBkZWZhdWx0cykge1xuICAgIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KHByb3ApKSB7IGNvbnRpbnVlOyB9XG4gICAgb3B0aW9uc1twcm9wXSA9IGRlZmF1bHRzW3Byb3BdO1xuICB9XG4gIHJldHVybiBvcHRpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hhbGxvd0NvcHkob2JqKSB7XG4gIHJldHVybiBtZXJnZSh7fSwgb2JqKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtleVNldChvYmopIHtcbiAgdmFyIHNldCA9IHt9O1xuXG4gIGZvciAodmFyIHByb3AgaW4gb2JqKSB7XG4gICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgc2V0W3Byb3BdID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc2V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24ga2V5TGVuZ3RoKG9iaikge1xuICB2YXIgY291bnQgPSAwO1xuXG4gIGZvciAodmFyIHByb3AgaW4gb2JqKSB7XG4gICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgY291bnQrKztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY291bnQ7XG59XG4iXX0=
define("htmlbars-util/quoting", ["exports"], function (exports) {
  exports.hash = hash;
  exports.repeat = repeat;
  function escapeString(str) {
    str = str.replace(/\\/g, "\\\\");
    str = str.replace(/"/g, '\\"');
    str = str.replace(/\n/g, "\\n");
    return str;
  }

  exports.escapeString = escapeString;

  function string(str) {
    return '"' + escapeString(str) + '"';
  }

  exports.string = string;

  function array(a) {
    return "[" + a + "]";
  }

  exports.array = array;

  function hash(pairs) {
    return "{" + pairs.join(", ") + "}";
  }

  function repeat(chars, times) {
    var str = "";
    while (times--) {
      str += chars;
    }
    return str;
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvcXVvdGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1VBcUJnQixJQUFJLEdBQUosSUFBSTtVQUlKLE1BQU0sR0FBTixNQUFNO0FBekJ0QixXQUFTLFlBQVksQ0FBQyxHQUFHLEVBQUU7QUFDekIsT0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2pDLE9BQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvQixPQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDaEMsV0FBTyxHQUFHLENBQUM7R0FDWjs7VUFFUSxZQUFZLEdBQVosWUFBWTs7QUFFckIsV0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQ25CLFdBQU8sR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7R0FDdEM7O1VBRVEsTUFBTSxHQUFOLE1BQU07O0FBRWYsV0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2hCLFdBQU8sR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7R0FDdEI7O1VBRVEsS0FBSyxHQUFMLEtBQUs7O0FBRVAsV0FBUyxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQzFCLFdBQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0dBQ3JDOztBQUVNLFdBQVMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDbkMsUUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2IsV0FBTyxLQUFLLEVBQUUsRUFBRTtBQUNkLFNBQUcsSUFBSSxLQUFLLENBQUM7S0FDZDtBQUNELFdBQU8sR0FBRyxDQUFDO0dBQ1oiLCJmaWxlIjoiaHRtbGJhcnMtdXRpbC9xdW90aW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gZXNjYXBlU3RyaW5nKHN0cikge1xuICBzdHIgPSBzdHIucmVwbGFjZSgvXFxcXC9nLCBcIlxcXFxcXFxcXCIpO1xuICBzdHIgPSBzdHIucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpO1xuICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XG4gIHJldHVybiBzdHI7XG59XG5cbmV4cG9ydCB7IGVzY2FwZVN0cmluZyB9O1xuXG5mdW5jdGlvbiBzdHJpbmcoc3RyKSB7XG4gIHJldHVybiAnXCInICsgZXNjYXBlU3RyaW5nKHN0cikgKyAnXCInO1xufVxuXG5leHBvcnQgeyBzdHJpbmcgfTtcblxuZnVuY3Rpb24gYXJyYXkoYSkge1xuICByZXR1cm4gXCJbXCIgKyBhICsgXCJdXCI7XG59XG5cbmV4cG9ydCB7IGFycmF5IH07XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNoKHBhaXJzKSB7XG4gIHJldHVybiBcIntcIiArIHBhaXJzLmpvaW4oXCIsIFwiKSArIFwifVwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVwZWF0KGNoYXJzLCB0aW1lcykge1xuICB2YXIgc3RyID0gXCJcIjtcbiAgd2hpbGUgKHRpbWVzLS0pIHtcbiAgICBzdHIgKz0gY2hhcnM7XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn1cbiJdfQ==
define('htmlbars-util/safe-string', ['exports', './handlebars/safe-string'], function (exports, _handlebarsSafeString) {
  exports.default = _handlebarsSafeString.default;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJodG1sYmFycy11dGlsL3NhZmUtc3RyaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==
define("htmlbars-util/template-utils", ["exports", "../htmlbars-util/morph-utils"], function (exports, _htmlbarsUtilMorphUtils) {
  exports.RenderState = RenderState;
  exports.blockFor = blockFor;
  exports.renderAndCleanup = renderAndCleanup;
  exports.clearMorph = clearMorph;
  exports.clearMorphList = clearMorphList;

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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtVQUVnQixXQUFXLEdBQVgsV0FBVztVQXlCWCxRQUFRLEdBQVIsUUFBUTtVQWdEUixnQkFBZ0IsR0FBaEIsZ0JBQWdCO1VBc0RoQixVQUFVLEdBQVYsVUFBVTtVQTBCVixjQUFjLEdBQWQsY0FBYzs7QUF6SnZCLFdBQVMsV0FBVyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUU7OztBQUdqRCxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDOzs7O0FBSWxDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7Ozs7O0FBSzdCLFFBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDOzs7Ozs7O0FBTzVCLFFBQUksQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDOztBQUUvQixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztHQUMzQjs7QUFFTSxXQUFTLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRTtBQUN2RCxRQUFJLEtBQUssR0FBRyxVQUFTLEdBQUcsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFO0FBQ2hGLFVBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtBQUN6QixrQkFBVSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ3JGLE1BQU07QUFDTCxZQUFJLE9BQU8sR0FBRyxFQUFFLFdBQVcsRUFBRSxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDOztBQUUzRCxZQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0FBQy9CLFlBQUksV0FBVyxHQUFHLEtBQUssR0FBRyxHQUFHLENB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Y2VzQ29udGVudCI6WyJpbXBvcnQgeyB2aXNpdENoaWxkcmVuIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXV0aWwvbW9ycGgtdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmRlclN0YXRlKHJlbmRlck5vZGUsIG1vcnBoTGlzdCkge1xuICAvLyBUaGUgbW9ycGggbGlzdCB0aGF0IGlzIG5vIGxvbmdlciBuZWVkZWQgYW5kIGNhbiBiZVxuICAvLyBkZXN0cm95ZWQuXG4gIHRoaXMubW9ycGhMaXN0VG9DbGVhciA9IG1vcnBoTGlzdDtcblxuICAvLyBUaGUgbW9ycGggbGlzdCB0aGF0IG5lZWRzIHRvIGJlIHBydW5lZCBvZiBhbnkgaXRlbXNcbiAgLy8gdGhhdCB3ZXJlIG5vdCB5aWVsZGVkIG9uIGEgc3Vic2VxdWVudCByZW5kZXIuXG4gIHRoaXMubW9ycGhMaXN0VG9QcnVuZSA9IG51bGw7XG5cbiAgLy8gQSBtYXAgb2YgbW9ycGhzIGZvciBlYWNoIGl0ZW0geWllbGRlZCBpbiBkdXJpbmcgdGhpc1xuICAvLyByZW5kZXJpbmcgcGFzcy4gQW55IG1vcnBocyBpbiB0aGUgRE9NIGJ1dCBub3QgaW4gdGhpcyBtYXBcbiAgLy8gd2lsbCBiZSBwcnVuZWQgZHVyaW5nIGNsZWFudXAuXG4gIHRoaXMuaGFuZGxlZE1vcnBocyA9IHt9O1xuICB0aGlzLmNvbGxpc2lvbnMgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIG1vcnBoIHRvIGNsZWFyIG9uY2UgcmVuZGVyaW5nIGlzIGNvbXBsZXRlLiBCeVxuICAvLyBkZWZhdWx0LCB3ZSBzZXQgdGhpcyB0byB0aGUgcHJldmlvdXMgbW9ycGggKHRvIGNhdGNoXG4gIC8vIHRoZSBjYXNlIHdoZXJlIG5vdGhpbmcgaXMgeWllbGRlZDsgaW4gdGhhdCBjYXNlLCB3ZVxuICAvLyBzaG91bGQganVzdCBjbGVhciB0aGUgbW9ycGgpLiBPdGhlcndpc2UgdGhpcyBnZXRzIHNldFxuICAvLyB0byBudWxsIGlmIGFueXRoaW5nIGlzIHJlbmRlcmVkLlxuICB0aGlzLm1vcnBoVG9DbGVhciA9IHJlbmRlck5vZGU7XG5cbiAgdGhpcy5zaGFkb3dPcHRpb25zID0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrRm9yKHJlbmRlciwgdGVtcGxhdGUsIGJsb2NrT3B0aW9ucykge1xuICB2YXIgYmxvY2sgPSBmdW5jdGlvbihlbnYsIGJsb2NrQXJndW1lbnRzLCBzZWxmLCByZW5kZXJOb2RlLCBwYXJlbnRTY29wZSwgdmlzaXRvcikge1xuICAgIGlmIChyZW5kZXJOb2RlLmxhc3RSZXN1bHQpIHtcbiAgICAgIHJlbmRlck5vZGUubGFzdFJlc3VsdC5yZXZhbGlkYXRlV2l0aChlbnYsIHVuZGVmaW5lZCwgc2VsZiwgYmxvY2tBcmd1bWVudHMsIHZpc2l0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHsgcmVuZGVyU3RhdGU6IG5ldyBSZW5kZXJTdGF0ZShyZW5kZXJOb2RlKSB9O1xuXG4gICAgICB2YXIgc2NvcGUgPSBibG9ja09wdGlvbnMuc2NvcGU7XG4gICAgICB2YXIgc2hhZG93U2NvcGUgPSBzY29wZSA/IGVudi5ob29rcy5jcmVhdGVDaGlsZFNjb3BlKHNjb3BlKSA6IGVudi5ob29rcy5jcmVhdGVGcmVzaFNjb3BlKCk7XG4gICAgICB2YXIgYXR0cmlidXRlcyA9IGJsb2NrT3B0aW9ucy5hdHRyaWJ1dGVzO1xuXG4gICAgICBlbnYuaG9va3MuYmluZFNoYWRvd1Njb3BlKGVudiwgcGFyZW50U2NvcGUsIHNoYWRvd1Njb3BlLCBibG9ja09wdGlvbnMub3B0aW9ucyk7XG5cbiAgICAgIGlmIChzZWxmICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZW52Lmhvb2tzLmJpbmRTZWxmKGVudiwgc2hhZG93U2NvcGUsIHNlbGYpO1xuICAgICAgfSBlbHNlIGlmIChibG9ja09wdGlvbnMuc2VsZiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVudi5ob29rcy5iaW5kU2VsZihlbnYsIHNoYWRvd1Njb3BlLCBibG9ja09wdGlvbnMuc2VsZik7XG4gICAgICB9XG5cbiAgICAgIGJpbmRCbG9ja3MoZW52LCBzaGFkb3dTY29wZSwgYmxvY2tPcHRpb25zLnlpZWxkVG8pO1xuXG4gICAgICByZW5kZXJBbmRDbGVhbnVwKHJlbmRlck5vZGUsIGVudiwgb3B0aW9ucywgbnVsbCwgZnVuY3Rpb24oKSB7XG4gICAgICAgIG9wdGlvbnMucmVuZGVyU3RhdGUubW9ycGhUb0NsZWFyID0gbnVsbDtcbiAgICAgICAgcmVuZGVyKHRlbXBsYXRlLCBlbnYsIHNoYWRvd1Njb3BlLCB7IHJlbmRlck5vZGUsIGJsb2NrQXJndW1lbnRzLCBhdHRyaWJ1dGVzIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrLmFyaXR5ID0gdGVtcGxhdGUuYXJpdHk7XG5cbiAgcmV0dXJuIGJsb2NrO1xufVxuXG5mdW5jdGlvbiBiaW5kQmxvY2tzKGVudiwgc2hhZG93U2NvcGUsIGJsb2Nrcykge1xuICBpZiAoIWJsb2Nrcykge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodHlwZW9mIGJsb2NrcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGVudi5ob29rcy5iaW5kQmxvY2soZW52LCBzaGFkb3dTY29wZSwgYmxvY2tzKTtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIGJsb2Nrcykge1xuICAgICAgaWYgKGJsb2Nrcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBlbnYuaG9va3MuYmluZEJsb2NrKGVudiwgc2hhZG93U2NvcGUsIGJsb2Nrc1tuYW1lXSwgbmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJBbmRDbGVhbnVwKG1vcnBoLCBlbnYsIG9wdGlvbnMsIHNoYWRvd09wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIC8vIFRoZSBSZW5kZXJTdGF0ZSBvYmplY3QgaXMgdXNlZCB0byBjb2xsZWN0IGluZm9ybWF0aW9uIGFib3V0IHdoYXQgdGhlXG4gIC8vIGhlbHBlciBvciBob29rIGJlaW5nIGludm9rZWQgaGFzIHlpZWxkZWQuIE9uY2UgaXQgaGFzIGZpbmlzaGVkIGVpdGhlclxuICAvLyB5aWVsZGluZyBtdWx0aXBsZSBpdGVtcyAodmlhIHlpZWxkSXRlbSkgb3IgYSBzaW5nbGUgdGVtcGxhdGUgKHZpYVxuICAvLyB5aWVsZFRlbXBsYXRlKSwgd2UgZGV0ZWN0IHdoYXQgd2FzIHJlbmRlcmVkIGFuZCBob3cgaXQgZGlmZmVycyBmcm9tXG4gIC8vIHRoZSBwcmV2aW91cyByZW5kZXIsIGNsZWFuaW5nIHVwIG9sZCBzdGF0ZSBpbiBET00gYXMgYXBwcm9wcmlhdGUuXG4gIHZhciByZW5kZXJTdGF0ZSA9IG9wdGlvbnMucmVuZGVyU3RhdGU7XG4gIHJlbmRlclN0YXRlLmNvbGxpc2lvbnMgPSB1bmRlZmluZWQ7XG4gIHJlbmRlclN0YXRlLnNoYWRvd09wdGlvbnMgPSBzaGFkb3dPcHRpb25zO1xuXG4gIC8vIEludm9rZSB0aGUgY2FsbGJhY2ssIGluc3RydWN0aW5nIGl0IHRvIHNhdmUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBpdFxuICAvLyByZW5kZXJzIGludG8gUmVuZGVyU3RhdGUuXG4gIHZhciByZXN1bHQgPSBjYWxsYmFjayhvcHRpb25zKTtcblxuICAvLyBUaGUgaG9vayBjYW4gb3B0LW91dCBvZiBjbGVhbnVwIGlmIGl0IGhhbmRsZWQgY2xlYW51cCBpdHNlbGYuXG4gIGlmIChyZXN1bHQgJiYgcmVzdWx0LmhhbmRsZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgbW9ycGhNYXAgPSBtb3JwaC5tb3JwaE1hcDtcblxuICAvLyBXYWxrIHRoZSBtb3JwaCBsaXN0LCBjbGVhcmluZyBhbnkgaXRlbXMgdGhhdCB3ZXJlIHlpZWxkZWQgaW4gYSBwcmV2aW91c1xuICAvLyByZW5kZXIgYnV0IHdlcmUgbm90IHlpZWxkZWQgZHVyaW5nIHRoaXMgcmVuZGVyLlxuICBsZXQgbW9ycGhMaXN0ID0gcmVuZGVyU3RhdGUubW9ycGhMaXN0VG9QcnVuZTtcbiAgaWYgKG1vcnBoTGlzdCkge1xuICAgIGxldCBoYW5kbGVkTW9ycGhzID0gcmVuZGVyU3RhdGUuaGFuZGxlZE1vcnBocztcbiAgICBsZXQgaXRlbSA9IG1vcnBoTGlzdC5maXJzdENoaWxkTW9ycGg7XG5cbiAgICB3aGlsZSAoaXRlbSkge1xuICAgICAgbGV0IG5leHQgPSBpdGVtLm5leHRNb3JwaDtcblxuICAgICAgLy8gSWYgd2UgZG9uJ3Qgc2VlIHRoZSBrZXkgaW4gaGFuZGxlZE1vcnBocywgaXQgd2Fzbid0XG4gICAgICAvLyB5aWVsZGVkIGluIGFuZCB3ZSBjYW4gc2FmZWx5IHJlbW92ZSBpdCBmcm9tIERPTS5cbiAgICAgIGlmICghKGl0ZW0ua2V5IGluIGhhbmRsZWRNb3JwaHMpKSB7XG4gICAgICAgIGRlbGV0ZSBtb3JwaE1hcFtpdGVtLmtleV07XG4gICAgICAgIGNsZWFyTW9ycGgoaXRlbSwgZW52LCB0cnVlKTtcbiAgICAgICAgaXRlbS5kZXN0cm95KCk7XG4gICAgICB9XG5cbiAgICAgIGl0ZW0gPSBuZXh0O1xuICAgIH1cbiAgfVxuXG4gIG1vcnBoTGlzdCA9IHJlbmRlclN0YXRlLm1vcnBoTGlzdFRvQ2xlYXI7XG4gIGlmIChtb3JwaExpc3QpIHtcbiAgICBjbGVhck1vcnBoTGlzdChtb3JwaExpc3QsIG1vcnBoLCBlbnYpO1xuICB9XG5cbiAgbGV0IHRvQ2xlYXIgPSByZW5kZXJTdGF0ZS5tb3JwaFRvQ2xlYXI7XG4gIGlmICh0b0NsZWFyKSB7XG4gICAgY2xlYXJNb3JwaCh0b0NsZWFyLCBlbnYpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhck1vcnBoKG1vcnBoLCBlbnYsIGRlc3Ryb3lTZWxmKSB7XG4gIHZhciBjbGVhbnVwID0gZW52Lmhvb2tzLmNsZWFudXBSZW5kZXJOb2RlO1xuICB2YXIgZGVzdHJveSA9IGVudi5ob29rcy5kZXN0cm95UmVuZGVyTm9kZTtcbiAgdmFyIHdpbGxDbGVhbnVwID0gZW52Lmhvb2tzLndpbGxDbGVhbnVwVHJlZTtcbiAgdmFyIGRpZENsZWFudXAgPSBlbnYuaG9va3MuZGlkQ2xlYW51cFRyZWU7XG5cbiAgZnVuY3Rpb24gZGVzdHJveU5vZGUobm9kZSkge1xuICAgIGlmIChjbGVhbnVwKSB7IGNsZWFudXAobm9kZSk7IH1cbiAgICBpZiAoZGVzdHJveSkgeyBkZXN0cm95KG5vZGUpOyB9XG4gIH1cblxuICBpZiAod2lsbENsZWFudXApIHsgd2lsbENsZWFudXAoZW52LCBtb3JwaCwgZGVzdHJveVNlbGYpOyB9XG4gIGlmIChjbGVhbnVwKSB7IGNsZWFudXAobW9ycGgpOyB9XG4gIGlmIChkZXN0cm95U2VsZiAmJiBkZXN0cm95KSB7IGRlc3Ryb3kobW9ycGgpOyB9XG5cbiAgdmlzaXRDaGlsZHJlbihtb3JwaC5jaGlsZE5vZGVzLCBkZXN0cm95Tm9kZSk7XG5cbiAgLy8gVE9ETzogRGVhbCB3aXRoIGxvZ2ljYWwgY2hpbGRyZW4gdGhhdCBhcmUgbm90IGluIHRoZSBET00gdHJlZVxuICBtb3JwaC5jbGVhcigpO1xuICBpZiAoZGlkQ2xlYW51cCkgeyBkaWRDbGVhbnVwKGVudiwgbW9ycGgsIGRlc3Ryb3lTZWxmKTsgfVxuXG4gIG1vcnBoLmxhc3RSZXN1bHQgPSBudWxsO1xuICBtb3JwaC5sYXN0WWllbGRlZCA9IG51bGw7XG4gIG1vcnBoLmNoaWxkTm9kZXMgPSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJNb3JwaExpc3QobW9ycGhMaXN0LCBtb3JwaCwgZW52KSB7XG4gIGxldCBpdGVtID0gbW9ycGhMaXN0LmZpcnN0Q2hpbGRNb3JwaDtcblxuICB3aGlsZSAoaXRlbSkge1xuICAgIGxldCBuZXh0ID0gaXRlbS5uZXh0TW9ycGg7XG4gICAgZGVsZXRlIG1vcnBoLm1vcnBoTWFwW2l0ZW0ua2V5XTtcbiAgICBjbGVhck1vcnBoKGl0ZW0sIGVudiwgdHJ1ZSk7XG4gICAgaXRlbS5kZXN0cm95KCk7XG5cbiAgICBpdGVtID0gbmV4dDtcbiAgfVxuXG4gIC8vIFJlbW92ZSB0aGUgTW9ycGhMaXN0IGZyb20gdGhlIG1vcnBoLlxuICBtb3JwaExpc3QuY2xlYXIoKTtcbiAgbW9ycGgubW9ycGhMaXN0ID0gbnVsbDtcbn1cbiJdfQ==
define("htmlbars-util/void-tag-names", ["exports", "./array-utils"], function (exports, _arrayUtils) {

  // The HTML elements in this list are speced by
  // http://www.w3.org/TR/html-markup/syntax.html#syntax-elements,
  // and will be forced to close regardless of if they have a
  // self-closing /> at the end.
  var voidTagNames = "area base br col command embed hr img input keygen link meta param source track wbr";
  var voidMap = {};

  _arrayUtils.forEach(voidTagNames.split(" "), function (tagName) {
    voidMap[tagName] = true;
  });

  exports.default = voidMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvdm9pZC10YWctbmFtZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUEsTUFBSSxZQUFZLEdBQUcscUZBQXFGLENBQUM7QUFDekcsTUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVqQixjQVRTLE9BQU8sQ0FTUixZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFVBQVMsT0FBTyxFQUFFO0FBQ2pELFdBQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUM7R0FDekIsQ0FBQyxDQUFDOztvQkFFWSxPQUFPIiwiZmlsZSI6Imh0bWxiYXJzLXV0aWwvdm9pZC10YWctbmFtZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmb3JFYWNoIH0gZnJvbSBcIi4vYXJyYXktdXRpbHNcIjtcblxuLy8gVGhlIEhUTUwgZWxlbWVudHMgaW4gdGhpcyBsaXN0IGFyZSBzcGVjZWQgYnlcbi8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWwtbWFya3VwL3N5bnRheC5odG1sI3N5bnRheC1lbGVtZW50cyxcbi8vIGFuZCB3aWxsIGJlIGZvcmNlZCB0byBjbG9zZSByZWdhcmRsZXNzIG9mIGlmIHRoZXkgaGF2ZSBhXG4vLyBzZWxmLWNsb3NpbmcgLz4gYXQgdGhlIGVuZC5cbnZhciB2b2lkVGFnTmFtZXMgPSBcImFyZWEgYmFzZSBiciBjb2wgY29tbWFuZCBlbWJlZCBociBpbWcgaW5wdXQga2V5Z2VuIGxpbmsgbWV0YSBwYXJhbSBzb3VyY2UgdHJhY2sgd2JyXCI7XG52YXIgdm9pZE1hcCA9IHt9O1xuXG5mb3JFYWNoKHZvaWRUYWdOYW1lcy5zcGxpdChcIiBcIiksIGZ1bmN0aW9uKHRhZ05hbWUpIHtcbiAgdm9pZE1hcFt0YWdOYW1lXSA9IHRydWU7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgdm9pZE1hcDtcbiJdfQ==
define("morph-attr", ["exports", "./morph-attr/sanitize-attribute-value", "./dom-helper/prop", "./dom-helper/build-html-dom", "./htmlbars-util"], function (exports, _morphAttrSanitizeAttributeValue, _domHelperProp, _domHelperBuildHtmlDom, _htmlbarsUtil) {

  function getProperty() {
    return this.domHelper.getPropertyStrict(this.element, this.attrName);
  }

  function updateProperty(value) {
    if (this._renderedInitially === true || !_domHelperProp.isAttrRemovalValue(value)) {
      // do not render if initial value is undefined or null
      this.domHelper.setPropertyStrict(this.element, this.attrName, value);
    }

    this._renderedInitially = true;
  }

  function getAttribute() {
    return this.domHelper.getAttribute(this.element, this.attrName);
  }

  function updateAttribute(value) {
    if (_domHelperProp.isAttrRemovalValue(value)) {
      this.domHelper.removeAttribute(this.element, this.attrName);
    } else {
      this.domHelper.setAttribute(this.element, this.attrName, value);
    }
  }

  function getAttributeNS() {
    return this.domHelper.getAttributeNS(this.element, this.namespace, this.attrName);
  }

  function updateAttributeNS(value) {
    if (_domHelperProp.isAttrRemovalValue(value)) {
      this.domHelper.removeAttribute(this.element, this.attrName);
    } else {
      this.domHelper.setAttributeNS(this.element, this.namespace, this.attrName, value);
    }
  }

  var UNSET = { unset: true };

  var guid = 1;

  function AttrMorph(element, attrName, domHelper, namespace) {
    this.element = element;
    this.domHelper = domHelper;
    this.namespace = namespace !== undefined ? namespace : _htmlbarsUtil.getAttrNamespace(attrName);
    this.state = {};
    this.isDirty = false;
    this.isSubtreeDirty = false;
    this.escaped = true;
    this.lastValue = UNSET;
    this.lastResult = null;
    this.lastYielded = null;
    this.childNodes = null;
    this.linkedParams = null;
    this.linkedResult = null;
    this.guid = "attr" + guid++;
    this.ownerNode = null;
    this.rendered = false;
    this._renderedInitially = false;

    if (this.namespace) {
      this._update = updateAttributeNS;
      this._get = getAttributeNS;
      this.attrName = attrName;
    } else {
      var _normalizeProperty = _domHelperProp.normalizeProperty(this.element, attrName);

      var normalized = _normalizeProperty.normalized;
      var type = _normalizeProperty.type;

      if (element.namespaceURI === _domHelperBuildHtmlDom.svgNamespace || attrName === 'style' || type === 'attr') {
        this._update = updateAttribute;
        this._get = getAttribute;
        this.attrName = normalized;
      } else {
        this._update = updateProperty;
        this._get = getProperty;
        this.attrName = normalized;
      }
    }
  }

  AttrMorph.prototype.setContent = function (value) {
    if (this.lastValue === value) {
      return;
    }
    this.lastValue = value;

    if (this.escaped) {
      var sanitized = _morphAttrSanitizeAttributeValue.sanitizeAttributeValue(this.domHelper, this.element, this.attrName, value);
      this._update(sanitized, this.namespace);
    } else {
      this._update(value, this.namespace);
    }
  };

  AttrMorph.prototype.getContent = function () {
    var value = this.lastValue = this._get();
    return value;
  };

  // renderAndCleanup calls `clear` on all items in the morph map
  // just before calling `destroy` on the morph.
  //
  // As a future refactor this could be changed to set the property
  // back to its original/default value.
  AttrMorph.prototype.clear = function () {};

  AttrMorph.prototype.destroy = function () {
    this.element = null;
    this.domHelper = null;
  };

  exports.default = AttrMorph;
  exports.sanitizeAttributeValue = _morphAttrSanitizeAttributeValue.sanitizeAttributeValue;
});
//# sourceMappingURL=data:application/json;base64,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S0FBSyxFQUFFO0FBQ2hELFFBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUU7QUFBRSxhQUFPO0tBQUU7QUFDekMsUUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7O0FBRXZCLFFBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixVQUFJLFNBQVMsR0FBRyxpQ0ExRlgsc0JBQXNCLENBMEZZLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzNGLFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN6QyxNQUFNO0FBQ0wsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3JDO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxZQUFZO0FBQzNDLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3pDLFdBQU8sS0FBSyxDQUFDO0dBQ2QsQ0FBQzs7Ozs7OztBQU9GLFdBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVcsRUFBRyxDQUFDOztBQUUzQyxXQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFXO0FBQ3ZDLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0dBQ3ZCLENBQUM7O29CQUVhLFNBQVM7VUFFZixzQkFBc0Isb0NBcEh0QixzQkFBc0IiLCJmaWxlIjoibW9ycGgtYXR0ci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNhbml0aXplQXR0cmlidXRlVmFsdWUgfSBmcm9tIFwiLi9tb3JwaC1hdHRyL3Nhbml0aXplLWF0dHJpYnV0ZS12YWx1ZVwiO1xuaW1wb3J0IHsgaXNBdHRyUmVtb3ZhbFZhbHVlLCBub3JtYWxpemVQcm9wZXJ0eSB9IGZyb20gXCIuL2RvbS1oZWxwZXIvcHJvcFwiO1xuaW1wb3J0IHsgc3ZnTmFtZXNwYWNlIH0gZnJvbSBcIi4vZG9tLWhlbHBlci9idWlsZC1odG1sLWRvbVwiO1xuaW1wb3J0IHsgZ2V0QXR0ck5hbWVzcGFjZSB9IGZyb20gXCIuL2h0bWxiYXJzLXV0aWxcIjtcblxuZnVuY3Rpb24gZ2V0UHJvcGVydHkoKSB7XG4gIHJldHVybiB0aGlzLmRvbUhlbHBlci5nZXRQcm9wZXJ0eVN0cmljdCh0aGlzLmVsZW1lbnQsIHRoaXMuYXR0ck5hbWUpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVQcm9wZXJ0eSh2YWx1ZSkge1xuICBpZiAodGhpcy5fcmVuZGVyZWRJbml0aWFsbHkgPT09IHRydWUgfHwgIWlzQXR0clJlbW92YWxWYWx1ZSh2YWx1ZSkpIHtcbiAgICAvLyBkbyBub3QgcmVuZGVyIGlmIGluaXRpYWwgdmFsdWUgaXMgdW5kZWZpbmVkIG9yIG51bGxcbiAgICB0aGlzLmRvbUhlbHBlci5zZXRQcm9wZXJ0eVN0cmljdCh0aGlzLmVsZW1lbnQsIHRoaXMuYXR0ck5hbWUsIHZhbHVlKTtcbiAgfVxuXG4gIHRoaXMuX3JlbmRlcmVkSW5pdGlhbGx5ID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZ2V0QXR0cmlidXRlKCkge1xuICByZXR1cm4gdGhpcy5kb21IZWxwZXIuZ2V0QXR0cmlidXRlKHRoaXMuZWxlbWVudCwgdGhpcy5hdHRyTmFtZSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZSh2YWx1ZSkge1xuICBpZiAoaXNBdHRyUmVtb3ZhbFZhbHVlKHZhbHVlKSkge1xuICAgIHRoaXMuZG9tSGVscGVyLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmVsZW1lbnQsIHRoaXMuYXR0ck5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZG9tSGVscGVyLnNldEF0dHJpYnV0ZSh0aGlzLmVsZW1lbnQsIHRoaXMuYXR0ck5hbWUsIHZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRBdHRyaWJ1dGVOUygpIHtcbiAgcmV0dXJuIHRoaXMuZG9tSGVscGVyLmdldEF0dHJpYnV0ZU5TKHRoaXMuZWxlbWVudCwgdGhpcy5uYW1lc3BhY2UsIHRoaXMuYXR0ck5hbWUpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVBdHRyaWJ1dGVOUyh2YWx1ZSkge1xuICBpZiAoaXNBdHRyUmVtb3ZhbFZhbHVlKHZhbHVlKSkge1xuICAgIHRoaXMuZG9tSGVscGVyLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmVsZW1lbnQsIHRoaXMuYXR0ck5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZG9tSGVscGVyLnNldEF0dHJpYnV0ZU5TKHRoaXMuZWxlbWVudCwgdGhpcy5uYW1lc3BhY2UsIHRoaXMuYXR0ck5hbWUsIHZhbHVlKTtcbiAgfVxufVxuXG52YXIgVU5TRVQgPSB7IHVuc2V0OiB0cnVlIH07XG5cbnZhciBndWlkID0gMTtcblxuZnVuY3Rpb24gQXR0ck1vcnBoKGVsZW1lbnQsIGF0dHJOYW1lLCBkb21IZWxwZXIsIG5hbWVzcGFjZSkge1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB0aGlzLmRvbUhlbHBlciA9IGRvbUhlbHBlcjtcbiAgdGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2UgIT09IHVuZGVmaW5lZCA/IG5hbWVzcGFjZSA6IGdldEF0dHJOYW1lc3BhY2UoYXR0ck5hbWUpO1xuICB0aGlzLnN0YXRlID0ge307XG4gIHRoaXMuaXNEaXJ0eSA9IGZhbHNlO1xuICB0aGlzLmlzU3VidHJlZURpcnR5ID0gZmFsc2U7XG4gIHRoaXMuZXNjYXBlZCA9IHRydWU7XG4gIHRoaXMubGFzdFZhbHVlID0gVU5TRVQ7XG4gIHRoaXMubGFzdFJlc3VsdCA9IG51bGw7XG4gIHRoaXMubGFzdFlpZWxkZWQgPSBudWxsO1xuICB0aGlzLmNoaWxkTm9kZXMgPSBudWxsO1xuICB0aGlzLmxpbmtlZFBhcmFtcyA9IG51bGw7XG4gIHRoaXMubGlua2VkUmVzdWx0ID0gbnVsbDtcbiAgdGhpcy5ndWlkID0gXCJhdHRyXCIgKyBndWlkKys7XG4gIHRoaXMub3duZXJOb2RlID0gbnVsbDtcbiAgdGhpcy5yZW5kZXJlZCA9IGZhbHNlO1xuICB0aGlzLl9yZW5kZXJlZEluaXRpYWxseSA9IGZhbHNlO1xuXG5cbiAgaWYgKHRoaXMubmFtZXNwYWNlKSB7XG4gICAgdGhpcy5fdXBkYXRlID0gdXBkYXRlQXR0cmlidXRlTlM7XG4gICAgdGhpcy5fZ2V0ID0gZ2V0QXR0cmlidXRlTlM7XG4gICAgdGhpcy5hdHRyTmFtZSA9IGF0dHJOYW1lO1xuICB9IGVsc2Uge1xuICAgIHZhciB7IG5vcm1hbGl6ZWQsIHR5cGUgfSA9IG5vcm1hbGl6ZVByb3BlcnR5KHRoaXMuZWxlbWVudCwgYXR0ck5hbWUpO1xuXG4gICAgaWYgKGVsZW1lbnQubmFtZXNwYWNlVVJJID09PSBzdmdOYW1lc3BhY2UgfHwgYXR0ck5hbWUgPT09ICdzdHlsZScgfHwgdHlwZSA9PT0gJ2F0dHInKSB7XG4gICAgICB0aGlzLl91cGRhdGUgPSB1cGRhdGVBdHRyaWJ1dGU7XG4gICAgICB0aGlzLl9nZXQgPSBnZXRBdHRyaWJ1dGU7XG4gICAgICB0aGlzLmF0dHJOYW1lID0gbm9ybWFsaXplZCA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VwZGF0ZSA9IHVwZGF0ZVByb3BlcnR5O1xuICAgICAgdGhpcy5fZ2V0ID0gZ2V0UHJvcGVydHk7XG4gICAgICB0aGlzLmF0dHJOYW1lID0gbm9ybWFsaXplZCA7XG4gICAgfVxuICB9XG59XG5cbkF0dHJNb3JwaC5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodGhpcy5sYXN0VmFsdWUgPT09IHZhbHVlKSB7IHJldHVybjsgfVxuICB0aGlzLmxhc3RWYWx1ZSA9IHZhbHVlO1xuXG4gIGlmICh0aGlzLmVzY2FwZWQpIHtcbiAgICB2YXIgc2FuaXRpemVkID0gc2FuaXRpemVBdHRyaWJ1dGVWYWx1ZSh0aGlzLmRvbUhlbHBlciwgdGhpcy5lbGVtZW50LCB0aGlzLmF0dHJOYW1lLCB2YWx1ZSk7XG4gICAgdGhpcy5fdXBkYXRlKHNhbml0aXplZCwgdGhpcy5uYW1lc3BhY2UpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX3VwZGF0ZSh2YWx1ZSwgdGhpcy5uYW1lc3BhY2UpO1xuICB9XG59O1xuXG5BdHRyTW9ycGgucHJvdG90eXBlLmdldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB2YWx1ZSA9IHRoaXMubGFzdFZhbHVlID0gdGhpcy5fZ2V0KCk7XG4gIHJldHVybiB2YWx1ZTtcbn07XG5cbi8vIHJlbmRlckFuZENsZWFudXAgY2FsbHMgYGNsZWFyYCBvbiBhbGwgaXRlbXMgaW4gdGhlIG1vcnBoIG1hcFxuLy8ganVzdCBiZWZvcmUgY2FsbGluZyBgZGVzdHJveWAgb24gdGhlIG1vcnBoLlxuLy9cbi8vIEFzIGEgZnV0dXJlIHJlZmFjdG9yIHRoaXMgY291bGQgYmUgY2hhbmdlZCB0byBzZXQgdGhlIHByb3BlcnR5XG4vLyBiYWNrIHRvIGl0cyBvcmlnaW5hbC9kZWZhdWx0IHZhbHVlLlxuQXR0ck1vcnBoLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkgeyB9O1xuXG5BdHRyTW9ycGgucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgdGhpcy5kb21IZWxwZXIgPSBudWxsO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQXR0ck1vcnBoO1xuXG5leHBvcnQgeyBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlIH07XG4iXX0=
define('morph-attr/sanitize-attribute-value', ['exports'], function (exports) {
  exports.sanitizeAttributeValue = sanitizeAttributeValue;
  /* jshint scripturl:true */

  var badProtocols = {
    'javascript:': true,
    'vbscript:': true
  };

  var badTags = {
    'A': true,
    'BODY': true,
    'LINK': true,
    'IMG': true,
    'IFRAME': true,
    'BASE': true,
    'FORM': true
  };

  var badTagsForDataURI = {
    'EMBED': true
  };

  var badAttributes = {
    'href': true,
    'src': true,
    'background': true,
    'action': true
  };

  exports.badAttributes = badAttributes;
  var badAttributesForDataURI = {
    'src': true
  };

  function sanitizeAttributeValue(dom, element, attribute, value) {
    var tagName;

    if (!element) {
      tagName = null;
    } else {
      tagName = element.tagName.toUpperCase();
    }

    if (value && value.toHTML) {
      return value.toHTML();
    }

    if ((tagName === null || badTags[tagName]) && badAttributes[attribute]) {
      var protocol = dom.protocolForURL(value);
      if (badProtocols[protocol] === true) {
        return 'unsafe:' + value;
      }
    }

    if (badTagsForDataURI[tagName] && badAttributesForDataURI[attribute]) {
      return 'unsafe:' + value;
    }

    return value;
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLWF0dHIvc2FuaXRpemUtYXR0cmlidXRlLXZhbHVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7VUFnQ2dCLHNCQUFzQixHQUF0QixzQkFBc0I7OztBQTlCdEMsTUFBSSxZQUFZLEdBQUc7QUFDakIsaUJBQWEsRUFBRSxJQUFJO0FBQ25CLGVBQVcsRUFBRSxJQUFJO0dBQ2xCLENBQUM7O0FBRUYsTUFBSSxPQUFPLEdBQUc7QUFDWixPQUFHLEVBQUUsSUFBSTtBQUNULFVBQU0sRUFBRSxJQUFJO0FBQ1osVUFBTSxFQUFFLElBQUk7QUFDWixTQUFLLEVBQUUsSUFBSTtBQUNYLFlBQVEsRUFBRSxJQUFJO0FBQ2QsVUFBTSxFQUFFLElBQUk7QUFDWixVQUFNLEVBQUUsSUFBSTtHQUNiLENBQUM7O0FBRUYsTUFBSSxpQkFBaUIsR0FBRztBQUN0QixXQUFPLEVBQUUsSUFBSTtHQUNkLENBQUM7O0FBRUssTUFBSSxhQUFhLEdBQUc7QUFDekIsVUFBTSxFQUFFLElBQUk7QUFDWixTQUFLLEVBQUUsSUFBSTtBQUNYLGdCQUFZLEVBQUUsSUFBSTtBQUNsQixZQUFRLEVBQUUsSUFBSTtHQUNmLENBQUM7O1VBTFMsYUFBYSxHQUFiLGFBQWE7QUFPeEIsTUFBSSx1QkFBdUIsR0FBRztBQUM1QixTQUFLLEVBQUUsSUFBSTtHQUNaLENBQUM7O0FBRUssV0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUU7QUFDckUsUUFBSSxPQUFPLENBQUM7O0FBRVosUUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLGFBQU8sR0FBRyxJQUFJLENBQUM7S0FDaEIsTUFBTTtBQUNMLGFBQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3pDOztBQUVELFFBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDekIsYUFBTyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDdkI7O0FBRUQsUUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBLElBQUssYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ3RFLFVBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekMsVUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxFQUFFO0FBQ25DLGVBQU8sU0FBUyxHQUFHLEtBQUssQ0FBQztPQUMxQjtLQUNGOztBQUVELFFBQUksaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksdUJBQXVCLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDcEUsYUFBTyxTQUFTLEdBQUcsS0FBSyxDQUFDO0tBQzFCOztBQUVELFdBQU8sS0FBSyxDQUFDO0dBQ2QiLCJmaWxlIjoibW9ycGgtYXR0ci9zYW5pdGl6ZS1hdHRyaWJ1dGUtdmFsdWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBqc2hpbnQgc2NyaXB0dXJsOnRydWUgKi9cblxudmFyIGJhZFByb3RvY29scyA9IHtcbiAgJ2phdmFzY3JpcHQ6JzogdHJ1ZSxcbiAgJ3Zic2NyaXB0Oic6IHRydWVcbn07XG5cbnZhciBiYWRUYWdzID0ge1xuICAnQSc6IHRydWUsXG4gICdCT0RZJzogdHJ1ZSxcbiAgJ0xJTksnOiB0cnVlLFxuICAnSU1HJzogdHJ1ZSxcbiAgJ0lGUkFNRSc6IHRydWUsXG4gICdCQVNFJzogdHJ1ZSxcbiAgJ0ZPUk0nOiB0cnVlXG59O1xuXG52YXIgYmFkVGFnc0ZvckRhdGFVUkkgPSB7XG4gICdFTUJFRCc6IHRydWVcbn07XG5cbmV4cG9ydCB2YXIgYmFkQXR0cmlidXRlcyA9IHtcbiAgJ2hyZWYnOiB0cnVlLFxuICAnc3JjJzogdHJ1ZSxcbiAgJ2JhY2tncm91bmQnOiB0cnVlLFxuICAnYWN0aW9uJzogdHJ1ZVxufTtcblxudmFyIGJhZEF0dHJpYnV0ZXNGb3JEYXRhVVJJID0ge1xuICAnc3JjJzogdHJ1ZVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQXR0cmlidXRlVmFsdWUoZG9tLCBlbGVtZW50LCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gIHZhciB0YWdOYW1lO1xuXG4gIGlmICghZWxlbWVudCkge1xuICAgIHRhZ05hbWUgPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIHRhZ05hbWUgPSBlbGVtZW50LnRhZ05hbWUudG9VcHBlckNhc2UoKTtcbiAgfVxuXG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS50b0hUTUwpIHtcbiAgICByZXR1cm4gdmFsdWUudG9IVE1MKCk7XG4gIH1cblxuICBpZiAoKHRhZ05hbWUgPT09IG51bGwgfHwgYmFkVGFnc1t0YWdOYW1lXSkgJiYgYmFkQXR0cmlidXRlc1thdHRyaWJ1dGVdKSB7XG4gICAgdmFyIHByb3RvY29sID0gZG9tLnByb3RvY29sRm9yVVJMKHZhbHVlKTtcbiAgICBpZiAoYmFkUHJvdG9jb2xzW3Byb3RvY29sXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuICd1bnNhZmU6JyArIHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChiYWRUYWdzRm9yRGF0YVVSSVt0YWdOYW1lXSAmJiBiYWRBdHRyaWJ1dGVzRm9yRGF0YVVSSVthdHRyaWJ1dGVdKSB7XG4gICAgcmV0dXJuICd1bnNhZmU6JyArIHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuIl19
define('morph-range', ['exports', './morph-range/utils'], function (exports, _morphRangeUtils) {

  // constructor just initializes the fields
  // use one of the static initializers to create a valid morph.
  function Morph(domHelper, contextualElement) {
    this.domHelper = domHelper;
    // context if content if current content is detached
    this.contextualElement = contextualElement;
    // inclusive range of morph
    // these should be nodeType 1, 3, or 8
    this.firstNode = null;
    this.lastNode = null;

    // flag to force text to setContent to be treated as html
    this.parseTextAsHTML = false;

    // morph list graph
    this.parentMorphList = null;
    this.previousMorph = null;
    this.nextMorph = null;
  }

  Morph.empty = function (domHelper, contextualElement) {
    var morph = new Morph(domHelper, contextualElement);
    morph.clear();
    return morph;
  };

  Morph.create = function (domHelper, contextualElement, node) {
    var morph = new Morph(domHelper, contextualElement);
    morph.setNode(node);
    return morph;
  };

  Morph.attach = function (domHelper, contextualElement, firstNode, lastNode) {
    var morph = new Morph(domHelper, contextualElement);
    morph.setRange(firstNode, lastNode);
    return morph;
  };

  Morph.prototype.setContent = function Morph$setContent(content) {
    if (content === null || content === undefined) {
      return this.clear();
    }

    var type = typeof content;
    switch (type) {
      case 'string':
        if (this.parseTextAsHTML) {
          return this.domHelper.setMorphHTML(this, content);
        }
        return this.setText(content);
      case 'object':
        if (typeof content.nodeType === 'number') {
          return this.setNode(content);
        }
        /* Handlebars.SafeString */
        if (typeof content.string === 'string') {
          return this.setHTML(content.string);
        }
        if (this.parseTextAsHTML) {
          return this.setHTML(content.toString());
        }
      /* falls through */
      case 'boolean':
      case 'number':
        return this.setText(content.toString());
      default:
        throw new TypeError('unsupported content');
    }
  };

  Morph.prototype.clear = function Morph$clear() {
    var node = this.setNode(this.domHelper.createComment(''));
    return node;
  };

  Morph.prototype.setText = function Morph$setText(text) {
    var firstNode = this.firstNode;
    var lastNode = this.lastNode;

    if (firstNode && lastNode === firstNode && firstNode.nodeType === 3) {
      firstNode.nodeValue = text;
      return firstNode;
    }

    return this.setNode(text ? this.domHelper.createTextNode(text) : this.domHelper.createComment(''));
  };

  Morph.prototype.setNode = function Morph$setNode(newNode) {
    var firstNode, lastNode;
    switch (newNode.nodeType) {
      case 3:
        firstNode = newNode;
        lastNode = newNode;
        break;
      case 11:
        firstNode = newNode.firstChild;
        lastNode = newNode.lastChild;
        if (firstNode === null) {
          firstNode = this.domHelper.createComment('');
          newNode.appendChild(firstNode);
          lastNode = firstNode;
        }
        break;
      default:
        firstNode = newNode;
        lastNode = newNode;
        break;
    }

    this.setRange(firstNode, lastNode);

    return newNode;
  };

  Morph.prototype.setRange = function (firstNode, lastNode) {
    var previousFirstNode = this.firstNode;
    if (previousFirstNode !== null) {

      var parentNode = previousFirstNode.parentNode;
      if (parentNode !== null) {
        _morphRangeUtils.insertBefore(parentNode, firstNode, lastNode, previousFirstNode);
        _morphRangeUtils.clear(parentNode, previousFirstNode, this.lastNode);
      }
    }

    this.firstNode = firstNode;
    this.lastNode = lastNode;

    if (this.parentMorphList) {
      this._syncFirstNode();
      this._syncLastNode();
    }
  };

  Morph.prototype.destroy = function Morph$destroy() {
    this.unlink();

    var firstNode = this.firstNode;
    var lastNode = this.lastNode;
    var parentNode = firstNode && firstNode.parentNode;

    this.firstNode = null;
    this.lastNode = null;

    _morphRangeUtils.clear(parentNode, firstNode, lastNode);
  };

  Morph.prototype.unlink = function Morph$unlink() {
    var parentMorphList = this.parentMorphList;
    var previousMorph = this.previousMorph;
    var nextMorph = this.nextMorph;

    if (previousMorph) {
      if (nextMorph) {
        previousMorph.nextMorph = nextMorph;
        nextMorph.previousMorph = previousMorph;
      } else {
        previousMorph.nextMorph = null;
        parentMorphList.lastChildMorph = previousMorph;
      }
    } else {
      if (nextMorph) {
        nextMorph.previousMorph = null;
        parentMorphList.firstChildMorph = nextMorph;
      } else if (parentMorphList) {
        parentMorphList.lastChildMorph = parentMorphList.firstChildMorph = null;
      }
    }

    this.parentMorphList = null;
    this.nextMorph = null;
    this.previousMorph = null;

    if (parentMorphList && parentMorphList.mountedMorph) {
      if (!parentMorphList.firstChildMorph) {
        // list is empty
        parentMorphList.mountedMorph.clear();
        return;
      } else {
        parentMorphList.firstChildMorph._syncFirstNode();
        parentMorphList.lastChildMorph._syncLastNode();
      }
    }
  };

  Morph.prototype.setHTML = function (text) {
    var fragment = this.domHelper.parseHTML(text, this.contextualElement);
    return this.setNode(fragment);
  };

  Morph.prototype.setMorphList = function Morph$appendMorphList(morphList) {
    morphList.mountedMorph = this;
    this.clear();

    var originalFirstNode = this.firstNode;

    if (morphList.firstChildMorph) {
      this.firstNode = morphList.firstChildMorph.firstNode;
      this.lastNode = morphList.lastChildMorph.lastNode;

      var current = morphList.firstChildMorph;

      while (current) {
        var next = current.nextMorph;
        current.insertBeforeNode(originalFirstNode, null);
        current = next;
      }
      originalFirstNode.parentNode.removeChild(originalFirstNode);
    }
  };

  Morph.prototype._syncFirstNode = function Morph$syncFirstNode() {
    var morph = this;
    var parentMorphList;
    while (parentMorphList = morph.parentMorphList) {
      if (parentMorphList.mountedMorph === null) {
        break;
      }
      if (morph !== parentMorphList.firstChildMorph) {
        break;
      }
      if (morph.firstNode === parentMorphList.mountedMorph.firstNode) {
        break;
      }

      parentMorphList.mountedMorph.firstNode = morph.firstNode;

      morph = parentMorphList.mountedMorph;
    }
  };

  Morph.prototype._syncLastNode = function Morph$syncLastNode() {
    var morph = this;
    var parentMorphList;
    while (parentMorphList = morph.parentMorphList) {
      if (parentMorphList.mountedMorph === null) {
        break;
      }
      if (morph !== parentMorphList.lastChildMorph) {
        break;
      }
      if (morph.lastNode === parentMorphList.mountedMorph.lastNode) {
        break;
      }

      parentMorphList.mountedMorph.lastNode = morph.lastNode;

      morph = parentMorphList.mountedMorph;
    }
  };

  Morph.prototype.insertBeforeNode = function Morph$insertBeforeNode(parentNode, refNode) {
    _morphRangeUtils.insertBefore(parentNode, this.firstNode, this.lastNode, refNode);
  };

  Morph.prototype.appendToNode = function Morph$appendToNode(parentNode) {
    _morphRangeUtils.insertBefore(parentNode, this.firstNode, this.lastNode, null);
  };

  exports.default = Morph;
});
//# sourceMappingURL=data:application/json;base64,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QUFLLENBQUMsZUFBZSxFQUFFO0FBQzlDLFVBQUksZUFBZSxDQUFDLFlBQVksS0FBSyxJQUFJLEVBQUU7QUFDekMsY0FBTTtPQUNQO0FBQ0QsVUFBSSxLQUFLLEtBQUssZUFBZSxDQUFDLGNBQWMsRUFBRTtBQUM1QyxjQUFNO09BQ1A7QUFDRCxVQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssZUFBZSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUU7QUFDNUQsY0FBTTtPQUNQOztBQUVELHFCQUFlLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDOztBQUV2RCxXQUFLLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQztLQUN0QztHQUNGLENBQUM7O0FBRUYsT0FBSyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUU7QUFDdEYscUJBbFFjLFlBQVksQ0FrUWIsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztHQUNsRSxDQUFDOztBQUVGLE9BQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFNBQVMsa0JBQWtCLENBQUMsVUFBVSxFQUFFO0FBQ3JFLHFCQXRRYyxZQUFZLENBc1FiLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDL0QsQ0FBQzs7b0JBRWEsS0FBSyIsImZpbGUiOiJtb3JwaC1yYW5nZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNsZWFyLCBpbnNlcnRCZWZvcmUgfSBmcm9tICcuL21vcnBoLXJhbmdlL3V0aWxzJztcblxuLy8gY29uc3RydWN0b3IganVzdCBpbml0aWFsaXplcyB0aGUgZmllbGRzXG4vLyB1c2Ugb25lIG9mIHRoZSBzdGF0aWMgaW5pdGlhbGl6ZXJzIHRvIGNyZWF0ZSBhIHZhbGlkIG1vcnBoLlxuZnVuY3Rpb24gTW9ycGgoZG9tSGVscGVyLCBjb250ZXh0dWFsRWxlbWVudCkge1xuICB0aGlzLmRvbUhlbHBlciA9IGRvbUhlbHBlcjtcbiAgLy8gY29udGV4dCBpZiBjb250ZW50IGlmIGN1cnJlbnQgY29udGVudCBpcyBkZXRhY2hlZFxuICB0aGlzLmNvbnRleHR1YWxFbGVtZW50ID0gY29udGV4dHVhbEVsZW1lbnQ7XG4gIC8vIGluY2x1c2l2ZSByYW5nZSBvZiBtb3JwaFxuICAvLyB0aGVzZSBzaG91bGQgYmUgbm9kZVR5cGUgMSwgMywgb3IgOFxuICB0aGlzLmZpcnN0Tm9kZSA9IG51bGw7XG4gIHRoaXMubGFzdE5vZGUgID0gbnVsbDtcblxuICAvLyBmbGFnIHRvIGZvcmNlIHRleHQgdG8gc2V0Q29udGVudCB0byBiZSB0cmVhdGVkIGFzIGh0bWxcbiAgdGhpcy5wYXJzZVRleHRBc0hUTUwgPSBmYWxzZTtcblxuICAvLyBtb3JwaCBsaXN0IGdyYXBoXG4gIHRoaXMucGFyZW50TW9ycGhMaXN0ID0gbnVsbDtcbiAgdGhpcy5wcmV2aW91c01vcnBoICAgPSBudWxsO1xuICB0aGlzLm5leHRNb3JwaCAgICAgICA9IG51bGw7XG59XG5cbk1vcnBoLmVtcHR5ID0gZnVuY3Rpb24gKGRvbUhlbHBlciwgY29udGV4dHVhbEVsZW1lbnQpIHtcbiAgdmFyIG1vcnBoID0gbmV3IE1vcnBoKGRvbUhlbHBlciwgY29udGV4dHVhbEVsZW1lbnQpO1xuICBtb3JwaC5jbGVhcigpO1xuICByZXR1cm4gbW9ycGg7XG59O1xuXG5Nb3JwaC5jcmVhdGUgPSBmdW5jdGlvbiAoZG9tSGVscGVyLCBjb250ZXh0dWFsRWxlbWVudCwgbm9kZSkge1xuICB2YXIgbW9ycGggPSBuZXcgTW9ycGgoZG9tSGVscGVyLCBjb250ZXh0dWFsRWxlbWVudCk7XG4gIG1vcnBoLnNldE5vZGUobm9kZSk7XG4gIHJldHVybiBtb3JwaDtcbn07XG5cbk1vcnBoLmF0dGFjaCA9IGZ1bmN0aW9uIChkb21IZWxwZXIsIGNvbnRleHR1YWxFbGVtZW50LCBmaXJzdE5vZGUsIGxhc3ROb2RlKSB7XG4gIHZhciBtb3JwaCA9IG5ldyBNb3JwaChkb21IZWxwZXIsIGNvbnRleHR1YWxFbGVtZW50KTtcbiAgbW9ycGguc2V0UmFuZ2UoZmlyc3ROb2RlLCBsYXN0Tm9kZSk7XG4gIHJldHVybiBtb3JwaDtcbn07XG5cbk1vcnBoLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gTW9ycGgkc2V0Q29udGVudChjb250ZW50KSB7XG4gIGlmIChjb250ZW50ID09PSBudWxsIHx8IGNvbnRlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB0aGlzLmNsZWFyKCk7XG4gIH1cblxuICB2YXIgdHlwZSA9IHR5cGVvZiBjb250ZW50O1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgaWYgKHRoaXMucGFyc2VUZXh0QXNIVE1MKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRvbUhlbHBlci5zZXRNb3JwaEhUTUwodGhpcywgY29udGVudCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zZXRUZXh0KGNvbnRlbnQpO1xuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICBpZiAodHlwZW9mIGNvbnRlbnQubm9kZVR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldE5vZGUoY29udGVudCk7XG4gICAgICB9XG4gICAgICAvKiBIYW5kbGViYXJzLlNhZmVTdHJpbmcgKi9cbiAgICAgIGlmICh0eXBlb2YgY29udGVudC5zdHJpbmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEhUTUwoY29udGVudC5zdHJpbmcpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGFyc2VUZXh0QXNIVE1MKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEhUTUwoY29udGVudC50b1N0cmluZygpKTtcbiAgICAgIH1cbiAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIHRoaXMuc2V0VGV4dChjb250ZW50LnRvU3RyaW5nKCkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bnN1cHBvcnRlZCBjb250ZW50Jyk7XG4gIH1cbn07XG5cbk1vcnBoLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIE1vcnBoJGNsZWFyKCkge1xuICB2YXIgbm9kZSA9IHRoaXMuc2V0Tm9kZSh0aGlzLmRvbUhlbHBlci5jcmVhdGVDb21tZW50KCcnKSk7XG4gIHJldHVybiBub2RlO1xufTtcblxuTW9ycGgucHJvdG90eXBlLnNldFRleHQgPSBmdW5jdGlvbiBNb3JwaCRzZXRUZXh0KHRleHQpIHtcbiAgdmFyIGZpcnN0Tm9kZSA9IHRoaXMuZmlyc3ROb2RlO1xuICB2YXIgbGFzdE5vZGUgPSB0aGlzLmxhc3ROb2RlO1xuXG4gIGlmIChmaXJzdE5vZGUgJiZcbiAgICAgIGxhc3ROb2RlID09PSBmaXJzdE5vZGUgJiZcbiAgICAgIGZpcnN0Tm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgIGZpcnN0Tm9kZS5ub2RlVmFsdWUgPSB0ZXh0O1xuICAgIHJldHVybiBmaXJzdE5vZGU7XG4gIH1cblxuICByZXR1cm4gdGhpcy5zZXROb2RlKFxuICAgIHRleHQgPyB0aGlzLmRvbUhlbHBlci5jcmVhdGVUZXh0Tm9kZSh0ZXh0KSA6IHRoaXMuZG9tSGVscGVyLmNyZWF0ZUNvbW1lbnQoJycpXG4gICk7XG59O1xuXG5Nb3JwaC5wcm90b3R5cGUuc2V0Tm9kZSA9IGZ1bmN0aW9uIE1vcnBoJHNldE5vZGUobmV3Tm9kZSkge1xuICB2YXIgZmlyc3ROb2RlLCBsYXN0Tm9kZTtcbiAgc3dpdGNoIChuZXdOb2RlLm5vZGVUeXBlKSB7XG4gICAgY2FzZSAzOlxuICAgICAgZmlyc3ROb2RlID0gbmV3Tm9kZTtcbiAgICAgIGxhc3ROb2RlID0gbmV3Tm9kZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMTE6XG4gICAgICBmaXJzdE5vZGUgPSBuZXdOb2RlLmZpcnN0Q2hpbGQ7XG4gICAgICBsYXN0Tm9kZSA9IG5ld05vZGUubGFzdENoaWxkO1xuICAgICAgaWYgKGZpcnN0Tm9kZSA9PT0gbnVsbCkge1xuICAgICAgICBmaXJzdE5vZGUgPSB0aGlzLmRvbUhlbHBlci5jcmVhdGVDb21tZW50KCcnKTtcbiAgICAgICAgbmV3Tm9kZS5hcHBlbmRDaGlsZChmaXJzdE5vZGUpO1xuICAgICAgICBsYXN0Tm9kZSA9IGZpcnN0Tm9kZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBmaXJzdE5vZGUgPSBuZXdOb2RlO1xuICAgICAgbGFzdE5vZGUgPSBuZXdOb2RlO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICB0aGlzLnNldFJhbmdlKGZpcnN0Tm9kZSwgbGFzdE5vZGUpO1xuXG4gIHJldHVybiBuZXdOb2RlO1xufTtcblxuTW9ycGgucHJvdG90eXBlLnNldFJhbmdlID0gZnVuY3Rpb24gKGZpcnN0Tm9kZSwgbGFzdE5vZGUpIHtcbiAgdmFyIHByZXZpb3VzRmlyc3ROb2RlID0gdGhpcy5maXJzdE5vZGU7XG4gIGlmIChwcmV2aW91c0ZpcnN0Tm9kZSAhPT0gbnVsbCkge1xuXG4gICAgdmFyIHBhcmVudE5vZGUgPSBwcmV2aW91c0ZpcnN0Tm9kZS5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnROb2RlICE9PSBudWxsKSB7XG4gICAgICBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgZmlyc3ROb2RlLCBsYXN0Tm9kZSwgcHJldmlvdXNGaXJzdE5vZGUpO1xuICAgICAgY2xlYXIocGFyZW50Tm9kZSwgcHJldmlvdXNGaXJzdE5vZGUsIHRoaXMubGFzdE5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuZmlyc3ROb2RlID0gZmlyc3ROb2RlO1xuICB0aGlzLmxhc3ROb2RlID0gbGFzdE5vZGU7XG5cbiAgaWYgKHRoaXMucGFyZW50TW9ycGhMaXN0KSB7XG4gICAgdGhpcy5fc3luY0ZpcnN0Tm9kZSgpO1xuICAgIHRoaXMuX3N5bmNMYXN0Tm9kZSgpO1xuICB9XG59O1xuXG5Nb3JwaC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIE1vcnBoJGRlc3Ryb3koKSB7XG4gIHRoaXMudW5saW5rKCk7XG5cbiAgdmFyIGZpcnN0Tm9kZSA9IHRoaXMuZmlyc3ROb2RlO1xuICB2YXIgbGFzdE5vZGUgPSB0aGlzLmxhc3ROb2RlO1xuICB2YXIgcGFyZW50Tm9kZSA9IGZpcnN0Tm9kZSAmJiBmaXJzdE5vZGUucGFyZW50Tm9kZTtcblxuICB0aGlzLmZpcnN0Tm9kZSA9IG51bGw7XG4gIHRoaXMubGFzdE5vZGUgPSBudWxsO1xuXG4gIGNsZWFyKHBhcmVudE5vZGUsIGZpcnN0Tm9kZSwgbGFzdE5vZGUpO1xufTtcblxuTW9ycGgucHJvdG90eXBlLnVubGluayA9IGZ1bmN0aW9uIE1vcnBoJHVubGluaygpIHtcbiAgdmFyIHBhcmVudE1vcnBoTGlzdCA9IHRoaXMucGFyZW50TW9ycGhMaXN0O1xuICB2YXIgcHJldmlvdXNNb3JwaCA9IHRoaXMucHJldmlvdXNNb3JwaDtcbiAgdmFyIG5leHRNb3JwaCA9IHRoaXMubmV4dE1vcnBoO1xuXG4gIGlmIChwcmV2aW91c01vcnBoKSB7XG4gICAgaWYgKG5leHRNb3JwaCkge1xuICAgICAgcHJldmlvdXNNb3JwaC5uZXh0TW9ycGggPSBuZXh0TW9ycGg7XG4gICAgICBuZXh0TW9ycGgucHJldmlvdXNNb3JwaCA9IHByZXZpb3VzTW9ycGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZpb3VzTW9ycGgubmV4dE1vcnBoID0gbnVsbDtcbiAgICAgIHBhcmVudE1vcnBoTGlzdC5sYXN0Q2hpbGRNb3JwaCA9IHByZXZpb3VzTW9ycGg7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChuZXh0TW9ycGgpIHtcbiAgICAgIG5leHRNb3JwaC5wcmV2aW91c01vcnBoID0gbnVsbDtcbiAgICAgIHBhcmVudE1vcnBoTGlzdC5maXJzdENoaWxkTW9ycGggPSBuZXh0TW9ycGg7XG4gICAgfSBlbHNlIGlmIChwYXJlbnRNb3JwaExpc3QpIHtcbiAgICAgIHBhcmVudE1vcnBoTGlzdC5sYXN0Q2hpbGRNb3JwaCA9IHBhcmVudE1vcnBoTGlzdC5maXJzdENoaWxkTW9ycGggPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMucGFyZW50TW9ycGhMaXN0ID0gbnVsbDtcbiAgdGhpcy5uZXh0TW9ycGggPSBudWxsO1xuICB0aGlzLnByZXZpb3VzTW9ycGggPSBudWxsO1xuXG4gIGlmIChwYXJlbnRNb3JwaExpc3QgJiYgcGFyZW50TW9ycGhMaXN0Lm1vdW50ZWRNb3JwaCkge1xuICAgIGlmICghcGFyZW50TW9ycGhMaXN0LmZpcnN0Q2hpbGRNb3JwaCkge1xuICAgICAgLy8gbGlzdCBpcyBlbXB0eVxuICAgICAgcGFyZW50TW9ycGhMaXN0Lm1vdW50ZWRNb3JwaC5jbGVhcigpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRNb3JwaExpc3QuZmlyc3RDaGlsZE1vcnBoLl9zeW5jRmlyc3ROb2RlKCk7XG4gICAgICBwYXJlbnRNb3JwaExpc3QubGFzdENoaWxkTW9ycGguX3N5bmNMYXN0Tm9kZSgpO1xuICAgIH1cbiAgfVxufTtcblxuTW9ycGgucHJvdG90eXBlLnNldEhUTUwgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHZhciBmcmFnbWVudCA9IHRoaXMuZG9tSGVscGVyLnBhcnNlSFRNTCh0ZXh0LCB0aGlzLmNvbnRleHR1YWxFbGVtZW50KTtcbiAgcmV0dXJuIHRoaXMuc2V0Tm9kZShmcmFnbWVudCk7XG59O1xuXG5Nb3JwaC5wcm90b3R5cGUuc2V0TW9ycGhMaXN0ID0gZnVuY3Rpb24gTW9ycGgkYXBwZW5kTW9ycGhMaXN0KG1vcnBoTGlzdCkge1xuICBtb3JwaExpc3QubW91bnRlZE1vcnBoID0gdGhpcztcbiAgdGhpcy5jbGVhcigpO1xuXG4gIHZhciBvcmlnaW5hbEZpcnN0Tm9kZSA9IHRoaXMuZmlyc3ROb2RlO1xuXG4gIGlmIChtb3JwaExpc3QuZmlyc3RDaGlsZE1vcnBoKSB7XG4gICAgdGhpcy5maXJzdE5vZGUgPSBtb3JwaExpc3QuZmlyc3RDaGlsZE1vcnBoLmZpcnN0Tm9kZTtcbiAgICB0aGlzLmxhc3ROb2RlID0gbW9ycGhMaXN0Lmxhc3RDaGlsZE1vcnBoLmxhc3ROb2RlO1xuXG4gICAgdmFyIGN1cnJlbnQgPSBtb3JwaExpc3QuZmlyc3RDaGlsZE1vcnBoO1xuXG4gICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgIHZhciBuZXh0ID0gY3VycmVudC5uZXh0TW9ycGg7XG4gICAgICBjdXJyZW50Lmluc2VydEJlZm9yZU5vZGUob3JpZ2luYWxGaXJzdE5vZGUsIG51bGwpO1xuICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgfVxuICAgIG9yaWdpbmFsRmlyc3ROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3JpZ2luYWxGaXJzdE5vZGUpO1xuICB9XG59O1xuXG5Nb3JwaC5wcm90b3R5cGUuX3N5bmNGaXJzdE5vZGUgPSBmdW5jdGlvbiBNb3JwaCRzeW5jRmlyc3ROb2RlKCkge1xuICB2YXIgbW9ycGggPSB0aGlzO1xuICB2YXIgcGFyZW50TW9ycGhMaXN0O1xuICB3aGlsZSAocGFyZW50TW9ycGhMaXN0ID0gbW9ycGgucGFyZW50TW9ycGhMaXN0KSB7XG4gICAgaWYgKHBhcmVudE1vcnBoTGlzdC5tb3VudGVkTW9ycGggPT09IG51bGwpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAobW9ycGggIT09IHBhcmVudE1vcnBoTGlzdC5maXJzdENoaWxkTW9ycGgpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAobW9ycGguZmlyc3ROb2RlID09PSBwYXJlbnRNb3JwaExpc3QubW91bnRlZE1vcnBoLmZpcnN0Tm9kZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcGFyZW50TW9ycGhMaXN0Lm1vdW50ZWRNb3JwaC5maXJzdE5vZGUgPSBtb3JwaC5maXJzdE5vZGU7XG5cbiAgICBtb3JwaCA9IHBhcmVudE1vcnBoTGlzdC5tb3VudGVkTW9ycGg7XG4gIH1cbn07XG5cbk1vcnBoLnByb3RvdHlwZS5fc3luY0xhc3ROb2RlID0gZnVuY3Rpb24gTW9ycGgkc3luY0xhc3ROb2RlKCkge1xuICB2YXIgbW9ycGggPSB0aGlzO1xuICB2YXIgcGFyZW50TW9ycGhMaXN0O1xuICB3aGlsZSAocGFyZW50TW9ycGhMaXN0ID0gbW9ycGgucGFyZW50TW9ycGhMaXN0KSB7XG4gICAgaWYgKHBhcmVudE1vcnBoTGlzdC5tb3VudGVkTW9ycGggPT09IG51bGwpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAobW9ycGggIT09IHBhcmVudE1vcnBoTGlzdC5sYXN0Q2hpbGRNb3JwaCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChtb3JwaC5sYXN0Tm9kZSA9PT0gcGFyZW50TW9ycGhMaXN0Lm1vdW50ZWRNb3JwaC5sYXN0Tm9kZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcGFyZW50TW9ycGhMaXN0Lm1vdW50ZWRNb3JwaC5sYXN0Tm9kZSA9IG1vcnBoLmxhc3ROb2RlO1xuXG4gICAgbW9ycGggPSBwYXJlbnRNb3JwaExpc3QubW91bnRlZE1vcnBoO1xuICB9XG59O1xuXG5Nb3JwaC5wcm90b3R5cGUuaW5zZXJ0QmVmb3JlTm9kZSA9IGZ1bmN0aW9uIE1vcnBoJGluc2VydEJlZm9yZU5vZGUocGFyZW50Tm9kZSwgcmVmTm9kZSkge1xuICBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgdGhpcy5maXJzdE5vZGUsIHRoaXMubGFzdE5vZGUsIHJlZk5vZGUpO1xufTtcblxuTW9ycGgucHJvdG90eXBlLmFwcGVuZFRvTm9kZSA9IGZ1bmN0aW9uIE1vcnBoJGFwcGVuZFRvTm9kZShwYXJlbnROb2RlKSB7XG4gIGluc2VydEJlZm9yZShwYXJlbnROb2RlLCB0aGlzLmZpcnN0Tm9kZSwgdGhpcy5sYXN0Tm9kZSwgbnVsbCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBNb3JwaDtcbiJdfQ==
define('morph-range.umd', ['exports', './morph-range'], function (exports, _morphRange) {

  (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      define([], factory);
    } else if (typeof exports === 'object') {
      module.exports = factory();
    } else {
      root.Morph = factory();
    }
  })(this, function () {
    return _morphRange.default;
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLXJhbmdlLnVtZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLEFBQUMsR0FBQSxVQUFVLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDeEIsUUFBSSxPQUFPLE1BQU0sS0FBSyxVQUFVLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRTtBQUM5QyxZQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3JCLE1BQU0sSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7QUFDdEMsWUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLEVBQUUsQ0FBQztLQUM1QixNQUFNO0FBQ0wsVUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLEVBQUUsQ0FBQztLQUN4QjtHQUNGLENBQUEsQ0FBQyxJQUFJLEVBQUUsWUFBWTtBQUNsQiwrQkFBYTtHQUNkLENBQUMsQ0FBRSIsImZpbGUiOiJtb3JwaC1yYW5nZS51bWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTW9ycGggZnJvbSAnLi9tb3JwaC1yYW5nZSc7XG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICByb290Lk1vcnBoID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE1vcnBoO1xufSkpO1xuIl19
define('morph-range/morph-list', ['exports', './utils'], function (exports, _utils) {

  function MorphList() {
    // morph graph
    this.firstChildMorph = null;
    this.lastChildMorph = null;

    this.mountedMorph = null;
  }

  var prototype = MorphList.prototype;

  prototype.clear = function MorphList$clear() {
    var current = this.firstChildMorph;

    while (current) {
      var next = current.nextMorph;
      current.previousMorph = null;
      current.nextMorph = null;
      current.parentMorphList = null;
      current = next;
    }

    this.firstChildMorph = this.lastChildMorph = null;
  };

  prototype.destroy = function MorphList$destroy() {};

  prototype.appendMorph = function MorphList$appendMorph(morph) {
    this.insertBeforeMorph(morph, null);
  };

  prototype.insertBeforeMorph = function MorphList$insertBeforeMorph(morph, referenceMorph) {
    if (morph.parentMorphList !== null) {
      morph.unlink();
    }
    if (referenceMorph && referenceMorph.parentMorphList !== this) {
      throw new Error('The morph before which the new morph is to be inserted is not a child of this morph.');
    }

    var mountedMorph = this.mountedMorph;

    if (mountedMorph) {

      var parentNode = mountedMorph.firstNode.parentNode;
      var referenceNode = referenceMorph ? referenceMorph.firstNode : mountedMorph.lastNode.nextSibling;

      _utils.insertBefore(parentNode, morph.firstNode, morph.lastNode, referenceNode);

      // was not in list mode replace current content
      if (!this.firstChildMorph) {
        _utils.clear(this.mountedMorph.firstNode.parentNode, this.mountedMorph.firstNode, this.mountedMorph.lastNode);
      }
    }

    morph.parentMorphList = this;

    var previousMorph = referenceMorph ? referenceMorph.previousMorph : this.lastChildMorph;
    if (previousMorph) {
      previousMorph.nextMorph = morph;
      morph.previousMorph = previousMorph;
    } else {
      this.firstChildMorph = morph;
    }

    if (referenceMorph) {
      referenceMorph.previousMorph = morph;
      morph.nextMorph = referenceMorph;
    } else {
      this.lastChildMorph = morph;
    }

    this.firstChildMorph._syncFirstNode();
    this.lastChildMorph._syncLastNode();
  };

  prototype.removeChildMorph = function MorphList$removeChildMorph(morph) {
    if (morph.parentMorphList !== this) {
      throw new Error("Cannot remove a morph from a parent it is not inside of");
    }

    morph.destroy();
  };

  exports.default = MorphList;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLXJhbmdlL21vcnBoLWxpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxXQUFTLFNBQVMsR0FBRzs7QUFFbkIsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsUUFBSSxDQUFDLGNBQWMsR0FBSSxJQUFJLENBQUM7O0FBRTVCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0dBQzFCOztBQUVELE1BQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7O0FBRXBDLFdBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxlQUFlLEdBQUc7QUFDM0MsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQzs7QUFFbkMsV0FBTyxPQUFPLEVBQUU7QUFDZCxVQUFJLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQzdCLGFBQU8sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzdCLGFBQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLGFBQU8sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQy9CLGFBQU8sR0FBRyxJQUFJLENBQUM7S0FDaEI7O0FBRUQsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztHQUNuRCxDQUFDOztBQUVGLFdBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxpQkFBaUIsR0FBRyxFQUNoRCxDQUFDOztBQUVGLFdBQVMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUU7QUFDNUQsUUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNyQyxDQUFDOztBQUVGLFdBQVMsQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLDJCQUEyQixDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUU7QUFDeEYsUUFBSSxLQUFLLENBQUMsZUFBZSxLQUFLLElBQUksRUFBRTtBQUNsQyxXQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDaEI7QUFDRCxRQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsZUFBZSxLQUFLLElBQUksRUFBRTtBQUM3RCxZQUFNLElBQUksS0FBSyxDQUFDLHNGQUFzRixDQUFDLENBQUM7S0FDekc7O0FBRUQsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQzs7QUFFckMsUUFBSSxZQUFZLEVBQUU7O0FBRWhCLFVBQUksVUFBVSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDO0FBQ25ELFVBQUksYUFBYSxHQUFHLGNBQWMsR0FBRyxjQUFjLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDOztBQUVsRyxhQWhEWSxZQUFZLENBaUR0QixVQUFVLEVBQ1YsS0FBSyxDQUFDLFNBQVMsRUFDZixLQUFLLENBQUMsUUFBUSxFQUNkLGFBQWEsQ0FDZCxDQUFDOzs7QUFHRixVQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUN6QixlQXpERyxLQUFLLENBeURGLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQzNCLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDbkM7S0FDRjs7QUFFRCxTQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQzs7QUFFN0IsUUFBSSxhQUFhLEdBQUcsY0FBYyxHQUFHLGNBQWMsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztBQUN4RixRQUFJLGFBQWEsRUFBRTtBQUNqQixtQkFBYSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDaEMsV0FBSyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7S0FDckMsTUFBTTtBQUNMLFVBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0tBQzlCOztBQUVELFFBQUksY0FBYyxFQUFFO0FBQ2xCLG9CQUFjLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztBQUNyQyxXQUFLLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQztLQUNsQyxNQUFNO0FBQ0wsVUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7S0FDN0I7O0FBRUQsUUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN0QyxRQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDO0dBQ3JDLENBQUM7O0FBRUYsV0FBUyxDQUFDLGdCQUFnQixHQUFHLFNBQVMsMEJBQTBCLENBQUMsS0FBSyxFQUFFO0FBQ3RFLFFBQUksS0FBSyxDQUFDLGVBQWUsS0FBSyxJQUFJLEVBQUU7QUFDbEMsWUFBTSxJQUFJLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO0tBQzVFOztBQUVELFNBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNqQixDQUFDOztvQkFFYSxTQUFTIiwiZmlsZSI6Im1vcnBoLXJhbmdlL21vcnBoLWxpc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjbGVhciwgaW5zZXJ0QmVmb3JlIH0gZnJvbSAnLi91dGlscyc7XG5cbmZ1bmN0aW9uIE1vcnBoTGlzdCgpIHtcbiAgLy8gbW9ycGggZ3JhcGhcbiAgdGhpcy5maXJzdENoaWxkTW9ycGggPSBudWxsO1xuICB0aGlzLmxhc3RDaGlsZE1vcnBoICA9IG51bGw7XG5cbiAgdGhpcy5tb3VudGVkTW9ycGggPSBudWxsO1xufVxuXG52YXIgcHJvdG90eXBlID0gTW9ycGhMaXN0LnByb3RvdHlwZTtcblxucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gTW9ycGhMaXN0JGNsZWFyKCkge1xuICB2YXIgY3VycmVudCA9IHRoaXMuZmlyc3RDaGlsZE1vcnBoO1xuXG4gIHdoaWxlIChjdXJyZW50KSB7XG4gICAgdmFyIG5leHQgPSBjdXJyZW50Lm5leHRNb3JwaDtcbiAgICBjdXJyZW50LnByZXZpb3VzTW9ycGggPSBudWxsO1xuICAgIGN1cnJlbnQubmV4dE1vcnBoID0gbnVsbDtcbiAgICBjdXJyZW50LnBhcmVudE1vcnBoTGlzdCA9IG51bGw7XG4gICAgY3VycmVudCA9IG5leHQ7XG4gIH1cblxuICB0aGlzLmZpcnN0Q2hpbGRNb3JwaCA9IHRoaXMubGFzdENoaWxkTW9ycGggPSBudWxsO1xufTtcblxucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiBNb3JwaExpc3QkZGVzdHJveSgpIHtcbn07XG5cbnByb3RvdHlwZS5hcHBlbmRNb3JwaCA9IGZ1bmN0aW9uIE1vcnBoTGlzdCRhcHBlbmRNb3JwaChtb3JwaCkge1xuICB0aGlzLmluc2VydEJlZm9yZU1vcnBoKG1vcnBoLCBudWxsKTtcbn07XG5cbnByb3RvdHlwZS5pbnNlcnRCZWZvcmVNb3JwaCA9IGZ1bmN0aW9uIE1vcnBoTGlzdCRpbnNlcnRCZWZvcmVNb3JwaChtb3JwaCwgcmVmZXJlbmNlTW9ycGgpIHtcbiAgaWYgKG1vcnBoLnBhcmVudE1vcnBoTGlzdCAhPT0gbnVsbCkge1xuICAgIG1vcnBoLnVubGluaygpO1xuICB9XG4gIGlmIChyZWZlcmVuY2VNb3JwaCAmJiByZWZlcmVuY2VNb3JwaC5wYXJlbnRNb3JwaExpc3QgIT09IHRoaXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBtb3JwaCBiZWZvcmUgd2hpY2ggdGhlIG5ldyBtb3JwaCBpcyB0byBiZSBpbnNlcnRlZCBpcyBub3QgYSBjaGlsZCBvZiB0aGlzIG1vcnBoLicpO1xuICB9XG5cbiAgdmFyIG1vdW50ZWRNb3JwaCA9IHRoaXMubW91bnRlZE1vcnBoO1xuXG4gIGlmIChtb3VudGVkTW9ycGgpIHtcblxuICAgIHZhciBwYXJlbnROb2RlID0gbW91bnRlZE1vcnBoLmZpcnN0Tm9kZS5wYXJlbnROb2RlO1xuICAgIHZhciByZWZlcmVuY2VOb2RlID0gcmVmZXJlbmNlTW9ycGggPyByZWZlcmVuY2VNb3JwaC5maXJzdE5vZGUgOiBtb3VudGVkTW9ycGgubGFzdE5vZGUubmV4dFNpYmxpbmc7XG5cbiAgICBpbnNlcnRCZWZvcmUoXG4gICAgICBwYXJlbnROb2RlLFxuICAgICAgbW9ycGguZmlyc3ROb2RlLFxuICAgICAgbW9ycGgubGFzdE5vZGUsXG4gICAgICByZWZlcmVuY2VOb2RlXG4gICAgKTtcblxuICAgIC8vIHdhcyBub3QgaW4gbGlzdCBtb2RlIHJlcGxhY2UgY3VycmVudCBjb250ZW50XG4gICAgaWYgKCF0aGlzLmZpcnN0Q2hpbGRNb3JwaCkge1xuICAgICAgY2xlYXIodGhpcy5tb3VudGVkTW9ycGguZmlyc3ROb2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgICB0aGlzLm1vdW50ZWRNb3JwaC5maXJzdE5vZGUsXG4gICAgICAgICAgICB0aGlzLm1vdW50ZWRNb3JwaC5sYXN0Tm9kZSk7XG4gICAgfVxuICB9XG5cbiAgbW9ycGgucGFyZW50TW9ycGhMaXN0ID0gdGhpcztcblxuICB2YXIgcHJldmlvdXNNb3JwaCA9IHJlZmVyZW5jZU1vcnBoID8gcmVmZXJlbmNlTW9ycGgucHJldmlvdXNNb3JwaCA6IHRoaXMubGFzdENoaWxkTW9ycGg7XG4gIGlmIChwcmV2aW91c01vcnBoKSB7XG4gICAgcHJldmlvdXNNb3JwaC5uZXh0TW9ycGggPSBtb3JwaDtcbiAgICBtb3JwaC5wcmV2aW91c01vcnBoID0gcHJldmlvdXNNb3JwaDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmZpcnN0Q2hpbGRNb3JwaCA9IG1vcnBoO1xuICB9XG5cbiAgaWYgKHJlZmVyZW5jZU1vcnBoKSB7XG4gICAgcmVmZXJlbmNlTW9ycGgucHJldmlvdXNNb3JwaCA9IG1vcnBoO1xuICAgIG1vcnBoLm5leHRNb3JwaCA9IHJlZmVyZW5jZU1vcnBoO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubGFzdENoaWxkTW9ycGggPSBtb3JwaDtcbiAgfVxuXG4gIHRoaXMuZmlyc3RDaGlsZE1vcnBoLl9zeW5jRmlyc3ROb2RlKCk7XG4gIHRoaXMubGFzdENoaWxkTW9ycGguX3N5bmNMYXN0Tm9kZSgpO1xufTtcblxucHJvdG90eXBlLnJlbW92ZUNoaWxkTW9ycGggPSBmdW5jdGlvbiBNb3JwaExpc3QkcmVtb3ZlQ2hpbGRNb3JwaChtb3JwaCkge1xuICBpZiAobW9ycGgucGFyZW50TW9ycGhMaXN0ICE9PSB0aGlzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlbW92ZSBhIG1vcnBoIGZyb20gYSBwYXJlbnQgaXQgaXMgbm90IGluc2lkZSBvZlwiKTtcbiAgfVxuXG4gIG1vcnBoLmRlc3Ryb3koKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE1vcnBoTGlzdDtcbiJdfQ==
define('morph-range/morph-list.umd', ['exports', './morph-list'], function (exports, _morphList) {

  (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      define([], factory);
    } else if (typeof exports === 'object') {
      module.exports = factory();
    } else {
      root.MorphList = factory();
    }
  })(this, function () {
    return _morphList.default;
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLXJhbmdlL21vcnBoLWxpc3QudW1kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsQUFBQyxHQUFBLFVBQVUsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUN4QixRQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQzlDLFlBQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDckIsTUFBTSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtBQUN0QyxZQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sRUFBRSxDQUFDO0tBQzVCLE1BQU07QUFDTCxVQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sRUFBRSxDQUFDO0tBQzVCO0dBQ0YsQ0FBQSxDQUFDLElBQUksRUFBRSxZQUFZO0FBQ2xCLDhCQUFpQjtHQUNsQixDQUFDLENBQUUiLCJmaWxlIjoibW9ycGgtcmFuZ2UvbW9ycGgtbGlzdC51bWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTW9ycGhMaXN0IGZyb20gJy4vbW9ycGgtbGlzdCc7XG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICByb290Lk1vcnBoTGlzdCA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBNb3JwaExpc3Q7XG59KSk7XG4iXX0=
define("morph-range/utils", ["exports"], function (exports) {
  exports.clear = clear;
  exports.insertBefore = insertBefore;
  // inclusive of both nodes

  function clear(parentNode, firstNode, lastNode) {
    if (!parentNode) {
      return;
    }

    var node = firstNode;
    var nextNode;
    do {
      nextNode = node.nextSibling;
      parentNode.removeChild(node);
      if (node === lastNode) {
        break;
      }
      node = nextNode;
    } while (node);
  }

  function insertBefore(parentNode, firstNode, lastNode, refNode) {
    var node = firstNode;
    var nextNode;
    do {
      nextNode = node.nextSibling;
      parentNode.insertBefore(node, refNode);
      if (node === lastNode) {
        break;
      }
      node = nextNode;
    } while (node);
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLXJhbmdlL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7VUFDZ0IsS0FBSyxHQUFMLEtBQUs7VUFlTCxZQUFZLEdBQVosWUFBWTs7O0FBZnJCLFdBQVMsS0FBSyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQ3JELFFBQUksQ0FBQyxVQUFVLEVBQUU7QUFBRSxhQUFPO0tBQUU7O0FBRTVCLFFBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQztBQUNyQixRQUFJLFFBQVEsQ0FBQztBQUNiLE9BQUc7QUFDRCxjQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUM1QixnQkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDckIsY0FBTTtPQUNQO0FBQ0QsVUFBSSxHQUFHLFFBQVEsQ0FBQztLQUNqQixRQUFRLElBQUksRUFBRTtHQUNoQjs7QUFFTSxXQUFTLFlBQVksQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7QUFDckUsUUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDO0FBQ3JCLFFBQUksUUFBUSxDQUFDO0FBQ2IsT0FBRztBQUNELGNBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQzVCLGdCQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2QyxVQUFJLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDckIsY0FBTTtPQUNQO0FBQ0QsVUFBSSxHQUFHLFFBQVEsQ0FBQztLQUNqQixRQUFRLElBQUksRUFBRTtHQUNoQiIsImZpbGUiOiJtb3JwaC1yYW5nZS91dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGluY2x1c2l2ZSBvZiBib3RoIG5vZGVzXG5leHBvcnQgZnVuY3Rpb24gY2xlYXIocGFyZW50Tm9kZSwgZmlyc3ROb2RlLCBsYXN0Tm9kZSkge1xuICBpZiAoIXBhcmVudE5vZGUpIHsgcmV0dXJuOyB9XG5cbiAgdmFyIG5vZGUgPSBmaXJzdE5vZGU7XG4gIHZhciBuZXh0Tm9kZTtcbiAgZG8ge1xuICAgIG5leHROb2RlID0gbm9kZS5uZXh0U2libGluZztcbiAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIGlmIChub2RlID09PSBsYXN0Tm9kZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIG5vZGUgPSBuZXh0Tm9kZTtcbiAgfSB3aGlsZSAobm9kZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgZmlyc3ROb2RlLCBsYXN0Tm9kZSwgcmVmTm9kZSkge1xuICB2YXIgbm9kZSA9IGZpcnN0Tm9kZTtcbiAgdmFyIG5leHROb2RlO1xuICBkbyB7XG4gICAgbmV4dE5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIHJlZk5vZGUpO1xuICAgIGlmIChub2RlID09PSBsYXN0Tm9kZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIG5vZGUgPSBuZXh0Tm9kZTtcbiAgfSB3aGlsZSAobm9kZSk7XG59XG4iXX0=