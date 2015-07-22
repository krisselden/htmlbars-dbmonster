define('htmlbars-util', ['exports', './htmlbars-util/safe-string', './htmlbars-util/handlebars/utils', './htmlbars-util/namespaces', './htmlbars-util/morph-utils'], function (exports, _htmlbarsUtilSafeString, _htmlbarsUtilHandlebarsUtils, _htmlbarsUtilNamespaces, _htmlbarsUtilMorphUtils) {
  exports.SafeString = _htmlbarsUtilSafeString.default;
  exports.escapeExpression = _htmlbarsUtilHandlebarsUtils.escapeExpression;
  exports.getAttrNamespace = _htmlbarsUtilNamespaces.getAttrNamespace;
  exports.validateChildMorphs = _htmlbarsUtilMorphUtils.validateChildMorphs;
  exports.linkParams = _htmlbarsUtilMorphUtils.linkParams;
  exports.dump = _htmlbarsUtilMorphUtils.dump;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtVQU1FLFVBQVU7VUFDVixnQkFBZ0IsZ0NBTlQsZ0JBQWdCO1VBT3ZCLGdCQUFnQiwyQkFOVCxnQkFBZ0I7VUFPdkIsbUJBQW1CLDJCQU5aLG1CQUFtQjtVQU8xQixVQUFVLDJCQVBrQixVQUFVO1VBUXRDLElBQUksMkJBUm9DLElBQUkiLCJmaWxlIjoiaHRtbGJhcnMtdXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTYWZlU3RyaW5nIGZyb20gJy4vaHRtbGJhcnMtdXRpbC9zYWZlLXN0cmluZyc7XG5pbXBvcnQgeyBlc2NhcGVFeHByZXNzaW9uIH0gZnJvbSAnLi9odG1sYmFycy11dGlsL2hhbmRsZWJhcnMvdXRpbHMnO1xuaW1wb3J0IHsgZ2V0QXR0ck5hbWVzcGFjZSB9IGZyb20gJy4vaHRtbGJhcnMtdXRpbC9uYW1lc3BhY2VzJztcbmltcG9ydCB7IHZhbGlkYXRlQ2hpbGRNb3JwaHMsIGxpbmtQYXJhbXMsIGR1bXAgfSBmcm9tICcuL2h0bWxiYXJzLXV0aWwvbW9ycGgtdXRpbHMnO1xuXG5leHBvcnQge1xuICBTYWZlU3RyaW5nLFxuICBlc2NhcGVFeHByZXNzaW9uLFxuICBnZXRBdHRyTmFtZXNwYWNlLFxuICB2YWxpZGF0ZUNoaWxkTW9ycGhzLFxuICBsaW5rUGFyYW1zLFxuICBkdW1wXG59O1xuIl19
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
define('htmlbars-util/safe-string', ['exports', './handlebars/safe-string'], function (exports, _handlebarsSafeString) {
  exports.default = _handlebarsSafeString.default;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJodG1sYmFycy11dGlsL3NhZmUtc3RyaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtVQUVnQixXQUFXLEdBQVgsV0FBVztVQXlCWCxRQUFRLEdBQVIsUUFBUTtVQWdEUixnQkFBZ0IsR0FBaEIsZ0JBQWdCO1VBc0RoQixVQUFVLEdBQVYsVUFBVTtVQTBCVixjQUFjLEdBQWQsY0FBYzs7QUF6SnZCLFdBQVMsV0FBVyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUU7OztBQUdqRCxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDOzs7O0FBSWxDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7Ozs7O0FBSzdCLFFBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDOzs7Ozs7O0FBTzVCLFFBQUksQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDOztBQUUvQixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztHQUMzQjs7QUFFTSxXQUFTLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRTtBQUN2RCxRQUFJLEtBQUssR0FBRyxVQUFTLEdBQUcsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFO0FBQ2hGLFVBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtBQUN6QixrQkFBVSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ3JGLE1BQU07QUFDTCxZQUFJLE9BQU8sR0FBRyxFQUFFLFdBQVcsRUFBRSxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDOztBQUUzRCxZQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0FBQy9CLFlBQUksV0FBVyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUMzRixZQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDOztBQUV6QyxXQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRS9FLFlBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUN0QixhQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVDLE1BQU0sSUFBSSxZQUFZLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUMxQyxhQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6RDs7QUFFRCxrQkFBVSxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUVuRCx3QkFBZ0IsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBVztBQUMxRCxpQkFBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3hDLGdCQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsRUFBRSxVQUFVLEVBQVYsVUFBVSxFQUFFLGNBQWMsRUFBZCxjQUFjLEVBQUUsVUFBVSxFQUFWLFVBQVUsRUFBRSxDQUFDLENBQUM7U0FDaEYsQ0FBQyxDQUFDO09BQ0o7S0FDRixDQUFDOztBQUVGLFNBQUssQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQzs7QUFFN0IsV0FBTyxLQUFLLENBQUM7R0FDZDs7QUFFRCxXQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRTtBQUM1QyxRQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsYUFBTztLQUNSO0FBQ0QsUUFBSSxPQUFPLE1BQU0sS0FBSyxVQUFVLEVBQUU7QUFDaEMsU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUMvQyxNQUFNO0FBQ0wsV0FBSyxJQUFJLElBQUksSUFBSSxNQUFNLEVBQUU7QUFDdkIsWUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQy9CLGFBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNEO09BQ0Y7S0FDRjtHQUNGOztBQUVNLFdBQVMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRTs7Ozs7O0FBTTdFLFFBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDdEMsZUFBVyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDbkMsZUFBVyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7Ozs7QUFJMUMsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7QUFHL0IsUUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtBQUM1QixhQUFPO0tBQ1I7O0FBRUQsUUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQzs7OztBQUk5QixRQUFJLFNBQVMsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQUM7QUFDN0MsUUFBSSxTQUFTLEVBQUU7QUFDYixVQUFJLGFBQWEsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDO0FBQzlDLFVBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUM7O0FBRXJDLGFBQU8sSUFBSSxFQUFFO0FBQ1gsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQzs7OztBQUkxQixZQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxhQUFhLENBQUEsQUFBQyxFQUFFO0FBQ2hDLGlCQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUIsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVCLGNBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjs7QUFFRCxZQUFJLEdBQUcsSUFBSSxDQUFDO09BQ2I7S0FDRjs7QUFFRCxhQUFTLEdBQUcsV0FBVyxDQUFDLGdCQUFnQixDQUFDO0FBQ3pDLFFBQUksU0FBUyxFQUFFO0FBQ2Isb0JBQWMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZDOztBQUVELFFBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUM7QUFDdkMsUUFBSSxPQUFPLEVBQUU7QUFDWCxnQkFBVSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztLQUMxQjtHQUNGOztBQUVNLFdBQVMsVUFBVSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFO0FBQ2xELFFBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7QUFDMUMsUUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztBQUMxQyxRQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUM1QyxRQUFJLFVBQVUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQzs7QUFFMUMsYUFBUyxXQUFXLENBQUMsSUFBSSxFQUFFO0FBQ3pCLFVBQUksT0FBTyxFQUFFO0FBQUUsZUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQUU7QUFDL0IsVUFBSSxPQUFPLEVBQUU7QUFBRSxlQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7T0FBRTtLQUNoQzs7QUFFRCxRQUFJLFdBQVcsRUFBRTtBQUFFLGlCQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztLQUFFO0FBQzFELFFBQUksT0FBTyxFQUFFO0FBQUUsYUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQUU7QUFDaEMsUUFBSSxXQUFXLElBQUksT0FBTyxFQUFFO0FBQUUsYUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQUU7O0FBRS9DLDRCQWhKTyxhQUFhLENBZ0pOLEtBQUssQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7OztBQUc3QyxTQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZCxRQUFJLFVBQVUsRUFBRTtBQUFFLGdCQUFVLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztLQUFFOztBQUV4RCxTQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN4QixTQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN6QixTQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztHQUN6Qjs7QUFFTSxXQUFTLGNBQWMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRTtBQUNwRCxRQUFJLElBQUksR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDOztBQUVyQyxXQUFPLElBQUksRUFBRTtBQUNYLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDMUIsYUFBTyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxnQkFBVSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVmLFVBQUksR0FBRyxJQUFJLENBQUM7S0FDYjs7O0FBR0QsYUFBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2xCLFNBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0dBQ3hCIiwiZmlsZSI6Imh0bWxiYXJzLXV0aWwvdGVtcGxhdGUtdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB2aXNpdENoaWxkcmVuIH0gZnJvbSBcIi4uL2h0bWxiYXJzLXV0aWwvbW9ycGgtdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmRlclN0YXRlKHJlbmRlck5vZGUsIG1vcnBoTGlzdCkge1xuICAvLyBUaGUgbW9ycGggbGlzdCB0aGF0IGlzIG5vIGxvbmdlciBuZWVkZWQgYW5kIGNhbiBiZVxuICAvLyBkZXN0cm95ZWQuXG4gIHRoaXMubW9ycGhMaXN0VG9DbGVhciA9IG1vcnBoTGlzdDtcblxuICAvLyBUaGUgbW9ycGggbGlzdCB0aGF0IG5lZWRzIHRvIGJlIHBydW5lZCBvZiBhbnkgaXRlbXNcbiAgLy8gdGhhdCB3ZXJlIG5vdCB5aWVsZGVkIG9uIGEgc3Vic2VxdWVudCByZW5kZXIuXG4gIHRoaXMubW9ycGhMaXN0VG9QcnVuZSA9IG51bGw7XG5cbiAgLy8gQSBtYXAgb2YgbW9ycGhzIGZvciBlYWNoIGl0ZW0geWllbGRlZCBpbiBkdXJpbmcgdGhpc1xuICAvLyByZW5kZXJpbmcgcGFzcy4gQW55IG1vcnBocyBpbiB0aGUgRE9NIGJ1dCBub3QgaW4gdGhpcyBtYXBcbiAgLy8gd2lsbCBiZSBwcnVuZWQgZHVyaW5nIGNsZWFudXAuXG4gIHRoaXMuaGFuZGxlZE1vcnBocyA9IHt9O1xuICB0aGlzLmNvbGxpc2lvbnMgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIG1vcnBoIHRvIGNsZWFyIG9uY2UgcmVuZGVyaW5nIGlzIGNvbXBsZXRlLiBCeVxuICAvLyBkZWZhdWx0LCB3ZSBzZXQgdGhpcyB0byB0aGUgcHJldmlvdXMgbW9ycGggKHRvIGNhdGNoXG4gIC8vIHRoZSBjYXNlIHdoZXJlIG5vdGhpbmcgaXMgeWllbGRlZDsgaW4gdGhhdCBjYXNlLCB3ZVxuICAvLyBzaG91bGQganVzdCBjbGVhciB0aGUgbW9ycGgpLiBPdGhlcndpc2UgdGhpcyBnZXRzIHNldFxuICAvLyB0byBudWxsIGlmIGFueXRoaW5nIGlzIHJlbmRlcmVkLlxuICB0aGlzLm1vcnBoVG9DbGVhciA9IHJlbmRlck5vZGU7XG5cbiAgdGhpcy5zaGFkb3dPcHRpb25zID0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrRm9yKHJlbmRlciwgdGVtcGxhdGUsIGJsb2NrT3B0aW9ucykge1xuICB2YXIgYmxvY2sgPSBmdW5jdGlvbihlbnYsIGJsb2NrQXJndW1lbnRzLCBzZWxmLCByZW5kZXJOb2RlLCBwYXJlbnRTY29wZSwgdmlzaXRvcikge1xuICAgIGlmIChyZW5kZXJOb2RlLmxhc3RSZXN1bHQpIHtcbiAgICAgIHJlbmRlck5vZGUubGFzdFJlc3VsdC5yZXZhbGlkYXRlV2l0aChlbnYsIHVuZGVmaW5lZCwgc2VsZiwgYmxvY2tBcmd1bWVudHMsIHZpc2l0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHsgcmVuZGVyU3RhdGU6IG5ldyBSZW5kZXJTdGF0ZShyZW5kZXJOb2RlKSB9O1xuXG4gICAgICB2YXIgc2NvcGUgPSBibG9ja09wdGlvbnMuc2NvcGU7XG4gICAgICB2YXIgc2hhZG93U2NvcGUgPSBzY29wZSA/IGVudi5ob29rcy5jcmVhdGVDaGlsZFNjb3BlKHNjb3BlKSA6IGVudi5ob29rcy5jcmVhdGVGcmVzaFNjb3BlKCk7XG4gICAgICB2YXIgYXR0cmlidXRlcyA9IGJsb2NrT3B0aW9ucy5hdHRyaWJ1dGVzO1xuXG4gICAgICBlbnYuaG9va3MuYmluZFNoYWRvd1Njb3BlKGVudiwgcGFyZW50U2NvcGUsIHNoYWRvd1Njb3BlLCBibG9ja09wdGlvbnMub3B0aW9ucyk7XG5cbiAgICAgIGlmIChzZWxmICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZW52Lmhvb2tzLmJpbmRTZWxmKGVudiwgc2hhZG93U2NvcGUsIHNlbGYpO1xuICAgICAgfSBlbHNlIGlmIChibG9ja09wdGlvbnMuc2VsZiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVudi5ob29rcy5iaW5kU2VsZihlbnYsIHNoYWRvd1Njb3BlLCBibG9ja09wdGlvbnMuc2VsZik7XG4gICAgICB9XG5cbiAgICAgIGJpbmRCbG9ja3MoZW52LCBzaGFkb3dTY29wZSwgYmxvY2tPcHRpb25zLnlpZWxkVG8pO1xuXG4gICAgICByZW5kZXJBbmRDbGVhbnVwKHJlbmRlck5vZGUsIGVudiwgb3B0aW9ucywgbnVsbCwgZnVuY3Rpb24oKSB7XG4gICAgICAgIG9wdGlvbnMucmVuZGVyU3RhdGUubW9ycGhUb0NsZWFyID0gbnVsbDtcbiAgICAgICAgcmVuZGVyKHRlbXBsYXRlLCBlbnYsIHNoYWRvd1Njb3BlLCB7IHJlbmRlck5vZGUsIGJsb2NrQXJndW1lbnRzLCBhdHRyaWJ1dGVzIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrLmFyaXR5ID0gdGVtcGxhdGUuYXJpdHk7XG5cbiAgcmV0dXJuIGJsb2NrO1xufVxuXG5mdW5jdGlvbiBiaW5kQmxvY2tzKGVudiwgc2hhZG93U2NvcGUsIGJsb2Nrcykge1xuICBpZiAoIWJsb2Nrcykge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodHlwZW9mIGJsb2NrcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGVudi5ob29rcy5iaW5kQmxvY2soZW52LCBzaGFkb3dTY29wZSwgYmxvY2tzKTtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIGJsb2Nrcykge1xuICAgICAgaWYgKGJsb2Nrcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBlbnYuaG9va3MuYmluZEJsb2NrKGVudiwgc2hhZG93U2NvcGUsIGJsb2Nrc1tuYW1lXSwgbmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJBbmRDbGVhbnVwKG1vcnBoLCBlbnYsIG9wdGlvbnMsIHNoYWRvd09wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIC8vIFRoZSBSZW5kZXJTdGF0ZSBvYmplY3QgaXMgdXNlZCB0byBjb2xsZWN0IGluZm9ybWF0aW9uIGFib3V0IHdoYXQgdGhlXG4gIC8vIGhlbHBlciBvciBob29rIGJlaW5nIGludm9rZWQgaGFzIHlpZWxkZWQuIE9uY2UgaXQgaGFzIGZpbmlzaGVkIGVpdGhlclxuICAvLyB5aWVsZGluZyBtdWx0aXBsZSBpdGVtcyAodmlhIHlpZWxkSXRlbSkgb3IgYSBzaW5nbGUgdGVtcGxhdGUgKHZpYVxuICAvLyB5aWVsZFRlbXBsYXRlKSwgd2UgZGV0ZWN0IHdoYXQgd2FzIHJlbmRlcmVkIGFuZCBob3cgaXQgZGlmZmVycyBmcm9tXG4gIC8vIHRoZSBwcmV2aW91cyByZW5kZXIsIGNsZWFuaW5nIHVwIG9sZCBzdGF0ZSBpbiBET00gYXMgYXBwcm9wcmlhdGUuXG4gIHZhciByZW5kZXJTdGF0ZSA9IG9wdGlvbnMucmVuZGVyU3RhdGU7XG4gIHJlbmRlclN0YXRlLmNvbGxpc2lvbnMgPSB1bmRlZmluZWQ7XG4gIHJlbmRlclN0YXRlLnNoYWRvd09wdGlvbnMgPSBzaGFkb3dPcHRpb25zO1xuXG4gIC8vIEludm9rZSB0aGUgY2FsbGJhY2ssIGluc3RydWN0aW5nIGl0IHRvIHNhdmUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBpdFxuICAvLyByZW5kZXJzIGludG8gUmVuZGVyU3RhdGUuXG4gIHZhciByZXN1bHQgPSBjYWxsYmFjayhvcHRpb25zKTtcblxuICAvLyBUaGUgaG9vayBjYW4gb3B0LW91dCBvZiBjbGVhbnVwIGlmIGl0IGhhbmRsZWQgY2xlYW51cCBpdHNlbGYuXG4gIGlmIChyZXN1bHQgJiYgcmVzdWx0LmhhbmRsZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgbW9ycGhNYXAgPSBtb3JwaC5tb3JwaE1hcDtcblxuICAvLyBXYWxrIHRoZSBtb3JwaCBsaXN0LCBjbGVhcmluZyBhbnkgaXRlbXMgdGhhdCB3ZXJlIHlpZWxkZWQgaW4gYSBwcmV2aW91c1xuICAvLyByZW5kZXIgYnV0IHdlcmUgbm90IHlpZWxkZWQgZHVyaW5nIHRoaXMgcmVuZGVyLlxuICBsZXQgbW9ycGhMaXN0ID0gcmVuZGVyU3RhdGUubW9ycGhMaXN0VG9QcnVuZTtcbiAgaWYgKG1vcnBoTGlzdCkge1xuICAgIGxldCBoYW5kbGVkTW9ycGhzID0gcmVuZGVyU3RhdGUuaGFuZGxlZE1vcnBocztcbiAgICBsZXQgaXRlbSA9IG1vcnBoTGlzdC5maXJzdENoaWxkTW9ycGg7XG5cbiAgICB3aGlsZSAoaXRlbSkge1xuICAgICAgbGV0IG5leHQgPSBpdGVtLm5leHRNb3JwaDtcblxuICAgICAgLy8gSWYgd2UgZG9uJ3Qgc2VlIHRoZSBrZXkgaW4gaGFuZGxlZE1vcnBocywgaXQgd2Fzbid0XG4gICAgICAvLyB5aWVsZGVkIGluIGFuZCB3ZSBjYW4gc2FmZWx5IHJlbW92ZSBpdCBmcm9tIERPTS5cbiAgICAgIGlmICghKGl0ZW0ua2V5IGluIGhhbmRsZWRNb3JwaHMpKSB7XG4gICAgICAgIGRlbGV0ZSBtb3JwaE1hcFtpdGVtLmtleV07XG4gICAgICAgIGNsZWFyTW9ycGgoaXRlbSwgZW52LCB0cnVlKTtcbiAgICAgICAgaXRlbS5kZXN0cm95KCk7XG4gICAgICB9XG5cbiAgICAgIGl0ZW0gPSBuZXh0O1xuICAgIH1cbiAgfVxuXG4gIG1vcnBoTGlzdCA9IHJlbmRlclN0YXRlLm1vcnBoTGlzdFRvQ2xlYXI7XG4gIGlmIChtb3JwaExpc3QpIHtcbiAgICBjbGVhck1vcnBoTGlzdChtb3JwaExpc3QsIG1vcnBoLCBlbnYpO1xuICB9XG5cbiAgbGV0IHRvQ2xlYXIgPSByZW5kZXJTdGF0ZS5tb3JwaFRvQ2xlYXI7XG4gIGlmICh0b0NsZWFyKSB7XG4gICAgY2xlYXJNb3JwaCh0b0NsZWFyLCBlbnYpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhck1vcnBoKG1vcnBoLCBlbnYsIGRlc3Ryb3lTZWxmKSB7XG4gIHZhciBjbGVhbnVwID0gZW52Lmhvb2tzLmNsZWFudXBSZW5kZXJOb2RlO1xuICB2YXIgZGVzdHJveSA9IGVudi5ob29rcy5kZXN0cm95UmVuZGVyTm9kZTtcbiAgdmFyIHdpbGxDbGVhbnVwID0gZW52Lmhvb2tzLndpbGxDbGVhbnVwVHJlZTtcbiAgdmFyIGRpZENsZWFudXAgPSBlbnYuaG9va3MuZGlkQ2xlYW51cFRyZWU7XG5cbiAgZnVuY3Rpb24gZGVzdHJveU5vZGUobm9kZSkge1xuICAgIGlmIChjbGVhbnVwKSB7IGNsZWFudXAobm9kZSk7IH1cbiAgICBpZiAoZGVzdHJveSkgeyBkZXN0cm95KG5vZGUpOyB9XG4gIH1cblxuICBpZiAod2lsbENsZWFudXApIHsgd2lsbENsZWFudXAoZW52LCBtb3JwaCwgZGVzdHJveVNlbGYpOyB9XG4gIGlmIChjbGVhbnVwKSB7IGNsZWFudXAobW9ycGgpOyB9XG4gIGlmIChkZXN0cm95U2VsZiAmJiBkZXN0cm95KSB7IGRlc3Ryb3kobW9ycGgpOyB9XG5cbiAgdmlzaXRDaGlsZHJlbihtb3JwaC5jaGlsZE5vZGVzLCBkZXN0cm95Tm9kZSk7XG5cbiAgLy8gVE9ETzogRGVhbCB3aXRoIGxvZ2ljYWwgY2hpbGRyZW4gdGhhdCBhcmUgbm90IGluIHRoZSBET00gdHJlZVxuICBtb3JwaC5jbGVhcigpO1xuICBpZiAoZGlkQ2xlYW51cCkgeyBkaWRDbGVhbnVwKGVudiwgbW9ycGgsIGRlc3Ryb3lTZWxmKTsgfVxuXG4gIG1vcnBoLmxhc3RSZXN1bHQgPSBudWxsO1xuICBtb3JwaC5sYXN0WWllbGRlZCA9IG51bGw7XG4gIG1vcnBoLmNoaWxkTm9kZXMgPSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJNb3JwaExpc3QobW9ycGhMaXN0LCBtb3JwaCwgZW52KSB7XG4gIGxldCBpdGVtID0gbW9ycGhMaXN0LmZpcnN0Q2hpbGRNb3JwaDtcblxuICB3aGlsZSAoaXRlbSkge1xuICAgIGxldCBuZXh0ID0gaXRlbS5uZXh0TW9ycGg7XG4gICAgZGVsZXRlIG1vcnBoLm1vcnBoTWFwW2l0ZW0ua2V5XTtcbiAgICBjbGVhck1vcnBoKGl0ZW0sIGVudiwgdHJ1ZSk7XG4gICAgaXRlbS5kZXN0cm95KCk7XG5cbiAgICBpdGVtID0gbmV4dDtcbiAgfVxuXG4gIC8vIFJlbW92ZSB0aGUgTW9ycGhMaXN0IGZyb20gdGhlIG1vcnBoLlxuICBtb3JwaExpc3QuY2xlYXIoKTtcbiAgbW9ycGgubW9ycGhMaXN0ID0gbnVsbDtcbn1cbiJdfQ==
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