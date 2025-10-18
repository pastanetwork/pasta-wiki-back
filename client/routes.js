const { Router } = require("express");
const path = require("path");
const express = require("express");
const fs = require('fs').promises;

const router = Router();

//Connexion
router.get("/connect", async (req, res) => {
  res.sendFile('connect/connect.html', {root: __dirname});
});
router.use('/connect', express.static(path.join(__dirname, 'connect')));

//Dashboard panel
router.use("/:routePath", (req, res, next) => {
  const routePath = req.params.routePath;
  
  if (routePath.includes('..') || routePath.includes('/') || routePath.includes('\\')) {
    return res.status(400).send('Invalid path');
  }
  
  const folderPath = path.join(__dirname, routePath);
  
  if (!folderPath.startsWith(__dirname)) {
    return res.status(403).send('Forbidden');
  }
  
  express.static(folderPath)(req, res, next);
});

module.exports = router;