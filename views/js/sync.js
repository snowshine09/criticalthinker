// TogetherJS synchronization

(function(){
	TogetherJS.hub.on('addSupporting', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
	
		proconController.addSupport(msg.side, msg.index);
	
	});
	
	TogetherJS.hub.on('removeSupporting', function(msg) {
		if (!msg.sameUrl) {
			return;
		}
	  	proconController.deleteSupport(msg.side, msg.proconIndex, msg.index);
	});
	
	TogetherJS.hub.on('addProConPair', function(msg){
		if (!msg.sameUrl) {
			return;
		}		

		proconController.addProCon();
	
	});	
	
	TogetherJS.hub.on('deleteProConPair', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		console.log('deleteProConPair');
		proconController.deleteProCon(msg.index);		
	});

	TogetherJS.hub.on('updateProConAtIndex', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		console.log('updateProConAtIndex');
		proconController.updateProConAtIndex(msg.side, msg.claimIdx, msg.content);		
	});

	TogetherJS.hub.on('updateSupportingAtIndex', function(msg){
		if (!msg.sameUrl) {
			return;
		}		
		console.log('updateSupportingAtIndex');
		proconController.deleteProCon(msg.side, msg.claimIdx, msg.index, msg.content);		
	});
}());

