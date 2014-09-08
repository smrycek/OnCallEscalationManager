
exports.handleIncoming = function (req, res) {

    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;



    console.log("Incoming Call");
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Incoming Call");
    res.end();
};