node proxy.js 8080 &
pid=$!
sleep 2
/Applications/Firefox.app/Contents/MacOS/firefox-bin -private -devtools "https://www.google.com/search?q=cheese&otiluke-arg1=foo&otiluke-arg2=bar" &
wait $pid
kill $!
sleep 2