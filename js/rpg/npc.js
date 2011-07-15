/**
 * @class NPC - Non-Player Character
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.NPC = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.NPC.factory.frequency = 0;
RPG.Beings.NPC.visual = { path:"beings" };
RPG.Beings.NPC.prototype.init = function(race) {
	this.parent(race);
	this._confirm = RPG.CONFIRM_NA;
	this._ai = new RPG.AI(this);
	this._alignment = RPG.ALIGNMENT_NEUTRAL;
}

RPG.Beings.NPC.prototype.getAI = function() {
	return this._ai;
}

RPG.Beings.NPC.prototype.setAI = function(ai) {
	if (this._ai) { this._ai.die(); }
	this._ai = ai;
	return this;
}

/**
 * NPC delegates decisions to its AI
 */
RPG.Beings.NPC.prototype.yourTurn = function() {
	return this._ai.yourTurn();
}

RPG.Beings.NPC.prototype.randomGender = function() {
	if (Math.randomPercentage() < 34) {
		this.setGender(RPG.GENDER_FEMALE);
		this.adjustFeat(RPG.FEAT_STRENGTH, -2);
		this.adjustFeat(RPG.FEAT_MAGIC, 2);
	} else {
		this.setGender(RPG.GENDER_MALE);
	}
}

RPG.Beings.NPC.prototype.setAlignment = function(a) {
	this._alignment = a;
	this._ai.syncWithAlignment();
	return this;
}

RPG.Beings.NPC.prototype.getAlignment = function() {
	return this._alignment;
}

RPG.Beings.NPC.prototype.die = function() {
	this._ai.die();
	this.parent();
}

RPG.Beings.NPC.prototype.getConfirm = function() {
	return this._confirm;
}

RPG.Beings.NPC.prototype.setConfirm = function(confirm) {
	this._confirm = confirm;
	return this;
}


/**
 * Display a prompt asking for confirmation to attack
 * @param {function} callback To be executed when user confirms attack
 * @returns {int} Action result
 */
RPG.Beings.NPC.prototype.confirmAttack = function(callback) {
	if (this._confirm != RPG.CONFIRM_ASK) { return callback(); }
	
	var yes = function() {
		this.setConfirm(RPG.CONFIRM_DONE);
		var result = callback();
		RPG.Game.getEngine().actionResult(result);
	}
	
	RPG.UI.confirm(RPG.Misc.format("Really attack %the?", this), "Attention!", yes.bind(this));
	return RPG.ACTION_DEFER;
}


/**
 * Takes gender and name into account
 * @see RPG.Visual.IVisual#describe
 */
RPG.Beings.NPC.prototype.describe = function() {
	var desc = this.parent();
	if (this._gender == RPG.GENDER_FEMALE) { desc = "female "+desc; }
	if (this._name) { desc = this._name + " the " + desc.capitalize(); }
	return desc;
}

/**
 * Takes name into account
 * @see RPG.Visual.IVisual#describeA
 */
RPG.Beings.NPC.prototype.describeA = function() {
	if (this._name) { 
		return this.describe();
	} else {
		return this.parent();
	}
}

/**
 * Takes name into account
 * @see RPG.Visual.IVisual#describeThe
 */
RPG.Beings.NPC.prototype.describeThe = function() {
	if (this._name) { 
		return this.describe();
	} else {
		return this.parent();
	}
}

/**
 * @see RPG.Visual.IVisual#describeIs
 */
RPG.Beings.NPC.prototype.describeIs = function() {
	return "is";
}

RPG.Beings.NPC.prototype.teleport = function(coords) {
	var pc = RPG.Game.pc;
	
	if (pc.canSee(this._coords)) {
		var s = RPG.Misc.format("%A suddenly disappears!", this);
		RPG.UI.buffer.message(s);
	}
	
	if (pc.canSee(coords)) {
		if (pc.canSee(this._coords)) {
			var s = RPG.Misc.format("%The immediately reappears!", this);
		} else {
			var s = RPG.Misc.format("%A suddenly appears from nowhere!", this);
		}
		RPG.UI.buffer.message(s);
	}
	
	this.parent(coords);
}

/**
 * NPCs just cheat. They can see everything in their sight range...
 */
RPG.Beings.NPC.prototype.canSee = function(coords) {
	return coords.distance(this._coords) <= this.getFeat(RPG.FEAT_SIGHT_RANGE);
}

/* ------------------------- ACTIONS -----------------*/

/**
 * Initiate chat with target being
 */
RPG.Beings.NPC.prototype.chat = function(being) {
	return RPG.UI.dialog.show(this.getAI(), this);
}

/* ------------------ PRIVATE --------------- */

RPG.Beings.NPC.prototype._describeLaunch = function(projectile, target) {
	var launcher = projectile.getLauncher();
	var verb = (launcher ? "shoots" : "throws");
	
	var s = RPG.Misc.format("%A %s %a", this, verb, projectile);
	if (this._map.getBeing(target)) {
		s += RPG.Misc.format(" at %d", this._map.getBeing(target));
	}
	
	s += ".";
	RPG.UI.buffer.message(s);
}

RPG.Beings.NPC.prototype._describeMeleeCombat = function(combat) {
	var defender = combat.getDefender();

	if (!combat.wasHit()) {
		var s = RPG.Misc.format("%The misses %a.", this, defender);
		RPG.UI.buffer.message(s);
		return;
	}
	
	if (!combat.getDamage()) {
		var s = RPG.Misc.format("%The fails to hurt %a.", this, defender);
		RPG.UI.buffer.message(s);
		return;
	}
	
	var s = RPG.Misc.format("%The hits %a", this, defender);
	if (combat.wasKill()) {
		s += RPG.Misc.format(" and kills %him.", defender);
	} else {
		if (defender == RPG.Game.pc) {
			s += ".";
		} else {
			s+= RPG.Misc.format(" and %s wounds %him.", defender.woundedState(), defender);
		}
	}
	
	RPG.UI.buffer.message(s);
}

