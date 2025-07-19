-- Update drivers with phone numbers and assign default drivers to vehicles

-- First, update drivers with phone numbers for Shri Sai Public School
UPDATE drivers SET phone = '9105660989' WHERE name = 'TRILOK' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur');
UPDATE drivers SET phone = '7248163033' WHERE name = 'RAJKUMAR' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur');
UPDATE drivers SET phone = '9690589315' WHERE name = 'RAM SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur');
UPDATE drivers SET phone = '9756936006' WHERE name = 'NISHAN SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur');
UPDATE drivers SET phone = '7500736931' WHERE name = 'BHUWAN' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur');

-- Update drivers with phone numbers for Sai Public School
UPDATE drivers SET phone = '8193074246' WHERE name = 'JARNAIL SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '9756613177' WHERE name = 'BALKAR SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8392914710' WHERE name = 'BALWINDER SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8392914701' WHERE name = 'RESHAM SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '7253095679' WHERE name = 'JOGA' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '9568361597' WHERE name = 'SUNIL KUMAR' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '9837921523' WHERE name = 'JOGA SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8392914709' WHERE name = 'MANJEET SEKHON' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8392914705' WHERE name = 'SHAMSHER SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8392914704' WHERE name = 'TARSEM SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '9012990972' WHERE name = 'DEVENDER' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '9837082812' WHERE name = 'CHARAN SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8392914707' WHERE name = 'GURLAL SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '9639281108' WHERE name = 'DEEPAK KUMAR' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8392914706' WHERE name = 'KEDARNATH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8392914703' WHERE name = 'DALJINDER SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8392914708' WHERE name = 'VIPIN' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8958596686' WHERE name = 'KISHORE KUMAR' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '8392914702' WHERE name = 'GURNAM SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');
UPDATE drivers SET phone = '7088249660' WHERE name = 'SUNIL MAURYA 2' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur');

-- Now assign default drivers to vehicles by vehicle number
-- Shri Sai Public School vehicles
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'TRILOK' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur')) WHERE vehicle_number = 'UK06PA0284';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'RAJKUMAR' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur')) WHERE vehicle_number = 'UK06PA0305';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'RAM SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18TA1680';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'NISHAN SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0440';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'BHUWAN' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur')) WHERE vehicle_number = 'NB-3';

-- Sai Public School vehicles
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'JARNAIL SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0048';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'BALKAR SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0049';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'BALWINDER SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0050';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'RESHAM SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0051';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'JOGA' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0052';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'SUNIL KUMAR' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0119';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'JOGA SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0138';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'MANJEET SEKHON' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0441';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'SHAMSHER SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0442';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'TARSEM SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18PA0443';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'DEVENDER' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'NB-1';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'CHARAN SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'NB-2';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'GURLAL SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18TA0301';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'DEEPAK KUMAR' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18TA0302';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'KEDARNATH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18TA0298';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'DALJINDER SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18TA0305';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'VIPIN' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18TA0304';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'KISHORE KUMAR' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18B5840';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'GURNAM SINGH' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK18B6131';
UPDATE vehicles SET default_driver_id = (SELECT id FROM drivers WHERE name = 'SUNIL MAURYA 2' AND subsidiary_id IN (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')) WHERE vehicle_number = 'UK06V8218';