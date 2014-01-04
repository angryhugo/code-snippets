$(function() {
	var _csrf = $('#input-csrf').val();
	var _deleteSnippetLink = $('.link-delete-snippet');
	var _deleteSnippetLinkFinal = $('#link-delete-snippet-final');
	var _deleteSnippetLinkCancel = $('#link-delete-snippet-cancel');
	var _deleteSnippetModal = $('#modal-delete-snippet');
	var _reasonInput = $('#input-reason');
	var _snippetTable = $('#table-snippets');

	_snippetTable.find("tr:even").addClass('even');

	_deleteSnippetLink.on('click', function() {
		var self = $(this);
		_deleteSnippetModal.modal();
		_deleteSnippetLinkFinal.attr('data-snippet-id', self.attr('data-snippet-id'));
	});

	_deleteSnippetLinkCancel.on('click', function() {
		_reasonInput.val('');
	});

	_deleteSnippetLinkFinal.on('click', function() {
		var self = $(this);
		var snippetId = self.attr('data-snippet-id');
		$.ajax({
			type: 'DELETE',
			url: '/api/snippets/' + snippetId,
			data: {
				_csrf: _csrf,
				reason: _reasonInput.val()
			},
			dataType: 'json',
			success: function(data) {
				_deleteSnippetModal.modal('hide');
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
				_deleteSnippetModal.modal('hide');
				bootbox.alert(Message.SERVER_ERROR);
			}
		});
	})


});