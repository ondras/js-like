RPG.Feats[RPG.FEAT_STRENGTH] = new RPG.Feat("Strength", "Physical strength");
RPG.Feats[RPG.FEAT_TOUGHNESS] = new RPG.Feat("Toughness", "Physical resistance");
RPG.Feats[RPG.FEAT_MAGIC] = new RPG.Feat("Magic", "Attunement to magic");
RPG.Feats[RPG.FEAT_DEXTERITY] = new RPG.Feat("Dexterity", "Physical agility");
RPG.Feats[RPG.FEAT_LUCK] = new RPG.Feat("Luck", "Luckiness");

RPG.Feats[RPG.FEAT_DAMAGE] = new RPG.Feat("Damage", "Damage dealt by physical attacks", {average:0});
RPG.Feats[RPG.FEAT_DAMAGE].parentModifiers[RPG.FEAT_STRENGTH] = RPG.Feats[RPG.FEAT_DAMAGE]._drd;

RPG.Feats[RPG.FEAT_MAX_HP] = new RPG.Feat("HP", "Hit points", {average:5, upgrade:3});
RPG.Feats[RPG.FEAT_MAX_HP].parentModifiers[RPG.FEAT_TOUGHNESS] = RPG.Feats[RPG.FEAT_MAX_HP]._drd;

RPG.Feats[RPG.FEAT_REGEN_HP] = new RPG.Feat("HP regen", "Hit point regeneration rate", {average:10, upgrade:5});
RPG.Feats[RPG.FEAT_REGEN_HP].parentModifiers[RPG.FEAT_TOUGHNESS] = RPG.Feats[RPG.FEAT_REGEN_HP]._drd;

RPG.Feats[RPG.FEAT_PV] = new RPG.Feat("PV", "Protection value - damage reduced from taken hits", {average:0});
RPG.Feats[RPG.FEAT_PV].parentModifiers[RPG.FEAT_TOUGHNESS] = RPG.Feats[RPG.FEAT_PV]._drd;

RPG.Feats[RPG.FEAT_MAX_MANA] = new RPG.Feat("Mana", "Magical energy", {average:8, upgrade:4});
RPG.Feats[RPG.FEAT_MAX_MANA].parentModifiers[RPG.FEAT_MAGIC] = function(value) { return 3*RPG.Feats[RPG.FEAT_MAX_MANA]._drd(value); };

RPG.Feats[RPG.FEAT_REGEN_MANA] = new RPG.Feat("Mana regen", "Mana regeneration rate", {average:10, upgrade:5});
RPG.Feats[RPG.FEAT_REGEN_MANA].parentModifiers[RPG.FEAT_MAGIC] = RPG.Feats[RPG.FEAT_REGEN_MANA]._drd;

RPG.Feats[RPG.FEAT_SPEED] = new RPG.Feat("Speed", "Speed of movement", {average:100});
RPG.Feats[RPG.FEAT_SPEED].parentModifiers[RPG.FEAT_DEXTERITY] = function(value) { return 5*RPG.Feats[RPG.FEAT_SPEED]._drd(value); };

RPG.Feats[RPG.FEAT_HIT] = new RPG.Feat("Hit", "Chance to hit", {average:3});
RPG.Feats[RPG.FEAT_HIT].parentModifiers[RPG.FEAT_DEXTERITY] = RPG.Feats[RPG.FEAT_HIT]._drd;

RPG.Feats[RPG.FEAT_DV] = new RPG.Feat("DV", "Defense value - chance to evade hits", {average:3});
RPG.Feats[RPG.FEAT_DV].parentModifiers[RPG.FEAT_DEXTERITY] = RPG.Feats[RPG.FEAT_DV]._drd;

RPG.Feats[RPG.FEAT_SIGHT_RANGE] = new RPG.Feat("Sight", "Sight range", {average:4});
RPG.Feats[RPG.FEAT_SIGHT_RANGE].parentModifiers[RPG.FEAT_LUCK] = RPG.Feats[RPG.FEAT_SIGHT_RANGE]._drd;
