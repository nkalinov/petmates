const { moved } = require('../walks')

module.exports = io => {
    setInterval(() => {
        // todo broadcast moved walks to their corresponding region
        moved.forEach((walks, region) => {
            io.to(region).emit(
                'walks:coords',
                [...walks].map(item => ({ [item[0]]: item[1] })) // [{ walkId: [lat, lng] }, ...]
            )
        })
        moved.clear()
    }, 1000)
}
