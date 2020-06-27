const CheckBoard = (board, x, y) => {
    offsetX = 1
    offsetY = 1
    if (checkLine()) {
        return true
    }

    offsetX = 0
    offsetY = 1
    if (checkLine()) {
        return true
    }

    offsetX = 1
    offsetY = 0
    if (checkLine()) {
        return true
    }

    offsetX = 1
    offsetY = -1
    if (checkLine()) {
        return true
    }

    return false

    function checkLine() {
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
        return count >= 5
        
    }
}

module.exports = CheckBoard