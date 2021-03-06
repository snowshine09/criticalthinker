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
        dataReady = false;

    function fetchData(secondcallback, callback) {
        if ($(".topic-bar span").text().length == 0) {
            temp = "The right to be forgotten"; //default
        } else {
            temp = $(".topic-bar span").text();
        }
        dataReady = false;
        Object.defineProperty(GLOBAL, 'topic', {
            value: temp,
            writable: true
        });
        $(".topic-bar span").val(temp);
        callback(secondcallback);
    }


    function fetchDatawTopic(callback) {
        $.ajax({
                url: "/all_procons/" + GLOBAL.topic.replace(/\//, '%2F'),
                method: "GET"
            })
            .done(function(data) {
                dataReady = true;
                proconData = data;
                GLOBAL.self = true;
                GLOBAL.savedData = data;
                GLOBAL.helloLogin = true;
                console.log(proconData);
                if (typeof callback != "undefined" && callback) {
                    callback();
                }
            });
    }

    function init(callback) {
        console.log('procon init');
        fetchData(callback, fetchDatawTopic);

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

    function createEmptySynthesis() {
        var newEmptySynthesis = {
            content: "",
            reference: []
        };
        return newEmptySynthesis;
    }

    function addProCon() {
        console.log('addProCon');
        proconData.pro.push(createEmptyClaim());
        proconData.con.push(createEmptyClaim());
        updateServerProCon();
    }

    function addSupport(side, claimIdx) {
        console.log('addSupport');
        proconData[side][claimIdx].support.push(createEmptySupport());
        updateServerProCon();
    }

    function addSynthesis() {
        console.log('addSynthesis');
        proconData['synthesis'].push(createEmptySynthesis());
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

    function deleteSynthesis() {
        console.log('delete Synthesis');
        var emptylist = [];
        for (var i = 0; i < proconData['synthesis'].length; i += 1) {
            if (proconData['synthesis'][i].content.length == 0) emptylist.push(i);
        }
        // for (var i = 0; i < emptylist.length; i += 1) {
        //     proconData['synthesis'].splice(i, 1);
        // }
        proconData['synthesis'] = $.grep(proconData['synthesis'], function(n, i) {
            return $.inArray(i, emptylist) == -1;
        });
        if (proconData['synthesis'].length == 0) {
            proconData['synthesis'].push(createEmptySynthesis());
        }
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

    function updateSynthesisAtIndex(side, synIdx, content) {
        console.log('updateSynthesisAtIndex');
        proconData[side][synIdx].content = content;
        updateServerProCon();
    }

    function getDataReady() {
        return dataReady;
    }

    function resetDataReady() {
        dataReady = false;
    }

    function getProConData() {
        dataReady = false;
        fetchData(null, fetchDatawTopic);
    }

    function updateServerProCon() {
        var temp = "/all_procons/" + GLOBAL.topic.replace(/\//, '%2F');
        console.log("entering ajax!! The current ProConData is " + proconData);
        $.ajax({
                url: temp,
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
        addSynthesis: addSynthesis,
        deleteProConAtIndex: deleteProConAtIndex,
        deleteSupport: deleteSupport,
        deleteSynthesis: deleteSynthesis,
        getProConData: getProConData,
        getDataReady: getDataReady,
        resetDataReady: resetDataReady,
        updateProConAtIndex: updateProConAtIndex,
        updateSupportingAtIndex: updateSupportingAtIndex,
        updateSynthesisAtIndex: updateSynthesisAtIndex
    };
}(jQuery));


var proconView = (function($) {
    var proconDataRef;

    function init(proconData) {
        console.log('view init');
        proconDataRef = proconData;

        GLOBAL.timeout = null;
        render();
        removeEvents();
        $(document).ready(function() {
            registerEvents();
        });
    }

    function removeEvents() {
        $('#callapseAllButton').unbind('click');
        $('#expandAllButton').unbind('click');
        // $('#submitVersion').unbind('click');
        $('.dropdown.icon').unbind('click');
        $('.claim.title').unbind('click');
        $('span.chathistory-dock-right').unbind('click');
        $('.helptour').unbind('click');
        $('.usersetting').unbind('click');
        $(".chathistory-dock-right.btn").unbind('click');
        $('#synthesis-add').unbind('click');
        $('#synthesis-remove').unbind('click');
    }

    var saddlistener = function(e) {
                // e.stopPropagation();
                console.log('12324');
                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "Add a new synthesis",
                            topic: GLOBAL.topic
                        },

                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
                proconController.addSynthesis();
                TogetherJS.send({
                    topic: GLOBAL.topic,
                    type: "addSynthesis"
                });
                // return;
            };

    function registerEvents() {

        $('#callapseAllButton').click(function(e) {
            $('.claim.title').each(function() {
                $(this).accordion('close');
            });
            $.ajax({
                    url: "/actsave",
                    data: {
                        type: "Collapse all claim pairs",
                        topic: GLOBAL.topic
                    },
                    method: "PUT"
                })
                .done(function(data) {
                    console.log('act saved');
                });
        });
        $('#expandAllButton').click(function(e) {
            $('.claim.title').each(function() {
                $(this).accordion('open');
            });
            $.ajax({
                    url: "/actsave",
                    data: {
                        type: "Expand all claim pairs",
                        topic: GLOBAL.topic
                    },
                    method: "PUT"
                })
                .done(function(data) {
                    console.log('act saved');
                });
        });

        
        $('.pro .dropdown.icon').click(function(e) {

            e.stopPropagation(); // Preventing icon click, which will mess up the interface.
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
                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "collapse a claim pair by clicking PRO",
                            topic: GLOBAL.topic,
                            content: "the index of the collapsed claim is " + proClaimIndex
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
            } else {
                $(conClaimTitles[conClaimIndex]).accordion('open');

                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "expand a claim pair by clicking PRO",
                            topic: GLOBAL.topic,
                            content: "the index of the collapsed claim is " + proClaimIndex
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
            }
        });
        $('.con .dropdown.icon').click(function(e) {

            e.stopPropagation();
            var conClaimTitles = $('.con .claim.title'); // Preventing icon click, which will mess up the interface.
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
                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "collapse a claim pair by clicking CON",
                            topic: GLOBAL.topic,
                            content: {
                                index: proClaimIndex
                            }
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
            } else {
                $(proClaimTitles[proClaimIndex]).accordion('open');
                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "expand a claim pair by clicking CON",
                            topic: GLOBAL.topic,
                            content: {
                                index: proClaimIndex
                            }
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
            }
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
                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "collapse a claim pair by clicking PRO",
                            topic: GLOBAL.topic,
                            content: "the index of the collapsed claim is " + proClaimIndex
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
            } else {
                $(conClaimTitles[conClaimIndex]).accordion('open');

                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "expand a claim pair by clicking PRO",
                            topic: GLOBAL.topic,
                            content: "the index of the collapsed claim is " + proClaimIndex
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
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
                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "collapse a claim pair by clicking CON",
                            topic: GLOBAL.topic,
                            content: {
                                index: proClaimIndex
                            }
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
            } else {
                $(proClaimTitles[proClaimIndex]).accordion('open');
                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "expand a claim pair by clicking CON",
                            topic: GLOBAL.topic,
                            content: {
                                index: proClaimIndex
                            }
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
            }
        });

        $('.ui.dropdown')
            .dropdown({
                onChange: function(val) {
                    if (val) {
                        $.ajax({
                                url: "/actsave",
                                data: {
                                    type: "switch topic",
                                    topic: GLOBAL.topic,
                                    content: {
                                        newtopic: val
                                    }
                                },
                                method: "PUT"
                            })
                            .done(function(data) {
                                console.log('act saved');
                            });
                    }

                    proconModel.resetDataReady();
                    GLOBAL.topic = val;
                    proconModel.init(proconController.initializeView);
                }
            });



        $(".chathistory-dock-right.btn").on('click', function(e) {
            e.stopPropagation();
            var Chatcontent = document.getElementsByClassName('chathistory-dock-right content')[0];
            if ($(Chatcontent).css('display') === 'none') {
                $.ajax({
                        url: "/chathistory/" + GLOBAL.topic,
                        method: "GET"
                    })
                    .done(function(data) {
                        document.getElementsByClassName('chathistory-dock-right content')[0].innerHTML = data;
                        $(Chatcontent).show();
                        var closechatBtn = document.getElementsByClassName('closechat')[0];
                        closechatBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            $(Chatcontent).hide();
                            $(Chatcontent).removeClass("visible");
                            while (Chatcontent.firstChild) {
                                Chatcontent.removeChild(Chatcontent.firstChild);
                            };
                        }, false);
                    });
                // $(Chatcontent).transition('slide right');
                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "Open chathistory records",
                            topic: GLOBAL.topic
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });

            } else {
                $(Chatcontent).hide();
                $(Chatcontent).removeClass("visible");

                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "Close chathistory records",
                            topic: GLOBAL.topic
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
                while (Chatcontent.firstChild) {
                    Chatcontent.removeChild(Chatcontent.firstChild);
                }
            }
        });


        window.onbeforeunload = function() {
            alert("unload the page!");
            $.ajax({
                    url: "/userleft",
                    method: "PUT",
                    data: {
                        lasttopic: GLOBAL.topic,
                        lastSnap: GLOBAL.savedData
                    }
                })
                .done(function(data) {
                    console.log("userleft, byebye");
                });
        };
        if (GLOBAL['username'] == undefined) {
            $.ajax({
                    url: "/getusername",
                    method: "GET",
                    error: function(xhr, desc, err) {
                        console.log(xhr);
                        console.log("Details0: " + desc + "\nError:" + err);
                    },
                })
                .done(function(data) {
                    console.log('username is ' + data.username);
                    GLOBAL.username = data.username;
                    GLOBAL.avatarname = data.avatarname;
                    GLOBAL.topics = data.topics;
                    GLOBAL.title = data.title;
                });
            $.ajax({
                    url: "/checkExistAvatar",
                    method: "GET",
                    error: function(xhr, desc, err) {
                        console.log(xhr);
                        console.log("Details0: " + desc + "\nError:" + err);
                    },
                })
                .done(function(data) {
                    if (!data.resp.exist) {
                        $.ajax({
                                url: "/SaveScreenName/" + TogetherJS.config.get("getUserName"),
                                method: "GET",
                                error: function(xhr, desc, err) {
                                    console.log(xhr);
                                    console.log("Details0: " + desc + "\nError:" + err);
                                },
                            })
                            .done(function(data) {
                                console.log('save screenname success!' + data);
                                console.dir(data);
                            });
                    } else {
                        TogetherJS.config("getUserName", data.resp.avatarname);
                    }
                });
        }

        document.getElementsByClassName('helptour')[0].addEventListener('click', function(e) {
            $.ajax({
                    url: "/actsave",
                    data: {
                        type: "Start a helptour",
                        topic: GLOBAL.topic
                    },
                    method: "PUT"
                })
                .done(function(data) {
                    console.log('act saved');
                });
            var intro = introJs();
            intro.setOptions({
                steps: [{
                    intro: "This is a tour that guides you on how and why to use the system: this is a collaborative learning system that allows for concurrent editing (each input box you see in the screen is editable), instant chat and chat history review"
                }, {
                    element: document.querySelectorAll('.proconpair')[0],
                    intro: "The PRO and CON arguments are structured in pair correspondingly"
                }, {
                    element: document.querySelectorAll('.dropdown.labeled.search')[0],
                    intro: "Select the topic you want to go here, or it will be loaded with the last topic you were arguing about"
                }, {
                    element: document.querySelectorAll('.rightpadding.two')[0],
                    intro: "You can add or delete Claim with the plus or cross button"
                }, {
                    element: document.querySelectorAll('.pro.seven.column')[0],
                    intro: 'The left panel is where PRO arguments are put, whereas the right panel is the place for CON arguments',
                    position: 'left'
                }, {
                    element: document.querySelectorAll('.editor.ace_editor')[0],
                    intro: "You and your group member(s) will be collaboratively proposing claims, in areas like this above the Black Plus button",
                    position: 'bottom'
                }, {
                    element: document.querySelectorAll('.claimIcon.row')[0],
                    intro: 'Click the Black Plus Button to add more backings to support the above proposition'
                }, {
                    element: document.querySelectorAll('.supporting')[0],
                    intro: "These are where you write the backings with facts, evidences, reasoning or examples",
                    position: 'bottom'
                }, {
                    element: document.querySelectorAll('.supportIcon.row')[0],
                    intro: "Click the cross button to delete the piece of backing"
                }, {
                    element: document.querySelector('#togetherjs-chat-button'),
                    intro: "Click here to open the Chat Window to talk with your group member(s)"
                }, {
                    element: document.querySelectorAll('.chathistory-dock-right.btn')[0],
                    intro: "Click here to browse the chat history that occurred before"
                }, {
                    intro: "Thanks for taking the brief tour, now embark on the journey with Critical Thinker"
                }]
            });
            intro.setOption('tooltipPosition', 'auto');
            intro.setOptions({
                'skipLabel': 'Exit',
                'tooltipPosition': 'auto'
            });
            intro.setOptions({
                'prevLabel': '&larr; Back',
                'tooltipPosition': 'auto'
            });
            intro.setOptions({
                'nextLabel': 'Next &rarr;',
                'tooltipPosition': 'auto'
            });
            intro.start();
        }, false);

        $(".usersetting").click(function(e) {
            $.ajax({
                    url: "/instructor",
                    method: "GET"
                })
                .done(function(data) {
                    console.log("enter instructor");
                });
            $.ajax({
                    url: "/actsave",
                    data: {
                        type: "Enter Topic Management",
                        topic: GLOBAL.topic
                    },
                    method: "PUT"
                })
                .done(function(data) {
                    console.log('act saved');
                });
        })

        //register clicks on synthesis board
        var sadd = document.getElementById('synthesis-add'),
                srem = document.getElementById('synthesis-remove');
            // var el = document.getElementById('synthesis-add'),
            //     elClone = el.cloneNode(true);

            // el.parentNode.replaceChild(elClone, el);
        
            sadd.removeEventListener('click', saddlistener, true);
            sadd.addEventListener('click', saddlistener, true);

            srem.addEventListener('click', function() {
                console.log('clicked removing syn');
                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "Remove all empty syntheses",
                            topic: GLOBAL.topic
                        },

                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                    });
                proconController.deleteSynthesis();
                TogetherJS.send({
                    topic: GLOBAL.topic,
                    type: "deleteSynthesis"
                });
            }, false);


    }

    function createTitle(content, argumentType) {
        var title = document.createElement('div');
        title.className = argumentType + ' ' + 'active title';
        title.setAttribute("data-content", "Click to expand or collapse");
        $(title).popup({
            hoverable: true
        });
        title.appendChild(document.createTextNode(content));

        return title;
    }

    function createContent(contentString, side, proconIndex, index, argumentType) {
        var content = document.createElement('div');
        content.className = argumentType + ' ' + 'active content';

        // create Ace editor
        var editor = document.createElement('div');
        editor.className = "editor";
        var postfix = argumentType === 'support' ? index : '';
        editor.setAttribute("id", side + '_' + argumentType + "_editor_" + proconIndex + '_' + postfix);
        editor.appendChild(document.createTextNode(contentString));
        content.appendChild(editor);


        var aceEditor = ace.edit(editor);
        aceEditor.getSession().setMode("ace/mode/text");
        aceEditor.getSession().setUseWrapMode(true);
        aceEditor.renderer.setShowGutter(false);
        aceEditor.setHighlightActiveLine(false);


        aceEditor.on('change', function(event, sender) {

            var updatedContent = sender.getSession().getValue();
            GLOBAL.changed = true;
            clearTimeout(GLOBAL.timeout);
            GLOBAL.timeout = setTimeout(autoSave, 1000, updatedContent, sender); //you can set the autosave intervals to enhance the performance, currently set to 1s
        });

        var autoSave = function(updatedContent, sender) {
            var savedContent;
            if (argumentType === 'claim')
                savedContent = GLOBAL.savedData[side][proconIndex].content;
            else if (argumentType === 'support') savedContent = GLOBAL.savedData[side][proconIndex].support[index].content;
            else savedContent = GLOBAL.savedData[side][proconIndex].content;
            if (GLOBAL.changed && updatedContent != savedContent) {
                $.ajax({
                        url: "/actsave",
                        data: {
                            type: "Autosave User Input",
                            topic: GLOBAL.topic,
                            content: {
                                argumentType: argumentType,
                                update: updatedContent,
                                element: sender.container.id
                            }
                        },
                        method: "PUT"
                    })
                    .done(function(data) {
                        console.log('act saved');
                        $.ajax({
                                url: "/SubmitVersion",
                                data: {
                                    content: {
                                        pro: GLOBAL.savedData.pro,
                                        con: GLOBAL.savedData.con
                                    },
                                    topic: GLOBAL.topic
                                },
                                method: "PUT"
                            })
                            .done(function(data) {
                                console.log('Arguments saved');
                                $('.ui.saving').removeClass('hidden').fadeIn('slow').delay(1000).fadeOut();

                            });
                        $.ajax({
                                url: "/actsave",
                                data: {
                                    type: "Submit a new version",
                                    topic: GLOBAL.topic
                                },
                                method: "PUT"
                            })
                            .done(function(data) {
                                console.log('act saved');
                            });
                    });
                console.log('updatedContent=' + updatedContent);
                console.log('sender.content=' + sender.getSession().getValue());
                console.log('savedData = ' + savedContent);
                if (argumentType === 'claim') {
                    proconController.updateProConAtIndex(side, proconIndex, updatedContent);
                } else if (argumentType == 'support') {
                    proconController.updateSupportingAtIndex(side, proconIndex, index, updatedContent);
                } else proconController.updateSynthesisAtIndex(side, proconIndex, updatedContent);
                GLOBAL.changed = false;
                console.log('autosaved: ' + updatedContent);
            }
        };

        function update() {
            var shouldShow = !aceEditor.session.getValue().length;
            var node = aceEditor.renderer.emptyMessageNode;
            if (!shouldShow && node) {
                aceEditor.renderer.scroller.removeChild(aceEditor.renderer.emptyMessageNode);
                aceEditor.renderer.emptyMessageNode = null;
            } else if (shouldShow && !node) {
                node = aceEditor.renderer.emptyMessageNode = document.createElement("div");
                if (argumentType == "claim") node.textContent = "Edit here to compose a " + side.toUpperCase() + " claim";
                else if (argumentType == "support") node.textContent = "Edit here to compose a " + side.toUpperCase() + " support";
                node.className = "ace_invisible ace_emptyMessage"
                node.style.padding = "0 9px"
                aceEditor.renderer.scroller.appendChild(node);
            }
        }
        aceEditor.on("input", update);
        setTimeout(update, 100);

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

        addIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            $.ajax({
                    url: "/actsave",
                    data: {
                        type: "Add a new supporting for the " + idx + "th " + side + " claim",
                        topic: GLOBAL.topic
                    },
                    method: "PUT"
                })
                .done(function(data) {
                    console.log('act saved');
                });
            proconController.addSupport(side, idx);
            console.log('sending add supporting');
            TogetherJS.send({
                topic: GLOBAL.topic,
                type: "addSupporting",
                side: side,
                index: idx
            });
        }, false);

        addIcon.setAttribute("data-content", "Add support to this claim.");

        $(addIcon).popup({
            hoverable: true
        });

        row.appendChild(addIcon);

        return row;
    }


    function createIconsforProConPair(idx) {
        var icons = [];
        var removeIcon = document.createElement('i');
        removeIcon.className = 'large red remove circle icon';
        removeIcon.setAttribute("data-content", "Remove this pair of claims.");
        removeIcon.addEventListener('click', function() {
            var proconPairRmBtns = $('.red.remove.circle.icon');

            $.ajax({
                    url: "/actsave",
                    data: {
                        type: "Remove one PRO CON pair",
                        topic: GLOBAL.topic,
                        content: {
                            removedIndex: idx,
                            pro: GLOBAL.savedData.pro[idx].content,
                            con: GLOBAL.savedData.con[idx].content
                        }
                    },
                    method: "PUT"
                })
                .done(function(data) {
                    console.log('act saved');
                });
            proconController.deleteProCon(idx);
            TogetherJS.send({
                topic: GLOBAL.topic,
                type: "deleteProConPair",
                index: idx
            });
        }, false);

        $(removeIcon).popup({
            hoverable: true
        });

        var addProConIcon = document.createElement('i');
        addProConIcon.className = 'large teal plus circle icon';
        addProConIcon.setAttribute("data-content", "Add a new pair of claims.");
        addProConIcon.addEventListener('click', function(e) {
            console.log("add new procon pair");
            e.stopPropagation();
            $.ajax({
                    url: "/actsave",
                    data: {
                        type: "Add one PRO CON pair",
                        topic: GLOBAL.topic
                    },
                    method: "PUT"
                })
                .done(function(data) {
                    console.log('act saved');
                });
            proconController.addProCon();
            TogetherJS.send({
                type: "addProConPair",
                topic: GLOBAL.topic
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

        removeIcon.addEventListener("click", function(e) {
            $.ajax({
                    url: "/actsave",
                    data: {
                        type: "Remove one supporting",
                        topic: GLOBAL.topic,
                        content: {
                            removedPCIndex: proconIdx, //claim
                            removedIndex: idx,
                            support: GLOBAL.savedData[side][proconIdx].support[idx]
                        }
                    },
                    method: "PUT"
                })
                .done(function(data) {
                    console.log('act saved');
                });
            proconController.deleteSupport(side, proconIdx, idx);
            console.log('fire togetherjs sync remove event');
            TogetherJS.send({
                type: "removeSupporting",
                topic: GLOBAL.topic,
                side: side,
                proconIndex: proconIdx,
                index: idx
            });
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
        if (maxLength < claimRaw.content.length && claimRaw.content[maxLength] != ' ') {
            maxLength = Math.min(trimmedString.length, trimmedString.lastIndexOf(" "));

        }
        var title = createTitle((idx + 1).toString() + '. ' + claimRaw.content.substring(0, maxLength) + ' ...', "claim");
        var icons = createFunctionIconsForClaim(side, idx); //replace with your string.


        var contentString = claimRaw.content.length == 0 ? '' : claimRaw.content;
        var content = createContent(contentString, side, idx, 0, "claim");
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

    // Synthesized pieces
    function createSynthesis(idx, SynString) {
        var content = createContent(SynString, 'synthesis', idx, 0, 'synthesis');
        // var container = document.createElement('div');
        // container.className = 'synthesis row three column centered';
        var divider = document.createElement('div');
        divider.className = 'ui divider';
        content.appendChild(divider);
        var synthesis = document.createElement('div');
        synthesis.className = 'synthesis synthesis-text synthesis-' + (idx).toString();
        // synthesis.appendChild(container);
        synthesis.appendChild(content);
        return synthesis;
    }



    function render() {
        console.log("render");

        var proandcon = $('#proandcon'),
            i;
        // proandcon.html('');
        $('.proconpair').remove();
        $('.synthesis-text').remove();
        console.log("this is procondataref in Render");
        console.dir(GLOBAL.savedData);
        if (typeof GLOBAL.savedData != undefined && GLOBAL.savedData) {
            for (i = 0; i < GLOBAL.savedData.pro.length; i += 1) { //fill in pro and con argumentation
                var row = document.createElement('div');
                row.className = 'proconpair three column centered row' + ' procon-' + (i + 1).toString();
                var rightpadding = document.createElement('div');
                rightpadding.className = 'rightpadding two wide column';

                var pro = document.createElement('div');
                pro.className = 'pro seven wide column' + ' pro-' + (i + 1).toString();

                pro.appendChild(createClaim('pro', i, GLOBAL.savedData.pro[i]));

                var con = document.createElement('div');
                con.className = 'con seven wide column' + ' con-' + (i + 1).toString();
                con.appendChild(createClaim('con', i, GLOBAL.savedData.con[i]));

                var icons = createIconsforProConPair(i);

                row.appendChild(pro);
                row.appendChild(con);

                for (var k = 0; k < icons.length; k++) {
                    rightpadding.appendChild(icons[k]);
                }
                row.appendChild(rightpadding);
                proandcon.append(row);
            }

            synpane = $(".synthesis-pane");

            

            

            for (i = 0; i < GLOBAL.savedData.synthesis.length; i += 1) {
                synpane.append(createSynthesis(i, GLOBAL.savedData.synthesis[i].content));

            }
        } else console.log("No records under this topic");


        $("#synthesis-title").popup({
            hoverable: true
        });

    } //end of render function

    return {
        init: init
    };
}(jQuery));


var proconController = (function($) {
    function addProCon() {
        proconModel.addProCon();
        initializeView();
        if (GLOBAL.self) $('html,body').animate({
            scrollTop: jQuery(".procon-" + GLOBAL.savedData.pro.length.toString()).offset().top
        }, 'slow');
        TogetherJS.reinitialize();

    }

    function addSupport(side, claimIdx) {
        proconModel.addSupport(side, claimIdx);
        initializeView();
        TogetherJS.reinitialize();
    }

    function addSynthesis() {
        proconModel.addSynthesis();
        initializeView();
        if (GLOBAL.self) $('html,body').animate({
            scrollTop: jQuery(".synthesis-" + (GLOBAL.savedData.synthesis.length-1).toString()).offset().top
        }, 'slow');
        TogetherJS.reinitialize();
    }

    function deleteProCon(idx) {
        proconModel.deleteProConAtIndex(idx);
        initializeView();
    }

    function deleteSupport(side, claimIdx, supportIdx) {
        proconModel.deleteSupport(side, claimIdx, supportIdx);
        initializeView();
    }

    function deleteSynthesis(side, synIdx) {
        proconModel.deleteSynthesis();
        initializeView();
    }

    function updateProConAtIndex(side, claimIdx, content) {
        proconModel.updateProConAtIndex(side, claimIdx, content);
    }

    function updateSupportingAtIndex(side, claimIdx, index, content) {
        proconModel.updateSupportingAtIndex(side, claimIdx, index, content);
    }

    function updateSynthesisAtIndex(side, synIdx, content) {
        proconModel.updateSynthesisAtIndex(side, synIdx, content);
    }

    function initializeView() {

        proconView.init(GLOBAL.savedData);

        $('.ui.accordion').accordion({
            exclusive: false,
            duration: 350,
        });

        $('.large.icon').css('cursor', 'pointer');

        TogetherJS.reinitialize();

    }

    proconModel.init(initializeView);


    return {
        addSupport: addSupport,
        addSynthesis: addSynthesis,
        deleteProCon: deleteProCon,
        deleteSupport: deleteSupport,
        addProCon: addProCon,
        deleteSynthesis: deleteSynthesis,
        updateProConAtIndex: updateProConAtIndex,
        updateSupportingAtIndex: updateSupportingAtIndex,
        updateSynthesisAtIndex: updateSynthesisAtIndex,
        initializeView: initializeView
    };

}(jQuery));
