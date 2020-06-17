const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let startpoint_X,startpoint_Y,endtpoint_X,endtpoint_Y;

let sub_X=canvas.offsetLeft;
let sub_Y=canvas.offsetTop;

const DRAW = 'draw';
const ERASE = 'erase'; 
let status=ERASE;


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
          // console.log('try',startpoint_X,startpoint_Y,endtpoint_X,endtpoint_Y);   
    });

    $('canvas').mousedown(function(e){

        [startpoint_X,startpoint_Y]=[e.pageX-sub_X,e.pageY-sub_Y]
  
        $(this).bind('mousemove', function(e){
            drawLine(startpoint_X, startpoint_Y, e.pageX-sub_X, e.pageY-sub_Y);
            console.log('try',startpoint_X,startpoint_Y);
        });
      });

    $('canvas').mouseout(function(){
      $(this).unbind('mousemove');
    });
  
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

//returns the square root of the sum of squares of its arguments
function lineDistance(x,y,x1,y1) {
  return Math.round(Math.hypot(x1 - x, y1 - y))
}