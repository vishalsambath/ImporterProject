// const ObjectsToCsv = require('objects-to-csv')

list=[[1,1,1,1],
[2,2,2,2]]
result=[]
rowCount=1;
function randomize(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
  }

for(let i=1;i<=2000;i++)
{
    for(let j=1;j<=500;j++)
    {
        result.push([,i,j,randomize(30,40)])
    }
}


// const csv = new ObjectsToCsv(result)

// csv.toDisk('./list.csv', { append: true })
const fastcsv = require('fast-csv');
const fs = require('fs');
const ws = fs.createWriteStream("customer_materials.csv");
fastcsv
  .write(result)
  .pipe(ws);