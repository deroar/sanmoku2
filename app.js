var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    app = express(),
    post = require('./routes/post')
;

app.set('views',__dirname + '/views');
app.set('view engine','ejs');

//middleware
app.use(morgan({format: 'dev', immediate: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride());

//初期画面
app.get('/',post.index);

//○　or　×
app.post('/pick',post.pick);


//画面初期化
app.post('/init',post.init);

app.listen(3000);
console.log("server starting...");