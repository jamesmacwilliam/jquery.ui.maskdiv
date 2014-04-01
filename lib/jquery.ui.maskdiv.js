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
      var opts,
        _this = this;
      opts = this.options;
      this.options.regs = this._regex_from_mask(opts.mask_matchers || opts.mask);
      this.element.on('focus', function(e) {
        return _this._set_mask_html(e, _this.options, _this.element, _this._get_mask_html, _this._create_span);
      });
      this.element.on('blur', function(e) {
        return _this._handle_blur_mask(e, _this.options, _this.element);
      });
      this.element.on('keypress', function(e) {
        return _this._move_to_next_mask_sub_element(e, _this.options, _this.element);
      });
      return this.element.on('keydown', function(e) {
        return _this._handle_keydown(e, _this.element, _this.options);
      });
    },
    destroy: function() {
      this.element.off('focus');
      this.element.off('blur');
      this.element.off('keypress');
      this.element.off('keydown');
      this.element.html(this.element.text());
      return $.Widget.prototype.destroy.call(this);
    },
    _destroy: function() {
      this.element.off('focus');
      this.element.off('blur');
      this.element.off('keypress');
      this.element.off('keydown');
      this.element.html(this.element.text());
      return $.Widget.prototype.destroy.call(this);
    },
    _regex_from_mask: function(mask) {
      var regs = {
        '9': "[0-9]",
        'a': "[A-Za-z]",
        '*': "[A-Za-z0-9]"
      };
      return _.map(mask.join(''), function(c) {
        return new RegExp(regs[c] || regs['*']);
      });
    },
    _handle_keydown: function(e, div, opts) {
      var k, mask_string, replace_current_text_and_move,
        _this = this;
      k = e.keyCode;
      mask_string = _.flatten(opts.mask).join('');
      replace_current_text_and_move = function() {
        var el;
        el = div.find("[data-num=" + _this.current_position + "]");
        el.text(mask_string[_this.current_position]).focus().removeClass(opts.edited_char_class).addClass(opts.unedited_char_class);
        el.focus();
        return window.getSelection().setPosition(el[0], 0);
      };
      switch (k) {
        case 8:
          e.preventDefault();
          if (this.current_position > 0) {
            this.current_position -= 1;
            replace_current_text_and_move();
          }
        case 46:
          e.preventDefault();
          replace_current_text_and_move();
      }
      return;
    },
    _set_mask_html: function(e, opts, div, fn, create_span) {
      var el, text, divider_reg, mask_html_pos;
      e.preventDefault();
      if (!this.do_not_focus) {
        opts.onFocus(e);
        divider_reg = new RegExp(opts.divider, 'g')
        text = div.text().replace(divider_reg, '');
        div.html('');
        mask_html_pos = fn(create_span, text, opts);
        this.current_position = mask_html_pos[1];
        _.map(mask_html_pos[0], function(el) {
          return div.append(el);
        });
        this.do_not_focus = true;

        //window.selection.clear();
        if (window.getSelection) {
          if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
          } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
          }
        } else if (document.selection) {  // IE?
          document.selection.empty();
        }

        el = div.find('span[data-num=' + this.current_position + ']').focus();
        window.getSelection().setPosition(el[0], 0);
      }
      return delete this.do_not_focus;
    },
    _handle_blur_mask: function(e, opts, div) {
      var el_text, divider_reg, current_pos, count_back, splice_points, divider_pos, text_no_dividers;
      e.preventDefault();
      delete this.do_not_focus;
      divider_reg = new RegExp(opts.divider, 'g')
      el_text = div.text().split('');
      text_no_dividers = div.text().replace(divider_reg, '').split('');
      current_pos = this.current_position;
      count_back = 0;
      splice_points = _.map(_.clone(opts.mask).reverse(), function(str) {
        count_back += str.length;
        return text_no_dividers.length - count_back;
      });
      divider_pos = _.compact(_.map(splice_points, function(point) {
        if (current_pos >= point && point > 0) {
          return 1;
        }
      })).length;
      el_text.splice(this.current_position + divider_pos, el_text.length);
      div.html(el_text.join(''));
      return opts.onBlur(e);
    },
    _move_to_next_mask_sub_element: function(e, opts, div) {
      var current_key, el;
      e.preventDefault();
      current_key = String.fromCharCode(e.keyCode || e.which);
      this.do_not_focus = true;
      if (this.current_position < opts.regs.length && opts.regs[this.current_position].test(current_key)) {
        div.find("[data-num=" + this.current_position + "]").text(current_key).removeClass(opts.unedited_char_class).addClass(opts.edited_char_class);
        el = div.find("[data-num=" + (this.current_position += 1) + "]").focus();
        window.getSelection().setPosition(el[0], 0);
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
      opts.mask
    },
    _get_mask_html: function(create_span, el_text, opts) {
      var index, splice_point, splits, texts, text_to_use, class_to_use, pos_index,
        _this = this;
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
          return create_span(class_to_use, text_to_use, index++);
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
        texts.splice(splice_point, 0, create_span(opts.divider_class, opts.divider));
        _this.splice_points.push(splice_point);
        return splice_point += 1;
      });
      if (pos_index == index) { pos_index = 0; }
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
