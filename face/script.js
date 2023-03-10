let video = document.getElementById("video");
let canvas = document.body.appendChild(document.createElement("canvas"));
let ctx = canvas.getContext("2d");
let displaySize;

let width = 640;
let height = 480;

if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    console.log("Let's get this party started")
  }

  navigator.mediaDevices.getUserMedia({video: true})
  async function getDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
  }
const startSteam = () => {
    console.log("----- START STEAM ------");
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: {exact: 'user'}
        },
        audio : false
    }).then((steam) => {video.srcObject = steam});
}

console.log(faceapi.nets);

console.log("----- START LOAD MODEL ------");
Promise.all([
    faceapi.nets.ageGenderNet.loadFromUri('models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startSteam);


async function detect() {
    const detections = await faceapi.detectAllFaces(video)
                                .withFaceLandmarks()
                                .withFaceExpressions()
                                .withAgeAndGender();
    //console.log(detections);
    
    ctx.clearRect(0,0, width, height);
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    console.log(resizedDetections);
    resizedDetections.forEach(result => {
        const {age, gender, genderProbability} = result;
        new faceapi.draw.DrawTextField ([
            `${Math.round(age,0)} Tahun`,
            `${gender} ${Math.round(genderProbability)}`
        ],
        result.detection.box.bottomRight
        ).draw(canvas);
    });
}

video.addEventListener('play', ()=> {
    displaySize = {width, height};
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(detect, 100);
})