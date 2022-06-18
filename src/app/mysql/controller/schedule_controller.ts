const dbInfo = require('../model/index.ts');
const crypt = require('crypto');
const jwt = require('jsonwebtoken');
const key = require('../route/auth/key');
const Schedule = dbInfo.schedule;
const Op = dbInfo.sequelize.Op;
var fs = require('fs');

// Schedule Create
exports.create = (req, res) => {
    // jwt check
    const token = req.body.jwt;
    const login_check = login_check_func(token);
    if (login_check.status) {
        // file check
        let filename;
        let email = login_check.email;
        if (req.files) {
            const file = req.files.file;
            filename = file.name;
    
            if (file.size > 1 * 1024 * 1024 * 1024) {
                res.send({
                    status: false,
                    message: 'Payload too large.',
                    print: true
                });
            }
    
            if (!fs.existsSync('./uploads/' + email)){
                fs.mkdirSync('./uploads/' + email);
            }
            file.mv('./uploads/' + email + '/' + filename, function (error) {
                if (error) {
                    res.send({
                        status: false,
                        message: 'Error while uploading file',
                        print: true
                    });
                }
            });
        }

        // Validate request
        if (!req.body.startdate || !req.body.enddate || !req.body.title) {
            res.status(400).send({
                message: 'Require text is empty!'
            });
            return;
        };

        // Set tutorial
        const schedule = {
            user: email,
            startdate: req.body.startdate,
            enddate: req.body.enddate,
            allday: req.body.allday,
            title: req.body.title,
            memo: req.body.memo ? req.body.memo : null,
            alert: req.body.alert ? req.body.alert : null,
            again: req.body.again ? req.body.again : null,
            locate: req.body.locate ? req.body.locate : null,
            color: req.body.color ? req.body.color : 0,
            file: req.files ? '/' + email + '/' + filename : null
        };

        // Save tutorial
        Schedule
            .create(schedule)
            .then(_ => {
                res.send({ 
                    status: true, 
                    message: 'Schedule Create Success',
                    print: false
                });
            })
            .catch(err => {
                res.send({
                    status: false,
                    message: err.message || 'Create schedule failure.',
                    print: true
                });
            });
    } else {
        res.send({ status: false, data: login_check.data, print: true });
    }
};

// Schedule Update
exports.update = (req, res) => {
    // jwt check
    const token = req.body.jwt;
    const login_check = login_check_func(token);
    if (login_check.status) {
        // file check
        let filename;
        let email = login_check.email;
        if (req.files) {
            const file = req.files.file;
            filename = file.name;
    
            if (file.size > 1 * 1024 * 1024 * 1024) {
                res.send({
                    status: false,
                    message: 'Payload too large.',
                    print: true
                });
            }
    
            if (!fs.existsSync('./uploads/' + email)){
                fs.mkdirSync('./uploads/' + email);
            }
            file.mv('./uploads/' + email + '/' + filename, function (error) {
                if (error) {
                    res.send({
                        status: false,
                        message: 'Error while uploading file',
                        print: true
                    });
                }
            });
        }

        // Validate request
        if (!req.body.startdate || !req.body.enddate || !req.body.title) {
            res.status(400).send({
                message: 'Require text is empty!'
            });
            return;
        };

        // Set tutorial
        const schedule = {
            user: email,
            startdate: req.body.startdate,
            enddate: req.body.enddate,
            allday: req.body.allday,
            title: req.body.title,
            memo: req.body.memo ? req.body.memo : null,
            alert: req.body.alert ? req.body.alert : null,
            again: req.body.again ? req.body.again : null,
            locate: req.body.locate ? req.body.locate : null,
            color: req.body.color ? req.body.color : 0,
            file: req.files ? '/' + email + '/' + filename : null
        };
        let option = { where: { user: email, id: req.body.id } };

        // Save tutorial
        Schedule
            .update(
                schedule,
                option
            )
            .then(resultCount => {
                if (resultCount == 1) {
                    res.send({
                        message: 'User updated.'
                    });
                } else {
                    res.send({
                        message: 'Cannot update user. (email: ' + email + ')',
                        resultCount: resultCount
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || 'Update user failure. (email: ' + email + ')'
                });
            });
    } else {
        res.send({ status: false, data: login_check.data, print: true });
    }
};

exports.get = (req, res) => {
    let token = req.body.jwt;
    const login_check = login_check_func(token);
    if (login_check.status) {
        let condition = { where: {} };

        if (login_check.email) {
            condition = {
                where : {
                    [Op.or]: [
                        {
                            user: {
                                [Op.like]: `${login_check.email}`
                            }
                        }
                    ]
                }
            }
        };

        Schedule
            .findAll(condition)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    status: false,
                    message: err.message || 'Get schedule failure.',
                    print: true
                });
            });
    } else {
        res.send({ status: false, data: login_check.data, print: true });
    }
}

// Schedule Delete
exports.delete = (req, res) => {
    // jwt check
    const token = req.body.jwt;
    const login_check = login_check_func(token);
    if (login_check.status) { 
        const email = login_check.email;
        const condition = { where: { user: email, id: req.body.id } };
        
        Schedule
            .destroy(condition)
            .then(resultCount => {
                if (resultCount == 1) {
                    res.send({
                        message: 'Schedule deleted.'
                    });
                } else {
                    res.send({
                        message: 'Cannot delete schedule.'
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || 'Delete schedule failure.'
                });
            });
    }
};

function login_check_func(token) {
    let token_ = token;
    if (!token_) {
        return { status: false, data: "none token", print: false, usertype: '', email: '' };
    }

    let message = { status: false, data: '', print: true, usertype: '', email: '' };
    jwt.verify(token_, key, (err, decode) => {
        if (err || decode.email == "") {
            message['data'] = err.message;
        } else if ((Date.now() - decode.time) / (1000 * 60 * 60) >= 1) {
            message['data'] = "login expired";
        } else {
            message['status'] = true;
            message['data'] = jwt.sign({ email: decode.email, time: Date.now(), usertype: decode.usertype }, key);
            message['print'] = false;
            message['usertype'] = decode.usertype;
            message['email'] = decode.email;
        }
    })
    return message;
}