#include <Wire.h>
#include <BlueDot_BME280.h>
#include <lmic.h>
#include <hal/hal.h>
#include <SPI.h>
#include <U8x8lib.h>
#include <CayenneLPP.h>

// CayenneLPP
CayenneLPP lpp(51); // 51 lenght in bytes

// Sensor BM280 settings
BlueDot_BME280 bme1;                                     //Object for Sensor 1
BlueDot_BME280 bme2;                                     //Object for Sensor 2

int bme1Detected = 0;                                    //Checks if Sensor 1 is available
int bme2Detected = 0;                                    //Checks if Sensor 2 is available

void setupI2CBM280();
void readBM280();

// OLED settings
U8X8_SSD1306_128X64_NONAME_SW_I2C u8x8(/* clock=*/ 15, /* data=*/ 4, /* reset=*/ 16);

// Battery status function definition
static int BATT_PIN = 0;
u1_t battery = 0;

// This EUI must be in little-endian format
static const u1_t PROGMEM APPEUI[8]={ 0x05, 0x63, 0x9B, 0x8E, 0x5B, 0x87, 0xF9, 0x6A }; // Gotthardp
void os_getArtEui (u1_t* buf) { memcpy_P(buf, APPEUI, 8);}

// This EUI must be in little-endian format
static const u1_t PROGMEM DEVEUI[8]={ 0x03, 0x30, 0x22, 0xF7, 0x1F, 0x41, 0x7C, 0x00 };
void os_getDevEui (u1_t* buf) { memcpy_P(buf, DEVEUI, 8);}

// This EUI must not be in little-endian format
static const u1_t PROGMEM APPKEY[16] = { 0x3F, 0xEE, 0x83, 0xEE, 0x54, 0x51, 0x0F, 0xC3, 0x45, 0x99, 0x6C, 0x7C, 0x17, 0xE0, 0xDA, 0x14 }; // Gotthardp
void os_getDevKey (u1_t* buf) {  memcpy_P(buf, APPKEY, 16);}

// static uint8_t mydata[] = "Hello, world!";
osjob_t initjob;
static osjob_t sendjob;

// Schedule TX every this many seconds (might become longer due to duty
// cycle limitations).
const unsigned TX_INTERVAL = 30;

float temperature;
float humidity;
float pressure;
int countRcvd = 0;

// Pin mapping for original library
const lmic_pinmap lmic_pins = {
    .nss = 18,
    .rxtx = LMIC_UNUSED_PIN,
    .rst = 14,
    .dio = {26, 33, 32}, // 26, 33?, 32?
};

// Pin mapping for modified library
// const lmic_pinmap lmic_pins = {
//     .mosi = 27,
//     .miso = 19,
//     .sck = 5,
//     .nss = 18,
//     .rxtx = LMIC_UNUSED_PIN,
//     .rst = 14,
//     .dio = {26, 33, 32}, //workaround to use 1 pin for all 3 radio dio pins
// };

void onEvent (ev_t ev) {
    Serial.print(os_getTime());
    Serial.print(": ");
    switch(ev) {
        case EV_SCAN_TIMEOUT:
            Serial.println(F("EV_SCAN_TIMEOUT"));
            u8x8.clear();
            u8x8.printf("EV_SCAN_TIMEOUT");
            break;
        case EV_BEACON_FOUND:
            Serial.println(F("EV_BEACON_FOUND"));
            u8x8.clear();
            u8x8.printf("EV_BEACON_FOUND");
            break;
        case EV_BEACON_MISSED:
            Serial.println(F("EV_BEACON_MISSED"));
            u8x8.clear();
            u8x8.printf("EV_BEACON_MISSED");
            break;
        case EV_BEACON_TRACKED:
            Serial.println(F("EV_BEACON_TRACKED"));
            u8x8.clear();
            u8x8.printf("EV_BEACON_TRACKED");
            break;
        case EV_JOINING:
            Serial.println(F("EV_JOINING"));
            u8x8.clear();
            u8x8.printf("EV_JOINING");
            break;
        case EV_JOINED:
            Serial.println(F("EV_JOINED"));
            u8x8.clear();
            u8x8.printf("EV_JOINED");
            // LMIC_setLinkCheckMode(0); //TODO
            break;
        case EV_RFU1:
            Serial.println(F("EV_RFU1"));
            u8x8.clear();
            u8x8.printf("EV_RFU1");
            break;
        case EV_JOIN_FAILED:
            Serial.println(F("EV_JOIN_FAILED"));
            u8x8.clear();
            u8x8.printf("EV_JOIN_FAILED");
            break;
        case EV_REJOIN_FAILED:
            Serial.println(F("EV_REJOIN_FAILED"));
            u8x8.clear();
            u8x8.printf("EV_REJOIN_FAILED");
            break;
            // break; // TODO check
        case EV_TXCOMPLETE:
            Serial.println(F("EV_TXCOMPLETE (includes waiting for RX windows)"));
            readBM280();
            u8x8.clear();
            u8x8.setInverseFont(1);
            u8x8.println("EV_TXCOMPLETE");
            if (LMIC.txrxFlags & TXRX_ACK)
              Serial.println(F("Received ack"));
              u8x8.setInverseFont(0);
              u8x8.println("");
              u8x8.println("Received ack");
              u8x8.println("");
              u8x8.printf("RSSI %d \n", LMIC.rssi);
              u8x8.println("");
              u8x8.printf("SNR %.1d cnt: %d \n", LMIC.snr, countRcvd);
              
            if (LMIC.dataLen) {
              Serial.println(F("Received "));
              u8x8.clear();
              u8x8.printf("Received ");
              Serial.println(LMIC.dataLen);
              u8x8.println(LMIC.dataLen);
              u8x8.println("LMIC.dataLen");
              Serial.println(F(" bytes of payload"));
              u8x8.println(" bytes of payload");
              countRcvd++;
            }
            // Schedule next transmission
            os_setTimedCallback(&sendjob, os_getTime()+sec2osticks(TX_INTERVAL), do_send);
            break;
        case EV_LOST_TSYNC:
            Serial.println(F("EV_LOST_TSYNC"));
            u8x8.clear();
            u8x8.printf("EV_LOST_TSYNC");
            break;
        case EV_RESET:
            Serial.println(F("EV_RESET"));
            u8x8.clear();
            u8x8.printf("EV_RESET");
            break;
        case EV_RXCOMPLETE:
            // data received in ping slot
            Serial.println(F("EV_RXCOMPLETE"));
            u8x8.clear();
            u8x8.printf("EV_RXCOMPLETE");
            break;
        case EV_LINK_DEAD:
            Serial.println(F("EV_LINK_DEAD"));
            u8x8.clear();
            u8x8.printf("EV_LINK_DEAD");
            break;
        case EV_LINK_ALIVE:
            Serial.println(F("EV_LINK_ALIVE"));
            u8x8.clear();
            u8x8.printf("EV_LINK_ALIVE");
            break;
         default:
            Serial.println(F("Unknown event"));
            u8x8.clear();
            u8x8.printf("Unknown event");
            u8x8.println(ev);
            break;
    }
}

void do_send(osjob_t* j){
    // Check if there is not a current TX/RX job running
    if (LMIC.opmode & OP_TXRXPEND) {
        Serial.println(F("OP_TXRXPEND, not sending"));
        u8x8.clear();
        u8x8.printf("OP_TXRXPEND, not sending");
    } else {
        // Prepare upstream data transmission at the next possible time.
        readBM280();
        LMIC_setTxData2(1, lpp.getBuffer(), lpp.getSize(), 0); // 0 unconfirmed, 1 confirmed packets
        Serial.println(F("Packet queued"));
        u8x8.clear();
        u8x8.setInverseFont(1);
        u8x8.printf("Packet queued \n");
        u8x8.setInverseFont(0);
        u8x8.println("");
        u8x8.printf("PRESS: %.1f hPa\n", pressure);
        u8x8.printf("TEMP:  %.1f' C\n", temperature);
        u8x8.printf("HUM:   %.1f %%\n", humidity);
        u8x8.printf("BATT:  %u %%\n", round((double) battery * 0.3921568627));
    }
    // Next TX is scheduled after TX_COMPLETE event.
}

// initial job
static void initfunc (osjob_t* j) {
    // reset MAC state
    LMIC_reset();
    LMIC_setLinkCheckMode(1);
    LMIC_setAdrMode(1); // Adaptive data rate
    LMIC_setClockError(MAX_CLOCK_ERROR * 1 / 100);
    // start joining
    LMIC_startJoining();
    // init done - onEvent() callback will be invoked...
    // Start job (sending automatically starts OTAA too)
    do_send(&sendjob); // OLD
}

void setup() {
    Serial.begin(9600);
    // Setup screen
    u8x8.begin();
    u8x8.setFont(u8x8_font_chroma48medium8_r);

    // Setup sensor
    setupI2CBM280();

    Serial.println(F("Starting"));
    u8x8.printf("Starting");

    // LMIC init
    os_init();

    int i = 10;
    while (i <= 80) {
        LMIC_disableChannel(i);
        i++;
    }

    readBM280();
    // Prepare upstream data transmission at the next possible time.
    LMIC_setTxData2(1, lpp.getBuffer(), lpp.getSize(), 0);
    
    // setup initial job
    os_setCallback(&initjob, initfunc);
    // not reached -->
}

void loop() {
    // execute scheduled jobs and events
    os_runloop_once();
}

void setupI2CBM280() {

    //This program is set for the I2C mode

    bme1.parameter.communication = 0;                    //I2C communication for Sensor 1 (bme1)
    bme2.parameter.communication = 0;                    //I2C communication for Sensor 2 (bme2)

    bme1.parameter.I2CAddress = 0x76;                    //I2C Address for Sensor 1 (bme1)
    bme2.parameter.I2CAddress = 0x77;                    //I2C Address for Sensor 2 (bme2)

    bme1.parameter.sensorMode = 0b11;                    //Setup Sensor mode for Sensor 1
    bme2.parameter.sensorMode = 0b11;                    //Setup Sensor mode for Sensor 2 

    bme1.parameter.IIRfilter = 0b100;                   //IIR Filter for Sensor 1
    bme2.parameter.IIRfilter = 0b100;                   //IIR Filter for Sensor 2

    bme1.parameter.humidOversampling = 0b101;            //Humidity Oversampling for Sensor 1
    bme2.parameter.humidOversampling = 0b101;            //Humidity Oversampling for Sensor 2

    bme1.parameter.tempOversampling = 0b101;              //Temperature Oversampling for Sensor 1
    bme2.parameter.tempOversampling = 0b101;              //Temperature Oversampling for Sensor 2

    bme1.parameter.pressOversampling = 0b101;             //Pressure Oversampling for Sensor 1
    bme2.parameter.pressOversampling = 0b101;             //Pressure Oversampling for Sensor 2 

    bme1.parameter.pressureSeaLevel = 1013.25;            //default value of 1013.25 hPa (Sensor 1)
    bme2.parameter.pressureSeaLevel = 1013.25;            //default value of 1013.25 hPa (Sensor 2)

    bme1.parameter.tempOutsideCelsius = 15;               //default value of 15°C
    bme2.parameter.tempOutsideCelsius = 15;               //default value of 15°C

    bme1.parameter.tempOutsideFahrenheit = 59;            //default value of 59°F
    bme2.parameter.tempOutsideFahrenheit = 59;            //default value of 59°F

    if (bme1.init() != 0x60) {    
        Serial.println(F("Ops! First BME280 Sensor not found!"));
        bme1Detected = 0;
    } else {
        Serial.println(F("First BME280 Sensor detected!"));
        bme1Detected = 1;
    }

    if (bme2.init() != 0x60) {    
        Serial.println(F("Ops! Second BME280 Sensor not found!"));
        bme2Detected = 0;
    } else {
        Serial.println(F("Second BME280 Sensor detected!"));
        bme2Detected = 1;
    }
}

void readBM280() {
    if (bme1Detected) {
        lpp.reset();
        temperature = bme1.readTempC();
        lpp.addTemperature(1, temperature);
        pressure = bme1.readPressure();
        lpp.addBarometricPressure(2, pressure);
        humidity = bme1.readHumidity();
        lpp.addRelativeHumidity(3, humidity);
        // Serial.println(bme1.readAltitudeMeter());
    }
}

//   u1_t os_getBattLevel (void) {
//     battery = (u1_t) round(255 * ReadVoltage(BATT_PIN));
//     return battery;
//   }
