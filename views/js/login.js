$('.userlogin.button').click(function(e){
	$.ajax({
		url: "/userlogin",
		method: "PUT",
		data: {
			username: $('#username').val(),
			password: $('#password').val()
		}
	})
	.done(function(data){
		console.log("userlogin");
	});
})