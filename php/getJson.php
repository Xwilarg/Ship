<?php

if (strpos($_GET['folder'], "..") !== false)
{
    http_response_code(400);
}
else
{
    $allJson = json_decode(file_get_contents(__DIR__ . "/../Ship_data/" . $_GET['folder'] . "/names.json"), true)["names"];

    $data = [];

    foreach ($allJson as $json) {
        array_push($data, json_decode(file_get_contents(__DIR__ . "/../Ship_data/" . $_GET['folder'] . "/" . $json . ".json")));
    }

    echo json_encode($data);
}