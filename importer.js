const csv = require('csv-parser')
const path = require('path');
const fs = require('fs')
const file = 'materials.csv';
const results = [];

//=================DB Connection==========================
const mysql = require('mysql');
const { exit } = require('process');
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
        fs.createReadStream(file)
            .pipe(csv())
            .on('data', (data) => {
                if (Object.keys(data).length != 6) { //stop parsing if there are any missing values in csv
                    stopParsing();
                }
                else {
                    if (!Number(data.mapping_material_id)) { //stop parsing if mapping material id is not an Integer
                        stopParsing();
                    }
                    else {//push the line items in an array format
                        results.push([data.material_description, data.brand, data.category, data.pack_size, data.pack_type, parseInt(data.mapping_material_id)])
                    }
                }
            })
            .on('end', () => {
                    insertRows(results);
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
            for (let i in materials) {
                // console.log(i)
                if (!materials[i].mapping_material_id) {//check if any mandatory fields are missing
                    stopParsing();
                }
                else {
                    if (!Number(data.mapping_material_id)) {// check if mapping material id is Integer
                        stopParsing();
                    }
                    else {//push the json object properties in an array format
                        results.push([materials[i].material_description, materials[i].brand, materials[i].category, materials[i].pack_size, materials[i].pack_type, parseInt(materials[i].mapping_material_id)])
                    }
                }
            }
            insertRows(results);
            
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
    console.log('Inserted rows')
}

function stopParsing(){
    console.log(" Program terminated due to error while parsing");
    exit();
}
