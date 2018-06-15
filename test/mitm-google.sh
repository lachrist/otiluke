node ../bin.js --mitm-proxy --port 8080 --transform transform.js --subscribe subscribe.js &
PROXY_PID=$!
sleep 2
/Applications/Firefox.app/Contents/MacOS/firefox-bin -private -devtools "https://www.google.com/search?q=cheese&otiluke=foobar" &
sleep 10
kill $PROXY_PID