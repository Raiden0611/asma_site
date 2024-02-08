const mysql = require('mysql');
require('dotenv').config();

const conn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PWD,
    database: process.env.MYSQL_DB,
});

conn.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        throw err;
    }
    console.log('Connecté à la base de données MySQL');
});

async function getRanking() {

    conn.query('SELECT * FROM team', (err, result) => {
        if (err) throw err;
        console.log(result);
    });

    for (let i = 0; i < equipeData.length; i++) {
        const sql = `INSERT INTO team (name, match_type) VALUES ('${equipeData[i].name}', ${championnat})`;
        conn.query(sql, (err, result) => {
            if (err) throw err;
            console.log(`Valeur insérée : ${equipeData[i].name}`);

        });
    }
    conn.end();
}

getRanking();
