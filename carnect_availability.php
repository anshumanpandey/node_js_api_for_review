<?php 
 //Data, connection, auth
 $dataFromTheForm = $_POST['fieldName']; // request data from the form
 $soapUrl = "https://ota2007a.micronnexus-staging.com/service.asmx"; // asmx URL of WSDL
 $soapUser = "CarnectCom";  //  username
 $soapPassword = "2wRA771E"; // password

 // xml post structure

 $xml_post_string = '<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:ns="http://www.opentravel.org/OTA/2003/05">
  <soapenv:Body>
    <VehAvailRateRQ xmlns="http://www.opentravel.org/OTA/2003/05" EchoToken="1.0" Version="1.0"
    ReqRespVersion="large">
      <POS>
        <Source ISOCountry="UK">
          <RequestorID Type="CarnectCom" ID_Context="2wRA771E" />
        </Source>
      </POS>
      <VehAvailRQCore RateQueryType="Live">
        <RateQueryParameterType>4</RateQueryParameterType>
        <VehRentalCore PickUpDateTime="2018-06-12T09:00:00.000"
        ReturnDateTime="2018-06-16T09:00:00.000">
          <PickUpLocation LocationCode="LHR" CodeContext="2" />
          <ReturnLocation LocationCode="LHR" CodeContext="2" />
        </VehRentalCore>
      </VehAvailRQCore>
    </VehAvailRateRQ>
  </soapenv:Body>
</soapenv:Envelope>';   // data from the form, e.g. some ID number

    $headers = array(
                 "Content-type: text/xml;charset=\"utf-8\"",
                 "Accept: text/xml",
                 "Cache-Control: no-cache",
                 "Pragma: no-cache",
                 "SOAPAction: https://ota2007a.carhire-solutions.com/service.asmx", 
                 "Content-length: ".strlen($xml_post_string),
             ); //SOAPAction: your op URL

     $url = $soapUrl;

     // PHP cURL  for https connection with auth
     $ch = curl_init();
     curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);
     curl_setopt($ch, CURLOPT_URL, $url);
     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
     curl_setopt($ch, CURLOPT_USERPWD, $soapUser.":".$soapPassword); // username and password - declared at the top of the doc
     curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
     curl_setopt($ch, CURLOPT_TIMEOUT, 10);
     curl_setopt($ch, CURLOPT_POST, true);
     curl_setopt($ch, CURLOPT_POSTFIELDS, $xml_post_string); // the SOAP request
     curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

     // converting
     $response = curl_exec($ch); 
     curl_close($ch);

     // converting
     $response1 = str_replace("<soap:Body>","",$response);
     $response2 = str_replace("</soap:Body>","",$response1);

     // convertingc to XML
     $parser = simplexml_load_string($response2);
     // user $parser to get your data out of XML response and to display it. 
     var_dump($parser);
 ?>