// All necessary importss
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var app = express();
var mysql = require('mysql');
var async = require("async");
var http = require('http');
var xoauth2 = require('xoauth2');
var nodemailer = require('nodemailer');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var path = require('path');
var cors = require('cors');
var PythonShell = require('python-shell');
// Allow CORS request
 app.use(cors({
    origin: function(origin, callback){
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true
  }));
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

var store = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, './../src/assets/files');
    },
    filename:function(req,file,cb){
        cb(null, file.originalname);
    }
});


var upload = multer({storage:store}).single('file');

// Default route
app.get('/', function (req, res, next) {
    return res.send({ error: true, message: 'hello' })
});

// Set port
app.listen(3000, function () {
    console.log('Backend app is running on port 3000');
});
module.exports = app;

// Connection configurations
var dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resume_matchmaker'
});

// Connect to database
dbConn.connect(); 

// Get all users
app.get('/loginvalidate', function (req, res, next) {
    dbConn.query('SELECT * FROM login', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'users list.' });
    });
});

// Get all files
app.get('/getFiles',function (req, res, next){
            dbConn.query('SELECT * FROM files', function (error, results, fields) {
                if(error){
                    throw error;
                } else {
                    return res.send({ error: false, data: results, message: 'File Get Successful' });
                }
            })
}),

// send an email of the selected candidates
app.post('/email',function(req,res,next){
        for(let i=0;i<req.body.email.length;i++){
            dbConn.query("INSERT INTO conversation (`date`, `sender`, `receiver`, `body`) VALUES (?,?,?,?)", [req.body.date,req.body.sender,req.body.email[i],req.body.body], function (error, results, fields) {
                if (error) throw error;
            });
        }
        function myFunc() {
            return res.send({ error: false, message: 'Email Sent' });
        }
        setTimeout(myFunc, 3000*req.body.email.length);

        // Code below is to send the mail to gmail
            // var transporter = nodemailer.createTransport({
            //     service: 'gmail',
            //       auth: {
            //         user: 'saisunder12345@gmail.com',
            //         pass: 'saisunder12345@',
            //         host: 'smtp.gmail.com', 
            //         ssl: true
            //       }
            // });
            // var mailOptions = {
            //         from: 'saisunder12345@gmail.com',
            //         to: 'saisunder12345@gmail.com', //get from form input field of html file
            //         subject: 'Selected Candidates',
            //         text: 'Selected Candidates are '+req.body.email
            // };	
            //     transporter.sendMail(mailOptions, function(error, info){
            //       if (error) {
            //         throw error
            //       } else {
            //         return res.send('Email sent: ');
            //       }
            //     })
}),

// receive an email
app.post('/getemail',function(req,res,next){
    dbConn.query('SELECT * from conversation WHERE (sender=? && receiver=?) || (sender=? && receiver=?)',[req.body.sender,req.body.receiver,req.body.receiver,req.body.sender], function (error, results){
        if (error) throw error;
        return res.send({ error: false, data: results,message: 'Email Get Successful' });

    // Code below is to send the mail to gmail
        // var transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //       auth: {
        //         user: 'saisunder12345@gmail.com',
        //         pass: 'saisunder12345@',
        //         host: 'smtp.gmail.com', 
        //         ssl: true
        //       }
        // });
        // var mailOptions = {
        //         from: 'saisunder12345@gmail.com',
        //         to: 'saisunder12345@gmail.com', //get from form input field of html file
        //         subject: 'Selected Candidates',
        //         text: 'Selected Candidates are '+req.body.email
        // };	
        //     transporter.sendMail(mailOptions, function(error, info){
        //       if (error) {
        //         throw error
        //       } else {
        //         return res.send('Email sent: ');
        //       }
        //     })
})
}),

// app.get('/getMail',function(req,res,next){
//         var Imap = require('imap'),
//         inspect = require('util').inspect;
//         var imap = new Imap({
//         user: 'saisunder12345@gmail.com',
//         password: 'saisunder12345@',
//         host: 'imap.gmail.com',
//         port: 993,
//         tls: true
//         });

//         function openInbox(cb) {
//         imap.openBox('INBOX', true, cb);
//         }

//         imap.once('ready', function() {
//             openInbox(function(err, box) {
//                 if (err) throw err;
//                 var f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM)','TEXT'] });
//                 f.on('message', function(msg, seqno) {
//                   console.log('Message #%d', seqno);
//                   var prefix = '(#' + seqno + ') ';
//                   msg.on('body', function(stream, info) {
//                     if (info.which === 'TEXT')
//                       console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
//                     var buffer = '', count = 0;
//                     stream.on('data', function(chunk) {
//                       count += chunk.length;
//                       buffer += chunk.toString('utf8');
//                       if (info.which === 'TEXT')
//                         console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);
//                     });
//                     stream.once('end', function() {
//                       if (info.which !== 'TEXT')
//                         console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
//                       else
//                         console.log(prefix + 'Body [%s] Finished', inspect(info.which));
//                     });
//                   });
//                   msg.once('attributes', function(attrs) {
//                     console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
//                   });
//                   msg.once('end', function() {
//                     console.log(prefix + 'Finished');
//                   });
//                 });
//                 f.once('error', function(err) {
//                   console.log('Fetch error: ' + err);
//                 });
//                 f.once('end', function() {
//                   console.log('Done fetching all messages!');
//                   imap.end();
//                 });
//               });
//         });

//         imap.once('error', function(err) {
//         console.log(err);
//         });

//         imap.once('end', function() {
//         console.log('Connection ended');
//         });

//         imap.connect();
// })
// Check if username and password entered during login exists in the database or not 
app.post('/login', function (req, res, next) {
    let user = req.body.username;
    let pass = req.body.password;
    let admin = req.body.admin;
    let manager = req.body.manager;
    let hr = req.body.hr;
    let emp = req.body.employee;
    if (!user || !pass) {
        return res.status(400).send({ error:true, message: 'Please provide username and password' });
    } else {
        dbConn.query('SELECT COUNT(username) as success FROM login WHERE username=? && password=? && admin=? && hr=? && manager=? && employee=?',[user,pass,admin,hr,manager,emp], function (error, results){
        if (error) throw error;
        return res.send({ error: false, data: results,loggeduser: req.body.username,message: 'Login Successful' });
    });
    }
}),

// Insert Signed Up Users into the database
app.post('/signup', function (req, res, next) {
    let user = req.body.username;
    let pass = req.body.password;
    let admin = req.body.admin;
    let manager = req.body.manager;
    let hr = req.body.hr;
    let emp = req.body.employee;
    if (!user || !pass) {
        return res.status(400).send({ error:true, message: 'Please provide username and password' });
    } else {
        dbConn.query("INSERT INTO login (`username`, `password`, `admin`, `hr`, `manager` , `employee` ) VALUES (?,?,?,?,?,?)", [user,pass,admin,hr,manager,emp], function (error, results, fields) {
            if (error) throw error;
            return res.send({ error: false, data: results, message: 'Signup is successful' });
        });
    }
}),

//  Delete user
app.post('/user', function (req, res, next) {
    let user_id = req.body.username;
    if (!user_id) {
        return res.status(400).send({ error: true, message: 'Please provide username to delete' });
    }
    dbConn.query('DELETE FROM login WHERE username = ?', [user_id], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'User has been deleted successfully.' });
    });
}),

//Updating Manager Permissions
app.post('/updatePermission',function(req,res,next){
    let operation = req.body.type;
    let selectedManagers = req.body.users;
    let managerString = "";
    if(operation=='download'){
        managerString = "UPDATE login SET allowdownload=1 WHERE username in (";
    }else if(operation=='delete'){
        managerString = "UPDATE login SET allowdelete=1 WHERE username in (";
    }else if(operation=='notdelete'){
        managerString = "UPDATE login SET allowdelete=0 WHERE username in (";
    }else if(operation=='notdownload'){
        managerString = "UPDATE login SET allowdownload=0 WHERE username in (";
    }
    if(selectedManagers.length==1){
        managerString = managerString + JSON.stringify(selectedManagers[0]) + ")";
    } else {
        for(let i=0;i<selectedManagers.length;i++){
            if(i==0){
                managerString = managerString+JSON.stringify(selectedManagers[i]);
            }else{
                if(i==(selectedManagers.length-1)){
                    managerString = managerString + "," + JSON.stringify(selectedManagers[i])+")";
                } else {
                    managerString = managerString + "," + JSON.stringify(selectedManagers[i]);
                }
            }
        }
    }
    dbConn.query(managerString, function (error, results, fields) {
            if (error) throw error;
            return res.send({ error: false, data: results, message: 'Permissions have been enabled' });
    })

}),

//Uploading a File
app.post('/upload', function(req,res,next){
    upload(req,res,function(err){
        if(err){
            return res.status(501).json({error:err});
        } else {
            dbConn.query('INSERT INTO files(`filename`,`filepath`) VALUES (?,?)', [req.file.originalname,"C:\\Users\\Hack5GURTeam32\\Desktop\\ResumeMatchmaker\\src\\assets\\files\\"+req.file.originalname], function (error, results, fields) {
                    if (error){
                        return res.status(501).json({error:error});
                    } else {
                            return res.send({ error: false, data: results, message: 'File Uploaded Successfully' });
                        }
                    })
                }
            });
        }),

    //Delete a file
    app.post('/file',function(req,res,next){
        let fileName = req.body.filename;
        if (!fileName) {
            return res.status(400).send({ error: true, message: 'Please provide filename to delete' });
        } else {
            fs.unlinkSync('./../src/assets/files/'+fileName);
            dbConn.query('DELETE FROM files WHERE filename = ?', [fileName], function (error, results, fields) {
                if (error) throw error;
                return res.send({ error: false, data: results, message: 'File has been deleted successfully.' });
            });
        }
    }),

    //Get the classifications of the resume
    app.get('/getClassification', function (req, res, next) {
        let { spawn } = require('child_process');
        let pythonProcess = spawn('python',["./../ai_ml/hackathon/hackathonScript/sample.py"]);
                        pythonProcess.stdout.on('data', (data) => {
                            return res.send({ error: false, data: data.toString('utf8'), message: 'Classification List Get' });
        })
    }),

    //Post the multiple technologies in the function of Python to sort it on the basis of strength using AI/ML
    app.post('/strengthMultiple',function(req,res,next){
        let { spawn } = require('child_process');
        let pythonProcess = spawn('python',["./../ai_ml/hackathon/hackathonScript/sample2.py", req.body.requestedSkills]);
                       pythonProcess.stdout.on('data', (data) => {
                            let obj = JSON.parse((data.toString('utf8')));
                            console.log(obj)
                            return res.send({
                                error: false, data: obj
                            })
                       })
        // dbConn.query('SELECT * FROM files', function (error, results, fields) {
        //     if(error){
        //         throw error;
        //     } else {
        //         for(let j=0;j<results.length;j++){
        //                 let pythonProcess = spawn('python',["./../ai_ml/hackathon/hackathonScript/sample1.py", req.body.requestedSkills[0],results[j].filepath]);
        //                 pythonProcess.stdout.on('data', (data) => {
        //                     let obj = JSON.parse((data.toString('utf8')));
        //                     dbConn.query('UPDATE files SET strength=?,name=?,email=?,contact=?,experience=? WHERE filename=?', [obj[4],obj[0],obj[2],obj[1],obj[3].substring(18),results[j].filename], function (error, results, fields) {
        //                         if(error){
        //                             throw error;
        //                         }else{
        //                         }
        //                     })
        //             });
        //         }
        //         function myFunc() {
        //         return res.send({ error: false, message: 'Strength Updated Successfully' });
        //         }
        //         setTimeout(myFunc, 3000*results.length);
        //     }
        // })
    }),

    //Post the selected single technology in the function of Python to sort it on the basis of strength using AI/ML
    app.post('/strength',function(req,res,next){
        let { spawn } = require('child_process');
        dbConn.query('SELECT * FROM files', function (error, results, fields) {
            if(error){
                throw error;
            } else {
                for(let j=0;j<results.length;j++){
                        let pythonProcess = spawn('python',["./../ai_ml/hackathon/hackathonScript/sample1.py", req.body.requestedSkills[0],results[j].filepath]);
                        pythonProcess.stdout.on('data', (data) => {
                            let obj = JSON.parse((data.toString('utf8')));
                            dbConn.query('UPDATE files SET strength=?,name=?,email=?,contact=?,experience=? WHERE filename=?', [obj[4],obj[0],obj[2],obj[1],obj[3].substring(18),results[j].filename], function (error, results, fields) {
                                if(error){
                                    throw error;
                                }else{
                                }
                            })
                    });
                }
                function myFunc() {
                return res.send({ error: false, message: 'Strength Updated Successfully' });
                }
                setTimeout(myFunc, 3000*results.length);
            }
        })
    })