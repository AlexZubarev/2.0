const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/taskmanager';
mongoose.connect(url);

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const routerREST = express.Router();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
    extended: true
}));

const Callback = (err, res, result) => {
    if (err) {
        result.json({
            error: err
        });
    }
    else {
        result.json(res);
    }
};

const Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {type: String, required: true}
});
let taskSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String},
    isOpen: {type: Boolean, required: true},
    user: {type: Schema.ObjectId, ref: 'User', required: true}
});

taskSchema.statics.delegate = (taskId, UserId, result) => {
    Task.findByIdAndUpdate(
        taskId,
        {
            $set: {
                user: UserId
            }
        },
        (err, res) => {
            Callback(err, res, result);
        }
    )
};

taskSchema.statics.open = (taskId, result) => {
    Task.findByIdAndUpdate(
        taskId,
        {
            $set: {
                isOpen: true
            }
        },
        (err, res) => {
            Callback(err, res, result);
        }
    )
};

taskSchema.statics.close = (taskId, result) => {
    Task.findByIdAndUpdate(
        taskId,
        {
            $set: {
                isOpen: false
            }
        },
        (err, res) => {
            Callback(err, res, result);
        }
    )
};

let User = mongoose.model('User', userSchema);
let Task = mongoose.model('Task', taskSchema);


routerREST.get("/users", (req, result) => {
    User.find().exec(
        (err, res) => {
            Callback(err, res, result);
        }
    )
});

routerREST.post("/users", (req, result) => {
    User.create(
        req.body,
        (err, res) => {
            Callback(err, res, result);
        }
    )
});

routerREST.put("/users/:userId", (req, result) => {
    User.findByIdAndUpdate(
        req.params.userId,
        {$set: {name: req.body.name}},
        (err, res) => {
            Callback(err, res, result);
        }
    )
});

routerREST.delete("/users/:userId", (req, result) => {
    User.findByIdAndRemove(
        req.params.userId,
        (err, res) => {
            Callback(err, res, result);
        }
    )
});

routerREST.get("/tasks", (req, result) => {
    Task.find().populate('user').exec(
        (err, res) => {
            Callback(err, res, result);
        }
    );
});

routerREST.post("/tasks", (req, result) => {
    Task.create(
        req.body,
        (err, res) => {
            Callback(err, res, result);
        }
    )
});

routerREST.put("/tasks/:taskId", (req, result) => {
    Task.findByIdAndUpdate(
        req.params.taskId,
        {
            $set: {
                title: req.body.title,
                description: req.body.description,
                isOpen: req.body.isOpen,
                user: req.body.user
            }
        },
        (err, res) => {
            Callback(err, res, result);
        }
    )
});

routerREST.delete("/tasks/:taskId", (req, result) => {
    User.findByIdAndRemove(
        req.params.taskId,
        (err, res) => {
            Callback(err, res, result);
        }
    )
});

routerREST.get('/tasks/:taskId/delegate/:userId', (req, result) => {
    Task.delegate(req.params.taskId, req.params.userId, result);
});

routerREST.get('/tasks/:taskId/open', (req, result) => {
    Task.open(req.params.taskId, result);
});

routerREST.get('/tasks/:taskId/close', (req, result) => {
    Task.close(req.params.taskId, result);
});

routerREST.get("/tasks/search", (req, result) => {
    const title = req.query.title;
    const description = req.query.description;
    Task.find({
        title: new RegExp(title, 'i'),
        description: new RegExp(description, 'i')
    }).populate('user').exec(
        (err, res) => {
            Callback(err, res, result);
        }
    );
});

app.use("/api/v1", routerREST);

app.use((req, res) => {
    res.status(404).send('Not found!');
});

app.listen(port);