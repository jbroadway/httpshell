<?php

/**
 * Provides the REST API for making requests.
 */

$this->require_admin ();
$this->restful (new httpshell\API ());

?>