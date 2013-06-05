/**
 * @class Generic weapon
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Weapon = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Weapon.factory.frequency = 0;
RPG.Items.Weapon.visual = { ch:")", color:"#ccc" };
RPG.Items.Weapon.prototype._dualHand = false;
RPG.Items.Weapon.prototype._hit = null;
RPG.Items.Weapon.prototype._damage = null;
RPG.Items.Weapon.prototype.getHit = function() {
	return this._hit;
}
RPG.Items.Weapon.prototype.getDamage = function() {
	return this._damage;
}
RPG.Items.Weapon.prototype.isDualHand = function() {
	return this._dualHand;
}
RPG.Items.Weapon.prototype._describeModifiers = function() {
	var mods = this.parent();
	return "(" + this._hit.toString() + ", " + this._damage.toString() + ")" + (mods ? " "+mods : "");
}

/**
 * @class Dagger
 * @augments RPG.Items.Weapon
 */
RPG.Items.Dagger = OZ.Class().extend(RPG.Items.Weapon);
RPG.Items.Dagger.visual = { desc:"dagger", image:"dagger" };
RPG.Items.Dagger.prototype._hit = new RPG.RandomValue(4, 1);
RPG.Items.Dagger.prototype._damage = new RPG.RandomValue(5, 3);

/**
 * @class Dagger
 * @augments RPG.Items.Weapon
 */
RPG.Items.OrcishDagger = OZ.Class().extend(RPG.Items.Weapon);
RPG.Items.OrcishDagger.visual = { desc:"orcish dagger", image:"orcish-dagger" };
RPG.Items.OrcishDagger.prototype._hit = new RPG.RandomValue(6, 1);
RPG.Items.OrcishDagger.prototype._damage = new RPG.RandomValue(5, 3);

/**
 * @class Club
 * @augments RPG.Items.Weapon
 */
RPG.Items.Club = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Club.visual = { desc:"club", image:"club", color:"#960" };
RPG.Items.Club.prototype._hit = new RPG.RandomValue(4, 1);
RPG.Items.Club.prototype._damage = new RPG.RandomValue(7, 3);

/**
 * @class Short sword
 * @augments RPG.Items.Weapon
 */
RPG.Items.ShortSword = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.ShortSword.visual = { desc:"short sword", image:"short-sword", color:"#999" };
RPG.Items.ShortSword.prototype._hit = new RPG.RandomValue(6, 1);
RPG.Items.ShortSword.prototype._damage = new RPG.RandomValue(4, 2);

/**
 * @class Long sword
 * @augments RPG.Items.Weapon
 */
RPG.Items.LongSword = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.LongSword.visual = { desc:"long sword", image:"long-sword", color:"#999" };
RPG.Items.LongSword.factory.danger = 2;
RPG.Items.LongSword.prototype._hit = new RPG.RandomValue(6, 1);
RPG.Items.LongSword.prototype._damage = new RPG.RandomValue(6, 2);

/**
 * @class Axe
 * @augments RPG.Items.Weapon
 */
RPG.Items.Axe = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Axe.visual = { desc:"axe", image:"axe", color:"#960" };
RPG.Items.Axe.prototype._hit = new RPG.RandomValue(6, 1);
RPG.Items.Axe.prototype._damage = new RPG.RandomValue(6, 2);

/**
 * @class Hammer
 * @augments RPG.Items.Weapon
 */
RPG.Items.Hammer = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Hammer.visual = { desc:"hammer", image:"hammer", color:"#999" };
RPG.Items.Hammer.prototype._dualHand = true;
RPG.Items.Hammer.prototype._hit = new RPG.RandomValue(6, 1);
RPG.Items.Hammer.prototype._damage = new RPG.RandomValue(7, 1);

/**
 * @class Staff
 * @augments RPG.Items.Weapon
 */
RPG.Items.Staff = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Staff.visual = { desc:"staff", image:"staff", color:"#960" };
RPG.Items.Staff.prototype._dualHand = true;
RPG.Items.Staff.prototype._hit = new RPG.RandomValue(4, 1);
RPG.Items.Staff.prototype._damage = new RPG.RandomValue(4, 2);

/**
 * @class Broom
 * @augments RPG.Items.Weapon
 */
RPG.Items.Broom = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Broom.visual = { desc:"broom", image:"broom", color:"#960" };
RPG.Items.Broom.prototype._dualHand = true;
RPG.Items.Broom.prototype._hit = new RPG.RandomValue(4, 1);
RPG.Items.Broom.prototype._damage = new RPG.RandomValue(2, 4);

/**
 * @class Torch
 * @augments RPG.Items.Weapon
 */
RPG.Items.Torch = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Torch.visual = { desc:"torch", descPlural:"torches", image:"torch", color:"#960" };
RPG.Items.Torch.prototype._hit = new RPG.RandomValue(4, 2);
RPG.Items.Torch.prototype._damage = new RPG.RandomValue(4, 3);
RPG.Items.Torch.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_SIGHT_RANGE] = 1;
}

/**
 * @class Klingon Ceremonial Sword
 * @augments RPG.Items.Weapon
 */
RPG.Items.KlingonSword = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.KlingonSword.factory.frequency = 0;
RPG.Items.KlingonSword.visual = { desc:"Klingon ceremonial sword", image:"klingon-sword", color:"#fc0" };
RPG.Items.KlingonSword.prototype._dualHand = true;
RPG.Items.KlingonSword.prototype._hit = new RPG.RandomValue(10, 3);
RPG.Items.KlingonSword.prototype._damage = new RPG.RandomValue(10, 3);
RPG.Items.KlingonSword.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_DV] = 1;
	this._modifiers[RPG.FEAT_PV] = 1;
	this._modifiers[RPG.FEAT_STRENGTH] = 2;
}

/**
 * @class Bow
 * @augments RPG.Items.Weapon
 */
RPG.Items.Bow = OZ.Class().extend(RPG.Items.Weapon);
RPG.Items.Bow.factory.frequency = 0;
RPG.Items.Bow.prototype._range = 4;
RPG.Items.Bow.prototype.getRange = function() {
	return this._range;
}

/**
 * @class Short bow
 * @augments RPG.Items.Bow
 */
RPG.Items.ShortBow = OZ.Class().extend(RPG.Items.Bow);
RPG.Items.ShortBow.visual = { desc:"short bow", image:"short-bow", ch:"}" };
RPG.Items.ShortBow.prototype._hit = new RPG.RandomValue(3, 1);
RPG.Items.ShortBow.prototype._damage = new RPG.RandomValue(3, 1);

/**
 * @class Long bow
 * @augments RPG.Items.Bow
 */
RPG.Items.LongBow = OZ.Class().extend(RPG.Items.Bow);
RPG.Items.LongBow.factory.danger = 2;
RPG.Items.LongBow.visual = { desc:"long bow", image:"long-bow", ch:"}" };
RPG.Items.LongBow.prototype._range = 6;
RPG.Items.LongBow.prototype._hit = new RPG.RandomValue(4, 2);
RPG.Items.LongBow.prototype._damage = new RPG.RandomValue(5, 2);


/**
 * @class Projectile weapon (arrow, rock, ...)
 * @augments RPG.Items.Weapon
 * @augments RPG.IProjectile
 * @augments RPG.Misc.IDamageDealer
 * Projectile weapon acts as a normal weapon item when wielded. However, when launched, this acts as a damage dealer.
 */
RPG.Items.Projectile = OZ.Class()
						.extend(RPG.Items.Weapon)
						.implement(RPG.IProjectile)
						.implement(RPG.Misc.IDamageDealer);
RPG.Items.Projectile.factory.frequency = 0;
RPG.Items.Projectile.prototype._launcher = null; /* constructor of allowed launchers */
RPG.Items.Projectile.prototype.init = function() {
	this.parent();
	this._initProjectile();
}

RPG.Items.Projectile.prototype.getImage = function() {
	var fvp = this._getFlightVisualProperty("image");
	return (fvp ? this.getVisualProperty("path") + "/" + fvp : this.parent());
}

RPG.Items.Projectile.prototype.getChar = function() {
	return this._getFlightVisualProperty("ch") || this.parent();
}

RPG.Items.Projectile.prototype.getHit = function() {
	if (!this._flying) { return this._hit; } /* normal weapon, not a damagedealer */

	var hit = this._hit.add(this._owner.getFeat(RPG.FEAT_HIT));
	var launcher = this.getLauncher();
	if (launcher) { hit = hit.add(launcher.getHit()); } /* launched with a launcher */
	
	return hit;
}

RPG.Items.Projectile.prototype.getDamage = function() {
	if (!this._flying) { return this._damage; } /* normal weapon, not a damagedealer */
	
	var damage = this._damage.add(this._owner.getFeat(RPG.FEAT_DAMAGE));
	var launcher = this.getLauncher();
	if (launcher) { damage = damage.add(launcher.getDamage()); } /* launched with a launcher */
	
	return damage;
}

/**
 * @see RPG.Misc.IDamageDealer#getLuck
 */
RPG.Items.Projectile.prototype.getLuck = function() {
	return this._owner.getFeat(RPG.FEAT_LUCK);
}

RPG.Items.Projectile.prototype.isLaunchable = function() {
	if (!this._launcher) { return true; } /* can be launched as-is */
	var w = this._owner.getSlot(RPG.SLOT_WEAPON).getItem();
	return (w && (w instanceof this._launcher));
}

RPG.Items.Projectile.prototype.getLauncher = function() {
	if (!this._launcher) { return null; }
	return this._owner.getSlot(RPG.SLOT_WEAPON).getItem();
}

RPG.Items.Projectile.prototype.getRange = function() {
	var r = this._range;
	var l = this.getLauncher();
	if (l) { r += l.getRange(); }
	return r;
}

RPG.Items.Projectile.prototype._fly = function() {	
	RPG.UI.map.removeProjectiles();
	this.parent();
}

RPG.Items.Projectile.prototype._flightDone = function() {
	var coords = this._flight.coords[this._flight.coords.length-1];
	var map = this._owner.getMap();
	var b = map.getBeing(coords);
	
	if (b) { /* being; attack it */
		this._owner.attackRanged(b, this);
	} else if (!map.blocks(RPG.BLOCKS_MOVEMENT, coords)) { /* free space */
		if (RPG.Rules.isProjectileRecovered(this)) { map.addItem(this, coords); }
	} else { /* something here */
		var obstacle = (map.getFeature(coords) || map.getCell(coords));
		var s = RPG.Misc.format("%A hits %a.", this, obstacle);
		RPG.UI.buffer.message(s);
	}
	
	this.parent();
}

/**
 * @class Rock
 * @augments RPG.Items.Projectile
 */
RPG.Items.Rock = OZ.Class().extend(RPG.Items.Projectile);
RPG.Items.Rock.visual = { ch:"*", image:"rock", color:"#999", desc:"rock" };
RPG.Items.Rock.prototype._hit = new RPG.RandomValue(2, 1);
RPG.Items.Rock.prototype._damage = new RPG.RandomValue(2, 1);
RPG.Items.Rock.prototype.init = function() {
	this.parent();

	var ch = this.getChar();
	for (var dir in RPG.DIR) { 
		this._chars[dir] = ch; 
		this._suffixes[dir] = ""; 
	}
}

/**
 * @class Arrow
 * @augments RPG.Items.Projectile
 */
RPG.Items.Arrow = OZ.Class().extend(RPG.Items.Projectile);
RPG.Items.Arrow.factory.method = function(danger) {
	var amount = 10*(1 + Math.round(Math.random() * danger * 1.5));
	return new this(amount);
}
RPG.Items.Arrow.visual = { image:"arrow", ch:"/", color:"#960", desc:"arrow" };
RPG.Items.Arrow.prototype._hit = new RPG.RandomValue(2, 1);
RPG.Items.Arrow.prototype._damage = new RPG.RandomValue(2, 1);
RPG.Items.Arrow.prototype._launcher = RPG.Items.Bow;
RPG.Items.Arrow.prototype.init = function(amount) {
	this.parent();
	this._amount = amount;
}
