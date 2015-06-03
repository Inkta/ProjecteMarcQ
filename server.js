var express = require("express");
var app = express();
app.use(require('body-parser').json());
var noCache = require("./noCache");
var multer = require('multer');
var http = require("http").Server(app);
var auth = require("./auth");



app.use(noCache);
app.use(auth);
app.use("/api/users", multer({ dest : "./assets/perfils"}));
app.use("/api/users", require("./controllers/api/users"));
app.use("/api/tripulacio", require("./controllers/api/tripulacions"));

app.use("/api/tresors", require("./controllers/api/tresors"));
//app.use("/api/autors", require("./controllers/api/autors"));
app.use("/",require("./controllers/static"));

/*require("./controllers/servidor")(http);*/

http.listen(process.env.PORT, function() {
    console.log('Server listening on', process.env.PORT);
});