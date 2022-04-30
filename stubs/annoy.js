const path = require('path')
var Annoy = require('annoy');
var annoyIndex1 = new Annoy(10, 'Angular');
const annoyPath = path.join(__dirname,'./annoy_cache.model')

annoyIndex1.addItem(0, [-5.0, -4.5, -3.2, -2.8, -2.1, -1.5, -0.34, 0, 3.7, 6]);
annoyIndex1.addItem(1, [5.0, 4.5, 3.2, 2.8, 2.1, 1.5, 0.34, 0, -3.7, -6]);
annoyIndex1.addItem(2, [0, 0, 0, 0, 0, -1, -1, -0.2, 0.1, 0.8]);
annoyIndex1.build();
annoyIndex1.save(annoyPath);
let sum = []
read();

function read() {
    var annoyIndex2 = new Annoy(10, 'Angular');

    if (annoyIndex2.load(annoyPath)) {
        var v1 = annoyIndex2.getItem(0);
        var v2 = annoyIndex2.getItem(1);
        console.log('Gotten vectors:', v1, v2);

        for (var i = 0; i < v1.length; ++i) {
            sum.push(v1[i] + v2[i]);
        }

        var neighbors = annoyIndex2.getNNsByVector(sum, 10, -1, false);
        console.log('Nearest neighbors to sum', neighbors);

        var neighborsAndDistances = annoyIndex2.getNNsByVector(sum, 10, -1, true);
        console.log('Nearest neighbors to sum with distances', neighborsAndDistances);
    }
}