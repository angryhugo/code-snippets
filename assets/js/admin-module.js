$(function() {
	"use strict";
	var _csrf = $('#input-csrf').val();
	var $deleteSnippetLink = $('.link-delete-snippet');
	var $deleteSnippetLinkFinal = $('#link-delete-snippet-final');
	var $deleteSnippetLinkCancel = $('#link-delete-snippet-cancel');
	var $deleteSnippetModal = $('#modal-delete-snippet');
	var $reasonInput = $('#input-reason');
	var $snippetTable = $('#table-snippets');

	$snippetTable.find("tr:even").addClass('even');

	$deleteSnippetLink.on('click', function() {
		var self = $(this);
		$deleteSnippetModal.modal();
		$deleteSnippetLinkFinal.attr('data-snippet-id', self.attr('data-snippet-id'));
	});

	$deleteSnippetLinkCancel.on('click', function() {
		$reasonInput.val('');
	});

	$deleteSnippetLinkFinal.on('click', function() {
		var self = $(this);
		var snippetId = self.attr('data-snippet-id');
		$.ajax({
			type: 'DELETE',
			url: '/api/snippets/' + snippetId,
			data: {
				_csrf: _csrf,
				reason: $reasonInput.val()
			},
			dataType: 'json',
			success: function(data) {
				$deleteSnippetModal.modal('hide');
				if (data.code === 200) {
					$('#' + snippetId).remove();
					bootbox.alert(Message.DELETE_SNIPPET_SUCCESS);
				} else if (data.code === 400) {
					bootbox.alert(Message.SNIPPET_NOT_EXSIT);
				} else {
					bootbox.alert(Message.DELETE_SNIPPET_FORBIDDEN);
				}
			},
			error: function(xhr, status, err) {
				$deleteSnippetModal.modal('hide');
				bootbox.alert(Message.SERVER_ERROR);
			}
		});
	});
});