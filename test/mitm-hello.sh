http-server -p 8000 &
SERVER_PID=$!
node ../bin.js --mitm-proxy --port 8080 --transform transform.js --subscribe subscribe.js &
PROXY_PID=$!
sleep 2
/Applications/Firefox.app/Contents/MacOS/firefox-bin -private -devtools http://localhost:8000/hello.html?otiluke=foobar &
sleep 5
kill $PROXY_PID
kill $SERVER_PID