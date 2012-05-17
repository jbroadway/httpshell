<?php

/**
 * You can make requests to this handler for testing.
 * Use the URL http://www.mywebsite.com/httpshell/test
 * and it will return the values sent to it encoded
 * as a JSON object.
 */

$page->layout = false;

header ('Content-Type: application/json');

$out = array (
	'method' => $_SERVER['REQUEST_METHOD'],
	'uri' => $_SERVER['REQUEST_URI'],
	'data' => false
);

switch ($_SERVER['REQUEST_METHOD']) {
	case 'GET':
	case 'HEAD':
	case 'DELETE':
		$out['data'] = $_GET;
		break;
	case 'POST':
	case 'PATCH':
		$out['data'] = $_POST;
		break;
	case 'PUT':
		$out['data'] = $this->get_put_data ();
		break;
}

$out['headers'] = array ();
foreach ($_SERVER as $key => $value) {
	if (substr ($key, 0, 5) === 'HTTP_') {
		$key = str_replace (' ', '-', strtolower (str_replace ('_', ' ', substr ($key, 5))));
		$out['headers'][$key] = $value;
	}
}

echo json_encode ($out);

?>