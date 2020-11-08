<?php

if (substr($_GET['url'], 0, 4) !== "http")
{
    http_response_code(404);
}
else
{
    $options = [
        "http" => [
            "method" => "GET"
        ]
    ];
    $context = stream_context_create($options);
    echo(file_get_contents($_GET['url'], false, $context));
}