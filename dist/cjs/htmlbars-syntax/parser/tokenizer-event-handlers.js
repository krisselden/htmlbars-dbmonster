exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _htmlbarsUtilVoidTagNames = require('../../htmlbars-util/void-tag-names');

var _htmlbarsUtilVoidTagNames2 = _interopRequireDefault(_htmlbarsUtilVoidTagNames);

var _builders = require("../builders");

var _builders2 = _interopRequireDefault(_builders);

var _utils = require("../utils");

exports.default = {
  reset: function () {
    this.currentNode = null;
  },

  // Comment

  beginComment: function () {
    this.currentNode = _builders2.default.comment("");
  },

  appendToCommentData: function (char) {
    this.currentNode.value += char;
  },

  finishComment: function () {
    _utils.appendChild(this.currentElement(), this.currentNode);
  },

  // Data

  beginData: function () {
    this.currentNode = _builders2.default.text();
  },

  appendToData: function (char) {
    this.currentNode.chars += char;
  },

  finishData: function () {
    _utils.appendChild(this.currentElement(), this.currentNode);
  },

  // Tags - basic

  beginStartTag: function () {
    this.currentNode = {
      type: 'StartTag',
      name: "",
      attributes: [],
      modifiers: [],
      selfClosing: false,
      loc: null
    };
  },

  beginEndTag: function () {
    this.currentNode = {
      type: 'EndTag',
      name: "",
      attributes: [],
      modifiers: [],
      selfClosing: false,
      loc: null
    };
  },

  finishTag: function () {
    var _tokenizer = this.tokenizer;
    var tagLine = _tokenizer.tagLine;
    var tagColumn = _tokenizer.tagColumn;
    var line = _tokenizer.line;
    var column = _tokenizer.column;

    var tag = this.currentNode;
    tag.loc = _builders2.default.loc(tagLine, tagColumn, line, column);

    if (tag.type === 'StartTag') {
      this.finishStartTag();

      if (_htmlbarsUtilVoidTagNames2.default.hasOwnProperty(tag.name) || tag.selfClosing) {
        this.finishEndTag(true);
      }
    } else if (tag.type === 'EndTag') {
      this.finishEndTag(false);
    }
  },

  finishStartTag: function () {
    var _currentNode = this.currentNode;
    var name = _currentNode.name;
    var attributes = _currentNode.attributes;
    var modifiers = _currentNode.modifiers;

    var loc = _builders2.default.loc(this.tokenizer.tagLine, this.tokenizer.tagColumn);
    var element = _builders2.default.element(name, attributes, modifiers, [], loc);
    this.elementStack.push(element);
  },

  finishEndTag: function (isVoid) {
    var tag = this.currentNode;

    var element = this.elementStack.pop();
    var parent = this.currentElement();
    var disableComponentGeneration = this.options.disableComponentGeneration === true;

    validateEndTag(tag, element, isVoid);

    element.loc.end.line = this.tokenizer.line;
    element.loc.end.column = this.tokenizer.column;

    if (disableComponentGeneration || element.tag.indexOf("-") === -1) {
      _utils.appendChild(parent, element);
    } else {
      var program = _builders2.default.program(element.children);
      _utils.parseComponentBlockParams(element, program);
      var component = _builders2.default.component(element.tag, element.attributes, program, element.loc);
      _utils.appendChild(parent, component);
    }
  },

  markTagAsSelfClosing: function () {
    this.currentNode.selfClosing = true;
  },

  // Tags - name

  appendToTagName: function (char) {
    this.currentNode.name += char;
  },

  // Tags - attributes

  beginAttribute: function () {
    var tag = this.currentNode;
    if (tag.type === 'EndTag') {
      throw new Error("Invalid end tag: closing tag must not have attributes, " + ("in `" + tag.name + "` (on line " + this.tokenizer.line + ")."));
    }

    this.currentAttribute = {
      name: "",
      parts: [],
      isQuoted: false,
      isDynamic: false
    };
  },

  appendToAttributeName: function (char) {
    this.currentAttribute.name += char;
  },

  beginAttributeValue: function (isQuoted) {
    this.currentAttribute.isQuoted = isQuoted;
  },

  appendToAttributeValue: function (char) {
    var parts = this.currentAttribute.parts;

    if (typeof parts[parts.length - 1] === 'string') {
      parts[parts.length - 1] += char;
    } else {
      parts.push(char);
    }
  },

  finishAttributeValue: function () {
    var _currentAttribute = this.currentAttribute;
    var name = _currentAttribute.name;
    var parts = _currentAttribute.parts;
    var isQuoted = _currentAttribute.isQuoted;
    var isDynamic = _currentAttribute.isDynamic;

    var value = assembleAttributeValue(parts, isQuoted, isDynamic, this.tokenizer.line);

    this.currentNode.attributes.push(_builders2.default.attr(name, value));
  }
};

function assembleAttributeValue(parts, isQuoted, isDynamic, line) {
  if (isDynamic) {
    if (isQuoted) {
      return assembleConcatenatedValue(parts);
    } else {
      if (parts.length === 1) {
        return parts[0];
      } else {
        throw new Error("An unquoted attribute value must be a string or a mustache, " + "preceeded by whitespace or a '=' character, and " + ("followed by whitespace or a '>' character (on line " + line + ")"));
      }
    }
  } else {
    return _builders2.default.text(parts.length > 0 ? parts[0] : "");
  }
}

function assembleConcatenatedValue(parts) {
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];

    if (typeof part === 'string') {
      parts[i] = _builders2.default.string(parts[i]);
    } else {
      if (part.type === 'MustacheStatement') {
        parts[i] = _utils.unwrapMustache(part);
      } else {
        throw new Error("Unsupported node in quoted attribute value: " + part.type);
      }
    }
  }

  return _builders2.default.concat(parts);
}

function validateEndTag(tag, element, selfClosing) {
  var error;

  if (_htmlbarsUtilVoidTagNames2.default[tag.name] && !selfClosing) {
    // EngTag is also called by StartTag for void and self-closing tags (i.e.
    // <input> or <br />, so we need to check for that here. Otherwise, we would
    // throw an error for those cases.
    error = "Invalid end tag " + formatEndTagInfo(tag) + " (void elements cannot have end tags).";
  } else if (element.tag === undefined) {
    error = "Closing tag " + formatEndTagInfo(tag) + " without an open tag.";
  } else if (element.tag !== tag.name) {
    error = "Closing tag " + formatEndTagInfo(tag) + " did not match last open tag `" + element.tag + "` (on line " + element.loc.start.line + ").";
  }

  if (error) {
    throw new Error(error);
  }
}

function formatEndTagInfo(tag) {
  return "`" + tag.name + "` (on line " + tag.loc.end.line + ")";
}
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXN5bnRheC9wYXJzZXIvdG9rZW5pemVyLWV2ZW50LWhhbmRsZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7d0NBQW9CLG9DQUFvQzs7Ozt3QkFDMUMsYUFBYTs7OztxQkFDNEMsVUFBVTs7a0JBRWxFO0FBQ2IsT0FBSyxFQUFFLFlBQVc7QUFDaEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7R0FDekI7Ozs7QUFJRCxjQUFZLEVBQUUsWUFBVztBQUN2QixRQUFJLENBQUMsV0FBVyxHQUFHLG1CQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUNsQzs7QUFFRCxxQkFBbUIsRUFBRSxVQUFTLElBQUksRUFBRTtBQUNsQyxRQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLFlBQVc7QUFDeEIsV0FsQkssV0FBVyxDQWtCSixJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ3REOzs7O0FBS0QsV0FBUyxFQUFFLFlBQVc7QUFDcEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxtQkFBRSxJQUFJLEVBQUUsQ0FBQztHQUM3Qjs7QUFFRCxjQUFZLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDM0IsUUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO0dBQ2hDOztBQUVELFlBQVUsRUFBRSxZQUFXO0FBQ3JCLFdBakNLLFdBQVcsQ0FpQ0osSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUN0RDs7OztBQUlELGVBQWEsRUFBRSxZQUFXO0FBQ3hCLFFBQUksQ0FBQyxXQUFXLEdBQUc7QUFDakIsVUFBSSxFQUFFLFVBQVU7QUFDaEIsVUFBSSxFQUFFLEVBQUU7QUFDUixnQkFBVSxFQUFFLEVBQUU7QUFDZCxlQUFTLEVBQUUsRUFBRTtBQUNiLGlCQUFXLEVBQUUsS0FB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QUcsY0FBYyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLHVCQUF1QixDQUFDO0dBQzFFLE1BQU0sSUFBSSxPQUFPLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFDbkMsU0FBSyxHQUFHLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxnQ0FBZ0MsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLGFBQWEsR0FDdkcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztHQUN2Qzs7QUFFRCxNQUFJLEtBQUssRUFBRTtBQUFFLFVBQU0sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7R0FBRTtDQUN2Qzs7QUFFRCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtBQUM3QixTQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLGFBQWEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0NBQ2hFIiwiZmlsZSI6Imh0bWxiYXJzLXN5bnRheC9wYXJzZXIvdG9rZW5pemVyLWV2ZW50LWhhbmRsZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHZvaWRNYXAgZnJvbSAnLi4vLi4vaHRtbGJhcnMtdXRpbC92b2lkLXRhZy1uYW1lcyc7XG5pbXBvcnQgYiBmcm9tIFwiLi4vYnVpbGRlcnNcIjtcbmltcG9ydCB7IGFwcGVuZENoaWxkLCBwYXJzZUNvbXBvbmVudEJsb2NrUGFyYW1zLCB1bndyYXBNdXN0YWNoZSB9IGZyb20gXCIuLi91dGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0gbnVsbDtcbiAgfSxcblxuICAvLyBDb21tZW50XG5cbiAgYmVnaW5Db21tZW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0gYi5jb21tZW50KFwiXCIpO1xuICB9LFxuXG4gIGFwcGVuZFRvQ29tbWVudERhdGE6IGZ1bmN0aW9uKGNoYXIpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlLnZhbHVlICs9IGNoYXI7XG4gIH0sXG5cbiAgZmluaXNoQ29tbWVudDogZnVuY3Rpb24oKSB7XG4gICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCB0aGlzLmN1cnJlbnROb2RlKTtcbiAgfSxcblxuXG4gIC8vIERhdGFcblxuICBiZWdpbkRhdGE6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSBiLnRleHQoKTtcbiAgfSxcblxuICBhcHBlbmRUb0RhdGE6IGZ1bmN0aW9uKGNoYXIpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlLmNoYXJzICs9IGNoYXI7XG4gIH0sXG5cbiAgZmluaXNoRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCB0aGlzLmN1cnJlbnROb2RlKTtcbiAgfSxcblxuICAvLyBUYWdzIC0gYmFzaWNcblxuICBiZWdpblN0YXJ0VGFnOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0ge1xuICAgICAgdHlwZTogJ1N0YXJ0VGFnJyxcbiAgICAgIG5hbWU6IFwiXCIsXG4gICAgICBhdHRyaWJ1dGVzOiBbXSxcbiAgICAgIG1vZGlmaWVyczogW10sXG4gICAgICBzZWxmQ2xvc2luZzogZmFsc2UsXG4gICAgICBsb2M6IG51bGxcbiAgICB9O1xuICB9LFxuXG4gIGJlZ2luRW5kVGFnOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0ge1xuICAgICAgdHlwZTogJ0VuZFRhZycsXG4gICAgICBuYW1lOiBcIlwiLFxuICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICBtb2RpZmllcnM6IFtdLFxuICAgICAgc2VsZkNsb3Npbmc6IGZhbHNlLFxuICAgICAgbG9jOiBudWxsXG4gICAgfTtcbiAgfSxcblxuICBmaW5pc2hUYWc6IGZ1bmN0aW9uKCkge1xuICAgIGxldCB7IHRhZ0xpbmUsIHRhZ0NvbHVtbiwgbGluZSwgY29sdW1uIH0gPSB0aGlzLnRva2VuaXplcjtcblxuICAgIGxldCB0YWcgPSB0aGlzLmN1cnJlbnROb2RlO1xuICAgIHRhZy5sb2MgPSBiLmxvYyh0YWdMaW5lLCB0YWdDb2x1bW4sIGxpbmUsIGNvbHVtbik7XG4gICAgXG4gICAgaWYgKHRhZy50eXBlID09PSAnU3RhcnRUYWcnKSB7XG4gICAgICB0aGlzLmZpbmlzaFN0YXJ0VGFnKCk7XG5cbiAgICAgIGlmICh2b2lkTWFwLmhhc093blByb3BlcnR5KHRhZy5uYW1lKSB8fCB0YWcuc2VsZkNsb3NpbmcpIHtcbiAgICAgICAgdGhpcy5maW5pc2hFbmRUYWcodHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWcudHlwZSA9PT0gJ0VuZFRhZycpIHtcbiAgICAgIHRoaXMuZmluaXNoRW5kVGFnKGZhbHNlKTtcbiAgICB9XG4gIH0sXG5cbiAgZmluaXNoU3RhcnRUYWc6IGZ1bmN0aW9uKCkge1xuICAgIGxldCB7IG5hbWUsIGF0dHJpYnV0ZXMsIG1vZGlmaWVycyB9ID0gdGhpcy5jdXJyZW50Tm9kZTtcblxuICAgIGxldCBsb2MgPSBiLmxvYyh0aGlzLnRva2VuaXplci50YWdMaW5lLCB0aGlzLnRva2VuaXplci50YWdDb2x1bW4pO1xuICAgIGxldCBlbGVtZW50ID0gYi5lbGVtZW50KG5hbWUsIGF0dHJpYnV0ZXMsIG1vZGlmaWVycywgW10sIGxvYyk7XG4gICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChlbGVtZW50KTtcbiAgfSxcblxuICBmaW5pc2hFbmRUYWc6IGZ1bmN0aW9uKGlzVm9pZCkge1xuICAgIGxldCB0YWcgPSB0aGlzLmN1cnJlbnROb2RlO1xuXG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKTtcbiAgICBsZXQgcGFyZW50ID0gdGhpcy5jdXJyZW50RWxlbWVudCgpO1xuICAgIGxldCBkaXNhYmxlQ29tcG9uZW50R2VuZXJhdGlvbiA9ICh0aGlzLm9wdGlvbnMuZGlzYWJsZUNvbXBvbmVudEdlbmVyYXRpb24gPT09IHRydWUpO1xuXG4gICAgdmFsaWRhdGVFbmRUYWcodGFnLCBlbGVtZW50LCBpc1ZvaWQpO1xuXG4gICAgZWxlbWVudC5sb2MuZW5kLmxpbmUgPSB0aGlzLnRva2VuaXplci5saW5lO1xuICAgIGVsZW1lbnQubG9jLmVuZC5jb2x1bW4gPSB0aGlzLnRva2VuaXplci5jb2x1bW47XG5cbiAgICBpZiAoZGlzYWJsZUNvbXBvbmVudEdlbmVyYXRpb24gfHwgZWxlbWVudC50YWcuaW5kZXhPZihcIi1cIikgPT09IC0xKSB7XG4gICAgICBhcHBlbmRDaGlsZChwYXJlbnQsIGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcHJvZ3JhbSA9IGIucHJvZ3JhbShlbGVtZW50LmNoaWxkcmVuKTtcbiAgICAgIHBhcnNlQ29tcG9uZW50QmxvY2tQYXJhbXMoZWxlbWVudCwgcHJvZ3JhbSk7XG4gICAgICBsZXQgY29tcG9uZW50ID0gYi5jb21wb25lbnQoZWxlbWVudC50YWcsIGVsZW1lbnQuYXR0cmlidXRlcywgcHJvZ3JhbSwgZWxlbWVudC5sb2MpO1xuICAgICAgYXBwZW5kQ2hpbGQocGFyZW50LCBjb21wb25lbnQpO1xuICAgIH1cbiAgfSxcblxuICBtYXJrVGFnQXNTZWxmQ2xvc2luZzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZS5zZWxmQ2xvc2luZyA9IHRydWU7XG4gIH0sXG5cbiAgLy8gVGFncyAtIG5hbWVcblxuICBhcHBlbmRUb1RhZ05hbWU6IGZ1bmN0aW9uKGNoYXIpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlLm5hbWUgKz0gY2hhcjtcbiAgfSxcblxuICAvLyBUYWdzIC0gYXR0cmlidXRlc1xuXG4gIGJlZ2luQXR0cmlidXRlOiBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGFnID0gdGhpcy5jdXJyZW50Tm9kZTtcbiAgICBpZiAodGFnLnR5cGUgPT09ICdFbmRUYWcnKSB7XG4gICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW52YWxpZCBlbmQgdGFnOiBjbG9zaW5nIHRhZyBtdXN0IG5vdCBoYXZlIGF0dHJpYnV0ZXMsIGAgK1xuICAgICAgICBgaW4gXFxgJHt0YWcubmFtZX1cXGAgKG9uIGxpbmUgJHt0aGlzLnRva2VuaXplci5saW5lfSkuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRBdHRyaWJ1dGUgPSB7XG4gICAgICBuYW1lOiBcIlwiLFxuICAgICAgcGFydHM6IFtdLFxuICAgICAgaXNRdW90ZWQ6IGZhbHNlLFxuICAgICAgaXNEeW5hbWljOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgYXBwZW5kVG9BdHRyaWJ1dGVOYW1lOiBmdW5jdGlvbihjaGFyKSB7XG4gICAgdGhpcy5jdXJyZW50QXR0cmlidXRlLm5hbWUgKz0gY2hhcjtcbiAgfSxcblxuICBiZWdpbkF0dHJpYnV0ZVZhbHVlOiBmdW5jdGlvbihpc1F1b3RlZCkge1xuICAgIHRoaXMuY3VycmVudEF0dHJpYnV0ZS5pc1F1b3RlZCA9IGlzUXVvdGVkO1xuICB9LFxuXG4gIGFwcGVuZFRvQXR0cmlidXRlVmFsdWU6IGZ1bmN0aW9uKGNoYXIpIHtcbiAgICBsZXQgcGFydHMgPSB0aGlzLmN1cnJlbnRBdHRyaWJ1dGUucGFydHM7XG5cbiAgICBpZiAodHlwZW9mIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdID09PSAnc3RyaW5nJykge1xuICAgICAgcGFydHNbcGFydHMubGVuZ3RoIC0gMV0gKz0gY2hhcjtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHMucHVzaChjaGFyKTtcbiAgICB9XG4gIH0sXG5cbiAgZmluaXNoQXR0cmlidXRlVmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgIGxldCB7IG5hbWUsIHBhcnRzLCBpc1F1b3RlZCwgaXNEeW5hbWljIH0gPSB0aGlzLmN1cnJlbnRBdHRyaWJ1dGU7XG4gICAgbGV0IHZhbHVlID0gYXNzZW1ibGVBdHRyaWJ1dGVWYWx1ZShwYXJ0cywgaXNRdW90ZWQsIGlzRHluYW1pYywgdGhpcy50b2tlbml6ZXIubGluZSk7XG5cbiAgICB0aGlzLmN1cnJlbnROb2RlLmF0dHJpYnV0ZXMucHVzaChiLmF0dHIobmFtZSwgdmFsdWUpKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gYXNzZW1ibGVBdHRyaWJ1dGVWYWx1ZShwYXJ0cywgaXNRdW90ZWQsIGlzRHluYW1pYywgbGluZSkge1xuICBpZiAoaXNEeW5hbWljKSB7XG4gICAgaWYgKGlzUXVvdGVkKSB7XG4gICAgICByZXR1cm4gYXNzZW1ibGVDb25jYXRlbmF0ZWRWYWx1ZShwYXJ0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHBhcnRzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBBbiB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUgbXVzdCBiZSBhIHN0cmluZyBvciBhIG11c3RhY2hlLCBgICtcbiAgICAgICAgICBgcHJlY2VlZGVkIGJ5IHdoaXRlc3BhY2Ugb3IgYSAnPScgY2hhcmFjdGVyLCBhbmQgYCArXG4gICAgICAgICAgYGZvbGxvd2VkIGJ5IHdoaXRlc3BhY2Ugb3IgYSAnPicgY2hhcmFjdGVyIChvbiBsaW5lICR7bGluZX0pYFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYi50ZXh0KChwYXJ0cy5sZW5ndGggPiAwKSA/IHBhcnRzWzBdIDogXCJcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZW1ibGVDb25jYXRlbmF0ZWRWYWx1ZShwYXJ0cykge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHBhcnQgPSBwYXJ0c1tpXTtcblxuICAgIGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBhcnRzW2ldID0gYi5zdHJpbmcocGFydHNbaV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocGFydC50eXBlID09PSAnTXVzdGFjaGVTdGF0ZW1lbnQnKSB7XG4gICAgICAgIHBhcnRzW2ldID0gdW53cmFwTXVzdGFjaGUocGFydCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBub2RlIGluIHF1b3RlZCBhdHRyaWJ1dGUgdmFsdWU6IFwiICsgcGFydC50eXBlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYi5jb25jYXQocGFydHMpO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUVuZFRhZyh0YWcsIGVsZW1lbnQsIHNlbGZDbG9zaW5nKSB7XG4gIHZhciBlcnJvcjtcblxuICBpZiAodm9pZE1hcFt0YWcubmFtZV0gJiYgIXNlbGZDbG9zaW5nKSB7XG4gICAgLy8gRW5nVGFnIGlzIGFsc28gY2FsbGVkIGJ5IFN0YXJ0VGFnIGZvciB2b2lkIGFuZCBzZWxmLWNsb3NpbmcgdGFncyAoaS5lLlxuICAgIC8vIDxpbnB1dD4gb3IgPGJyIC8+LCBzbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciB0aGF0IGhlcmUuIE90aGVyd2lzZSwgd2Ugd291bGRcbiAgICAvLyB0aHJvdyBhbiBlcnJvciBmb3IgdGhvc2UgY2FzZXMuXG4gICAgZXJyb3IgPSBcIkludmFsaWQgZW5kIHRhZyBcIiArIGZvcm1hdEVuZFRhZ0luZm8odGFnKSArIFwiICh2b2lkIGVsZW1lbnRzIGNhbm5vdCBoYXZlIGVuZCB0YWdzKS5cIjtcbiAgfSBlbHNlIGlmIChlbGVtZW50LnRhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3IgPSBcIkNsb3NpbmcgdGFnIFwiICsgZm9ybWF0RW5kVGFnSW5mbyh0YWcpICsgXCIgd2l0aG91dCBhbiBvcGVuIHRhZy5cIjtcbiAgfSBlbHNlIGlmIChlbGVtZW50LnRhZyAhPT0gdGFnLm5hbWUpIHtcbiAgICBlcnJvciA9IFwiQ2xvc2luZyB0YWcgXCIgKyBmb3JtYXRFbmRUYWdJbmZvKHRhZykgKyBcIiBkaWQgbm90IG1hdGNoIGxhc3Qgb3BlbiB0YWcgYFwiICsgZWxlbWVudC50YWcgKyBcImAgKG9uIGxpbmUgXCIgK1xuICAgICAgICAgICAgZWxlbWVudC5sb2Muc3RhcnQubGluZSArIFwiKS5cIjtcbiAgfVxuXG4gIGlmIChlcnJvcikgeyB0aHJvdyBuZXcgRXJyb3IoZXJyb3IpOyB9XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEVuZFRhZ0luZm8odGFnKSB7XG4gIHJldHVybiBcImBcIiArIHRhZy5uYW1lICsgXCJgIChvbiBsaW5lIFwiICsgdGFnLmxvYy5lbmQubGluZSArIFwiKVwiO1xufVxuIl19