<?php

$options = [
    "http" => [
        "method" => "GET"
    ]
];
$context = stream_context_create($options);
echo(file_get_contents($_GET['url'], false, $context));