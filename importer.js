const csv = require('csv-parser')
const path = require('path');
const fs = require('fs')
const file = 'material_data_final.csv';
const results = [];
const validate=require('./validator')

//=================DB Connection==========================
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'testdb'
});
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to DB!');
});
//============================================================

switch (path.extname(file)) {
    case '.csv':
        //===============Inserting CSV values to DB===================
        let rowCount = 2;
        let missingValue = false;
        fs.createReadStream(file)
            .pipe(csv())
            .on('data', (data) => {
                if (Object.keys(data).length != 6) { //check if there are any missing values in csv
                    missingValue = true;
                }
                else {
                    if (!Number(data.mapping_material_id)) { //check if mapping material id is Integer
                        console.log('Invalid mapping material ID of CSV');
                        missingValue = true;
                    }
                    else {
                        results.push([data.material_description, data.brand, data.category, data.pack_size, data.pack_type, parseInt(data.mapping_material_id)])
                    }
                }
            })
            .on('end', () => {
                if (!missingValue) {
                    insertRows(results);
                    console.log('Inserted rows')
                }
            })
        // ============================================================
        break;

    case '.json':
        //====================JSON TO DB ==========================

        fs.readFile(file, function (err, data) {
            // Check for errors
            if (err) throw err;

            // Converting to JSON
            const materials = JSON.parse(data);
            let missingValue = false;
            for (let i in materials) {
                // console.log(i)
                if (!materials[i].material_description || !materials[i].mapping_material_id) {//check if any mandatory fields are missing
                    console.log('Missing important key values')
                }
                else {
                    if (!Number(data.mapping_material_id)) {// check if mapping material id is Integer
                        console.log("Invalid mapping material ID")
                        missingValue = true;
                    }
                    else {
                        results.push([materials[i].material_description, materials[i].brand, materials[i].category, materials[i].pack_size, materials[i].pack_type, parseInt(materials[i].mapping_material_id)])
                    }
                }
            }
            if (!missingValue) {
                insertRows(results);
                console.log('Done');
            }
        })
        //=====================================
        break;


    default:
        console.log('File extension not supported! Please provide data in .csv or .json format');
        break;
}

function insertRows(arr) {
    let sql = "INSERT INTO materials ( material_description,brand,category,pack_size,pack_type,mapping_material_id) VALUES ?";
    connection.query(sql, [arr]);
}
