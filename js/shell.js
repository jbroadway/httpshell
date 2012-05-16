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

	// history of commands
	history: [],
	
	// add to history of commands
	add_to_history: function (elements) {
		shell.history.push (elements);
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
			console.log (res);
			if (! res.success) {
				$('#response-headers').html ('Error: ' + res.error);
				return false;
			}

			console.log (res.data.headers);

			$('#response-headers').html ('HTTP/1.1 ' + res.data.status + ' ' + shell.statuses[res.data.status]);
			$('#response-body').html (JSON.stringify (JSON.parse (res.data.body), undefined, "\t"));
		});

		return false;
	});
});