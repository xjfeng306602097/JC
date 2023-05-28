#!/usr/bin/env php
<?php

if (php_sapi_name() != 'cli') {
    echo 'You need to run this command from console.';
    exit(1);
}

$tcpdf_include_dirs = array(realpath(dirname(__FILE__) . '/../tcpdf.php'), '/usr/share/php/tcpdf/tcpdf.php', '/usr/share/tcpdf/tcpdf.php', '/usr/share/php-tcpdf/tcpdf.php', '/var/www/tcpdf/tcpdf.php', '/var/www/html/tcpdf/tcpdf.php', '/usr/local/apache2/htdocs/tcpdf/tcpdf.php');
foreach ($tcpdf_include_dirs as $tcpdf_include_path) {
    if (@file_exists($tcpdf_include_path)) {
        require_once $tcpdf_include_path;
        break;
    }
}

// remove the name of the executing script
array_shift($argv);

// 网站根目录
define('ROOT_PATH', realpath(dirname(__FILE__) . '../../../../../../'));

// 定义字体文件文件夹所在位置
define('TCPDF_RAWFONT_PATH', ROOT_PATH . '/public/pdf/static/font/');

// tcpdf: 添加新字体
function addFont($opts = [])
{
    $options = array('type' => '', 'enc' => '', 'flags' => 32, 'outpath' => K_PATH_FONTS, 'platid' => 3, 'encid' => 1, 'addcbbox' => false, 'link' => false);
    foreach ($opts as $key => $val) {
        if (isset($options[$key])) {
            $options[$key] = $val;
        }
        switch ($key) {
            case 'type':
                if (in_array($val, array('TrueTypeUnicode', 'TrueType', 'Type1', 'CID0JP', 'CID0KR', 'CID0CS', 'CID0CT'))) {
                    $options['type'] = $val;
                }
                break;
            case 'enc':
                $options['enc'] = $val;
                break;

            case 'flags':
                $options['flags'] = intval($val);
                break;

            case 'outpath':
                $options['outpath'] = realpath($val);
                if (substr($options['outpath'], -1) != '/') {
                    $options['outpath'] .= '/';
                }
                break;

            case 'platid':
                $options['platid'] = min(max(1, intval($val)), 3);
                break;

            case 'encid':
                $options['encid'] = min(max(0, intval($val)), 10);
                break;

            case 'addcbbox':
                $options['addcbbox'] = true;
                break;

            case 'link':
                $options['link'] = true;
                break;

            case 'fonts':
                if (is_array($val)) {
                    $options['fonts'] = array_values($val);
                } else {
                    $options['fonts'] = explode(',', $val);
                }
                break;

            default:
                break;
        }
    }
    if (empty($options['fonts'])) {
        echo "ERROR: missing input fonts\n\n";
        return false;
    }

    // check the output path
    if (!is_dir($options['outpath']) or !is_writable($options['outpath'])) {
        echo "ERROR: Can't write to " . $options['outpath'] . "\n\n";
        return false;
    }

    echo "\n>>> Converting fonts for TCPDF:\n";

    echo '*** Output dir set to ' . $options['outpath'] . "\n";

    // check if there are conversion errors
    $errors = false;

    foreach ($options['fonts'] as $font) {
        $fontfile = realpath(TCPDF_RAWFONT_PATH . $font);
        $fontname = TCPDF_FONTS::addTTFfont($fontfile, $options['type'], $options['enc'], $options['flags'], $options['outpath'], $options['platid'], $options['encid'], $options['addcbbox'], $options['link']);
        if ($fontname === false) {
            $errors = true;
            echo "--- ERROR: can't add " . $font . "\n";
        } else {
            echo "+++ OK   : " . $fontfile . ' added as ' . $fontname . "\n";
        }
    }

    if ($errors) {
        echo "--- Process completed with ERRORS!\n\n";
        return false;
    }

    echo ">>> Process successfully completed!\n\n";
    return true;
}

// tcpdf: 自动载入字体
function autoloadFont()
{
    $jsonFile = TCPDF_RAWFONT_PATH . 'fonts.json';
    $json = @file_get_contents($jsonFile);
    if ($json === false) {
        echo "No fonts to load!\n";
        return 0;
    }
    $array = json_decode($json, true);
    if (is_null($array)) {
        echo "Non-standard JSON format!\n";
        return 0;
    }
    if (empty($array) || !is_array($array)) {
        echo "No fonts to load!\n";
        return 0;
    }
    $total = count($array);
    $added = 0;
    foreach ($array as $i => $options) {
        if (!is_array($options) || $options['failed'] > 5) {
            continue;
        }
        if (addFont($options)) {
            unset($array[$i]);
            ++$added;
        } else {
            if (!isset($options['failed'])) {
                $array[$i]['failed'] = 1;
            } else {
                ++$array[$i]['failed'];
            }
        }
    }
    $failed = $total - $total;
    echo "Successfully added {$added} fonts, but failed to add {$failed} fonts\n\n";
    $json = json_encode($array, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    file_put_contents($jsonFile, $json);
    return $added;
}

// 执行载入需要添加的字体包
autoloadFont();
