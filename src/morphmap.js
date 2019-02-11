function WorldMap () {
    var morphId = 0;
    var _worldMap;
    if (typeof Map == 'function') {
        _worldMap = new Map();
    } else {
        _worldMap = Object.create({});
        _worldMap.size = 0;
        _worldMap.delete = function(key) {
            delete _worldMap[key];
            _worldMap.size -= 1;
        }
        _worldMap.set = function (key, v) {
            _worldMap[key] = v;
            _worldMap.size += 1;
        }
        _worldMap.get = function (key) {
            return _worldMap[key]
        }
    }
    function saveMorph (aMorph) {
        morphId++;
        _worldMap.set(morphId, aMorph);
        aMorph.morphId = morphId;
    }
    function getMorph (aId) {
        return _worldMap.get(aId);
    }
    function getSize () {
        return _worldMap.size;
    }
    function removeMorph (aMorph) {
        if (!_worldMap.delete(aMorph.morphId)) {
            console.log("Deleting unregistered morph: ", aMorph.morphId);
        }
        aMorph.morphId = null;
    }
    function checkWorld (startNode) {
        return new Map([[startNode.morphId,
                        startNode.children.map(item => checkWorld(item))]]
        );
    }
    return {
        saveMorph: saveMorph,
        getMorph: getMorph,
        getSize: getSize,
        removeMorph: removeMorph,
        checkWorld: checkWorld
    }
}

worldMap = WorldMap ();
