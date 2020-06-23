const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let startpoint_X,startpoint_Y,endtpoint_X,endtpoint_Y;

let sub_X=canvas.offsetLeft;
let sub_Y=canvas.offsetTop;

const DRAW = 'draw';
const ERASE = 'erase'; 
let status=ERASE;


const FREELINE = 'freeline';
const LINE  = 'line';
let lineType = LINE;

var ctx = canvas.getContext("2d"),
  painting = false,
  lineThickness = 1;


pCanvas = canvas.cloneNode(true);
pCtx = pCanvas.getContext('2d');
pCtx.fillStyle = "#black";


var pathes = [],
  currentPath;

let LineLength  = [0,0];

// For Drawing Line on Canvas 
const drawLine = function(x,y,endPX,endPY,e=true){
  
  if(e){
    console.log(e)
    context.clearRect (0, 0, canvas.width, canvas.height);
  }

  context.beginPath();
  context.lineWidth=3;
  context.moveTo(x,y);
  context.lineTo(endPX,endPY);
  context.stroke();
  context.closePath();
  [startpoint_X,startpoint_Y,endtpoint_X,endtpoint_Y]=[x,y,endPX,endPY] 
  console.log('draw',startpoint_X,startpoint_Y,endtpoint_X,endtpoint_Y)
  status=DRAW;
}

$(document).ready(function(){

    $('canvas').mouseup(function(){
          $(this).unbind('mousemove');
          painting = false;
          // console.log('try',startpoint_X,startpoint_Y,endtpoint_X,endtpoint_Y);   
    });

    $('canvas').mousedown(function(e){

        [startpoint_X,startpoint_Y]=[e.pageX-sub_X,e.pageY-sub_Y]
  
         currentPath = [];
         LineLength=[0,0];
         pathes.push(currentPath);
         painting = true;
         erase();

        $(this).bind('mousemove', function(e){
            

            if(lineType == LINE){
               drawLine(startpoint_X, startpoint_Y, e.pageX-sub_X, e.pageY-sub_Y);
             }else{
               ctx.clearRect(0, 0, canvas.width, canvas.height);
               var mouseX = e.pageX - this.offsetLeft,
                  mouseY = e.pageY - this.offsetTop;
               if (painting) {   
                  var lastPoint = currentPath[currentPath.length-1] || {
                     x: e.pageX - canvas.offsetLeft,
                     y: e.pageY - canvas.offsetTop
                  };
                  var x1 = mouseX,
                     x2 = lastPoint.x,
                     y1 = mouseY,
                     y2 = lastPoint.y;
                  
                  lineLength=lineDistance(x1,y1,x2,y2)
                  LineLength.push(lineLength);

                  var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
                  //Checking which side is drawing
                  if (steep) {
                     var x = x1;
                     x1 = y1;
                     y1 = x;

                     var y = y2;
                     y2 = x2;
                     x2 = y;
                  }
                  if (x1 > x2) {
                     var x = x1;
                     x1 = x2;
                     x2 = x;

                     var y = y1;
                     y1 = y2;
                     y2 = y;
                  }

                  var dx = x2 - x1,
                     dy = Math.abs(y2 - y1),
                     error = 0,
                     de = dy / dx,
                     yStep = -1,
                     y = y1;

                  if (y1 < y2) {
                     yStep = 1;
                  }

                  lineThickness = 5-Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)) / 10;
                  if (lineThickness < 1) {
                     lineThickness = 1;
                  }

                  for (var x = x1; x < x2; x++) {
                     if (steep) {
                        pCtx.fillRect(y, x, lineThickness, lineThickness);
                        currentPath.push({x: y,y: x});
                     } else {
                        pCtx.fillRect(x, y, lineThickness, lineThickness);
                        currentPath.push({x: x,y: y});
                     }

                     error += de;
                     if (error >= 0.5) {
                        y += yStep;
                        error -= 1.0;
                     }
                  }
                  currentPath.push({x: mouseX,y: mouseY});
               } else {
                  pathes.forEach(function(path) {
                     if (path.some(function(point) {
                     return isBetween(mouseX, point.x, 5) && isBetween(mouseY, point.y, 5)
                     })) {
                     pCtx.beginPath();
                     pCtx.arc(path[0].x+2.5, path[0].y+2.5, 5, 0, Math.PI*2);
                     pCtx.fill();

                     pCtx.beginPath();
                     pCtx.arc(path[path.length-1].x+2.5, path[path.length-1].y+2.5, 5, 0, Math.PI*2);
                     pCtx.fill();
                     }
                  });
               }
               ctx.drawImage(pCanvas, 0, 0);   
             }
            
            console.log('try',startpoint_X,startpoint_Y);
        });
      });

    $('canvas').mouseout(function(){
      $(this).unbind('mousemove');
    });
  
});

$(`input[value='${lineType}']`).attr("checked", "checked");

  $("input[name='linetype']").on('change',function(e){
    if($(this).val()==FREELINE){
      lineType = FREELINE;
      canvas.style.cursor = 'copy';
    }else{
      lineType = LINE;
      canvas.style.cursor = 'crosshair';
    }
  });



//For Saving points in to database
$('#save').on('click',function(){
  
    let points={'startpoint_X':startpoint_X,'startpoint_Y':startpoint_Y,'endtpoint_X':endtpoint_X,'endtpoint_Y':endtpoint_Y}
  
    if (status==DRAW){
      $.ajax({
        url:'/save',
        type:'GET',
        data:{'points':JSON.stringify(points)},
        dataType:'json',
        success:function(result){
          alert(result['data'])
        }
      });
    }else{
      alert('First Draw Line')
    }
    erase();
  });

// For Erasing line
$('#erase').on('click',function(){
    erase();
    var parentDiv=document.getElementById('length');
    parentDiv.removeChild()
});

const erase = function(){
    context.clearRect (0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.closePath();
    pCtx.clearRect (0, 0, canvas.width, canvas.height);
    pCtx.beginPath();
    pCtx.closePath();
    status = ERASE;
}

//For Clearing all points in to database
$('#clear').on('click',function(){

    $.ajax({
      url:'/clear',
      type:'GET',
      data:'',
      dataType:'json',
      success:function(result){
        alert(result['data'])
      }
    });
    erase();
  });

//For Loading last line from database
$('#load').on('click',function(){
  var l=0
    $.ajax({
        url:'/load',
        type:'GET',
        data:{'loaddata':'load'},
        dataType:'json',
        success:function(result){
        data =result['points']
        drawLine(data['startpoint_X'],data['startpoint_Y'],data['endtpoint_X'],data['endtpoint_Y']);
        l=lineDistance(data['startpoint_X'],data['startpoint_Y'],data['endtpoint_X'],data['endtpoint_Y'])
        document.getElementById('length').innerHTML = 'Last Line Length: '+l +' '+ 'Pixel';
        }
    });
});

$('#loadall').on('click',function(){
  var l;
  var i=0;
  $.ajax({
    url:"/load",
    type:'GET',
    data:{'loaddata':'loadall'},
    dataType:'json',
    success:function(result){
      for(data of result['points'])
      {
        drawLine(data['startpoint_X'],data['startpoint_Y'],data['endtpoint_X'],data['endtpoint_Y'],false);
        l=lineDistance(data['startpoint_X'],data['startpoint_Y'],data['endtpoint_X'],data['endtpoint_Y'])
        var parentDiv=document.getElementById('length');
        var newlabel = document.createElement("Label");
        newlabel.setAttribute("for",data['startpoint_X']);
        newlabel.innerHTML ='Line'+ i + ' Length is: '+ l +' '+ 'Pixel';;
        parentDiv.appendChild(newlabel);
        var br = document.createElement("br");
        newlabel.appendChild(br);
        i++;
      }
    }
  });
});


$('#get-last-free-line').on('click',function(e){
   context.clearRect (0, 0, canvas.width, canvas.height);
   alert(countFreeLineLength());  
 });


//returns the square root of the sum of squares of its arguments
function lineDistance(x,y,x1,y1) {
  return Math.round(Math.hypot(x1 - x, y1 - y))
}

function isBetween(x, y, z) {
  return (x >= y - z && x <= y + z);
}

//find free line length
function countFreeLineLength(){
   LineLength = LineLength.filter((ele)=>{return !isNaN(ele)});
   lineLength = LineLength.reduce((x,y)=>parseInt(x)+parseInt(y));
   return lineLength;
 }
