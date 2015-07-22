exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _htmlbarsRuntimeMorph = require("./htmlbars-runtime/morph");

var _htmlbarsRuntimeMorph2 = _interopRequireDefault(_htmlbarsRuntimeMorph);

var _morphAttr = require("./morph-attr");

var _morphAttr2 = _interopRequireDefault(_morphAttr);

var _domHelperBuildHtmlDom = require("./dom-helper/build-html-dom");

var _domHelperClasses = require("./dom-helper/classes");

var _domHelperProp = require("./dom-helper/prop");

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

prototype.AttrMorphClass = _morphAttr2.default;

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

prototype.MorphClass = _htmlbarsRuntimeMorph2.default;

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
  return _htmlbarsRuntimeMorph2.default.create(this, contextualElement, fragment);
};

prototype.replaceContentWithMorph = function (element) {
  var firstChild = element.firstChild;

  if (!firstChild) {
    var comment = this.createComment('');
    this.appendChild(element, comment);
    return _htmlbarsRuntimeMorph2.default.create(this, element, comment);
  } else {
    var morph = _htmlbarsRuntimeMorph2.default.attach(this, element, firstChild, element.lastChild);
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
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,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LFVBQVUsQ0FBQztLQUM5QixNQUFNO0FBQ0wsZ0JBQVUsR0FBRyxLQUFLLENBQUM7S0FDcEI7R0FDRjs7O0FBR0QsTUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDOztBQUV0RCxNQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN2QyxRQUFJLFdBQVcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7QUFJaEMsUUFBSSxpQkFBaUIsQ0FBQyxPQUFPLEtBQUssUUFBUSxFQUFFO0FBQzFDLGlCQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQztLQUN2Qzs7QUFFRCxXQUFPLFdBQVcsRUFBRTtBQUNsQixVQUFJLFFBQVEsR0FBRyxXQUFXLENBQUM7QUFDM0IsaUJBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDOztBQUV0QyxjQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2hDO0dBQ0Y7O0FBRUQsU0FBTyxRQUFRLENBQUM7Q0FDakIsQ0FBQzs7QUFFRixJQUFJLFdBQVcsQ0FBQzs7O0FBR2hCLFNBQVMsQ0FBQyxjQUFjLEdBQUcsVUFBUyxHQUFHLEVBQUU7QUFDdkMsTUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNoQixlQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDaEQ7O0FBRUQsYUFBVyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7QUFDdkIsU0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDO0NBQzdCLENBQUM7O2tCQUVhLFNBQVMiLCJmaWxlIjoiZG9tLWhlbHBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBNb3JwaCBmcm9tIFwiLi9odG1sYmFycy1ydW50aW1lL21vcnBoXCI7XG5pbXBvcnQgQXR0ck1vcnBoIGZyb20gXCIuL21vcnBoLWF0dHJcIjtcbmltcG9ydCB7XG4gIGJ1aWxkSFRNTERPTSxcbiAgc3ZnTmFtZXNwYWNlLFxuICBzdmdIVE1MSW50ZWdyYXRpb25Qb2ludHNcbn0gZnJvbSBcIi4vZG9tLWhlbHBlci9idWlsZC1odG1sLWRvbVwiO1xuaW1wb3J0IHtcbiAgYWRkQ2xhc3NlcyxcbiAgcmVtb3ZlQ2xhc3Nlc1xufSBmcm9tIFwiLi9kb20taGVscGVyL2NsYXNzZXNcIjtcbmltcG9ydCB7XG4gIG5vcm1hbGl6ZVByb3BlcnR5XG59IGZyb20gXCIuL2RvbS1oZWxwZXIvcHJvcFwiO1xuaW1wb3J0IHsgaXNBdHRyUmVtb3ZhbFZhbHVlIH0gZnJvbSBcIi4vZG9tLWhlbHBlci9wcm9wXCI7XG5cbnZhciBkb2MgPSB0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiBkb2N1bWVudDtcblxudmFyIGRlbGV0ZXNCbGFua1RleHROb2RlcyA9IGRvYyAmJiAoZnVuY3Rpb24oZG9jdW1lbnQpe1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbGVtZW50LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJykgKTtcbiAgdmFyIGNsb25lZEVsZW1lbnQgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgcmV0dXJuIGNsb25lZEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPT09IDA7XG59KShkb2MpO1xuXG52YXIgaWdub3Jlc0NoZWNrZWRBdHRyaWJ1dGUgPSBkb2MgJiYgKGZ1bmN0aW9uKGRvY3VtZW50KXtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsICdjaGVja2VkJyk7XG4gIHZhciBjbG9uZWRFbGVtZW50ID0gZWxlbWVudC5jbG9uZU5vZGUoZmFsc2UpO1xuICByZXR1cm4gIWNsb25lZEVsZW1lbnQuY2hlY2tlZDtcbn0pKGRvYyk7XG5cbnZhciBjYW5SZW1vdmVTdmdWaWV3Qm94QXR0cmlidXRlID0gZG9jICYmIChkb2MuY3JlYXRlRWxlbWVudE5TID8gKGZ1bmN0aW9uKGRvY3VtZW50KXtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnTmFtZXNwYWNlLCAnc3ZnJyk7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd2aWV3Qm94JywgJzAgMCAxMDAgMTAwJyk7XG4gIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd2aWV3Qm94Jyk7XG4gIHJldHVybiAhZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnKTtcbn0pKGRvYykgOiB0cnVlKTtcblxudmFyIGNhbkNsb25lID0gZG9jICYmIChmdW5jdGlvbihkb2N1bWVudCl7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcgJykpO1xuICBlbGVtZW50LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnICcpKTtcbiAgdmFyIGNsb25lZEVsZW1lbnQgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgcmV0dXJuIGNsb25lZEVsZW1lbnQuY2hpbGROb2Rlc1swXS5ub2RlVmFsdWUgPT09ICcgJztcbn0pKGRvYyk7XG5cbi8vIFRoaXMgaXMgbm90IHRoZSBuYW1lc3BhY2Ugb2YgdGhlIGVsZW1lbnQsIGJ1dCBvZlxuLy8gdGhlIGVsZW1lbnRzIGluc2lkZSB0aGF0IGVsZW1lbnRzLlxuZnVuY3Rpb24gaW50ZXJpb3JOYW1lc3BhY2UoZWxlbWVudCl7XG4gIGlmIChcbiAgICBlbGVtZW50ICYmXG4gICAgZWxlbWVudC5uYW1lc3BhY2VVUkkgPT09IHN2Z05hbWVzcGFjZSAmJlxuICAgICFzdmdIVE1MSW50ZWdyYXRpb25Qb2ludHNbZWxlbWVudC50YWdOYW1lXVxuICApIHtcbiAgICByZXR1cm4gc3ZnTmFtZXNwYWNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vIFRoZSBIVE1MIHNwZWMgYWxsb3dzIGZvciBcIm9taXR0ZWQgc3RhcnQgdGFnc1wiLiBUaGVzZSB0YWdzIGFyZSBvcHRpb25hbFxuLy8gd2hlbiB0aGVpciBpbnRlbmRlZCBjaGlsZCBpcyB0aGUgZmlyc3QgdGhpbmcgaW4gdGhlIHBhcmVudCB0YWcuIEZvclxuLy8gZXhhbXBsZSwgdGhpcyBpcyBhIHRib2R5IHN0YXJ0IHRhZzpcbi8vXG4vLyA8dGFibGU+XG4vLyAgIDx0Ym9keT5cbi8vICAgICA8dHI+XG4vL1xuLy8gVGhlIHRib2R5IG1heSBiZSBvbWl0dGVkLCBhbmQgdGhlIGJyb3dzZXIgd2lsbCBhY2NlcHQgYW5kIHJlbmRlcjpcbi8vXG4vLyA8dGFibGU+XG4vLyAgIDx0cj5cbi8vXG4vLyBIb3dldmVyLCB0aGUgb21pdHRlZCBzdGFydCB0YWcgd2lsbCBzdGlsbCBiZSBhZGRlZCB0byB0aGUgRE9NLiBIZXJlXG4vLyB3ZSB0ZXN0IHRoZSBzdHJpbmcgYW5kIGNvbnRleHQgdG8gc2VlIGlmIHRoZSBicm93c2VyIGlzIGFib3V0IHRvXG4vLyBwZXJmb3JtIHRoaXMgY2xlYW51cC5cbi8vXG4vLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9zeW50YXguaHRtbCNvcHRpb25hbC10YWdzXG4vLyBkZXNjcmliZXMgd2hpY2ggdGFncyBhcmUgb21pdHRhYmxlLiBUaGUgc3BlYyBmb3IgdGJvZHkgYW5kIGNvbGdyb3VwXG4vLyBleHBsYWlucyB0aGlzIGJlaGF2aW9yOlxuLy9cbi8vIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3RhYmxlcy5odG1sI3RoZS10Ym9keS1lbGVtZW50XG4vLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS90YWJsZXMuaHRtbCN0aGUtY29sZ3JvdXAtZWxlbWVudFxuLy9cblxudmFyIG9taXR0ZWRTdGFydFRhZ0NoaWxkVGVzdCA9IC88KFtcXHc6XSspLztcbmZ1bmN0aW9uIGRldGVjdE9taXR0ZWRTdGFydFRhZyhzdHJpbmcsIGNvbnRleHR1YWxFbGVtZW50KXtcbiAgLy8gT21pdHRlZCBzdGFydCB0YWdzIGFyZSBvbmx5IGluc2lkZSB0YWJsZSB0YWdzLlxuICBpZiAoY29udGV4dHVhbEVsZW1lbnQudGFnTmFtZSA9PT0gJ1RBQkxFJykge1xuICAgIHZhciBvbWl0dGVkU3RhcnRUYWdDaGlsZE1hdGNoID0gb21pdHRlZFN0YXJ0VGFnQ2hpbGRUZXN0LmV4ZWMoc3RyaW5nKTtcbiAgICBpZiAob21pdHRlZFN0YXJ0VGFnQ2hpbGRNYXRjaCkge1xuICAgICAgdmFyIG9taXR0ZWRTdGFydFRhZ0NoaWxkID0gb21pdHRlZFN0YXJ0VGFnQ2hpbGRNYXRjaFsxXTtcbiAgICAgIC8vIEl0IGlzIGFscmVhZHkgYXNzZXJ0ZWQgdGhhdCB0aGUgY29udGV4dHVhbCBlbGVtZW50IGlzIGEgdGFibGVcbiAgICAgIC8vIGFuZCBub3QgdGhlIHByb3BlciBzdGFydCB0YWcuIEp1c3Qgc2VlIGlmIGEgdGFnIHdhcyBvbWl0dGVkLlxuICAgICAgcmV0dXJuIG9taXR0ZWRTdGFydFRhZ0NoaWxkID09PSAndHInIHx8XG4gICAgICAgICAgICAgb21pdHRlZFN0YXJ0VGFnQ2hpbGQgPT09ICdjb2wnO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZFNWR0RPTShodG1sLCBkb20pe1xuICB2YXIgZGl2ID0gZG9tLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBkaXYuaW5uZXJIVE1MID0gJzxzdmc+JytodG1sKyc8L3N2Zz4nO1xuICByZXR1cm4gZGl2LmZpcnN0Q2hpbGQuY2hpbGROb2Rlcztcbn1cblxudmFyIGd1aWQgPSAxO1xuXG5mdW5jdGlvbiBFbGVtZW50TW9ycGgoZWxlbWVudCwgZG9tLCBuYW1lc3BhY2UpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5kb20gPSBkb207XG4gIHRoaXMubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICB0aGlzLmd1aWQgPSBcImVsZW1lbnRcIiArIGd1aWQrKztcblxuICB0aGlzLnN0YXRlID0ge307XG4gIHRoaXMuaXNEaXJ0eSA9IHRydWU7XG59XG5cbi8vIHJlbmRlckFuZENsZWFudXAgY2FsbHMgYGNsZWFyYCBvbiBhbGwgaXRlbXMgaW4gdGhlIG1vcnBoIG1hcFxuLy8ganVzdCBiZWZvcmUgY2FsbGluZyBgZGVzdHJveWAgb24gdGhlIG1vcnBoLlxuLy9cbi8vIEFzIGEgZnV0dXJlIHJlZmFjdG9yIHRoaXMgY291bGQgYmUgY2hhbmdlZCB0byBzZXQgdGhlIHByb3BlcnR5XG4vLyBiYWNrIHRvIGl0cyBvcmlnaW5hbC9kZWZhdWx0IHZhbHVlLlxuRWxlbWVudE1vcnBoLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkgeyB9O1xuXG5FbGVtZW50TW9ycGgucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgdGhpcy5kb20gPSBudWxsO1xufTtcblxuXG4vKlxuICogQSBjbGFzcyB3cmFwcGluZyBET00gZnVuY3Rpb25zIHRvIGFkZHJlc3MgZW52aXJvbm1lbnQgY29tcGF0aWJpbGl0eSxcbiAqIG5hbWVzcGFjZXMsIGNvbnRleHR1YWwgZWxlbWVudHMgZm9yIG1vcnBoIHVuLWVzY2FwZWQgY29udGVudFxuICogaW5zZXJ0aW9uLlxuICpcbiAqIFdoZW4gZW50ZXJpbmcgYSB0ZW1wbGF0ZSwgYSBET01IZWxwZXIgc2hvdWxkIGJlIHBhc3NlZDpcbiAqXG4gKiAgIHRlbXBsYXRlKGNvbnRleHQsIHsgaG9va3M6IGhvb2tzLCBkb206IG5ldyBET01IZWxwZXIoKSB9KTtcbiAqXG4gKiBUT0RPOiBzdXBwb3J0IGZvcmVpZ25PYmplY3QgYXMgYSBwYXNzZWQgY29udGV4dHVhbCBlbGVtZW50LiBJdCBoYXNcbiAqIGEgbmFtZXNwYWNlIChzdmcpIHRoYXQgZG9lcyBub3QgbWF0Y2ggaXRzIGludGVybmFsIG5hbWVzcGFjZVxuICogKHhodG1sKS5cbiAqXG4gKiBAY2xhc3MgRE9NSGVscGVyXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7SFRNTERvY3VtZW50fSBfZG9jdW1lbnQgVGhlIGRvY3VtZW50IERPTSBtZXRob2RzIGFyZSBwcm94aWVkIHRvXG4gKi9cbmZ1bmN0aW9uIERPTUhlbHBlcihfZG9jdW1lbnQpe1xuICB0aGlzLmRvY3VtZW50ID0gX2RvY3VtZW50IHx8IGRvY3VtZW50O1xuICBpZiAoIXRoaXMuZG9jdW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBIGRvY3VtZW50IG9iamVjdCBtdXN0IGJlIHBhc3NlZCB0byB0aGUgRE9NSGVscGVyLCBvciBhdmFpbGFibGUgb24gdGhlIGdsb2JhbCBzY29wZVwiKTtcbiAgfVxuICB0aGlzLmNhbkNsb25lID0gY2FuQ2xvbmU7XG4gIHRoaXMubmFtZXNwYWNlID0gbnVsbDtcbn1cblxudmFyIHByb3RvdHlwZSA9IERPTUhlbHBlci5wcm90b3R5cGU7XG5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBET01IZWxwZXI7XG5cbnByb3RvdHlwZS5nZXRFbGVtZW50QnlJZCA9IGZ1bmN0aW9uKGlkLCByb290Tm9kZSkge1xuICByb290Tm9kZSA9IHJvb3ROb2RlIHx8IHRoaXMuZG9jdW1lbnQ7XG4gIHJldHVybiByb290Tm9kZS5nZXRFbGVtZW50QnlJZChpZCk7XG59O1xuXG5wcm90b3R5cGUuaW5zZXJ0QmVmb3JlID0gZnVuY3Rpb24oZWxlbWVudCwgY2hpbGRFbGVtZW50LCByZWZlcmVuY2VDaGlsZCkge1xuICByZXR1cm4gZWxlbWVudC5pbnNlcnRCZWZvcmUoY2hpbGRFbGVtZW50LCByZWZlcmVuY2VDaGlsZCk7XG59O1xuXG5wcm90b3R5cGUuYXBwZW5kQ2hpbGQgPSBmdW5jdGlvbihlbGVtZW50LCBjaGlsZEVsZW1lbnQpIHtcbiAgcmV0dXJuIGVsZW1lbnQuYXBwZW5kQ2hpbGQoY2hpbGRFbGVtZW50KTtcbn07XG5cbnByb3RvdHlwZS5jaGlsZEF0ID0gZnVuY3Rpb24oZWxlbWVudCwgaW5kaWNlcykge1xuICB2YXIgY2hpbGQgPSBlbGVtZW50O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW5kaWNlcy5sZW5ndGg7IGkrKykge1xuICAgIGNoaWxkID0gY2hpbGQuY2hpbGROb2Rlcy5pdGVtKGluZGljZXNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIGNoaWxkO1xufTtcblxuLy8gTm90ZSB0byBhIEZlbGxvdyBJbXBsZW1lbnRvcjpcbi8vIEFoaCwgYWNjZXNzaW5nIGEgY2hpbGQgbm9kZSBhdCBhbiBpbmRleC4gU2VlbXMgbGlrZSBpdCBzaG91bGQgYmUgc28gc2ltcGxlLFxuLy8gZG9lc24ndCBpdD8gVW5mb3J0dW5hdGVseSwgdGhpcyBwYXJ0aWN1bGFyIG1ldGhvZCBoYXMgY2F1c2VkIHVzIGEgc3VycHJpc2luZ1xuLy8gYW1vdW50IG9mIHBhaW4uIEFzIHlvdSdsbCBub3RlIGJlbG93LCB0aGlzIG1ldGhvZCBoYXMgYmVlbiBtb2RpZmllZCB0byB3YWxrXG4vLyB0aGUgbGlua2VkIGxpc3Qgb2YgY2hpbGQgbm9kZXMgcmF0aGVyIHRoYW4gYWNjZXNzIHRoZSBjaGlsZCBieSBpbmRleFxuLy8gZGlyZWN0bHksIGV2ZW4gdGhvdWdoIHRoZXJlIGFyZSB0d28gKDIpIEFQSXMgaW4gdGhlIERPTSB0aGF0IGRvIHRoaXMgZm9yIHVzLlxuLy8gSWYgeW91J3JlIHRoaW5raW5nIHRvIHlvdXJzZWxmLCBcIldoYXQgYW4gb3ZlcnNpZ2h0ISBXaGF0IGFuIG9wcG9ydHVuaXR5IHRvXG4vLyBvcHRpbWl6ZSB0aGlzIGNvZGUhXCIgdGhlbiB0byB5b3UgSSBzYXk6IHN0b3AhIEZvciBJIGhhdmUgYSB0YWxlIHRvIHRlbGwuXG4vL1xuLy8gRmlyc3QsIHRoaXMgY29kZSBtdXN0IGJlIGNvbXBhdGlibGUgd2l0aCBzaW1wbGUtZG9tIGZvciByZW5kZXJpbmcgb24gdGhlXG4vLyBzZXJ2ZXIgd2hlcmUgdGhlcmUgaXMgbm8gcmVhbCBET00uIFByZXZpb3VzbHksIHdlIGFjY2Vzc2VkIGEgY2hpbGQgbm9kZVxuLy8gZGlyZWN0bHkgdmlhIGBlbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdYC4gV2hpbGUgd2UgKmNvdWxkKiBpbiB0aGVvcnkgZG8gYVxuLy8gZnVsbC1maWRlbGl0eSBzaW11bGF0aW9uIG9mIGEgbGl2ZSBgY2hpbGROb2Rlc2AgYXJyYXksIHRoaXMgaXMgc2xvdyxcbi8vIGNvbXBsaWNhdGVkIGFuZCBlcnJvci1wcm9uZS5cbi8vXG4vLyBcIk5vIHByb2JsZW0sXCIgd2UgdGhvdWdodCwgXCJ3ZSdsbCBqdXN0IHVzZSB0aGUgc2ltaWxhclxuLy8gYGNoaWxkTm9kZXMuaXRlbShpbmRleClgIEFQSS5cIiBUaGVuLCB3ZSBjb3VsZCBqdXN0IGltcGxlbWVudCBvdXIgb3duIGBpdGVtYFxuLy8gbWV0aG9kIGluIHNpbXBsZS1kb20gYW5kIHdhbGsgdGhlIGNoaWxkIG5vZGUgbGlua2VkIGxpc3QgdGhlcmUsIGFsbG93aW5nXG4vLyB1cyB0byByZXRhaW4gdGhlIHBlcmZvcm1hbmNlIGFkdmFudGFnZXMgb2YgdGhlIChzdXJlbHkgb3B0aW1pemVkKSBgaXRlbSgpYFxuLy8gQVBJIGluIHRoZSBicm93c2VyLlxuLy9cbi8vIFVuZm9ydHVuYXRlbHksIGFuIGVudGVycHJpc2luZyBzb3VsIG5hbWVkIFNhbXkgQWx6YWhyYW5pIGRpc2NvdmVyZWQgdGhhdCBpblxuLy8gSUU4LCBhY2Nlc3NpbmcgYW4gaXRlbSBvdXQtb2YtYm91bmRzIHZpYSBgaXRlbSgpYCBjYXVzZXMgYW4gZXhjZXB0aW9uIHdoZXJlXG4vLyBvdGhlciBicm93c2VycyByZXR1cm4gbnVsbC4gVGhpcyBuZWNlc3NpdGF0ZWQgYS4uLiBjaGVjayBvZlxuLy8gYGNoaWxkTm9kZXMubGVuZ3RoYCwgYnJpbmdpbmcgdXMgYmFjayBhcm91bmQgdG8gaGF2aW5nIHRvIHN1cHBvcnQgYVxuLy8gZnVsbC1maWRlbGl0eSBgY2hpbGROb2Rlc2AgYXJyYXkhXG4vL1xuLy8gV29yc3Qgb2YgYWxsLCBLcmlzIFNlbGRlbiBpbnZlc3RpZ2F0ZWQgaG93IGJyb3dzZXJzIGFyZSBhY3R1YWx5IGltcGxlbWVudGVkXG4vLyBhbmQgZGlzY292ZXJlZCB0aGF0IHRoZXkncmUgYWxsIGxpbmtlZCBsaXN0cyB1bmRlciB0aGUgaG9vZCBhbnl3YXkuIEFjY2Vzc2luZ1xuLy8gYGNoaWxkTm9kZXNgIHJlcXVpcmVzIHRoZW0gdG8gYWxsb2NhdGUgYSBuZXcgbGl2ZSBjb2xsZWN0aW9uIGJhY2tlZCBieSB0aGF0XG4vLyBsaW5rZWQgbGlzdCwgd2hpY2ggaXMgaXRzZWxmIGEgcmF0aGVyIGV4cGVuc2l2ZSBvcGVyYXRpb24uIE91ciBhc3N1bWVkXG4vLyBvcHRpbWl6YXRpb24gaGFkIGJhY2tmaXJlZCEgVGhhdCBpcyB0aGUgZGFuZ2VyIG9mIG1hZ2ljYWwgdGhpbmtpbmcgYWJvdXRcbi8vIHRoZSBwZXJmb3JtYW5jZSBvZiBuYXRpdmUgaW1wbGVtZW50YXRpb25zLlxuLy9cbi8vIEFuZCB0aGlzLCBteSBmcmllbmRzLCBpcyB3aHkgdGhlIGZvbGxvd2luZyBpbXBsZW1lbnRhdGlvbiBqdXN0IHdhbGtzIHRoZVxuLy8gbGlua2VkIGxpc3QsIGFzIHN1cnByaXNlZCBhcyB0aGF0IG1heSBtYWtlIHlvdS4gUGxlYXNlIGVuc3VyZSB5b3UgdW5kZXJzdGFuZFxuLy8gdGhlIGFib3ZlIGJlZm9yZSBjaGFuZ2luZyB0aGlzIGFuZCBzdWJtaXR0aW5nIGEgUFIuXG4vL1xuLy8gVG9tIERhbGUsIEphbnVhcnkgMTh0aCwgMjAxNSwgUG9ydGxhbmQgT1JcbnByb3RvdHlwZS5jaGlsZEF0SW5kZXggPSBmdW5jdGlvbihlbGVtZW50LCBpbmRleCkge1xuICB2YXIgbm9kZSA9IGVsZW1lbnQuZmlyc3RDaGlsZDtcblxuICBmb3IgKHZhciBpZHggPSAwOyBub2RlICYmIGlkeCA8IGluZGV4OyBpZHgrKykge1xuICAgIG5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xuICB9XG5cbiAgcmV0dXJuIG5vZGU7XG59O1xuXG5wcm90b3R5cGUuYXBwZW5kVGV4dCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHRleHQpIHtcbiAgcmV0dXJuIGVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KSk7XG59O1xuXG5wcm90b3R5cGUuc2V0QXR0cmlidXRlID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgdmFsdWUpIHtcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUobmFtZSwgU3RyaW5nKHZhbHVlKSk7XG59O1xuXG5wcm90b3R5cGUuZ2V0QXR0cmlidXRlID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSkge1xuICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUobmFtZSk7XG59O1xuXG5wcm90b3R5cGUuc2V0QXR0cmlidXRlTlMgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lc3BhY2UsIG5hbWUsIHZhbHVlKSB7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlTlMobmFtZXNwYWNlLCBuYW1lLCBTdHJpbmcodmFsdWUpKTtcbn07XG5cbnByb3RvdHlwZS5nZXRBdHRyaWJ1dGVOUyA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWVzcGFjZSwgbmFtZSkge1xuICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGVOUyhuYW1lc3BhY2UsIG5hbWUpO1xufTtcblxuaWYgKGNhblJlbW92ZVN2Z1ZpZXdCb3hBdHRyaWJ1dGUpe1xuICBwcm90b3R5cGUucmVtb3ZlQXR0cmlidXRlID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSkge1xuICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9O1xufSBlbHNlIHtcbiAgcHJvdG90eXBlLnJlbW92ZUF0dHJpYnV0ZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUpIHtcbiAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnc3ZnJyAmJiBuYW1lID09PSAndmlld0JveCcpIHtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICB9XG4gIH07XG59XG5cbnByb3RvdHlwZS5zZXRQcm9wZXJ0eVN0cmljdCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsdWUgPSBudWxsO1xuICB9XG5cbiAgaWYgKHZhbHVlID09PSBudWxsICYmIChuYW1lID09PSAndmFsdWUnIHx8IG5hbWUgPT09ICd0eXBlJyB8fCBuYW1lID09PSAnc3JjJykpIHtcbiAgICB2YWx1ZSA9ICcnO1xuICB9XG5cbiAgZWxlbWVudFtuYW1lXSA9IHZhbHVlO1xufTtcblxucHJvdG90eXBlLmdldFByb3BlcnR5U3RyaWN0ID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSkge1xuICByZXR1cm4gZWxlbWVudFtuYW1lXTtcbn07XG5cbnByb3RvdHlwZS5zZXRQcm9wZXJ0eSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIHZhbHVlLCBuYW1lc3BhY2UpIHtcbiAgaWYgKGVsZW1lbnQubmFtZXNwYWNlVVJJID09PSBzdmdOYW1lc3BhY2UpIHtcbiAgICBpZiAoaXNBdHRyUmVtb3ZhbFZhbHVlKHZhbHVlKSkge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhuYW1lc3BhY2UsIG5hbWUsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIHsgbm9ybWFsaXplZCAsIHR5cGUgfSA9IG5vcm1hbGl6ZVByb3BlcnR5KGVsZW1lbnQsIG5hbWUpO1xuICAgIGlmICh0eXBlID09PSAncHJvcCcpIHtcbiAgICAgIGVsZW1lbnRbbm9ybWFsaXplZF0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzQXR0clJlbW92YWxWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobmFtZXNwYWNlICYmIGVsZW1lbnQuc2V0QXR0cmlidXRlTlMpIHtcbiAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKG5hbWVzcGFjZSwgbmFtZSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuaWYgKGRvYyAmJiBkb2MuY3JlYXRlRWxlbWVudE5TKSB7XG4gIC8vIE9ubHkgb3B0IGludG8gbmFtZXNwYWNlIGRldGVjdGlvbiBpZiBhIGNvbnRleHR1YWxFbGVtZW50XG4gIC8vIGlzIHBhc3NlZC5cbiAgcHJvdG90eXBlLmNyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbih0YWdOYW1lLCBjb250ZXh0dWFsRWxlbWVudCkge1xuICAgIHZhciBuYW1lc3BhY2UgPSB0aGlzLm5hbWVzcGFjZTtcbiAgICBpZiAoY29udGV4dHVhbEVsZW1lbnQpIHtcbiAgICAgIGlmICh0YWdOYW1lID09PSAnc3ZnJykge1xuICAgICAgICBuYW1lc3BhY2UgPSBzdmdOYW1lc3BhY2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuYW1lc3BhY2UgPSBpbnRlcmlvck5hbWVzcGFjZShjb250ZXh0dWFsRWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIHRhZ05hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnNldEF0dHJpYnV0ZU5TID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZXNwYWNlLCBuYW1lLCB2YWx1ZSkge1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlTlMobmFtZXNwYWNlLCBuYW1lLCBTdHJpbmcodmFsdWUpKTtcbiAgfTtcbn0gZWxzZSB7XG4gIHByb3RvdHlwZS5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24odGFnTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gIH07XG4gIHByb3RvdHlwZS5zZXRBdHRyaWJ1dGVOUyA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWVzcGFjZSwgbmFtZSwgdmFsdWUpIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCBTdHJpbmcodmFsdWUpKTtcbiAgfTtcbn1cblxucHJvdG90eXBlLmFkZENsYXNzZXMgPSBhZGRDbGFzc2VzO1xucHJvdG90eXBlLnJlbW92ZUNsYXNzZXMgPSByZW1vdmVDbGFzc2VzO1xuXG5wcm90b3R5cGUuc2V0TmFtZXNwYWNlID0gZnVuY3Rpb24obnMpIHtcbiAgdGhpcy5uYW1lc3BhY2UgPSBucztcbn07XG5cbnByb3RvdHlwZS5kZXRlY3ROYW1lc3BhY2UgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHRoaXMubmFtZXNwYWNlID0gaW50ZXJpb3JOYW1lc3BhY2UoZWxlbWVudCk7XG59O1xuXG5wcm90b3R5cGUuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbn07XG5cbnByb3RvdHlwZS5jcmVhdGVUZXh0Tm9kZSA9IGZ1bmN0aW9uKHRleHQpe1xuICByZXR1cm4gdGhpcy5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbn07XG5cbnByb3RvdHlwZS5jcmVhdGVDb21tZW50ID0gZnVuY3Rpb24odGV4dCl7XG4gIHJldHVybiB0aGlzLmRvY3VtZW50LmNyZWF0ZUNvbW1lbnQodGV4dCk7XG59O1xuXG5wcm90b3R5cGUucmVwYWlyQ2xvbmVkTm9kZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIGJsYW5rQ2hpbGRUZXh0Tm9kZXMsIGlzQ2hlY2tlZCl7XG4gIGlmIChkZWxldGVzQmxhbmtUZXh0Tm9kZXMgJiYgYmxhbmtDaGlsZFRleHROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgZm9yICh2YXIgaT0wLCBsZW49YmxhbmtDaGlsZFRleHROb2Rlcy5sZW5ndGg7aTxsZW47aSsrKXtcbiAgICAgIHZhciB0ZXh0Tm9kZSA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpLFxuICAgICAgICAgIG9mZnNldCA9IGJsYW5rQ2hpbGRUZXh0Tm9kZXNbaV0sXG4gICAgICAgICAgYmVmb3JlID0gdGhpcy5jaGlsZEF0SW5kZXgoZWxlbWVudCwgb2Zmc2V0KTtcbiAgICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUodGV4dE5vZGUsIGJlZm9yZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGlnbm9yZXNDaGVja2VkQXR0cmlidXRlICYmIGlzQ2hlY2tlZCkge1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcbiAgfVxufTtcblxucHJvdG90eXBlLmNsb25lTm9kZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIGRlZXApe1xuICB2YXIgY2xvbmUgPSBlbGVtZW50LmNsb25lTm9kZSghIWRlZXApO1xuICByZXR1cm4gY2xvbmU7XG59O1xuXG5wcm90b3R5cGUuQXR0ck1vcnBoQ2xhc3MgPSBBdHRyTW9ycGg7XG5cbnByb3RvdHlwZS5jcmVhdGVBdHRyTW9ycGggPSBmdW5jdGlvbihlbGVtZW50LCBhdHRyTmFtZSwgbmFtZXNwYWNlKXtcbiAgcmV0dXJuIG5ldyB0aGlzLkF0dHJNb3JwaENsYXNzKGVsZW1lbnQsIGF0dHJOYW1lLCB0aGlzLCBuYW1lc3BhY2UpO1xufTtcblxucHJvdG90eXBlLkVsZW1lbnRNb3JwaENsYXNzID0gRWxlbWVudE1vcnBoO1xuXG5wcm90b3R5cGUuY3JlYXRlRWxlbWVudE1vcnBoID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZXNwYWNlKXtcbiAgcmV0dXJuIG5ldyB0aGlzLkVsZW1lbnRNb3JwaENsYXNzKGVsZW1lbnQsIHRoaXMsIG5hbWVzcGFjZSk7XG59O1xuXG5wcm90b3R5cGUuY3JlYXRlVW5zYWZlQXR0ck1vcnBoID0gZnVuY3Rpb24oZWxlbWVudCwgYXR0ck5hbWUsIG5hbWVzcGFjZSl7XG4gIHZhciBtb3JwaCA9IHRoaXMuY3JlYXRlQXR0ck1vcnBoKGVsZW1lbnQsIGF0dHJOYW1lLCBuYW1lc3BhY2UpO1xuICBtb3JwaC5lc2NhcGVkID0gZmFsc2U7XG4gIHJldHVybiBtb3JwaDtcbn07XG5cbnByb3RvdHlwZS5Nb3JwaENsYXNzID0gTW9ycGg7XG5cbnByb3RvdHlwZS5jcmVhdGVNb3JwaCA9IGZ1bmN0aW9uKHBhcmVudCwgc3RhcnQsIGVuZCwgY29udGV4dHVhbEVsZW1lbnQpe1xuICBpZiAoY29udGV4dHVhbEVsZW1lbnQgJiYgY29udGV4dHVhbEVsZW1lbnQubm9kZVR5cGUgPT09IDExKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHBhc3MgYSBmcmFnbWVudCBhcyB0aGUgY29udGV4dHVhbCBlbGVtZW50IHRvIGNyZWF0ZU1vcnBoXCIpO1xuICB9XG5cbiAgaWYgKCFjb250ZXh0dWFsRWxlbWVudCAmJiBwYXJlbnQgJiYgcGFyZW50Lm5vZGVUeXBlID09PSAxKSB7XG4gICAgY29udGV4dHVhbEVsZW1lbnQgPSBwYXJlbnQ7XG4gIH1cbiAgdmFyIG1vcnBoID0gbmV3IHRoaXMuTW9ycGhDbGFzcyh0aGlzLCBjb250ZXh0dWFsRWxlbWVudCk7XG4gIG1vcnBoLmZpcnN0Tm9kZSA9IHN0YXJ0O1xuICBtb3JwaC5sYXN0Tm9kZSA9IGVuZDtcbiAgcmV0dXJuIG1vcnBoO1xufTtcblxucHJvdG90eXBlLmNyZWF0ZUZyYWdtZW50TW9ycGggPSBmdW5jdGlvbihjb250ZXh0dWFsRWxlbWVudCkge1xuICBpZiAoY29udGV4dHVhbEVsZW1lbnQgJiYgY29udGV4dHVhbEVsZW1lbnQubm9kZVR5cGUgPT09IDExKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHBhc3MgYSBmcmFnbWVudCBhcyB0aGUgY29udGV4dHVhbCBlbGVtZW50IHRvIGNyZWF0ZU1vcnBoXCIpO1xuICB9XG5cbiAgdmFyIGZyYWdtZW50ID0gdGhpcy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHJldHVybiBNb3JwaC5jcmVhdGUodGhpcywgY29udGV4dHVhbEVsZW1lbnQsIGZyYWdtZW50KTtcbn07XG5cbnByb3RvdHlwZS5yZXBsYWNlQ29udGVudFdpdGhNb3JwaCA9IGZ1bmN0aW9uKGVsZW1lbnQpICB7XG4gIHZhciBmaXJzdENoaWxkID0gZWxlbWVudC5maXJzdENoaWxkO1xuXG4gIGlmICghZmlyc3RDaGlsZCkge1xuICAgIHZhciBjb21tZW50ID0gdGhpcy5jcmVhdGVDb21tZW50KCcnKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKGVsZW1lbnQsIGNvbW1lbnQpO1xuICAgIHJldHVybiBNb3JwaC5jcmVhdGUodGhpcywgZWxlbWVudCwgY29tbWVudCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG1vcnBoID0gTW9ycGguYXR0YWNoKHRoaXMsIGVsZW1lbnQsIGZpcnN0Q2hpbGQsIGVsZW1lbnQubGFzdENoaWxkKTtcbiAgICBtb3JwaC5jbGVhcigpO1xuICAgIHJldHVybiBtb3JwaDtcbiAgfVxufTtcblxucHJvdG90eXBlLmNyZWF0ZVVuc2FmZU1vcnBoID0gZnVuY3Rpb24ocGFyZW50LCBzdGFydCwgZW5kLCBjb250ZXh0dWFsRWxlbWVudCl7XG4gIHZhciBtb3JwaCA9IHRoaXMuY3JlYXRlTW9ycGgocGFyZW50LCBzdGFydCwgZW5kLCBjb250ZXh0dWFsRWxlbWVudCk7XG4gIG1vcnBoLnBhcnNlVGV4dEFzSFRNTCA9IHRydWU7XG4gIHJldHVybiBtb3JwaDtcbn07XG5cbi8vIFRoaXMgaGVscGVyIGlzIGp1c3QgdG8ga2VlcCB0aGUgdGVtcGxhdGVzIGdvb2QgbG9va2luZyxcbi8vIHBhc3NpbmcgaW50ZWdlcnMgaW5zdGVhZCBvZiBlbGVtZW50IHJlZmVyZW5jZXMuXG5wcm90b3R5cGUuY3JlYXRlTW9ycGhBdCA9IGZ1bmN0aW9uKHBhcmVudCwgc3RhcnRJbmRleCwgZW5kSW5kZXgsIGNvbnRleHR1YWxFbGVtZW50KXtcbiAgdmFyIHNpbmdsZSA9IHN0YXJ0SW5kZXggPT09IGVuZEluZGV4O1xuICB2YXIgc3RhcnQgPSB0aGlzLmNoaWxkQXRJbmRleChwYXJlbnQsIHN0YXJ0SW5kZXgpO1xuICB2YXIgZW5kID0gc2luZ2xlID8gc3RhcnQgOiB0aGlzLmNoaWxkQXRJbmRleChwYXJlbnQsIGVuZEluZGV4KTtcbiAgcmV0dXJuIHRoaXMuY3JlYXRlTW9ycGgocGFyZW50LCBzdGFydCwgZW5kLCBjb250ZXh0dWFsRWxlbWVudCk7XG59O1xuXG5wcm90b3R5cGUuY3JlYXRlVW5zYWZlTW9ycGhBdCA9IGZ1bmN0aW9uKHBhcmVudCwgc3RhcnRJbmRleCwgZW5kSW5kZXgsIGNvbnRleHR1YWxFbGVtZW50KSB7XG4gIHZhciBtb3JwaCA9IHRoaXMuY3JlYXRlTW9ycGhBdChwYXJlbnQsIHN0YXJ0SW5kZXgsIGVuZEluZGV4LCBjb250ZXh0dWFsRWxlbWVudCk7XG4gIG1vcnBoLnBhcnNlVGV4dEFzSFRNTCA9IHRydWU7XG4gIHJldHVybiBtb3JwaDtcbn07XG5cbnByb3RvdHlwZS5pbnNlcnRNb3JwaEJlZm9yZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIHJlZmVyZW5jZUNoaWxkLCBjb250ZXh0dWFsRWxlbWVudCkge1xuICB2YXIgaW5zZXJ0aW9uID0gdGhpcy5kb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbiAgZWxlbWVudC5pbnNlcnRCZWZvcmUoaW5zZXJ0aW9uLCByZWZlcmVuY2VDaGlsZCk7XG4gIHJldHVybiB0aGlzLmNyZWF0ZU1vcnBoKGVsZW1lbnQsIGluc2VydGlvbiwgaW5zZXJ0aW9uLCBjb250ZXh0dWFsRWxlbWVudCk7XG59O1xuXG5wcm90b3R5cGUuYXBwZW5kTW9ycGggPSBmdW5jdGlvbihlbGVtZW50LCBjb250ZXh0dWFsRWxlbWVudCkge1xuICB2YXIgaW5zZXJ0aW9uID0gdGhpcy5kb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbiAgZWxlbWVudC5hcHBlbmRDaGlsZChpbnNlcnRpb24pO1xuICByZXR1cm4gdGhpcy5jcmVhdGVNb3JwaChlbGVtZW50LCBpbnNlcnRpb24sIGluc2VydGlvbiwgY29udGV4dHVhbEVsZW1lbnQpO1xufTtcblxucHJvdG90eXBlLmluc2VydEJvdW5kYXJ5ID0gZnVuY3Rpb24oZnJhZ21lbnQsIGluZGV4KSB7XG4gIC8vIHRoaXMgd2lsbCBhbHdheXMgYmUgbnVsbCBvciBmaXJzdENoaWxkXG4gIHZhciBjaGlsZCA9IGluZGV4ID09PSBudWxsID8gbnVsbCA6IHRoaXMuY2hpbGRBdEluZGV4KGZyYWdtZW50LCBpbmRleCk7XG4gIHRoaXMuaW5zZXJ0QmVmb3JlKGZyYWdtZW50LCB0aGlzLmNyZWF0ZVRleHROb2RlKCcnKSwgY2hpbGQpO1xufTtcblxucHJvdG90eXBlLnNldE1vcnBoSFRNTCA9IGZ1bmN0aW9uKG1vcnBoLCBodG1sKSB7XG4gIG1vcnBoLnNldEhUTUwoaHRtbCk7XG59O1xuXG5wcm90b3R5cGUucGFyc2VIVE1MID0gZnVuY3Rpb24oaHRtbCwgY29udGV4dHVhbEVsZW1lbnQpIHtcbiAgdmFyIGNoaWxkTm9kZXM7XG5cbiAgaWYgKGludGVyaW9yTmFtZXNwYWNlKGNvbnRleHR1YWxFbGVtZW50KSA9PT0gc3ZnTmFtZXNwYWNlKSB7XG4gICAgY2hpbGROb2RlcyA9IGJ1aWxkU1ZHRE9NKGh0bWwsIHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIHZhciBub2RlcyA9IGJ1aWxkSFRNTERPTShodG1sLCBjb250ZXh0dWFsRWxlbWVudCwgdGhpcyk7XG4gICAgaWYgKGRldGVjdE9taXR0ZWRTdGFydFRhZyhodG1sLCBjb250ZXh0dWFsRWxlbWVudCkpIHtcbiAgICAgIHZhciBub2RlID0gbm9kZXNbMF07XG4gICAgICB3aGlsZSAobm9kZSAmJiBub2RlLm5vZGVUeXBlICE9PSAxKSB7XG4gICAgICAgIG5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgICAgfVxuICAgICAgY2hpbGROb2RlcyA9IG5vZGUuY2hpbGROb2RlcztcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGROb2RlcyA9IG5vZGVzO1xuICAgIH1cbiAgfVxuXG4gIC8vIENvcHkgbm9kZSBsaXN0IHRvIGEgZnJhZ21lbnQuXG4gIHZhciBmcmFnbWVudCA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gIGlmIChjaGlsZE5vZGVzICYmIGNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgIHZhciBjdXJyZW50Tm9kZSA9IGNoaWxkTm9kZXNbMF07XG5cbiAgICAvLyBXZSBwcmVwZW5kIGFuIDxvcHRpb24+IHRvIDxzZWxlY3Q+IGJveGVzIHRvIGFic29yYiBhbnkgYnJvd3NlciBidWdzXG4gICAgLy8gcmVsYXRlZCB0byBhdXRvLXNlbGVjdCBiZWhhdmlvci4gU2tpcCBwYXN0IGl0LlxuICAgIGlmIChjb250ZXh0dWFsRWxlbWVudC50YWdOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0U2libGluZztcbiAgICB9XG5cbiAgICB3aGlsZSAoY3VycmVudE5vZGUpIHtcbiAgICAgIHZhciB0ZW1wTm9kZSA9IGN1cnJlbnROb2RlO1xuICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0U2libGluZztcblxuICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQodGVtcE5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmcmFnbWVudDtcbn07XG5cbnZhciBwYXJzaW5nTm9kZTtcblxuLy8gVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciBhIFVSTCBuZWVkcyB0byBiZSBzYW5pdGl6ZWQuXG5wcm90b3R5cGUucHJvdG9jb2xGb3JVUkwgPSBmdW5jdGlvbih1cmwpIHtcbiAgaWYgKCFwYXJzaW5nTm9kZSkge1xuICAgIHBhcnNpbmdOb2RlID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIH1cblxuICBwYXJzaW5nTm9kZS5ocmVmID0gdXJsO1xuICByZXR1cm4gcGFyc2luZ05vZGUucHJvdG9jb2w7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBET01IZWxwZXI7XG4iXX0=