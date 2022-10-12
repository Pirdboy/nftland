var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
require('./utils/MongoDB');

const apiRouter = require('./routes/api');
const apiTestRouter = require('./example/apitest');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// fileUpload
// app.use(fileUpload({
//     createParentPath: true,
//     preserveExtension: true,
//     safeFileNames: true,
//     abortOnLimit: true,
//     useTempFiles: true,
//     tempFileDir: path.join(__dirname, 'temp'),
//     debug: true,
//     uploadTimeout: 45000,
//     limits: {
//         fileSize: 10 * 1024 * 1024
//     }
// }));

// const fileUploadMiddleware = fileUpload({
//     createParentPath: true,
//     preserveExtension: true,
//     safeFileNames: true,
//     abortOnLimit: true,
//     useTempFiles: true,
//     tempFileDir: path.join(__dirname, 'temp'),
//     debug: true,
//     uploadTimeout: 45000,
//     limits: {
//         fileSize: 10 * 1024 * 1024
//     }
// });

app.use('/api', apiRouter);
app.use('/apitest',apiTestRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



module.exports = app;
