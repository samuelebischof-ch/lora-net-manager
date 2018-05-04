#!/bin/bash

openssl genrsa -out private-key.pem 1024
openssl req -new -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=0.0.0.0" -x509 -key private-key.pem -out public-certificate.pem -days 1825