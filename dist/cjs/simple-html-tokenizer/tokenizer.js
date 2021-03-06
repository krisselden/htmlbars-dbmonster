exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _eventedTokenizer = require('./evented-tokenizer');

var _eventedTokenizer2 = _interopRequireDefault(_eventedTokenizer);

var _tokens = require('./tokens');

function Tokenizer(entityParser) {
  this.tokenizer = new _eventedTokenizer2.default(this, entityParser);

  this.token = null;
  this.startLine = -1;
  this.startColumn = -1;

  this.reset();
}

Tokenizer.prototype = {
  tokenize: function (input) {
    this.tokens = [];
    this.tokenizer.tokenize(input);
    return this.tokens;
  },

  tokenizePart: function (input) {
    this.tokens = [];
    this.tokenizer.tokenizePart(input);
    return this.tokens;
  },

  tokenizeEOF: function () {
    this.tokens = [];
    this.tokenizer.tokenizeEOF();
    return this.tokens[0];
  },

  reset: function () {
    this.token = null;
    this.startLine = 1;
    this.startColumn = 0;
  },

  addLocInfo: function () {
    this.token.loc = {
      start: {
        line: this.startLine,
        column: this.startColumn
      },
      end: {
        line: this.tokenizer.line,
        column: this.tokenizer.column
      }
    };

    this.startLine = this.tokenizer.line;
    this.startColumn = this.tokenizer.column;
  },

  // Data

  beginData: function () {
    this.token = new _tokens.Chars();
    this.tokens.push(this.token);
  },

  appendToData: function (char) {
    this.token.chars += char;
  },

  finishData: function () {
    this.addLocInfo();
  },

  // Comment

  beginComment: function () {
    this.token = new _tokens.Comment();
    this.tokens.push(this.token);
  },

  appendToCommentData: function (char) {
    this.token.chars += char;
  },

  finishComment: function () {
    this.addLocInfo();
  },

  // Tags - basic

  beginStartTag: function () {
    this.token = new _tokens.StartTag();
    this.tokens.push(this.token);
  },

  beginEndTag: function () {
    this.token = new _tokens.EndTag();
    this.tokens.push(this.token);
  },

  finishTag: function () {
    this.addLocInfo();
  },

  markTagAsSelfClosing: function () {
    this.token.selfClosing = true;
  },

  // Tags - name

  appendToTagName: function (char) {
    this.token.tagName += char;
  },

  // Tags - attributes

  beginAttribute: function () {
    this._currentAttribute = ["", "", null];
    this.token.attributes.push(this._currentAttribute);
  },

  appendToAttributeName: function (char) {
    this._currentAttribute[0] += char;
  },

  beginAttributeValue: function (isQuoted) {
    this._currentAttribute[2] = isQuoted;
  },

  appendToAttributeValue: function (char) {
    this._currentAttribute[1] = this._currentAttribute[1] || "";
    this._currentAttribute[1] += char;
  },

  finishAttributeValue: function () {}
};

exports.default = Tokenizer;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNpbXBsZS1odG1sLXRva2VuaXplci90b2tlbml6ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztnQ0FBNkIscUJBQXFCOzs7O3NCQU0zQyxVQUFVOztBQUVqQixTQUFTLFNBQVMsQ0FBQyxZQUFZLEVBQUU7QUFDL0IsTUFBSSxDQUFDLFNBQVMsR0FBRywrQkFBcUIsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUUxRCxNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixNQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLE1BQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRXRCLE1BQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNkOztBQUVELFNBQVMsQ0FBQyxTQUFTLEdBQUc7QUFDcEIsVUFBUSxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQ3hCLFFBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9CLFdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztHQUNwQjs7QUFFRCxjQUFZLEVBQUUsVUFBUyxLQUFLLEVBQUU7QUFDNUIsUUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsUUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkMsV0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0dBQ3BCOztBQUVELGFBQVcsRUFBRSxZQUFXO0FBQ3RCLFFBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDN0IsV0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ3ZCOztBQUVELE9BQUssRUFBRSxZQUFXO0FBQ2hCLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFB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USxFQUFFO0FBQ3RDLFFBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7R0FDdEM7O0FBRUQsd0JBQXNCLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDckMsUUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDNUQsUUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQztHQUNuQzs7QUFFRCxzQkFBb0IsRUFBRSxZQUFXLEVBQ2hDO0NBQ0YsQ0FBQzs7a0JBRWEsU0FBUyIsImZpbGUiOiJzaW1wbGUtaHRtbC10b2tlbml6ZXIvdG9rZW5pemVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV2ZW50ZWRUb2tlbml6ZXIgZnJvbSAnLi9ldmVudGVkLXRva2VuaXplcic7XG5pbXBvcnQge1xuICBTdGFydFRhZyxcbiAgRW5kVGFnLFxuICBDaGFycyxcbiAgQ29tbWVudFxufSBmcm9tICcuL3Rva2Vucyc7XG5cbmZ1bmN0aW9uIFRva2VuaXplcihlbnRpdHlQYXJzZXIpIHtcbiAgdGhpcy50b2tlbml6ZXIgPSBuZXcgRXZlbnRlZFRva2VuaXplcih0aGlzLCBlbnRpdHlQYXJzZXIpO1xuXG4gIHRoaXMudG9rZW4gPSBudWxsO1xuICB0aGlzLnN0YXJ0TGluZSA9IC0xO1xuICB0aGlzLnN0YXJ0Q29sdW1uID0gLTE7XG5cbiAgdGhpcy5yZXNldCgpO1xufVxuXG5Ub2tlbml6ZXIucHJvdG90eXBlID0ge1xuICB0b2tlbml6ZTogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICB0aGlzLnRva2VucyA9IFtdO1xuICAgIHRoaXMudG9rZW5pemVyLnRva2VuaXplKGlucHV0KTtcbiAgICByZXR1cm4gdGhpcy50b2tlbnM7XG4gIH0sXG5cbiAgdG9rZW5pemVQYXJ0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHRoaXMudG9rZW5zID0gW107XG4gICAgdGhpcy50b2tlbml6ZXIudG9rZW5pemVQYXJ0KGlucHV0KTtcbiAgICByZXR1cm4gdGhpcy50b2tlbnM7XG4gIH0sXG5cbiAgdG9rZW5pemVFT0Y6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudG9rZW5zID0gW107XG4gICAgdGhpcy50b2tlbml6ZXIudG9rZW5pemVFT0YoKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbnNbMF07XG4gIH0sXG5cbiAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudG9rZW4gPSBudWxsO1xuICAgIHRoaXMuc3RhcnRMaW5lID0gMTtcbiAgICB0aGlzLnN0YXJ0Q29sdW1uID0gMDtcbiAgfSxcblxuICBhZGRMb2NJbmZvOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRva2VuLmxvYyA9IHtcbiAgICAgIHN0YXJ0OiB7XG4gICAgICAgIGxpbmU6IHRoaXMuc3RhcnRMaW5lLFxuICAgICAgICBjb2x1bW46IHRoaXMuc3RhcnRDb2x1bW5cbiAgICAgIH0sXG4gICAgICBlbmQ6IHtcbiAgICAgICAgbGluZTogdGhpcy50b2tlbml6ZXIubGluZSxcbiAgICAgICAgY29sdW1uOiB0aGlzLnRva2VuaXplci5jb2x1bW5cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5zdGFydExpbmUgPSB0aGlzLnRva2VuaXplci5saW5lO1xuICAgIHRoaXMuc3RhcnRDb2x1bW4gPSB0aGlzLnRva2VuaXplci5jb2x1bW47XG4gIH0sXG5cbiAgLy8gRGF0YVxuXG4gIGJlZ2luRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50b2tlbiA9IG5ldyBDaGFycygpO1xuICAgIHRoaXMudG9rZW5zLnB1c2godGhpcy50b2tlbik7XG4gIH0sXG5cbiAgYXBwZW5kVG9EYXRhOiBmdW5jdGlvbihjaGFyKSB7XG4gICAgdGhpcy50b2tlbi5jaGFycyArPSBjaGFyO1xuICB9LFxuXG4gIGZpbmlzaERhdGE6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWRkTG9jSW5mbygpO1xuICB9LFxuXG4gIC8vIENvbW1lbnRcblxuICBiZWdpbkNvbW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudG9rZW4gPSBuZXcgQ29tbWVudCgpO1xuICAgIHRoaXMudG9rZW5zLnB1c2godGhpcy50b2tlbik7XG4gIH0sXG5cbiAgYXBwZW5kVG9Db21tZW50RGF0YTogZnVuY3Rpb24oY2hhcikge1xuICAgIHRoaXMudG9rZW4uY2hhcnMgKz0gY2hhcjtcbiAgfSxcblxuICBmaW5pc2hDb21tZW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkZExvY0luZm8oKTtcbiAgfSxcblxuICAvLyBUYWdzIC0gYmFzaWNcblxuICBiZWdpblN0YXJ0VGFnOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRva2VuID0gbmV3IFN0YXJ0VGFnKCk7XG4gICAgdGhpcy50b2tlbnMucHVzaCh0aGlzLnRva2VuKTtcbiAgfSxcblxuICBiZWdpbkVuZFRhZzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50b2tlbiA9IG5ldyBFbmRUYWcoKTtcbiAgICB0aGlzLnRva2Vucy5wdXNoKHRoaXMudG9rZW4pO1xuICB9LFxuXG4gIGZpbmlzaFRhZzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hZGRMb2NJbmZvKCk7XG4gIH0sXG5cbiAgbWFya1RhZ0FzU2VsZkNsb3Npbmc6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudG9rZW4uc2VsZkNsb3NpbmcgPSB0cnVlO1xuICB9LFxuXG4gIC8vIFRhZ3MgLSBuYW1lXG5cbiAgYXBwZW5kVG9UYWdOYW1lOiBmdW5jdGlvbihjaGFyKSB7XG4gICAgdGhpcy50b2tlbi50YWdOYW1lICs9IGNoYXI7XG4gIH0sXG5cbiAgLy8gVGFncyAtIGF0dHJpYnV0ZXNcblxuICBiZWdpbkF0dHJpYnV0ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fY3VycmVudEF0dHJpYnV0ZSA9IFtcIlwiLCBcIlwiLCBudWxsXTtcbiAgICB0aGlzLnRva2VuLmF0dHJpYnV0ZXMucHVzaCh0aGlzLl9jdXJyZW50QXR0cmlidXRlKTtcbiAgfSxcblxuICBhcHBlbmRUb0F0dHJpYnV0ZU5hbWU6IGZ1bmN0aW9uKGNoYXIpIHtcbiAgICB0aGlzLl9jdXJyZW50QXR0cmlidXRlWzBdICs9IGNoYXI7XG4gIH0sXG5cbiAgYmVnaW5BdHRyaWJ1dGVWYWx1ZTogZnVuY3Rpb24oaXNRdW90ZWQpIHtcbiAgICB0aGlzLl9jdXJyZW50QXR0cmlidXRlWzJdID0gaXNRdW90ZWQ7XG4gIH0sXG5cbiAgYXBwZW5kVG9BdHRyaWJ1dGVWYWx1ZTogZnVuY3Rpb24oY2hhcikge1xuICAgIHRoaXMuX2N1cnJlbnRBdHRyaWJ1dGVbMV0gPSB0aGlzLl9jdXJyZW50QXR0cmlidXRlWzFdIHx8IFwiXCI7XG4gICAgdGhpcy5fY3VycmVudEF0dHJpYnV0ZVsxXSArPSBjaGFyO1xuICB9LFxuXG4gIGZpbmlzaEF0dHJpYnV0ZVZhbHVlOiBmdW5jdGlvbigpIHtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgVG9rZW5pemVyO1xuIl19