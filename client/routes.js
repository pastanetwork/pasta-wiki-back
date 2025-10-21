const { Router } = require("express");
const path = require("path");
const express = require("express");
const fs = require('fs');

const {checkJWT, verifPerm} = require("../express_utils/utils")

const router = Router();

router.get("/", async (req, res) => {
	res.redirect(302, '/connect');
});

router.use('/favicon.ico', express.static(path.join(__dirname, 'public/pasta_logo.svg')));

///// Connexion /////
router.get("/connect", async (req, res) => {
	const hasValidJWT = checkJWT(req.cookies.authToken);
	if (hasValidJWT.ok){
		res.redirect(302, '/dashboard/');
	}
	res.sendFile('connect/connect.html', {root: __dirname});
});
router.use('/connect', express.static(path.join(__dirname, 'connect')));

///// Other routes : /////

const categories = [
    { name: 'dashboard', perm: 1 },
    { name: 'administration', perm: 2 },
    { name: 'public', perm: 0 },
    { name: 'test', perm: 0 }
];

const handleStaticRoute = (category) => {
    return async (req, res, next) => {
        if (category.perm !== 0) {
            const hasPermission = await verifPerm(req.cookies.authToken, category.perm);
            if (!hasPermission) {
                return res.status(403).sendFile('403.html', {root: __dirname});
            }
        }
        
        const routePath = req.params.routePath || '';
        if (routePath.includes('..') || routePath.includes('\\')) {
            return res.status(404).sendFile('404.html', {root: __dirname});
        }
        
        const folderPath = path.join(__dirname, category.name, routePath);
        const categoryBase = path.join(__dirname, category.name);
        if (!folderPath.startsWith(categoryBase)) {
            return res.status(403).sendFile('403.html', {root: __dirname});
        }
        
        if (fs.existsSync(folderPath)) {
            const stats = fs.statSync(folderPath);
            if (stats.isDirectory()) {
                const indexPath = path.join(folderPath, 'index.html');
                if (fs.existsSync(indexPath)) {
                    return res.sendFile(indexPath);
                }
            } else if (stats.isFile()) {
                return res.sendFile(folderPath);
            }
        }
        
        req.url = '/' + routePath;
        const staticMiddleware = express.static(categoryBase);
        staticMiddleware(req, res, (err) => {
            if (err) {
                return next(err);
            }
            res.status(404).sendFile('404.html', {root: __dirname});
        });
    };
};

categories.forEach(category => {
    router.get(`/${category.name}`, handleStaticRoute(category));
    router.use(`/${category.name}/:routePath`, handleStaticRoute(category));
});

router.use("/:routePath",(req,res)=>{
        res.status(404).sendFile('404.html', {root: __dirname});
    });
module.exports = router;