var tree = {
    "title": "图书广",
    "childs": [
        {
            "title": "书1",
            "childs": [
                {
                    "title": "第一章",
                    "childs": [
                        {
                            "title": "1.mp4",
                            "childs": [
                                { "title": "1_1.ts" },
                                { "title": "1_2.ts" },
                                { "title": "1_3.ts" },
                                { "title": "1_4.ts" },
                            ]
                        },
                        {
                            "title": "2.mp4",
                            "childs": [
                                { "title": "2_1.ts" },
                                { "title": "2_2.ts" },
                                { "title": "2_3.ts" },
                                { "title": "2_4.ts" },
                            ]
                        },
                        {
                            "title": "3.mp4",
                            "childs": [
                                { "title": "3_1.ts" },
                                { "title": "3_2.ts" },
                                { "title": "3_3.ts" },
                                { "title": "3_4.ts" },
                            ]
                        }
                    ]
                },
                {
                    "title": "第二章",
                    "childs": [
                        {
                            "title": "21.mp4",
                            "childs": [
                                { "title": "21_1.ts" },
                                { "title": "21_2.ts" },
                                { "title": "21_3.ts" },
                                { "title": "21_4.ts" },
                            ]
                        },
                        {
                            "title": "22.mp4",
                            "childs": [
                                { "title": "22_1.ts" },
                                { "title": "22_2.ts" },
                                { "title": "22_3.ts" },
                                { "title": "22_4.ts" },
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "title": "书2",
            "childs": [
                {
                    "title": "第一章",
                    "childs": [
                        {
                            "title": "1.mp4",
                            "childs": [
                                { "title": "1_1.ts" },
                                { "title": "1_2.ts" },
                                { "title": "1_3.ts" },
                                { "title": "1_4.ts" },
                            ]
                        },
                        {
                            "title": "2.mp4",
                            "childs": [
                                { "title": "2_1.ts" },
                                { "title": "2_2.ts" },
                                { "title": "2_3.ts" },
                                { "title": "2_4.ts" },
                            ]
                        },
                        {
                            "title": "3.mp4",
                            "childs": [
                                { "title": "3_1.ts" },
                                { "title": "3_2.ts" },
                                { "title": "3_3.ts" },
                                { "title": "3_4.ts" },
                            ]
                        }
                    ]
                },
                {
                    "title": "第二章",
                    "childs": [
                        {
                            "title": "21.mp4",
                            "childs": [
                                { "title": "21_1.ts" },
                                { "title": "21_2.ts" },
                                { "title": "21_3.ts" },
                                { "title": "21_4.ts" },
                            ]
                        },
                        {
                            "title": "22.mp4",
                            "childs": [
                                { "title": "22_1.ts" },
                                { "title": "22_2.ts" },
                                { "title": "22_3.ts" },
                                { "title": "22_4.ts" },
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}

function download(node, fun) {

    if (node.childs && (!node.childs[0].childs)) {

        setTimeout(function () {
            //console.log(node.title, "-");
            console.log(node.childs)
            fun();
        }, 1000)
        return;
    }

    var next = (function (length) {
        var index = 0;
        return function () {
            if (index + 1 < length) {
                index++;
            } else {
                console.log(node.title, "----");
                fun();
            }
        }
    })(node.childs.length)

    for (let i = 0; i < node.childs.length; i++) {
        download(node.childs[i], next);
    }

}
/*
download(tree, function () {
    console.log("finished")
});*/




