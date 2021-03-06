var loopback = require('loopback');

module.exports=function(app) {

var router=app.loopback.Router();
router.get('/',function (req,res) {
	res.render('index.ejs',{
	});
});
router.get('/signup',function(req,res){
	res.render('signup.ejs');
});
router.get('/login',function(req,res){
	res.render('login.ejs');
});
router.get('/tasks',function(req,res){

	var ctx = loopback.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
 	accesstoken = encodeURIComponent(req.query.access_token);
 	console.log(accesstoken);

	app.models.tasks.find(function(err,result){
				console.log("Tasks = ",result);
				res.render('todo.ejs',{
					username: currentUser.username,
	        		accessToken: accesstoken,
					task : result
				});
			});
});
router.post('/login',function(req,res){
	console.log('Login req body = ',req.body);
	var User = app.models.User;
	var email = req.body.email;
    var password = req.body.password;
	User.login({
		email : email,
		password : password
	},'user',function(err,token){
		if(err){
			//alert("Login Failed!");
			res.redirect('/signup');
		}else{
			token = token.toJSON();
			console.log('Token = ',token.id);
			console.log('username = ',token.user.username);
			res.locals.username = token.user.username;
			res.locals.accessToken = token.id
			app.models.tasks.find(function(err,result){
				res.render('todo.ejs',{
					username: token.user.username,
	        		accessToken: token.id,
	        		task : result
				});
			});
		}
	});
});
router.post('/signup',function(req,res){
	var User=app.models.User;
	var newUser={};
	newUser.username = req.body.username.trim();
	newUser.email = req.body.email.toLowerCase();
	newUser.password = req.body.password;
	User.create(newUser,function(err,result){
		if(err){
			console.log(err);
		}else{
			res.redirect('/login');
		}
	});
});
router.post('/addTask',function(req,res){

 	accesstoken = encodeURIComponent(req.query.access_token);
 
	var task = app.models.tasks;
	var newTask = {};
	newTask.description = req.body.description;
	newTask.time = req.body.time;
	newTask.date = req.body.date;
	task.create(newTask,function(err,tasks){
		if(err){
			console.log(err);
		}else{
			res.redirect('/tasks?access_token='+accesstoken);			
		}
	});
});
router.get('/delete/:id', function(req, res) {
	console.log(" delete task access_token = ",req.query.access_token);
 	accesstoken = encodeURIComponent(req.query.access_token);
 	console.log(accesstoken);
	 app.models.tasks.findById( req.params.id, function ( err, todo ){
	    	todo.remove( function ( err, todo ){
	    		if(err) console.log("Do not Remove!");
	    		else
	      		res.redirect( '/tasks?access_token='+accesstoken);
    		});
	    });
 });
router.get('/logout', function(req, res) {
    var AccessToken = app.models.AccessToken;
    var token = new AccessToken({id: req.query['access_token']});
    token.destroy();

    res.redirect('/');
  });

app.use(router);
};