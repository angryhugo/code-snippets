$(function() {
	var _csrf = $('#input-csrf').val();
	var _deleteSnippetLink = $('.link-delete-snippet');
	_deleteSnippetLink.on('click', function() {
		var self = $(this);
		bootbox.confirm(Message.DELETE_SNIPPET_CONFIRM, function(result) {
			if (result) {
				var snippetId = self.attr('data-snippet-id');
				$.ajax({
					type: 'DELETE',
					url: '/api/snippets/' + snippetId,
					data: {
						_csrf: _csrf
						// snippetId: snippetId
					},
					dataType: 'json',
					success: function(data) {
						if (data.code === 200) {
							self.parent().parent().remove();
							bootbox.alert(Message.DELETE_SNIPPET_SUCCESS);
						} else if (data.code === 400) {
							bootbox.alert(Message.SNIPPET_NOT_EXSIT);
						} else {
							bootbox.alert(Message.DELETE_SNIPPET_FORBIDDEN);
						}
					},
					error: function(xhr, status, err) {
						bootbox.alert(Message.SERVER_ERROR);
					}
				});
			}
		});
	});
});