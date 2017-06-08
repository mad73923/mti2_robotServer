# Robot server

## Install packages

(not tested on Pi yet!! package installation might be different)

Packages needed:

*	npm
* 	node.js

First add new installation source 
```
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
```

Then install:
```
sudo apt-get install npm nodejs
```

## Install dependencies

```
cd server
npm install
```

## Start Server

```
cd server
npm start
```

UI available at `localhost:8080`
Robot port at `localhost:2323`

Open UI from external: `http://<IP of Pi>:8080`

## Start Simulator

```
cd simulator
nodejs index.js &
```

Simulator can be started several times (`&`).

Simulator exits on `Strg+C` or connection loss (kill server).

# Configuration of Raspberry Pi

[Tutorial](https://www.elektronik-kompendium.de/sites/raspberry-pi/2002161.htm) (German).

# Share Internet from Laptop to Raspberry

Th be able to work at the university without a router you can share the Wifi-Internet-Connection of your Laptop to the Raspberry:

[Tutorial](https://help.ubuntu.com/community/Internet/ConnectionSharing) (Chapter GUI Method via Netowork Manager (Ubuntu 14.04, 16.04)).

After connecting the Raspberry via Ethernet you have to get its IP-Address. 
1. Get the IP-Adress of your Ethernet-Card: Console-> ifconfig 
2. Search for other IPs: sudo nmap -sP 10.42.0.1/24  (if the Ethernet-IP was 10.42.0.1)
3. Look for an answer like 

``` 
Nmap scan report for 10.42.0.143
Host is up (0.00044s latency).
MAC Address: B8:27:EB:9C:B4:E6 (Raspberry Pi Foundation)
```
In this case the Raspberry has the IP-adress 10.42.0.143

Now you can connect to the Raspberry by SSH...
```
ssh pi@10.42.0.143
```
... and have fun!