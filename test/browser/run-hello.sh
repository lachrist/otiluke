http-server -p 8000 &
SERVER_PID=$!
node ../../browser/proxy/bin --vpath=../virus.js --port=8080 &
PROXY_PID=$!
pkill -f firefox
sleep 2
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --incognito --proxy-server=127.0.0.1:8080 --auto-open-devtools-for-tabs "http://localhost:8000/hello.html?otiluke-arg1=foo&otiluke-arg2=bar" &
sleep 5
kill $PROXY_PID
kill $SERVER_PID