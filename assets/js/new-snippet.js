$(function() {
	"use strict";
	var _submitBtn = $('#btn-submit');
	var _backLink = $('#link-back');
	var _newSnippetForm = $('#form-new-snippet');
	var _snippetTypeSelect = $('#select-snippet-type');
	var MODE_ARRAY = ['text/x-c++src', 'text/x-java', 'text/x-c++src', 'text/x-csharp']; //first should be javascript

	var _editorMode = 'text/x-c++src';
	var editor = CodeMirror.fromTextArea(document.getElementById("input-snippet-content"), {
		lineNumbers: true,
		matchBrackets: true,
		theme: 'base16-light',
		mode: _editorMode,
		extraKeys: {
			"F11": function(cm) {
				cm.setOption("fullScreen", !cm.getOption("fullScreen"));
			},
			"Esc": function(cm) {
				if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
			}
		}
	});

	_snippetTypeSelect.on('change', function() {
		var self = $(this);
		_editorMode = MODE_ARRAY[parseInt(self.val()) - 1];
		editor.setOption("mode", _editorMode);
		self.blur();
	});

	var newSnippetValidator = _newSnippetForm.validate({
		rules: {
			title: "required",
			snippet: "required"
		},
		messages: {
			title: Message.TITLE_REQUIRED,
			snippet: Message.SNIPPET_REQUIRED
		}
	});

	_submitBtn.on('click', function() {
		if (newSnippetValidator.form()) {
			_backLink.attr('disabled', true);
			_submitBtn.attr('disabled', true);
			_newSnippetForm.submit();
		}
	});
});