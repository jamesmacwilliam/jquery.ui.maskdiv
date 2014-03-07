This widget works similarly to mask but within a contenteditable div
rather than an input.  The advantage in doing so is that the styling of
the dividers can be manipulated as a result so that we are left with a
mask that can have as many as 3 styles at once.

Requirements: jQuery, underscore.js

Usage:
add widget with jQuery(selector).maskDiv(options)
remove widget with jQuery(selector).unmaskDiv(options)

available options:

mask - an array of text specifying the non divider text, example ['MM',
'DD', 'YYYY']

divider - a string to denote the divider to place between the mask text
strings   ie: '/'

divider_class - the html class to use for the divider

unedited_char_class - the html class to use for text in the mask that
has not yet been changed by the user

edited_char_class - the html class to use for text that has been changed
by the user

onFocus - an additional event to be called when focusing on the div
(note that onFocus should be disabled outside of what is passed to this
property or they will be called multiple times

onBlur - an additional event to be called when losing focus on the div
(the same note for onFocus applies here)

enjoy!
