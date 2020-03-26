var lat;
var lng;
var user_id;
// entry
function init() {
	document.querySelector('#login-form-btn').addEventListener('click',
			onSessionInvalid);
	document.querySelector('#register-form-btn').addEventListener('click',
			showRegisterForm);
	document.querySelector('#login-btn').addEventListener('click', login);
	document.querySelector('#register-btn').addEventListener('click', register);
	document.querySelector('#nearby-btn').addEventListener('click',
			loadNearbyItems);
	document.querySelector('#fav-btn').addEventListener('click',
			loadFavoriteItems);
	document.querySelector('#recommend-btn').addEventListener('click',
			loadRecommendedItems);
	document.querySelector('#logout-link').addEventListener('click', logout);
	validateSession();
}

function validateSession() {
	// the request parameters
	var url = './login';
	var req = JSON.stringify({});
	// display loading message
	// showLoadingMessage('Validating session...');
	// make AJAX call
	ajax('GET', url, req,
	// session is still valid
	function(res) {
		var result = JSON.parse(res);
		if (result.status === 'OK') {
			onSessionValid(result);
		}
	}, function() {
		onSessionInvalid();
	})
}

function onSessionValid(result) {
	user_id = result.user_id;
	user_fullname = result.name;

	var loginForm = document.querySelector('#login-form');
	var registerForm = document.querySelector('#register-form');
	var topNavItems = document.querySelector('#top-nav-items');
	var itemNav = document.querySelector('#item-nav');
	var itemList = document.querySelector('#item-list');
	var avatar = document.querySelector('#avatar');
	var welcomeMsg = document.querySelector('#welcome-msg');
	var logoutBtn = document.querySelector('#logout-link');

	welcomeMsg.innerHTML = 'Welcome, ' + user_fullname;
	
	showElement(itemNav);
	showElement(itemList);
	showElement(topNavItems, 'inline');
	showElement(avatar);
	showElement(welcomeMsg);
	showElement(logoutBtn, 'inline-block');
	hideElement(loginForm);
	hideElement(registerForm);

	initGeoLocation();

}

function onSessionInvalid() {
	var loginForm = document.querySelector('#login-form');
	var registerForm = document.querySelector('#register-form');
	var topNavItems = document.querySelector('#top-nav-items');
	var itemNav = document.querySelector('#item-nav');
	var itemList = document.querySelector('#item-list');
	var avatar = document.querySelector('#avatar');
	var welcomeMsg = document.querySelector('#welcome-msg');
	var logoutBtn = document.querySelector('#logout-link');
	
	hideElement(topNavItems);
	hideElement(registerForm);
	hideElement(itemNav);
	hideElement(itemList);
	hideElement(avatar);
	hideElement(welcomeMsg);
	hideElement(logoutBtn);


	clearLoginError();
	showElement(loginForm);
}


function showRegisterForm() {
	var loginForm = document.querySelector('#login-form');
	var registerForm = document.querySelector('#register-form');
	var itemNav = document.querySelector('#item-nav');
	var itemList = document.querySelector('#item-list');
	var avatar = document.querySelector('#avatar');
	var welcomeMsg = document.querySelector('#welcome-msg');
	var logoutBtn = document.querySelector('#logout-link');

	hideElement(itemNav);
	hideElement(itemList);
	hideElement(avatar);
	hideElement(logoutBtn);
	hideElement(welcomeMsg);
	hideElement(loginForm);

	clearRegisterResult();
	showElement(registerForm);
}

// Login Ajax
function login() {

	var username = document.querySelector('#username').value;
	var password = document.querySelector('#password').value;
	password = md5(username + md5(password));

	// The request parameters
	var url = './login';
	var req = JSON.stringify({
		user_id : username,
		password : password
	});

	// call ajax method
	ajax('POST', url, req, function(res) {
		var result = JSON.parse(res);
		if (result.status === 'OK') {
			onSessionValid(result);
		}
	}, function() {
		showLoginError();
	});
}

// Register Ajax
function register() {
	var username = document.querySelector('#register-username').value;
	var password = document.querySelector('#register-password').value;
	var firstName = document.querySelector('#register-first-name').value;
	var lastName = document.querySelector('#register-last-name').value;

	// check empty input
	if (username === "" || password == "" || firstName === ""
			|| lastName === "") {
		showRegisterResult('Please fill in all fields');
		return;
	}

	// check invalid input
	var pattern = /^[a-z0-9_]+$/;
	if (username.match(pattern) === null) {
		showRegisterResult('Invalid username');
		return;
	}

	// encrypt password
	password = md5(username + md5(password));

	// The request parameters
	var url = './register';
	var req = JSON.stringify({
		user_id : username,
		password : password,
		first_name : firstName,
		last_name : lastName,
	});

	ajax('POST', url, req,
	// successful callback
	function(res) {
		var result = JSON.parse(res);

		// successfully logged in
		if (result.status === 'OK') {
			showRegisterResult('Succesfully registered');
		} else {
			showRegisterResult('User already existed');
		}
	},

	// error
	function() {
		showRegisterResult('Failed to register');
	}, true);
}

function logout() {
	var url = './logout';
	var req = null;
	ajax('GET', url, req, function(res) {
		onSessionInvalid();
	},
	// error
	function() {
		console.alert('Failed to logout.');
	}, true);

}

// api1: Geolocation
function initGeoLocation() {
	// TODO
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(onPositionUpdated,
				onLoadPositionFailed, {
					maximumAge : 60000
				});
		showLoadingMessage('Retrieving your location...');
	} else {
		onLoadPositionFailed();
	}
}

function onPositionUpdated(position) {
	lat = position.coords.latitude;
	lng = position.coords.longitude;

	loadNearbyItems();
}

function onLoadPositionFailed() {
	console.warn('navigator.geolocation is not available');
	getLocationFromIP();
}

function loadNearbyItems() {
	console.log('loadNearbyItems');
	activeBtn('nearby-btn');

	// The request parameters
	var url = './search';
	var params = 'user_id=' + user_id + '&lat=' + lat + '&lon=' + lng;
	var data = null;

	// display loading message
	showLoadingMessage('Loading nearby items...');

	// make AJAX call
	ajax('GET', url + '?' + params, data,
	// successful callback
	function(res) {
		var items = JSON.parse(res);
		if (!items || items.length === 0) {
			showWarningMessage('No nearby item.');
		} else {
			console.log(items);
			listItems(items);
		}
	},
	// failed callback
	function() {
		showErrorMessage('Cannot load nearby items.');
	});
}

// Favorite
function loadFavoriteItems() {
	activeBtn('fav-btn');

	// request parameters
	var url = './history';
	var params = 'user_id=' + user_id;
	var req = JSON.stringify({});

	// display loading message
	showLoadingMessage('Loading favorite items...');

	// make AJAX call
	ajax('GET', url + '?' + params, req, function(res) {
		var items = JSON.parse(res);
		if (!items || items.length === 0) {
			showWarningMessage('No favorite item.');
		} else {
			listItems(items);
		}
	}, function() {
		showErrorMessage('Cannot load favorite items.');
	});
}

function changeFavoriteItem(item) {
	// check whether this item has been visited or not
	var li = document.querySelector('#item-' + item.item_id);
	var favIcon = document.querySelector('#fav-icon-' + item.item_id);
	var favorite = !(li.dataset.favorite === 'true');

	// request parameters
	var url = './history';
	var req = JSON.stringify({
		user_id : user_id,
		favorite : item
	});
	var method = favorite ? 'POST' : 'DELETE';

	ajax(method, url, req,
	// successful callback
	function(res) {
		var result = JSON.parse(res);
		if (result.status === 'OK' || result.result === 'SUCCESS') {
			li.dataset.favorite = favorite;
			favIcon.className = favorite ? 'fa fa-heart' : 'fa fa-heart-o';
		}
	});
}

// Recommendation
function loadRecommendedItems() {
	activeBtn('recommend-btn');

	// request parameters
	var url = './recommendation' + '?' + 'user_id=' + user_id + '&lat=' + lat
			+ '&lon=' + lng;
	var data = null;

	// display loading message
	showLoadingMessage('Loading recommended items...');

	// make AJAX call
	ajax(
			'GET',
			url,
			data,
			// successful callback
			function(res) {
				var items = JSON.parse(res);
				if (!items || items.length === 0) {
					showWarningMessage('No recommended item. Make sure you have favorites.');
				} else {
					listItems(items);
				}
			},
			// failed callback
			function() {
				showErrorMessage('Cannot load recommended items.');
			});
}

init();