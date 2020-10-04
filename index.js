//Overall Concept:
//Auth Twitch as user
//Get Viewers
//Get Subs
//Compare

/************  ************/
/************  ************/
/********** PREP **********/
/************  ************/
/************  ************/

const Express = require('express');
const BodyParser = require('body-parser');
const Client = require('node-rest-client').Client;
const CookieParser = require('cookie-parser')
const Handlebars = require('express-handlebars');

let rest = new Client();
let app = Express();

// Express Port
const port = 3000;

// Middleware
app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json());
app.use(CookieParser());
app.set('view engine', 'handlebars');

//Sets handlebars configurations (we will go through them later on)
app.engine('handlebars', Handlebars({
layoutsDir: __dirname + '/views/layouts',
defaultLayout: 'notfound',
}));

//Serves static files (we need it to import a css file)
app.use(Express.static('public'))

app.listen(port);

/************  ************/
/******** FUNCTION ********/
/********* THINGS *********/
/************  ************/
/************  ************/

// Get viewers from a Twitch channel
function GetViewers ( channel ) {
  var channel = channel.trim();

  //API URL
  var url = `https://tmi.twitch.tv/group/user/${channel}/chatters`;

  return new Promise(function(resolve, reject) {
    // Send request
    var req = rest.get(url, function (data, response) {
        // Parsed response body as json object
        resolve(data.chatters);
    });

    // Handling specific errors
    req.on('error', function (err) {
        console.error('CheckTwitch Error.', err.request.options);
        reject (err.request.options);
    });
  });
}

// Accepts a JSON object and returns an array
// of all the values without the keys.
function GetJSONValues (obj) {
  var values = [];

  // Get all our object's keys
  var keys = Object.keys(obj);

  //Iterate through the object and concat any non-zero-length values
  for (const [key, value] of Object.entries(obj)) {
    if(Array.isArray(value)
    && value.length > 0) {
      values = values.concat(value);
    }
  }
  return values;
}

async function GetCurrentViewers( channel ) {
  var viewerObject = await GetViewers(channel);
  var viewers = GetJSONValues(viewerObject);
  return viewers;
}

// Get subscribers for a user
async function GetSubs (token, channel) {
  var channel = channel.trim();
  var url = "subscriptions";
  var data = {'broadcaster_id': channel};
  var subdata = await CallApi(token, url, data);
  var subs = subdata.data;
  var subarray = [];

  subs.forEach((subscriber) => {
    subarray.push(subscriber.user_name.toLowerCase());
  });

  return new Promise((resolve, reject) => {
    resolve (subarray);
  });
}

// Get the user name and user id for the authenticated user
async function GetUser (token) {
  var url = "users";
  var channel = await CallApi(token, url);
  var {id, login} = channel.data[0];
  return new Promise((resolve, reject) => {
    resolve ({'id':id, 'login':login});
  });
}

async function CallApi (token, endpoint, params = {}, key = false, page = false) {
  //Check for cursor
  if (page != false) {
    params.after = page;
  }
  
  //API URL
  var url = `https://api.twitch.tv/helix/${endpoint}`;

  // Set content-type header and data as json in args parameter
  var args = {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Client-ID": process.env.APP_CLIENT_ID
      },
      parameters: params
  };

  return new Promise((resolve, reject) => {
    // Send request
    var req = rest.get(url, args, async (data, response) => {
        // Parsed response body as json object

        // Handle pagination
        if(data.hasOwnProperty('pagination') && data.pagination.hasOwnProperty('cursor')) {
          var cursor = data.pagination.cursor;
          var next = await CallApi (token, endpoint, params, key, cursor);
          data.data = data.data.concat(next.data);
        }

        resolve(data);
    });

    // Handling specific errors
    req.on('error', (err) => {
        console.error('API Error.', err.request.options);
        reject (err.request.options);
    });
  });
}

/************  ************/
/************  ************/
/********* EXPRESS ********/
/************  ************/
/************  ************/

// Default route
app.get("/", async (req, res) => {

  // If we don't have a twitch access token cookie
  // send the user to authenticate with twitch.
  if (!req.cookies.access_token_twitch) {
    res.redirect("/twitch/auth");
  } else {
    var token = req.cookies.access_token_twitch;

    // This is really bad practice, but I'm kind of lazy right now.
    // If we encounter an error- assume it's because our token has
    // expired and we need to re-authenticate.
    // This doesn't handle any ACTUAL errors though, hence bring 
    // bad practice.
    try {
      // Get the authenticated user's details 
      var user = await GetUser(token);

      // Get the authenticated user's viewers
      var viewers = await GetCurrentViewers(user.login);

      // Get the authenticated user's subs 
      var subs = await GetSubs(token, user.id);

      // Get viewers who are also subs via array intersection
      var activesubs = viewers.filter(value => subs.includes(value));

      // Serves the body of the page ("main.handlebars")
      // to the container ("index.handlebars")
      res.render(
        'main', 
        {
          'layout' : 'index', 
          'channel': user.login, 
          'viewers': viewers, 
          'subs': subs, 
          'activesubs': activesubs
        }
      );
    } catch (err) {
      res.redirect("/twitch/auth");
    }
  }
});

// Twitch Auth //

// Config details
const keys = {
    twitch: {
        redirect_uri: `${process.env.APP_URL}/twitch/callback`,
        client_id: process.env.APP_CLIENT_ID,
        client_secret: process.env.APP_OAUTH_SECRET
    }
};

// OAuth Step 1
const authTwitch = ({ redirect_uri, client_id }) => (_, res) => res.redirect(`https://id.twitch.tv/oauth2/authorize?redirect_uri=${ redirect_uri }&client_id=${ client_id }&response_type=code&scope=channel:read:subscriptions user:read:email`)

// OAuth Step 2
const authTwitchCallback = ({ redirect_uri, client_id, client_secret }) => (req, res) => {

  const { code } = req.query

  const url = 'https://id.twitch.tv/oauth2/token';

  // set content-type header and data as json in args parameter
  var args = {
      data: { 
          grant_type: 'authorization_code',
          client_id,
          redirect_uri,
          client_secret,
          code
       },
      headers: { "Content-Type": "application/json" }
  };
  
  rest.post(url, args, function (data, response) {
      // parsed response body as js object
      res.append('Set-Cookie', `access_token_twitch=${ data.access_token }; Path=/;`)
      .redirect('/');
  });
}

// Tell Express to handle the OAuth pages.
app
    .get('/twitch/auth', authTwitch(keys.twitch))
    .get('/twitch/callback', authTwitchCallback(keys.twitch));