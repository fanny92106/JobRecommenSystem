package util;

import java.io.InputStream;

public class Config {

	public InputStream readConfig() {
		String propFileName = "config.properties";
		InputStream input = getClass().getClassLoader().getResourceAsStream(propFileName);
		return input;
	}

}
