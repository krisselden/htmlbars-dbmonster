exports.__esModule = true;
var push = Array.prototype.push;

function Frame() {
  this.parentNode = null;
  this.children = null;
  this.childIndex = null;
  this.childCount = null;
  this.childTemplateCount = 0;
  this.mustacheCount = 0;
  this.actions = [];
}

/**
 * Takes in an AST and outputs a list of actions to be consumed
 * by a compiler. For example, the template
 *
 *     foo{{bar}}<div>baz</div>
 *
 * produces the actions
 *
 *     [['startProgram', [programNode, 0]],
 *      ['text', [textNode, 0, 3]],
 *      ['mustache', [mustacheNode, 1, 3]],
 *      ['openElement', [elementNode, 2, 3, 0]],
 *      ['text', [textNode, 0, 1]],
 *      ['closeElement', [elementNode, 2, 3],
 *      ['endProgram', [programNode]]]
 *
 * This visitor walks the AST depth first and backwards. As
 * a result the bottom-most child template will appear at the
 * top of the actions list whereas the root template will appear
 * at the bottom of the list. For example,
 *
 *     <div>{{#if}}foo{{else}}bar<b></b>{{/if}}</div>
 *
 * produces the actions
 *
 *     [['startProgram', [programNode, 0]],
 *      ['text', [textNode, 0, 2, 0]],
 *      ['openElement', [elementNode, 1, 2, 0]],
 *      ['closeElement', [elementNode, 1, 2]],
 *      ['endProgram', [programNode]],
 *      ['startProgram', [programNode, 0]],
 *      ['text', [textNode, 0, 1]],
 *      ['endProgram', [programNode]],
 *      ['startProgram', [programNode, 2]],
 *      ['openElement', [elementNode, 0, 1, 1]],
 *      ['block', [blockNode, 0, 1]],
 *      ['closeElement', [elementNode, 0, 1]],
 *      ['endProgram', [programNode]]]
 *
 * The state of the traversal is maintained by a stack of frames.
 * Whenever a node with children is entered (either a ProgramNode
 * or an ElementNode) a frame is pushed onto the stack. The frame
 * contains information about the state of the traversal of that
 * node. For example,
 *
 *   - index of the current child node being visited
 *   - the number of mustaches contained within its child nodes
 *   - the list of actions generated by its child nodes
 */

function TemplateVisitor() {
  this.frameStack = [];
  this.actions = [];
  this.programDepth = -1;
}

// Traversal methods

TemplateVisitor.prototype.visit = function (node) {
  this[node.type](node);
};

TemplateVisitor.prototype.Program = function (program) {
  this.programDepth++;

  var parentFrame = this.getCurrentFrame();
  var programFrame = this.pushFrame();

  programFrame.parentNode = program;
  programFrame.children = program.body;
  programFrame.childCount = program.body.length;
  programFrame.blankChildTextNodes = [];
  programFrame.actions.push(['endProgram', [program, this.programDepth]]);

  for (var i = program.body.length - 1; i >= 0; i--) {
    programFrame.childIndex = i;
    this.visit(program.body[i]);
  }

  programFrame.actions.push(['startProgram', [program, programFrame.childTemplateCount, programFrame.blankChildTextNodes.reverse()]]);
  this.popFrame();

  this.programDepth--;

  // Push the completed template into the global actions list
  if (parentFrame) {
    parentFrame.childTemplateCount++;
  }
  push.apply(this.actions, programFrame.actions.reverse());
};

TemplateVisitor.prototype.ElementNode = function (element) {
  var parentFrame = this.getCurrentFrame();
  var elementFrame = this.pushFrame();

  elementFrame.parentNode = element;
  elementFrame.children = element.children;
  elementFrame.childCount = element.children.length;
  elementFrame.mustacheCount += element.modifiers.length;
  elementFrame.blankChildTextNodes = [];

  var actionArgs = [element, parentFrame.childIndex, parentFrame.childCount];

  elementFrame.actions.push(['closeElement', actionArgs]);

  for (var i = element.attributes.length - 1; i >= 0; i--) {
    this.visit(element.attributes[i]);
  }

  for (i = element.children.length - 1; i >= 0; i--) {
    elementFrame.childIndex = i;
    this.visit(element.children[i]);
  }

  elementFrame.actions.push(['openElement', actionArgs.concat([elementFrame.mustacheCount, elementFrame.blankChildTextNodes.reverse()])]);
  this.popFrame();

  // Propagate the element's frame state to the parent frame
  if (elementFrame.mustacheCount > 0) {
    parentFrame.mustacheCount++;
  }
  parentFrame.childTemplateCount += elementFrame.childTemplateCount;
  push.apply(parentFrame.actions, elementFrame.actions);
};

TemplateVisitor.prototype.AttrNode = function (attr) {
  if (attr.value.type !== 'TextNode') {
    this.getCurrentFrame().mustacheCount++;
  }
};

TemplateVisitor.prototype.TextNode = function (text) {
  var frame = this.getCurrentFrame();
  if (text.chars === '') {
    frame.blankChildTextNodes.push(domIndexOf(frame.children, text));
  }
  frame.actions.push(['text', [text, frame.childIndex, frame.childCount]]);
};

TemplateVisitor.prototype.BlockStatement = function (node) {
  var frame = this.getCurrentFrame();

  frame.mustacheCount++;
  frame.actions.push(['block', [node, frame.childIndex, frame.childCount]]);

  if (node.inverse) {
    this.visit(node.inverse);
  }
  if (node.program) {
    this.visit(node.program);
  }
};

TemplateVisitor.prototype.ComponentNode = function (node) {
  var frame = this.getCurrentFrame();

  frame.mustacheCount++;
  frame.actions.push(['component', [node, frame.childIndex, frame.childCount]]);

  if (node.program) {
    this.visit(node.program);
  }
};

TemplateVisitor.prototype.PartialStatement = function (node) {
  var frame = this.getCurrentFrame();
  frame.mustacheCount++;
  frame.actions.push(['mustache', [node, frame.childIndex, frame.childCount]]);
};

TemplateVisitor.prototype.CommentStatement = function (text) {
  var frame = this.getCurrentFrame();
  frame.actions.push(['comment', [text, frame.childIndex, frame.childCount]]);
};

TemplateVisitor.prototype.MustacheStatement = function (mustache) {
  var frame = this.getCurrentFrame();
  frame.mustacheCount++;
  frame.actions.push(['mustache', [mustache, frame.childIndex, frame.childCount]]);
};

// Frame helpers

TemplateVisitor.prototype.getCurrentFrame = function () {
  return this.frameStack[this.frameStack.length - 1];
};

TemplateVisitor.prototype.pushFrame = function () {
  var frame = new Frame();
  this.frameStack.push(frame);
  return frame;
};

TemplateVisitor.prototype.popFrame = function () {
  return this.frameStack.pop();
};

exports.default = TemplateVisitor;

// Returns the index of `domNode` in the `nodes` array, skipping
// over any nodes which do not represent DOM nodes.
function domIndexOf(nodes, domNode) {
  var index = -1;

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];

    if (node.type !== 'TextNode' && node.type !== 'ElementNode') {
      continue;
    } else {
      index++;
    }

    if (node === domNode) {
      return index;
    }
  }

  return -1;
}
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLWNvbXBpbGVyL3RlbXBsYXRlLXZpc2l0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDOztBQUVoQyxTQUFTLEtBQUssR0FBRztBQUNmLE1BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFDNUIsTUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFDdkIsTUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Q0FDbkI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvREQsU0FBUyxlQUFlLEdBQUc7QUFDekIsTUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDckIsTUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsTUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztDQUN4Qjs7OztBQUlELGVBQWUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQy9DLE1BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdkIsQ0FBQzs7QUFFRixlQUFlLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUNwRCxNQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7O0FBRXBCLE1BQUksV0FBVyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUN6QyxNQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFF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S0FBSyxDQUFDO0NBQ2QsQ0FBQzs7QUFFRixlQUFlLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxZQUFXO0FBQzlDLFNBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUM5QixDQUFDOztrQkFFYSxlQUFlOzs7O0FBSzlCLFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFDbEMsTUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRWYsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVwQixRQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssYUFBYSxFQUFFO0FBQzNELGVBQVM7S0FDVixNQUFNO0FBQ0wsV0FBSyxFQUFFLENBQUM7S0FDVDs7QUFFRCxRQUFJLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDcEIsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGOztBQUVELFNBQU8sQ0FBQyxDQUFDLENBQUM7Q0FDWCIsImZpbGUiOiJodG1sYmFycy1jb21waWxlci90ZW1wbGF0ZS12aXNpdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHB1c2ggPSBBcnJheS5wcm90b3R5cGUucHVzaDtcblxuZnVuY3Rpb24gRnJhbWUoKSB7XG4gIHRoaXMucGFyZW50Tm9kZSA9IG51bGw7XG4gIHRoaXMuY2hpbGRyZW4gPSBudWxsO1xuICB0aGlzLmNoaWxkSW5kZXggPSBudWxsO1xuICB0aGlzLmNoaWxkQ291bnQgPSBudWxsO1xuICB0aGlzLmNoaWxkVGVtcGxhdGVDb3VudCA9IDA7XG4gIHRoaXMubXVzdGFjaGVDb3VudCA9IDA7XG4gIHRoaXMuYWN0aW9ucyA9IFtdO1xufVxuXG4vKipcbiAqIFRha2VzIGluIGFuIEFTVCBhbmQgb3V0cHV0cyBhIGxpc3Qgb2YgYWN0aW9ucyB0byBiZSBjb25zdW1lZFxuICogYnkgYSBjb21waWxlci4gRm9yIGV4YW1wbGUsIHRoZSB0ZW1wbGF0ZVxuICpcbiAqICAgICBmb297e2Jhcn19PGRpdj5iYXo8L2Rpdj5cbiAqXG4gKiBwcm9kdWNlcyB0aGUgYWN0aW9uc1xuICpcbiAqICAgICBbWydzdGFydFByb2dyYW0nLCBbcHJvZ3JhbU5vZGUsIDBdXSxcbiAqICAgICAgWyd0ZXh0JywgW3RleHROb2RlLCAwLCAzXV0sXG4gKiAgICAgIFsnbXVzdGFjaGUnLCBbbXVzdGFjaGVOb2RlLCAxLCAzXV0sXG4gKiAgICAgIFsnb3BlbkVsZW1lbnQnLCBbZWxlbWVudE5vZGUsIDIsIDMsIDBdXSxcbiAqICAgICAgWyd0ZXh0JywgW3RleHROb2RlLCAwLCAxXV0sXG4gKiAgICAgIFsnY2xvc2VFbGVtZW50JywgW2VsZW1lbnROb2RlLCAyLCAzXSxcbiAqICAgICAgWydlbmRQcm9ncmFtJywgW3Byb2dyYW1Ob2RlXV1dXG4gKlxuICogVGhpcyB2aXNpdG9yIHdhbGtzIHRoZSBBU1QgZGVwdGggZmlyc3QgYW5kIGJhY2t3YXJkcy4gQXNcbiAqIGEgcmVzdWx0IHRoZSBib3R0b20tbW9zdCBjaGlsZCB0ZW1wbGF0ZSB3aWxsIGFwcGVhciBhdCB0aGVcbiAqIHRvcCBvZiB0aGUgYWN0aW9ucyBsaXN0IHdoZXJlYXMgdGhlIHJvb3QgdGVtcGxhdGUgd2lsbCBhcHBlYXJcbiAqIGF0IHRoZSBib3R0b20gb2YgdGhlIGxpc3QuIEZvciBleGFtcGxlLFxuICpcbiAqICAgICA8ZGl2Pnt7I2lmfX1mb297e2Vsc2V9fWJhcjxiPjwvYj57ey9pZn19PC9kaXY+XG4gKlxuICogcHJvZHVjZXMgdGhlIGFjdGlvbnNcbiAqXG4gKiAgICAgW1snc3RhcnRQcm9ncmFtJywgW3Byb2dyYW1Ob2RlLCAwXV0sXG4gKiAgICAgIFsndGV4dCcsIFt0ZXh0Tm9kZSwgMCwgMiwgMF1dLFxuICogICAgICBbJ29wZW5FbGVtZW50JywgW2VsZW1lbnROb2RlLCAxLCAyLCAwXV0sXG4gKiAgICAgIFsnY2xvc2VFbGVtZW50JywgW2VsZW1lbnROb2RlLCAxLCAyXV0sXG4gKiAgICAgIFsnZW5kUHJvZ3JhbScsIFtwcm9ncmFtTm9kZV1dLFxuICogICAgICBbJ3N0YXJ0UHJvZ3JhbScsIFtwcm9ncmFtTm9kZSwgMF1dLFxuICogICAgICBbJ3RleHQnLCBbdGV4dE5vZGUsIDAsIDFdXSxcbiAqICAgICAgWydlbmRQcm9ncmFtJywgW3Byb2dyYW1Ob2RlXV0sXG4gKiAgICAgIFsnc3RhcnRQcm9ncmFtJywgW3Byb2dyYW1Ob2RlLCAyXV0sXG4gKiAgICAgIFsnb3BlbkVsZW1lbnQnLCBbZWxlbWVudE5vZGUsIDAsIDEsIDFdXSxcbiAqICAgICAgWydibG9jaycsIFtibG9ja05vZGUsIDAsIDFdXSxcbiAqICAgICAgWydjbG9zZUVsZW1lbnQnLCBbZWxlbWVudE5vZGUsIDAsIDFdXSxcbiAqICAgICAgWydlbmRQcm9ncmFtJywgW3Byb2dyYW1Ob2RlXV1dXG4gKlxuICogVGhlIHN0YXRlIG9mIHRoZSB0cmF2ZXJzYWwgaXMgbWFpbnRhaW5lZCBieSBhIHN0YWNrIG9mIGZyYW1lcy5cbiAqIFdoZW5ldmVyIGEgbm9kZSB3aXRoIGNoaWxkcmVuIGlzIGVudGVyZWQgKGVpdGhlciBhIFByb2dyYW1Ob2RlXG4gKiBvciBhbiBFbGVtZW50Tm9kZSkgYSBmcmFtZSBpcyBwdXNoZWQgb250byB0aGUgc3RhY2suIFRoZSBmcmFtZVxuICogY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHN0YXRlIG9mIHRoZSB0cmF2ZXJzYWwgb2YgdGhhdFxuICogbm9kZS4gRm9yIGV4YW1wbGUsXG4gKlxuICogICAtIGluZGV4IG9mIHRoZSBjdXJyZW50IGNoaWxkIG5vZGUgYmVpbmcgdmlzaXRlZFxuICogICAtIHRoZSBudW1iZXIgb2YgbXVzdGFjaGVzIGNvbnRhaW5lZCB3aXRoaW4gaXRzIGNoaWxkIG5vZGVzXG4gKiAgIC0gdGhlIGxpc3Qgb2YgYWN0aW9ucyBnZW5lcmF0ZWQgYnkgaXRzIGNoaWxkIG5vZGVzXG4gKi9cblxuZnVuY3Rpb24gVGVtcGxhdGVWaXNpdG9yKCkge1xuICB0aGlzLmZyYW1lU3RhY2sgPSBbXTtcbiAgdGhpcy5hY3Rpb25zID0gW107XG4gIHRoaXMucHJvZ3JhbURlcHRoID0gLTE7XG59XG5cbi8vIFRyYXZlcnNhbCBtZXRob2RzXG5cblRlbXBsYXRlVmlzaXRvci5wcm90b3R5cGUudmlzaXQgPSBmdW5jdGlvbihub2RlKSB7XG4gIHRoaXNbbm9kZS50eXBlXShub2RlKTtcbn07XG5cblRlbXBsYXRlVmlzaXRvci5wcm90b3R5cGUuUHJvZ3JhbSA9IGZ1bmN0aW9uKHByb2dyYW0pIHtcbiAgdGhpcy5wcm9ncmFtRGVwdGgrKztcblxuICB2YXIgcGFyZW50RnJhbWUgPSB0aGlzLmdldEN1cnJlbnRGcmFtZSgpO1xuICB2YXIgcHJvZ3JhbUZyYW1lID0gdGhpcy5wdXNoRnJhbWUoKTtcblxuICBwcm9ncmFtRnJhbWUucGFyZW50Tm9kZSA9IHByb2dyYW07XG4gIHByb2dyYW1GcmFtZS5jaGlsZHJlbiA9IHByb2dyYW0uYm9keTtcbiAgcHJvZ3JhbUZyYW1lLmNoaWxkQ291bnQgPSBwcm9ncmFtLmJvZHkubGVuZ3RoO1xuICBwcm9ncmFtRnJhbWUuYmxhbmtDaGlsZFRleHROb2RlcyA9IFtdO1xuICBwcm9ncmFtRnJhbWUuYWN0aW9ucy5wdXNoKFsnZW5kUHJvZ3JhbScsIFtwcm9ncmFtLCB0aGlzLnByb2dyYW1EZXB0aF1dKTtcblxuICBmb3IgKHZhciBpID0gcHJvZ3JhbS5ib2R5Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgcHJvZ3JhbUZyYW1lLmNoaWxkSW5kZXggPSBpO1xuICAgIHRoaXMudmlzaXQocHJvZ3JhbS5ib2R5W2ldKTtcbiAgfVxuXG4gIHByb2dyYW1GcmFtZS5hY3Rpb25zLnB1c2goWydzdGFydFByb2dyYW0nLCBbXG4gICAgcHJvZ3JhbSwgcHJvZ3JhbUZyYW1lLmNoaWxkVGVtcGxhdGVDb3VudCxcbiAgICBwcm9ncmFtRnJhbWUuYmxhbmtDaGlsZFRleHROb2Rlcy5yZXZlcnNlKClcbiAgXV0pO1xuICB0aGlzLnBvcEZyYW1lKCk7XG5cbiAgdGhpcy5wcm9ncmFtRGVwdGgtLTtcblxuICAvLyBQdXNoIHRoZSBjb21wbGV0ZWQgdGVtcGxhdGUgaW50byB0aGUgZ2xvYmFsIGFjdGlvbnMgbGlzdFxuICBpZiAocGFyZW50RnJhbWUpIHsgcGFyZW50RnJhbWUuY2hpbGRUZW1wbGF0ZUNvdW50Kys7IH1cbiAgcHVzaC5hcHBseSh0aGlzLmFjdGlvbnMsIHByb2dyYW1GcmFtZS5hY3Rpb25zLnJldmVyc2UoKSk7XG59O1xuXG5UZW1wbGF0ZVZpc2l0b3IucHJvdG90eXBlLkVsZW1lbnROb2RlID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICB2YXIgcGFyZW50RnJhbWUgPSB0aGlzLmdldEN1cnJlbnRGcmFtZSgpO1xuICB2YXIgZWxlbWVudEZyYW1lID0gdGhpcy5wdXNoRnJhbWUoKTtcblxuICBlbGVtZW50RnJhbWUucGFyZW50Tm9kZSA9IGVsZW1lbnQ7XG4gIGVsZW1lbnRGcmFtZS5jaGlsZHJlbiA9IGVsZW1lbnQuY2hpbGRyZW47XG4gIGVsZW1lbnRGcmFtZS5jaGlsZENvdW50ID0gZWxlbWVudC5jaGlsZHJlbi5sZW5ndGg7XG4gIGVsZW1lbnRGcmFtZS5tdXN0YWNoZUNvdW50ICs9IGVsZW1lbnQubW9kaWZpZXJzLmxlbmd0aDtcbiAgZWxlbWVudEZyYW1lLmJsYW5rQ2hpbGRUZXh0Tm9kZXMgPSBbXTtcblxuICB2YXIgYWN0aW9uQXJncyA9IFtcbiAgICBlbGVtZW50LFxuICAgIHBhcmVudEZyYW1lLmNoaWxkSW5kZXgsXG4gICAgcGFyZW50RnJhbWUuY2hpbGRDb3VudFxuICBdO1xuXG4gIGVsZW1lbnRGcmFtZS5hY3Rpb25zLnB1c2goWydjbG9zZUVsZW1lbnQnLCBhY3Rpb25BcmdzXSk7XG5cbiAgZm9yICh2YXIgaSA9IGVsZW1lbnQuYXR0cmlidXRlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHRoaXMudmlzaXQoZWxlbWVudC5hdHRyaWJ1dGVzW2ldKTtcbiAgfVxuXG4gIGZvciAoaSA9IGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBlbGVtZW50RnJhbWUuY2hpbGRJbmRleCA9IGk7XG4gICAgdGhpcy52aXNpdChlbGVtZW50LmNoaWxkcmVuW2ldKTtcbiAgfVxuXG4gIGVsZW1lbnRGcmFtZS5hY3Rpb25zLnB1c2goWydvcGVuRWxlbWVudCcsIGFjdGlvbkFyZ3MuY29uY2F0KFtcbiAgICBlbGVtZW50RnJhbWUubXVzdGFjaGVDb3VudCwgZWxlbWVudEZyYW1lLmJsYW5rQ2hpbGRUZXh0Tm9kZXMucmV2ZXJzZSgpIF0pXSk7XG4gIHRoaXMucG9wRnJhbWUoKTtcblxuICAvLyBQcm9wYWdhdGUgdGhlIGVsZW1lbnQncyBmcmFtZSBzdGF0ZSB0byB0aGUgcGFyZW50IGZyYW1lXG4gIGlmIChlbGVtZW50RnJhbWUubXVzdGFjaGVDb3VudCA+IDApIHsgcGFyZW50RnJhbWUubXVzdGFjaGVDb3VudCsrOyB9XG4gIHBhcmVudEZyYW1lLmNoaWxkVGVtcGxhdGVDb3VudCArPSBlbGVtZW50RnJhbWUuY2hpbGRUZW1wbGF0ZUNvdW50O1xuICBwdXNoLmFwcGx5KHBhcmVudEZyYW1lLmFjdGlvbnMsIGVsZW1lbnRGcmFtZS5hY3Rpb25zKTtcbn07XG5cblRlbXBsYXRlVmlzaXRvci5wcm90b3R5cGUuQXR0ck5vZGUgPSBmdW5jdGlvbihhdHRyKSB7XG4gIGlmIChhdHRyLnZhbHVlLnR5cGUgIT09ICdUZXh0Tm9kZScpIHtcbiAgICB0aGlzLmdldEN1cnJlbnRGcmFtZSgpLm11c3RhY2hlQ291bnQrKztcbiAgfVxufTtcblxuVGVtcGxhdGVWaXNpdG9yLnByb3RvdHlwZS5UZXh0Tm9kZSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgdmFyIGZyYW1lID0gdGhpcy5nZXRDdXJyZW50RnJhbWUoKTtcbiAgaWYgKHRleHQuY2hhcnMgPT09ICcnKSB7XG4gICAgZnJhbWUuYmxhbmtDaGlsZFRleHROb2Rlcy5wdXNoKGRvbUluZGV4T2YoZnJhbWUuY2hpbGRyZW4sIHRleHQpKTtcbiAgfVxuICBmcmFtZS5hY3Rpb25zLnB1c2goWyd0ZXh0JywgW3RleHQsIGZyYW1lLmNoaWxkSW5kZXgsIGZyYW1lLmNoaWxkQ291bnRdXSk7XG59O1xuXG5UZW1wbGF0ZVZpc2l0b3IucHJvdG90eXBlLkJsb2NrU3RhdGVtZW50ID0gZnVuY3Rpb24obm9kZSkge1xuICB2YXIgZnJhbWUgPSB0aGlzLmdldEN1cnJlbnRGcmFtZSgpO1xuXG4gIGZyYW1lLm11c3RhY2hlQ291bnQrKztcbiAgZnJhbWUuYWN0aW9ucy5wdXNoKFsnYmxvY2snLCBbbm9kZSwgZnJhbWUuY2hpbGRJbmRleCwgZnJhbWUuY2hpbGRDb3VudF1dKTtcblxuICBpZiAobm9kZS5pbnZlcnNlKSB7IHRoaXMudmlzaXQobm9kZS5pbnZlcnNlKTsgfVxuICBpZiAobm9kZS5wcm9ncmFtKSB7IHRoaXMudmlzaXQobm9kZS5wcm9ncmFtKTsgfVxufTtcblxuVGVtcGxhdGVWaXNpdG9yLnByb3RvdHlwZS5Db21wb25lbnROb2RlID0gZnVuY3Rpb24obm9kZSkge1xuICB2YXIgZnJhbWUgPSB0aGlzLmdldEN1cnJlbnRGcmFtZSgpO1xuXG4gIGZyYW1lLm11c3RhY2hlQ291bnQrKztcbiAgZnJhbWUuYWN0aW9ucy5wdXNoKFsnY29tcG9uZW50JywgW25vZGUsIGZyYW1lLmNoaWxkSW5kZXgsIGZyYW1lLmNoaWxkQ291bnRdXSk7XG5cbiAgaWYgKG5vZGUucHJvZ3JhbSkgeyB0aGlzLnZpc2l0KG5vZGUucHJvZ3JhbSk7IH1cbn07XG5cblxuVGVtcGxhdGVWaXNpdG9yLnByb3RvdHlwZS5QYXJ0aWFsU3RhdGVtZW50ID0gZnVuY3Rpb24obm9kZSkge1xuICB2YXIgZnJhbWUgPSB0aGlzLmdldEN1cnJlbnRGcmFtZSgpO1xuICBmcmFtZS5tdXN0YWNoZUNvdW50Kys7XG4gIGZyYW1lLmFjdGlvbnMucHVzaChbJ211c3RhY2hlJywgW25vZGUsIGZyYW1lLmNoaWxkSW5kZXgsIGZyYW1lLmNoaWxkQ291bnRdXSk7XG59O1xuXG5UZW1wbGF0ZVZpc2l0b3IucHJvdG90eXBlLkNvbW1lbnRTdGF0ZW1lbnQgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHZhciBmcmFtZSA9IHRoaXMuZ2V0Q3VycmVudEZyYW1lKCk7XG4gIGZyYW1lLmFjdGlvbnMucHVzaChbJ2NvbW1lbnQnLCBbdGV4dCwgZnJhbWUuY2hpbGRJbmRleCwgZnJhbWUuY2hpbGRDb3VudF1dKTtcbn07XG5cblRlbXBsYXRlVmlzaXRvci5wcm90b3R5cGUuTXVzdGFjaGVTdGF0ZW1lbnQgPSBmdW5jdGlvbihtdXN0YWNoZSkge1xuICB2YXIgZnJhbWUgPSB0aGlzLmdldEN1cnJlbnRGcmFtZSgpO1xuICBmcmFtZS5tdXN0YWNoZUNvdW50Kys7XG4gIGZyYW1lLmFjdGlvbnMucHVzaChbJ211c3RhY2hlJywgW211c3RhY2hlLCBmcmFtZS5jaGlsZEluZGV4LCBmcmFtZS5jaGlsZENvdW50XV0pO1xufTtcblxuLy8gRnJhbWUgaGVscGVyc1xuXG5UZW1wbGF0ZVZpc2l0b3IucHJvdG90eXBlLmdldEN1cnJlbnRGcmFtZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5mcmFtZVN0YWNrW3RoaXMuZnJhbWVTdGFjay5sZW5ndGggLSAxXTtcbn07XG5cblRlbXBsYXRlVmlzaXRvci5wcm90b3R5cGUucHVzaEZyYW1lID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmcmFtZSA9IG5ldyBGcmFtZSgpO1xuICB0aGlzLmZyYW1lU3RhY2sucHVzaChmcmFtZSk7XG4gIHJldHVybiBmcmFtZTtcbn07XG5cblRlbXBsYXRlVmlzaXRvci5wcm90b3R5cGUucG9wRnJhbWUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZnJhbWVTdGFjay5wb3AoKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRlbXBsYXRlVmlzaXRvcjtcblxuXG4vLyBSZXR1cm5zIHRoZSBpbmRleCBvZiBgZG9tTm9kZWAgaW4gdGhlIGBub2Rlc2AgYXJyYXksIHNraXBwaW5nXG4vLyBvdmVyIGFueSBub2RlcyB3aGljaCBkbyBub3QgcmVwcmVzZW50IERPTSBub2Rlcy5cbmZ1bmN0aW9uIGRvbUluZGV4T2Yobm9kZXMsIGRvbU5vZGUpIHtcbiAgdmFyIGluZGV4ID0gLTE7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBub2RlID0gbm9kZXNbaV07XG5cbiAgICBpZiAobm9kZS50eXBlICE9PSAnVGV4dE5vZGUnICYmIG5vZGUudHlwZSAhPT0gJ0VsZW1lbnROb2RlJykge1xuICAgICAgY29udGludWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4Kys7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUgPT09IGRvbU5vZGUpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTE7XG59XG4iXX0=