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
          this.current_position -= 1;
          return replace_current_text_and_move();
        case 46:
          e.preventDefault();
          return replace_current_text_and_move();
      }
    },
    _set_mask_html: function(e, opts, div, fn, create_span) {
      var el;
      e.preventDefault();
      if (!this.do_not_focus) {
        this.current_position = 0;
        opts.onFocus(e);
        div.html('');
        _.map(fn(create_span, opts), function(el) {
          return div.append(el);
        });
        this.do_not_focus = true;
        el = div.find('span:first').focus();
        window.getSelection().setPosition(el[0], 0);
      }
      return delete this.do_not_focus;
    },
    _handle_blur_mask: function(e, opts, div) {
      delete this.do_not_focus;
      if (div.text() === opts.mask.join(opts.divider)) {
        div.html('');
      }
      return opts.onBlur(e);
    },
    _move_to_next_mask_sub_element: function(e, opts, div) {
      var current_key, el;
      e.preventDefault();
      current_key = String.fromCharCode(e.keyCode);
      div.find("[data-num=" + this.current_position + "]").text(current_key).removeClass(opts.unedited_char_class).addClass(opts.edited_char_class);
      this.do_not_focus = true;
      el = div.find("[data-num=" + (this.current_position += 1) + "]").focus();
      return window.getSelection().setPosition(el[0], 0);
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
    _get_mask_html: function(create_span, opts) {
      var index, splice_point, splits, texts,
        _this = this;
      index = 0;
      texts = _.flatten(_.map(opts.mask, function(text) {
        return _.map(text, function(char) {
          return create_span(opts.unedited_char_class, char, index++);
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
      return texts;
    }
  });

  $.widget("ui.unmaskDiv", {
    options: {},
    _create: function() {
      var clone, parent;
      this.element.off('focus');
      this.element.off('blur');
      this.element.off('keypress');
      this.element.off('keydown');
      return this.element.html(this.element.text());
    }
  });

}).call(this);
