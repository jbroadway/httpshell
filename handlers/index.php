<?php

/**
 * Creates the Http Shell user interface.
 */

$this->require_admin ();

$page->layout = 'admin';
$page->title = i18n_get ('Http Shell');
$page->add_style ('/apps/httpshell/css/style.css');
$page->add_script ('/apps/httpshell/js/jquery-syntax/jquery.syntax.min.js');
$page->add_script ('/apps/httpshell/js/shell.js');

echo $tpl->render ('httpshell/index');

?>