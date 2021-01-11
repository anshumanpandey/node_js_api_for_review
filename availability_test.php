<?php

$url='<?xml version="1.0" encoding="UTF-8"?>
<OTA_VehAvailRateRQ xmlns="http://www.opentravel.org/OTA/2003/05"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 OTA_VehAvailRateRQ.xsd"
TimeStamp="2020-06-04T19:32:01" Target="Production" Version="1.002">
<POS>
<Source>
<RequestorID Type="5" ID="GRC-300000" RATEID="GRC-930001" RATETYPES=""/>
</Source>
</POS>
<VehAvailRQCore Status="Available">
<VehRentalCore PickUpDateTime="2020-12-18T12:00:00" ReturnDateTime="2020-12-20T10:00:00">
<PickUpLocation LocationCode="AMMA01" />
<ReturnLocation LocationCode="AMMA01" />
</VehRentalCore>
<DriverType Age="35"/>
</VehAvailRQCore>
<VehAvailRQInfo >
<Customer>
<Primary>
<CitizenCountryName Code="US"/>
</Primary>
</Customer>
</VehAvailRQInfo>
</OTA_VehAvailRateRQ>';

//var_dump($url);

$gg="https://www.grcgds.com/XML/";

$ch = curl_init();    // initialize curl handle
curl_setopt($ch, CURLOPT_URL,$gg); // set url to post to
curl_setopt($ch, CURLOPT_POST,0); // set url to post to
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,  false);
curl_setopt($ch, CURLOPT_USERAGENT, $defined_vars['HTTP_USER_AGENT'] );
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); // return into a variable
curl_setopt($ch, CURLOPT_POSTFIELDS, $url); // add POST fields
curl_setopt($ch, CURLOPT_TIMEOUT, 40); // times out after 4s
curl_setopt($ch, CURLOPT_HTTPHEADER, array (
    "Content-Type: application/soap+xml;charset=utf-8"
));

$result = curl_exec($ch); // run the whole process
header("Content-type: text/xml");
echo $result;