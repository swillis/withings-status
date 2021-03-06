/* */ 
function stringifyNode(node) {
    var type = node.type;
    var value = node.value;

    if (type === 'word' || type === 'space') {
        return value;
    } else if (type === 'string') {
        return (node.quote || '') + value + (node.quote || '');
    } else if (type === 'div') {
        return (node.before || '') + value + (node.after || '');
    } else if (Array.isArray(node.nodes)) {
        if (type === 'function') {
            return value + '(' + (node.before || '') + stringify(node.nodes) + (node.after || '') + ')';
        } else {
            return stringify(node.nodes);
        }
    } else {
        return value;
    }
}

function stringify(nodes) {
    var result, i;
    if (Array.isArray(nodes)) {
        result = '';
        for (var i = nodes.length - 1; ~i; i -= 1) {
            result = stringifyNode(nodes[i]) + result;
        }
        return result;
    } else {
        return stringifyNode(nodes);
    }
};

module.exports = stringify;
