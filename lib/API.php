<?php

namespace httpshell;

use Requests;

class API extends \Restful {
	/**
	 * Makes a request. Usage:
	 *
	 *     POST /httpshell/request/send
	 *
	 * Parameters:
	 *
	 * - url - The URL to request
	 * - method - The request method
	 * - params - Request parameters (for POST requests)
	 * - body - Alternate POST body instead of params
	 * - user - HTTP Basic username
	 * - pass - HTTP Basic password
	 * - headers - Custom headers to send
	 */
	public function post_send () {
		if (! isset ($_POST['url'])) {
			return $this->error ('Missing field: url');
		}

		if (! isset ($_POST['method'])) {
			return $this->error ('Missing field: method');
		}

		Requests::register_autoloader ();

		switch (strtolower ($_POST['method'])) {
			case 'get':
				$type = Requests::GET;
				break;
			case 'head':
				$type = Requests::HEAD;
				break;
			case 'post':
				$type = Requests::POST;
				break;
			case 'put':
				$type = Requests::PUT;
				break;
			case 'patch':
				$type = Requests::PATCH;
				break;
			case 'delete':
				$type = Requests::DELETE;
				break;
			default:
				return $this->error ('Invalid or unsupported request method');
		}

		$headers = array ();
		if (is_array ($_POST['headers'])) {
			$headers = $_POST['headers'];
		}

		$data = array ();
		if (is_array ($_POST['params'])) {
			$data = $_POST['params'];
		}
		$options = array ();

		if (! empty ($_POST['user'])) {
			$options['auth'] = array ();
			$options['auth']['username'] = $_POST['user'];
		}

		if (! empty ($_POST['pass'])) {
			$options['auth'] = is_array ($options['auth']) ? $options['auth'] : array ();
			$options['auth']['password'] = $_POST['pass'];
		}

		$res = Requests::request (
			$_POST['url'],
			$headers,
			$data,
			$type,
			$options
		);

		if (! $res->success) {
			return $this->error ('Request failed');
		}

		$headers = array ();
		foreach ($res->headers as $name => $value) {
			$headers[$name] = $value;
		}

		$out = array (
			'status' => $res->status_code,
			'headers' => $headers,
			'body' => $res->body
		);
		return $out;
	}
}

?>