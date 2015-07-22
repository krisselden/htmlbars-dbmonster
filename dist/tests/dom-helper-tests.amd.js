define('dom-helper-tests/dom-helper-node-test', ['exports', '../dom-helper'], function (exports, _domHelper) {

  var dom;

  QUnit.module('DOM Helper (Node)', {
    afterEach: function () {
      dom = null;
    }
  });

  if (typeof document === 'undefined') {
    test('it throws when instantiated without document', function () {
      var throws = false;
      try {
        dom = new _domHelper.default();
      } catch (e) {
        throws = true;
      }
      ok(throws, 'dom helper cannot instantiate');
    });
  }

  test('it instantiates with a stub document', function () {
    var called = false;
    var element = {};
    var doc = {
      createElement: function () {
        called = true;
        return element;
      }
    };
    dom = new _domHelper.default(doc);
    ok(dom, 'dom helper can instantiate');
    var createdElement = dom.createElement('div');
    equal(createdElement, element, 'dom helper calls passed stub');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci1ub2RlLXRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxNQUFJLEdBQUcsQ0FBQzs7QUFFUixPQUFLLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFO0FBQ2hDLGFBQVMsRUFBRSxZQUFXO0FBQ3BCLFNBQUcsR0FBRyxJQUFJLENBQUM7S0FDWjtHQUNGLENBQUMsQ0FBQzs7QUFFSCxNQUFJLE9BQU8sUUFBUSxLQUFLLFdBQVcsRUFBRTtBQUNuQyxRQUFJLENBQUMsOENBQThDLEVBQUUsWUFBVTtBQUM3RCxVQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDbkIsVUFBSTtBQUNGLFdBQUcsR0FBRyx3QkFBZSxDQUFDO09BQ3ZCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixjQUFNLEdBQUcsSUFBSSxDQUFDO09BQ2Y7QUFDRCxRQUFFLENBQUMsTUFBTSxFQUFFLCtCQUErQixDQUFDLENBQUM7S0FDN0MsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsTUFBSSxDQUFDLHNDQUFzQyxFQUFFLFlBQVU7QUFDckQsUUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFFBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNqQixRQUFJLEdBQUcsR0FBRztBQUNSLG1CQUFhLEVBQUUsWUFBVTtBQUN2QixjQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsZUFBTyxPQUFPLENBQUM7T0FDaEI7S0FDRixDQUFDO0FBQ0YsT0FBRyxHQUFHLHVCQUFjLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLE1BQUUsQ0FBQyxHQUFHLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztBQUN0QyxRQUFJLGNBQWMsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlDLFNBQUssQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLDhCQUE4QixDQUFDLENBQUM7R0FDaEUsQ0FBQyxDQUFDIiwiZmlsZSI6ImRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci1ub2RlLXRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRE9NSGVscGVyIGZyb20gXCIuLi9kb20taGVscGVyXCI7XG5cbnZhciBkb207XG5cblFVbml0Lm1vZHVsZSgnRE9NIEhlbHBlciAoTm9kZSknLCB7XG4gIGFmdGVyRWFjaDogZnVuY3Rpb24oKSB7XG4gICAgZG9tID0gbnVsbDtcbiAgfVxufSk7XG5cbmlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gIHRlc3QoJ2l0IHRocm93cyB3aGVuIGluc3RhbnRpYXRlZCB3aXRob3V0IGRvY3VtZW50JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdGhyb3dzID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGRvbSA9IG5ldyBET01IZWxwZXIoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvd3MgPSB0cnVlO1xuICAgIH1cbiAgICBvayh0aHJvd3MsICdkb20gaGVscGVyIGNhbm5vdCBpbnN0YW50aWF0ZScpO1xuICB9KTtcbn1cblxudGVzdCgnaXQgaW5zdGFudGlhdGVzIHdpdGggYSBzdHViIGRvY3VtZW50JywgZnVuY3Rpb24oKXtcbiAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuICB2YXIgZWxlbWVudCA9IHt9O1xuICB2YXIgZG9jID0ge1xuICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uKCl7XG4gICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuICB9O1xuICBkb20gPSBuZXcgRE9NSGVscGVyKGRvYyk7XG4gIG9rKGRvbSwgJ2RvbSBoZWxwZXIgY2FuIGluc3RhbnRpYXRlJyk7XG4gIHZhciBjcmVhdGVkRWxlbWVudCA9IGRvbS5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZXF1YWwoY3JlYXRlZEVsZW1lbnQsIGVsZW1lbnQsICdkb20gaGVscGVyIGNhbGxzIHBhc3NlZCBzdHViJyk7XG59KTtcbiJdfQ==
define('dom-helper-tests/dom-helper-node-test.jshint', ['exports'], function (exports) {
  module('JSHint - dom-helper-tests');
  test('dom-helper-tests/dom-helper-node-test.js should pass jshint', function () {
    ok(true, 'dom-helper-tests/dom-helper-node-test.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci1ub2RlLXRlc3QuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUNwQyxNQUFJLENBQUMsNkRBQTZELEVBQUUsWUFBVztBQUM3RSxNQUFFLENBQUMsSUFBSSxFQUFFLDhEQUE4RCxDQUFDLENBQUM7R0FDMUUsQ0FBQyxDQUFDIiwiZmlsZSI6ImRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci1ub2RlLXRlc3QuanNoaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlKCdKU0hpbnQgLSBkb20taGVscGVyLXRlc3RzJyk7XG50ZXN0KCdkb20taGVscGVyLXRlc3RzL2RvbS1oZWxwZXItbm9kZS10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2RvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci1ub2RlLXRlc3QuanMgc2hvdWxkIHBhc3MganNoaW50LicpOyBcbn0pO1xuIl19
define("dom-helper-tests/dom-helper-test", ["exports", "../dom-helper", "../htmlbars-test-helpers"], function (exports, _domHelper, _htmlbarsTestHelpers) {

  var xhtmlNamespace = "http://www.w3.org/1999/xhtml",
      xlinkNamespace = "http://www.w3.org/1999/xlink",
      svgNamespace = "http://www.w3.org/2000/svg";

  var foreignNamespaces = ['foreignObject', 'desc', 'title'];

  var dom, i, foreignNamespace;

  // getAttributes may return null or "" for nonexistent attributes,
  // depending on the browser.  So we find it out here and use it later.
  var disabledAbsentValue = (function () {
    var div = document.createElement("input");
    return div.getAttribute("disabled");
  })();

  QUnit.module('DOM Helper', {
    beforeEach: function () {
      dom = new _domHelper.default();
    },
    afterEach: function () {
      dom = null;
    }
  });

  test('#createElement', function () {
    var node = dom.createElement('div');
    equal(node.tagName, 'DIV');
    _htmlbarsTestHelpers.equalHTML(node, '<div></div>');
  });

  test('#childAtIndex', function () {
    var node = dom.createElement('div');

    var child1 = dom.createElement('p');
    var child2 = dom.createElement('img');

    strictEqual(dom.childAtIndex(node, 0), null);
    strictEqual(dom.childAtIndex(node, 1), null);
    strictEqual(dom.childAtIndex(node, 2), null);

    dom.appendChild(node, child1);
    strictEqual(dom.childAtIndex(node, 0).tagName, 'P');
    strictEqual(dom.childAtIndex(node, 1), null);
    strictEqual(dom.childAtIndex(node, 2), null);

    dom.insertBefore(node, child2, child1);
    strictEqual(dom.childAtIndex(node, 0).tagName, 'IMG');
    strictEqual(dom.childAtIndex(node, 1).tagName, 'P');
    strictEqual(dom.childAtIndex(node, 2), null);
  });

  test('#appendText adds text', function () {
    var node = dom.createElement('div');
    var text = dom.appendText(node, 'Howdy');
    ok(!!text, 'returns node');
    _htmlbarsTestHelpers.equalHTML(node, '<div>Howdy</div>');
  });

  test('#setAttribute', function () {
    var node = dom.createElement('div');
    dom.setAttribute(node, 'id', 'super-tag');
    _htmlbarsTestHelpers.equalHTML(node, '<div id="super-tag"></div>');
    dom.setAttribute(node, 'id', null);
    _htmlbarsTestHelpers.equalHTML(node, '<div id="null"></div>');

    node = dom.createElement('input');
    ok(node.getAttribute('disabled') === disabledAbsentValue, 'precond: disabled is absent');
    dom.setAttribute(node, 'disabled', true);
    ok(node.getAttribute('disabled') !== disabledAbsentValue, 'disabled set to true is present');
    dom.setAttribute(node, 'disabled', false);
    ok(node.getAttribute('disabled') !== disabledAbsentValue, 'disabled set to false is present');
  });

  test('#setAttributeNS', function () {
    var node = dom.createElement('svg');
    dom.setAttributeNS(node, xlinkNamespace, 'xlink:href', 'super-fun');
    // chrome adds (xmlns:xlink="http://www.w3.org/1999/xlink") property while others don't
    // thus equalHTML is not useful
    var el = document.createElement('div');
    el.appendChild(node);
    // phantomjs omits the prefix, thus we can't find xlink:
    ok(el.innerHTML.indexOf('href="super-fun"') > 0);
    dom.setAttributeNS(node, xlinkNamespace, 'href', null);

    ok(el.innerHTML.indexOf('href="null"') > 0);
  });

  test('#getElementById', function () {
    var parentNode = dom.createElement('div'),
        childNode = dom.createElement('div');
    dom.setAttribute(parentNode, 'id', 'parent');
    dom.setAttribute(childNode, 'id', 'child');
    dom.appendChild(parentNode, childNode);
    dom.document.body.appendChild(parentNode);
    _htmlbarsTestHelpers.equalHTML(dom.getElementById('child'), '<div id="child"></div>');
    dom.document.body.removeChild(parentNode);
  });

  test('#setPropertyStrict', function () {
    var node = dom.createElement('div');
    dom.setPropertyStrict(node, 'id', 'super-tag');
    _htmlbarsTestHelpers.equalHTML(node, '<div id="super-tag"></div>');

    node = dom.createElement('input');
    ok(node.getAttribute('disabled') === disabledAbsentValue, 'precond: disabled is absent');
    dom.setPropertyStrict(node, 'disabled', true);
    ok(node.getAttribute('disabled') !== disabledAbsentValue, 'disabled is present');
    dom.setPropertyStrict(node, 'disabled', false);
    ok(node.getAttribute('disabled') === disabledAbsentValue, 'disabled has been removed');
  });

  // IE dislikes undefined or null for value
  test('#setPropertyStrict value', function () {
    var node = dom.createElement('input');
    dom.setPropertyStrict(node, 'value', undefined);
    equal(node.value, '', 'blank string is set for undefined');
    dom.setPropertyStrict(node, 'value', null);
    equal(node.value, '', 'blank string is set for undefined');
  });

  // IE dislikes undefined or null for type
  test('#setPropertyStrict type', function () {
    var node = dom.createElement('input');
    dom.setPropertyStrict(node, 'type', undefined);
    equal(node.type, 'text', 'text default is set for undefined');
    dom.setPropertyStrict(node, 'type', null);
    equal(node.type, 'text', 'text default is set for undefined');
  });

  // setting undefined or null to src makes a network request
  test('#setPropertyStrict src', function () {
    var node = dom.createElement('img');
    dom.setPropertyStrict(node, 'src', undefined);
    notEqual(node.src, undefined, 'blank string is set for undefined');
    dom.setPropertyStrict(node, 'src', null);
    notEqual(node.src, null, 'blank string is set for undefined');
  });

  test('#removeAttribute', function () {
    var node = dom.createElement('div');
    dom.setAttribute(node, 'id', 'super-tag');
    _htmlbarsTestHelpers.equalHTML(node, '<div id="super-tag"></div>', 'precond - attribute exists');

    dom.removeAttribute(node, 'id');
    _htmlbarsTestHelpers.equalHTML(node, '<div></div>', 'attribute was removed');
  });

  test('#removeAttribute of SVG', function () {
    dom.setNamespace(svgNamespace);
    var node = dom.createElement('svg');
    dom.setAttribute(node, 'viewBox', '0 0 100 100');
    _htmlbarsTestHelpers.equalHTML(node, '<svg viewBox="0 0 100 100"></svg>', 'precond - attribute exists');

    dom.removeAttribute(node, 'viewBox');
    _htmlbarsTestHelpers.equalHTML(node, '<svg></svg>', 'attribute was removed');
  });

  test('#setProperty', function () {
    var node = dom.createElement('div');
    dom.setProperty(node, 'id', 'super-tag');
    _htmlbarsTestHelpers.equalHTML(node, '<div id="super-tag"></div>');
    dom.setProperty(node, 'id', null);
    ok(node.getAttribute('id') !== 'super-tag', 'null property sets to the property');

    node = dom.createElement('div');
    dom.setProperty(node, 'data-fun', 'whoopie');
    _htmlbarsTestHelpers.equalHTML(node, '<div data-fun="whoopie"></div>');
    dom.setProperty(node, 'data-fun', null);
    _htmlbarsTestHelpers.equalHTML(node, '<div></div>', 'null attribute removes the attribute');

    node = dom.createElement('input');
    dom.setProperty(node, 'disabled', true);
    equal(node.disabled, true);
    dom.setProperty(node, 'disabled', false);
    equal(node.disabled, false);

    node = dom.createElement('div');
    dom.setProperty(node, 'style', 'color: red;');
    _htmlbarsTestHelpers.equalHTML(node, '<div style="color: red;"></div>');
  });

  test('#setProperty removes attr with undefined', function () {
    var node = dom.createElement('div');
    dom.setProperty(node, 'data-fun', 'whoopie');
    _htmlbarsTestHelpers.equalHTML(node, '<div data-fun="whoopie"></div>');
    dom.setProperty(node, 'data-fun', undefined);
    _htmlbarsTestHelpers.equalHTML(node, '<div></div>', 'undefined attribute removes the attribute');
  });

  test('#setProperty uses setAttribute for special non-compliant element props', function () {
    expect(6);

    var badPairs = [{ tagName: 'button', key: 'type', value: 'submit', selfClosing: false }, { tagName: 'input', key: 'type', value: 'x-not-supported', selfClosing: true }];

    badPairs.forEach(function (pair) {
      var node = dom.createElement(pair.tagName);
      var setAttribute = node.setAttribute;

      node.setAttribute = function (attrName, value) {
        equal(attrName, pair.key, 'setAttribute called with correct attrName');
        equal(value, pair.value, 'setAttribute called with correct value');
        return setAttribute.call(this, attrName, value);
      };

      dom.setProperty(node, pair.key, pair.value);

      // e.g. <button type="submit"></button>
      var expected = '<' + pair.tagName + ' ' + pair.key + '="' + pair.value + '">';
      if (pair.selfClosing === false) {
        expected += '</' + pair.tagName + '>';
      }

      _htmlbarsTestHelpers.equalHTML(node, expected, 'output html is correct');
    });
  });

  test('#addClasses', function () {
    var node = dom.createElement('div');
    dom.addClasses(node, ['super-fun']);
    equal(node.className, 'super-fun');
    dom.addClasses(node, ['super-fun']);
    equal(node.className, 'super-fun');
    dom.addClasses(node, ['super-blast']);
    equal(node.className, 'super-fun super-blast');
    dom.addClasses(node, ['bacon', 'ham']);
    equal(node.className, 'super-fun super-blast bacon ham');
  });

  test('#removeClasses', function () {
    var node = dom.createElement('div');
    node.setAttribute('class', 'this-class that-class');
    dom.removeClasses(node, ['this-class']);
    equal(node.className, 'that-class');
    dom.removeClasses(node, ['this-class']);
    equal(node.className, 'that-class');
    dom.removeClasses(node, ['that-class']);
    equal(node.className, '');
    node.setAttribute('class', 'woop moop jeep');
    dom.removeClasses(node, ['moop', 'jeep']);
    equal(node.className, 'woop');
  });

  test('#createElement of tr with contextual table element', function () {
    var tableElement = document.createElement('table'),
        node = dom.createElement('tr', tableElement);
    equal(node.tagName, 'TR');
    _htmlbarsTestHelpers.equalHTML(node, '<tr></tr>');
  });

  test('#createMorph has optional contextualElement', function () {
    var parent = document.createElement('div'),
        fragment = document.createDocumentFragment(),
        start = document.createTextNode(''),
        end = document.createTextNode(''),
        morph,
        thrown;

    try {
      morph = dom.createMorph(fragment, start, end, fragment);
    } catch (e) {
      thrown = true;
    }
    ok(thrown, 'Exception thrown when a fragment is provided for contextualElement');

    morph = dom.createMorph(fragment, start, end, parent);
    equal(morph.contextualElement, parent, "morph's contextualElement is parent");

    morph = dom.createMorph(parent, start, end);
    equal(morph.contextualElement, parent, "morph's contextualElement is parent");
  });

  test('#appendMorph', function () {
    var element = document.createElement('div');

    dom.appendText(element, 'a');
    var morph = dom.appendMorph(element);
    dom.appendText(element, 'c');

    morph.setContent('b');

    equal(element.innerHTML, 'abc');
  });

  test('#insertMorphBefore', function () {
    var element = document.createElement('div');

    dom.appendText(element, 'a');
    var c = dom.appendText(element, 'c');
    var morph = dom.insertMorphBefore(element, c);

    morph.setContent('b');

    equal(element.innerHTML, 'abc');
  });

  test('#parseHTML combinations', function () {
    var parsingCombinations = [
    // omitted start tags
    //
    ['table', '<tr><td>Yo</td></tr>', 'TR'], ['table', '<tbody><tr></tr></tbody>', 'TBODY'], ['table', '<col></col>', 'COL'],
    // elements with broken innerHTML in IE9 and down
    ['select', '<option></option>', 'OPTION'], ['colgroup', '<col></col>', 'COL'], ['tbody', '<tr></tr>', 'TR'], ['tfoot', '<tr></tr>', 'TR'], ['thead', '<tr></tr>', 'TR'], ['tr', '<td></td>', 'TD'], ['div', '<script></script>', 'SCRIPT']];

    var contextTag, content, expectedTagName, contextElement, nodes;
    for (var p = 0; p < parsingCombinations.length; p++) {
      contextTag = parsingCombinations[p][0];
      content = parsingCombinations[p][1];
      expectedTagName = parsingCombinations[p][2];

      contextElement = document.createElement(contextTag);
      nodes = dom.parseHTML(content, contextElement).childNodes;
      equal(nodes[0].tagName, expectedTagName, '#parseHTML of ' + content + ' returns a ' + expectedTagName + ' inside a ' + contextTag + ' context');
    }
  });

  test('#parseHTML of script then tr inside table context wraps the tr in a tbody', function () {
    var tableElement = document.createElement('table'),
        nodes = dom.parseHTML('<script></script><tr><td>Yo</td></tr>', tableElement).childNodes;
    // The HTML spec suggests the first item must be the child of
    // the omittable start tag. Here script is the first child, so no-go.
    equal(nodes.length, 2, 'Leading script tag corrupts');
    equal(nodes[0].tagName, 'SCRIPT');
    equal(nodes[1].tagName, 'TBODY');
  });

  test('#parseHTML of select allows the initial implicit option selection to remain', function () {
    var div = document.createElement('div');
    var select = dom.parseHTML('<select><option></option></select>', div).childNodes[0];

    ok(select.childNodes[0].selected, 'first element is selected');
  });

  test('#parseHTML of options removes an implicit selection', function () {
    var select = document.createElement('select');
    var options = dom.parseHTML('<option value="1"></option><option value="2"></option>', select).childNodes;

    ok(!options[0].selected, 'first element is not selected');
    ok(!options[1].selected, 'second element is not selected');
  });

  test('#parseHTML of options leaves an explicit first selection', function () {
    var select = document.createElement('select');
    var options = dom.parseHTML('<option value="1" selected></option><option value="2"></option>', select).childNodes;

    ok(options[0].selected, 'first element is selected');
    ok(!options[1].selected, 'second element is not selected');
  });

  test('#parseHTML of options leaves an explicit second selection', function () {
    var select = document.createElement('select');
    var options = dom.parseHTML('<option value="1"></option><option value="2" selected="selected"></option>', select).childNodes;

    ok(!options[0].selected, 'first element is not selected');
    ok(options[1].selected, 'second element is selected');
  });

  test('#parseHTML of script then tr inside tbody context', function () {
    var tbodyElement = document.createElement('tbody'),
        nodes = dom.parseHTML('<script></script><tr><td>Yo</td></tr>', tbodyElement).childNodes;
    equal(nodes.length, 2, 'Leading script tag corrupts');
    equal(nodes[0].tagName, 'SCRIPT');
    equal(nodes[1].tagName, 'TR');
  });

  test('#parseHTML with retains whitespace', function () {
    var div = document.createElement('div');
    var nodes = dom.parseHTML('leading<script id="first"></script> <script id="second"></script><div><script></script> <script></script>, indeed.</div>', div).childNodes;
    equal(nodes[0].data, 'leading');
    equal(nodes[1].tagName, 'SCRIPT');
    equal(nodes[2].data, ' ');
    equal(nodes[3].tagName, 'SCRIPT');
    equal(nodes[4].tagName, 'DIV');
    equal(nodes[4].childNodes[0].tagName, 'SCRIPT');
    equal(nodes[4].childNodes[1].data, ' ');
    equal(nodes[4].childNodes[2].tagName, 'SCRIPT');
    equal(nodes[4].childNodes[3].data, ', indeed.');
  });

  test('#parseHTML with retains whitespace of top element', function () {
    var div = document.createElement('div');
    var nodes = dom.parseHTML('<span>hello <script id="first"></script> yeah</span>', div).childNodes;
    equal(nodes[0].tagName, 'SPAN');
    _htmlbarsTestHelpers.equalHTML(nodes, '<span>hello <script id="first"></script> yeah</span>');
  });

  test('#parseHTML with retains whitespace after script', function () {
    var div = document.createElement('div');
    var nodes = dom.parseHTML('<span>hello</span><script id="first"></script><span><script></script> kwoop</span>', div).childNodes;
    equal(nodes[0].tagName, 'SPAN');
    equal(nodes[1].tagName, 'SCRIPT');
    equal(nodes[2].tagName, 'SPAN');
    _htmlbarsTestHelpers.equalHTML(nodes, '<span>hello</span><script id="first"></script><span><script></script> kwoop</span>');
  });

  test('#parseHTML of number', function () {
    var div = document.createElement('div');
    var nodes = dom.parseHTML(5, div).childNodes;
    equal(nodes[0].data, '5');
    _htmlbarsTestHelpers.equalHTML(nodes, '5');
  });

  test('#protocolForURL', function () {
    var protocol = dom.protocolForURL("http://www.emberjs.com");
    equal(protocol, "http:");

    // Inherit protocol from document if unparseable
    protocol = dom.protocolForURL("   javascript:lulzhacked()");
    /*jshint scripturl:true*/
    equal(protocol, "javascript:");
  });

  test('#cloneNode shallow', function () {
    var divElement = document.createElement('div');

    divElement.appendChild(document.createElement('span'));

    var node = dom.cloneNode(divElement, false);

    equal(node.tagName, 'DIV');
    _htmlbarsTestHelpers.equalHTML(node, '<div></div>');
  });

  test('#cloneNode deep', function () {
    var divElement = document.createElement('div');

    divElement.appendChild(document.createElement('span'));

    var node = dom.cloneNode(divElement, true);

    equal(node.tagName, 'DIV');
    _htmlbarsTestHelpers.equalHTML(node, '<div><span></span></div>');
  });

  test('dom node has empty text after cloning and ensuringBlankTextNode', function () {
    var div = document.createElement('div');

    div.appendChild(document.createTextNode(''));

    var clonedDiv = dom.cloneNode(div, true);

    equal(clonedDiv.nodeType, 1);
    _htmlbarsTestHelpers.equalHTML(clonedDiv, '<div></div>');
    // IE's native cloneNode drops blank string text
    // nodes. Assert repairClonedNode brings back the blank
    // text node.
    dom.repairClonedNode(clonedDiv, [0]);
    equal(clonedDiv.childNodes.length, 1);
    equal(clonedDiv.childNodes[0].nodeType, 3);
  });

  test('dom node has empty start text after cloning and ensuringBlankTextNode', function () {
    var div = document.createElement('div');

    div.appendChild(document.createTextNode(''));
    div.appendChild(document.createElement('span'));

    var clonedDiv = dom.cloneNode(div, true);

    equal(clonedDiv.nodeType, 1);
    _htmlbarsTestHelpers.equalHTML(clonedDiv, '<div><span></span></div>');
    // IE's native cloneNode drops blank string text
    // nodes. Assert denormalizeText brings back the blank
    // text node.
    dom.repairClonedNode(clonedDiv, [0]);
    equal(clonedDiv.childNodes.length, 2);
    equal(clonedDiv.childNodes[0].nodeType, 3);
  });

  test('dom node checked after cloning and ensuringChecked', function () {
    var input = document.createElement('input');

    input.setAttribute('checked', 'checked');
    ok(input.checked, 'input is checked');

    var clone = dom.cloneNode(input, false);

    // IE's native cloneNode copies checked attributes but
    // not the checked property of the DOM node.
    dom.repairClonedNode(clone, [], true);

    _htmlbarsTestHelpers.isCheckedInputHTML(clone, '<input checked="checked">');
    ok(clone.checked, 'clone is checked');
  });

  if ('namespaceURI' in document.createElement('div')) {

    QUnit.module('DOM Helper namespaces', {
      beforeEach: function () {
        dom = new _domHelper.default();
      },
      afterEach: function () {
        dom = null;
      }
    });

    test('#createElement div is xhtml', function () {
      var node = dom.createElement('div');
      equal(node.namespaceURI, xhtmlNamespace);
    });

    test('#createElement of svg with svg namespace', function () {
      dom.setNamespace(svgNamespace);
      var node = dom.createElement('svg');
      equal(node.tagName, 'svg');
      equal(node.namespaceURI, svgNamespace);
    });

    test('#createElement of path with detected svg contextual element', function () {
      dom.setNamespace(svgNamespace);
      var node = dom.createElement('path');
      equal(node.tagName, 'path');
      equal(node.namespaceURI, svgNamespace);
    });

    test('#createElement of path with svg contextual element', function () {
      var node = dom.createElement('path', document.createElementNS(svgNamespace, 'svg'));
      equal(node.tagName, 'path');
      equal(node.namespaceURI, svgNamespace);
    });

    test('#createElement of svg with div namespace', function () {
      var node = dom.createElement('svg', document.createElement('div'));
      equal(node.tagName, 'svg');
      equal(node.namespaceURI, svgNamespace);
    });

    test('#getElementById with different root node', function () {
      var doc = document.implementation.createDocument(xhtmlNamespace, 'html', null),
          body = document.createElementNS(xhtmlNamespace, 'body'),
          parentNode = dom.createElement('div'),
          childNode = dom.createElement('div');

      doc.documentElement.appendChild(body);
      dom.setAttribute(parentNode, 'id', 'parent');
      dom.setAttribute(childNode, 'id', 'child');
      dom.appendChild(parentNode, childNode);
      dom.appendChild(body, parentNode);
      _htmlbarsTestHelpers.equalHTML(dom.getElementById('child', doc), '<div id="child"></div>');
    });

    test('#setProperty with namespaced attributes', function () {
      var node;

      dom.setNamespace(svgNamespace);
      node = dom.createElement('svg');
      dom.setProperty(node, 'viewBox', '0 0 0 0');
      _htmlbarsTestHelpers.equalHTML(node, '<svg viewBox="0 0 0 0"></svg>');

      dom.setProperty(node, 'xlink:title', 'super-blast', xlinkNamespace);
      // chrome adds (xmlns:xlink="http://www.w3.org/1999/xlink") property while others don't
      // thus equalHTML is not useful
      var el = document.createElement('div');
      el.appendChild(node);
      // phantom js omits the prefix so we can't look for xlink:
      ok(el.innerHTML.indexOf('title="super-blast"') > 0);

      dom.setProperty(node, 'xlink:title', null, xlinkNamespace);
      equal(node.getAttribute('xlink:title'), null, 'ns attr is removed');
    });

    test("#setProperty removes namespaced attr with undefined", function () {
      var node;

      node = dom.createElement('svg');
      dom.setProperty(node, 'xlink:title', 'Great Title', xlinkNamespace);
      dom.setProperty(node, 'xlink:title', undefined, xlinkNamespace);
      equal(node.getAttribute('xlink:title'), undefined, 'ns attr is removed');
    });

    for (i = 0; i < foreignNamespaces.length; i++) {
      foreignNamespace = foreignNamespaces[i];

      test('#createElement of div with ' + foreignNamespace + ' contextual element', function () {
        var node = dom.createElement('div', document.createElementNS(svgNamespace, foreignNamespace));
        equal(node.tagName, 'DIV');
        equal(node.namespaceURI, xhtmlNamespace);
      }); // jshint ignore:line

      test('#parseHTML of div with ' + foreignNamespace, function () {
        dom.setNamespace(xhtmlNamespace);
        var foreignObject = document.createElementNS(svgNamespace, foreignNamespace),
            nodes = dom.parseHTML('<div></div>', foreignObject).childNodes;
        equal(nodes[0].tagName, 'DIV');
        equal(nodes[0].namespaceURI, xhtmlNamespace);
      }); // jshint ignore:line
    }

    test('#parseHTML of path with svg contextual element', function () {
      dom.setNamespace(svgNamespace);
      var svgElement = document.createElementNS(svgNamespace, 'svg'),
          nodes = dom.parseHTML('<path></path>', svgElement).childNodes;
      equal(nodes[0].tagName, 'path');
      equal(nodes[0].namespaceURI, svgNamespace);
    });

    test('#parseHTML of stop with linearGradient contextual element', function () {
      dom.setNamespace(svgNamespace);
      var svgElement = document.createElementNS(svgNamespace, 'linearGradient'),
          nodes = dom.parseHTML('<stop />', svgElement).childNodes;
      equal(nodes[0].tagName, 'stop');
      equal(nodes[0].namespaceURI, svgNamespace);
    });

    test('#addClasses on SVG', function () {
      var node = document.createElementNS(svgNamespace, 'svg');
      dom.addClasses(node, ['super-fun']);
      equal(node.getAttribute('class'), 'super-fun');
      dom.addClasses(node, ['super-fun']);
      equal(node.getAttribute('class'), 'super-fun');
      dom.addClasses(node, ['super-blast']);
      equal(node.getAttribute('class'), 'super-fun super-blast');
    });

    test('#removeClasses on SVG', function () {
      var node = document.createElementNS(svgNamespace, 'svg');
      node.setAttribute('class', 'this-class that-class');
      dom.removeClasses(node, ['this-class']);
      equal(node.getAttribute('class'), 'that-class');
      dom.removeClasses(node, ['this-class']);
      equal(node.getAttribute('class'), 'that-class');
      dom.removeClasses(node, ['that-class']);
      equal(node.getAttribute('class'), '');
    });
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci10ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsTUFBSSxjQUFjLEdBQUcsOEJBQThCO01BQy9DLGNBQWMsR0FBRyw4QkFBOEI7TUFDL0MsWUFBWSxHQUFLLDRCQUE0QixDQUFDOztBQUVsRCxNQUFJLGlCQUFpQixHQUFHLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFM0QsTUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLGdCQUFnQixDQUFDOzs7O0FBSTdCLE1BQUksbUJBQW1CLEdBQUcsQ0FBQyxZQUFXO0FBQ3BDLFFBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUMsV0FBTyxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQ3JDLENBQUEsRUFBRyxDQUFDOztBQUVMLE9BQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO0FBQ3pCLGNBQVUsRUFBRSxZQUFXO0FBQ3JCLFNBQUcsR0FBRyx3QkFBZSxDQUFDO0tBQ3ZCO0FBQ0QsYUFBUyxFQUFFLFlBQVc7QUFDcEIsU0FBRyxHQUFHLElBQUksQ0FBQztLQUNaO0dBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQUksQ0FBQyxnQkFBZ0IsRUFBRSxZQUFVO0FBQy9CLFFBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEMsU0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDM0IseUJBL0JBLFNBQVMsQ0ErQkMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0dBQ2hDLENBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMsZUFBZSxFQUFFLFlBQVc7QUFDL0IsUUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFcEMsUUFBSSxNQUFNLEdB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QUM1RCxDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLHVCQUF1QixFQUFFLFlBQVU7QUFDdEMsVUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDekQsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztBQUNwRCxTQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFDeEMsV0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDaEQsU0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLFdBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ2hELFNBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUN4QyxXQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUN2QyxDQUFDLENBQUM7R0FHRiIsImZpbGUiOiJkb20taGVscGVyLXRlc3RzL2RvbS1oZWxwZXItdGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBET01IZWxwZXIgZnJvbSBcIi4uL2RvbS1oZWxwZXJcIjtcbmltcG9ydCB7XG4gIGVxdWFsSFRNTCxcbiAgaXNDaGVja2VkSW5wdXRIVE1MXG59IGZyb20gXCIuLi9odG1sYmFycy10ZXN0LWhlbHBlcnNcIjtcblxudmFyIHhodG1sTmFtZXNwYWNlID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXG4gICAgeGxpbmtOYW1lc3BhY2UgPSBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIixcbiAgICBzdmdOYW1lc3BhY2UgICA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcblxudmFyIGZvcmVpZ25OYW1lc3BhY2VzID0gWydmb3JlaWduT2JqZWN0JywgJ2Rlc2MnLCAndGl0bGUnXTtcblxudmFyIGRvbSwgaSwgZm9yZWlnbk5hbWVzcGFjZTtcblxuLy8gZ2V0QXR0cmlidXRlcyBtYXkgcmV0dXJuIG51bGwgb3IgXCJcIiBmb3Igbm9uZXhpc3RlbnQgYXR0cmlidXRlcyxcbi8vIGRlcGVuZGluZyBvbiB0aGUgYnJvd3Nlci4gIFNvIHdlIGZpbmQgaXQgb3V0IGhlcmUgYW5kIHVzZSBpdCBsYXRlci5cbnZhciBkaXNhYmxlZEFic2VudFZhbHVlID0gKGZ1bmN0aW9uICgpe1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICByZXR1cm4gZGl2LmdldEF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xufSkoKTtcblxuUVVuaXQubW9kdWxlKCdET00gSGVscGVyJywge1xuICBiZWZvcmVFYWNoOiBmdW5jdGlvbigpIHtcbiAgICBkb20gPSBuZXcgRE9NSGVscGVyKCk7XG4gIH0sXG4gIGFmdGVyRWFjaDogZnVuY3Rpb24oKSB7XG4gICAgZG9tID0gbnVsbDtcbiAgfVxufSk7XG5cbnRlc3QoJyNjcmVhdGVFbGVtZW50JywgZnVuY3Rpb24oKXtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVxdWFsKG5vZGUudGFnTmFtZSwgJ0RJVicpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXY+PC9kaXY+Jyk7XG59KTtcblxudGVzdCgnI2NoaWxkQXRJbmRleCcsIGZ1bmN0aW9uKCkge1xuICB2YXIgbm9kZSA9IGRvbS5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICB2YXIgY2hpbGQxID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgdmFyIGNoaWxkMiA9IGRvbS5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICBzdHJpY3RFcXVhbChkb20uY2hpbGRBdEluZGV4KG5vZGUsIDApLCBudWxsKTtcbiAgc3RyaWN0RXF1YWwoZG9tLmNoaWxkQXRJbmRleChub2RlLCAxKSwgbnVsbCk7XG4gIHN0cmljdEVxdWFsKGRvbS5jaGlsZEF0SW5kZXgobm9kZSwgMiksIG51bGwpO1xuXG4gIGRvbS5hcHBlbmRDaGlsZChub2RlLCBjaGlsZDEpO1xuICBzdHJpY3RFcXVhbChkb20uY2hpbGRBdEluZGV4KG5vZGUsIDApLnRhZ05hbWUsICdQJyk7XG4gIHN0cmljdEVxdWFsKGRvbS5jaGlsZEF0SW5kZXgobm9kZSwgMSksIG51bGwpO1xuICBzdHJpY3RFcXVhbChkb20uY2hpbGRBdEluZGV4KG5vZGUsIDIpLCBudWxsKTtcblxuICBkb20uaW5zZXJ0QmVmb3JlKG5vZGUsIGNoaWxkMiwgY2hpbGQxKTtcbiAgc3RyaWN0RXF1YWwoZG9tLmNoaWxkQXRJbmRleChub2RlLCAwKS50YWdOYW1lLCAnSU1HJyk7XG4gIHN0cmljdEVxdWFsKGRvbS5jaGlsZEF0SW5kZXgobm9kZSwgMSkudGFnTmFtZSwgJ1AnKTtcbiAgc3RyaWN0RXF1YWwoZG9tLmNoaWxkQXRJbmRleChub2RlLCAyKSwgbnVsbCk7XG59KTtcblxudGVzdCgnI2FwcGVuZFRleHQgYWRkcyB0ZXh0JywgZnVuY3Rpb24oKXtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHZhciB0ZXh0ID0gZG9tLmFwcGVuZFRleHQobm9kZSwgJ0hvd2R5Jyk7XG4gIG9rKCEhdGV4dCwgJ3JldHVybnMgbm9kZScpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXY+SG93ZHk8L2Rpdj4nKTtcbn0pO1xuXG50ZXN0KCcjc2V0QXR0cmlidXRlJywgZnVuY3Rpb24oKXtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRvbS5zZXRBdHRyaWJ1dGUobm9kZSwgJ2lkJywgJ3N1cGVyLXRhZycpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXYgaWQ9XCJzdXBlci10YWdcIj48L2Rpdj4nKTtcbiAgZG9tLnNldEF0dHJpYnV0ZShub2RlLCAnaWQnLCBudWxsKTtcbiAgZXF1YWxIVE1MKG5vZGUsICc8ZGl2IGlkPVwibnVsbFwiPjwvZGl2PicpO1xuXG4gIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgb2sobm9kZS5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgPT09IGRpc2FibGVkQWJzZW50VmFsdWUsICdwcmVjb25kOiBkaXNhYmxlZCBpcyBhYnNlbnQnKTtcbiAgZG9tLnNldEF0dHJpYnV0ZShub2RlLCAnZGlzYWJsZWQnLCB0cnVlKTtcbiAgb2sobm9kZS5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgIT09IGRpc2FibGVkQWJzZW50VmFsdWUsICdkaXNhYmxlZCBzZXQgdG8gdHJ1ZSBpcyBwcmVzZW50Jyk7XG4gIGRvbS5zZXRBdHRyaWJ1dGUobm9kZSwgJ2Rpc2FibGVkJywgZmFsc2UpO1xuICBvayhub2RlLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKSAhPT0gZGlzYWJsZWRBYnNlbnRWYWx1ZSwgJ2Rpc2FibGVkIHNldCB0byBmYWxzZSBpcyBwcmVzZW50Jyk7XG59KTtcblxudGVzdCgnI3NldEF0dHJpYnV0ZU5TJywgZnVuY3Rpb24oKXtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnc3ZnJyk7XG4gIGRvbS5zZXRBdHRyaWJ1dGVOUyhub2RlLCB4bGlua05hbWVzcGFjZSwgJ3hsaW5rOmhyZWYnLCAnc3VwZXItZnVuJyk7XG4gIC8vIGNocm9tZSBhZGRzICh4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIikgcHJvcGVydHkgd2hpbGUgb3RoZXJzIGRvbid0XG4gIC8vIHRodXMgZXF1YWxIVE1MIGlzIG5vdCB1c2VmdWxcbiAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmFwcGVuZENoaWxkKG5vZGUpO1xuICAvLyBwaGFudG9tanMgb21pdHMgdGhlIHByZWZpeCwgdGh1cyB3ZSBjYW4ndCBmaW5kIHhsaW5rOlxuICBvayhlbC5pbm5lckhUTUwuaW5kZXhPZignaHJlZj1cInN1cGVyLWZ1blwiJykgPiAwKTtcbiAgZG9tLnNldEF0dHJpYnV0ZU5TKG5vZGUsIHhsaW5rTmFtZXNwYWNlLCAnaHJlZicsIG51bGwpO1xuXG4gIG9rKGVsLmlubmVySFRNTC5pbmRleE9mKCdocmVmPVwibnVsbFwiJykgPiAwKTtcblxufSk7XG5cbnRlc3QoJyNnZXRFbGVtZW50QnlJZCcsIGZ1bmN0aW9uKCkge1xuICB2YXIgcGFyZW50Tm9kZSA9IGRvbS5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgIGNoaWxkTm9kZSA9IGRvbS5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZG9tLnNldEF0dHJpYnV0ZShwYXJlbnROb2RlLCAnaWQnLCAncGFyZW50Jyk7XG4gIGRvbS5zZXRBdHRyaWJ1dGUoY2hpbGROb2RlLCAnaWQnLCAnY2hpbGQnKTtcbiAgZG9tLmFwcGVuZENoaWxkKHBhcmVudE5vZGUsIGNoaWxkTm9kZSk7XG4gIGRvbS5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBhcmVudE5vZGUpO1xuICBlcXVhbEhUTUwoZG9tLmdldEVsZW1lbnRCeUlkKCdjaGlsZCcpLCAnPGRpdiBpZD1cImNoaWxkXCI+PC9kaXY+Jyk7XG4gIGRvbS5kb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHBhcmVudE5vZGUpO1xufSk7XG5cbnRlc3QoJyNzZXRQcm9wZXJ0eVN0cmljdCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBkb20uc2V0UHJvcGVydHlTdHJpY3Qobm9kZSwgJ2lkJywgJ3N1cGVyLXRhZycpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXYgaWQ9XCJzdXBlci10YWdcIj48L2Rpdj4nKTtcblxuICBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gIG9rKG5vZGUuZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpID09PSBkaXNhYmxlZEFic2VudFZhbHVlLCAncHJlY29uZDogZGlzYWJsZWQgaXMgYWJzZW50Jyk7XG4gIGRvbS5zZXRQcm9wZXJ0eVN0cmljdChub2RlLCAnZGlzYWJsZWQnLCB0cnVlKTtcbiAgb2sobm9kZS5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgIT09IGRpc2FibGVkQWJzZW50VmFsdWUsICdkaXNhYmxlZCBpcyBwcmVzZW50Jyk7XG4gIGRvbS5zZXRQcm9wZXJ0eVN0cmljdChub2RlLCAnZGlzYWJsZWQnLCBmYWxzZSk7XG4gIG9rKG5vZGUuZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpID09PSBkaXNhYmxlZEFic2VudFZhbHVlLCAnZGlzYWJsZWQgaGFzIGJlZW4gcmVtb3ZlZCcpO1xufSk7XG5cbi8vIElFIGRpc2xpa2VzIHVuZGVmaW5lZCBvciBudWxsIGZvciB2YWx1ZVxudGVzdCgnI3NldFByb3BlcnR5U3RyaWN0IHZhbHVlJywgZnVuY3Rpb24oKXtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgZG9tLnNldFByb3BlcnR5U3RyaWN0KG5vZGUsICd2YWx1ZScsIHVuZGVmaW5lZCk7XG4gIGVxdWFsKG5vZGUudmFsdWUsICcnLCAnYmxhbmsgc3RyaW5nIGlzIHNldCBmb3IgdW5kZWZpbmVkJyk7XG4gIGRvbS5zZXRQcm9wZXJ0eVN0cmljdChub2RlLCAndmFsdWUnLCBudWxsKTtcbiAgZXF1YWwobm9kZS52YWx1ZSwgJycsICdibGFuayBzdHJpbmcgaXMgc2V0IGZvciB1bmRlZmluZWQnKTtcbn0pO1xuXG4vLyBJRSBkaXNsaWtlcyB1bmRlZmluZWQgb3IgbnVsbCBmb3IgdHlwZVxudGVzdCgnI3NldFByb3BlcnR5U3RyaWN0IHR5cGUnLCBmdW5jdGlvbigpe1xuICB2YXIgbm9kZSA9IGRvbS5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICBkb20uc2V0UHJvcGVydHlTdHJpY3Qobm9kZSwgJ3R5cGUnLCB1bmRlZmluZWQpO1xuICBlcXVhbChub2RlLnR5cGUsICd0ZXh0JywgJ3RleHQgZGVmYXVsdCBpcyBzZXQgZm9yIHVuZGVmaW5lZCcpO1xuICBkb20uc2V0UHJvcGVydHlTdHJpY3Qobm9kZSwgJ3R5cGUnLCBudWxsKTtcbiAgZXF1YWwobm9kZS50eXBlLCAndGV4dCcsICd0ZXh0IGRlZmF1bHQgaXMgc2V0IGZvciB1bmRlZmluZWQnKTtcbn0pO1xuXG4vLyBzZXR0aW5nIHVuZGVmaW5lZCBvciBudWxsIHRvIHNyYyBtYWtlcyBhIG5ldHdvcmsgcmVxdWVzdFxudGVzdCgnI3NldFByb3BlcnR5U3RyaWN0IHNyYycsIGZ1bmN0aW9uKCl7XG4gIHZhciBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICBkb20uc2V0UHJvcGVydHlTdHJpY3Qobm9kZSwgJ3NyYycsIHVuZGVmaW5lZCk7XG4gIG5vdEVxdWFsKG5vZGUuc3JjLCB1bmRlZmluZWQsICdibGFuayBzdHJpbmcgaXMgc2V0IGZvciB1bmRlZmluZWQnKTtcbiAgZG9tLnNldFByb3BlcnR5U3RyaWN0KG5vZGUsICdzcmMnLCBudWxsKTtcbiAgbm90RXF1YWwobm9kZS5zcmMsIG51bGwsICdibGFuayBzdHJpbmcgaXMgc2V0IGZvciB1bmRlZmluZWQnKTtcbn0pO1xuXG50ZXN0KCcjcmVtb3ZlQXR0cmlidXRlJywgZnVuY3Rpb24oKXtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRvbS5zZXRBdHRyaWJ1dGUobm9kZSwgJ2lkJywgJ3N1cGVyLXRhZycpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXYgaWQ9XCJzdXBlci10YWdcIj48L2Rpdj4nLCAncHJlY29uZCAtIGF0dHJpYnV0ZSBleGlzdHMnKTtcblxuICBkb20ucmVtb3ZlQXR0cmlidXRlKG5vZGUsICdpZCcpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXY+PC9kaXY+JywgJ2F0dHJpYnV0ZSB3YXMgcmVtb3ZlZCcpO1xufSk7XG5cbnRlc3QoJyNyZW1vdmVBdHRyaWJ1dGUgb2YgU1ZHJywgZnVuY3Rpb24oKXtcbiAgZG9tLnNldE5hbWVzcGFjZShzdmdOYW1lc3BhY2UpO1xuICB2YXIgbm9kZSA9IGRvbS5jcmVhdGVFbGVtZW50KCdzdmcnKTtcbiAgZG9tLnNldEF0dHJpYnV0ZShub2RlLCAndmlld0JveCcsICcwIDAgMTAwIDEwMCcpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxzdmcgdmlld0JveD1cIjAgMCAxMDAgMTAwXCI+PC9zdmc+JywgJ3ByZWNvbmQgLSBhdHRyaWJ1dGUgZXhpc3RzJyk7XG5cbiAgZG9tLnJlbW92ZUF0dHJpYnV0ZShub2RlLCAndmlld0JveCcpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxzdmc+PC9zdmc+JywgJ2F0dHJpYnV0ZSB3YXMgcmVtb3ZlZCcpO1xufSk7XG5cbnRlc3QoJyNzZXRQcm9wZXJ0eScsIGZ1bmN0aW9uKCl7XG4gIHZhciBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBkb20uc2V0UHJvcGVydHkobm9kZSwgJ2lkJywgJ3N1cGVyLXRhZycpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXYgaWQ9XCJzdXBlci10YWdcIj48L2Rpdj4nKTtcbiAgZG9tLnNldFByb3BlcnR5KG5vZGUsICdpZCcsIG51bGwpO1xuICBvayhub2RlLmdldEF0dHJpYnV0ZSgnaWQnKSAhPT0gJ3N1cGVyLXRhZycsICdudWxsIHByb3BlcnR5IHNldHMgdG8gdGhlIHByb3BlcnR5Jyk7XG5cbiAgbm9kZSA9IGRvbS5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZG9tLnNldFByb3BlcnR5KG5vZGUsICdkYXRhLWZ1bicsICd3aG9vcGllJyk7XG4gIGVxdWFsSFRNTChub2RlLCAnPGRpdiBkYXRhLWZ1bj1cIndob29waWVcIj48L2Rpdj4nKTtcbiAgZG9tLnNldFByb3BlcnR5KG5vZGUsICdkYXRhLWZ1bicsIG51bGwpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXY+PC9kaXY+JywgJ251bGwgYXR0cmlidXRlIHJlbW92ZXMgdGhlIGF0dHJpYnV0ZScpO1xuXG4gIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgZG9tLnNldFByb3BlcnR5KG5vZGUsICdkaXNhYmxlZCcsIHRydWUpO1xuICBlcXVhbChub2RlLmRpc2FibGVkLCB0cnVlKTtcbiAgZG9tLnNldFByb3BlcnR5KG5vZGUsICdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgZXF1YWwobm9kZS5kaXNhYmxlZCwgZmFsc2UpO1xuXG4gIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRvbS5zZXRQcm9wZXJ0eShub2RlLCAnc3R5bGUnLCAnY29sb3I6IHJlZDsnKTtcbiAgZXF1YWxIVE1MKG5vZGUsICc8ZGl2IHN0eWxlPVwiY29sb3I6IHJlZDtcIj48L2Rpdj4nKTtcbn0pO1xuXG50ZXN0KCcjc2V0UHJvcGVydHkgcmVtb3ZlcyBhdHRyIHdpdGggdW5kZWZpbmVkJywgZnVuY3Rpb24oKXtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRvbS5zZXRQcm9wZXJ0eShub2RlLCAnZGF0YS1mdW4nLCAnd2hvb3BpZScpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXYgZGF0YS1mdW49XCJ3aG9vcGllXCI+PC9kaXY+Jyk7XG4gIGRvbS5zZXRQcm9wZXJ0eShub2RlLCAnZGF0YS1mdW4nLCB1bmRlZmluZWQpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXY+PC9kaXY+JywgJ3VuZGVmaW5lZCBhdHRyaWJ1dGUgcmVtb3ZlcyB0aGUgYXR0cmlidXRlJyk7XG59KTtcblxudGVzdCgnI3NldFByb3BlcnR5IHVzZXMgc2V0QXR0cmlidXRlIGZvciBzcGVjaWFsIG5vbi1jb21wbGlhbnQgZWxlbWVudCBwcm9wcycsIGZ1bmN0aW9uKCkge1xuICBleHBlY3QoNik7XG5cbiAgdmFyIGJhZFBhaXJzID0gW1xuICAgIHsgdGFnTmFtZTogJ2J1dHRvbicsIGtleTogJ3R5cGUnLCB2YWx1ZTogJ3N1Ym1pdCcsIHNlbGZDbG9zaW5nOiBmYWxzZSB9LFxuICAgIHsgdGFnTmFtZTogJ2lucHV0Jywga2V5OiAndHlwZScsIHZhbHVlOiAneC1ub3Qtc3VwcG9ydGVkJywgc2VsZkNsb3Npbmc6IHRydWUgfVxuICBdO1xuXG4gIGJhZFBhaXJzLmZvckVhY2goZnVuY3Rpb24ocGFpcikge1xuICAgIHZhciBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQocGFpci50YWdOYW1lKTtcbiAgICB2YXIgc2V0QXR0cmlidXRlID0gbm9kZS5zZXRBdHRyaWJ1dGU7XG5cbiAgICBub2RlLnNldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uKGF0dHJOYW1lLCB2YWx1ZSkge1xuICAgICAgZXF1YWwoYXR0ck5hbWUsIHBhaXIua2V5LCAnc2V0QXR0cmlidXRlIGNhbGxlZCB3aXRoIGNvcnJlY3QgYXR0ck5hbWUnKTtcbiAgICAgIGVxdWFsKHZhbHVlLCBwYWlyLnZhbHVlLCAnc2V0QXR0cmlidXRlIGNhbGxlZCB3aXRoIGNvcnJlY3QgdmFsdWUnKTtcbiAgICAgIHJldHVybiBzZXRBdHRyaWJ1dGUuY2FsbCh0aGlzLCBhdHRyTmFtZSwgdmFsdWUpO1xuICAgIH07XG5cbiAgICBkb20uc2V0UHJvcGVydHkobm9kZSwgcGFpci5rZXksIHBhaXIudmFsdWUpO1xuXG4gICAgLy8gZS5nLiA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIj48L2J1dHRvbj5cbiAgICB2YXIgZXhwZWN0ZWQgPSAnPCcgKyBwYWlyLnRhZ05hbWUgKyAnICcgKyBwYWlyLmtleSArICc9XCInICsgcGFpci52YWx1ZSArICdcIj4nO1xuICAgIGlmIChwYWlyLnNlbGZDbG9zaW5nID09PSBmYWxzZSkge1xuICAgICAgZXhwZWN0ZWQgKz0gJzwvJyArIHBhaXIudGFnTmFtZSArICc+JztcbiAgICB9XG5cbiAgICBlcXVhbEhUTUwobm9kZSwgZXhwZWN0ZWQsICdvdXRwdXQgaHRtbCBpcyBjb3JyZWN0Jyk7XG4gIH0pO1xufSk7XG5cbnRlc3QoJyNhZGRDbGFzc2VzJywgZnVuY3Rpb24oKXtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRvbS5hZGRDbGFzc2VzKG5vZGUsIFsnc3VwZXItZnVuJ10pO1xuICBlcXVhbChub2RlLmNsYXNzTmFtZSwgJ3N1cGVyLWZ1bicpO1xuICBkb20uYWRkQ2xhc3Nlcyhub2RlLCBbJ3N1cGVyLWZ1biddKTtcbiAgZXF1YWwobm9kZS5jbGFzc05hbWUsICdzdXBlci1mdW4nKTtcbiAgZG9tLmFkZENsYXNzZXMobm9kZSwgWydzdXBlci1ibGFzdCddKTtcbiAgZXF1YWwobm9kZS5jbGFzc05hbWUsICdzdXBlci1mdW4gc3VwZXItYmxhc3QnKTtcbiAgZG9tLmFkZENsYXNzZXMobm9kZSwgWydiYWNvbicsICdoYW0nXSk7XG4gIGVxdWFsKG5vZGUuY2xhc3NOYW1lLCAnc3VwZXItZnVuIHN1cGVyLWJsYXN0IGJhY29uIGhhbScpO1xufSk7XG5cbnRlc3QoJyNyZW1vdmVDbGFzc2VzJywgZnVuY3Rpb24oKXtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIG5vZGUuc2V0QXR0cmlidXRlKCdjbGFzcycsICd0aGlzLWNsYXNzIHRoYXQtY2xhc3MnKTtcbiAgZG9tLnJlbW92ZUNsYXNzZXMobm9kZSwgWyd0aGlzLWNsYXNzJ10pO1xuICBlcXVhbChub2RlLmNsYXNzTmFtZSwgJ3RoYXQtY2xhc3MnKTtcbiAgZG9tLnJlbW92ZUNsYXNzZXMobm9kZSwgWyd0aGlzLWNsYXNzJ10pO1xuICBlcXVhbChub2RlLmNsYXNzTmFtZSwgJ3RoYXQtY2xhc3MnKTtcbiAgZG9tLnJlbW92ZUNsYXNzZXMobm9kZSwgWyd0aGF0LWNsYXNzJ10pO1xuICBlcXVhbChub2RlLmNsYXNzTmFtZSwgJycpO1xuICBub2RlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnd29vcCBtb29wIGplZXAnKTtcbiAgZG9tLnJlbW92ZUNsYXNzZXMobm9kZSwgWydtb29wJywgJ2plZXAnXSk7XG4gIGVxdWFsKG5vZGUuY2xhc3NOYW1lLCAnd29vcCcpO1xufSk7XG5cbnRlc3QoJyNjcmVhdGVFbGVtZW50IG9mIHRyIHdpdGggY29udGV4dHVhbCB0YWJsZSBlbGVtZW50JywgZnVuY3Rpb24oKXtcbiAgdmFyIHRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyksXG4gICAgICBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ3RyJywgdGFibGVFbGVtZW50KTtcbiAgZXF1YWwobm9kZS50YWdOYW1lLCAnVFInKTtcbiAgZXF1YWxIVE1MKG5vZGUsICc8dHI+PC90cj4nKTtcbn0pO1xuXG50ZXN0KCcjY3JlYXRlTW9ycGggaGFzIG9wdGlvbmFsIGNvbnRleHR1YWxFbGVtZW50JywgZnVuY3Rpb24oKXtcbiAgdmFyIHBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXG4gICAgICBzdGFydCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSxcbiAgICAgIGVuZCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSxcbiAgICAgIG1vcnBoLCB0aHJvd247XG5cbiAgdHJ5IHtcbiAgICBtb3JwaCA9IGRvbS5jcmVhdGVNb3JwaChmcmFnbWVudCwgc3RhcnQsIGVuZCwgZnJhZ21lbnQpO1xuICB9IGNhdGNoKGUpIHtcbiAgICB0aHJvd24gPSB0cnVlO1xuICB9XG4gIG9rKHRocm93biwgJ0V4Y2VwdGlvbiB0aHJvd24gd2hlbiBhIGZyYWdtZW50IGlzIHByb3ZpZGVkIGZvciBjb250ZXh0dWFsRWxlbWVudCcpO1xuXG4gIG1vcnBoID0gZG9tLmNyZWF0ZU1vcnBoKGZyYWdtZW50LCBzdGFydCwgZW5kLCBwYXJlbnQpO1xuICBlcXVhbChtb3JwaC5jb250ZXh0dWFsRWxlbWVudCwgcGFyZW50LCBcIm1vcnBoJ3MgY29udGV4dHVhbEVsZW1lbnQgaXMgcGFyZW50XCIpO1xuXG4gIG1vcnBoID0gZG9tLmNyZWF0ZU1vcnBoKHBhcmVudCwgc3RhcnQsIGVuZCk7XG4gIGVxdWFsKG1vcnBoLmNvbnRleHR1YWxFbGVtZW50LCBwYXJlbnQsIFwibW9ycGgncyBjb250ZXh0dWFsRWxlbWVudCBpcyBwYXJlbnRcIik7XG59KTtcblxudGVzdCgnI2FwcGVuZE1vcnBoJywgZnVuY3Rpb24oKXtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICBkb20uYXBwZW5kVGV4dChlbGVtZW50LCAnYScpO1xuICB2YXIgbW9ycGggPSBkb20uYXBwZW5kTW9ycGgoZWxlbWVudCk7XG4gIGRvbS5hcHBlbmRUZXh0KGVsZW1lbnQsICdjJyk7XG5cbiAgbW9ycGguc2V0Q29udGVudCgnYicpO1xuXG4gIGVxdWFsKGVsZW1lbnQuaW5uZXJIVE1MLCAnYWJjJyk7XG59KTtcblxudGVzdCgnI2luc2VydE1vcnBoQmVmb3JlJywgZnVuY3Rpb24oKXtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICBkb20uYXBwZW5kVGV4dChlbGVtZW50LCAnYScpO1xuICB2YXIgYyA9IGRvbS5hcHBlbmRUZXh0KGVsZW1lbnQsICdjJyk7XG4gIHZhciBtb3JwaCA9IGRvbS5pbnNlcnRNb3JwaEJlZm9yZShlbGVtZW50LCBjKTtcblxuICBtb3JwaC5zZXRDb250ZW50KCdiJyk7XG5cbiAgZXF1YWwoZWxlbWVudC5pbm5lckhUTUwsICdhYmMnKTtcbn0pO1xuXG50ZXN0KCcjcGFyc2VIVE1MIGNvbWJpbmF0aW9ucycsIGZ1bmN0aW9uKCl7XG4gIHZhciBwYXJzaW5nQ29tYmluYXRpb25zID0gW1xuICAgIC8vIG9taXR0ZWQgc3RhcnQgdGFnc1xuICAgIC8vXG4gICAgWyd0YWJsZScsICc8dHI+PHRkPllvPC90ZD48L3RyPicsICdUUiddLFxuICAgIFsndGFibGUnLCAnPHRib2R5Pjx0cj48L3RyPjwvdGJvZHk+JywgJ1RCT0RZJ10sXG4gICAgWyd0YWJsZScsICc8Y29sPjwvY29sPicsICdDT0wnXSxcbiAgICAvLyBlbGVtZW50cyB3aXRoIGJyb2tlbiBpbm5lckhUTUwgaW4gSUU5IGFuZCBkb3duXG4gICAgWydzZWxlY3QnLCAnPG9wdGlvbj48L29wdGlvbj4nLCAnT1BUSU9OJ10sXG4gICAgWydjb2xncm91cCcsICc8Y29sPjwvY29sPicsICdDT0wnXSxcbiAgICBbJ3Rib2R5JywgJzx0cj48L3RyPicsICdUUiddLFxuICAgIFsndGZvb3QnLCAnPHRyPjwvdHI+JywgJ1RSJ10sXG4gICAgWyd0aGVhZCcsICc8dHI+PC90cj4nLCAnVFInXSxcbiAgICBbJ3RyJywgJzx0ZD48L3RkPicsICdURCddLFxuICAgIFsnZGl2JywgJzxzY3JpcHQ+PC9zY3JpcHQ+JywgJ1NDUklQVCddXG4gIF07XG5cbiAgdmFyIGNvbnRleHRUYWcsIGNvbnRlbnQsIGV4cGVjdGVkVGFnTmFtZSwgY29udGV4dEVsZW1lbnQsIG5vZGVzO1xuICBmb3IgKHZhciBwPTA7cDxwYXJzaW5nQ29tYmluYXRpb25zLmxlbmd0aDtwKyspIHtcbiAgICBjb250ZXh0VGFnID0gcGFyc2luZ0NvbWJpbmF0aW9uc1twXVswXTtcbiAgICBjb250ZW50ID0gcGFyc2luZ0NvbWJpbmF0aW9uc1twXVsxXTtcbiAgICBleHBlY3RlZFRhZ05hbWUgPSBwYXJzaW5nQ29tYmluYXRpb25zW3BdWzJdO1xuXG4gICAgY29udGV4dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGNvbnRleHRUYWcpO1xuICAgIG5vZGVzID0gZG9tLnBhcnNlSFRNTChjb250ZW50LCBjb250ZXh0RWxlbWVudCkuY2hpbGROb2RlcztcbiAgICBlcXVhbChcbiAgICAgIG5vZGVzWzBdLnRhZ05hbWUsIGV4cGVjdGVkVGFnTmFtZSxcbiAgICAgICcjcGFyc2VIVE1MIG9mICcrY29udGVudCsnIHJldHVybnMgYSAnK2V4cGVjdGVkVGFnTmFtZSsnIGluc2lkZSBhICcrY29udGV4dFRhZysnIGNvbnRleHQnICk7XG4gIH1cbn0pO1xuXG50ZXN0KCcjcGFyc2VIVE1MIG9mIHNjcmlwdCB0aGVuIHRyIGluc2lkZSB0YWJsZSBjb250ZXh0IHdyYXBzIHRoZSB0ciBpbiBhIHRib2R5JywgZnVuY3Rpb24oKXtcbiAgdmFyIHRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyksXG4gICAgICBub2RlcyA9IGRvbS5wYXJzZUhUTUwoJzxzY3JpcHQ+PC9zY3JpcHQ+PHRyPjx0ZD5ZbzwvdGQ+PC90cj4nLCB0YWJsZUVsZW1lbnQpLmNoaWxkTm9kZXM7XG4gIC8vIFRoZSBIVE1MIHNwZWMgc3VnZ2VzdHMgdGhlIGZpcnN0IGl0ZW0gbXVzdCBiZSB0aGUgY2hpbGQgb2ZcbiAgLy8gdGhlIG9taXR0YWJsZSBzdGFydCB0YWcuIEhlcmUgc2NyaXB0IGlzIHRoZSBmaXJzdCBjaGlsZCwgc28gbm8tZ28uXG4gIGVxdWFsKG5vZGVzLmxlbmd0aCwgMiwgJ0xlYWRpbmcgc2NyaXB0IHRhZyBjb3JydXB0cycpO1xuICBlcXVhbChub2Rlc1swXS50YWdOYW1lLCAnU0NSSVBUJyk7XG4gIGVxdWFsKG5vZGVzWzFdLnRhZ05hbWUsICdUQk9EWScpO1xufSk7XG5cbnRlc3QoJyNwYXJzZUhUTUwgb2Ygc2VsZWN0IGFsbG93cyB0aGUgaW5pdGlhbCBpbXBsaWNpdCBvcHRpb24gc2VsZWN0aW9uIHRvIHJlbWFpbicsIGZ1bmN0aW9uKCl7XG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdmFyIHNlbGVjdCA9IGRvbS5wYXJzZUhUTUwoJzxzZWxlY3Q+PG9wdGlvbj48L29wdGlvbj48L3NlbGVjdD4nLCBkaXYpLmNoaWxkTm9kZXNbMF07XG5cbiAgb2soc2VsZWN0LmNoaWxkTm9kZXNbMF0uc2VsZWN0ZWQsICdmaXJzdCBlbGVtZW50IGlzIHNlbGVjdGVkJyk7XG59KTtcblxudGVzdCgnI3BhcnNlSFRNTCBvZiBvcHRpb25zIHJlbW92ZXMgYW4gaW1wbGljaXQgc2VsZWN0aW9uJywgZnVuY3Rpb24oKXtcbiAgdmFyIHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpO1xuICB2YXIgb3B0aW9ucyA9IGRvbS5wYXJzZUhUTUwoXG4gICAgJzxvcHRpb24gdmFsdWU9XCIxXCI+PC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cIjJcIj48L29wdGlvbj4nLFxuICAgIHNlbGVjdFxuICApLmNoaWxkTm9kZXM7XG5cbiAgb2soIW9wdGlvbnNbMF0uc2VsZWN0ZWQsICdmaXJzdCBlbGVtZW50IGlzIG5vdCBzZWxlY3RlZCcpO1xuICBvayghb3B0aW9uc1sxXS5zZWxlY3RlZCwgJ3NlY29uZCBlbGVtZW50IGlzIG5vdCBzZWxlY3RlZCcpO1xufSk7XG5cbnRlc3QoJyNwYXJzZUhUTUwgb2Ygb3B0aW9ucyBsZWF2ZXMgYW4gZXhwbGljaXQgZmlyc3Qgc2VsZWN0aW9uJywgZnVuY3Rpb24oKXtcbiAgdmFyIHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpO1xuICB2YXIgb3B0aW9ucyA9IGRvbS5wYXJzZUhUTUwoXG4gICAgJzxvcHRpb24gdmFsdWU9XCIxXCIgc2VsZWN0ZWQ+PC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cIjJcIj48L29wdGlvbj4nLFxuICAgIHNlbGVjdFxuICApLmNoaWxkTm9kZXM7XG5cbiAgb2sob3B0aW9uc1swXS5zZWxlY3RlZCwgJ2ZpcnN0IGVsZW1lbnQgaXMgc2VsZWN0ZWQnKTtcbiAgb2soIW9wdGlvbnNbMV0uc2VsZWN0ZWQsICdzZWNvbmQgZWxlbWVudCBpcyBub3Qgc2VsZWN0ZWQnKTtcbn0pO1xuXG50ZXN0KCcjcGFyc2VIVE1MIG9mIG9wdGlvbnMgbGVhdmVzIGFuIGV4cGxpY2l0IHNlY29uZCBzZWxlY3Rpb24nLCBmdW5jdGlvbigpe1xuICB2YXIgc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VsZWN0Jyk7XG4gIHZhciBvcHRpb25zID0gZG9tLnBhcnNlSFRNTChcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjFcIj48L29wdGlvbj48b3B0aW9uIHZhbHVlPVwiMlwiIHNlbGVjdGVkPVwic2VsZWN0ZWRcIj48L29wdGlvbj4nLFxuICAgIHNlbGVjdFxuICApLmNoaWxkTm9kZXM7XG5cbiAgb2soIW9wdGlvbnNbMF0uc2VsZWN0ZWQsICdmaXJzdCBlbGVtZW50IGlzIG5vdCBzZWxlY3RlZCcpO1xuICBvayhvcHRpb25zWzFdLnNlbGVjdGVkLCAnc2Vjb25kIGVsZW1lbnQgaXMgc2VsZWN0ZWQnKTtcbn0pO1xuXG50ZXN0KCcjcGFyc2VIVE1MIG9mIHNjcmlwdCB0aGVuIHRyIGluc2lkZSB0Ym9keSBjb250ZXh0JywgZnVuY3Rpb24oKXtcbiAgdmFyIHRib2R5RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Rib2R5JyksXG4gICAgICBub2RlcyA9IGRvbS5wYXJzZUhUTUwoJzxzY3JpcHQ+PC9zY3JpcHQ+PHRyPjx0ZD5ZbzwvdGQ+PC90cj4nLCB0Ym9keUVsZW1lbnQpLmNoaWxkTm9kZXM7XG4gIGVxdWFsKG5vZGVzLmxlbmd0aCwgMiwgJ0xlYWRpbmcgc2NyaXB0IHRhZyBjb3JydXB0cycpO1xuICBlcXVhbChub2Rlc1swXS50YWdOYW1lLCAnU0NSSVBUJyk7XG4gIGVxdWFsKG5vZGVzWzFdLnRhZ05hbWUsICdUUicpO1xufSk7XG5cbnRlc3QoJyNwYXJzZUhUTUwgd2l0aCByZXRhaW5zIHdoaXRlc3BhY2UnLCBmdW5jdGlvbigpe1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHZhciBub2RlcyA9IGRvbS5wYXJzZUhUTUwoJ2xlYWRpbmc8c2NyaXB0IGlkPVwiZmlyc3RcIj48L3NjcmlwdD4gPHNjcmlwdCBpZD1cInNlY29uZFwiPjwvc2NyaXB0PjxkaXY+PHNjcmlwdD48L3NjcmlwdD4gPHNjcmlwdD48L3NjcmlwdD4sIGluZGVlZC48L2Rpdj4nLCBkaXYpLmNoaWxkTm9kZXM7XG4gIGVxdWFsKG5vZGVzWzBdLmRhdGEsICdsZWFkaW5nJyk7XG4gIGVxdWFsKG5vZGVzWzFdLnRhZ05hbWUsICdTQ1JJUFQnKTtcbiAgZXF1YWwobm9kZXNbMl0uZGF0YSwgJyAnKTtcbiAgZXF1YWwobm9kZXNbM10udGFnTmFtZSwgJ1NDUklQVCcpO1xuICBlcXVhbChub2Rlc1s0XS50YWdOYW1lLCAnRElWJyk7XG4gIGVxdWFsKG5vZGVzWzRdLmNoaWxkTm9kZXNbMF0udGFnTmFtZSwgJ1NDUklQVCcpO1xuICBlcXVhbChub2Rlc1s0XS5jaGlsZE5vZGVzWzFdLmRhdGEsICcgJyk7XG4gIGVxdWFsKG5vZGVzWzRdLmNoaWxkTm9kZXNbMl0udGFnTmFtZSwgJ1NDUklQVCcpO1xuICBlcXVhbChub2Rlc1s0XS5jaGlsZE5vZGVzWzNdLmRhdGEsICcsIGluZGVlZC4nKTtcbn0pO1xuXG50ZXN0KCcjcGFyc2VIVE1MIHdpdGggcmV0YWlucyB3aGl0ZXNwYWNlIG9mIHRvcCBlbGVtZW50JywgZnVuY3Rpb24oKXtcbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB2YXIgbm9kZXMgPSBkb20ucGFyc2VIVE1MKCc8c3Bhbj5oZWxsbyA8c2NyaXB0IGlkPVwiZmlyc3RcIj48L3NjcmlwdD4geWVhaDwvc3Bhbj4nLCBkaXYpLmNoaWxkTm9kZXM7XG4gIGVxdWFsKG5vZGVzWzBdLnRhZ05hbWUsICdTUEFOJyk7XG4gIGVxdWFsSFRNTChub2RlcywgJzxzcGFuPmhlbGxvIDxzY3JpcHQgaWQ9XCJmaXJzdFwiPjwvc2NyaXB0PiB5ZWFoPC9zcGFuPicpO1xufSk7XG5cbnRlc3QoJyNwYXJzZUhUTUwgd2l0aCByZXRhaW5zIHdoaXRlc3BhY2UgYWZ0ZXIgc2NyaXB0JywgZnVuY3Rpb24oKXtcbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB2YXIgbm9kZXMgPSBkb20ucGFyc2VIVE1MKCc8c3Bhbj5oZWxsbzwvc3Bhbj48c2NyaXB0IGlkPVwiZmlyc3RcIj48L3NjcmlwdD48c3Bhbj48c2NyaXB0Pjwvc2NyaXB0PiBrd29vcDwvc3Bhbj4nLCBkaXYpLmNoaWxkTm9kZXM7XG4gIGVxdWFsKG5vZGVzWzBdLnRhZ05hbWUsICdTUEFOJyk7XG4gIGVxdWFsKG5vZGVzWzFdLnRhZ05hbWUsICdTQ1JJUFQnKTtcbiAgZXF1YWwobm9kZXNbMl0udGFnTmFtZSwgJ1NQQU4nKTtcbiAgZXF1YWxIVE1MKG5vZGVzLCAnPHNwYW4+aGVsbG88L3NwYW4+PHNjcmlwdCBpZD1cImZpcnN0XCI+PC9zY3JpcHQ+PHNwYW4+PHNjcmlwdD48L3NjcmlwdD4ga3dvb3A8L3NwYW4+Jyk7XG59KTtcblxudGVzdCgnI3BhcnNlSFRNTCBvZiBudW1iZXInLCBmdW5jdGlvbigpe1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHZhciBub2RlcyA9IGRvbS5wYXJzZUhUTUwoNSwgZGl2KS5jaGlsZE5vZGVzO1xuICBlcXVhbChub2Rlc1swXS5kYXRhLCAnNScpO1xuICBlcXVhbEhUTUwobm9kZXMsICc1Jyk7XG59KTtcblxudGVzdCgnI3Byb3RvY29sRm9yVVJMJywgZnVuY3Rpb24oKSB7XG4gIHZhciBwcm90b2NvbCA9IGRvbS5wcm90b2NvbEZvclVSTChcImh0dHA6Ly93d3cuZW1iZXJqcy5jb21cIik7XG4gIGVxdWFsKHByb3RvY29sLCBcImh0dHA6XCIpO1xuXG4gIC8vIEluaGVyaXQgcHJvdG9jb2wgZnJvbSBkb2N1bWVudCBpZiB1bnBhcnNlYWJsZVxuICBwcm90b2NvbCA9IGRvbS5wcm90b2NvbEZvclVSTChcIiAgIGphdmFzY3JpcHQ6bHVsemhhY2tlZCgpXCIpO1xuICAvKmpzaGludCBzY3JpcHR1cmw6dHJ1ZSovXG4gIGVxdWFsKHByb3RvY29sLCBcImphdmFzY3JpcHQ6XCIpO1xufSk7XG5cbnRlc3QoJyNjbG9uZU5vZGUgc2hhbGxvdycsIGZ1bmN0aW9uKCl7XG4gIHZhciBkaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgZGl2RWxlbWVudC5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpICk7XG5cbiAgdmFyIG5vZGUgPSBkb20uY2xvbmVOb2RlKGRpdkVsZW1lbnQsIGZhbHNlKTtcblxuICBlcXVhbChub2RlLnRhZ05hbWUsICdESVYnKTtcbiAgZXF1YWxIVE1MKG5vZGUsICc8ZGl2PjwvZGl2PicpO1xufSk7XG5cbnRlc3QoJyNjbG9uZU5vZGUgZGVlcCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBkaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgZGl2RWxlbWVudC5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpICk7XG5cbiAgdmFyIG5vZGUgPSBkb20uY2xvbmVOb2RlKGRpdkVsZW1lbnQsIHRydWUpO1xuXG4gIGVxdWFsKG5vZGUudGFnTmFtZSwgJ0RJVicpO1xuICBlcXVhbEhUTUwobm9kZSwgJzxkaXY+PHNwYW4+PC9zcGFuPjwvZGl2PicpO1xufSk7XG5cbnRlc3QoJ2RvbSBub2RlIGhhcyBlbXB0eSB0ZXh0IGFmdGVyIGNsb25pbmcgYW5kIGVuc3VyaW5nQmxhbmtUZXh0Tm9kZScsIGZ1bmN0aW9uKCl7XG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICBkaXYuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSApO1xuXG4gIHZhciBjbG9uZWREaXYgPSBkb20uY2xvbmVOb2RlKGRpdiwgdHJ1ZSk7XG5cbiAgZXF1YWwoY2xvbmVkRGl2Lm5vZGVUeXBlLCAxKTtcbiAgZXF1YWxIVE1MKGNsb25lZERpdiwgJzxkaXY+PC9kaXY+Jyk7XG4gIC8vIElFJ3MgbmF0aXZlIGNsb25lTm9kZSBkcm9wcyBibGFuayBzdHJpbmcgdGV4dFxuICAvLyBub2Rlcy4gQXNzZXJ0IHJlcGFpckNsb25lZE5vZGUgYnJpbmdzIGJhY2sgdGhlIGJsYW5rXG4gIC8vIHRleHQgbm9kZS5cbiAgZG9tLnJlcGFpckNsb25lZE5vZGUoY2xvbmVkRGl2LCBbMF0pO1xuICBlcXVhbChjbG9uZWREaXYuY2hpbGROb2Rlcy5sZW5ndGgsIDEpO1xuICBlcXVhbChjbG9uZWREaXYuY2hpbGROb2Rlc1swXS5ub2RlVHlwZSwgMyk7XG59KTtcblxudGVzdCgnZG9tIG5vZGUgaGFzIGVtcHR5IHN0YXJ0IHRleHQgYWZ0ZXIgY2xvbmluZyBhbmQgZW5zdXJpbmdCbGFua1RleHROb2RlJywgZnVuY3Rpb24oKXtcbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gIGRpdi5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpICk7XG4gIGRpdi5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpICk7XG5cbiAgdmFyIGNsb25lZERpdiA9IGRvbS5jbG9uZU5vZGUoZGl2LCB0cnVlKTtcblxuICBlcXVhbChjbG9uZWREaXYubm9kZVR5cGUsIDEpO1xuICBlcXVhbEhUTUwoY2xvbmVkRGl2LCAnPGRpdj48c3Bhbj48L3NwYW4+PC9kaXY+Jyk7XG4gIC8vIElFJ3MgbmF0aXZlIGNsb25lTm9kZSBkcm9wcyBibGFuayBzdHJpbmcgdGV4dFxuICAvLyBub2Rlcy4gQXNzZXJ0IGRlbm9ybWFsaXplVGV4dCBicmluZ3MgYmFjayB0aGUgYmxhbmtcbiAgLy8gdGV4dCBub2RlLlxuICBkb20ucmVwYWlyQ2xvbmVkTm9kZShjbG9uZWREaXYsIFswXSk7XG4gIGVxdWFsKGNsb25lZERpdi5jaGlsZE5vZGVzLmxlbmd0aCwgMik7XG4gIGVxdWFsKGNsb25lZERpdi5jaGlsZE5vZGVzWzBdLm5vZGVUeXBlLCAzKTtcbn0pO1xuXG50ZXN0KCdkb20gbm9kZSBjaGVja2VkIGFmdGVyIGNsb25pbmcgYW5kIGVuc3VyaW5nQ2hlY2tlZCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cbiAgaW5wdXQuc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcbiAgb2soaW5wdXQuY2hlY2tlZCwgJ2lucHV0IGlzIGNoZWNrZWQnKTtcblxuICB2YXIgY2xvbmUgPSBkb20uY2xvbmVOb2RlKGlucHV0LCBmYWxzZSk7XG5cbiAgLy8gSUUncyBuYXRpdmUgY2xvbmVOb2RlIGNvcGllcyBjaGVja2VkIGF0dHJpYnV0ZXMgYnV0XG4gIC8vIG5vdCB0aGUgY2hlY2tlZCBwcm9wZXJ0eSBvZiB0aGUgRE9NIG5vZGUuXG4gIGRvbS5yZXBhaXJDbG9uZWROb2RlKGNsb25lLCBbXSwgdHJ1ZSk7XG5cbiAgaXNDaGVja2VkSW5wdXRIVE1MKGNsb25lLCAnPGlucHV0IGNoZWNrZWQ9XCJjaGVja2VkXCI+Jyk7XG4gIG9rKGNsb25lLmNoZWNrZWQsICdjbG9uZSBpcyBjaGVja2VkJyk7XG59KTtcblxuaWYgKCduYW1lc3BhY2VVUkknIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKSB7XG5cblFVbml0Lm1vZHVsZSgnRE9NIEhlbHBlciBuYW1lc3BhY2VzJywge1xuICBiZWZvcmVFYWNoOiBmdW5jdGlvbigpIHtcbiAgICBkb20gPSBuZXcgRE9NSGVscGVyKCk7XG4gIH0sXG4gIGFmdGVyRWFjaDogZnVuY3Rpb24oKSB7XG4gICAgZG9tID0gbnVsbDtcbiAgfVxufSk7XG5cbnRlc3QoJyNjcmVhdGVFbGVtZW50IGRpdiBpcyB4aHRtbCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlcXVhbChub2RlLm5hbWVzcGFjZVVSSSwgeGh0bWxOYW1lc3BhY2UpO1xufSk7XG5cbnRlc3QoJyNjcmVhdGVFbGVtZW50IG9mIHN2ZyB3aXRoIHN2ZyBuYW1lc3BhY2UnLCBmdW5jdGlvbigpe1xuICBkb20uc2V0TmFtZXNwYWNlKHN2Z05hbWVzcGFjZSk7XG4gIHZhciBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ3N2ZycpO1xuICBlcXVhbChub2RlLnRhZ05hbWUsICdzdmcnKTtcbiAgZXF1YWwobm9kZS5uYW1lc3BhY2VVUkksIHN2Z05hbWVzcGFjZSk7XG59KTtcblxudGVzdCgnI2NyZWF0ZUVsZW1lbnQgb2YgcGF0aCB3aXRoIGRldGVjdGVkIHN2ZyBjb250ZXh0dWFsIGVsZW1lbnQnLCBmdW5jdGlvbigpe1xuICBkb20uc2V0TmFtZXNwYWNlKHN2Z05hbWVzcGFjZSk7XG4gIHZhciBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ3BhdGgnKTtcbiAgZXF1YWwobm9kZS50YWdOYW1lLCAncGF0aCcpO1xuICBlcXVhbChub2RlLm5hbWVzcGFjZVVSSSwgc3ZnTmFtZXNwYWNlKTtcbn0pO1xuXG50ZXN0KCcjY3JlYXRlRWxlbWVudCBvZiBwYXRoIHdpdGggc3ZnIGNvbnRleHR1YWwgZWxlbWVudCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ3BhdGgnLCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnTmFtZXNwYWNlLCAnc3ZnJykpO1xuICBlcXVhbChub2RlLnRhZ05hbWUsICdwYXRoJyk7XG4gIGVxdWFsKG5vZGUubmFtZXNwYWNlVVJJLCBzdmdOYW1lc3BhY2UpO1xufSk7XG5cbnRlc3QoJyNjcmVhdGVFbGVtZW50IG9mIHN2ZyB3aXRoIGRpdiBuYW1lc3BhY2UnLCBmdW5jdGlvbigpe1xuICB2YXIgbm9kZSA9IGRvbS5jcmVhdGVFbGVtZW50KCdzdmcnLCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XG4gIGVxdWFsKG5vZGUudGFnTmFtZSwgJ3N2ZycpO1xuICBlcXVhbChub2RlLm5hbWVzcGFjZVVSSSwgc3ZnTmFtZXNwYWNlKTtcbn0pO1xuXG50ZXN0KCcjZ2V0RWxlbWVudEJ5SWQgd2l0aCBkaWZmZXJlbnQgcm9vdCBub2RlJywgZnVuY3Rpb24oKSB7XG4gIHZhciBkb2MgPSBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVEb2N1bWVudCh4aHRtbE5hbWVzcGFjZSwgJ2h0bWwnLCBudWxsKSxcbiAgICAgIGJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoeGh0bWxOYW1lc3BhY2UsICdib2R5JyksXG4gICAgICBwYXJlbnROb2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgY2hpbGROb2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gIGRvYy5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoYm9keSk7XG4gIGRvbS5zZXRBdHRyaWJ1dGUocGFyZW50Tm9kZSwgJ2lkJywgJ3BhcmVudCcpO1xuICBkb20uc2V0QXR0cmlidXRlKGNoaWxkTm9kZSwgJ2lkJywgJ2NoaWxkJyk7XG4gIGRvbS5hcHBlbmRDaGlsZChwYXJlbnROb2RlLCBjaGlsZE5vZGUpO1xuICBkb20uYXBwZW5kQ2hpbGQoYm9keSwgcGFyZW50Tm9kZSk7XG4gIGVxdWFsSFRNTChkb20uZ2V0RWxlbWVudEJ5SWQoJ2NoaWxkJywgZG9jKSwgJzxkaXYgaWQ9XCJjaGlsZFwiPjwvZGl2PicpO1xufSk7XG5cbnRlc3QoJyNzZXRQcm9wZXJ0eSB3aXRoIG5hbWVzcGFjZWQgYXR0cmlidXRlcycsIGZ1bmN0aW9uKCkge1xuICB2YXIgbm9kZTtcblxuICBkb20uc2V0TmFtZXNwYWNlKHN2Z05hbWVzcGFjZSk7XG4gIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudCgnc3ZnJyk7XG4gIGRvbS5zZXRQcm9wZXJ0eShub2RlLCAndmlld0JveCcsICcwIDAgMCAwJyk7XG4gIGVxdWFsSFRNTChub2RlLCAnPHN2ZyB2aWV3Qm94PVwiMCAwIDAgMFwiPjwvc3ZnPicpO1xuXG4gIGRvbS5zZXRQcm9wZXJ0eShub2RlLCAneGxpbms6dGl0bGUnLCAnc3VwZXItYmxhc3QnLCB4bGlua05hbWVzcGFjZSk7XG4gIC8vIGNocm9tZSBhZGRzICh4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIikgcHJvcGVydHkgd2hpbGUgb3RoZXJzIGRvbid0XG4gIC8vIHRodXMgZXF1YWxIVE1MIGlzIG5vdCB1c2VmdWxcbiAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmFwcGVuZENoaWxkKG5vZGUpO1xuICAvLyBwaGFudG9tIGpzIG9taXRzIHRoZSBwcmVmaXggc28gd2UgY2FuJ3QgbG9vayBmb3IgeGxpbms6XG4gIG9rKGVsLmlubmVySFRNTC5pbmRleE9mKCd0aXRsZT1cInN1cGVyLWJsYXN0XCInKSA+IDApO1xuXG4gIGRvbS5zZXRQcm9wZXJ0eShub2RlLCAneGxpbms6dGl0bGUnLCBudWxsLCB4bGlua05hbWVzcGFjZSk7XG4gIGVxdWFsKG5vZGUuZ2V0QXR0cmlidXRlKCd4bGluazp0aXRsZScpLCBudWxsLCAnbnMgYXR0ciBpcyByZW1vdmVkJyk7XG59KTtcblxudGVzdChcIiNzZXRQcm9wZXJ0eSByZW1vdmVzIG5hbWVzcGFjZWQgYXR0ciB3aXRoIHVuZGVmaW5lZFwiLCBmdW5jdGlvbigpIHtcbiAgdmFyIG5vZGU7XG5cbiAgbm9kZSA9IGRvbS5jcmVhdGVFbGVtZW50KCdzdmcnKTtcbiAgZG9tLnNldFByb3BlcnR5KG5vZGUsICd4bGluazp0aXRsZScsICdHcmVhdCBUaXRsZScsIHhsaW5rTmFtZXNwYWNlKTtcbiAgZG9tLnNldFByb3BlcnR5KG5vZGUsICd4bGluazp0aXRsZScsIHVuZGVmaW5lZCwgeGxpbmtOYW1lc3BhY2UpO1xuICBlcXVhbChub2RlLmdldEF0dHJpYnV0ZSgneGxpbms6dGl0bGUnKSwgdW5kZWZpbmVkLCAnbnMgYXR0ciBpcyByZW1vdmVkJyk7XG59KTtcblxuZm9yIChpPTA7aTxmb3JlaWduTmFtZXNwYWNlcy5sZW5ndGg7aSsrKSB7XG4gIGZvcmVpZ25OYW1lc3BhY2UgPSBmb3JlaWduTmFtZXNwYWNlc1tpXTtcblxuICB0ZXN0KCcjY3JlYXRlRWxlbWVudCBvZiBkaXYgd2l0aCAnK2ZvcmVpZ25OYW1lc3BhY2UrJyBjb250ZXh0dWFsIGVsZW1lbnQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBub2RlID0gZG9tLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhzdmdOYW1lc3BhY2UsIGZvcmVpZ25OYW1lc3BhY2UpKTtcbiAgICBlcXVhbChub2RlLnRhZ05hbWUsICdESVYnKTtcbiAgICBlcXVhbChub2RlLm5hbWVzcGFjZVVSSSwgeGh0bWxOYW1lc3BhY2UpO1xuICB9KTsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG5cbiAgdGVzdCgnI3BhcnNlSFRNTCBvZiBkaXYgd2l0aCAnK2ZvcmVpZ25OYW1lc3BhY2UsIGZ1bmN0aW9uKCl7XG4gICAgZG9tLnNldE5hbWVzcGFjZSh4aHRtbE5hbWVzcGFjZSk7XG4gICAgdmFyIGZvcmVpZ25PYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnTmFtZXNwYWNlLCBmb3JlaWduTmFtZXNwYWNlKSxcbiAgICAgICAgbm9kZXMgPSBkb20ucGFyc2VIVE1MKCc8ZGl2PjwvZGl2PicsIGZvcmVpZ25PYmplY3QpLmNoaWxkTm9kZXM7XG4gICAgZXF1YWwobm9kZXNbMF0udGFnTmFtZSwgJ0RJVicpO1xuICAgIGVxdWFsKG5vZGVzWzBdLm5hbWVzcGFjZVVSSSwgeGh0bWxOYW1lc3BhY2UpO1xuICB9KTsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG59XG5cbnRlc3QoJyNwYXJzZUhUTUwgb2YgcGF0aCB3aXRoIHN2ZyBjb250ZXh0dWFsIGVsZW1lbnQnLCBmdW5jdGlvbigpe1xuICBkb20uc2V0TmFtZXNwYWNlKHN2Z05hbWVzcGFjZSk7XG4gIHZhciBzdmdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHN2Z05hbWVzcGFjZSwgJ3N2ZycpLFxuICAgICAgbm9kZXMgPSBkb20ucGFyc2VIVE1MKCc8cGF0aD48L3BhdGg+Jywgc3ZnRWxlbWVudCkuY2hpbGROb2RlcztcbiAgZXF1YWwobm9kZXNbMF0udGFnTmFtZSwgJ3BhdGgnKTtcbiAgZXF1YWwobm9kZXNbMF0ubmFtZXNwYWNlVVJJLCBzdmdOYW1lc3BhY2UpO1xufSk7XG5cbnRlc3QoJyNwYXJzZUhUTUwgb2Ygc3RvcCB3aXRoIGxpbmVhckdyYWRpZW50IGNvbnRleHR1YWwgZWxlbWVudCcsIGZ1bmN0aW9uKCl7XG4gIGRvbS5zZXROYW1lc3BhY2Uoc3ZnTmFtZXNwYWNlKTtcbiAgdmFyIHN2Z0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnTmFtZXNwYWNlLCAnbGluZWFyR3JhZGllbnQnKSxcbiAgICAgIG5vZGVzID0gZG9tLnBhcnNlSFRNTCgnPHN0b3AgLz4nLCBzdmdFbGVtZW50KS5jaGlsZE5vZGVzO1xuICBlcXVhbChub2Rlc1swXS50YWdOYW1lLCAnc3RvcCcpO1xuICBlcXVhbChub2Rlc1swXS5uYW1lc3BhY2VVUkksIHN2Z05hbWVzcGFjZSk7XG59KTtcblxudGVzdCgnI2FkZENsYXNzZXMgb24gU1ZHJywgZnVuY3Rpb24oKXtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnTmFtZXNwYWNlLCAnc3ZnJyk7XG4gIGRvbS5hZGRDbGFzc2VzKG5vZGUsIFsnc3VwZXItZnVuJ10pO1xuICBlcXVhbChub2RlLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSwgJ3N1cGVyLWZ1bicpO1xuICBkb20uYWRkQ2xhc3Nlcyhub2RlLCBbJ3N1cGVyLWZ1biddKTtcbiAgZXF1YWwobm9kZS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJyksICdzdXBlci1mdW4nKTtcbiAgZG9tLmFkZENsYXNzZXMobm9kZSwgWydzdXBlci1ibGFzdCddKTtcbiAgZXF1YWwobm9kZS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJyksICdzdXBlci1mdW4gc3VwZXItYmxhc3QnKTtcbn0pO1xuXG50ZXN0KCcjcmVtb3ZlQ2xhc3NlcyBvbiBTVkcnLCBmdW5jdGlvbigpe1xuICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhzdmdOYW1lc3BhY2UsICdzdmcnKTtcbiAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ3RoaXMtY2xhc3MgdGhhdC1jbGFzcycpO1xuICBkb20ucmVtb3ZlQ2xhc3Nlcyhub2RlLCBbJ3RoaXMtY2xhc3MnXSk7XG4gIGVxdWFsKG5vZGUuZ2V0QXR0cmlidXRlKCdjbGFzcycpLCAndGhhdC1jbGFzcycpO1xuICBkb20ucmVtb3ZlQ2xhc3Nlcyhub2RlLCBbJ3RoaXMtY2xhc3MnXSk7XG4gIGVxdWFsKG5vZGUuZ2V0QXR0cmlidXRlKCdjbGFzcycpLCAndGhhdC1jbGFzcycpO1xuICBkb20ucmVtb3ZlQ2xhc3Nlcyhub2RlLCBbJ3RoYXQtY2xhc3MnXSk7XG4gIGVxdWFsKG5vZGUuZ2V0QXR0cmlidXRlKCdjbGFzcycpLCAnJyk7XG59KTtcblxuXG59XG4iXX0=
define('dom-helper-tests/dom-helper-test.jshint', ['exports'], function (exports) {
  module('JSHint - dom-helper-tests');
  test('dom-helper-tests/dom-helper-test.js should pass jshint', function () {
    ok(true, 'dom-helper-tests/dom-helper-test.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci10ZXN0LmpzaGludC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDcEMsTUFBSSxDQUFDLHdEQUF3RCxFQUFFLFlBQVc7QUFDeEUsTUFBRSxDQUFDLElBQUksRUFBRSx5REFBeUQsQ0FBQyxDQUFDO0dBQ3JFLENBQUMsQ0FBQyIsImZpbGUiOiJkb20taGVscGVyLXRlc3RzL2RvbS1oZWxwZXItdGVzdC5qc2hpbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUoJ0pTSGludCAtIGRvbS1oZWxwZXItdGVzdHMnKTtcbnRlc3QoJ2RvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2RvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
define('dom-helper-tests/dom-helper.jshint', ['exports'], function (exports) {
  module('JSHint - dom-helper-tests');
  test('dom-helper-tests/dom-helper.js should pass jshint', function () {
    ok(true, 'dom-helper-tests/dom-helper.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3BDLE1BQUksQ0FBQyxtREFBbUQsRUFBRSxZQUFXO0FBQ25FLE1BQUUsQ0FBQyxJQUFJLEVBQUUsb0RBQW9ELENBQUMsQ0FBQztHQUNoRSxDQUFDLENBQUMiLCJmaWxlIjoiZG9tLWhlbHBlci10ZXN0cy9kb20taGVscGVyLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gZG9tLWhlbHBlci10ZXN0cycpO1xudGVzdCgnZG9tLWhlbHBlci10ZXN0cy9kb20taGVscGVyLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2RvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci5qcyBzaG91bGQgcGFzcyBqc2hpbnQuJyk7IFxufSk7XG4iXX0=
define('dom-helper-tests/dom-helper/build-html-dom.jshint', ['exports'], function (exports) {
  module('JSHint - dom-helper-tests/dom-helper');
  test('dom-helper-tests/dom-helper/build-html-dom.js should pass jshint', function () {
    ok(true, 'dom-helper-tests/dom-helper/build-html-dom.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci9idWlsZC1odG1sLWRvbS5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQy9DLE1BQUksQ0FBQyxrRUFBa0UsRUFBRSxZQUFXO0FBQ2xGLE1BQUUsQ0FBQyxJQUFJLEVBQUUsbUVBQW1FLENBQUMsQ0FBQztHQUMvRSxDQUFDLENBQUMiLCJmaWxlIjoiZG9tLWhlbHBlci10ZXN0cy9kb20taGVscGVyL2J1aWxkLWh0bWwtZG9tLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gZG9tLWhlbHBlci10ZXN0cy9kb20taGVscGVyJyk7XG50ZXN0KCdkb20taGVscGVyLXRlc3RzL2RvbS1oZWxwZXIvYnVpbGQtaHRtbC1kb20uanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayh0cnVlLCAnZG9tLWhlbHBlci10ZXN0cy9kb20taGVscGVyL2J1aWxkLWh0bWwtZG9tLmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
define('dom-helper-tests/dom-helper/classes.jshint', ['exports'], function (exports) {
  module('JSHint - dom-helper-tests/dom-helper');
  test('dom-helper-tests/dom-helper/classes.js should pass jshint', function () {
    ok(true, 'dom-helper-tests/dom-helper/classes.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci9jbGFzc2VzLmpzaGludC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDL0MsTUFBSSxDQUFDLDJEQUEyRCxFQUFFLFlBQVc7QUFDM0UsTUFBRSxDQUFDLElBQUksRUFBRSw0REFBNEQsQ0FBQyxDQUFDO0dBQ3hFLENBQUMsQ0FBQyIsImZpbGUiOiJkb20taGVscGVyLXRlc3RzL2RvbS1oZWxwZXIvY2xhc3Nlcy5qc2hpbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUoJ0pTSGludCAtIGRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlcicpO1xudGVzdCgnZG9tLWhlbHBlci10ZXN0cy9kb20taGVscGVyL2NsYXNzZXMuanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayh0cnVlLCAnZG9tLWhlbHBlci10ZXN0cy9kb20taGVscGVyL2NsYXNzZXMuanMgc2hvdWxkIHBhc3MganNoaW50LicpOyBcbn0pO1xuIl19
define('dom-helper-tests/dom-helper/prop.jshint', ['exports'], function (exports) {
  module('JSHint - dom-helper-tests/dom-helper');
  test('dom-helper-tests/dom-helper/prop.js should pass jshint', function () {
    ok(true, 'dom-helper-tests/dom-helper/prop.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlci9wcm9wLmpzaGludC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDL0MsTUFBSSxDQUFDLHdEQUF3RCxFQUFFLFlBQVc7QUFDeEUsTUFBRSxDQUFDLElBQUksRUFBRSx5REFBeUQsQ0FBQyxDQUFDO0dBQ3JFLENBQUMsQ0FBQyIsImZpbGUiOiJkb20taGVscGVyLXRlc3RzL2RvbS1oZWxwZXIvcHJvcC5qc2hpbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUoJ0pTSGludCAtIGRvbS1oZWxwZXItdGVzdHMvZG9tLWhlbHBlcicpO1xudGVzdCgnZG9tLWhlbHBlci10ZXN0cy9kb20taGVscGVyL3Byb3AuanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayh0cnVlLCAnZG9tLWhlbHBlci10ZXN0cy9kb20taGVscGVyL3Byb3AuanMgc2hvdWxkIHBhc3MganNoaW50LicpOyBcbn0pO1xuIl19
define('dom-helper-tests/element-morph-test', ['exports', '../dom-helper'], function (exports, _domHelper) {

  var dom;
  QUnit.module('DOM Helper: ElementMorph', {
    beforeEach: function () {
      dom = new _domHelper.default();
    },

    afterEach: function () {
      dom = null;
    }
  });

  test('contains a clear method', function () {
    expect(0);

    var el = dom.createElement('div');
    var node = dom.createElementMorph(el);

    node.clear();
  });

  test('resets element and dom on destroy', function () {
    expect(2);

    var el = dom.createElement('div');
    var node = dom.createElementMorph(el);

    node.destroy();

    equal(node.element, null, 'element was reset to null');
    equal(node.dom, null, 'dom was reset to null');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvZWxlbWVudC1tb3JwaC10ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsTUFBSSxHQUFHLENBQUM7QUFDUixPQUFLLENBQUMsTUFBTSxDQUFDLDBCQUEwQixFQUFFO0FBQ3ZDLGNBQVUsRUFBRSxZQUFXO0FBQ3JCLFNBQUcsR0FBRyx3QkFBZSxDQUFDO0tBQ3ZCOztBQUVELGFBQVMsRUFBRSxZQUFXO0FBQ3BCLFNBQUcsR0FBRyxJQUFJLENBQUM7S0FDWjtHQUNGLENBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMseUJBQXlCLEVBQUUsWUFBVTtBQUN4QyxVQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRVYsUUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsQyxRQUFJLElBQUksR0FBRyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRXRDLFFBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNkLENBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMsbUNBQW1DLEVBQUUsWUFBVTtBQUNsRCxVQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRVYsUUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsQyxRQUFJLElBQUksR0FBRyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRXRDLFFBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFZixTQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztBQUN2RCxTQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztHQUNoRCxDQUFDLENBQUMiLCJmaWxlIjoiZG9tLWhlbHBlci10ZXN0cy9lbGVtZW50LW1vcnBoLXRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRE9NSGVscGVyIGZyb20gXCIuLi9kb20taGVscGVyXCI7XG5cbnZhciBkb207XG5RVW5pdC5tb2R1bGUoJ0RPTSBIZWxwZXI6IEVsZW1lbnRNb3JwaCcsIHtcbiAgYmVmb3JlRWFjaDogZnVuY3Rpb24oKSB7XG4gICAgZG9tID0gbmV3IERPTUhlbHBlcigpO1xuICB9LFxuXG4gIGFmdGVyRWFjaDogZnVuY3Rpb24oKSB7XG4gICAgZG9tID0gbnVsbDtcbiAgfVxufSk7XG5cbnRlc3QoJ2NvbnRhaW5zIGEgY2xlYXIgbWV0aG9kJywgZnVuY3Rpb24oKXtcbiAgZXhwZWN0KDApO1xuXG4gIHZhciBlbCA9IGRvbS5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudE1vcnBoKGVsKTtcblxuICBub2RlLmNsZWFyKCk7XG59KTtcblxudGVzdCgncmVzZXRzIGVsZW1lbnQgYW5kIGRvbSBvbiBkZXN0cm95JywgZnVuY3Rpb24oKXtcbiAgZXhwZWN0KDIpO1xuXG4gIHZhciBlbCA9IGRvbS5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdmFyIG5vZGUgPSBkb20uY3JlYXRlRWxlbWVudE1vcnBoKGVsKTtcblxuICBub2RlLmRlc3Ryb3koKTtcblxuICBlcXVhbChub2RlLmVsZW1lbnQsIG51bGwsICdlbGVtZW50IHdhcyByZXNldCB0byBudWxsJyk7XG4gIGVxdWFsKG5vZGUuZG9tLCBudWxsLCAnZG9tIHdhcyByZXNldCB0byBudWxsJyk7XG59KTtcbiJdfQ==
define('dom-helper-tests/element-morph-test.jshint', ['exports'], function (exports) {
  module('JSHint - dom-helper-tests');
  test('dom-helper-tests/element-morph-test.js should pass jshint', function () {
    ok(true, 'dom-helper-tests/element-morph-test.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvZWxlbWVudC1tb3JwaC10ZXN0LmpzaGludC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDcEMsTUFBSSxDQUFDLDJEQUEyRCxFQUFFLFlBQVc7QUFDM0UsTUFBRSxDQUFDLElBQUksRUFBRSw0REFBNEQsQ0FBQyxDQUFDO0dBQ3hFLENBQUMsQ0FBQyIsImZpbGUiOiJkb20taGVscGVyLXRlc3RzL2VsZW1lbnQtbW9ycGgtdGVzdC5qc2hpbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUoJ0pTSGludCAtIGRvbS1oZWxwZXItdGVzdHMnKTtcbnRlc3QoJ2RvbS1oZWxwZXItdGVzdHMvZWxlbWVudC1tb3JwaC10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2RvbS1oZWxwZXItdGVzdHMvZWxlbWVudC1tb3JwaC10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
define('dom-helper-tests/prop-test', ['exports', 'dom-helper/prop'], function (exports, _domHelperProp) {

  QUnit.module('dom-helper prop');

  test('type.attr, for element props that for one reason or another need to be treated as attrs', function () {
    expect(12);

    [{ tagName: 'TEXTAREA', key: 'form' }, { tagName: 'BUTTON', key: 'type' }, { tagName: 'INPUT', key: 'type' }, { tagName: 'INPUT', key: 'list' }, { tagName: 'INPUT', key: 'form' }, { tagName: 'OPTION', key: 'form' }, { tagName: 'INPUT', key: 'form' }, { tagName: 'BUTTON', key: 'form' }, { tagName: 'LABEL', key: 'form' }, { tagName: 'FIELDSET', key: 'form' }, { tagName: 'LEGEND', key: 'form' }, { tagName: 'OBJECT', key: 'form' }].forEach(function (pair) {
      var element = {
        tagName: pair.tagName
      };

      Object.defineProperty(element, pair.key, {
        set: function () {
          throw new Error('I am a bad browser!');
        }
      });

      deepEqual(_domHelperProp.normalizeProperty(element, pair.key), {
        normalized: pair.key,
        type: 'attr'
      }, ' ' + pair.tagName + '.' + pair.key);
    });
  });

  var TAG_EVENT_PAIRS = [{ tagName: 'form', key: 'onsubmit' }, { tagName: 'form', key: 'onSubmit' }, { tagName: 'form', key: 'ONSUBMIT' }, { tagName: 'video', key: 'canplay' }, { tagName: 'video', key: 'canPlay' }, { tagName: 'video', key: 'CANPLAY' }];

  test('type.eventHandlers should all be props: Chrome', function () {
    expect(6);
    TAG_EVENT_PAIRS.forEach(function (pair) {
      var element = {
        tagName: pair.tagName
      };

      Object.defineProperty(element, pair.key, {
        set: function () {},
        get: function () {}
      });

      deepEqual(_domHelperProp.normalizeProperty(element, pair.key), {
        normalized: pair.key,
        type: 'prop'
      }, ' ' + pair.tagName + '.' + pair.key);
    });
  });

  test('type.eventHandlers should all be props: Safari style (which has screwed up stuff)', function () {
    expect(24);

    TAG_EVENT_PAIRS.forEach(function (pair) {
      var parent = {
        tagName: pair.tagName
      };

      Object.defineProperty(parent, pair.key, {
        set: undefined,
        get: undefined
      });

      var element = Object.create(parent);

      ok(Object.getOwnPropertyDescriptor(element, pair.key) === undefined, 'ensure we mimic silly safari');
      ok(Object.getOwnPropertyDescriptor(parent, pair.key).set === undefined, 'ensure we mimic silly safari');

      var _normalizeProperty = _domHelperProp.normalizeProperty(element, pair.key);

      var normalized = _normalizeProperty.normalized;
      var type = _normalizeProperty.type;

      equal(normalized, pair.key, 'normalized: ' + pair.tagName + '.' + pair.key);
      equal(type, 'prop', 'type: ' + pair.tagName + '.' + pair.key);
    });
  });

  test('test style attr', function () {
    var _normalizeProperty2 = _domHelperProp.normalizeProperty({
      style: undefined,
      tagName: 'foobar'
    }, 'style');

    var normalized = _normalizeProperty2.normalized;
    var type = _normalizeProperty2.type;

    equal(normalized, 'style');
    equal(type, 'attr');
  });

  test('test STYLE attr', function () {
    var _normalizeProperty3 = _domHelperProp.normalizeProperty({
      style: undefined,
      tagName: 'foobar'
    }, 'STYLE');

    var normalized = _normalizeProperty3.normalized;
    var type = _normalizeProperty3.type;

    equal(normalized, 'style');
    equal(type, 'attr');
  });

  test('test StyLE attr', function () {
    var _normalizeProperty4 = _domHelperProp.normalizeProperty({
      style: undefined,
      tagName: 'foobar'
    }, 'StyLE');

    var normalized = _normalizeProperty4.normalized;
    var type = _normalizeProperty4.type;

    equal(normalized, 'style');
    equal(type, 'attr');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvcHJvcC10ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsT0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOztBQUVoQyxNQUFJLENBQUMseUZBQXlGLEVBQUUsWUFBVztBQUN6RyxVQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRVgsS0FDRSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUksR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUssR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUssR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUssR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUksR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUssR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUksR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUssR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUksR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUksR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUNyQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBSztBQUNsQixVQUFJLE9BQU8sR0FBRztBQUNaLGVBQU8sRUFBRSxJQUFJLENBQUMsT0FBTztPQUN0QixD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UUFITCxVQUFVLHVCQUFWLFVBQVU7UUFBRSxJQUFJLHVCQUFKLElBQUk7O0FBS3RCLFNBQUssQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0IsU0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztHQUNyQixDQUFDLENBQUMiLCJmaWxlIjoiZG9tLWhlbHBlci10ZXN0cy9wcm9wLXRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBub3JtYWxpemVQcm9wZXJ0eSB9IGZyb20gJ2RvbS1oZWxwZXIvcHJvcCc7XG5cblFVbml0Lm1vZHVsZSgnZG9tLWhlbHBlciBwcm9wJyk7XG5cbnRlc3QoJ3R5cGUuYXR0ciwgZm9yIGVsZW1lbnQgcHJvcHMgdGhhdCBmb3Igb25lIHJlYXNvbiBvciBhbm90aGVyIG5lZWQgdG8gYmUgdHJlYXRlZCBhcyBhdHRycycsIGZ1bmN0aW9uKCkge1xuICBleHBlY3QoMTIpO1xuXG4gIFtcbiAgICB7IHRhZ05hbWU6ICdURVhUQVJFQScsIGtleTogJ2Zvcm0nIH0sXG4gICAgeyB0YWdOYW1lOiAnQlVUVE9OJywgICBrZXk6ICd0eXBlJyB9LFxuICAgIHsgdGFnTmFtZTogJ0lOUFVUJywgICAga2V5OiAndHlwZScgfSxcbiAgICB7IHRhZ05hbWU6ICdJTlBVVCcsICAgIGtleTogJ2xpc3QnIH0sXG4gICAgeyB0YWdOYW1lOiAnSU5QVVQnLCAgICBrZXk6ICdmb3JtJyB9LFxuICAgIHsgdGFnTmFtZTogJ09QVElPTicsICAga2V5OiAnZm9ybScgfSxcbiAgICB7IHRhZ05hbWU6ICdJTlBVVCcsICAgIGtleTogJ2Zvcm0nIH0sXG4gICAgeyB0YWdOYW1lOiAnQlVUVE9OJywgICBrZXk6ICdmb3JtJyB9LFxuICAgIHsgdGFnTmFtZTogJ0xBQkVMJywgICAga2V5OiAnZm9ybScgfSxcbiAgICB7IHRhZ05hbWU6ICdGSUVMRFNFVCcsIGtleTogJ2Zvcm0nIH0sXG4gICAgeyB0YWdOYW1lOiAnTEVHRU5EJywgICBrZXk6ICdmb3JtJyB9LFxuICAgIHsgdGFnTmFtZTogJ09CSkVDVCcsICAga2V5OiAnZm9ybScgfVxuICBdLmZvckVhY2goKHBhaXIpID0+IHtcbiAgICB2YXIgZWxlbWVudCA9IHtcbiAgICAgIHRhZ05hbWU6IHBhaXIudGFnTmFtZVxuICAgIH07XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWxlbWVudCwgcGFpci5rZXksIHtcbiAgICAgIHNldCgpIHsgdGhyb3cgbmV3IEVycm9yKCdJIGFtIGEgYmFkIGJyb3dzZXIhJyk7IH1cbiAgICB9KTtcblxuICAgIGRlZXBFcXVhbChub3JtYWxpemVQcm9wZXJ0eShlbGVtZW50LCBwYWlyLmtleSksIHtcbiAgICAgIG5vcm1hbGl6ZWQ6IHBhaXIua2V5LFxuICAgICAgdHlwZTogJ2F0dHInXG4gICAgfSwgYCAke3BhaXIudGFnTmFtZX0uJHtwYWlyLmtleX1gKTtcbiAgfSk7XG59KTtcblxudmFyIFRBR19FVkVOVF9QQUlSUyA9IFtcbiAgeyB0YWdOYW1lOiAnZm9ybScsIGtleTogJ29uc3VibWl0JyB9LFxuICB7IHRhZ05hbWU6ICdmb3JtJywga2V5OiAnb25TdWJtaXQnIH0sXG4gIHsgdGFnTmFtZTogJ2Zvcm0nLCBrZXk6ICdPTlNVQk1JVCcgfSxcbiAgeyB0YWdOYW1lOiAndmlkZW8nLCBrZXk6ICdjYW5wbGF5JyB9LFxuICB7IHRhZ05hbWU6ICd2aWRlbycsIGtleTogJ2NhblBsYXknIH0sXG4gIHsgdGFnTmFtZTogJ3ZpZGVvJywga2V5OiAnQ0FOUExBWScgfVxuXTtcblxudGVzdCgndHlwZS5ldmVudEhhbmRsZXJzIHNob3VsZCBhbGwgYmUgcHJvcHM6IENocm9tZScsIGZ1bmN0aW9uKCkge1xuICBleHBlY3QoNik7XG4gIFRBR19FVkVOVF9QQUlSUy5mb3JFYWNoKChwYWlyKSA9PiB7XG4gICAgdmFyIGVsZW1lbnQgPSB7XG4gICAgICB0YWdOYW1lOiBwYWlyLnRhZ05hbWVcbiAgICB9O1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsIHBhaXIua2V5LCB7XG4gICAgICBzZXQoKSB7IH0sXG4gICAgICBnZXQoKSB7IH1cbiAgICB9KTtcblxuICAgIGRlZXBFcXVhbChub3JtYWxpemVQcm9wZXJ0eShlbGVtZW50LCBwYWlyLmtleSksIHtcbiAgICAgIG5vcm1hbGl6ZWQ6IHBhaXIua2V5LFxuICAgICAgdHlwZTogJ3Byb3AnXG4gICAgfSwgYCAke3BhaXIudGFnTmFtZX0uJHtwYWlyLmtleX1gKTtcbiAgfSk7XG59KTtcblxuXG50ZXN0KCd0eXBlLmV2ZW50SGFuZGxlcnMgc2hvdWxkIGFsbCBiZSBwcm9wczogU2FmYXJpIHN0eWxlICh3aGljaCBoYXMgc2NyZXdlZCB1cCBzdHVmZiknLCBmdW5jdGlvbigpIHtcbiAgZXhwZWN0KDI0KTtcblxuICBUQUdfRVZFTlRfUEFJUlMuZm9yRWFjaCgocGFpcikgPT4ge1xuICAgIHZhciBwYXJlbnQgPSB7XG4gICAgICB0YWdOYW1lOiBwYWlyLnRhZ05hbWVcbiAgICB9O1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBhcmVudCwgcGFpci5rZXksIHtcbiAgICAgIHNldDogdW5kZWZpbmVkLFxuICAgICAgZ2V0OiB1bmRlZmluZWRcbiAgICB9KTtcblxuICAgIHZhciBlbGVtZW50ID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQpO1xuXG4gICAgb2soT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlbGVtZW50LCBwYWlyLmtleSkgPT09IHVuZGVmaW5lZCwgJ2Vuc3VyZSB3ZSBtaW1pYyBzaWxseSBzYWZhcmknKTtcbiAgICBvayhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHBhcmVudCwgcGFpci5rZXkpLnNldCA9PT0gdW5kZWZpbmVkLCAnZW5zdXJlIHdlIG1pbWljIHNpbGx5IHNhZmFyaScpO1xuXG4gICAgdmFyIHsgbm9ybWFsaXplZCwgdHlwZSB9ID0gbm9ybWFsaXplUHJvcGVydHkoZWxlbWVudCwgcGFpci5rZXkpO1xuXG4gICAgZXF1YWwobm9ybWFsaXplZCwgcGFpci5rZXksIGBub3JtYWxpemVkOiAke3BhaXIudGFnTmFtZX0uJHtwYWlyLmtleX1gKTtcbiAgICBlcXVhbCh0eXBlLCAncHJvcCcsIGB0eXBlOiAke3BhaXIudGFnTmFtZX0uJHtwYWlyLmtleX1gKTtcbiAgfSk7XG59KTtcblxudGVzdCgndGVzdCBzdHlsZSBhdHRyJywgZnVuY3Rpb24oKSB7XG4gIHZhciB7IG5vcm1hbGl6ZWQsIHR5cGUgfSA9IG5vcm1hbGl6ZVByb3BlcnR5KHtcbiAgICBzdHlsZTogdW5kZWZpbmVkLFxuICAgIHRhZ05hbWU6ICdmb29iYXInXG4gIH0sICdzdHlsZScpO1xuXG4gIGVxdWFsKG5vcm1hbGl6ZWQsICdzdHlsZScpO1xuICBlcXVhbCh0eXBlLCAnYXR0cicpO1xufSk7XG5cbnRlc3QoJ3Rlc3QgU1RZTEUgYXR0cicsIGZ1bmN0aW9uKCkge1xuICB2YXIgeyBub3JtYWxpemVkLCB0eXBlIH0gPSBub3JtYWxpemVQcm9wZXJ0eSh7XG4gICAgc3R5bGU6IHVuZGVmaW5lZCxcbiAgICB0YWdOYW1lOiAnZm9vYmFyJ1xuICB9LCAnU1RZTEUnKTtcblxuICBlcXVhbChub3JtYWxpemVkLCAnc3R5bGUnKTtcbiAgZXF1YWwodHlwZSwgJ2F0dHInKTtcbn0pO1xuXG50ZXN0KCd0ZXN0IFN0eUxFIGF0dHInLCBmdW5jdGlvbigpIHtcbiAgdmFyIHsgbm9ybWFsaXplZCwgdHlwZSB9ID0gbm9ybWFsaXplUHJvcGVydHkoe1xuICAgIHN0eWxlOiB1bmRlZmluZWQsXG4gICAgdGFnTmFtZTogJ2Zvb2JhcidcbiAgfSwgJ1N0eUxFJyk7XG5cbiAgZXF1YWwobm9ybWFsaXplZCwgJ3N0eWxlJyk7XG4gIGVxdWFsKHR5cGUsICdhdHRyJyk7XG59KTtcblxuIl19
define('dom-helper-tests/prop-test.jshint', ['exports'], function (exports) {
  module('JSHint - dom-helper-tests');
  test('dom-helper-tests/prop-test.js should pass jshint', function () {
    ok(true, 'dom-helper-tests/prop-test.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXItdGVzdHMvcHJvcC10ZXN0LmpzaGludC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDcEMsTUFBSSxDQUFDLGtEQUFrRCxFQUFFLFlBQVc7QUFDbEUsTUFBRSxDQUFDLElBQUksRUFBRSxtREFBbUQsQ0FBQyxDQUFDO0dBQy9ELENBQUMsQ0FBQyIsImZpbGUiOiJkb20taGVscGVyLXRlc3RzL3Byb3AtdGVzdC5qc2hpbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUoJ0pTSGludCAtIGRvbS1oZWxwZXItdGVzdHMnKTtcbnRlc3QoJ2RvbS1oZWxwZXItdGVzdHMvcHJvcC10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2RvbS1oZWxwZXItdGVzdHMvcHJvcC10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
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