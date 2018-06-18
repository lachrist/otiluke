rm /tmp/otiluke
node server.js /tmp/otiluke &
SERVER_PID=$!
node ../../node/bin.js --host /tmp/otiluke --virus ../virus.js --arg1 foo --arg2 bar -- hello.js &
sleep 2
kill $SERVER_PID