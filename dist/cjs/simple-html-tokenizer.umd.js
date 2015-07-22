/* global define:false, module:false */

var _simpleHtmlTokenizer = require('./simple-html-tokenizer');

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.HTML5Tokenizer = factory();
  }
})(this, function () {
  return {
    EventedTokenizer: _simpleHtmlTokenizer.EventedTokenizer,
    Tokenizer: _simpleHtmlTokenizer.Tokenizer,
    tokenize: _simpleHtmlTokenizer.tokenize,
    Generator: _simpleHtmlTokenizer.Generator,
    generate: _simpleHtmlTokenizer.generate,
    StartTag: _simpleHtmlTokenizer.StartTag,
    EndTag: _simpleHtmlTokenizer.EndTag,
    Chars: _simpleHtmlTokenizer.Chars,
    Comment: _simpleHtmlTokenizer.Comment
  };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNpbXBsZS1odG1sLXRva2VuaXplci51bWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7bUNBR08seUJBQXlCOztBQUVoQyxBQUFDLENBQUEsVUFBVSxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3hCLE1BQUksT0FBTyxNQUFNLEtBQUssVUFBVSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7QUFDOUMsVUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztHQUNyQixNQUFNLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO0FBQ3RDLFVBQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxFQUFFLENBQUM7R0FDNUIsTUFBTTtBQUNMLFFBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxFQUFFLENBQUM7R0FDakM7Q0FDRixDQUFBLENBQUMsSUFBSSxFQUFFLFlBQVk7QUFDbEIsU0FBTztBQUNMLG9CQUFnQix1QkFibEIsZ0JBQWdCLEFBYW9CO0FBQ2xDLGFBQVMsdUJBZE8sU0FBUyxBQWNMO0FBQ3BCLFlBQVEsdUJBZm1CLFFBQVEsQUFlakI7QUFDbEIsYUFBUyx1QkFoQjRCLFNBQVMsQUFnQjFCO0FBQ3BCLFlBQVEsdUJBakJ3QyxRQUFRLEFBaUJ0QztBQUNsQixZQUFRLHVCQWxCa0QsUUFBUSxBQWtCaEQ7QUFDbEIsVUFBTSx1QkFuQjhELE1BQU0sQUFtQjVEO0FBQ2QsU0FBSyx1QkFwQnVFLEtBQUssQUFvQnJFO0FBQ1osV0FBTyx1QkFyQjRFLE9BQU8sQUFxQjFFO0dBQ2pCLENBQUM7Q0FDSCxDQUFDLENBQUUiLCJmaWxlIjoic2ltcGxlLWh0bWwtdG9rZW5pemVyLnVtZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBkZWZpbmU6ZmFsc2UsIG1vZHVsZTpmYWxzZSAqL1xuaW1wb3J0IHtcbiAgRXZlbnRlZFRva2VuaXplciwgVG9rZW5pemVyLCB0b2tlbml6ZSwgR2VuZXJhdG9yLCBnZW5lcmF0ZSwgU3RhcnRUYWcsIEVuZFRhZywgQ2hhcnMsIENvbW1lbnRcbn0gZnJvbSAnLi9zaW1wbGUtaHRtbC10b2tlbml6ZXInO1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5IVE1MNVRva2VuaXplciA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgRXZlbnRlZFRva2VuaXplcjogRXZlbnRlZFRva2VuaXplcixcbiAgICBUb2tlbml6ZXI6IFRva2VuaXplcixcbiAgICB0b2tlbml6ZTogdG9rZW5pemUsXG4gICAgR2VuZXJhdG9yOiBHZW5lcmF0b3IsXG4gICAgZ2VuZXJhdGU6IGdlbmVyYXRlLFxuICAgIFN0YXJ0VGFnOiBTdGFydFRhZyxcbiAgICBFbmRUYWc6IEVuZFRhZyxcbiAgICBDaGFyczogQ2hhcnMsXG4gICAgQ29tbWVudDogQ29tbWVudFxuICB9O1xufSkpO1xuIl19