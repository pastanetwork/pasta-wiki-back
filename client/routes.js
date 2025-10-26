const { Router } = require("express");
const path = require("path");
const express = require("express");

const {checkJWT, verifPerm} = require("../express_utils/utils")
const User = require("../api/users/User")

const router = Router();

router.get("/", async (req, res) => {
	return res.redirect(302, '/connect');
});

const default_ip = "Internal"

router.use('/favicon.ico', express.static(path.join(__dirname, 'public/pasta_logo.svg')));

///// Connexion /////

router.get("/connect", async (req, res) => {
	const hasValidJWT = checkJWT(req.cookies.authToken);
    const ip = req.headers["x-forwarded-for"] || default_ip;
    if (ip === hasValidJWT.user.ip && hasValidJWT.user.verified_2fa){
        return res.redirect(302, '/dashboard');
    }

	if (hasValidJWT.ok){
        if (ip !== hasValidJWT.user.ip && hasValidJWT.user.verified_2fa){
            const user = new User(hasValidJWT.user);
            user.verified_2fa=false;
            user.ip=ip;
            const token = user.generateJWT();
            res.cookie('authToken', token, {
                httpOnly: true,
                secure : true,
                sameSite : 'strict',
                maxAge : 14 * 24 * 60 * 60 * 1000
            });
            return res.redirect(302, '/connect?require2fa=true');
        }
	}
	return res.sendFile('connect/connect.html', {root: __dirname});
});
router.use('/connect', express.static(path.join(__dirname, 'connect')));

///// Other routes : /////

const categories = [
  { name: 'dashboard', perm: 1 },
  { name: 'administration', perm: 2 },
  { name: 'public', perm: 0 },
  //{ name: 'test', perm: 0 }
];

const handleCategoryAuth = (category) => {
  return async (req, res, next) => {
    if (category.perm !== 0) {
      const ip = req.headers["x-forwarded-for"] || default_ip;
      const token_cookie = req.cookies.authToken;
      
      const hasPermission = await verifPerm(token_cookie, category.perm);
      if (!hasPermission) {
        return res.status(403).sendFile('403.html', {root: __dirname});
      }
      
      const checkedJWT = checkJWT(token_cookie);
      if (ip != checkedJWT.user.ip || !checkedJWT.user.verified_2fa){
        return res.redirect(301, '/connect');
      }
    }
    next();
  };
};

categories.forEach(category => {
  router.use(`/${category.name}`, handleCategoryAuth(category));
  router.use(`/${category.name}`, express.static(path.join(__dirname, category.name)));
});

router.use("/:routePath", (req, res) => {
  return res.status(404).sendFile('404.html', {root: __dirname});
});

module.exports = router;