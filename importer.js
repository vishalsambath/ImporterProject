const csv = require('csv-parser')
const path = require('path');
const fs = require('fs')
const file = 'material_data_final.csv';
const results = [];

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
        //===============Inserting CSV values to DB===============
        fs.createReadStream(file)
            .pipe(csv())
            .on('data', (data) => {
                results.push([data.material_description, data.brand, data.category, data.pack_size, data.pack_type, parseInt(data.mapping_material_id)])
            })
            .on('end', () => {
                insertRows(results);
                console.log('Inserted rows')
            })
        // ========================================================
        break;

    case '.json':
        //====================JSON TO DB ==========================

        fs.readFile(file, function (err, data) {
            // Check for errors
            if (err) throw err;

            // Converting to JSON obj
            const materials = JSON.parse(data);
            for (let i in materials) {
                results.push([materials[i].material_description, materials[i].brand, materials[i].category, materials[i].pack_size, materials[i].pack_type, parseInt(materials[i].mapping_material_id)])
            }
            insertRows(results);
            console.log('Inserted Rows');
        })
        //========================================================
        break;
    default:
        console.log('File extension not supported! Please provide data in .csv or .json format');
        break;
}

function insertRows(arr) {
    let sql = "INSERT INTO materials ( material_description,brand,category,pack_size,pack_type,mapping_material_id) VALUES ?";
    connection.query(sql, [arr]);
}

// const arr = [

//     {
//         material_description: "16Z CN 24LS_AHA BLUBRY POM",
//         brand: "AHA-KO",
//         category: "PACKAGED WATER (PLAIN & ENRICHED)",
//         pack_size: "16 OZ",
//         pack_type: "Aluminum Can",
//         mapping_material_id: 657
//     }

// ]
// const arr1 = [
//     ["16Z CN 24LS_AHA BLUBRY POM", "AHA-KO", "PACKAGED WATER (PLAIN & ENRICHED)", "16 OZ", "Aluminum Can", 657],
//     ["16Z CN 24LS_AHA BLUBRY POM", "AHA-KO", "PACKAGED WATER (PLAIN & ENRICHED)", "16 OZ", "Aluminum Can", 657]
// ]

// const createReader = fs.createReadStream('materials.json');

// createReader.on('data', (data) => {
//     let i=0;
//     const materials = JSON.parse(data);
//     for(let i in materials)
//     {
//         console.log(i)
//         results2.push([materials[i].material_description,materials[i].brand,materials[i].category,materials[i].pack_size,materials[i].pack_type,materials[i].mapping_material_id])
//     }
//     console.log(results2)

// });