const CheckBoard = (board, x, y) => {
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
        for (let offsetY = -1; offsetY <= 1; offsetY++) {
            if (offsetX === 0 && offsetY === 0) {
                continue
            }
            flag = true
            for (let i = 1; i < 5; i++) {
                let tempX = x + offsetX * i
                let tempY = y + offsetY * i
                if (tempX < 0 || tempX >= 19 || tempY < 0 || tempY >= 19) {
                    flag = false
                    break
                }
                if (board[tempY][tempX] != board[y][x]) {
                    flag = false
                    break
                }
            }
            if (flag) {
                return true
            }
        }
    }
    return false
}

module.exports = CheckBoard