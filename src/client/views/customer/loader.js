;(function(u, c, h){
    var iframe = document.createElement('iframe'),
        i = (iframe.frameElement || iframe).style;

    i.cssText = "width:0px;height:0px;position:absolute;left:0px;bottom:0px;border:none;";
    iframe.setAttribute("src", u.UUCHAT.domain + "/s" + '?r=' + top.location);
    iframe.setAttribute("id", "uuchatIframe");
    c.body.appendChild(iframe);

    if(u.attachEvent){
        iframe.attachEvent('onload', frameLoad);
    }else{
        iframe.addEventListener('load', frameLoad, false);
    }

    function frameLoad(){
        var s = document.createElement('script'),
            x = c.getElementsByTagName('script')[0];

        s.type = "text/javascript";
        s.async=true;
        s.src = u.UUCHAT.domain + h;
        x.parentNode.insertBefore(s,x);
    }

})(window, document, "/static/js/uuchat.js");