function toSentenceCase(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1, str.length)
}

let token = new URL(window.location.href).searchParams.get("token");
let rawUrl = location.protocol + '//' + location.host + location.pathname;

// -1: Display all anime names
// 0: Display an anime
let currentDisplay = -1;

let seriesIds = {}; // Associate all anime names with ids

// Display all series
let nodesSeries = [];
let edgesSeries = [];
let idsSeries = {};

// Display all nodes
let allIds = {};
let arrNodes = {};
let arrEdges = {};

let allJsons = {};
let crossoverJson;

let currentAnime; // Currently displayed anime

let i = 0;

var allAnimeNames = [];

let dir = rawUrl + "/Ship_data/img/";

let infoJson = undefined;

let characterLinks = {}; // Easy way to get all characters and what they are linked to

function getColor(animeName, characterName) {
    if (infoJson === undefined) {
        return "yellow";
    }
    if (infoJson[animeName].hasOwnProperty(characterName) && infoJson[animeName][characterName].includes("male")) {
        return "lightblue";
    }
    return "lightpink";
}

function addCharacterLink(c1, c2) {
    if (characterLinks[c1] === undefined) characterLinks[c1] = [];
    if (characterLinks[c2] === undefined) characterLinks[c2] = [];

    if (!characterLinks[c1].includes(c2)) characterLinks[c1].push(c2);
    if (!characterLinks[c2].includes(c1)) characterLinks[c2].push(c1);
}

function createNodes(text) {
    let jsons = JSON.parse(text);

    let y = 0;
    for (let json of jsons) {
        let name = json.name;
        allAnimeNames.push(name);

        let nodes = [];
        let edges = [];
        // Add all characters to id list (+ draw nodes)
        for (key in json.ships) {
            nodes.push({ id: i, label: toSentenceCase(key), color: getColor(name, key), shape: "circularImage", image: dir + name + "/" + key + ".png" });
            allIds[name + "_" + key] = i;
            i++;
        }

        for (key in json.ships) {
            for (key2 in json.ships[key]) {
                if (allIds[name + "_" + key2] === undefined) {
                    nodes.push({ id: i, label: toSentenceCase(key2), color: getColor(name, key2), shape: "circularImage", image: dir + name + "/" + key2 + ".png" });
                    allIds[name + "_" + key2] = i;
                    i++;
                }
            }
        }

        // Draw edges
        for (key in json.ships) {
            for (key2 in json.ships[key]) {
                let color1 = getColor(name, key);
                let color2 = getColor(name, key2);
                let finalColor = color1 != color2 ? "#a660a0" : color1;
                edges.push({from: allIds[name + "_" + key], to: allIds[name + "_" + key2], width: 4, selectionWidth: 6, color: { color: finalColor, highlight: finalColor}});

                addCharacterLink(name + "_" + key, name + "_" + key2);
            }
        }

        arrNodes[name] = nodes;
        arrEdges[name] = edges;

        allJsons[name] = json;

        // Get series infos
        nodesSeries.push({ id: y, label: toSentenceCase(name), color: "lightgrey" });
        idsSeries[name] = y;
        y++;
    }

    // Search
    new autoComplete({
        selector: 'input[id="autoCompleteAnime"]',
        minChars: 1,
        source: autoSuggestionAnime
    });

    // Links
    new autoComplete({
        selector: 'input[id="autoCompleteAnime1"]',
        minChars: 1,
        source: autoSuggestionAnime
    });

    new autoComplete({
        selector: 'input[id="autoCompleteAnime2"]',
        minChars: 1,
        source: autoSuggestionAnime
    });

    new autoComplete({
        selector: 'input[id="autoCompleteCharacter1"]',
        minChars: 1,
        source: function(term, suggest){
            term = term.toLowerCase();
            var choices = Object.keys(characterLinks).filter(function(x) { return x.startsWith(document.getElementById("autoCompleteAnime1").value); });
            var matches = [];
            for (i = 0; i < choices.length; i++)
            {
                if (~choices[i].toLowerCase().indexOf(term))
                    matches.push(choices[i].split('_')[1]);
            }
            suggest(matches);
        }
    });

    new autoComplete({
        selector: 'input[id="autoCompleteCharacter2"]',
        minChars: 1,
        source: function(term, suggest){
            term = term.toLowerCase();
            var choices = Object.keys(characterLinks).filter(function(x) { return x.startsWith(document.getElementById("autoCompleteAnime2").value); });
            var matches = [];
            for (i = 0; i < choices.length; i++)
            {
                if (~choices[i].toLowerCase().indexOf(term))
                    matches.push(choices[i].split('_')[1]);
            }
            suggest(matches);
        }
    });
}

function autoSuggestionAnime(term, suggest){
    term = term.toLowerCase();
    var choices = allAnimeNames;
    var matches = [];
    for (i = 0; i < choices.length; i++)
    {
        if (~choices[i].toLowerCase().indexOf(term))
            matches.push(choices[i]);
    }
    suggest(matches);
}

document.getElementById("inputButton").addEventListener("click", function() { // Search button
    currentDisplay = 0;
    let current = document.getElementById("autoCompleteAnime").value;
    let item = Object.keys(idsSeries).find(key => key === current);
    document.getElementById("autoCompleteAnime").value = "";
    if (item === undefined)
        return;
    currentAnime = current;
    createNetwork(arrNodes[currentAnime], arrEdges[currentAnime]);
});

function getFastestRoute(anime1, anime2, charac1, charac2, callback) {
    // We start on the character "startNode" and we need to find the character "goalNode"
    let startNode = characterLinks[anime1 + "_" + charac1];
    let goalNode = anime2 + "_" + charac2;
    if (characterLinks[goalNode] === undefined)
        return undefined;

    let allLinks = {};

    let i = 0;
    startNode.forEach((e) => {
        allLinks[i] = [anime1 + "_" + charac1, e];
        i++;
    });
    let finalId = -1;
    while (true) {
        i = 0;
        let tmp = {};
        for(var key in allLinks)
            tmp[key] = allLinks[key].slice();
        let currLength = Object.keys(allLinks).length;
        Object.keys(allLinks).map(function(key) {
            return allLinks[key];
        }).forEach((eArr) => {
            let e = eArr[eArr.length - 1];
            let isFirst = true;
            characterLinks[e].forEach((e2) => {
                if (!eArr.includes(e2)) { // Character already in link
                    if (isFirst) {
                        tmp[i].push(e2);
                        if (e2 == goalNode) {
                            finalId = i;
                            callback(tmp[i]);
                            return;
                        }
                        isFirst = false;
                    } else {
                        tmp[currLength] = allLinks[i].slice();
                        tmp[currLength].push(e2);
                        if (e2 == goalNode) {
                            finalId = currLength;
                            callback(tmp[currLength]);
                            return;
                        }
                        currLength++;
                    }
                }
                if (finalId !== -1)
                    return;
            });
            if (finalId !== -1)
                return;
            i++;
        });
        allLinks = tmp;
        if (finalId != -1)
            return;
    }
}

let nodeLinks = {};

document.getElementById("inputButtonLink").addEventListener("click", function() { // Link button
    let anime1 = document.getElementById("autoCompleteAnime1").value;
    let anime2 = document.getElementById("autoCompleteAnime2").value;
    let charac1 = document.getElementById("autoCompleteCharacter1").value;
    let charac2 = document.getElementById("autoCompleteCharacter2").value;

    if (anime1 === "" || anime2 === "" || charac1 === "" || charac2 === "")
        return;

    if (anime1 === anime2 && charac1 == charac2)
        return;

    getFastestRoute(anime1, anime2, charac1, charac2, function(route) {
        let allNodes = [];
        let allLinks = [];
        currentDisplay = -2;

        let id = 0;
        let lastColor;
        let currColor = undefined;
        for (let i = 0; i < route.length; i++) {
            let curr = route[i];
            let s = curr.split('_');
            lastColor = currColor;
            currColor = getColor(s[0], s[1]);
            let array = [];
            if (i > 0) array.push(route[i - 1]);
            if (i < route.length - 1) array.push(route[i + 1]);
            nodeLinks[id] = { id: curr, related: array };
            allNodes.push({ id: id, label: toSentenceCase(curr), color: currColor, shape: "circularImage", image: dir + s[0] + "/" + s[1] + ".png" });
            if (id !== 0) {
                let finalColor = currColor != lastColor ? "#a660a0" : currColor;
                allLinks.push({from: id - 1, to: id, width: 4, selectionWidth: 6, color: { color: finalColor, highlight: finalColor}});
            }
            id++;
        }
        createNetwork(allNodes, allLinks);
    });
});

function createCrossoverNodes(text) {
    let json = JSON.parse(text);

    let ids = [];
    let alreadyNames = {};
    for (key in json.ships) {
        for (key2 in json.ships[key]) {

            let id1 = key.split('_')[0];
            let id2 = key2.split('_')[0];

            if (arrNodes[id1] === undefined || arrNodes[id2] === undefined) {
                continue;
            }

            if (alreadyNames[id1] === undefined || !alreadyNames[id1].includes(allIds[key2])) {
                arrNodes[id1].push({ id: allIds[key2], label: toSentenceCase(key2.split('_')[1]) + " (" + id2 + ")", color: "grey", shape: "circularImage", image: dir + id2 + "/" + key2.split('_')[1] + ".png" });
                if (alreadyNames[id1] === undefined)
                    alreadyNames[id1] = [];
                alreadyNames[id1].push(allIds[key2]);
            }
            if (alreadyNames[id2] === undefined || !alreadyNames[id2].includes(allIds[key])) {
                arrNodes[id2].push({ id: allIds[key], label: toSentenceCase(key.split('_')[1]) + " (" + id1 + ")", color: "grey", shape: "circularImage", image: dir + id1 + "/" + key.split('_')[1] + ".png" });
                if (alreadyNames[id2] === undefined)
                    alreadyNames[id2] = [];
                alreadyNames[id2].push(allIds[key]);
            }
            arrEdges[id1].push({from: allIds[key], to: allIds[key2], width: 4, selectionWidth: 6, color: { color: "grey" }});
            arrEdges[id2].push({from: allIds[key], to: allIds[key2], width: 4, selectionWidth: 6, color: { color: "grey" }});

            if (!ids.includes(id1 + " " + id2)) {
                ids.push(id1 + " " + id2);
                edgesSeries.push({from: idsSeries[id1], to: idsSeries[id2], width: 4, selectionWidth: 6, color: { inherit: false }});
            }

            addCharacterLink(key, key2);
        }
    }

    crossoverJson = json;

    createNetwork(nodesSeries, edgesSeries);
}

function createNetwork(argNodes, argEdges) {
    document.getElementById("loadingBar").hidden = false;
    document.getElementById("bar").style.width = 0;
    let nodes = new vis.DataSet(argNodes);

    let edges = new vis.DataSet(argEdges);

    let container = document.getElementById("network");
    let data = {
        nodes: nodes,
        edges: edges
    };

    let options = { };
    let network = new vis.Network(container, data, options);

    network.on("stabilizationProgress", function(params) {
        let maxWidth = 940;
        let widthFactor = params.iterations / params.total;
        let width = maxWidth * widthFactor;
    
        document.getElementById("bar").style.width = width + "px";
    });

    network.once("stabilizationIterationsDone", function () {
        document.getElementById("loadingBar").hidden = true;
    });

    // When we click on a node
    network.on("selectNode", function(node) {
        if (currentDisplay === -1) { // Go inside a node
            currentDisplay = 0;
            let id = Object.keys(idsSeries).find(key => idsSeries[key] === node.nodes[0]);
            currentAnime = id;
            createNetwork(arrNodes[currentAnime], arrEdges[currentAnime]);
            return;
        }
        let id;
        let currLink = currentDisplay === -2 ? nodeLinks[node.nodes[0]] : undefined;
        if (currentDisplay === -2) // Links
            id = currLink.id;
        else
            id = Object.keys(allIds).find(key => allIds[key] === node.nodes[0]);
        if (currentDisplay !== -2 && id.split('_')[0] != currentAnime) {
            currentAnime = id.split('_')[0];
            createNetwork(arrNodes[currentAnime], arrEdges[currentAnime]);
        }
        let allElems = {};
        let localJson = allJsons[id.split('_')[0]];
        for (key in localJson.ships) {
            for (key2 in localJson.ships[key]) {
                if (localJson.name + "_" + key2 == id && (currLink === undefined || currLink.related.includes(localJson.name + "_" + key))) {
                    if (allElems[key] === undefined) {
                        allElems[key] = [];
                    }
                    localJson.ships[key][key2].forEach(e => {
                        allElems[key].push({link: e.link, linkType: e.linkType, imageId: e.imageId, anime: localJson.name});
                    });
                }
            }
            if (localJson.name + "_" + key == id) {
                for (key2 in localJson.ships[key]) {
                    if (currLink === undefined || currLink.related.includes(localJson.name + "_" + key2))
                    {
                        if (allElems[key2] === undefined) {
                            allElems[key2] = [];
                        }
                        localJson.ships[key][key2].forEach(e => {
                            allElems[key2].push({link: e.link, linkType: e.linkType, imageId: e.imageId, anime: localJson.name});
                        });
                    }
                }
            }
        }
        for (key in crossoverJson.ships) {
            for (key2 in crossoverJson.ships[key]) {
                if (key2 == id && (currLink === undefined || currLink.related.includes(key))) {
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
                    if (currLink === undefined || currLink.related.includes(key2)) {
                        if (allElems[key2] === undefined) {
                            allElems[key2] = [];
                        }
                        crossoverJson.ships[key][key2].forEach(e => {
                            allElems[key2].push({link: e.link, linkType: e.linkType, imageId: e.imageId});
                        });
                    }
                }
            }
        }

        let str = "";
        let imageLinks = [];
        for (key in allElems) {
            let characterName;
            let animeName;
            var myName = toSentenceCase(id.split('_')[1]);
            if (key.includes("_"))
            {
                let s = key.split("_");
                characterName = toSentenceCase(s[0]) + "_" + toSentenceCase(s[1]);
                animeName = "crossover";
                str += "(" + toSentenceCase(s[0]) + ") " + toSentenceCase(s[1]) + ":<br/>";
            }
            else
            {
                characterName = toSentenceCase(key);
                animeName = toSentenceCase(allElems[key][0].anime);
                str += toSentenceCase(key) + ":<br/>";
            }
            let index = 1;
            allElems[key].forEach(e => {
                let fullId;
                switch (e.linkType) {
                    case "pixiv": // Code from https://source.pixiv.net/source/embed.js
                        fullId = 'https://embed.pixiv.net/embed_mk2.php?id=' + /artworks\/([0-9]+)/.exec(e.link)[1];
                        str += '<a id="a-' + fullId + '" href="' + e.link + '" target="_blank"><img id="imageId-' + fullId + '" src=""/></a>';
                        imageLinks.push({imageId: fullId, anime: animeName, c1: characterName, c2: myName, source: e.linkType, index: index, isPixiv: true});
                        break;

                    case "twitter":
                        fullId = 'https://pbs.twimg.com/media/' + e.imageId + '?format=jpg'
                        str += '<a href="' + e.link + '" target="_blank"><img id="imageId-' + fullId + '" src=""/></a>';
                        imageLinks.push({imageId: fullId, anime: animeName, c1: characterName, c2: myName, source: e.linkType, index: index, isPixiv: false});
                        break;

                    case "gelbooru": case "yandere": case "deviantart": case "shikotch":
                        str += '<a href="' + e.link + '" target="_blank"><img id="imageId-' + e.imageId + '" src=""/></a>';
                        imageLinks.push({imageId: e.imageId, anime: animeName, c1: characterName, c2: myName, source: e.linkType, index: index, isPixiv: false});
                        break;

                    case "other":
                        str += '<img id="imageId-' + e.imageId + '" src="' + e.imageId + '"/>';
                        imageLinks.push({imageId: e.imageId, anime: animeName, c1: characterName, c2: myName, source: e.linkType, index: index, isPixiv: false});
                        break;

                    default:
                        console.error("Unknown link type: " + e.linkType);
                        str += '<a href="' + e.link + '" target="_blank">' + e.link + '</a>';
                        break;
                }
                str += "<br/>";
                index++;
            });
            str += "<br/>";
        }
        document.getElementById("infos").innerHTML = str;

        imageLinks.forEach(elem => {
            let image = document.getElementById('imageId-' + elem.imageId);

            fetch("php/getImage.php?imageLink=" + elem.imageId + "&animeName=" + elem.anime + "&characterName=" + elem.c1 + "&characterName2=" + elem.c2 + "&token=" + token + "&index=" + elem.index + "&isPixiv=" + elem.isPixiv).then(function(response) {
                return response.text();
            }).then(function(url) {
                if (url.startsWith("http")) {
                    if (elem.source === "gelbooru" || elem.source === "other") {
                        fetch("php/getUrlContent.php?url=" + url).then(function(response) {
                            return response.blob();
                        }).then(function(blob) {
                            let objectURL = URL.createObjectURL(blob);
                            image.src = objectURL;
                        });
                    } else if (elem.source == "pixiv") {
                        document.getElementById('a-' + elem.imageId).innerHTML = '<iframe src="' + elem.imageId + '&size=medium&border=off" width="360" height="165" frameborder="0" style="vertical-align:middle; border:none;"></iframe>';
                    } else {
                        image.src = url;
                    }
                } else {
                    image.src = rawUrl + url;
                }
            });
        });
    });
}

function loadData(name) {
    document.getElementById("hidden-container").hidden = true;
    document.getElementById("nodes").hidden = false;
    document.getElementById("input").hidden = false;

    let http = new XMLHttpRequest();
    http.open("GET", "php/getInfoJson.php?folder=" + name, false);
    http.onreadystatechange = function ()
    {
        if (this.readyState === 4 && this.status === 200) {
            if (this.responseText !== "") {
                infoJson = JSON.parse(this.responseText);
            }

            http.open("GET", "php/getJson.php?folder=" + name, false);
            http.onreadystatechange = function ()
            {
                if (this.readyState === 4 && this.status === 200) {
                    createNodes(this.responseText);

                    http = new XMLHttpRequest();
                    http.open("GET", "php/getCrossoverJson.php?folder=" + name, false);
                    http.onreadystatechange = function ()
                    {
                        if (this.readyState === 4 && this.status === 200) {
                            createCrossoverNodes(this.responseText);
                        }
                    };
                    http.send(null);
                }
            };
            http.send(null);
        }
    };
    http.send(null);
}