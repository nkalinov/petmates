// data = {
//   id:string;
//   user:User;
//   coords:LatLngExpression;
//   pet?:Pet;
// }

function Walk(data, socket) {
    this.socket = socket;

    if (data) {
        Object.assign(this, data);
    }
}

Walk.prototype.export = function () {
    var exported = Object.assign({}, this);
    delete exported.sockets;
    return exported;
};

module.exports = Walk;