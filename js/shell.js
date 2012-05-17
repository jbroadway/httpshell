var shell = {
	// status messages
	statuses: {
		100: 'Continue',
		101: 'Switching Protocols',
		102: 'Processing',
		200: 'OK',
		201: 'Created',
		202: 'Accepted',
		203: 'Partial Information',
		204: 'No Content',
		205: 'Reset Content',
		206: 'Partial Content',
		207: 'Multi-Status',
		208: 'Already Reported',
		300: 'Multiple Choices',
		301: 'Moved Permanently',
		302: 'Found',
		303: 'See Other',
		304: 'Not Modified',
		305: 'Use Proxy',
		306: 'Switch Proxy',
		307: 'Temporary Redirect',
		308: 'Permanent Redirect',
		400: 'Bad Request',
		401: 'Unauthorized',
		402: 'Payment Required',
		403: 'Forbidden',
		404: 'Not Found',
		405: 'Method Not Allowed',
		406: 'Not Acceptable',
		407: 'Proxy Authentication Required',
		408: 'Request Timeout',
		409: 'Conflict',
		410: 'Gone',
		411: 'Length Required',
		412: 'Precondition Failed',
		413: 'Request Entity Too Large',
		414: 'Request-URI Too Long',
		415: 'Unsupported Media Type',
		500: 'Internal Error',
		501: 'Not Implemented',
		502: 'Bad Gateway',
		503: 'Service Unavailable',
		504: 'Gateway Timeout',
		505: 'HTTP Version Not Supported',
		509: 'Bandwidth Limit Exceeded'
	},

	// jquery-syntax root
	syntax_root: '/apps/httpshell/js/jquery-syntax/',

	// history of commands
	history: [],
	
	// add to history of commands
	add_to_history: function (elements) {
		shell.history.push (elements);
	},

	// highlight json syntax, from: http://stackoverflow.com/a/7220510/1092725
	highlight: function (json) {
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			var cls = 'number';
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'key';
				} else {
					cls = 'string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'boolean';
			} else if (/null/.test(match)) {
				cls = 'null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
	},
	
	// escape html entities for output
	htmlentities: function (html) {
		return html
			.replace (/&/g, '&amp;')
			.replace (/</g, '&lt;')
			.replace (/>/g, '&gt;')
			.replace (/"/g, '&quot;');
	},

	// delete a name/value pair
	delete_row: function (el) {
		$(el).parent ().remove ();
		return false;
	}
};

$(function () {
	// focus url on load
	$('#url').focus ();

	// show raw post body input
	$('#set-body').click (function () {
		$('#params').html ('').hide ();
		$('#post-body').show ();
	});

	// add post parameter
	$('#add-param').click (function () {
		$('#post-body').val ('').hide ();
		$('#params').show ();
		$('#params').append ('<p><input type="text" class="param-name" placeholder="name" /> <input type="text" class="param-value" placeholder="value" /> <a href="#" class="delete-row" onclick="return shell.delete_row (this)">x</a></p>');
	});

	// add a header row
	$('#add-header').click (function () {
		$('#headers').append ('<p><input type="text" class="header-name" placeholder="name" /> <input type="text" class="header-value" placeholder="value" /> <a href="#" class="delete-row" onclick="return shell.delete_row (this)">x</a></p>');
		$('.delete-row').click (shell.delete_row);
	});

	// clear the form to its original state
	$('#clear').click (function () {
		$('#url').val ('');
		$('#method').val ('get');
		$('#post-body').val ('');
		$('#params').html ('<p><input type="text" class="param-name" placeholder="name" /> <input type="text" class="param-value" placeholder="value" /> <a href="#" class="delete-row" onclick="return shell.delete_row (this)">x</a></p>');
		$('#headers').html ('');
		$('#post-options').hide ();
		return false;
	});

	// change http methods
	$('#method').change (function () {
		var method = $(this).val ();
		if (method === 'post' || method === 'put' || method === 'patch') {
			$('#post-options').show ();
		} else {
			$('#post-options').hide ();
			$('#params').html ('');
			$('#post-body').val ('');
		}
	});

	// submit the request
	$('#shell').submit (function () {
		var data = {
			url: '',
			method: 'get',
			params: {},
			body: '',
			user: '',
			pass: '',
			headers: {}
		};

		// add to history
		shell.add_to_history (this.elements);

		// build the request data
		data.url = $('#url').val ();
		data.method = $('#method').val ();
		data.body = $('#post-body').val ();

		params_name = $('.param-name');
		params_value = $('.param-value');
		for (var i = 0; i < params_name.length; i++) {
			data.params[params_name[i].value] = params_value[i].value;
		}

		headers_name = $('.header-name');
		headers_value = $('.header-value');
		for (var i = 0; i < headers_name.length; i++) {
			data.headers[headers_name[i].value] = headers_value[i].value;
		}

		// reset response fields
		$('#response-headers').html ('Please wait...');
		$('#response-body').html ('');

		// send the request
		$.post ('/httpshell/request/send', data, function (res) {
			if (! res.success) {
				$('#response-headers').html ('Error: ' + res.error);
				return false;
			}

			// build the response headers
			var headers = '<span class="status">HTTP/1.1 ' + res.data.status + ' ' + shell.statuses[res.data.status] + '</span>',
				content_type = 'text/html';

			for (var i in res.data.headers) {
				if (i === 'content-type') {
					content_type = res.data.headers[i];
				}
				headers += "\n<span class=\"header-name\">" + i + ':</span> <span class="header-value">' + res.data.headers[i] + '</span>';
			}

			// show the headers
			$('#response-headers').html (headers);

			// show the response body
			if (content_type === 'application/json') {
				$('#response-body').html (shell.highlight (JSON.stringify (JSON.parse (res.data.body), undefined, 4)));
			} else {
				$('#response-body').html ('<code class="brush-html">' + shell.htmlentities (res.data.body) + '</code>');
				$.syntax ({root: shell.syntax_root, blockSelector: 'pre>code', blockLayout: 'plain'});
			}
			
			// scroll to the response
			$('#response')[0].scrollIntoView (true);
		});

		return false;
	});
});