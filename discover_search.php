<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://api-partner.discovercars.com/api/Aggregator/GetCars?access_token=yHjjy7XZVTsVTb4zP3HLc3uQP3ZJEvBkKBuwWhSwNCkafCXx5ykRmhJdnqW2UJT3",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS =>"{\n  \"DateFrom\": \"04.10.2020T09:00\",\n  \"DateTo\": \"13.10.2020T09:00\",\n  \"PickupLocationID\": 1586,\n  \"DropOffLocationID\": 1586,\n  \"CurrencyCode\": \"EUR\",\n  \"Age\": 35,\n  \"UserIP\": \"192.168.1.1\",\n  \"Pos\": \"DE\",\n  \"Lng2L\": \"en\",\n  \"DeviceTypeID\": 101,\n  \"DomainExtension\": \"example: .com, .co.uk, co.za, .lv, .de\",\n  \"SearchOnlyPartners\": null\n}",
  CURLOPT_HTTPHEADER => array(
    "Authorization: Basic bXFUcXpGN2E0MnprOnhrczhwZ2QyUU1xQVMycU4=",
    "Content-Type: application/json"
  ),
));

$response = curl_exec($curl);

curl_close($curl);
header('Content-Type: application/json');
echo $response;
