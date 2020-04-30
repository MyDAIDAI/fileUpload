const fs = require('fs')
const path = "/Users/dengpan/Code/My/fileUpload/client/target/课时 17 ： 1.eventloop.vep"
fs.createWriteStream(path)
let isExist = fs.existsSync(path)
console.log('isExist', isExist)
