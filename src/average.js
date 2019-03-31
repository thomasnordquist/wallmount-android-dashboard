class Average {
  constructor(size) {
    this.pointer = 0
    this.size = 0
    this.maxSize = size
    this.data = []
  }

  push(value) {
    this.pointer = (this.pointer + 1) % this.maxSize
    this.data[this.pointer] = value
    this.size = Math.min(this.size + 1, this.maxSize)
  }

  avg() {
    var sum = 0
    for (var i = 0; i < this.size; i += 1) {
      const pointer = (this.pointer + i) % this.maxSize
      sum += this.data[pointer]
    }

    return sum / this.size
  }
}

module.exports = Average