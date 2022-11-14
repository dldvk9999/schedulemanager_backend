const dbInfo = require("../model/index.ts");
const crypt = require("crypto");
const jwt = require("jsonwebtoken");
const key = require("../route/auth/key");
const Schedule = dbInfo.schedule;
const Op = dbInfo.sequelize.Op;
var fs = require("fs");

// Schedule Create
exports.create = (req, res) => {
    // jwt check
    const token = req.body.jwt;
    const login_check = login_check_func(token);
    if (login_check.status) {
        let totalFilename = new Array();
        let filename;
        let email = login_check.email;
        // file check
        if (req.files) {
            const files =
                Object.prototype.toString.call(req.files.file).slice(8, -1) !=
                "Array"
                    ? [req.files.file]
                    : req.files.file;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                filename = file.name;

                // file size check
                if (file.size > 1 * 1024 * 1024 * 1024) {
                    res.status(400).send({
                        message:
                            'Payload too large. "' + filename + '" (MAX : 1GB)',
                    });
                    return;
                }

                // file name check
                if (filename.includes(",")) {
                    res.status(400).send({
                        message: 'File names cannot contain "," : ' + filename,
                    });
                    return;
                }

                // file folder and exist check
                const date = new Date(req.body.startdate)
                    .toLocaleDateString()
                    .replace(" ", "")
                    .replace(" ", "");
                if (!fs.existsSync("./uploads/" + email + "/" + date)) {
                    fs.mkdirSync(
                        "./uploads/" + email + "/" + date,
                        { recursive: true },
                        (err) => {
                            console.log(err);
                        }
                    );
                } else if (
                    fs.existsSync(
                        "./uploads/" + email + "/" + date + "/" + filename
                    )
                ) {
                    res.status(400).send({
                        message: filename + " already exist!",
                    });
                    return;
                } else {
                    file.mv(
                        "./uploads/" + email + "/" + date + "/" + filename,
                        function (error) {
                            if (error) {
                                res.status(400).send({
                                    message: "Error while uploading file",
                                });
                                return;
                            }
                        }
                    );
                    totalFilename.push(filename);
                }
            }
        }

        // Validate request
        if (!req.body.startdate || !req.body.enddate || !req.body.title) {
            res.status(400).send({
                message: "Require text is empty!",
            });
            return;
        }

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
            file: req.files ? totalFilename.join(",") : null,
        };

        // Save tutorial
        Schedule.create(schedule)
            .then((_) => {
                res.send({
                    message: "Schedule Create Success",
                });
            })
            .catch((err) => {
                res.status(400).send({
                    message: err.message || "Create schedule failure.",
                });
            });
    } else {
        res.status(400).send({ message: login_check.data });
    }
};

// Schedule Update
exports.update = (req, res) => {
    // jwt check
    const token = req.body.jwt;
    const login_check = login_check_func(token);
    if (login_check.status) {
        let totalFilename = new Array();
        let filename;
        let email = login_check.email;
        // file check
        if (req.files) {
            const files =
                Object.prototype.toString.call(req.files.file).slice(8, -1) !=
                "Array"
                    ? [req.files.file]
                    : req.files.file;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                filename = file.name;

                // file size check
                if (file.size > 1 * 1024 * 1024 * 1024) {
                    res.status(400).send({
                        message:
                            'Payload too large. "' + filename + '" (MAX : 1GB)',
                    });
                    return;
                }

                // file name check
                if (filename.includes(",")) {
                    res.status(400).send({
                        message: 'File names cannot contain "," : ' + filename,
                    });
                    return;
                }

                // file folder and exist check
                const date = new Date(req.body.startdate)
                    .toLocaleDateString()
                    .replace(" ", "")
                    .replace(" ", "");
                if (!fs.existsSync("./uploads/" + email + "/" + date)) {
                    fs.mkdirSync(
                        "./uploads/" + email + "/" + date,
                        { recursive: true },
                        (err) => {
                            console.log(err);
                        }
                    );
                } else if (
                    fs.existsSync(
                        "./uploads/" + email + "/" + date + "/" + filename
                    )
                ) {
                    res.status(400).send({
                        message: filename + " already exist!",
                    });
                    return;
                } else {
                    file.mv(
                        "./uploads/" + email + "/" + date + "/" + filename,
                        function (error) {
                            if (error) {
                                res.status(400).send({
                                    message: "Error while uploading file",
                                });
                                return;
                            }
                        }
                    );
                    totalFilename.push(filename);
                }
            }
        }

        // Validate request
        if (!req.body.startdate || !req.body.enddate || !req.body.title) {
            res.status(400).send({ message: "Require text is empty!" });
            return;
        }

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
            file: req.files ? totalFilename.join(",") : null,
        };
        let option = { where: { user: email, id: req.body.id } };

        // Save tutorial
        Schedule.update(schedule, option)
            .then((resultCount) => {
                if (resultCount == 1) {
                    res.send({
                        message: "User updated.",
                    });
                } else {
                    res.status(400).send({
                        message: "Cannot update user. (email: " + email + ")",
                        resultCount: resultCount,
                    });
                }
            })
            .catch((err) => {
                res.status(400).send({
                    message:
                        err.message ||
                        "Update user failure. (email: " + email + ")",
                });
            });
    } else {
        res.status(400).send({ message: login_check.data });
    }
};

//Schedule Get
exports.get = (req, res) => {
    let token = req.body.jwt;
    const login_check = login_check_func(token);
    if (login_check.status) {
        let condition = { where: {} };
        const y = Number(req.body.year);
        const m = Number(req.body.month);
        let sdate = {
            year: m - 2 <= 0 ? y - 1 : y,
            month: m - 2 <= 0 ? m + 10 : m - 2,
        };
        let edate = {
            year: m + 1 > 12 ? y + 1 : y,
            month: m + 1 > 12 ? 1 : m + 1,
        };

        if (login_check.email) {
            condition = {
                where: {
                    [Op.or]: [
                        {
                            user: {
                                [Op.like]: `${login_check.email}`,
                            },
                            startdate: {
                                [Op.gt]: new Date(sdate.year, sdate.month),
                            },
                            enddate: {
                                [Op.lt]: new Date(edate.year, edate.month),
                            },
                        },
                    ],
                },
            };
        }

        Schedule.findAll(condition)
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.status(400).send({
                    message: err.message || "Get schedule failure.",
                });
            });
    } else {
        res.status(400).send({ message: login_check.data });
    }
};

// Schedule Delete
exports.delete = (req, res) => {
    // jwt check
    const token = req.body.jwt;
    const login_check = login_check_func(token);
    if (login_check.status) {
        const email = login_check.email;
        const condition = { where: { user: email, id: req.body.id } };

        Schedule.destroy(condition)
            .then((resultCount) => {
                if (resultCount == 1) {
                    res.send({
                        message: "Schedule deleted.",
                    });
                } else {
                    res.status(400).send({
                        message: "Cannot delete schedule.",
                    });
                }
            })
            .catch((err) => {
                res.status(400).send({
                    message: err.message || "Delete schedule failure.",
                });
            });
    } else {
        res.status(400).send({ message: login_check.data });
    }
};

exports.filedownload = (req, res) => {
    // jwt check
    const token = req.body.jwt;
    const login_check = login_check_func(token);
    if (login_check.status) {
        const email = login_check.email;
        const date = req.body.date;
        const filename = req.body.filename;

        res.download("/uploads/" + email + "/" + date + "/", filename);
    }
};

function login_check_func(token) {
    let token_ = token;
    if (!token_) {
        return {
            status: false,
            data: "none token",
            print: false,
            usertype: "",
            email: "",
        };
    }

    let message = {
        status: false,
        data: "",
        print: true,
        usertype: "",
        email: "",
    };
    jwt.verify(token_, key, (err, decode) => {
        if (err || decode.email == "") {
            message["data"] = err.message;
        } else if ((Date.now() - decode.time) / (1000 * 60 * 60) >= 1) {
            message["data"] = "login expired";
        } else {
            message["status"] = true;
            message["data"] = jwt.sign(
                {
                    email: decode.email,
                    time: Date.now(),
                    usertype: decode.usertype,
                },
                key
            );
            message["print"] = false;
            message["usertype"] = decode.usertype;
            message["email"] = decode.email;
        }
    });
    return message;
}
