import tone from 'tonegenerator'
import wav from 'wav'
// var wav    = require('wav');
var writer = new wav.FileWriter('output2.wav');


var tonedata = tone({
  freq: 440,
  lengthInSecs: 10.0,
  volume: 30,
  rate: 44100,
})

let buffer = Buffer.from(tonedata)
writer.write(buffer); // 220Hz for 5 seconds
writer.end();