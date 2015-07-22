define("htmlbars-test-helpers", ["exports", "../simple-html-tokenizer", "../htmlbars-util/array-utils"], function (exports, _simpleHtmlTokenizer, _htmlbarsUtilArrayUtils) {
  exports.equalInnerHTML = equalInnerHTML;
  exports.equalHTML = equalHTML;
  exports.equalTokens = equalTokens;
  exports.normalizeInnerHTML = normalizeInnerHTML;
  exports.isCheckedInputHTML = isCheckedInputHTML;
  exports.getTextContent = getTextContent;

  function equalInnerHTML(fragment, html) {
    var actualHTML = normalizeInnerHTML(fragment.innerHTML);
    QUnit.push(actualHTML === html, actualHTML, html);
  }

  function equalHTML(node, html) {
    var fragment;
    if (!node.nodeType && node.length) {
      fragment = document.createDocumentFragment();
      while (node[0]) {
        fragment.appendChild(node[0]);
      }
    } else {
      fragment = node;
    }

    var div = document.createElement("div");
    div.appendChild(fragment.cloneNode(true));

    equalInnerHTML(div, html);
  }

  function generateTokens(fragmentOrHtml) {
    var div = document.createElement("div");
    if (typeof fragmentOrHtml === 'string') {
      div.innerHTML = fragmentOrHtml;
    } else {
      div.appendChild(fragmentOrHtml.cloneNode(true));
    }

    return { tokens: _simpleHtmlTokenizer.tokenize(div.innerHTML), html: div.innerHTML };
  }

  function equalTokens(fragment, html, message) {
    if (fragment.fragment) {
      fragment = fragment.fragment;
    }
    if (html.fragment) {
      html = html.fragment;
    }

    var fragTokens = generateTokens(fragment);
    var htmlTokens = generateTokens(html);

    function normalizeTokens(token) {
      if (token.type === 'StartTag') {
        token.attributes = token.attributes.sort(function (a, b) {
          if (a[0] > b[0]) {
            return 1;
          }
          if (a[0] < b[0]) {
            return -1;
          }
          return 0;
        });
      }
    }

    _htmlbarsUtilArrayUtils.forEach(fragTokens.tokens, normalizeTokens);
    _htmlbarsUtilArrayUtils.forEach(htmlTokens.tokens, normalizeTokens);

    var msg = "Expected: " + html + "; Actual: " + fragTokens.html;

    if (message) {
      msg += " (" + message + ")";
    }

    deepEqual(fragTokens.tokens, htmlTokens.tokens, msg);
  }

  // detect side-effects of cloning svg elements in IE9-11
  var ieSVGInnerHTML = (function () {
    if (!document.createElementNS) {
      return false;
    }
    var div = document.createElement('div');
    var node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    div.appendChild(node);
    var clone = div.cloneNode(true);
    return clone.innerHTML === '<svg xmlns="http://www.w3.org/2000/svg" />';
  })();

  function normalizeInnerHTML(actualHTML) {
    if (ieSVGInnerHTML) {
      // Replace `<svg xmlns="http://www.w3.org/2000/svg" height="50%" />` with `<svg height="50%"></svg>`, etc.
      // drop namespace attribute
      actualHTML = actualHTML.replace(/ xmlns="[^"]+"/, '');
      // replace self-closing elements
      actualHTML = actualHTML.replace(/<([^ >]+) [^\/>]*\/>/gi, function (tag, tagName) {
        return tag.slice(0, tag.length - 3) + '></' + tagName + '>';
      });
    }

    return actualHTML;
  }

  // detect weird IE8 checked element string
  var checkedInput = document.createElement('input');
  checkedInput.setAttribute('checked', 'checked');
  var checkedInputString = checkedInput.outerHTML;

  function isCheckedInputHTML(element) {
    equal(element.outerHTML, checkedInputString);
  }

  // check which property has the node's text content
  var textProperty = document.createElement('div').textContent === undefined ? 'innerText' : 'textContent';

  function getTextContent(el) {
    // textNode
    if (el.nodeType === 3) {
      return el.nodeValue;
    } else {
      return el[textProperty];
    }
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXRlc3QtaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1VBR2dCLGNBQWMsR0FBZCxjQUFjO1VBS2QsU0FBUyxHQUFULFNBQVM7VUE0QlQsV0FBVyxHQUFYLFdBQVc7VUF1Q1gsa0JBQWtCLEdBQWxCLGtCQUFrQjtVQWtCbEIsa0JBQWtCLEdBQWxCLGtCQUFrQjtVQU1sQixjQUFjLEdBQWQsY0FBYzs7QUFoR3ZCLFdBQVMsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUU7QUFDN0MsUUFBSSxVQUFVLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3hELFNBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDbkQ7O0FBRU0sV0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUNwQyxRQUFJLFFBQVEsQ0FBQztBQUNiLFFBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDakMsY0FBUSxHQUFHLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0FBQzdDLGFBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ2QsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDL0I7S0FDRixNQUFNO0FBQ0wsY0FBUSxHQUFHLElBQUksQ0FBQztLQUNqQjs7QUFFRCxRQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hDLE9BQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUUxQyxrQkFBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUMzQjs7QUFFRCxXQUFTLGNBQWMsQ0FBQyxjQUFjLEVBQUU7QUFDdEMsUUFB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RUFBRSxDQUFDLENBQUM7O0FBRXRELGdCQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxVQUFTLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDL0UsZUFBTyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFDO09BQzdELENBQUMsQ0FBQztLQUNKOztBQUVELFdBQU8sVUFBVSxDQUFDO0dBQ25COzs7QUFHRCxNQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25ELGNBQVksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ2hELE1BQUksa0JBQWtCLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQzs7QUFDekMsV0FBUyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUU7QUFDMUMsU0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztHQUM5Qzs7O0FBR0QsTUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEtBQUssU0FBUyxHQUFHLFdBQVcsR0FBRyxhQUFhLENBQUM7O0FBQ2xHLFdBQVMsY0FBYyxDQUFDLEVBQUUsRUFBRTs7QUFFakMsUUFBSSxFQUFFLENBQUMsUUFBUSxLQUFLLENBQUMsRUFBRTtBQUNyQixhQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7S0FDckIsTUFBTTtBQUNMLGFBQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ3pCO0dBQ0YiLCJmaWxlIjoiaHRtbGJhcnMtdGVzdC1oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdG9rZW5pemUgfSBmcm9tIFwiLi4vc2ltcGxlLWh0bWwtdG9rZW5pemVyXCI7XG5pbXBvcnQgeyBmb3JFYWNoIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXV0aWwvYXJyYXktdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsSW5uZXJIVE1MKGZyYWdtZW50LCBodG1sKSB7XG4gIHZhciBhY3R1YWxIVE1MID0gbm9ybWFsaXplSW5uZXJIVE1MKGZyYWdtZW50LmlubmVySFRNTCk7XG4gIFFVbml0LnB1c2goYWN0dWFsSFRNTCA9PT0gaHRtbCwgYWN0dWFsSFRNTCwgaHRtbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbEhUTUwobm9kZSwgaHRtbCkge1xuICB2YXIgZnJhZ21lbnQ7XG4gIGlmICghbm9kZS5ub2RlVHlwZSAmJiBub2RlLmxlbmd0aCkge1xuICAgIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIHdoaWxlIChub2RlWzBdKSB7XG4gICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChub2RlWzBdKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZnJhZ21lbnQgPSBub2RlO1xuICB9XG5cbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGRpdi5hcHBlbmRDaGlsZChmcmFnbWVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuXG4gIGVxdWFsSW5uZXJIVE1MKGRpdiwgaHRtbCk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlVG9rZW5zKGZyYWdtZW50T3JIdG1sKSB7XG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBpZiAodHlwZW9mIGZyYWdtZW50T3JIdG1sID09PSAnc3RyaW5nJykge1xuICAgIGRpdi5pbm5lckhUTUwgPSBmcmFnbWVudE9ySHRtbDtcbiAgfSBlbHNlIHtcbiAgICBkaXYuYXBwZW5kQ2hpbGQoZnJhZ21lbnRPckh0bWwuY2xvbmVOb2RlKHRydWUpKTtcbiAgfVxuXG4gIHJldHVybiB7IHRva2VuczogdG9rZW5pemUoZGl2LmlubmVySFRNTCksIGh0bWw6IGRpdi5pbm5lckhUTUwgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsVG9rZW5zKGZyYWdtZW50LCBodG1sLCBtZXNzYWdlKSB7XG4gIGlmIChmcmFnbWVudC5mcmFnbWVudCkgeyBmcmFnbWVudCA9IGZyYWdtZW50LmZyYWdtZW50OyB9XG4gIGlmIChodG1sLmZyYWdtZW50KSB7IGh0bWwgPSBodG1sLmZyYWdtZW50OyB9XG5cbiAgdmFyIGZyYWdUb2tlbnMgPSBnZW5lcmF0ZVRva2VucyhmcmFnbWVudCk7XG4gIHZhciBodG1sVG9rZW5zID0gZ2VuZXJhdGVUb2tlbnMoaHRtbCk7XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVG9rZW5zKHRva2VuKSB7XG4gICAgaWYgKHRva2VuLnR5cGUgPT09ICdTdGFydFRhZycpIHtcbiAgICAgIHRva2VuLmF0dHJpYnV0ZXMgPSB0b2tlbi5hdHRyaWJ1dGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICBpZiAoYVswXSA+IGJbMF0pIHsgcmV0dXJuIDE7IH1cbiAgICAgICAgaWYgKGFbMF0gPCBiWzBdKSB7IHJldHVybiAtMTsgfVxuICAgICAgICByZXR1cm4gMDsgICAgXG4gICAgICB9KTsgICAgXG4gICAgfSAgICBcbiAgfSAgICBcbiAgIFxuICBmb3JFYWNoKGZyYWdUb2tlbnMudG9rZW5zLCBub3JtYWxpemVUb2tlbnMpOyAgIFxuICBmb3JFYWNoKGh0bWxUb2tlbnMudG9rZW5zLCBub3JtYWxpemVUb2tlbnMpOyAgIFxuXG4gIHZhciBtc2cgPSBcIkV4cGVjdGVkOiBcIiArIGh0bWwgKyBcIjsgQWN0dWFsOiBcIiArIGZyYWdUb2tlbnMuaHRtbDtcblxuICBpZiAobWVzc2FnZSkgeyBtc2cgKz0gXCIgKFwiICsgbWVzc2FnZSArIFwiKVwiOyB9XG5cbiAgZGVlcEVxdWFsKGZyYWdUb2tlbnMudG9rZW5zLCBodG1sVG9rZW5zLnRva2VucywgbXNnKTtcbn1cblxuLy8gZGV0ZWN0IHNpZGUtZWZmZWN0cyBvZiBjbG9uaW5nIHN2ZyBlbGVtZW50cyBpbiBJRTktMTFcbnZhciBpZVNWR0lubmVySFRNTCA9IChmdW5jdGlvbiAoKSB7XG4gIGlmICghZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3N2ZycpO1xuICBkaXYuYXBwZW5kQ2hpbGQobm9kZSk7XG4gIHZhciBjbG9uZSA9IGRpdi5jbG9uZU5vZGUodHJ1ZSk7XG4gIHJldHVybiBjbG9uZS5pbm5lckhUTUwgPT09ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiAvPic7XG59KSgpO1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplSW5uZXJIVE1MKGFjdHVhbEhUTUwpIHtcbiAgaWYgKGllU1ZHSW5uZXJIVE1MKSB7XG4gICAgLy8gUmVwbGFjZSBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgaGVpZ2h0PVwiNTAlXCIgLz5gIHdpdGggYDxzdmcgaGVpZ2h0PVwiNTAlXCI+PC9zdmc+YCwgZXRjLlxuICAgIC8vIGRyb3AgbmFtZXNwYWNlIGF0dHJpYnV0ZVxuICAgIGFjdHVhbEhUTUwgPSBhY3R1YWxIVE1MLnJlcGxhY2UoLyB4bWxucz1cIlteXCJdK1wiLywgJycpO1xuICAgIC8vIHJlcGxhY2Ugc2VsZi1jbG9zaW5nIGVsZW1lbnRzXG4gICAgYWN0dWFsSFRNTCA9IGFjdHVhbEhUTUwucmVwbGFjZSgvPChbXiA+XSspIFteXFwvPl0qXFwvPi9naSwgZnVuY3Rpb24odGFnLCB0YWdOYW1lKSB7XG4gICAgICByZXR1cm4gdGFnLnNsaWNlKDAsIHRhZy5sZW5ndGggLSAzKSArICc+PC8nICsgdGFnTmFtZSArICc+JztcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBhY3R1YWxIVE1MO1xufVxuXG4vLyBkZXRlY3Qgd2VpcmQgSUU4IGNoZWNrZWQgZWxlbWVudCBzdHJpbmdcbnZhciBjaGVja2VkSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuY2hlY2tlZElucHV0LnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsICdjaGVja2VkJyk7XG52YXIgY2hlY2tlZElucHV0U3RyaW5nID0gY2hlY2tlZElucHV0Lm91dGVySFRNTDtcbmV4cG9ydCBmdW5jdGlvbiBpc0NoZWNrZWRJbnB1dEhUTUwoZWxlbWVudCkge1xuICBlcXVhbChlbGVtZW50Lm91dGVySFRNTCwgY2hlY2tlZElucHV0U3RyaW5nKTtcbn1cblxuLy8gY2hlY2sgd2hpY2ggcHJvcGVydHkgaGFzIHRoZSBub2RlJ3MgdGV4dCBjb250ZW50XG52YXIgdGV4dFByb3BlcnR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykudGV4dENvbnRlbnQgPT09IHVuZGVmaW5lZCA/ICdpbm5lclRleHQnIDogJ3RleHRDb250ZW50JztcbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXh0Q29udGVudChlbCkge1xuICAvLyB0ZXh0Tm9kZVxuICBpZiAoZWwubm9kZVR5cGUgPT09IDMpIHtcbiAgICByZXR1cm4gZWwubm9kZVZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlbFt0ZXh0UHJvcGVydHldO1xuICB9XG59XG4iXX0=
define('htmlbars-test-helpers.jshint', ['exports'], function (exports) {
  module('JSHint - .');
  test('htmlbars-test-helpers.js should pass jshint', function () {
    ok(true, 'htmlbars-test-helpers.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXRlc3QtaGVscGVycy5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNyQixNQUFJLENBQUMsNkNBQTZDLEVBQUUsWUFBVztBQUM3RCxNQUFFLENBQUMsSUFBSSxFQUFFLDhDQUE4QyxDQUFDLENBQUM7R0FDMUQsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXRlc3QtaGVscGVycy5qc2hpbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUoJ0pTSGludCAtIC4nKTtcbnRlc3QoJ2h0bWxiYXJzLXRlc3QtaGVscGVycy5qcyBzaG91bGQgcGFzcyBqc2hpbnQnLCBmdW5jdGlvbigpIHsgXG4gIG9rKHRydWUsICdodG1sYmFycy10ZXN0LWhlbHBlcnMuanMgc2hvdWxkIHBhc3MganNoaW50LicpOyBcbn0pO1xuIl19
define('htmlbars-util', ['exports', './htmlbars-util/safe-string', './htmlbars-util/handlebars/utils', './htmlbars-util/namespaces', './htmlbars-util/morph-utils'], function (exports, _htmlbarsUtilSafeString, _htmlbarsUtilHandlebarsUtils, _htmlbarsUtilNamespaces, _htmlbarsUtilMorphUtils) {
  exports.SafeString = _htmlbarsUtilSafeString.default;
  exports.escapeExpression = _htmlbarsUtilHandlebarsUtils.escapeExpression;
  exports.getAttrNamespace = _htmlbarsUtilNamespaces.getAttrNamespace;
  exports.validateChildMorphs = _htmlbarsUtilMorphUtils.validateChildMorphs;
  exports.linkParams = _htmlbarsUtilMorphUtils.linkParams;
  exports.dump = _htmlbarsUtilMorphUtils.dump;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtVQU1FLFVBQVU7VUFDVixnQkFBZ0IsZ0NBTlQsZ0JBQWdCO1VBT3ZCLGdCQUFnQiwyQkFOVCxnQkFBZ0I7VUFPdkIsbUJBQW1CLDJCQU5aLG1CQUFtQjtVQU8xQixVQUFVLDJCQVBrQixVQUFVO1VBUXRDLElBQUksMkJBUm9DLElBQUkiLCJmaWxlIjoiaHRtbGJhcnMtdXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTYWZlU3RyaW5nIGZyb20gJy4vaHRtbGJhcnMtdXRpbC9zYWZlLXN0cmluZyc7XG5pbXBvcnQgeyBlc2NhcGVFeHByZXNzaW9uIH0gZnJvbSAnLi9odG1sYmFycy11dGlsL2hhbmRsZWJhcnMvdXRpbHMnO1xuaW1wb3J0IHsgZ2V0QXR0ck5hbWVzcGFjZSB9IGZyb20gJy4vaHRtbGJhcnMtdXRpbC9uYW1lc3BhY2VzJztcbmltcG9ydCB7IHZhbGlkYXRlQ2hpbGRNb3JwaHMsIGxpbmtQYXJhbXMsIGR1bXAgfSBmcm9tICcuL2h0bWxiYXJzLXV0aWwvbW9ycGgtdXRpbHMnO1xuXG5leHBvcnQge1xuICBTYWZlU3RyaW5nLFxuICBlc2NhcGVFeHByZXNzaW9uLFxuICBnZXRBdHRyTmFtZXNwYWNlLFxuICB2YWxpZGF0ZUNoaWxkTW9ycGhzLFxuICBsaW5rUGFyYW1zLFxuICBkdW1wXG59O1xuIl19
define('htmlbars-util.jshint', ['exports'], function (exports) {
  module('JSHint - .');
  test('htmlbars-util.js should pass jshint', function () {
    ok(true, 'htmlbars-util.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDckIsTUFBSSxDQUFDLHFDQUFxQyxFQUFFLFlBQVc7QUFDckQsTUFBRSxDQUFDLElBQUksRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDO0dBQ2xELENBQUMsQ0FBQyIsImZpbGUiOiJodG1sYmFycy11dGlsLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gLicpO1xudGVzdCgnaHRtbGJhcnMtdXRpbC5qcyBzaG91bGQgcGFzcyBqc2hpbnQnLCBmdW5jdGlvbigpIHsgXG4gIG9rKHRydWUsICdodG1sYmFycy11dGlsLmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
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
define('htmlbars-util/array-utils.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-util');
  test('htmlbars-util/array-utils.js should pass jshint', function () {
    ok(true, 'htmlbars-util/array-utils.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvYXJyYXktdXRpbHMuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNqQyxNQUFJLENBQUMsaURBQWlELEVBQUUsWUFBVztBQUNqRSxNQUFFLENBQUMsSUFBSSxFQUFFLGtEQUFrRCxDQUFDLENBQUM7R0FDOUQsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXV0aWwvYXJyYXktdXRpbHMuanNoaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlKCdKU0hpbnQgLSBodG1sYmFycy11dGlsJyk7XG50ZXN0KCdodG1sYmFycy11dGlsL2FycmF5LXV0aWxzLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXV0aWwvYXJyYXktdXRpbHMuanMgc2hvdWxkIHBhc3MganNoaW50LicpOyBcbn0pO1xuIl19
define('htmlbars-util/handlebars/safe-string', ['exports'], function (exports) {
  // Build out our basic SafeString type
  function SafeString(string) {
    this.string = string;
  }

  SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
    return '' + this.string;
  };

  exports.default = SafeString;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvaGFuZGxlYmFycy9zYWZlLXN0cmluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLFdBQVMsVUFBVSxDQUFDLE1BQU0sRUFBRTtBQUMxQixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztHQUN0Qjs7QUFFRCxZQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFXO0FBQ3ZFLFdBQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7R0FDekIsQ0FBQzs7b0JBRWEsVUFBVSIsImZpbGUiOiJodG1sYmFycy11dGlsL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gU2FmZVN0cmluZy5wcm90b3R5cGUudG9IVE1MID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnJyArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2FmZVN0cmluZztcbiJdfQ==
define('htmlbars-util/handlebars/safe-string.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-util/handlebars');
  test('htmlbars-util/handlebars/safe-string.js should pass jshint', function () {
    ok(true, 'htmlbars-util/handlebars/safe-string.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvaGFuZGxlYmFycy9zYWZlLXN0cmluZy5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBQzVDLE1BQUksQ0FBQyw0REFBNEQsRUFBRSxZQUFXO0FBQzVFLE1BQUUsQ0FBQyxJQUFJLEVBQUUsNkRBQTZELENBQUMsQ0FBQztHQUN6RSxDQUFDLENBQUMiLCJmaWxlIjoiaHRtbGJhcnMtdXRpbC9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gaHRtbGJhcnMtdXRpbC9oYW5kbGViYXJzJyk7XG50ZXN0KCdodG1sYmFycy11dGlsL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcuanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayh0cnVlLCAnaHRtbGJhcnMtdXRpbC9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
define('htmlbars-util/handlebars/utils', ['exports'], function (exports) {
  exports.extend = extend;
  exports.indexOf = indexOf;
  exports.escapeExpression = escapeExpression;
  exports.isEmpty = isEmpty;
  exports.blockParams = blockParams;
  exports.appendContextPath = appendContextPath;
  var escape = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  var badChars = /[&<>"'`]/g,
      possible = /[&<>"'`]/;

  function escapeChar(chr) {
    return escape[chr];
  }

  function extend(obj /* , ...source */) {
    for (var i = 1; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          obj[key] = arguments[i][key];
        }
      }
    }

    return obj;
  }

  var toString = Object.prototype.toString;

  // Sourced from lodash
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  /*eslint-disable func-style, no-var */
  exports.toString = toString;
  var isFunction = function (value) {
    return typeof value === 'function';
  };
  // fallback for older versions of Chrome and Safari
  /* istanbul ignore next */
  if (isFunction(/x/)) {
    exports.isFunction = isFunction = function (value) {
      return typeof value === 'function' && toString.call(value) === '[object Function]';
    };
  }
  var isFunction;
  /*eslint-enable func-style, no-var */

  /* istanbul ignore next */
  exports.isFunction = isFunction;
  var isArray = Array.isArray || function (value) {
    return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
  };

  // Older IE versions do not directly support indexOf so we must implement our own, sadly.
  exports.isArray = isArray;

  function indexOf(array, value) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i] === value) {
        return i;
      }
    }
    return -1;
  }

  function escapeExpression(string) {
    if (typeof string !== 'string') {
      // don't escape SafeStrings, since they're already safe
      if (string && string.toHTML) {
        return string.toHTML();
      } else if (string == null) {
        return '';
      } else if (!string) {
        return string + '';
      }

      // Force a string conversion as this will be done by the append regardless and
      // the regex test will do this transparently behind the scenes, causing issues if
      // an object's to string has escaped characters in it.
      string = '' + string;
    }

    if (!possible.test(string)) {
      return string;
    }
    return string.replace(badChars, escapeChar);
  }

  function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  function blockParams(params, ids) {
    params.path = ids;
    return params;
  }

  function appendContextPath(contextPath, id) {
    return (contextPath ? contextPath + '.' : '') + id;
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvaGFuZGxlYmFycy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1VBZ0JnQixNQUFNLEdBQU4sTUFBTTtVQW9DTixPQUFPLEdBQVAsT0FBTztVQVVQLGdCQUFnQixHQUFoQixnQkFBZ0I7VUFxQmhCLE9BQU8sR0FBUCxPQUFPO1VBVVAsV0FBVyxHQUFYLFdBQVc7VUFLWCxpQkFBaUIsR0FBakIsaUJBQWlCO0FBbEdqQyxNQUFNLE1BQU0sR0FBRztBQUNiLE9BQUcsRUFBRSxPQUFPO0FBQ1osT0FBRyxFQUFFLE1BQU07QUFDWCxPQUFHLEVBQUUsTUFBTTtBQUNYLE9BQUcsRUFBRSxRQUFRO0FBQ2IsT0FBRyxFQUFFLFFBQVE7QUFDYixPQUFHLEVBQUUsUUFBUTtHQUNkLENBQUM7O0FBRUYsTUFBTSxRQUFRLEdBQUcsV0FBVztNQUN0QixRQUFRLEdBQUcsVUFBVSxDQUFDOztBQUU1QixXQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUU7QUFDdkIsV0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDcEI7O0FBRU0sV0FBUyxNQUFNLENBQUMsR0FBRyxvQkFBb0I7QUFDNUMsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekMsV0FBSyxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDNUIsWUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQzNELGFBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDOUI7T0FDRjtLQUNGOztBQUVELFdBQU8sR0FBRyxDQUFDO0dBQ1o7O0FBRU0sTUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7Ozs7O1VBQXJDLFFBQVEsR0FBUixRQUFRO0FBS25CLE1BQUksVUFBVSxHQUFHLFVBQVMsS0FBSyxFQUFFO0FBQy9CLFdBQU8sT0FBTyxLQUFLLEtBQUssVUFBVSxDQUFDO0dBQ3BDLENBQUM7OztBQUdGLE1BQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ25CLFlBSVMsVUFBVSxHQUpuQixVQUFVLEdBQUcsVUFBUyxLQUFLLEVBQUU7QUFDM0IsYUFBTyxPQUFPLEtBQUssS0FBSyxVQUFVLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxtQkFBbUIsQ0FBQztLQUNwRixDQUFDO0dBQ0g7QUFDTSxNQUFJLFVBQVUsQ0FBQzs7OztVQUFYLFVBQVUsR0FBVixVQUFVO0FBSWQsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxVQUFTLEtBQUssRUFBRTtBQUN0RCxXQUFPLEFBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsR0FBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLGdCQUFnQixHQUFHLEtBQUssQ0FBQztHQUNqRyxDQUFDOzs7VUFGVyxPQUFPLEdBQVAsT0FBTzs7QUFLYixXQUFTLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQ3BDLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDaEQsVUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFO0FBQ3RCLGVBQU8sQ0FBQyxDQUFDO09BQ1Y7S0FDRjtBQUNELFdBQU8sQ0FBQyxDQUFDLENBQUM7R0FDWDs7QUFHTSxXQUFTLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtBQUN2QyxRQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTs7QUFFOUIsVUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUMzQixlQUFPLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUN4QixNQUFNLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUN6QixlQUFPLEVBQUUsQ0FBQztPQUNYLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNsQixlQUFPLE1BQU0sR0FBRyxFQUFFLENBQUM7T0FDcEI7Ozs7O0FBS0QsWUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUM7S0FDdEI7O0FBRUQsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFBRSxhQUFPLE1BQU0sQ0FBQztLQUFFO0FBQzlDLFdBQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7R0FDN0M7O0FBRU0sV0FBUyxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQzdCLFFBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtBQUN6QixhQUFPLElBQUksQ0FBQztLQUNiLE1BQU0sSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDL0MsYUFBTyxJQUFJLENBQUM7S0FDYixNQUFNO0FBQ0wsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGOztBQUVNLFdBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7QUFDdkMsVUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7QUFDbEIsV0FBTyxNQUFNLENBQUM7R0FDZjs7QUFFTSxXQUFTLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUU7QUFDakQsV0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQSxHQUFJLEVBQUUsQ0FBQztHQUNwRCIsImZpbGUiOiJodG1sYmFycy11dGlsL2hhbmRsZWJhcnMvdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBlc2NhcGUgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmI3gyNzsnLFxuICAnYCc6ICcmI3g2MDsnXG59O1xuXG5jb25zdCBiYWRDaGFycyA9IC9bJjw+XCInYF0vZyxcbiAgICAgIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbmZ1bmN0aW9uIGVzY2FwZUNoYXIoY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChvYmogLyogLCAuLi5zb3VyY2UgKi8pIHtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFyZ3VtZW50c1tpXSwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCBsZXQgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBTb3VyY2VkIGZyb20gbG9kYXNoXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYmVzdGllanMvbG9kYXNoL2Jsb2IvbWFzdGVyL0xJQ0VOU0UudHh0XG4vKmVzbGludC1kaXNhYmxlIGZ1bmMtc3R5bGUsIG5vLXZhciAqL1xudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbmV4cG9ydCB2YXIgaXNGdW5jdGlvbjtcbi8qZXNsaW50LWVuYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmV4cG9ydCBjb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07XG5cbi8vIE9sZGVyIElFIHZlcnNpb25zIGRvIG5vdCBkaXJlY3RseSBzdXBwb3J0IGluZGV4T2Ygc28gd2UgbXVzdCBpbXBsZW1lbnQgb3VyIG93biwgc2FkbHkuXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrUGFyYW1zKHBhcmFtcywgaWRzKSB7XG4gIHBhcmFtcy5wYXRoID0gaWRzO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwZW5kQ29udGV4dFBhdGgoY29udGV4dFBhdGgsIGlkKSB7XG4gIHJldHVybiAoY29udGV4dFBhdGggPyBjb250ZXh0UGF0aCArICcuJyA6ICcnKSArIGlkO1xufVxuIl19
define('htmlbars-util/handlebars/utils.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-util/handlebars');
  test('htmlbars-util/handlebars/utils.js should pass jshint', function () {
    ok(false, 'htmlbars-util/handlebars/utils.js should pass jshint.\nhtmlbars-util/handlebars/utils.js: line 68, col 25, Expected \'===\' and instead saw \'==\'.\n\n1 error');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvaGFuZGxlYmFycy91dGlscy5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBQzVDLE1BQUksQ0FBQyxzREFBc0QsRUFBRSxZQUFXO0FBQ3RFLE1BQUUsQ0FBQyxLQUFLLEVBQUUsZ0tBQWdLLENBQUMsQ0FBQztHQUM3SyxDQUFDLENBQUMiLCJmaWxlIjoiaHRtbGJhcnMtdXRpbC9oYW5kbGViYXJzL3V0aWxzLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gaHRtbGJhcnMtdXRpbC9oYW5kbGViYXJzJyk7XG50ZXN0KCdodG1sYmFycy11dGlsL2hhbmRsZWJhcnMvdXRpbHMuanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayhmYWxzZSwgJ2h0bWxiYXJzLXV0aWwvaGFuZGxlYmFycy91dGlscy5qcyBzaG91bGQgcGFzcyBqc2hpbnQuXFxuaHRtbGJhcnMtdXRpbC9oYW5kbGViYXJzL3V0aWxzLmpzOiBsaW5lIDY4LCBjb2wgMjUsIEV4cGVjdGVkIFxcJz09PVxcJyBhbmQgaW5zdGVhZCBzYXcgXFwnPT1cXCcuXFxuXFxuMSBlcnJvcicpOyBcbn0pO1xuIl19
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
define('htmlbars-util/morph-utils.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-util');
  test('htmlbars-util/morph-utils.js should pass jshint', function () {
    ok(true, 'htmlbars-util/morph-utils.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvbW9ycGgtdXRpbHMuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNqQyxNQUFJLENBQUMsaURBQWlELEVBQUUsWUFBVztBQUNqRSxNQUFFLENBQUMsSUFBSSxFQUFFLGtEQUFrRCxDQUFDLENBQUM7R0FDOUQsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXV0aWwvbW9ycGgtdXRpbHMuanNoaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlKCdKU0hpbnQgLSBodG1sYmFycy11dGlsJyk7XG50ZXN0KCdodG1sYmFycy11dGlsL21vcnBoLXV0aWxzLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXV0aWwvbW9ycGgtdXRpbHMuanMgc2hvdWxkIHBhc3MganNoaW50LicpOyBcbn0pO1xuIl19
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
define('htmlbars-util/namespaces.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-util');
  test('htmlbars-util/namespaces.js should pass jshint', function () {
    ok(true, 'htmlbars-util/namespaces.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvbmFtZXNwYWNlcy5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pDLE1BQUksQ0FBQyxnREFBZ0QsRUFBRSxZQUFXO0FBQ2hFLE1BQUUsQ0FBQyxJQUFJLEVBQUUsaURBQWlELENBQUMsQ0FBQztHQUM3RCxDQUFDLENBQUMiLCJmaWxlIjoiaHRtbGJhcnMtdXRpbC9uYW1lc3BhY2VzLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gaHRtbGJhcnMtdXRpbCcpO1xudGVzdCgnaHRtbGJhcnMtdXRpbC9uYW1lc3BhY2VzLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXV0aWwvbmFtZXNwYWNlcy5qcyBzaG91bGQgcGFzcyBqc2hpbnQuJyk7IFxufSk7XG4iXX0=
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
define('htmlbars-util/object-utils.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-util');
  test('htmlbars-util/object-utils.js should pass jshint', function () {
    ok(true, 'htmlbars-util/object-utils.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvb2JqZWN0LXV0aWxzLmpzaGludC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDakMsTUFBSSxDQUFDLGtEQUFrRCxFQUFFLFlBQVc7QUFDbEUsTUFBRSxDQUFDLElBQUksRUFBRSxtREFBbUQsQ0FBQyxDQUFDO0dBQy9ELENBQUMsQ0FBQyIsImZpbGUiOiJodG1sYmFycy11dGlsL29iamVjdC11dGlscy5qc2hpbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUoJ0pTSGludCAtIGh0bWxiYXJzLXV0aWwnKTtcbnRlc3QoJ2h0bWxiYXJzLXV0aWwvb2JqZWN0LXV0aWxzLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXV0aWwvb2JqZWN0LXV0aWxzLmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
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
define('htmlbars-util/quoting.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-util');
  test('htmlbars-util/quoting.js should pass jshint', function () {
    ok(true, 'htmlbars-util/quoting.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvcXVvdGluZy5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pDLE1BQUksQ0FBQyw2Q0FBNkMsRUFBRSxZQUFXO0FBQzdELE1BQUUsQ0FBQyxJQUFJLEVBQUUsOENBQThDLENBQUMsQ0FBQztHQUMxRCxDQUFDLENBQUMiLCJmaWxlIjoiaHRtbGJhcnMtdXRpbC9xdW90aW5nLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gaHRtbGJhcnMtdXRpbCcpO1xudGVzdCgnaHRtbGJhcnMtdXRpbC9xdW90aW5nLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXV0aWwvcXVvdGluZy5qcyBzaG91bGQgcGFzcyBqc2hpbnQuJyk7IFxufSk7XG4iXX0=
define('htmlbars-util/safe-string', ['exports', './handlebars/safe-string'], function (exports, _handlebarsSafeString) {
  exports.default = _handlebarsSafeString.default;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJodG1sYmFycy11dGlsL3NhZmUtc3RyaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==
define('htmlbars-util/safe-string.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-util');
  test('htmlbars-util/safe-string.js should pass jshint', function () {
    ok(true, 'htmlbars-util/safe-string.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvc2FmZS1zdHJpbmcuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNqQyxNQUFJLENBQUMsaURBQWlELEVBQUUsWUFBVztBQUNqRSxNQUFFLENBQUMsSUFBSSxFQUFFLGtEQUFrRCxDQUFDLENBQUM7R0FDOUQsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXV0aWwvc2FmZS1zdHJpbmcuanNoaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlKCdKU0hpbnQgLSBodG1sYmFycy11dGlsJyk7XG50ZXN0KCdodG1sYmFycy11dGlsL3NhZmUtc3RyaW5nLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXV0aWwvc2FmZS1zdHJpbmcuanMgc2hvdWxkIHBhc3MganNoaW50LicpOyBcbn0pO1xuIl19
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
define('htmlbars-util/template-utils.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-util');
  test('htmlbars-util/template-utils.js should pass jshint', function () {
    ok(true, 'htmlbars-util/template-utils.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHMuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNqQyxNQUFJLENBQUMsb0RBQW9ELEVBQUUsWUFBVztBQUNwRSxNQUFFLENBQUMsSUFBSSxFQUFFLHFEQUFxRCxDQUFDLENBQUM7R0FDakUsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHMuanNoaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlKCdKU0hpbnQgLSBodG1sYmFycy11dGlsJyk7XG50ZXN0KCdodG1sYmFycy11dGlsL3RlbXBsYXRlLXV0aWxzLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHMuanMgc2hvdWxkIHBhc3MganNoaW50LicpOyBcbn0pO1xuIl19
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
define('htmlbars-util/void-tag-names.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-util');
  test('htmlbars-util/void-tag-names.js should pass jshint', function () {
    ok(true, 'htmlbars-util/void-tag-names.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvdm9pZC10YWctbmFtZXMuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNqQyxNQUFJLENBQUMsb0RBQW9ELEVBQUUsWUFBVztBQUNwRSxNQUFFLENBQUMsSUFBSSxFQUFFLHFEQUFxRCxDQUFDLENBQUM7R0FDakUsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXV0aWwvdm9pZC10YWctbmFtZXMuanNoaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlKCdKU0hpbnQgLSBodG1sYmFycy11dGlsJyk7XG50ZXN0KCdodG1sYmFycy11dGlsL3ZvaWQtdGFnLW5hbWVzLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXV0aWwvdm9pZC10YWctbmFtZXMuanMgc2hvdWxkIHBhc3MganNoaW50LicpOyBcbn0pO1xuIl19
define("morph-attr-tests/attr-morph-test", ["exports", "../dom-helper", "htmlbars-util/safe-string"], function (exports, _domHelper, _htmlbarsUtilSafeString) {

  var svgNamespace = "http://www.w3.org/2000/svg",
      xlinkNamespace = "http://www.w3.org/1999/xlink";
  var domHelper = new _domHelper.default();

  QUnit.module('AttrMorph');

  test("can update a dom node", function () {
    var element = domHelper.createElement('div');
    var morph = domHelper.createAttrMorph(element, 'id');
    morph.setContent('twang');
    equal(element.id, 'twang', 'id property is set');
    equal(element.getAttribute('id'), 'twang', 'id attribute is set');
  });

  test("can clear", function () {
    expect(0);
    var element = domHelper.createElement('div');
    var morph = domHelper.createAttrMorph(element, 'id');
    morph.clear();
  });

  test("calling destroy does not throw", function () {
    expect(1);
    var element = domHelper.createElement('div');
    var morph = domHelper.createAttrMorph(element, 'id');

    morph.destroy();

    equal(morph.element, null, 'clears element from morph');
  });

  test("can update property", function () {
    var element = domHelper.createElement('input');
    var morph = domHelper.createAttrMorph(element, 'disabled');
    morph.setContent(true);
    equal(element.disabled, true, 'disabled property is set');
    morph.setContent(false);
    equal(element.disabled, false, 'disabled property is set');
  });

  test("input.maxLength", function () {
    var element = domHelper.createElement('input');
    var morph = domHelper.createAttrMorph(element, 'maxLength');
    // different browsers have different defaults FF: -1, Chrome/Blink: 524288;
    var MAX_LENGTH = element.maxLength;

    morph.setContent(null);
    equal(element.maxLength, MAX_LENGTH, 'property is w/e is default');

    morph.setContent(1);
    equal(element.maxLength, 1, 'should be 1');

    morph.setContent(null);
    equal(element.maxLength, 0, 'property 0, result of element.maxLength = ""');
  });

  test("input.maxlength (all lowercase)", function () {
    var element = domHelper.createElement('input');
    var morph = domHelper.createAttrMorph(element, 'maxlength');
    // different browsers have different defaults FF: -1, Chrome/Blink: 524288;
    var DEFAULT_MAX_LENGTH = element.maxLength;

    morph.setContent(null);
    equal(element.maxLength, DEFAULT_MAX_LENGTH, 'property is w/e is default');

    morph.setContent(1);
    equal(element.maxLength, 1, 'property is w/e is default');

    morph.setContent(null);
    equal(element.maxLength, DEFAULT_MAX_LENGTH, 'property is w/e is default');
  });

  test("does not add undefined properties on initial render", function () {
    var element = domHelper.createElement('div');
    var morph = domHelper.createAttrMorph(element, 'id');
    morph.setContent(undefined);
    equal(element.id, '', 'property should not be set');
    morph.setContent('foo-bar');
    equal(element.id, 'foo-bar', 'property should be set');
  });

  test("does not add null properties on initial render", function () {
    var element = domHelper.createElement('div');
    var morph = domHelper.createAttrMorph(element, 'id');
    morph.setContent(null);
    equal(element.id, '', 'property should not be set');
    morph.setContent('foo-bar');
    equal(element.id, 'foo-bar', 'property should be set');
  });

  test("can update attribute", function () {
    var element = domHelper.createElement('div');
    var morph = domHelper.createAttrMorph(element, 'data-bop');
    morph.setContent('kpow');
    equal(element.getAttribute('data-bop'), 'kpow', 'data-bop attribute is set');
    morph.setContent(null);
    equal(element.getAttribute('data-bop'), undefined, 'data-bop attribute is removed');
  });

  test("can remove ns attribute with null", function () {
    var element = domHelper.createElement('svg');
    domHelper.setAttribute(element, 'xlink:title', 'Great Title', xlinkNamespace);
    var morph = domHelper.createAttrMorph(element, 'xlink:title', xlinkNamespace);
    morph.setContent(null);
    equal(element.getAttribute('xlink:title'), undefined, 'ns attribute is removed');
  });

  test("can remove attribute with undefined", function () {
    var element = domHelper.createElement('div');
    element.setAttribute('data-bop', 'kpow');
    var morph = domHelper.createAttrMorph(element, 'data-bop');
    morph.setContent(undefined);
    equal(element.getAttribute('data-bop'), undefined, 'data-bop attribute is removed');
  });

  test("can remove ns attribute with undefined", function () {
    var element = domHelper.createElement('svg');
    domHelper.setAttribute(element, 'xlink:title', 'Great Title', xlinkNamespace);
    var morph = domHelper.createAttrMorph(element, 'xlink:title', xlinkNamespace);
    morph.setContent(undefined);
    equal(element.getAttribute('xlink:title'), undefined, 'ns attribute is removed');
  });

  test("can update svg attribute", function () {
    domHelper.setNamespace(svgNamespace);
    var element = domHelper.createElement('svg');
    var morph = domHelper.createAttrMorph(element, 'height');
    morph.setContent('50%');
    equal(element.getAttribute('height'), '50%', 'svg attr is set');
    morph.setContent(null);
    equal(element.getAttribute('height'), undefined, 'svg attr is removed');
  });

  test("can update style attribute", function () {
    var element = domHelper.createElement('div');
    var morph = domHelper.createAttrMorph(element, 'style');
    morph.setContent('color: red;');
    equal(element.getAttribute('style'), 'color: red;', 'style attr is set');
    morph.setContent(null);
    equal(element.getAttribute('style'), undefined, 'style attr is removed');
  });

  var badTags = [{ tag: 'a', attr: 'href' }, { tag: 'body', attr: 'background' }, { tag: 'link', attr: 'href' }, { tag: 'img', attr: 'src' }, { tag: 'iframe', attr: 'src' }];

  for (var i = 0, l = badTags.length; i < l; i++) {
    (function () {
      var subject = badTags[i];

      test(subject.tag + " " + subject.attr + " is sanitized when using blacklisted protocol", function () {
        var element = document.createElement(subject.tag);
        var morph = domHelper.createAttrMorph(element, subject.attr);
        morph.setContent('javascript://example.com');

        equal(element.getAttribute(subject.attr), 'unsafe:javascript://example.com', 'attribute is escaped');
      });

      test(subject.tag + " " + subject.attr + " is not sanitized when using non-whitelisted protocol with a SafeString", function () {
        var element = document.createElement(subject.tag);
        var morph = domHelper.createAttrMorph(element, subject.attr);
        try {
          morph.setContent(new _htmlbarsUtilSafeString.default('javascript://example.com'));

          equal(element.getAttribute(subject.attr), 'javascript://example.com', 'attribute is not escaped');
        } catch (e) {
          // IE does not allow javascript: to be set on img src
          ok(true, 'caught exception ' + e);
        }
      });

      test(subject.tag + " " + subject.attr + " is not sanitized when using unsafe attr morph", function () {
        var element = document.createElement(subject.tag);
        var morph = domHelper.createUnsafeAttrMorph(element, subject.attr);
        try {
          morph.setContent('javascript://example.com');

          equal(element.getAttribute(subject.attr), 'javascript://example.com', 'attribute is not escaped');
        } catch (e) {
          // IE does not allow javascript: to be set on img src
          ok(true, 'caught exception ' + e);
        }
      });
    })(); //jshint ignore:line
  }

  if (document && document.createElementNS) {

    test("detects attribute's namespace if it is not passed as an argument", function () {
      var element = domHelper.createElement('div');
      var morph = domHelper.createAttrMorph(element, 'xlink:href');
      morph.setContent('#circle');
      equal(element.attributes[0].namespaceURI, 'http://www.w3.org/1999/xlink', 'attribute has correct namespace');
    });

    test("can update namespaced attribute", function () {
      domHelper.setNamespace(svgNamespace);
      var element = domHelper.createElement('svg');
      var morph = domHelper.createAttrMorph(element, 'xlink:href', 'http://www.w3.org/1999/xlink');
      morph.setContent('#other');
      equal(element.getAttributeNS('http://www.w3.org/1999/xlink', 'href'), '#other', 'namespaced attr is set');
      equal(element.attributes[0].namespaceURI, 'http://www.w3.org/1999/xlink');
      equal(element.attributes[0].name, 'xlink:href');
      equal(element.attributes[0].localName, 'href');
      equal(element.attributes[0].value, '#other');
      morph.setContent(null);
      // safari returns '' while other browsers return undefined
      equal(!!element.getAttributeNS('http://www.w3.org/1999/xlink', 'href'), false, 'namespaced attr is removed');
    });
  }

  test("embed src as data uri is sanitized", function () {
    var element = document.createElement('embed');
    var morph = domHelper.createAttrMorph(element, 'src');
    morph.setContent('data:image/svg+xml;base64,PH');

    equal(element.getAttribute('src'), 'unsafe:data:image/svg+xml;base64,PH', 'attribute is escaped');
  });
});
/* jshint scripturl:true */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLWF0dHItdGVzdHMvYXR0ci1tb3JwaC10ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0EsTUFBSSxZQUFZLEdBQUcsNEJBQTRCO01BQzNDLGNBQWMsR0FBRyw4QkFBOEIsQ0FBQztBQUNwRCxNQUFJLFNBQVMsR0FBRyx3QkFBZSxDQUFDOztBQUVoQyxPQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUUxQixNQUFJLENBQUMsdUJBQXVCLEVBQUUsWUFBVTtBQUN0QyxRQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFFBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JELFNBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUIsU0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFDakQsU0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUM7R0FDbkUsQ0FBQyxDQUFDOztBQUVILE1BQUksQ0FBQyxXQUFXLEVBQUUsWUFBVTtBQUMxQixVQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDVixRQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFFBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JELFNBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNmLENBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMsZ0NBQWdDLEVBQUUsWUFBVTtBQUMvQyxVQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDVixRQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsYUFBYSxD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QyxFQUFFLFFBQVEsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0FBQ3pHLFdBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0FBQzFFLFdBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNoRCxXQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0MsV0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLFdBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXZCLFdBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyw4QkFBOEIsRUFBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztLQUM3RyxDQUFDLENBQUM7R0FFRjs7QUFFRCxNQUFJLENBQUMsb0NBQW9DLEVBQUUsWUFBVztBQUNwRCxRQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLFFBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3RELFNBQUssQ0FBQyxVQUFVLENBQUMsOEJBQThCLENBQUMsQ0FBQzs7QUFFakQsU0FBSyxDQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQzVCLHFDQUFxQyxFQUNyQyxzQkFBc0IsQ0FBQyxDQUFDO0dBQy9CLENBQUMsQ0FBQyIsImZpbGUiOiJtb3JwaC1hdHRyLXRlc3RzL2F0dHItbW9ycGgtdGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGpzaGludCBzY3JpcHR1cmw6dHJ1ZSAqL1xuXG5pbXBvcnQgRE9NSGVscGVyIGZyb20gXCIuLi9kb20taGVscGVyXCI7XG5pbXBvcnQgU2FmZVN0cmluZyBmcm9tIFwiaHRtbGJhcnMtdXRpbC9zYWZlLXN0cmluZ1wiO1xuXG52YXIgc3ZnTmFtZXNwYWNlID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuICAgIHhsaW5rTmFtZXNwYWNlID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCI7XG52YXIgZG9tSGVscGVyID0gbmV3IERPTUhlbHBlcigpO1xuXG5RVW5pdC5tb2R1bGUoJ0F0dHJNb3JwaCcpO1xuXG50ZXN0KFwiY2FuIHVwZGF0ZSBhIGRvbSBub2RlXCIsIGZ1bmN0aW9uKCl7XG4gIHZhciBlbGVtZW50ID0gZG9tSGVscGVyLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB2YXIgbW9ycGggPSBkb21IZWxwZXIuY3JlYXRlQXR0ck1vcnBoKGVsZW1lbnQsICdpZCcpO1xuICBtb3JwaC5zZXRDb250ZW50KCd0d2FuZycpO1xuICBlcXVhbChlbGVtZW50LmlkLCAndHdhbmcnLCAnaWQgcHJvcGVydHkgaXMgc2V0Jyk7XG4gIGVxdWFsKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpZCcpLCAndHdhbmcnLCAnaWQgYXR0cmlidXRlIGlzIHNldCcpO1xufSk7XG5cbnRlc3QoXCJjYW4gY2xlYXJcIiwgZnVuY3Rpb24oKXtcbiAgZXhwZWN0KDApO1xuICB2YXIgZWxlbWVudCA9IGRvbUhlbHBlci5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdmFyIG1vcnBoID0gZG9tSGVscGVyLmNyZWF0ZUF0dHJNb3JwaChlbGVtZW50LCAnaWQnKTtcbiAgbW9ycGguY2xlYXIoKTtcbn0pO1xuXG50ZXN0KFwiY2FsbGluZyBkZXN0cm95IGRvZXMgbm90IHRocm93XCIsIGZ1bmN0aW9uKCl7XG4gIGV4cGVjdCgxKTtcbiAgdmFyIGVsZW1lbnQgPSBkb21IZWxwZXIuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHZhciBtb3JwaCA9IGRvbUhlbHBlci5jcmVhdGVBdHRyTW9ycGgoZWxlbWVudCwgJ2lkJyk7XG5cbiAgbW9ycGguZGVzdHJveSgpO1xuXG4gIGVxdWFsKG1vcnBoLmVsZW1lbnQsIG51bGwsICdjbGVhcnMgZWxlbWVudCBmcm9tIG1vcnBoJyk7XG59KTtcblxudGVzdChcImNhbiB1cGRhdGUgcHJvcGVydHlcIiwgZnVuY3Rpb24oKXtcbiAgdmFyIGVsZW1lbnQgPSBkb21IZWxwZXIuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgdmFyIG1vcnBoID0gZG9tSGVscGVyLmNyZWF0ZUF0dHJNb3JwaChlbGVtZW50LCAnZGlzYWJsZWQnKTtcbiAgbW9ycGguc2V0Q29udGVudCh0cnVlKTtcbiAgZXF1YWwoZWxlbWVudC5kaXNhYmxlZCwgdHJ1ZSwgJ2Rpc2FibGVkIHByb3BlcnR5IGlzIHNldCcpO1xuICBtb3JwaC5zZXRDb250ZW50KGZhbHNlKTtcbiAgZXF1YWwoZWxlbWVudC5kaXNhYmxlZCwgZmFsc2UsICdkaXNhYmxlZCBwcm9wZXJ0eSBpcyBzZXQnKTtcbn0pO1xuXG50ZXN0KFwiaW5wdXQubWF4TGVuZ3RoXCIsIGZ1bmN0aW9uKCl7XG4gIHZhciBlbGVtZW50ID0gZG9tSGVscGVyLmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gIHZhciBtb3JwaCA9IGRvbUhlbHBlci5jcmVhdGVBdHRyTW9ycGgoZWxlbWVudCwgJ21heExlbmd0aCcpO1xuICAvLyBkaWZmZXJlbnQgYnJvd3NlcnMgaGF2ZSBkaWZmZXJlbnQgZGVmYXVsdHMgRkY6IC0xLCBDaHJvbWUvQmxpbms6IDUyNDI4ODtcbiAgdmFyIE1BWF9MRU5HVEggPSBlbGVtZW50Lm1heExlbmd0aDtcblxuICBtb3JwaC5zZXRDb250ZW50KG51bGwpO1xuICBlcXVhbChlbGVtZW50Lm1heExlbmd0aCwgTUFYX0xFTkdUSCwgJ3Byb3BlcnR5IGlzIHcvZSBpcyBkZWZhdWx0Jyk7XG5cbiAgbW9ycGguc2V0Q29udGVudCgxKTtcbiAgZXF1YWwoZWxlbWVudC5tYXhMZW5ndGgsIDEsICdzaG91bGQgYmUgMScpO1xuXG4gIG1vcnBoLnNldENvbnRlbnQobnVsbCk7XG4gIGVxdWFsKGVsZW1lbnQubWF4TGVuZ3RoLCAwLCAncHJvcGVydHkgMCwgcmVzdWx0IG9mIGVsZW1lbnQubWF4TGVuZ3RoID0gXCJcIicpO1xufSk7XG5cbnRlc3QoXCJpbnB1dC5tYXhsZW5ndGggKGFsbCBsb3dlcmNhc2UpXCIsIGZ1bmN0aW9uKCl7XG4gIHZhciBlbGVtZW50ID0gZG9tSGVscGVyLmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gIHZhciBtb3JwaCA9IGRvbUhlbHBlci5jcmVhdGVBdHRyTW9ycGgoZWxlbWVudCwgJ21heGxlbmd0aCcpO1xuICAvLyBkaWZmZXJlbnQgYnJvd3NlcnMgaGF2ZSBkaWZmZXJlbnQgZGVmYXVsdHMgRkY6IC0xLCBDaHJvbWUvQmxpbms6IDUyNDI4ODtcbiAgdmFyIERFRkFVTFRfTUFYX0xFTkdUSCA9IGVsZW1lbnQubWF4TGVuZ3RoO1xuXG4gIG1vcnBoLnNldENvbnRlbnQobnVsbCk7XG4gIGVxdWFsKGVsZW1lbnQubWF4TGVuZ3RoLCBERUZBVUxUX01BWF9MRU5HVEgsICdwcm9wZXJ0eSBpcyB3L2UgaXMgZGVmYXVsdCcpO1xuXG4gIG1vcnBoLnNldENvbnRlbnQoMSk7XG4gIGVxdWFsKGVsZW1lbnQubWF4TGVuZ3RoLCAxLCAncHJvcGVydHkgaXMgdy9lIGlzIGRlZmF1bHQnKTtcblxuICBtb3JwaC5zZXRDb250ZW50KG51bGwpO1xuICBlcXVhbChlbGVtZW50Lm1heExlbmd0aCwgREVGQVVMVF9NQVhfTEVOR1RILCAncHJvcGVydHkgaXMgdy9lIGlzIGRlZmF1bHQnKTtcbn0pO1xuXG50ZXN0KFwiZG9lcyBub3QgYWRkIHVuZGVmaW5lZCBwcm9wZXJ0aWVzIG9uIGluaXRpYWwgcmVuZGVyXCIsIGZ1bmN0aW9uKCl7XG4gIHZhciBlbGVtZW50ID0gZG9tSGVscGVyLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB2YXIgbW9ycGggPSBkb21IZWxwZXIuY3JlYXRlQXR0ck1vcnBoKGVsZW1lbnQsICdpZCcpO1xuICBtb3JwaC5zZXRDb250ZW50KHVuZGVmaW5lZCk7XG4gIGVxdWFsKGVsZW1lbnQuaWQsICcnLCAncHJvcGVydHkgc2hvdWxkIG5vdCBiZSBzZXQnKTtcbiAgbW9ycGguc2V0Q29udGVudCgnZm9vLWJhcicpO1xuICBlcXVhbChlbGVtZW50LmlkLCAnZm9vLWJhcicsICdwcm9wZXJ0eSBzaG91bGQgYmUgc2V0Jyk7XG59KTtcblxudGVzdChcImRvZXMgbm90IGFkZCBudWxsIHByb3BlcnRpZXMgb24gaW5pdGlhbCByZW5kZXJcIiwgZnVuY3Rpb24oKXtcbiAgdmFyIGVsZW1lbnQgPSBkb21IZWxwZXIuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHZhciBtb3JwaCA9IGRvbUhlbHBlci5jcmVhdGVBdHRyTW9ycGgoZWxlbWVudCwgJ2lkJyk7XG4gIG1vcnBoLnNldENvbnRlbnQobnVsbCk7XG4gIGVxdWFsKGVsZW1lbnQuaWQsICcnLCAncHJvcGVydHkgc2hvdWxkIG5vdCBiZSBzZXQnKTtcbiAgbW9ycGguc2V0Q29udGVudCgnZm9vLWJhcicpO1xuICBlcXVhbChlbGVtZW50LmlkLCAnZm9vLWJhcicsICdwcm9wZXJ0eSBzaG91bGQgYmUgc2V0Jyk7XG59KTtcblxudGVzdChcImNhbiB1cGRhdGUgYXR0cmlidXRlXCIsIGZ1bmN0aW9uKCl7XG4gIHZhciBlbGVtZW50ID0gZG9tSGVscGVyLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB2YXIgbW9ycGggPSBkb21IZWxwZXIuY3JlYXRlQXR0ck1vcnBoKGVsZW1lbnQsICdkYXRhLWJvcCcpO1xuICBtb3JwaC5zZXRDb250ZW50KCdrcG93Jyk7XG4gIGVxdWFsKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWJvcCcpLCAna3BvdycsICdkYXRhLWJvcCBhdHRyaWJ1dGUgaXMgc2V0Jyk7XG4gIG1vcnBoLnNldENvbnRlbnQobnVsbCk7XG4gIGVxdWFsKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWJvcCcpLCB1bmRlZmluZWQsICdkYXRhLWJvcCBhdHRyaWJ1dGUgaXMgcmVtb3ZlZCcpO1xufSk7XG5cbnRlc3QoXCJjYW4gcmVtb3ZlIG5zIGF0dHJpYnV0ZSB3aXRoIG51bGxcIiwgZnVuY3Rpb24oKXtcbiAgdmFyIGVsZW1lbnQgPSBkb21IZWxwZXIuY3JlYXRlRWxlbWVudCgnc3ZnJyk7XG4gIGRvbUhlbHBlci5zZXRBdHRyaWJ1dGUoZWxlbWVudCwgJ3hsaW5rOnRpdGxlJywgJ0dyZWF0IFRpdGxlJywgeGxpbmtOYW1lc3BhY2UpO1xuICB2YXIgbW9ycGggPSBkb21IZWxwZXIuY3JlYXRlQXR0ck1vcnBoKGVsZW1lbnQsICd4bGluazp0aXRsZScsIHhsaW5rTmFtZXNwYWNlKTtcbiAgbW9ycGguc2V0Q29udGVudChudWxsKTtcbiAgZXF1YWwoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3hsaW5rOnRpdGxlJyksIHVuZGVmaW5lZCwgJ25zIGF0dHJpYnV0ZSBpcyByZW1vdmVkJyk7XG59KTtcblxudGVzdChcImNhbiByZW1vdmUgYXR0cmlidXRlIHdpdGggdW5kZWZpbmVkXCIsIGZ1bmN0aW9uKCl7XG4gIHZhciBlbGVtZW50ID0gZG9tSGVscGVyLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1ib3AnLCAna3BvdycpO1xuICB2YXIgbW9ycGggPSBkb21IZWxwZXIuY3JlYXRlQXR0ck1vcnBoKGVsZW1lbnQsICdkYXRhLWJvcCcpO1xuICBtb3JwaC5zZXRDb250ZW50KHVuZGVmaW5lZCk7XG4gIGVxdWFsKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWJvcCcpLCB1bmRlZmluZWQsICdkYXRhLWJvcCBhdHRyaWJ1dGUgaXMgcmVtb3ZlZCcpO1xufSk7XG5cbnRlc3QoXCJjYW4gcmVtb3ZlIG5zIGF0dHJpYnV0ZSB3aXRoIHVuZGVmaW5lZFwiLCBmdW5jdGlvbigpe1xuICB2YXIgZWxlbWVudCA9IGRvbUhlbHBlci5jcmVhdGVFbGVtZW50KCdzdmcnKTtcbiAgZG9tSGVscGVyLnNldEF0dHJpYnV0ZShlbGVtZW50LCAneGxpbms6dGl0bGUnLCAnR3JlYXQgVGl0bGUnLCB4bGlua05hbWVzcGFjZSk7XG4gIHZhciBtb3JwaCA9IGRvbUhlbHBlci5jcmVhdGVBdHRyTW9ycGgoZWxlbWVudCwgJ3hsaW5rOnRpdGxlJywgeGxpbmtOYW1lc3BhY2UpO1xuICBtb3JwaC5zZXRDb250ZW50KHVuZGVmaW5lZCk7XG4gIGVxdWFsKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd4bGluazp0aXRsZScpLCB1bmRlZmluZWQsICducyBhdHRyaWJ1dGUgaXMgcmVtb3ZlZCcpO1xufSk7XG5cbnRlc3QoXCJjYW4gdXBkYXRlIHN2ZyBhdHRyaWJ1dGVcIiwgZnVuY3Rpb24oKXtcbiAgZG9tSGVscGVyLnNldE5hbWVzcGFjZShzdmdOYW1lc3BhY2UpO1xuICB2YXIgZWxlbWVudCA9IGRvbUhlbHBlci5jcmVhdGVFbGVtZW50KCdzdmcnKTtcbiAgdmFyIG1vcnBoID0gZG9tSGVscGVyLmNyZWF0ZUF0dHJNb3JwaChlbGVtZW50LCAnaGVpZ2h0Jyk7XG4gIG1vcnBoLnNldENvbnRlbnQoJzUwJScpO1xuICBlcXVhbChlbGVtZW50LmdldEF0dHJpYnV0ZSgnaGVpZ2h0JyksICc1MCUnLCAnc3ZnIGF0dHIgaXMgc2V0Jyk7XG4gIG1vcnBoLnNldENvbnRlbnQobnVsbCk7XG4gIGVxdWFsKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSwgdW5kZWZpbmVkLCAnc3ZnIGF0dHIgaXMgcmVtb3ZlZCcpO1xufSk7XG5cbnRlc3QoXCJjYW4gdXBkYXRlIHN0eWxlIGF0dHJpYnV0ZVwiLCBmdW5jdGlvbigpe1xuICB2YXIgZWxlbWVudCA9IGRvbUhlbHBlci5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdmFyIG1vcnBoID0gZG9tSGVscGVyLmNyZWF0ZUF0dHJNb3JwaChlbGVtZW50LCAnc3R5bGUnKTtcbiAgbW9ycGguc2V0Q29udGVudCgnY29sb3I6IHJlZDsnKTtcbiAgZXF1YWwoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3N0eWxlJyksICdjb2xvcjogcmVkOycsICdzdHlsZSBhdHRyIGlzIHNldCcpO1xuICBtb3JwaC5zZXRDb250ZW50KG51bGwpO1xuICBlcXVhbChlbGVtZW50LmdldEF0dHJpYnV0ZSgnc3R5bGUnKSwgdW5kZWZpbmVkLCAnc3R5bGUgYXR0ciBpcyByZW1vdmVkJyk7XG59KTtcblxudmFyIGJhZFRhZ3MgPSBbXG4gIHsgdGFnOiAnYScsIGF0dHI6ICdocmVmJyB9LFxuICB7IHRhZzogJ2JvZHknLCBhdHRyOiAnYmFja2dyb3VuZCcgfSxcbiAgeyB0YWc6ICdsaW5rJywgYXR0cjogJ2hyZWYnIH0sXG4gIHsgdGFnOiAnaW1nJywgYXR0cjogJ3NyYycgfSxcbiAgeyB0YWc6ICdpZnJhbWUnLCBhdHRyOiAnc3JjJ31cbl07XG5cbmZvciAodmFyIGk9MCwgbD1iYWRUYWdzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgKGZ1bmN0aW9uKCl7XG4gICAgdmFyIHN1YmplY3QgPSBiYWRUYWdzW2ldO1xuXG4gICAgdGVzdChzdWJqZWN0LnRhZyArXCIgXCIrc3ViamVjdC5hdHRyK1wiIGlzIHNhbml0aXplZCB3aGVuIHVzaW5nIGJsYWNrbGlzdGVkIHByb3RvY29sXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHN1YmplY3QudGFnKTtcbiAgICAgIHZhciBtb3JwaCA9IGRvbUhlbHBlci5jcmVhdGVBdHRyTW9ycGgoZWxlbWVudCwgc3ViamVjdC5hdHRyKTtcbiAgICAgIG1vcnBoLnNldENvbnRlbnQoJ2phdmFzY3JpcHQ6Ly9leGFtcGxlLmNvbScpO1xuXG4gICAgICBlcXVhbCggZWxlbWVudC5nZXRBdHRyaWJ1dGUoc3ViamVjdC5hdHRyKSxcbiAgICAgICAgICAgICd1bnNhZmU6amF2YXNjcmlwdDovL2V4YW1wbGUuY29tJyxcbiAgICAgICAgICAgICdhdHRyaWJ1dGUgaXMgZXNjYXBlZCcpO1xuICAgIH0pO1xuXG4gICAgdGVzdChzdWJqZWN0LnRhZyArXCIgXCIrc3ViamVjdC5hdHRyK1wiIGlzIG5vdCBzYW5pdGl6ZWQgd2hlbiB1c2luZyBub24td2hpdGVsaXN0ZWQgcHJvdG9jb2wgd2l0aCBhIFNhZmVTdHJpbmdcIiwgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoc3ViamVjdC50YWcpO1xuICAgICAgdmFyIG1vcnBoID0gZG9tSGVscGVyLmNyZWF0ZUF0dHJNb3JwaChlbGVtZW50LCBzdWJqZWN0LmF0dHIpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgbW9ycGguc2V0Q29udGVudChuZXcgU2FmZVN0cmluZygnamF2YXNjcmlwdDovL2V4YW1wbGUuY29tJykpO1xuXG4gICAgICAgIGVxdWFsKCBlbGVtZW50LmdldEF0dHJpYnV0ZShzdWJqZWN0LmF0dHIpLFxuICAgICAgICAgICAgICAnamF2YXNjcmlwdDovL2V4YW1wbGUuY29tJyxcbiAgICAgICAgICAgICAgJ2F0dHJpYnV0ZSBpcyBub3QgZXNjYXBlZCcpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIC8vIElFIGRvZXMgbm90IGFsbG93IGphdmFzY3JpcHQ6IHRvIGJlIHNldCBvbiBpbWcgc3JjXG4gICAgICAgIG9rKHRydWUsICdjYXVnaHQgZXhjZXB0aW9uICcrZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0ZXN0KHN1YmplY3QudGFnICtcIiBcIitzdWJqZWN0LmF0dHIrXCIgaXMgbm90IHNhbml0aXplZCB3aGVuIHVzaW5nIHVuc2FmZSBhdHRyIG1vcnBoXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHN1YmplY3QudGFnKTtcbiAgICAgIHZhciBtb3JwaCA9IGRvbUhlbHBlci5jcmVhdGVVbnNhZmVBdHRyTW9ycGgoZWxlbWVudCwgc3ViamVjdC5hdHRyKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIG1vcnBoLnNldENvbnRlbnQoJ2phdmFzY3JpcHQ6Ly9leGFtcGxlLmNvbScpO1xuXG4gICAgICAgIGVxdWFsKCBlbGVtZW50LmdldEF0dHJpYnV0ZShzdWJqZWN0LmF0dHIpLFxuICAgICAgICAgICAgICAnamF2YXNjcmlwdDovL2V4YW1wbGUuY29tJyxcbiAgICAgICAgICAgICAgJ2F0dHJpYnV0ZSBpcyBub3QgZXNjYXBlZCcpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIC8vIElFIGRvZXMgbm90IGFsbG93IGphdmFzY3JpcHQ6IHRvIGJlIHNldCBvbiBpbWcgc3JjXG4gICAgICAgIG9rKHRydWUsICdjYXVnaHQgZXhjZXB0aW9uICcrZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgfSkoKTsgLy9qc2hpbnQgaWdub3JlOmxpbmVcbn1cblxuaWYgKGRvY3VtZW50ICYmIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUykge1xuXG50ZXN0KFwiZGV0ZWN0cyBhdHRyaWJ1dGUncyBuYW1lc3BhY2UgaWYgaXQgaXMgbm90IHBhc3NlZCBhcyBhbiBhcmd1bWVudFwiLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbGVtZW50ID0gZG9tSGVscGVyLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB2YXIgbW9ycGggPSBkb21IZWxwZXIuY3JlYXRlQXR0ck1vcnBoKGVsZW1lbnQsICd4bGluazpocmVmJyk7XG4gIG1vcnBoLnNldENvbnRlbnQoJyNjaXJjbGUnKTtcbiAgZXF1YWwoZWxlbWVudC5hdHRyaWJ1dGVzWzBdLm5hbWVzcGFjZVVSSSwgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAnYXR0cmlidXRlIGhhcyBjb3JyZWN0IG5hbWVzcGFjZScpO1xufSk7XG5cbnRlc3QoXCJjYW4gdXBkYXRlIG5hbWVzcGFjZWQgYXR0cmlidXRlXCIsIGZ1bmN0aW9uKCl7XG4gIGRvbUhlbHBlci5zZXROYW1lc3BhY2Uoc3ZnTmFtZXNwYWNlKTtcbiAgdmFyIGVsZW1lbnQgPSBkb21IZWxwZXIuY3JlYXRlRWxlbWVudCgnc3ZnJyk7XG4gIHZhciBtb3JwaCA9IGRvbUhlbHBlci5jcmVhdGVBdHRyTW9ycGgoZWxlbWVudCwgJ3hsaW5rOmhyZWYnLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycpO1xuICBtb3JwaC5zZXRDb250ZW50KCcjb3RoZXInKTtcbiAgZXF1YWwoZWxlbWVudC5nZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsJ2hyZWYnKSwgJyNvdGhlcicsICduYW1lc3BhY2VkIGF0dHIgaXMgc2V0Jyk7XG4gIGVxdWFsKGVsZW1lbnQuYXR0cmlidXRlc1swXS5uYW1lc3BhY2VVUkksICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyk7XG4gIGVxdWFsKGVsZW1lbnQuYXR0cmlidXRlc1swXS5uYW1lLCAneGxpbms6aHJlZicpO1xuICBlcXVhbChlbGVtZW50LmF0dHJpYnV0ZXNbMF0ubG9jYWxOYW1lLCAnaHJlZicpO1xuICBlcXVhbChlbGVtZW50LmF0dHJpYnV0ZXNbMF0udmFsdWUsICcjb3RoZXInKTtcbiAgbW9ycGguc2V0Q29udGVudChudWxsKTtcbiAgLy8gc2FmYXJpIHJldHVybnMgJycgd2hpbGUgb3RoZXIgYnJvd3NlcnMgcmV0dXJuIHVuZGVmaW5lZFxuICBlcXVhbCghIWVsZW1lbnQuZ2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCdocmVmJyksIGZhbHNlLCAnbmFtZXNwYWNlZCBhdHRyIGlzIHJlbW92ZWQnKTtcbn0pO1xuXG59XG5cbnRlc3QoXCJlbWJlZCBzcmMgYXMgZGF0YSB1cmkgaXMgc2FuaXRpemVkXCIsIGZ1bmN0aW9uKCkge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2VtYmVkJyk7XG4gIHZhciBtb3JwaCA9IGRvbUhlbHBlci5jcmVhdGVBdHRyTW9ycGgoZWxlbWVudCwgJ3NyYycpO1xuICBtb3JwaC5zZXRDb250ZW50KCdkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBIJyk7XG5cbiAgZXF1YWwoIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKSxcbiAgICAgICAgJ3Vuc2FmZTpkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBIJyxcbiAgICAgICAgJ2F0dHJpYnV0ZSBpcyBlc2NhcGVkJyk7XG59KTtcbiJdfQ==
define('morph-attr-tests/attr-morph-test.jshint', ['exports'], function (exports) {
  module('JSHint - morph-attr-tests');
  test('morph-attr-tests/attr-morph-test.js should pass jshint', function () {
    ok(true, 'morph-attr-tests/attr-morph-test.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLWF0dHItdGVzdHMvYXR0ci1tb3JwaC10ZXN0LmpzaGludC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDcEMsTUFBSSxDQUFDLHdEQUF3RCxFQUFFLFlBQVc7QUFDeEUsTUFBRSxDQUFDLElBQUksRUFBRSx5REFBeUQsQ0FBQyxDQUFDO0dBQ3JFLENBQUMsQ0FBQyIsImZpbGUiOiJtb3JwaC1hdHRyLXRlc3RzL2F0dHItbW9ycGgtdGVzdC5qc2hpbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUoJ0pTSGludCAtIG1vcnBoLWF0dHItdGVzdHMnKTtcbnRlc3QoJ21vcnBoLWF0dHItdGVzdHMvYXR0ci1tb3JwaC10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ21vcnBoLWF0dHItdGVzdHMvYXR0ci1tb3JwaC10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
define("morph-attr-tests/attr-morph/sanitize-attribute-value-test", ["exports", "morph-attr/sanitize-attribute-value", "htmlbars-util/safe-string", "htmlbars-util/array-utils", "../../dom-helper"], function (exports, _morphAttrSanitizeAttributeValue, _htmlbarsUtilSafeString, _htmlbarsUtilArrayUtils, _domHelper) {

  var domHelper = new _domHelper.default();

  QUnit.module('sanitizeAttributeValue(null, "*")');

  var goodProtocols = ['https', 'http', 'ftp', 'tel', 'file'];

  for (var i = 0, l = goodProtocols.length; i < l; i++) {
    buildProtocolTest(goodProtocols[i]);
  }

  function buildProtocolTest(protocol) {
    test('allows ' + protocol + ' protocol when element is not provided', function () {
      expect(1);

      var attributeValue = protocol + '://foo.com';
      var actual = _morphAttrSanitizeAttributeValue.sanitizeAttributeValue(domHelper, null, 'href', attributeValue);

      equal(actual, attributeValue, 'protocol not escaped');
    });
  }

  test('blocks javascript: protocol', function () {
    /* jshint scripturl:true */

    expect(1);

    var attributeValue = 'javascript:alert("foo")';
    var actual = _morphAttrSanitizeAttributeValue.sanitizeAttributeValue(domHelper, null, 'href', attributeValue);

    equal(actual, 'unsafe:' + attributeValue, 'protocol escaped');
  });

  test('blocks blacklisted protocols', function () {
    /* jshint scripturl:true */

    expect(1);

    var attributeValue = 'javascript:alert("foo")';
    var actual = _morphAttrSanitizeAttributeValue.sanitizeAttributeValue(domHelper, null, 'href', attributeValue);

    equal(actual, 'unsafe:' + attributeValue, 'protocol escaped');
  });

  test('does not block SafeStrings', function () {
    /* jshint scripturl:true */

    expect(1);

    var attributeValue = 'javascript:alert("foo")';
    var actual = _morphAttrSanitizeAttributeValue.sanitizeAttributeValue(domHelper, null, 'href', new _htmlbarsUtilSafeString.default(attributeValue));

    equal(actual, attributeValue, 'protocol unescaped');
  });

  test("blocks data uri for EMBED", function () {
    /* jshint scripturl:true */

    expect(1);

    var attributeValue = 'data:image/svg+xml;base64,...';
    var actual = _morphAttrSanitizeAttributeValue.sanitizeAttributeValue(domHelper, { tagName: 'EMBED' }, 'src', attributeValue);

    equal(actual, 'unsafe:' + attributeValue, 'protocol escaped');
  });

  test("doesn't sanitize data uri for IMG", function () {
    /* jshint scripturl:true */

    expect(1);

    var attributeValue = 'data:image/svg+xml;base64,...';
    var actual = _morphAttrSanitizeAttributeValue.sanitizeAttributeValue(domHelper, { tagName: 'IMG' }, 'src', attributeValue);

    equal(actual, attributeValue, 'protocol should not have been escaped');
  });

  var badTags = ['A', 'BODY', 'LINK', 'IMG', 'IFRAME', 'BASE', 'FORM'];

  var badAttributes = ['href', 'src', 'background', 'action'];

  var someIllegalProtocols = ['javascript', 'vbscript'];

  _htmlbarsUtilArrayUtils.forEach(badTags, function (tagName) {
    _htmlbarsUtilArrayUtils.forEach(badAttributes, function (attrName) {
      _htmlbarsUtilArrayUtils.forEach(someIllegalProtocols, function (protocol) {
        test(' <' + tagName + ' ' + attrName + '="' + protocol + ':something"> ...', function () {
          equal(_morphAttrSanitizeAttributeValue.sanitizeAttributeValue(domHelper, { tagName: tagName }, attrName, protocol + ':something'), 'unsafe:' + protocol + ':something');
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLWF0dHItdGVzdHMvYXR0ci1tb3JwaC9zYW5pdGl6ZS1hdHRyaWJ1dGUtdmFsdWUtdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLE1BQUksU0FBUyxHQUFHLHdCQUFlLENBQUM7O0FBRWhDLE9BQUssQ0FBQyxNQUFNLENBQUMsbUNBQW1DLENBQUMsQ0FBQzs7QUFFbEQsTUFBSSxhQUFhLEdBQUcsQ0FBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRTdELE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDcEQscUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDckM7O0FBRUQsV0FBUyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUU7QUFDbkMsUUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLEdBQUcsd0NBQXdDLEVBQUUsWUFBVztBQUMvRSxZQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRVYsVUFBSSxjQUFjLEdBQUcsUUFBUSxHQUFHLFlBQVksQ0FBQztBQUM3QyxVQUFJLE1BQU0sR0FBRyxpQ0FyQlIsc0JBQXNCLENBcUJTLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDOztBQUU3RSxXQUFLLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0tBQ3ZELENBQUMsQ0FBQztHQUNKOztBQUVELE1BQUksQ0FBQyw2QkFBNkIsRUFBRSxZQUFXOzs7QUFHN0MsVUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVWLFFBQUksY0FBYyxHQUFHLHlCQUF5QixDQUFDO0FBQy9DLFFBQUksTUFBTSxHQUFHLGlDQWpDTixzQkFBc0IsQ0FpQ08sU0FBUyxFQUFFLElBQUks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LFlBQVksQ0FBQyxDQUFDO1NBQ3hJLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJtb3JwaC1hdHRyLXRlc3RzL2F0dHItbW9ycGgvc2FuaXRpemUtYXR0cmlidXRlLXZhbHVlLXRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlIH0gZnJvbSBcIm1vcnBoLWF0dHIvc2FuaXRpemUtYXR0cmlidXRlLXZhbHVlXCI7XG5pbXBvcnQgU2FmZVN0cmluZyBmcm9tIFwiaHRtbGJhcnMtdXRpbC9zYWZlLXN0cmluZ1wiO1xuaW1wb3J0IHsgZm9yRWFjaCB9IGZyb20gXCJodG1sYmFycy11dGlsL2FycmF5LXV0aWxzXCI7XG5cbmltcG9ydCBET01IZWxwZXIgZnJvbSBcIi4uLy4uL2RvbS1oZWxwZXJcIjtcblxudmFyIGRvbUhlbHBlciA9IG5ldyBET01IZWxwZXIoKTtcblxuUVVuaXQubW9kdWxlKCdzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKG51bGwsIFwiKlwiKScpO1xuXG52YXIgZ29vZFByb3RvY29scyA9IFsgJ2h0dHBzJywgJ2h0dHAnLCAnZnRwJywgJ3RlbCcsICdmaWxlJ107XG5cbmZvciAodmFyIGkgPSAwLCBsID0gZ29vZFByb3RvY29scy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgYnVpbGRQcm90b2NvbFRlc3QoZ29vZFByb3RvY29sc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUHJvdG9jb2xUZXN0KHByb3RvY29sKSB7XG4gIHRlc3QoJ2FsbG93cyAnICsgcHJvdG9jb2wgKyAnIHByb3RvY29sIHdoZW4gZWxlbWVudCBpcyBub3QgcHJvdmlkZWQnLCBmdW5jdGlvbigpIHtcbiAgICBleHBlY3QoMSk7XG5cbiAgICB2YXIgYXR0cmlidXRlVmFsdWUgPSBwcm90b2NvbCArICc6Ly9mb28uY29tJztcbiAgICB2YXIgYWN0dWFsID0gc2FuaXRpemVBdHRyaWJ1dGVWYWx1ZShkb21IZWxwZXIsIG51bGwsICdocmVmJywgYXR0cmlidXRlVmFsdWUpO1xuXG4gICAgZXF1YWwoYWN0dWFsLCBhdHRyaWJ1dGVWYWx1ZSwgJ3Byb3RvY29sIG5vdCBlc2NhcGVkJyk7XG4gIH0pO1xufVxuXG50ZXN0KCdibG9ja3MgamF2YXNjcmlwdDogcHJvdG9jb2wnLCBmdW5jdGlvbigpIHtcbiAgLyoganNoaW50IHNjcmlwdHVybDp0cnVlICovXG5cbiAgZXhwZWN0KDEpO1xuXG4gIHZhciBhdHRyaWJ1dGVWYWx1ZSA9ICdqYXZhc2NyaXB0OmFsZXJ0KFwiZm9vXCIpJztcbiAgdmFyIGFjdHVhbCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZG9tSGVscGVyLCBudWxsLCAnaHJlZicsIGF0dHJpYnV0ZVZhbHVlKTtcblxuICBlcXVhbChhY3R1YWwsICd1bnNhZmU6JyArIGF0dHJpYnV0ZVZhbHVlLCAncHJvdG9jb2wgZXNjYXBlZCcpO1xufSk7XG5cbnRlc3QoJ2Jsb2NrcyBibGFja2xpc3RlZCBwcm90b2NvbHMnLCBmdW5jdGlvbigpIHtcbiAgLyoganNoaW50IHNjcmlwdHVybDp0cnVlICovXG5cbiAgZXhwZWN0KDEpO1xuXG4gIHZhciBhdHRyaWJ1dGVWYWx1ZSA9ICdqYXZhc2NyaXB0OmFsZXJ0KFwiZm9vXCIpJztcbiAgdmFyIGFjdHVhbCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZG9tSGVscGVyLCBudWxsLCAnaHJlZicsIGF0dHJpYnV0ZVZhbHVlKTtcblxuICBlcXVhbChhY3R1YWwsICd1bnNhZmU6JyArIGF0dHJpYnV0ZVZhbHVlLCAncHJvdG9jb2wgZXNjYXBlZCcpO1xufSk7XG5cbnRlc3QoJ2RvZXMgbm90IGJsb2NrIFNhZmVTdHJpbmdzJywgZnVuY3Rpb24oKSB7XG4gIC8qIGpzaGludCBzY3JpcHR1cmw6dHJ1ZSAqL1xuXG4gIGV4cGVjdCgxKTtcblxuICB2YXIgYXR0cmlidXRlVmFsdWUgPSAnamF2YXNjcmlwdDphbGVydChcImZvb1wiKSc7XG4gIHZhciBhY3R1YWwgPSBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGRvbUhlbHBlciwgbnVsbCwgJ2hyZWYnLCBuZXcgU2FmZVN0cmluZyhhdHRyaWJ1dGVWYWx1ZSkpO1xuXG4gIGVxdWFsKGFjdHVhbCwgYXR0cmlidXRlVmFsdWUsICdwcm90b2NvbCB1bmVzY2FwZWQnKTtcbn0pO1xuXG50ZXN0KFwiYmxvY2tzIGRhdGEgdXJpIGZvciBFTUJFRFwiLCBmdW5jdGlvbigpIHtcbiAgLyoganNoaW50IHNjcmlwdHVybDp0cnVlICovXG5cbiAgZXhwZWN0KDEpO1xuXG4gIHZhciBhdHRyaWJ1dGVWYWx1ZSA9ICdkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LC4uLic7XG4gIHZhciBhY3R1YWwgPSBzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGRvbUhlbHBlciwgeyB0YWdOYW1lOiAnRU1CRUQnIH0sICdzcmMnLCBhdHRyaWJ1dGVWYWx1ZSk7XG5cbiAgZXF1YWwoYWN0dWFsLCAndW5zYWZlOicgKyBhdHRyaWJ1dGVWYWx1ZSwgJ3Byb3RvY29sIGVzY2FwZWQnKTtcbn0pO1xuXG50ZXN0KFwiZG9lc24ndCBzYW5pdGl6ZSBkYXRhIHVyaSBmb3IgSU1HXCIsIGZ1bmN0aW9uKCkge1xuICAvKiBqc2hpbnQgc2NyaXB0dXJsOnRydWUgKi9cblxuICBleHBlY3QoMSk7XG5cbiAgdmFyIGF0dHJpYnV0ZVZhbHVlID0gJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsLi4uJztcbiAgdmFyIGFjdHVhbCA9IHNhbml0aXplQXR0cmlidXRlVmFsdWUoZG9tSGVscGVyLCB7IHRhZ05hbWU6ICdJTUcnIH0sICdzcmMnLCBhdHRyaWJ1dGVWYWx1ZSk7XG5cbiAgZXF1YWwoYWN0dWFsLCBhdHRyaWJ1dGVWYWx1ZSwgJ3Byb3RvY29sIHNob3VsZCBub3QgaGF2ZSBiZWVuIGVzY2FwZWQnKTtcbn0pO1xuXG52YXIgYmFkVGFncyA9IFtcbiAgJ0EnLFxuICAnQk9EWScsXG4gICdMSU5LJyxcbiAgJ0lNRycsXG4gICdJRlJBTUUnLFxuICAnQkFTRScsXG4gICdGT1JNJyxcbl07XG5cbnZhciBiYWRBdHRyaWJ1dGVzID0gW1xuICAnaHJlZicsXG4gICdzcmMnLFxuICAnYmFja2dyb3VuZCcsXG4gICdhY3Rpb24nXG5dO1xuXG52YXIgc29tZUlsbGVnYWxQcm90b2NvbHMgPSBbXG4gICdqYXZhc2NyaXB0JyxcbiAgJ3Zic2NyaXB0J1xuXTtcblxuZm9yRWFjaChiYWRUYWdzLCBmdW5jdGlvbih0YWdOYW1lKSB7XG4gIGZvckVhY2goYmFkQXR0cmlidXRlcywgZnVuY3Rpb24oYXR0ck5hbWUpIHtcbiAgICBmb3JFYWNoKHNvbWVJbGxlZ2FsUHJvdG9jb2xzLCBmdW5jdGlvbihwcm90b2NvbCkge1xuICAgICAgdGVzdCgnIDwnICsgdGFnTmFtZSArICcgJyArIGF0dHJOYW1lICsgJz1cIicgKyBwcm90b2NvbCArICc6c29tZXRoaW5nXCI+IC4uLicsIGZ1bmN0aW9uKCkge1xuICAgICAgICBlcXVhbChzYW5pdGl6ZUF0dHJpYnV0ZVZhbHVlKGRvbUhlbHBlciwgeyB0YWdOYW1lOiB0YWdOYW1lIH0sIGF0dHJOYW1lLCBwcm90b2NvbCArICc6c29tZXRoaW5nJyksICd1bnNhZmU6JyArIHByb3RvY29sICsgJzpzb21ldGhpbmcnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19
define('morph-attr-tests/attr-morph/sanitize-attribute-value-test.jshint', ['exports'], function (exports) {
  module('JSHint - morph-attr-tests/attr-morph');
  test('morph-attr-tests/attr-morph/sanitize-attribute-value-test.js should pass jshint', function () {
    ok(true, 'morph-attr-tests/attr-morph/sanitize-attribute-value-test.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLWF0dHItdGVzdHMvYXR0ci1tb3JwaC9zYW5pdGl6ZS1hdHRyaWJ1dGUtdmFsdWUtdGVzdC5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQy9DLE1BQUksQ0FBQyxpRkFBaUYsRUFBRSxZQUFXO0FBQ2pHLE1BQUUsQ0FBQyxJQUFJLEVBQUUsa0ZBQWtGLENBQUMsQ0FBQztHQUM5RixDQUFDLENBQUMiLCJmaWxlIjoibW9ycGgtYXR0ci10ZXN0cy9hdHRyLW1vcnBoL3Nhbml0aXplLWF0dHJpYnV0ZS12YWx1ZS10ZXN0LmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gbW9ycGgtYXR0ci10ZXN0cy9hdHRyLW1vcnBoJyk7XG50ZXN0KCdtb3JwaC1hdHRyLXRlc3RzL2F0dHItbW9ycGgvc2FuaXRpemUtYXR0cmlidXRlLXZhbHVlLXRlc3QuanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayh0cnVlLCAnbW9ycGgtYXR0ci10ZXN0cy9hdHRyLW1vcnBoL3Nhbml0aXplLWF0dHJpYnV0ZS12YWx1ZS10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
define('morph-attr-tests/morph-attr.jshint', ['exports'], function (exports) {
  module('JSHint - morph-attr-tests');
  test('morph-attr-tests/morph-attr.js should pass jshint', function () {
    ok(true, 'morph-attr-tests/morph-attr.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLWF0dHItdGVzdHMvbW9ycGgtYXR0ci5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3BDLE1BQUksQ0FBQyxtREFBbUQsRUFBRSxZQUFXO0FBQ25FLE1BQUUsQ0FBQyxJQUFJLEVBQUUsb0RBQW9ELENBQUMsQ0FBQztHQUNoRSxDQUFDLENBQUMiLCJmaWxlIjoibW9ycGgtYXR0ci10ZXN0cy9tb3JwaC1hdHRyLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gbW9ycGgtYXR0ci10ZXN0cycpO1xudGVzdCgnbW9ycGgtYXR0ci10ZXN0cy9tb3JwaC1hdHRyLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ21vcnBoLWF0dHItdGVzdHMvbW9ycGgtYXR0ci5qcyBzaG91bGQgcGFzcyBqc2hpbnQuJyk7IFxufSk7XG4iXX0=
define('morph-attr-tests/morph-attr/sanitize-attribute-value.jshint', ['exports'], function (exports) {
  module('JSHint - morph-attr-tests/morph-attr');
  test('morph-attr-tests/morph-attr/sanitize-attribute-value.js should pass jshint', function () {
    ok(true, 'morph-attr-tests/morph-attr/sanitize-attribute-value.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLWF0dHItdGVzdHMvbW9ycGgtYXR0ci9zYW5pdGl6ZS1hdHRyaWJ1dGUtdmFsdWUuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQUMvQyxNQUFJLENBQUMsNEVBQTRFLEVBQUUsWUFBVztBQUM1RixNQUFFLENBQUMsSUFBSSxFQUFFLDZFQUE2RSxDQUFDLENBQUM7R0FDekYsQ0FBQyxDQUFDIiwiZmlsZSI6Im1vcnBoLWF0dHItdGVzdHMvbW9ycGgtYXR0ci9zYW5pdGl6ZS1hdHRyaWJ1dGUtdmFsdWUuanNoaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlKCdKU0hpbnQgLSBtb3JwaC1hdHRyLXRlc3RzL21vcnBoLWF0dHInKTtcbnRlc3QoJ21vcnBoLWF0dHItdGVzdHMvbW9ycGgtYXR0ci9zYW5pdGl6ZS1hdHRyaWJ1dGUtdmFsdWUuanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayh0cnVlLCAnbW9ycGgtYXR0ci10ZXN0cy9tb3JwaC1hdHRyL3Nhbml0aXplLWF0dHJpYnV0ZS12YWx1ZS5qcyBzaG91bGQgcGFzcyBqc2hpbnQuJyk7IFxufSk7XG4iXX0=