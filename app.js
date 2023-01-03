const express = require('express');
const app = express();
const mysql = require('mysql');
const crypto = require("crypto")

app.listen(3000, () => {
    console.log("Server running in port : 3000");
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "aescrypto"
});

const algorithm = 'aes-256-cbc';
const key = "ujicobaencryptaesadipratamaputra";

app.get('/', (req, res) => {
    let sql = "SELECT * FROM pesan";
    const dataPesan = [];
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        for (let i = 0; i < results.length; i++) {
            const origionalData = Buffer.from(results[i].iv, 'base64') 
            const decipher = crypto.createDecipheriv(algorithm, key, origionalData);
            let decryptedData = decipher.update(results[i].data, "hex", "utf-8");
            decryptedData += decipher.final("utf8");
            dataPesan.push(decryptedData);
        }
        res.render('index.ejs', {
            listPesan: dataPesan,
            listEncrypt: results
        });
    });
});

app.post('/encrypt', (req, res) => {
    let pesan = req.body.originaltext;

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedData = cipher.update(pesan, "utf-8", "hex");
    console.log(encryptedData);
    encryptedData += cipher.final("hex");
    console.log(encryptedData);

    const base64data = Buffer.from(iv, 'binary').toString('base64');

    var query = `INSERT INTO pesan (id, iv, data) VALUES ("", "${base64data}", "${encryptedData}")`;
    conn.query(query, function (error, data) {
        res.redirect('/');
    });
});