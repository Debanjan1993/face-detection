import * as faceapi from 'face-api.js'

const video = document.querySelector('#video') as HTMLVideoElement;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(() => startVideo()).catch(error => console.error(error));


const startVideo = () => {
    navigator.getUserMedia(
        { video: {} },
        stream => {
            video.srcObject = stream
        },
        err => console.error(err)
    );
};

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    const videodiv = document.querySelector('#videodiv')
    videodiv?.append(canvas);
    const displaySize = {
        width: video.width,
        height: video.height
    }
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks().withFaceExpressions().withAgeAndGender();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        resizedDetections.forEach(detection => {
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: `${Math.round(detection.age)} years old ${detection.gender}` })
            drawBox.draw(canvas);
        })
    }, 100);


})