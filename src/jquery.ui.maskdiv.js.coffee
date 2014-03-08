$.widget("ui.maskDiv",
  options:
    mask: []
    divider: '/'
    divider_class: 'divider'
    unedited_char_class: 'unedited'
    edited_char_class: 'edited'
    onFocus: ->
    onBlur: ->

  _create: ->
    opts = @options
    @element.on 'focus', (e) => @_set_mask_html(e, @options, @element, @_get_mask_html, @_create_span)
    @element.on 'blur', (e) => @_handle_blur_mask(e, @options, @element)
    @element.on 'keypress', (e) => @_move_to_next_mask_sub_element(e, @options, @element)
    @element.on 'keydown', (e) => @_handle_keydown(e, @element, @options)

  destroy: ->
    @element.off('focus')
    @element.off('blur')
    @element.off('keypress')
    @element.off('keydown')
    @element.html(@element.text())
    $.Widget.prototype.destroy.call(@)

  _destroy: ->
    @element.off('focus')
    @element.off('blur')
    @element.off('keypress')
    @element.off('keydown')
    @element.html(@element.text())
    $.Widget.prototype.destroy.call(@)

  _handle_keydown: (e, div, opts) ->
    k = e.keyCode
    mask_string = _.flatten(opts.mask).join('')
    replace_current_text_and_move = =>
      el = div.find("[data-num=#{@current_position}]")
      el.text(mask_string[@current_position]).focus().removeClass(opts.edited_char_class).addClass(
        opts.unedited_char_class
      )
      el.focus()
      window.getSelection().setPosition(el[0], 0)
    switch k
      when 8
        #backspace
        e.preventDefault()
        @current_position -= 1
        replace_current_text_and_move()
      when 46
        #delete
        e.preventDefault()
        replace_current_text_and_move()

  _set_mask_html: (e, opts, div, fn, create_span) ->
    e.preventDefault()
    unless @do_not_focus
      @current_position = 0
      opts.onFocus(e)
      div.html('')
      _.map fn(create_span, opts), (el) -> div.append(el)
      @do_not_focus = true
      el = div.find('span:first').focus()
      window.getSelection().setPosition(el[0], 0)
    delete @do_not_focus

  _handle_blur_mask: (e, opts, div) ->
    e.preventDefault()
    delete @do_not_focus
    el_text = div.text().split('')
    current_pos = @current_position
    count_back = 0
    splice_points = _.map _.clone(opts.mask).reverse(), (str) ->
      count_back += str.length
      el_text.length - count_back
    divider_pos = _.compact(_.map(splice_points, (point) ->
      1 if current_pos >= point && point > 0
    )).length
    el_text.splice(@current_position + divider_pos, el_text.length)
    div.html(el_text.join(''))
    opts.onBlur(e)

  _move_to_next_mask_sub_element: (e, opts, div) ->
    e.preventDefault()
    current_key = String.fromCharCode(e.keyCode)
    div.find("[data-num=#{@current_position}]").text(current_key).removeClass(
      opts.unedited_char_class
    ).addClass(opts.edited_char_class)
    @do_not_focus = true
    el = div.find("[data-num=#{@current_position += 1}]").focus()
    window.getSelection().setPosition(el[0], 0)

  _create_span: (klass, text, num) ->
    span = document.createElement('span')
    span.setAttribute('class', klass)
    span.innerHTML = text
    span.setAttribute('data-num', num) if num?
    span

  _get_mask_html: (create_span, opts) ->
    index = 0
    texts = _.flatten _.map opts.mask, (text) ->
      _.map text, (char) ->
        create_span(opts.unedited_char_class, char, index++)
    splits = _.map(opts.mask, (chars) -> chars.length)
    splits = splits.splice(0, splits.length - 1)
    splice_point = 0
    @splice_points = []
    _.each splits, (len) =>
      splice_point += len
      texts.splice(splice_point, 0, create_span(opts.divider_class, opts.divider))
      @splice_points.push(splice_point)
      splice_point += 1
    texts
)
$.widget("ui.unmaskDiv",
  options: {}
  _create: ->
    @element.maskDiv('destroy')
    @element.unmaskDiv('destroy')
)
