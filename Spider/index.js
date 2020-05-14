const Scheduler = require("./Scheduler/default");
const Engine = require("./Engine/default");

async function main() {

    var engine = new Engine({
        "scheduler": new Scheduler({
            "limit": 1
        }),
        "parser": null
    });
    //https://i3.mmzztt.com/2020/04/06b01.jpg
    //https://www.mzitu.com/223776
    engine.submit({ url: "https://www.mzitu.com/205668" });
    // engine.submit({ url: "https://www.mzitu.com/8543" });
}
main();