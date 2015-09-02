
$('.updateoredit').click(function(e){
  var valueholders = e.target.parentNode.parentNode.childNodes; //only nodes[1] and [3] are the needed ones
  
  var newtopic = valueholders[1].childNodes[1].childNodes[1].value.trim(),
  oldtopic = valueholders[3].innerText.trim();

  if(valueholders[1].classList.contains('invisible')){
    console.log("Enter editing mode for topic");
    $.ajax({
      url: "/actsave",
      data: {
        type: "Instructor enters editing mode",
        username: GLOBAL.username
      },
      method: "PUT"
    })
    .done(function(data){
      console.log('act saved');
    });
    valueholders[1].classList.remove("invisible");
    valueholders[3].classList.add("invisible");
    e.target.innerText = "Update";
    return;
  }
  else {
    console.log("finish editing in topic");
    valueholders[3].classList.remove("invisible");
    valueholders[1].classList.add("invisible");
    e.target.innerText = "Edit";
  }
  if(newtopic != oldtopic){
    valueholders[3].innerText = newtopic;

    $.ajax({
      url: "/ChangeTopic",
      method: "PUT",
      data: {
        oldtopic: oldtopic,
        newtopic: newtopic
      }
    });
    $.ajax({
      url: "/actsave",
      data: {
        type: "Instructor updates topic(s)",
        username: GLOBAL.username
      },
      method: "PUT"
    })
    .done(function(data){
      console.log('act saved');
    });
  }

});


$('.btn-delete').click(function(e){
  var valueholders = e.target.parentNode.parentNode.childNodes; //only nodes[1] and [3] are the needed ones

  var newtopic = valueholders[1].childNodes[1].childNodes[1].value.trim(),
  oldtopic = valueholders[3].innerText.trim();
  $.ajax({
      url: "/actsave",
      data: {
        type: "Instructor deletes topic(s)",
        username: GLOBAL.username,
        content:{oldtopic:oldtopic, newtopic:newtopic}
      },
      method: "PUT"
    })
    .done(function(data){
      console.log('act saved');
    });
  $.ajax({
    url: "/ChangeTopic",
    method: "PUT",
    data: {
      oldtopic: oldtopic,
      newtopic: null
    }
  })
  .done(function(data){
    console.log('removed topic');
    (e.target.parentNode.parentNode.parentNode).removeChild(e.target.parentNode.parentNode);
  });
});

$('.addtopicbtn').click(function(e){
  $.ajax({
    url: "/ChangeTopic",
    method: "PUT",
    data: {
      oldtopic: null,
      newtopic: e.target.parentNode.childNodes[3].value
    }
  })
  .done(function(data){
    console.log('add topic');
    $.ajax({
      url: "/actsave",
      data: {
        type: "Instructor adds topic(s)",
        username: GLOBAL.username,
        content: {newtopic: newtopic}
      },
      method: "PUT"
    })
    .done(function(data){
      console.log('act saved');
    });
    var resultitem = document.createElement('div'), 
    uifocus = document.createElement('div'), 
    spanedit = document.createElement('span'), spandisplay = document.createElement('span'),
    inputui = document.createElement('input'),
    buttons = document.createElement('span');
    buttons.innerHTML = '<span class="updateoredit">Edit</span><span class="btn-delete">Delete</span>';
    buttons.classList.add('buttons-holder');
    $(inputui).attr("type","text");
    $(inputui).attr("placeholder","Enter topic...");
    $(inputui).attr("value",data.topic);
    resultitem.classList.add('topic','item', 'result-wrap');
    uifocus.classList.add('ui','input','focus'),
    
    spanedit.classList.add('editing', 'value-holder', 'invisible');
    spandisplay.classList.add('display', 'value-holder');
    spandisplay.innerText=data.topic;
    uifocus.appendChild(inputui);
    spanedit.appendChild(uifocus);
    resultitem.appendChild(spanedit);
    resultitem.appendChild(spandisplay);
    resultitem.appendChild(buttons);
    $('#topics')[0].appendChild(resultitem);
    e.target.parentNode.childNodes[3].value = null;
  });

})


