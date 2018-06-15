rm /tmp/otiluke
node ../bin.js --node-server --port /tmp/otiluke --subscribe subscribe.js &
SERVER_PID=$!
node ../bin.js --node-client --host /tmp/otiluke --transform transform --parameter foobar -- hello.js &
sleep 1
kill $SERVER_PID