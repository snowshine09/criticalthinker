/**
 * 
 *
 *
 */

 var MyApp = MyApp || {};

 var GLOBAL = {};
 var proconModel = (function($) {
  // Load procon data from server
  var proconData = {},
  topic = "beast",
  dataReady = false;

  function fetchData() {
    $.ajax({
      url: "/all_procons/"+topic,
      method: "GET"
    })
    .done(function(data) {
      dataReady = true;
      proconData = data;
      GLOBAL.savedData = data;
      GLOBAL.topic = data.topic;
      console.log(proconData);
    });
  }

  function init() {
    console.log('procon init');
    fetchData();
  }

  function createEmptyClaim() {
    var newEmptyClaim = {
      content: "",
      support: []
    };

    return newEmptyClaim;
  }

  function createEmptySupport() {
    var newEmptySupport = {
      content: ""
    };

    return newEmptySupport;
  }

  function addProCon() {
    console.log('addProCon');
    proconData.pro.unshift(createEmptyClaim());
    proconData.con.unshift(createEmptyClaim());
    updateServerProCon();
  }

  function addSupport(side, claimIdx) {
    console.log('addSupport');
    proconData[side][claimIdx].support.unshift(createEmptySupport());
    updateServerProCon();
  }

  function deleteProConAtIndex(idx) {
    console.log('deleteProConAtIndex');
    proconData.pro.splice(idx, 1);
    proconData.con.splice(idx, 1);
    updateServerProCon();

  }

  function deleteSupport(side, claimIdx, supportIdx) {
    console.log('deleteSupport');
    proconData[side][claimIdx].support.splice(supportIdx, 1);
    updateServerProCon();
  }
  
  function updateProConAtIndex(side, claimIdx, content) {
    console.log('updateProConAtIndex');
    proconData[side][claimIdx].content = content;
    updateServerProCon();
  }

  function updateSupportingAtIndex(side, claimIdx, index, content) {
   console.log('updateSupportingAtIndex');
   proconData[side][claimIdx].support[index].content = content;
   updateServerProCon();
 }

 function getDataReady() {
  return dataReady;
}

function getProConData() {
  fetchData();
  return proconData;
}

function updateServerProCon() {
  console.log("entering ajax!! The current ProConData is " + proconData);
  $.ajax({
    url: "/all_procons/"+topic,
    method: "PUT",
    data: proconData
  })
  .done(function(msg) {
    console.log('updateServerProCon msg: ' + msg);
    console.dir(msg);
  });
}

return {
  init: init,
  addProCon: addProCon,
  addSupport: addSupport,
  deleteProConAtIndex: deleteProConAtIndex,
  deleteSupport: deleteSupport,
  getProConData: getProConData,
  getDataReady: getDataReady,
  updateProConAtIndex: updateProConAtIndex,
  updateSupportingAtIndex: updateSupportingAtIndex
};
}(jQuery));


var proconView = (function($) {
	var proconDataRef;
	
  function init(proconData) {
    console.log('view init');
    proconDataRef = proconData;
    
    GLOBAL.timeout = null;
    // GLOBAL.Diff
    render();
    registerEvents();
  }

  function registerEvents() {
    $('.pro .dropdown.icon').click(function(e) {
      // Preventing icon click, which will mess up the interface.
      e.stopPropagation();
    });
    $('.con .dropdown.icon').click(function(e) {
      // Preventing icon click, which will mess up the interface.
      e.stopPropagation();
    });
    $('.pro .claim.title').click(function(event) {
      var proClaimTitles = $('.pro .claim.title');
      var proClaimIndex = proClaimTitles.index(event.target);

      var conClaimTitles = $('.con .claim.title');
      var conClaimIndex = proClaimIndex;
      var classList = conClaimTitles[conClaimIndex].className.split(/\s+/);
      var whetherActive = false;
      for (var i = 0; i < classList.length; i += 1) {
        if (classList[i] === 'active') {
          whetherActive = true;
          break;
        }
      }
      if (whetherActive) {
        $(conClaimTitles[conClaimIndex]).accordion('close');
      } else {
        $(conClaimTitles[conClaimIndex]).accordion('open');
      }
    });

    $('.con .claim.title').click(function(event) {
      var conClaimTitles = $('.con .claim.title');
      var conClaimIndex = conClaimTitles.index(event.target);

      var proClaimTitles = $('.pro .claim.title');
      var proClaimIndex = conClaimIndex;
      var classList = conClaimTitles[proClaimIndex].className.split(/\s+/);
      var whetherActive = false;
      for (var i = 0; i < classList.length; i += 1) {
        if (classList[i] === 'active') {
          whetherActive = true;
          break;
        }
      }
      if (whetherActive) {
        $(proClaimTitles[proClaimIndex]).accordion('close');
      } else {
        $(proClaimTitles[proClaimIndex]).accordion('open');
      }     
    });

    $('.ui.dropdown')
    .dropdown();
    $('ui.sticky')
    .sticky({
      context: '#historycontext'
    });

    var historyBtn = document.getElementsByClassName('chathistory-dock-right btn')[0], Chatcontent = document.getElementsByClassName('chathistory-dock-right content')[0];
    historyBtn.addEventListener('click', function(e){
      if($(Chatcontent).css('display')==='none'){
        $.ajax({
          url: "/chathistory/"+GLOBAL.topic,
          method: "GET"
        })
        .done(function(data){
          // Chatcontent.appendChild(document.createTextNode(data));
          // var result = new EJS({url:'chathistory.ejs'}).render({chats:data});
          // var ejs = require('ejs');
          // var result = ejs.render('chathistory', {chats:data});
          document.getElementsByClassName('chathistory-dock-right content')[0].innerHTML = data;

          $(Chatcontent).show();
        });
        $(Chatcontent).transition('slide left');
      }
      else {
        $(Chatcontent).hide();
        $(Chatcontent).removeClass("visible");
        while(Chatcontent.firstChild) {
          Chatcontent.removeChild(Chatcontent.firstChild);
        }
      }
    }, false);
    $.ajax({
      url: "/getusername",
      method: "GET",
      error: function(xhr, desc, err) {
        console.log(xhr);
        console.log("Details0: " + desc + "\nError:" + err);
      },
    })
    .done(function(data){
      console.log('username is '+data.username);
      GLOBAL.username = data.username;
    });
    $.ajax({
      url: "/checkExistAvatar",
      method: "GET",
      error: function(xhr, desc, err) {
        console.log(xhr);
        console.log("Details0: " + desc + "\nError:" + err);
      },
    })
    .done(function(data){
      console.log("checked avatar exists or not! data.resp is ");
      console.dir(data);
      if(!data.resp.exist) {
        $.ajax({
          url: "/SaveScreenName/"+TogetherJS.config.get("getUserName"),
          method: "GET",
          error: function(xhr, desc, err) {
            console.log(xhr);
            console.log("Details0: " + desc + "\nError:" + err);
          },
        })
        .done(function(data){
          console.log('save screenname success!'+data);
          console.dir(data);
          
        });
      }
      else {
        TogetherJS.config("getUserName", data.resp.avatarname); 
      }
    });
    
    //login register
    // var loginForm = document.getElementsByClassName('form userlogin')[0];
    // loginForm.addEventListener('submit',function(e){
    //   e.preventDefault();
    //   var username = document.getElementsByClassName('userlogin username')[0].innerHTML,
    //   pwd = document.getElementsByClassName('userlogin userpwd')[0].innerHTML;
    //   $.ajax({
    //     url: "/userlogin",
    //     method: "POST",
    //     data:{username:username, pwd:pwd}
    //   })
    //   .done(function(data){
    //     console.log("login sucess");
    //   })
    // },false);
}

function createTitle(content, argumentType) {
  var title = document.createElement('div');
  title.className = argumentType + ' ' + 'active title';
  title.setAttribute("data-content", "Click to expand or collapse");
  var icon = document.createElement('i');
  icon.className = 'dropdown icon';
  $(title).popup({hoverable:true});
  title.appendChild(icon);
  title.appendChild(document.createTextNode(content));

  return title;
}

function createContent(contentString, side, proconIndex, index, argumentType) {
  var content = document.createElement('div');
  content.className = argumentType + ' ' + 'active content';

    // create Ace editor
    var editor = document.createElement('div');
    editor.className = "editor";
    var postfix = argumentType ==='claim'?'':index;
    editor.setAttribute("id", side + '_' + argumentType + "_editor_" + proconIndex + '_' + postfix);
    editor.appendChild(document.createTextNode(contentString));
    content.appendChild(editor);
    

    var aceEditor = ace.edit(editor);
    aceEditor.getSession().setMode("ace/mode/text");
    aceEditor.getSession().setUseWrapMode(true);
    aceEditor.renderer.setShowGutter(false);
    aceEditor.setHighlightActiveLine(false);
    
    // aceEditor.setValue(contentString)
    // var changed = false;
    aceEditor.on('change', function(event, sender){

      var updatedContent = sender.getSession().getValue();
      // if (argumentType === 'claim') {
      //   proconController.updateProConAtIndex(side, proconIndex, updatedContent);
      // } else if(argumentType == 'support'){
      //   proconController.updateSupportingAtIndex(side, proconIndex, index, updatedContent);
      // }
      GLOBAL.changed = true;
      clearTimeout(GLOBAL.timeout);
      GLOBAL.timeout = setTimeout(autoSave,1000,updatedContent,sender); //you can set the autosave intervals to enhance the performance, currently set to 1s
    });
    // $("#"+editor.id).data('editor',aceEditor);
    

    var autoSave = function(updatedContent,sender){
      var savedContent = argumentType === 'claim'?GLOBAL.savedData[side][proconIndex].content:GLOBAL.savedData[side][proconIndex].support[index].content;
      if (GLOBAL.changed && updatedContent != savedContent)
      {
        // alert('different now!');
        console.log('updatedContent='+updatedContent);
        console.log('sender.content='+sender.getSession().getValue());
        console.log('savedData = '+ savedContent);
        if (argumentType === 'claim') {
          proconController.updateProConAtIndex(side, proconIndex, updatedContent);
        } else if(argumentType == 'support'){
          proconController.updateSupportingAtIndex(side, proconIndex, index, updatedContent);          
        }
        GLOBAL.changed = false;
        console.log('autosaved: ' + updatedContent);
      }
    };
    
    return content;
  }

  function createFunctionButtons() {
    var row = document.createElement('div');
    row.className = 'row';

    var expandButton = document.createElement('div');
    expandButton.className = "ui tiny button";
    expandButton.appendChild(document.createTextNode('Expand'))

    var addButton = document.createElement('div');
    addButton.className = "ui tiny button";
    addButton.appendChild(document.createTextNode('Add'))

    var removeButton = document.createElement('div');
    removeButton.className = "ui red tiny button";
    removeButton.appendChild(document.createTextNode('Remove'))

    row.appendChild(expandButton);
    row.appendChild(addButton)
    row.appendChild(removeButton);

    return row;
  }

  function createFunctionIconsForClaim(side, idx) {
    var row = document.createElement('div');
    row.className = 'claimIcon row';

    var addIcon = document.createElement('i');
    addIcon.className = 'large pointing up icon';    

    addIcon.addEventListener('click', function(e){

      proconController.addSupport(side, idx);
      console.log('sending add supporting');
      TogetherJS.send({
       type: "addSupporting", 
       side: side, 
       index: idx});
    }, false);

    addIcon.setAttribute("data-content", "Add support to this claim.");

    $(addIcon).popup({
      hoverable: true
    });

    row.appendChild(addIcon);

    return row;
  }

  function createIconsforProConPair(idx){
    var icons=[];
    var removeIcon = document.createElement('i');
    removeIcon.className = 'large red remove circle icon';
    removeIcon.setAttribute("data-content", "Remove this pair of claims.");
    removeIcon.addEventListener('click', function(){
      proconController.deleteProCon(idx);
      TogetherJS.send({
        type: "deleteProConPair", 
        index: idx});   
    }, false);

    $(removeIcon).popup({
      hoverable: true
    });

    var addProConIcon = document.createElement('i');
    addProConIcon.className = 'large teal plus circle icon';
    addProConIcon.setAttribute("data-content", "Add a new pair of claims.");
    addProConIcon.addEventListener('click', function(){
     proconController.addProCon();
     TogetherJS.send({
      type: "addProConPair"
    });
   }, false);
    $(addProConIcon).popup({
      hoverable: true
    });
    icons.push(addProConIcon);
    icons.push(removeIcon);
    return icons;
  }

  function createFunctionIoncsForSupport(side, proconIdx, idx) {
    var row = document.createElement('div');
    row.className = 'supportIcon row';

    var removeIcon = document.createElement('i');
    removeIcon.className = 'large red remove icon';
    removeIcon.setAttribute("data-content", "Remove this support/backing.");
    $(removeIcon).popup({
      hoverable: true
    });

    removeIcon.addEventListener("click", function(e){
     proconController.deleteSupport(side, proconIdx, idx);
     console.log('fire togetherjs sync remove event');
     TogetherJS.send({
      type: "removeSupporting", 
      side: side, 
      proconIndex: proconIdx, 
      index: idx});
   }, false);

    row.appendChild(removeIcon);
    return row;
  }

  // Supporting argument for claims
  function createSupport(side, proconIdx, idx, supportContent) {
    var content = createContent(supportContent, side, proconIdx, idx, 'support');
    var icons = createFunctionIoncsForSupport(side, proconIdx, idx);
    var support = document.createDocumentFragment();
    content.appendChild(icons);
    support.appendChild(content);

    return support;
  }

  // Pro or Con claims. Can contain multiple supporting argument.
  function createClaim(side, idx, claimRaw) {
    var maxLength = 52; // maximum number of characters to extract
    //trim the string to the maximum length
    var trimmedString = claimRaw.content.substring(0, maxLength);
    //re-trim if we are in the middle of a word
    if(maxLength<claimRaw.content.length && claimRaw.content[maxLength]!=' ')
    {
      maxLength = Math.min(trimmedString.length, trimmedString.lastIndexOf(" "));
      
    }
    var title = createTitle(claimRaw.content.substring(0,maxLength) + ' ...', "claim");
    var icons = createFunctionIconsForClaim(side, idx); //replace with your string.
    

    
    var content = createContent('...' + claimRaw.content.substring(maxLength), side, idx, 0, "claim");
    var claim = document.createElement('div');
    var children = document.createElement('div');
    var divider = document.createElement('div');
    divider.className = 'ui divider';

    var i;

    claim.className = 'ui styled accordion';
    children.className = 'supporting';

    for (i = 0; i < claimRaw.support.length; i += 1) {
      children.appendChild(createSupport(side, idx, i, claimRaw.support[i].content));
    }

    content.appendChild(icons);
    content.appendChild(divider);
    content.appendChild(children);
    claim.appendChild(title);
    claim.appendChild(content);

    return claim;
  }


  function render() {

    var proandcon = $('#proandcon'),
    i;
    proandcon.html('');

    for (i = 0; i < proconDataRef.pro.length; i += 1) {
      var row = document.createElement('div');
      row.className = 'proconpair three column centered row';
      var rightpadding = document.createElement('div');
      // var leftpadding = document.createElement('div'), rightpadding = document.createElement('div'), midContainer = document.createElement('div');
      // leftpadding.className = 'two wide column';
      rightpadding.className = 'rightpadding two wide column';
      // midContainer.className = 'midContainer two column centered row';
      var pro = document.createElement('div');
      pro.className = 'pro seven wide column';

      pro.appendChild(createClaim('pro', i, proconDataRef.pro[i]));

      var con = document.createElement('div');
      con.className = 'con seven wide column';
      con.appendChild(createClaim('con', i, proconDataRef.con[i]));

      // midContainer.appendChild(pro);
      // midContainer.appendChild(con);
      var icons = createIconsforProConPair(i);

      // row.appendChild(leftpadding);
      row.appendChild(pro);
      row.appendChild(con);
      // row.appendChild(midContainer);
      for(var k=0; k<icons.length;k++){
        rightpadding.appendChild(icons[k]);
        // row.appendChild(icons[k]);
      }
      row.appendChild(rightpadding);
      proandcon.append(row);
    }
  }

  return {
    init: init
  };
}(jQuery));


var proconController = (function ($) {
  function addProCon() {
    proconModel.addProCon();
    initializeView();
  }

  function addSupport(side, claimIdx) {
    proconModel.addSupport(side, claimIdx);
    initializeView();
  }

  function deleteProCon(idx) {
    proconModel.deleteProConAtIndex(idx);
    initializeView();
  }

  function deleteSupport(side, claimIdx, supportIdx) {
    proconModel.deleteSupport(side, claimIdx, supportIdx);
    initializeView();
  }

  function updateProConAtIndex(side, claimIdx, content) {
   proconModel.updateProConAtIndex(side, claimIdx, content);
 }

 function updateSupportingAtIndex(side, claimIdx, index, content){
   proconModel.updateSupportingAtIndex(side, claimIdx, index, content);
 }

 function initializeView() {
  var data = proconModel.getProConData();
  console.log('initializing view .................. I commented out data._id');
  console.log("initializing view ING: "+data._id);
  //	Need serious consideration about this!!!
  //	Current problem: _id property cannot be deleted on server side. Cannot figure out why.
  // if(data._id != undefined){
  //   data = data.toObject();
  // }
  console.log(data._id);
  delete data._id;
  console.log(data._id);
  proconView.init(data);
  $('.ui.accordion').accordion({
    exclusive: false,
    duration: 350,
  });

  $('.large.icon').css('cursor', 'pointer');

  TogetherJS.reinitialize();

}

proconModel.init();

var interval = setInterval(function () {
    // console.log('set interval');

    if (proconModel.getDataReady() === true) {
      clearInterval(interval);

      initializeView();

      /**
       * collapse all claims and arguments
       */
       $('#callapseAllButton').click(function(e) {
        $('.claim.title').each(function(){
          $(this).accordion('close');
        });
      });
       $('#expandAllButton').click(function(e) {
        $('.claim.title').each(function(){
          $(this).accordion('open');
        });
      });

       var addProConButton = document.getElementById('addProConButton');
       addProConButton.addEventListener('click', function(){
         addProCon();
         TogetherJS.send({
          type: "addProConPair"
        });
       }, false);
     }
   }, 5);

return {
 addSupport: addSupport,
 deleteProCon: deleteProCon,
 deleteSupport: deleteSupport,
 addProCon: addProCon,
 updateProConAtIndex: updateProConAtIndex,
 updateSupportingAtIndex: updateSupportingAtIndex
};

}(jQuery));

