const CheckBoard = (board, x, y) => {
    for (let offsetX = 0; offsetX <= 1; offsetX++) {
        for (let offsetY = 0; offsetY <= 1; offsetY++) {
            if (offsetX === 0 && offsetY === 0) {
                continue
            }
            count = 1
            for (let i = 1; i < 5; i++) {
                let tempX = x + offsetX * i
                let tempY = y + offsetY * i
                if (tempX < 0 || tempX >= 19 || tempY < 0 || tempY >= 19) {
                    break
                }
                if (board[tempY][tempX] != board[y][x]) {
                    break
                } else {
                    count++
                }
            }
            for (let i = 1; i < 5; i++) {
                let tempX = x - offsetX * i
                let tempY = y - offsetY * i
                if (tempX < 0 || tempX >= 19 || tempY < 0 || tempY >= 19) {
                    break
                }
                if (board[tempY][tempX] != board[y][x]) {
                    break
                } else {
                    count++
                }
            }
            if (count >= 5) {
                return true
            }
        }
    }
    return false
}

module.exports = CheckBoard