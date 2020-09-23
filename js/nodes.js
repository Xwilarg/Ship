function toSentenceCase(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1, str.length)
}

let allIds = {};
let arrNodes = [];
let arrEdges = [];

let allJsons = {};
let crossoverJson;

let i = 0;

function createNodes(text) {
    let json = JSON.parse(text);

    let name = json.name;
    let color = json.color;

    // Add all characters to id list (+ draw nodes)
    for (key in json.ships) {
        arrNodes.push({ id: i, label: toSentenceCase(key), color: color });
        allIds[name + "_" + key] = i;
        i++;
    }

    for (key in json.ships) {
        for (key2 in json.ships[key]) {
            if (allIds[name + "_" + key2] === undefined) {
                arrNodes.push({ id: i, label: toSentenceCase(key2), color: color });
                allIds[name + "_" + key2] = i;
                i++;
            }
        }
    }

    // Draw edges
    for (key in json.ships) {
        for (key2 in json.ships[key]) {
            arrEdges.push({from: allIds[name + "_" + key], to: allIds[name + "_" + key2], width: 4, selectionWidth: 6});
        }
    }

    allJsons[name] = json;

    createNetwork();
}

function createCrossoverNodes(text) {
    let json = JSON.parse(text);

    for (key in json.ships) {
        for (key2 in json.ships[key]) {
            arrEdges.push({from: allIds[key], to: allIds[key2]});
        }
    }

    crossoverJson = json;

    createNetwork();
}

function createNetwork() {
    let nodes = new vis.DataSet(arrNodes);

    let edges = new vis.DataSet(arrEdges);

    let container = document.getElementById("nodes");
    let data = {
        nodes: nodes,
        edges: edges
    };

    let options = {
        clickToUse: true
    };

    let network = new vis.Network(container, data, options);

    network.on("selectNode", function(node) {
        let id = Object.keys(allIds).find(key => allIds[key] === node.nodes[0]);
        let allElems = {};
        let localJson = allJsons[id.split('_')[0]];
        for (key in localJson.ships) {
            for (key2 in localJson.ships[key]) {
                if (localJson.name + "_" + key2 == id) {
                    if (allElems[key] === undefined) {
                        allElems[key] = [];
                    }
                    localJson.ships[key][key2].forEach(e => {
                        allElems[key].push({link: e.link, linkType: e.linkType, imageId: e.imageId});
                    });
                }
            }
            if (localJson.name + "_" + key == id) {
                for (key2 in localJson.ships[key]) {
                    if (allElems[key2] === undefined) {
                        allElems[key2] = [];
                    }
                    localJson.ships[key][key2].forEach(e => {
                        allElems[key2].push({link: e.link, linkType: e.linkType, imageId: e.imageId});
                    });
                }
            }
        }

        for (key in crossoverJson.ships) {
            for (key2 in crossoverJson.ships[key]) {
                if (key2 == id) {
                    if (allElems[key] === undefined) {
                        allElems[key] = [];
                    }
                    crossoverJson.ships[key][key2].forEach(e => {
                        allElems[key].push({link: e.link, linkType: e.linkType, imageId: e.imageId});
                    });
                }
            }
            if (key == id) {
                for (key2 in crossoverJson.ships[key]) {
                    if (allElems[key2] === undefined) {
                        allElems[key2] = [];
                    }
                    crossoverJson.ships[key][key2].forEach(e => {
                        allElems[key2].push({link: e.link, linkType: e.linkType, imageId: e.imageId});
                    });
                }
            }
        }

        let str = "";
        for (key in allElems) {
            if (key.includes("_"))
            {
                let s = key.split("_");
                str = "(" + toSentenceCase(s[0]) + ") " + toSentenceCase(s[1]) + ":<br/>";
            }
            else
                str += toSentenceCase(key) + ":<br/>";
            allElems[key].forEach(e => {
                switch (e.linkType) {
                    case "pixiv": // Code from https://source.pixiv.net/source/embed.js
                        str += '<a href="' + e.link + '" target="_blank"><iframe src="https://embed.pixiv.net/embed_mk2.php?id=' + /artworks\/([0-9]+)/.exec(e.link)[1] + '&size=medium&border=off" width="360" height="165" frameborder="0" style="vertical-align:middle; border:none;"></iframe></a>'
                        break;

                    case "nhentai":
                        str += '<a href="' + e.link + '" target="_blank"><img src="https://i.nhentai.net/galleries/' + e.imageId + '/1.jpg"/></a>';
                        break;

                    case "twitter":
                        str += '<a href="' + e.link + '" target="_blank"><img src="https://pbs.twimg.com/media/' + e.imageId + '?format=jpg&name=small"/></a>';
                        break;

                    case "gelbooru":
                        str += '<a href="' + e.link + '" target="_blank"><img src="https://img2.gelbooru.com/images/' + e.imageId + '"/></a>';
                        break;

                    default:
                        console.error("Unknown link type: " + e.linkType);
                        str += '<a href="' + e.link + '" target="_blank">' + e.link + '</a>';
                        break;
                }
                str += "<br/>";
            });
            str += "<br/>"
        }
        document.getElementById("infos").innerHTML = str;
    });
}

let toRequest = [
    "kancolle", "azurlane", "arknights"
];

toRequest.forEach(e => {
    let http = new XMLHttpRequest();
    http.open("GET", "https://raw.githubusercontent.com/Xwilarg/Ship_data/master/" + e + ".json", false);
    http.onreadystatechange = function ()
    {
        if (this.readyState === 4 && this.status === 200) {
            createNodes(this.responseText);
        }
    };
    http.send(null);
});

http = new XMLHttpRequest();
http.open("GET", "https://raw.githubusercontent.com/Xwilarg/Ship_data/master/crossover.json", false);
http.onreadystatechange = function ()
{
    if (this.readyState === 4 && this.status === 200) {
        createCrossoverNodes(this.responseText);
    }
};
http.send(null);