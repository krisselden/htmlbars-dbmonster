exports.__esModule = true;
exports.equalInnerHTML = equalInnerHTML;
exports.equalHTML = equalHTML;
exports.equalTokens = equalTokens;
exports.normalizeInnerHTML = normalizeInnerHTML;
exports.isCheckedInputHTML = isCheckedInputHTML;
exports.getTextContent = getTextContent;

var _simpleHtmlTokenizer = require("../simple-html-tokenizer");

var _htmlbarsUtilArrayUtils = require("../htmlbars-util/array-utils");

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
//# sourceMappingURL=data:application/json;base64,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QUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFdEQsY0FBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsVUFBUyxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQy9FLGFBQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsT0FBTyxHQUFHLEdBQUcsQ0FBQztLQUM3RCxDQUFDLENBQUM7R0FDSjs7QUFFRCxTQUFPLFVBQVUsQ0FBQztDQUNuQjs7O0FBR0QsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuRCxZQUFZLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNoRCxJQUFJLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7O0FBQ3pDLFNBQVMsa0JBQWtCLENBQUMsT0FBTyxFQUFFO0FBQzFDLE9BQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUM7Q0FDOUM7OztBQUdELElBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxLQUFLLFNBQVMsR0FBRyxXQUFXLEdBQUcsYUFBYSxDQUFDOztBQUNsRyxTQUFTLGNBQWMsQ0FBQyxFQUFFLEVBQUU7O0FBRWpDLE1BQUksRUFBRSxDQUFDLFFBQVEsS0FBSyxDQUFDLEVBQUU7QUFDckIsV0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDO0dBQ3JCLE1BQU07QUFDTCxXQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUN6QjtDQUNGIiwiZmlsZSI6Imh0bWxiYXJzLXRlc3QtaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHRva2VuaXplIH0gZnJvbSBcIi4uL3NpbXBsZS1odG1sLXRva2VuaXplclwiO1xuaW1wb3J0IHsgZm9yRWFjaCB9IGZyb20gXCIuLi9odG1sYmFycy11dGlsL2FycmF5LXV0aWxzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbElubmVySFRNTChmcmFnbWVudCwgaHRtbCkge1xuICB2YXIgYWN0dWFsSFRNTCA9IG5vcm1hbGl6ZUlubmVySFRNTChmcmFnbWVudC5pbm5lckhUTUwpO1xuICBRVW5pdC5wdXNoKGFjdHVhbEhUTUwgPT09IGh0bWwsIGFjdHVhbEhUTUwsIGh0bWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxIVE1MKG5vZGUsIGh0bWwpIHtcbiAgdmFyIGZyYWdtZW50O1xuICBpZiAoIW5vZGUubm9kZVR5cGUgJiYgbm9kZS5sZW5ndGgpIHtcbiAgICBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB3aGlsZSAobm9kZVswXSkge1xuICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQobm9kZVswXSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZyYWdtZW50ID0gbm9kZTtcbiAgfVxuXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBkaXYuYXBwZW5kQ2hpbGQoZnJhZ21lbnQuY2xvbmVOb2RlKHRydWUpKTtcblxuICBlcXVhbElubmVySFRNTChkaXYsIGh0bWwpO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVRva2VucyhmcmFnbWVudE9ySHRtbCkge1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgaWYgKHR5cGVvZiBmcmFnbWVudE9ySHRtbCA9PT0gJ3N0cmluZycpIHtcbiAgICBkaXYuaW5uZXJIVE1MID0gZnJhZ21lbnRPckh0bWw7XG4gIH0gZWxzZSB7XG4gICAgZGl2LmFwcGVuZENoaWxkKGZyYWdtZW50T3JIdG1sLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cblxuICByZXR1cm4geyB0b2tlbnM6IHRva2VuaXplKGRpdi5pbm5lckhUTUwpLCBodG1sOiBkaXYuaW5uZXJIVE1MIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbFRva2VucyhmcmFnbWVudCwgaHRtbCwgbWVzc2FnZSkge1xuICBpZiAoZnJhZ21lbnQuZnJhZ21lbnQpIHsgZnJhZ21lbnQgPSBmcmFnbWVudC5mcmFnbWVudDsgfVxuICBpZiAoaHRtbC5mcmFnbWVudCkgeyBodG1sID0gaHRtbC5mcmFnbWVudDsgfVxuXG4gIHZhciBmcmFnVG9rZW5zID0gZ2VuZXJhdGVUb2tlbnMoZnJhZ21lbnQpO1xuICB2YXIgaHRtbFRva2VucyA9IGdlbmVyYXRlVG9rZW5zKGh0bWwpO1xuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVRva2Vucyh0b2tlbikge1xuICAgIGlmICh0b2tlbi50eXBlID09PSAnU3RhcnRUYWcnKSB7XG4gICAgICB0b2tlbi5hdHRyaWJ1dGVzID0gdG9rZW4uYXR0cmlidXRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgaWYgKGFbMF0gPiBiWzBdKSB7IHJldHVybiAxOyB9XG4gICAgICAgIGlmIChhWzBdIDwgYlswXSkgeyByZXR1cm4gLTE7IH1cbiAgICAgICAgcmV0dXJuIDA7ICAgIFxuICAgICAgfSk7ICAgIFxuICAgIH0gICAgXG4gIH0gICAgXG4gICBcbiAgZm9yRWFjaChmcmFnVG9rZW5zLnRva2Vucywgbm9ybWFsaXplVG9rZW5zKTsgICBcbiAgZm9yRWFjaChodG1sVG9rZW5zLnRva2Vucywgbm9ybWFsaXplVG9rZW5zKTsgICBcblxuICB2YXIgbXNnID0gXCJFeHBlY3RlZDogXCIgKyBodG1sICsgXCI7IEFjdHVhbDogXCIgKyBmcmFnVG9rZW5zLmh0bWw7XG5cbiAgaWYgKG1lc3NhZ2UpIHsgbXNnICs9IFwiIChcIiArIG1lc3NhZ2UgKyBcIilcIjsgfVxuXG4gIGRlZXBFcXVhbChmcmFnVG9rZW5zLnRva2VucywgaHRtbFRva2Vucy50b2tlbnMsIG1zZyk7XG59XG5cbi8vIGRldGVjdCBzaWRlLWVmZmVjdHMgb2YgY2xvbmluZyBzdmcgZWxlbWVudHMgaW4gSUU5LTExXG52YXIgaWVTVkdJbm5lckhUTUwgPSAoZnVuY3Rpb24gKCkge1xuICBpZiAoIWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdzdmcnKTtcbiAgZGl2LmFwcGVuZENoaWxkKG5vZGUpO1xuICB2YXIgY2xvbmUgPSBkaXYuY2xvbmVOb2RlKHRydWUpO1xuICByZXR1cm4gY2xvbmUuaW5uZXJIVE1MID09PSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgLz4nO1xufSkoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUlubmVySFRNTChhY3R1YWxIVE1MKSB7XG4gIGlmIChpZVNWR0lubmVySFRNTCkge1xuICAgIC8vIFJlcGxhY2UgYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGhlaWdodD1cIjUwJVwiIC8+YCB3aXRoIGA8c3ZnIGhlaWdodD1cIjUwJVwiPjwvc3ZnPmAsIGV0Yy5cbiAgICAvLyBkcm9wIG5hbWVzcGFjZSBhdHRyaWJ1dGVcbiAgICBhY3R1YWxIVE1MID0gYWN0dWFsSFRNTC5yZXBsYWNlKC8geG1sbnM9XCJbXlwiXStcIi8sICcnKTtcbiAgICAvLyByZXBsYWNlIHNlbGYtY2xvc2luZyBlbGVtZW50c1xuICAgIGFjdHVhbEhUTUwgPSBhY3R1YWxIVE1MLnJlcGxhY2UoLzwoW14gPl0rKSBbXlxcLz5dKlxcLz4vZ2ksIGZ1bmN0aW9uKHRhZywgdGFnTmFtZSkge1xuICAgICAgcmV0dXJuIHRhZy5zbGljZSgwLCB0YWcubGVuZ3RoIC0gMykgKyAnPjwvJyArIHRhZ05hbWUgKyAnPic7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gYWN0dWFsSFRNTDtcbn1cblxuLy8gZGV0ZWN0IHdlaXJkIElFOCBjaGVja2VkIGVsZW1lbnQgc3RyaW5nXG52YXIgY2hlY2tlZElucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbmNoZWNrZWRJbnB1dC5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xudmFyIGNoZWNrZWRJbnB1dFN0cmluZyA9IGNoZWNrZWRJbnB1dC5vdXRlckhUTUw7XG5leHBvcnQgZnVuY3Rpb24gaXNDaGVja2VkSW5wdXRIVE1MKGVsZW1lbnQpIHtcbiAgZXF1YWwoZWxlbWVudC5vdXRlckhUTUwsIGNoZWNrZWRJbnB1dFN0cmluZyk7XG59XG5cbi8vIGNoZWNrIHdoaWNoIHByb3BlcnR5IGhhcyB0aGUgbm9kZSdzIHRleHQgY29udGVudFxudmFyIHRleHRQcm9wZXJ0eSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLnRleHRDb250ZW50ID09PSB1bmRlZmluZWQgPyAnaW5uZXJUZXh0JyA6ICd0ZXh0Q29udGVudCc7XG5leHBvcnQgZnVuY3Rpb24gZ2V0VGV4dENvbnRlbnQoZWwpIHtcbiAgLy8gdGV4dE5vZGVcbiAgaWYgKGVsLm5vZGVUeXBlID09PSAzKSB7XG4gICAgcmV0dXJuIGVsLm5vZGVWYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZWxbdGV4dFByb3BlcnR5XTtcbiAgfVxufVxuIl19