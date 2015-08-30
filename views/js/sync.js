// TogetherJS synchronization

(function(){
	TogetherJS.hub.on('addSupporting', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
	
		if(msg.topic === GLOBAL.topic)proconController.addSupport(msg.side, msg.index);
	
	});
	
	TogetherJS.hub.on('removeSupporting', function(msg) {
		if (!msg.sameUrl) {
			return;
		}
	  	if(msg.topic === GLOBAL.topic)proconController.deleteSupport(msg.side, msg.proconIndex, msg.index);
	});
	
	TogetherJS.hub.on('addProConPair', function(msg){
		if (!msg.sameUrl) {
			return;
		}		

		if(msg.topic === GLOBAL.topic)proconController.addProCon();
	
	});	
	
	TogetherJS.hub.on('deleteProConPair', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		console.log('deleteProConPair');
		if(msg.topic === GLOBAL.topic)proconController.deleteProCon(msg.index);		
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
		if(msg.topic === GLOBAL.topic)proconController.deleteProCon(msg.side, msg.claimIdx, msg.index, msg.content);		
	});
}());

