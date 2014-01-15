$(function() {
	"use strict";
	var $submitBtn = $('#btn-submit');
	var $backLink = $('#link-back');
	var $newSnippetForm = $('#form-new-snippet');
	var $snippetTypeSelect = $('#select-snippet-type');

	var _options = $snippetTypeSelect.find('option');
	var MODE_ARRAY = [];
	for (var i = 0; i < _options.length; i++) {
		MODE_ARRAY[i] = _options[i].dataset.mode;
	}
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

	editor.setSize(null, 500);

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