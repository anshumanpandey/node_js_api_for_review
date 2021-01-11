<?php
/*
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://www.grcgds.com/ota/",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS =>"<?xml version=\"1.0\"?>\n<OTA_VehLocSearchRQ xmlns=\"http://www.opentravel.org/OTA/2003/05\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.opentravel.org/OTA/2003/05    VehLocSearchRQ.xsd\" TimeStamp=\"2010-10-12T11:00:00\" Target=\"Test\" Version=\"1.002\">\n  <POS>\n    <Source>\n      <RequestorID Type=\"5\" ID=\"GRC-300000\" ID_NAME=\"Acme Rent A Car\"/>\n    </Source>\n  </POS>\n  <VehLocSearchCriterion>\n    <CONTEXT>\n      <Filter content=\"\" Language=\"EN\"/>\n    </CONTEXT>\n    <Address>\n      <CountryName Code=\"RO\"/>\n    </Address>\n  </VehLocSearchCriterion>\n</OTA_VehLocSearchRQ>\n",
  CURLOPT_HTTPHEADER => array(
    "Content-Type: application/xml"
  ),
));

$response = curl_exec($curl);

curl_close($curl);
header('Content-type: text/xml');
echo $response;
*/


//LEGACY IMPLEMENTATION

//include("nusoap.php");
function xml2array($contents, $get_attributes=1) {
    if(!$contents) return array();

    if(!function_exists('xml_parser_create')) {
        //print "'xml_parser_create()' function not found!";
        return array();
    }
    //Get the XML parser of PHP - PHP must have this module for the parser to work
    $parser = xml_parser_create();
    xml_parser_set_option( $parser, XML_OPTION_CASE_FOLDING, 0 );
    xml_parser_set_option( $parser, XML_OPTION_SKIP_WHITE, 1 );
    xml_parse_into_struct( $parser, $contents, $xml_values );
    xml_parser_free( $parser );

    if(!$xml_values) return;//Hmm...

    //Initializations
    $xml_array = array();
    $parents = array();
    $opened_tags = array();
    $arr = array();

    $current = &$xml_array;

    //Go through the tags.
    foreach($xml_values as $data) {
        unset($attributes,$value);//Remove existing values, or there will be trouble

        //This command will extract these variables into the foreach scope
        // tag(string), type(string), level(int), attributes(array).
        extract($data);//We could use the array by itself, but this cooler.

        $result = '';
        if($get_attributes) {//The second argument of the function decides this.
            $result = array();
            if(isset($value)) $result['value'] = $value;

            //Set the attributes too.
            if(isset($attributes)) {
                foreach($attributes as $attr => $val) {
                    if($get_attributes == 1) $result['attr'][$attr] = $val; //Set all the attributes in a array called 'attr'
                    /**  :TODO: should we change the key name to '_attr'? Someone may use the tagname 'attr'. Same goes for 'value' too */
                }
            }
        } elseif(isset($value)) {
            $result = $value;
        }

        //See tag status and do the needed.
        if($type == "open") {//The starting of the tag '<tag>'
            $parent[$level-1] = &$current;

            if(!is_array($current) or (!in_array($tag, array_keys($current)))) { //Insert New tag
                $current[$tag] = $result;
                $current = &$current[$tag];

            } else { //There was another element with the same tag name
                if(isset($current[$tag][0])) {
                    array_push($current[$tag], $result);
                } else {
                    $current[$tag] = array($current[$tag],$result);
                }
                $last = count($current[$tag]) - 1;
                $current = &$current[$tag][$last];
            }

        } elseif($type == "complete") { //Tags that ends in 1 line '<tag />'
            //See if the key is already taken.
            if(!isset($current[$tag])) { //New Key
                $current[$tag] = $result;

            } else { //If taken, put all things inside a list(array)
                if((is_array($current[$tag]) and $get_attributes == 0)//If it is already an array...
                        or (isset($current[$tag][0]) and is_array($current[$tag][0]) and $get_attributes == 1)) {
                    array_push($current[$tag],$result); // ...push the new element into that array.
                } else { //If it is not an array...
                    $current[$tag] = array($current[$tag],$result); //...Make it an array using using the existing value and the new value
                }
            }

        } elseif($type == 'close') { //End of tag '</tag>'
            $current = &$parent[$level-1];
        }
    }

    return($xml_array);
}


$url = '<?xml version="1.0"?><OTA_VehLocSearchRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05    VehLocSearchRQ.xsd" TimeStamp="2010-10-12T11:00:00" Target="Test" Version="1.002">  <POS>    
<Source>      <RequestorID Type="5" ID="GRC-300000" ID_NAME="Acme Rent A Car"/>    </Source>  </POS>  <VehLocSearchCriterion>    <CONTEXT>      
<Filter content="" Language="EN"/>    </CONTEXT>    <Address>      <CountryName Code="HR"/>    </Address>  </VehLocSearchCriterion></OTA_VehLocSearchRQ>';

//$gg="http://www.right-cars.com/OTATEST/";

$gg="https://www.grcgds.com/ota/";

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
$resultarray = xml2array($result,1); //contains response from server
var_dump($resultarray);
//print_r($result);

?>