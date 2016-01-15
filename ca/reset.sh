echo "usage: sh reset [--hard]"

dir=./ca
echo "\c" > $dir/index.txt
rm $dir/serial.old
rm $dir/index.txt.attr
rm $dir/index.txt.old
rm $dir/index.txt.attr.old
rm -rf $dir/keys
rm -rf $dir/reqs
rm -rf $dir/crts
mkdir $dir/keys
mkdir $dir/reqs
mkdir $dir/crts

if [ "$#" -gt 0 ] && [ "$1" = "--hard" ]; then
  echo "01\c" > $dir/serial
  openssl genrsa -out $dir/cakey.pem 2048
  openssl req -new -sha256 -key $dir/cakey.pem -out $dir/careq.pem
  openssl x509 -req -in $dir/careq.pem -signkey $dir/cakey.pem -out $dir/cacrt.pem
fi