## <img alt="uuchat" src="http://i.imgur.com/endrrcC.png" />

A powerful customer success platform ! demo: [http://uuchat.io](http://uuchat.io)

## Requirements

* Node version 4.3.1 or greater
* [Optional]MySQL version 5.6 or greater
* [Optional]Redis, version 2.8.9 or greater

#### Important Note for Windows Users
Developing on OS X or Ubuntu/Linux is recommended, but if you only have access to
a Windows machine you can do one of the following:

* Use [vagrant](http://www.vagrantup.com/) to create a linux dev environment (recommended)
* Follow the [Windows installation guide](https://github.com/brianmcd/contextify/wiki/Windows-Installation-Guide)
for contextify

## Installation

**git clone https://github.com/uuchat/uuchat.git uuchat** <br />
&nbsp;&nbsp;&nbsp;&nbsp;download the uuChat code base

**cd uuchat** <br />
&nbsp;&nbsp;&nbsp;&nbsp;navigate to the downloaded code base

**build and run**<br />
&nbsp;&nbsp;&nbsp;&nbsp;a script for the following commands: <br />
>&nbsp;&nbsp;&nbsp;&nbsp;npm  <br />
>&nbsp;&nbsp;&nbsp;&nbsp;node tools/build.js <br />
>&nbsp;&nbsp;&nbsp;&nbsp;node index.js <br />


> WARNING: you should install some software which operation system not install 
by default, eg: Ubuntu 16.10 with sqlite3, g++ ...

## Basic uuChat Configuration

&nbsp;&nbsp;&nbsp;&nbsp;Set base information in `src > config.json` . if you set nothing, and start uuChat.
 + Customer success page in: &nbsp;&nbsp; `http://127.0.0.1:9688/chat` 
 + customer demo page in:   &nbsp;&nbsp; `http://127.0.0.1:9688/demo` 
 + Console page is : `http://127.0.0.1:9688/console` . <br />
 you can add other customer success with uuchat, see chat history, rate ,
 some statistics information etc...

> warning: we did not test with IE browser! and we suggest to login /chat or /console with chrome.<br />

## Setup your database

uuchat default run with sqlite3, if you don't want to install any database , you also can use uuchat. <br />

If node module of sqlite3 is not install by default, so, you need to `npm i sqlite3`

##### Session store
&nbsp;&nbsp;&nbsp;&nbsp;If redis.host in `src > config.json` is "", session store default with your database configuration, but that
not our suggestion, perhaps, most companies or blogers not need high performance. if you have online customers
more than 5, we suggest you use redis for session store.<br />

&nbsp;&nbsp;&nbsp;&nbsp;Redis config like this:
```
"redis": {
    "host": "127.0.0.1",
    "port": 6379,
    "ttl": 86400,
    "db": 0
  }
```


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

## Install to your website

&nbsp;&nbsp;&nbsp;&nbsp;Copy and paste this code above the last `</body>` tag on your site.
This code is fully asynchronous and won't delay the load time of your page.
you can see in `dist > customer.html` , like this: 
```
<!-- begin uuchat code  -->
<script type="text/javascript">
    ;(function(u, c, h){
        u.UUCHAT = (function(){
            return {
                domain: 'http://uuchat.io', // change your own domain here
                src: h
            };
        })();
        var s = c.createElement('script'),
                r=c.getElementsByTagName('script')[0];
        s.async = 1;
        s.src = u.UUCHAT.domain+h;
        r.parentNode.insertBefore(s,r);

    })(window, document, "/static/js/loader.js", );
</script>
<!-- end uuchat code  -->
```
## License

BSD-3-Clause