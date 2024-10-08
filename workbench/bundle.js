(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Evaluator = exports.Apath = void 0;
const parser_js_1 = require("../core/parser.js");
const transpiler_js_1 = require("../core/transpiler.js");
const apart = __importStar(require("../core/apart.js"));
const errors_warnings_js_1 = require("../core/errors_warnings.js");
const step_func_man_js_1 = require("../core/step-func-man.js");
const adt_js_1 = require("../core/adt.js");
/**
 * func style apath facade.
 *
 * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
 */
class Apath {
    mode;
    sfman = new step_func_man_js_1.StepFuncManager();
    /** side effect at parsing: detect empty ast */
    empty_ast = false;
    /**
     * @param mode default: in-mem mode with debug injection
     */
    constructor(mode = transpiler_js_1.in_mem_2) {
        this.mode = mode;
    }
    /**
     * Register step function
     * @param f step function
     * @returns this
     */
    step_func(f) {
        this.sfman.add_step_func(f);
        return this;
    }
    /**
     * transpilation of an apath textual expression
     * @param s apath textual expression
     * @param setting setting for dynart
     * @returns an evaluator
     * @throws ApathError
     */
    transpile(s, setting) {
        try {
            const ast = new parser_js_1.Parser().parse(s);
            this.empty_ast = ast.type === adt_js_1.Adt.Empty;
            const trp = new transpiler_js_1.Transpiler().mode(this.mode).sf_manager(this.sfman).transpile_to_func(ast);
            return new Evaluator(this.sfman, trp, setting);
        }
        catch (error) {
            throw new errors_warnings_js_1.ApathError('error during transpilation', error);
        }
    }
}
exports.Apath = Apath;
function error_eval(error) {
    return new errors_warnings_js_1.ApathError('error during evaluation', error);
}
/**
 * Evaluator for transpiled apath expressions
 */
class Evaluator {
    sfman;
    transpilat;
    resolved_transpilat;
    // only used inderectly by class Apath
    constructor(sfman, transpilat, setting) {
        this.sfman = sfman;
        this.transpilat = transpilat;
        this.resolved_transpilat = this.transpilat(this.sfman.ctx, apart, new apart.DynApart().setting(setting));
    }
    transpilat_text() {
        return this.transpilat.toString();
    }
    /**
     * Evaluation over an input javascript object
     * @param input input javascript object
     * @returns iterable-iterator of results (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
     */
    evaluate(input) {
        try {
            return apart.CoreIter.optional_wrap(this.resolved_transpilat(input));
        }
        catch (error) {
            throw error_eval(error);
        }
    }
    /** Async version of {@link evaluate} */
    async evaluate_async(input) {
        try {
            return apart.CoreIter.optional_wrap(await this.resolved_transpilat(input));
        }
        catch (error) {
            throw error_eval(error);
        }
    }
    // only for testing
    evaluate_first(input) {
        try {
            return apart.CoreIter.first(this.resolved_transpilat(input));
        }
        catch (error) {
            throw error_eval(error);
        }
    }
    /**
     * Evaluation over an input json object
     * @param json input json object
     * @returns iterable-iterator of results (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
     */
    evaluate_json(json) {
        return this.evaluate(JSON.parse(json));
    }
    /** Async version of {@link evaluate_json} */
    async evaluate_json_async(json) {
        return await this.evaluate_async(JSON.parse(json));
    }
}
exports.Evaluator = Evaluator;

},{"../core/adt.js":5,"../core/apart.js":6,"../core/errors_warnings.js":7,"../core/parser.js":8,"../core/step-func-man.js":9,"../core/transpiler.js":10}],5:[function(require,module,exports){
"use strict";
/**
 * adt (algebraic data type) for apath
 *
 * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tlist_to_array = exports.trav = exports.op_strict = exports.op_map = exports.UnaryOpBool = exports.BinaryOpBool = exports.OpNum = exports.empty = exports.Adt = void 0;
//################################### (algebraic data type) #####################################
// redundant string equivalent for better json form
var Adt;
(function (Adt) {
    Adt["Empty"] = "Empty";
    Adt["Property"] = "Property";
    Adt["PropertyRegex"] = "PropertyRegex";
    Adt["Path"] = "Path";
    Adt["Literal"] = "Literal";
    Adt["Children"] = "Children";
    Adt["Self"] = "Self";
    Adt["Filter"] = "Filter";
    Adt["Conditional"] = "Conditional";
    Adt["FilterDef"] = "FilterDef";
    Adt["ComparisonExpression"] = "ComparisonExpression";
    Adt["BinaryLogicalExpression"] = "BinaryLogicalExpression";
    Adt["UnaryLogicalExpression"] = "UnaryLogicalExpression";
    Adt["Subscript"] = "Subscript";
    Adt["Func"] = "Func";
    Adt["ArgumentList"] = "ArgumentList";
    Adt["SequencedExpression"] = "SequencedExpression";
    // construction
    Adt["ObjectExpression"] = "ObjectExpression";
    Adt["PropertyAssignmentList"] = "PropertyAssignmentList";
    Adt["NamedAssignment"] = "NamedAssignment";
    Adt["EmbeddingExpression"] = "EmbeddingExpression";
    Adt["PropertyNameExpression"] = "PropertyNameExpression";
    Adt["ArrayExpression"] = "ArrayExpression";
    Adt["ElementList"] = "ElementList";
})(Adt || (exports.Adt = Adt = {}));
exports.empty = { type: Adt.Empty };
var OpNum;
(function (OpNum) {
    OpNum["eq"] = "==";
    OpNum["neq"] = "!=";
    OpNum["gt"] = ">";
    OpNum["lt"] = "<";
    OpNum["ge"] = ">=";
    OpNum["le"] = "<=";
})(OpNum || (exports.OpNum = OpNum = {}));
var BinaryOpBool;
(function (BinaryOpBool) {
    BinaryOpBool["and"] = "and";
    BinaryOpBool["or"] = "or";
})(BinaryOpBool || (exports.BinaryOpBool = BinaryOpBool = {}));
var UnaryOpBool;
(function (UnaryOpBool) {
    UnaryOpBool["not"] = "not";
})(UnaryOpBool || (exports.UnaryOpBool = UnaryOpBool = {}));
exports.op_map = { and: '&&', or: '||', not: '!' };
var op_map_strict = { '==': '===', '!=': '!==' };
function op_strict(s) {
    const o = op_map_strict[s];
    return o ? o : s;
}
exports.op_strict = op_strict;
//################################### traverser & transformers #####################################
/** extra mapping from type to parser rule if not identical */
const type_to_rule = {};
function trav(expr, pre_op, post_op) {
    pre_op(expr);
    for (const key in expr) {
        const sub_expr = expr[key.toString()];
        if (sub_expr && sub_expr.type)
            trav(sub_expr, pre_op, post_op);
    }
    post_op?.(expr);
}
exports.trav = trav;
function tlist_to_array(l, type, a = []) {
    if (l !== null) {
        if (l.left && l.type === type) {
            tlist_to_array(l.left, type, a);
            a.push(l.right);
        }
        else {
            a.push(l);
        }
    }
    return a;
}
exports.tlist_to_array = tlist_to_array;

},{}],6:[function(require,module,exports){
"use strict";
/**
 * run time module for transpiled js code
 *
 * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
 *
 * @author a-f-m
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynApart = exports.is_empty = exports.test_ = exports.eval_it = exports.single = exports.isApathIterable = exports.is_apath_iterable = exports.nilit = exports.CoreIter = exports.done = exports.rt_init = exports.import_mods = exports.ExecutionError = void 0;
const utils_js_1 = require("./utils.js");
// ------------------ basics -------------------------
/**
 * errors during execution
 */
class ExecutionError extends Error {
    func_no;
    constructor(func_no, message) {
        super(message);
        this.func_no = func_no;
        this.name = 'ExecutionError';
    }
}
exports.ExecutionError = ExecutionError;
async function import_mods(mods) {
    for (const mod_name in mods)
        mods[mod_name].mod = await Promise.resolve(`${mods[mod_name].src}`).then(s => __importStar(require(s)));
}
exports.import_mods = import_mods;
var initialized = false;
async function rt_init(mods) {
    if (!initialized) {
        await import_mods(mods);
        initialized = true;
    }
}
exports.rt_init = rt_init;
// ----------------- iter's & eval utilities -------------------------
/** iter done */
exports.done = { value: undefined, done: true };
/**
 * non-done
 */
function val(x) {
    return { done: false, value: x };
}
/**
 * core iterator corresponding to *S* in Wadler's xpath semantics
 */
class CoreIter {
    [Symbol.iterator]() { return this; }
    next() { return exports.done; }
    /**
     * convert to core iterator
     * @param it classical iterator
     * @returns core iterator
     */
    static from_it(it) {
        return new class extends CoreIter {
            next() {
                return it.next();
            }
        };
    }
    /**
     * convert to core iterator from array
     * @param x array
     * @returns core iterator
     */
    static from_array(x) {
        const l = x.length;
        let cnt = -1;
        return new class extends CoreIter {
            next() {
                if (++cnt === l)
                    return exports.done;
                return val(x[cnt]);
            }
        };
    }
    /**
     * wrap any value to an iter if neccessary
     * @param x
     * @returns core iterator
     */
    static optional_wrap(x) { return !single(x) ? x : new SingletonIt(x); }
    /**
     * first value
     */
    static first(x) {
        if (!single(x)) {
            const y = x.next();
            return y.done ? undefined : y.value;
        }
        else {
            return x;
        }
    }
}
exports.CoreIter = CoreIter;
/** nil iter, used when emtpy func eval is intended */
exports.nilit = new CoreIter();
/**
 * singleton iterator
 */
class SingletonIt extends CoreIter {
    x;
    consumed = false;
    constructor(x) {
        super();
        this.x = x;
    }
    next() {
        if (this.consumed) {
            return exports.done;
        }
        else {
            this.consumed = true;
            return { value: this.x, done: false };
        }
    }
}
function is_apath_iterable(x) {
    if (x === null || x === undefined)
        return false;
    else
        return typeof x[Symbol.iterator] === 'function'
            // cause string is iterable
            && !(0, utils_js_1.is_string)(x)
            // cause arrays are first class citizens
            && !Array.isArray(x);
}
exports.is_apath_iterable = is_apath_iterable;
// cause usable by user defined js step functions, a classical name is exported also
function isApathIterable(x) {
    return is_apath_iterable(x);
}
exports.isApathIterable = isApathIterable;
// deferred
// export function is_iterable(x: any) {
//     return x !== null && x !== undefined && typeof x[Symbol.iterator] === 'function'
// }
// export function is_nilit(x: any) {
//     return x === nilit || (is_iterable(x) && x.next().done)
// }
/** is no iter */
function single(x) {
    // return x.__ci__ === undefined && !(Object.getPrototypeOf(x).next)
    return !is_apath_iterable(x);
    // ???check in future: && !(Array.isArray(x))
}
exports.single = single;
/**
 * evaluation of current context sequence corresponding to *S* in Wadler's xpath semantics.
 * if S or f is a single value bypassing is performed to be performant.
 */
function eval_it(S, f, args) {
    if (typeof f === 'function') {
        return single(S) ? f.call(undefined, S, args) : eval_it_star(S, f, args);
    }
    else {
        return single(S) ? f : eval_it_star_value(S, f);
    }
}
exports.eval_it = eval_it;
/**
 * actual evaluation for non-single x and a function
 */
function* eval_it_star(x, f, args) {
    for (const y of x) {
        const z = f.call(undefined, y, args);
        if (single(z))
            yield z;
        else
            yield* z;
    }
}
/**
 * actual evaluation for non-single x and a value
 */
function* eval_it_star_value(x, v) {
    for (const y of x)
        yield v;
}
/**
 * classical test according to Wadler
 */
function test_(x) {
    if (!single(x)) {
        const first = x.next();
        return first.done ?
            false
            : !x.next().done ? // more than one
                true
                : test_single(first.value);
    }
    else {
        return test_single(x);
    }
}
exports.test_ = test_;
function test_single(x) {
    return typeof x == "boolean" ? x :
        // (typeof x == "string" ? x.length > 0 : true)
        true;
}
/** empty iter */
function is_empty(x) {
    return x.next().done;
}
exports.is_empty = is_empty;
/**
 * dynamic, parametrizable run time
 */
class DynApart {
    _setting = {
        // if true then an exception is thrown else no solution is yielded (nilit returned)
        strict_failure: false
    };
    setting(s) {
        if (s)
            this._setting = { ...this._setting, ...s };
        return this;
    }
    /** conversion of subscripts */
    idx_convert(func_no, x) {
        const y = this.force_single_or_nilit(func_no, x);
        return y === exports.nilit ? // sufficiency (no is_nilit check) ensured by above line
            y : this.idx_check(func_no, y);
    }
    subscript_check(func_no, x) {
        if (!Array.isArray(x))
            return this.fail(func_no, "object must be an array (context: subscription)", false);
        return true;
    }
    /** forcing single value or empty iter */
    force_single_or_nilit(func_no, x, hard_force = false) {
        if (!single(x)) {
            const y = x.next();
            if (y.done) {
                return exports.nilit;
            }
            else {
                const z = x.next();
                if (!z.done) {
                    return this.fail(func_no, "single value expected (context: subscription or comparison or assignment value)", exports.nilit, hard_force);
                }
            }
            return y;
        }
        else {
            return x;
        }
    }
    /** checking subscript */
    idx_check(func_no, x) {
        if (typeof x === 'number' && Number.isInteger(x))
            return x;
        else
            return this.fail(func_no, "evaluation to integer expected (context: subscription)", -1);
    }
    /** checking assignment key */
    ass_key_check(func_no, x) {
        if ((0, utils_js_1.is_string)(x))
            return true;
        const y = this.force_single_or_nilit(func_no, x);
        if (y === exports.nilit) // sufficiency (no is_nilit check) ensured by above line
            return false;
        return this.fail(func_no, "evaluation to string expected (context: assignment key)", undefined, true);
    }
    /** forcing primitive value or empty iter */
    force_primitive(func_no, x) {
        const y = this.force_single_or_nilit(func_no, x);
        if (y === exports.nilit // sufficiency (no is_nilit check) ensured by above line
            || !(typeof y == 'object' || typeof y == 'function')) {
            return y;
        }
        else {
            return this.fail(func_no, "evaluation to primitive value expected (context: comparison)");
        }
    }
    opt_it_apply(func_no, x, f) {
        if (!single(x)) {
            for (const y of x)
                f(y);
        }
        else {
            f(x);
        }
    }
    populate_array(func_no, a, x) {
        this.opt_it_apply(func_no, x, (y) => {
            a.push(y);
        });
    }
    embed_objects(func_no, o, x) {
        this.opt_it_apply(func_no, x, (y) => {
            if ((0, utils_js_1.is_object)(y)) {
                for (const key in y)
                    if (Object.prototype.hasOwnProperty.call(y, key))
                        o[key] = y[key];
            }
            else {
                this.fail(func_no, `object expected (found plain value or array: '${JSON.stringify(y)}', context: embedding)`, undefined, true);
            }
        });
    }
    embed_object(func_no, o, x) {
    }
    fail(func_no, mess, ret = exports.nilit, force = false) {
        if (force || this._setting.strict_failure)
            throw new ExecutionError(func_no, mess + '; future versions will show source location');
        else
            return ret;
    }
    // ----------------- generic eval -------------------------
    gx_property_0(x, args) {
        const y = x[args[0]];
        return y === undefined ? exports.nilit : y;
    }
    gx_property(x, name) {
        const y = x[name];
        return y;
    }
    *gx_property_regex(env, func_no, ctx_node, regex) {
        if (!(0, utils_js_1.is_string)(regex))
            return this.fail(func_no, "string value expected (context: property regex)");
        if (!(0, utils_js_1.is_object)(ctx_node))
            return this.fail(func_no, "object expected (context: property regex)");
        for (const key in ctx_node) {
            if (key.match('^' + regex + '$'))
                yield ctx_node[key];
            // if (key.match(new RegExp(regex))) yield ctx_node[key];
        }
    }
}
exports.DynApart = DynApart;
// console.log('lal'.match('^lal$'))
// console.log(new RegExp('a', 'g').test('lal'))

},{"./utils.js":11}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApathError = exports.ExecutionError = exports.LoadError = exports.TranspilationError = exports.ParseError = void 0;
/**
 * errors during run time
 */
class ParseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ParseError';
    }
}
exports.ParseError = ParseError;
/**
 * errors during transpilation
 */
class TranspilationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TranspilationError';
    }
}
exports.TranspilationError = TranspilationError;
/**
 * errors during loading
 */
class LoadError extends Error {
    constructor(message, cause) {
        super(cause_mess(message, cause));
        this.name = 'LoadError';
    }
}
exports.LoadError = LoadError;
/**
 * errors during execution
 */
class ExecutionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExecutionError';
    }
}
exports.ExecutionError = ExecutionError;
function cause_mess(message, cause) {
    return `${message}${cause === undefined ? '' : ` (cause: ${cause})`} `;
}
/**
 * general errors
 */
class ApathError extends Error {
    constructor(message, cause) {
        super(cause_mess(message, cause));
        this.name = 'ApathError';
    }
}
exports.ApathError = ApathError;

},{}],8:[function(require,module,exports){
"use strict";
/**
 *
 * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
 *
 * @author a-f-m
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const apath_4_2_js_1 = require("../peggy/apath-4-2.js");
const errors_warnings_js_1 = require("./errors_warnings.js");
const adt_js_1 = require("./adt.js");
/**
 * Parser based on peg.
 */
class Parser {
    _setting = {
        w_loc: false
    };
    setting(s) {
        if (s)
            this._setting = { ...this._setting, ...s };
        return this;
    }
    /**
     * @param source apath text
     * @returns parse result
     * @throws ParseError if syntax errors
     */
    parse(source) {
        try {
            (0, apath_4_2_js_1.set_w_loc)(this._setting.w_loc);
            const ast = (0, apath_4_2_js_1.peg$parse)(source);
            return ast === null ? adt_js_1.empty : ast;
        }
        catch (e) {
            throw new errors_warnings_js_1.ParseError(e.format([]).replace('at undefined:', 'at (line:column) '));
        }
    }
}
exports.Parser = Parser;

},{"../peggy/apath-4-2.js":12,"./adt.js":5,"./errors_warnings.js":7}],9:[function(require,module,exports){
"use strict";
/**
 * manager for step funcs.
 *
 * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepFuncManager = void 0;
const errors_warnings_js_1 = require("./errors_warnings.js");
const utils_js_1 = require("./utils.js");
class StepFuncManager {
    sf_descriptors = {};
    contains_async = false;
    // hold seperately for in-mem "new func"-processing
    ctx = {};
    add_step_func(step_func) {
        const name = step_func.name;
        this.ctx[name] = step_func;
        // for now
        if (step_func.constructor.name === 'AsyncGeneratorFunction')
            throw new errors_warnings_js_1.ApathError(`async generator function '${step_func.name}' not allowed`);
        //
        const async = (0, utils_js_1.async_func)(step_func);
        this.contains_async = this.contains_async || async;
        this.sf_descriptors[name] = { name: name, async: async };
        return this;
    }
    async(name) {
        return this.sf_descriptors[name]?.async;
    }
}
exports.StepFuncManager = StepFuncManager;

},{"./errors_warnings.js":7,"./utils.js":11}],10:[function(require,module,exports){
"use strict";
/**
 * transpilation module.
 *
 * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transpiler = exports.in_mem_2 = exports.in_mem_1 = void 0;
const errors_warnings_js_1 = require("./errors_warnings.js");
const adt_js_1 = require("./adt.js");
const step_func_man_js_1 = require("./step-func-man.js");
exports.in_mem_1 = {
    form: 'func',
    expr_func_inject: (func_name, func_arg) => `ctx.debug?.enabled && ctx.debug('${func_name} (%j)', ${func_arg})`
};
exports.in_mem_2 = {
    form: 'func',
};
/**
 * Transpilation of an apath expression to text.
 *
 */
class Transpiler {
    out_console;
    log_exprs;
    _nocheck;
    /** transpilation result */
    result;
    /** default module */
    modules = {};
    setting = { mode: exports.in_mem_2, sf_manager: new step_func_man_js_1.StepFuncManager() };
    has_async = false;
    /**
     * @param init.out_console result to console
     * @param init.log_exprs embed expressions in results
     */
    constructor(out_console = false, log_exprs = false, _nocheck = false) {
        this.out_console = out_console;
        this.log_exprs = log_exprs;
        this._nocheck = _nocheck;
        this.result = '';
    }
    /**
     *
     * @param mode transpilation mode
     * @returns this
     */
    mode(v) {
        this.setting.mode = v;
        return this;
    }
    /**
     * set_step_func_manager
    */
    sf_manager(v) {
        this.setting.sf_manager = v;
        return this;
    }
    func_cnt = 0;
    new_func_fame(e, is_root) {
        return 'f_' + (is_root ? 'root' : e.type + '_' + this.func_cnt++);
    }
    punch_func(expr, func_name, s) {
        if (this.out_console)
            console.log(s);
        this.punch(this.new_func(expr, func_name, s));
    }
    punch(s) {
        if (this.out_console)
            console.log(s);
        // this.os.write(s)
        this.result += s;
    }
    default_step_funcs_path(path) {
        this.modules._def = { src: path };
        return this;
    }
    /**
     * Transpilation. ! Use a new instance of for every transpilation
     * @param expr expression to transpile
     * @returns transpilation result
     * @throws TranspilationError if transpilation errors
     */
    transpile(expr) {
        this.has_async = this.contains_async();
        this.result = '';
        this.trans_root(expr);
        return this.result;
    }
    async_await() {
        return this.has_async ? { async: 'async ', await: 'await ' } : { async: '', await: '' };
    }
    transpile_to_func(expr) {
        this.transpile(expr);
        return new Function('ctx', 'apart', 'dynart', `
                ${this.result}
                return ${this.async_await().async} function(x, env) {
                    return ${this.async_await().await} f_root(x, env)
                }`);
        // ...
    }
    trans_root(expr, env, scope) {
        if (this.modules._def) {
            this.punch(`
                import * as _default_step_funcs from '${this.modules._def.src}'
            `);
        }
        const root_func_name = this.new_func_fame(expr, true);
        const tr = this.trans_rec(expr);
        this.punch_func(expr, root_func_name, `
            ${this.has_async ? '// TODO optimize async/await bubbling' : ''}
            return ${this.call(tr, 'x')}            
        `);
    }
    trans_rec(expr, env, scope) {
        let new_func_name = this.new_func_fame(expr, false);
        const func_no = this.func_cnt - 1;
        switch (expr.type) {
            case adt_js_1.Adt.SequencedExpression: {
                const tr_head = this.trans_rec(expr.left);
                const tr_tail = this.trans_rec(expr.right);
                this.punch_func(expr, new_func_name, `
                    ${this.call(tr_head, 'x')}
                    return ${this.call(tr_tail, 'x')}
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.Path: {
                const tr_l = this.trans_rec(expr.left);
                const tr_r = this.trans_rec(expr.right);
                this.punch_func(expr, new_func_name, `
                    const y = ${this.call(tr_l, 'x')}
                    return ${this.call(tr_r, 'y', true)}
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.Filter: {
                const tr_l = this.trans_rec(expr.e);
                const tr_r = this.trans_rec(expr.filter);
                this.punch_func(expr, new_func_name, `
                    const y = ${this.call(tr_l, 'x')}
                    return ${this.call(tr_r, 'y', true)}
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.FilterDef: {
                const tr = this.trans_rec(expr.e);
                this.punch_func(expr, new_func_name, `
                    const y = ${this.call(tr, 'x')}
                    const b = apart.test_(y)
                    return b ? x : apart.nilit
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.Subscript: {
                const tr = this.trans_rec(expr.idx);
                this.punch_func(expr, new_func_name, `
                    const y = ${this.call(tr, 'x')}
                    if (!dynart.subscript_check(${func_no}, x)) return apart.nilit
                    const idx = dynart.idx_convert(${func_no}, y)
                    if (idx === -1) return apart.nilit
                    const z = x[idx]
                    return z === undefined ? apart.nilit : z
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.Conditional: {
                const tr_cond = this.trans_rec(expr.condition);
                const tr_then = this.trans_rec(expr.thenPart);
                const tr_else = expr.elsePart ? this.trans_rec(expr.elsePart) : undefined;
                this.punch_func(expr, new_func_name, `
                    const y = ${this.call(tr_cond, 'x')}
                    const b = apart.test_(y)
                    return b ? (${this.call(tr_then, 'x')}) : ${tr_else ? '(' + this.call(tr_else, 'x') + ')' : 'apart.nilit'}
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.Property: {
                return {
                    inline: true, func: true,
                    // snippet: `function(x){const y = x['${escape_quote(expr.name)}'];return y === undefined ? apart.nilit : y}`
                    // snippet: `function(x){const y = dynart.gx_property(x, '${escape_quote(expr.name)}');return y === undefined ? apart.nilit : y}`
                    snippet: `dynart.gx_property_0`,
                    args: [`'${expr.name}'`]
                    // snippet: `function(x){return dynart.gx_property_0(x, ['${expr.name}'])}`
                };
            }
            case adt_js_1.Adt.PropertyRegex: {
                const tr = this.trans_rec(expr.regex);
                this.punch_func(expr, new_func_name, `
                    return dynart.gx_property_regex(env, ${func_no}, x, ${this.call(tr, 'x')})
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.Children: {
                return {
                    inline: true, func: true,
                    snippet: `function(x){return typeof x === 'object' ? apart.CoreIter.from_array(Object.values(x)) : apart.nilit}`
                };
            }
            case adt_js_1.Adt.ComparisonExpression: {
                const tr_left = this.trans_rec(expr.left);
                const tr_right = this.trans_rec(expr.right);
                // TODO force sibgle
                this.punch_func(expr, new_func_name, `
                    const v1 = dynart.force_primitive(${func_no}, ${this.call(tr_left, 'x')})
                    const v2 = dynart.force_primitive(${func_no}, ${this.call(tr_right, 'x')})
                    if (v1 === apart.nilit || v2 === apart.nilit) return apart.nilit
                    return (v1 ${(0, adt_js_1.op_strict)(expr.operator)} v2)
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.BinaryLogicalExpression: {
                const tr_left = this.trans_rec(expr.left);
                const tr_right = this.trans_rec(expr.right);
                this.punch_func(expr, new_func_name, `
                    return (apart.test_(${this.call(tr_left, 'x')}) 
                            ${adt_js_1.op_map[expr.operator]} 
                            apart.test_(${this.call(tr_right, 'x')}))
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.UnaryLogicalExpression: {
                const tr = this.trans_rec(expr.e);
                this.punch_func(expr, new_func_name, `
                    return (${adt_js_1.op_map[expr.operator]} apart.test_(${this.call(tr, 'x')}))
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.Func: {
                new_func_name = new_func_name + `_${expr.name}`;
                this.check_existence(expr.name);
                this.punch_func(expr, new_func_name, `
                    const y = ${this.sfunc_call(expr)}
                    return y === undefined || y.done ? apart.nilit : y
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.Literal: {
                return { inline: true, literal: true, snippet: `(${JSON.stringify(expr.value)})` };
            }
            case adt_js_1.Adt.Self: {
                return { inline: true, func: true, snippet: `function (x) {return x}` };
            }
            case adt_js_1.Adt.Empty: {
                return { inline: true, snippet: `apart.nilit` };
            }
            case adt_js_1.Adt.ObjectExpression:
            case adt_js_1.Adt.ArrayExpression:
                return this.trans_rec_construction(expr, env, scope);
            default:
                throw new errors_warnings_js_1.TranspilationError('transpilation of following expression not implemented:\n' + JSON.stringify(expr, null, 3));
        }
    }
    trans_rec_construction(expr, env, scope) {
        let new_func_name = this.new_func_fame(expr, false);
        const func_no = this.func_cnt - 1;
        switch (expr.type) {
            case adt_js_1.Adt.ObjectExpression: {
                this.punch_func(expr, new_func_name, `
                    let o = {}
                    ${this.build_property_ass(func_no, expr)}
                    return o
                `);
                return { snippet: new_func_name };
            }
            case adt_js_1.Adt.ArrayExpression: {
                this.punch_func(expr, new_func_name, `
                    let a = []
                    ${this.build_arr_elm_list(func_no, expr)}
                    return a
                `);
                return { snippet: new_func_name };
            }
            default:
                throw new errors_warnings_js_1.TranspilationError('transpilation of following expression not implemented:\n' + JSON.stringify(expr, null, 3));
        }
    }
    build_property_ass(func_no, expr) {
        // const pref = '\n' + '\t'.repeat(5)
        let ret = '';
        let i = 0;
        for (const item of (0, adt_js_1.tlist_to_array)(expr.propertyAssignments, adt_js_1.Adt.PropertyAssignmentList)) {
            switch (item.type) {
                case adt_js_1.Adt.NamedAssignment: {
                    ret = this.build_named_ass(item, ret, i, func_no);
                    break;
                }
                case adt_js_1.Adt.EmbeddingExpression: {
                    ret = this.build_embedding_expr(item, ret, i, func_no);
                    break;
                }
                default:
                    throw new errors_warnings_js_1.TranspilationError('transpilation of following expression not implemented:\n' + JSON.stringify(expr, null, 3));
            }
            i++;
        }
        return ret;
    }
    build_named_ass(pa, ret, i, func_no) {
        const key = this.build_property_ass_key(pa.key);
        const tr_val = this.trans_rec(pa.value);
        const value = this.call(tr_val, 'x');
        if (!key.simple) {
            ret += `
                    const key${i} = ${key.s}
                    const b1_${i} = dynart.ass_key_check(${func_no}, key${i})`;
        }
        if (!tr_val.literal) {
            ret += `
                    const value${i} = ${value}
                    const b2_${i} = dynart.force_single_or_nilit(${func_no}, value${i}, true) !== apart.nilit`;
        }
        const no_inline = !key.simple || !tr_val.literal;
        if (no_inline) {
            const both = !key.simple && !tr_val.literal ? '&&' : '';
            ret += `
                    if (${!key.simple ? `b1_${i}` : ''} ${both} ${!tr_val.literal ? `b2_${i}` : ''})`;
        }
        ret += `
                    ${no_inline ? '   ' : ''}o[${key.simple ? key.s : `key${i}`}] = ${tr_val.literal ? value : `value${i}`}`;
        ret += `
                    //------`;
        return ret;
    }
    build_embedding_expr(emb, ret, i, func_no) {
        const value = this.call(this.trans_rec(emb.e), 'x');
        ret += `
                    const value${i} = ${value}`;
        ret += `
                    dynart.embed_objects(${func_no}, o, value${i})`;
        ret += `
                    //------`;
        return ret;
    }
    build_property_ass_key(expr) {
        switch (expr.type) {
            case adt_js_1.Adt.Property: return { s: `'${expr.name}'`, simple: true };
            case adt_js_1.Adt.PropertyNameExpression:
                const tr_pn = this.trans_rec(expr.e);
                return { s: `${this.call(tr_pn, 'x')}` };
            default:
                throw new errors_warnings_js_1.TranspilationError('transpilation of following expression not implemented:\n' + JSON.stringify(expr, null, 3));
        }
    }
    build_arr_elm_list(func_no, expr) {
        let ret = '';
        let i = 0;
        for (const elm of (0, adt_js_1.tlist_to_array)(expr.elements, adt_js_1.Adt.ElementList)) {
            const tr_elm = this.trans_rec(elm);
            const value = this.call(tr_elm, 'x');
            if (!tr_elm.literal) {
                ret += `
                    const value${i} = ${value}`;
            }
            ret += `
                    ${tr_elm.literal ? `a.push(${value})` : `dynart.populate_array(${func_no}, a, value${i})`}`;
            ret += `
                    //------`;
            i++;
        }
        return ret;
    }
    check_existence(name) {
        if (!this._nocheck && !this.setting.sf_manager.sf_descriptors[name])
            throw new errors_warnings_js_1.TranspilationError(`step function '${name}' not registered`);
    }
    // public for testing
    sfunc_call(expr, ctx = 'ctx') {
        if (expr.arguments !== null) {
            let a = 'x, ';
            for (const arg of (0, adt_js_1.tlist_to_array)(expr.arguments, adt_js_1.Adt.ArgumentList)) {
                const tra = this.trans_rec(arg);
                a += `${this.call(tra, 'x')}, `;
            }
            return `${this.async_await().await}${ctx}.${expr.name}.call(undefined, ${a})`;
        }
        else {
            return `${this.async_await().await}${ctx}.${expr.name}(x)`;
        }
    }
    contains_async() {
        return this.setting.sf_manager.contains_async;
    }
    new_func(expr, new_func_name, body) {
        return `
                /* ${this.comment(expr)} */
                ${this.has_async
            // || this.contains_async() 
            ? 'async' : ''} function ${new_func_name}(x, env) {
                    ${this.setting.mode.expr_func_inject ? this.setting.mode.expr_func_inject(new_func_name, 'x') : ''}
                    ${body}
                }
                `;
    }
    call(tr, var_name, iter, args) {
        if (iter) {
            return `apart.eval_it(${var_name}, ${tr.snippet}${this.inline_args(tr, true)})`;
        }
        else {
            return tr.inline ?
                `(${tr.snippet}${tr.func ? `(${var_name}${this.inline_args(tr, true)})` : ''})`
                : `${this.async_await().await}${tr.snippet}(${var_name}, env)`;
        }
    }
    inline_args(tr, reify) {
        if (!tr.args)
            return '';
        if (reify) {
            return ', [' + tr.args.toString() + ']';
        }
        else {
            let s = '';
            for (const x of tr.args) {
                s += ',' + x;
            }
            return s;
        }
    }
    comment(expr) {
        return this.log_exprs ? '\n' + JSON.stringify(expr, null, 3) + '\n' : '';
    }
}
exports.Transpiler = Transpiler;

},{"./adt.js":5,"./errors_warnings.js":7,"./step-func-man.js":9}],11:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walk_files = exports.replace_mult_in_file = exports.replace_in_file = exports.replace_marker_in_file = exports.escape_quote = exports.is_object = exports.is_string = exports.async_func = exports.remove_exports = exports.valid_url = exports.write_file = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function write_file(file_path, content) {
    const r = path_1.default.resolve(file_path);
    fs_1.default.writeFileSync(r, content);
    return `file://${r}`;
}
exports.write_file = write_file;
function valid_url(s) {
    try {
        const url = new URL(s);
        return true;
    }
    catch (_) {
        return false;
    }
}
exports.valid_url = valid_url;
function remove_exports(txt) {
    return txt.replaceAll(new RegExp('\\n\\s*export\\s+', 'g'), '\n');
}
exports.remove_exports = remove_exports;
function async_func(f) {
    return f.constructor.name === 'AsyncFunction' || f.constructor.name === 'AsyncGeneratorFunction';
}
exports.async_func = async_func;
function is_string(x, alsoString = false) {
    return alsoString ? typeof x === 'string' || x instanceof String : typeof x === 'string';
}
exports.is_string = is_string;
function is_object(x) {
    return x.constructor.name === "Object";
}
exports.is_object = is_object;
function escape_quote(x) {
    return x.replace("'", "\\'");
}
exports.escape_quote = escape_quote;
function replace_marker_in_file(file, begin_marker, end_marker, replacement) {
    replace_in_file(file, `${begin_marker}[\\s\\S]*${end_marker}`, `${begin_marker}${replacement}${end_marker}`);
}
exports.replace_marker_in_file = replace_marker_in_file;
function replace_in_file(file, regex, replacement) {
    let doc = fs_1.default.readFileSync(file, { encoding: 'utf-8' });
    doc = doc.replace(new RegExp(regex, 'gm'), replacement);
    fs_1.default.writeFileSync(file, doc);
}
exports.replace_in_file = replace_in_file;
function replace_mult_in_file(file, repl_list) {
    let doc = fs_1.default.readFileSync(file, { encoding: 'utf-8' });
    for (const x of repl_list)
        doc = doc.replace(new RegExp(x.regex, 'gm'), x.repl);
    fs_1.default.writeFileSync(file, doc);
}
exports.replace_mult_in_file = replace_mult_in_file;
function walk_files(dir, path_regex, func, recursive = false) {
    const items = fs_1.default.readdirSync(dir, { recursive: recursive });
    for (const item of items) {
        //!!!test
        // if (item.includes('language')) {
        //     console.log()
        // }
        const path = (dir + '/' + item).replaceAll('\\', '/');
        if (path.match(path_regex))
            func(path);
    }
}
exports.walk_files = walk_files;

},{"fs":1,"path":2}],12:[function(require,module,exports){
"use strict";
// @generated by Peggy 4.0.2.
//
// https://peggyjs.org/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.SyntaxError = exports.StartRules = exports.set_w_loc = exports.peg$parse = void 0;
// compile with 'peggy --format es ...'
// repl '__ ' -> ''
// delete {...} : regex '^    \{(\n|.)+?.+\n    \}\n' ,   '\w+:'
// repl ' =\n    (.+)' -> ' = $1', '\n\n' -> '\n'
const trt = __importStar(require("../core/apart.js"));
const adt_js_1 = require("../core/adt.js");
function log(x) { console.log(x); }
let w_loc = true;
function set_w_loc(b) {
    w_loc = b;
}
exports.set_w_loc = set_w_loc;
function loc(location) { return w_loc ? location : undefined; }
function to_left_assoc(expr) {
    if (expr.type === adt_js_1.Adt.Path) {
        if (expr.right.type === adt_js_1.Adt.Path) {
            return {
                type: adt_js_1.Adt.Path,
                left: {
                    type: adt_js_1.Adt.Path,
                    left: expr.left,
                    right: expr.right.left
                },
                right: to_left_assoc(expr.right.right),
                loc: expr.loc
            };
        }
    }
    return expr;
}
function buildGenBinaryExpression(head, tail, type, pos, loc) {
    return tail.reduce(function (result, element) {
        return {
            type: type,
            left: result,
            right: element[pos],
            loc: loc
        };
    }, head);
}
// adopted from js peggy
function buildBinaryExpression(head, tail, loc) {
    return tail.reduce(function (result, element) {
        return {
            type: "ComparisonExpression",
            operator: element[1],
            left: result,
            right: element[3],
            loc: loc
        };
    }, head);
}
// adopted from js peggy
function buildLogicalExpression(head, tail, loc) {
    return tail.reduce(function (result, element) {
        return {
            type: "BinaryLogicalExpression",
            operator: element[1],
            left: result,
            right: element[4],
            loc: loc
        };
    }, head);
}
function extractList(list, index) {
    return list.map(function (element) { return element[index]; });
}
function buildList(head, tail, index) {
    return [head].concat(extractList(tail, index));
}
function peg$subclass(child, parent) {
    function C() { this.constructor = child; }
    C.prototype = parent.prototype;
    child.prototype = new C();
}
function peg$SyntaxError(message, expected, found, location) {
    var self = Error.call(this, message);
    // istanbul ignore next Check is a necessary evil to support older environments
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(self, peg$SyntaxError.prototype);
    }
    self.expected = expected;
    self.found = found;
    self.location = location;
    self.name = "SyntaxError";
    return self;
}
exports.SyntaxError = peg$SyntaxError;
peg$subclass(peg$SyntaxError, Error);
function peg$padEnd(str, targetLength, padString) {
    padString = padString || " ";
    if (str.length > targetLength) {
        return str;
    }
    targetLength -= str.length;
    padString += padString.repeat(targetLength);
    return str + padString.slice(0, targetLength);
}
peg$SyntaxError.prototype.format = function (sources) {
    var str = "Error: " + this.message;
    if (this.location) {
        var src = null;
        var k;
        for (k = 0; k < sources.length; k++) {
            if (sources[k].source === this.location.source) {
                src = sources[k].text.split(/\r\n|\n|\r/g);
                break;
            }
        }
        var s = this.location.start;
        var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
            ? this.location.source.offset(s)
            : s;
        var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
        if (src) {
            var e = this.location.end;
            var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
            var line = src[s.line - 1];
            var last = s.line === e.line ? e.column : line.length + 1;
            var hatLen = (last - s.column) || 1;
            str += "\n --> " + loc + "\n"
                + filler + " |\n"
                + offset_s.line + " | " + line + "\n"
                + filler + " | " + peg$padEnd("", s.column - 1, ' ')
                + peg$padEnd("", hatLen, "^");
        }
        else {
            str += "\n at " + loc;
        }
    }
    return str;
};
peg$SyntaxError.buildMessage = function (expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
        literal: function (expectation) {
            return "\"" + literalEscape(expectation.text) + "\"";
        },
        class: function (expectation) {
            var escapedParts = expectation.parts.map(function (part) {
                return Array.isArray(part)
                    ? classEscape(part[0]) + "-" + classEscape(part[1])
                    : classEscape(part);
            });
            return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
        },
        any: function () {
            return "any character";
        },
        end: function () {
            return "end of input";
        },
        other: function (expectation) {
            return expectation.description;
        }
    };
    function hex(ch) {
        return ch.charCodeAt(0).toString(16).toUpperCase();
    }
    function literalEscape(s) {
        return s
            .replace(/\\/g, "\\\\")
            .replace(/"/g, "\\\"")
            .replace(/\0/g, "\\0")
            .replace(/\t/g, "\\t")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/[\x00-\x0F]/g, function (ch) { return "\\x0" + hex(ch); })
            .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return "\\x" + hex(ch); });
    }
    function classEscape(s) {
        return s
            .replace(/\\/g, "\\\\")
            .replace(/\]/g, "\\]")
            .replace(/\^/g, "\\^")
            .replace(/-/g, "\\-")
            .replace(/\0/g, "\\0")
            .replace(/\t/g, "\\t")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/[\x00-\x0F]/g, function (ch) { return "\\x0" + hex(ch); })
            .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return "\\x" + hex(ch); });
    }
    function describeExpectation(expectation) {
        return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected) {
        var descriptions = expected.map(describeExpectation);
        var i, j;
        descriptions.sort();
        if (descriptions.length > 0) {
            for (i = 1, j = 1; i < descriptions.length; i++) {
                if (descriptions[i - 1] !== descriptions[i]) {
                    descriptions[j] = descriptions[i];
                    j++;
                }
            }
            descriptions.length = j;
        }
        switch (descriptions.length) {
            case 1:
                return descriptions[0];
            case 2:
                return descriptions[0] + " or " + descriptions[1];
            default:
                return descriptions.slice(0, -1).join(", ")
                    + ", or "
                    + descriptions[descriptions.length - 1];
        }
    }
    function describeFound(found) {
        return found ? "\"" + literalEscape(found) + "\"" : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};
function peg$parse(input, options) {
    options = options !== undefined ? options : {};
    var peg$FAILED = {};
    var peg$source = options.grammarSource;
    var peg$startRuleFunctions = { Start: peg$parseStart };
    var peg$startRuleFunction = peg$parseStart;
    var peg$c0 = ".";
    var peg$c1 = "?";
    var peg$c2 = "(";
    var peg$c3 = ")";
    var peg$c4 = "[";
    var peg$c5 = "]";
    var peg$c6 = "*";
    var peg$c7 = "self";
    var peg$c8 = "_";
    var peg$c9 = ",";
    var peg$c10 = "{";
    var peg$c11 = "}";
    var peg$c12 = ":";
    var peg$c13 = "if";
    var peg$c14 = "or";
    var peg$c15 = "and";
    var peg$c16 = "==";
    var peg$c17 = "!=";
    var peg$c18 = "<=";
    var peg$c19 = ">=";
    var peg$c20 = "not";
    var peg$c21 = "\n";
    var peg$c22 = "\r\n";
    var peg$c23 = "/*";
    var peg$c24 = "*/";
    var peg$c25 = "//";
    var peg$c26 = "\\";
    var peg$c27 = "null";
    var peg$c28 = "true";
    var peg$c29 = "false";
    var peg$c30 = "0";
    var peg$c31 = "e";
    var peg$c32 = "0x";
    var peg$c33 = "\"";
    var peg$c34 = "'";
    var peg$c35 = "b";
    var peg$c36 = "f";
    var peg$c37 = "n";
    var peg$c38 = "r";
    var peg$c39 = "t";
    var peg$c40 = "v";
    var peg$c41 = "x";
    var peg$c42 = "u";
    var peg$c43 = "/";
    var peg$c44 = ";";
    var peg$r0 = /^[<>]/;
    var peg$r1 = /^[\t\v-\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]/;
    var peg$r2 = /^[\n\r\u2028\u2029]/;
    var peg$r3 = /^[\r\u2028-\u2029]/;
    var peg$r4 = /^[A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376-\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06E5-\u06E6\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4-\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E46\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
    var peg$r5 = /^[0-9_\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CD\u09D7\u09E2-\u09E3\u09E6-\u09EF\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47-\u0B48\u0B4B-\u0B4D\u0B56-\u0B57\u0B62-\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5-\u0CD6\u0CE2-\u0CE3\u0CE6-\u0CEF\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62-\u0D63\u0D66-\u0D6F\u0D82-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18-\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F3F\u0F71-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19D9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u200C-\u200D\u203F-\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099-\u309A\uA620-\uA629\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880-\uA881\uA8B4-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F1\uA900-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C-\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5-\uAAF6\uABE3-\uABEA\uABEC-\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33-\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F]/;
    var peg$r6 = /^[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376-\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06E5-\u06E6\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4-\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E46\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
    var peg$r7 = /^[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CD\u09D7\u09E2-\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2-\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47-\u0B48\u0B4B-\u0B4D\u0B56-\u0B57\u0B62-\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5-\u0CD6\u0CE2-\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62-\u0D63\u0D82-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2-\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F3E-\u0F3F\u0F71-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099-\u309A\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880-\uA881\uA8B4-\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C-\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5-\uAAF6\uABE3-\uABEA\uABEC-\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/;
    var peg$r8 = /^[0-9]/;
    var peg$r9 = /^[1-9]/;
    var peg$r10 = /^[+\-]/;
    var peg$r11 = /^[0-9a-f]/i;
    var peg$r12 = /^[\n\r"\\\u2028-\u2029]/;
    var peg$r13 = /^[\n\r'\\\u2028-\u2029]/;
    var peg$r14 = /^["'\\]/;
    var peg$r15 = /^[0-9ux]/;
    var peg$r16 = /^[*\\\/[]/;
    var peg$r17 = /^[\\\/[]/;
    var peg$r18 = /^[\]\\]/;
    var peg$r19 = /^[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137-\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148-\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C-\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA-\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9-\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC-\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF-\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F-\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0-\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB-\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE-\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6-\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FC7\u1FD0-\u1FD3\u1FD6-\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6-\u1FF7\u210A\u210E-\u210F\u2113\u212F\u2134\u2139\u213C-\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65-\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73-\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3-\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]/;
    var peg$r20 = /^[\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5-\u06E6\u07F4-\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C-\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D-\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C-\uA69D\uA717-\uA71F\uA770\uA788\uA7F8-\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3-\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E-\uFF9F]/;
    var peg$r21 = /^[\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A-\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
    var peg$r22 = /^[\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC]/;
    var peg$r23 = /^[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178-\u0179\u017B\u017D\u0181-\u0182\u0184\u0186-\u0187\u0189-\u018B\u018E-\u0191\u0193-\u0194\u0196-\u0198\u019C-\u019D\u019F-\u01A0\u01A2\u01A4\u01A6-\u01A7\u01A9\u01AC\u01AE-\u01AF\u01B1-\u01B3\u01B5\u01B7-\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A-\u023B\u023D-\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9-\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0-\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E-\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D-\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A]/;
    var peg$r24 = /^[\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E-\u094F\u0982-\u0983\u09BE-\u09C0\u09C7-\u09C8\u09CB-\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB-\u0ACC\u0B02-\u0B03\u0B3E\u0B40\u0B47-\u0B48\u0B4B-\u0B4C\u0B57\u0BBE-\u0BBF\u0BC1-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82-\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7-\u0CC8\u0CCA-\u0CCB\u0CD5-\u0CD6\u0D02-\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82-\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2-\u0DF3\u0F3E-\u0F3F\u0F7F\u102B-\u102C\u1031\u1038\u103B-\u103C\u1056-\u1057\u1062-\u1064\u1067-\u106D\u1083-\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7-\u17C8\u1923-\u1926\u1929-\u192B\u1930-\u1931\u1933-\u1938\u1A19-\u1A1A\u1A55\u1A57\u1A61\u1A63-\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B44\u1B82\u1BA1\u1BA6-\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2-\u1BF3\u1C24-\u1C2B\u1C34-\u1C35\u1CE1\u1CF2-\u1CF3\u302E-\u302F\uA823-\uA824\uA827\uA880-\uA881\uA8B4-\uA8C3\uA952-\uA953\uA983\uA9B4-\uA9B5\uA9BA-\uA9BB\uA9BD-\uA9C0\uAA2F-\uAA30\uAA33-\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE-\uAAEF\uAAF5\uABE3-\uABE4\uABE6-\uABE7\uABE9-\uABEA\uABEC]/;
    var peg$r25 = /^[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962-\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2-\u09E3\u0A01-\u0A02\u0A3C\u0A41-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7-\u0AC8\u0ACD\u0AE2-\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62-\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC-\u0CCD\u0CE2-\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62-\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039-\u103A\u103D-\u103E\u1058-\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193B\u1A17-\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8-\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099-\u309A\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA825-\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31-\uAA32\uAA35-\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEC-\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/;
    var peg$r26 = /^[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/;
    var peg$r27 = /^[\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF]/;
    var peg$r28 = /^[_\u203F-\u2040\u2054\uFE33-\uFE34\uFE4D-\uFE4F\uFF3F]/;
    var peg$r29 = /^[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;
    var peg$e0 = peg$literalExpectation(".", false);
    var peg$e1 = peg$literalExpectation("?", false);
    var peg$e2 = peg$literalExpectation("(", false);
    var peg$e3 = peg$literalExpectation(")", false);
    var peg$e4 = peg$literalExpectation("[", false);
    var peg$e5 = peg$literalExpectation("]", false);
    var peg$e6 = peg$literalExpectation("*", false);
    var peg$e7 = peg$literalExpectation("self", false);
    var peg$e8 = peg$literalExpectation("_", false);
    var peg$e9 = peg$literalExpectation(",", false);
    var peg$e10 = peg$literalExpectation("{", false);
    var peg$e11 = peg$literalExpectation("}", false);
    var peg$e12 = peg$literalExpectation(":", false);
    var peg$e13 = peg$literalExpectation("if", false);
    var peg$e14 = peg$literalExpectation("or", false);
    var peg$e15 = peg$literalExpectation("and", false);
    var peg$e16 = peg$literalExpectation("==", false);
    var peg$e17 = peg$literalExpectation("!=", false);
    var peg$e18 = peg$literalExpectation("<=", false);
    var peg$e19 = peg$literalExpectation(">=", false);
    var peg$e20 = peg$classExpectation(["<", ">"], false, false);
    var peg$e21 = peg$literalExpectation("not", false);
    var peg$e22 = peg$anyExpectation();
    var peg$e23 = peg$otherExpectation("whitespace");
    var peg$e24 = peg$classExpectation(["\t", ["\v", "\f"], " ", "\xA0", "\u1680", ["\u2000", "\u200A"], "\u202F", "\u205F", "\u3000", "\uFEFF"], false, false);
    var peg$e25 = peg$classExpectation(["\n", "\r", "\u2028", "\u2029"], false, false);
    var peg$e26 = peg$otherExpectation("end of line");
    var peg$e27 = peg$literalExpectation("\n", false);
    var peg$e28 = peg$literalExpectation("\r\n", false);
    var peg$e29 = peg$classExpectation(["\r", ["\u2028", "\u2029"]], false, false);
    var peg$e30 = peg$otherExpectation("comment");
    var peg$e31 = peg$literalExpectation("/*", false);
    var peg$e32 = peg$literalExpectation("*/", false);
    var peg$e33 = peg$literalExpectation("//", false);
    var peg$e34 = peg$otherExpectation("identifier");
    var peg$e35 = peg$classExpectation([["A", "Z"], "_", ["a", "z"], "\xAA", "\xB5", "\xBA", ["\xC0", "\xD6"], ["\xD8", "\xF6"], ["\xF8", "\u02C1"], ["\u02C6", "\u02D1"], ["\u02E0", "\u02E4"], "\u02EC", "\u02EE", ["\u0370", "\u0374"], ["\u0376", "\u0377"], ["\u037A", "\u037D"], "\u037F", "\u0386", ["\u0388", "\u038A"], "\u038C", ["\u038E", "\u03A1"], ["\u03A3", "\u03F5"], ["\u03F7", "\u0481"], ["\u048A", "\u052F"], ["\u0531", "\u0556"], "\u0559", ["\u0561", "\u0587"], ["\u05D0", "\u05EA"], ["\u05F0", "\u05F2"], ["\u0620", "\u064A"], ["\u066E", "\u066F"], ["\u0671", "\u06D3"], "\u06D5", ["\u06E5", "\u06E6"], ["\u06EE", "\u06EF"], ["\u06FA", "\u06FC"], "\u06FF", "\u0710", ["\u0712", "\u072F"], ["\u074D", "\u07A5"], "\u07B1", ["\u07CA", "\u07EA"], ["\u07F4", "\u07F5"], "\u07FA", ["\u0800", "\u0815"], "\u081A", "\u0824", "\u0828", ["\u0840", "\u0858"], ["\u08A0", "\u08B4"], ["\u0904", "\u0939"], "\u093D", "\u0950", ["\u0958", "\u0961"], ["\u0971", "\u0980"], ["\u0985", "\u098C"], ["\u098F", "\u0990"], ["\u0993", "\u09A8"], ["\u09AA", "\u09B0"], "\u09B2", ["\u09B6", "\u09B9"], "\u09BD", "\u09CE", ["\u09DC", "\u09DD"], ["\u09DF", "\u09E1"], ["\u09F0", "\u09F1"], ["\u0A05", "\u0A0A"], ["\u0A0F", "\u0A10"], ["\u0A13", "\u0A28"], ["\u0A2A", "\u0A30"], ["\u0A32", "\u0A33"], ["\u0A35", "\u0A36"], ["\u0A38", "\u0A39"], ["\u0A59", "\u0A5C"], "\u0A5E", ["\u0A72", "\u0A74"], ["\u0A85", "\u0A8D"], ["\u0A8F", "\u0A91"], ["\u0A93", "\u0AA8"], ["\u0AAA", "\u0AB0"], ["\u0AB2", "\u0AB3"], ["\u0AB5", "\u0AB9"], "\u0ABD", "\u0AD0", ["\u0AE0", "\u0AE1"], "\u0AF9", ["\u0B05", "\u0B0C"], ["\u0B0F", "\u0B10"], ["\u0B13", "\u0B28"], ["\u0B2A", "\u0B30"], ["\u0B32", "\u0B33"], ["\u0B35", "\u0B39"], "\u0B3D", ["\u0B5C", "\u0B5D"], ["\u0B5F", "\u0B61"], "\u0B71", "\u0B83", ["\u0B85", "\u0B8A"], ["\u0B8E", "\u0B90"], ["\u0B92", "\u0B95"], ["\u0B99", "\u0B9A"], "\u0B9C", ["\u0B9E", "\u0B9F"], ["\u0BA3", "\u0BA4"], ["\u0BA8", "\u0BAA"], ["\u0BAE", "\u0BB9"], "\u0BD0", ["\u0C05", "\u0C0C"], ["\u0C0E", "\u0C10"], ["\u0C12", "\u0C28"], ["\u0C2A", "\u0C39"], "\u0C3D", ["\u0C58", "\u0C5A"], ["\u0C60", "\u0C61"], ["\u0C85", "\u0C8C"], ["\u0C8E", "\u0C90"], ["\u0C92", "\u0CA8"], ["\u0CAA", "\u0CB3"], ["\u0CB5", "\u0CB9"], "\u0CBD", "\u0CDE", ["\u0CE0", "\u0CE1"], ["\u0CF1", "\u0CF2"], ["\u0D05", "\u0D0C"], ["\u0D0E", "\u0D10"], ["\u0D12", "\u0D3A"], "\u0D3D", "\u0D4E", ["\u0D5F", "\u0D61"], ["\u0D7A", "\u0D7F"], ["\u0D85", "\u0D96"], ["\u0D9A", "\u0DB1"], ["\u0DB3", "\u0DBB"], "\u0DBD", ["\u0DC0", "\u0DC6"], ["\u0E01", "\u0E30"], ["\u0E32", "\u0E33"], ["\u0E40", "\u0E46"], ["\u0E81", "\u0E82"], "\u0E84", ["\u0E87", "\u0E88"], "\u0E8A", "\u0E8D", ["\u0E94", "\u0E97"], ["\u0E99", "\u0E9F"], ["\u0EA1", "\u0EA3"], "\u0EA5", "\u0EA7", ["\u0EAA", "\u0EAB"], ["\u0EAD", "\u0EB0"], ["\u0EB2", "\u0EB3"], "\u0EBD", ["\u0EC0", "\u0EC4"], "\u0EC6", ["\u0EDC", "\u0EDF"], "\u0F00", ["\u0F40", "\u0F47"], ["\u0F49", "\u0F6C"], ["\u0F88", "\u0F8C"], ["\u1000", "\u102A"], "\u103F", ["\u1050", "\u1055"], ["\u105A", "\u105D"], "\u1061", ["\u1065", "\u1066"], ["\u106E", "\u1070"], ["\u1075", "\u1081"], "\u108E", ["\u10A0", "\u10C5"], "\u10C7", "\u10CD", ["\u10D0", "\u10FA"], ["\u10FC", "\u1248"], ["\u124A", "\u124D"], ["\u1250", "\u1256"], "\u1258", ["\u125A", "\u125D"], ["\u1260", "\u1288"], ["\u128A", "\u128D"], ["\u1290", "\u12B0"], ["\u12B2", "\u12B5"], ["\u12B8", "\u12BE"], "\u12C0", ["\u12C2", "\u12C5"], ["\u12C8", "\u12D6"], ["\u12D8", "\u1310"], ["\u1312", "\u1315"], ["\u1318", "\u135A"], ["\u1380", "\u138F"], ["\u13A0", "\u13F5"], ["\u13F8", "\u13FD"], ["\u1401", "\u166C"], ["\u166F", "\u167F"], ["\u1681", "\u169A"], ["\u16A0", "\u16EA"], ["\u16EE", "\u16F8"], ["\u1700", "\u170C"], ["\u170E", "\u1711"], ["\u1720", "\u1731"], ["\u1740", "\u1751"], ["\u1760", "\u176C"], ["\u176E", "\u1770"], ["\u1780", "\u17B3"], "\u17D7", "\u17DC", ["\u1820", "\u1877"], ["\u1880", "\u18A8"], "\u18AA", ["\u18B0", "\u18F5"], ["\u1900", "\u191E"], ["\u1950", "\u196D"], ["\u1970", "\u1974"], ["\u1980", "\u19AB"], ["\u19B0", "\u19C9"], ["\u1A00", "\u1A16"], ["\u1A20", "\u1A54"], "\u1AA7", ["\u1B05", "\u1B33"], ["\u1B45", "\u1B4B"], ["\u1B83", "\u1BA0"], ["\u1BAE", "\u1BAF"], ["\u1BBA", "\u1BE5"], ["\u1C00", "\u1C23"], ["\u1C4D", "\u1C4F"], ["\u1C5A", "\u1C7D"], ["\u1CE9", "\u1CEC"], ["\u1CEE", "\u1CF1"], ["\u1CF5", "\u1CF6"], ["\u1D00", "\u1DBF"], ["\u1E00", "\u1F15"], ["\u1F18", "\u1F1D"], ["\u1F20", "\u1F45"], ["\u1F48", "\u1F4D"], ["\u1F50", "\u1F57"], "\u1F59", "\u1F5B", "\u1F5D", ["\u1F5F", "\u1F7D"], ["\u1F80", "\u1FB4"], ["\u1FB6", "\u1FBC"], "\u1FBE", ["\u1FC2", "\u1FC4"], ["\u1FC6", "\u1FCC"], ["\u1FD0", "\u1FD3"], ["\u1FD6", "\u1FDB"], ["\u1FE0", "\u1FEC"], ["\u1FF2", "\u1FF4"], ["\u1FF6", "\u1FFC"], "\u2071", "\u207F", ["\u2090", "\u209C"], "\u2102", "\u2107", ["\u210A", "\u2113"], "\u2115", ["\u2119", "\u211D"], "\u2124", "\u2126", "\u2128", ["\u212A", "\u212D"], ["\u212F", "\u2139"], ["\u213C", "\u213F"], ["\u2145", "\u2149"], "\u214E", ["\u2160", "\u2188"], ["\u2C00", "\u2C2E"], ["\u2C30", "\u2C5E"], ["\u2C60", "\u2CE4"], ["\u2CEB", "\u2CEE"], ["\u2CF2", "\u2CF3"], ["\u2D00", "\u2D25"], "\u2D27", "\u2D2D", ["\u2D30", "\u2D67"], "\u2D6F", ["\u2D80", "\u2D96"], ["\u2DA0", "\u2DA6"], ["\u2DA8", "\u2DAE"], ["\u2DB0", "\u2DB6"], ["\u2DB8", "\u2DBE"], ["\u2DC0", "\u2DC6"], ["\u2DC8", "\u2DCE"], ["\u2DD0", "\u2DD6"], ["\u2DD8", "\u2DDE"], "\u2E2F", ["\u3005", "\u3007"], ["\u3021", "\u3029"], ["\u3031", "\u3035"], ["\u3038", "\u303C"], ["\u3041", "\u3096"], ["\u309D", "\u309F"], ["\u30A1", "\u30FA"], ["\u30FC", "\u30FF"], ["\u3105", "\u312D"], ["\u3131", "\u318E"], ["\u31A0", "\u31BA"], ["\u31F0", "\u31FF"], ["\u3400", "\u4DB5"], ["\u4E00", "\u9FD5"], ["\uA000", "\uA48C"], ["\uA4D0", "\uA4FD"], ["\uA500", "\uA60C"], ["\uA610", "\uA61F"], ["\uA62A", "\uA62B"], ["\uA640", "\uA66E"], ["\uA67F", "\uA69D"], ["\uA6A0", "\uA6EF"], ["\uA717", "\uA71F"], ["\uA722", "\uA788"], ["\uA78B", "\uA7AD"], ["\uA7B0", "\uA7B7"], ["\uA7F7", "\uA801"], ["\uA803", "\uA805"], ["\uA807", "\uA80A"], ["\uA80C", "\uA822"], ["\uA840", "\uA873"], ["\uA882", "\uA8B3"], ["\uA8F2", "\uA8F7"], "\uA8FB", "\uA8FD", ["\uA90A", "\uA925"], ["\uA930", "\uA946"], ["\uA960", "\uA97C"], ["\uA984", "\uA9B2"], "\uA9CF", ["\uA9E0", "\uA9E4"], ["\uA9E6", "\uA9EF"], ["\uA9FA", "\uA9FE"], ["\uAA00", "\uAA28"], ["\uAA40", "\uAA42"], ["\uAA44", "\uAA4B"], ["\uAA60", "\uAA76"], "\uAA7A", ["\uAA7E", "\uAAAF"], "\uAAB1", ["\uAAB5", "\uAAB6"], ["\uAAB9", "\uAABD"], "\uAAC0", "\uAAC2", ["\uAADB", "\uAADD"], ["\uAAE0", "\uAAEA"], ["\uAAF2", "\uAAF4"], ["\uAB01", "\uAB06"], ["\uAB09", "\uAB0E"], ["\uAB11", "\uAB16"], ["\uAB20", "\uAB26"], ["\uAB28", "\uAB2E"], ["\uAB30", "\uAB5A"], ["\uAB5C", "\uAB65"], ["\uAB70", "\uABE2"], ["\uAC00", "\uD7A3"], ["\uD7B0", "\uD7C6"], ["\uD7CB", "\uD7FB"], ["\uF900", "\uFA6D"], ["\uFA70", "\uFAD9"], ["\uFB00", "\uFB06"], ["\uFB13", "\uFB17"], "\uFB1D", ["\uFB1F", "\uFB28"], ["\uFB2A", "\uFB36"], ["\uFB38", "\uFB3C"], "\uFB3E", ["\uFB40", "\uFB41"], ["\uFB43", "\uFB44"], ["\uFB46", "\uFBB1"], ["\uFBD3", "\uFD3D"], ["\uFD50", "\uFD8F"], ["\uFD92", "\uFDC7"], ["\uFDF0", "\uFDFB"], ["\uFE70", "\uFE74"], ["\uFE76", "\uFEFC"], ["\uFF21", "\uFF3A"], ["\uFF41", "\uFF5A"], ["\uFF66", "\uFFBE"], ["\uFFC2", "\uFFC7"], ["\uFFCA", "\uFFCF"], ["\uFFD2", "\uFFD7"], ["\uFFDA", "\uFFDC"]], false, false);
    var peg$e36 = peg$literalExpectation("\\", false);
    var peg$e37 = peg$classExpectation([["0", "9"], "_", ["\u0300", "\u036F"], ["\u0483", "\u0487"], ["\u0591", "\u05BD"], "\u05BF", ["\u05C1", "\u05C2"], ["\u05C4", "\u05C5"], "\u05C7", ["\u0610", "\u061A"], ["\u064B", "\u0669"], "\u0670", ["\u06D6", "\u06DC"], ["\u06DF", "\u06E4"], ["\u06E7", "\u06E8"], ["\u06EA", "\u06ED"], ["\u06F0", "\u06F9"], "\u0711", ["\u0730", "\u074A"], ["\u07A6", "\u07B0"], ["\u07C0", "\u07C9"], ["\u07EB", "\u07F3"], ["\u0816", "\u0819"], ["\u081B", "\u0823"], ["\u0825", "\u0827"], ["\u0829", "\u082D"], ["\u0859", "\u085B"], ["\u08E3", "\u0903"], ["\u093A", "\u093C"], ["\u093E", "\u094F"], ["\u0951", "\u0957"], ["\u0962", "\u0963"], ["\u0966", "\u096F"], ["\u0981", "\u0983"], "\u09BC", ["\u09BE", "\u09C4"], ["\u09C7", "\u09C8"], ["\u09CB", "\u09CD"], "\u09D7", ["\u09E2", "\u09E3"], ["\u09E6", "\u09EF"], ["\u0A01", "\u0A03"], "\u0A3C", ["\u0A3E", "\u0A42"], ["\u0A47", "\u0A48"], ["\u0A4B", "\u0A4D"], "\u0A51", ["\u0A66", "\u0A71"], "\u0A75", ["\u0A81", "\u0A83"], "\u0ABC", ["\u0ABE", "\u0AC5"], ["\u0AC7", "\u0AC9"], ["\u0ACB", "\u0ACD"], ["\u0AE2", "\u0AE3"], ["\u0AE6", "\u0AEF"], ["\u0B01", "\u0B03"], "\u0B3C", ["\u0B3E", "\u0B44"], ["\u0B47", "\u0B48"], ["\u0B4B", "\u0B4D"], ["\u0B56", "\u0B57"], ["\u0B62", "\u0B63"], ["\u0B66", "\u0B6F"], "\u0B82", ["\u0BBE", "\u0BC2"], ["\u0BC6", "\u0BC8"], ["\u0BCA", "\u0BCD"], "\u0BD7", ["\u0BE6", "\u0BEF"], ["\u0C00", "\u0C03"], ["\u0C3E", "\u0C44"], ["\u0C46", "\u0C48"], ["\u0C4A", "\u0C4D"], ["\u0C55", "\u0C56"], ["\u0C62", "\u0C63"], ["\u0C66", "\u0C6F"], ["\u0C81", "\u0C83"], "\u0CBC", ["\u0CBE", "\u0CC4"], ["\u0CC6", "\u0CC8"], ["\u0CCA", "\u0CCD"], ["\u0CD5", "\u0CD6"], ["\u0CE2", "\u0CE3"], ["\u0CE6", "\u0CEF"], ["\u0D01", "\u0D03"], ["\u0D3E", "\u0D44"], ["\u0D46", "\u0D48"], ["\u0D4A", "\u0D4D"], "\u0D57", ["\u0D62", "\u0D63"], ["\u0D66", "\u0D6F"], ["\u0D82", "\u0D83"], "\u0DCA", ["\u0DCF", "\u0DD4"], "\u0DD6", ["\u0DD8", "\u0DDF"], ["\u0DE6", "\u0DEF"], ["\u0DF2", "\u0DF3"], "\u0E31", ["\u0E34", "\u0E3A"], ["\u0E47", "\u0E4E"], ["\u0E50", "\u0E59"], "\u0EB1", ["\u0EB4", "\u0EB9"], ["\u0EBB", "\u0EBC"], ["\u0EC8", "\u0ECD"], ["\u0ED0", "\u0ED9"], ["\u0F18", "\u0F19"], ["\u0F20", "\u0F29"], "\u0F35", "\u0F37", "\u0F39", ["\u0F3E", "\u0F3F"], ["\u0F71", "\u0F84"], ["\u0F86", "\u0F87"], ["\u0F8D", "\u0F97"], ["\u0F99", "\u0FBC"], "\u0FC6", ["\u102B", "\u103E"], ["\u1040", "\u1049"], ["\u1056", "\u1059"], ["\u105E", "\u1060"], ["\u1062", "\u1064"], ["\u1067", "\u106D"], ["\u1071", "\u1074"], ["\u1082", "\u108D"], ["\u108F", "\u109D"], ["\u135D", "\u135F"], ["\u1712", "\u1714"], ["\u1732", "\u1734"], ["\u1752", "\u1753"], ["\u1772", "\u1773"], ["\u17B4", "\u17D3"], "\u17DD", ["\u17E0", "\u17E9"], ["\u180B", "\u180D"], ["\u1810", "\u1819"], "\u18A9", ["\u1920", "\u192B"], ["\u1930", "\u193B"], ["\u1946", "\u194F"], ["\u19D0", "\u19D9"], ["\u1A17", "\u1A1B"], ["\u1A55", "\u1A5E"], ["\u1A60", "\u1A7C"], ["\u1A7F", "\u1A89"], ["\u1A90", "\u1A99"], ["\u1AB0", "\u1ABD"], ["\u1B00", "\u1B04"], ["\u1B34", "\u1B44"], ["\u1B50", "\u1B59"], ["\u1B6B", "\u1B73"], ["\u1B80", "\u1B82"], ["\u1BA1", "\u1BAD"], ["\u1BB0", "\u1BB9"], ["\u1BE6", "\u1BF3"], ["\u1C24", "\u1C37"], ["\u1C40", "\u1C49"], ["\u1C50", "\u1C59"], ["\u1CD0", "\u1CD2"], ["\u1CD4", "\u1CE8"], "\u1CED", ["\u1CF2", "\u1CF4"], ["\u1CF8", "\u1CF9"], ["\u1DC0", "\u1DF5"], ["\u1DFC", "\u1DFF"], ["\u200C", "\u200D"], ["\u203F", "\u2040"], "\u2054", ["\u20D0", "\u20DC"], "\u20E1", ["\u20E5", "\u20F0"], ["\u2CEF", "\u2CF1"], "\u2D7F", ["\u2DE0", "\u2DFF"], ["\u302A", "\u302F"], ["\u3099", "\u309A"], ["\uA620", "\uA629"], "\uA66F", ["\uA674", "\uA67D"], ["\uA69E", "\uA69F"], ["\uA6F0", "\uA6F1"], "\uA802", "\uA806", "\uA80B", ["\uA823", "\uA827"], ["\uA880", "\uA881"], ["\uA8B4", "\uA8C4"], ["\uA8D0", "\uA8D9"], ["\uA8E0", "\uA8F1"], ["\uA900", "\uA909"], ["\uA926", "\uA92D"], ["\uA947", "\uA953"], ["\uA980", "\uA983"], ["\uA9B3", "\uA9C0"], ["\uA9D0", "\uA9D9"], "\uA9E5", ["\uA9F0", "\uA9F9"], ["\uAA29", "\uAA36"], "\uAA43", ["\uAA4C", "\uAA4D"], ["\uAA50", "\uAA59"], ["\uAA7B", "\uAA7D"], "\uAAB0", ["\uAAB2", "\uAAB4"], ["\uAAB7", "\uAAB8"], ["\uAABE", "\uAABF"], "\uAAC1", ["\uAAEB", "\uAAEF"], ["\uAAF5", "\uAAF6"], ["\uABE3", "\uABEA"], ["\uABEC", "\uABED"], ["\uABF0", "\uABF9"], "\uFB1E", ["\uFE00", "\uFE0F"], ["\uFE20", "\uFE2F"], ["\uFE33", "\uFE34"], ["\uFE4D", "\uFE4F"], ["\uFF10", "\uFF19"], "\uFF3F"], false, false);
    var peg$e38 = peg$classExpectation([["A", "Z"], ["a", "z"], "\xAA", "\xB5", "\xBA", ["\xC0", "\xD6"], ["\xD8", "\xF6"], ["\xF8", "\u02C1"], ["\u02C6", "\u02D1"], ["\u02E0", "\u02E4"], "\u02EC", "\u02EE", ["\u0370", "\u0374"], ["\u0376", "\u0377"], ["\u037A", "\u037D"], "\u037F", "\u0386", ["\u0388", "\u038A"], "\u038C", ["\u038E", "\u03A1"], ["\u03A3", "\u03F5"], ["\u03F7", "\u0481"], ["\u048A", "\u052F"], ["\u0531", "\u0556"], "\u0559", ["\u0561", "\u0587"], ["\u05D0", "\u05EA"], ["\u05F0", "\u05F2"], ["\u0620", "\u064A"], ["\u066E", "\u066F"], ["\u0671", "\u06D3"], "\u06D5", ["\u06E5", "\u06E6"], ["\u06EE", "\u06EF"], ["\u06FA", "\u06FC"], "\u06FF", "\u0710", ["\u0712", "\u072F"], ["\u074D", "\u07A5"], "\u07B1", ["\u07CA", "\u07EA"], ["\u07F4", "\u07F5"], "\u07FA", ["\u0800", "\u0815"], "\u081A", "\u0824", "\u0828", ["\u0840", "\u0858"], ["\u08A0", "\u08B4"], ["\u0904", "\u0939"], "\u093D", "\u0950", ["\u0958", "\u0961"], ["\u0971", "\u0980"], ["\u0985", "\u098C"], ["\u098F", "\u0990"], ["\u0993", "\u09A8"], ["\u09AA", "\u09B0"], "\u09B2", ["\u09B6", "\u09B9"], "\u09BD", "\u09CE", ["\u09DC", "\u09DD"], ["\u09DF", "\u09E1"], ["\u09F0", "\u09F1"], ["\u0A05", "\u0A0A"], ["\u0A0F", "\u0A10"], ["\u0A13", "\u0A28"], ["\u0A2A", "\u0A30"], ["\u0A32", "\u0A33"], ["\u0A35", "\u0A36"], ["\u0A38", "\u0A39"], ["\u0A59", "\u0A5C"], "\u0A5E", ["\u0A72", "\u0A74"], ["\u0A85", "\u0A8D"], ["\u0A8F", "\u0A91"], ["\u0A93", "\u0AA8"], ["\u0AAA", "\u0AB0"], ["\u0AB2", "\u0AB3"], ["\u0AB5", "\u0AB9"], "\u0ABD", "\u0AD0", ["\u0AE0", "\u0AE1"], "\u0AF9", ["\u0B05", "\u0B0C"], ["\u0B0F", "\u0B10"], ["\u0B13", "\u0B28"], ["\u0B2A", "\u0B30"], ["\u0B32", "\u0B33"], ["\u0B35", "\u0B39"], "\u0B3D", ["\u0B5C", "\u0B5D"], ["\u0B5F", "\u0B61"], "\u0B71", "\u0B83", ["\u0B85", "\u0B8A"], ["\u0B8E", "\u0B90"], ["\u0B92", "\u0B95"], ["\u0B99", "\u0B9A"], "\u0B9C", ["\u0B9E", "\u0B9F"], ["\u0BA3", "\u0BA4"], ["\u0BA8", "\u0BAA"], ["\u0BAE", "\u0BB9"], "\u0BD0", ["\u0C05", "\u0C0C"], ["\u0C0E", "\u0C10"], ["\u0C12", "\u0C28"], ["\u0C2A", "\u0C39"], "\u0C3D", ["\u0C58", "\u0C5A"], ["\u0C60", "\u0C61"], ["\u0C85", "\u0C8C"], ["\u0C8E", "\u0C90"], ["\u0C92", "\u0CA8"], ["\u0CAA", "\u0CB3"], ["\u0CB5", "\u0CB9"], "\u0CBD", "\u0CDE", ["\u0CE0", "\u0CE1"], ["\u0CF1", "\u0CF2"], ["\u0D05", "\u0D0C"], ["\u0D0E", "\u0D10"], ["\u0D12", "\u0D3A"], "\u0D3D", "\u0D4E", ["\u0D5F", "\u0D61"], ["\u0D7A", "\u0D7F"], ["\u0D85", "\u0D96"], ["\u0D9A", "\u0DB1"], ["\u0DB3", "\u0DBB"], "\u0DBD", ["\u0DC0", "\u0DC6"], ["\u0E01", "\u0E30"], ["\u0E32", "\u0E33"], ["\u0E40", "\u0E46"], ["\u0E81", "\u0E82"], "\u0E84", ["\u0E87", "\u0E88"], "\u0E8A", "\u0E8D", ["\u0E94", "\u0E97"], ["\u0E99", "\u0E9F"], ["\u0EA1", "\u0EA3"], "\u0EA5", "\u0EA7", ["\u0EAA", "\u0EAB"], ["\u0EAD", "\u0EB0"], ["\u0EB2", "\u0EB3"], "\u0EBD", ["\u0EC0", "\u0EC4"], "\u0EC6", ["\u0EDC", "\u0EDF"], "\u0F00", ["\u0F40", "\u0F47"], ["\u0F49", "\u0F6C"], ["\u0F88", "\u0F8C"], ["\u1000", "\u102A"], "\u103F", ["\u1050", "\u1055"], ["\u105A", "\u105D"], "\u1061", ["\u1065", "\u1066"], ["\u106E", "\u1070"], ["\u1075", "\u1081"], "\u108E", ["\u10A0", "\u10C5"], "\u10C7", "\u10CD", ["\u10D0", "\u10FA"], ["\u10FC", "\u1248"], ["\u124A", "\u124D"], ["\u1250", "\u1256"], "\u1258", ["\u125A", "\u125D"], ["\u1260", "\u1288"], ["\u128A", "\u128D"], ["\u1290", "\u12B0"], ["\u12B2", "\u12B5"], ["\u12B8", "\u12BE"], "\u12C0", ["\u12C2", "\u12C5"], ["\u12C8", "\u12D6"], ["\u12D8", "\u1310"], ["\u1312", "\u1315"], ["\u1318", "\u135A"], ["\u1380", "\u138F"], ["\u13A0", "\u13F5"], ["\u13F8", "\u13FD"], ["\u1401", "\u166C"], ["\u166F", "\u167F"], ["\u1681", "\u169A"], ["\u16A0", "\u16EA"], ["\u16EE", "\u16F8"], ["\u1700", "\u170C"], ["\u170E", "\u1711"], ["\u1720", "\u1731"], ["\u1740", "\u1751"], ["\u1760", "\u176C"], ["\u176E", "\u1770"], ["\u1780", "\u17B3"], "\u17D7", "\u17DC", ["\u1820", "\u1877"], ["\u1880", "\u18A8"], "\u18AA", ["\u18B0", "\u18F5"], ["\u1900", "\u191E"], ["\u1950", "\u196D"], ["\u1970", "\u1974"], ["\u1980", "\u19AB"], ["\u19B0", "\u19C9"], ["\u1A00", "\u1A16"], ["\u1A20", "\u1A54"], "\u1AA7", ["\u1B05", "\u1B33"], ["\u1B45", "\u1B4B"], ["\u1B83", "\u1BA0"], ["\u1BAE", "\u1BAF"], ["\u1BBA", "\u1BE5"], ["\u1C00", "\u1C23"], ["\u1C4D", "\u1C4F"], ["\u1C5A", "\u1C7D"], ["\u1CE9", "\u1CEC"], ["\u1CEE", "\u1CF1"], ["\u1CF5", "\u1CF6"], ["\u1D00", "\u1DBF"], ["\u1E00", "\u1F15"], ["\u1F18", "\u1F1D"], ["\u1F20", "\u1F45"], ["\u1F48", "\u1F4D"], ["\u1F50", "\u1F57"], "\u1F59", "\u1F5B", "\u1F5D", ["\u1F5F", "\u1F7D"], ["\u1F80", "\u1FB4"], ["\u1FB6", "\u1FBC"], "\u1FBE", ["\u1FC2", "\u1FC4"], ["\u1FC6", "\u1FCC"], ["\u1FD0", "\u1FD3"], ["\u1FD6", "\u1FDB"], ["\u1FE0", "\u1FEC"], ["\u1FF2", "\u1FF4"], ["\u1FF6", "\u1FFC"], "\u2071", "\u207F", ["\u2090", "\u209C"], "\u2102", "\u2107", ["\u210A", "\u2113"], "\u2115", ["\u2119", "\u211D"], "\u2124", "\u2126", "\u2128", ["\u212A", "\u212D"], ["\u212F", "\u2139"], ["\u213C", "\u213F"], ["\u2145", "\u2149"], "\u214E", ["\u2160", "\u2188"], ["\u2C00", "\u2C2E"], ["\u2C30", "\u2C5E"], ["\u2C60", "\u2CE4"], ["\u2CEB", "\u2CEE"], ["\u2CF2", "\u2CF3"], ["\u2D00", "\u2D25"], "\u2D27", "\u2D2D", ["\u2D30", "\u2D67"], "\u2D6F", ["\u2D80", "\u2D96"], ["\u2DA0", "\u2DA6"], ["\u2DA8", "\u2DAE"], ["\u2DB0", "\u2DB6"], ["\u2DB8", "\u2DBE"], ["\u2DC0", "\u2DC6"], ["\u2DC8", "\u2DCE"], ["\u2DD0", "\u2DD6"], ["\u2DD8", "\u2DDE"], "\u2E2F", ["\u3005", "\u3007"], ["\u3021", "\u3029"], ["\u3031", "\u3035"], ["\u3038", "\u303C"], ["\u3041", "\u3096"], ["\u309D", "\u309F"], ["\u30A1", "\u30FA"], ["\u30FC", "\u30FF"], ["\u3105", "\u312D"], ["\u3131", "\u318E"], ["\u31A0", "\u31BA"], ["\u31F0", "\u31FF"], ["\u3400", "\u4DB5"], ["\u4E00", "\u9FD5"], ["\uA000", "\uA48C"], ["\uA4D0", "\uA4FD"], ["\uA500", "\uA60C"], ["\uA610", "\uA61F"], ["\uA62A", "\uA62B"], ["\uA640", "\uA66E"], ["\uA67F", "\uA69D"], ["\uA6A0", "\uA6EF"], ["\uA717", "\uA71F"], ["\uA722", "\uA788"], ["\uA78B", "\uA7AD"], ["\uA7B0", "\uA7B7"], ["\uA7F7", "\uA801"], ["\uA803", "\uA805"], ["\uA807", "\uA80A"], ["\uA80C", "\uA822"], ["\uA840", "\uA873"], ["\uA882", "\uA8B3"], ["\uA8F2", "\uA8F7"], "\uA8FB", "\uA8FD", ["\uA90A", "\uA925"], ["\uA930", "\uA946"], ["\uA960", "\uA97C"], ["\uA984", "\uA9B2"], "\uA9CF", ["\uA9E0", "\uA9E4"], ["\uA9E6", "\uA9EF"], ["\uA9FA", "\uA9FE"], ["\uAA00", "\uAA28"], ["\uAA40", "\uAA42"], ["\uAA44", "\uAA4B"], ["\uAA60", "\uAA76"], "\uAA7A", ["\uAA7E", "\uAAAF"], "\uAAB1", ["\uAAB5", "\uAAB6"], ["\uAAB9", "\uAABD"], "\uAAC0", "\uAAC2", ["\uAADB", "\uAADD"], ["\uAAE0", "\uAAEA"], ["\uAAF2", "\uAAF4"], ["\uAB01", "\uAB06"], ["\uAB09", "\uAB0E"], ["\uAB11", "\uAB16"], ["\uAB20", "\uAB26"], ["\uAB28", "\uAB2E"], ["\uAB30", "\uAB5A"], ["\uAB5C", "\uAB65"], ["\uAB70", "\uABE2"], ["\uAC00", "\uD7A3"], ["\uD7B0", "\uD7C6"], ["\uD7CB", "\uD7FB"], ["\uF900", "\uFA6D"], ["\uFA70", "\uFAD9"], ["\uFB00", "\uFB06"], ["\uFB13", "\uFB17"], "\uFB1D", ["\uFB1F", "\uFB28"], ["\uFB2A", "\uFB36"], ["\uFB38", "\uFB3C"], "\uFB3E", ["\uFB40", "\uFB41"], ["\uFB43", "\uFB44"], ["\uFB46", "\uFBB1"], ["\uFBD3", "\uFD3D"], ["\uFD50", "\uFD8F"], ["\uFD92", "\uFDC7"], ["\uFDF0", "\uFDFB"], ["\uFE70", "\uFE74"], ["\uFE76", "\uFEFC"], ["\uFF21", "\uFF3A"], ["\uFF41", "\uFF5A"], ["\uFF66", "\uFFBE"], ["\uFFC2", "\uFFC7"], ["\uFFCA", "\uFFCF"], ["\uFFD2", "\uFFD7"], ["\uFFDA", "\uFFDC"]], false, false);
    var peg$e39 = peg$classExpectation([["\u0300", "\u036F"], ["\u0483", "\u0487"], ["\u0591", "\u05BD"], "\u05BF", ["\u05C1", "\u05C2"], ["\u05C4", "\u05C5"], "\u05C7", ["\u0610", "\u061A"], ["\u064B", "\u065F"], "\u0670", ["\u06D6", "\u06DC"], ["\u06DF", "\u06E4"], ["\u06E7", "\u06E8"], ["\u06EA", "\u06ED"], "\u0711", ["\u0730", "\u074A"], ["\u07A6", "\u07B0"], ["\u07EB", "\u07F3"], ["\u0816", "\u0819"], ["\u081B", "\u0823"], ["\u0825", "\u0827"], ["\u0829", "\u082D"], ["\u0859", "\u085B"], ["\u08E3", "\u0903"], ["\u093A", "\u093C"], ["\u093E", "\u094F"], ["\u0951", "\u0957"], ["\u0962", "\u0963"], ["\u0981", "\u0983"], "\u09BC", ["\u09BE", "\u09C4"], ["\u09C7", "\u09C8"], ["\u09CB", "\u09CD"], "\u09D7", ["\u09E2", "\u09E3"], ["\u0A01", "\u0A03"], "\u0A3C", ["\u0A3E", "\u0A42"], ["\u0A47", "\u0A48"], ["\u0A4B", "\u0A4D"], "\u0A51", ["\u0A70", "\u0A71"], "\u0A75", ["\u0A81", "\u0A83"], "\u0ABC", ["\u0ABE", "\u0AC5"], ["\u0AC7", "\u0AC9"], ["\u0ACB", "\u0ACD"], ["\u0AE2", "\u0AE3"], ["\u0B01", "\u0B03"], "\u0B3C", ["\u0B3E", "\u0B44"], ["\u0B47", "\u0B48"], ["\u0B4B", "\u0B4D"], ["\u0B56", "\u0B57"], ["\u0B62", "\u0B63"], "\u0B82", ["\u0BBE", "\u0BC2"], ["\u0BC6", "\u0BC8"], ["\u0BCA", "\u0BCD"], "\u0BD7", ["\u0C00", "\u0C03"], ["\u0C3E", "\u0C44"], ["\u0C46", "\u0C48"], ["\u0C4A", "\u0C4D"], ["\u0C55", "\u0C56"], ["\u0C62", "\u0C63"], ["\u0C81", "\u0C83"], "\u0CBC", ["\u0CBE", "\u0CC4"], ["\u0CC6", "\u0CC8"], ["\u0CCA", "\u0CCD"], ["\u0CD5", "\u0CD6"], ["\u0CE2", "\u0CE3"], ["\u0D01", "\u0D03"], ["\u0D3E", "\u0D44"], ["\u0D46", "\u0D48"], ["\u0D4A", "\u0D4D"], "\u0D57", ["\u0D62", "\u0D63"], ["\u0D82", "\u0D83"], "\u0DCA", ["\u0DCF", "\u0DD4"], "\u0DD6", ["\u0DD8", "\u0DDF"], ["\u0DF2", "\u0DF3"], "\u0E31", ["\u0E34", "\u0E3A"], ["\u0E47", "\u0E4E"], "\u0EB1", ["\u0EB4", "\u0EB9"], ["\u0EBB", "\u0EBC"], ["\u0EC8", "\u0ECD"], ["\u0F18", "\u0F19"], "\u0F35", "\u0F37", "\u0F39", ["\u0F3E", "\u0F3F"], ["\u0F71", "\u0F84"], ["\u0F86", "\u0F87"], ["\u0F8D", "\u0F97"], ["\u0F99", "\u0FBC"], "\u0FC6", ["\u102B", "\u103E"], ["\u1056", "\u1059"], ["\u105E", "\u1060"], ["\u1062", "\u1064"], ["\u1067", "\u106D"], ["\u1071", "\u1074"], ["\u1082", "\u108D"], "\u108F", ["\u109A", "\u109D"], ["\u135D", "\u135F"], ["\u1712", "\u1714"], ["\u1732", "\u1734"], ["\u1752", "\u1753"], ["\u1772", "\u1773"], ["\u17B4", "\u17D3"], "\u17DD", ["\u180B", "\u180D"], "\u18A9", ["\u1920", "\u192B"], ["\u1930", "\u193B"], ["\u1A17", "\u1A1B"], ["\u1A55", "\u1A5E"], ["\u1A60", "\u1A7C"], "\u1A7F", ["\u1AB0", "\u1ABD"], ["\u1B00", "\u1B04"], ["\u1B34", "\u1B44"], ["\u1B6B", "\u1B73"], ["\u1B80", "\u1B82"], ["\u1BA1", "\u1BAD"], ["\u1BE6", "\u1BF3"], ["\u1C24", "\u1C37"], ["\u1CD0", "\u1CD2"], ["\u1CD4", "\u1CE8"], "\u1CED", ["\u1CF2", "\u1CF4"], ["\u1CF8", "\u1CF9"], ["\u1DC0", "\u1DF5"], ["\u1DFC", "\u1DFF"], ["\u20D0", "\u20DC"], "\u20E1", ["\u20E5", "\u20F0"], ["\u2CEF", "\u2CF1"], "\u2D7F", ["\u2DE0", "\u2DFF"], ["\u302A", "\u302F"], ["\u3099", "\u309A"], "\uA66F", ["\uA674", "\uA67D"], ["\uA69E", "\uA69F"], ["\uA6F0", "\uA6F1"], "\uA802", "\uA806", "\uA80B", ["\uA823", "\uA827"], ["\uA880", "\uA881"], ["\uA8B4", "\uA8C4"], ["\uA8E0", "\uA8F1"], ["\uA926", "\uA92D"], ["\uA947", "\uA953"], ["\uA980", "\uA983"], ["\uA9B3", "\uA9C0"], "\uA9E5", ["\uAA29", "\uAA36"], "\uAA43", ["\uAA4C", "\uAA4D"], ["\uAA7B", "\uAA7D"], "\uAAB0", ["\uAAB2", "\uAAB4"], ["\uAAB7", "\uAAB8"], ["\uAABE", "\uAABF"], "\uAAC1", ["\uAAEB", "\uAAEF"], ["\uAAF5", "\uAAF6"], ["\uABE3", "\uABEA"], ["\uABEC", "\uABED"], "\uFB1E", ["\uFE00", "\uFE0F"], ["\uFE20", "\uFE2F"]], false, false);
    var peg$e40 = peg$literalExpectation("null", false);
    var peg$e41 = peg$literalExpectation("true", false);
    var peg$e42 = peg$literalExpectation("false", false);
    var peg$e43 = peg$otherExpectation("number");
    var peg$e44 = peg$literalExpectation("0", false);
    var peg$e45 = peg$classExpectation([["0", "9"]], false, false);
    var peg$e46 = peg$classExpectation([["1", "9"]], false, false);
    var peg$e47 = peg$literalExpectation("e", true);
    var peg$e48 = peg$classExpectation(["+", "-"], false, false);
    var peg$e49 = peg$literalExpectation("0x", true);
    var peg$e50 = peg$classExpectation([["0", "9"], ["a", "f"]], false, true);
    var peg$e51 = peg$literalExpectation("\"", false);
    var peg$e52 = peg$literalExpectation("'", false);
    var peg$e53 = peg$classExpectation(["\n", "\r", "\"", "\\", ["\u2028", "\u2029"]], false, false);
    var peg$e54 = peg$classExpectation(["\n", "\r", "'", "\\", ["\u2028", "\u2029"]], false, false);
    var peg$e55 = peg$classExpectation(["\"", "'", "\\"], false, false);
    var peg$e56 = peg$literalExpectation("b", false);
    var peg$e57 = peg$literalExpectation("f", false);
    var peg$e58 = peg$literalExpectation("n", false);
    var peg$e59 = peg$literalExpectation("r", false);
    var peg$e60 = peg$literalExpectation("t", false);
    var peg$e61 = peg$literalExpectation("v", false);
    var peg$e62 = peg$classExpectation([["0", "9"], "u", "x"], false, false);
    var peg$e63 = peg$literalExpectation("x", false);
    var peg$e64 = peg$literalExpectation("u", false);
    var peg$e65 = peg$literalExpectation("/", false);
    var peg$e66 = peg$classExpectation(["*", "\\", "/", "["], false, false);
    var peg$e67 = peg$classExpectation(["\\", "/", "["], false, false);
    var peg$e68 = peg$classExpectation(["]", "\\"], false, false);
    var peg$e69 = peg$classExpectation([["a", "z"], "\xB5", ["\xDF", "\xF6"], ["\xF8", "\xFF"], "\u0101", "\u0103", "\u0105", "\u0107", "\u0109", "\u010B", "\u010D", "\u010F", "\u0111", "\u0113", "\u0115", "\u0117", "\u0119", "\u011B", "\u011D", "\u011F", "\u0121", "\u0123", "\u0125", "\u0127", "\u0129", "\u012B", "\u012D", "\u012F", "\u0131", "\u0133", "\u0135", ["\u0137", "\u0138"], "\u013A", "\u013C", "\u013E", "\u0140", "\u0142", "\u0144", "\u0146", ["\u0148", "\u0149"], "\u014B", "\u014D", "\u014F", "\u0151", "\u0153", "\u0155", "\u0157", "\u0159", "\u015B", "\u015D", "\u015F", "\u0161", "\u0163", "\u0165", "\u0167", "\u0169", "\u016B", "\u016D", "\u016F", "\u0171", "\u0173", "\u0175", "\u0177", "\u017A", "\u017C", ["\u017E", "\u0180"], "\u0183", "\u0185", "\u0188", ["\u018C", "\u018D"], "\u0192", "\u0195", ["\u0199", "\u019B"], "\u019E", "\u01A1", "\u01A3", "\u01A5", "\u01A8", ["\u01AA", "\u01AB"], "\u01AD", "\u01B0", "\u01B4", "\u01B6", ["\u01B9", "\u01BA"], ["\u01BD", "\u01BF"], "\u01C6", "\u01C9", "\u01CC", "\u01CE", "\u01D0", "\u01D2", "\u01D4", "\u01D6", "\u01D8", "\u01DA", ["\u01DC", "\u01DD"], "\u01DF", "\u01E1", "\u01E3", "\u01E5", "\u01E7", "\u01E9", "\u01EB", "\u01ED", ["\u01EF", "\u01F0"], "\u01F3", "\u01F5", "\u01F9", "\u01FB", "\u01FD", "\u01FF", "\u0201", "\u0203", "\u0205", "\u0207", "\u0209", "\u020B", "\u020D", "\u020F", "\u0211", "\u0213", "\u0215", "\u0217", "\u0219", "\u021B", "\u021D", "\u021F", "\u0221", "\u0223", "\u0225", "\u0227", "\u0229", "\u022B", "\u022D", "\u022F", "\u0231", ["\u0233", "\u0239"], "\u023C", ["\u023F", "\u0240"], "\u0242", "\u0247", "\u0249", "\u024B", "\u024D", ["\u024F", "\u0293"], ["\u0295", "\u02AF"], "\u0371", "\u0373", "\u0377", ["\u037B", "\u037D"], "\u0390", ["\u03AC", "\u03CE"], ["\u03D0", "\u03D1"], ["\u03D5", "\u03D7"], "\u03D9", "\u03DB", "\u03DD", "\u03DF", "\u03E1", "\u03E3", "\u03E5", "\u03E7", "\u03E9", "\u03EB", "\u03ED", ["\u03EF", "\u03F3"], "\u03F5", "\u03F8", ["\u03FB", "\u03FC"], ["\u0430", "\u045F"], "\u0461", "\u0463", "\u0465", "\u0467", "\u0469", "\u046B", "\u046D", "\u046F", "\u0471", "\u0473", "\u0475", "\u0477", "\u0479", "\u047B", "\u047D", "\u047F", "\u0481", "\u048B", "\u048D", "\u048F", "\u0491", "\u0493", "\u0495", "\u0497", "\u0499", "\u049B", "\u049D", "\u049F", "\u04A1", "\u04A3", "\u04A5", "\u04A7", "\u04A9", "\u04AB", "\u04AD", "\u04AF", "\u04B1", "\u04B3", "\u04B5", "\u04B7", "\u04B9", "\u04BB", "\u04BD", "\u04BF", "\u04C2", "\u04C4", "\u04C6", "\u04C8", "\u04CA", "\u04CC", ["\u04CE", "\u04CF"], "\u04D1", "\u04D3", "\u04D5", "\u04D7", "\u04D9", "\u04DB", "\u04DD", "\u04DF", "\u04E1", "\u04E3", "\u04E5", "\u04E7", "\u04E9", "\u04EB", "\u04ED", "\u04EF", "\u04F1", "\u04F3", "\u04F5", "\u04F7", "\u04F9", "\u04FB", "\u04FD", "\u04FF", "\u0501", "\u0503", "\u0505", "\u0507", "\u0509", "\u050B", "\u050D", "\u050F", "\u0511", "\u0513", "\u0515", "\u0517", "\u0519", "\u051B", "\u051D", "\u051F", "\u0521", "\u0523", "\u0525", "\u0527", "\u0529", "\u052B", "\u052D", "\u052F", ["\u0561", "\u0587"], ["\u13F8", "\u13FD"], ["\u1D00", "\u1D2B"], ["\u1D6B", "\u1D77"], ["\u1D79", "\u1D9A"], "\u1E01", "\u1E03", "\u1E05", "\u1E07", "\u1E09", "\u1E0B", "\u1E0D", "\u1E0F", "\u1E11", "\u1E13", "\u1E15", "\u1E17", "\u1E19", "\u1E1B", "\u1E1D", "\u1E1F", "\u1E21", "\u1E23", "\u1E25", "\u1E27", "\u1E29", "\u1E2B", "\u1E2D", "\u1E2F", "\u1E31", "\u1E33", "\u1E35", "\u1E37", "\u1E39", "\u1E3B", "\u1E3D", "\u1E3F", "\u1E41", "\u1E43", "\u1E45", "\u1E47", "\u1E49", "\u1E4B", "\u1E4D", "\u1E4F", "\u1E51", "\u1E53", "\u1E55", "\u1E57", "\u1E59", "\u1E5B", "\u1E5D", "\u1E5F", "\u1E61", "\u1E63", "\u1E65", "\u1E67", "\u1E69", "\u1E6B", "\u1E6D", "\u1E6F", "\u1E71", "\u1E73", "\u1E75", "\u1E77", "\u1E79", "\u1E7B", "\u1E7D", "\u1E7F", "\u1E81", "\u1E83", "\u1E85", "\u1E87", "\u1E89", "\u1E8B", "\u1E8D", "\u1E8F", "\u1E91", "\u1E93", ["\u1E95", "\u1E9D"], "\u1E9F", "\u1EA1", "\u1EA3", "\u1EA5", "\u1EA7", "\u1EA9", "\u1EAB", "\u1EAD", "\u1EAF", "\u1EB1", "\u1EB3", "\u1EB5", "\u1EB7", "\u1EB9", "\u1EBB", "\u1EBD", "\u1EBF", "\u1EC1", "\u1EC3", "\u1EC5", "\u1EC7", "\u1EC9", "\u1ECB", "\u1ECD", "\u1ECF", "\u1ED1", "\u1ED3", "\u1ED5", "\u1ED7", "\u1ED9", "\u1EDB", "\u1EDD", "\u1EDF", "\u1EE1", "\u1EE3", "\u1EE5", "\u1EE7", "\u1EE9", "\u1EEB", "\u1EED", "\u1EEF", "\u1EF1", "\u1EF3", "\u1EF5", "\u1EF7", "\u1EF9", "\u1EFB", "\u1EFD", ["\u1EFF", "\u1F07"], ["\u1F10", "\u1F15"], ["\u1F20", "\u1F27"], ["\u1F30", "\u1F37"], ["\u1F40", "\u1F45"], ["\u1F50", "\u1F57"], ["\u1F60", "\u1F67"], ["\u1F70", "\u1F7D"], ["\u1F80", "\u1F87"], ["\u1F90", "\u1F97"], ["\u1FA0", "\u1FA7"], ["\u1FB0", "\u1FB4"], ["\u1FB6", "\u1FB7"], "\u1FBE", ["\u1FC2", "\u1FC4"], ["\u1FC6", "\u1FC7"], ["\u1FD0", "\u1FD3"], ["\u1FD6", "\u1FD7"], ["\u1FE0", "\u1FE7"], ["\u1FF2", "\u1FF4"], ["\u1FF6", "\u1FF7"], "\u210A", ["\u210E", "\u210F"], "\u2113", "\u212F", "\u2134", "\u2139", ["\u213C", "\u213D"], ["\u2146", "\u2149"], "\u214E", "\u2184", ["\u2C30", "\u2C5E"], "\u2C61", ["\u2C65", "\u2C66"], "\u2C68", "\u2C6A", "\u2C6C", "\u2C71", ["\u2C73", "\u2C74"], ["\u2C76", "\u2C7B"], "\u2C81", "\u2C83", "\u2C85", "\u2C87", "\u2C89", "\u2C8B", "\u2C8D", "\u2C8F", "\u2C91", "\u2C93", "\u2C95", "\u2C97", "\u2C99", "\u2C9B", "\u2C9D", "\u2C9F", "\u2CA1", "\u2CA3", "\u2CA5", "\u2CA7", "\u2CA9", "\u2CAB", "\u2CAD", "\u2CAF", "\u2CB1", "\u2CB3", "\u2CB5", "\u2CB7", "\u2CB9", "\u2CBB", "\u2CBD", "\u2CBF", "\u2CC1", "\u2CC3", "\u2CC5", "\u2CC7", "\u2CC9", "\u2CCB", "\u2CCD", "\u2CCF", "\u2CD1", "\u2CD3", "\u2CD5", "\u2CD7", "\u2CD9", "\u2CDB", "\u2CDD", "\u2CDF", "\u2CE1", ["\u2CE3", "\u2CE4"], "\u2CEC", "\u2CEE", "\u2CF3", ["\u2D00", "\u2D25"], "\u2D27", "\u2D2D", "\uA641", "\uA643", "\uA645", "\uA647", "\uA649", "\uA64B", "\uA64D", "\uA64F", "\uA651", "\uA653", "\uA655", "\uA657", "\uA659", "\uA65B", "\uA65D", "\uA65F", "\uA661", "\uA663", "\uA665", "\uA667", "\uA669", "\uA66B", "\uA66D", "\uA681", "\uA683", "\uA685", "\uA687", "\uA689", "\uA68B", "\uA68D", "\uA68F", "\uA691", "\uA693", "\uA695", "\uA697", "\uA699", "\uA69B", "\uA723", "\uA725", "\uA727", "\uA729", "\uA72B", "\uA72D", ["\uA72F", "\uA731"], "\uA733", "\uA735", "\uA737", "\uA739", "\uA73B", "\uA73D", "\uA73F", "\uA741", "\uA743", "\uA745", "\uA747", "\uA749", "\uA74B", "\uA74D", "\uA74F", "\uA751", "\uA753", "\uA755", "\uA757", "\uA759", "\uA75B", "\uA75D", "\uA75F", "\uA761", "\uA763", "\uA765", "\uA767", "\uA769", "\uA76B", "\uA76D", "\uA76F", ["\uA771", "\uA778"], "\uA77A", "\uA77C", "\uA77F", "\uA781", "\uA783", "\uA785", "\uA787", "\uA78C", "\uA78E", "\uA791", ["\uA793", "\uA795"], "\uA797", "\uA799", "\uA79B", "\uA79D", "\uA79F", "\uA7A1", "\uA7A3", "\uA7A5", "\uA7A7", "\uA7A9", "\uA7B5", "\uA7B7", "\uA7FA", ["\uAB30", "\uAB5A"], ["\uAB60", "\uAB65"], ["\uAB70", "\uABBF"], ["\uFB00", "\uFB06"], ["\uFB13", "\uFB17"], ["\uFF41", "\uFF5A"]], false, false);
    var peg$e70 = peg$classExpectation([["\u02B0", "\u02C1"], ["\u02C6", "\u02D1"], ["\u02E0", "\u02E4"], "\u02EC", "\u02EE", "\u0374", "\u037A", "\u0559", "\u0640", ["\u06E5", "\u06E6"], ["\u07F4", "\u07F5"], "\u07FA", "\u081A", "\u0824", "\u0828", "\u0971", "\u0E46", "\u0EC6", "\u10FC", "\u17D7", "\u1843", "\u1AA7", ["\u1C78", "\u1C7D"], ["\u1D2C", "\u1D6A"], "\u1D78", ["\u1D9B", "\u1DBF"], "\u2071", "\u207F", ["\u2090", "\u209C"], ["\u2C7C", "\u2C7D"], "\u2D6F", "\u2E2F", "\u3005", ["\u3031", "\u3035"], "\u303B", ["\u309D", "\u309E"], ["\u30FC", "\u30FE"], "\uA015", ["\uA4F8", "\uA4FD"], "\uA60C", "\uA67F", ["\uA69C", "\uA69D"], ["\uA717", "\uA71F"], "\uA770", "\uA788", ["\uA7F8", "\uA7F9"], "\uA9CF", "\uA9E6", "\uAA70", "\uAADD", ["\uAAF3", "\uAAF4"], ["\uAB5C", "\uAB5F"], "\uFF70", ["\uFF9E", "\uFF9F"]], false, false);
    var peg$e71 = peg$classExpectation(["\xAA", "\xBA", "\u01BB", ["\u01C0", "\u01C3"], "\u0294", ["\u05D0", "\u05EA"], ["\u05F0", "\u05F2"], ["\u0620", "\u063F"], ["\u0641", "\u064A"], ["\u066E", "\u066F"], ["\u0671", "\u06D3"], "\u06D5", ["\u06EE", "\u06EF"], ["\u06FA", "\u06FC"], "\u06FF", "\u0710", ["\u0712", "\u072F"], ["\u074D", "\u07A5"], "\u07B1", ["\u07CA", "\u07EA"], ["\u0800", "\u0815"], ["\u0840", "\u0858"], ["\u08A0", "\u08B4"], ["\u0904", "\u0939"], "\u093D", "\u0950", ["\u0958", "\u0961"], ["\u0972", "\u0980"], ["\u0985", "\u098C"], ["\u098F", "\u0990"], ["\u0993", "\u09A8"], ["\u09AA", "\u09B0"], "\u09B2", ["\u09B6", "\u09B9"], "\u09BD", "\u09CE", ["\u09DC", "\u09DD"], ["\u09DF", "\u09E1"], ["\u09F0", "\u09F1"], ["\u0A05", "\u0A0A"], ["\u0A0F", "\u0A10"], ["\u0A13", "\u0A28"], ["\u0A2A", "\u0A30"], ["\u0A32", "\u0A33"], ["\u0A35", "\u0A36"], ["\u0A38", "\u0A39"], ["\u0A59", "\u0A5C"], "\u0A5E", ["\u0A72", "\u0A74"], ["\u0A85", "\u0A8D"], ["\u0A8F", "\u0A91"], ["\u0A93", "\u0AA8"], ["\u0AAA", "\u0AB0"], ["\u0AB2", "\u0AB3"], ["\u0AB5", "\u0AB9"], "\u0ABD", "\u0AD0", ["\u0AE0", "\u0AE1"], "\u0AF9", ["\u0B05", "\u0B0C"], ["\u0B0F", "\u0B10"], ["\u0B13", "\u0B28"], ["\u0B2A", "\u0B30"], ["\u0B32", "\u0B33"], ["\u0B35", "\u0B39"], "\u0B3D", ["\u0B5C", "\u0B5D"], ["\u0B5F", "\u0B61"], "\u0B71", "\u0B83", ["\u0B85", "\u0B8A"], ["\u0B8E", "\u0B90"], ["\u0B92", "\u0B95"], ["\u0B99", "\u0B9A"], "\u0B9C", ["\u0B9E", "\u0B9F"], ["\u0BA3", "\u0BA4"], ["\u0BA8", "\u0BAA"], ["\u0BAE", "\u0BB9"], "\u0BD0", ["\u0C05", "\u0C0C"], ["\u0C0E", "\u0C10"], ["\u0C12", "\u0C28"], ["\u0C2A", "\u0C39"], "\u0C3D", ["\u0C58", "\u0C5A"], ["\u0C60", "\u0C61"], ["\u0C85", "\u0C8C"], ["\u0C8E", "\u0C90"], ["\u0C92", "\u0CA8"], ["\u0CAA", "\u0CB3"], ["\u0CB5", "\u0CB9"], "\u0CBD", "\u0CDE", ["\u0CE0", "\u0CE1"], ["\u0CF1", "\u0CF2"], ["\u0D05", "\u0D0C"], ["\u0D0E", "\u0D10"], ["\u0D12", "\u0D3A"], "\u0D3D", "\u0D4E", ["\u0D5F", "\u0D61"], ["\u0D7A", "\u0D7F"], ["\u0D85", "\u0D96"], ["\u0D9A", "\u0DB1"], ["\u0DB3", "\u0DBB"], "\u0DBD", ["\u0DC0", "\u0DC6"], ["\u0E01", "\u0E30"], ["\u0E32", "\u0E33"], ["\u0E40", "\u0E45"], ["\u0E81", "\u0E82"], "\u0E84", ["\u0E87", "\u0E88"], "\u0E8A", "\u0E8D", ["\u0E94", "\u0E97"], ["\u0E99", "\u0E9F"], ["\u0EA1", "\u0EA3"], "\u0EA5", "\u0EA7", ["\u0EAA", "\u0EAB"], ["\u0EAD", "\u0EB0"], ["\u0EB2", "\u0EB3"], "\u0EBD", ["\u0EC0", "\u0EC4"], ["\u0EDC", "\u0EDF"], "\u0F00", ["\u0F40", "\u0F47"], ["\u0F49", "\u0F6C"], ["\u0F88", "\u0F8C"], ["\u1000", "\u102A"], "\u103F", ["\u1050", "\u1055"], ["\u105A", "\u105D"], "\u1061", ["\u1065", "\u1066"], ["\u106E", "\u1070"], ["\u1075", "\u1081"], "\u108E", ["\u10D0", "\u10FA"], ["\u10FD", "\u1248"], ["\u124A", "\u124D"], ["\u1250", "\u1256"], "\u1258", ["\u125A", "\u125D"], ["\u1260", "\u1288"], ["\u128A", "\u128D"], ["\u1290", "\u12B0"], ["\u12B2", "\u12B5"], ["\u12B8", "\u12BE"], "\u12C0", ["\u12C2", "\u12C5"], ["\u12C8", "\u12D6"], ["\u12D8", "\u1310"], ["\u1312", "\u1315"], ["\u1318", "\u135A"], ["\u1380", "\u138F"], ["\u1401", "\u166C"], ["\u166F", "\u167F"], ["\u1681", "\u169A"], ["\u16A0", "\u16EA"], ["\u16F1", "\u16F8"], ["\u1700", "\u170C"], ["\u170E", "\u1711"], ["\u1720", "\u1731"], ["\u1740", "\u1751"], ["\u1760", "\u176C"], ["\u176E", "\u1770"], ["\u1780", "\u17B3"], "\u17DC", ["\u1820", "\u1842"], ["\u1844", "\u1877"], ["\u1880", "\u18A8"], "\u18AA", ["\u18B0", "\u18F5"], ["\u1900", "\u191E"], ["\u1950", "\u196D"], ["\u1970", "\u1974"], ["\u1980", "\u19AB"], ["\u19B0", "\u19C9"], ["\u1A00", "\u1A16"], ["\u1A20", "\u1A54"], ["\u1B05", "\u1B33"], ["\u1B45", "\u1B4B"], ["\u1B83", "\u1BA0"], ["\u1BAE", "\u1BAF"], ["\u1BBA", "\u1BE5"], ["\u1C00", "\u1C23"], ["\u1C4D", "\u1C4F"], ["\u1C5A", "\u1C77"], ["\u1CE9", "\u1CEC"], ["\u1CEE", "\u1CF1"], ["\u1CF5", "\u1CF6"], ["\u2135", "\u2138"], ["\u2D30", "\u2D67"], ["\u2D80", "\u2D96"], ["\u2DA0", "\u2DA6"], ["\u2DA8", "\u2DAE"], ["\u2DB0", "\u2DB6"], ["\u2DB8", "\u2DBE"], ["\u2DC0", "\u2DC6"], ["\u2DC8", "\u2DCE"], ["\u2DD0", "\u2DD6"], ["\u2DD8", "\u2DDE"], "\u3006", "\u303C", ["\u3041", "\u3096"], "\u309F", ["\u30A1", "\u30FA"], "\u30FF", ["\u3105", "\u312D"], ["\u3131", "\u318E"], ["\u31A0", "\u31BA"], ["\u31F0", "\u31FF"], ["\u3400", "\u4DB5"], ["\u4E00", "\u9FD5"], ["\uA000", "\uA014"], ["\uA016", "\uA48C"], ["\uA4D0", "\uA4F7"], ["\uA500", "\uA60B"], ["\uA610", "\uA61F"], ["\uA62A", "\uA62B"], "\uA66E", ["\uA6A0", "\uA6E5"], "\uA78F", "\uA7F7", ["\uA7FB", "\uA801"], ["\uA803", "\uA805"], ["\uA807", "\uA80A"], ["\uA80C", "\uA822"], ["\uA840", "\uA873"], ["\uA882", "\uA8B3"], ["\uA8F2", "\uA8F7"], "\uA8FB", "\uA8FD", ["\uA90A", "\uA925"], ["\uA930", "\uA946"], ["\uA960", "\uA97C"], ["\uA984", "\uA9B2"], ["\uA9E0", "\uA9E4"], ["\uA9E7", "\uA9EF"], ["\uA9FA", "\uA9FE"], ["\uAA00", "\uAA28"], ["\uAA40", "\uAA42"], ["\uAA44", "\uAA4B"], ["\uAA60", "\uAA6F"], ["\uAA71", "\uAA76"], "\uAA7A", ["\uAA7E", "\uAAAF"], "\uAAB1", ["\uAAB5", "\uAAB6"], ["\uAAB9", "\uAABD"], "\uAAC0", "\uAAC2", ["\uAADB", "\uAADC"], ["\uAAE0", "\uAAEA"], "\uAAF2", ["\uAB01", "\uAB06"], ["\uAB09", "\uAB0E"], ["\uAB11", "\uAB16"], ["\uAB20", "\uAB26"], ["\uAB28", "\uAB2E"], ["\uABC0", "\uABE2"], ["\uAC00", "\uD7A3"], ["\uD7B0", "\uD7C6"], ["\uD7CB", "\uD7FB"], ["\uF900", "\uFA6D"], ["\uFA70", "\uFAD9"], "\uFB1D", ["\uFB1F", "\uFB28"], ["\uFB2A", "\uFB36"], ["\uFB38", "\uFB3C"], "\uFB3E", ["\uFB40", "\uFB41"], ["\uFB43", "\uFB44"], ["\uFB46", "\uFBB1"], ["\uFBD3", "\uFD3D"], ["\uFD50", "\uFD8F"], ["\uFD92", "\uFDC7"], ["\uFDF0", "\uFDFB"], ["\uFE70", "\uFE74"], ["\uFE76", "\uFEFC"], ["\uFF66", "\uFF6F"], ["\uFF71", "\uFF9D"], ["\uFFA0", "\uFFBE"], ["\uFFC2", "\uFFC7"], ["\uFFCA", "\uFFCF"], ["\uFFD2", "\uFFD7"], ["\uFFDA", "\uFFDC"]], false, false);
    var peg$e72 = peg$classExpectation(["\u01C5", "\u01C8", "\u01CB", "\u01F2", ["\u1F88", "\u1F8F"], ["\u1F98", "\u1F9F"], ["\u1FA8", "\u1FAF"], "\u1FBC", "\u1FCC", "\u1FFC"], false, false);
    var peg$e73 = peg$classExpectation([["A", "Z"], ["\xC0", "\xD6"], ["\xD8", "\xDE"], "\u0100", "\u0102", "\u0104", "\u0106", "\u0108", "\u010A", "\u010C", "\u010E", "\u0110", "\u0112", "\u0114", "\u0116", "\u0118", "\u011A", "\u011C", "\u011E", "\u0120", "\u0122", "\u0124", "\u0126", "\u0128", "\u012A", "\u012C", "\u012E", "\u0130", "\u0132", "\u0134", "\u0136", "\u0139", "\u013B", "\u013D", "\u013F", "\u0141", "\u0143", "\u0145", "\u0147", "\u014A", "\u014C", "\u014E", "\u0150", "\u0152", "\u0154", "\u0156", "\u0158", "\u015A", "\u015C", "\u015E", "\u0160", "\u0162", "\u0164", "\u0166", "\u0168", "\u016A", "\u016C", "\u016E", "\u0170", "\u0172", "\u0174", "\u0176", ["\u0178", "\u0179"], "\u017B", "\u017D", ["\u0181", "\u0182"], "\u0184", ["\u0186", "\u0187"], ["\u0189", "\u018B"], ["\u018E", "\u0191"], ["\u0193", "\u0194"], ["\u0196", "\u0198"], ["\u019C", "\u019D"], ["\u019F", "\u01A0"], "\u01A2", "\u01A4", ["\u01A6", "\u01A7"], "\u01A9", "\u01AC", ["\u01AE", "\u01AF"], ["\u01B1", "\u01B3"], "\u01B5", ["\u01B7", "\u01B8"], "\u01BC", "\u01C4", "\u01C7", "\u01CA", "\u01CD", "\u01CF", "\u01D1", "\u01D3", "\u01D5", "\u01D7", "\u01D9", "\u01DB", "\u01DE", "\u01E0", "\u01E2", "\u01E4", "\u01E6", "\u01E8", "\u01EA", "\u01EC", "\u01EE", "\u01F1", "\u01F4", ["\u01F6", "\u01F8"], "\u01FA", "\u01FC", "\u01FE", "\u0200", "\u0202", "\u0204", "\u0206", "\u0208", "\u020A", "\u020C", "\u020E", "\u0210", "\u0212", "\u0214", "\u0216", "\u0218", "\u021A", "\u021C", "\u021E", "\u0220", "\u0222", "\u0224", "\u0226", "\u0228", "\u022A", "\u022C", "\u022E", "\u0230", "\u0232", ["\u023A", "\u023B"], ["\u023D", "\u023E"], "\u0241", ["\u0243", "\u0246"], "\u0248", "\u024A", "\u024C", "\u024E", "\u0370", "\u0372", "\u0376", "\u037F", "\u0386", ["\u0388", "\u038A"], "\u038C", ["\u038E", "\u038F"], ["\u0391", "\u03A1"], ["\u03A3", "\u03AB"], "\u03CF", ["\u03D2", "\u03D4"], "\u03D8", "\u03DA", "\u03DC", "\u03DE", "\u03E0", "\u03E2", "\u03E4", "\u03E6", "\u03E8", "\u03EA", "\u03EC", "\u03EE", "\u03F4", "\u03F7", ["\u03F9", "\u03FA"], ["\u03FD", "\u042F"], "\u0460", "\u0462", "\u0464", "\u0466", "\u0468", "\u046A", "\u046C", "\u046E", "\u0470", "\u0472", "\u0474", "\u0476", "\u0478", "\u047A", "\u047C", "\u047E", "\u0480", "\u048A", "\u048C", "\u048E", "\u0490", "\u0492", "\u0494", "\u0496", "\u0498", "\u049A", "\u049C", "\u049E", "\u04A0", "\u04A2", "\u04A4", "\u04A6", "\u04A8", "\u04AA", "\u04AC", "\u04AE", "\u04B0", "\u04B2", "\u04B4", "\u04B6", "\u04B8", "\u04BA", "\u04BC", "\u04BE", ["\u04C0", "\u04C1"], "\u04C3", "\u04C5", "\u04C7", "\u04C9", "\u04CB", "\u04CD", "\u04D0", "\u04D2", "\u04D4", "\u04D6", "\u04D8", "\u04DA", "\u04DC", "\u04DE", "\u04E0", "\u04E2", "\u04E4", "\u04E6", "\u04E8", "\u04EA", "\u04EC", "\u04EE", "\u04F0", "\u04F2", "\u04F4", "\u04F6", "\u04F8", "\u04FA", "\u04FC", "\u04FE", "\u0500", "\u0502", "\u0504", "\u0506", "\u0508", "\u050A", "\u050C", "\u050E", "\u0510", "\u0512", "\u0514", "\u0516", "\u0518", "\u051A", "\u051C", "\u051E", "\u0520", "\u0522", "\u0524", "\u0526", "\u0528", "\u052A", "\u052C", "\u052E", ["\u0531", "\u0556"], ["\u10A0", "\u10C5"], "\u10C7", "\u10CD", ["\u13A0", "\u13F5"], "\u1E00", "\u1E02", "\u1E04", "\u1E06", "\u1E08", "\u1E0A", "\u1E0C", "\u1E0E", "\u1E10", "\u1E12", "\u1E14", "\u1E16", "\u1E18", "\u1E1A", "\u1E1C", "\u1E1E", "\u1E20", "\u1E22", "\u1E24", "\u1E26", "\u1E28", "\u1E2A", "\u1E2C", "\u1E2E", "\u1E30", "\u1E32", "\u1E34", "\u1E36", "\u1E38", "\u1E3A", "\u1E3C", "\u1E3E", "\u1E40", "\u1E42", "\u1E44", "\u1E46", "\u1E48", "\u1E4A", "\u1E4C", "\u1E4E", "\u1E50", "\u1E52", "\u1E54", "\u1E56", "\u1E58", "\u1E5A", "\u1E5C", "\u1E5E", "\u1E60", "\u1E62", "\u1E64", "\u1E66", "\u1E68", "\u1E6A", "\u1E6C", "\u1E6E", "\u1E70", "\u1E72", "\u1E74", "\u1E76", "\u1E78", "\u1E7A", "\u1E7C", "\u1E7E", "\u1E80", "\u1E82", "\u1E84", "\u1E86", "\u1E88", "\u1E8A", "\u1E8C", "\u1E8E", "\u1E90", "\u1E92", "\u1E94", "\u1E9E", "\u1EA0", "\u1EA2", "\u1EA4", "\u1EA6", "\u1EA8", "\u1EAA", "\u1EAC", "\u1EAE", "\u1EB0", "\u1EB2", "\u1EB4", "\u1EB6", "\u1EB8", "\u1EBA", "\u1EBC", "\u1EBE", "\u1EC0", "\u1EC2", "\u1EC4", "\u1EC6", "\u1EC8", "\u1ECA", "\u1ECC", "\u1ECE", "\u1ED0", "\u1ED2", "\u1ED4", "\u1ED6", "\u1ED8", "\u1EDA", "\u1EDC", "\u1EDE", "\u1EE0", "\u1EE2", "\u1EE4", "\u1EE6", "\u1EE8", "\u1EEA", "\u1EEC", "\u1EEE", "\u1EF0", "\u1EF2", "\u1EF4", "\u1EF6", "\u1EF8", "\u1EFA", "\u1EFC", "\u1EFE", ["\u1F08", "\u1F0F"], ["\u1F18", "\u1F1D"], ["\u1F28", "\u1F2F"], ["\u1F38", "\u1F3F"], ["\u1F48", "\u1F4D"], "\u1F59", "\u1F5B", "\u1F5D", "\u1F5F", ["\u1F68", "\u1F6F"], ["\u1FB8", "\u1FBB"], ["\u1FC8", "\u1FCB"], ["\u1FD8", "\u1FDB"], ["\u1FE8", "\u1FEC"], ["\u1FF8", "\u1FFB"], "\u2102", "\u2107", ["\u210B", "\u210D"], ["\u2110", "\u2112"], "\u2115", ["\u2119", "\u211D"], "\u2124", "\u2126", "\u2128", ["\u212A", "\u212D"], ["\u2130", "\u2133"], ["\u213E", "\u213F"], "\u2145", "\u2183", ["\u2C00", "\u2C2E"], "\u2C60", ["\u2C62", "\u2C64"], "\u2C67", "\u2C69", "\u2C6B", ["\u2C6D", "\u2C70"], "\u2C72", "\u2C75", ["\u2C7E", "\u2C80"], "\u2C82", "\u2C84", "\u2C86", "\u2C88", "\u2C8A", "\u2C8C", "\u2C8E", "\u2C90", "\u2C92", "\u2C94", "\u2C96", "\u2C98", "\u2C9A", "\u2C9C", "\u2C9E", "\u2CA0", "\u2CA2", "\u2CA4", "\u2CA6", "\u2CA8", "\u2CAA", "\u2CAC", "\u2CAE", "\u2CB0", "\u2CB2", "\u2CB4", "\u2CB6", "\u2CB8", "\u2CBA", "\u2CBC", "\u2CBE", "\u2CC0", "\u2CC2", "\u2CC4", "\u2CC6", "\u2CC8", "\u2CCA", "\u2CCC", "\u2CCE", "\u2CD0", "\u2CD2", "\u2CD4", "\u2CD6", "\u2CD8", "\u2CDA", "\u2CDC", "\u2CDE", "\u2CE0", "\u2CE2", "\u2CEB", "\u2CED", "\u2CF2", "\uA640", "\uA642", "\uA644", "\uA646", "\uA648", "\uA64A", "\uA64C", "\uA64E", "\uA650", "\uA652", "\uA654", "\uA656", "\uA658", "\uA65A", "\uA65C", "\uA65E", "\uA660", "\uA662", "\uA664", "\uA666", "\uA668", "\uA66A", "\uA66C", "\uA680", "\uA682", "\uA684", "\uA686", "\uA688", "\uA68A", "\uA68C", "\uA68E", "\uA690", "\uA692", "\uA694", "\uA696", "\uA698", "\uA69A", "\uA722", "\uA724", "\uA726", "\uA728", "\uA72A", "\uA72C", "\uA72E", "\uA732", "\uA734", "\uA736", "\uA738", "\uA73A", "\uA73C", "\uA73E", "\uA740", "\uA742", "\uA744", "\uA746", "\uA748", "\uA74A", "\uA74C", "\uA74E", "\uA750", "\uA752", "\uA754", "\uA756", "\uA758", "\uA75A", "\uA75C", "\uA75E", "\uA760", "\uA762", "\uA764", "\uA766", "\uA768", "\uA76A", "\uA76C", "\uA76E", "\uA779", "\uA77B", ["\uA77D", "\uA77E"], "\uA780", "\uA782", "\uA784", "\uA786", "\uA78B", "\uA78D", "\uA790", "\uA792", "\uA796", "\uA798", "\uA79A", "\uA79C", "\uA79E", "\uA7A0", "\uA7A2", "\uA7A4", "\uA7A6", "\uA7A8", ["\uA7AA", "\uA7AD"], ["\uA7B0", "\uA7B4"], "\uA7B6", ["\uFF21", "\uFF3A"]], false, false);
    var peg$e74 = peg$classExpectation(["\u0903", "\u093B", ["\u093E", "\u0940"], ["\u0949", "\u094C"], ["\u094E", "\u094F"], ["\u0982", "\u0983"], ["\u09BE", "\u09C0"], ["\u09C7", "\u09C8"], ["\u09CB", "\u09CC"], "\u09D7", "\u0A03", ["\u0A3E", "\u0A40"], "\u0A83", ["\u0ABE", "\u0AC0"], "\u0AC9", ["\u0ACB", "\u0ACC"], ["\u0B02", "\u0B03"], "\u0B3E", "\u0B40", ["\u0B47", "\u0B48"], ["\u0B4B", "\u0B4C"], "\u0B57", ["\u0BBE", "\u0BBF"], ["\u0BC1", "\u0BC2"], ["\u0BC6", "\u0BC8"], ["\u0BCA", "\u0BCC"], "\u0BD7", ["\u0C01", "\u0C03"], ["\u0C41", "\u0C44"], ["\u0C82", "\u0C83"], "\u0CBE", ["\u0CC0", "\u0CC4"], ["\u0CC7", "\u0CC8"], ["\u0CCA", "\u0CCB"], ["\u0CD5", "\u0CD6"], ["\u0D02", "\u0D03"], ["\u0D3E", "\u0D40"], ["\u0D46", "\u0D48"], ["\u0D4A", "\u0D4C"], "\u0D57", ["\u0D82", "\u0D83"], ["\u0DCF", "\u0DD1"], ["\u0DD8", "\u0DDF"], ["\u0DF2", "\u0DF3"], ["\u0F3E", "\u0F3F"], "\u0F7F", ["\u102B", "\u102C"], "\u1031", "\u1038", ["\u103B", "\u103C"], ["\u1056", "\u1057"], ["\u1062", "\u1064"], ["\u1067", "\u106D"], ["\u1083", "\u1084"], ["\u1087", "\u108C"], "\u108F", ["\u109A", "\u109C"], "\u17B6", ["\u17BE", "\u17C5"], ["\u17C7", "\u17C8"], ["\u1923", "\u1926"], ["\u1929", "\u192B"], ["\u1930", "\u1931"], ["\u1933", "\u1938"], ["\u1A19", "\u1A1A"], "\u1A55", "\u1A57", "\u1A61", ["\u1A63", "\u1A64"], ["\u1A6D", "\u1A72"], "\u1B04", "\u1B35", "\u1B3B", ["\u1B3D", "\u1B41"], ["\u1B43", "\u1B44"], "\u1B82", "\u1BA1", ["\u1BA6", "\u1BA7"], "\u1BAA", "\u1BE7", ["\u1BEA", "\u1BEC"], "\u1BEE", ["\u1BF2", "\u1BF3"], ["\u1C24", "\u1C2B"], ["\u1C34", "\u1C35"], "\u1CE1", ["\u1CF2", "\u1CF3"], ["\u302E", "\u302F"], ["\uA823", "\uA824"], "\uA827", ["\uA880", "\uA881"], ["\uA8B4", "\uA8C3"], ["\uA952", "\uA953"], "\uA983", ["\uA9B4", "\uA9B5"], ["\uA9BA", "\uA9BB"], ["\uA9BD", "\uA9C0"], ["\uAA2F", "\uAA30"], ["\uAA33", "\uAA34"], "\uAA4D", "\uAA7B", "\uAA7D", "\uAAEB", ["\uAAEE", "\uAAEF"], "\uAAF5", ["\uABE3", "\uABE4"], ["\uABE6", "\uABE7"], ["\uABE9", "\uABEA"], "\uABEC"], false, false);
    var peg$e75 = peg$classExpectation([["\u0300", "\u036F"], ["\u0483", "\u0487"], ["\u0591", "\u05BD"], "\u05BF", ["\u05C1", "\u05C2"], ["\u05C4", "\u05C5"], "\u05C7", ["\u0610", "\u061A"], ["\u064B", "\u065F"], "\u0670", ["\u06D6", "\u06DC"], ["\u06DF", "\u06E4"], ["\u06E7", "\u06E8"], ["\u06EA", "\u06ED"], "\u0711", ["\u0730", "\u074A"], ["\u07A6", "\u07B0"], ["\u07EB", "\u07F3"], ["\u0816", "\u0819"], ["\u081B", "\u0823"], ["\u0825", "\u0827"], ["\u0829", "\u082D"], ["\u0859", "\u085B"], ["\u08E3", "\u0902"], "\u093A", "\u093C", ["\u0941", "\u0948"], "\u094D", ["\u0951", "\u0957"], ["\u0962", "\u0963"], "\u0981", "\u09BC", ["\u09C1", "\u09C4"], "\u09CD", ["\u09E2", "\u09E3"], ["\u0A01", "\u0A02"], "\u0A3C", ["\u0A41", "\u0A42"], ["\u0A47", "\u0A48"], ["\u0A4B", "\u0A4D"], "\u0A51", ["\u0A70", "\u0A71"], "\u0A75", ["\u0A81", "\u0A82"], "\u0ABC", ["\u0AC1", "\u0AC5"], ["\u0AC7", "\u0AC8"], "\u0ACD", ["\u0AE2", "\u0AE3"], "\u0B01", "\u0B3C", "\u0B3F", ["\u0B41", "\u0B44"], "\u0B4D", "\u0B56", ["\u0B62", "\u0B63"], "\u0B82", "\u0BC0", "\u0BCD", "\u0C00", ["\u0C3E", "\u0C40"], ["\u0C46", "\u0C48"], ["\u0C4A", "\u0C4D"], ["\u0C55", "\u0C56"], ["\u0C62", "\u0C63"], "\u0C81", "\u0CBC", "\u0CBF", "\u0CC6", ["\u0CCC", "\u0CCD"], ["\u0CE2", "\u0CE3"], "\u0D01", ["\u0D41", "\u0D44"], "\u0D4D", ["\u0D62", "\u0D63"], "\u0DCA", ["\u0DD2", "\u0DD4"], "\u0DD6", "\u0E31", ["\u0E34", "\u0E3A"], ["\u0E47", "\u0E4E"], "\u0EB1", ["\u0EB4", "\u0EB9"], ["\u0EBB", "\u0EBC"], ["\u0EC8", "\u0ECD"], ["\u0F18", "\u0F19"], "\u0F35", "\u0F37", "\u0F39", ["\u0F71", "\u0F7E"], ["\u0F80", "\u0F84"], ["\u0F86", "\u0F87"], ["\u0F8D", "\u0F97"], ["\u0F99", "\u0FBC"], "\u0FC6", ["\u102D", "\u1030"], ["\u1032", "\u1037"], ["\u1039", "\u103A"], ["\u103D", "\u103E"], ["\u1058", "\u1059"], ["\u105E", "\u1060"], ["\u1071", "\u1074"], "\u1082", ["\u1085", "\u1086"], "\u108D", "\u109D", ["\u135D", "\u135F"], ["\u1712", "\u1714"], ["\u1732", "\u1734"], ["\u1752", "\u1753"], ["\u1772", "\u1773"], ["\u17B4", "\u17B5"], ["\u17B7", "\u17BD"], "\u17C6", ["\u17C9", "\u17D3"], "\u17DD", ["\u180B", "\u180D"], "\u18A9", ["\u1920", "\u1922"], ["\u1927", "\u1928"], "\u1932", ["\u1939", "\u193B"], ["\u1A17", "\u1A18"], "\u1A1B", "\u1A56", ["\u1A58", "\u1A5E"], "\u1A60", "\u1A62", ["\u1A65", "\u1A6C"], ["\u1A73", "\u1A7C"], "\u1A7F", ["\u1AB0", "\u1ABD"], ["\u1B00", "\u1B03"], "\u1B34", ["\u1B36", "\u1B3A"], "\u1B3C", "\u1B42", ["\u1B6B", "\u1B73"], ["\u1B80", "\u1B81"], ["\u1BA2", "\u1BA5"], ["\u1BA8", "\u1BA9"], ["\u1BAB", "\u1BAD"], "\u1BE6", ["\u1BE8", "\u1BE9"], "\u1BED", ["\u1BEF", "\u1BF1"], ["\u1C2C", "\u1C33"], ["\u1C36", "\u1C37"], ["\u1CD0", "\u1CD2"], ["\u1CD4", "\u1CE0"], ["\u1CE2", "\u1CE8"], "\u1CED", "\u1CF4", ["\u1CF8", "\u1CF9"], ["\u1DC0", "\u1DF5"], ["\u1DFC", "\u1DFF"], ["\u20D0", "\u20DC"], "\u20E1", ["\u20E5", "\u20F0"], ["\u2CEF", "\u2CF1"], "\u2D7F", ["\u2DE0", "\u2DFF"], ["\u302A", "\u302D"], ["\u3099", "\u309A"], "\uA66F", ["\uA674", "\uA67D"], ["\uA69E", "\uA69F"], ["\uA6F0", "\uA6F1"], "\uA802", "\uA806", "\uA80B", ["\uA825", "\uA826"], "\uA8C4", ["\uA8E0", "\uA8F1"], ["\uA926", "\uA92D"], ["\uA947", "\uA951"], ["\uA980", "\uA982"], "\uA9B3", ["\uA9B6", "\uA9B9"], "\uA9BC", "\uA9E5", ["\uAA29", "\uAA2E"], ["\uAA31", "\uAA32"], ["\uAA35", "\uAA36"], "\uAA43", "\uAA4C", "\uAA7C", "\uAAB0", ["\uAAB2", "\uAAB4"], ["\uAAB7", "\uAAB8"], ["\uAABE", "\uAABF"], "\uAAC1", ["\uAAEC", "\uAAED"], "\uAAF6", "\uABE5", "\uABE8", "\uABED", "\uFB1E", ["\uFE00", "\uFE0F"], ["\uFE20", "\uFE2F"]], false, false);
    var peg$e76 = peg$classExpectation([["0", "9"], ["\u0660", "\u0669"], ["\u06F0", "\u06F9"], ["\u07C0", "\u07C9"], ["\u0966", "\u096F"], ["\u09E6", "\u09EF"], ["\u0A66", "\u0A6F"], ["\u0AE6", "\u0AEF"], ["\u0B66", "\u0B6F"], ["\u0BE6", "\u0BEF"], ["\u0C66", "\u0C6F"], ["\u0CE6", "\u0CEF"], ["\u0D66", "\u0D6F"], ["\u0DE6", "\u0DEF"], ["\u0E50", "\u0E59"], ["\u0ED0", "\u0ED9"], ["\u0F20", "\u0F29"], ["\u1040", "\u1049"], ["\u1090", "\u1099"], ["\u17E0", "\u17E9"], ["\u1810", "\u1819"], ["\u1946", "\u194F"], ["\u19D0", "\u19D9"], ["\u1A80", "\u1A89"], ["\u1A90", "\u1A99"], ["\u1B50", "\u1B59"], ["\u1BB0", "\u1BB9"], ["\u1C40", "\u1C49"], ["\u1C50", "\u1C59"], ["\uA620", "\uA629"], ["\uA8D0", "\uA8D9"], ["\uA900", "\uA909"], ["\uA9D0", "\uA9D9"], ["\uA9F0", "\uA9F9"], ["\uAA50", "\uAA59"], ["\uABF0", "\uABF9"], ["\uFF10", "\uFF19"]], false, false);
    var peg$e77 = peg$classExpectation([["\u16EE", "\u16F0"], ["\u2160", "\u2182"], ["\u2185", "\u2188"], "\u3007", ["\u3021", "\u3029"], ["\u3038", "\u303A"], ["\uA6E6", "\uA6EF"]], false, false);
    var peg$e78 = peg$classExpectation(["_", ["\u203F", "\u2040"], "\u2054", ["\uFE33", "\uFE34"], ["\uFE4D", "\uFE4F"], "\uFF3F"], false, false);
    var peg$e79 = peg$classExpectation([" ", "\xA0", "\u1680", ["\u2000", "\u200A"], "\u202F", "\u205F", "\u3000"], false, false);
    var peg$e80 = peg$literalExpectation(";", false);
    var peg$f0 = function (e) {
        return e;
    };
    var peg$f1 = function (head, tail) {
        return buildGenBinaryExpression(head, tail, adt_js_1.Adt.Path, 3, loc(location()));
    };
    var peg$f2 = function (e1, e2) {
        return {
            type: adt_js_1.Adt.Filter,
            e: e1,
            filter: {
                type: adt_js_1.Adt.FilterDef,
                e: e2,
                loc: e2.loc
            },
            loc: loc(location())
        };
    };
    var peg$f3 = function (e1, e2) {
        return {
            type: adt_js_1.Adt.Path,
            left: e1,
            right: {
                type: adt_js_1.Adt.Subscript,
                idx: e2,
                loc: e2.loc
            },
            loc: loc(location())
        };
    };
    var peg$f4 = function (e) {
        return e;
    };
    var peg$f5 = function (id) {
        return {
            type: adt_js_1.Adt.Property,
            name: id.name,
            loc: loc(location())
        };
    };
    var peg$f6 = function (s) {
        return {
            type: adt_js_1.Adt.Property,
            name: s.value,
            loc: loc(location())
        };
    };
    var peg$f7 = function (e) {
        return {
            type: adt_js_1.Adt.PropertyRegex,
            regex: e,
            loc: loc(location())
        };
    };
    var peg$f8 = function () {
        return {
            type: adt_js_1.Adt.Children,
            loc: loc(location())
        };
    };
    var peg$f9 = function (t) {
        return {
            type: adt_js_1.Adt.Self,
            loc: loc(location())
        };
    };
    var peg$f10 = function (id, el) {
        return {
            type: adt_js_1.Adt.Func,
            name: id.name,
            arguments: el,
            loc: loc(location())
        };
    };
    var peg$f11 = function (head, tail) {
        return buildGenBinaryExpression(head, tail, adt_js_1.Adt.ArgumentList, 3, loc(location()));
    };
    var peg$f12 = function (propertyAssignments) {
        return {
            type: "ObjectExpression",
            propertyAssignments: propertyAssignments,
            loc: loc(location())
        };
    };
    var peg$f13 = function (head, tail) {
        return buildGenBinaryExpression(head, tail, adt_js_1.Adt.PropertyAssignmentList, 3, loc(location()));
    };
    var peg$f14 = function (name, value) {
        return name !== null ? {
            type: "NamedAssignment",
            key: name[0],
            value: value,
            loc: loc(location())
        }
            :
                {
                    type: "EmbeddingExpression",
                    e: value,
                    loc: loc(location())
                };
    };
    var peg$f15 = function (id) {
        return {
            type: adt_js_1.Adt.Property,
            name: id.name,
            loc: loc(location())
        };
    };
    var peg$f16 = function (s) {
        return {
            type: adt_js_1.Adt.Property,
            name: s.value,
            loc: loc(location())
        };
    };
    var peg$f17 = function (e) {
        return {
            type: "PropertyNameExpression",
            e: e,
            loc: loc(location())
        };
    };
    var peg$f18 = function (el) {
        return {
            type: "ArrayExpression",
            elements: el,
            loc: loc(location())
        };
    };
    var peg$f19 = function (head, tail) {
        return buildGenBinaryExpression(head, tail, adt_js_1.Adt.ElementList, 3, loc(location()));
    };
    var peg$f20 = function (head, tail) {
        return buildGenBinaryExpression(head, tail, adt_js_1.Adt.SequencedExpression, 3, loc(location()));
    };
    var peg$f21 = function (cond, thenPart, elsePart) {
        return {
            type: adt_js_1.Adt.Conditional,
            condition: cond,
            thenPart: thenPart,
            // elsePart: elsePart ? elsePart[2] : undefined
            elsePart: elsePart == null ? undefined : elsePart,
            loc: loc(location())
        };
    };
    var peg$f22 = function (head, tail) {
        return buildLogicalExpression(head, tail, loc(location()));
    };
    var peg$f23 = function (head, tail) {
        return buildLogicalExpression(head, tail, loc(location()));
    };
    var peg$f24 = function (head, tail) {
        return buildBinaryExpression(head, tail, loc(location()));
    };
    var peg$f25 = function (head, tail) {
        return buildBinaryExpression(head, tail, loc(location()));
    };
    var peg$f26 = function (operator, argument) {
        var type = (operator === "+" || operator === "-")
            ? "..."
            : "UnaryLogicalExpression";
        return {
            type: type,
            operator: operator,
            e: argument
            // ,
            // prefix: true
        };
    };
    var peg$f27 = function () {
        return 'not';
    };
    var peg$f28 = function (name) { return name; };
    var peg$f29 = function (head, tail) {
        return {
            type: "Identifier",
            name: head + tail.join("")
        };
    };
    var peg$f30 = function (sequence) { return sequence; };
    var peg$f31 = function () { return { type: "Literal", value: null }; };
    var peg$f32 = function () { return { type: "Literal", value: true }; };
    var peg$f33 = function () { return { type: "Literal", value: false }; };
    var peg$f34 = function (literal) {
        return literal;
    };
    var peg$f35 = function (literal) {
        return literal;
    };
    var peg$f36 = function () {
        return { type: "Literal", value: parseFloat(text()) };
    };
    var peg$f37 = function () {
        return { type: "Literal", value: parseFloat(text()) };
    };
    var peg$f38 = function () {
        return { type: "Literal", value: parseFloat(text()) };
    };
    var peg$f39 = function (digits) {
        return { type: "Literal", value: parseInt(digits, 16) };
    };
    var peg$f40 = function (chars) {
        return { type: "Literal", value: chars.join("") };
    };
    var peg$f41 = function (chars) {
        return { type: "Literal", value: chars.join("") };
    };
    var peg$f42 = function () { return text(); };
    var peg$f43 = function (sequence) { return sequence; };
    var peg$f44 = function () { return text(); };
    var peg$f45 = function (sequence) { return sequence; };
    var peg$f46 = function () { return ""; };
    var peg$f47 = function () { return "\0"; };
    var peg$f48 = function () { return "\b"; };
    var peg$f49 = function () { return "\f"; };
    var peg$f50 = function () { return "\n"; };
    var peg$f51 = function () { return "\r"; };
    var peg$f52 = function () { return "\t"; };
    var peg$f53 = function () { return "\v"; };
    var peg$f54 = function () { return text(); };
    var peg$f55 = function (digits) {
        return String.fromCharCode(parseInt(digits, 16));
    };
    var peg$f56 = function (digits) {
        return String.fromCharCode(parseInt(digits, 16));
    };
    var peg$f57 = function (pattern) {
        // var value;
        // try {
        //   value = new RegExp(pattern, flags);
        // } catch (e) {
        //   error(e.message);
        // }
        return { type: "Literal", value: pattern };
    };
    var peg$f58 = function () { return null; };
    var peg$currPos = options.peg$currPos | 0;
    var peg$savedPos = peg$currPos;
    var peg$posDetailsCache = [{ line: 1, column: 1 }];
    var peg$maxFailPos = peg$currPos;
    var peg$maxFailExpected = options.peg$maxFailExpected || [];
    var peg$silentFails = options.peg$silentFails | 0;
    var peg$result;
    if (options.startRule) {
        if (!(options.startRule in peg$startRuleFunctions)) {
            throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
        }
        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
    function text() {
        return input.substring(peg$savedPos, peg$currPos);
    }
    function offset() {
        return peg$savedPos;
    }
    function range() {
        return {
            source: peg$source,
            start: peg$savedPos,
            end: peg$currPos
        };
    }
    function location() {
        return peg$computeLocation(peg$savedPos, peg$currPos);
    }
    function expected(description, location) {
        location = location !== undefined
            ? location
            : peg$computeLocation(peg$savedPos, peg$currPos);
        throw peg$buildStructuredError([peg$otherExpectation(description)], input.substring(peg$savedPos, peg$currPos), location);
    }
    function error(message, location) {
        location = location !== undefined
            ? location
            : peg$computeLocation(peg$savedPos, peg$currPos);
        throw peg$buildSimpleError(message, location);
    }
    function peg$literalExpectation(text, ignoreCase) {
        return { type: "literal", text: text, ignoreCase: ignoreCase };
    }
    function peg$classExpectation(parts, inverted, ignoreCase) {
        return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
    }
    function peg$anyExpectation() {
        return { type: "any" };
    }
    function peg$endExpectation() {
        return { type: "end" };
    }
    function peg$otherExpectation(description) {
        return { type: "other", description: description };
    }
    function peg$computePosDetails(pos) {
        var details = peg$posDetailsCache[pos];
        var p;
        if (details) {
            return details;
        }
        else {
            if (pos >= peg$posDetailsCache.length) {
                p = peg$posDetailsCache.length - 1;
            }
            else {
                p = pos;
                while (!peg$posDetailsCache[--p]) { }
            }
            details = peg$posDetailsCache[p];
            details = {
                line: details.line,
                column: details.column
            };
            while (p < pos) {
                if (input.charCodeAt(p) === 10) {
                    details.line++;
                    details.column = 1;
                }
                else {
                    details.column++;
                }
                p++;
            }
            peg$posDetailsCache[pos] = details;
            return details;
        }
    }
    function peg$computeLocation(startPos, endPos, offset) {
        var startPosDetails = peg$computePosDetails(startPos);
        var endPosDetails = peg$computePosDetails(endPos);
        var res = {
            source: peg$source,
            start: {
                offset: startPos,
                line: startPosDetails.line,
                column: startPosDetails.column
            },
            end: {
                offset: endPos,
                line: endPosDetails.line,
                column: endPosDetails.column
            }
        };
        if (offset && peg$source && (typeof peg$source.offset === "function")) {
            res.start = peg$source.offset(res.start);
            res.end = peg$source.offset(res.end);
        }
        return res;
    }
    function peg$fail(expected) {
        if (peg$currPos < peg$maxFailPos) {
            return;
        }
        if (peg$currPos > peg$maxFailPos) {
            peg$maxFailPos = peg$currPos;
            peg$maxFailExpected = [];
        }
        peg$maxFailExpected.push(expected);
    }
    function peg$buildSimpleError(message, location) {
        return new peg$SyntaxError(message, null, null, location);
    }
    function peg$buildStructuredError(expected, found, location) {
        return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
    }
    function peg$parseStart() {
        var s0, s1, s2, s3, s4;
        s0 = peg$currPos;
        s1 = peg$parse__();
        s2 = peg$parseSequencedExpression();
        if (s2 === peg$FAILED) {
            s2 = null;
        }
        s3 = peg$parse__();
        s4 = peg$parseEOF();
        if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f0(s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsePath() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseCompositeStep();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 46) {
                s5 = peg$c0;
                peg$currPos++;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e0);
                }
            }
            if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                s7 = peg$parseCompositeStep();
                if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 46) {
                    s5 = peg$c0;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e0);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseCompositeStep();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f1(s1, s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseCompositeStep() {
        var s0;
        s0 = peg$parseFilter();
        if (s0 === peg$FAILED) {
            s0 = peg$parseSubscript();
            if (s0 === peg$FAILED) {
                s0 = peg$parseBasicStep();
            }
        }
        return s0;
    }
    function peg$parseFilter() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
        s0 = peg$currPos;
        s1 = peg$parseBasicStep();
        if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 63) {
                s3 = peg$c1;
                peg$currPos++;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e1);
                }
            }
            if (s3 !== peg$FAILED) {
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 40) {
                    s5 = peg$c2;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e2);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseSequencedExpression();
                    if (s7 !== peg$FAILED) {
                        s8 = peg$parse__();
                        if (input.charCodeAt(peg$currPos) === 41) {
                            s9 = peg$c3;
                            peg$currPos++;
                        }
                        else {
                            s9 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e3);
                            }
                        }
                        if (s9 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f2(s1, s7);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseSubscript() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseBasicStep();
        if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 91) {
                s3 = peg$c4;
                peg$currPos++;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e4);
                }
            }
            if (s3 !== peg$FAILED) {
                s4 = peg$parse__();
                s5 = peg$parseSequencedExpression();
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 93) {
                        s7 = peg$c5;
                        peg$currPos++;
                    }
                    else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e5);
                        }
                    }
                    if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f3(s1, s5);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseBasicStep() {
        var s0, s1, s2, s3, s4, s5;
        s0 = peg$parseStepFunctionCall();
        if (s0 === peg$FAILED) {
            s0 = peg$parseProperty();
            if (s0 === peg$FAILED) {
                s0 = peg$parseChildren();
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 40) {
                        s1 = peg$c2;
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e2);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parse__();
                        s3 = peg$parseSequencedExpression();
                        if (s3 !== peg$FAILED) {
                            s4 = peg$parse__();
                            if (input.charCodeAt(peg$currPos) === 41) {
                                s5 = peg$c3;
                                peg$currPos++;
                            }
                            else {
                                s5 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e3);
                                }
                            }
                            if (s5 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f4(s3);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseSelf();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parseConstruction();
                        }
                    }
                }
            }
        }
        return s0;
    }
    function peg$parseProperty() {
        var s0, s1;
        s0 = peg$currPos;
        s1 = peg$parseIdentifier();
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f5(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseStringLiteral();
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f6(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseRegularExpressionLiteral();
                if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f7(s1);
                }
                s0 = s1;
            }
        }
        return s0;
    }
    function peg$parseChildren() {
        var s0, s1;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 42) {
            s1 = peg$c6;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e6);
            }
        }
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f8();
        }
        s0 = s1;
        return s0;
    }
    function peg$parseSelf() {
        var s0, s1, s2, s3, s4;
        s0 = peg$currPos;
        s1 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c7) {
            s2 = peg$c7;
            peg$currPos += 4;
        }
        else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e7);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            peg$silentFails++;
            s4 = peg$parseIdentifierPart();
            peg$silentFails--;
            if (s4 === peg$FAILED) {
                s3 = undefined;
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 === peg$FAILED) {
            s1 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 95) {
                s2 = peg$c8;
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e8);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                peg$silentFails++;
                s4 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s4 === peg$FAILED) {
                    s3 = undefined;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                    s2 = [s2, s3];
                    s1 = s2;
                }
                else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
        }
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f9(s1);
        }
        s0 = s1;
        return s0;
    }
    function peg$parseStepFunctionCall() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseIdentifier();
        if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 40) {
                s3 = peg$c2;
                peg$currPos++;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e2);
                }
            }
            if (s3 !== peg$FAILED) {
                s4 = peg$parse__();
                s5 = peg$parseArgumentList();
                if (s5 === peg$FAILED) {
                    s5 = null;
                }
                s6 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c3;
                    peg$currPos++;
                }
                else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e3);
                    }
                }
                if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f10(s1, s5);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseArgumentList() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseConditionalExpression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 44) {
                s5 = peg$c9;
                peg$currPos++;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e9);
                }
            }
            if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                s7 = peg$parseConditionalExpression();
                if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c9;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e9);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseConditionalExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f11(s1, s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseConstruction() {
        var s0;
        s0 = peg$parseObjectConstruction();
        if (s0 === peg$FAILED) {
            s0 = peg$parseArrayConstruction();
        }
        return s0;
    }
    function peg$parseObjectConstruction() {
        var s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c10;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e10);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            s3 = peg$parsePropertyAssignmentList();
            if (s3 === peg$FAILED) {
                s3 = null;
            }
            s4 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 125) {
                s5 = peg$c11;
                peg$currPos++;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e11);
                }
            }
            if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f12(s3);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsePropertyAssignmentList() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parsePropertyAssignment();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 44) {
                s5 = peg$c9;
                peg$currPos++;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e9);
                }
            }
            if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                s7 = peg$parsePropertyAssignment();
                if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c9;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e9);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parsePropertyAssignment();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f13(s1, s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsePropertyAssignment() {
        var s0, s1, s2, s3, s4;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parsePropertyName();
        if (s2 !== peg$FAILED) {
            s3 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 58) {
                s4 = peg$c12;
                peg$currPos++;
            }
            else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e12);
                }
            }
            if (s4 !== peg$FAILED) {
                s2 = [s2, s3, s4];
                s1 = s2;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 === peg$FAILED) {
            s1 = null;
        }
        s2 = peg$parse__();
        s3 = peg$parseConditionalExpression();
        if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f14(s1, s3);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsePropertyName() {
        var s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        s1 = peg$parseIdentifier();
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f15(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseStringLiteral();
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f16(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 40) {
                    s1 = peg$c2;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e2);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$parse__();
                    s3 = peg$parseSequencedExpression();
                    if (s3 !== peg$FAILED) {
                        s4 = peg$parse__();
                        if (input.charCodeAt(peg$currPos) === 41) {
                            s5 = peg$c3;
                            peg$currPos++;
                        }
                        else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e3);
                            }
                        }
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f17(s3);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
        }
        return s0;
    }
    function peg$parseArrayConstruction() {
        var s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 91) {
            s1 = peg$c4;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e4);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            s3 = peg$parseElementList();
            if (s3 === peg$FAILED) {
                s3 = null;
            }
            s4 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 93) {
                s5 = peg$c5;
                peg$currPos++;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e5);
                }
            }
            if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f18(s3);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseElementList() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseConditionalExpression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 44) {
                s5 = peg$c9;
                peg$currPos++;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e9);
                }
            }
            if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                s7 = peg$parseConditionalExpression();
                if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c9;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e9);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseConditionalExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f19(s1, s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseSequencedExpression() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseConditionalExpression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 44) {
                s5 = peg$c9;
                peg$currPos++;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e9);
                }
            }
            if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                s7 = peg$parseConditionalExpression();
                if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c9;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e9);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseConditionalExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f20(s1, s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseConditionalExpression() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c13) {
            s1 = peg$c13;
            peg$currPos += 2;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e13);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$parseIdentifierPart();
            peg$silentFails--;
            if (s3 === peg$FAILED) {
                s2 = undefined;
            }
            else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 40) {
                    s4 = peg$c2;
                    peg$currPos++;
                }
                else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e2);
                    }
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parse__();
                    s6 = peg$parseSequencedExpression();
                    if (s6 !== peg$FAILED) {
                        s7 = peg$parse__();
                        if (input.charCodeAt(peg$currPos) === 41) {
                            s8 = peg$c3;
                            peg$currPos++;
                        }
                        else {
                            s8 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e3);
                            }
                        }
                        if (s8 !== peg$FAILED) {
                            s9 = peg$parse__();
                            s10 = peg$parseSequencedExpression();
                            if (s10 !== peg$FAILED) {
                                s11 = peg$parse__();
                                s12 = peg$parseSequencedExpression();
                                if (s12 === peg$FAILED) {
                                    s12 = null;
                                }
                                peg$savedPos = s0;
                                s0 = peg$f21(s6, s10, s12);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$parseLogicalORExpression();
        }
        return s0;
    }
    function peg$parseLogicalORExpression() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8;
        s0 = peg$currPos;
        s1 = peg$parseLogicalANDExpression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parse__();
            if (input.substr(peg$currPos, 2) === peg$c14) {
                s5 = peg$c14;
                peg$currPos += 2;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e14);
                }
            }
            if (s5 !== peg$FAILED) {
                s6 = peg$currPos;
                peg$silentFails++;
                s7 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s7 === peg$FAILED) {
                    s6 = undefined;
                }
                else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                }
                if (s6 !== peg$FAILED) {
                    s7 = peg$parse__();
                    s8 = peg$parseLogicalANDExpression();
                    if (s8 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7, s8];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.substr(peg$currPos, 2) === peg$c14) {
                    s5 = peg$c14;
                    peg$currPos += 2;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e14);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$currPos;
                    peg$silentFails++;
                    s7 = peg$parseIdentifierPart();
                    peg$silentFails--;
                    if (s7 === peg$FAILED) {
                        s6 = undefined;
                    }
                    else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                    }
                    if (s6 !== peg$FAILED) {
                        s7 = peg$parse__();
                        s8 = peg$parseLogicalANDExpression();
                        if (s8 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7, s8];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f22(s1, s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseLogicalANDExpression() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8;
        s0 = peg$currPos;
        s1 = peg$parseEqualityExpression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parse__();
            if (input.substr(peg$currPos, 3) === peg$c15) {
                s5 = peg$c15;
                peg$currPos += 3;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e15);
                }
            }
            if (s5 !== peg$FAILED) {
                s6 = peg$currPos;
                peg$silentFails++;
                s7 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s7 === peg$FAILED) {
                    s6 = undefined;
                }
                else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                }
                if (s6 !== peg$FAILED) {
                    s7 = peg$parse__();
                    s8 = peg$parseEqualityExpression();
                    if (s8 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7, s8];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.substr(peg$currPos, 3) === peg$c15) {
                    s5 = peg$c15;
                    peg$currPos += 3;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e15);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$currPos;
                    peg$silentFails++;
                    s7 = peg$parseIdentifierPart();
                    peg$silentFails--;
                    if (s7 === peg$FAILED) {
                        s6 = undefined;
                    }
                    else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                    }
                    if (s6 !== peg$FAILED) {
                        s7 = peg$parse__();
                        s8 = peg$parseEqualityExpression();
                        if (s8 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7, s8];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f23(s1, s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseEqualityExpression() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseRelationalExpression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parse__();
            s5 = peg$parseEqualityOperator();
            if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                s7 = peg$parseRelationalExpression();
                if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseEqualityOperator();
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseRelationalExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f24(s1, s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseEqualityOperator() {
        var s0;
        if (input.substr(peg$currPos, 2) === peg$c16) {
            s0 = peg$c16;
            peg$currPos += 2;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e16);
            }
        }
        if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c17) {
                s0 = peg$c17;
                peg$currPos += 2;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e17);
                }
            }
        }
        return s0;
    }
    function peg$parseRelationalExpression() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseUnaryExpression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parse__();
            s5 = peg$parseRelationalOperator();
            if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                s7 = peg$parseUnaryExpression();
                if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseRelationalOperator();
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseUnaryExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f25(s1, s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseRelationalOperator() {
        var s0;
        if (input.substr(peg$currPos, 2) === peg$c18) {
            s0 = peg$c18;
            peg$currPos += 2;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e18);
            }
        }
        if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c19) {
                s0 = peg$c19;
                peg$currPos += 2;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e19);
                }
            }
            if (s0 === peg$FAILED) {
                s0 = input.charAt(peg$currPos);
                if (peg$r0.test(s0)) {
                    peg$currPos++;
                }
                else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e20);
                    }
                }
            }
        }
        return s0;
    }
    function peg$parseUnaryExpression() {
        var s0, s1, s2, s3;
        s0 = peg$parsePrimaryExpression();
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseUnaryOperator();
            if (s1 !== peg$FAILED) {
                s2 = peg$parse__();
                s3 = peg$parseUnaryExpression();
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f26(s1, s3);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        return s0;
    }
    function peg$parseUnaryOperator() {
        var s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3) === peg$c20) {
            s1 = peg$c20;
            peg$currPos += 3;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e21);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$parseIdentifierPart();
            peg$silentFails--;
            if (s3 === peg$FAILED) {
                s2 = undefined;
            }
            else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f27();
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsePrimaryExpression() {
        var s0;
        s0 = peg$parseLiteral();
        if (s0 === peg$FAILED) {
            s0 = peg$parsePath();
        }
        return s0;
    }
    function peg$parseSourceCharacter() {
        var s0;
        if (input.length > peg$currPos) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e22);
            }
        }
        return s0;
    }
    function peg$parseWhiteSpace() {
        var s0, s1;
        peg$silentFails++;
        s0 = input.charAt(peg$currPos);
        if (peg$r1.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e24);
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e23);
            }
        }
        return s0;
    }
    function peg$parseLineTerminator() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r2.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e25);
            }
        }
        return s0;
    }
    function peg$parseLineTerminatorSequence() {
        var s0, s1;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 10) {
            s0 = peg$c21;
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e27);
            }
        }
        if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c22) {
                s0 = peg$c22;
                peg$currPos += 2;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e28);
                }
            }
            if (s0 === peg$FAILED) {
                s0 = input.charAt(peg$currPos);
                if (peg$r3.test(s0)) {
                    peg$currPos++;
                }
                else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e29);
                    }
                }
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e26);
            }
        }
        return s0;
    }
    function peg$parseComment() {
        var s0, s1;
        peg$silentFails++;
        s0 = peg$parseMultiLineComment();
        if (s0 === peg$FAILED) {
            s0 = peg$parseSingleLineComment();
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e30);
            }
        }
        return s0;
    }
    function peg$parseMultiLineComment() {
        var s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c23) {
            s1 = peg$c23;
            peg$currPos += 2;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e31);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c24) {
                s5 = peg$c24;
                peg$currPos += 2;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e32);
                }
            }
            peg$silentFails--;
            if (s5 === peg$FAILED) {
                s4 = undefined;
            }
            else {
                peg$currPos = s4;
                s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
                s5 = peg$parseSourceCharacter();
                if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c24) {
                    s5 = peg$c24;
                    peg$currPos += 2;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e32);
                    }
                }
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                    s4 = undefined;
                }
                else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseSourceCharacter();
                    if (s5 !== peg$FAILED) {
                        s4 = [s4, s5];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            if (input.substr(peg$currPos, 2) === peg$c24) {
                s3 = peg$c24;
                peg$currPos += 2;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e32);
                }
            }
            if (s3 !== peg$FAILED) {
                s1 = [s1, s2, s3];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseMultiLineCommentNoLineTerminator() {
        var s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c23) {
            s1 = peg$c23;
            peg$currPos += 2;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e31);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c24) {
                s5 = peg$c24;
                peg$currPos += 2;
            }
            else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e32);
                }
            }
            if (s5 === peg$FAILED) {
                s5 = peg$parseLineTerminator();
            }
            peg$silentFails--;
            if (s5 === peg$FAILED) {
                s4 = undefined;
            }
            else {
                peg$currPos = s4;
                s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
                s5 = peg$parseSourceCharacter();
                if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c24) {
                    s5 = peg$c24;
                    peg$currPos += 2;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e32);
                    }
                }
                if (s5 === peg$FAILED) {
                    s5 = peg$parseLineTerminator();
                }
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                    s4 = undefined;
                }
                else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseSourceCharacter();
                    if (s5 !== peg$FAILED) {
                        s4 = [s4, s5];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            if (input.substr(peg$currPos, 2) === peg$c24) {
                s3 = peg$c24;
                peg$currPos += 2;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e32);
                }
            }
            if (s3 !== peg$FAILED) {
                s1 = [s1, s2, s3];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseSingleLineComment() {
        var s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c25) {
            s1 = peg$c25;
            peg$currPos += 2;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e33);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$parseLineTerminator();
            peg$silentFails--;
            if (s5 === peg$FAILED) {
                s4 = undefined;
            }
            else {
                peg$currPos = s4;
                s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
                s5 = peg$parseSourceCharacter();
                if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                s5 = peg$parseLineTerminator();
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                    s4 = undefined;
                }
                else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseSourceCharacter();
                    if (s5 !== peg$FAILED) {
                        s4 = [s4, s5];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            s1 = [s1, s2];
            s0 = s1;
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseIdentifier() {
        var s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$parseReservedWord();
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        }
        else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIdentifierName();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f28(s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseIdentifierName() {
        var s0, s1, s2, s3;
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseIdentifierStart();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parseIdentifierPart();
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseIdentifierPart();
            }
            peg$savedPos = s0;
            s0 = peg$f29(s1, s2);
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e34);
            }
        }
        return s0;
    }
    function peg$parseIdentifierStart() {
        var s0, s1, s2;
        s0 = input.charAt(peg$currPos);
        if (peg$r4.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e35);
            }
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
                s1 = peg$c26;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e36);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseUnicodeEscapeSequence();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f30(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        return s0;
    }
    function peg$parseIdentifierPart() {
        var s0;
        s0 = peg$parseIdentifierStart();
        if (s0 === peg$FAILED) {
            s0 = input.charAt(peg$currPos);
            if (peg$r5.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e37);
                }
            }
        }
        return s0;
    }
    function peg$parseUnicodeLetter() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r6.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e38);
            }
        }
        return s0;
    }
    function peg$parseUnicodeCombiningMark() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r7.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e39);
            }
        }
        return s0;
    }
    function peg$parseReservedWord() {
        var s0;
        s0 = peg$parseKeyword();
        if (s0 === peg$FAILED) {
            s0 = peg$parseNullLiteral();
            if (s0 === peg$FAILED) {
                s0 = peg$parseBooleanLiteral();
            }
        }
        return s0;
    }
    function peg$parseKeyword() {
        var s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c7) {
            s1 = peg$c7;
            peg$currPos += 4;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e7);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$parseIdentifierPart();
            peg$silentFails--;
            if (s3 === peg$FAILED) {
                s2 = undefined;
            }
            else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 95) {
                s1 = peg$c8;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e8);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c15) {
                    s1 = peg$c15;
                    peg$currPos += 3;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e15);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$currPos;
                    peg$silentFails++;
                    s3 = peg$parseIdentifierPart();
                    peg$silentFails--;
                    if (s3 === peg$FAILED) {
                        s2 = undefined;
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                        s1 = [s1, s2];
                        s0 = s1;
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c14) {
                        s1 = peg$c14;
                        peg$currPos += 2;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e14);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        s2 = peg$currPos;
                        peg$silentFails++;
                        s3 = peg$parseIdentifierPart();
                        peg$silentFails--;
                        if (s3 === peg$FAILED) {
                            s2 = undefined;
                        }
                        else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                        }
                        if (s2 !== peg$FAILED) {
                            s1 = [s1, s2];
                            s0 = s1;
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 3) === peg$c20) {
                            s1 = peg$c20;
                            peg$currPos += 3;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e21);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            s2 = peg$currPos;
                            peg$silentFails++;
                            s3 = peg$parseIdentifierPart();
                            peg$silentFails--;
                            if (s3 === peg$FAILED) {
                                s2 = undefined;
                            }
                            else {
                                peg$currPos = s2;
                                s2 = peg$FAILED;
                            }
                            if (s2 !== peg$FAILED) {
                                s1 = [s1, s2];
                                s0 = s1;
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.substr(peg$currPos, 2) === peg$c13) {
                                s1 = peg$c13;
                                peg$currPos += 2;
                            }
                            else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e13);
                                }
                            }
                            if (s1 !== peg$FAILED) {
                                s2 = peg$currPos;
                                peg$silentFails++;
                                s3 = peg$parseIdentifierPart();
                                peg$silentFails--;
                                if (s3 === peg$FAILED) {
                                    s2 = undefined;
                                }
                                else {
                                    peg$currPos = s2;
                                    s2 = peg$FAILED;
                                }
                                if (s2 !== peg$FAILED) {
                                    s1 = [s1, s2];
                                    s0 = s1;
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                    }
                }
            }
        }
        return s0;
    }
    function peg$parseLiteral() {
        var s0;
        s0 = peg$parseBooleanLiteral();
        if (s0 === peg$FAILED) {
            s0 = peg$parseNumericLiteral();
            if (s0 === peg$FAILED) {
                s0 = peg$parseStringLiteral();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseNullLiteral();
                }
            }
        }
        return s0;
    }
    function peg$parseNullLiteral() {
        var s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c27) {
            s1 = peg$c27;
            peg$currPos += 4;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e40);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$parseIdentifierPart();
            peg$silentFails--;
            if (s3 === peg$FAILED) {
                s2 = undefined;
            }
            else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f31();
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseBooleanLiteral() {
        var s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c28) {
            s1 = peg$c28;
            peg$currPos += 4;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e41);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$parseIdentifierPart();
            peg$silentFails--;
            if (s3 === peg$FAILED) {
                s2 = undefined;
            }
            else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f32();
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 5) === peg$c29) {
                s1 = peg$c29;
                peg$currPos += 5;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e42);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f33();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        return s0;
    }
    function peg$parseNumericLiteral() {
        var s0, s1, s2, s3;
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseHexIntegerLiteral();
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$parseIdentifierStart();
            if (s3 === peg$FAILED) {
                s3 = peg$parseDecimalDigit();
            }
            peg$silentFails--;
            if (s3 === peg$FAILED) {
                s2 = undefined;
            }
            else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f34(s1);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseDecimalLiteral();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierStart();
                if (s3 === peg$FAILED) {
                    s3 = peg$parseDecimalDigit();
                }
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f35(s1);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e43);
            }
        }
        return s0;
    }
    function peg$parseDecimalLiteral() {
        var s0, s1, s2, s3, s4;
        s0 = peg$currPos;
        s1 = peg$parseDecimalIntegerLiteral();
        if (s1 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 46) {
                s2 = peg$c0;
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e0);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parseDecimalDigit();
                while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$parseDecimalDigit();
                }
                s4 = peg$parseExponentPart();
                if (s4 === peg$FAILED) {
                    s4 = null;
                }
                peg$savedPos = s0;
                s0 = peg$f36();
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 46) {
                s1 = peg$c0;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e0);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseDecimalDigit();
                if (s3 !== peg$FAILED) {
                    while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        s3 = peg$parseDecimalDigit();
                    }
                }
                else {
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$parseExponentPart();
                    if (s3 === peg$FAILED) {
                        s3 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f37();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseDecimalIntegerLiteral();
                if (s1 !== peg$FAILED) {
                    s2 = peg$parseExponentPart();
                    if (s2 === peg$FAILED) {
                        s2 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f38();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
        }
        return s0;
    }
    function peg$parseDecimalIntegerLiteral() {
        var s0, s1, s2, s3;
        if (input.charCodeAt(peg$currPos) === 48) {
            s0 = peg$c30;
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e44);
            }
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseNonZeroDigit();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseDecimalDigit();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseDecimalDigit();
                }
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        return s0;
    }
    function peg$parseDecimalDigit() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r8.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e45);
            }
        }
        return s0;
    }
    function peg$parseNonZeroDigit() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r9.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e46);
            }
        }
        return s0;
    }
    function peg$parseExponentPart() {
        var s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$parseExponentIndicator();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseSignedInteger();
            if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseExponentIndicator() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (s0.toLowerCase() === peg$c31) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e47);
            }
        }
        return s0;
    }
    function peg$parseSignedInteger() {
        var s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = input.charAt(peg$currPos);
        if (peg$r10.test(s1)) {
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e48);
            }
        }
        if (s1 === peg$FAILED) {
            s1 = null;
        }
        s2 = [];
        s3 = peg$parseDecimalDigit();
        if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseDecimalDigit();
            }
        }
        else {
            s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseHexIntegerLiteral() {
        var s0, s1, s2, s3, s4;
        s0 = peg$currPos;
        s1 = input.substr(peg$currPos, 2);
        if (s1.toLowerCase() === peg$c32) {
            peg$currPos += 2;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e49);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            s3 = [];
            s4 = peg$parseHexDigit();
            if (s4 !== peg$FAILED) {
                while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$parseHexDigit();
                }
            }
            else {
                s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
                s2 = input.substring(s2, peg$currPos);
            }
            else {
                s2 = s3;
            }
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f39(s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseHexDigit() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r11.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e50);
            }
        }
        return s0;
    }
    function peg$parseStringLiteral() {
        var s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 34) {
            s1 = peg$c33;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e51);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parseDoubleStringCharacter();
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseDoubleStringCharacter();
            }
            if (input.charCodeAt(peg$currPos) === 34) {
                s3 = peg$c33;
                peg$currPos++;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e51);
                }
            }
            if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f40(s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 39) {
                s1 = peg$c34;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e52);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseSingleStringCharacter();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseSingleStringCharacter();
                }
                if (input.charCodeAt(peg$currPos) === 39) {
                    s3 = peg$c34;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e52);
                    }
                }
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f41(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        return s0;
    }
    function peg$parseDoubleStringCharacter() {
        var s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = input.charAt(peg$currPos);
        if (peg$r12.test(s2)) {
            peg$currPos++;
        }
        else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e53);
            }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        }
        else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseSourceCharacter();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f42();
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
                s1 = peg$c26;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e36);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseEscapeSequence();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f43(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parseLineContinuation();
            }
        }
        return s0;
    }
    function peg$parseSingleStringCharacter() {
        var s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = input.charAt(peg$currPos);
        if (peg$r13.test(s2)) {
            peg$currPos++;
        }
        else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e54);
            }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        }
        else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseSourceCharacter();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f44();
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
                s1 = peg$c26;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e36);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseEscapeSequence();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f45(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parseLineContinuation();
            }
        }
        return s0;
    }
    function peg$parseLineContinuation() {
        var s0, s1, s2;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c26;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e36);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseLineTerminatorSequence();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f46();
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseEscapeSequence() {
        var s0, s1, s2, s3;
        s0 = peg$parseCharacterEscapeSequence();
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 48) {
                s1 = peg$c30;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e44);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseDecimalDigit();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f47();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parseHexEscapeSequence();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseUnicodeEscapeSequence();
                }
            }
        }
        return s0;
    }
    function peg$parseCharacterEscapeSequence() {
        var s0;
        s0 = peg$parseSingleEscapeCharacter();
        if (s0 === peg$FAILED) {
            s0 = peg$parseNonEscapeCharacter();
        }
        return s0;
    }
    function peg$parseSingleEscapeCharacter() {
        var s0, s1;
        s0 = input.charAt(peg$currPos);
        if (peg$r14.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e55);
            }
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 98) {
                s1 = peg$c35;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e56);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f48();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 102) {
                    s1 = peg$c36;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e57);
                    }
                }
                if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f49();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 110) {
                        s1 = peg$c37;
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e58);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f50();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 114) {
                            s1 = peg$c38;
                            peg$currPos++;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e59);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f51();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 116) {
                                s1 = peg$c39;
                                peg$currPos++;
                            }
                            else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e60);
                                }
                            }
                            if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$f52();
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 118) {
                                    s1 = peg$c40;
                                    peg$currPos++;
                                }
                                else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e61);
                                    }
                                }
                                if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$f53();
                                }
                                s0 = s1;
                            }
                        }
                    }
                }
            }
        }
        return s0;
    }
    function peg$parseNonEscapeCharacter() {
        var s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$parseEscapeCharacter();
        if (s2 === peg$FAILED) {
            s2 = peg$parseLineTerminator();
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        }
        else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseSourceCharacter();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f54();
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseEscapeCharacter() {
        var s0;
        s0 = peg$parseSingleEscapeCharacter();
        if (s0 === peg$FAILED) {
            s0 = input.charAt(peg$currPos);
            if (peg$r15.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e62);
                }
            }
        }
        return s0;
    }
    function peg$parseHexEscapeSequence() {
        var s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 120) {
            s1 = peg$c41;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e63);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$currPos;
            s4 = peg$parseHexDigit();
            if (s4 !== peg$FAILED) {
                s5 = peg$parseHexDigit();
                if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
                s2 = input.substring(s2, peg$currPos);
            }
            else {
                s2 = s3;
            }
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f55(s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseUnicodeEscapeSequence() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 117) {
            s1 = peg$c42;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e64);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$currPos;
            s4 = peg$parseHexDigit();
            if (s4 !== peg$FAILED) {
                s5 = peg$parseHexDigit();
                if (s5 !== peg$FAILED) {
                    s6 = peg$parseHexDigit();
                    if (s6 !== peg$FAILED) {
                        s7 = peg$parseHexDigit();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
                s2 = input.substring(s2, peg$currPos);
            }
            else {
                s2 = s3;
            }
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f56(s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseRegularExpressionLiteral() {
        var s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 47) {
            s1 = peg$c43;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e65);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$parseRegularExpressionBody();
            if (s3 !== peg$FAILED) {
                s2 = input.substring(s2, peg$currPos);
            }
            else {
                s2 = s3;
            }
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 47) {
                    s3 = peg$c43;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e65);
                    }
                }
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f57(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseRegularExpressionBody() {
        var s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$parseRegularExpressionFirstChar();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parseRegularExpressionChar();
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseRegularExpressionChar();
            }
            s1 = [s1, s2];
            s0 = s1;
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseRegularExpressionFirstChar() {
        var s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = input.charAt(peg$currPos);
        if (peg$r16.test(s2)) {
            peg$currPos++;
        }
        else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e66);
            }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        }
        else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseRegularExpressionNonTerminator();
            if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$parseRegularExpressionBackslashSequence();
            if (s0 === peg$FAILED) {
                s0 = peg$parseRegularExpressionClass();
            }
        }
        return s0;
    }
    function peg$parseRegularExpressionChar() {
        var s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = input.charAt(peg$currPos);
        if (peg$r17.test(s2)) {
            peg$currPos++;
        }
        else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e67);
            }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        }
        else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseRegularExpressionNonTerminator();
            if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$parseRegularExpressionBackslashSequence();
            if (s0 === peg$FAILED) {
                s0 = peg$parseRegularExpressionClass();
            }
        }
        return s0;
    }
    function peg$parseRegularExpressionBackslashSequence() {
        var s0, s1, s2;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c26;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e36);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseRegularExpressionNonTerminator();
            if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseRegularExpressionNonTerminator() {
        var s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$parseLineTerminator();
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        }
        else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseSourceCharacter();
            if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseRegularExpressionClass() {
        var s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 91) {
            s1 = peg$c4;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e4);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parseRegularExpressionClassChar();
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseRegularExpressionClassChar();
            }
            if (input.charCodeAt(peg$currPos) === 93) {
                s3 = peg$c5;
                peg$currPos++;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e5);
                }
            }
            if (s3 !== peg$FAILED) {
                s1 = [s1, s2, s3];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseRegularExpressionClassChar() {
        var s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = input.charAt(peg$currPos);
        if (peg$r18.test(s2)) {
            peg$currPos++;
        }
        else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e68);
            }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        }
        else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseRegularExpressionNonTerminator();
            if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$parseRegularExpressionBackslashSequence();
        }
        return s0;
    }
    function peg$parseRegularExpressionFlags() {
        var s0, s1;
        s0 = [];
        s1 = peg$parseIdentifierPart();
        while (s1 !== peg$FAILED) {
            s0.push(s1);
            s1 = peg$parseIdentifierPart();
        }
        return s0;
    }
    function peg$parseLl() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r19.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e69);
            }
        }
        return s0;
    }
    function peg$parseLm() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r20.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e70);
            }
        }
        return s0;
    }
    function peg$parseLo() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r21.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e71);
            }
        }
        return s0;
    }
    function peg$parseLt() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r22.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e72);
            }
        }
        return s0;
    }
    function peg$parseLu() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r23.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e73);
            }
        }
        return s0;
    }
    function peg$parseMc() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r24.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e74);
            }
        }
        return s0;
    }
    function peg$parseMn() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r25.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e75);
            }
        }
        return s0;
    }
    function peg$parseNd() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r26.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e76);
            }
        }
        return s0;
    }
    function peg$parseNl() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r27.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e77);
            }
        }
        return s0;
    }
    function peg$parsePc() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r28.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e78);
            }
        }
        return s0;
    }
    function peg$parseZs() {
        var s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r29.test(s0)) {
            peg$currPos++;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e79);
            }
        }
        return s0;
    }
    function peg$parse__() {
        var s0, s1, s2;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseWhiteSpace();
        if (s2 === peg$FAILED) {
            s2 = peg$parseLineTerminatorSequence();
            if (s2 === peg$FAILED) {
                s2 = peg$parseComment();
            }
        }
        while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseWhiteSpace();
            if (s2 === peg$FAILED) {
                s2 = peg$parseLineTerminatorSequence();
                if (s2 === peg$FAILED) {
                    s2 = peg$parseComment();
                }
            }
        }
        peg$savedPos = s0;
        s1 = peg$f58();
        s0 = s1;
        return s0;
    }
    function peg$parse_() {
        var s0, s1;
        s0 = [];
        s1 = peg$parseWhiteSpace();
        if (s1 === peg$FAILED) {
            s1 = peg$parseMultiLineCommentNoLineTerminator();
        }
        while (s1 !== peg$FAILED) {
            s0.push(s1);
            s1 = peg$parseWhiteSpace();
            if (s1 === peg$FAILED) {
                s1 = peg$parseMultiLineCommentNoLineTerminator();
            }
        }
        return s0;
    }
    function peg$parseEOS() {
        var s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$parse__();
        if (input.charCodeAt(peg$currPos) === 59) {
            s2 = peg$c44;
            peg$currPos++;
        }
        else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e80);
            }
        }
        if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parse_();
            s2 = peg$parseSingleLineComment();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            s3 = peg$parseLineTerminatorSequence();
            if (s3 !== peg$FAILED) {
                s1 = [s1, s2, s3];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parse_();
                s2 = peg$currPos;
                peg$silentFails++;
                if (input.charCodeAt(peg$currPos) === 125) {
                    s3 = peg$c11;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e11);
                    }
                }
                peg$silentFails--;
                if (s3 !== peg$FAILED) {
                    peg$currPos = s2;
                    s2 = undefined;
                }
                else {
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parse__();
                    s2 = peg$parseEOF();
                    if (s2 !== peg$FAILED) {
                        s1 = [s1, s2];
                        s0 = s1;
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
            }
        }
        return s0;
    }
    function peg$parseEOF() {
        var s0, s1;
        s0 = peg$currPos;
        peg$silentFails++;
        if (input.length > peg$currPos) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e22);
            }
        }
        peg$silentFails--;
        if (s1 === peg$FAILED) {
            s0 = undefined;
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    peg$result = peg$startRuleFunction();
    if (options.peg$library) {
        return /** @type {any} */ ({
            peg$result,
            peg$currPos,
            peg$FAILED,
            peg$maxFailExpected,
            peg$maxFailPos
        });
    }
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
        return peg$result;
    }
    else {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
            peg$fail(peg$endExpectation());
        }
        throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length
            ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
            : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
    }
}
exports.peg$parse = peg$parse;
exports.parse = peg$parse;
const peg$allowedStartRules = [
    "Start"
];
exports.StartRules = peg$allowedStartRules;

},{"../core/adt.js":5,"../core/apart.js":6}],13:[function(require,module,exports){

const Parser_ = require('../dist/src/core/parser.js')
const Transpiler_ = require('../dist/src/core/transpiler.js')
const Apart_ = require('../dist/src/core/apart.js')
const apath_ = require('../dist/src/accessor/apath-func.js')

window.Parser__ = Parser_
window.Transpiler__ = Transpiler_
window.Apart_ = Apart_
window.apath_ = apath_
},{"../dist/src/accessor/apath-func.js":4,"../dist/src/core/apart.js":6,"../dist/src/core/parser.js":8,"../dist/src/core/transpiler.js":10}]},{},[13]);
