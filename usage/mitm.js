// http-server ./html -p 8000
// otiluke --mitm --transform ./transform.js --port 8080
require("otiluke").mitm({transform:"./transform.js", port:8080});
// http://localhost:8080