<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://easirent.com/broker/bookingclik/bookingclik.asp',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'<?xml version="1.0" encoding="utf-8"?>
<GetVehicles>
    <bcode>$BRO166</bcode>
    <vtype>1</vtype>
    <ctype>5</ctype>
    <estmiles>10000</estmiles>
    <pickup>
        <location>ABZ</location>
        <date>2020-12-15</date>
        <time>11:00</time>
    </pickup>
    <dropoff>
        <location>ABZ</location>
        <date>2020-12-20</date>
        <time>11:00</time>
    </dropoff>
</GetVehicles>',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/xml',
    'Cookie: ASPSESSIONIDSWCRDAAA=AJFEHJNBMDHINDFICLDHEFHL; ASPSESSIONIDSWCSACAB=PCEOJEPBIBBBLFDJAMFHMNGL; ASPSESSIONIDAUDTACCC=FJNBPOGCADJBPJHNGCDDOCFL'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
header('Content-type: text/xml');
echo $response;
