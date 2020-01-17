package fr.sioc1981.versio.backend.util;

import java.time.Duration;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
public class DurationConverter implements AttributeConverter<Duration, String> {
     
    public static final String convertDuration(Duration duration) {
    	long nbDays = duration.toDaysPart();
    	if (nbDays == 0) {
    		return duration.toString();
    	}
    	return "P" + duration.toDaysPart() + "D";
    }

    private Logger log = LoggerFactory.getLogger(DurationConverter.class);
 
    @Override
    public String convertToDatabaseColumn(Duration attribute) {
        log.debug("Convert to Long");
        return DurationConverter.convertDuration(attribute);
    }
 
    @Override
    public Duration convertToEntityAttribute(String duration) {
        log.debug("Convert to Duration");
        return Duration.parse(duration);
    }
    
}