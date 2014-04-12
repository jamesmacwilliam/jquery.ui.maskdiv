(function() {

  $.widget("ui.maskDiv", {
    options: {
      mask: [],
      divider: '/',
      divider_class: 'divider',
      unedited_char_class: 'unedited',
      edited_char_class: 'edited',
      onFocus: function() {},
      onBlur: function() {}
    },
    _create: function() {
      var _this = this;
      opts = this.options;
      this.options.regs = this._regex_from_mask();
      this.element.on('mousedown focus', function(e) {
        return _this._set_mask_html(e);
      });
      this.element.on('blur', function(e) {
        return _this._handle_blur_mask(e);
      });
      this.element.on('keypress', function(e) {
        return _this._move_to_next_mask_sub_element(e);
      });
      this.element.on('keydown', function(e) {
        return _this._handle_keydown(e);
      });
      return;
    },
    destroy: function() {
      this.element.off('focus');
      this.element.off('blur');
      this.element.off('keypress');
      this.element.off('keydown');
      this.element.off('mousedown');
      this.element.html(this.element.text());
      return $.Widget.prototype.destroy.call(this);
    },
    _destroy: function() {
      this.element.off('focus');
      this.element.off('blur');
      this.element.off('keypress');
      this.element.off('keydown');
      this.element.off('mousedown');
      this.element.html(this.element.text());
      return $.Widget.prototype.destroy.call(this);
    },
    _regex_from_mask: function() {
      var regs = {
        '9': "[0-9]",
        'a': "[A-Za-z]",
        '*': "[A-Za-z0-9]"
      };
      return _.map((this.options.mask_matchers || this.options.mask).join(''), function(c) {
        return new RegExp(regs[c] || regs['*']);
      });
    },
    _handle_keydown: function(e) {
      switch (e.keyCode || e.which) {
        case 8:
          e.preventDefault();
          this._replace_current_text_and_move(-1);
          return;
        case 46:
          e.preventDefault();
          return this._replace_current_text_and_move();
        case 39:
          e.preventDefault();
          return this._move(1);
        case 37:
          e.preventDefault();
          return this._move(-1);
      }
      return;
    },
    _move: function(change_position) {
      change_position = change_position || 0;
      var new_position = this.current_position + change_position;
      if (new_position >= 0 && new_position <= this.options.mask.join('').length) {
        this.current_position = new_position;
      }
      var el;
      if (this.current_position == this.options.mask.join('').length) {
        el = this._focus_current_span(this.current_position - 1);
        this._set_cursor(el, true);
      }else{
        el = this._focus_current_span();
        this._set_cursor(el);
      }
      return el;
    },
    _focus_current_span: function(pos) {
      pos = pos || this.current_position;
      this._clear_cursor();
      return this.element.find("[data-num=" + pos + "]").focus();
    },
    _replace_current_text_and_move: function(change_position) {
      var mask_string, opts, el, new_text, _this;
      opts = this.options;
      _this = this;
      mask_string = _.flatten(opts.mask).join('');
      new_text = mask_string[this.current_position - 1];
      return this._move(-1).removeClass(opts.edited_char_class).addClass(opts.unedited_char_class).text(new_text);
    },
    _set_mask_html: function(e) {
      var el, text, divider_reg, mask_html_pos, opts, text_minus_dividers;
      opts = this.options;
      div = this.element;
      var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (e.type == 'focus' || !is_firefox) {
        e.preventDefault();
      }else if (this.element[0] == document.activeElement){
        e.preventDefault();
      }
      if (!this.do_not_focus) {
        opts.onFocus(e);
        text_minus_dividers = this._text_minus_dividers();
        div.html('');
        mask_html_pos = this._get_mask_html(text_minus_dividers);
        if (mask_html_pos[1] == opts.mask.join('').length) {
          this.current_position = 0;
        }else{
          this.current_position = mask_html_pos[1];
        }
        _.map(mask_html_pos[0], function(el) {
          return div.append(el);
        });
        this.do_not_focus = true;
        el = this._focus_current_span();
        this._set_cursor(el);
      }
      return delete this.do_not_focus;
    },
    _text_minus_dividers: function() {
      var divider_reg = new RegExp(this.options.divider, 'g');
      return this.element.text().replace(divider_reg, '');
    },
    _clear_cursor: function() {
      if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
          window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
          window.getSelection().removeAllRanges();
        }
      } else if (document.selection) {  // IE?
        document.selection.empty();
      }
    },
    _add_range: function(selection, node, pos) {
      var range = document.createRange();
      range.selectNodeContents(node);
      range.collapse(false);
      range.setStart(node, pos);
      range.setEnd(node, pos);
      return selection.addRange(range);
    },
    _set_cursor: function(el, end_of_span) {
      end_of_span = end_of_span || false;
      var pos = 0;
      if (end_of_span) { pos = 1; }
      if (el[0]) {
        if (window.getSelection) {
          if (window.getSelection().setPosition) {
            return window.getSelection().setPosition(el[0], pos);
          }else{
            return this._add_range(window.getSelection(), el[0], pos);
          }
        } else if (document.selection) {
          return this._add_range(document.selection, el[0], pos);
        }
      }
      return;
    },
    _handle_blur_mask: function(e) {
      var el_text, divider_text, div, opts, regs, masks, divider_count, last_match_index;
      opts = this.options;
      div = this.element;
      divider_count = 0;
      last_match_index = 0;
      e.preventDefault();
      delete this.do_not_focus;
      regs = _.flatten(opts.regs);
      masks = opts.mask.join('').split('');
      el_text = div.text().split('');
      divider_text = opts.divider;
      el_text = _.map(el_text, function(c, index) {
        if (regs[index - divider_count].test(c)) {
          last_match_index = index + 1;
          return c;
        }else if (c == divider_text) {
          divider_count += 1;
          return c;
        }else{
          return masks[index-divider_count];
        }
      })
      el_text = el_text.slice(0, last_match_index);
      div.html(el_text.join(''));
      return opts.onBlur(e);
    },
    _dividers_before_current_position: function() {
      var current_pos = this.current_position;
      var splice_points = this._get_splice_points();
      return _.compact(_.map(splice_points, function(point) {
        if (current_pos >= point && point > 0) {
          return 1;
        }
      })).length;
    },
    _get_splice_points: function() {
      var text_no_dividers = this._text_minus_dividers().split('');
      var count_back = 0;
      return _.map(_.clone(this.options.mask).reverse(), function(str) {
        count_back += str.length;
        return text_no_dividers.length - count_back;
      });
    },
    _move_to_next_mask_sub_element: function(e) {
      if ((e.which || e.keyCode) == 9) { return;}
      var current_key, el, opts, div;
      opts = this.options;
      div = this.element;
      e.preventDefault();
      current_key = String.fromCharCode(e.keyCode || e.which);
      this.do_not_focus = true;
      if (this.current_position < opts.regs.length && opts.regs[this.current_position].test(current_key)) {
        div.find("[data-num=" + this.current_position + "]").text(current_key).removeClass(opts.unedited_char_class).addClass(opts.edited_char_class);
        this._move(1);
      }
      return;
    },
    _create_span: function(klass, text, num) {
      var span;
      span = document.createElement('span');
      span.setAttribute('class', klass);
      span.innerHTML = text;
      if (num != null) {
        span.setAttribute('data-num', num);
      }
      return span;
    },
    _text_matches_mask: function(el_text, mask) {
      this.options.mask
    },
    _get_mask_html: function(el_text) {
      var index, splice_point, splits, texts, text_to_use, class_to_use, pos_index,
        _this = this, opts;
      opts = this.options;
      index = 0;
      pos_index = 0;
      texts = _.flatten(_.map(opts.mask, function(text) {
        return _.map(text, function(char) {
          if (opts.regs[index].test(el_text[index]) && el_text[index]) {
           text_to_use = el_text[index];
           class_to_use = opts.edited_char_class;
           pos_index += 1;
          }else{
           text_to_use = char;
           class_to_use = opts.unedited_char_class;
          }
          return _this._create_span(class_to_use, text_to_use, index++);
        });
      }));
      splits = _.map(opts.mask, function(chars) {
        return chars.length;
      });
      splits = splits.splice(0, splits.length - 1);
      splice_point = 0;
      this.splice_points = [];
      _.each(splits, function(len) {
        splice_point += len;
        texts.splice(splice_point, 0, _this._create_span(opts.divider_class, opts.divider));
        _this.splice_points.push(splice_point);
        return splice_point += 1;
      });
      return [texts, pos_index];
    },
  });

  $.widget("ui.unmaskDiv", {
    options: {},
    _create: function() {
      this.element.maskDiv('destroy');
      return this.element.unmaskDiv('destroy');
    }
  })
}).call(this);
