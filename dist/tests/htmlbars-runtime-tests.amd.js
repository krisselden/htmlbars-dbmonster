define("htmlbars-runtime-tests/hooks-test", ["exports", "../htmlbars-runtime", "../htmlbars-util/object-utils", "../htmlbars-compiler/compiler", "../htmlbars-test-helpers", "../dom-helper"], function (exports, _htmlbarsRuntime, _htmlbarsUtilObjectUtils, _htmlbarsCompilerCompiler, _htmlbarsTestHelpers, _domHelper) {

  var hooks, helpers, partials, env;

  function registerHelper(name, callback) {
    helpers[name] = callback;
  }

  function commonSetup() {
    hooks = _htmlbarsUtilObjectUtils.merge({}, _htmlbarsRuntime.hooks);
    hooks.keywords = _htmlbarsUtilObjectUtils.merge({}, _htmlbarsRuntime.hooks.keywords);
    helpers = {};
    partials = {};

    env = {
      dom: new _domHelper.default(),
      hooks: hooks,
      helpers: helpers,
      partials: partials,
      useFragmentCache: true
    };
  }

  QUnit.module("htmlbars-runtime: hooks", {
    beforeEach: commonSetup
  });

  test("inline hook correctly handles false-like values", function () {

    registerHelper('get', function (params) {
      return params[0];
    });

    var object = { val: 'hello' };
    var template = _htmlbarsCompilerCompiler.compile('<div>{{get val}}</div>');
    var result = template.render(object, env);

    _htmlbarsTestHelpers.equalTokens(result.fragment, '<div>hello</div>');

    object.val = '';

    result.rerender();

    _htmlbarsTestHelpers.equalTokens(result.fragment, '<div></div>');
  });

  test("inline hook correctly handles false-like values", function () {

    registerHelper('get', function (params) {
      return params[0];
    });

    var object = { val: 'hello' };
    var template = _htmlbarsCompilerCompiler.compile('<div>{{get val}}</div>');
    var result = template.render(object, env);

    _htmlbarsTestHelpers.equalTokens(result.fragment, '<div>hello</div>');

    object.val = '';

    result.rerender();

    _htmlbarsTestHelpers.equalTokens(result.fragment, '<div></div>');
  });
});

// import { manualElement } from "../htmlbars-runtime/render";

// import { hostBlock } from "../htmlbars-runtime/hooks";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaG9va3MtdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLE1BQUksS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDOztBQUVsQyxXQUFTLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO0FBQ3RDLFdBQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7R0FDMUI7O0FBRUQsV0FBUyxXQUFXLEdBQUc7QUFDckIsU0FBSyxHQUFHLHlCQWRELEtBQUssQ0FjRSxFQUFFLG1CQWZULEtBQUssQ0FlbUIsQ0FBQztBQUNoQyxTQUFLLENBQUMsUUFBUSxHQUFHLHlCQWZWLEtBQUssQ0FlVyxFQUFFLEVBQUUsaUJBaEJwQixLQUFLLENBZ0I0QixRQUFRLENBQUMsQ0FBQztBQUNsRCxXQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2IsWUFBUSxHQUFHLEVBQUUsQ0FBQzs7QUFFZCxPQUFHLEdBQUc7QUFDSixTQUFHLEVBQUUsd0JBQWU7QUFDcEIsV0FBSyxFQUFFLEtBQUs7QUFDWixhQUFPLEVBQUUsT0FBTztBQUNoQixjQUFRLEVBQUUsUUFBUTtBQUNsQixzQkFBZ0IsRUFBRSxJQUFJO0tBQ3ZCLENBQUM7R0FDSDs7QUFFRCxPQUFLLENBQUMsTUFBTSxDQUFDLHlCQUF5QixFQUFFO0FBQ3RDLGNBQVUsRUFBRSxXQUFXO0dBQ3hCLENBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMsaURBQWlELEVBQUUsWUFBVzs7QUFFakUsa0JBQWMsQ0FBQyxLQUFLLEVBQUUsVUFBUyxNQUFNLEVBQUU7QUFDckMsYUFBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEIsQ0FBQyxDQUFDOztBQUVILFFBQUksTUFBTSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFFBQUksUUFBUSxHQUFHLDBCQXJDUixPQUFPLENBcUNTLHdCQUF3QixDQUFDLENBQUM7QUFDakQsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRTFDLHlCQXRDTyxXQUFXLENBc0NOLE1BQU0sQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzs7QUFFakQsVUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7O0FBRWhCLFVBQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7QUFFbEIseUJBNUNPLFdBQVcsQ0E0Q04sTUFBTSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztHQUU3QyxDQUFDLENBQUM7O0FBRUgsTUFBSSxDQUFDLGlEQUFpRCxFQUFFLFlBQVc7O0FBRWpFLGtCQUFjLENBQUMsS0FBSyxFQUFFLFVBQVMsTUFBTSxFQUFFO0FBQ3JDLGFBQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLE1BQU0sR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUM5QixRQUFJLFFBQVEsR0FBRywwQkF6RFIsT0FBTyxDQXlEUyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pELFFBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUUxQyx5QkExRE8sV0FBVyxDQTBETixNQUFNLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7O0FBRWpELFVBQU0sQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDOztBQUVoQixVQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7O0FBRWxCLHlCQWhFTyxXQUFXLENBZ0VOLE1BQU0sQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7R0FFN0MsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaG9va3MtdGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGhvb2tzIGFzIGRlZmF1bHRIb29rcyB9IGZyb20gXCIuLi9odG1sYmFycy1ydW50aW1lXCI7XG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gXCIuLi9odG1sYmFycy11dGlsL29iamVjdC11dGlsc1wiO1xuLy8gaW1wb3J0IHsgbWFudWFsRWxlbWVudCB9IGZyb20gXCIuLi9odG1sYmFycy1ydW50aW1lL3JlbmRlclwiO1xuaW1wb3J0IHsgY29tcGlsZSB9IGZyb20gXCIuLi9odG1sYmFycy1jb21waWxlci9jb21waWxlclwiO1xuLy8gaW1wb3J0IHsgaG9zdEJsb2NrIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXJ1bnRpbWUvaG9va3NcIjtcbmltcG9ydCB7IGVxdWFsVG9rZW5zIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXRlc3QtaGVscGVyc1wiO1xuaW1wb3J0IERPTUhlbHBlciBmcm9tIFwiLi4vZG9tLWhlbHBlclwiO1xuXG52YXIgaG9va3MsIGhlbHBlcnMsIHBhcnRpYWxzLCBlbnY7XG5cbmZ1bmN0aW9uIHJlZ2lzdGVySGVscGVyKG5hbWUsIGNhbGxiYWNrKSB7XG4gIGhlbHBlcnNbbmFtZV0gPSBjYWxsYmFjaztcbn1cblxuZnVuY3Rpb24gY29tbW9uU2V0dXAoKSB7XG4gIGhvb2tzID0gbWVyZ2Uoe30sIGRlZmF1bHRIb29rcyk7XG4gIGhvb2tzLmtleXdvcmRzID0gbWVyZ2Uoe30sIGRlZmF1bHRIb29rcy5rZXl3b3Jkcyk7XG4gIGhlbHBlcnMgPSB7fTtcbiAgcGFydGlhbHMgPSB7fTtcblxuICBlbnYgPSB7XG4gICAgZG9tOiBuZXcgRE9NSGVscGVyKCksXG4gICAgaG9va3M6IGhvb2tzLFxuICAgIGhlbHBlcnM6IGhlbHBlcnMsXG4gICAgcGFydGlhbHM6IHBhcnRpYWxzLFxuICAgIHVzZUZyYWdtZW50Q2FjaGU6IHRydWVcbiAgfTtcbn1cblxuUVVuaXQubW9kdWxlKFwiaHRtbGJhcnMtcnVudGltZTogaG9va3NcIiwge1xuICBiZWZvcmVFYWNoOiBjb21tb25TZXR1cFxufSk7XG5cbnRlc3QoXCJpbmxpbmUgaG9vayBjb3JyZWN0bHkgaGFuZGxlcyBmYWxzZS1saWtlIHZhbHVlc1wiLCBmdW5jdGlvbigpIHtcblxuICByZWdpc3RlckhlbHBlcignZ2V0JywgZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgcmV0dXJuIHBhcmFtc1swXTtcbiAgfSk7XG5cbiAgdmFyIG9iamVjdCA9IHsgdmFsOiAnaGVsbG8nIH07XG4gIHZhciB0ZW1wbGF0ZSA9IGNvbXBpbGUoJzxkaXY+e3tnZXQgdmFsfX08L2Rpdj4nKTtcbiAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlLnJlbmRlcihvYmplY3QsIGVudik7XG5cbiAgZXF1YWxUb2tlbnMocmVzdWx0LmZyYWdtZW50LCAnPGRpdj5oZWxsbzwvZGl2PicpO1xuXG4gIG9iamVjdC52YWwgPSAnJztcblxuICByZXN1bHQucmVyZW5kZXIoKTtcblxuICBlcXVhbFRva2VucyhyZXN1bHQuZnJhZ21lbnQsICc8ZGl2PjwvZGl2PicpO1xuXG59KTtcblxudGVzdChcImlubGluZSBob29rIGNvcnJlY3RseSBoYW5kbGVzIGZhbHNlLWxpa2UgdmFsdWVzXCIsIGZ1bmN0aW9uKCkge1xuXG4gIHJlZ2lzdGVySGVscGVyKCdnZXQnLCBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICByZXR1cm4gcGFyYW1zWzBdO1xuICB9KTtcblxuICB2YXIgb2JqZWN0ID0geyB2YWw6ICdoZWxsbycgfTtcbiAgdmFyIHRlbXBsYXRlID0gY29tcGlsZSgnPGRpdj57e2dldCB2YWx9fTwvZGl2PicpO1xuICB2YXIgcmVzdWx0ID0gdGVtcGxhdGUucmVuZGVyKG9iamVjdCwgZW52KTtcblxuICBlcXVhbFRva2VucyhyZXN1bHQuZnJhZ21lbnQsICc8ZGl2PmhlbGxvPC9kaXY+Jyk7XG5cbiAgb2JqZWN0LnZhbCA9ICcnO1xuXG4gIHJlc3VsdC5yZXJlbmRlcigpO1xuXG4gIGVxdWFsVG9rZW5zKHJlc3VsdC5mcmFnbWVudCwgJzxkaXY+PC9kaXY+Jyk7XG5cbn0pO1xuIl19
define('htmlbars-runtime-tests/hooks-test.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-runtime-tests');
  test('htmlbars-runtime-tests/hooks-test.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/hooks-test.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaG9va3MtdGVzdC5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQzFDLE1BQUksQ0FBQyx5REFBeUQsRUFBRSxZQUFXO0FBQ3pFLE1BQUUsQ0FBQyxJQUFJLEVBQUUsMERBQTBELENBQUMsQ0FBQztHQUN0RSxDQUFDLENBQUMiLCJmaWxlIjoiaHRtbGJhcnMtcnVudGltZS10ZXN0cy9ob29rcy10ZXN0LmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gaHRtbGJhcnMtcnVudGltZS10ZXN0cycpO1xudGVzdCgnaHRtbGJhcnMtcnVudGltZS10ZXN0cy9ob29rcy10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaG9va3MtdGVzdC5qcyBzaG91bGQgcGFzcyBqc2hpbnQuJyk7IFxufSk7XG4iXX0=
define("htmlbars-runtime-tests/hooks", ["exports", "../htmlbars-runtime", "../htmlbars-util/object-utils", "../htmlbars-compiler/compiler", "../htmlbars-test-helpers", "../dom-helper"], function (exports, _htmlbarsRuntime, _htmlbarsUtilObjectUtils, _htmlbarsCompilerCompiler, _htmlbarsTestHelpers, _domHelper) {

  var hooks, helpers, partials, env;

  function registerHelper(name, callback) {
    helpers[name] = callback;
  }

  function commonSetup() {
    hooks = _htmlbarsUtilObjectUtils.merge({}, _htmlbarsRuntime.hooks);
    hooks.keywords = _htmlbarsUtilObjectUtils.merge({}, _htmlbarsRuntime.hooks.keywords);
    helpers = {};
    partials = {};

    env = {
      dom: new _domHelper.default(),
      hooks: hooks,
      helpers: helpers,
      partials: partials,
      useFragmentCache: true
    };
  }

  QUnit.module("htmlbars-runtime: hooks", {
    beforeEach: commonSetup
  });

  test("inline hook correctly handles false-like values", function () {

    registerHelper('get', function (params) {
      return params[0];
    });

    var object = { val: 'hello' };
    var template = _htmlbarsCompilerCompiler.compile('<div>{{get val}}</div>');
    var result = template.render(object, env);

    _htmlbarsTestHelpers.equalTokens(result.fragment, '<div>hello</div>');

    object.val = '';

    result.rerender();

    _htmlbarsTestHelpers.equalTokens(result.fragment, '<div></div>');
  });

  test("subexr hook correctly handles false-like values", function () {
    registerHelper('if', function (params) {
      return params[0] ? params[1] : params[2];
    });

    var object = { val: true };
    var template = _htmlbarsCompilerCompiler.compile('<div data-foo={{if val "stuff" ""}}></div>');
    var result = template.render(object, env);

    _htmlbarsTestHelpers.equalTokens(result.fragment, '<div data-foo="stuff"></div>');

    object.val = false;

    result.rerender();

    _htmlbarsTestHelpers.equalTokens(result.fragment, '<div data-foo=""></div>');
  });
});

// import { manualElement } from "../htmlbars-runtime/render";

// import { hostBlock } from "../htmlbars-runtime/hooks";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaG9va3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSxNQUFJLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQzs7QUFFbEMsV0FBUyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtBQUN0QyxXQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO0dBQzFCOztBQUVELFdBQVMsV0FBVyxHQUFHO0FBQ3JCLFNBQUssR0FBRyx5QkFkRCxLQUFLLENBY0UsRUFBRSxtQkFmVCxLQUFLLENBZW1CLENBQUM7QUFDaEMsU0FBSyxDQUFDLFFBQVEsR0FBRyx5QkFmVixLQUFLLENBZVcsRUFBRSxFQUFFLGlCQWhCcEIsS0FBSyxDQWdCNEIsUUFBUSxDQUFDLENBQUM7QUFDbEQsV0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNiLFlBQVEsR0FBRyxFQUFFLENBQUM7O0FBRWQsT0FBRyxHQUFHO0FBQ0osU0FBRyxFQUFFLHdCQUFlO0FBQ3BCLFdBQUssRUFBRSxLQUFLO0FBQ1osYUFBTyxFQUFFLE9BQU87QUFDaEIsY0FBUSxFQUFFLFFBQVE7QUFDbEIsc0JBQWdCLEVBQUUsSUFBSTtLQUN2QixDQUFDO0dBQ0g7O0FBRUQsT0FBSyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsRUFBRTtBQUN0QyxjQUFVLEVBQUUsV0FBVztHQUN4QixDQUFDLENBQUM7O0FBRUgsTUFBSSxDQUFDLGlEQUFpRCxFQUFFLFlBQVc7O0FBRWpFLGtCQUFjLENBQUMsS0FBSyxFQUFFLFVBQVMsTUFBTSxFQUFFO0FBQ3JDLGFBQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLE1BQU0sR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUM5QixRQUFJLFFBQVEsR0FBRywwQkFyQ1IsT0FBTyxDQXFDUyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pELFFBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUUxQyx5QkF0Q08sV0FBVyxDQXNDTixNQUFNLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7O0FBRWpELFVBQU0sQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDOztBQUVoQixVQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7O0FBRWxCLHlCQTVDTyxXQUFXLENBNENOLE1BQU0sQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7R0FFN0MsQ0FBQyxDQUFDOztBQUVILE1BQUksQ0FBQyxpREFBaUQsRUFBRSxZQUFXO0FBQ2pFLGtCQUFjLENBQUMsSUFBSSxFQUFFLFVBQVMsTUFBTSxFQUFFO0FBQ3BDLGFBQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDMUMsQ0FBQyxDQUFDOztBQUVILFFBQUksTUFBTSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDO0FBQzFCLFFBQUksUUFBUSxHQUFHLDBCQXhEUixPQUFPLENBd0RTLDRDQUE0QyxDQUFDLENBQUM7QUFDckUsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRTFDLHlCQXpETyxXQUFXLENBeUROLE1BQU0sQ0FBQyxRQUFRLEVBQUUsOEJBQThCLENBQUMsQ0FBQzs7QUFFN0QsVUFBTSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7O0FBRW5CLFVBQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7QUFFbEIseUJBL0RPLFdBQVcsQ0ErRE4sTUFBTSxDQUFDLFFBQVEsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0dBRXpELENBQUMsQ0FBQyIsImZpbGUiOiJodG1sYmFycy1ydW50aW1lLXRlc3RzL2hvb2tzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaG9va3MgYXMgZGVmYXVsdEhvb2tzIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXJ1bnRpbWVcIjtcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXV0aWwvb2JqZWN0LXV0aWxzXCI7XG4vLyBpbXBvcnQgeyBtYW51YWxFbGVtZW50IH0gZnJvbSBcIi4uL2h0bWxiYXJzLXJ1bnRpbWUvcmVuZGVyXCI7XG5pbXBvcnQgeyBjb21waWxlIH0gZnJvbSBcIi4uL2h0bWxiYXJzLWNvbXBpbGVyL2NvbXBpbGVyXCI7XG4vLyBpbXBvcnQgeyBob3N0QmxvY2sgfSBmcm9tIFwiLi4vaHRtbGJhcnMtcnVudGltZS9ob29rc1wiO1xuaW1wb3J0IHsgZXF1YWxUb2tlbnMgfSBmcm9tIFwiLi4vaHRtbGJhcnMtdGVzdC1oZWxwZXJzXCI7XG5pbXBvcnQgRE9NSGVscGVyIGZyb20gXCIuLi9kb20taGVscGVyXCI7XG5cbnZhciBob29rcywgaGVscGVycywgcGFydGlhbHMsIGVudjtcblxuZnVuY3Rpb24gcmVnaXN0ZXJIZWxwZXIobmFtZSwgY2FsbGJhY2spIHtcbiAgaGVscGVyc1tuYW1lXSA9IGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBjb21tb25TZXR1cCgpIHtcbiAgaG9va3MgPSBtZXJnZSh7fSwgZGVmYXVsdEhvb2tzKTtcbiAgaG9va3Mua2V5d29yZHMgPSBtZXJnZSh7fSwgZGVmYXVsdEhvb2tzLmtleXdvcmRzKTtcbiAgaGVscGVycyA9IHt9O1xuICBwYXJ0aWFscyA9IHt9O1xuXG4gIGVudiA9IHtcbiAgICBkb206IG5ldyBET01IZWxwZXIoKSxcbiAgICBob29rczogaG9va3MsXG4gICAgaGVscGVyczogaGVscGVycyxcbiAgICBwYXJ0aWFsczogcGFydGlhbHMsXG4gICAgdXNlRnJhZ21lbnRDYWNoZTogdHJ1ZVxuICB9O1xufVxuXG5RVW5pdC5tb2R1bGUoXCJodG1sYmFycy1ydW50aW1lOiBob29rc1wiLCB7XG4gIGJlZm9yZUVhY2g6IGNvbW1vblNldHVwXG59KTtcblxudGVzdChcImlubGluZSBob29rIGNvcnJlY3RseSBoYW5kbGVzIGZhbHNlLWxpa2UgdmFsdWVzXCIsIGZ1bmN0aW9uKCkge1xuXG4gIHJlZ2lzdGVySGVscGVyKCdnZXQnLCBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICByZXR1cm4gcGFyYW1zWzBdO1xuICB9KTtcblxuICB2YXIgb2JqZWN0ID0geyB2YWw6ICdoZWxsbycgfTtcbiAgdmFyIHRlbXBsYXRlID0gY29tcGlsZSgnPGRpdj57e2dldCB2YWx9fTwvZGl2PicpO1xuICB2YXIgcmVzdWx0ID0gdGVtcGxhdGUucmVuZGVyKG9iamVjdCwgZW52KTtcblxuICBlcXVhbFRva2VucyhyZXN1bHQuZnJhZ21lbnQsICc8ZGl2PmhlbGxvPC9kaXY+Jyk7XG5cbiAgb2JqZWN0LnZhbCA9ICcnO1xuXG4gIHJlc3VsdC5yZXJlbmRlcigpO1xuXG4gIGVxdWFsVG9rZW5zKHJlc3VsdC5mcmFnbWVudCwgJzxkaXY+PC9kaXY+Jyk7XG5cbn0pO1xuXG50ZXN0KFwic3ViZXhyIGhvb2sgY29ycmVjdGx5IGhhbmRsZXMgZmFsc2UtbGlrZSB2YWx1ZXNcIiwgZnVuY3Rpb24oKSB7XG4gIHJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKHBhcmFtcykge1xuICAgIHJldHVybiBwYXJhbXNbMF0gPyBwYXJhbXNbMV0gOiBwYXJhbXNbMl07XG4gIH0pO1xuXG4gIHZhciBvYmplY3QgPSB7IHZhbDogdHJ1ZX07XG4gIHZhciB0ZW1wbGF0ZSA9IGNvbXBpbGUoJzxkaXYgZGF0YS1mb289e3tpZiB2YWwgXCJzdHVmZlwiIFwiXCJ9fT48L2Rpdj4nKTtcbiAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlLnJlbmRlcihvYmplY3QsIGVudik7XG5cbiAgZXF1YWxUb2tlbnMocmVzdWx0LmZyYWdtZW50LCAnPGRpdiBkYXRhLWZvbz1cInN0dWZmXCI+PC9kaXY+Jyk7XG5cbiAgb2JqZWN0LnZhbCA9IGZhbHNlO1xuXG4gIHJlc3VsdC5yZXJlbmRlcigpO1xuXG4gIGVxdWFsVG9rZW5zKHJlc3VsdC5mcmFnbWVudCwgJzxkaXYgZGF0YS1mb289XCJcIj48L2Rpdj4nKTtcblxufSk7XG4iXX0=
define('htmlbars-runtime-tests/hooks.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-runtime-tests');
  test('htmlbars-runtime-tests/hooks.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/hooks.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaG9va3MuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsaUNBQWlDLENBQUMsQ0FBQztBQUMxQyxNQUFJLENBQUMsb0RBQW9ELEVBQUUsWUFBVztBQUNwRSxNQUFFLENBQUMsSUFBSSxFQUFFLHFEQUFxRCxDQUFDLENBQUM7R0FDakUsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaG9va3MuanNoaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlKCdKU0hpbnQgLSBodG1sYmFycy1ydW50aW1lLXRlc3RzJyk7XG50ZXN0KCdodG1sYmFycy1ydW50aW1lLXRlc3RzL2hvb2tzLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaG9va3MuanMgc2hvdWxkIHBhc3MganNoaW50LicpOyBcbn0pO1xuIl19
define('htmlbars-runtime-tests/htmlbars-runtime.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-runtime-tests');
  test('htmlbars-runtime-tests/htmlbars-runtime.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/htmlbars-runtime.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaHRtbGJhcnMtcnVudGltZS5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQzFDLE1BQUksQ0FBQywrREFBK0QsRUFBRSxZQUFXO0FBQy9FLE1BQUUsQ0FBQyxJQUFJLEVBQUUsZ0VBQWdFLENBQUMsQ0FBQztHQUM1RSxDQUFDLENBQUMiLCJmaWxlIjoiaHRtbGJhcnMtcnVudGltZS10ZXN0cy9odG1sYmFycy1ydW50aW1lLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gaHRtbGJhcnMtcnVudGltZS10ZXN0cycpO1xudGVzdCgnaHRtbGJhcnMtcnVudGltZS10ZXN0cy9odG1sYmFycy1ydW50aW1lLmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaHRtbGJhcnMtcnVudGltZS5qcyBzaG91bGQgcGFzcyBqc2hpbnQuJyk7IFxufSk7XG4iXX0=
define('htmlbars-runtime-tests/htmlbars-runtime/expression-visitor.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-runtime-tests/htmlbars-runtime');
  test('htmlbars-runtime-tests/htmlbars-runtime/expression-visitor.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/htmlbars-runtime/expression-visitor.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaHRtbGJhcnMtcnVudGltZS9leHByZXNzaW9uLXZpc2l0b3IuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsa0RBQWtELENBQUMsQ0FBQztBQUMzRCxNQUFJLENBQUMsa0ZBQWtGLEVBQUUsWUFBVztBQUNsRyxNQUFFLENBQUMsSUFBSSxFQUFFLG1GQUFtRixDQUFDLENBQUM7R0FDL0YsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaHRtbGJhcnMtcnVudGltZS9leHByZXNzaW9uLXZpc2l0b3IuanNoaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlKCdKU0hpbnQgLSBodG1sYmFycy1ydW50aW1lLXRlc3RzL2h0bWxiYXJzLXJ1bnRpbWUnKTtcbnRlc3QoJ2h0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaHRtbGJhcnMtcnVudGltZS9leHByZXNzaW9uLXZpc2l0b3IuanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayh0cnVlLCAnaHRtbGJhcnMtcnVudGltZS10ZXN0cy9odG1sYmFycy1ydW50aW1lL2V4cHJlc3Npb24tdmlzaXRvci5qcyBzaG91bGQgcGFzcyBqc2hpbnQuJyk7IFxufSk7XG4iXX0=
define('htmlbars-runtime-tests/htmlbars-runtime/hooks.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-runtime-tests/htmlbars-runtime');
  test('htmlbars-runtime-tests/htmlbars-runtime/hooks.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/htmlbars-runtime/hooks.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaHRtbGJhcnMtcnVudGltZS9ob29rcy5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO0FBQzNELE1BQUksQ0FBQyxxRUFBcUUsRUFBRSxZQUFXO0FBQ3JGLE1BQUUsQ0FBQyxJQUFJLEVBQUUsc0VBQXNFLENBQUMsQ0FBQztHQUNsRixDQUFDLENBQUMiLCJmaWxlIjoiaHRtbGJhcnMtcnVudGltZS10ZXN0cy9odG1sYmFycy1ydW50aW1lL2hvb2tzLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gaHRtbGJhcnMtcnVudGltZS10ZXN0cy9odG1sYmFycy1ydW50aW1lJyk7XG50ZXN0KCdodG1sYmFycy1ydW50aW1lLXRlc3RzL2h0bWxiYXJzLXJ1bnRpbWUvaG9va3MuanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayh0cnVlLCAnaHRtbGJhcnMtcnVudGltZS10ZXN0cy9odG1sYmFycy1ydW50aW1lL2hvb2tzLmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
define('htmlbars-runtime-tests/htmlbars-runtime/morph.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-runtime-tests/htmlbars-runtime');
  test('htmlbars-runtime-tests/htmlbars-runtime/morph.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/htmlbars-runtime/morph.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaHRtbGJhcnMtcnVudGltZS9tb3JwaC5qc2hpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFFBQU0sQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO0FBQzNELE1BQUksQ0FBQyxxRUFBcUUsRUFBRSxZQUFXO0FBQ3JGLE1BQUUsQ0FBQyxJQUFJLEVBQUUsc0VBQXNFLENBQUMsQ0FBQztHQUNsRixDQUFDLENBQUMiLCJmaWxlIjoiaHRtbGJhcnMtcnVudGltZS10ZXN0cy9odG1sYmFycy1ydW50aW1lL21vcnBoLmpzaGludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSgnSlNIaW50IC0gaHRtbGJhcnMtcnVudGltZS10ZXN0cy9odG1sYmFycy1ydW50aW1lJyk7XG50ZXN0KCdodG1sYmFycy1ydW50aW1lLXRlc3RzL2h0bWxiYXJzLXJ1bnRpbWUvbW9ycGguanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayh0cnVlLCAnaHRtbGJhcnMtcnVudGltZS10ZXN0cy9odG1sYmFycy1ydW50aW1lL21vcnBoLmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==
define('htmlbars-runtime-tests/htmlbars-runtime/render.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-runtime-tests/htmlbars-runtime');
  test('htmlbars-runtime-tests/htmlbars-runtime/render.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/htmlbars-runtime/render.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaHRtbGJhcnMtcnVudGltZS9yZW5kZXIuanNoaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxRQUFNLENBQUMsa0RBQWtELENBQUMsQ0FBQztBQUMzRCxNQUFJLENBQUMsc0VBQXNFLEVBQUUsWUFBVztBQUN0RixNQUFFLENBQUMsSUFBSSxFQUFFLHVFQUF1RSxDQUFDLENBQUM7R0FDbkYsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaHRtbGJhcnMtcnVudGltZS9yZW5kZXIuanNoaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlKCdKU0hpbnQgLSBodG1sYmFycy1ydW50aW1lLXRlc3RzL2h0bWxiYXJzLXJ1bnRpbWUnKTtcbnRlc3QoJ2h0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvaHRtbGJhcnMtcnVudGltZS9yZW5kZXIuanMgc2hvdWxkIHBhc3MganNoaW50JywgZnVuY3Rpb24oKSB7IFxuICBvayh0cnVlLCAnaHRtbGJhcnMtcnVudGltZS10ZXN0cy9odG1sYmFycy1ydW50aW1lL3JlbmRlci5qcyBzaG91bGQgcGFzcyBqc2hpbnQuJyk7IFxufSk7XG4iXX0=
define("htmlbars-runtime-tests/main-test", ["exports", "../htmlbars-runtime", "../htmlbars-runtime/render", "../htmlbars-compiler/compiler", "../htmlbars-runtime/hooks", "../htmlbars-test-helpers", "../htmlbars-util/template-utils", "../dom-helper"], function (exports, _htmlbarsRuntime, _htmlbarsRuntimeRender, _htmlbarsCompilerCompiler, _htmlbarsRuntimeHooks, _htmlbarsTestHelpers, _htmlbarsUtilTemplateUtils, _domHelper) {

  var env = undefined;

  QUnit.module("htmlbars-runtime", {
    setup: function () {
      env = {
        dom: new _domHelper.default(),
        hooks: _htmlbarsRuntime.hooks,
        helpers: {},
        partials: {},
        useFragmentCache: true
      };
    }
  });

  function keys(obj) {
    var ownKeys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        ownKeys.push(key);
      }
    }
    return ownKeys;
  }

  test("hooks are present", function () {
    var hookNames = ["keywords", "linkRenderNode", "createScope", "classify", "createFreshScope", "createChildScope", "bindShadowScope", "bindScope", "bindSelf", "bindLocal", "bindBlock", "updateScope", "updateSelf", "updateLocal", "lookupHelper", "hasHelper", "invokeHelper", "range", "block", "inline", "keyword", "partial", "component", "element", "attribute", "subexpr", "concat", "get", "getRoot", "getChild", "getValue", "cleanupRenderNode", "destroyRenderNode", "willCleanupTree", "didCleanupTree", "getCellOrValue", "didRenderNode", "willRenderNode"];

    for (var i = 0; i < hookNames.length; i++) {
      var hook = _htmlbarsRuntime.hooks[hookNames[i]];
      ok(hook !== undefined, "hook " + hookNames[i] + " is present");
    }

    equal(keys(_htmlbarsRuntime.hooks).length, hookNames.length, "Hooks length match");
  });

  test("manualElement function honors namespaces", function () {
    _htmlbarsRuntime.hooks.keywords['manual-element'] = {
      render: function (morph, env, scope, params, hash, template, inverse, visitor) {
        var attributes = {
          version: '1.1'
        };

        var layout = _htmlbarsRuntimeRender.manualElement('svg', attributes);

        _htmlbarsRuntimeHooks.hostBlock(morph, env, scope, template, inverse, null, visitor, function (options) {
          options.templates.template.yieldIn({ raw: layout }, hash);
        });

        _htmlbarsRuntimeRender.manualElement(env, scope, 'span', attributes, morph);
      },

      isStable: function () {
        return true;
      }
    };

    var template = _htmlbarsCompilerCompiler.compile('{{#manual-element}}<linearGradient><stop offset="{{startOffset}}"></stop><stop offset="{{stopOffset}}"></stop></linearGradient>{{/manual-element}}');
    var result = template.render({ startOffset: 0.1, stopOffset: 0.6 }, env);
    ok(result.fragment.childNodes[1] instanceof SVGElement);
    ok(result.fragment.childNodes[1].childNodes[0] instanceof SVGLinearGradientElement);
    _htmlbarsTestHelpers.equalTokens(result.fragment, '<svg version="1.1"><linearGradient><stop offset="0.1"></stop><stop offset="0.6"></stop></linearGradient></svg>');
  });

  test("manualElement function honors void elements", function () {
    var attributes = {
      class: 'foo-bar'
    };
    var layout = _htmlbarsRuntimeRender.manualElement('input', attributes);
    var fragment = layout.buildFragment(new _domHelper.default());

    equal(fragment.childNodes.length, 1, 'includes a single element');
    equal(fragment.childNodes[0].childNodes.length, 0, 'no child nodes were added to `<input>` because it is a void tag');
    _htmlbarsTestHelpers.equalTokens(fragment, '<input class="foo-bar">');
  });

  test("attachAttributes function attaches attributes to an existing element", function () {
    var attributes = {
      class: 'foo-bar',
      other: ['get', 'other']
    };

    var element = document.createElement('div');
    var raw = _htmlbarsRuntimeRender.attachAttributes(attributes);
    raw.element = element;

    var template = _htmlbarsRuntimeHooks.wrap(raw);

    var self = { other: "first" };
    var result = template.render(self, env);

    equal(element.getAttribute('class'), "foo-bar", "the attribute was assigned");
    equal(element.getAttribute('other'), "first", "the attribute was assigned");

    self.other = "second";
    result.rerender();

    equal(element.getAttribute('class'), "foo-bar", "the attribute was assigned");
    equal(element.getAttribute('other'), "second", "the attribute was assigned");
  });

  test("the 'attributes' statement attaches an attributes template to a parent", function () {
    env.hooks.attributes = function (morph, env, scope, template, fragment, visitor) {
      var block = morph.state.block;

      if (!block) {
        var element = fragment.firstChild;
        template.element = element;
        block = morph.state.block = _htmlbarsUtilTemplateUtils.blockFor(_htmlbarsRuntimeRender.default, template, { scope: scope });
      }

      block(env, [], undefined, morph, undefined, visitor);
    };

    var cleanedUpNodes = [];
    env.hooks.cleanupRenderNode = function (node) {
      cleanedUpNodes.push(node);
    };

    var attributes = {
      class: 'foo-bar',
      other: ['get', 'other']
    };

    var template = _htmlbarsCompilerCompiler.compile("<div>hello</div>");

    var self = { other: "first" };
    var result = template.render(self, env, { attributes: attributes });
    var attributesMorph = result.nodes[result.nodes.length - 1];

    _htmlbarsTestHelpers.equalTokens(result.fragment, "<div class='foo-bar' other='first'>hello</div>");

    self.other = "second";
    result.rerender();

    _htmlbarsTestHelpers.equalTokens(result.fragment, "<div class='foo-bar' other='second'>hello</div>");

    var expected = [result.root, attributesMorph, attributesMorph.childNodes[0]];
    _htmlbarsUtilTemplateUtils.clearMorph(result.root, env, true);

    deepEqual(cleanedUpNodes, expected);
  });
});
/*globals SVGElement, SVGLinearGradientElement */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvbWFpbi10ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUEsTUFBSSxHQUFHLFlBQUEsQ0FBQzs7QUFFUixPQUFLLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFO0FBQy9CLFNBQUssRUFBQSxZQUFHO0FBQ04sU0FBRyxHQUFHO0FBQ0osV0FBRyxFQUFFLHdCQUFlO0FBQ3BCLGFBQUssbUJBZkYsS0FBSyxBQWVJO0FBQ1osZUFBTyxFQUFFLEVBQUU7QUFDWCxnQkFBUSxFQUFFLEVBQUU7QUFDWix3QkFBZ0IsRUFBRSxJQUFJO09BQ3ZCLENBQUM7S0FDSDtHQUNGLENBQUMsQ0FBQzs7QUFFSCxXQUFTLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDakIsUUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFNBQUssSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFO0FBQ25CLFVBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUMzQixlQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ25CO0tBQ0Y7QUFDRCxXQUFPLE9BQU8sQ0FBQztHQUNoQjs7QUFFRCxNQUFJLENBQUMsbUJBQW1CLEVBQUUsWUFBWTtBQUNwQyxRQUFJLFNBQVMsR0FBRyxDQUNkLFVBQVUsRUFDVixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLFVBQVUsRUFDVixrQkFBa0IsRUFDbEIsa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQixXQUFXLEVBQ1gsVUFBVSxFQUNWLFdBQVcsRUFDWCxXQUFXLEVBQ1gsYUFBYSxFQUNiLFlBQVksRUFDWixhQUFhLEVBQ2IsY0FBYyxFQUNkLFdBQVcsRUFDWCxjQUFjLEVBQ2QsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsU0FBUyxFQUNULFNBQVMsRUFDVCxXQUFXLEVBQ1gsU0FBUyxFQUNULFdBQVcsRUFDWCxTQUFTLEVBQ1QsUUFBUSxFQUNSLEtBQUssRUFD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QU8sQ0FzS1Msa0JBQWtCLENBQUMsQ0FBQzs7QUFFM0MsUUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDOUIsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsVUFBVSxFQUFWLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDeEQsUUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFNUQseUJBMUtPLFdBQVcsQ0EwS04sTUFBTSxDQUFDLFFBQVEsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDOztBQUUvRSxRQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztBQUN0QixVQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7O0FBRWxCLHlCQS9LTyxXQUFXLENBK0tOLE1BQU0sQ0FBQyxRQUFRLEVBQUUsaURBQWlELENBQUMsQ0FBQzs7QUFFaEYsUUFBSSxRQUFRLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0UsK0JBakxPLFVBQVUsQ0FpTE4sTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRW5DLGFBQVMsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FDckMsQ0FBQyxDQUFDIiwiZmlsZSI6Imh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvbWFpbi10ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypnbG9iYWxzIFNWR0VsZW1lbnQsIFNWR0xpbmVhckdyYWRpZW50RWxlbWVudCAqL1xuaW1wb3J0IHsgaG9va3MgfSBmcm9tIFwiLi4vaHRtbGJhcnMtcnVudGltZVwiO1xuaW1wb3J0IHJlbmRlciBmcm9tIFwiLi4vaHRtbGJhcnMtcnVudGltZS9yZW5kZXJcIjtcbmltcG9ydCB7IG1hbnVhbEVsZW1lbnQsIGF0dGFjaEF0dHJpYnV0ZXMgfSBmcm9tIFwiLi4vaHRtbGJhcnMtcnVudGltZS9yZW5kZXJcIjtcbmltcG9ydCB7IGNvbXBpbGUgfSBmcm9tIFwiLi4vaHRtbGJhcnMtY29tcGlsZXIvY29tcGlsZXJcIjtcbmltcG9ydCB7IGhvc3RCbG9jaywgd3JhcCB9IGZyb20gXCIuLi9odG1sYmFycy1ydW50aW1lL2hvb2tzXCI7XG5pbXBvcnQgeyBlcXVhbFRva2VucyB9IGZyb20gXCIuLi9odG1sYmFycy10ZXN0LWhlbHBlcnNcIjtcbmltcG9ydCB7IGNsZWFyTW9ycGgsIGJsb2NrRm9yIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHNcIjtcbmltcG9ydCBET01IZWxwZXIgZnJvbSBcIi4uL2RvbS1oZWxwZXJcIjtcblxubGV0IGVudjtcblxuUVVuaXQubW9kdWxlKFwiaHRtbGJhcnMtcnVudGltZVwiLCB7XG4gIHNldHVwKCkge1xuICAgIGVudiA9IHtcbiAgICAgIGRvbTogbmV3IERPTUhlbHBlcigpLFxuICAgICAgaG9va3M6IGhvb2tzLFxuICAgICAgaGVscGVyczoge30sXG4gICAgICBwYXJ0aWFsczoge30sXG4gICAgICB1c2VGcmFnbWVudENhY2hlOiB0cnVlXG4gICAgfTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGtleXMob2JqKSB7XG4gIHZhciBvd25LZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIG93bktleXMucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3duS2V5cztcbn1cblxudGVzdChcImhvb2tzIGFyZSBwcmVzZW50XCIsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvb2tOYW1lcyA9IFtcbiAgICBcImtleXdvcmRzXCIsXG4gICAgXCJsaW5rUmVuZGVyTm9kZVwiLFxuICAgIFwiY3JlYXRlU2NvcGVcIixcbiAgICBcImNsYXNzaWZ5XCIsXG4gICAgXCJjcmVhdGVGcmVzaFNjb3BlXCIsXG4gICAgXCJjcmVhdGVDaGlsZFNjb3BlXCIsXG4gICAgXCJiaW5kU2hhZG93U2NvcGVcIixcbiAgICBcImJpbmRTY29wZVwiLFxuICAgIFwiYmluZFNlbGZcIixcbiAgICBcImJpbmRMb2NhbFwiLFxuICAgIFwiYmluZEJsb2NrXCIsXG4gICAgXCJ1cGRhdGVTY29wZVwiLFxuICAgIFwidXBkYXRlU2VsZlwiLFxuICAgIFwidXBkYXRlTG9jYWxcIixcbiAgICBcImxvb2t1cEhlbHBlclwiLFxuICAgIFwiaGFzSGVscGVyXCIsXG4gICAgXCJpbnZva2VIZWxwZXJcIixcbiAgICBcInJhbmdlXCIsXG4gICAgXCJibG9ja1wiLFxuICAgIFwiaW5saW5lXCIsXG4gICAgXCJrZXl3b3JkXCIsXG4gICAgXCJwYXJ0aWFsXCIsXG4gICAgXCJjb21wb25lbnRcIixcbiAgICBcImVsZW1lbnRcIixcbiAgICBcImF0dHJpYnV0ZVwiLFxuICAgIFwic3ViZXhwclwiLFxuICAgIFwiY29uY2F0XCIsXG4gICAgXCJnZXRcIixcbiAgICBcImdldFJvb3RcIixcbiAgICBcImdldENoaWxkXCIsXG4gICAgXCJnZXRWYWx1ZVwiLFxuICAgIFwiY2xlYW51cFJlbmRlck5vZGVcIixcbiAgICBcImRlc3Ryb3lSZW5kZXJOb2RlXCIsXG4gICAgXCJ3aWxsQ2xlYW51cFRyZWVcIixcbiAgICBcImRpZENsZWFudXBUcmVlXCIsXG4gICAgXCJnZXRDZWxsT3JWYWx1ZVwiLFxuICAgIFwiZGlkUmVuZGVyTm9kZVwiLFxuICAgIFwid2lsbFJlbmRlck5vZGVcIlxuICBdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaG9va05hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGhvb2sgPSBob29rc1tob29rTmFtZXNbaV1dO1xuICAgIG9rKGhvb2sgIT09IHVuZGVmaW5lZCwgXCJob29rIFwiICsgaG9va05hbWVzW2ldICsgXCIgaXMgcHJlc2VudFwiKTtcbiAgfVxuXG4gIGVxdWFsKGtleXMoaG9va3MpLmxlbmd0aCwgaG9va05hbWVzLmxlbmd0aCwgXCJIb29rcyBsZW5ndGggbWF0Y2hcIik7XG59KTtcblxudGVzdChcIm1hbnVhbEVsZW1lbnQgZnVuY3Rpb24gaG9ub3JzIG5hbWVzcGFjZXNcIiwgZnVuY3Rpb24oKSB7XG4gIGhvb2tzLmtleXdvcmRzWydtYW51YWwtZWxlbWVudCddID0ge1xuICAgICAgcmVuZGVyOiBmdW5jdGlvbihtb3JwaCwgZW52LCBzY29wZSwgcGFyYW1zLCBoYXNoLCB0ZW1wbGF0ZSwgaW52ZXJzZSwgdmlzaXRvcikge1xuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IHtcbiAgICAgICAgICB2ZXJzaW9uOiAnMS4xJ1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBsYXlvdXQgPSBtYW51YWxFbGVtZW50KCdzdmcnLCBhdHRyaWJ1dGVzKTtcblxuICAgICAgICBob3N0QmxvY2sobW9ycGgsIGVudiwgc2NvcGUsIHRlbXBsYXRlLCBpbnZlcnNlLCBudWxsLCB2aXNpdG9yLCBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgICAgb3B0aW9ucy50ZW1wbGF0ZXMudGVtcGxhdGUueWllbGRJbih7IHJhdzogbGF5b3V0IH0sIGhhc2gpO1xuICAgICAgICB9KTtcblxuICAgICAgICBtYW51YWxFbGVtZW50KGVudiwgc2NvcGUsICdzcGFuJywgYXR0cmlidXRlcywgbW9ycGgpO1xuICAgICAgfSxcblxuICAgICAgaXNTdGFibGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIH07XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBjb21waWxlKCd7eyNtYW51YWwtZWxlbWVudH19PGxpbmVhckdyYWRpZW50PjxzdG9wIG9mZnNldD1cInt7c3RhcnRPZmZzZXR9fVwiPjwvc3RvcD48c3RvcCBvZmZzZXQ9XCJ7e3N0b3BPZmZzZXR9fVwiPjwvc3RvcD48L2xpbmVhckdyYWRpZW50Pnt7L21hbnVhbC1lbGVtZW50fX0nKTtcbiAgICB2YXIgcmVzdWx0ID0gdGVtcGxhdGUucmVuZGVyKHtzdGFydE9mZnNldDowLjEsIHN0b3BPZmZzZXQ6MC42fSwgZW52KTtcbiAgICBvayhyZXN1bHQuZnJhZ21lbnQuY2hpbGROb2Rlc1sxXSBpbnN0YW5jZW9mIFNWR0VsZW1lbnQpO1xuICAgIG9rKHJlc3VsdC5mcmFnbWVudC5jaGlsZE5vZGVzWzFdLmNoaWxkTm9kZXNbMF0gaW5zdGFuY2VvZiBTVkdMaW5lYXJHcmFkaWVudEVsZW1lbnQpO1xuICAgIGVxdWFsVG9rZW5zKHJlc3VsdC5mcmFnbWVudCwgJzxzdmcgdmVyc2lvbj1cIjEuMVwiPjxsaW5lYXJHcmFkaWVudD48c3RvcCBvZmZzZXQ9XCIwLjFcIj48L3N0b3A+PHN0b3Agb2Zmc2V0PVwiMC42XCI+PC9zdG9wPjwvbGluZWFyR3JhZGllbnQ+PC9zdmc+Jyk7XG59KTtcblxudGVzdChcIm1hbnVhbEVsZW1lbnQgZnVuY3Rpb24gaG9ub3JzIHZvaWQgZWxlbWVudHNcIiwgZnVuY3Rpb24oKSB7XG4gIHZhciBhdHRyaWJ1dGVzID0ge1xuICAgIGNsYXNzOiAnZm9vLWJhcidcbiAgfTtcbiAgdmFyIGxheW91dCA9IG1hbnVhbEVsZW1lbnQoJ2lucHV0JywgYXR0cmlidXRlcyk7XG4gIHZhciBmcmFnbWVudCA9IGxheW91dC5idWlsZEZyYWdtZW50KG5ldyBET01IZWxwZXIoKSk7XG5cbiAgZXF1YWwoZnJhZ21lbnQuY2hpbGROb2Rlcy5sZW5ndGgsIDEsICdpbmNsdWRlcyBhIHNpbmdsZSBlbGVtZW50Jyk7XG4gIGVxdWFsKGZyYWdtZW50LmNoaWxkTm9kZXNbMF0uY2hpbGROb2Rlcy5sZW5ndGgsIDAsICdubyBjaGlsZCBub2RlcyB3ZXJlIGFkZGVkIHRvIGA8aW5wdXQ+YCBiZWNhdXNlIGl0IGlzIGEgdm9pZCB0YWcnKTtcbiAgZXF1YWxUb2tlbnMoZnJhZ21lbnQsICc8aW5wdXQgY2xhc3M9XCJmb28tYmFyXCI+Jyk7XG59KTtcblxudGVzdChcImF0dGFjaEF0dHJpYnV0ZXMgZnVuY3Rpb24gYXR0YWNoZXMgYXR0cmlidXRlcyB0byBhbiBleGlzdGluZyBlbGVtZW50XCIsIGZ1bmN0aW9uKCkge1xuICB2YXIgYXR0cmlidXRlcyA9IHtcbiAgICBjbGFzczogJ2Zvby1iYXInLFxuICAgIG90aGVyOiBbJ2dldCcsICdvdGhlciddXG4gIH07XG5cbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgbGV0IHJhdyA9IGF0dGFjaEF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG4gIHJhdy5lbGVtZW50ID0gZWxlbWVudDtcblxuICBsZXQgdGVtcGxhdGUgPSB3cmFwKHJhdyk7XG5cbiAgbGV0IHNlbGYgPSB7IG90aGVyOiBcImZpcnN0XCIgfTtcbiAgbGV0IHJlc3VsdCA9IHRlbXBsYXRlLnJlbmRlcihzZWxmLCBlbnYpO1xuXG4gIGVxdWFsKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpLCBcImZvby1iYXJcIiwgXCJ0aGUgYXR0cmlidXRlIHdhcyBhc3NpZ25lZFwiKTtcbiAgZXF1YWwoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ290aGVyJyksIFwiZmlyc3RcIiwgXCJ0aGUgYXR0cmlidXRlIHdhcyBhc3NpZ25lZFwiKTtcblxuICBzZWxmLm90aGVyID0gXCJzZWNvbmRcIjtcbiAgcmVzdWx0LnJlcmVuZGVyKCk7XG5cbiAgZXF1YWwoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJyksIFwiZm9vLWJhclwiLCBcInRoZSBhdHRyaWJ1dGUgd2FzIGFzc2lnbmVkXCIpO1xuICBlcXVhbChlbGVtZW50LmdldEF0dHJpYnV0ZSgnb3RoZXInKSwgXCJzZWNvbmRcIiwgXCJ0aGUgYXR0cmlidXRlIHdhcyBhc3NpZ25lZFwiKTtcbn0pO1xuXG50ZXN0KFwidGhlICdhdHRyaWJ1dGVzJyBzdGF0ZW1lbnQgYXR0YWNoZXMgYW4gYXR0cmlidXRlcyB0ZW1wbGF0ZSB0byBhIHBhcmVudFwiLCBmdW5jdGlvbigpIHtcbiAgZW52Lmhvb2tzLmF0dHJpYnV0ZXMgPSBmdW5jdGlvbihtb3JwaCwgZW52LCBzY29wZSwgdGVtcGxhdGUsIGZyYWdtZW50LCB2aXNpdG9yKSB7XG4gICAgbGV0IGJsb2NrID0gbW9ycGguc3RhdGUuYmxvY2s7XG5cbiAgICBpZiAoIWJsb2NrKSB7XG4gICAgICBsZXQgZWxlbWVudCA9IGZyYWdtZW50LmZpcnN0Q2hpbGQ7XG4gICAgICB0ZW1wbGF0ZS5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIGJsb2NrID0gbW9ycGguc3RhdGUuYmxvY2sgPSBibG9ja0ZvcihyZW5kZXIsIHRlbXBsYXRlLCB7IHNjb3BlOiBzY29wZSB9KTtcbiAgICB9XG5cbiAgICBibG9jayhlbnYsIFtdLCB1bmRlZmluZWQsIG1vcnBoLCB1bmRlZmluZWQsIHZpc2l0b3IpO1xuICB9O1xuXG4gIGxldCBjbGVhbmVkVXBOb2RlcyA9IFtdO1xuICBlbnYuaG9va3MuY2xlYW51cFJlbmRlck5vZGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgY2xlYW5lZFVwTm9kZXMucHVzaChub2RlKTtcbiAgfTtcblxuICB2YXIgYXR0cmlidXRlcyA9IHtcbiAgICBjbGFzczogJ2Zvby1iYXInLFxuICAgIG90aGVyOiBbJ2dldCcsICdvdGhlciddXG4gIH07XG5cbiAgbGV0IHRlbXBsYXRlID0gY29tcGlsZShcIjxkaXY+aGVsbG88L2Rpdj5cIik7XG5cbiAgbGV0IHNlbGYgPSB7IG90aGVyOiBcImZpcnN0XCIgfTtcbiAgbGV0IHJlc3VsdCA9IHRlbXBsYXRlLnJlbmRlcihzZWxmLCBlbnYsIHsgYXR0cmlidXRlcyB9KTtcbiAgbGV0IGF0dHJpYnV0ZXNNb3JwaCA9IHJlc3VsdC5ub2Rlc1tyZXN1bHQubm9kZXMubGVuZ3RoIC0gMV07XG5cbiAgZXF1YWxUb2tlbnMocmVzdWx0LmZyYWdtZW50LCBcIjxkaXYgY2xhc3M9J2Zvby1iYXInIG90aGVyPSdmaXJzdCc+aGVsbG88L2Rpdj5cIik7XG5cbiAgc2VsZi5vdGhlciA9IFwic2Vjb25kXCI7XG4gIHJlc3VsdC5yZXJlbmRlcigpO1xuXG4gIGVxdWFsVG9rZW5zKHJlc3VsdC5mcmFnbWVudCwgXCI8ZGl2IGNsYXNzPSdmb28tYmFyJyBvdGhlcj0nc2Vjb25kJz5oZWxsbzwvZGl2PlwiKTtcblxuICBsZXQgZXhwZWN0ZWQgPSBbcmVzdWx0LnJvb3QsIGF0dHJpYnV0ZXNNb3JwaCwgYXR0cmlidXRlc01vcnBoLmNoaWxkTm9kZXNbMF1dO1xuICBjbGVhck1vcnBoKHJlc3VsdC5yb290LCBlbnYsIHRydWUpO1xuXG4gIGRlZXBFcXVhbChjbGVhbmVkVXBOb2RlcywgZXhwZWN0ZWQpO1xufSk7XG4iXX0=
define('htmlbars-runtime-tests/main-test.jshint', ['exports'], function (exports) {
  module('JSHint - htmlbars-runtime-tests');
  test('htmlbars-runtime-tests/main-test.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/main-test.js should pass jshint.');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvbWFpbi10ZXN0LmpzaGludC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDMUMsTUFBSSxDQUFDLHdEQUF3RCxFQUFFLFlBQVc7QUFDeEUsTUFBRSxDQUFDLElBQUksRUFBRSx5REFBeUQsQ0FBQyxDQUFDO0dBQ3JFLENBQUMsQ0FBQyIsImZpbGUiOiJodG1sYmFycy1ydW50aW1lLXRlc3RzL21haW4tdGVzdC5qc2hpbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUoJ0pTSGludCAtIGh0bWxiYXJzLXJ1bnRpbWUtdGVzdHMnKTtcbnRlc3QoJ2h0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvbWFpbi10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludCcsIGZ1bmN0aW9uKCkgeyBcbiAgb2sodHJ1ZSwgJ2h0bWxiYXJzLXJ1bnRpbWUtdGVzdHMvbWFpbi10ZXN0LmpzIHNob3VsZCBwYXNzIGpzaGludC4nKTsgXG59KTtcbiJdfQ==