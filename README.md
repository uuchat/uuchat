## uuchat
A powerful customer success platform !

you can see demo on [http://uuchat.io](http://uuchat.io)

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

Set your own information in `src > config.json` . something like 'name' , 'ip address',
'port', db configuration etc. if you set nothing, and start uuChat.
 + you can take customer success page in &nbsp;&nbsp; `http://127.0.0.1:9688/chat` <br />
 first, you need register with your email , and than login into uuchat.
 + customer demo page in  &nbsp;&nbsp; `http://127.0.0.1:9688/demo` . <br />
 click button on the bottom of page , chat with customer success.
 + our console page is : `http://127.0.0.1:9688/console` . <br />
 you can add other customer success with uuchat, see chat history, rate ,
 some statistics information etc...

> warning: we did not test with IE browser! <br />

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

## Install to your blog or website

Copy and paste this code above the last `</body>` tag on your site.
This code is fully asynchronous and won't delay the load time of your page.
```
<script type="text/javascript"
        src="http://<ip>:<port>/static/js/uuchat.js">
</script>
```
## License

BSD-3-Clause