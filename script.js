// variables to access html elements 
const displayContainer = document.getElementById("wrapper");
const input = document.getElementById("input");
const inputContainer = document.getElementById("input-container");
const createBtn = document.getElementById("create-btn");
const readyBtn = document.getElementById("ready");
const inputName = document.getElementById("username");
const userName = document.getElementById("user-name");
const welcomeMessage = document.getElementById("message");
const userImage = document.getElementById("user-image");
const aiImage = document.getElementById("ai-image");
const welcomeContainer = document.getElementById("welcome-container");
const displayResult = document.getElementById("result-container");
const playAgainBtn = document.getElementById("play-again");

// canvas variable 
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//audio elements to be played during the game
const hitSound = new Audio("paddlesound.mp3");
const scoreSound = new Audio("scoresound.mp3");
const wallHitSound = new Audio("wallsound.mp3");

//user object
const user = {
  x:10,
  y:canvas.height/2-30,
  width:5,
  height:70,
  speed:9,
  velocityY:0,
  score:0
};

//computer (ai) object
const ai = {
  x:canvas.width-15,
  y:canvas.height/2-30,
  width:5,
  height:70,
  score:0,
};

//ball object
const ball = {
  x:canvas.width/2,
  y:canvas.height/2,
  size:10,
  speed:5,
  initialVelocityX:4,
  initialVelocityY:4,
  movingVelocityX:4,
  movingVelocityY:4,
};

//object for constructing a net
const net = {
  x:canvas.width/2,
  y:0,
  width:2,
  height:canvas.height,
};

//variable to check if the game is over
let gameOver = false;
//variable to enable a new round after a point is scored
let newRound = false;

//function to clear the canvas
function clearCanvas(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

//function to draw the ball on the canvas
function drawBall(){
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,ball.size,0,Math.PI*2,false);
  ctx.fillStyle = "#b2ebf2";
  ctx.fill();
}

//function to draw both user and computer paddles
function drawPaddles(player){
  ctx.rect(player.x,player.y,player.width,player.height);
  ctx.fillStyle = "#b2ebf2";
  ctx.fill();
}

//function to draw the net
function drawNet(){
  ctx.rect(net.x,net.y,net.width,net.height);
  ctx.fill();
}

//function to draw the score on the canvas
function drawScore(score,x,y){
  ctx.fillStyle = "#b2ebf2";
  ctx.font = "40px Fredoka One";
  ctx.fillText(score,x,y);
}

//function to execute all draw functions
function draw(){
  drawBall();
  drawPaddles(user);
  drawPaddles(ai);
  drawNet();
  drawScore(user.score,canvas.width/4,canvas.height/6);
  drawScore(ai.score,3*canvas.width/4,canvas.height/6);
}

//function to move ball across the canvas
function moveBall(){
  ball.x += ball.movingVelocityX;
  ball.y += ball.movingVelocityY;
}

//function to identify collision of the paddle. If true the y position is changed
function checkCollisionPaddle(){
  if(user.y < 0){
    user.y = 0;
  }
  else if(user.y + user.height > canvas.height){
    user.y = canvas.height - user.height;
  }
}

//function to update user paddle position and to check for collision of the paddles
function userPosition(){
  user.y += user.velocityY;
  checkCollisionPaddle();
}

//function to move the ai paddle across the canvas
function moveAI(){
  ai.y += ((ball.y - (ai.y + ai.height / 2))) * 0.11;
}

//function to check for collision between ball and paddle
function checkCollisionBall(player,ball){
  //get the sides of the paddle
  player.left = player.x;
  player.right = player.x + player.width;
  player.top = player.y;
  player.bottom = player.y + player.height;
  
  //get the top,left,right,bottom of the ball
  ball.left = ball.x - ball.size;
  ball.right = ball.x + ball.size;
  ball.top = ball.y-ball.size;
  ball.bottom = ball.y + ball.size;
  
  //returns true if there is collision of the ball with the paddle
  return ball.left < player.right && ball.top < player.bottom && ball.bottom > player.top && ball.right > player.left;
}

//function to change the velocity of ball during collision
function changeVelocity(player,angle){
  let angleDirection = (player === user) ? 1 : -1 
  ball.movingVelocityX = angleDirection * ball.speed * Math.cos(angle);
  ball.movingVelocityY = ball.speed * Math.sin(angle);
}

//function to check if the game is over. If true game is over else a new round is created
function checkValues(){
  if(user.score === 7 ||
    ai.score === 7){
    gameOver = true;
  }
  else{
    newRound = true;
  }
}

//function to check for collision when the ball hits the paddle or wall
function collisionBall(){
  //to check if the collision is between the ball and user paddle or ball and ai paddle
  let player = (ball.x < canvas.width/2) ? user : ai;

  //check if there is a collision between paddle and ball
  if(checkCollisionBall(player,ball)){
    
    hitSound.play();
    
    // to create an angle for calculating ball velocity
    let angle;
    
    //if the ball hits the top of the paddle, the angle becomes 45deg
    if (ball.y < (player.y + player.height / 2)) {
      angle = -1 * Math.PI/4;
    }
    //if the ball hits the bottom half of the paddle , the angle becomes -45deg
    else if(ball.y > (player.y + player.height / 2)){
      angle = Math.PI/4;
    }
    //the angle is 0 if it hits at the middle
    else{
      angle = 0;
    }

    //function call to change velocity during collision
    changeVelocity(player,angle);

    //changing ball's speed after each collision
    ball.speed += 0.20;
  }

  //if the ball hits the top wall ,change velocity of ball
  else if(ball.y - ball.size <= 0 || ball.y + ball.size > canvas.height){
    wallHitSound.play();
    ball.movingVelocityY *= -1;
  }

  //if ball is out of the canvas towards the negative x axis , the computer scores a point
  else if(ball.x + (ball.size + 5)< 0){
    scoreSound.play();
    ai.score+=1;
    checkValues();
  }

  //if the ball is out of the canvas towards the positive x axis , the user scores a point
  else if(ball.x - (ball.size + 5) > canvas.width){
    scoreSound.play();
    user.score +=1;
    checkValues();
  }
}

//function to reset the ball velocity,ball position and ball speed before a new round
function reset(){
  //reset x and y position of the ball
  ball.x = canvas.width/2;
  ball.y = canvas.height/2;
  
  //changing the direction of the ball before new round
  ball.initialVelocityX *= -1;
  ball.initialVelocityY *= -1;
  
  ball.movingVelocityX = -ball.initialVelocityX;
  ball.movingVelocityY = -ball.initialVelocityY;
  
  //assigning the initial ball speed
  ball.speed = 5;
}

//function to create a delay to bring the ball to the initial position before each new round
function createDelay(){
  //clear the canvas and draw the paddles,updated score on the canvas before the new round
  clearCanvas();
  drawPaddles(user);
  drawPaddles(ai);
  drawScore(user.score,canvas.width/4,canvas.height/6);
  drawScore(ai.score,3*canvas.width/4,canvas.height/6);
  //create delay and draw the ball on the canvas
  setTimeout(()=>{
    reset();
    drawBall();
  },1500)
  //create another delay and start the next round
  setTimeout(()=>{
    newRound = false;
    requestAnimationFrame(update);
  },2000);
}

//function to display result after the game is completed
function displayResultOnScreen(){
  //delay to output the result after a short delay 
  setTimeout(()=>{
  const winner = (user.score === 7)? inputName.value : "computer";
  const imageSrc = (winner === "user")? userImage.getAttribute("src") : aiImage.getAttribute("src");
  const winnerImage = document.getElementById("winner-image");
  winnerImage.setAttribute("src",imageSrc);
  const displayTitle = document.querySelector("#result-title");
  displayTitle.innerText = `${winner} won`;
  displayResult.style.opacity = "1";
   },1000);
}

//function which carries out the entire game
function update(){
  clearCanvas();
  draw();
  moveBall();
  moveAI();
  userPosition();
  collisionBall();

  /* If the game is not over then check if there is a new round. If true create 
  a delay and carry out the next round. Else continue the game with the current round */
  if(!gameOver){
    if(newRound){
      createDelay();
    }
    else{
      requestAnimationFrame(update);
    }
  }
  //Else display the result on the screen
  else{
    displayResultOnScreen();
  }
}

//function to move the user paddle during keypress
function moveUpAndDownPaddle(e){
  const keyCode = e.key;
  if(keyCode === "ArrowUp" || keyCode === "Up"){
    user.velocityY = -user.speed;
  }
  else if(keyCode === "ArrowDown" || keyCode === "Down"){
    user.velocityY = user.speed;
  }
}

//function to stop the moving user paddle when key is released
function stopMovingPaddle(e){
  const keyCode = e.key;
  if(keyCode === "ArrowUp" || keyCode === "ArrowDown" || keyCode === "Up" || keyCode === "Down"){
    user.velocityY = 0;
  }
}

//function to start the game
function startGame(){
    setTimeout(()=>{
        update();
    },4000);
}

//play the game again when the button is clicked
function playGameAgain(){
  reset();
  user.score=0;
  ai.score=0;
  gameOver = false;
  newRound = false;
  displayResult.style.opacity = "0";
  startGame();
}

//function to get a image for the user and computer profile
async function getImage(image,stringKey){
    try{
        const apiUrl = `https://robohash.org/${stringKey}`;
        const response = await fetch(apiUrl);
        image.setAttribute("src",response.url);
    }
    catch(error){
        console.log("whoops",error);
    }
}

//function to display the container when page loads
function displayInputContainer(){
    input.style.opacity = "1";
}

//function to change opacity
function modifyOpacity(element,value){
  element.style.opacity = value;
}

//function to load inputs , welcome message with animations and transitions
function displayMessage(){
  //display message after the input is entered and make the input container opaque
    // input.style.opacity = "0";
    modifyOpacity(input,"0");
    inputContainer.style.zIndex = "5";
    //get the user name from the input entered
    userName.innerText = inputName.value;

    //get the image for user and computer
    getImage(userImage,userName.textContent);
    getImage(aiImage,"computer");

    const avatar = document.getElementById("avatar");
    // welcomeMessage.style.opacity = "1";
    modifyOpacity(welcomeMessage,"1");
    welcomeMessage.style.zIndex = "10";

    // avatar.style.opacity = "1";
    modifyOpacity(avatar,"1");
    // readyBtn.style.opacity = "1";
    modifyOpacity(readyBtn,"1");
}

//function to display the canvas after animation
function displayCanvas(){
  //remove the welcome message and display the canvas
    // welcomeMessage.style.opacity = "0";
    modifyOpacity(welcomeMessage,"0");
    modifyOpacity(canvas,"1");
    // canvas.style.opacity = "1";
    // canvas.style.transition = "transform:opacity 2s 4s;"
    welcomeContainer.style.zIndex = "5";
    displayContainer.style.background="none";
    inputContainer.style.display = "none";
    welcomeContainer.style.display = "none";
    //start the game after the canvas is printed 
    startGame();
}

//event listeners to listen to keypress and key release
window.addEventListener("keydown",moveUpAndDownPaddle);
window.addEventListener("keyup",stopMovingPaddle);

//display the main container after the animation
displayContainer.addEventListener("animationend",displayInputContainer);
//event listener to display welcome message and accept input value from user
createBtn.addEventListener("click",displayMessage);
//event listener to start the game when clicked
readyBtn.addEventListener("click",displayCanvas);
//event listener to begin new game when clicked
playAgainBtn.addEventListener("click",playGameAgain);
