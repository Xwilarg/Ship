function toSentenceCase(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1, str.length)
}

function createNodes(text) {
    var json = JSON.parse(text);

    let allIds = {};
    let arrNodes = [];
    let arrEdges = [];

    let color = json.color;

    let i = 0;

    // Add all characters to id list (+ draw nodes)
    for (key in json.ships) {
        arrNodes.push({ id: i, label: toSentenceCase(key), color: color });
        allIds[key] = i;
        i++;
    }

    for (key in json.ships) {
        for (key2 in json.ships[key]) {
            if (allIds[key2] === undefined) {
                arrNodes.push({ id: i, label: toSentenceCase(key2), color: color });
                allIds[key2] = i;
                i++;
            }
        }
    }

    // Draw edges
    for (key in json.ships) {
        for (key2 in json.ships[key]) {
            arrEdges.push({from: allIds[key], to: allIds[key2]});
        }
    }

    // Draw network map
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
        for (key in json.ships) {
            for (key2 in json.ships[key]) {
                if (key2 == id) {
                    if (allElems[key] === undefined) {
                        allElems[key] = [];
                    }
                    json.ships[key][key2].forEach(e => {
                        allElems[key].push({link: e.link});
                    });
                }
            }
            if (key == id) {
                for (key2 in json.ships[key]) {
                    if (allElems[key] === undefined) {
                        allElems[key] = [];
                    }
                    json.ships[key][key2].forEach(e => {
                        allElems[key].push({link: e.link});
                    });
                }
            }
        }
        let str = "";
        console.log(allElems);
        for (key in allElems) {
            str += toSentenceCase(key) + ":<br/>";
            allElems[key].forEach(e => {
                str += '<a href="' + e.link + '" target="_blank">' + e.link + '</a><br/>';
            });
            str += "<br/>"
        }
        document.getElementById("infos").innerHTML = str;
    });
}

let http = new XMLHttpRequest();
http.open("GET", "https://raw.githubusercontent.com/Xwilarg/Ship/master/data/kancolle.json", false);
http.onreadystatechange = function ()
{
    if (this.readyState === 4 && this.status === 200) {
        createNodes(this.responseText);
    }
};
http.send(null);