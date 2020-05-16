const print = console.log;

function exit() {
    console.log("bye!!");
    process.exit(0);
}

module.exports = {
    print,
    exit
}