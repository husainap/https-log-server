console.log('Post Installation started');
console.log('pwd:', process.cwd());
var copyfiles = require('copyfiles');
copyfiles(["package.json", "../../"] , {}, function() {
    console.log('copy completed');
})
console.log('Post Installation ended');
