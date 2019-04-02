const EventEmitter = require('events').EventEmitter
const debounce = require('lodash.debounce')
const Average = require('./average')

/**
 * Things to consider:
 * - Small changes should be ignored (ambient noise)
 * - The amount of noise changes with light. (More light, more ambient noise)
 * - Sudden large changes should be ignored. (sudden lighting condition changes)
 * - Duration of movements as important as magnitude
 * 
 * Comparing frames of a 8x8px video from the front camera
 */
class MovementDetection extends EventEmitter {
  constructor(debug) {
    super()
    this.frameInterval = 150
    this.width = 8
    this.height = 8
    this.movementCounter = 0
    this.video = document.createElement('video')
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width;
    this.canvas.height = this.width;
    this.debug = debug
    this.photo = document.getElementById('photo')
    if (this.debug && document.getElementById('motion_debug')) {
      document.getElementById('motion_debug').style.display = 'block'
    }
    this.imageComparator = new ImageCompare()
    this.startStream()
  }

  startStream() {
    const pictureCallback = debounce(() => {
      this.takePicture()
    }, this.frameInterval / 2)
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.video.srcObject = stream
        this.video.play()
        setInterval(() => requestAnimationFrame(pictureCallback), this.frameInterval)
      })
      .catch((err) => {
        console.log("An error occurred: " + err);
      });
  }

  addImageToComparator(context) {
    const pixels = this.width * this.height;
    var data = context.getImageData(0, 0, this.width, this.height).data
    let matrix = []
    for (let i = 0; i < pixels; i += 1) {
      const pointer = i * 4;
      matrix[i] = (data[pointer] + data[pointer + 1] + data[pointer + 2] + data[pointer + 3]) / 4
    }
    this.imageComparator.addImage(matrix)
  }

  updateMovementCounter(changedSegmentCount) {
    const movementDetected = changedSegmentCount >= 3 && changedSegmentCount < 30
    this.movementCounter = Math.max((this.movementCounter + (movementDetected ? 1 : -1)) % 8, 0)
  }

  takePicture() {
    var context = this.canvas.getContext('2d');

    context.imageSmoothingEnabled = false
    context.drawImage(this.video, 0, 0, this.width, this.height);
    this.addImageToComparator(context)

    const changedSegmentCount = this.imageComparator.segmentsOverTheThresholdCount()
    this.updateMovementCounter(changedSegmentCount)

    const organicMovementDetected = ((this.movementCounter-1) * changedSegmentCount) > 10
    if (organicMovementDetected) {
      this.triggerMovement()
    }

    if (this.debug) {
      const data = this.canvas.toDataURL('image/png');
      this.photo.setAttribute('src', data);
      this.outputDebugInfo(organicMovementDetected)
    }
  }

  triggerMovement() {
    this.emit('movement')
  }

  outputDebugInfo(organicMovementDetected) {
    const threshold = this.imageComparator.averageThreshold()
    const html = this.imageComparator.currentDeltaMatrix
      .map(p => `<div style="display: inline-block; width: 20px; height: 20px;background-color:${p > threshold ? '#999' : 'inherit'}">${this.movementCounter}</div>`).join('')
    document.getElementById('deltaMap').innerHTML = html
    document.getElementById('deltaMap').style.backgroundColor = organicMovementDetected ? 'green' : 'inherit'
  }
}

class ImageCompare {
  constructor() {
    this.previous = null
    this.current = null
    this.threshold = 8
    this.averageThresholdCollection = new Average(10)
    this.currentDeltaMatrix = []
  }

  addImage(img) {
    this.previous = this.current
    this.current = img
    this.currentDeltaMatrix = this.calcDeltaValues()
    const threshold = this.currentThreshold()
    this.averageThresholdCollection.push(threshold)
  }

  averageThreshold() {
    return this.averageThresholdCollection.avg() * 1.5
  }

  calcDeltaValues() {
    if (!this.previous || !this.current) {
      return []
    }

    var deltaMatrix = []
    for (let i = 0; i < this.current.length; i++) {
      var delta = Math.abs(this.current[i] - this.previous[i])
      deltaMatrix[i] = delta
    }

    return deltaMatrix
  }

  segmentsOverTheThresholdMap() {
    const avgThreshold = this.averageThreshold()
  
    return this.currentDeltaMatrix.map(p => p > avgThreshold ? 1 : 0)
  }

  segmentsOverTheThresholdCount() {
    const avgThreshold = this.averageThreshold()

    return this.currentDeltaMatrix.map(p => p > avgThreshold ? 1 : 0).filter(p => p != 0).length
  }

  currentThreshold() {
    const maxChangedSegments = 4
    const sorted = this.currentDeltaMatrix.slice().sort().reverse()

    // Current threshold is the next item above the lowest allowed segments
    return sorted[maxChangedSegments]
  }
}

module.exports = MovementDetection