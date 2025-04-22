package org.ssafy.tmt.util;

import java.util.concurrent.ThreadLocalRandom;

public class GenerateRandomDigit {
	public static String sixDigit() {
		return String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
	}
}
