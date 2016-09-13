cd path/to/this/directory
node ../bin.js --test --transpile ./transpile/             --port 8080          --log ./log/
node ../bin.js --demo --transpile ./transpile/             --main ./standalone/ --out ./demo.html
node ../bin.js --node --transpile ./transpile/             --main ./commonjs/   --log ./log/
node ../bin.js --mitm --transpile ./transpile/logsource.js --port 8080          --log ./log/