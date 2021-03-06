//  /profile routes
//
//  Also includes /login, /logout, etc.
//

const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const express       = require('express');
const request       = require('request');

const { passwordReset } = require('./auth');

//
//  Three routers:
//      authRouter:     Primary router handling auth-related paths.
//      loginRouter:    Router for logging in and out.
//      profileRouter:  These routes require user to be logged in.

const authRouter = express.Router();
const profileRouter = express.Router();

authRouter.use(bodyParser.urlencoded({ extended: true }));
authRouter.use(bodyParser.json());
authRouter.use(cookieParser());
authRouter.use('/profile', profileRouter);

profileRouter.use(require('../middleware/auth'));


//
//  Login

authRouter.get('/login', (req, res) => {

    // TODO fix login redirect
    // if (req.profile) {
    //     res.redirect('/profile');
    //     return;
    // }

    res.render('profile/login.pug', {
        title: 'HackFSU 5 | Log In'
    });
});

authRouter.post('/login', (req, res, next) => {
    let host = req.app.get('api-host');

    // console.log(req.body.email);
    let email = req.body.email,
        password = req.body.password;

    request.post(host + '/api/user/login',
        { json: { email, password }},
        (err, resp, body) => {

            if (err) {
                console.log(err);
                next(err);
                return;
            }

            // Successful login
            if (resp.statusCode === 200) {
                res.set(resp.headers);
                res.redirect('/profile');
            }

            // Bad login
            else {
                console.log('problem', body);
                req.flash('error', 'Incorrect username or password.');
                res.redirect('/login');
            }
        });

});

authRouter.get('/logout', (req, res) => {
    res.clearCookie('sessionid');
    res.clearCookie('csrftoken');
    res.redirect('/');
});


authRouter.get('/resetpassword', passwordReset.start.GET);
authRouter.post('/resetpassword', passwordReset.start.POST);

authRouter.get('/user/password/reset/:link_key', passwordReset.finish.GET);
authRouter.post('/user/password/reset', passwordReset.finish.POST);


//
// Profile

profileRouter.get('/', (req, res) => {

    let profile = req.profile;
    profile.name = `${profile.first_name} ${profile.last_name}`;
    profile.groups = profile.groups.filter(item => item != 'attendee');

    let hacker = profile.groups.includes('hacker');
    let judge  = profile.groups.includes('judge');
    let mentor = profile.groups.includes('mentor');
    let org    = profile.groups.includes('organizer');
    let acceptance = hacker || judge || mentor || org;

    let status;
    status = acceptance ? 'Accepted' : 'Pending';
    status = profile.rsvp_confirmed ? 'RSVP Confirmed' : status;
    status = profile.checked_in ? 'Checked In': status;
    profile.acceptance = status;

    profile.show_rsvp = (acceptance && !profile.rsvp_confirmed);


    console.log(profile.groups);
    console.log([hacker, judge, mentor, org]);

    res.render('profile/profile.pug', {
        title: `HackFSU 5 | ${profile.name}`,
        profile: profile,
        acceptance: acceptance
    });

});

profileRouter.post('/rsvp', (req, res, next) => {
    let host = req.app.get('api-host');

    req.body['rsvp_answer'] = true;

    req.pipe(request.post(host + '/api/attendee/rsvp', {}, (err, resp) => {
        if (err) {
            console.log(err);
            next(err);
            return;
        }

        if (resp.statusCode == 200) {
            res.redirect('/profile');
        } else {
            res.redirect('/oops');
        }
    }));

});


module.exports = authRouter;
