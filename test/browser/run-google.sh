node proxy.js 8080 &
PROXY_PID=$!
pkill -f firefox
sleep 2
/Applications/Firefox.app/Contents/MacOS/firefox-bin -private -devtools "https://www.google.com/search?q=cheese&otiluke-arg1=foo&otiluke-arg2=bar" &
sleep 5
kill $PROXY_PID