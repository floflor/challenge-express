var express = require("express");
var server = express();
var bodyParser = require("body-parser");


server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
    extended: true
}));


var model = {
    clients: {},
};

/* clients {
    javier:[{dates}, {dates}]
    roberto:[{dates}, {dates}]
} */
/* {date:"16/02 16hs" status:'pending'} */
model.reset = () => {
    model.clients = {};
};

model.addAppointment = (client, date) => {
    //check if theres not that client on the obj 
    if (!model.clients[client]) {
        //add new client 
        model.clients[client] = [];
    }
    //add status

    //add date
    model.clients[client].push(date);
    date.status = 'pending';


};

model.attend = (name, date) => {
    let client = model.clients;
    //check if theres a propery matching name 
    if (client.hasOwnProperty(name)) {
        // loop through the property arr 
        for (let i = 0; i < client[name].length; i++) {
            // check if there's a property matching the date
            if (client[name][i].date === date) {
                // change status!
                client[name][i].status = 'attended';
                return client[name][i];
            }
        }

    }
};

model.expire = (name, date) => {
    let client = model.clients;
    //check if theres a propery matching name 
    if (client.hasOwnProperty(name)) {
        // loop through the property arr 
        for (let i = 0; i < client[name].length; i++) {
            // check if there's a property matching the date
            if (client[name][i].date === date) {
                // change status!
                client[name][i].status = 'expired';
                return client[name][i];
            }
        }
    }
};

model.cancel = (name, date) => {
    let client = model.clients;
    //check if theres a propery matching name 
    if (client.hasOwnProperty(name)) {
        // loop through the property arr 
        for (let i = 0; i < client[name].length; i++) {
            // check if there's a property matching the date
            if (client[name][i].date === date) {
                // change status!
                client[name][i].status = 'cancelled';
                return client[name][i];
            }
        }
    }
};

model.erase = (parName, parProperty) => {
    var varProperty = "date";
    if (parProperty == "expired" || parProperty == "cancelled" || parProperty == "attended") {
        varProperty = "status";
    }
    var filtered = [];
    model.clients[parName] = model.clients[parName].filter(e => {
        var condition = e[varProperty] !== parProperty;
        if (!condition) {
            filtered.push(e)
        }
        return condition
    });
    return filtered;
}

model.getAppointments = (name, status) => {
    let client = model.clients;
    if (status) {
        for (let i = 0; i < client[name].length; i++) {
            //check if date match the status
            if (client[name][i].status === status) {
                let myArr = [];
                myArr.push(client[name][i]);
                return myArr;
            }
        }
    }
    return client[name];
}

model.getClients = () => {

    let myClients = [];
    for (let names in model.clients) {
        myClients.push(names);
    }
    return myClients;
}

// server API 

server.get('/api', (req, res) => {
    res.send(model.clients);
})

server.post('/api/Appointments', (req, res) => {

    if (!req.body.client) {
        res.status(400).send('the body must have a client property');
    }
    else if (typeof req.body.client !== 'string') {
        res.status(400).send('client must be a string');
    }
    else {

        res.send({ date: req.body.appointment.date, status: 'pending' });
        res.send(model.addAppointment(req.body.client, req.body.appointment));
    }


});

server.get('/api/Appointments/clients', (req, res) => {

    res.status(200).send(model.getClients());
});

server.get('/api/Appointments/:name', (req, res) => {
    const name = req.params.name;
    const { date, option } = req.query;
    if (!model.clients[name]) {
        res.status(400).send('the client does not exist');
    }

    else if (!model.clients[name].find((e) => e.date === date)) {
        res.status(400).send('the client does not have a appointment for that date');
    }

    else if (!(option === 'attend' || option === 'expire' || option === 'cancel')) {

        res.status(400).send('the option must be attend, expire or cancel');
    }

    else if (option === 'attend') {
        res.send(model.attend(name, date));
    }
    else if (option === 'expire') {
        res.send(model.expire(name, date));
    }
    else if (option === 'cancel') {
        res.send(model.cancel(name, date));
    }


});

server.get('/api/Appointments/:name/erase', (req, res) => {
    const name = req.params.name;
    const { date } = req.query;
    if (!model.clients[name]) {
        res.status(400).send('the client does not exist');
    }
    else {
        res.send(model.erase(name, date));
    }
});

server.get('/api/Appointments/getAppointments/:name', (req, res) => {
    const name = req.params.name;
    res.send(model.getAppointments(name));
});





server.listen(3000);
module.exports = { model, server };
