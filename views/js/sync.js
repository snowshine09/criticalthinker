// TogetherJS synchronization

(function(){

	TogetherJS.hub.on('addProConPair', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		GLOBAL.self = false;
		if(msg.topic === GLOBAL.topic)proconController.addProCon();
	
	});	

	TogetherJS.hub.on('addSupporting', function(msg){
		if (!msg.sameUrl) {
			return;
		}
		if(msg.topic === GLOBAL.topic)proconController.addSupport(msg.side, msg.index);
	
	});

	TogetherJS.hub.on('addSynthesis', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		GLOBAL.self = false;
		if(msg.topic === GLOBAL.topic)proconController.addSynthesis();
	
	});	
	
	TogetherJS.hub.on('removeSupporting', function(msg) {
		if (!msg.sameUrl) {
			return;
		}
	  	if(msg.topic === GLOBAL.topic)proconController.deleteSupport(msg.side, msg.proconIndex, msg.index);
	});
	
	
	
	TogetherJS.hub.on('deleteProConPair', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		console.log('deleteProConPair');
		if(msg.topic === GLOBAL.topic)proconController.deleteProCon(msg.index);		
	});

	TogetherJS.hub.on('deleteSynthesis', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		console.log('deleteSynthesis');
		if(msg.topic === GLOBAL.topic)proconController.deleteSynthesis();		
	});

	TogetherJS.hub.on('updateProConAtIndex', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		console.log('updateProConAtIndex');
		if(msg.topic === GLOBAL.topic)proconController.updateProConAtIndex(msg.side, msg.claimIdx, msg.content);		
	});

	TogetherJS.hub.on('updateSupportingAtIndex', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		console.log('updateSupportingAtIndex');
		if(msg.topic === GLOBAL.topic)proconController.updateSupportingAtIndex(msg.side, msg.claimIdx, msg.index, msg.content);		
	});

	TogetherJS.hub.on('updateSynthesisAtIndex', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		console.log('updateSynthesisAtIndex');
		if(msg.topic === GLOBAL.topic)proconController.updateSynthesisAtIndex(msg.side, msg.index, msg.content);		
	});

}());

