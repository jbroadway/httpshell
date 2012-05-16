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

	// from: http://stackoverflow.com/a/7220510/1092725
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
	
	htmlentities: function (html) {
		return html
			.replace (/&/g, '&amp;')
			.replace (/</g, '&lt;')
			.replace (/>/g, '&gt;')
			.replace (/"/g, '&quot;');
	}
};

$(function () {
	$('#url').focus ();

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

		shell.add_to_history (this.elements);

		data.url = $('#url').val ();
		data.method = $('#method').val ();

		$('#response-headers').html ('Please wait...');
		$('#response-body').html ('');

		$.post ('/httpshell/request/send', data, function (res) {
			if (! res.success) {
				$('#response-headers').html ('Error: ' + res.error);
				return false;
			}

			var headers = '<span class="status">HTTP/1.1 ' + res.data.status + ' ' + shell.statuses[res.data.status] + '</span>',
				content_type = 'text/html';
			for (var i in res.data.headers) {
				if (i === 'content-type') {
					content_type = res.data.headers[i];
				}
				headers += "\n<span class=\"header-name\">" + i + ':</span> <span class="header-value">' + res.data.headers[i] + '</span>';
			}

			$('#response-headers').html (headers);
			
			if (content_type === 'application/json') {
				$('#response-body').html (shell.highlight (JSON.stringify (JSON.parse (res.data.body), undefined, 4)));
			} else {
				$('#response-body').html ('<code class="brush-html">' + shell.htmlentities (res.data.body) + '</code>');
				$.syntax ({root: shell.syntax_root, blockSelector: 'pre>code', blockLayout: 'plain'});
			}
		});

		return false;
	});
});