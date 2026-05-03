<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

use PhpLms\Controllers\PortalController;

$controller = new PortalController($db, $auth);
$controller->dispatch(app_path());
