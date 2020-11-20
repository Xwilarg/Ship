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
    $canCreate = $_GET['token'] !== NULL && file_get_contents(__DIR__ . "/token.txt") === sha1($_GET['token']); // We don't allow normal usage to create storage so they don't mess with everything
    $imageLink = $_GET['imageLink'];

    if ($canCreate && $_GET["isPixiv"] === "true") { // Pixiv link doesn't directly lead to the image
        $options = [
            "http" => [
                "method" => "GET"
            ]
        ];
        $context = stream_context_create($options);
        $html = file_get_contents($imageLink . "&size=large&border=off", false, $context);
        preg_match('/src="(https:\/\/i\.[^"]+)"/', $html, $matches);
        $imageLink = $matches[1];
    }

    $animeName = $_GET['animeName'];
    $characterName = $_GET['characterName'];
    $characterName2 = $_GET['characterName2'];
    $index = $_GET["index"];
    $names = ($characterName < $characterName2 ? ($characterName . "_" . $characterName2)  : ($characterName2 . "_" . $characterName)) . "-" . $index;
    $format = substr($imageLink, -4) === "=jpg" ? "jpg" : pathinfo(
        parse_url($imageLink, PHP_URL_PATH),
        PATHINFO_EXTENSION
    );
    
    $folderName = __DIR__ . "/../img/" . $animeName;
    $fileName = __DIR__ . "/../img/" . $animeName . "/" . $names . "." . $format;


    if (!file_exists($folderName)) {
        if (!$canCreate)
        {
            echo $imageLink;
            return;
        }
        if (!mkdir($folderName))
        {
            echo $imageLink;
            return;
        }
    }
 
    if (!file_exists($fileName)) {
        if (!$canCreate)
        {
            echo $imageLink;
            return;
        }
        if ($_GET["isPixiv"] === "true") {
            $options = [
                "http" => [
                    "method" => "GET",
                    'header'=> "referer: https://embed.pixiv.net/\r\n"
                ]
            ];
        } else {
            $options = [
                "http" => [
                    "method" => "GET"
                ]
            ];
        }
        $context = stream_context_create($options);
        file_put_contents($fileName, file_get_contents($imageLink, false, $context));
    }
    echo str_replace(" ", "%20", "img/" . $animeName . "/" . $names . "." . $format);
}