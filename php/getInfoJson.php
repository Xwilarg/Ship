<?php
if (strpos($_GET['folder'], "..") !== false)
{
    http_response_code(400);
}
else
{
    $path = __DIR__ . "/../Ship_data/" . $_GET['folder'] . "/info.json";
    if (file_exists($path)) {
        echo file_get_contents($path);
    }
}