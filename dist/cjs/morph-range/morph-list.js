exports.__esModule = true;

var _utils = require('./utils');

function MorphList() {
  // morph graph
  this.firstChildMorph = null;
  this.lastChildMorph = null;

  this.mountedMorph = null;
}

var prototype = MorphList.prototype;

prototype.clear = function MorphList$clear() {
  var current = this.firstChildMorph;

  while (current) {
    var next = current.nextMorph;
    current.previousMorph = null;
    current.nextMorph = null;
    current.parentMorphList = null;
    current = next;
  }

  this.firstChildMorph = this.lastChildMorph = null;
};

prototype.destroy = function MorphList$destroy() {};

prototype.appendMorph = function MorphList$appendMorph(morph) {
  this.insertBeforeMorph(morph, null);
};

prototype.insertBeforeMorph = function MorphList$insertBeforeMorph(morph, referenceMorph) {
  if (morph.parentMorphList !== null) {
    morph.unlink();
  }
  if (referenceMorph && referenceMorph.parentMorphList !== this) {
    throw new Error('The morph before which the new morph is to be inserted is not a child of this morph.');
  }

  var mountedMorph = this.mountedMorph;

  if (mountedMorph) {

    var parentNode = mountedMorph.firstNode.parentNode;
    var referenceNode = referenceMorph ? referenceMorph.firstNode : mountedMorph.lastNode.nextSibling;

    _utils.insertBefore(parentNode, morph.firstNode, morph.lastNode, referenceNode);

    // was not in list mode replace current content
    if (!this.firstChildMorph) {
      _utils.clear(this.mountedMorph.firstNode.parentNode, this.mountedMorph.firstNode, this.mountedMorph.lastNode);
    }
  }

  morph.parentMorphList = this;

  var previousMorph = referenceMorph ? referenceMorph.previousMorph : this.lastChildMorph;
  if (previousMorph) {
    previousMorph.nextMorph = morph;
    morph.previousMorph = previousMorph;
  } else {
    this.firstChildMorph = morph;
  }

  if (referenceMorph) {
    referenceMorph.previousMorph = morph;
    morph.nextMorph = referenceMorph;
  } else {
    this.lastChildMorph = morph;
  }

  this.firstChildMorph._syncFirstNode();
  this.lastChildMorph._syncLastNode();
};

prototype.removeChildMorph = function MorphList$removeChildMorph(morph) {
  if (morph.parentMorphList !== this) {
    throw new Error("Cannot remove a morph from a parent it is not inside of");
  }

  morph.destroy();
};

exports.default = MorphList;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoLXJhbmdlL21vcnBoLWxpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7cUJBQW9DLFNBQVM7O0FBRTdDLFNBQVMsU0FBUyxHQUFHOztBQUVuQixNQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztBQUM1QixNQUFJLENBQUMsY0FBYyxHQUFJLElBQUksQ0FBQzs7QUFFNUIsTUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Q0FDMUI7O0FBRUQsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQzs7QUFFcEMsU0FBUyxDQUFDLEtBQUssR0FBRyxTQUFTLGVBQWUsR0FBRztBQUMzQyxNQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDOztBQUVuQyxTQUFPLE9BQU8sRUFBRTtBQUNkLFFBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDN0IsV0FBTyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDN0IsV0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDekIsV0FBTyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDL0IsV0FBTyxHQUFHLElBQUksQ0FBQztHQUNoQjs7QUFFRCxNQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0NBQ25ELENBQUM7O0FBRUYsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLGlCQUFpQixHQUFHLEVBQ2hELENBQUM7O0FBRUYsU0FBUyxDQUFDLFdBQVcsR0FBRyxTQUFTLHFCQUFxQixDQUFDLEtBQUssRUFBRTtBQUM1RCxNQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3JDLENBQUM7O0FBRUYsU0FBUyxDQUFDLGlCQUFpQixHQUFHLFNBQVMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRTtBQUN4RixNQUFJLEtBQUssQ0FBQyxlQUFlLEtBQUssSUFBSSxFQUFFO0FBQ2xDLFNBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUNoQjtBQUNELE1BQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxlQUFlLEtBQUssSUFBSSxFQUFFO0FBQzdELFVBQU0sSUFBSSxLQUFLLENBQUMsc0ZBQXNGLENBQUMsQ0FBQztHQUN6Rzs7QUFFRCxNQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDOztBQUVyQyxNQUFJLFlBQVksRUFBRTs7QUFFaEIsUUFBSSxVQUFVLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7QUFDbkQsUUFBSSxhQUFhLEdBQUcsY0FBYyxHQUFHLGNBQWMsQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7O0FBRWxHLFdBaERZLFlBQVksQ0FpRHRCLFVBQVUsRUFDVixLQUFLLENBQUMsU0FBUyxFQUNmLEtBQUssQ0FBQyxRQUFRLEVBQ2QsYUFBYSxDQUNkLENBQUM7OztBQUdGLFFBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO0FBQ3pCLGFBekRHLEtBQUssQ0F5REYsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuQztHQUNGOztBQUVELE9BQUssQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDOztBQUU3QixNQUFJLGFBQWEsR0FBRyxjQUFjLEdBQUcsY0FBYyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO0FBQ3hGLE1BQUksYUFBYSxFQUFFO0FBQ2pCLGlCQUFhLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztBQUNoQyxTQUFLLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztHQUNyQyxNQUFNO0FBQ0wsUUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7R0FDOUI7O0FBRUQsTUFBSSxjQUFjLEVBQUU7QUFDbEIsa0JBQWMsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQ3JDLFNBQUssQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDO0dBQ2xDLE1BQU07QUFDTCxRQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztHQUM3Qjs7QUFFRCxNQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3RDLE1BQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLENBQUM7Q0FDckMsQ0FBQzs7QUFFRixTQUFTLENBQUMsZ0JBQWdCLEdBQUcsU0FBUywwQkFBMEIsQ0FBQyxLQUFLLEVBQUU7QUFDdEUsTUFBSSxLQUFLLENBQUMsZUFBZSxLQUFLLElBQUksRUFBRTtBQUNsQyxVQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7R0FDNUU7O0FBRUQsT0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQ2pCLENBQUM7O2tCQUVhLFNBQVMiLCJmaWxlIjoibW9ycGgtcmFuZ2UvbW9ycGgtbGlzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNsZWFyLCBpbnNlcnRCZWZvcmUgfSBmcm9tICcuL3V0aWxzJztcblxuZnVuY3Rpb24gTW9ycGhMaXN0KCkge1xuICAvLyBtb3JwaCBncmFwaFxuICB0aGlzLmZpcnN0Q2hpbGRNb3JwaCA9IG51bGw7XG4gIHRoaXMubGFzdENoaWxkTW9ycGggID0gbnVsbDtcblxuICB0aGlzLm1vdW50ZWRNb3JwaCA9IG51bGw7XG59XG5cbnZhciBwcm90b3R5cGUgPSBNb3JwaExpc3QucHJvdG90eXBlO1xuXG5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiBNb3JwaExpc3QkY2xlYXIoKSB7XG4gIHZhciBjdXJyZW50ID0gdGhpcy5maXJzdENoaWxkTW9ycGg7XG5cbiAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICB2YXIgbmV4dCA9IGN1cnJlbnQubmV4dE1vcnBoO1xuICAgIGN1cnJlbnQucHJldmlvdXNNb3JwaCA9IG51bGw7XG4gICAgY3VycmVudC5uZXh0TW9ycGggPSBudWxsO1xuICAgIGN1cnJlbnQucGFyZW50TW9ycGhMaXN0ID0gbnVsbDtcbiAgICBjdXJyZW50ID0gbmV4dDtcbiAgfVxuXG4gIHRoaXMuZmlyc3RDaGlsZE1vcnBoID0gdGhpcy5sYXN0Q2hpbGRNb3JwaCA9IG51bGw7XG59O1xuXG5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIE1vcnBoTGlzdCRkZXN0cm95KCkge1xufTtcblxucHJvdG90eXBlLmFwcGVuZE1vcnBoID0gZnVuY3Rpb24gTW9ycGhMaXN0JGFwcGVuZE1vcnBoKG1vcnBoKSB7XG4gIHRoaXMuaW5zZXJ0QmVmb3JlTW9ycGgobW9ycGgsIG51bGwpO1xufTtcblxucHJvdG90eXBlLmluc2VydEJlZm9yZU1vcnBoID0gZnVuY3Rpb24gTW9ycGhMaXN0JGluc2VydEJlZm9yZU1vcnBoKG1vcnBoLCByZWZlcmVuY2VNb3JwaCkge1xuICBpZiAobW9ycGgucGFyZW50TW9ycGhMaXN0ICE9PSBudWxsKSB7XG4gICAgbW9ycGgudW5saW5rKCk7XG4gIH1cbiAgaWYgKHJlZmVyZW5jZU1vcnBoICYmIHJlZmVyZW5jZU1vcnBoLnBhcmVudE1vcnBoTGlzdCAhPT0gdGhpcykge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIG1vcnBoIGJlZm9yZSB3aGljaCB0aGUgbmV3IG1vcnBoIGlzIHRvIGJlIGluc2VydGVkIGlzIG5vdCBhIGNoaWxkIG9mIHRoaXMgbW9ycGguJyk7XG4gIH1cblxuICB2YXIgbW91bnRlZE1vcnBoID0gdGhpcy5tb3VudGVkTW9ycGg7XG5cbiAgaWYgKG1vdW50ZWRNb3JwaCkge1xuXG4gICAgdmFyIHBhcmVudE5vZGUgPSBtb3VudGVkTW9ycGguZmlyc3ROb2RlLnBhcmVudE5vZGU7XG4gICAgdmFyIHJlZmVyZW5jZU5vZGUgPSByZWZlcmVuY2VNb3JwaCA/IHJlZmVyZW5jZU1vcnBoLmZpcnN0Tm9kZSA6IG1vdW50ZWRNb3JwaC5sYXN0Tm9kZS5uZXh0U2libGluZztcblxuICAgIGluc2VydEJlZm9yZShcbiAgICAgIHBhcmVudE5vZGUsXG4gICAgICBtb3JwaC5maXJzdE5vZGUsXG4gICAgICBtb3JwaC5sYXN0Tm9kZSxcbiAgICAgIHJlZmVyZW5jZU5vZGVcbiAgICApO1xuXG4gICAgLy8gd2FzIG5vdCBpbiBsaXN0IG1vZGUgcmVwbGFjZSBjdXJyZW50IGNvbnRlbnRcbiAgICBpZiAoIXRoaXMuZmlyc3RDaGlsZE1vcnBoKSB7XG4gICAgICBjbGVhcih0aGlzLm1vdW50ZWRNb3JwaC5maXJzdE5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICAgIHRoaXMubW91bnRlZE1vcnBoLmZpcnN0Tm9kZSxcbiAgICAgICAgICAgIHRoaXMubW91bnRlZE1vcnBoLmxhc3ROb2RlKTtcbiAgICB9XG4gIH1cblxuICBtb3JwaC5wYXJlbnRNb3JwaExpc3QgPSB0aGlzO1xuXG4gIHZhciBwcmV2aW91c01vcnBoID0gcmVmZXJlbmNlTW9ycGggPyByZWZlcmVuY2VNb3JwaC5wcmV2aW91c01vcnBoIDogdGhpcy5sYXN0Q2hpbGRNb3JwaDtcbiAgaWYgKHByZXZpb3VzTW9ycGgpIHtcbiAgICBwcmV2aW91c01vcnBoLm5leHRNb3JwaCA9IG1vcnBoO1xuICAgIG1vcnBoLnByZXZpb3VzTW9ycGggPSBwcmV2aW91c01vcnBoO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZmlyc3RDaGlsZE1vcnBoID0gbW9ycGg7XG4gIH1cblxuICBpZiAocmVmZXJlbmNlTW9ycGgpIHtcbiAgICByZWZlcmVuY2VNb3JwaC5wcmV2aW91c01vcnBoID0gbW9ycGg7XG4gICAgbW9ycGgubmV4dE1vcnBoID0gcmVmZXJlbmNlTW9ycGg7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5sYXN0Q2hpbGRNb3JwaCA9IG1vcnBoO1xuICB9XG5cbiAgdGhpcy5maXJzdENoaWxkTW9ycGguX3N5bmNGaXJzdE5vZGUoKTtcbiAgdGhpcy5sYXN0Q2hpbGRNb3JwaC5fc3luY0xhc3ROb2RlKCk7XG59O1xuXG5wcm90b3R5cGUucmVtb3ZlQ2hpbGRNb3JwaCA9IGZ1bmN0aW9uIE1vcnBoTGlzdCRyZW1vdmVDaGlsZE1vcnBoKG1vcnBoKSB7XG4gIGlmIChtb3JwaC5wYXJlbnRNb3JwaExpc3QgIT09IHRoaXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVtb3ZlIGEgbW9ycGggZnJvbSBhIHBhcmVudCBpdCBpcyBub3QgaW5zaWRlIG9mXCIpO1xuICB9XG5cbiAgbW9ycGguZGVzdHJveSgpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTW9ycGhMaXN0O1xuIl19