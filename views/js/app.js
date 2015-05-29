/**
 * 
 *
 *
 */

var proconModel = (function($) {
  // Load procon data from server
  var proconData = {},
      dataReady = false;

  function fetchData() {
    $.ajax({
      url: "/all_procons"
    })
    .done(function(data) {
      dataReady = true;
      proconData = data;

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
    proconData[0].pro.unshift(createEmptyClaim());
    proconData[0].con.unshift(createEmptyClaim());
  }

  function addSupport(side, claimIdx) {
    proconData[0][side][claimIdx].support.unshift(createEmptySupport());
//     proconData[0].con[claimIdx].support.unshift(createEmptySupport());
    console.log(proconData);
  }

  function deleteProConAtIndex(idx) {
    proconData[0].pro.splice(idx, 1);
    proconData[0].con.splice(idx, 1);

  }

  function deleteSupport(side, claimIdx, supportIdx) {
    proconData[0][side][claimIdx].support.splice(supportIdx, 1);
//     proconData[0].con[claimIdx].support.splice(supportIdx, 1);
  }

  function getDataReady() {
    return dataReady;
  }

  function getProConData() {
    return proconData;
  }

  function updateServerProCon() {
    $.ajax({
      url: "/update_all_procons",
      data: proconData
    })
    .done(function() {

    });
  }

  return {
    init: init,
    addProCon: addProCon,
    addSupport: addSupport,
    deleteProConAtIndex: deleteProConAtIndex,
    deleteSupport: deleteSupport,
    getProConData: getProConData,
    getDataReady: getDataReady
  };
}(jQuery));


var proconView = (function($) {
	var proconDataRef;
	
  function init(proconData) {
    console.log('view init');
	proconDataRef = proconData;
//     render(proconData);
	render();
    renderAceEditor();
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
  }

  function createTitle(content, argumentType) {
    var title = document.createElement('div');
    title.className = argumentType + ' ' + 'active title';

    var icon = document.createElement('i');
    icon.className = 'dropdown icon';

    title.appendChild(icon);
    title.appendChild(document.createTextNode(content.slice(0, 70) + ' ...'));

    return title;
  }

  function createContent(contentString, argumentType) {
    var content = document.createElement('div');
    content.className = argumentType + ' ' + 'active content';

    // create Ace editor
    var editor = document.createElement('div');
    editor.className = "editor";
    editor.appendChild(document.createTextNode(contentString));

    content.appendChild(editor);

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
    addIcon.className = 'large plus icon';

    var removeIcon = document.createElement('i');
    removeIcon.className = 'large red remove icon';

	addIcon.addEventListener('click', function(){
		proconController.addSupport(side, idx);
	}, false);
	
	removeIcon.addEventListener('click', function(){
		proconController.deleteProcon(idx);
	}, false);

    row.appendChild(addIcon);

    row.appendChild(removeIcon);
    return row;
  }

  function createFunctionIoncsForSupport(side, proconIdx, idx) {
    var row = document.createElement('div');
    row.className = 'supportIcon row';

    var removeIcon = document.createElement('i');
    removeIcon.className = 'large red remove icon';
    
    removeIcon.addEventListener("click", function(){
	    proconController.deleteSupport(side, proconIdx, idx);
    });

	row.appendChild(removeIcon);
    return row;
  }

  // Supporting argument for claims
  function createSupport(side, proconIdx, idx, supportContent) {
//     var title = createTitle(supportContent, 'support');
    var content = createContent(supportContent, 'support');
    var icons = createFunctionIoncsForSupport(side, proconIdx, idx);
    var support = document.createDocumentFragment();
//     support.appendChild(title);
    content.appendChild(icons);
    support.appendChild(content);

    return support;
  }

  // Pro or Con claims. Can contain multiple supporting argument.
  function createClaim(side, idx, claimRaw) {
    var title = createTitle(claimRaw.content, "claim");
    // var buttons = createFunctionButtons();

    var icons = createFunctionIconsForClaim(side, idx);
    var content = createContent(claimRaw.content, "claim");
    var claim = document.createElement('div');
    var children = document.createElement('div');

    var i;

    claim.className = 'ui styled accordion';
    children.className = 'supporting';


    for (i = 0; i < claimRaw.support.length; i += 1) {
      children.appendChild(createSupport(side, idx, i, claimRaw.support[i].content));
    }

    // content.appendChild(buttons);
    content.appendChild(icons);
    content.appendChild(children);
    claim.appendChild(title);
    claim.appendChild(content);

    return claim;
  }

  function renderAceEditor() {
    var i;
    var elements = document.getElementsByClassName('editor');
    for (i = 0; i < elements.length; i += 1) {
      var aceEditor = ace.edit(elements[i]);
      aceEditor.getSession().setMode("ace/mode/text");
      aceEditor.getSession().setUseWrapMode(true);
      aceEditor.renderer.setShowGutter(false);
      aceEditor.setHighlightActiveLine(false);
    }

  }

  function render() {

    var proandcon = $('#proandcon'),
        i;
    proandcon.html('');

    for (i = 0; i < proconDataRef.pro.length; i += 1) {
      // console.log(proconData.pro[i]);
      var row = document.createElement('div');
      row.className = 'row';

      var pro = document.createElement('div');
      pro.className = 'pro six wide column';

      pro.appendChild(createClaim('pro', i, proconDataRef.pro[i]));

      var con = document.createElement('div');
      con.className = 'con six wide column';
      con.appendChild(createClaim('con', i, proconDataRef.con[i]));

      row.appendChild(pro);
      row.appendChild(con);
      proandcon.append(row);
    }
  }

  return {
    init: init
  };
}(jQuery));


var proconController = (function () {
  function addProCon() {
    proconModel.addProCon();
    initalizeView();
  }

  function addSupport(side, claimIdx) {
    proconModel.addSupport(side, claimIdx);
    initalizeView();
  }

  function deleteProCon(idx) {
    proconModel.deleteProConAtIndex(idx);
    initalizeView();
  }

  function deleteSupport(side, claimIdx, supportIdx) {
    proconModel.deleteSupport(side, claimIdx, supportIdx);
    initalizeView();
  }

  function initalizeView() {
    var data = proconModel.getProConData();

    proconView.init(data[0]);
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

      initalizeView();

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

      $('#addProConButton').click(function(e) {
        addProCon();
      });
    }
  }, 5);

  return {
	  addSupport: addSupport,
	  deleteProCon: deleteProCon,
	  deleteSupport: deleteSupport
  };

}());

