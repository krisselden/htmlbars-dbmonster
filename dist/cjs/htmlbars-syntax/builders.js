exports.__esModule = true;
exports.buildMustache = buildMustache;
exports.buildBlock = buildBlock;
exports.buildElementModifier = buildElementModifier;
exports.buildPartial = buildPartial;
exports.buildComment = buildComment;
exports.buildConcat = buildConcat;
exports.buildElement = buildElement;
exports.buildComponent = buildComponent;
exports.buildAttr = buildAttr;
exports.buildText = buildText;
exports.buildSexpr = buildSexpr;
exports.buildPath = buildPath;
exports.buildString = buildString;
exports.buildBoolean = buildBoolean;
exports.buildNumber = buildNumber;
exports.buildNull = buildNull;
exports.buildUndefined = buildUndefined;
exports.buildHash = buildHash;
exports.buildPair = buildPair;
exports.buildProgram = buildProgram;
// Statements

function buildMustache(path, params, hash, raw, loc) {
  return {
    type: "MustacheStatement",
    path: buildPath(path),
    params: params || [],
    hash: hash || buildHash([]),
    escaped: !raw,
    loc: buildLoc(loc)
  };
}

function buildBlock(path, params, hash, program, inverse, loc) {
  return {
    type: "BlockStatement",
    path: buildPath(path),
    params: params || [],
    hash: hash || buildHash([]),
    program: program || null,
    inverse: inverse || null,
    loc: buildLoc(loc)
  };
}

function buildElementModifier(path, params, hash, loc) {
  return {
    type: "ElementModifierStatement",
    path: buildPath(path),
    params: params || [],
    hash: hash || buildHash([]),
    loc: buildLoc(loc)
  };
}

function buildPartial(name, params, hash, indent) {
  return {
    type: "PartialStatement",
    name: name,
    params: params || [],
    hash: hash || buildHash([]),
    indent: indent
  };
}

function buildComment(value) {
  return {
    type: "CommentStatement",
    value: value
  };
}

function buildConcat(parts) {
  return {
    type: "ConcatStatement",
    parts: parts || []
  };
}

// Nodes

function buildElement(tag, attributes, modifiers, children, loc) {
  return {
    type: "ElementNode",
    tag: tag || "",
    attributes: attributes || [],
    modifiers: modifiers || [],
    children: children || [],
    loc: buildLoc(loc)
  };
}

function buildComponent(tag, attributes, program, loc) {
  return {
    type: "ComponentNode",
    tag: tag,
    attributes: attributes,
    program: program,
    loc: buildLoc(loc)
  };
}

function buildAttr(name, value) {
  return {
    type: "AttrNode",
    name: name,
    value: value
  };
}

function buildText(chars, loc) {
  return {
    type: "TextNode",
    chars: chars || "",
    loc: buildLoc(loc)
  };
}

// Expressions

function buildSexpr(path, params, hash) {
  return {
    type: "SubExpression",
    path: buildPath(path),
    params: params || [],
    hash: hash || buildHash([])
  };
}

function buildPath(original) {
  if (typeof original === 'string') {
    return {
      type: "PathExpression",
      original: original,
      parts: original.split('.')
    };
  } else {
    return original;
  }
}

function buildString(value) {
  return {
    type: "StringLiteral",
    value: value,
    original: value
  };
}

function buildBoolean(value) {
  return {
    type: "BooleanLiteral",
    value: value,
    original: value
  };
}

function buildNumber(value) {
  return {
    type: "NumberLiteral",
    value: value,
    original: value
  };
}

function buildNull() {
  return {
    type: "NullLiteral",
    value: null,
    original: null
  };
}

function buildUndefined() {
  return {
    type: "UndefinedLiteral",
    value: undefined,
    original: undefined
  };
}

// Miscellaneous

function buildHash(pairs) {
  return {
    type: "Hash",
    pairs: pairs || []
  };
}

function buildPair(key, value) {
  return {
    type: "HashPair",
    key: key,
    value: value
  };
}

function buildProgram(body, blockParams, loc) {
  return {
    type: "Program",
    body: body || [],
    blockParams: blockParams || [],
    loc: buildLoc(loc)
  };
}

function buildSource(source) {
  return source || null;
}

function buildPosition(line, column) {
  return {
    line: typeof line === 'number' ? line : null,
    column: typeof column === 'number' ? column : null
  };
}

function buildLoc(startLine, startColumn, endLine, endColumn, source) {
  if (arguments.length === 1) {
    var loc = startLine;

    if (typeof loc === 'object') {
      return {
        source: buildSource(loc.source),
        start: buildPosition(loc.start.line, loc.start.column),
        end: buildPosition(loc.end.line, loc.end.column)
      };
    } else {
      return null;
    }
  } else {
    return {
      source: buildSource(source),
      start: buildPosition(startLine, startColumn),
      end: buildPosition(endLine, endColumn)
    };
  }
}

exports.default = {
  mustache: buildMustache,
  block: buildBlock,
  partial: buildPartial,
  comment: buildComment,
  element: buildElement,
  elementModifier: buildElementModifier,
  component: buildComponent,
  attr: buildAttr,
  text: buildText,
  sexpr: buildSexpr,
  path: buildPath,
  string: buildString,
  boolean: buildBoolean,
  number: buildNumber,
  undefined: buildUndefined,
  null: buildNull,
  concat: buildConcat,
  hash: buildHash,
  pair: buildPair,
  program: buildProgram,
  loc: buildLoc,
  pos: buildPosition
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXN5bnRheC9idWlsZGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1FBRWdCLGFBQWEsR0FBYixhQUFhO1FBV2IsVUFBVSxHQUFWLFVBQVU7UUFZVixvQkFBb0IsR0FBcEIsb0JBQW9CO1FBVXBCLFlBQVksR0FBWixZQUFZO1FBVVosWUFBWSxHQUFaLFlBQVk7UUFPWixXQUFXLEdBQVgsV0FBVztRQVNYLFlBQVksR0FBWixZQUFZO1FBV1osY0FBYyxHQUFkLGNBQWM7UUFVZCxTQUFTLEdBQVQsU0FBUztRQVFULFNBQVMsR0FBVCxTQUFTO1FBVVQsVUFBVSxHQUFWLFVBQVU7UUFTVixTQUFTLEdBQVQsU0FBUztRQVlULFdBQVcsR0FBWCxXQUFXO1FBUVgsWUFBWSxHQUFaLFlBQVk7UUFRWixXQUFXLEdBQVgsV0FBVztRQVFYLFNBQVMsR0FBVCxTQUFTO1FBUVQsY0FBYyxHQUFkLGNBQWM7UUFVZCxTQUFTLEdBQVQsU0FBUztRQU9ULFNBQVMsR0FBVCxTQUFTO1FBUVQsWUFBWSxHQUFaLFlBQVk7OztBQWhMckIsU0FBUyxhQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUMxRCxTQUFPO0FBQ0wsUUFBSSxFQUFFLG1CQUFtQjtBQUN6QixRQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQztBQUNyQixVQUFNLEVBQUUsTUFBTSxJQUFJLEVBQUU7QUFDcEIsUUFBSSxFQUFFLElBQUksSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDO0FBQzNCLFdBQU8sRUFBRSxDQUFDLEdBQUc7QUFDYixPQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQztHQUNuQixDQUFDO0NBQ0g7O0FBRU0sU0FBUyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUU7QUFDcEUsU0FBTztBQUNMLFFBQUksRUFBRSxnQkFBZ0I7QUFD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cy1zeW50YXgvYnVpbGRlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdGF0ZW1lbnRzXG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE11c3RhY2hlKHBhdGgsIHBhcmFtcywgaGFzaCwgcmF3LCBsb2MpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBcIk11c3RhY2hlU3RhdGVtZW50XCIsXG4gICAgcGF0aDogYnVpbGRQYXRoKHBhdGgpLFxuICAgIHBhcmFtczogcGFyYW1zIHx8IFtdLFxuICAgIGhhc2g6IGhhc2ggfHwgYnVpbGRIYXNoKFtdKSxcbiAgICBlc2NhcGVkOiAhcmF3LFxuICAgIGxvYzogYnVpbGRMb2MobG9jKVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRCbG9jayhwYXRoLCBwYXJhbXMsIGhhc2gsIHByb2dyYW0sIGludmVyc2UsIGxvYykge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwiQmxvY2tTdGF0ZW1lbnRcIixcbiAgICBwYXRoOiBidWlsZFBhdGgocGF0aCksXG4gICAgcGFyYW1zOiBwYXJhbXMgfHwgW10sXG4gICAgaGFzaDogaGFzaCB8fCBidWlsZEhhc2goW10pLFxuICAgIHByb2dyYW06IHByb2dyYW0gfHwgbnVsbCxcbiAgICBpbnZlcnNlOiBpbnZlcnNlIHx8IG51bGwsXG4gICAgbG9jOiBidWlsZExvYyhsb2MpXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEVsZW1lbnRNb2RpZmllcihwYXRoLCBwYXJhbXMsIGhhc2gsIGxvYykge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwiRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50XCIsXG4gICAgcGF0aDogYnVpbGRQYXRoKHBhdGgpLFxuICAgIHBhcmFtczogcGFyYW1zIHx8IFtdLFxuICAgIGhhc2g6IGhhc2ggfHwgYnVpbGRIYXNoKFtdKSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYylcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUGFydGlhbChuYW1lLCBwYXJhbXMsIGhhc2gsIGluZGVudCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwiUGFydGlhbFN0YXRlbWVudFwiLFxuICAgIG5hbWU6IG5hbWUsXG4gICAgcGFyYW1zOiBwYXJhbXMgfHwgW10sXG4gICAgaGFzaDogaGFzaCB8fCBidWlsZEhhc2goW10pLFxuICAgIGluZGVudDogaW5kZW50XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbW1lbnQodmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBcIkNvbW1lbnRTdGF0ZW1lbnRcIixcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29uY2F0KHBhcnRzKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogXCJDb25jYXRTdGF0ZW1lbnRcIixcbiAgICBwYXJ0czogcGFydHMgfHwgW11cbiAgfTtcbn1cblxuLy8gTm9kZXNcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRWxlbWVudCh0YWcsIGF0dHJpYnV0ZXMsIG1vZGlmaWVycywgY2hpbGRyZW4sIGxvYykge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwiRWxlbWVudE5vZGVcIixcbiAgICB0YWc6IHRhZyB8fCBcIlwiLFxuICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMgfHwgW10sXG4gICAgbW9kaWZpZXJzOiBtb2RpZmllcnMgfHwgW10sXG4gICAgY2hpbGRyZW46IGNoaWxkcmVuIHx8IFtdLFxuICAgIGxvYzogYnVpbGRMb2MobG9jKVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRDb21wb25lbnQodGFnLCBhdHRyaWJ1dGVzLCBwcm9ncmFtLCBsb2MpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBcIkNvbXBvbmVudE5vZGVcIixcbiAgICB0YWc6IHRhZyxcbiAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLFxuICAgIHByb2dyYW06IHByb2dyYW0sXG4gICAgbG9jOiBidWlsZExvYyhsb2MpXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEF0dHIobmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBcIkF0dHJOb2RlXCIsXG4gICAgbmFtZTogbmFtZSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVGV4dChjaGFycywgbG9jKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogXCJUZXh0Tm9kZVwiLFxuICAgIGNoYXJzOiBjaGFycyB8fCBcIlwiLFxuICAgIGxvYzogYnVpbGRMb2MobG9jKVxuICB9O1xufVxuXG4vLyBFeHByZXNzaW9uc1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTZXhwcihwYXRoLCBwYXJhbXMsIGhhc2gpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBcIlN1YkV4cHJlc3Npb25cIixcbiAgICBwYXRoOiBidWlsZFBhdGgocGF0aCksXG4gICAgcGFyYW1zOiBwYXJhbXMgfHwgW10sXG4gICAgaGFzaDogaGFzaCB8fCBidWlsZEhhc2goW10pXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFBhdGgob3JpZ2luYWwpIHtcbiAgaWYgKHR5cGVvZiBvcmlnaW5hbCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJQYXRoRXhwcmVzc2lvblwiLFxuICAgICAgb3JpZ2luYWw6IG9yaWdpbmFsLFxuICAgICAgcGFydHM6IG9yaWdpbmFsLnNwbGl0KCcuJylcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBvcmlnaW5hbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBcIlN0cmluZ0xpdGVyYWxcIixcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgb3JpZ2luYWw6IHZhbHVlXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEJvb2xlYW4odmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBcIkJvb2xlYW5MaXRlcmFsXCIsXG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIG9yaWdpbmFsOiB2YWx1ZVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGROdW1iZXIodmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBcIk51bWJlckxpdGVyYWxcIixcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgb3JpZ2luYWw6IHZhbHVlXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE51bGwoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogXCJOdWxsTGl0ZXJhbFwiLFxuICAgIHZhbHVlOiBudWxsLFxuICAgIG9yaWdpbmFsOiBudWxsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFVuZGVmaW5lZCgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBcIlVuZGVmaW5lZExpdGVyYWxcIixcbiAgICB2YWx1ZTogdW5kZWZpbmVkLFxuICAgIG9yaWdpbmFsOiB1bmRlZmluZWRcbiAgfTtcbn1cblxuLy8gTWlzY2VsbGFuZW91c1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRIYXNoKHBhaXJzKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogXCJIYXNoXCIsXG4gICAgcGFpcnM6IHBhaXJzIHx8IFtdXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFBhaXIoa2V5LCB2YWx1ZSkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwiSGFzaFBhaXJcIixcbiAgICBrZXk6IGtleSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUHJvZ3JhbShib2R5LCBibG9ja1BhcmFtcywgbG9jKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogXCJQcm9ncmFtXCIsXG4gICAgYm9keTogYm9keSB8fCBbXSxcbiAgICBibG9ja1BhcmFtczogYmxvY2tQYXJhbXMgfHwgW10sXG4gICAgbG9jOiBidWlsZExvYyhsb2MpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkU291cmNlKHNvdXJjZSkge1xuICByZXR1cm4gc291cmNlIHx8IG51bGw7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUG9zaXRpb24obGluZSwgY29sdW1uKSB7XG4gIHJldHVybiB7XG4gICAgbGluZTogKHR5cGVvZiBsaW5lID09PSAnbnVtYmVyJykgPyBsaW5lIDogbnVsbCxcbiAgICBjb2x1bW46ICh0eXBlb2YgY29sdW1uID09PSAnbnVtYmVyJykgPyBjb2x1bW4gOiBudWxsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkTG9jKHN0YXJ0TGluZSwgc3RhcnRDb2x1bW4sIGVuZExpbmUsIGVuZENvbHVtbiwgc291cmNlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIGxvYyA9IHN0YXJ0TGluZTtcblxuICAgIGlmICh0eXBlb2YgbG9jID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlOiBidWlsZFNvdXJjZShsb2Muc291cmNlKSxcbiAgICAgICAgc3RhcnQ6IGJ1aWxkUG9zaXRpb24obG9jLnN0YXJ0LmxpbmUsIGxvYy5zdGFydC5jb2x1bW4pLFxuICAgICAgICBlbmQ6IGJ1aWxkUG9zaXRpb24obG9jLmVuZC5saW5lLCBsb2MuZW5kLmNvbHVtbilcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgc291cmNlOiBidWlsZFNvdXJjZShzb3VyY2UpLFxuICAgICAgc3RhcnQ6IGJ1aWxkUG9zaXRpb24oc3RhcnRMaW5lLCBzdGFydENvbHVtbiksXG4gICAgICBlbmQ6IGJ1aWxkUG9zaXRpb24oZW5kTGluZSwgZW5kQ29sdW1uKVxuICAgIH07IFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbXVzdGFjaGU6IGJ1aWxkTXVzdGFjaGUsXG4gIGJsb2NrOiBidWlsZEJsb2NrLFxuICBwYXJ0aWFsOiBidWlsZFBhcnRpYWwsXG4gIGNvbW1lbnQ6IGJ1aWxkQ29tbWVudCxcbiAgZWxlbWVudDogYnVpbGRFbGVtZW50LFxuICBlbGVtZW50TW9kaWZpZXI6IGJ1aWxkRWxlbWVudE1vZGlmaWVyLFxuICBjb21wb25lbnQ6IGJ1aWxkQ29tcG9uZW50LFxuICBhdHRyOiBidWlsZEF0dHIsXG4gIHRleHQ6IGJ1aWxkVGV4dCxcbiAgc2V4cHI6IGJ1aWxkU2V4cHIsXG4gIHBhdGg6IGJ1aWxkUGF0aCxcbiAgc3RyaW5nOiBidWlsZFN0cmluZyxcbiAgYm9vbGVhbjogYnVpbGRCb29sZWFuLFxuICBudW1iZXI6IGJ1aWxkTnVtYmVyLFxuICB1bmRlZmluZWQ6IGJ1aWxkVW5kZWZpbmVkLFxuICBudWxsOiBidWlsZE51bGwsXG4gIGNvbmNhdDogYnVpbGRDb25jYXQsXG4gIGhhc2g6IGJ1aWxkSGFzaCxcbiAgcGFpcjogYnVpbGRQYWlyLFxuICBwcm9ncmFtOiBidWlsZFByb2dyYW0sXG4gIGxvYzogYnVpbGRMb2MsXG4gIHBvczogYnVpbGRQb3NpdGlvblxufTtcbiJdfQ==