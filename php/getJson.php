<?php
$allJson = ["kancolle", "azurlane", "arknights", "touhou", "vocaloid", "fate", "fireemblem", "hololive", "madoka", "girlsfrontline", "idolmaster"];

$data = [];

foreach ($allJson as $json) {
    array_push($data, json_decode(file_get_contents(__DIR__ . "/../Ship_data/" . $json . ".json")));
}

echo json_encode($data);