var express = require('express');
var exphbs = require('express-handlebars');
var admin = require("firebase-admin");
var serviceAccount = {
	type: "service_account",
	project_id: "samuelprogrammergame",
	private_key_id: "bde6ca29bab02ae98809834758e459418c9df5b4",
	private_key: process.env.FB_KEY.replace(/\\n/g, '\n'),
	client_id: "112738034804009094089",
	client_email: "firebase-adminsdk-w4bv6@samuelprogrammergame.iam.gserviceaccount.com",
	auth_uri: "https://accounts.google.com/o/oauth2/auth",
	token_uri: "https://oauth2.googleapis.com/token",
	auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
	client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-3ef00%40samuelprogrammergame.iam.gserviceaccount.com"
};
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://samuelprogrammergame.firebaseio.com"
});
var db = admin.firestore();
var app = express();
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('static'));

app.get('/', function(req, res) {
	if (req.query.login) {
		res.render('about');
	}
	else if (req.get('X-Replit-User-Name')) {
		if (req.query.mode == "new") {
			res.render('new', {
				name: req.get('X-Replit-User-Name'),
				id: req.get('X-Replit-User-Id')
			});
		} else if (req.query.mode == "load") {
			res.redirect('/play');
		} else {
			res.render('main', {
				name: req.get('X-Replit-User-Name'),
				id: req.get('X-Replit-User-Id')
			});
		}
	}
	else {
		res.render('about');
	}
});

app.get('/internal/create', function(req, res) {
	db.collection(req.get('X-Replit-User-Id')).doc('data').set({
		company_name: req.query.cname,
		flagship_product: req.query.flagship,
		product_type: req.query.type,
		language: req.query.lang,
		progress: 0
	}).then(function() {
		res.redirect('/play');
	});
});

app.get('/play', function(req, res) {
	if (req.get('X-Replit-User-Name')) {
		db.collection(req.get('X-Replit-User-Id')).doc('data').get(function(doc) {
			if (!doc.exists()) {
				res.redirect('/?mode=new')
			} else {
				res.render('game', {
					name: req.get('X-Replit-User-Name'),
					id: req.get('X-Replit-User-Id')
				});
			}
		});
	} else {
		res.redirect('/');
	}
});

app.use(function(req, res) {
	res.render('404');
});
app.use(function(error, req, res, next) {
	res.render('500', {
		error: error
	});
});
app.listen(3000);