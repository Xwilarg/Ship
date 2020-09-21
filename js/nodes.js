var nodes = new vis.DataSet([
    { id: 1, label: "Node 1", color: "lightblue" },
    { id: 2, label: "Node 2", color: "lightblue" }
]);

var edges = new vis.DataSet([
    { from: 1, to: 2 }
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