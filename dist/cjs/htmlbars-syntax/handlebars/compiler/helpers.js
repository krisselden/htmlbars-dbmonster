exports.__esModule = true;
exports.SourceLocation = SourceLocation;
exports.id = id;
exports.stripFlags = stripFlags;
exports.stripComment = stripComment;
exports.preparePath = preparePath;
exports.prepareMustache = prepareMustache;
exports.prepareRawBlock = prepareRawBlock;
exports.prepareBlock = prepareBlock;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

function SourceLocation(source, locInfo) {
  this.source = source;
  this.start = {
    line: locInfo.first_line,
    column: locInfo.first_column
  };
  this.end = {
    line: locInfo.last_line,
    column: locInfo.last_column
  };
}

function id(token) {
  if (/^\[.*\]$/.test(token)) {
    return token.substr(1, token.length - 2);
  } else {
    return token;
  }
}

function stripFlags(open, close) {
  return {
    open: open.charAt(2) === '~',
    close: close.charAt(close.length - 3) === '~'
  };
}

function stripComment(comment) {
  return comment.replace(/^\{\{~?\!-?-?/, '').replace(/-?-?~?\}\}$/, '');
}

function preparePath(data, parts, locInfo) {
  locInfo = this.locInfo(locInfo);

  var original = data ? '@' : '',
      dig = [],
      depth = 0,
      depthString = '';

  for (var i = 0, l = parts.length; i < l; i++) {
    var part = parts[i].part,

    // If we have [] syntax then we do not treat path references as operators,
    // i.e. foo.[this] resolves to approximately context.foo['this']
    isLiteral = parts[i].original !== part;
    original += (parts[i].separator || '') + part;

    if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
      if (dig.length > 0) {
        throw new _exception2.default('Invalid path: ' + original, { loc: locInfo });
      } else if (part === '..') {
        depth++;
        depthString += '../';
      }
    } else {
      dig.push(part);
    }
  }

  return new this.PathExpression(data, depth, dig, original, locInfo);
}

function prepareMustache(path, params, hash, open, strip, locInfo) {
  // Must use charAt to support IE pre-10
  var escapeFlag = open.charAt(3) || open.charAt(2),
      escaped = escapeFlag !== '{' && escapeFlag !== '&';

  return new this.MustacheStatement(path, params, hash, escaped, strip, this.locInfo(locInfo));
}

function prepareRawBlock(openRawBlock, content, close, locInfo) {
  if (openRawBlock.path.original !== close) {
    var errorNode = { loc: openRawBlock.path.loc };

    throw new _exception2.default(openRawBlock.path.original + " doesn't match " + close, errorNode);
  }

  locInfo = this.locInfo(locInfo);
  var program = new this.Program([content], null, {}, locInfo);

  return new this.BlockStatement(openRawBlock.path, openRawBlock.params, openRawBlock.hash, program, undefined, {}, {}, {}, locInfo);
}

function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
  // When we are chaining inverse calls, we will not have a close path
  if (close && close.path && openBlock.path.original !== close.path.original) {
    var errorNode = { loc: openBlock.path.loc };

    throw new _exception2.default(openBlock.path.original + ' doesn\'t match ' + close.path.original, errorNode);
  }

  program.blockParams = openBlock.blockParams;

  var inverse = undefined,
      inverseStrip = undefined;

  if (inverseAndProgram) {
    if (inverseAndProgram.chain) {
      inverseAndProgram.program.body[0].closeStrip = close.strip;
    }

    inverseStrip = inverseAndProgram.strip;
    inverse = inverseAndProgram.program;
  }

  if (inverted) {
    inverted = inverse;
    inverse = program;
    program = inverted;
  }

  return new this.BlockStatement(openBlock.path, openBlock.params, openBlock.hash, program, inverse, openBlock.strip, inverseStrip, close && close.strip, this.locInfo(locInfo));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXN5bnRheC9oYW5kbGViYXJzL2NvbXBpbGVyL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUVnQixjQUFjLEdBQWQsY0FBYztRQVlkLEVBQUUsR0FBRixFQUFFO1FBUUYsVUFBVSxHQUFWLFVBQVU7UUFPVixZQUFZLEdBQVosWUFBWTtRQUtaLFdBQVcsR0FBWCxXQUFXO1FBOEJYLGVBQWUsR0FBZixlQUFlO1FBUWYsZUFBZSxHQUFmLGVBQWU7UUFpQmYsWUFBWSxHQUFaLFlBQVk7Ozs7eUJBekZOLGNBQWM7Ozs7QUFFN0IsU0FBUyxjQUFjLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUM5QyxNQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixNQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsUUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVO0FBQ3hCLFVBQU0sRUFBRSxPQUFPLENBQUMsWUFBWTtHQUM3QixDQUFDO0FBQ0YsTUFBSSxDQUFDLEdBQUcsR0FBRztBQUNULFFBQUksRUFBRSxPQUFPLENBQUMsU0FBUztBQUN2QixVQUFNLEVBQUUsT0FBTyxDQUFDLFdBQVc7R0FDNUIsQ0FBQztDQUNIOztBQUVNLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRTtBQUN4QixNQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDMUIsV0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzFDLE1BQU07QUFDTCxXQUFPLEtBQUssQ0FBQztHQUNkO0NBQ0Y7O0FBRU0sU0FBUyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUN0QyxTQUFPO0FBQ0wsUUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRztBQUM1QixTQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENB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S0FDNUQ7O0FBRUQsZ0JBQVksR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7QUFDdkMsV0FBTyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztHQUNyQzs7QUFFRCxNQUFJLFFBQVEsRUFBRTtBQUNaLFlBQVEsR0FBRyxPQUFPLENBQUM7QUFDbkIsV0FBTyxHQUFHLE9BQU8sQ0FBQztBQUNsQixXQUFPLEdBQUcsUUFBUSxDQUFDO0dBQ3BCOztBQUVELFNBQU8sSUFBSSxJQUFJLENBQUMsY0FBYyxDQUMxQixTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksRUFDaEQsT0FBTyxFQUFFLE9BQU8sRUFDaEIsU0FBUyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUM1QiIsImZpbGUiOiJodG1sYmFycy1zeW50YXgvaGFuZGxlYmFycy9jb21waWxlci9oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuLi9leGNlcHRpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gU291cmNlTG9jYXRpb24oc291cmNlLCBsb2NJbmZvKSB7XG4gIHRoaXMuc291cmNlID0gc291cmNlO1xuICB0aGlzLnN0YXJ0ID0ge1xuICAgIGxpbmU6IGxvY0luZm8uZmlyc3RfbGluZSxcbiAgICBjb2x1bW46IGxvY0luZm8uZmlyc3RfY29sdW1uXG4gIH07XG4gIHRoaXMuZW5kID0ge1xuICAgIGxpbmU6IGxvY0luZm8ubGFzdF9saW5lLFxuICAgIGNvbHVtbjogbG9jSW5mby5sYXN0X2NvbHVtblxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaWQodG9rZW4pIHtcbiAgaWYgKC9eXFxbLipcXF0kLy50ZXN0KHRva2VuKSkge1xuICAgIHJldHVybiB0b2tlbi5zdWJzdHIoMSwgdG9rZW4ubGVuZ3RoIC0gMik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRva2VuO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcEZsYWdzKG9wZW4sIGNsb3NlKSB7XG4gIHJldHVybiB7XG4gICAgb3Blbjogb3Blbi5jaGFyQXQoMikgPT09ICd+JyxcbiAgICBjbG9zZTogY2xvc2UuY2hhckF0KGNsb3NlLmxlbmd0aCAtIDMpID09PSAnfidcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwQ29tbWVudChjb21tZW50KSB7XG4gIHJldHVybiBjb21tZW50LnJlcGxhY2UoL15cXHtcXHt+P1xcIS0/LT8vLCAnJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvLT8tP34/XFx9XFx9JC8sICcnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVQYXRoKGRhdGEsIHBhcnRzLCBsb2NJbmZvKSB7XG4gIGxvY0luZm8gPSB0aGlzLmxvY0luZm8obG9jSW5mbyk7XG5cbiAgbGV0IG9yaWdpbmFsID0gZGF0YSA/ICdAJyA6ICcnLFxuICAgICAgZGlnID0gW10sXG4gICAgICBkZXB0aCA9IDAsXG4gICAgICBkZXB0aFN0cmluZyA9ICcnO1xuXG4gIGZvciAobGV0IGkgPSAwLCBsID0gcGFydHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgbGV0IHBhcnQgPSBwYXJ0c1tpXS5wYXJ0LFxuICAgICAgICAvLyBJZiB3ZSBoYXZlIFtdIHN5bnRheCB0aGVuIHdlIGRvIG5vdCB0cmVhdCBwYXRoIHJlZmVyZW5jZXMgYXMgb3BlcmF0b3JzLFxuICAgICAgICAvLyBpLmUuIGZvby5bdGhpc10gcmVzb2x2ZXMgdG8gYXBwcm94aW1hdGVseSBjb250ZXh0LmZvb1sndGhpcyddXG4gICAgICAgIGlzTGl0ZXJhbCA9IHBhcnRzW2ldLm9yaWdpbmFsICE9PSBwYXJ0O1xuICAgIG9yaWdpbmFsICs9IChwYXJ0c1tpXS5zZXBhcmF0b3IgfHwgJycpICsgcGFydDtcblxuICAgIGlmICghaXNMaXRlcmFsICYmIChwYXJ0ID09PSAnLi4nIHx8IHBhcnQgPT09ICcuJyB8fCBwYXJ0ID09PSAndGhpcycpKSB7XG4gICAgICBpZiAoZGlnLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignSW52YWxpZCBwYXRoOiAnICsgb3JpZ2luYWwsIHtsb2M6IGxvY0luZm99KTtcbiAgICAgIH0gZWxzZSBpZiAocGFydCA9PT0gJy4uJykge1xuICAgICAgICBkZXB0aCsrO1xuICAgICAgICBkZXB0aFN0cmluZyArPSAnLi4vJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGlnLnB1c2gocGFydCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyB0aGlzLlBhdGhFeHByZXNzaW9uKGRhdGEsIGRlcHRoLCBkaWcsIG9yaWdpbmFsLCBsb2NJbmZvKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVNdXN0YWNoZShwYXRoLCBwYXJhbXMsIGhhc2gsIG9wZW4sIHN0cmlwLCBsb2NJbmZvKSB7XG4gIC8vIE11c3QgdXNlIGNoYXJBdCB0byBzdXBwb3J0IElFIHByZS0xMFxuICBsZXQgZXNjYXBlRmxhZyA9IG9wZW4uY2hhckF0KDMpIHx8IG9wZW4uY2hhckF0KDIpLFxuICAgICAgZXNjYXBlZCA9IGVzY2FwZUZsYWcgIT09ICd7JyAmJiBlc2NhcGVGbGFnICE9PSAnJic7XG5cbiAgcmV0dXJuIG5ldyB0aGlzLk11c3RhY2hlU3RhdGVtZW50KHBhdGgsIHBhcmFtcywgaGFzaCwgZXNjYXBlZCwgc3RyaXAsIHRoaXMubG9jSW5mbyhsb2NJbmZvKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwYXJlUmF3QmxvY2sob3BlblJhd0Jsb2NrLCBjb250ZW50LCBjbG9zZSwgbG9jSW5mbykge1xuICBpZiAob3BlblJhd0Jsb2NrLnBhdGgub3JpZ2luYWwgIT09IGNsb3NlKSB7XG4gICAgbGV0IGVycm9yTm9kZSA9IHtsb2M6IG9wZW5SYXdCbG9jay5wYXRoLmxvY307XG5cbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKG9wZW5SYXdCbG9jay5wYXRoLm9yaWdpbmFsICsgXCIgZG9lc24ndCBtYXRjaCBcIiArIGNsb3NlLCBlcnJvck5vZGUpO1xuICB9XG5cbiAgbG9jSW5mbyA9IHRoaXMubG9jSW5mbyhsb2NJbmZvKTtcbiAgbGV0IHByb2dyYW0gPSBuZXcgdGhpcy5Qcm9ncmFtKFtjb250ZW50XSwgbnVsbCwge30sIGxvY0luZm8pO1xuXG4gIHJldHVybiBuZXcgdGhpcy5CbG9ja1N0YXRlbWVudChcbiAgICAgIG9wZW5SYXdCbG9jay5wYXRoLCBvcGVuUmF3QmxvY2sucGFyYW1zLCBvcGVuUmF3QmxvY2suaGFzaCxcbiAgICAgIHByb2dyYW0sIHVuZGVmaW5lZCxcbiAgICAgIHt9LCB7fSwge30sXG4gICAgICBsb2NJbmZvKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVCbG9jayhvcGVuQmxvY2ssIHByb2dyYW0sIGludmVyc2VBbmRQcm9ncmFtLCBjbG9zZSwgaW52ZXJ0ZWQsIGxvY0luZm8pIHtcbiAgLy8gV2hlbiB3ZSBhcmUgY2hhaW5pbmcgaW52ZXJzZSBjYWxscywgd2Ugd2lsbCBub3QgaGF2ZSBhIGNsb3NlIHBhdGhcbiAgaWYgKGNsb3NlICYmIGNsb3NlLnBhdGggJiYgb3BlbkJsb2NrLnBhdGgub3JpZ2luYWwgIT09IGNsb3NlLnBhdGgub3JpZ2luYWwpIHtcbiAgICBsZXQgZXJyb3JOb2RlID0ge2xvYzogb3BlbkJsb2NrLnBhdGgubG9jfTtcblxuICAgIHRocm93IG5ldyBFeGNlcHRpb24ob3BlbkJsb2NrLnBhdGgub3JpZ2luYWwgKyAnIGRvZXNuXFwndCBtYXRjaCAnICsgY2xvc2UucGF0aC5vcmlnaW5hbCwgZXJyb3JOb2RlKTtcbiAgfVxuXG4gIHByb2dyYW0uYmxvY2tQYXJhbXMgPSBvcGVuQmxvY2suYmxvY2tQYXJhbXM7XG5cbiAgbGV0IGludmVyc2UsXG4gICAgICBpbnZlcnNlU3RyaXA7XG5cbiAgaWYgKGludmVyc2VBbmRQcm9ncmFtKSB7XG4gICAgaWYgKGludmVyc2VBbmRQcm9ncmFtLmNoYWluKSB7XG4gICAgICBpbnZlcnNlQW5kUHJvZ3JhbS5wcm9ncmFtLmJvZHlbMF0uY2xvc2VTdHJpcCA9IGNsb3NlLnN0cmlwO1xuICAgIH1cblxuICAgIGludmVyc2VTdHJpcCA9IGludmVyc2VBbmRQcm9ncmFtLnN0cmlwO1xuICAgIGludmVyc2UgPSBpbnZlcnNlQW5kUHJvZ3JhbS5wcm9ncmFtO1xuICB9XG5cbiAgaWYgKGludmVydGVkKSB7XG4gICAgaW52ZXJ0ZWQgPSBpbnZlcnNlO1xuICAgIGludmVyc2UgPSBwcm9ncmFtO1xuICAgIHByb2dyYW0gPSBpbnZlcnRlZDtcbiAgfVxuXG4gIHJldHVybiBuZXcgdGhpcy5CbG9ja1N0YXRlbWVudChcbiAgICAgIG9wZW5CbG9jay5wYXRoLCBvcGVuQmxvY2sucGFyYW1zLCBvcGVuQmxvY2suaGFzaCxcbiAgICAgIHByb2dyYW0sIGludmVyc2UsXG4gICAgICBvcGVuQmxvY2suc3RyaXAsIGludmVyc2VTdHJpcCwgY2xvc2UgJiYgY2xvc2Uuc3RyaXAsXG4gICAgICB0aGlzLmxvY0luZm8obG9jSW5mbykpO1xufVxuIl19