http-server -p 8000 &
pid1=$!
node proxy.js 8080 &
pid2=$!
sleep 2
/Applications/Firefox.app/Contents/MacOS/firefox-bin -private -devtools "http://localhost:8000/hello.html?otiluke-arg1=foo&otiluke-arg2=bar" &
wait $pid2
kill $!
kill $pid1