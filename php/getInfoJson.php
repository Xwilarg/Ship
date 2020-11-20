<?php
$path = __DIR__ . "/../Ship_data/" . $_GET['folder'] . "/info.json";
if (file_exists($path)) {
    echo file_get_contents($path);
}