<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://booking.discovercarhire.com/api/Payment/MakePayment?accessToken=yHjjy7XZVTsVTb4zP3HLc3uQP3ZJEvBkKBuwWhSwNCkafCXx5ykRmhJdnqW2UJT3",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS =>"{ \n  \"ReservationNumber\": \"DC-1612680\", \n  \"CarUId\": \"H623\", \n  \"CreditCard\": { \n    \"Name\": \"Rick Little\", \n    \"ExpirationMonth\": \"01\", \n    \"ExpirationYear\": 25, \n    \"CardNumber\": \"5105105105105100\", \n    \"CCV\": \"548\", \n    \"Type\": \"Master Card\"\n  } \n} ",
  CURLOPT_HTTPHEADER => array(
    "Authorization: Basic bXFUcXpGN2E0MnprOnhrczhwZ2QyUU1xQVMycU4=",
    "Content-Type: application/json"
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;