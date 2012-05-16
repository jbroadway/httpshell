var shell = {
	// history of commands
	history: [],
	
	// add to history of commands
	add_to_history: function (elements) {
		shell.history.push (elements);
		console.log (shell.history);
	}
};

$(function () {
	$('#shell').submit (function () {
		shell.add_to_history (this.elements);
		return false;
	});
});