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
