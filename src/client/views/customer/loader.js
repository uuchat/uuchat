/**
 * Created by lwc on 2017/6/22.
 */
;(function(u, c, h){
    var iframe = document.createElement('iframe'),
        i = (iframe.frameElement || iframe).style;

    i.cssText = "width:0px;height:0px;position:absolute;left:0px;bottom:0px;border:none;";
    iframe.setAttribute("src", "http://127.0.0.1:9688/s" + '?r=' + top.location);
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
        s.src = h;
        x.parentNode.insertBefore(s,x);
    }

})(window, document, "http://127.0.0.1:9688/static/js/uuchat.js");