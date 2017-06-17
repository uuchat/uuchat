## uuchat
A powerful customer success platform !

## Requirements

* Node version 4.0.0 or greater
* [Optional]MySQL version 5.0 or greater
* [Optional]Redis, version 2.8.9 or greater

## Installation

**git clone https://github.com/uuchat/uuchat.git uuchat** <br />
&nbsp;&nbsp;&nbsp;&nbsp;download the uuChat code base

**cd uuchat** <br />
&nbsp;&nbsp;&nbsp;&nbsp;navigate to the downloaded code base

**build and run**<br />
&nbsp;&nbsp;&nbsp;&nbsp;a script for the following commands: <br />
>&nbsp;&nbsp;&nbsp;&nbsp;npm install <br />
>&nbsp;&nbsp;&nbsp;&nbsp;node tools/build.js <br />
>&nbsp;&nbsp;&nbsp;&nbsp;node index.js <br />

## Basic uuChat Configuration

set your own information in `src > config.json` . something like 'name' , 'ip address',
'port', db configuration etc. if you set nothing, and start uuChat.
 + you can take customer success page in &nbsp;&nbsp; `http://127.0.0.1:9688/chat`
 + customer demo page in  &nbsp;&nbsp; `http://127.0.0.1:9688/demo` .

> warning: we not test with ie browner!

## Setup your database

uuchat default run with sqlite3, if you don't want to install any database , you also can use uuchat.

##### Session store
if redis.host in `src > config.json` is "", session store default with your database configuration, but that
not our suggestion, perhaps, most companies or blogers not need high performance. if you have online customers
more than 5, we suggest you use redis for session store.

##### MySQL configuration
```
"database":{
    "host": "127.0.0.1",
    "dialect": "mysql",
    "username": "root",
    "password": "",
    "database": "uuchat",
    "pool":{
      "max": 5,
      "min": 0,
      "idle": 10000
    }
 },
```

##

## License

BSD-3-Clause