$(function() {
	"use strict";
	var _submitBtn = $('#btn-submit');
	var _backLink = $('#link-back');

	var _newSnippetForm = $('#form-new-snippet');

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