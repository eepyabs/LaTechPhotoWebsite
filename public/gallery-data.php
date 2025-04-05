<?php
$baseDir = 'previews/';
$data = [];

foreach (scandir($baseDir) as $photographer) {
    if ($photographer === '.' || $photographer === '..') continue;

    $photographerDir = $baseDir . $photographer;
    if (!is_dir($photographerDir)) continue;

    foreach (glob("$photographerDir/*.{jpg,jpeg,png,webp}", GLOB_BRACE) as $imagePath) {
        $data[] = [
            'photographer' => $photographer,
            'image' => $imagePath
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($data);