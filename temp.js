const fs    = require('fs');
const path  = require('path');

const Canvas= require('canvas');
const AWS   = require('aws-sdk');

const Image   = Canvas.Image;
//const canvas  = new Canvas(600,600)
const canvas = Canvas.createCanvas(600,600)
const ctx     = canvas.getContext('2d')

exports.handler = (event, context, callback) =>{

  //const title = "응급환자 6명중 1명 '음주상태'… 응급실 25분 더 체류";
  //const subtitle = "응급환자 9만5천명 분석결과… '다른 응급환자 치료기회 줄어'";
  const title = "this is title"
  const subtitle = "this is subtitle"


  ctx.fillStyle = '#FFF'
  ctx.fillRect(0, 0, 600, 600)

  ctx.strokeStyle = "#0f0";
  ctx.fillStyle = "#ddd";


  ctx.font = '34px Impact';
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  printAtWordWrap(ctx, title, 300, 480, 40, 500);

  ctx.font = '24px Impact';
  ctx.fillStyle = "#999";
  ctx.textAlign = "center";
  printAtWordWrap(ctx, subtitle, 300, 560, 32, 580);

  ctx.save()

  var img = new Image()
  img.src = canvas.toBuffer()

  img = new Image()
  img.src = fs.readFileSync(path.join(__dirname, 'img', '20180417_001.jpg'))
  roundedImage(0,0,600,400,12);
  ctx.clip();
  ctx.drawImage(img, 0, 0, 600, 400)
  ctx.restore();

  //canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'image-src.jpg')))

  AWS.config.region = 'ap-northeast-2'; // 리전
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPollID: 'xxxxxxxxxxxxx'
  });

  var bucketName = 'drslidesns'; // Enter your bucket name
  var bucket = new AWS.S3({
    params: {
      Bucket: "drslidesns"
    }
  });

  var myFile = canvas.toDataURL('image/png');
  var buf = new Buffer(myFile.replace(/^data:image\/\w+;base64,/, ""),'base64')
  var fileName = "news_20180529_004_test.png";

  var params = {
    Bucket: "drslidesns",
    Key: "users/" + fileName,
    ContentEncoding: 'base64',
    ContentType: "image/png",
    Body: buf,
    ACL: 'public-read',

  };

  bucket.putObject(params, function (err, data) {

    if( err){
      console.log("error");
      callback(null, JSON.stringify(err,null));
    }
    else{
      console.log("success");
      callback(null, JSON.stringify(data,null));

    }


  });
}

// text-line
function printAtWordWrap(context, text, x, y, lineHeight, fitWidth){
  fitWidth = fitWidth || 0;

  if (fitWidth <= 0){
    context.fillText( text, x, y );
    return;
  }

  var words = text.split(' ');
  var currentLine = 0;
  var idx = 1;

  while (words.length > 0 && idx <= words.length){
    var str = words.slice(0,idx).join(' ');
    var w = context.measureText(str).width;
    if ( w > fitWidth ) {
      if (idx==1){
        idx=2;
      }
      context.fillText( words.slice(0,idx-1).join(' '), x, y + (lineHeight*currentLine) );
      currentLine++;
      words = words.splice(idx-1);
      idx = 1;
    }
    else{idx++;}
  }
  if  (idx > 0)
    context.fillText( words.join(' '), x, y + (lineHeight*currentLine) );
}

// border-radius
function roundedImage(x,y,width,height,radius){
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}


function sendToAWS(){

  AWS.config.region = 'ap-northeast-2'; // 리전
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-2:3f0f96a6-43cd-49d0-96fc-440708dd8e8f',
  });

  var bucketName = 'drslidesns'; // Enter your bucket name
  var bucket = new AWS.S3({
    params: {
      Bucket: "drslidesns"
    }
  });

  var myFile = canvas.toDataURL('image/png');
  var buf = new Buffer(myFile.replace(/^data:image\/\w+;base64,/, ""),'base64')
  var fileName = "news_20180529_004_test.png";

  var params = {
    Bucket: "drslidesns",
    Key: "users/" + fileName,
    ContentEncoding: 'base64',
    ContentType: "image/png",
    Body: buf,
    ACL: 'public-read',

  };

  bucket.putObject(params, function (err, data) {
    console.log(data);
    console.log(err ? err : 'UPLOADED.');
  });

}


/*

var Canvas = require('canvas')

  , Image = Canvas.Image
  , canvas = new Canvas(200, 200)
  , ctx = canvas.getContext('2d');

ctx.font = '30px Impact';
ctx.rotate(.1);
ctx.fillText("Awesome!", 50, 100);

var te = ctx.measureText('Awesome!');
ctx.strokeStyle = 'rgba(0,0,0,0.5)';
ctx.beginPath();
ctx.lineTo(50, 102);
ctx.lineTo(50 + te.width, 102);
ctx.stroke();

console.log('<img src="' + canvas.toDataURL() + '" />');
*/
