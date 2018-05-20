HTTP/1.1 200 OK
Server: nginx/1.4.6 (Ubuntu)
Date: Sun, 20 May 2018 13:14:44 GMT
Content-Type: application/x-javascript
Content-Length: 3851
Last-Modified: Sat, 24 Sep 2016 01:25:44 GMT
Connection: keep-alive
ETag: "57e5d618-f0b"
Expires: Wed, 23 May 2018 13:14:44 GMT
Cache-Control: max-age=259200
Accept-Ranges: bytes

;(function(win, lib) {
    var doc = win.document;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var flexibleEl = doc.querySelector('meta[name="flexible"]');
    var dpr = 0;
    var scale = 0;
    var tid;
    var flexible = lib.flexible || (lib.flexible = {});
    
    if (metaEl) {
        console.warn('将根据已有的meta标签来设置缩放比例');
        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
        if (match) {
            scale = parseFloat(match[1]);
            dpr = parseInt(1 / scale);
        }
    } else if (flexibleEl) {
        var content = flexibleEl.getAttribute('content');
        if (content) {
            var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
            if (initialDpr) {
                dpr = parseFloat(initialDpr[1]);
           