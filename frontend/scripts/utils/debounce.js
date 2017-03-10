// Modified version of debounce function extracted from
// https://remysharp.com/2010/07/21/throttling-function-calls
// with support for conditional triggering of the callback function
export default function debounce(fn, delay, conditionFc) {
  var timer = null;

  return function() {
    var context = this, args = arguments;

    clearTimeout(timer);

    if (conditionFc && !conditionFc()) {
      return;
    }

    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
}
