const { TheWAV } = require('the-wav')
const fs = require('fs')
const theBinary = require('the-binary')

const int = (x) => Math.round(x)
// const clamp = (n) => {}
function getHeaderBuffer() {
  const { sampleLength, sampleRate } = this
  const HEADER_LENGTH = 44

  const binary = theBinary(HEADER_LENGTH, { littleEndian: true })
  binary.pushString('RIFF')
  binary.pushUInt32(32 + sampleLength * 2)
  binary.pushString('WAVE')
  binary.pushString('fmt ')
  binary.pushUInt32(16)
  binary.pushUInt16(1)
  binary.pushUInt16(1)
  binary.pushUInt32(sampleRate)
  binary.pushUInt32(sampleRate * 2)
  binary.pushUInt16(2)
  binary.pushUInt16(16)
  binary.pushString('data')
  binary.pushUInt32(sampleLength * 2)
  return binary.toBuffer()
}
const chord = (c) => {
  let samplerequency = 1000
  let frequency = c
  let volume = 50
  var samplesLength = int(samplerequency / 2)
  var r = (2 * Math.PI * frequency) / samplerequency
  var data = []
  var i = 0
  while (i < samplesLength) {
    var v = 128 + int(volume * Math.sin(i * r))
    data.push(v)
    i += 1
  }
  return data
}
const merge = (myArrays) => {
  // Get the total length of all arrays.
  let length = 0
  myArrays.forEach((item) => {
    length += item.length
  })

  // Create a new array with total length and merge all source arrays.
  let mergedArray = new Uint8Array(length)
  let offset = 0
  myArrays.forEach((item) => {
    mergedArray.set(item, offset)
    offset += item.length
  })
  return mergedArray
}

const _main = () => {
  const C4 = 261.63
  const D4 = 293.66
  const E4 = 329.63
  const F4 = 349.23
  const G4 = 392.0
  const A4 = 440.0
  const B4 = 493.88

  const melody = [E4, E4, F4, G4, G4, F4, E4, D4]
  const ds = []
  var i = 0
  while (i < melody.length) {
    var c = melody[i]
    var d = chord(c)
    ds.push(d)
    i += 1
  }

  console.log('ds', ds.length)
  const lengthSum = ds.reduce((acc, item) => acc + item.length, 0)

  let result = []
  ds.forEach((item) => {
    const uItem = Uint8Array.from(item)
    result.push(uItem)
  })
  const U8 =merge(result)

  console.log('U8', U8)
  const filename = 'sound.wav'
  const tmp = 'tmp.tmp'
  const p = new Promise((resolve, reject) => {
    const w = fs.createWriteStream(filename)
    const a = fs.createWriteStream(tmp)
    a.write(Buffer.from(U8), () => {
      console.log('end')
      w.write(getHeaderBuffer(), () => {
        const r = fs.createReadStream(tmp)
        r.on('error', reject)
        r.on('close', () => resolve())
        r.pipe(w)
      })
    })
  })
  p.then(
    () => {
      console.log('on')
    },
    (e) => {
      console.log('e', e)
      console.log('fail')
    }
  )
  // wav.saveFileFromPcm(filename, ds, 10000)
}
// _main()

async function tryExample() {
  const wav = new TheWAV(`sample01.wav`, {
    sampleRate: 48000,
  })

  const seconds = 10
  // Create white noise 10 sec
  const whiteNoise10sec = [
    new Float32Array(wav.sampleRate * seconds).map(() => Math.random() - 0.5),
    new Float32Array(wav.sampleRate * seconds).map(() => Math.random() - 0.5),
  ]

  // Append data
  await wav.append(whiteNoise10sec)
  await wav.append(whiteNoise10sec)

  // // Write into file
  await wav.flush()
}

tryExample()
// .catch((err) => console.error(err))
