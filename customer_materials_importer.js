const csv = require('csv-parser')
const path = require('path');
const fs = require('fs')
const file = 'customer_materials.csv';
const results = [];
const serverCa = [fs.readFileSync("BaltimoreCyberTrustRoot.crt.pem", "utf8")];
DBdata = {};
customers = [];
materials = [];


//=================DB Connection==========================
const mysql = require('mysql');
const { exit } = require('process');
const c = require('config');
const connection = mysql.createConnection({
    // host: 'localhost',
    // user: 'root',
    // password: 'root',
    // database: 'testdb'
    host: 'mysqlserverdb-qfitestvm2.mysql.database.azure.com',
    user: 'mysqldbadmin@mysqlserverdb-qfitestvm2',
    password: 'Mysql@dmin**362',
    database: 'ordersmart',
    PORT: 3306,
    ssl: {
        rejectUnauthorized: true,
        ca: serverCa
    }
});
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to DB!');
});
//============================================================
queryPromise1 = () => {
    return new Promise((resolve, reject) => {
        connection.query('select mapping_material_id from materials', (error, results) => {
            if (error) {
                return reject(error);
            }
            return resolve(results);
        });
    });
};

queryPromise2 = () => {
    return new Promise((resolve, reject) => {
        connection.query('select mapping_customer_id from customer', (error, results) => {
            if (error) {
                return reject(error);
            }
            // console.log(results)
            return resolve(results);
        });
    });
};

async function insertCustomerMaterials() {

    const promise1 = queryPromise1();
    const promise2 = queryPromise2();

    const promises = [promise1, promise2];

    try {
        console.log('before response',promises);
        const result = await Promise.all(promises);
        console.log(promises)
        console.log('Helllo')
        for (let i = 0; i < Object.keys(result[0]).length; i++) {
            materials.push(result[0][i].mapping_material_id)
        }
        for (let i = 0; i < Object.keys(result[1]).length; i++) {
            customers.push(result[1][i].mapping_customer_id)
        }
        // console.log(materials)
        switch (path.extname(file)) {
            case '.csv':
                console.log("entering switch case")
                //===============Inserting CSV values to DB===================
                fs.createReadStream(file)
                    .pipe(csv())
                    .on('data', (data) => {
                        if (Object.keys(data).length != 4 ||(!Number(data.material_id) && !Number(data.customer_id) && !Number(data.price_per_unit)) || !materials.includes(Number(data.material_id))) { //stop parsing if there are any missing values in csv
                            stopParsing();
                        }
                        else {
                            
                            results.push([data.available, parseInt(data.material_id), parseInt(data.customer_id), parseInt(data.price_per_unit)])
                        }
                    })
                    .on('end', () => {
                        
                         console.log(' All good to insert!')
                        // insertRows(results);
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




    } catch (error) {
        console.log(error)
    }
}
insertCustomerMaterials();

// main()


function insertRows(arr) {
    let sql = "INSERT INTO customer_materials(available,material_id,customer_id,price_per_unit) VALUES ?";
    connection.query(sql, [arr]);
    console.log('Inserted rows')
    
}

function stopParsing() {
    console.log(" Program terminated due to error while parsing");
    exit();
}
