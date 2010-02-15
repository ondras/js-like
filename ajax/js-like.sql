CREATE TABLE IF NOT EXISTS `js-like` (
	`name` varchar(255) collate utf8_bin NOT NULL,
	`hash` char(40) collate utf8_bin NOT NULL,
	`data` text collate utf8_bin NOT NULL,
	PRIMARY KEY (`name`),
	KEY `hash` (`hash`)
) DEFAULT CHARSET=utf8;
