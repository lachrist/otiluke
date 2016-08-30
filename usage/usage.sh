cd path/to/this/directory
otiluke --test --transpile ./transpile/              --port 8080          --log ./log/
otiluke --demo --transpile ./transpile/              --main ./standalone/ --out ./demo.html
otiluke --node --transpile ./transpile/              --main ./commonjs/   --log ./log/
otiluke --mitm --transpile ./transpile/logsource.js  --port 8080          --log ./log/