// otiluke --node --transform ./transform.js --main ./commonjs/main.js
require("../main.js").node({transform:"./transform.js", main:"./commonjs/main.js"});