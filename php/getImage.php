<?php

if (substr($_GET['imageLink'], 0, 4) !== "http")
{
    http_response_code(404);
}
else if (strpos($_GET['animeName'], "..") !== false || strpos($_GET['characterName'], "..") !== false || strpos($_GET['characterName2'], "..") !== false)
{
    http_response_code(400);
}
else
{
    $animeName = $_GET['animeName'];
    $characterName = $_GET['characterName'];
    $characterName2 = $_GET['characterName2'];
    $imageLink = $_GET['imageLink'];
    $names = $characterName < $characterName2 ? ($characterName . "_" . $characterName2)  : ($characterName2 . "_" . $characterName);
    $format = pathinfo(
        parse_url($_GET['imageLink'], PHP_URL_PATH), 
        PATHINFO_EXTENSION
    );
    
    $folderName = __DIR__ . "/../img/" . $animeName;
    $fileName = __DIR__ . "/../img/" . $animeName . "/" . $names . $format;

    if (!file_exists($folderName)) {
        if (!mkdir($folderName))
            {
                $error = error_get_last();
                echo $error['message'];
                http_response_code(500);
                return;
            }
    }
 
    if (!file_exists($fileName)) {

        $options = [
            "http" => [
                "method" => "GET"
            ]
        ];
        $context = stream_context_create($options);
        file_put_contents($fileName, file_get_contents($_GET['imageLink'], false, $context));
    }
    echo $fileName;
}