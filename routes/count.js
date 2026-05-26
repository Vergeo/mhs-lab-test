var express = require("express");
var mysql = require("mysql2/promise.js");
require("dotenv").config();

var router = express.Router();

var mySqlUrl = process.env.MYSQL_URL;
if (!mySqlUrl) {
	console.error("MySQL URL doesn't exist!");
	process.exit(1);
}

var pool = mysql.createPool(mySqlUrl);
var dbReady = initDB();

dbReady.catch((error) => {
	console.error(`ERROR: ${error}`);
	process.exit(1);
});

router.get("/count", async (req, res, next) => {
	try {
		await dbReady;
		var rows = await pool.query("SELECT value FROM counter WHERE id = 1;");
		var data = rows[0];
		var value = data.length ? data[0].value : 0;
		res.json({ value: value });
	} catch (err) {
		next(err);
	}
});

router.post("/increase", async () => {
	try {
		await dbReady;
		await pool.query("UPDATE counter SET value = value + 1 WHERE id = 1;");
		var rows = await pool.query("SELECT value FROM counter WHERE id = 1;");
		var data = rows[0];
		var value = data.length ? data[0].value : 0;
		res.json({ value: value });
	} catch (err) {
		next(err);
	}
});

const initDB = async () => {
	await pool.query("CREATE TABLE IF NOT EXIST counter (id INT PRIMARY KEY, value INT NOT NULL);");
	await pool.query("INSERT INTO counter (id, value) VALUES (1, 0) ON DUPLICATE KEY;");
};

module.exports = router;
