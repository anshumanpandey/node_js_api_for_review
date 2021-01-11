<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://booking.discovercarhire.com/api/Reservation/Create?accessToken=yHjjy7XZVTsVTb4zP3HLc3uQP3ZJEvBkKBuwWhSwNCkafCXx5ykRmhJdnqW2UJT3",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS =>"{\n   \"SearchUID\":\"a9257ef7-80f7-44d6-ab63-fe83b16f41d2\",\n   \"CarUID\":\"DT7H\",\n    \"Title\":\"Mr.\",\n   \"Name\":\"Rick\",\n   \"Surname\":\"Little\",\n   \"PhoneCountryCode\":\"+44\",\n   \"Phone\":\"584512154874654\",\n   \"Email\":\"rick@mail.com\",\n   \"BirthDate\":\"1985-11-20T08:50:32.263Z\",\n   \"ResidenceCountryCode\":\"DE\",\n   \"FlightNumber\":\"123\",\n   \"CustomerComment\":\"some\",\n   \"ReferenceNumber\":\"2\",\n   \"CoverageOfferID\":10\n}",
  CURLOPT_HTTPHEADER => array(
    "Authorization: Basic bXFUcXpGN2E0MnprOnhrczhwZ2QyUU1xQVMycU4=",
    "Content-Type: application/json"
  ),
));

$response = curl_exec($curl);

curl_close($curl);
header('Content-Type: application/json');
echo $response;

