/**
 * @class Dialog interface
 */
RPG.IDialog = OZ.Class();

RPG.IDialog.prototype.getDialogText = function(being) {
	return null;
}

RPG.IDialog.prototype.getDialogSound = function(being) {
	return null;
}

RPG.IDialog.prototype.getDialogOptions = function(being) {
	return [];
}

/**
 * @returns {bool} Should the conversation continue?
 */
RPG.IDialog.prototype.advanceDialog = function(optionIndex, being) {
	return false;
}

