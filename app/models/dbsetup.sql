
CREATE TABLE local (
	id SERIAL NOT NULL PRIMARY KEY,
	local_email VARCHAR UNIQUE,
	local_password VARCHAR
);

CREATE TABLE facebook (
	id SERIAL NOT NULL PRIMARY KEY,
	facebook_id VARCHAR,
	facebook_token VARCHAR,
	facebook_name VARCHAR,
	facebook_email VARCHAR UNIQUE
);

CREATE TABLE twitter (
	id SERIAL NOT NULL PRIMARY KEY,
	twitter_id VARCHAR,
	twitter_token VARCHAR,
	twitter_displayName VARCHAR,
	twitter_username VARCHAR
);

CREATE TABLE google (
	id SERIAL NOT NULL PRIMARY KEY,
	google_id VARCHAR,
	google_token VARCHAR,
	google_email VARCHAR UNIQUE,
	google_name VARCHAR
);
