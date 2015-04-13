var nodemailer = require('nodemailer');
var kue = require('kue');
var jobs = kue.createQueue();

var email = '';
var password = '';
var reciever = '';
var mailService = 'Gmail';

var transport = nodemailer.createTransport('SMTP',{
    service: mailService,
    auth: {
        user: email,
        pass: password
    }
});

var mail = {}

var job = jobs.create('email', {
    title: 'mail1',
    to: reciever
}).delay(10000).priority('high').save();

for(var i = 2; i < 7; ++i){
    jobs.create('email', {
        title: 'mail'+i,
        to: reciever,
        from: email
    }).delay(10000 * i).priority('high').save();
}

jobs.promote();

jobs.process('email', 10, function (job, done) {
    mail.from = job.data.from;
    mail.to = job.data.to;
    mail.subject = job.data.title;
    mail.html = "This is " + job.data.title;
    transport.sendMail(mail, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log(job.data.title+' complete');
        }
    });
    done();
});

kue.app.listen(3000);
console.log('UI started on port 3000');