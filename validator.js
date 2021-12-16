const csv = require('csv-parser')
const path = require('path');
const fs = require('fs')
const file = 'material_data_final.csv';
const results = [];


switch (path.extname(file)) {
        case '.csv':
            //===============Checking CSV Data===================
            let rowCount = 2;
            let missingValue = false;
            fs.createReadStream(file)
                .pipe(csv())
                .on('data', (data) => {
                    if (Object.keys(data).length != 6) { //check if there are any missing values in csv
                        console.log('Missing important values at line ', rowCount, ' of CSV')
                        rowCount++;
                        console.log(data)
                        missingValue = true;
                    }
                    if (!Number(data.mapping_material_id)) { //check if mapping material id is Integer
                        console.log('Invalid mapping material ID on line ', rowCount, " of CSV")
                        rowCount++;
                        missingValue = true;
                    }
                    console.log(data.mapping_material_id)
                })
                .on('end', () => {
                    if (!missingValue) {
                        console.log("File is ready to be inserted to DB")
                        
                    }
                    else {
                        console.log("File is corrupt")
                    }
                })
            // ============================================================
            break;

        case '.json':
            //====================Checking JSON Data==========================
            console.log('hello json')
            fs.readFile(file, function (err, data) {
                // Check for errors
                if (err) throw err;

                // Converting to JSON
                const materials = JSON.parse(data);
                let missingValue = false;
                for (let i in materials) {
                    if (!materials[i].material_description || !materials[i].mapping_material_id) {//check if any mandatory fields are missing
                        console.log('Missing important key values')
                        missingValue = true;
                    }
                    if (!Number(data.mapping_material_id)) {// check if mapping material id is Integer
                        console.log("Invalid mapping material ID")
                        missingValue = true;
                    }
                }
                if (!missingValue) {
                    console.log("File is ready to be inserted to DB")
                    
                }
                else {
                    console.log("File is corrupt")
                }
            })
            //=====================================
            break;

        default:
            console.log('File extension not supported! Please provide data in .csv or .json format');
            break;
    }
