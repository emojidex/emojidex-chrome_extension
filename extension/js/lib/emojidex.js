/*
 * jQuery emojidex - v0.3.1
 * emojidex plugin for jQuery/Zepto and compatible
 * https://github.com/emojidex/emojidex-web
 *
 * Includes:
 *   emojidexReplace, emojidexAutocomplete
 *
 * =LICENSE=
 * Licensed under the emojidex Open License
 * https://www.emojidex.com/emojidex/emojidex_open_license
 *
 * Copyright 2013 Genshin Souzou Kabushiki Kaisha
 *
 *
 * Includes:
 * --------------------------------
 * emojidex client - v0.3.3
 * * Provides search, index caching and combining and asset URI resolution
 * https://github.com/emojidex/emojidex-web-client
 *
 * =LICENSE=
 * Licensed under the emojidex Open License
 * https://www.emojidex.com/emojidex/emojidex_open_license
 *
 * Copyright 2013 Genshin Souzou Kabushiki Kaisha
 *
 *
 * Includes:
 * --------------------------------
 * jQuery Storage API Plugin
 *
 * Copyright (c) 2013 Julien Maurel
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 * https://github.com/julien-maurel/jQuery-Storage-API
 *
 * Version: 1.7.3
 *
 * --------------------------------
 * --------------------------------
  Implement Github like autocomplete mentions
  http://ichord.github.com/At.js
  Copyright (c) 2013 chord.luo@gmail.com
  Licensed under the MIT license.
* --------------------------------
! jquery.atwho - v0.5.1 - 2014-09-14
 * Copyright (c) 2014 chord.luo <chord.luo@gmail.com>;
 * homepage: http://ichord.github.com/At.js* Licensed MIT
* --------------------------------
 */
/*
本插件操作 textarea 或者 input 内的插入符
只实现了获得插入符在文本框中的位置，我设置
插入符的位置.
*/


(function() {
  (function(factory) {
    if (typeof define === 'function' && define.amd) {
      return define(['jquery'], factory);
    } else {
      return factory(window.jQuery);
    }
  })(function($) {
    "use strict";
    var EditableCaret, InputCaret, Mirror, Utils, discoveryIframeOf, methods, oDocument, oFrame, oWindow, pluginName, setContextBy;
    pluginName = 'caret';
    EditableCaret = (function() {
      function EditableCaret($inputor) {
        this.$inputor = $inputor;
        this.domInputor = this.$inputor[0];
      }

      EditableCaret.prototype.setPos = function(pos) {
        return this.domInputor;
      };

      EditableCaret.prototype.getIEPosition = function() {
        return this.getPosition();
      };

      EditableCaret.prototype.getPosition = function() {
        var inputor_offset, offset;
        offset = this.getOffset();
        inputor_offset = this.$inputor.offset();
        offset.left -= inputor_offset.left;
        offset.top -= inputor_offset.top;
        return offset;
      };

      EditableCaret.prototype.getOldIEPos = function() {
        var preCaretTextRange, textRange;
        textRange = oDocument.selection.createRange();
        preCaretTextRange = oDocument.body.createTextRange();
        preCaretTextRange.moveToElementText(this.domInputor);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        return preCaretTextRange.text.length;
      };

      EditableCaret.prototype.getPos = function() {
        var clonedRange, pos, range;
        if (range = this.range()) {
          clonedRange = range.cloneRange();
          clonedRange.selectNodeContents(this.domInputor);
          clonedRange.setEnd(range.endContainer, range.endOffset);
          pos = clonedRange.toString().length;
          clonedRange.detach();
          return pos;
        } else if (oDocument.selection) {
          return this.getOldIEPos();
        }
      };

      EditableCaret.prototype.getOldIEOffset = function() {
        var range, rect;
        range = oDocument.selection.createRange().duplicate();
        range.moveStart("character", -1);
        rect = range.getBoundingClientRect();
        return {
          height: rect.bottom - rect.top,
          left: rect.left,
          top: rect.top
        };
      };

      EditableCaret.prototype.getOffset = function(pos) {
        var clonedRange, offset, range, rect;
        if (oWindow.getSelection && (range = this.range())) {
          if (range.endOffset - 1 < 0) {
            return null;
          }
          clonedRange = range.cloneRange();
          clonedRange.setStart(range.endContainer, range.endOffset - 1);
          clonedRange.setEnd(range.endContainer, range.endOffset);
          rect = clonedRange.getBoundingClientRect();
          offset = {
            height: rect.height,
            left: rect.left + rect.width,
            top: rect.top
          };
          clonedRange.detach();
        } else if (oDocument.selection) {
          offset = this.getOldIEOffset();
        }
        if (offset) {
          offset.top += $(oWindow).scrollTop();
          offset.left += $(oWindow).scrollLeft();
        }
        return offset;
      };

      EditableCaret.prototype.range = function() {
        var sel;
        if (!oWindow.getSelection) {
          return;
        }
        sel = oWindow.getSelection();
        if (sel.rangeCount > 0) {
          return sel.getRangeAt(0);
        } else {
          return null;
        }
      };

      return EditableCaret;

    })();
    InputCaret = (function() {
      function InputCaret($inputor) {
        this.$inputor = $inputor;
        this.domInputor = this.$inputor[0];
      }

      InputCaret.prototype.getIEPos = function() {
        var endRange, inputor, len, normalizedValue, pos, range, textInputRange;
        inputor = this.domInputor;
        range = oDocument.selection.createRange();
        pos = 0;
        if (range && range.parentElement() === inputor) {
          normalizedValue = inputor.value.replace(/\r\n/g, "\n");
          len = normalizedValue.length;
          textInputRange = inputor.createTextRange();
          textInputRange.moveToBookmark(range.getBookmark());
          endRange = inputor.createTextRange();
          endRange.collapse(false);
          if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
            pos = len;
          } else {
            pos = -textInputRange.moveStart("character", -len);
          }
        }
        return pos;
      };

      InputCaret.prototype.getPos = function() {
        if (oDocument.selection) {
          return this.getIEPos();
        } else {
          return this.domInputor.selectionStart;
        }
      };

      InputCaret.prototype.setPos = function(pos) {
        var inputor, range;
        inputor = this.domInputor;
        if (oDocument.selection) {
          range = inputor.createTextRange();
          range.move("character", pos);
          range.select();
        } else if (inputor.setSelectionRange) {
          inputor.setSelectionRange(pos, pos);
        }
        return inputor;
      };

      InputCaret.prototype.getIEOffset = function(pos) {
        var h, textRange, x, y;
        textRange = this.domInputor.createTextRange();
        pos || (pos = this.getPos());
        textRange.move('character', pos);
        x = textRange.boundingLeft;
        y = textRange.boundingTop;
        h = textRange.boundingHeight;
        return {
          left: x,
          top: y,
          height: h
        };
      };

      InputCaret.prototype.getOffset = function(pos) {
        var $inputor, offset, position;
        $inputor = this.$inputor;
        if (oDocument.selection) {
          offset = this.getIEOffset(pos);
          offset.top += $(oWindow).scrollTop() + $inputor.scrollTop();
          offset.left += $(oWindow).scrollLeft() + $inputor.scrollLeft();
          return offset;
        } else {
          offset = $inputor.offset();
          position = this.getPosition(pos);
          return offset = {
            left: offset.left + position.left - $inputor.scrollLeft(),
            top: offset.top + position.top - $inputor.scrollTop(),
            height: position.height
          };
        }
      };

      InputCaret.prototype.getPosition = function(pos) {
        var $inputor, at_rect, end_range, format, html, mirror, start_range;
        $inputor = this.$inputor;
        format = function(value) {
          return $('<div></div>').text(value).html();
        };
        if (pos === void 0) {
          pos = this.getPos();
        }
        start_range = $inputor.val().slice(0, pos);
        end_range = $inputor.val().slice(pos);
        html = "<span style='position: relative; display: inline;'>" + format(start_range) + "</span>";
        html += "<span id='caret' style='position: relative; display: inline;'>|</span>";
        html += "<span style='position: relative; display: inline;'>" + format(end_range) + "</span>";
        mirror = new Mirror($inputor);
        return at_rect = mirror.create(html).rect();
      };

      InputCaret.prototype.getIEPosition = function(pos) {
        var h, inputorOffset, offset, x, y;
        offset = this.getIEOffset(pos);
        inputorOffset = this.$inputor.offset();
        x = offset.left - inputorOffset.left;
        y = offset.top - inputorOffset.top;
        h = offset.height;
        return {
          left: x,
          top: y,
          height: h
        };
      };

      return InputCaret;

    })();
    Mirror = (function() {
      Mirror.prototype.css_attr = ["borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle", "borderTopWidth", "boxSizing", "fontFamily", "fontSize", "fontWeight", "height", "letterSpacing", "lineHeight", "marginBottom", "marginLeft", "marginRight", "marginTop", "outlineWidth", "overflow", "overflowX", "overflowY", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "textAlign", "textOverflow", "textTransform", "whiteSpace", "wordBreak", "wordWrap"];

      function Mirror($inputor) {
        this.$inputor = $inputor;
      }

      Mirror.prototype.mirrorCss = function() {
        var css,
          _this = this;
        css = {
          position: 'absolute',
          left: -9999,
          top: 0,
          zIndex: -20000
        };
        if (this.$inputor.prop('tagName') === 'TEXTAREA') {
          this.css_attr.push('width');
        }
        $.each(this.css_attr, function(i, p) {
          return css[p] = _this.$inputor.css(p);
        });
        return css;
      };

      Mirror.prototype.create = function(html) {
        this.$mirror = $('<div></div>');
        this.$mirror.css(this.mirrorCss());
        this.$mirror.html(html);
        this.$inputor.after(this.$mirror);
        return this;
      };

      Mirror.prototype.rect = function() {
        var $flag, pos, rect;
        $flag = this.$mirror.find("#caret");
        pos = $flag.position();
        rect = {
          left: pos.left,
          top: pos.top,
          height: $flag.height()
        };
        this.$mirror.remove();
        return rect;
      };

      return Mirror;

    })();
    Utils = {
      contentEditable: function($inputor) {
        return !!($inputor[0].contentEditable && $inputor[0].contentEditable === 'true');
      }
    };
    methods = {
      pos: function(pos) {
        if (pos || pos === 0) {
          return this.setPos(pos);
        } else {
          return this.getPos();
        }
      },
      position: function(pos) {
        if (oDocument.selection) {
          return this.getIEPosition(pos);
        } else {
          return this.getPosition(pos);
        }
      },
      offset: function(pos) {
        var offset;
        offset = this.getOffset(pos);
        return offset;
      }
    };
    oDocument = null;
    oWindow = null;
    oFrame = null;
    setContextBy = function(settings) {
      var iframe;
      if (iframe = settings != null ? settings.iframe : void 0) {
        oFrame = iframe;
        oWindow = iframe.contentWindow;
        return oDocument = iframe.contentDocument || oWindow.document;
      } else {
        oFrame = void 0;
        oWindow = window;
        return oDocument = document;
      }
    };
    discoveryIframeOf = function($dom) {
      var error;
      oDocument = $dom[0].ownerDocument;
      oWindow = oDocument.defaultView || oDocument.parentWindow;
      try {
        return oFrame = oWindow.frameElement;
      } catch (_error) {
        error = _error;
      }
    };
    $.fn.caret = function(method, value, settings) {
      var caret;
      if (methods[method]) {
        if ($.isPlainObject(value)) {
          setContextBy(value);
          value = void 0;
        } else {
          setContextBy(settings);
        }
        caret = Utils.contentEditable(this) ? new EditableCaret(this) : new InputCaret(this);
        return methods[method].apply(caret, [value]);
      } else {
        return $.error("Method " + method + " does not exist on jQuery.caret");
      }
    };
    $.fn.caret.EditableCaret = EditableCaret;
    $.fn.caret.InputCaret = InputCaret;
    $.fn.caret.Utils = Utils;
    return $.fn.caret.apis = methods;
  });

}).call(this);

/*! jquery.atwho - v0.5.1 - 2014-09-14
* Copyright (c) 2014 chord.luo <chord.luo@gmail.com>; 
* homepage: http://ichord.github.com/At.js 
* Licensed MIT
*/

(function() {
  (function(factory) {
    if (typeof define === 'function' && define.amd) {
      return define(['jquery'], factory);
    } else {
      return factory(window.jQuery);
    }
  })(function($) {

var Api, App, Controller, DEFAULT_CALLBACKS, KEY_CODE, Model, View,
  __slice = [].slice;

App = (function() {
  function App(inputor) {
    this.current_flag = null;
    this.controllers = {};
    this.alias_maps = {};
    this.$inputor = $(inputor);
    this.setIframe();
    this.listen();
  }

  App.prototype.createContainer = function(doc) {
    if ((this.$el = $("#atwho-container", doc)).length === 0) {
      return $(doc.body).append(this.$el = $("<div id='atwho-container'></div>"));
    }
  };

  App.prototype.setIframe = function(iframe, standalone) {
    var _ref;
    if (standalone == null) {
      standalone = false;
    }
    if (iframe) {
      this.window = iframe.contentWindow;
      this.document = iframe.contentDocument || this.window.document;
      this.iframe = iframe;
    } else {
      this.document = document;
      this.window = window;
      this.iframe = null;
    }
    if (this.iframeStandalone = standalone) {
      if ((_ref = this.$el) != null) {
        _ref.remove();
      }
      return this.createContainer(this.document);
    } else {
      return this.createContainer(document);
    }
  };

  App.prototype.controller = function(at) {
    var c, current, current_flag, _ref;
    if (this.alias_maps[at]) {
      current = this.controllers[this.alias_maps[at]];
    } else {
      _ref = this.controllers;
      for (current_flag in _ref) {
        c = _ref[current_flag];
        if (current_flag === at) {
          current = c;
          break;
        }
      }
    }
    if (current) {
      return current;
    } else {
      return this.controllers[this.current_flag];
    }
  };

  App.prototype.set_context_for = function(at) {
    this.current_flag = at;
    return this;
  };

  App.prototype.reg = function(flag, setting) {
    var controller, _base;
    controller = (_base = this.controllers)[flag] || (_base[flag] = new Controller(this, flag));
    if (setting.alias) {
      this.alias_maps[setting.alias] = flag;
    }
    controller.init(setting);
    return this;
  };

  App.prototype.listen = function() {
    return this.$inputor.on('keyup.atwhoInner', (function(_this) {
      return function(e) {
        return _this.on_keyup(e);
      };
    })(this)).on('keydown.atwhoInner', (function(_this) {
      return function(e) {
        return _this.on_keydown(e);
      };
    })(this)).on('scroll.atwhoInner', (function(_this) {
      return function(e) {
        var _ref;
        return (_ref = _this.controller()) != null ? _ref.view.hide(e) : void 0;
      };
    })(this)).on('blur.atwhoInner', (function(_this) {
      return function(e) {
        var c;
        if (c = _this.controller()) {
          return c.view.hide(e, c.get_opt("display_timeout"));
        }
      };
    })(this)).on('click.atwhoInner', (function(_this) {
      return function(e) {
        var _ref;
        return (_ref = _this.controller()) != null ? _ref.view.hide(e) : void 0;
      };
    })(this));
  };

  App.prototype.shutdown = function() {
    var c, _, _ref;
    _ref = this.controllers;
    for (_ in _ref) {
      c = _ref[_];
      c.destroy();
      delete this.controllers[_];
    }
    this.$inputor.off('.atwhoInner');
    return this.$el.remove();
  };

  App.prototype.dispatch = function() {
    return $.map(this.controllers, (function(_this) {
      return function(c) {
        var delay;
        if (delay = c.get_opt('delay')) {
          clearTimeout(_this.delayedCallback);
          return _this.delayedCallback = setTimeout(function() {
            if (c.look_up()) {
              return _this.set_context_for(c.at);
            }
          }, delay);
        } else {
          if (c.look_up()) {
            return _this.set_context_for(c.at);
          }
        }
      };
    })(this));
  };

  App.prototype.on_keyup = function(e) {
    var _ref;
    switch (e.keyCode) {
      case KEY_CODE.ESC:
        e.preventDefault();
        if ((_ref = this.controller()) != null) {
          _ref.view.hide();
        }
        break;
      case KEY_CODE.DOWN:
      case KEY_CODE.UP:
      case KEY_CODE.CTRL:
        $.noop();
        break;
      case KEY_CODE.P:
      case KEY_CODE.N:
        if (!e.ctrlKey) {
          this.dispatch();
        }
        break;
      default:
        this.dispatch();
    }
  };

  App.prototype.on_keydown = function(e) {
    var view, _ref;
    view = (_ref = this.controller()) != null ? _ref.view : void 0;
    if (!(view && view.visible())) {
      return;
    }
    switch (e.keyCode) {
      case KEY_CODE.ESC:
        e.preventDefault();
        view.hide(e);
        break;
      case KEY_CODE.UP:
        e.preventDefault();
        view.prev();
        break;
      case KEY_CODE.DOWN:
        e.preventDefault();
        view.next();
        break;
      case KEY_CODE.P:
        if (!e.ctrlKey) {
          return;
        }
        e.preventDefault();
        view.prev();
        break;
      case KEY_CODE.N:
        if (!e.ctrlKey) {
          return;
        }
        e.preventDefault();
        view.next();
        break;
      case KEY_CODE.TAB:
      case KEY_CODE.ENTER:
        if (!view.visible()) {
          return;
        }
        e.preventDefault();
        view.choose(e);
        break;
      default:
        $.noop();
    }
  };

  return App;

})();

Controller = (function() {
  Controller.prototype.uid = function() {
    return (Math.random().toString(16) + "000000000").substr(2, 8) + (new Date().getTime());
  };

  function Controller(app, at) {
    this.app = app;
    this.at = at;
    this.$inputor = this.app.$inputor;
    this.id = this.$inputor[0].id || this.uid();
    this.setting = null;
    this.query = null;
    this.pos = 0;
    this.cur_rect = null;
    this.range = null;
    if ((this.$el = $("#atwho-ground-" + this.id, this.app.$el)).length === 0) {
      this.app.$el.append(this.$el = $("<div id='atwho-ground-" + this.id + "'></div>"));
    }
    this.model = new Model(this);
    this.view = new View(this);
  }

  Controller.prototype.init = function(setting) {
    this.setting = $.extend({}, this.setting || $.fn.atwho["default"], setting);
    this.view.init();
    return this.model.reload(this.setting.data);
  };

  Controller.prototype.destroy = function() {
    this.trigger('beforeDestroy');
    this.model.destroy();
    this.view.destroy();
    return this.$el.remove();
  };

  Controller.prototype.call_default = function() {
    var args, error, func_name;
    func_name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    try {
      return DEFAULT_CALLBACKS[func_name].apply(this, args);
    } catch (_error) {
      error = _error;
      return $.error("" + error + " Or maybe At.js doesn't have function " + func_name);
    }
  };

  Controller.prototype.trigger = function(name, data) {
    var alias, event_name;
    if (data == null) {
      data = [];
    }
    data.push(this);
    alias = this.get_opt('alias');
    event_name = alias ? "" + name + "-" + alias + ".atwho" : "" + name + ".atwho";
    return this.$inputor.trigger(event_name, data);
  };

  Controller.prototype.callbacks = function(func_name) {
    return this.get_opt("callbacks")[func_name] || DEFAULT_CALLBACKS[func_name];
  };

  Controller.prototype.get_opt = function(at, default_value) {
    var e;
    try {
      return this.setting[at];
    } catch (_error) {
      e = _error;
      return null;
    }
  };

  Controller.prototype.content = function() {
    if (this.$inputor.is('textarea, input')) {
      return this.$inputor.val();
    } else {
      return this.$inputor.text();
    }
  };

  Controller.prototype.catch_query = function() {
    var caret_pos, content, end, query, start, subtext;
    content = this.content();
    caret_pos = this.$inputor.caret('pos', {
      iframe: this.app.iframe
    });
    subtext = content.slice(0, caret_pos);
    query = this.callbacks("matcher").call(this, this.at, subtext, this.get_opt('start_with_space'));
    if (typeof query === "string" && query.length <= this.get_opt('max_len', 20)) {
      start = caret_pos - query.length;
      end = start + query.length;
      this.pos = start;
      query = {
        'text': query,
        'head_pos': start,
        'end_pos': end
      };
      this.trigger("matched", [this.at, query.text]);
    } else {
      query = null;
      this.view.hide();
    }
    return this.query = query;
  };

  Controller.prototype.rect = function() {
    var c, iframe_offset, scale_bottom;
    if (!(c = this.$inputor.caret('offset', this.pos - 1, {
      iframe: this.app.iframe
    }))) {
      return;
    }
    if (this.app.iframe && !this.app.iframeStandalone) {
      iframe_offset = $(this.app.iframe).offset();
      c.left += iframe_offset.left;
      c.top += iframe_offset.top;
    }
    if (this.$inputor.attr('contentEditable') === 'true') {
      c = this.cur_rect || (this.cur_rect = c);
    }
    scale_bottom = this.app.document.selection ? 0 : 2;
    return {
      left: c.left,
      top: c.top,
      bottom: c.top + c.height + scale_bottom
    };
  };

  Controller.prototype.reset_rect = function() {
    if (this.$inputor.attr('contentEditable') === 'true') {
      return this.cur_rect = null;
    }
  };

  Controller.prototype.mark_range = function() {
    if (this.$inputor.attr('contentEditable') === 'true') {
      if (this.app.window.getSelection) {
        this.range = this.app.window.getSelection().getRangeAt(0);
      }
      if (this.app.document.selection) {
        return this.ie8_range = this.app.document.selection.createRange();
      }
    }
  };

  Controller.prototype.insert_content_for = function($li) {
    var data, data_value, tpl;
    data_value = $li.data('value');
    tpl = this.get_opt('insert_tpl');
    if (this.$inputor.is('textarea, input') || !tpl) {
      return data_value;
    }
    data = $.extend({}, $li.data('item-data'), {
      'atwho-data-value': data_value,
      'atwho-at': this.at
    });
    return this.callbacks("tpl_eval").call(this, tpl, data);
  };

  Controller.prototype.insert = function(content, $li) {
    var $inputor, content_node, pos, range, sel, source, start_str, text, wrapped_content;
    $inputor = this.$inputor;
    wrapped_content = this.callbacks('inserting_wrapper').call(this, $inputor, content, this.get_opt("suffix"));
    if ($inputor.is('textarea, input')) {
      source = $inputor.val();
      start_str = source.slice(0, Math.max(this.query.head_pos - this.at.length, 0));
      text = "" + start_str + wrapped_content + (source.slice(this.query['end_pos'] || 0));
      $inputor.val(text);
      $inputor.caret('pos', start_str.length + wrapped_content.length, {
        iframe: this.app.iframe
      });
    } else if (range = this.range) {
      pos = range.startOffset - (this.query.end_pos - this.query.head_pos) - this.at.length;
      range.setStart(range.endContainer, Math.max(pos, 0));
      range.setEnd(range.endContainer, range.endOffset);
      range.deleteContents();
      content_node = $(wrapped_content, this.app.document)[0];
      range.insertNode(content_node);
      range.setEndAfter(content_node);
      range.collapse(false);
      sel = this.app.window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (range = this.ie8_range) {
      range.moveStart('character', this.query.end_pos - this.query.head_pos - this.at.length);
      range.pasteHTML(wrapped_content);
      range.collapse(false);
      range.select();
    }
    if (!$inputor.is(':focus')) {
      $inputor.focus();
    }
    return $inputor.change();
  };

  Controller.prototype.render_view = function(data) {
    var search_key;
    search_key = this.get_opt("search_key");
    data = this.callbacks("sorter").call(this, this.query.text, data.slice(0, 1001), search_key);
    return this.view.render(data.slice(0, this.get_opt('limit')));
  };

  Controller.prototype.look_up = function() {
    var query, _callback;
    if (!(query = this.catch_query())) {
      return;
    }
    _callback = function(data) {
      if (data && data.length > 0) {
        return this.render_view(data);
      } else {
        return this.view.hide();
      }
    };
    this.model.query(query.text, $.proxy(_callback, this));
    return query;
  };

  return Controller;

})();

Model = (function() {
  function Model(context) {
    this.context = context;
    this.at = this.context.at;
    this.storage = this.context.$inputor;
  }

  Model.prototype.destroy = function() {
    return this.storage.data(this.at, null);
  };

  Model.prototype.saved = function() {
    return this.fetch() > 0;
  };

  Model.prototype.query = function(query, callback) {
    var data, search_key, _remote_filter;
    data = this.fetch();
    search_key = this.context.get_opt("search_key");
    data = this.context.callbacks('filter').call(this.context, query, data, search_key) || [];
    _remote_filter = this.context.callbacks('remote_filter');
    if (data.length > 0 || (!_remote_filter && data.length === 0)) {
      return callback(data);
    } else {
      return _remote_filter.call(this.context, query, callback);
    }
  };

  Model.prototype.fetch = function() {
    return this.storage.data(this.at) || [];
  };

  Model.prototype.save = function(data) {
    return this.storage.data(this.at, this.context.callbacks("before_save").call(this.context, data || []));
  };

  Model.prototype.load = function(data) {
    if (!(this.saved() || !data)) {
      return this._load(data);
    }
  };

  Model.prototype.reload = function(data) {
    return this._load(data);
  };

  Model.prototype._load = function(data) {
    if (typeof data === "string") {
      return $.ajax(data, {
        dataType: "json"
      }).done((function(_this) {
        return function(data) {
          return _this.save(data);
        };
      })(this));
    } else {
      return this.save(data);
    }
  };

  return Model;

})();

View = (function() {
  function View(context) {
    this.context = context;
    this.$el = $("<div class='atwho-view'><ul class='atwho-view-ul'></ul></div>");
    this.timeout_id = null;
    this.context.$el.append(this.$el);
    this.bind_event();
  }

  View.prototype.init = function() {
    var id;
    id = this.context.get_opt("alias") || this.context.at.charCodeAt(0);
    return this.$el.attr({
      'id': "at-view-" + id
    });
  };

  View.prototype.destroy = function() {
    return this.$el.remove();
  };

  View.prototype.bind_event = function() {
    var $menu;
    $menu = this.$el.find('ul');
    return $menu.on('mouseenter.atwho-view', 'li', function(e) {
      $menu.find('.cur').removeClass('cur');
      return $(e.currentTarget).addClass('cur');
    }).on('click', (function(_this) {
      return function(e) {
        _this.choose(e);
        return e.preventDefault();
      };
    })(this));
  };

  View.prototype.visible = function() {
    return this.$el.is(":visible");
  };

  View.prototype.choose = function(e) {
    var $li, content;
    if (($li = this.$el.find(".cur")).length) {
      content = this.context.insert_content_for($li);
      this.context.insert(this.context.callbacks("before_insert").call(this.context, content, $li), $li);
      this.context.trigger("inserted", [$li, e]);
      this.hide(e);
    }
    if (this.context.get_opt("hide_without_suffix")) {
      return this.stop_showing = true;
    }
  };

  View.prototype.reposition = function(rect) {
    var offset, overflowOffset, _ref, _window;
    _window = this.context.app.iframeStandalone ? this.context.app.window : window;
    if (rect.bottom + this.$el.height() - $(_window).scrollTop() > $(_window).height()) {
      rect.bottom = rect.top - this.$el.height();
    }
    if (rect.left > (overflowOffset = $(_window).width() - this.$el.width() - 5)) {
      rect.left = overflowOffset;
    }
    offset = {
      left: rect.left,
      top: rect.bottom
    };
    if ((_ref = this.context.callbacks("before_reposition")) != null) {
      _ref.call(this.context, offset);
    }
    this.$el.offset(offset);
    return this.context.trigger("reposition", [offset]);
  };

  View.prototype.next = function() {
    var cur, next;
    cur = this.$el.find('.cur').removeClass('cur');
    next = cur.next();
    if (!next.length) {
      next = this.$el.find('li:first');
    }
    return next.addClass('cur');
  };

  View.prototype.prev = function() {
    var cur, prev;
    cur = this.$el.find('.cur').removeClass('cur');
    prev = cur.prev();
    if (!prev.length) {
      prev = this.$el.find('li:last');
    }
    return prev.addClass('cur');
  };

  View.prototype.show = function() {
    var rect;
    if (this.stop_showing) {
      this.stop_showing = false;
      return;
    }
    this.context.mark_range();
    if (!this.visible()) {
      this.$el.show();
      this.context.trigger('shown');
    }
    if (rect = this.context.rect()) {
      return this.reposition(rect);
    }
  };

  View.prototype.hide = function(e, time) {
    var callback;
    if (!this.visible()) {
      return;
    }
    if (isNaN(time)) {
      this.context.reset_rect();
      this.$el.hide();
      return this.context.trigger('hidden', [e]);
    } else {
      callback = (function(_this) {
        return function() {
          return _this.hide();
        };
      })(this);
      clearTimeout(this.timeout_id);
      return this.timeout_id = setTimeout(callback, time);
    }
  };

  View.prototype.render = function(list) {
    var $li, $ul, item, li, tpl, _i, _len;
    if (!($.isArray(list) && list.length > 0)) {
      this.hide();
      return;
    }
    this.$el.find('ul').empty();
    $ul = this.$el.find('ul');
    tpl = this.context.get_opt('tpl');
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      item = list[_i];
      item = $.extend({}, item, {
        'atwho-at': this.context.at
      });
      li = this.context.callbacks("tpl_eval").call(this.context, tpl, item);
      $li = $(this.context.callbacks("highlighter").call(this.context, li, this.context.query.text));
      $li.data("item-data", item);
      $ul.append($li);
    }
    this.show();
    if (this.context.get_opt('highlight_first')) {
      return $ul.find("li:first").addClass("cur");
    }
  };

  return View;

})();

KEY_CODE = {
  DOWN: 40,
  UP: 38,
  ESC: 27,
  TAB: 9,
  ENTER: 13,
  CTRL: 17,
  P: 80,
  N: 78
};

DEFAULT_CALLBACKS = {
  before_save: function(data) {
    var item, _i, _len, _results;
    if (!$.isArray(data)) {
      return data;
    }
    _results = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      item = data[_i];
      if ($.isPlainObject(item)) {
        _results.push(item);
      } else {
        _results.push({
          name: item
        });
      }
    }
    return _results;
  },
  matcher: function(flag, subtext, should_start_with_space) {
    var match, regexp;
    flag = flag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    if (should_start_with_space) {
      flag = '(?:^|\\s)' + flag;
    }
    regexp = new RegExp(flag + '([A-Za-z0-9_\+\-]*)$|' + flag + '([^\\x00-\\xff]*)$', 'gi');
    match = regexp.exec(subtext);
    if (match) {
      return match[2] || match[1];
    } else {
      return null;
    }
  },
  filter: function(query, data, search_key) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      item = data[_i];
      if (~new String(item[search_key]).toLowerCase().indexOf(query.toLowerCase())) {
        _results.push(item);
      }
    }
    return _results;
  },
  remote_filter: null,
  sorter: function(query, items, search_key) {
    var item, _i, _len, _results;
    if (!query) {
      return items;
    }
    _results = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      item.atwho_order = new String(item[search_key]).toLowerCase().indexOf(query.toLowerCase());
      if (item.atwho_order > -1) {
        _results.push(item);
      }
    }
    return _results.sort(function(a, b) {
      return a.atwho_order - b.atwho_order;
    });
  },
  tpl_eval: function(tpl, map) {
    var error;
    try {
      return tpl.replace(/\$\{([^\}]*)\}/g, function(tag, key, pos) {
        return map[key];
      });
    } catch (_error) {
      error = _error;
      return "";
    }
  },
  highlighter: function(li, query) {
    var regexp;
    if (!query) {
      return li;
    }
    regexp = new RegExp(">\\s*(\\w*?)(" + query.replace("+", "\\+") + ")(\\w*)\\s*<", 'ig');
    return li.replace(regexp, function(str, $1, $2, $3) {
      return '> ' + $1 + '<strong>' + $2 + '</strong>' + $3 + ' <';
    });
  },
  before_insert: function(value, $li) {
    return value;
  },
  inserting_wrapper: function($inputor, content, suffix) {
    var new_suffix, wrapped_content;
    new_suffix = suffix === "" ? suffix : suffix || " ";
    if ($inputor.is('textarea, input')) {
      return '' + content + new_suffix;
    } else if ($inputor.attr('contentEditable') === 'true') {
      new_suffix = suffix === "" ? suffix : suffix || "&nbsp;";
      if (/firefox/i.test(navigator.userAgent)) {
        wrapped_content = "<span>" + content + new_suffix + "</span>";
      } else {
        suffix = "<span contenteditable='false'>" + new_suffix + "<span>";
        wrapped_content = "<span contenteditable='false'>" + content + suffix + "</span>";
      }
      if (this.app.document.selection) {
        wrapped_content = "<span contenteditable='true'>" + content + "</span>";
      }
      return wrapped_content;
    }
  }
};

Api = {
  load: function(at, data) {
    var c;
    if (c = this.controller(at)) {
      return c.model.load(data);
    }
  },
  setIframe: function(iframe, standalone) {
    this.setIframe(iframe, standalone);
    return null;
  },
  run: function() {
    return this.dispatch();
  },
  destroy: function() {
    this.shutdown();
    return this.$inputor.data('atwho', null);
  }
};

$.fn.atwho = function(method) {
  var result, _args;
  _args = arguments;
  result = null;
  this.filter('textarea, input, [contenteditable=""], [contenteditable=true]').each(function() {
    var $this, app;
    if (!(app = ($this = $(this)).data("atwho"))) {
      $this.data('atwho', (app = new App(this)));
    }
    if (typeof method === 'object' || !method) {
      return app.reg(method.at, method);
    } else if (Api[method] && app) {
      return result = Api[method].apply(app, Array.prototype.slice.call(_args, 1));
    } else {
      return $.error("Method " + method + " does not exist on jQuery.caret");
    }
  });
  return result || this;
};

$.fn.atwho["default"] = {
  at: void 0,
  alias: void 0,
  data: null,
  tpl: "<li data-value='${atwho-at}${name}'>${name}</li>",
  insert_tpl: "<span id='${id}'>${atwho-data-value}</span>",
  callbacks: DEFAULT_CALLBACKS,
  search_key: "name",
  suffix: void 0,
  hide_without_suffix: false,
  start_with_space: true,
  highlight_first: true,
  limit: 5,
  max_len: 20,
  display_timeout: 300,
  delay: null
};

  });
}).call(this);

(function (factory) {
  if(typeof define==='function' && define.amd){
    // AMD
    define(['jquery'],factory);
  }else if(typeof exports==='object') {
    // CommonJS
    factory(require('jquery'));
  }else {
    // Browser globals
    factory(jQuery);
  }
}(function($){
  // Prefix to use with cookie fallback
  var cookie_local_prefix="ls_";
  var cookie_session_prefix="ss_";

  // Get items from a storage
  function _get(storage){
    var l=arguments.length,s=window[storage],a=arguments,a1=a[1],vi,ret,tmp;
    if(l<2) throw new Error('Minimum 2 arguments must be given');
    else if($.isArray(a1)){
      // If second argument is an array, return an object with value of storage for each item in this array
      ret={};
      for(var i in a1){
        vi=a1[i];
        try{
          ret[vi]=JSON.parse(s.getItem(vi));
        }catch(e){
          ret[vi]=s.getItem(vi);
        }
      }
      return ret;
    }else if(l==2){
      // If only 2 arguments, return value directly
      try{
        return JSON.parse(s.getItem(a1));
      }catch(e){
        return s.getItem(a1);
      }
    }else{
      // If more than 2 arguments, parse storage to retrieve final value to return it
      // Get first level
      try{
        ret=JSON.parse(s.getItem(a1));
      }catch(e){
        throw new ReferenceError(a1+' is not defined in this storage');
      }
      // Parse next levels
      for(var i=2;i<l-1;i++){
        ret=ret[a[i]];
        if(ret===undefined) throw new ReferenceError([].slice.call(a,1,i+1).join('.')+' is not defined in this storage');
      }
      // If last argument is an array, return an object with value for each item in this array
      // Else return value normally
      if($.isArray(a[i])){
        tmp=ret;
        ret={};
        for(var j in a[i]){
          ret[a[i][j]]=tmp[a[i][j]];
        }
        return ret;
      }else{
        return ret[a[i]];
      }
    }
  }

  // Set items of a storage
  function _set(storage){
    var l=arguments.length,s=window[storage],a=arguments,a1=a[1],a2=a[2],vi,to_store={},tmp;
    if(l<2 || !$.isPlainObject(a1) && l<3) throw new Error('Minimum 3 arguments must be given or second parameter must be an object');
    else if($.isPlainObject(a1)){
      // If first argument is an object, set values of storage for each property of this object
      for(var i in a1){
        vi=a1[i];
        if(!$.isPlainObject(vi)) s.setItem(i,vi);
        else s.setItem(i,JSON.stringify(vi));
      }
      return a1;
    }else if(l==3){
      // If only 3 arguments, set value of storage directly
      if(typeof a2==='object') s.setItem(a1,JSON.stringify(a2));
      else s.setItem(a1,a2);
      return a2;
    }else{
      // If more than 3 arguments, parse storage to retrieve final node and set value
      // Get first level
      try{
        tmp=s.getItem(a1);
        if(tmp!=null) {
          to_store=JSON.parse(tmp);
        }
      }catch(e){
      }
      tmp=to_store;
      // Parse next levels and set value
      for(var i=2;i<l-2;i++){
        vi=a[i];
        if(!tmp[vi] || !$.isPlainObject(tmp[vi])) tmp[vi]={};
        tmp=tmp[vi];
      }
      tmp[a[i]]=a[i+1];
      s.setItem(a1,JSON.stringify(to_store));
      return to_store;
    }
  }

  // Remove items from a storage
  function _remove(storage){
    var l=arguments.length,s=window[storage],a=arguments,a1=a[1],to_store,tmp;
    if(l<2) throw new Error('Minimum 2 arguments must be given');
    else if($.isArray(a1)){
      // If first argument is an array, remove values from storage for each item of this array
      for(var i in a1){
        s.removeItem(a1[i]);
      }
      return true;
    }else if(l==2){
      // If only 2 arguments, remove value from storage directly
      s.removeItem(a1);
      return true;
    }else{
      // If more than 2 arguments, parse storage to retrieve final node and remove value
      // Get first level
      try{
        to_store=tmp=JSON.parse(s.getItem(a1));
      }catch(e){
        throw new ReferenceError(a1+' is not defined in this storage');
      }
      // Parse next levels and remove value
      for(var i=2;i<l-1;i++){
        tmp=tmp[a[i]];
        if(tmp===undefined) throw new ReferenceError([].slice.call(a,1,i).join('.')+' is not defined in this storage');
      }
      // If last argument is an array,remove value for each item in this array
      // Else remove value normally
      if($.isArray(a[i])){
        for(var j in a[i]){
          delete tmp[a[i][j]];
        }
      }else{
        delete tmp[a[i]];
      }
      s.setItem(a1,JSON.stringify(to_store));
      return true;
    }
  }

  // Remove all items from a storage
  function _removeAll(storage, reinit_ns){
    var keys=_keys(storage);
    for(var i in keys){
      _remove(storage,keys[i]);
    }
    // Reinitialize all namespace storages
    if(reinit_ns){
      for(var i in $.namespaceStorages){
        _createNamespace(i);
      }
    }
  }

  // Check if items of a storage are empty
  function _isEmpty(storage){
    var l=arguments.length,a=arguments,s=window[storage],a1=a[1];
    if(l==1){
      // If only one argument, test if storage is empty
      return (_keys(storage).length==0);
    }else if($.isArray(a1)){
      // If first argument is an array, test each item of this array and return true only if all items are empty
      for(var i=0; i<a1.length;i++){
        if(!_isEmpty(storage,a1[i])) return false;
      }
      return true;
    }else{
      // If more than 1 argument, try to get value and test it
      try{
        var v=_get.apply(this, arguments);
        // Convert result to an object (if last argument is an array, _get return already an object) and test each item
        if(!$.isArray(a[l-1])) v={'totest':v};
        for(var i in v){
          if(!(
            ($.isPlainObject(v[i]) && $.isEmptyObject(v[i])) ||
            ($.isArray(v[i]) && !v[i].length) ||
            (!v[i])
          )) return false;
        }
        return true;
      }catch(e){
        return true;
      }
    }
  }

  // Check if items of a storage exist
  function _isSet(storage){
    var l=arguments.length,a=arguments,s=window[storage],a1=a[1];
    if(l<2) throw new Error('Minimum 2 arguments must be given');
    if($.isArray(a1)){
      // If first argument is an array, test each item of this array and return true only if all items exist
      for(var i=0; i<a1.length;i++){
        if(!_isSet(storage,a1[i])) return false;
      }
      return true;
    }else{
      // For other case, try to get value and test it
      try{
        var v=_get.apply(this, arguments);
        // Convert result to an object (if last argument is an array, _get return already an object) and test each item
        if(!$.isArray(a[l-1])) v={'totest':v};
        for(var i in v){
          if(!(v[i]!==undefined && v[i]!==null)) return false;
        }
        return true;
      }catch(e){
        return false;
      }
    }
  }

  // Get keys of a storage or of an item of the storage
  function _keys(storage){
    var l=arguments.length,s=window[storage],a=arguments,a1=a[1],keys=[],o={};
    // If more than 1 argument, get value from storage to retrieve keys
    // Else, use storage to retrieve keys
    if(l>1){
      o=_get.apply(this,a);
    }else{
      o=s;
    }
    if(o._cookie){
      // If storage is a cookie, use $.cookie to retrieve keys
      for(var key in $.cookie()){
        if(key!='') {
          keys.push(key.replace(o._prefix,''));
        }
      }
    }else{
      for(var i in o){
        keys.push(i);
      }
    }
    return keys;
  }

  // Create new namespace storage
  function _createNamespace(name){
    if(!name || typeof name!="string") throw new Error('First parameter must be a string');
    if(storage_available){
      if(!window.localStorage.getItem(name)) window.localStorage.setItem(name,'{}');
      if(!window.sessionStorage.getItem(name)) window.sessionStorage.setItem(name,'{}');
    }else{
      if(!window.localCookieStorage.getItem(name)) window.localCookieStorage.setItem(name,'{}');
      if(!window.sessionCookieStorage.getItem(name)) window.sessionCookieStorage.setItem(name,'{}');
    }
    var ns={
      localStorage:$.extend({},$.localStorage,{_ns:name}),
      sessionStorage:$.extend({},$.sessionStorage,{_ns:name})
    };
    if($.cookie){
      if(!window.cookieStorage.getItem(name)) window.cookieStorage.setItem(name,'{}');
      ns.cookieStorage=$.extend({},$.cookieStorage,{_ns:name});
    }
    $.namespaceStorages[name]=ns;
    return ns;
  }

  // Test if storage is natively available on browser
  function _testStorage(name){
    if(!window[name]) return false;
    var foo='jsapi';
    try{
      window[name].setItem(foo,foo);
      window[name].removeItem(foo);
      return true;
    }catch(e){
      return false;
    }
  }

  // Check if storages are natively available on browser
  var storage_available=_testStorage('localStorage');

  // Namespace object
  var storage={
    _type:'',
    _ns:'',
    _callMethod:function(f,a){
      var p=[this._type],a=Array.prototype.slice.call(a),a0=a[0];
      if(this._ns) p.push(this._ns);
      if(typeof a0==='string' && a0.indexOf('.')!==-1){
        a.shift();
        [].unshift.apply(a,a0.split('.'));
      }
      [].push.apply(p,a);
      return f.apply(this,p);
    },
    // Get items. If no parameters and storage have a namespace, return all namespace
    get:function(){
      return this._callMethod(_get,arguments);
    },
    // Set items
    set:function(){
      var l=arguments.length,a=arguments,a0=a[0];
      if(l<1 || !$.isPlainObject(a0) && l<2) throw new Error('Minimum 2 arguments must be given or first parameter must be an object');
      // If first argument is an object and storage is a namespace storage, set values individually
      if($.isPlainObject(a0) && this._ns){
        for(var i in a0){
          _set(this._type,this._ns,i,a0[i]);
        }
        return a0;
      }else{
        var r=this._callMethod(_set,a);
        if(this._ns) return r[a0.split('.')[0]];
        else return r;
      }
    },
    // Delete items
    remove:function(){
      if(arguments.length<1) throw new Error('Minimum 1 argument must be given');
      return this._callMethod(_remove,arguments);
    },
    // Delete all items
    removeAll:function(reinit_ns){
      if(this._ns){
        _set(this._type,this._ns,{});
        return true;
      }else{
        return _removeAll(this._type, reinit_ns);
      }
    },
    // Items empty
    isEmpty:function(){
      return this._callMethod(_isEmpty,arguments);
    },
    // Items exists
    isSet:function(){
      if(arguments.length<1) throw new Error('Minimum 1 argument must be given');
      return this._callMethod(_isSet,arguments);
    },
    // Get keys of items
    keys:function(){
      return this._callMethod(_keys,arguments);
    }
  };

  // Use jquery.cookie for compatibility with old browsers and give access to cookieStorage
  if($.cookie){
    // sessionStorage is valid for one window/tab. To simulate that with cookie, we set a name for the window and use it for the name of the cookie
    if(!window.name) window.name=Math.floor(Math.random()*100000000);
    var cookie_storage={
      _cookie:true,
      _prefix:'',
      _expires:null,
      _path:null,
      _domain:null,
      setItem:function(n,v){
        $.cookie(this._prefix+n,v,{expires:this._expires,path:this._path,domain:this._domain});
      },
      getItem:function(n){
        return $.cookie(this._prefix+n);
      },
      removeItem:function(n){
        return $.removeCookie(this._prefix+n);
      },
      clear:function(){
        for(var key in $.cookie()){
          if(key!=''){
            if(!this._prefix && key.indexOf(cookie_local_prefix)===-1 && key.indexOf(cookie_session_prefix)===-1 || this._prefix && key.indexOf(this._prefix)===0) {
              $.removeCookie(key);
            }
          }
        }
      },
      setExpires:function(e){
        this._expires=e;
        return this;
      },
      setPath:function(p){
        this._path=p;
        return this;
      },
      setDomain:function(d){
        this._domain=d;
        return this;
      },
      setConf:function(c){
        if(c.path) this._path=c.path;
        if(c.domain) this._domain=c.domain;
        if(c.expires) this._expires=c.expires;
        return this;
      },
      setDefaultConf:function(){
        this._path=this._domain=this._expires=null;
      }
    };
    if(!storage_available){
      window.localCookieStorage=$.extend({},cookie_storage,{_prefix:cookie_local_prefix,_expires:365*10});
      window.sessionCookieStorage=$.extend({},cookie_storage,{_prefix:cookie_session_prefix+window.name+'_'});
    }
    window.cookieStorage=$.extend({},cookie_storage);
    // cookieStorage API
    $.cookieStorage=$.extend({},storage,{
      _type:'cookieStorage',
      setExpires:function(e){window.cookieStorage.setExpires(e); return this;},
      setPath:function(p){window.cookieStorage.setPath(p); return this;},
      setDomain:function(d){window.cookieStorage.setDomain(d); return this;},
      setConf:function(c){window.cookieStorage.setConf(c); return this;},
      setDefaultConf:function(){window.cookieStorage.setDefaultConf(); return this;}
    });
  }

  // Get a new API on a namespace
  $.initNamespaceStorage=function(ns){ return _createNamespace(ns); };
  if(storage_available) {
    // localStorage API
    $.localStorage=$.extend({},storage,{_type:'localStorage'});
    // sessionStorage API
    $.sessionStorage=$.extend({},storage,{_type:'sessionStorage'});
  }else{
    // localStorage API
    $.localStorage=$.extend({},storage,{_type:'localCookieStorage'});
    // sessionStorage API
    $.sessionStorage=$.extend({},storage,{_type:'sessionCookieStorage'});
  }
  // List of all namespace storage
  $.namespaceStorages={};
  // Remove all items in all storages
  $.removeAllStorages=function(reinit_ns){
    $.localStorage.removeAll(reinit_ns);
    $.sessionStorage.removeAll(reinit_ns);
    if($.cookieStorage) $.cookieStorage.removeAll(reinit_ns);
    if(!reinit_ns){
      $.namespaceStorages={};
    }
  }
}));

(function() {
  var EmojidexCategories, EmojidexData, EmojidexEmoji, EmojidexIndexes, EmojidexSearch, EmojidexUser, EmojidexUserFavorites, EmojidexUserHistory, EmojidexUtil,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.EmojidexClient = (function() {
    function EmojidexClient(options) {
      this.options = options;
      this.defaults = {
        locale: 'en',
        api_url: 'https://www.emojidex.com/api/v1/',
        cdn_url: 'http://cdn.emojidex.com/emoji',
        closed_net: false,
        min_query_len: 4,
        size_code: 'px32',
        detailed: false,
        limit: 32
      };
      this.options = $.extend({}, this.defaults, this.options);
      this.closed_net = this.options.closed_net;
      this.api_url = this.options.api_url;
      this.cdn_url = this.options.cdn_url;
      this.size_code = this.options.size_code;
      this.detailed = this.options.detailed;
      this.limit = this.options.limit;
      this.locale = this.options.locale;
      this.Data = new EmojidexData(this);
      this.Categories = new EmojidexCategories(this);
      this.User = new EmojidexUser(this);
      this.Indexes = new EmojidexIndexes(this);
      this.Util = new EmojidexUtil(this);
      this.Search = new EmojidexSearch(this);
      this.Emoji = new EmojidexEmoji(this);
    }

    return EmojidexClient;

  })();

  EmojidexCategories = (function() {
    function EmojidexCategories(EC) {
      var cat;
      this.EC = EC;
      this._categories = this.EC.Data.categories();
      cat = this.EC.Data.categories();
      if (cat === 0) {
        this.sync();
      }
    }

    EmojidexCategories.prototype.sync = function(callback, locale) {
      var _this = this;
      if (locale == null) {
        locale = this.EC.locale;
      }
      return $.ajax({
        url: this.EC.api_url + 'categories',
        dataType: 'json',
        data: {
          locale: locale
        },
        success: function(response) {
          _this._categories;
          return typeof callback === "function" ? callback(response.categories) : void 0;
        }
      });
    };

    EmojidexCategories.prototype.all = function() {
      return this._categories;
    };

    return EmojidexCategories;

  })();

  EmojidexData = (function() {
    function EmojidexData(EC) {
      this.EC = EC;
      this._def_auth_info = {
        status: 'none',
        user: '',
        token: null
      };
      this.storage = $.localStorage;
      if (!this.storage.isSet("emojidex")) {
        this.storage.set("emojidex", {});
      }
      if (!this.storage.isSet("emojidex.emoji")) {
        this.storage.set("emojidex.emoji", this.EC.options.emoji || []);
      }
      if (!this.storage.isSet("emojidex.history")) {
        this.storage.set("emojidex.history", this.EC.options.history || []);
      }
      if (!this.storage.isSet("emojidex.favorites")) {
        this.storage.set("emojidex.favorites", this.EC.options.favorites || []);
      }
      if (!this.storage.isSet("emojidex.auth_info")) {
        this.storage.set("emojidex.categories", this.EC.options.categories || []);
      }
      if (!this.storage.isSet("emojidex.auth_info")) {
        this.storage.set("emojidex.auth_info", this.EC.options.auth_info || this._def_auth_info);
      }
    }

    EmojidexData.prototype.emoji = function(emoji_set) {
      if (emoji_set != null) {
        this.storage.set("emojidex.emoji", emoji_set);
      }
      return this.storage.get("emojidex.emoji");
    };

    EmojidexData.prototype.favorites = function(favorites_set) {
      if (favorites_set != null) {
        this.storage.set("emojidex.favorites", favorites_set);
      }
      return this.storage.get("emojidex.favorites");
    };

    EmojidexData.prototype.history = function(history_set) {
      if (history_set != null) {
        this.storage.set("emojidex.history", history_set);
      }
      return this.storage.get("emojidex.history");
    };

    EmojidexData.prototype.categories = function(categories_set) {
      if (categories_set != null) {
        this.storage.set("emojidex.categories", categories_set);
      }
      return this.storage.get("emojidex.categories");
    };

    EmojidexData.prototype.auth_info = function(auth_info_set) {
      if (auth_info_set != null) {
        this.storage.set("emojidex.auth_info", auth_info_set);
      }
      return this.storage.get("emojidex.auth_info");
    };

    return EmojidexData;

  })();

  EmojidexEmoji = (function() {
    function EmojidexEmoji(EC) {
      this.EC = EC;
      this.combine = __bind(this.combine, this);
      this._emoji = this.EC.Data.emoji();
      if (this.EC.Data.emoji().length === 0) {
        this.seed();
      }
    }

    EmojidexEmoji.prototype.seed = function(locale) {
      if (locale == null) {
        locale = this.EC.locale;
      }
      switch (locale) {
        case 'en':
          this.EC.Indexes.user('emoji', this.combine);
          return this.EC.Indexes.user('emojidex', this.combine);
        case 'ja':
          this.EC.Indexes.user('絵文字', this.combine);
          return this.EC.Indexes.user('絵文字デックス', this.combine);
      }
    };

    EmojidexEmoji.prototype.all = function() {
      return this._emoji;
    };

    EmojidexEmoji.prototype.search = function(term, callback) {
      var moji, results;
      results = (function() {
        var _i, _len, _ref, _results;
        _ref = this._emoji;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          moji = _ref[_i];
          if (moji.code.match(term)) {
            _results.push(moji);
          }
        }
        return _results;
      }).call(this);
      if (typeof callback === "function") {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.starting = function(term, callback) {
      var moji, results;
      results = (function() {
        var _i, _len, _ref, _results;
        _ref = this._emoji;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          moji = _ref[_i];
          if (moji.code.match('^' + term)) {
            _results.push(moji);
          }
        }
        return _results;
      }).call(this);
      if (typeof callback === "function") {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.ending = function(term, callback) {
      var moji, results;
      results = (function() {
        var _i, _len, _ref, _results;
        _ref = this._emoji;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          moji = _ref[_i];
          if (moji.code.match(term + '$')) {
            _results.push(moji);
          }
        }
        return _results;
      }).call(this);
      if (typeof callback === "function") {
        callback(results);
      }
      return results;
    };

    EmojidexEmoji.prototype.tags = function(tags, opts) {
      var collect, moji, selection, tag, _i, _len;
      tags = this.EC.Util.breakout(tags);
      selection = opts.selection || this._emoji;
      collect = [];
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        tag = tags[_i];
        collect.concat((function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = selection.length; _j < _len1; _j++) {
            moji = selection[_j];
            if ($.inArray(tag, moji.tags) >= 0) {
              _results.push(moji);
            }
          }
          return _results;
        })());
      }
      return collect;
    };

    EmojidexEmoji.prototype.categories = function(categories, opts) {
      var category, collect, moji, source, _i, _len;
      categories = this.EC.Util.breakout(categories);
      source = opts.selection || this._emoji;
      collect = [];
      for (_i = 0, _len = categories.length; _i < _len; _i++) {
        category = categories[_i];
        collect.concat((function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = source.length; _j < _len1; _j++) {
            moji = source[_j];
            if (moji.category === category) {
              _results.push(moji);
            }
          }
          return _results;
        })());
      }
      return collect;
    };

    EmojidexEmoji.prototype.advanced = function(searchs) {
      return this.categories(searchs.categories, {
        selection: this.tags(searchs.tags, {
          selection: this.search(searchs.term)
        })
      });
    };

    EmojidexEmoji.prototype.combine = function(emoji) {
      return this._emoji = this.EC.Data.emoji($.extend(this._emoji, emoji));
    };

    EmojidexEmoji.prototype.flush = function() {
      return this._emoji = this.EC.Data.emoji([]);
    };

    return EmojidexEmoji;

  })();

  EmojidexIndexes = (function() {
    function EmojidexIndexes(EC) {
      this.EC = EC;
      this.results = [];
      this.cur_page = 1;
      this.count = 0;
    }

    EmojidexIndexes.prototype._indexesAPI = function(query, callback, opts, func) {
      var param,
        _this = this;
      param = {
        page: 1,
        limit: this.EC.limit,
        detailed: this.EC.detailed
      };
      $.extend(param, opts);
      if (func != null) {
        this.indexed_func = func;
        this.indexed = {
          query: query,
          callback: callback,
          param: param
        };
      }
      return $.ajax({
        url: this.EC.api_url + query,
        dataType: 'json',
        data: param,
        success: function(response) {
          _this.results = response.emoji;
          _this.cur_page = response.meta.page;
          _this.count = response.meta.count;
          _this.EC.Emoji.combine(response.emoji);
          return typeof callback === "function" ? callback(response.emoji) : void 0;
        },
        error: function(response) {
          return _this.results = [];
        }
      });
    };

    EmojidexIndexes.prototype.index = function(callback, opts) {
      return this._indexesAPI('emoji', callback, opts, this.index);
    };

    EmojidexIndexes.prototype.newest = function(callback, opts) {
      return this._indexesAPI('newest', callback, opts, this.newest);
    };

    EmojidexIndexes.prototype.popular = function(callback, opts) {
      return this._indexesAPI('popular', callback, opts, this.popular);
    };

    EmojidexIndexes.prototype.user = function(username, callback, opts) {
      return this._indexesAPI("users/" + username + "/emoji", callback, opts);
    };

    EmojidexIndexes.prototype.select = function(code, callback, opts) {
      return this.EC.Search.find(code, callback, opts);
    };

    EmojidexIndexes.prototype.next = function() {
      if (this.count === this.indexed.param.limit) {
        this.indexed.param.page++;
      }
      return this.indexed_func(this.indexed.data, this.indexed.callback, this.indexed.param, this.indexed_func);
    };

    EmojidexIndexes.prototype.prev = function() {
      if (this.indexed.param.page > 1) {
        this.indexed.param.page--;
      }
      return this.indexed_func(this.indexed.data, this.indexed.callback, this.indexed.param, this.indexed_func);
    };

    return EmojidexIndexes;

  })();

  EmojidexSearch = (function() {
    function EmojidexSearch(EC) {
      this.EC = EC;
      this.Util = new EmojidexUtil;
      this.results = [];
      this.cur_page = 1;
      this.count = 0;
    }

    EmojidexSearch.prototype._searchAPI = function(search_data, callback, opts, call_func) {
      var param,
        _this = this;
      param = {
        page: 1,
        limit: this.EC.limit,
        detailed: this.EC.detailed
      };
      $.extend(param, opts);
      this.searched_func = call_func.ajax;
      this.searched = {
        data: search_data,
        callback: callback,
        param: param
      };
      if (!this.EC.closed_net) {
        return $.ajax({
          url: this.EC.api_url + 'search/emoji',
          dataType: 'json',
          data: param,
          success: function(response) {
            _this.results = response.emoji;
            _this.cur_page = response.meta.page;
            _this.count = response.meta.count;
            _this.EC.Emoji.combine(response.emoji);
            return typeof callback === "function" ? callback(response.emoji) : void 0;
          },
          error: function(response) {
            return _this.results = [];
          }
        });
      } else {
        return typeof call_func.storage === "function" ? call_func.storage(search_data, callback) : void 0;
      }
    };

    EmojidexSearch.prototype.search = function(term, callback, opts) {
      opts = $.extend({
        code_cont: this.EC.Util.escape_term(term)
      }, opts);
      return this._searchAPI(term, callback, opts, {
        ajax: this.search,
        storage: this.EC.Emoji.search
      });
    };

    EmojidexSearch.prototype.starting = function(term, callback, opts) {
      opts = $.extend({
        code_sw: this.Util.escape_term(term)
      }, opts);
      return this._searchAPI(term, callback, opts, {
        ajax: this.starting,
        storage: this.EC.Emoji.starting
      });
    };

    EmojidexSearch.prototype.ending = function(term, callback, opts) {
      opts = $.extend({
        code_ew: this.Util.escape_term(term)
      }, opts);
      return this._searchAPI(term, callback, opts, {
        ajax: this.ending,
        storage: this.EC.Emoji.ending
      });
    };

    EmojidexSearch.prototype.tags = function(tags, callback, opts) {
      opts = $.extend({
        "tags[]": this.Util.breakout(tags)
      }, opts);
      return this._searchAPI(tags, callback, opts, {
        ajax: this.tags,
        storage: this.EC.Emoji.tags
      });
    };

    EmojidexSearch.prototype.advanced = function(search_details, callback, opts) {
      var param;
      param = {
        code_cont: this.Util.escape_term(search_details.term),
        "tags[]": this.Util.breakout(search_details.tags),
        "categories[]": this.Util.breakout(search_details.categories)
      };
      $.extend(param, opts);
      return this._searchAPI(search_details, callback, param, {
        ajax: this.advanced,
        storage: this.EC.Emoji.advanced
      });
    };

    EmojidexSearch.prototype.find = function(code, callback, opts) {
      var param,
        _this = this;
      param = {
        detailed: this.EC.detailed
      };
      $.extend(param, opts);
      if (this.EC.closed_net) {

      } else {
        return $.ajax({
          url: this.EC.api_url + ("/emoji/" + code),
          dataType: 'json',
          data: param,
          success: function(response) {
            _this.EC.Emoji.combine([response]);
            return typeof callback === "function" ? callback(response) : void 0;
          }
        });
      }
    };

    EmojidexSearch.prototype.next = function() {
      if (this.count === this.searched.param.limit) {
        this.searched.param.page++;
      }
      return this.searched_func(this.searched.data, this.searched.callback, this.searched.param, {
        ajax: this.searched_func
      });
    };

    EmojidexSearch.prototype.prev = function() {
      if (this.searched.param.page > 1) {
        this.searched.param.page--;
      }
      return this.searched_func(this.searched.data, this.searched.callback, this.searched.param, {
        ajax: this.searched_func
      });
    };

    return EmojidexSearch;

  })();

  EmojidexUser = (function() {
    function EmojidexUser(EC) {
      this.EC = EC;
      this.auth_info = this.EC.Data._def_auth_info;
      this.History = new EmojidexUserHistory(this.EC);
      this.Favorites = new EmojidexUserFavorites(this.EC);
      this._auto_login();
    }

    EmojidexUser.prototype._auto_login = function() {
      if (this.closed_net) {
        return;
      }
      this.auth_info = this.EC.Data.auth_info();
      if (this.auth_info['token'] != null) {
        return this.sync_user_data();
      } else {
        return this.logout();
      }
    };

    EmojidexUser.prototype.login = function(params) {
      switch (params.authtype) {
        case 'plain':
          return this.plain_auth(params.username, params.password, params.callback);
        case 'basic':
          return this.basic_auth(params.user, params.pass, params.callback);
        case 'google':
          return this.google_auth(params.callback);
        default:
          return this._auto_login();
      }
    };

    EmojidexUser.prototype.logout = function() {
      return this.EC.Data.auth_info(this.EC.Data._def_auth_info);
    };

    EmojidexUser.prototype.plain_auth = function(username, password, callback) {
      var _this = this;
      if (callback == null) {
        callback = null;
      }
      return $.ajax({
        url: this.EC.api_url + 'users/authenticate',
        dataType: 'json',
        data: {
          username: username,
          password: password
        },
        success: function(response) {
          _this._set_auth_from_response(response);
          return typeof callback === "function" ? callback(_this.auth_info) : void 0;
        },
        error: function(response) {
          return _this.auth_info = _this.EC.Data.auth_info({
            status: response.auth_status,
            token: null,
            user: ''
          });
        }
      });
    };

    EmojidexUser.prototype.basic_auth = function(user, pass, callback) {
      if (callback == null) {
        callback = null;
      }
      return false;
    };

    EmojidexUser.prototype.google_auth = function(callback) {
      if (callback == null) {
        callback = null;
      }
      return false;
    };

    EmojidexUser.prototype.set_auth = function(user, token) {
      this.auth_info = this.EC.Data.auth_info({
        status: 'verified',
        token: token,
        user: user
      });
      return this.sync_user_data();
    };

    EmojidexUser.prototype._set_auth_from_response = function(response) {
      this.auth_info = this.EC.Data.auth_info({
        status: response.auth_status,
        token: response.auth_token,
        user: response.auth_user
      });
      return this.sync_user_data();
    };

    EmojidexUser.prototype.sync_user_data = function() {
      this.History.token = this.Favorites.token = this.auth_info['token'];
      this.Favorites.sync();
      return this.History.sync();
    };

    return EmojidexUser;

  })();

  EmojidexUserFavorites = (function() {
    function EmojidexUserFavorites(EC, token) {
      this.EC = EC;
      if (token == null) {
        token = null;
      }
      this.token = token;
      this._favorites = this.EC.Data.favorites();
    }

    EmojidexUserFavorites.prototype._favoritesAPI = function(options) {
      var ajax_obj;
      if (this.token != null) {
        ajax_obj = {
          url: this.EC.api_url + 'users/favorites',
          dataType: 'json'
        };
        return $.ajax($.extend(ajax_obj, options));
      }
    };

    EmojidexUserFavorites.prototype.get = function(callback) {
      var options,
        _this = this;
      options = {
        data: {
          auth_token: this.token
        },
        success: function(response) {
          _this._favorites = _this.EC.Data.favorites(response);
          return typeof callback === "function" ? callback(_this._favorites) : void 0;
        }
      };
      return this._favoritesAPI(options);
    };

    EmojidexUserFavorites.prototype.set = function(emoji_code) {
      var options,
        _this = this;
      options = {
        type: 'POST',
        data: {
          auth_token: this.token,
          emoji_code: emoji_code
        },
        success: function(response) {
          _this._favorites.push(response);
          return _this.EC.Data.favorites(_this._favorites);
        }
      };
      return this._favoritesAPI(options);
    };

    EmojidexUserFavorites.prototype.unset = function(emoji_code) {
      var options,
        _this = this;
      options = {
        type: 'DELETE',
        data: {
          auth_token: this.token,
          emoji_code: emoji_code
        },
        success: function(response) {
          return _this.sync();
        }
      };
      return this._favoritesAPI(options);
    };

    EmojidexUserFavorites.prototype.sync = function() {
      return this.get();
    };

    EmojidexUserFavorites.prototype.all = function() {
      return this._favorites;
    };

    return EmojidexUserFavorites;

  })();

  EmojidexUserHistory = (function() {
    function EmojidexUserHistory(EC, token) {
      this.EC = EC;
      if (token == null) {
        token = null;
      }
      this.token = token;
      this._history = this.EC.Data.history();
    }

    EmojidexUserHistory.prototype._historyAPI = function(options) {
      var ajax_obj;
      if (this.token != null) {
        ajax_obj = {
          url: this.EC.api_url + 'users/history',
          dataType: 'json'
        };
        return $.ajax($.extend(ajax_obj, options));
      }
    };

    EmojidexUserHistory.prototype.get = function() {
      var options,
        _this = this;
      options = {
        data: {
          auth_token: this.token
        },
        success: function(response) {
          return _this._history = _this.EC.Data.history(response);
        }
      };
      return this._historyAPI(options);
    };

    EmojidexUserHistory.prototype.set = function(emoji_code) {
      var options,
        _this = this;
      options = {
        type: 'POST',
        data: {
          auth_token: this.token,
          emoji_code: emoji_code
        },
        success: function(response) {
          var entry, i, _i, _len, _ref;
          _ref = _this._history;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            entry = _ref[i];
            if (entry.emoji_code === response.emoji_code) {
              _this._history[i] = response;
              _this.EC.Data.history(_this._history);
              return response;
            }
          }
        }
      };
      return this._historyAPI(options);
    };

    EmojidexUserHistory.prototype.sync = function() {
      return this.get();
    };

    EmojidexUserHistory.prototype.all = function() {
      return this._history;
    };

    return EmojidexUserHistory;

  })();

  EmojidexUtil = (function() {
    function EmojidexUtil() {}

    EmojidexUtil.prototype.escape_term = function(term) {
      return term.replace(/\s/g, '_').replace(/(\(|\))/g, '\\$1');
    };

    EmojidexUtil.prototype.de_escape_term = function(term) {
      return term.replace(/_/g, ' ');
    };

    EmojidexUtil.prototype.breakout = function(items) {
      if (items == null) {
        return [];
      }
      if (!(items instanceof Array)) {
        return items = [items];
      }
    };

    EmojidexUtil.prototype.simplify = function(emoji, size_code) {
      var moji, _i, _len, _results;
      if (emoji == null) {
        emoji = this.results;
      }
      if (size_code == null) {
        size_code = this.size_code;
      }
      _results = [];
      for (_i = 0, _len = emoji.length; _i < _len; _i++) {
        moji = emoji[_i];
        _results.push({
          code: this.escape_term(moji.code),
          img_url: "" + this.cdn_url + "/" + size_code + "/" + (this.escape_term(moji.code)) + ".png"
        });
      }
      return _results;
    };

    return EmojidexUtil;

  })();

}).call(this);

(function() {
  var AutoComplete;

  (function($, window, document) {
    var Plugin, defaults, pluginName;
    pluginName = "emojidexAutocomplete";
    defaults = {
      limit: 10,
      insertImg: true
    };
    Plugin = (function() {
      function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.autocomplete = new AutoComplete(this);
        this.autocomplete.setAutoComplete();
      }

      return Plugin;

    })();
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        if (!$.data(this, "plugin_" + pluginName)) {
          return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        }
      });
    };
  })(jQuery, window, document);

  AutoComplete = (function() {
    function AutoComplete(plugin) {
      this.plugin = plugin;
      this.searching_num = 0;
    }

    AutoComplete.prototype.setAutoComplete = function() {
      var at_init, ec, getMatchString, getRegexp, onHighlighter, setAtwho, setSearchedEmojiData,
        _this = this;
      setAtwho = function(at_options) {
        return $(_this.plugin.element).atwho(at_options).on('reposition.atwho', function(e) {
          return $(e.currentTarget).atwho(at_options);
        }).on('hidden.atwho', function(e) {
          return $(e.currentTarget).atwho(at_options);
        });
      };
      setSearchedEmojiData = function(at_obj, match_string) {
        var num, updateAtwho;
        updateAtwho = function(searched_data, at_bak) {
          var at_options;
          at_options = {
            data: searched_data,
            callbacks: {
              highlighter: onHighlighter,
              matcher: function(flag, subtext, should_startWithSpace) {
                var match;
                return match = getMatchString(subtext, getRegexp(flag, should_startWithSpace));
              }
            }
          };
          return at_bak.$inputor.atwho('destroy').atwho($.extend({}, at_bak.setting, at_options)).atwho('run');
        };
        num = ++_this.searching_num;
        ec.Search.search(match_string, function(response) {
          var emoji, searched_data;
          searched_data = (function() {
            var _i, _len, _ref, _results;
            _ref = ec.Search.results;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              emoji = _ref[_i];
              _results.push({
                code: emoji.code.replace(/\s/g, '_'),
                img_url: "http://cdn.emojidex.com/emoji/px32/" + (emoji.code.replace(/\s/g, '_')) + ".png"
              });
            }
            return _results;
          })();
          if (_this.searching_num === num) {
            if (searched_data.length) {
              updateAtwho(searched_data, at_obj);
            }
            return _this.searching_num = 0;
          }
        });
        return match_string;
      };
      getRegexp = function(flag, should_startWithSpace) {
        var regexp, _a, _y;
        _a = decodeURI("%C3%80");
        _y = decodeURI("%C3%BF");
        return regexp = new RegExp("[：" + flag + "]([^：:;@&#~\!\$\+\?\%\*\f\n\r\\\/]+)$", 'gi');
      };
      getMatchString = function(subtext, regexp) {
        var match;
        match = regexp.exec(subtext);
        match = match ? match[2] || match[1] : null;
        return match;
      };
      onHighlighter = function(li, query) {
        var regexp;
        if (!query) {
          return li;
        }
        regexp = new RegExp(">\\s*([^:;@&#~\!\$\+\?\%\*\f\n\r\\\/]*?)(" + (query.replace(/(\(|\))/g, '\\$1')) + ")([^:;@&#~\!\$\+\?\%\*\f\n\r\\\/]*)\\s*<", 'ig');
        return li.replace(regexp, function(str, $1, $2, $3) {
          return "> " + $1 + "<strong>" + $2 + "</strong>" + $3 + " <";
        });
      };
      ec = new EmojidexClient;
      at_init = {
        at: ':',
        suffix: '',
        limit: this.plugin.options.limit,
        search_key: "code",
        tpl: "<li data-value=':${code}:'><img src='${img_url}' height='20' width='20'></img>${code}</li>",
        insert_tpl: this.plugin.options.insertImg ? "<img src='${img_url}' height='20' width='20' />" : ":${code}:",
        callbacks: {
          highlighter: onHighlighter,
          matcher: function(flag, subtext, should_startWithSpace) {
            var match;
            match = getMatchString(subtext, getRegexp(flag, should_startWithSpace));
            if (match) {
              return setSearchedEmojiData(this, match);
            }
          }
        }
      };
      return setAtwho(at_init);
    };

    return AutoComplete;

  })();

}).call(this);

(function() {
  var Pallet;

  (function($, window, document) {
    var Plugin, defaults, pluginName;
    pluginName = "emojidexPallet";
    defaults = {
      switch_element: $("#pallet-btn")
    };
    Plugin = (function() {
      function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.pallet = new Pallet;
      }

      return Plugin;

    })();
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        if (!$.data(this, "plugin_" + pluginName)) {
          return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        }
      });
    };
  })(jQuery, window, document);

  Pallet = (function() {
    function Pallet(emoji_data_array, element, options) {
      this.emoji_data_array = emoji_data_array;
      this.element = element;
      this.options = options;
      this.KEY_ESC = 27;
      this.KEY_TAB = 9;
    }

    Pallet.prototype.setPallet = function() {};

    return Pallet;

  })();

}).call(this);

(function() {
  var Replacer, ReplacerSearch, ReplacerUser,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function($, window, document) {
    var Plugin, defaults, pluginName;
    pluginName = "emojidexReplace";
    defaults = {
      apiURL: 'https://www.emojidex.com/api/v1',
      cdnURL: 'http://cdn.emojidex.com/emoji',
      sizeCode: 'px32',
      onComplete: void 0,
      useUserEmoji: false,
      userNames: ['emoji', 'emojidex'],
      regexpUTF: /😧🏿|😙🏾|😠🏾|😢🏾|😥🏾|😩🏾|😯🏾|😂🏿|😃🏿|😉🏿|😉🏾|😊🏿|😋🏿|😓🏿|😔🏿|😗🏿|😙🏿|😚🏿|😛🏿|😟🏿|😠🏿|😢🏿|😤🏿|😥🏿|😨🏿|😩🏿|😪🏿|😬🏿|😭🏿|😯🏿|😱🏿|😳🏿|😴🏿|😷🏿|😒🏿|️9️⃣|😌🏿|😁🏾|😁🏿|😏🏿|😄🏾|😄🏿|😆🏾|😆🏿|😃🏾|😊🏾|😑🏾|😓🏾|😔🏾|😕🏾|😗🏾|😞🏾|😟🏾|😣🏾|😤🏾|😫🏾|😇🏿|😎🏿|😐🏿|😑🏿|😕🏿|😖🏿|😞🏿|😣🏿|😦🏿|😛🏾|😫🏿|😮🏿|😰🏿|😲🏿|😵🏿|😶🏿|😅🏿|😘🏿|😝🏾|😝🏿|😜🏾|😜🏿|😍🏿|😁🏽|😍🏾|😏🏾|😌🏾|😘🏾|😒🏾|😷🏾|😶🏾|😵🏾|😴🏾|😳🏾|😲🏾|😱🏾|😰🏾|😮🏾|😭🏾|😬🏾|😪🏾|😨🏾|😧🏾|😦🏾|😖🏾|😎🏾|😐🏾|😇🏾|😋🏾|😂🏾|😅🏾|️8️⃣|🇨🇳|🇩🇪|🇪🇸|🇫🇷|🇬🇧|🇮🇹|🇯🇵|🇰🇷|🇷🇺|🇺🇸|😚🏾|️7️⃣|️1️⃣|️2️⃣|️3️⃣|️4️⃣|️5️⃣|️6️⃣|️0️⃣|#️⃣|☺🏾|☺🏿|🇵|🇶|🇷|🇸|🇹|🇺|🇻|🇼|🇽|🇾|🇿|🔌|🌑|🌕|🕄|🕃|🕂|🕁|🕀|〽️|🖖|🈁|🈂|🈚|🈯|🈲|🈳|🈴|🈵|🈶|🈷|🈸|🈹|🈺|🉐|🉑|🌀|🌁|🌂|🌃|🌄|🌅|🌆|🌇|🌈|🌉|🌊|🌋|🌌|🌍|🌎|🌏|🌐|🌒|🛅|🌔|🌖|🛄|🌘|🌙|🌚|🌛|🌜|🌝|🌞|🌟|🌠|🌡|🌢|🌣|🌤|🌥|🌦|🌧|🌨|🌩|🌪|🌫|🌬|🌰|🌱|🌲|🌳|🌴|🌵|🌶|🌷|🌸|🌹|🌺|🌻|🌼|🌽|🌾|🌿|🍀|🍁|🍂|🍃|🍄|🍅|🍆|🍇|🍈|🍉|🍊|🍋|🍌|🍍|🍎|🍏|🍐|🍑|🍒|🍓|🍔|🍕|🍖|🍗|🍘|🍙|🍚|🍛|🍜|🍝|🍞|🍟|🍠|🍡|🍢|🍣|🍤|🍥|🍦|🍧|🍨|🍩|🍪|🍫|🍬|🍭|🍮|🍯|🍰|🍱|🍲|🍳|🍴|🍵|🍶|🍷|🍸|🍹|🍺|🍻|🍼|🍽|🎀|🎁|🎂|🎃|🎄|🎅|🎆|🎇|🎈|🎉|🎊|🎋|🎌|🎍|🎎|🎏|🎐|🎑|🎒|🎓|🎔|🎕|🎖|🎗|🎘|🎙|🎚|🎛|🎜|🎝|🎞|🎟|🎠|🎡|🎢|🎣|🎤|🎥|🎦|🎧|🎨|🎩|🎪|🎫|🎬|🎭|🎮|🎯|🎰|🎱|🎲|🎳|🎴|🎵|🎶|🎷|🎸|🎹|🎺|🎻|🎼|🎽|🎾|🎿|🏀|🏁|🏂|🏃|🏄|🏅|🏆|🏇|🏈|🏉|🏊|🏋|🏌|🏍|🏎|🏔|🏕|🏖|🏗|🏘|🏙|🏚|🏛|🏜|🏝|🏞|🏟|🏠|🏡|🏢|🏣|🏤|🏥|🏦|🏧|🏨|🏩|🏪|🏫|🏬|🏭|🏮|🏯|🏰|🏱|🏲|🏳|🏴|🏵|🏶|🏷|🐀|🐁|🐂|🐃|🐄|🐅|🐆|🐇|🐈|🐉|🐊|🐋|🐌|🐍|🐎|🐏|🐐|🐑|🐒|🐓|🐔|🐕|🐖|🐗|🐘|🐙|🐚|🐛|🐜|🐝|🐞|🐟|🐠|🐡|🐢|🐣|🐤|🐥|🐦|🐧|🐨|🐩|🐪|🐫|🐬|🐭|🐮|🐯|🐰|🐱|🐲|🐳|🐴|🐵|🐶|🐷|🐸|🐹|🐺|🐻|🐼|🐽|🐾|🐿|👀|👁|👂|👃|🗢|👅|👆|👇|👈|👉|👊|👋|👌|👍|👎|👏|👑|👒|👓|👔|👕|👖|👗|👘|👙|👚|👛|👜|👝|👞|👟|👠|👡|👢|👣|👦|👧|👨|👩|👪|👫|👬|👭|👮|👯|👱|👲|👴|👵|👶|👸|👻|👼|👽|👾|👿|💀|💁|💂|💃|💄|💅|💆|💇|💈|💉|💊|💋|💍|💎|💏|💐|💘|💡|💢|💣|💤|💥|💧|💨|💩|💪|💫|💯|💰|💲|💳|💴|💵|💶|💷|💹|💺|💻|💼|💽|💾|💿|📀|📁|📅|📆|📇|📈|📋|📌|📎|📒|📓|📔|📖|📘|📙|📚|📛|📜|📝|📟|📠|📡|📢|📣|📦|📧|📩|📫|📭|📮|📯|📰|📱|📲|📷|📹|📺|📻|📼|🔀|🔁|🔄|🔇|🔈|🔉|🔋|🃏|🔍|🔎|🔐|🔑|🔒|🔓|🔔|🔖|🔗|🔙|🔚|🔛|🔜|🔝|🔡|🔢|🔣|🔤|🔥|🔦|🔧|🔨|🔪|🔫|🔭|🔰|🔱|🔲|🔳|🔵|🔶|🔷|🔸|🔹|🔺|🔻|🔽|🕅|🕐|🕑|🕒|🕓|🕔|🕕|🕖|🕗|🕘|🕙|🕚|🕛|🕜|🕝|🕞|🕟|🕠|🕡|🕢|🕣|🕤|🕫|🕬|🕯|🕱|🕳|🕷|🕹|🕻|🕼|🕽|🕾|🕿|🖀|🖁|🖄|🖆|🖊|🖋|🖎|🖏|🖒|🖔|🖧|🖨|🖪|🖫|🖬|🖲|🖴|🖵|🖶|🖷|🖺|🖿|🗀|🗀|🗃|🗄|🗅|🗈|🗉|🗊|🗌|🗍|🗎|🗏|🗐|🗑|🗕|🗖|🗗|🗙|🗚|🗛|🗜|🗝|🗞|🗟|🗣|🗤|🗥|🗧|🗨|🗩|🗪|🗫|🗬|🗭|🗯|🗯|🗱|🗳|🗵|🗶|🗷|🗸|🗹|🗺|🗻|🗼|🗾|🗿|😀|😁|😂|😃|😄|😅|😆|😇|😈|😉|😊|😋|😌|😍|😎|😏|😑|😒|😓|😔|😕|😖|😗|😜|😝|😞|😟|😠|😡|😢|😣|😤|😦|😧|😨|😩|😪|😫|😬|😭|😯|😰|😱|😲|😳|😴|😵|😶|😷|😹|😼|🙊|🚂|🚄|🚅|🚔|🚕|🚘|🚛|🚞|🚟|🚠|🚡|🚧|🚩|🚪|🚬|🚮|🚱|🚴|🚶|🚹|🚺|🚻|🚽|🚾|🚿|🛀|🛁|🅿|🆒|🆓|🆔|🆕|🆖|🆗|🆘|🆙|🆚|🇴|🛃|🛂|🚼|🚸|🚷|🚵|🚳|⌚️|🚲|🚰|🚯|Ⓜ️|🚭|🚫|🚨|🚦|🚥|🚤|🚣|🚢|🚝|🚜|🚚|🚙|🚗|🚖|🚓|🚒|🚑|🚐|🚏|🚎|🚍|🚌|🚋|🚊|🚉|🚈|🚇|🚆|🚃|🚁|🚀|🙏|🙎|🙍|🙌|🙋|🙉|🙈|🙇|🙆|🙅|🙀|😿|😾|🀄|🅰|🅱|🅾|🆎|🆑|🇦|🇧|🇨|🇩|🇪|🇫|🇬|🇭|🇮|🇯|🇰|🇱|🇲|🇳|👐|👤|👥|👰|👳|👷|👹|👺|💌|💑|💒|💓|💔|💕|💖|💗|💙|💚|💛|💜|💝|💞|💟|💦|💬|💭|💮|💱|💸|📂|📃|📄|📉|📊|📍|📏|📐|📑|📕|📗|📞|📤|📥|📨|📪|📬|📳|📴|📵|📶|📸|📽|📾|🔂|🔃|🔅|🔆|🔊|🔏|🔕|🔘|🔞|🔟|🔠|🔩|🔬|🔮|🔯|🔴|🔼|🔾|🔿|🕄|🕆|🕇|🕈|🕉|🕊|🕥|🕦|🕧|🕨|🕩|🕪|🕭|🕰|🕲|🕴|🕵|🕶|🕸|🖂|🖃|🖅|🖇|🖈|🖉|🖌|🖍|🖐|🖑|🖓|🖗|🖘|🖙|🖚|🖛|🖜|🖝|🖞|🖟|🖠|🖡|🖢|🖣|🖥|🖦|🖩|🖭|🖮|🖯|🖰|🖱|🖳|🖸|🖹|🖻|🖼|🖽|🖾|🗂|🗆|🗇|🗋|🗒|🗓|🗔|🗘|🗠|🗡|🗦|🗰|🗲|🗴|🗽|😐|😘|😙|😚|😛|😥|😮|😸|😺|😻|😽|☯|⭕|⬜|⬛|⤵|⤴|➿|➗|➖|❌|✴|✳|✖|✔|✒|✏|✂|⛪|⛄|⚾|⚽|⚡|⚠|♥|♣|♠|♓|♎|♍|♌|♋|♊|♉|♈|☺|☕|☑|☎|☁|☀|◼|◻|▫|▪|⏳|⏬|⌛|↪|↙|↘|↗|↖|↔|™|☾|☽|©|®|‼|⁉|ℹ|↕|⏩|⏪|⏫|⏰|▶|◀|☔|☝|♏|♐|♑|♒|♦|♨|♻|♿|⚓|⚪|⚫|⛅|⛎|⛔|⛵|✈|✊|✋|✡|✨|❄|❇|❎|❓|❔|❕|❗|❤|➕|➡|➰|⬅|⬆|⬇|〰|㊗|㊙|↩|◽|◾|✌|✉|✅|⛽|⛺|⛳|⛲|☄|★|☈|☊|☋|☌|☍|☖|☗|☙|☚|☛|☠|☡|☢|☣|☤|☥|☦|☧|☨|☩|☪|☫|☬|☭|☮|⭐|☰|☱|☲|☳|☴|☵|☶|☷|☸|☹|☻|☼|☿|♀|♁|♂|♃|♄|♅|♆|♇|♔|♕|♖|♗|♘|♙|♚|♛|♜|♝|♞|♟|♩|♬|♭|♮|♯|♰|♱|♳|♴|♵|♶|♷|♸|♹|♺|♼|♽|⚀|⚁|⚂|⚃|⚄|⚅|⚆|⚇|⚈|⚉|⚊|⚋|⚌|⚍|⚎|⚏|⚒|⚔|⚕|⚖|⚗|⚘|⚙|⚛|⚜|⚝|⚞|⚟|⚢|⚣|⚤|⚥|⚦|⚧|⚨|⚩|⚭|⚮|⚯|⚰|⚱|⚲|⚳|⚴|⚵|⚶|⚷|⚸|⚹|⚺|⚻|⚼|⛀|⛁|⛂|⛃|⛇|⛉|⛊|⛋|⛌|⛍|⛏|⛐|⛑|⛒|⛓|⛕|⛖|⛗|⛘|⛙|⛚|⛛|⛜|⛝|⛞|⛟|⛠|⛡|⛣|⛤|⛧|⛩|⛬|⛭|⛮|⛯|⛱|⛶|⛸|⛹|⛼|⛿/g,
      utfEmojiData: [
        {
          utf: '😙🏾',
          code: 'kissing_smiling_eyes(br)'
        }, {
          utf: '😚🏾',
          code: 'kissing_closed_eyes(br)'
        }, {
          utf: '😛🏾',
          code: 'stuck_out_tongue(br)'
        }, {
          utf: '😠🏾',
          code: 'angry(br)'
        }, {
          utf: '😢🏾',
          code: 'cry(br)'
        }, {
          utf: '😥🏾',
          code: 'disappointed_relieved(br)'
        }, {
          utf: '😩🏾',
          code: 'weary(br)'
        }, {
          utf: '😯🏾',
          code: 'hushed(br)'
        }, {
          utf: '😂🏿',
          code: 'joy(bk)'
        }, {
          utf: '😃🏿',
          code: 'smiley(bk)'
        }, {
          utf: '😉🏿',
          code: 'wink(bk)'
        }, {
          utf: '😉🏾',
          code: 'wink(br)'
        }, {
          utf: '😊🏿',
          code: 'blush(bk)'
        }, {
          utf: '😋🏿',
          code: 'yum(bk)'
        }, {
          utf: '😓🏿',
          code: 'sweat(bk)'
        }, {
          utf: '😔🏿',
          code: 'pensive(bk)'
        }, {
          utf: '😗🏿',
          code: 'kissing(bk)'
        }, {
          utf: '😙🏿',
          code: 'kissing_smiling_eyes(bk)'
        }, {
          utf: '😚🏿',
          code: 'kissing_closed_eyes(bk)'
        }, {
          utf: '😛🏿',
          code: 'stuck_out_tongue(bk)'
        }, {
          utf: '😟🏿',
          code: 'worried(bk)'
        }, {
          utf: '😠🏿',
          code: 'angry(bk)'
        }, {
          utf: '😢🏿',
          code: 'cry(bk)'
        }, {
          utf: '😤🏿',
          code: 'triumph(bk)'
        }, {
          utf: '😥🏿',
          code: 'disappointed_relieved(bk)'
        }, {
          utf: '😨🏿',
          code: 'fearful(bk)'
        }, {
          utf: '😩🏿',
          code: 'weary(bk)'
        }, {
          utf: '😪🏿',
          code: 'sleepy(bk)'
        }, {
          utf: '😬🏿',
          code: 'grimacing(bk)'
        }, {
          utf: '😭🏿',
          code: 'sob(bk)'
        }, {
          utf: '😯🏿',
          code: 'hushed(bk)'
        }, {
          utf: '😱🏿',
          code: 'scream(bk)'
        }, {
          utf: '😳🏿',
          code: 'flushed(bk)'
        }, {
          utf: '😴🏿',
          code: 'sleeping(bk)'
        }, {
          utf: '😷🏿',
          code: 'mask(bk)'
        }, {
          utf: '😒🏿',
          code: 'unamused(bk)'
        }, {
          utf: '☺🏿',
          code: 'relaxed(bk)'
        }, {
          utf: '😌🏿',
          code: 'relieved(bk)'
        }, {
          utf: '😁🏾',
          code: 'grin(br)'
        }, {
          utf: '😁🏿',
          code: 'grin(bk)'
        }, {
          utf: '😏🏿',
          code: 'smirk(bk)'
        }, {
          utf: '😄🏾',
          code: 'smile(br)'
        }, {
          utf: '😄🏿',
          code: 'smile(bk)'
        }, {
          utf: '😆🏾',
          code: 'laughing(br)'
        }, {
          utf: '😆🏿',
          code: 'laughing(bk)'
        }, {
          utf: '😃🏾',
          code: 'smiley(br)'
        }, {
          utf: '😊🏾',
          code: 'blush(br)'
        }, {
          utf: '😑🏾',
          code: 'expressionless(br)'
        }, {
          utf: '😓🏾',
          code: 'sweat(br)'
        }, {
          utf: '😔🏾',
          code: 'pensive(br)'
        }, {
          utf: '😕🏾',
          code: 'confused(br)'
        }, {
          utf: '😗🏾',
          code: 'kissing(br)'
        }, {
          utf: '😞🏾',
          code: 'disappointed(br)'
        }, {
          utf: '😟🏾',
          code: 'worried(br)'
        }, {
          utf: '😣🏾',
          code: 'persevere(br)'
        }, {
          utf: '😤🏾',
          code: 'triumph(br)'
        }, {
          utf: '😫🏾',
          code: 'tired_face(br)'
        }, {
          utf: '😇🏿',
          code: 'innocent(bk)'
        }, {
          utf: '😎🏿',
          code: 'sunglasses(bk)'
        }, {
          utf: '😐🏿',
          code: 'neutral_face(bk)'
        }, {
          utf: '😑🏿',
          code: 'expressionless(bk)'
        }, {
          utf: '😕🏿',
          code: 'confused(bk)'
        }, {
          utf: '😖🏿',
          code: 'confounded(bk)'
        }, {
          utf: '😞🏿',
          code: 'disappointed(bk)'
        }, {
          utf: '😣🏿',
          code: 'persevere(bk)'
        }, {
          utf: '😦🏿',
          code: 'frowning(bk)'
        }, {
          utf: '😧🏿',
          code: 'anguished(bk)'
        }, {
          utf: '😫🏿',
          code: 'tired_face(bk)'
        }, {
          utf: '😮🏿',
          code: 'open_mouth(bk)'
        }, {
          utf: '😰🏿',
          code: 'cold_sweat(bk)'
        }, {
          utf: '😲🏿',
          code: 'astonished(bk)'
        }, {
          utf: '😵🏿',
          code: 'dizzy_face(bk)'
        }, {
          utf: '😶🏿',
          code: 'no_mouth(bk)'
        }, {
          utf: '😅🏿',
          code: 'sweat_smile(bk)'
        }, {
          utf: '😘🏿',
          code: 'kissing_heart(bk)'
        }, {
          utf: '😝🏾',
          code: 'stuck_out_tongue_closed_eyes(br)'
        }, {
          utf: '😝🏿',
          code: 'stuck_out_tongue_closed_eyes(bk)'
        }, {
          utf: '😜🏾',
          code: 'stuck_out_tongue_winking_eye(br)'
        }, {
          utf: '😜🏿',
          code: 'stuck_out_tongue_winking_eye(bk)'
        }, {
          utf: '😍🏿',
          code: 'heart_eyes(bk)'
        }, {
          utf: '😁🏽',
          code: 'grin(ye)'
        }, {
          utf: '😍🏾',
          code: 'heart_eyes(br)'
        }, {
          utf: '😏🏾',
          code: 'smirk(br)'
        }, {
          utf: '😌🏾',
          code: 'relieved(br)'
        }, {
          utf: '😘🏾',
          code: 'kissing_heart(br)'
        }, {
          utf: '😒🏾',
          code: 'unamused(br)'
        }, {
          utf: '😷🏾',
          code: 'mask(br)'
        }, {
          utf: '😶🏾',
          code: 'no_mouth(br)'
        }, {
          utf: '😵🏾',
          code: 'dizzy_face(br)'
        }, {
          utf: '😴🏾',
          code: 'sleeping(br)'
        }, {
          utf: '😳🏾',
          code: 'flushed(br)'
        }, {
          utf: '😲🏾',
          code: 'astonished(br)'
        }, {
          utf: '😱🏾',
          code: 'scream(br)'
        }, {
          utf: '😰🏾',
          code: 'cold_sweat(br)'
        }, {
          utf: '😮🏾',
          code: 'open_mouth(br)'
        }, {
          utf: '😭🏾',
          code: 'sob(br)'
        }, {
          utf: '😬🏾',
          code: 'grimacing(br)'
        }, {
          utf: '😪🏾',
          code: 'sleepy(br)'
        }, {
          utf: '😨🏾',
          code: 'fearful(br)'
        }, {
          utf: '😧🏾',
          code: 'anguished(br)'
        }, {
          utf: '😦🏾',
          code: 'frowning(br)'
        }, {
          utf: '😖🏾',
          code: 'confounded(br)'
        }, {
          utf: '😎🏾',
          code: 'sunglasses(br)'
        }, {
          utf: '😐🏾',
          code: 'neutral_face(br)'
        }, {
          utf: '😇🏾',
          code: 'innocent(br)'
        }, {
          utf: '😋🏾',
          code: 'yum(br)'
        }, {
          utf: '😂🏾',
          code: 'joy(br)'
        }, {
          utf: '😅🏾',
          code: 'sweat_smile(br)'
        }, {
          utf: '☺🏾',
          code: 'relaxed(br)'
        }, {
          utf: '⛲',
          code: 'fountain'
        }, {
          utf: '⛳',
          code: 'golf'
        }, {
          utf: '⛺',
          code: 'tent'
        }, {
          utf: '⛽',
          code: 'fuelpump'
        }, {
          utf: '✅',
          code: 'white_check_mark'
        }, {
          utf: '✉',
          code: 'envelope'
        }, {
          utf: '✌',
          code: 'v'
        }, {
          utf: '〽️',
          code: 'part_alternation_mark'
        }, {
          utf: '㊙',
          code: 'secret'
        }, {
          utf: '🃏',
          code: 'black_joker'
        }, {
          utf: '🅿',
          code: 'parking'
        }, {
          utf: '🆒',
          code: 'cool'
        }, {
          utf: '🆓',
          code: 'free'
        }, {
          utf: '🆔',
          code: 'id'
        }, {
          utf: '🆕',
          code: 'new'
        }, {
          utf: '🆖',
          code: 'ng'
        }, {
          utf: '🆗',
          code: 'ok'
        }, {
          utf: '🆘',
          code: 'sos'
        }, {
          utf: '🆙',
          code: 'up'
        }, {
          utf: '🆚',
          code: 'vs'
        }, {
          utf: '🇴',
          code: 'regional_indicator_symbol_letter_O'
        }, {
          utf: '🇵',
          code: 'regional_indicator_symbol_letter_P'
        }, {
          utf: '🇶',
          code: 'regional_indicator_symbol_letter_Q'
        }, {
          utf: '🇷',
          code: 'regional_indicator_symbol_letter_R'
        }, {
          utf: '🇸',
          code: 'regional_indicator_symbol_letter_S'
        }, {
          utf: '🇹',
          code: 'regional_indicator_symbol_letter_T'
        }, {
          utf: '🇺',
          code: 'regional_indicator_symbol_letter_U'
        }, {
          utf: '🇻',
          code: 'regional_indicator_symbol_letter_V'
        }, {
          utf: '🇼',
          code: 'regional_indicator_symbol_letter_W'
        }, {
          utf: '🇽',
          code: 'regional_indicator_symbol_letter_X'
        }, {
          utf: '🇾',
          code: 'regional_indicator_symbol_letter_Y'
        }, {
          utf: '🇿',
          code: 'regional_indicator_symbol_letter_Z'
        }, {
          utf: '🇨🇳',
          code: 'cn'
        }, {
          utf: '🇩🇪',
          code: 'de'
        }, {
          utf: '🇪🇸',
          code: 'es'
        }, {
          utf: '🇫🇷',
          code: 'fr'
        }, {
          utf: '🇬🇧',
          code: 'gb'
        }, {
          utf: '🇮🇹',
          code: 'it'
        }, {
          utf: '🇯🇵',
          code: 'jp'
        }, {
          utf: '🇰🇷',
          code: 'kr'
        }, {
          utf: '🇷🇺',
          code: 'ru'
        }, {
          utf: '🇺🇸',
          code: 'us'
        }, {
          utf: '🈁',
          code: 'koko'
        }, {
          utf: '🈂',
          code: 'sa'
        }, {
          utf: '🈚',
          code: 'free_mark'
        }, {
          utf: '🈯',
          code: 'specified_mark'
        }, {
          utf: '🈲',
          code: 'forbidden_mark'
        }, {
          utf: '🈳',
          code: 'empty_mark'
        }, {
          utf: '🈴',
          code: 'pass_mark'
        }, {
          utf: '🈵',
          code: 'full_mark'
        }, {
          utf: '🈶',
          code: 'fee_mark'
        }, {
          utf: '🈷',
          code: 'month_mark'
        }, {
          utf: '🈸',
          code: 'application_mark'
        }, {
          utf: '🈹',
          code: 'discount_mark'
        }, {
          utf: '🈺',
          code: 'open_for_business_mark'
        }, {
          utf: '🉐',
          code: 'ideograph_advantage'
        }, {
          utf: '🉑',
          code: 'accept'
        }, {
          utf: '🌀',
          code: 'cyclone'
        }, {
          utf: '🌁',
          code: 'foggy'
        }, {
          utf: '🌂',
          code: 'closed_umbrella'
        }, {
          utf: '🌃',
          code: 'night_with_stars'
        }, {
          utf: '🌄',
          code: 'sunrise_over_mountains'
        }, {
          utf: '🌅',
          code: 'sunrise'
        }, {
          utf: '🌆',
          code: 'city_dusk'
        }, {
          utf: '🌇',
          code: 'city_sunset'
        }, {
          utf: '🌈',
          code: 'rainbow'
        }, {
          utf: '🌉',
          code: 'bridge_at_night'
        }, {
          utf: '🌊',
          code: 'ocean'
        }, {
          utf: '🌋',
          code: 'volcano'
        }, {
          utf: '🌌',
          code: 'milky_way'
        }, {
          utf: '🌍',
          code: 'earth_africa'
        }, {
          utf: '🌎',
          code: 'earth_americas'
        }, {
          utf: '🌏',
          code: 'earth_asia'
        }, {
          utf: '🌐',
          code: 'globe_with_meridians'
        }, {
          utf: '🌒',
          code: 'waxing_crescent_moon'
        }, {
          utf: '☽',
          code: 'first_quarter_moon'
        }, {
          utf: '🌔',
          code: 'waxing_gibbous_moon'
        }, {
          utf: '🌖',
          code: 'waning_gibbous_moon'
        }, {
          utf: '☾',
          code: 'last_quarter_moon'
        }, {
          utf: '🌘',
          code: 'waning_crescent_moon'
        }, {
          utf: '🌙',
          code: 'crescent_moon'
        }, {
          utf: '🌚',
          code: 'new_moon_with_face'
        }, {
          utf: '🌛',
          code: 'first_quarter_moon_with_face'
        }, {
          utf: '🌜',
          code: 'last_quarter_moon_with_face'
        }, {
          utf: '🌝',
          code: 'full_moon_with_face'
        }, {
          utf: '🌞',
          code: 'sun_with_face'
        }, {
          utf: '🌟',
          code: 'glowing_star'
        }, {
          utf: '🌠',
          code: 'stars'
        }, {
          utf: '🌡',
          code: 'thermometer'
        }, {
          utf: '🌢',
          code: 'black_droplet'
        }, {
          utf: '🌣',
          code: 'white_sun'
        }, {
          utf: '🌤',
          code: 'white_sun_with_small_cloud'
        }, {
          utf: '🌥',
          code: 'white_sun_behind_cloud'
        }, {
          utf: '🌦',
          code: 'white_sun_behind_cloud_with_rain'
        }, {
          utf: '🌧',
          code: 'cloud_with_rain'
        }, {
          utf: '🌨',
          code: 'cloud_with_snow'
        }, {
          utf: '🌩',
          code: 'cloud_with_lightning'
        }, {
          utf: '🌪',
          code: 'cloud_with_tornado'
        }, {
          utf: '🌫',
          code: 'fog'
        }, {
          utf: '🌬',
          code: 'wind_blowing_face'
        }, {
          utf: '🌰',
          code: 'chestnut'
        }, {
          utf: '🌱',
          code: 'seedling'
        }, {
          utf: '🌲',
          code: 'evergreen_tree'
        }, {
          utf: '🌳',
          code: 'deciduous_tree'
        }, {
          utf: '🌴',
          code: 'palm_tree'
        }, {
          utf: '🌵',
          code: 'cactus'
        }, {
          utf: '🌶',
          code: 'hot_pepper'
        }, {
          utf: '🌷',
          code: 'tulip'
        }, {
          utf: '🌸',
          code: 'cherry_blossom'
        }, {
          utf: '🌹',
          code: 'rose'
        }, {
          utf: '🌺',
          code: 'hibiscus'
        }, {
          utf: '🌻',
          code: 'sunflower'
        }, {
          utf: '🌼',
          code: 'blossom'
        }, {
          utf: '🌽',
          code: 'corn'
        }, {
          utf: '🌾',
          code: 'ear_of_rice'
        }, {
          utf: '🌿',
          code: 'herb'
        }, {
          utf: '🍀',
          code: 'four_leaf_clover'
        }, {
          utf: '🍁',
          code: 'maple_leaf'
        }, {
          utf: '🍂',
          code: 'fallen_leaf'
        }, {
          utf: '🍃',
          code: 'leaves'
        }, {
          utf: '🍄',
          code: 'mushroom'
        }, {
          utf: '🍅',
          code: 'tomato'
        }, {
          utf: '🍆',
          code: 'eggplant'
        }, {
          utf: '🍇',
          code: 'grapes'
        }, {
          utf: '🍈',
          code: 'melon'
        }, {
          utf: '🍉',
          code: 'watermelon'
        }, {
          utf: '🍊',
          code: 'tangerine'
        }, {
          utf: '🍋',
          code: 'lemon'
        }, {
          utf: '🍌',
          code: 'banana'
        }, {
          utf: '🍍',
          code: 'pineapple'
        }, {
          utf: '🍎',
          code: 'apple'
        }, {
          utf: '🍏',
          code: 'green_apple'
        }, {
          utf: '🍐',
          code: 'pear'
        }, {
          utf: '🍑',
          code: 'peach'
        }, {
          utf: '🍒',
          code: 'cherries'
        }, {
          utf: '🍓',
          code: 'strawberry'
        }, {
          utf: '🍔',
          code: 'hamburger'
        }, {
          utf: '🍕',
          code: 'pizza'
        }, {
          utf: '🍖',
          code: 'meat_on_bone'
        }, {
          utf: '🍗',
          code: 'poultry_leg'
        }, {
          utf: '🍘',
          code: 'rice_cracker'
        }, {
          utf: '🍙',
          code: 'rice_ball'
        }, {
          utf: '🍚',
          code: 'rice'
        }, {
          utf: '🍛',
          code: 'curry'
        }, {
          utf: '🍜',
          code: 'ramen'
        }, {
          utf: '🍝',
          code: 'spaghetti'
        }, {
          utf: '🍞',
          code: 'bread'
        }, {
          utf: '🍟',
          code: 'fries'
        }, {
          utf: '🍠',
          code: 'sweet_potato'
        }, {
          utf: '🍡',
          code: 'dango'
        }, {
          utf: '🍢',
          code: 'oden'
        }, {
          utf: '🍣',
          code: 'sushi'
        }, {
          utf: '🍤',
          code: 'fried_shrimp'
        }, {
          utf: '🍥',
          code: 'fish_cake'
        }, {
          utf: '🍦',
          code: 'icecream'
        }, {
          utf: '🍧',
          code: 'shaved_ice'
        }, {
          utf: '🍨',
          code: 'ice_cream'
        }, {
          utf: '🍩',
          code: 'doughnut'
        }, {
          utf: '🍪',
          code: 'cookie'
        }, {
          utf: '🍫',
          code: 'chocolate_bar'
        }, {
          utf: '🍬',
          code: 'candy'
        }, {
          utf: '🍭',
          code: 'lollipop'
        }, {
          utf: '🍮',
          code: 'custard'
        }, {
          utf: '🍯',
          code: 'honey_pot'
        }, {
          utf: '🍰',
          code: 'cake'
        }, {
          utf: '🍱',
          code: 'bento'
        }, {
          utf: '🍲',
          code: 'stew'
        }, {
          utf: '🍳',
          code: 'egg'
        }, {
          utf: '🍴',
          code: 'fork_and_knife'
        }, {
          utf: '🍵',
          code: 'tea'
        }, {
          utf: '🍶',
          code: 'sake'
        }, {
          utf: '🍷',
          code: 'wine_glass'
        }, {
          utf: '🍸',
          code: 'cocktail'
        }, {
          utf: '🍹',
          code: 'tropical_drink'
        }, {
          utf: '🍺',
          code: 'beer'
        }, {
          utf: '🍻',
          code: 'beers'
        }, {
          utf: '🍼',
          code: 'baby_bottle'
        }, {
          utf: '🍽',
          code: 'fork_and_knife_with_plate'
        }, {
          utf: '🎀',
          code: 'ribbon'
        }, {
          utf: '🎁',
          code: 'gift'
        }, {
          utf: '🎂',
          code: 'birthday'
        }, {
          utf: '🎃',
          code: 'jack_o_lantern'
        }, {
          utf: '🎄',
          code: 'christmas_tree'
        }, {
          utf: '🎅',
          code: 'santa'
        }, {
          utf: '🎆',
          code: 'fireworks'
        }, {
          utf: '🎇',
          code: 'sparkler'
        }, {
          utf: '🎈',
          code: 'balloon'
        }, {
          utf: '🎉',
          code: 'tada'
        }, {
          utf: '🎊',
          code: 'confetti_ball'
        }, {
          utf: '🎋',
          code: 'tanabata_tree'
        }, {
          utf: '🎌',
          code: 'crossed_flags'
        }, {
          utf: '🎍',
          code: 'bamboo'
        }, {
          utf: '🎎',
          code: 'dolls'
        }, {
          utf: '🎏',
          code: 'flags'
        }, {
          utf: '🎐',
          code: 'wind_chime'
        }, {
          utf: '🎑',
          code: 'rice_scene'
        }, {
          utf: '🎒',
          code: 'school_satchel'
        }, {
          utf: '🎓',
          code: 'mortar_board'
        }, {
          utf: '🎔',
          code: 'heart_with_tip_on_the_left'
        }, {
          utf: '🎕',
          code: 'bouquet_of_flowers'
        }, {
          utf: '🎖',
          code: 'military_medal'
        }, {
          utf: '🎗',
          code: 'reminder_ribbon'
        }, {
          utf: '🎘',
          code: 'musical_keyboard_with_jacks'
        }, {
          utf: '🎙',
          code: 'studio_microphone'
        }, {
          utf: '🎚',
          code: 'level_slider'
        }, {
          utf: '🎛',
          code: 'control_knobs'
        }, {
          utf: '🎜',
          code: 'beamed_ascending_musical_notes'
        }, {
          utf: '🎝',
          code: 'beamed_descending_musical_notes'
        }, {
          utf: '🎞',
          code: 'film_frames'
        }, {
          utf: '🎟',
          code: 'admission_tickets'
        }, {
          utf: '🎠',
          code: 'carousel_horse'
        }, {
          utf: '🎡',
          code: 'ferris_wheel'
        }, {
          utf: '🎢',
          code: 'roller_coaster'
        }, {
          utf: '🎣',
          code: 'fishing_pole_and_fish'
        }, {
          utf: '🎤',
          code: 'microphone'
        }, {
          utf: '🎥',
          code: 'movie_camera'
        }, {
          utf: '🎦',
          code: 'cinema'
        }, {
          utf: '🎧',
          code: 'headphone'
        }, {
          utf: '🎨',
          code: 'art'
        }, {
          utf: '🎩',
          code: 'tophat'
        }, {
          utf: '🎪',
          code: 'circus_tent'
        }, {
          utf: '🎫',
          code: 'ticket'
        }, {
          utf: '🎬',
          code: 'clapper'
        }, {
          utf: '🎭',
          code: 'performing_arts'
        }, {
          utf: '🎮',
          code: 'video_game'
        }, {
          utf: '🎯',
          code: 'dart'
        }, {
          utf: '🎰',
          code: 'slot_machine'
        }, {
          utf: '🎱',
          code: '8ball'
        }, {
          utf: '🎲',
          code: 'game_die'
        }, {
          utf: '🎳',
          code: 'bowling'
        }, {
          utf: '🎴',
          code: 'flower_playing_cards'
        }, {
          utf: '🎵',
          code: 'musical_note'
        }, {
          utf: '🎶',
          code: 'notes'
        }, {
          utf: '🎷',
          code: 'saxophone'
        }, {
          utf: '🎸',
          code: 'guitar'
        }, {
          utf: '🎹',
          code: 'musical_keyboard'
        }, {
          utf: '🎺',
          code: 'trumpet'
        }, {
          utf: '🎻',
          code: 'violin'
        }, {
          utf: '🎼',
          code: 'musical_score'
        }, {
          utf: '🎽',
          code: 'running_shirt_with_sash'
        }, {
          utf: '🎾',
          code: 'tennis'
        }, {
          utf: '🎿',
          code: 'ski'
        }, {
          utf: '🏀',
          code: 'basketball'
        }, {
          utf: '🏁',
          code: 'chequered_flag'
        }, {
          utf: '🏂',
          code: 'snowboarder'
        }, {
          utf: '🏃',
          code: 'runner'
        }, {
          utf: '🏄',
          code: 'surfer'
        }, {
          utf: '🏅',
          code: 'sports_medal'
        }, {
          utf: '🏆',
          code: 'trophy'
        }, {
          utf: '🏇',
          code: 'horse_racing'
        }, {
          utf: '🏈',
          code: 'football'
        }, {
          utf: '🏉',
          code: 'rugby_football'
        }, {
          utf: '🏊',
          code: 'swimmer'
        }, {
          utf: '🏋',
          code: 'weight_lifter'
        }, {
          utf: '🏌',
          code: 'golfer'
        }, {
          utf: '🏍',
          code: 'racing_motorcycle'
        }, {
          utf: '🏎',
          code: 'racing_car'
        }, {
          utf: '🏔',
          code: 'snow_capped_mountain'
        }, {
          utf: '🏕',
          code: 'camping'
        }, {
          utf: '🏖',
          code: 'beach_with_umbrella'
        }, {
          utf: '🏗',
          code: 'building_construction'
        }, {
          utf: '🏘',
          code: 'house_buildings'
        }, {
          utf: '🏙',
          code: 'cityscape'
        }, {
          utf: '🏚',
          code: 'derelict_house_building'
        }, {
          utf: '🏛',
          code: 'classical_building'
        }, {
          utf: '🏜',
          code: 'desert'
        }, {
          utf: '🏝',
          code: 'desert_island'
        }, {
          utf: '🏞',
          code: 'national_park'
        }, {
          utf: '🏟',
          code: 'stadium'
        }, {
          utf: '🏠',
          code: 'house'
        }, {
          utf: '🏡',
          code: 'house_with_garden'
        }, {
          utf: '🏢',
          code: 'office'
        }, {
          utf: '🏣',
          code: 'post_office'
        }, {
          utf: '🏤',
          code: 'european_post_office'
        }, {
          utf: '🏥',
          code: 'hospital'
        }, {
          utf: '🏦',
          code: 'bank'
        }, {
          utf: '🏧',
          code: 'atm'
        }, {
          utf: '🏨',
          code: 'hotel'
        }, {
          utf: '🏩',
          code: 'love_hotel'
        }, {
          utf: '🏪',
          code: 'convenience_store'
        }, {
          utf: '🏫',
          code: 'school'
        }, {
          utf: '🏬',
          code: 'department_store'
        }, {
          utf: '🏭',
          code: 'factory'
        }, {
          utf: '🏮',
          code: 'izakaya_lantern'
        }, {
          utf: '🏯',
          code: 'japanese_castle'
        }, {
          utf: '🏰',
          code: 'european_castle'
        }, {
          utf: '🏱',
          code: 'white_pennant'
        }, {
          utf: '🏲',
          code: 'black_pennant'
        }, {
          utf: '🏳',
          code: 'waving_white_flag'
        }, {
          utf: '🏴',
          code: 'waving_black_flag'
        }, {
          utf: '🏵',
          code: 'rosette'
        }, {
          utf: '🏶',
          code: 'black_rosette'
        }, {
          utf: '🏷',
          code: 'label'
        }, {
          utf: '🐀',
          code: 'rat'
        }, {
          utf: '🐁',
          code: 'mouse2'
        }, {
          utf: '🐂',
          code: 'ox'
        }, {
          utf: '🐃',
          code: 'water_buffalo'
        }, {
          utf: '🐄',
          code: 'cow2'
        }, {
          utf: '🐅',
          code: 'tiger2'
        }, {
          utf: '🐆',
          code: 'leopard'
        }, {
          utf: '🐇',
          code: 'rabbit2'
        }, {
          utf: '🐈',
          code: 'cat2'
        }, {
          utf: '🐉',
          code: 'dragon'
        }, {
          utf: '🐊',
          code: 'crocodile'
        }, {
          utf: '🐋',
          code: 'whale2'
        }, {
          utf: '🐌',
          code: 'snail'
        }, {
          utf: '🐍',
          code: 'snake'
        }, {
          utf: '🐎',
          code: 'racehorse'
        }, {
          utf: '🐏',
          code: 'ram'
        }, {
          utf: '🐐',
          code: 'goat'
        }, {
          utf: '🐑',
          code: 'sheep'
        }, {
          utf: '🐒',
          code: 'monkey'
        }, {
          utf: '🐓',
          code: 'rooster'
        }, {
          utf: '🐔',
          code: 'chicken'
        }, {
          utf: '🐕',
          code: 'dog2'
        }, {
          utf: '🐖',
          code: 'pig2'
        }, {
          utf: '🐗',
          code: 'boar'
        }, {
          utf: '🐘',
          code: 'elephant'
        }, {
          utf: '🐙',
          code: 'octopus'
        }, {
          utf: '🐚',
          code: 'shell'
        }, {
          utf: '🐛',
          code: 'bug'
        }, {
          utf: '🐜',
          code: 'ant'
        }, {
          utf: '🐝',
          code: 'bee'
        }, {
          utf: '🐞',
          code: 'beetle'
        }, {
          utf: '🐟',
          code: 'fish'
        }, {
          utf: '🐠',
          code: 'tropical_fish'
        }, {
          utf: '🐡',
          code: 'blowfish'
        }, {
          utf: '🐢',
          code: 'turtle'
        }, {
          utf: '🐣',
          code: 'hatching_chick'
        }, {
          utf: '🐤',
          code: 'baby_chick'
        }, {
          utf: '🐥',
          code: 'hatched_chick'
        }, {
          utf: '🐦',
          code: 'bird'
        }, {
          utf: '🐧',
          code: 'penguin'
        }, {
          utf: '🐨',
          code: 'koala'
        }, {
          utf: '🐩',
          code: 'poodle'
        }, {
          utf: '🐪',
          code: 'dromedary_camel'
        }, {
          utf: '🐫',
          code: 'camel'
        }, {
          utf: '🐬',
          code: 'dolphin'
        }, {
          utf: '🐭',
          code: 'mouse'
        }, {
          utf: '🐮',
          code: 'cow'
        }, {
          utf: '🐯',
          code: 'tiger'
        }, {
          utf: '🐰',
          code: 'rabbit'
        }, {
          utf: '🐱',
          code: 'cat'
        }, {
          utf: '🐲',
          code: 'dragon_face'
        }, {
          utf: '🐳',
          code: 'whale'
        }, {
          utf: '🐴',
          code: 'horse'
        }, {
          utf: '🐵',
          code: 'monkey_face'
        }, {
          utf: '🐶',
          code: 'dog'
        }, {
          utf: '🐷',
          code: 'pig'
        }, {
          utf: '🐸',
          code: 'frog'
        }, {
          utf: '🐹',
          code: 'hamster'
        }, {
          utf: '🐺',
          code: 'wolf'
        }, {
          utf: '🐻',
          code: 'bear'
        }, {
          utf: '🐼',
          code: 'panda_face'
        }, {
          utf: '🐽',
          code: 'pig_nose'
        }, {
          utf: '🐾',
          code: 'feet'
        }, {
          utf: '🐿',
          code: 'chipmunk'
        }, {
          utf: '👀',
          code: 'eyes'
        }, {
          utf: '👁',
          code: 'eye'
        }, {
          utf: '👂',
          code: 'ear'
        }, {
          utf: '👃',
          code: 'nose'
        }, {
          utf: '🗢',
          code: 'lips'
        }, {
          utf: '👅',
          code: 'tongue'
        }, {
          utf: '👆',
          code: 'point_up_2'
        }, {
          utf: '👇',
          code: 'point_down'
        }, {
          utf: '👈',
          code: 'point_left'
        }, {
          utf: '👉',
          code: 'point_right'
        }, {
          utf: '👊',
          code: 'punch'
        }, {
          utf: '👋',
          code: 'wave'
        }, {
          utf: '👌',
          code: 'ok_hand'
        }, {
          utf: '👍',
          code: 'thumbsup'
        }, {
          utf: '👎',
          code: 'thumbsdown'
        }, {
          utf: '👏',
          code: 'clap'
        }, {
          utf: '👑',
          code: 'crown'
        }, {
          utf: '👒',
          code: 'womans_hat'
        }, {
          utf: '👓',
          code: 'eyeglasses'
        }, {
          utf: '👔',
          code: 'necktie'
        }, {
          utf: '👕',
          code: 'shirt'
        }, {
          utf: '👖',
          code: 'jeans'
        }, {
          utf: '👗',
          code: 'dress'
        }, {
          utf: '👘',
          code: 'kimono'
        }, {
          utf: '👙',
          code: 'bikini'
        }, {
          utf: '👚',
          code: 'womans_clothes'
        }, {
          utf: '👛',
          code: 'purse'
        }, {
          utf: '👜',
          code: 'handbag'
        }, {
          utf: '👝',
          code: 'pouch'
        }, {
          utf: '👞',
          code: 'mans_shoe'
        }, {
          utf: '👟',
          code: 'athletic_shoe'
        }, {
          utf: '👠',
          code: 'high_heel'
        }, {
          utf: '👡',
          code: 'sandal'
        }, {
          utf: '👢',
          code: 'boot'
        }, {
          utf: '👣',
          code: 'footprints'
        }, {
          utf: '👦',
          code: 'boy'
        }, {
          utf: '👧',
          code: 'girl'
        }, {
          utf: '👨',
          code: 'man'
        }, {
          utf: '👩',
          code: 'woman'
        }, {
          utf: '👪',
          code: 'family'
        }, {
          utf: '👫',
          code: 'couple'
        }, {
          utf: '👬',
          code: 'two_men_holding_hands'
        }, {
          utf: '👭',
          code: 'two_women_holding_hands'
        }, {
          utf: '👮',
          code: 'cop'
        }, {
          utf: '👯',
          code: 'bunny_girl'
        }, {
          utf: '👱',
          code: 'person_with_blond_hair'
        }, {
          utf: '👲',
          code: 'man_with_gua_pi_mao'
        }, {
          utf: '👴',
          code: 'older_man'
        }, {
          utf: '👵',
          code: 'older_woman'
        }, {
          utf: '👶',
          code: 'baby'
        }, {
          utf: '👸',
          code: 'princess'
        }, {
          utf: '👻',
          code: 'ghost'
        }, {
          utf: '👼',
          code: 'angel'
        }, {
          utf: '👽',
          code: 'alien'
        }, {
          utf: '👾',
          code: 'space_invader'
        }, {
          utf: '👿',
          code: 'imp'
        }, {
          utf: '💀',
          code: 'skull'
        }, {
          utf: '💁',
          code: 'information_desk_person'
        }, {
          utf: '💂',
          code: 'guardsman'
        }, {
          utf: '💃',
          code: 'dancer'
        }, {
          utf: '💄',
          code: 'lipstick'
        }, {
          utf: '💅',
          code: 'nail_care'
        }, {
          utf: '💆',
          code: 'massage'
        }, {
          utf: '💇',
          code: 'haircut'
        }, {
          utf: '💈',
          code: 'barber'
        }, {
          utf: '💉',
          code: 'syringe'
        }, {
          utf: '💊',
          code: 'pill'
        }, {
          utf: '💋',
          code: 'kiss'
        }, {
          utf: '💍',
          code: 'ring'
        }, {
          utf: '💎',
          code: 'gem'
        }, {
          utf: '💏',
          code: 'couplekiss'
        }, {
          utf: '💐',
          code: 'bouquet'
        }, {
          utf: '💘',
          code: 'cupid'
        }, {
          utf: '💡',
          code: 'bulb'
        }, {
          utf: '💢',
          code: 'anger'
        }, {
          utf: '💣',
          code: 'bomb'
        }, {
          utf: '💤',
          code: 'zzz'
        }, {
          utf: '💥',
          code: 'boom'
        }, {
          utf: '💧',
          code: 'droplet'
        }, {
          utf: '💨',
          code: 'dash'
        }, {
          utf: '💩',
          code: 'poop'
        }, {
          utf: '💪',
          code: 'muscle'
        }, {
          utf: '💫',
          code: 'dizzy'
        }, {
          utf: '💯',
          code: '100'
        }, {
          utf: '💰',
          code: 'money_bag'
        }, {
          utf: '💲',
          code: 'heavy_dollar_sign'
        }, {
          utf: '💳',
          code: 'credit_card'
        }, {
          utf: '💴',
          code: 'yen'
        }, {
          utf: '💵',
          code: 'dollar'
        }, {
          utf: '💶',
          code: 'euro'
        }, {
          utf: '💷',
          code: 'pound'
        }, {
          utf: '💹',
          code: 'chart'
        }, {
          utf: '💺',
          code: 'seat'
        }, {
          utf: '💻',
          code: 'computer'
        }, {
          utf: '💼',
          code: 'briefcase'
        }, {
          utf: '💽',
          code: 'minidisc'
        }, {
          utf: '💾',
          code: 'floppy_disk'
        }, {
          utf: '💿',
          code: 'cd'
        }, {
          utf: '📀',
          code: 'dvd'
        }, {
          utf: '📁',
          code: 'file_folder'
        }, {
          utf: '📅',
          code: 'date'
        }, {
          utf: '📆',
          code: 'calendar'
        }, {
          utf: '📇',
          code: 'card_index'
        }, {
          utf: '📈',
          code: 'chart_with_upwards_trend'
        }, {
          utf: '📋',
          code: 'clipboard'
        }, {
          utf: '📌',
          code: 'pushpin'
        }, {
          utf: '📎',
          code: 'paperclip'
        }, {
          utf: '📒',
          code: 'ledger'
        }, {
          utf: '📓',
          code: 'notebook'
        }, {
          utf: '📔',
          code: 'notebook_with_decorative_cover'
        }, {
          utf: '📖',
          code: 'book'
        }, {
          utf: '📘',
          code: 'blue_book'
        }, {
          utf: '📙',
          code: 'orange_book'
        }, {
          utf: '📚',
          code: 'books'
        }, {
          utf: '📛',
          code: 'name_badge'
        }, {
          utf: '📜',
          code: 'scroll'
        }, {
          utf: '📝',
          code: 'pencil'
        }, {
          utf: '📟',
          code: 'pager'
        }, {
          utf: '📠',
          code: 'fax'
        }, {
          utf: '📡',
          code: 'satellite'
        }, {
          utf: '📢',
          code: 'loudspeaker'
        }, {
          utf: '📣',
          code: 'mega'
        }, {
          utf: '📦',
          code: 'package'
        }, {
          utf: '📧',
          code: 'e_mail'
        }, {
          utf: '📩',
          code: 'envelope_with_arrow'
        }, {
          utf: '📫',
          code: 'mailbox'
        }, {
          utf: '📭',
          code: 'mailbox_with_no_mail'
        }, {
          utf: '📮',
          code: 'postbox'
        }, {
          utf: '📯',
          code: 'postal_horn'
        }, {
          utf: '📰',
          code: 'newspaper'
        }, {
          utf: '📱',
          code: 'mobile_phone'
        }, {
          utf: '📲',
          code: 'calling'
        }, {
          utf: '📷',
          code: 'camera'
        }, {
          utf: '📹',
          code: 'video_camera'
        }, {
          utf: '📺',
          code: 'tv'
        }, {
          utf: '📻',
          code: 'radio'
        }, {
          utf: '📼',
          code: 'vhs'
        }, {
          utf: '🔀',
          code: 'twisted_rightwards_arrows'
        }, {
          utf: '🔁',
          code: 'repeat'
        }, {
          utf: '🔄',
          code: 'arrows_counterclockwise'
        }, {
          utf: '🔇',
          code: 'mute'
        }, {
          utf: '🔈',
          code: 'speaker'
        }, {
          utf: '🔉',
          code: 'sound'
        }, {
          utf: '🔋',
          code: 'battery'
        }, {
          utf: '🔌',
          code: 'electric_plug'
        }, {
          utf: '🔍',
          code: 'mag'
        }, {
          utf: '🔎',
          code: 'mag_right'
        }, {
          utf: '🔐',
          code: 'closed_lock_with_key'
        }, {
          utf: '🔑',
          code: 'key'
        }, {
          utf: '🔒',
          code: 'lock'
        }, {
          utf: '🔓',
          code: 'unlock'
        }, {
          utf: '🔔',
          code: 'bell'
        }, {
          utf: '🔖',
          code: 'bookmark'
        }, {
          utf: '🔗',
          code: 'link'
        }, {
          utf: '🔙',
          code: 'back'
        }, {
          utf: '🔚',
          code: 'end'
        }, {
          utf: '🔛',
          code: 'on'
        }, {
          utf: '🔜',
          code: 'soon'
        }, {
          utf: '🔝',
          code: 'top'
        }, {
          utf: '🔡',
          code: 'abcd'
        }, {
          utf: '🔢',
          code: '1234'
        }, {
          utf: '🔣',
          code: 'symbols'
        }, {
          utf: '🔤',
          code: 'abc'
        }, {
          utf: '🔥',
          code: 'fire'
        }, {
          utf: '🔦',
          code: 'flashlight'
        }, {
          utf: '🔧',
          code: 'wrench'
        }, {
          utf: '🔨',
          code: 'hammer'
        }, {
          utf: '🔪',
          code: 'knife'
        }, {
          utf: '🔫',
          code: 'gun'
        }, {
          utf: '🔭',
          code: 'telescope'
        }, {
          utf: '🔰',
          code: 'beginner'
        }, {
          utf: '🔱',
          code: 'trident'
        }, {
          utf: '🔲',
          code: 'black_square_button'
        }, {
          utf: '🔳',
          code: 'white_square_button'
        }, {
          utf: '🔵',
          code: 'large_blue_circle'
        }, {
          utf: '🔶',
          code: 'large_orange_diamond'
        }, {
          utf: '🔷',
          code: 'large_blue_diamond'
        }, {
          utf: '🔸',
          code: 'small_orange_diamond'
        }, {
          utf: '🔹',
          code: 'small_blue_diamond'
        }, {
          utf: '🔺',
          code: 'small_red_triangle'
        }, {
          utf: '🔻',
          code: 'small_red_triangle_down'
        }, {
          utf: '🔽',
          code: 'arrow_down_small'
        }, {
          utf: '🕅',
          code: 'symbol_for_marks_chapter'
        }, {
          utf: '🕐',
          code: 'clock1'
        }, {
          utf: '🕑',
          code: 'clock2'
        }, {
          utf: '🕒',
          code: 'clock3'
        }, {
          utf: '🕓',
          code: 'clock4'
        }, {
          utf: '🕔',
          code: 'clock5'
        }, {
          utf: '🕕',
          code: 'clock6'
        }, {
          utf: '🕖',
          code: 'clock7'
        }, {
          utf: '🕗',
          code: 'clock8'
        }, {
          utf: '🕘',
          code: 'clock9'
        }, {
          utf: '🕙',
          code: 'clock10'
        }, {
          utf: '🕚',
          code: 'clock11'
        }, {
          utf: '🕛',
          code: 'clock12'
        }, {
          utf: '🕜',
          code: 'clock130'
        }, {
          utf: '🕝',
          code: 'clock230'
        }, {
          utf: '🕞',
          code: 'clock330'
        }, {
          utf: '🕟',
          code: 'clock430'
        }, {
          utf: '🕠',
          code: 'clock530'
        }, {
          utf: '🕡',
          code: 'clock630'
        }, {
          utf: '🕢',
          code: 'clock730'
        }, {
          utf: '🕣',
          code: 'clock830'
        }, {
          utf: '🕤',
          code: 'clock930'
        }, {
          utf: '🕫',
          code: 'bullhorn'
        }, {
          utf: '🕬',
          code: 'bullhorn_with_sound_waves'
        }, {
          utf: '🕯',
          code: 'candle'
        }, {
          utf: '🕱',
          code: 'black_skull_and_crossbones'
        }, {
          utf: '🕳',
          code: 'hole'
        }, {
          utf: '🕷',
          code: 'spider'
        }, {
          utf: '🕹',
          code: 'joystick'
        }, {
          utf: '🕻',
          code: 'left_hand_telephone_receiver'
        }, {
          utf: '🕼',
          code: 'telephone_receiver_with_page'
        }, {
          utf: '🕽',
          code: 'right_hand_telephone_receiver'
        }, {
          utf: '🕾',
          code: 'white_touchtone_telephone'
        }, {
          utf: '🕿',
          code: 'black_touchtone_telephone'
        }, {
          utf: '🖀',
          code: 'telephone_on_top_of_modem'
        }, {
          utf: '🖁',
          code: 'clamshell_mobile_phone'
        }, {
          utf: '🖄',
          code: 'envelope_with_lightning'
        }, {
          utf: '🖆',
          code: 'pen_over_stamped_envelope'
        }, {
          utf: '🖊',
          code: 'lower_left_ballpoint_pen'
        }, {
          utf: '🖋',
          code: 'lower_left_fountain_pen'
        }, {
          utf: '🖎',
          code: 'left_writing_hand'
        }, {
          utf: '🖏',
          code: 'turned_ok_hand_sign'
        }, {
          utf: '🖒',
          code: 'reversed_thumbs_up_sign'
        }, {
          utf: '🖔',
          code: 'reversed_victory_hand'
        }, {
          utf: '🖧',
          code: 'three_networked_computers'
        }, {
          utf: '🖨',
          code: 'printer'
        }, {
          utf: '🖪',
          code: 'black_hard_shell_floppy_disk'
        }, {
          utf: '🖫',
          code: 'white_hard_shell_floppy_disk'
        }, {
          utf: '🖬',
          code: 'soft_shell_floppy_disk'
        }, {
          utf: '🖲',
          code: 'trackball'
        }, {
          utf: '🖴',
          code: 'hard_disk'
        }, {
          utf: '🖵',
          code: 'screen'
        }, {
          utf: '🖶',
          code: 'printer_icon'
        }, {
          utf: '🖷',
          code: 'fax_icon'
        }, {
          utf: '🖺',
          code: 'document_with_text_and_picture'
        }, {
          utf: '🖿',
          code: 'black_folder'
        }, {
          utf: '🗀',
          code: 'folder'
        }, {
          utf: '🗀',
          code: 'open_folder'
        }, {
          utf: '🗃',
          code: 'card_file_box'
        }, {
          utf: '🗄',
          code: 'file_cabinet'
        }, {
          utf: '🗅',
          code: 'empty_note'
        }, {
          utf: '🗈',
          code: 'note'
        }, {
          utf: '🗉',
          code: 'note_page'
        }, {
          utf: '🗊',
          code: 'note_pad'
        }, {
          utf: '🗌',
          code: 'empty_page'
        }, {
          utf: '🗍',
          code: 'empty_pages'
        }, {
          utf: '🗎',
          code: 'document'
        }, {
          utf: '🗏',
          code: 'page'
        }, {
          utf: '🗐',
          code: 'pages'
        }, {
          utf: '🗑',
          code: 'wastebasket'
        }, {
          utf: '🗕',
          code: 'minimize'
        }, {
          utf: '🗖',
          code: 'maximize'
        }, {
          utf: '🗗',
          code: 'overlap'
        }, {
          utf: '🗙',
          code: 'cancellation_x'
        }, {
          utf: '🗚',
          code: 'increase_font_size_symbol'
        }, {
          utf: '🗛',
          code: 'decrease_font_size_symbol'
        }, {
          utf: '🗜',
          code: 'compression'
        }, {
          utf: '🗝',
          code: 'old_key'
        }, {
          utf: '🗞',
          code: 'rolled_up_newspaper'
        }, {
          utf: '🗟',
          code: 'page_with_circled_text'
        }, {
          utf: '🗣',
          code: 'speaking_head_in_silhouette'
        }, {
          utf: '🗤',
          code: 'three_rays_above'
        }, {
          utf: '🗥',
          code: 'three_rays_below'
        }, {
          utf: '🗧',
          code: 'three_rays_right'
        }, {
          utf: '🗨',
          code: 'left_speech_bubble'
        }, {
          utf: '🗩',
          code: 'right_speech_bubble'
        }, {
          utf: '🗪',
          code: 'two_speech_bubbles'
        }, {
          utf: '🗫',
          code: 'three_speech_bubbles'
        }, {
          utf: '🗬',
          code: 'left_thought_bubble'
        }, {
          utf: '🗭',
          code: 'right_thought_bubble'
        }, {
          utf: '🗯',
          code: 'left_anger_bubble'
        }, {
          utf: '🗯',
          code: 'right_anger_bubble'
        }, {
          utf: '🗱',
          code: 'lightning_mood_bubble'
        }, {
          utf: '🗳',
          code: 'ballot_box_with_ballot'
        }, {
          utf: '🗵',
          code: 'ballot_box_with_script_x'
        }, {
          utf: '🗶',
          code: 'ballot_bold_script_x'
        }, {
          utf: '🗷',
          code: 'ballot_box_with_bold_script_x'
        }, {
          utf: '🗸',
          code: 'light_check_mark'
        }, {
          utf: '🗹',
          code: 'ballot_box_with_bold_check'
        }, {
          utf: '🗺',
          code: 'world_map'
        }, {
          utf: '🗻',
          code: 'mount_fuji'
        }, {
          utf: '🗼',
          code: 'tokyo_tower'
        }, {
          utf: '🗾',
          code: 'japan'
        }, {
          utf: '🗿',
          code: 'moyai'
        }, {
          utf: '😀',
          code: 'grinning'
        }, {
          utf: '😁',
          code: 'grin'
        }, {
          utf: '😂',
          code: 'joy'
        }, {
          utf: '😃',
          code: 'smiley'
        }, {
          utf: '😄',
          code: 'smile'
        }, {
          utf: '😅',
          code: 'sweat_smile'
        }, {
          utf: '😆',
          code: 'laughing'
        }, {
          utf: '😇',
          code: 'innocent'
        }, {
          utf: '😈',
          code: 'smiling_imp'
        }, {
          utf: '😉',
          code: 'wink'
        }, {
          utf: '😊',
          code: 'blush'
        }, {
          utf: '😋',
          code: 'yum'
        }, {
          utf: '😌',
          code: 'relieved'
        }, {
          utf: '😍',
          code: 'heart_eyes'
        }, {
          utf: '😎',
          code: 'sunglasses'
        }, {
          utf: '😏',
          code: 'smirk'
        }, {
          utf: '😑',
          code: 'expressionless'
        }, {
          utf: '😒',
          code: 'unamused'
        }, {
          utf: '😓',
          code: 'sweat'
        }, {
          utf: '😔',
          code: 'pensive'
        }, {
          utf: '😕',
          code: 'confused'
        }, {
          utf: '😖',
          code: 'confounded'
        }, {
          utf: '😗',
          code: 'kissing'
        }, {
          utf: '😜',
          code: 'stuck_out_tongue_winking_eye'
        }, {
          utf: '😝',
          code: 'stuck_out_tongue_closed_eyes'
        }, {
          utf: '😞',
          code: 'disappointed'
        }, {
          utf: '😟',
          code: 'worried'
        }, {
          utf: '😠',
          code: 'angry'
        }, {
          utf: '😡',
          code: 'rage'
        }, {
          utf: '😢',
          code: 'cry'
        }, {
          utf: '😣',
          code: 'persevere'
        }, {
          utf: '😤',
          code: 'triumph'
        }, {
          utf: '😦',
          code: 'frowning'
        }, {
          utf: '😧',
          code: 'anguished'
        }, {
          utf: '😨',
          code: 'fearful'
        }, {
          utf: '😩',
          code: 'weary'
        }, {
          utf: '😪',
          code: 'sleepy'
        }, {
          utf: '😫',
          code: 'tired_face'
        }, {
          utf: '😬',
          code: 'grimacing'
        }, {
          utf: '😭',
          code: 'sob'
        }, {
          utf: '😯',
          code: 'hushed'
        }, {
          utf: '😰',
          code: 'cold_sweat'
        }, {
          utf: '😱',
          code: 'scream'
        }, {
          utf: '😲',
          code: 'astonished'
        }, {
          utf: '😳',
          code: 'flushed'
        }, {
          utf: '😴',
          code: 'sleeping'
        }, {
          utf: '😵',
          code: 'dizzy_face'
        }, {
          utf: '😶',
          code: 'no_mouth'
        }, {
          utf: '😷',
          code: 'mask'
        }, {
          utf: '😹',
          code: 'joy_cat'
        }, {
          utf: '😼',
          code: 'smirk_cat'
        }, {
          utf: '🙊',
          code: 'speak_no_evil'
        }, {
          utf: '🚂',
          code: 'steam_locomotive'
        }, {
          utf: '🚄',
          code: 'bullettrain_side'
        }, {
          utf: '🚅',
          code: 'bullettrain_front'
        }, {
          utf: '🚔',
          code: 'oncoming_police_car'
        }, {
          utf: '🚕',
          code: 'taxi'
        }, {
          utf: '🚘',
          code: 'oncoming_automobile'
        }, {
          utf: '🚛',
          code: 'articulated_lorry'
        }, {
          utf: '🚞',
          code: 'mountain_railway'
        }, {
          utf: '🚟',
          code: 'suspension_railway'
        }, {
          utf: '🚠',
          code: 'mountain_cableway'
        }, {
          utf: '🚡',
          code: 'aerial_tramway'
        }, {
          utf: '🚧',
          code: 'construction'
        }, {
          utf: '🚩',
          code: 'triangular_flag_on_post'
        }, {
          utf: '🚪',
          code: 'door'
        }, {
          utf: '🚬',
          code: 'smoking'
        }, {
          utf: '🚮',
          code: 'put_litter_in_its_place'
        }, {
          utf: '🚱',
          code: 'non_potable_water'
        }, {
          utf: '🚴',
          code: 'bicyclist'
        }, {
          utf: '🚶',
          code: 'walking'
        }, {
          utf: '🚹',
          code: 'mens'
        }, {
          utf: '🚺',
          code: 'womens'
        }, {
          utf: '🚻',
          code: 'restroom'
        }, {
          utf: '🚽',
          code: 'toilet'
        }, {
          utf: '🚾',
          code: 'wc'
        }, {
          utf: '🚿',
          code: 'shower'
        }, {
          utf: '🛀',
          code: 'bath'
        }, {
          utf: '🛁',
          code: 'bathtub'
        }, {
          utf: '#️⃣',
          code: 'hash'
        }, {
          utf: '️1️⃣',
          code: 'one'
        }, {
          utf: '️2️⃣',
          code: 'two'
        }, {
          utf: '️3️⃣',
          code: 'three'
        }, {
          utf: '️4️⃣',
          code: 'four'
        }, {
          utf: '️5️⃣',
          code: 'five'
        }, {
          utf: '️6️⃣',
          code: 'six'
        }, {
          utf: '️7️⃣',
          code: 'seven'
        }, {
          utf: '️8️⃣',
          code: 'eight'
        }, {
          utf: '️9️⃣',
          code: 'nine'
        }, {
          utf: '️0️⃣',
          code: 'zero'
        }, {
          utf: '™',
          code: 'tm'
        }, {
          utf: '↔',
          code: 'left_right_arrow'
        }, {
          utf: '↖',
          code: 'arrow_upper_left'
        }, {
          utf: '↗',
          code: 'arrow_upper_right'
        }, {
          utf: '↘',
          code: 'arrow_lower_right'
        }, {
          utf: '↙',
          code: 'arrow_lower_left'
        }, {
          utf: '↪',
          code: 'arrow_right_hook'
        }, {
          utf: '⌚️',
          code: 'watch'
        }, {
          utf: '⌛',
          code: 'hourglass'
        }, {
          utf: '⏬',
          code: 'arrow_double_down'
        }, {
          utf: '⏳',
          code: 'hourglass_flowing_sand'
        }, {
          utf: 'Ⓜ️',
          code: 'm'
        }, {
          utf: '▪',
          code: 'black_small_square'
        }, {
          utf: '▫',
          code: 'white_small_square'
        }, {
          utf: '◻',
          code: 'white_medium_square'
        }, {
          utf: '◼',
          code: 'black_medium_square'
        }, {
          utf: '☀',
          code: 'sunny'
        }, {
          utf: '☁',
          code: 'cloud'
        }, {
          utf: '☎',
          code: 'telephone'
        }, {
          utf: '☑',
          code: 'ballot_box_with_check'
        }, {
          utf: '☕',
          code: 'coffee'
        }, {
          utf: '☺',
          code: 'relaxed'
        }, {
          utf: '♈',
          code: 'Aries'
        }, {
          utf: '♉',
          code: 'Taurus'
        }, {
          utf: '♊',
          code: 'Gemini'
        }, {
          utf: '♋',
          code: 'Cancer'
        }, {
          utf: '♌',
          code: 'Leo'
        }, {
          utf: '♍',
          code: 'Virgo'
        }, {
          utf: '♎',
          code: 'Libra'
        }, {
          utf: '♓',
          code: 'Pisces'
        }, {
          utf: '♠',
          code: 'spades'
        }, {
          utf: '♣',
          code: 'clubs'
        }, {
          utf: '♥',
          code: 'hearts'
        }, {
          utf: '⚠',
          code: 'warning'
        }, {
          utf: '⚡',
          code: 'zap'
        }, {
          utf: '⚽',
          code: 'soccer'
        }, {
          utf: '⚾',
          code: 'baseball'
        }, {
          utf: '⛄',
          code: 'snowman'
        }, {
          utf: '⛪',
          code: 'church'
        }, {
          utf: '✂',
          code: 'scissors'
        }, {
          utf: '✏',
          code: 'pencil2'
        }, {
          utf: '✒',
          code: 'black_nib'
        }, {
          utf: '✔',
          code: 'heavy_check_mark'
        }, {
          utf: '✖',
          code: 'heavy_multiplication_x'
        }, {
          utf: '✳',
          code: 'eight_spoked_asterisk'
        }, {
          utf: '✴',
          code: 'eight_pointed_black_star'
        }, {
          utf: '❌',
          code: 'x'
        }, {
          utf: '➖',
          code: 'heavy_minus_sign'
        }, {
          utf: '➗',
          code: 'heavy_division_sign'
        }, {
          utf: '➿',
          code: 'double_curly_loop'
        }, {
          utf: '⤴',
          code: 'arrow_heading_up'
        }, {
          utf: '⤵',
          code: 'arrow_heading_down'
        }, {
          utf: '⬛',
          code: 'black_large_square'
        }, {
          utf: '⬜',
          code: 'white_large_square'
        }, {
          utf: '⭐',
          code: 'star'
        }, {
          utf: '⭕',
          code: 'o'
        }, {
          utf: '🀄',
          code: 'mahjong'
        }, {
          utf: '🅰',
          code: 'a'
        }, {
          utf: '🅱',
          code: 'b'
        }, {
          utf: '🅾',
          code: 'o2'
        }, {
          utf: '🆎',
          code: 'ab'
        }, {
          utf: '🆑',
          code: 'cl'
        }, {
          utf: '🇦',
          code: 'regional_indicator_symbol_letter_A'
        }, {
          utf: '🇧',
          code: 'regional_indicator_symbol_letter_B'
        }, {
          utf: '🇨',
          code: 'regional_indicator_symbol_letter_C'
        }, {
          utf: '🇩',
          code: 'regional_indicator_symbol_letter_D'
        }, {
          utf: '🇪',
          code: 'regional_indicator_symbol_letter_E'
        }, {
          utf: '🇫',
          code: 'regional_indicator_symbol_letter_F'
        }, {
          utf: '🇬',
          code: 'regional_indicator_symbol_letter_G'
        }, {
          utf: '🇭',
          code: 'regional_indicator_symbol_letter_H'
        }, {
          utf: '🇮',
          code: 'regional_indicator_symbol_letter_I'
        }, {
          utf: '🇯',
          code: 'regional_indicator_symbol_letter_J'
        }, {
          utf: '🇰',
          code: 'regional_indicator_symbol_letter_K'
        }, {
          utf: '🇱',
          code: 'regional_indicator_symbol_letter_L'
        }, {
          utf: '🇲',
          code: 'regional_indicator_symbol_letter_M'
        }, {
          utf: '🇳',
          code: 'regional_indicator_symbol_letter_N'
        }, {
          utf: '👐',
          code: 'open_hands'
        }, {
          utf: '👤',
          code: 'bust_in_silhouette'
        }, {
          utf: '👥',
          code: 'busts_in_silhouette'
        }, {
          utf: '👰',
          code: 'bride_with_veil'
        }, {
          utf: '👳',
          code: 'man_with_turban'
        }, {
          utf: '👷',
          code: 'construction_worker'
        }, {
          utf: '👹',
          code: 'japanese_ogre'
        }, {
          utf: '👺',
          code: 'japanese_goblin'
        }, {
          utf: '💌',
          code: 'love_letter'
        }, {
          utf: '💑',
          code: 'couple_with_heart'
        }, {
          utf: '💒',
          code: 'wedding'
        }, {
          utf: '💓',
          code: 'heartbeat'
        }, {
          utf: '💔',
          code: 'broken_heart'
        }, {
          utf: '💕',
          code: 'two_hearts'
        }, {
          utf: '💖',
          code: 'sparkling_heart'
        }, {
          utf: '💗',
          code: 'heartpulse'
        }, {
          utf: '💙',
          code: 'blue_heart'
        }, {
          utf: '💚',
          code: 'green_heart'
        }, {
          utf: '💛',
          code: 'yellow_heart'
        }, {
          utf: '💜',
          code: 'purple_heart'
        }, {
          utf: '💝',
          code: 'gift_heart'
        }, {
          utf: '💞',
          code: 'revolving_hearts'
        }, {
          utf: '💟',
          code: 'heart_decoration'
        }, {
          utf: '💦',
          code: 'sweat_drops'
        }, {
          utf: '💬',
          code: 'speech_balloon'
        }, {
          utf: '💭',
          code: 'thought_balloon'
        }, {
          utf: '💮',
          code: 'white_flower'
        }, {
          utf: '💱',
          code: 'currency_exchange'
        }, {
          utf: '💸',
          code: 'money_with_wings'
        }, {
          utf: '📂',
          code: 'open_file_folder'
        }, {
          utf: '📃',
          code: 'page_with_curl'
        }, {
          utf: '📄',
          code: 'page_facing_up'
        }, {
          utf: '📉',
          code: 'chart_with_downwards_trend'
        }, {
          utf: '📊',
          code: 'bar_chart'
        }, {
          utf: '📍',
          code: 'round_pushpin'
        }, {
          utf: '📏',
          code: 'straight_ruler'
        }, {
          utf: '📐',
          code: 'triangular_ruler'
        }, {
          utf: '📑',
          code: 'bookmark_tabs'
        }, {
          utf: '📕',
          code: 'closed_book'
        }, {
          utf: '📗',
          code: 'green_book'
        }, {
          utf: '📞',
          code: 'telephone_receiver'
        }, {
          utf: '📤',
          code: 'outbox_tray'
        }, {
          utf: '📥',
          code: 'inbox_tray'
        }, {
          utf: '📨',
          code: 'incoming_envelope'
        }, {
          utf: '📪',
          code: 'mailbox_closed'
        }, {
          utf: '📬',
          code: 'mailbox_with_mail'
        }, {
          utf: '📳',
          code: 'vibration_mode'
        }, {
          utf: '📴',
          code: 'mobile_phone_off'
        }, {
          utf: '📵',
          code: 'no_mobile_phones'
        }, {
          utf: '📶',
          code: 'signal_strength'
        }, {
          utf: '📸',
          code: 'camera_with_flash'
        }, {
          utf: '📽',
          code: 'film_projector'
        }, {
          utf: '📾',
          code: 'portable_stereo'
        }, {
          utf: '🔂',
          code: 'repeat_one'
        }, {
          utf: '🔃',
          code: 'arrows_clockwise'
        }, {
          utf: '🔅',
          code: 'low_brightness'
        }, {
          utf: '🔆',
          code: 'high_brightness'
        }, {
          utf: '🔊',
          code: 'loud_sound'
        }, {
          utf: '🔏',
          code: 'lock_with_ink_pen'
        }, {
          utf: '🔕',
          code: 'no_bell'
        }, {
          utf: '🔘',
          code: 'radio_button'
        }, {
          utf: '🔞',
          code: 'underage'
        }, {
          utf: '🔟',
          code: 'keycap_ten'
        }, {
          utf: '🔠',
          code: 'capital_abcd'
        }, {
          utf: '🔩',
          code: 'nut_and_bolt'
        }, {
          utf: '🔬',
          code: 'microscope'
        }, {
          utf: '🔮',
          code: 'crystal_ball'
        }, {
          utf: '🔯',
          code: 'six_pointed_star'
        }, {
          utf: '🔴',
          code: 'red_circle'
        }, {
          utf: '🔼',
          code: 'arrow_up_small'
        }, {
          utf: '🔾',
          code: 'lower_right_shadowed_white_circle'
        }, {
          utf: '🔿',
          code: 'upper_right_shadowed_white_circle'
        }, {
          utf: '🕄',
          code: 'notched_right_semicircle_with_three'
        }, {
          utf: '🕆',
          code: 'white_latin_cross'
        }, {
          utf: '🕇',
          code: 'heavy_latin_cross'
        }, {
          utf: '🕈',
          code: 'celtic_cross'
        }, {
          utf: '🕉',
          code: 'om_symbol'
        }, {
          utf: '🕊',
          code: 'dove_of_peace'
        }, {
          utf: '🕥',
          code: 'clock1030'
        }, {
          utf: '🕦',
          code: 'clock1130'
        }, {
          utf: '🕧',
          code: 'clock1230'
        }, {
          utf: '🕨',
          code: 'right_speaker'
        }, {
          utf: '🕩',
          code: 'right_speaker_with_one_sound_wave'
        }, {
          utf: '🕪',
          code: 'right_speaker_with_three_sound_waves'
        }, {
          utf: '🕭',
          code: 'ringing_bell'
        }, {
          utf: '🕰',
          code: 'mantelpiece_clock'
        }, {
          utf: '🕲',
          code: 'no_piracy'
        }, {
          utf: '🕴',
          code: 'man_in_business_suit_levitating'
        }, {
          utf: '🕵',
          code: 'sleuth_or_spy'
        }, {
          utf: '🕶',
          code: 'dark_sunglasses'
        }, {
          utf: '🕸',
          code: 'spider_web'
        }, {
          utf: '🖂',
          code: 'back_of_envelope'
        }, {
          utf: '🖃',
          code: 'stamped_envelope'
        }, {
          utf: '🖅',
          code: 'flying_envelope'
        }, {
          utf: '🖇',
          code: 'linked_paperclips'
        }, {
          utf: '🖈',
          code: 'black_pushpin'
        }, {
          utf: '🖉',
          code: 'lower_left_pencil'
        }, {
          utf: '🖌',
          code: 'lower_left_paintbrush'
        }, {
          utf: '🖍',
          code: 'lower_left_crayon'
        }, {
          utf: '🖐',
          code: 'raised_hand_with_fingers_splayed'
        }, {
          utf: '🖑',
          code: 'reversed_raised_hand_with_fingers_splayed'
        }, {
          utf: '🖓',
          code: 'reversed_thumbs_down_sign'
        }, {
          utf: '🖗',
          code: 'white_down_pointing_left_hand_index'
        }, {
          utf: '🖘',
          code: 'sideways_white_left_pointing_index'
        }, {
          utf: '🖙',
          code: 'sideways_white_right_pointing_index'
        }, {
          utf: '🖚',
          code: 'sideways_black_left_pointing_index'
        }, {
          utf: '🖛',
          code: 'sideways_black_right_pointing_index'
        }, {
          utf: '🖜',
          code: 'black_left_pointing_backhand_index'
        }, {
          utf: '🖝',
          code: 'black_right_pointing_backhand_index'
        }, {
          utf: '🖞',
          code: 'sideways_white_up_pointing_index'
        }, {
          utf: '🖟',
          code: 'sideways_white_down_pointing_index'
        }, {
          utf: '🖠',
          code: 'sideways_black_up_pointing_index'
        }, {
          utf: '🖡',
          code: 'sideways_black_down_pointing_index'
        }, {
          utf: '🖢',
          code: 'black_up_pointing_backhand_index'
        }, {
          utf: '🖣',
          code: 'black_down_pointing_backhand_index'
        }, {
          utf: '🖥',
          code: 'desktop_computer'
        }, {
          utf: '🖦',
          code: 'keyboard_and_mouse'
        }, {
          utf: '🖩',
          code: 'pocket_calculator'
        }, {
          utf: '🖭',
          code: 'tape_cartridge'
        }, {
          utf: '🖮',
          code: 'wired_keyboard'
        }, {
          utf: '🖯',
          code: 'one_button_mouse'
        }, {
          utf: '🖰',
          code: 'two_button_mouse'
        }, {
          utf: '🖱',
          code: 'three_button_mouse'
        }, {
          utf: '🖳',
          code: 'old_personal_computer'
        }, {
          utf: '🖸',
          code: 'optical_disc_icon'
        }, {
          utf: '🖹',
          code: 'document_with_text'
        }, {
          utf: '🖻',
          code: 'document_with_picture'
        }, {
          utf: '🖼',
          code: 'frame_with_picture'
        }, {
          utf: '🖽',
          code: 'frame_with_tiles'
        }, {
          utf: '🖾',
          code: 'frame_with_an_x'
        }, {
          utf: '🗂',
          code: 'card_index_dividers'
        }, {
          utf: '🗆',
          code: 'empty_note_page'
        }, {
          utf: '🗇',
          code: 'empty_note_pad'
        }, {
          utf: '🗋',
          code: 'empty_document'
        }, {
          utf: '🗒',
          code: 'spiral_note_pad'
        }, {
          utf: '🗓',
          code: 'spiral_calendar_pad'
        }, {
          utf: '🗔',
          code: 'desktop_window'
        }, {
          utf: '🗘',
          code: 'clockwise_right_and_left_semicircle_arrows'
        }, {
          utf: '🗠',
          code: 'stock_chart'
        }, {
          utf: '🗡',
          code: 'dagger_knife'
        }, {
          utf: '🗦',
          code: 'three_rays_left'
        }, {
          utf: '🗰',
          code: 'mood_bubble'
        }, {
          utf: '🗲',
          code: 'lightning_mood'
        }, {
          utf: '🗴',
          code: 'ballot_script_x'
        }, {
          utf: '🗽',
          code: 'statue_of_liberty'
        }, {
          utf: '😐',
          code: 'neutral_face'
        }, {
          utf: '😘',
          code: 'kissing_heart'
        }, {
          utf: '😙',
          code: 'kissing_smiling_eyes'
        }, {
          utf: '😚',
          code: 'kissing_closed_eyes'
        }, {
          utf: '😛',
          code: 'stuck_out_tongue'
        }, {
          utf: '😥',
          code: 'disappointed_relieved'
        }, {
          utf: '😮',
          code: 'open_mouth'
        }, {
          utf: '😸',
          code: 'smile_cat'
        }, {
          utf: '😺',
          code: 'smiley_cat'
        }, {
          utf: '😻',
          code: 'heart_eyes_cat'
        }, {
          utf: '😽',
          code: 'kissing_cat'
        }, {
          utf: '😾',
          code: 'pouting_cat'
        }, {
          utf: '😿',
          code: 'crying_cat_face'
        }, {
          utf: '🙀',
          code: 'scream_cat'
        }, {
          utf: '🙅',
          code: 'no_good'
        }, {
          utf: '🙆',
          code: 'ok_woman'
        }, {
          utf: '🙇',
          code: 'bow'
        }, {
          utf: '🙈',
          code: 'see_no_evil'
        }, {
          utf: '🙉',
          code: 'hear_no_evil'
        }, {
          utf: '🙋',
          code: 'raising_hand'
        }, {
          utf: '🙌',
          code: 'raised_hands'
        }, {
          utf: '🙍',
          code: 'person_frowning'
        }, {
          utf: '🙎',
          code: 'person_with_pouting_face'
        }, {
          utf: '🙏',
          code: 'pray'
        }, {
          utf: '🚀',
          code: 'rocket'
        }, {
          utf: '🚁',
          code: 'helicopter'
        }, {
          utf: '🚃',
          code: 'railway_car'
        }, {
          utf: '🚆',
          code: 'train'
        }, {
          utf: '🚇',
          code: 'metro'
        }, {
          utf: '🚈',
          code: 'light_rail'
        }, {
          utf: '🚉',
          code: 'station'
        }, {
          utf: '🚊',
          code: 'tram'
        }, {
          utf: '🚋',
          code: 'tram_car'
        }, {
          utf: '🚌',
          code: 'bus'
        }, {
          utf: '🚍',
          code: 'oncoming_bus'
        }, {
          utf: '🚎',
          code: 'trolleybus'
        }, {
          utf: '🚏',
          code: 'busstop'
        }, {
          utf: '🚐',
          code: 'minibus'
        }, {
          utf: '🚑',
          code: 'ambulance'
        }, {
          utf: '🚒',
          code: 'fire_engine'
        }, {
          utf: '🚓',
          code: 'police_car'
        }, {
          utf: '🚖',
          code: 'oncoming_taxi'
        }, {
          utf: '🚗',
          code: 'red_car'
        }, {
          utf: '🚙',
          code: 'blue_car'
        }, {
          utf: '🚚',
          code: 'truck'
        }, {
          utf: '🚜',
          code: 'tractor'
        }, {
          utf: '🚝',
          code: 'monorail'
        }, {
          utf: '🚢',
          code: 'ship'
        }, {
          utf: '🚣',
          code: 'rowboat'
        }, {
          utf: '🚤',
          code: 'speedboat'
        }, {
          utf: '🚥',
          code: 'traffic_light'
        }, {
          utf: '🚦',
          code: 'vertical_traffic_light'
        }, {
          utf: '🚨',
          code: 'rotating_light'
        }, {
          utf: '🚫',
          code: 'no_entry_sign'
        }, {
          utf: '🚭',
          code: 'no_smoking'
        }, {
          utf: '🚯',
          code: 'do_not_litter'
        }, {
          utf: '🚰',
          code: 'potable_water'
        }, {
          utf: '🚲',
          code: 'bike'
        }, {
          utf: '🚳',
          code: 'no_bicycles'
        }, {
          utf: '🚵',
          code: 'mountain_bicyclist'
        }, {
          utf: '🚷',
          code: 'no_pedestrains'
        }, {
          utf: '🚸',
          code: 'children_crossing'
        }, {
          utf: '🚼',
          code: 'baby_symbol'
        }, {
          utf: '🛂',
          code: 'passport_control'
        }, {
          utf: '🛃',
          code: 'customs'
        }, {
          utf: '🛄',
          code: 'baggage_claim'
        }, {
          utf: '🛅',
          code: 'left_luggage'
        }, {
          utf: '©',
          code: 'copyright'
        }, {
          utf: '®',
          code: 'registered'
        }, {
          utf: '‼',
          code: 'bangbang'
        }, {
          utf: '⁉',
          code: 'interrobang'
        }, {
          utf: 'ℹ',
          code: 'information_source'
        }, {
          utf: '↕',
          code: 'up_down_arrow'
        }, {
          utf: '⏩',
          code: 'fast_forward'
        }, {
          utf: '⏪',
          code: 'rewind'
        }, {
          utf: '⏫',
          code: 'arrow_double_up'
        }, {
          utf: '⏰',
          code: 'alarm_clock'
        }, {
          utf: '▶',
          code: 'arrow_forward'
        }, {
          utf: '◀',
          code: 'arrow_backward'
        }, {
          utf: '☔',
          code: 'umbrella'
        }, {
          utf: '☝',
          code: 'point_up'
        }, {
          utf: '♏',
          code: 'Scorpio'
        }, {
          utf: '♐',
          code: 'Sagittarius'
        }, {
          utf: '♑',
          code: 'Capricorn'
        }, {
          utf: '♒',
          code: 'Aquarius'
        }, {
          utf: '♦',
          code: 'diamonds'
        }, {
          utf: '♨',
          code: 'hotsprings'
        }, {
          utf: '♻',
          code: 'recycle'
        }, {
          utf: '♿',
          code: 'wheelchair'
        }, {
          utf: '⚓',
          code: 'anchor'
        }, {
          utf: '⚪',
          code: 'white_circle'
        }, {
          utf: '⚫',
          code: 'black_circle'
        }, {
          utf: '⛅',
          code: 'partly_sunny'
        }, {
          utf: '⛎',
          code: 'Ophiuchus'
        }, {
          utf: '⛔',
          code: 'no_entry'
        }, {
          utf: '⛵',
          code: 'sailboat'
        }, {
          utf: '✈',
          code: 'airplane'
        }, {
          utf: '✊',
          code: 'fist'
        }, {
          utf: '✋',
          code: 'raised_hand'
        }, {
          utf: '✡',
          code: 'star_of_david'
        }, {
          utf: '✨',
          code: 'sparkles'
        }, {
          utf: '❄',
          code: 'snowflake'
        }, {
          utf: '❇',
          code: 'sparkle'
        }, {
          utf: '❎',
          code: 'negative_squared_cross_mark'
        }, {
          utf: '❓',
          code: 'question'
        }, {
          utf: '❔',
          code: 'grey_question'
        }, {
          utf: '❕',
          code: 'grey_exclamation'
        }, {
          utf: '❗',
          code: 'exclamation'
        }, {
          utf: '❤',
          code: 'heart'
        }, {
          utf: '➕',
          code: 'heavy_plus_sign'
        }, {
          utf: '➡',
          code: 'arrow_right'
        }, {
          utf: '➰',
          code: 'curly_loop'
        }, {
          utf: '⬅',
          code: 'arrow_left'
        }, {
          utf: '⬆',
          code: 'arrow_up'
        }, {
          utf: '⬇',
          code: 'arrow_down'
        }, {
          utf: '〰',
          code: 'wavy_dash'
        }, {
          utf: '㊗',
          code: 'congratulation'
        }, {
          utf: '🖖',
          code: 'raised_hand_with_part_between_middle_and_ring_fingers'
        }, {
          utf: '↩',
          code: 'leftwards_arrow_with_hook'
        }, {
          utf: '◽',
          code: 'white_medium_small_square'
        }, {
          utf: '◾',
          code: 'black_medium_small_square'
        }, {
          utf: '🕀',
          code: 'circled_cross_pommee'
        }, {
          utf: '🕁',
          code: 'cross_pommee_with_half_circle_below'
        }, {
          utf: '🕂',
          code: 'cross_pommee'
        }, {
          utf: '🕃',
          code: 'notched_left_semicircle_with_three_dots'
        }, {
          utf: '🕄',
          code: 'notched_right_semicircle_with_three_dots'
        }, {
          utf: '🌕',
          code: 'full_moon'
        }, {
          utf: '🌑',
          code: 'new_moon'
        }, {
          utf: '☄',
          code: 'comet'
        }, {
          utf: '★',
          code: 'black_star'
        }, {
          utf: '☈',
          code: 'thunderstorm'
        }, {
          utf: '☊',
          code: 'ascending_node'
        }, {
          utf: '☋',
          code: 'descending_node'
        }, {
          utf: '☌',
          code: 'conjunction'
        }, {
          utf: '☍',
          code: 'opposition'
        }, {
          utf: '☖',
          code: 'white_shogi_piece'
        }, {
          utf: '☗',
          code: 'black_shogi_piece'
        }, {
          utf: '☙',
          code: 'reversed_rotated_floral_heart_bullet'
        }, {
          utf: '☚',
          code: 'black_left_pointing_index'
        }, {
          utf: '☛',
          code: 'black_right_pointing_index'
        }, {
          utf: '☠',
          code: 'skull_and_crossbones'
        }, {
          utf: '☡',
          code: 'caution_sign'
        }, {
          utf: '☢',
          code: 'radioactive_sign'
        }, {
          utf: '☣',
          code: 'biohazard_sign'
        }, {
          utf: '☤',
          code: 'caduceus'
        }, {
          utf: '☥',
          code: 'ankh'
        }, {
          utf: '☦',
          code: 'russian_cross'
        }, {
          utf: '☧',
          code: 'chi_rho'
        }, {
          utf: '☨',
          code: 'cross_of_lorraine'
        }, {
          utf: '☩',
          code: 'cross_of_jerusalem'
        }, {
          utf: '☪',
          code: 'star_and_crescent'
        }, {
          utf: '☫',
          code: 'farsi_symbol'
        }, {
          utf: '☬',
          code: 'adi_shakti'
        }, {
          utf: '☭',
          code: 'hammer_and_sickle'
        }, {
          utf: '☮',
          code: 'peace_symbol'
        }, {
          utf: '☯',
          code: 'yin_and_yang'
        }, {
          utf: '☰',
          code: 'trigram_for_heaven'
        }, {
          utf: '☱',
          code: 'trigram_for_lake'
        }, {
          utf: '☲',
          code: 'trigram_for_fire'
        }, {
          utf: '☳',
          code: 'trigram_for_thunder'
        }, {
          utf: '☴',
          code: 'trigram_for_wind'
        }, {
          utf: '☵',
          code: 'trigram_for_water'
        }, {
          utf: '☶',
          code: 'trigram_for_mountain'
        }, {
          utf: '☷',
          code: 'trigram_for_earth'
        }, {
          utf: '☸',
          code: 'wheel_of_dharma'
        }, {
          utf: '☹',
          code: 'white_frowning_face'
        }, {
          utf: '☻',
          code: 'black_smiling_face'
        }, {
          utf: '☼',
          code: 'white_sun_with_rays'
        }, {
          utf: '☿',
          code: 'Mercury'
        }, {
          utf: '♀',
          code: 'Venus'
        }, {
          utf: '♁',
          code: 'Earth'
        }, {
          utf: '♂',
          code: 'Mars'
        }, {
          utf: '♃',
          code: 'Jupiter'
        }, {
          utf: '♄',
          code: 'Saturn'
        }, {
          utf: '♅',
          code: 'Uranus'
        }, {
          utf: '♆',
          code: 'Neptune'
        }, {
          utf: '♇',
          code: 'Pluto'
        }, {
          utf: '♔',
          code: 'white_chess_king'
        }, {
          utf: '♕',
          code: 'white_chess_queen'
        }, {
          utf: '♖',
          code: 'white_chess_rook'
        }, {
          utf: '♗',
          code: 'white_chess_bishop'
        }, {
          utf: '♘',
          code: 'white_chess_knight'
        }, {
          utf: '♙',
          code: 'white_chess_pawn'
        }, {
          utf: '♚',
          code: 'black_chess_king'
        }, {
          utf: '♛',
          code: 'black_chess_queen'
        }, {
          utf: '♜',
          code: 'black_chess_rook'
        }, {
          utf: '♝',
          code: 'black_chess_bishop'
        }, {
          utf: '♞',
          code: 'black_chess_knight'
        }, {
          utf: '♟',
          code: 'black_chess_pawn'
        }, {
          utf: '♩',
          code: 'quarter_note'
        }, {
          utf: '♬',
          code: 'beamed_sixteenth_notes'
        }, {
          utf: '♭',
          code: 'music_flat_sign'
        }, {
          utf: '♮',
          code: 'music_natural_sign'
        }, {
          utf: '♯',
          code: 'music_sharp_sign'
        }, {
          utf: '♰',
          code: 'west_syriac_cross'
        }, {
          utf: '♱',
          code: 'east_syriac_cross'
        }, {
          utf: '♳',
          code: 'recycling_symbol_for_type_1_plastics'
        }, {
          utf: '♴',
          code: 'recycling_symbol_for_type_2_plastics'
        }, {
          utf: '♵',
          code: 'recycling_symbol_for_type_3_plastics'
        }, {
          utf: '♶',
          code: 'recycling_symbol_for_type_4_plastics'
        }, {
          utf: '♷',
          code: 'recycling_symbol_for_type_5_plastics'
        }, {
          utf: '♸',
          code: 'recycling_symbol_for_type_6_plastics'
        }, {
          utf: '♹',
          code: 'recycling_symbol_for_type_7_plastics'
        }, {
          utf: '♺',
          code: 'recycling_symbol_for_generic_materials'
        }, {
          utf: '♼',
          code: 'recycled_paper_symbol'
        }, {
          utf: '♽',
          code: 'partially_recycled_paper_symbol'
        }, {
          utf: '⚀',
          code: 'die_face_1'
        }, {
          utf: '⚁',
          code: 'die_face_2'
        }, {
          utf: '⚂',
          code: 'die_face_3'
        }, {
          utf: '⚃',
          code: 'die_face_4'
        }, {
          utf: '⚄',
          code: 'die_face_5'
        }, {
          utf: '⚅',
          code: 'die_face_6'
        }, {
          utf: '⚆',
          code: 'white_circle_with_dot_right'
        }, {
          utf: '⚇',
          code: 'white_circle_with_two_dots'
        }, {
          utf: '⚈',
          code: 'black_circle_with_white_dot_right'
        }, {
          utf: '⚉',
          code: 'black_circle_with_two_white_dots'
        }, {
          utf: '⚊',
          code: 'monogram_for_yang'
        }, {
          utf: '⚋',
          code: 'monogram_for_yin'
        }, {
          utf: '⚌',
          code: 'digram_for_greater_yang'
        }, {
          utf: '⚍',
          code: 'digram_for_lesser_yin'
        }, {
          utf: '⚎',
          code: 'digram_for_lesser_yang'
        }, {
          utf: '⚏',
          code: 'digram_for_greater_yin'
        }, {
          utf: '⚒',
          code: 'hammer_and_pick'
        }, {
          utf: '⚔',
          code: 'crossed_swords'
        }, {
          utf: '⚕',
          code: 'staff_of_aesculapius'
        }, {
          utf: '⚖',
          code: 'weighing_scales'
        }, {
          utf: '⚗',
          code: 'alembic'
        }, {
          utf: '⚘',
          code: 'flower'
        }, {
          utf: '⚙',
          code: 'gear'
        }, {
          utf: '⚛',
          code: 'atom_symbol'
        }, {
          utf: '⚜',
          code: 'fleur_de_lis'
        }, {
          utf: '⚝',
          code: 'outlined_white_star'
        }, {
          utf: '⚞',
          code: 'three_lines_converging_right'
        }, {
          utf: '⚟',
          code: 'three_lines_converging_left'
        }, {
          utf: '⚢',
          code: 'doubled_female_sign'
        }, {
          utf: '⚣',
          code: 'doubled_male_sign'
        }, {
          utf: '⚤',
          code: 'interlocked_male_and_female_sign'
        }, {
          utf: '⚥',
          code: 'male_and_female_sign'
        }, {
          utf: '⚦',
          code: 'male_with_stroke_sign'
        }, {
          utf: '⚧',
          code: 'male_with_stroke_and_male_and_female_sign'
        }, {
          utf: '⚨',
          code: 'vertical_male_with_stroke_sign'
        }, {
          utf: '⚩',
          code: 'horizontal_male_with_stroke_sign'
        }, {
          utf: '⚭',
          code: 'marriage_symbol'
        }, {
          utf: '⚮',
          code: 'divorce_symbol'
        }, {
          utf: '⚯',
          code: 'unmarried_partnership_symbol'
        }, {
          utf: '⚰',
          code: 'coffin'
        }, {
          utf: '⚱',
          code: 'funeral_urn'
        }, {
          utf: '⚲',
          code: 'neuter'
        }, {
          utf: '⚳',
          code: 'Ceres'
        }, {
          utf: '⚴',
          code: 'Pallas'
        }, {
          utf: '⚵',
          code: 'Juno'
        }, {
          utf: '⚶',
          code: 'Vesta'
        }, {
          utf: '⚷',
          code: 'Chiron'
        }, {
          utf: '⚸',
          code: 'black_moon_lilith'
        }, {
          utf: '⚹',
          code: 'sextile'
        }, {
          utf: '⚺',
          code: 'semisextile'
        }, {
          utf: '⚻',
          code: 'quincunx'
        }, {
          utf: '⚼',
          code: 'sesquiquadrate'
        }, {
          utf: '⛀',
          code: 'white_draughts_man'
        }, {
          utf: '⛁',
          code: 'white_draughts_king'
        }, {
          utf: '⛂',
          code: 'black_draughts_man'
        }, {
          utf: '⛃',
          code: 'black_draughts_king'
        }, {
          utf: '⛇',
          code: 'black_snowman'
        }, {
          utf: '⛉',
          code: 'turned_white_shogi_piece'
        }, {
          utf: '⛊',
          code: 'turned_black_shogi_piece'
        }, {
          utf: '⛋',
          code: 'white_diamond_in_square'
        }, {
          utf: '⛌',
          code: 'crossing_lanes'
        }, {
          utf: '⛍',
          code: 'disabled_car'
        }, {
          utf: '⛏',
          code: 'pick'
        }, {
          utf: '⛐',
          code: 'car_sliding'
        }, {
          utf: '⛑',
          code: 'helmet_with_white_cross'
        }, {
          utf: '⛒',
          code: 'circled_crossing_lanes'
        }, {
          utf: '⛓',
          code: 'chains'
        }, {
          utf: '⛕',
          code: 'alternate_one_way_left_way_traffic'
        }, {
          utf: '⛖',
          code: 'black_two_way_left_way_traffic'
        }, {
          utf: '⛗',
          code: 'white_two_way_left_way_traffic'
        }, {
          utf: '⛘',
          code: 'black_left_lane_merge'
        }, {
          utf: '⛙',
          code: 'white_left_lane_merge'
        }, {
          utf: '⛚',
          code: 'drive_slow_sign'
        }, {
          utf: '⛛',
          code: 'heavy_white_down_pointing_triangle'
        }, {
          utf: '⛜',
          code: 'left_closed_entry'
        }, {
          utf: '⛝',
          code: 'squared_saltire'
        }, {
          utf: '⛞',
          code: 'falling_diagonal_in_white_circle_in_black_square'
        }, {
          utf: '⛟',
          code: 'black_truck'
        }, {
          utf: '⛠',
          code: 'restricted_left_entry_1'
        }, {
          utf: '⛡',
          code: 'restricted_left_entry_2'
        }, {
          utf: '⛣',
          code: 'heavy_circle_with_stroke_and_two_dots_above'
        }, {
          utf: '⛤',
          code: 'pentagram'
        }, {
          utf: '⛧',
          code: 'inverted_pentagram'
        }, {
          utf: '⛩',
          code: 'shinto_shrine'
        }, {
          utf: '⛬',
          code: 'historic_site'
        }, {
          utf: '⛭',
          code: 'gear_without_hub'
        }, {
          utf: '⛮',
          code: 'gear_with_handles'
        }, {
          utf: '⛯',
          code: 'map_symbol_for_lighthouse'
        }, {
          utf: '⛱',
          code: 'umbrella_on_ground'
        }, {
          utf: '⛶',
          code: 'square_four_corners'
        }, {
          utf: '⛸',
          code: 'ice_skate'
        }, {
          utf: '⛹',
          code: 'person_with_ball'
        }, {
          utf: '⛼',
          code: 'headstone_graveyard_symbol'
        }, {
          utf: '⛿',
          code: 'white_flag_with_horizontal_middle_black_stripe'
        }
      ]
    };
    Plugin = (function() {
      function Plugin(element, options) {
        this.element = element;
        this.element = $(this.element);
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.replacer = this.options.useUserEmoji ? new ReplacerUser(this) : new ReplacerSearch(this);
        this.replacer.loadEmoji();
      }

      return Plugin;

    })();
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        if (!$.data(this, "plugin_" + pluginName)) {
          return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        }
      });
    };
  })(jQuery, window, document);

  Replacer = (function() {
    function Replacer() {}

    Replacer.prototype.loadingNum = void 0;

    Replacer.prototype.getEmojiTag = function(emoji_code) {
      return "<img      class='emojidex-emoji'      src='" + this.plugin.options.cdnURL + "/" + this.plugin.options.sizeCode + "/" + emoji_code + ".png'      title='" + (this.replaceUnderToSpace(emoji_code)) + "'    ></img>";
    };

    Replacer.prototype.getLoadingTag = function(emoji_data, type) {
      return "<img      class='emojidex-loading-icon'      data-emoji='" + emoji_data + "'      data-type='" + type + "'    ></img>";
    };

    Replacer.prototype.getLoadingElement = function(element) {
      return $(element.find('.emojidex-loading-icon'));
    };

    Replacer.prototype.setLoadingTag = function(plugin) {
      var _this = this;
      return plugin.element.find(":not(iframe,textarea,script)").andSelf().contents().filter(function(index, element) {
        if (element.nodeType === Node.TEXT_NODE && element.textContent.match(/\S/)) {
          return $(element).replaceWith(_this.getTextWithLoadingTag(element.textContent));
        }
      });
    };

    Replacer.prototype.getTextWithLoadingTag = function(text) {
      var _this = this;
      text = text.replace(/:([^:;@&#~\!\$\+\?\%\*\f\n\r\\\/]+):/g, function(matched_string, pattern1) {
        return _this.getLoadingTag(matched_string, 'code');
      });
      text = text.replace(this.plugin.options.regexpUTF, function(matched_string) {
        return _this.getLoadingTag(matched_string, 'utf');
      });
      return text;
    };

    Replacer.prototype.fadeOutLoadingTag_fadeInEmojiTag = function(element, emoji_code, match) {
      var emoji_tag,
        _this = this;
      if (match == null) {
        match = true;
      }
      if (match) {
        emoji_tag = $(this.getEmojiTag(emoji_code)).hide();
      } else {
        emoji_tag = $(emoji_code).hide();
      }
      return element.after(emoji_tag).fadeOut("normal", function() {
        return emoji_tag.fadeIn("fast", function() {
          if (--_this.loadingNum === 0 && (_this.plugin.options.onComplete != null)) {
            return _this.plugin.options.onComplete(_this.plugin.element);
          }
        });
      });
    };

    Replacer.prototype.replaceSpaceToUnder = function(string) {
      return string.replace(/\s/g, '_');
    };

    Replacer.prototype.replaceUnderToSpace = function(string) {
      return string.replace(/_/g, ' ');
    };

    return Replacer;

  })();

  ReplacerSearch = (function(_super) {
    __extends(ReplacerSearch, _super);

    function ReplacerSearch(plugin) {
      this.plugin = plugin;
      ReplacerSearch.__super__.constructor.apply(this, arguments);
    }

    ReplacerSearch.prototype.loadEmoji = function() {
      var searchEmoji_setEmojiTag,
        _this = this;
      searchEmoji_setEmojiTag = function(element) {
        var emoji, loading_element, loading_elements, replaceToEmojiIcon, _i, _len, _results;
        replaceToEmojiIcon = function(type, loading_element, emoji_code) {
          var emoji_image;
          emoji_image = $("<img src='" + _this.plugin.options.cdnURL + "/" + _this.plugin.options.sizeCode + "/" + emoji_code + ".png'></img>");
          emoji_image.load(function(e) {
            return _this.fadeOutLoadingTag_fadeInEmojiTag(loading_element, emoji_code);
          });
          return emoji_image.error(function(e) {
            return _this.fadeOutLoadingTag_fadeInEmojiTag(loading_element, "<span>:" + emoji_code + ":</span>", false);
          });
        };
        loading_elements = _this.getLoadingElement(element);
        _this.loadingNum = loading_elements.length;
        _results = [];
        for (_i = 0, _len = loading_elements.length; _i < _len; _i++) {
          loading_element = loading_elements[_i];
          switch (loading_element.dataset.type) {
            case 'code':
              _results.push(replaceToEmojiIcon(loading_element.dataset.type, $(loading_element), _this.replaceSpaceToUnder(loading_element.dataset.emoji.replace(/:/g, ''))));
              break;
            case 'utf':
              _results.push((function() {
                var _j, _len1, _ref, _results1;
                _ref = this.plugin.options.utfEmojiData;
                _results1 = [];
                for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                  emoji = _ref[_j];
                  if (emoji.utf === loading_element.dataset.emoji) {
                    this.fadeOutLoadingTag_fadeInEmojiTag($(loading_element), emoji.code);
                    break;
                  } else {
                    _results1.push(void 0);
                  }
                }
                return _results1;
              }).call(_this));
              break;
            default:
              _results.push(void 0);
          }
        }
        return _results;
      };
      this.setLoadingTag(this.plugin);
      return searchEmoji_setEmojiTag(this.plugin.element);
    };

    return ReplacerSearch;

  })(Replacer);

  ReplacerUser = (function(_super) {
    __extends(ReplacerUser, _super);

    function ReplacerUser(plugin) {
      this.plugin = plugin;
      this.onLoadEmojiData = __bind(this.onLoadEmojiData, this);
      ReplacerUser.__super__.constructor.apply(this, arguments);
    }

    ReplacerUser.prototype.loadEmoji = function() {
      return this.getUserEmojiData(this.plugin.options.userNames, this.onLoadEmojiData);
    };

    ReplacerUser.prototype.getUserEmojiData = function(user_names, callback) {
      var emoji_data, loaded_num, name, names, _i, _len, _results;
      loaded_num = 0;
      names = user_names;
      emoji_data = [];
      _results = [];
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        _results.push($.ajax({
          url: "https://www.emojidex.com/api/v1/users/" + name + "/emoji",
          dataType: 'json',
          type: 'get',
          success: function(user_emoji_json, status, xhr) {
            emoji_data = emoji_data.concat(user_emoji_json.emoji);
            if (++loaded_num === names.length) {
              return callback(emoji_data);
            }
          },
          error: function(data) {
            console.log('error: load json');
            return console.log(data);
          }
        }));
      }
      return _results;
    };

    ReplacerUser.prototype.onLoadEmojiData = function(emoji_data) {
      var _logUtfEmoji, _logUtfEmojiDataList, _logUtfRegexpPattern,
        _this = this;
      _logUtfEmoji = function(emoji_data) {
        var emoji, utf_emoji, _i, _len;
        utf_emoji = '';
        for (_i = 0, _len = emoji_data.length; _i < _len; _i++) {
          emoji = emoji_data[_i];
          if (emoji.moji != null) {
            utf_emoji += emoji.moji;
          }
        }
        return console.log(utf_emoji);
      };
      _logUtfRegexpPattern = function(emoji_data) {
        var emoji, utf_emoji, _i, _len;
        utf_emoji = [];
        for (_i = 0, _len = emoji_data.length; _i < _len; _i++) {
          emoji = emoji_data[_i];
          if (emoji.moji != null) {
            utf_emoji.push(emoji.moji);
          }
        }
        return console.log(utf_emoji.join('|'));
      };
      _logUtfEmojiDataList = function(emoji_data) {
        var data_list, emoji, _i, _len;
        data_list = [];
        for (_i = 0, _len = emoji_data.length; _i < _len; _i++) {
          emoji = emoji_data[_i];
          if (emoji.moji != null) {
            data_list.push("{utf:'" + emoji.moji + "',code:'" + (_this.replaceSpaceToUnder(emoji.code)) + "'}");
          }
        }
        return console.log("[" + (data_list.join(',')) + "]");
      };
      this.emoji_data = emoji_data;
      this.emoji_regexps = this.getEmojiRegexps(emoji_data);
      this.targetElementNum = this.plugin.element.find(':not(iframe,textarea,script)').andSelf().contents().length - 1;
      return this.plugin.element.find(':not(iframe,textarea,script)').andSelf().contents().filter(function(index, element) {
        if (element.nodeType === Node.TEXT_NODE) {
          $(element).replaceWith(_this.getTextWithEomojiTag(element.textContent));
        }
        if (_this.targetElementNum - index === 0 && (_this.plugin.options.onComplete != null)) {
          return _this.plugin.options.onComplete(_this.plugin.element);
        }
      });
    };

    ReplacerUser.prototype.getEmojiRegexps = function(emoji_data) {
      var emoji, pattern_code, utf_emoji, _i, _len;
      utf_emoji = [];
      pattern_code = ':(';
      for (_i = 0, _len = emoji_data.length; _i < _len; _i++) {
        emoji = emoji_data[_i];
        if (emoji.moji != null) {
          utf_emoji.push(emoji.moji);
        }
        if (emoji.code != null) {
          pattern_code += this.replaceSpaceToUnder(emoji.code) + '|';
        }
      }
      utf_emoji.sort(function(v1, v2) {
        return v2.length - v1.length;
      });
      return {
        utf: RegExp(utf_emoji.join('|'), 'g'),
        code: RegExp(pattern_code.slice(0, -1) + "):", 'g')
      };
    };

    ReplacerUser.prototype.getTextWithEomojiTag = function(text) {
      var _this = this;
      text = text.replace(this.emoji_regexps.utf, function(matched_string) {
        var emoji, _i, _len, _ref;
        _ref = _this.emoji_data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          emoji = _ref[_i];
          if (emoji.moji === matched_string) {
            return _this.getEmojiTag(_this.replaceSpaceToUnder(emoji.code));
          }
        }
      });
      return text = text.replace(this.emoji_regexps.code, function(matched_string, pattern1) {
        var emoji, _i, _len, _ref;
        _ref = _this.emoji_data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          emoji = _ref[_i];
          if (_this.replaceSpaceToUnder(emoji.code) === pattern1) {
            return _this.getEmojiTag(pattern1);
          }
        }
      });
    };

    return ReplacerUser;

  })(Replacer);

}).call(this);