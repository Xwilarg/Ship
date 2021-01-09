<?php
if (strpos($_GET['folder'], "..") !== false)
{
    http_response_code(400);
}
else
{
    echo file_get_contents(__DIR__ . "/../Ship_data/" . $_GET['folder'] . "/crossover.json");
}