var nodes = new vis.DataSet([
    { id: 1, label: "Node 1" },
    { id: 2, label: "Node 2" }
]);

var edges = new vis.DataSet([
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 3 }
]);

var container = document.getElementById("nodes");
var data = {
    nodes: nodes,
    edges: edges
};

var options = {
    clickToUse: true
};

var network = new vis.Network(container, data, options);

network.on("selectNode", function(node) {
    console.log(node);
});