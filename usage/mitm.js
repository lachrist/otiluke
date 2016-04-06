// http-server ./html -p 8000
// otiluke --mitm --transform ./transform.js --port 8080
require("../main.js").mitm({transform:"./transform.js", port:8080});