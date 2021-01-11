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
<GetLocations>
    <bcode>$BRO166</bcode>
</GetLocations>',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/xml',
    'Cookie: ASPSESSIONIDQUCSABAA=GNANFLPCBGFMHDPJNFLLNLHG'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
header('Content-type: text/xml');
echo $response;
