http-server -p 8000 &
SERVER_PID=$!
node proxy.js 8080 &
PROXY_PID=$!
pkill -f firefox
sleep 2
/Applications/Firefox.app/Contents/MacOS/firefox-bin -private -devtools "http://localhost:8000/hello.html?otiluke-arg1=foo&otiluke-arg2=bar" &
sleep 5
kill $PROXY_PID
kill $SERVER_PID