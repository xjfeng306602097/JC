<?php
namespace app\libraries\pdf;

use TCPDF;

class Pdf extends TCPDF
{

    public function setX($x, $rtloff = false)
    {
        //$x = floatval($x);
        $this->x = $x;
        return;
        if (!$rtloff and $this->rtl) {
            if ($x >= 0) {
                $this->x = $this->w - $x;
            } else {
                $this->x = abs($x);
            }
        } else {
            if ($x >= 0) {
                $this->x = $x;
            } else {
                $this->x = $this->w + $x;
            }
        }
        if ($this->x < 0) {
            $this->x = 0;
        }
        if ($this->x > $this->w) {
            $this->x = $this->w;
        }
    }

    public function setY($y, $resetx = true, $rtloff = false)
    {
        //$y = floatval($y);
        $this->y = $y;
        return;
        if ($resetx) {
            //reset x
            if (!$rtloff and $this->rtl) {
                $this->x = $this->w - $this->rMargin;
            } else {
                $this->x = $this->lMargin;
            }
        }
        if ($y >= 0) {
            $this->y = $y;
        } else {
            $this->y = $this->h + $y;
        }
        if ($this->y < 0) {
            $this->y = 0;
        }
        if ($this->y > $this->h) {
            $this->y = $this->h;
        }
    }


    public function GetX() {
        return $this->x;
        //Get x position
        if ($this->rtl) {
            return ($this->w - $this->x);
        } else {
            return $this->x;
        }
    }

    public function GetY() {
        return $this->y;
    }

    /**
     *  线性渐变色输出
     *  @ gradientNode 
          array(array('color' => $col1, 'offset' => 0, 'exponent' => 1,'opacity'=>1), array('color' => $col2, 'offset' => 1, 'exponent' => 1,'opacity'=>1))
    */
    
    public function LinearGradientExpand($x, $y, $w, $h,$gradientNode, $coords=array(0,0,1,0)) {
        //$coords=array(0,0,1,-0.15);
        //echo json_encode($coords);exit;
        $this->Clip($x, $y, $w, $h);
        $this->Gradient(2, $coords,$gradientNode, array(), false);

    }

    /**
     *  圆形渐变色输出
     *  @ gradientNode 
          array(array('color' => $col1, 'offset' => 0, 'exponent' => 1,'opacity'=>1), array('color' => $col2, 'offset' => 1, 'exponent' => 1,'opacity'=>1))
    */
    public function RadialGradientExpand($x, $y, $w, $h, $gradientNode, $coords=array(0.5,0.5,0.5,0.5,1)) {
        $this->Clip($x, $y, $w, $h);
        //$this->Gradient(3, $coords, array(array('color' => $col1, 'offset' => 0, 'exponent' => 1), array('color' => $col2, 'offset' => 1, 'exponent' => 1)), array(), false);
        $this->Gradient(3, $coords,$gradientNode, array(), false);
    }

    public function SVGPathExpand($d, $style='',$svgUnit='mm') { //protected
        if ($this->state != 2) {
            return;
        }
        

        // set fill/stroke style
        $op = $this->getPathPaintOperator($style, '');
        if (empty($op)) {
            return;
        }
        $paths = array();
        $d = preg_replace('/([0-9ACHLMQSTVZ])([\-\+])/si', '\\1 \\2', $d);
        $d = preg_replace('/(\.[0-9]+)(\.)/s', '\\1 \\2', $d);
        preg_match_all('/([ACHLMQSTVZ])[\s]*([^ACHLMQSTVZ\"]*)/si', $d, $paths, PREG_SET_ORDER);
        $x = 0;
        $y = 0;
        $x1 = 0;
        $y1 = 0;
        $x2 = 0;
        $y2 = 0;
        $xmin = 2147483647;
        $xmax = 0;
        $ymin = 2147483647;
        $ymax = 0;
        $xinitial = 0;
        $yinitial = 0;
        $relcoord = false;
        $minlen = (0.01 / $this->k); // minimum acceptable length (3 point)
        $firstcmd = true; // used to print first point
        // draw curve pieces
        foreach ($paths as $key => $val) {
            // get curve type
            $cmd = trim($val[1]);
            if (strtolower($cmd) == $cmd) {
                // use relative coordinated instead of absolute
                $relcoord = true;
                $xoffset = $x;
                $yoffset = $y;
            } else {
                $relcoord = false;
                $xoffset = 0;
                $yoffset = 0;
            }
            $params = array();
            if (isset($val[2])) {
                // get curve parameters
                $rawparams = preg_split('/([\,\s]+)/si', trim($val[2]));
                $params = array();
                foreach ($rawparams as $ck => $cp) {
                    //$params[$ck] = $this->getHTMLUnitToUnits($cp, 0, $this->svgunit, false);
                    $params[$ck] = $this->getHTMLUnitToUnits($cp, 0,$svgUnit, false);
                    if (abs($params[$ck]) < $minlen) {
                        // approximate little values to zero
                        $params[$ck] = 0;
                    }
                }
            }
            // store current origin point
            $x0 = $x;
            $y0 = $y;
            switch (strtoupper($cmd)) {
                case 'M': { // moveto
                    foreach ($params as $ck => $cp) {
                        if (($ck % 2) == 0) {
                            $x = $cp + $xoffset;
                        } else {
                            $y = $cp + $yoffset;
                            if ($firstcmd OR (abs($x0 - $x) >= $minlen) OR (abs($y0 - $y) >= $minlen)) {
                                if ($ck == 1) {
                                    $this->_outPoint($x, $y);
                                    $firstcmd = false;
                                    $xinitial = $x;
                                    $yinitial = $y;
                                } else {
                                    $this->_outLine($x, $y);
                                }
                                $x0 = $x;
                                $y0 = $y;
                            }
                            $xmin = min($xmin, $x);
                            $ymin = min($ymin, $y);
                            $xmax = max($xmax, $x);
                            $ymax = max($ymax, $y);
                            if ($relcoord) {
                                $xoffset = $x;
                                $yoffset = $y;
                            }
                        }
                    }
                    break;
                }
                case 'L': { // lineto
                    foreach ($params as $ck => $cp) {
                        if (($ck % 2) == 0) {
                            $x = $cp + $xoffset;
                        } else {
                            $y = $cp + $yoffset;
                            if ((abs($x0 - $x) >= $minlen) OR (abs($y0 - $y) >= $minlen)) {
                                $this->_outLine($x, $y);
                                $x0 = $x;
                                $y0 = $y;
                            }
                            $xmin = min($xmin, $x);
                            $ymin = min($ymin, $y);
                            $xmax = max($xmax, $x);
                            $ymax = max($ymax, $y);
                            if ($relcoord) {
                                $xoffset = $x;
                                $yoffset = $y;
                            }
                        }
                    }
                    break;
                }
                case 'H': { // horizontal lineto
                    foreach ($params as $ck => $cp) {
                        $x = $cp + $xoffset;
                        if ((abs($x0 - $x) >= $minlen) OR (abs($y0 - $y) >= $minlen)) {
                            $this->_outLine($x, $y);
                            $x0 = $x;
                            $y0 = $y;
                        }
                        $xmin = min($xmin, $x);
                        $xmax = max($xmax, $x);
                        if ($relcoord) {
                            $xoffset = $x;
                        }
                    }
                    break;
                }
                case 'V': { // vertical lineto
                    foreach ($params as $ck => $cp) {
                        $y = $cp + $yoffset;
                        if ((abs($x0 - $x) >= $minlen) OR (abs($y0 - $y) >= $minlen)) {
                            $this->_outLine($x, $y);
                            $x0 = $x;
                            $y0 = $y;
                        }
                        $ymin = min($ymin, $y);
                        $ymax = max($ymax, $y);
                        if ($relcoord) {
                            $yoffset = $y;
                        }
                    }
                    break;
                }
                case 'C': { // curveto
                    foreach ($params as $ck => $cp) {
                        $params[$ck] = $cp;
                        if ((($ck + 1) % 6) == 0) {
                            $x1 = $params[($ck - 5)] + $xoffset;
                            $y1 = $params[($ck - 4)] + $yoffset;
                            $x2 = $params[($ck - 3)] + $xoffset;
                            $y2 = $params[($ck - 2)] + $yoffset;
                            $x = $params[($ck - 1)] + $xoffset;
                            $y = $params[($ck)] + $yoffset;
                            $this->_outCurve($x1, $y1, $x2, $y2, $x, $y);
                            $xmin = min($xmin, $x, $x1, $x2);
                            $ymin = min($ymin, $y, $y1, $y2);
                            $xmax = max($xmax, $x, $x1, $x2);
                            $ymax = max($ymax, $y, $y1, $y2);
                            if ($relcoord) {
                                $xoffset = $x;
                                $yoffset = $y;
                            }
                        }
                    }
                    break;
                }
                case 'S': { // shorthand/smooth curveto
                    foreach ($params as $ck => $cp) {
                        $params[$ck] = $cp;
                        if ((($ck + 1) % 4) == 0) {
                            if (($key > 0) AND ((strtoupper($paths[($key - 1)][1]) == 'C') OR (strtoupper($paths[($key - 1)][1]) == 'S'))) {
                                $x1 = (2 * $x) - $x2;
                                $y1 = (2 * $y) - $y2;
                            } else {
                                $x1 = $x;
                                $y1 = $y;
                            }
                            $x2 = $params[($ck - 3)] + $xoffset;
                            $y2 = $params[($ck - 2)] + $yoffset;
                            $x = $params[($ck - 1)] + $xoffset;
                            $y = $params[($ck)] + $yoffset;
                            $this->_outCurve($x1, $y1, $x2, $y2, $x, $y);
                            $xmin = min($xmin, $x, $x1, $x2);
                            $ymin = min($ymin, $y, $y1, $y2);
                            $xmax = max($xmax, $x, $x1, $x2);
                            $ymax = max($ymax, $y, $y1, $y2);
                            if ($relcoord) {
                                $xoffset = $x;
                                $yoffset = $y;
                            }
                        }
                    }
                    break;
                }
                case 'Q': { // quadratic Bezier curveto
                    foreach ($params as $ck => $cp) {
                        $params[$ck] = $cp;
                        if ((($ck + 1) % 4) == 0) {
                            // convert quadratic points to cubic points
                            $x1 = $params[($ck - 3)] + $xoffset;
                            $y1 = $params[($ck - 2)] + $yoffset;
                            $xa = ($x + (2 * $x1)) / 3;
                            $ya = ($y + (2 * $y1)) / 3;
                            $x = $params[($ck - 1)] + $xoffset;
                            $y = $params[($ck)] + $yoffset;
                            $xb = ($x + (2 * $x1)) / 3;
                            $yb = ($y + (2 * $y1)) / 3;
                            $this->_outCurve($xa, $ya, $xb, $yb, $x, $y);
                            $xmin = min($xmin, $x, $xa, $xb);
                            $ymin = min($ymin, $y, $ya, $yb);
                            $xmax = max($xmax, $x, $xa, $xb);
                            $ymax = max($ymax, $y, $ya, $yb);
                            if ($relcoord) {
                                $xoffset = $x;
                                $yoffset = $y;
                            }
                        }
                    }
                    break;
                }
                case 'T': { // shorthand/smooth quadratic Bezier curveto
                    foreach ($params as $ck => $cp) {
                        $params[$ck] = $cp;
                        if (($ck % 2) != 0) {
                            if (($key > 0) AND ((strtoupper($paths[($key - 1)][1]) == 'Q') OR (strtoupper($paths[($key - 1)][1]) == 'T'))) {
                                $x1 = (2 * $x) - $x1;
                                $y1 = (2 * $y) - $y1;
                            } else {
                                $x1 = $x;
                                $y1 = $y;
                            }
                            // convert quadratic points to cubic points
                            $xa = ($x + (2 * $x1)) / 3;
                            $ya = ($y + (2 * $y1)) / 3;
                            $x = $params[($ck - 1)] + $xoffset;
                            $y = $params[($ck)] + $yoffset;
                            $xb = ($x + (2 * $x1)) / 3;
                            $yb = ($y + (2 * $y1)) / 3;
                            $this->_outCurve($xa, $ya, $xb, $yb, $x, $y);
                            $xmin = min($xmin, $x, $xa, $xb);
                            $ymin = min($ymin, $y, $ya, $yb);
                            $xmax = max($xmax, $x, $xa, $xb);
                            $ymax = max($ymax, $y, $ya, $yb);
                            if ($relcoord) {
                                $xoffset = $x;
                                $yoffset = $y;
                            }
                        }
                    }
                    break;
                }
                case 'A': { // elliptical arc
                    foreach ($params as $ck => $cp) {
                        $params[$ck] = $cp;
                        if ((($ck + 1) % 7) == 0) {
                            $x0 = $x;
                            $y0 = $y;
                            $rx = max(abs($params[($ck - 6)]), .000000001);
                            $ry = max(abs($params[($ck - 5)]), .000000001);
                            $ang = -$rawparams[($ck - 4)];
                            $angle = deg2rad($ang);
                            $fa = $rawparams[($ck - 3)]; // large-arc-flag
                            $fs = $rawparams[($ck - 2)]; // sweep-flag
                            $x = $params[($ck - 1)] + $xoffset;
                            $y = $params[$ck] + $yoffset;
                            if ((abs($x0 - $x) < $minlen) AND (abs($y0 - $y) < $minlen)) {
                                // endpoints are almost identical
                                $xmin = min($xmin, $x);
                                $ymin = min($ymin, $y);
                                $xmax = max($xmax, $x);
                                $ymax = max($ymax, $y);
                            } else {
                                $cos_ang = cos($angle);
                                $sin_ang = sin($angle);
                                $a = (($x0 - $x) / 2);
                                $b = (($y0 - $y) / 2);
                                $xa = ($a * $cos_ang) - ($b * $sin_ang);
                                $ya = ($a * $sin_ang) + ($b * $cos_ang);
                                $rx2 = $rx * $rx;
                                $ry2 = $ry * $ry;
                                $xa2 = $xa * $xa;
                                $ya2 = $ya * $ya;
                                $delta = ($xa2 / $rx2) + ($ya2 / $ry2);
                                if ($delta > 1) {
                                    $rx *= sqrt($delta);
                                    $ry *= sqrt($delta);
                                    $rx2 = $rx * $rx;
                                    $ry2 = $ry * $ry;
                                }
                                $numerator = (($rx2 * $ry2) - ($rx2 * $ya2) - ($ry2 * $xa2));
                                if ($numerator < 0) {
                                    $root = 0;
                                } else {
                                    $root = sqrt($numerator / (($rx2 * $ya2) + ($ry2 * $xa2)));
                                }
                                if ($fa == $fs){
                                    $root *= -1;
                                }
                                $cax = $root * (($rx * $ya) / $ry);
                                $cay = -$root * (($ry * $xa) / $rx);
                                // coordinates of ellipse center
                                $cx = ($cax * $cos_ang) - ($cay * $sin_ang) + (($x0 + $x) / 2);
                                $cy = ($cax * $sin_ang) + ($cay * $cos_ang) + (($y0 + $y) / 2);
                                // get angles
                                $angs = TCPDF_STATIC::getVectorsAngle(1, 0, (($xa - $cax) / $rx), (($cay - $ya) / $ry));
                                $dang = TCPDF_STATIC::getVectorsAngle((($xa - $cax) / $rx), (($ya - $cay) / $ry), ((-$xa - $cax) / $rx), ((-$ya - $cay) / $ry));
                                if (($fs == 0) AND ($dang > 0)) {
                                    $dang -= (2 * M_PI);
                                } elseif (($fs == 1) AND ($dang < 0)) {
                                    $dang += (2 * M_PI);
                                }
                                $angf = $angs - $dang;
                                if ((($fs == 0) AND ($angs > $angf)) OR (($fs == 1) AND ($angs < $angf))) {
                                    // reverse angles
                                    $tmp = $angs;
                                    $angs = $angf;
                                    $angf = $tmp;
                                }
                                $angs = round(rad2deg($angs), 6);
                                $angf = round(rad2deg($angf), 6);
                                // covent angles to positive values
                                if (($angs < 0) AND ($angf < 0)) {
                                    $angs += 360;
                                    $angf += 360;
                                }
                                $pie = false;
                                if (($key == 0) AND (isset($paths[($key + 1)][1])) AND (trim($paths[($key + 1)][1]) == 'z')) {
                                    $pie = true;
                                }
                                list($axmin, $aymin, $axmax, $aymax) = $this->_outellipticalarc($cx, $cy, $rx, $ry, $ang, $angs, $angf, $pie, 2, false, ($fs == 0), true);
                                $xmin = min($xmin, $x, $axmin);
                                $ymin = min($ymin, $y, $aymin);
                                $xmax = max($xmax, $x, $axmax);
                                $ymax = max($ymax, $y, $aymax);
                            }
                            if ($relcoord) {
                                $xoffset = $x;
                                $yoffset = $y;
                            }
                        }
                    }
                    break;
                }
                case 'Z': {
                    $this->_out('h');
                    $x = $x0 = $xinitial;
                    $y = $y0 = $yinitial;
                    break;
                }
            }
            $firstcmd = false;
        } // end foreach
        if (!empty($op)) {
            $this->_out($op);
        }
        return array($xmin, $ymin, ($xmax - $xmin), ($ymax - $ymin));
    }


    public static function getPathPaintOperator($style, $default='S') {
        $op = '';
        switch($style) {
            case 'S':
            case 'D': {
                $op = 'S';
                break;
            }
            case 's':
            case 'd': {
                $op = 's';
                break;
            }
            case 'f':
            case 'F': {
                $op = 'f';
                break;
            }
            case 'f*':
            case 'F*': {
                $op = 'f*';
                break;
            }
            case 'B':
            case 'FD':
            case 'DF': {
                $op = 'B';
                break;
            }
            case 'B*':
            case 'F*D':
            case 'DF*': {
                $op = 'B*';
                break;
            }
            case 'b':
            case 'fd':
            case 'df': {
                $op = 'b';
                break;
            }
            case 'b*':
            case 'f*d':
            case 'df*': {
                $op = 'b*';
                break;
            }
            case 'CNZ': {
                $op = 'W n';
                break;
            }
            case 'CEO': {
                $op = 'W* n';
                break;
            }
            case 'n': {
                $op = 'n';
                break;
            }
            default: {
                if (!empty($default)) {
                    $op = $this->getPathPaintOperator($default, '');
                } else {
                    $op = '';
                }
            }
        }
        return $op;
    }

}
