$(function() {
	"use strict";
	var $submitBtn = $('#btn-submit');
	var $backLink = $('#link-back');
	var $newSnippetForm = $('#form-new-snippet');
	var $snippetTypeSelect = $('#select-snippet-type');
	var MODE_ARRAY = ['text/javascript', 'text/x-java', 'text/x-c++src', 'text/x-csharp'];
	var _editorMode = MODE_ARRAY[0];

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

	$snippetTypeSelect.selectpicker();

	$snippetTypeSelect.on('change', function() {
		var self = $(this);
		_editorMode = MODE_ARRAY[parseInt(self.val(), 10) - 1];
		editor.setOption("mode", _editorMode);
		self.blur();
	});

	var newSnippetValidator = $newSnippetForm.validate({
		rules: {
			title: "required",
			snippet: "required"
		},
		messages: {
			title: Message.TITLE_REQUIRED,
			snippet: Message.SNIPPET_REQUIRED
		}
	});

	$submitBtn.on('click', function() {
		if (newSnippetValidator.form()) {
			$backLink.attr('disabled', true);
			$submitBtn.attr('disabled', true);
			$newSnippetForm.submit();
		}
	});
});