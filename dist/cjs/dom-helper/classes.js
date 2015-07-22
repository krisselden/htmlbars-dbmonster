exports.__esModule = true;
var doc = typeof document === 'undefined' ? false : document;

// PhantomJS has a broken classList. See https://github.com/ariya/phantomjs/issues/12782
var canClassList = doc && (function () {
  var d = document.createElement('div');
  if (!d.classList) {
    return false;
  }
  d.classList.add('boo');
  d.classList.add('boo', 'baz');
  return d.className === 'boo baz';
})();

function buildClassList(element) {
  var classString = element.getAttribute('class') || '';
  return classString !== '' && classString !== ' ' ? classString.split(' ') : [];
}

function intersect(containingArray, valuesArray) {
  var containingIndex = 0;
  var containingLength = containingArray.length;
  var valuesIndex = 0;
  var valuesLength = valuesArray.length;

  var intersection = new Array(valuesLength);

  // TODO: rewrite this loop in an optimal manner
  for (; containingIndex < containingLength; containingIndex++) {
    valuesIndex = 0;
    for (; valuesIndex < valuesLength; valuesIndex++) {
      if (valuesArray[valuesIndex] === containingArray[containingIndex]) {
        intersection[valuesIndex] = containingIndex;
        break;
      }
    }
  }

  return intersection;
}

function addClassesViaAttribute(element, classNames) {
  var existingClasses = buildClassList(element);

  var indexes = intersect(existingClasses, classNames);
  var didChange = false;

  for (var i = 0, l = classNames.length; i < l; i++) {
    if (indexes[i] === undefined) {
      didChange = true;
      existingClasses.push(classNames[i]);
    }
  }

  if (didChange) {
    element.setAttribute('class', existingClasses.length > 0 ? existingClasses.join(' ') : '');
  }
}

function removeClassesViaAttribute(element, classNames) {
  var existingClasses = buildClassList(element);

  var indexes = intersect(classNames, existingClasses);
  var didChange = false;
  var newClasses = [];

  for (var i = 0, l = existingClasses.length; i < l; i++) {
    if (indexes[i] === undefined) {
      newClasses.push(existingClasses[i]);
    } else {
      didChange = true;
    }
  }

  if (didChange) {
    element.setAttribute('class', newClasses.length > 0 ? newClasses.join(' ') : '');
  }
}

var addClasses, removeClasses;
if (canClassList) {
  exports.addClasses = addClasses = function addClasses(element, classNames) {
    if (element.classList) {
      if (classNames.length === 1) {
        element.classList.add(classNames[0]);
      } else if (classNames.length === 2) {
        element.classList.add(classNames[0], classNames[1]);
      } else {
        element.classList.add.apply(element.classList, classNames);
      }
    } else {
      addClassesViaAttribute(element, classNames);
    }
  };
  exports.removeClasses = removeClasses = function removeClasses(element, classNames) {
    if (element.classList) {
      if (classNames.length === 1) {
        element.classList.remove(classNames[0]);
      } else if (classNames.length === 2) {
        element.classList.remove(classNames[0], classNames[1]);
      } else {
        element.classList.remove.apply(element.classList, classNames);
      }
    } else {
      removeClassesViaAttribute(element, classNames);
    }
  };
} else {
  exports.addClasses = addClasses = addClassesViaAttribute;
  exports.removeClasses = removeClasses = removeClassesViaAttribute;
}

exports.addClasses = addClasses;
exports.removeClasses = removeClasses;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1oZWxwZXIvY2xhc3Nlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBSSxHQUFHLEdBQUcsT0FBTyxRQUFRLEtBQUssV0FBVyxHQUFHLEtBQUssR0FBRyxRQUFRLENBQUM7OztBQUc3RCxJQUFJLFlBQVksR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFVO0FBQ25DLE1BQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEMsTUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDaEIsV0FBTyxLQUFLLENBQUM7R0FDZDtBQUNELEdBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3ZCLEdBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM5QixTQUFRLENBQUMsQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFFO0NBQ3BDLENBQUEsRUFBRyxDQUFDOztBQUVMLFNBQVMsY0FBYyxDQUFDLE9BQU8sRUFBRTtBQUMvQixNQUFJLFdBQVcsR0FBSSxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQUFBQyxDQUFDO0FBQ3hELFNBQU8sV0FBVyxLQUFLLEVBQUUsSUFBSSxXQUFXLEtBQUssR0FBRyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ2hGOztBQUVELFNBQVMsU0FBUyxDQUFDLGVBQWUsRUFBRSxXQUFXLEVBQUU7QUFDL0MsTUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLE1BQUksZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQztBQUM5QyxNQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDcEIsTUFBSSxZQUFZLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQzs7QUFFdEMsTUFBSSxZQUFZLEdBQUcsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7OztBQUczQyxTQUFNLGVBQWUsR0FBQyxnQkFBZ0IsRUFBQyxlQUFlLEVBQUUsRUFBRTtBQUN4RCxlQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFdBQU0sV0FBVyxHQUFDLFlBQVksRUFBQyxXQUFXLEVBQUUsRUFBRTtBQUM1QyxVQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxlQUFlLENBQUMsZUFBZSxDQUFDLEVBQUU7QUFDakUsb0JBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxlQUFlLENBQUM7QUFDNUMsY0FBTTtPQUNQO0tBQ0Y7R0FDRjs7QUFFRCxTQUFPLFlBQVksQ0FBQztDQUNyQjs7QUFFRCxTQUFTLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUU7QUFDbkQsTUFBSSxlQUFlLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU5QyxNQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3JELE1BQUksU0FBUyxHQUFHLEtBQUssQ0FBQzs7QUFFdEIsT0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQyxRQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUU7QUFDNUIsZUFBUyxHQUFHLElBQUksQ0FBQztBQUNqQixxQkFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNyQztHQUNGOztBQUVELE1BQUksU0FBUyxFQUFFO0FBQ2IsV0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztHQUM1RjtDQUNGOztBQUVELFNBQVMseUJBQXlCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRTtBQUN0RCxNQUFJLGVBQWUsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTlDLE1BQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDckQsTUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLE1BQUksVUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsT0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNoRCxRQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUU7QUFDNUIsZ0JBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckMsTUFBTTtBQUNMLGVBQVMsR0FBRyxJQUFJLENBQUM7S0FDbEI7R0FDRjs7QUFFRCxNQUFJLFNBQVMsRUFBRTtBQUNiLFdBQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7R0FDbEY7Q0FDRjs7QUFFRCxJQUFJLFVBQVUsRUFBRSxhQUFhLENBQUM7QUFDOUIsSUFBSSxZQUFZLEVBQUU7QUFDaEIsVUFnQ0EsVUFBVSxHQWhDVixVQUFVLEdBQUcsU0FBUyxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRTtBQUNwRCxRQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7QUFDckIsVUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMzQixlQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUN0QyxNQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDbEMsZUFBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3JELE1BQU07QUFDTCxlQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztPQUM1RDtLQUNGLE1BQU07QUFDTCw0QkFBc0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDN0M7R0FDRixDQUFDO0FBQ0YsVUFvQkEsYUFBYSxHQXBCYixhQUFhLEdBQUcsU0FBUyxhQUFhLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRTtBQUMxRCxRQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7QUFDckIsVUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMzQixlQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUN6QyxNQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDbEMsZUFBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3hELE1BQU07QUFDTCxlQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztPQUMvRDtLQUNGLE1BQU07QUFDTCwrQkFBeUIsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDaEQ7R0FDRixDQUFDO0NBQ0gsTUFBTTtBQUNMLFVBS0EsVUFBVSxHQUxWLFVBQVUsR0FBRyxzQkFBc0IsQ0FBQztBQUNwQyxVQUtBLGFBQWEsR0FMYixhQUFhLEdBQUcseUJBQXlCLENBQUM7Q0FDM0M7O1FBR0MsVUFBVSxHQUFWLFVBQVU7UUFDVixhQUFhLEdBQWIsYUFBYSIsImZpbGUiOiJkb20taGVscGVyL2NsYXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZG9jID0gdHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyA/IGZhbHNlIDogZG9jdW1lbnQ7XG5cbi8vIFBoYW50b21KUyBoYXMgYSBicm9rZW4gY2xhc3NMaXN0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FyaXlhL3BoYW50b21qcy9pc3N1ZXMvMTI3ODJcbnZhciBjYW5DbGFzc0xpc3QgPSBkb2MgJiYgKGZ1bmN0aW9uKCl7XG4gIHZhciBkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGlmICghZC5jbGFzc0xpc3QpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZC5jbGFzc0xpc3QuYWRkKCdib28nKTtcbiAgZC5jbGFzc0xpc3QuYWRkKCdib28nLCAnYmF6Jyk7XG4gIHJldHVybiAoZC5jbGFzc05hbWUgPT09ICdib28gYmF6Jyk7XG59KSgpO1xuXG5mdW5jdGlvbiBidWlsZENsYXNzTGlzdChlbGVtZW50KSB7XG4gIHZhciBjbGFzc1N0cmluZyA9IChlbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKSB8fCAnJyk7XG4gIHJldHVybiBjbGFzc1N0cmluZyAhPT0gJycgJiYgY2xhc3NTdHJpbmcgIT09ICcgJyA/IGNsYXNzU3RyaW5nLnNwbGl0KCcgJykgOiBbXTtcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0KGNvbnRhaW5pbmdBcnJheSwgdmFsdWVzQXJyYXkpIHtcbiAgdmFyIGNvbnRhaW5pbmdJbmRleCA9IDA7XG4gIHZhciBjb250YWluaW5nTGVuZ3RoID0gY29udGFpbmluZ0FycmF5Lmxlbmd0aDtcbiAgdmFyIHZhbHVlc0luZGV4ID0gMDtcbiAgdmFyIHZhbHVlc0xlbmd0aCA9IHZhbHVlc0FycmF5Lmxlbmd0aDtcblxuICB2YXIgaW50ZXJzZWN0aW9uID0gbmV3IEFycmF5KHZhbHVlc0xlbmd0aCk7XG5cbiAgLy8gVE9ETzogcmV3cml0ZSB0aGlzIGxvb3AgaW4gYW4gb3B0aW1hbCBtYW5uZXJcbiAgZm9yICg7Y29udGFpbmluZ0luZGV4PGNvbnRhaW5pbmdMZW5ndGg7Y29udGFpbmluZ0luZGV4KyspIHtcbiAgICB2YWx1ZXNJbmRleCA9IDA7XG4gICAgZm9yICg7dmFsdWVzSW5kZXg8dmFsdWVzTGVuZ3RoO3ZhbHVlc0luZGV4KyspIHtcbiAgICAgIGlmICh2YWx1ZXNBcnJheVt2YWx1ZXNJbmRleF0gPT09IGNvbnRhaW5pbmdBcnJheVtjb250YWluaW5nSW5kZXhdKSB7XG4gICAgICAgIGludGVyc2VjdGlvblt2YWx1ZXNJbmRleF0gPSBjb250YWluaW5nSW5kZXg7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbnRlcnNlY3Rpb247XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzZXNWaWFBdHRyaWJ1dGUoZWxlbWVudCwgY2xhc3NOYW1lcykge1xuICB2YXIgZXhpc3RpbmdDbGFzc2VzID0gYnVpbGRDbGFzc0xpc3QoZWxlbWVudCk7XG5cbiAgdmFyIGluZGV4ZXMgPSBpbnRlcnNlY3QoZXhpc3RpbmdDbGFzc2VzLCBjbGFzc05hbWVzKTtcbiAgdmFyIGRpZENoYW5nZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGk9MCwgbD1jbGFzc05hbWVzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICBpZiAoaW5kZXhlc1tpXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkaWRDaGFuZ2UgPSB0cnVlO1xuICAgICAgZXhpc3RpbmdDbGFzc2VzLnB1c2goY2xhc3NOYW1lc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGRpZENoYW5nZSkge1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsIGV4aXN0aW5nQ2xhc3Nlcy5sZW5ndGggPiAwID8gZXhpc3RpbmdDbGFzc2VzLmpvaW4oJyAnKSA6ICcnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVDbGFzc2VzVmlhQXR0cmlidXRlKGVsZW1lbnQsIGNsYXNzTmFtZXMpIHtcbiAgdmFyIGV4aXN0aW5nQ2xhc3NlcyA9IGJ1aWxkQ2xhc3NMaXN0KGVsZW1lbnQpO1xuXG4gIHZhciBpbmRleGVzID0gaW50ZXJzZWN0KGNsYXNzTmFtZXMsIGV4aXN0aW5nQ2xhc3Nlcyk7XG4gIHZhciBkaWRDaGFuZ2UgPSBmYWxzZTtcbiAgdmFyIG5ld0NsYXNzZXMgPSBbXTtcblxuICBmb3IgKHZhciBpPTAsIGw9ZXhpc3RpbmdDbGFzc2VzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICBpZiAoaW5kZXhlc1tpXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBuZXdDbGFzc2VzLnB1c2goZXhpc3RpbmdDbGFzc2VzW2ldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlkQ2hhbmdlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoZGlkQ2hhbmdlKSB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgbmV3Q2xhc3Nlcy5sZW5ndGggPiAwID8gbmV3Q2xhc3Nlcy5qb2luKCcgJykgOiAnJyk7XG4gIH1cbn1cblxudmFyIGFkZENsYXNzZXMsIHJlbW92ZUNsYXNzZXM7XG5pZiAoY2FuQ2xhc3NMaXN0KSB7XG4gIGFkZENsYXNzZXMgPSBmdW5jdGlvbiBhZGRDbGFzc2VzKGVsZW1lbnQsIGNsYXNzTmFtZXMpIHtcbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICAgIGlmIChjbGFzc05hbWVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lc1swXSk7XG4gICAgICB9IGVsc2UgaWYgKGNsYXNzTmFtZXMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWVzWzBdLCBjbGFzc05hbWVzWzFdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZC5hcHBseShlbGVtZW50LmNsYXNzTGlzdCwgY2xhc3NOYW1lcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENsYXNzZXNWaWFBdHRyaWJ1dGUoZWxlbWVudCwgY2xhc3NOYW1lcyk7XG4gICAgfVxuICB9O1xuICByZW1vdmVDbGFzc2VzID0gZnVuY3Rpb24gcmVtb3ZlQ2xhc3NlcyhlbGVtZW50LCBjbGFzc05hbWVzKSB7XG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgICBpZiAoY2xhc3NOYW1lcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZXNbMF0pO1xuICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWVzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lc1swXSwgY2xhc3NOYW1lc1sxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUuYXBwbHkoZWxlbWVudC5jbGFzc0xpc3QsIGNsYXNzTmFtZXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmVDbGFzc2VzVmlhQXR0cmlidXRlKGVsZW1lbnQsIGNsYXNzTmFtZXMpO1xuICAgIH1cbiAgfTtcbn0gZWxzZSB7XG4gIGFkZENsYXNzZXMgPSBhZGRDbGFzc2VzVmlhQXR0cmlidXRlO1xuICByZW1vdmVDbGFzc2VzID0gcmVtb3ZlQ2xhc3Nlc1ZpYUF0dHJpYnV0ZTtcbn1cblxuZXhwb3J0IHtcbiAgYWRkQ2xhc3NlcyxcbiAgcmVtb3ZlQ2xhc3Nlc1xufTtcbiJdfQ==