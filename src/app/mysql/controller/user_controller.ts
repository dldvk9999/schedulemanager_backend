const dbInfo = require('../model/index.ts');
const crypt = require('crypto');
const jwt = require('jsonwebtoken');
const key = require('../route/auth/key');
const User = dbInfo.user;
const Op = dbInfo.sequelize.Op;
// const salt = crypt.randomBytes(128).toString('base64');

// Create tutorial
exports.create = (req, res) => {
    // Validate request
    if (!req.body.email || !req.body.password || !req.body.usertype) {
        res.status(400).send({
            message: 'Require text is empty!'
        });
        return;
    }

    // If exist?
    const keyword = req.body.email;
    let condition = { where: {} };

    if (keyword) {
        condition = {
            where : {
                [Op.or]: [
                    {
                        email: {
                            [Op.like]: `${keyword}`
                        }
                    }
                ]
            }
        }
    };
    
    User
        .findAll(condition)
        .then(result => {
            if (result.length >= 1) {
                res.status(400).send({ status: false, data: 'you are already signup!', print: true })
            } else {
                // Set tutorial
                const user = {
                    email: req.body.email,
                    password: crypt.createHash('sha512').update(req.body.password).digest('hex'),
                    usertype: req.body.usertype,
                    name: req.body.name ? req.body.name : "Anonymous",
                    deptname: req.body.deptname,
                    job: req.body.job,
                    tag: req.body.tag,
                    description: req.body.description
                };

                // Save tutorial
                User
                    .create(user)
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        res.status(500).send({
                            message: err.message || 'Create user failure.'
                        });
                    });
            }
        })
        .catch(err => {
            res.status(400).send({ status: false, data: err.message, print: true })
        })
};

// Retrieve all tutorials
exports.findAll = (req, res) => {
    const token = req.body.jwt;
    let login_check = login_check_func(token);
    if(login_check['status'] && login_check['usertype'] == 1) {
        User
            .findAll()
            .then(result => {
                const data = [];
                result.forEach(element => {
                    const tmp = {
                        email: element.email,
                        name: element.name,
                        usertype: element.usertype
                    }
                    data.push(...[tmp]);
                }); 
                res.send(data);
            })
            .catch(err => {
                res.send({
                    message: err.message || 'Retrieve all users failure.'
                });
            });
    } else {
        res.send({ status: false, data: 'you are not admin!', print: true });
    }
};

// Retrieve tutorial by email
exports.findOne = (req, res) => {
    const token = req.body.jwt;
    let login_check = login_check_func(token);
    if(login_check['status']) {
        let option = { attributes: ['email', 'name', 'deptname', 'job', 'tag', 'usertype'], where: { email: login_check.email } };
    
        User
            .findOne(option)
            .then(result => {
                res.send(result);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || 'Retrieve user failure. (keyword: ' + login_check.email + ')'
                });
            });
    }
};

// Login
exports.login = (req, res) => {
    const email = req.body.email;
    const password = crypt.createHash('sha512').update(req.body.password).digest('hex');
    let option = { attributes: ['email', 'password', 'usertype' ], where: { email: email, password: password } };
    
    User
        .findOne(option)
        .then(result => {
            if(result == null) {
                res.send({
                    message: "이메일 혹은 비밀번호가 일치하지 않습니다."
                });
            } else {
                const token = jwt.sign({email: email, time: Date.now(), usertype: result.usertype}, key);
                res.cookie('jwt', token, {
                    maxAge: 1000 * 60 * 60,
                    secure: true,
                }).send(token);
            }
        })
        .catch(err => {
            res.send({
                message: err.message || 'Retrieve user failure.'
            });
        });
};

// Login_Check
exports.login_check = (req, res) => {
    let token = req.body.jwt;
    let result = login_check_func(token);

    if (result['status']) {
        res.cookie('jwt', result['data'], {
            maxAge: 1000 * 60 * 60,
            secure: true,
          }).json({ status: true, data: result['data'], print: false });
    } else {
        res.json({ status: false, data: result['data'], print: false });
    }
}

// Logout
exports.logout = (_, res) => {
    res.clearCookie('jwt').json({ message: 'logout successfully' });
}

// Update tutorial by email
exports.update = (req, res) => {
    const email = req.params.email;
    const user = {
        email: req.body.email,
        password: crypt.createHash('sha512').update(req.body.password).digest('hex'),
        usertype: req.body.usertype,
        name: req.body.name,
        deptname: req.body.deptname,
        job: req.body.job,
        tag: req.body.tag,
        description: req.body.description
    };
    let option = { where: { email: email } };

    User
        .update(
            user,
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
};

// Delete tutorial by email
exports.delete = (req, res) => {
    const email = req.params.email;
    const condition = { where: { email: email } };

    User
        .destroy(condition)
        .then(resultCount => {
            if (resultCount == 1) {
                res.send({
                    message: 'User deleted.'
                });
            } else {
                res.send({
                    message: 'Cannot delete user. (email: ' + email + ')'
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Delete user failure. (email: ' + email + ')'
            });
        });
};


function login_check_func(token) {
    let token_ = token;
    if (!token_) {
        return { status: false, data: "none token", print: false };
    }

    let message = { status: false, data: '', print: true, usertype: '' };
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